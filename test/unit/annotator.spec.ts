import assert from 'assert';
import { readFileSync } from 'fs';
import path from 'path';
import sinon, { SinonSandbox, SinonSpy } from 'sinon';
import * as github from '@actions/github';

import Annotator from '../../src/Annotator';
import { dataDir } from '../util';
import { Finding } from '../../src/Finding';
import { Octokit } from '@octokit/rest';

const mockSha = 'fakeShaValue';
const mockOwner = 'fakeOwnerValue';
const mockRepo = 'fakeRepoValue';

const mockGithubContext = {
  payload: {
    pull_request: {
      head: {
        sha: mockSha,
      },
    },
  },
  repo: {
    owner: mockOwner,
    repo: mockRepo,
  },
};

const fakeCheckData = {
  data: {
    id: 1,
  },
};

const mockOctokit = {
  rest: {
    checks: {
      create() {
        return fakeCheckData;
      },
      update() {},
    },
  },
};

describe('Annotator', () => {
  let sandbox: SinonSandbox;
  let octokit: Octokit;
  let createCheckSpy: SinonSpy;
  let updateCheckSpy: SinonSpy;
  let annotator: Annotator;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    octokit = mockOctokit as any;
    sandbox.stub(github, 'context').value(mockGithubContext);
    createCheckSpy = sandbox.spy(mockOctokit.rest.checks, 'create');
    updateCheckSpy = sandbox.spy(mockOctokit.rest.checks, 'update');
    annotator = new Annotator(octokit, dataDir);
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('creates a new check and then updates it with the expected annotations', async () => {
    await annotator.annotate();

    const expectedCreateArgs = [
      [
        {
          head_sha: mockSha,
          name: Annotator.CHECK_TITLE,
          owner: mockOwner,
          repo: mockRepo,
          status: 'in_progress',
        },
      ],
    ];

    assert.deepEqual(createCheckSpy.callCount, 1);
    assert.deepEqual(createCheckSpy.args, expectedCreateArgs);

    const expectedAnnotationsString = String(
      readFileSync(path.join(dataDir, 'expected-annotations.json'))
    );
    const expectedAnnotations = JSON.parse(expectedAnnotationsString);
    const expectedUpdateArgs = [
      [
        {
          check_run_id: 1,
          conclusion: 'failure',
          output: {
            annotations: expectedAnnotations,
            summary: '5 failures found\n1 warning found',
            title: Annotator.CHECK_TITLE,
          },
          owner: mockOwner,
          repo: mockRepo,
          status: 'completed',
        },
      ],
    ];

    assert.deepEqual(updateCheckSpy.callCount, 1);
    assert.deepEqual(updateCheckSpy.args, expectedUpdateArgs);
  });

  describe('gets path and line number from finding stack', () => {
    describe('on Linux', () => {
      const expectedAnnotation = {
        annotation_level: 'warning',
        end_line: 123,
        message: '',
        path: 'app/testFile.rb',
        start_line: 123,
        title: 'AppMap Finding',
      };

      it('when the first location is desired', () => {
        const mockFinding = {
          stack: ['app/testFile.rb:123', '/home/fakeUser/fakePath/fakeFile.fake:456'],
        } as Finding;

        const result = annotator.annotationFromFinding(mockFinding);
        assert.deepEqual(result, expectedAnnotation);
      });

      it('when the second location is desired', () => {
        const mockFinding = {
          stack: ['/home/fakeUser/fakePath/fakeFile.fake:456', 'app/testFile.rb:123'],
        } as Finding;

        const result = annotator.annotationFromFinding(mockFinding);
        assert.deepEqual(result, expectedAnnotation);
      });

      it('when all locations are absolute paths', () => {
        const mockFinding = {
          stack: [
            '/home/fakeUser/fakePath/fakeFile.fake:456',
            '/home/somePath/thatIs/Absolute/fake.txt:123',
          ],
        } as Finding;

        const result = annotator.annotationFromFinding(mockFinding);
        assert.deepEqual(result, undefined);
      });

      it('when no locations have line numbers', () => {
        const mockFinding = {
          stack: ['app/someFile.txt', 'app/anotherPath/anotherFile.rb'],
        } as Finding;

        const result = annotator.annotationFromFinding(mockFinding);
        assert.deepEqual(result, undefined);
      });
    });

    describe('on Windows', () => {
      const expectedAnnotation = {
        annotation_level: 'warning',
        end_line: 123,
        message: '',
        path: 'app\\testFile.rb',
        start_line: 123,
        title: 'AppMap Finding',
      };

      beforeEach(() => {
        sandbox.stub(path, 'isAbsolute').callsFake(path.win32.isAbsolute);
      });

      it('when the first location is desired', () => {
        const mockFinding = {
          stack: ['app\\testFile.rb:123', 'C:\\Users\\Fake User\\fakePath\\fakeFile.fake:456'],
        } as Finding;

        const result = annotator.annotationFromFinding(mockFinding);
        assert.deepEqual(result, expectedAnnotation);
      });

      it('when the second location is desired', () => {
        const mockFinding = {
          stack: ['C:\\Users\\Fake User\\fakePath\\fakeFile.fake:456', 'app\\testFile.rb:123'],
        } as Finding;

        const result = annotator.annotationFromFinding(mockFinding);
        assert.deepEqual(result, expectedAnnotation);
      });

      it('when all locations are absolute paths', () => {
        const mockFinding = {
          stack: [
            'C:\\Users\\Fake User\\fakePath\\fakeFile.fake:456',
            'C:\\Users\\Some Path\\thatIs\\Absolute\\fake.txt:123',
          ],
        } as Finding;

        const result = annotator.annotationFromFinding(mockFinding);
        assert.deepEqual(result, undefined);
      });

      it('when no locations have line numbers', () => {
        const mockFinding = {
          stack: ['app\\someFile.txt', 'app\\anotherPath\\anotherFile.rb'],
        } as Finding;

        const result = annotator.annotationFromFinding(mockFinding);
        assert.deepEqual(result, undefined);
      });
    });
  });
});

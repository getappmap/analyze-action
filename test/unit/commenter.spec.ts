import assert from 'assert';
import * as fs from 'fs';
import sinon, { SinonSandbox } from 'sinon';
import * as github from '@actions/github';

import Commenter from '../../src/Commenter';
import { reportPath } from '../util';
import { Octokit } from '@octokit/rest';

const mockGithubContext = {
  payload: {
    pull_request: {
      number: 1,
    },
  },

  repo: {},
};

const mockOctokit = {
  paginate: {
    iterator() {
      return [];
    },
  },

  rest: {
    issues: {
      createComment() {},
      updateComment() {},
    },
  },
};

const reportString = fs.readFileSync(reportPath);
const expectedBody = `${reportString}\n${Commenter.COMMENT_TAG_PATTERN}`;

describe('Commenter', () => {
  let sandbox: SinonSandbox;
  let octokit: Octokit;
  let commenter: Commenter;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    octokit = mockOctokit as any;
    sandbox.stub(github, 'context').value(mockGithubContext);
    commenter = new Commenter(octokit, reportPath);
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('creates a new comment if one does not exist', async () => {
    const createCommentSpy = sandbox.spy(mockOctokit.rest.issues, 'createComment');

    sandbox.stub(commenter, 'getAppMapComment').resolves();
    await commenter.comment();

    const expectedArgs = [
      {
        body: expectedBody,
        issue_number: mockGithubContext.payload.pull_request.number,
      },
    ];

    assert.deepEqual(createCommentSpy.callCount, 1);
    assert.deepEqual(createCommentSpy.args, [expectedArgs]);
  });

  it('updates an existing comment if one exists', async () => {
    const updateCommentSpy = sandbox.spy(mockOctokit.rest.issues, 'updateComment');

    const fakeComment = {
      body: Commenter.COMMENT_TAG_PATTERN,
      id: 1,
    };

    sandbox.stub(commenter, 'getAppMapComment').resolves(fakeComment);
    await commenter.comment();

    const expectedArgs = [
      {
        body: expectedBody,
        comment_id: fakeComment.id,
      },
    ];

    assert.deepEqual(updateCommentSpy.callCount, 1);
    assert.deepEqual(updateCommentSpy.args, [expectedArgs]);
  });
});

import assert from 'assert';
import * as fs from 'fs';
import sinon, { SinonSandbox, SinonSpy } from 'sinon';
import * as github from '@actions/github';

import Commenter from '../../src/Commenter';
import { reportPath } from '../util';

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
  let createCommentSpy: SinonSpy;
  let updateCommentSpy: SinonSpy;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    sandbox.stub(github, 'context').value(mockGithubContext);
    sandbox.stub(github, 'getOctokit').returns(mockOctokit as any);
    createCommentSpy = sandbox.spy(mockOctokit.rest.issues, 'createComment');
    updateCommentSpy = sandbox.spy(mockOctokit.rest.issues, 'updateComment');
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('creates a new comment if one does not exist', async () => {
    const commenter = new Commenter(reportPath, 'dummyGithubToken');
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
    const fakeComment = {
      body: Commenter.COMMENT_TAG_PATTERN,
      id: 1,
    };

    const commenter = new Commenter(reportPath, 'dummyGithubToken');
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

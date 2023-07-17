import * as github from '@actions/github';
import * as core from '@actions/core';
import { GetResponseDataTypeFromEndpointMethod } from '@octokit/types';

import assert from 'assert';
import fs from 'fs';

import log, { LogLevel } from './log';

export default class Commenter {
  // TODO: find Octokit types
  private readonly githubToken: string;

  constructor(private readonly filePath: string) {
    this.githubToken = core.getInput('github-token');
  }

  async comment() {
    const octokit = github.getOctokit(this.githubToken);
    const { context } = github;

    const issue_number = context.payload.pull_request?.number || context.payload.issue?.number;
    log(LogLevel.Info, `Issue number: ${issue_number}`);
    assert(issue_number);

    const content = fs.readFileSync(this.filePath, 'utf8');

    const comment_tag_pattern = '<!-- "appmap" -->';
    const body = `${content}\n${comment_tag_pattern}`;
    log(LogLevel.Info, `body: ${body}`);

    type ListCommentsResponseDataType = GetResponseDataTypeFromEndpointMethod<
      typeof octokit.rest.issues.listComments
    >;

    let comment: ListCommentsResponseDataType[0] | undefined;
    for await (const { data: comments } of octokit.paginate.iterator(octokit.rest.issues.listComments, {
      ...context.repo,
      issue_number,
    })) {
      // TODO: better type for comment
      comment = comments.find((comment: any) => comment?.body?.includes(comment_tag_pattern));
      if (comment) break;
    }

    log(LogLevel.Info, `comment: ${comment}`);
    if (comment) {
      await octokit.rest.issues.updateComment({
        ...context.repo,
        comment_id: comment.id,
        body,
      });
    } else {
      await octokit.rest.issues.createComment({
        ...context.repo,
        issue_number,
        body,
      });
    }
  }
}
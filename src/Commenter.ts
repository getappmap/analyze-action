import * as github from '@actions/github';
import { GetResponseDataTypeFromEndpointMethod } from '@octokit/types';

import assert from 'assert';
import fs from 'fs';

export default class Commenter {
  // TODO: don't use "any" type
  private readonly octokit: any;
  public static readonly COMMENT_TAG_PATTERN = '<!-- "appmap" -->';

  constructor(private readonly filePath: string, private readonly githubToken: string) {
    this.octokit = github.getOctokit(this.githubToken);
  }

  public async comment() {
    const { context } = github;
    const { octokit } = this;

    const issue_number = context.payload.pull_request?.number || context.payload.issue?.number;
    assert(issue_number);

    const content = fs.readFileSync(this.filePath, 'utf8');
    const body = `${content}\n${Commenter.COMMENT_TAG_PATTERN}`;
    const comment = await this.getAppMapComment(issue_number);

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

  public async getAppMapComment(issue_number: number): Promise<any> {
    const { context } = github;
    const { octokit } = this;

    type ListCommentsResponseDataType = GetResponseDataTypeFromEndpointMethod<
      typeof octokit.rest.issues.listComments
    >;

    let comment: ListCommentsResponseDataType[0] | undefined;
    for await (const { data: comments } of octokit.paginate.iterator(octokit.rest.issues.listComments, {
      ...context.repo,
      issue_number,
    })) {
      // TODO: don't use "any" type
      comment = comments.find((comment: any) => comment?.body?.includes(Commenter.COMMENT_TAG_PATTERN));
      if (comment) break;
    }

    return comment;
  }
}

import * as github from '@actions/github';
import * as core from '@actions/core';

import { GetResponseDataTypeFromEndpointMethod } from '@octokit/types';

import assert from 'assert';
import fs from 'fs';

// See https://docs.github.com/en/rest/reactions#reaction-types
const REACTIONS = ['+1', '-1', 'laugh', 'confused', 'heart', 'hooray', 'rocket', 'eyes'] as const;
type Reaction = (typeof REACTIONS)[number];

enum MODE {
  Upsert = 'upsert',
  Recreate = 'recreate',
}

export default class Commenter {
  // TODO: find Octokit types
  private readonly octokit: any;

  constructor(private readonly filePath: string, private readonly mode = 'upsert') {
    const githubToken = core.getInput('github-token');
    this.octokit = github.getOctokit(githubToken);
  }

  async comment() {
    const { octokit, mode } = this;
    const { context } = github;

    const reactions: string = core.getInput('reactions');
    const issue_number = context.payload.pull_request?.number || context.payload.issue?.number;
    assert(issue_number);

    const content = fs.readFileSync(this.filePath, 'utf8');

    const comment_tag_pattern = '<!-- "appmap" -->';
    const body = `${content}\n'<!-- "appmap" -->`;

    type ListCommentsResponseDataType = GetResponseDataTypeFromEndpointMethod<
      typeof octokit.rest.issues.listComments
    >;

    {
      let comment: ListCommentsResponseDataType[0] | undefined;
      for await (const { data: comments } of this.octokit.paginate.iterator(octokit.rest.issues.listComments, {
        ...context.repo,
        issue_number,
      })) {
        // TODO: better type for comment
        comment = comments.find((comment: any) => comment?.body?.includes(comment_tag_pattern));
        if (comment) break;
      }

      if (comment) {
        if (mode === MODE.Upsert) {
          await octokit.rest.issues.updateComment({
            ...context.repo,
            comment_id: comment.id,
            body,
          });
          await this.addReactions(comment.id, reactions);
          return;
        } else if (mode === MODE.Recreate) {
          await octokit.rest.issues.deleteComment({
            ...context.repo,
            comment_id: comment.id,
          });

          const { data: newComment } = await octokit.rest.issues.createComment({
            ...context.repo,
            issue_number,
            body,
          });

          await this.addReactions(newComment.id, reactions);
          return;
        } 
      }
    }

    const { data: comment } = await octokit.rest.issues.createComment({
      ...context.repo,
      issue_number,
      body,
    });

    await this.addReactions(comment.id, reactions);
  }

  async addReactions(comment_id: number, reactions: string) {
    const { octokit } = this;
    const { context } = github;

    const validReactions = <Reaction[]>reactions
      .replace(/\s/g, '')
      .split(',')
      .filter((reaction) => REACTIONS.includes(<Reaction>reaction));

    await Promise.allSettled(
      validReactions.map(async (content) => {
        await octokit.rest.reactions.createForIssueComment({
          ...context.repo,
          comment_id,
          content,
        });
      }),
    );
  }
}
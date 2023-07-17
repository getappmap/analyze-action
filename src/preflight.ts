import * as core from '@actions/core';
import {ArgumentParser} from 'argparse';

import log, {ActionLogger, LogLevel, setLogger} from './log';
import verbose from './verbose';
import assert from 'assert';
import {DirectoryArtifactStore} from './DirectoryArtifactStore';
import compare, {summarizeChanges} from './run';
import {GitHubArtifactStore} from './GitHubArtifactStore';
import {cp} from 'fs/promises';
import {inspect} from 'util';
import ReportOptions from './ReportOptions';
import Commenter from './Commenter';

async function runInGitHub(): Promise<void> {
  verbose(core.getBooleanInput('verbose'));
  setLogger(new ActionLogger());

  const baseRevisionArg = core.getInput('base-revision');
  const headRevisionArg = core.getInput('head-revision');
  const sourceDir = core.getInput('source-dir');

  const baseRevision = baseRevisionArg || process.env.GITHUB_BASE_REF;
  if (!baseRevision)
    throw new Error(
      'base-revision argument must be provided, or GITHUB_BASE_REF must be available from GitHub (https://docs.github.com/en/actions/learn-github-actions/variables#default-environment-variables).'
    );

  const headRevision = headRevisionArg || process.env.GITHUB_SHA;
  const githubToken = core.getInput('github-token');
  const githubRepo = process.env.GITHUB_REPOSITORY;
  const githubServer = process.env.GITHUB_SERVER_URL;
  const runId = process.env.GITHUB_RUN_ID;

  assert(baseRevision, 'baseRef is undefined');
  assert(headRevision, 'headRef is undefined');
  assert(githubRepo, 'githubRepo is undefined');
  assert(githubServer, 'githubServer is undefined');
  assert(runId, 'githubRepo is undefined');

  const compareOptions = {
    baseRevision,
    headRevision,
    sourceDir,
    githubRepo,
    githubToken,
  };
  log(LogLevel.Debug, `compareOptions: ${inspect(compareOptions)}`);

  const [owner, repo] = githubRepo.split('/');
  const sourceURL = new URL(githubServer);
  sourceURL.pathname = [githubRepo, 'blob', headRevision].join('/');
  const appmapURLParams = new URLSearchParams({
    owner,
    repo,
    run_id: runId,
    base_revision: baseRevision,
    head_revision: headRevision,
  });
  const appmapURL = new URL(`https://app.land/github_artifact?${appmapURLParams.toString()}`);

  const reportOptions = {
    sourceURL,
    appmapURL,
  };

  log(LogLevel.Debug, `reportOptions: ${inspect(reportOptions)}`);

  const compareResult = await compare(new GitHubArtifactStore(), compareOptions);
  const reportResult = await summarizeChanges(compareResult.reportDir, reportOptions);

  const commenter = new Commenter(reportResult.reportFile);
  await commenter.comment();

  core.setOutput('report-dir', compareResult.reportDir);
  if (process.env.GITHUB_STEP_SUMMARY) {
    await cp(reportResult.reportFile, process.env.GITHUB_STEP_SUMMARY);
  }
}

async function runLocally() {
  const parser = new ArgumentParser({
    description: 'Preflight command',
  });
  parser.add_argument('-v', '--verbose');
  parser.add_argument('-d', '--directory', {help: 'Program working directory'});
  parser.add_argument('--appmap-command', {default: 'appmap'});
  parser.add_argument('--base-revision', {required: true});
  parser.add_argument('--head-revision', {required: true});
  parser.add_argument('--source-dir');
  parser.add_argument('--github-token');
  parser.add_argument('--github-repo');
  parser.add_argument('--artifact-dir', {default: '.appmap/artifacts'});
  parser.add_argument('--source-url');
  parser.add_argument('--appmap-url');

  const options = parser.parse_args();

  verbose(options.verbose === 'true' || options.verbose === true);
  const artifactDir = options.artifact_dir;
  assert(artifactDir);
  const directory = options.directory;
  if (directory) process.chdir(directory);

  const compareOptions = {
    appmapCommand: options.appmap_command,
    baseRevision: options.base_revision,
    headRevision: options.head_revision,
    sourceDir: options.source_dir,
    githubToken: options.github_token || process.env.GITHUB_TOKEN,
    githubRepo: options.github_repo,
  };

  const reportOptions = {} as ReportOptions;
  if (options.appmap_command) reportOptions.appmapCommand = options.appmap_command;
  if (options.source_url) reportOptions.sourceURL = new URL(options.source_url);
  if (options.appmap_url) reportOptions.appmapURL = new URL(options.appmap_url);

  const compareResult = await compare(new DirectoryArtifactStore(artifactDir), compareOptions);
  await summarizeChanges(compareResult.reportDir, reportOptions);
}

if (require.main === module) {
  if (process.env.CI) runInGitHub();
  else runLocally();
}

import * as core from '@actions/core';
import { ArgumentParser } from 'argparse';
import {
  log,
  LogLevel,
  ActionLogger,
  setLogger,
  verbose,
  Commenter,
  DirectoryArtifactStore,
  GitHubArtifactStore,
} from '@appland/action-utils';
import { getOctokit } from '@actions/github';
import { Octokit } from '@octokit/rest';
import assert from 'assert';
import { cp } from 'fs/promises';
import { inspect } from 'util';

import { compare, compareReport, CompareOptions } from './run';
import Annotator from './Annotator';
import uploadRunStats from './uploadRunStats';
import { CompareReportOptions } from './CompareReport';
import ProjectSummaryReport, { ProjectSummaryReportOptions } from './ProjectSummaryReport';

async function runInGitHub(): Promise<void> {
  verbose(core.getInput('verbose'));
  setLogger(new ActionLogger());

  const directory = core.getInput('directory');
  const baseRevisionArg = core.getInput('base-revision');
  const headRevisionArg = core.getInput('head-revision');
  const sourceDir = core.getInput('source-dir');
  const threadCountStr = core.getInput('thread-count');
  const includeSectionsStr = core.getInput('include-sections');
  const excludeSectionsStr = core.getInput('exclude-sections');
  // Defaults for fetchHistoryDays and retentionDays should not technically be needed, since
  // default values are set in the action.yml file. These defaults are just here for extra safety.
  const fetchHistoryDays = parseInt(core.getInput('fetch-history-days') || '30', 10);
  const retentionDays = parseInt(core.getInput('retention-days') || '7', 10);
  const threadCount = threadCountStr ? parseInt(threadCountStr, 10) : undefined;
  const projectSummary = core.getBooleanInput('project-summary');
  const issueNumber = parseIssueNumber(core.getInput('issue-number'));

  const baseRevision = baseRevisionArg || process.env.GITHUB_BASE_REF;
  if (!baseRevision)
    throw new Error(
      'base-revision argument must be provided, or GITHUB_BASE_REF must be available from GitHub (https://docs.github.com/en/actions/learn-github-actions/variables#default-environment-variables).'
    );

  const headRevision = headRevisionArg || process.env.GITHUB_SHA;
  if (!headRevision)
    throw new Error(
      'head-revision argument must be provided, or GIHUB_SHA must be available from GitHub (https://docs.github.com/en/actions/learn-github-actions/variables#default-environment-variables).'
    );

  const githubToken = core.getInput('github-token');
  const githubRepo = process.env.GITHUB_REPOSITORY;
  const githubServer = process.env.GITHUB_SERVER_URL;
  const runId = process.env.GITHUB_RUN_ID;

  assert(githubToken, 'token is undefined');
  assert(githubRepo, 'repository is undefined');
  assert(githubServer, 'server URL is undefined');
  assert(runId, 'run id is undefined');

  if (directory) {
    log(LogLevel.Info, `Changing working directory: ${directory}`);
    process.chdir(directory);
  }

  const compareOptions: CompareOptions = {
    baseRevision,
    headRevision,
    sourceDir,
    githubRepo,
    githubToken,
    fetchHistoryDays,
    retentionDays,
    threadCount,
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
  const appmapURL = new URL(`https://getappmap.com/github_artifact?${appmapURLParams.toString()}`);

  const reportOptions: CompareReportOptions = {
    sourceURL,
    appmapURL,
  };
  if (includeSectionsStr) reportOptions.includeSections = includeSectionsStr.split(' ');
  if (excludeSectionsStr) reportOptions.excludeSections = excludeSectionsStr.split(' ');

  log(LogLevel.Debug, `reportOptions: ${inspect(reportOptions)}`);

  const artifactStore = new GitHubArtifactStore();

  const compareResult = await compare(artifactStore, compareOptions);
  const compareReportResult = await compareReport(compareResult.reportDir, reportOptions);

  const octokit = getOctokit(githubToken) as unknown as Octokit;

  const projectSummaryReport = new ProjectSummaryReport(compareResult.reportDir, headRevision, {
    sourceURL,
  });
  if (projectSummary || (await projectSummaryReport.shouldReport(octokit))) {
    const projectSummaryReportResult = await projectSummaryReport.generateReport();
    await projectSummaryReport.comment(octokit, projectSummaryReportResult.reportFile);
  }

  {
    const commenter = new Commenter(octokit, 'appmap', issueNumber);
    await commenter.comment(compareReportResult.reportFile);
  }
  {
    const excludedDirectories = core.getInput('annotation-exclusions').split(' ');
    const annotator = new Annotator(octokit, compareResult.reportDir, excludedDirectories);
    await annotator.annotate();
  }
  {
    await uploadRunStats(artifactStore, retentionDays);
  }
  core.setOutput('report-dir', compareResult.reportDir);
  if (process.env.GITHUB_STEP_SUMMARY) {
    await cp(compareReportResult.reportFile, process.env.GITHUB_STEP_SUMMARY);
  }
}

async function runLocally() {
  const parser = new ArgumentParser({
    description: 'Analyze command',
  });
  parser.add_argument('-v', '--verbose');
  parser.add_argument('-d', '--directory', { help: 'Program working directory' });
  parser.add_argument('--appmap-command', { default: 'appmap' });
  parser.add_argument('--base-revision', { required: true });
  parser.add_argument('--head-revision', { required: true });
  parser.add_argument('--project-summary', { type: Boolean, default: true });
  parser.add_argument('--source-dir');
  parser.add_argument('--github-token');
  parser.add_argument('--github-repo');
  parser.add_argument('--artifact-dir', { default: '.appmap/artifacts' });
  parser.add_argument('--source-url');
  parser.add_argument('--appmap-url');
  parser.add_argument('--retention-days', { default: '7' });
  parser.add_argument('--fetch-history-days', { default: '30' });
  parser.add_argument('--thread-count');
  parser.add_argument('--include-sections');
  parser.add_argument('--exclude-sections');

  const options = parser.parse_args();

  verbose(options.verbose);
  const artifactDir = options.artifact_dir;
  assert(artifactDir);
  const directory = options.directory;

  if (directory) {
    log(LogLevel.Info, `Changing working directory: ${directory}`);
    process.chdir(directory);
  }

  const compareOptions: CompareOptions = {
    appmapCommand: options.appmap_command,
    baseRevision: options.base_revision,
    headRevision: options.head_revision,
    sourceDir: options.source_dir,
    githubToken: options.github_token || process.env.GITHUB_TOKEN,
    githubRepo: options.github_repo,
    retentionDays: parseInt(options.retention_days, 10),
    fetchHistoryDays: parseInt(options.fetch_history_days, 10),
  };
  if (options.thread_count) compareOptions.threadCount = parseInt(options.thread_count, 10);

  const compareResult = await compare(new DirectoryArtifactStore(artifactDir), compareOptions);

  const reportOptions = {} as CompareReportOptions;
  if (options.appmap_command) reportOptions.appmapCommand = options.appmap_command;
  if (options.source_url) reportOptions.sourceURL = new URL(options.source_url);
  if (options.appmap_url) reportOptions.appmapURL = new URL(options.appmap_url);
  if (options.include_sections) reportOptions.includeSections = options.include_sections.split(' ');
  if (options.exclude_sections) reportOptions.excludeSections = options.exclude_sections.split(' ');
  await compareReport(compareResult.reportDir, reportOptions);

  if (options.project_summary) {
    const projectSummaryOptions = {} as ProjectSummaryReportOptions;
    if (options.appmap_command) projectSummaryOptions.appmapCommand = options.appmap_command;
    if (options.source_url) projectSummaryOptions.sourceURL = options.source_url;
    const projectSummaryReport = new ProjectSummaryReport(
      compareResult.reportDir,
      options.head_revision,
      projectSummaryOptions
    );
    await projectSummaryReport.generateReport();
  }
}

if (require.main === module) {
  if (process.env.CI) runInGitHub();
  else runLocally();
}

export function parseIssueNumber(input: unknown): number | undefined {
  // If the input is a number and it's an integer, return it directly
  if (typeof input === 'number' && Number.isInteger(input)) {
    return input;
  }

  if (typeof input !== 'string') {
    return undefined;
  }

  const parsed = parseInt(input);
  return isNaN(parsed) ? undefined : parsed;
}

import * as core from '@actions/core';
import * as artifact from '@actions/artifact';
import {ArgumentParser} from 'argparse';

import {ActionLogger, setLogger} from './log';
import verbose from './verbose';
import assert from 'assert';
import ArtifactStore, {DirectoryArtifactStore} from './ArtifactStore';
import run from './run';

export interface CommandOptions {
  baseRef: string;
  headRef: string;
  appmapCommand?: string;
  sourceDir?: string;
  repository?: string;
}

class GitHubArtifactStore implements ArtifactStore {
  async uploadArtifact(name: string, files: string[]): Promise<void> {
    const artifactClient = artifact.create();
    await artifactClient.uploadArtifact(name, files, process.cwd());
  }
}

async function runInGitHub(): Promise<void> {
  verbose(core.getBooleanInput('verbose'));
  setLogger(new ActionLogger());

  const baseRevisionArg = core.getInput('base-revision');
  const headRevisionArg = core.getInput('head-revision');
  const sourceDir = core.getInput('source-dir');

  const baseRef = baseRevisionArg || process.env.GITHUB_BASE_REF;
  if (!baseRef)
    throw new Error(
      'base-revision argument must be provided, or GITHUB_BASE_REF must be available from GitHub (https://docs.github.com/en/actions/learn-github-actions/variables#default-environment-variables).'
    );

  const headRef = headRevisionArg || process.env.GITHUB_SHA;
  const repository = process.env.GITHUB_REPOSITORY;

  assert(baseRef, 'baseRef is undefined');
  assert(headRef, 'headRef is undefined');

  await run(new GitHubArtifactStore(), {
    baseRef,
    headRef,
    sourceDir,
    repository,
  });
}

async function runLocally() {
  const parser = new ArgumentParser({
    description: 'Preflight command',
  });
  parser.add_argument('-v', '--verbose');
  parser.add_argument('-d', '--directory', {help: 'Program working directory'});
  parser.add_argument('--appmap-command', {default: '/tmp/appmap'});
  parser.add_argument('--base-revision', {required: true});
  parser.add_argument('--head-revision', {required: true});
  parser.add_argument('--source-dir');
  parser.add_argument('--git-repo');

  const options = parser.parse_args();

  console.log(options);

  verbose(options.verbose === 'true' || options.verbose === true);
  const outputDir = options.outputDir || '.appmap/artifacts';
  const directory = options.directory;
  if (directory) process.chdir(directory);

  await run(new DirectoryArtifactStore(outputDir), {
    appmapCommand: options.appmap_command,
    baseRef: options.base_revision,
    headRef: options.head_revision,
    sourceDir: options.source_dir,
    repository: options.git_repo,
  });
}

if (require.main === module) {
  if (process.env.CI) runInGitHub();
  else runLocally();
}

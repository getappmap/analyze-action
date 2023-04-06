import * as core from '@actions/core';
import * as artifact from '@actions/artifact';
import {ActionLogger, setLogger} from './log';
import Compare from './Compare';
import Restore from './Restore';
import verbose from './verbose';
import assert from 'assert';
import {executeCommand} from './executeCommand';
import {mkdir} from 'fs/promises';
import {join} from 'path';
import Archiver, {ArtifactStore} from './Archiver';

class GitHubArtifactStore implements ArtifactStore {
  async uploadArtifact(name: string, path: string): Promise<void> {
    const artifactClient = artifact.create();
    await artifactClient.uploadArtifact(name, [path], process.cwd());
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

  assert(baseRef);
  assert(headRef);
  const baseRevision = (await executeCommand(`git rev-parse ${baseRef}`)).trim();
  const headRevision = (await executeCommand(`git rev-parse ${headRef}`)).trim();

  const outputDir = `.appmap/change-report/${baseRevision}-${headRevision}`;
  await mkdir(outputDir, {recursive: true});

  // Build an archive of the current appmaps in the repo, and unpack it into
  // change-report/head.
  const archiver = new Archiver(new GitHubArtifactStore());
  if (headRevision) archiver.revision = headRevision;
  await archiver.unpack(baseRevision, join(outputDir, 'head'));

  // Restore the base revision AppMaps into change-report/base.
  const restorer = new Restore(baseRevision);
  await restorer.restore();

  const comparer = new Compare(baseRevision, headRevision);
  comparer.outputDir = outputDir;
  if (sourceDir) comparer.sourceDir = sourceDir;
  await comparer.compare();
}

if (require.main === module) {
  runInGitHub();
}

import * as core from '@actions/core';
import {ActionLogger, setLogger} from './log';
import Compare from './Compare';
import Restore from './Restore';
import verbose from './verbose';
import assert from 'assert';
import {executeCommand} from './executeCommand';
import {existsSync} from 'fs';
import {mkdir} from 'fs/promises';

async function runInGitHub(): Promise<void> {
  verbose(core.getBooleanInput('verbose'));
  setLogger(new ActionLogger());

  const baseRevisionArg = core.getInput('base-revision');
  const headRevisionArg = core.getInput('head-revision');
  const sourceDir = core.getInput('source-dir');

  const baseRef = baseRevisionArg || process.env.GITHUB_BASE_REF;
  const headRevision = headRevisionArg || process.env.GITHUB_SHA;

  assert(baseRef);
  assert(headRevision);
  const baseRevision = (await executeCommand(`git rev-parse ${baseRef}`)).trim();

  const outputDir = `.appmap/change-report/${baseRevision}-${headRevision}`;
  await mkdir(outputDir, {recursive: true});

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

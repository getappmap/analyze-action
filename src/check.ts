import * as core from '@actions/core';
import {ArgumentParser} from 'argparse';

import verbose from './verbose';
import {ActionLogger, setLogger} from './log';
import assert from 'assert';
import {readFile, writeFile} from 'fs/promises';
import {join} from 'path';
import {ChangeReport} from './ChangeReport';

export async function run(directory: string): Promise<string[] | undefined> {
  const reportFile = JSON.parse(
    await readFile(join(directory, 'change-report.json'), 'utf-8')
  ) as ChangeReport;

  const failed = reportFile.testFailures && reportFile.testFailures.length > 0;
  if (!failed) return;

  const summary: string[] = [];
  for (const failure of reportFile.testFailures) {
    summary.push(`${failure.testLocation}: ${failure.failureMessage}`);
  }
  return summary;
}

async function runInGitHub(): Promise<void> {
  setLogger(new ActionLogger());

  const directory = core.getInput('directory');
  if (!directory) throw new Error('`directory` input is required');

  const summary = await run(directory);
  if (!summary) {
    process.exit(0);
    return;
  }

  if (process.env.GITHUB_STEP_SUMMARY) {
    await writeFile(summary.join('\n'), process.env.GITHUB_STEP_SUMMARY);
  }
  process.exit(1);
}

async function runLocally() {
  const parser = new ArgumentParser({
    description: 'Preflight check command',
  });
  parser.add_argument('-v', '--verbose');
  parser.add_argument('-d', '--directory', {help: 'Report directory', required: true});

  const options = parser.parse_args();

  verbose(options.verbose === 'true' || options.verbose === true);
  const directory = options.directory;
  assert(directory, 'directory argument is required');

  const summary = await run(directory);
  console.log(summary);
  if (!summary) {
    process.exit(0);
    return;
  }

  console.log(summary.join('\n'));
  process.exit(1);
}

if (require.main === module) {
  if (process.env.CI) runInGitHub();
  else runLocally();
}

import { mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import assert from 'assert';
import { executeCommand, ArtifactStore } from '@appland/action-utils';

import Compare from './Compare';
import Restore from './Restore';
import Archiver from './Archiver';
import CompareReport, { CompareReportOptions as CompareReportOptions } from './CompareReport';
import fetchAndRestore from './fetchAndRestore';

export interface CompareOptions {
  baseRevision: string;
  headRevision: string;
  fetchHistoryDays: number;
  retentionDays: number;
  appmapCommand?: string;
  sourceDir?: string;
  githubToken?: string;
  githubRepo?: string;
  threadCount?: number;
}

export async function compare(
  artifactStore: ArtifactStore,
  options: CompareOptions
): Promise<{ reportDir: string }> {
  const baseRevision = (await executeCommand(`git rev-parse ${options.baseRevision}`)).trim();
  const headRevision = (await executeCommand(`git rev-parse ${options.headRevision}`)).trim();

  const outputDir = `.appmap/change-report/${baseRevision}-${headRevision}`;
  if (existsSync(outputDir))
    throw new Error(
      `Output directory ${outputDir} already exists. Please remove it and try again.`
    );
  await mkdir(outputDir, { recursive: true });

  const archiver = new Archiver(artifactStore, headRevision, options.retentionDays);
  if (options.appmapCommand) archiver.appmapCommand = options.appmapCommand;
  if (options.threadCount) archiver.threadCount = options.threadCount;
  const archiveResult = await archiver.archive();
  await archiver.unpack(archiveResult.archiveFile, join(outputDir, 'head'));

  // Restore the base revision AppMaps into change-report/base.
  const restorer = new Restore(baseRevision, join(outputDir, 'base'));
  if (options.githubToken) restorer.githubToken = options.githubToken;
  if (options.appmapCommand) restorer.appmapCommand = options.appmapCommand;
  if (options.githubRepo) restorer.repository = options.githubRepo;
  restorer.validate();
  await fetchAndRestore(restorer, options.fetchHistoryDays);

  const comparer = new Compare(artifactStore, baseRevision, headRevision, options.retentionDays);
  comparer.outputDir = outputDir;
  if (options.appmapCommand) comparer.appmapCommand = options.appmapCommand;
  if (options.sourceDir) comparer.sourceDir = options.sourceDir;

  return comparer.compare();
}

export async function compareReport(
  outputDir: string,
  options: CompareReportOptions
): Promise<{ reportFile: string }> {
  const reporter = new CompareReport(outputDir, options);
  if (options.includeSections) reporter.includeSections = options.includeSections;
  if (options.excludeSections) reporter.excludeSections = options.excludeSections;
  const reportFile = join(outputDir, 'report.md');
  await reporter.generateReport();
  assert(existsSync(reportFile), `${reportFile} does not exist`);
  return { reportFile };
}

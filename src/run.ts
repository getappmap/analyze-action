import Compare from './Compare';
import Restore from './Restore';
import { executeCommand } from './executeCommand';
import { mkdir } from 'fs/promises';
import { join } from 'path';
import Archiver from './Archiver';
import ArtifactStore from './ArtifactStore';
import CompareOptions from './CompareOptions';
import { existsSync } from 'fs';
import MarkdownReport from './MarkdownReport';
import assert from 'assert';
import ReportOptions from './ReportOptions';
import fetchAndRestore from './fetchAndRestore';

export default async function compare(
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

  const archiver = new Archiver(artifactStore, headRevision);
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

  const comparer = new Compare(artifactStore, baseRevision, headRevision);
  comparer.outputDir = outputDir;
  if (options.appmapCommand) comparer.appmapCommand = options.appmapCommand;
  if (options.sourceDir) comparer.sourceDir = options.sourceDir;

  return await comparer.compare();
}

export async function summarizeChanges(
  outputDir: string,
  options: ReportOptions
): Promise<{ reportFile: string }> {
  const reporter = new MarkdownReport(outputDir, options);
  const reportFile = join(outputDir, 'report.md');
  await reporter.generateReport();
  assert(existsSync(reportFile), `${reportFile} does not exist`);
  return { reportFile };
}

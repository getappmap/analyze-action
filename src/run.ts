import Compare from './Compare';
import Restore from './Restore';
import {executeCommand} from './executeCommand';
import {mkdir, readFile, writeFile} from 'fs/promises';
import {join} from 'path';
import Archiver from './Archiver';
import ArtifactStore from './ArtifactStore';
import {CommandOptions} from './CommandOptions';
import {existsSync} from 'fs';
import MarkdownReport from './report/MarkdownReport';
import {ChangeReport} from './report/ChangeReport';

export default async function run(
  artifactStore: ArtifactStore,
  options: CommandOptions
): Promise<{summary: string}> {
  const baseRevision = (await executeCommand(`git rev-parse ${options.baseRef}`)).trim();
  const headRevision = (await executeCommand(`git rev-parse ${options.headRef}`)).trim();

  const outputDir = `.appmap/change-report/${baseRevision}-${headRevision}`;
  if (existsSync(outputDir))
    throw new Error(
      `Output directory ${outputDir} already exists. Please remove it and try again.`
    );
  await mkdir(outputDir, {recursive: true});

  const archiver = new Archiver(artifactStore, headRevision);
  if (options.appmapCommand) archiver.appmapCommand = options.appmapCommand;
  const archiveResult = await archiver.archive();
  await archiver.unpack(archiveResult.archiveFile, join(outputDir, 'head'));

  // Restore the base revision AppMaps into change-report/base.
  const restorer = new Restore(baseRevision, join(outputDir, 'base'));
  if (options.githubToken) restorer.githubToken = options.githubToken;
  if (options.appmapCommand) restorer.appmapCommand = options.appmapCommand;
  if (options.githubRepo) restorer.repository = options.githubRepo;
  await restorer.restore();

  const comparer = new Compare(artifactStore, baseRevision, headRevision);
  comparer.outputDir = outputDir;
  if (options.appmapCommand) comparer.appmapCommand = options.appmapCommand;
  if (options.sourceDir) comparer.sourceDir = options.sourceDir;
  await comparer.compare();

  const summary = await summarizeChanges(options.basePath || process.cwd(), outputDir);
  return {summary};
}

export async function summarizeChanges(basePath: string, outputDir: string): Promise<string> {
  const changeReport = JSON.parse(
    await readFile(join(outputDir, 'change-report.json'), 'utf-8')
  ) as ChangeReport;

  const reporter = new MarkdownReport();
  return await reporter.generateReport(changeReport, basePath);
}

import Compare from './Compare';
import Restore from './Restore';
import {executeCommand} from './executeCommand';
import {mkdir} from 'fs/promises';
import {join} from 'path';
import Archiver from './Archiver';
import ArtifactStore from './ArtifactStore';
import {CommandOptions} from './index';
import {existsSync} from 'fs';

export default async function run(artifactStore: ArtifactStore, options: CommandOptions) {
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
}

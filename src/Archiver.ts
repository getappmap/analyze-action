import {existsSync} from 'fs';
import {mkdir} from 'fs/promises';
import {basename, dirname, join} from 'path';
import ArtifactStore from './ArtifactStore';
import {executeCommand} from './executeCommand';
import log, {LogLevel} from './log';
import verbose from './verbose';

export default class Archiver {
  public appmapCommand = '/tmp/appmap';
  public archiveBranch = 'appmap-archive';

  constructor(public artifactStore: ArtifactStore, public revision: string) {}

  async archive(): Promise<{archiveFile: string}> {
    log(LogLevel.Info, `Archiving AppMaps from ${process.cwd()}`);

    let archiveCommand = `${this.appmapCommand} archive --revision ${this.revision}`;
    if (verbose()) archiveCommand += ' --verbose';
    await executeCommand(archiveCommand);

    const archiveFiles = [
      join('.appmap', 'archive', 'full', `${this.revision}.tar`),
      join('.appmap', 'archive', 'incremental', `${this.revision}.tar`),
    ].filter(file => existsSync(file));

    if (archiveFiles.length === 0) {
      throw new Error(`No AppMap archives found in ${process.cwd()}`);
    }
    if (archiveFiles.length > 1) {
      log(LogLevel.Warn, `Mulitple AppMap archives found in ${process.cwd()}`);
    }

    const archiveFile = archiveFiles.pop()!;

    log(LogLevel.Debug, `Processing AppMap archive ${archiveFile}`);

    // e.g. .appmap/archive/full
    const dir = dirname(archiveFile);
    // e.g. appmap-archive-full
    const artifactPrefix = dir.replace(/\//g, '-').replace(/\./g, '');
    const [sha] = basename(archiveFile).split('.');
    const artifactName = `${artifactPrefix}_${sha}.tar`;

    await this.artifactStore.uploadArtifact(artifactName, [archiveFile]);

    return {archiveFile};
  }

  async unpack(archiveFile: string, directory: string) {
    log(LogLevel.Info, `Unpacking AppMap archive ${archiveFile} into ${directory}`);
    await mkdir(directory, {recursive: true});
    await executeCommand(`tar -C ${directory} -xf ${archiveFile}`);
  }
}

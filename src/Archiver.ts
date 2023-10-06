import { existsSync } from 'fs';
import { basename, dirname, join } from 'path';
import { log, LogLevel, executeCommand, verbose } from '@appland/action-utils';

import ArtifactStore from './ArtifactStore';

export interface ArchiveDetector {
  findExistingArchives(revision: string): string[];
}

class FileArchiveDetector implements ArchiveDetector {
  findExistingArchives(revision: string): string[] {
    return (
      [
        join('.appmap', 'archive', 'full', `${revision}.tar`),
        join('.appmap', 'archive', 'incremental', `${revision}.tar`),
      ]
        .filter((file) => existsSync(file))
        // With alphabetical sort, 'full' archive will be preferred to 'incremental'
        .sort((a, b) => a.localeCompare(b))
    );
  }
}

export default class Archiver {
  public appmapCommand = 'appmap';
  public archiveBranch = 'appmap-archive';
  public archiveDetector: ArchiveDetector = new FileArchiveDetector();
  public threadCount?: number;

  constructor(
    public artifactStore: ArtifactStore,
    public revision: string,
    public retentionDays: number
  ) {}

  async archive(): Promise<{ archiveFile: string }> {
    {
      const existingArchives = this.archiveDetector.findExistingArchives(this.revision);
      if (existingArchives?.length > 0) {
        const existingArchive = existingArchives.shift()!;
        log(LogLevel.Info, `Using existing AppMap archive ${existingArchive}`);
        return { archiveFile: existingArchive };
      }
    }

    log(LogLevel.Info, `Archiving AppMaps from ${process.cwd()}`);

    let archiveCommand = `${this.appmapCommand} archive --revision ${this.revision}`;
    if (verbose()) archiveCommand += ' --verbose';
    if (this.threadCount) archiveCommand += ` --thread-count ${this.threadCount}`;
    await executeCommand(archiveCommand);

    const archiveFiles = this.archiveDetector.findExistingArchives(this.revision);
    if (archiveFiles.length === 0) {
      throw new Error(`No AppMap archives found in ${process.cwd()}`);
    }
    if (archiveFiles.length > 1) {
      log(
        LogLevel.Warn,
        `Multiple AppMap archives found in ${process.cwd()}: ${archiveFiles.join(', ')}`
      );
    }

    const archiveFile = archiveFiles.shift()!;

    log(LogLevel.Debug, `Processing AppMap archive ${archiveFile}`);

    // e.g. .appmap/archive/full
    const dir = dirname(archiveFile);
    // e.g. appmap-archive-full
    const artifactPrefix = dir.replace(/\//g, '-').replace(/\./g, '');
    const [sha] = basename(archiveFile).split('.');
    const artifactName = `${artifactPrefix}_${sha}.tar`;

    await this.artifactStore.uploadArtifact(artifactName, [archiveFile], this.retentionDays);

    return { archiveFile };
  }

  async unpack(archiveFile: string, directory: string) {
    log(LogLevel.Info, `Restoring AppMap archive ${archiveFile} into ${directory}`);

    let restoreCommand = `${this.appmapCommand} restore --exact --revision ${this.revision} --output-dir ${directory}`;
    if (verbose()) restoreCommand += ' --verbose';
    await executeCommand(restoreCommand);
  }
}

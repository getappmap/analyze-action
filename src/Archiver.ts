import {mkdir} from 'fs/promises';
import {basename, dirname} from 'path';
import {executeCommand} from './executeCommand';
import log, {LogLevel} from './log';

export interface ArtifactStore {
  uploadArtifact(name: string, path: string): Promise<void>;
}

export default class Archiver {
  public toolsPath = '/tmp/appmap';
  public archiveBranch = 'appmap-archive';
  public revision?: boolean | string;

  constructor(public artifactStore: ArtifactStore) {}

  async archive(): Promise<{branchStatus: string[]}> {
    log(LogLevel.Info, `Archiving AppMaps from ${process.cwd()}`);

    const revision = this.revision === false ? undefined : this.revision || process.env.GITHUB_SHA;
    let archiveCommand = `${this.toolsPath} archive`;
    if (revision) archiveCommand += ` --revision ${revision}`;
    await executeCommand(archiveCommand);

    const branchStatus = (await executeCommand('git status -u -s -- .appmap')).trim().split('\n');
    log(LogLevel.Debug, `Branch status is:\n${branchStatus}`);

    const archiveFiles = branchStatus
      .map(status => status.split(' ')[1])
      .filter(path => path.endsWith('.tar'));

    if (archiveFiles.length === 0) {
      log(LogLevel.Warn, `No AppMap archives found in ${process.cwd()}`);
      return {branchStatus};
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

    await this.artifactStore.uploadArtifact(artifactName, archiveFile);

    return {branchStatus};
  }

  async unpack(revision: string, directory: string) {
    let archiveCommand = `${this.toolsPath} restore`;
    if (revision) archiveCommand += ` --revision ${revision} --exact --output-dir ${directory}`;
    await executeCommand(archiveCommand);
  }
}

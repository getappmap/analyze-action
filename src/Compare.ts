import {glob} from 'glob';
import {ArtifactStore} from './ArtifactStore';
import {executeCommand} from './executeCommand';
import log, {LogLevel} from './log';

export default class Compare {
  public toolsPath = '/tmp/appmap';
  public sourceDir?: string;
  public outputDir?: string;

  constructor(
    public artifactStore: ArtifactStore,
    public baseRevision: string,
    public headRevision: string
  ) {}

  async compare() {
    let cmd = `${this.toolsPath} compare --base-revision ${this.baseRevision} --head-revision ${this.headRevision} --clobber-output-dir=true`;
    if (this.outputDir) cmd += ` --output-dir ${this.outputDir}`;
    if (this.sourceDir) cmd += ` --source-dir ${this.sourceDir}`;
    executeCommand(cmd);

    log(LogLevel.Debug, `Storing GitHub artifact for the comparison report`);

    const outputDir =
      this.outputDir || `.appmap/change-report/${this.baseRevision}-${this.headRevision}`;
    const files = await glob(`${outputDir}/**/*`);
    await this.artifactStore.uploadArtifact(
      'appmap-preflight-${this.baseRevision}-${this.headRevision}',
      files
    );
  }
}

import {executeCommand} from './executeCommand';

export default class Compare {
  public toolsPath = '/tmp/appmap';
  public sourceDir?: string;
  public outputDir?: string;

  constructor(public baseRevision: string, public headRevision: string) {}

  async compare() {
    let cmd = `${this.toolsPath} compare --base-revision ${this.baseRevision} --head-revision ${this.headRevision} --clobber-output-dir=true`;
    if (this.outputDir) cmd += ` --output-dir ${this.outputDir}`;
    if (this.sourceDir) cmd += ` --source-dir ${this.sourceDir}`;
    executeCommand(cmd);
  }
}

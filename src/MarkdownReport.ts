import {executeCommand} from './executeCommand';
import verbose from './verbose';

export default class MarkdownReport {
  public appmapCommand = '/tmp/appmap';

  constructor(public reportDir: string) {}

  async generateReport() {
    let cmd = `${this.appmapCommand} compare-report ${this.reportDir}`;
    if (verbose()) cmd += ' --verbose';
    await executeCommand(cmd);
  }
}

import ReportOptions from './ReportOptions';
import {executeCommand} from './executeCommand';
import verbose from './verbose';

export default class MarkdownReport {
  public appmapCommand = 'appmap';

  constructor(public reportDir: string, public options: ReportOptions) {
    if (options.appmapCommand) this.appmapCommand = options.appmapCommand;
  }

  async generateReport() {
    let cmd = `${this.appmapCommand} compare-report`;
    if (verbose()) cmd += ' --verbose';
    if (this.options.sourceURL) cmd += ` --source-url '${this.options.sourceURL}'`;
    if (this.options.appmapURL) cmd += ` --appmap-url '${this.options.appmapURL}'`;
    cmd += ` ${this.reportDir}`;
    await executeCommand(cmd);
  }
}

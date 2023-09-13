import ReportOptions from './ReportOptions';
import { executeCommand } from './executeCommand';
import verbose from './verbose';

export default class MarkdownReport {
  public appmapCommand = 'appmap';
  public includeSections?: string[];
  public excludeSections?: string[];

  constructor(public reportDir: string, public options: ReportOptions) {
    if (options.appmapCommand) this.appmapCommand = options.appmapCommand;
  }

  async generateReport() {
    let cmd = `${this.appmapCommand} compare-report`;
    if (verbose()) cmd += ' --verbose';
    if (this.options.sourceURL) cmd += ` --source-url '${this.options.sourceURL}'`;
    if (this.options.appmapURL) cmd += ` --appmap-url '${this.options.appmapURL}'`;
    if (this.includeSections) {
      for (const section of this.includeSections) {
        cmd += ` --include-section ${section}`;
      }
    }
    if (this.excludeSections) {
      for (const section of this.excludeSections) {
        cmd += ` --exclude-section ${section}`;
      }
    }
    cmd += ` ${this.reportDir}`;
    await executeCommand(cmd);
  }
}

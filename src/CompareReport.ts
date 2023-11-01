import { executeCommand, verbose } from '@appland/action-utils';

export interface CompareReportOptions {
  sourceURL?: URL;
  appmapURL?: URL;
  appmapCommand?: string;
  includeSections?: string[];
  excludeSections?: string[];
}

export default class CompareReport {
  public appmapCommand = 'appmap';
  public includeSections?: string[];
  public excludeSections?: string[];

  constructor(public reportDir: string, public options: CompareReportOptions) {
    if (options.appmapCommand) this.appmapCommand = options.appmapCommand;
  }

  async generateReport() {
    let cmd = `${this.appmapCommand} compare-report`;
    if (verbose()) cmd += ' --verbose';
    if (this.options.sourceURL) cmd += ` --source-url ${this.options.sourceURL}`;
    if (this.options.appmapURL) cmd += ` --appmap-url ${this.options.appmapURL}`;
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

import { Octokit } from '@octokit/rest';
import { Commenter, LogLevel, executeCommand, log, verbose } from '@appland/action-utils';
import { join } from 'path';
import { mkdir } from 'fs/promises';

export const INVENTORY_DIR = '.appmap/inventory';

export interface ProjectSummaryReportOptions {
  sourceURL?: URL;
  appmapCommand?: string;
}

export default class ProjectSummaryReport {
  public appmapCommand = 'appmap';

  constructor(
    public compareReportDir: string,
    public revision: string,
    public options: ProjectSummaryReportOptions
  ) {
    if (options.appmapCommand) this.appmapCommand = options.appmapCommand;
  }

  async shouldReport(octokit: Octokit): Promise<boolean> {
    if (!Commenter.hasIssueNumber()) return false;

    const commenter = new Commenter(octokit, 'appmap-configuration');
    return await commenter.commentExists();
  }

  async generateReport(): Promise<{ reportFile: string }> {
    await mkdir(INVENTORY_DIR, { recursive: true });

    const inventoryDataFile = join(INVENTORY_DIR, `${this.revision}.json`);
    const summaryFile = join(INVENTORY_DIR, `${this.revision}_summary.md`);
    {
      log(LogLevel.Info, `Generating inventory file ${inventoryDataFile}`);
      let command = `${this.appmapCommand} inventory ${inventoryDataFile}`;
      if (verbose()) command += ' --verbose';
      await executeCommand(command);
    }
    {
      log(LogLevel.Info, `Generating summary report ${summaryFile}`);
      let command = `${this.appmapCommand} inventory-report ${inventoryDataFile} ${summaryFile} --template-name summary`;
      if (this.options.sourceURL) command += ` --source-url ${this.options.sourceURL}`;
      if (verbose()) command += ' --verbose';
      await executeCommand(command);
    }
    return { reportFile: summaryFile };
  }

  async comment(octokit: Octokit, summaryFile: string) {
    log(LogLevel.Info, `Commenting on issue or pull request with project summary report`);
    const commenter = new Commenter(octokit, 'appmap-project-summary');
    await commenter.comment(summaryFile);
  }
}

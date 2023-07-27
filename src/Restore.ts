import assert from 'assert';
import { Command, executeCommand } from './executeCommand';
import verbose from './verbose';

export default class Restore {
  public repository?: string;
  public githubToken?: string;
  public appmapCommand = 'appmap';

  constructor(public revision: string, public outputDir: string) {}

  validate() {
    if (this.repository && !this.githubToken)
      throw new Error(`GitHub repository specified, but no GitHub token provided`);
  }

  async restore() {
    this.validate();

    let cmd = `${this.appmapCommand} restore --revision ${this.revision} --output-dir ${this.outputDir}`;
    if (verbose()) cmd += ' --verbose';
    let command: string | Command = cmd;
    if (this.repository) {
      assert(this.githubToken);
      command = {
        cmd: cmd + ` --github-repo ${this.repository}`,
        options: {
          env: { ...process.env, ...{ GITHUB_TOKEN: this.githubToken } },
        },
      };
    }

    await executeCommand(command);
  }
}

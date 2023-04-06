import {mkdir} from 'fs/promises';
import {executeCommand} from './executeCommand';
import verbose from './verbose';

export default class Restore {
  public repository?: string;
  public githubToken?: string;
  public appmapCommand = '/tmp/appmap';

  constructor(public revision: string, public outputDir: string) {}

  async restore() {
    let cmd = `${this.appmapCommand} restore --revision ${this.revision} --output-dir ${this.outputDir}`;
    if (verbose()) cmd += ' --verbose';
    const command = {cmd, options: {}};
    if (this.repository) {
      if (!this.githubToken)
        throw new Error(`GitHub repository specified, but no GitHub token provided`);

      command.cmd += ` --github-repo ${this.repository}`;
      command.options = {
        env: {GITHUB_TOKEN: this.githubToken},
      };
    }

    await executeCommand(command);
  }
}

import {executeCommand} from './executeCommand';
import verbose from './verbose';

export default class Restore {
  public repository?: string;
  public appmapCommand = '/tmp/appmap';

  constructor(public revision: string) {}

  async restore() {
    let cmd = `${this.appmapCommand} restore --revision ${this.revision}`;
    if (verbose()) cmd += ' --verbose';
    if (this.repository) cmd += ` --github-repo ${this.repository}`;
    await executeCommand(cmd);
  }
}

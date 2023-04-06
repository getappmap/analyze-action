import {executeCommand} from './executeCommand';

export default class Restore {
  public toolsPath = '/tmp/appmap';

  constructor(public repository: string, public revision: string) {}

  async restore() {
    await executeCommand(
      `${this.toolsPath} restore --revision ${this.revision} --github-repo ${this.repository}`
    );
  }
}

import {executeCommand} from './executeCommand';

export default class Restore {
  public toolsPath = '/tmp/appmap';

  constructor(public revision: string) {}

  async restore() {
    await executeCommand(`${this.toolsPath} restore --revision ${this.revision}`);
  }
}

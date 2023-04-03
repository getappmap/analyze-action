import {exec} from 'child_process';
import log, {LogLevel} from './log';
import verbose from './verbose';

export function executeCommand(
  cmd: string,
  printCommand = false,
  printStdout = false,
  printStderr = false
): Promise<string> {
  if (printCommand || verbose()) console.log(cmd);
  const command = exec(cmd);
  const result: string[] = [];
  const stderr: string[] = [];
  if (command.stdout) {
    command.stdout.addListener('data', data => {
      if (printStdout || verbose()) log(LogLevel.Debug, data);
      result.push(data);
    });
  }
  if (command.stderr) {
    command.stderr.addListener('data', data => {
      if (printStderr || verbose()) log(LogLevel.Debug, data);
      stderr.push(data);
    });
  }
  return new Promise<string>((resolve, reject) => {
    command.addListener('exit', code => {
      if (code === 0) {
        resolve(result.join(''));
      } else {
        if (!printCommand) log(LogLevel.Warn, cmd);
        log(LogLevel.Warn, stderr.join(''));
        log(LogLevel.Warn, result.join(''));

        reject(new Error(`Command failed with code ${code}`));
      }
    });
  });
}

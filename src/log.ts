import * as core from '@actions/core';

export enum LogLevel {
  Debug = 'debug',
  Info = 'info',
  Warn = 'warn',
}

export interface Logger {
  debug(message: string): void;
  info(message: string): void;
  warn(message: string): void;
}

export class ActionLogger implements Logger {
  debug(message: string): void {
    core.debug(message);
  }

  info(message: string): void {
    core.info(message);
  }

  warn(message: string): void {
    core.warning(message);
  }
}

let Logger: Logger | undefined;

export function setLogger(logger: Logger) {
  Logger = logger;
}

export default function log(level: LogLevel, message: string) {
  if (!Logger) {
    if (message.endsWith('\n')) message = message.slice(0, -1);
    console[level](message);
    return;
  }

  Logger[level](message);
}

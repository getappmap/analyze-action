import Restore from './Restore';
import { fetchAllHistory, fetchInitialHistory } from './gitFetch';
import log, { LogLevel } from './log';

export default async function fetchAndRestore(restorer: Restore, sinceDays: number) {
  if (sinceDays > 0) {
    log(LogLevel.Debug, `Fetching ${sinceDays} days of repo history.`);
    // Get the last N days of history (it's configurable)
    await fetchInitialHistory(sinceDays);
  }

  let fetched = false;
  try {
    await restorer.restore();
    log(LogLevel.Debug, `restore succeeded`);
    fetched = true;
  } catch (e) {
    log(
      LogLevel.Warn,
      `Unable to restore AppMap archive with ${sinceDays} days of history. Will now fetch the full repo history.`
    );
    log(LogLevel.Debug, `Restore error: ${(e as any).toString()}`);
  }

  if (!fetched) {
    log(LogLevel.Info, `Fetching all repo history (--unshallow)`);
    await fetchAllHistory();
    await restorer.restore();
    log(LogLevel.Debug, `restore succeeded after unshallow fetch`);
  }
}

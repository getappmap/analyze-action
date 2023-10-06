import { readdir, stat } from 'node:fs/promises';
import { log, LogLevel, verbose } from '@appland/action-utils';
import { join } from 'node:path';

import ArtifactStore from './ArtifactStore';

const RunStatsDirectory = join('.appmap', 'run-stats');

export default async function uploadRunStats(store: ArtifactStore, retentionDays: number) {
  log(LogLevel.Info, 'Building the run stats artifact');
  try {
    const stats = await stat(RunStatsDirectory);
    if (!stats.isDirectory()) {
      throw new Error(`${RunStatsDirectory} is not a directory`);
    }
  } catch (e) {
    log(LogLevel.Warn, `The run stats directory (${RunStatsDirectory}) was not found`);
    if (verbose()) log(LogLevel.Warn, String(e));
    return;
  }

  const ents = await readdir(RunStatsDirectory, { withFileTypes: true });
  const statsFiles = ents
    .filter((ent) => ent.isFile() && ent.name.endsWith('.json'))
    .map((ent) => join(RunStatsDirectory, ent.name))
    .sort();

  if (statsFiles.length === 0) {
    log(LogLevel.Warn, 'No run stats files found, skipping upload');
    return;
  }

  try {
    await store.uploadArtifact('appmap-run-stats', statsFiles.slice(-1), retentionDays);
    console.info(`Success! Run stats have been uploaded.`);
  } catch (e) {
    log(LogLevel.Warn, 'Failed to upload run stats');
    if (verbose()) log(LogLevel.Warn, String(e));
  }
}

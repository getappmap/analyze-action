import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { chdir } from 'node:process';
import * as actionUtils from '@appland/action-utils';

import uploadRunStats from '../src/uploadRunStats';
import type ArtifactStore from '../src/ArtifactStore';

describe('uploadRunStats', () => {
  let tmpDir: string;
  let log: jest.SpyInstance;
  const artifactStore: ArtifactStore = {
    uploadArtifact: jest.fn(),
  };
  const cwd = process.cwd();

  beforeEach(async () => {
    tmpDir = await mkdtemp(join(tmpdir(), 'upload-run-stats-test-'));
    chdir(tmpDir);
    log = jest.spyOn(actionUtils, 'log');
  });

  afterEach(async () => {
    await rm(tmpDir, { recursive: true, force: true });
    jest.resetAllMocks();
    chdir(cwd);
  });

  let i = 0;
  const createRunStatsDir = () => mkdir(join('.appmap', 'run-stats'), { recursive: true });
  const createRunStatsFile = async (content: string, fileExt = '.json') => {
    const filePath = join('.appmap', 'run-stats', `${Date.now()}${i++}${fileExt}`);
    await writeFile(filePath, content);
    return filePath;
  };

  it('logs a warning if `.appmap/run-stats` does not exist', async () => {
    await expect(uploadRunStats(artifactStore)).resolves.toBeUndefined();
    expect(log).toHaveBeenCalledWith(
      actionUtils.LogLevel.Warn,
      'The run stats directory (.appmap/run-stats) was not found'
    );
    expect(artifactStore.uploadArtifact).not.toHaveBeenCalled();
  });

  it('does not upload any artifact if `.appmap/run-stats` is empty', async () => {
    await createRunStatsDir();
    await expect(uploadRunStats(artifactStore)).resolves.toBeUndefined();
    expect(log).toHaveBeenCalledWith(
      actionUtils.LogLevel.Warn,
      'No run stats files found, skipping upload'
    );
    expect(artifactStore.uploadArtifact).not.toHaveBeenCalled();
  });

  it('uploads the latest JSON file in `.appmap/run-stats`', async () => {
    const numFiles = 3;
    await createRunStatsDir();
    const files = await Promise.all(
      Array.from({ length: numFiles }).map(() => createRunStatsFile('{"foo": "bar"}'))
    );
    await expect(uploadRunStats(artifactStore)).resolves.toBeUndefined();
    expect(artifactStore.uploadArtifact).toHaveBeenCalledWith(
      'appmap-run-stats',
      files.sort().slice(-1)
    );
  });

  it('only uploads JSON files', async () => {
    await createRunStatsDir();
    const file = await createRunStatsFile('{"foo": "bar"}');
    await createRunStatsFile('{"foo": "bar"}', '.txt');
    await expect(uploadRunStats(artifactStore)).resolves.toBeUndefined();
    expect(artifactStore.uploadArtifact).toHaveBeenCalledWith('appmap-run-stats', [file]);
  });
});

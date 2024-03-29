import { cp, rm } from 'fs/promises';
import { join } from 'path';
import { glob } from 'glob';

import Restore from '../src/Restore';
import { verbose } from '@appland/action-utils';

const pwd = process.cwd();
const fixtureDir = join(__dirname, 'fixture');
const workDir = join(__dirname, 'work');

if (process.env.VERBOSE) verbose(true);

describe('restore', () => {
  beforeEach(async () => cp(fixtureDir, workDir, { recursive: true, force: true }));
  beforeEach(() => process.chdir(workDir));
  afterEach(() => process.chdir(pwd));
  afterEach(async () => rm(workDir, { recursive: true, force: true }));

  it('restores an AppMap archive', async () => {
    const restorer = new Restore('7a0f6c186dc69575bbca3a2a67605b6df17a7485', '.appmap/work');
    restorer.appmapCommand = './restore';
    await restorer.restore();

    const restoredFiles = (await glob('.appmap/work/**', {})).sort();
    expect(restoredFiles).toEqual([
      '.appmap/work',
      '.appmap/work/7a0f6c186dc69575bbca3a2a67605b6df17a7485',
      '.appmap/work/7a0f6c186dc69575bbca3a2a67605b6df17a7485/appmap_archive.json',
      '.appmap/work/7a0f6c186dc69575bbca3a2a67605b6df17a7485/appmaps.tar.gz',
    ]);
  });
});

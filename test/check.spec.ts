import {cp, rm} from 'fs/promises';
import {join} from 'path';
import verbose from '../src/verbose';
import {run as check} from '../src/check';
import { setLogger } from '../src/log';

const pwd = process.cwd();
const fixtureDir = join(__dirname, 'fixture');
const workDir = join(__dirname, 'work');

if (process.env.VERBOSE) verbose(true);

describe('check', () => {
  beforeEach(async () => cp(fixtureDir, workDir, {recursive: true, force: true}));
  beforeEach(() => process.chdir(workDir));
  afterEach(() => process.chdir(pwd));
  afterEach(async () => rm(workDir, {recursive: true, force: true}));

  it('reports test failures', async () => {
    const result = await check('.appmap/change-report/failure');
    expect(result).toEqual(['test/test_a.py:12: failed']);
  });

  it('returns undefined if no tests failed', async () => {
    const result = await check('.appmap/change-report/success');
    expect(result).toEqual(undefined);
  });
});

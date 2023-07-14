import fetchAndRestore from '../src/fetchAndRestore';
import * as executeCommand from '../src/executeCommand';
import * as now from '../src/now';
import Restore from '../src/Restore';
import verbose from '../src/verbose';
import {debug} from 'console';

if (process.env.VERBOSE) verbose(true);

describe('analyze', () => {
  let restorer: Restore;
  let nowFn: jest.SpyInstance;
  let restoreFn: jest.SpyInstance;
  let executeCommandFn: jest.SpyInstance;

  beforeEach(async () => {
    nowFn = jest.spyOn(now, 'default').mockReturnValue(new Date('2022-07-31T12:00:00Z'));
    restorer = new Restore('7a0f6c186dc69575bbca3a2a67605b6df17a7485', '.appmap/work');
    jest.spyOn(restorer, 'validate').mockReturnValue(undefined);
    restoreFn = jest.spyOn(restorer, 'restore');
    restoreFn.mockResolvedValue(undefined);
    executeCommandFn = jest.spyOn(executeCommand, 'executeCommand');
  });

  afterEach(async () => {
    jest.restoreAllMocks();
  });

  it('it can succeed after deepening the fetch', async () => {
    executeCommandFn.mockResolvedValue('ok');
    await fetchAndRestore(restorer, 7);
    expect(restoreFn).toHaveBeenCalledTimes(1);
    expect(executeCommandFn).toHaveBeenCalledTimes(1);
    expect(executeCommandFn).toHaveBeenCalledWith('git fetch --shallow-since 2022-07-24');
  });
  it('history fetching can be disabled', async () => {
    await fetchAndRestore(restorer, 0);
    expect(restoreFn).toHaveBeenCalledTimes(1);
    expect(executeCommandFn).not.toHaveBeenCalled();
  });

  describe('when the first restore fails', () => {
    beforeEach(async () => {
      restoreFn
        .mockRejectedValueOnce(new Error('No suitable archive found'))
        .mockResolvedValueOnce('ok');
    });

    it('fetches the full repo depth', async () => {
      await fetchAndRestore(restorer, 7);
      expect(restoreFn).toHaveBeenCalledTimes(2);
      expect(executeCommandFn).toHaveBeenCalledTimes(2);
      expect(executeCommandFn).toHaveBeenCalledWith('git fetch --shallow-since 2022-07-24');
      expect(executeCommandFn).toHaveBeenCalledWith('git fetch --unshallow', {
        allowedCodes: [0, 128],
        printCommand: false,
        printStderr: false,
        printStdout: false,
      });
    });
  });
});

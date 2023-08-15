import Archiver, { ArchiveDetector } from '../src/Archiver';
import ArtifactStore from '../src/ArtifactStore';
import verbose from '../src/verbose';
import * as executeCommand from '../src/executeCommand';

if (process.env.VERBOSE) verbose(true);

describe('archive', () => {
  afterEach(() => jest.restoreAllMocks());

  it('uses an existing archive', async () => {
    const artifactStore = {} as ArtifactStore;

    const findExistingArchives = jest.fn();
    findExistingArchives.mockReturnValueOnce(['.appmap/archive/full/the-revision.tar']);

    const archiver = new Archiver(artifactStore, 'the-revision');
    archiver.archiveDetector = { findExistingArchives } as ArchiveDetector;

    const result = await archiver.archive();

    expect(result).toEqual({ archiveFile: '.appmap/archive/full/the-revision.tar' });
    expect(findExistingArchives).toBeCalledTimes(1);
  });

  it('accepts threadCount option', async () => {
    const findExistingArchives = jest.fn();
    findExistingArchives.mockReturnValueOnce([]);
    findExistingArchives.mockReturnValueOnce(['.appmap/archive/full/the-revision.tar']);

    jest.spyOn(executeCommand, 'executeCommand').mockResolvedValue('');

    const uploadArtifact = jest.fn();
    const artifactStore = {
      uploadArtifact,
    } as ArtifactStore;

    uploadArtifact.mockResolvedValueOnce({});

    const archiver = new Archiver(artifactStore, 'the-revision');
    archiver.archiveDetector = { findExistingArchives } as ArchiveDetector;
    archiver.threadCount = 2;
    await archiver.archive();

    expect(findExistingArchives).toBeCalledTimes(2);

    expect(executeCommand.executeCommand).toHaveBeenCalledTimes(1);
    expect(executeCommand.executeCommand).toHaveBeenCalledWith(
      'appmap archive --revision the-revision --thread-count 2',
      { allowedCodes: [0], printCommand: false, printStderr: true, printStdout: true }
    );

    expect(uploadArtifact).toBeCalledTimes(1);
    expect(uploadArtifact).toBeCalledWith('appmap-archive-full_the-revision.tar', [
      '.appmap/archive/full/the-revision.tar',
    ]);
  });
});

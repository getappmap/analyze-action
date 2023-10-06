import * as artifact from '@actions/artifact';
import ArtifactStore from './ArtifactStore';

export class GitHubArtifactStore implements ArtifactStore {
  async uploadArtifact(name: string, files: string[], retentionDays: number): Promise<void> {
    const artifactClient = artifact.create();
    await artifactClient.uploadArtifact(name, files, process.cwd(), { retentionDays });
  }
}

export interface ArtifactStore {
  uploadArtifact(name: string, files: string[]): Promise<void>;
}

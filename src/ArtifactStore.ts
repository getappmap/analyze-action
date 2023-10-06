export default interface ArtifactStore {
  uploadArtifact(name: string, files: string[], retentionDays: number): Promise<void>;
}

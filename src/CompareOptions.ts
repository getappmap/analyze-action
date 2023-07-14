export default interface CompareOptions {
  baseRevision: string;
  headRevision: string;
  fetchHistoryDays: number;
  appmapCommand?: string;
  sourceDir?: string;
  githubToken?: string;
  githubRepo?: string;
}

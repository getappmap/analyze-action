export default interface CompareOptions {
  baseRevision: string;
  headRevision: string;
  fetchHistoryDays: number;
  retentionDays: number;
  appmapCommand?: string;
  sourceDir?: string;
  githubToken?: string;
  githubRepo?: string;
  threadCount?: number;
}

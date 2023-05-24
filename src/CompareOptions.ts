export default interface CompareOptions {
  baseRevision: string;
  headRevision: string;
  appmapCommand?: string;
  sourceDir?: string;
  githubToken?: string;
  githubRepo?: string;
}

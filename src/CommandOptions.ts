export interface CommandOptions {
  baseRef: string;
  headRef: string;
  appmapCommand?: string;
  baseDir?: string;
  sourceDir?: string;
  githubToken?: string;
  githubRepo?: string;
}

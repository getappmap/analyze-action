export interface CommandOptions {
  baseRef: string;
  headRef: string;
  appmapCommand?: string;
  basePath?: string;
  sourceDir?: string;
  githubToken?: string;
  githubRepo?: string;
}

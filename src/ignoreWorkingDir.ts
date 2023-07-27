import { readFile, writeFile } from 'fs/promises';

export default async function ignoreWorkingDir() {
  let gitIgnore: string;
  try {
    gitIgnore = await readFile('.gitignore', 'utf8');
    await updateGitIgnore(gitIgnore);
  } catch {
    await createGitIgnore();
  }
}

async function createGitIgnore() {
  await writeFile('.gitignore', ['.appmap', ''].join('\n'));
}

async function updateGitIgnore(gitIgnore: string) {
  const lines = gitIgnore.split('\n');
  if (lines.includes('.appmap')) return;

  lines.push('.appmap');
  await writeFile('.gitignore', lines.join('\n'));
}

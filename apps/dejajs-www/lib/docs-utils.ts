import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { globSync } from 'glob';

export const CONTENT_DIR = path.join(process.cwd(), 'content/docs');

export function getAllMdxFiles(): string[] {
  if (!fs.existsSync(CONTENT_DIR)) return [];
  return globSync('**/*.mdx', { cwd: CONTENT_DIR, ignore: ['plans/**'] });
}

export function getMdxFilePath(slugParams?: string[]): string | null {
  if (!slugParams || slugParams.length === 0) {
    const defaultPath = path.join(CONTENT_DIR, 'throttle/overview.mdx');
    return fs.existsSync(defaultPath) ? defaultPath : null;
  }

  const slugPath = slugParams.join('/');
  
  const pathsToTry = [
    path.join(CONTENT_DIR, `${slugPath}.mdx`),
    path.join(CONTENT_DIR, slugPath, 'overview.mdx'),
  ];

  for (const p of pathsToTry) {
    if (fs.existsSync(p)) return p;
  }

  return null;
}

export function parseMdx(filePath: string) {
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  return matter(fileContent);
}

// Convert a file path relative to CONTENT_DIR into a URL slug array
export function getSlugFromFile(file: string): string[] | null {
  let relativePath = file.replace(/\.mdx$/, '');
  
  // Rule: apps/{app}/overview -> [{app}]
  // Rule: {category}/overview -> [{category}]
  if (relativePath.endsWith('/overview')) {
    relativePath = relativePath.replace(/\/overview$/, '');
  }
  
  return relativePath.split('/');
}

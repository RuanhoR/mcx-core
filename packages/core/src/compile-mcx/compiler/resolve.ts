import { getFs } from '../../state';
import { extname, resolve, dirname, sep } from 'node:path';

export const RESOLVE_EXTS = ['.ts', '.mts', '.cts', '.js', '.mjs', '.cjs', ''];

// candidates must be real files: on Windows a directory passes access()
// and would shadow the index fallback below
export function resolveFileSync(filePath: string): string | null {
  const fs = getFs();
  for (const ext of RESOLVE_EXTS) {
    try {
      const fullPath = filePath + ext;
      if (fs.statSync(fullPath).isFile()) return fullPath;
    } catch {}
  }
  if (filePath.endsWith(sep) || !extname(filePath)) {
    for (const ext of RESOLVE_EXTS) {
      try {
        const fullPath = filePath + sep + 'index' + ext;
        if (fs.statSync(fullPath).isFile()) return fullPath;
      } catch {}
    }
  }
  return null;
}

export async function resolveFileAsync(filePath: string): Promise<string | null> {
  const fs = getFs().promises;
  for (const ext of RESOLVE_EXTS) {
    try {
      const fullPath = filePath + ext;
      if ((await fs.stat(fullPath)).isFile()) return fullPath;
    } catch {}
  }
  if (filePath.endsWith(sep) || !extname(filePath)) {
    for (const ext of RESOLVE_EXTS) {
      try {
        const fullPath = filePath + sep + 'index' + ext;
        if ((await fs.stat(fullPath)).isFile()) return fullPath;
      } catch {}
    }
  }
  return null;
}

export function resolveSync(
  specifier: string,
  importerPath: string,
): string | null {
  if (specifier.startsWith('.') || specifier.startsWith('/')) {
    const baseDir = dirname(importerPath);
    return resolveFileSync(resolve(baseDir, specifier));
  }
  try {
    return require.resolve(specifier, { paths: [dirname(importerPath)] });
  } catch {
    return null;
  }
}

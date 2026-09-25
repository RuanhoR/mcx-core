import { describe, it, expect, afterEach } from 'vitest';
import {
  resolveFileSync,
  resolveFileAsync,
  resolveSync,
} from '../src/compile-mcx/compiler/resolve';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { setGlobalFS } from '../src/state';
import * as nodeFs from 'node:fs';

setGlobalFS(nodeFs);

const tempDirs: string[] = [];

afterEach(() => {
  for (const dir of tempDirs.splice(0)) {
    rmSync(dir, { recursive: true, force: true });
  }
});

function makeTree(files: string[]): string {
  const dir = mkdtempSync(path.join(tmpdir(), 'mcx-resolve-'));
  tempDirs.push(dir);
  for (const file of files) {
    const full = path.join(dir, file);
    mkdirSync(path.dirname(full), { recursive: true });
    writeFileSync(full, 'export {};\n');
  }
  return dir;
}

describe('resolveFile directory index fallback', () => {
  it('resolveFileSync resolves a directory to its index.ts', () => {
    const dir = makeTree(['utils/index.ts', 'utils/message.ts']);
    const resolved = resolveFileSync(path.join(dir, 'utils'));
    expect(resolved).toBe(path.join(dir, 'utils', 'index.ts'));
  });

  it('resolveFileAsync resolves a directory to its index.ts', async () => {
    const dir = makeTree(['utils/index.ts', 'utils/message.ts']);
    const resolved = await resolveFileAsync(path.join(dir, 'utils'));
    expect(resolved).toBe(path.join(dir, 'utils', 'index.ts'));
  });

  it('prefers a plain .ts file over the directory name', () => {
    const dir = makeTree(['utils.ts', 'utils/index.ts']);
    expect(resolveFileSync(path.join(dir, 'utils'))).toBe(
      path.join(dir, 'utils.ts'),
    );
  });

  it('resolves extensionless files', () => {
    const dir = makeTree(['LICENSE']);
    expect(resolveFileSync(path.join(dir, 'LICENSE'))).toBe(
      path.join(dir, 'LICENSE'),
    );
  });

  it('returns null when nothing matches', async () => {
    const dir = makeTree(['a.ts']);
    expect(resolveFileSync(path.join(dir, 'missing'))).toBeNull();
    expect(await resolveFileAsync(path.join(dir, 'missing'))).toBeNull();
  });

  it('resolveSync resolves a directory relative to the importer', () => {
    const dir = makeTree(['src/utils/index.ts', 'src/entry.ts']);
    expect(resolveSync('./utils', path.join(dir, 'src', 'entry.ts'))).toBe(
      path.join(dir, 'src', 'utils', 'index.ts'),
    );
  });
});

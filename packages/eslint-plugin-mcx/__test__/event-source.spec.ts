import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import * as path from 'node:path';
import { describe, expect, it } from 'vitest';
import { loadEventLists } from '../src/event-source';

describe('loadEventLists', () => {
  it('extracts lists from the workspace @minecraft/server and caches them', () => {
    // other specs may already have warmed the per-cwd memo, so accept both a
    // fresh extraction (source = version) and a cache hit
    const first = loadEventLists(process.cwd());
    const req = createRequire(path.join(process.cwd(), 'package.json'));
    const serverDir = path.dirname(
      req.resolve('@minecraft/server/package.json'),
    );
    const version = JSON.parse(
      readFileSync(path.join(serverDir, 'package.json'), 'utf-8'),
    ).version as string;
    expect([version, `cache:${version}`]).toContain(first.source);
    expect(first.after.length).toBeGreaterThan(30);
    expect(first.before.length).toBeGreaterThan(5);
    expect(first.before).toContain('chatSend');
    expect(first.after).toContain('itemUse');

    // cache file exists under node_modules/.tmp with the same content
    const parsed = JSON.parse(
      readFileSync(
        path.join(
          process.cwd(),
          'node_modules',
          '.tmp',
          'eslint-plugin-mcx',
          `events-${version}.json`,
        ),
        'utf-8',
      ),
    ) as { version: string; after: string[] };
    expect(parsed.version).toBe(version);
    expect(parsed.after).toEqual(first.after);

    // repeated calls are memoized per cwd
    expect(loadEventLists(process.cwd())).toBe(first);
  });

  it('falls back to the bundled lists without @minecraft/server', () => {
    const bare = path.join(
      tmpdir(),
      `eslint-plugin-mcx-test-${process.pid}-${Date.now()}`,
    );
    mkdirSync(bare, { recursive: true });
    try {
      const lists = loadEventLists(bare);
      expect(lists.source).toBe('bundled');
      expect(lists.after.length).toBeGreaterThan(0);
      expect(lists.before.length).toBeGreaterThan(0);
    } finally {
      rmSync(bare, { recursive: true, force: true });
    }
  });

  it('picks up a stub @minecraft/server placed in a temp project', () => {
    const root = path.join(
      tmpdir(),
      `eslint-plugin-mcx-stub-${process.pid}-${Date.now()}`,
    );
    const pkgDir = path.join(root, 'node_modules', '@minecraft', 'server');
    mkdirSync(pkgDir, { recursive: true });
    writeFileSync(
      path.join(pkgDir, 'package.json'),
      JSON.stringify({ name: '@minecraft/server', version: '9.9.9-test' }),
    );
    writeFileSync(
      path.join(pkgDir, 'index.d.ts'),
      `export class WorldAfterEvents {
  readonly chatSend: ChatSendAfterEventSignal;
  readonly zOnlyInStub: SomeSignal;
}
export class WorldBeforeEvents {
  readonly playerLeave: PlayerLeaveBeforeEventSignal;
}`,
    );
    try {
      const lists = loadEventLists(root);
      expect(lists.source).toBe('9.9.9-test');
      expect(lists.after).toEqual(['chatSend', 'zOnlyInStub']);
      expect(lists.before).toEqual(['playerLeave']);
      // cached on disk for the next run
      const cacheFile = path.join(
        root,
        'node_modules',
        '.tmp',
        'eslint-plugin-mcx',
        'events-9.9.9-test.json',
      );
      expect(JSON.parse(readFileSync(cacheFile, 'utf-8')).version).toBe(
        '9.9.9-test',
      );
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});

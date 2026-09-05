import { describe, expect, it } from 'vitest';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import { mcxPlugin } from '../src/index.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const fixtureDir = path.join(here, 'fixture');

function makePlugin() {
  return mcxPlugin(
    {
      moduleDir: path.join(fixtureDir, 'modules'),
      tsconfigPath: path.join(fixtureDir, 'tsconfig.json'),
      sourcemap: false,
      ts,
    },
    { dist: fixtureDir, behavior: fixtureDir, resources: fixtureDir },
  );
}

// the inner plugin only uses this.error / this.warn from the hook context
const fakeCtx = { error: () => {}, warn: () => {} } as never;

function transform(plugin: ReturnType<typeof makePlugin>, code: string, id: string) {
  const hook = plugin.transform as { handler: (code: string, id: string) => unknown };
  return hook.handler.call(fakeCtx, code, id) as
    | { code: string | null; map?: unknown }
    | null
    | undefined;
}

describe('mcxPlugin wrapper', () => {
  it('leaves non-mcx modules alone', async () => {
    const plugin = makePlugin();
    expect(await transform(plugin, 'const a = 1;', '/x/foo.ts')).toBeNull();
    expect(await transform(plugin, 'const a = 1;', '/x/foo.js')).toBeNull();
  });

  it('compiles a .mcx module', async () => {
    const plugin = makePlugin();
    const source = await import('node:fs').then(fs =>
      fs.promises.readFile(path.join(fixtureDir, 'plain.mcx'), 'utf-8'),
    );
    const result = await transform(plugin, source, path.join(fixtureDir, 'plain.mcx'));
    expect(result?.code).toContain('export default');
  });

  it('recompiles when the same .mcx id changes content (watch mode)', async () => {
    const plugin = makePlugin();
    const id = path.join(fixtureDir, 'watch.mcx');
    const alpha = '<script lang="ts">\nconst alphaMarker = 1;\n</script>';
    const beta = '<script lang="ts">\nconst betaMarker = 2;\n</script>';
    const first = await transform(plugin, alpha, id);
    expect(first?.code).toContain('alphaMarker');
    const second = await transform(plugin, beta, id);
    expect(second?.code).toContain('betaMarker');
    expect(second?.code).not.toContain('alphaMarker');
  });

  it('resolves bare ids through the inner resolver', () => {
    const plugin = makePlugin();
    const resolved = plugin.resolveId as (
      id: string,
      importer?: string,
    ) => Promise<string | null>;
    // @mbler/mcx is a workspace package, so it resolves through the workspace
    // node_modules rather than the fixture's moduleDir stub
    return resolved('@mbler/mcx', path.join(fixtureDir, 'plain.mcx')).then(r => {
      expect(r).toBeTruthy();
      expect(r).toMatch(/index\.js$/);
    });
  });

  it('returns null instead of throwing for unresolvable bare ids', () => {
    const plugin = makePlugin();
    const resolved = plugin.resolveId as (
      id: string,
      importer?: string,
    ) => Promise<string | null>;
    return resolved('definitely-not-a-package-xyz', path.join(fixtureDir, 'plain.mcx')).then(r => {
      expect(r).toBeNull();
    });
  });
});

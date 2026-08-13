import { describe, it, expect } from 'vitest';
import { mkdtemp, mkdir, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { RunScript, execESMMethod } from '../src/mcx-component/vm';
import {
  MINECRAFT_MOCK,
  MINECRAFT_MOCK_SCOPE,
  createMock,
} from '../src/mcx-component/minecraftMock';

async function makeTempDir(): Promise<string> {
  return mkdtemp(join(tmpdir(), 'mcx-vm-'));
}

async function writeModule(
  dir: string,
  relPath: string,
  content: string,
): Promise<void> {
  const target = join(dir, relPath);
  await mkdir(join(target, '..'), { recursive: true });
  await writeFile(target, content);
}

describe('RunScript: @minecraft/* fallback mock', () => {
  it('should resolve @minecraft/server even when not installed', async () => {
    const dir = await makeTempDir();
    const run = new RunScript(join(dir, 'entry.ts'), 'esm');
    const exports = (await run.run(
      `import { ItemStack, EquipmentSlot } from '@minecraft/server'; exports.value = new ItemStack('xian:test', 1).typeId; exports.slot = EquipmentSlot.Mainhand; exports.world = typeof require('@minecraft/server').world;`,
      execESMMethod.transformCjs,
    )) as Record<string, unknown>;
    expect(exports).toBeDefined();
    expect(exports.slot).toBeDefined();
    expect(exports.world).toBe('function');
  });

  it('should not throw for any @minecraft/* namespace', async () => {
    const dir = await makeTempDir();
    const run = new RunScript(join(dir, 'entry.ts'), 'esm');
    const exports = (await run.run(
      `import { world } from '@minecraft/server-ui'; exports.value = world.foo.bar;`,
      execESMMethod.transformCjs,
    )) as Record<string, unknown>;
    expect(exports.value).toBeDefined();
  });
});

describe('RunScript: nested relative module resolution', () => {
  it('should resolve relative imports against the importing module, not the entry', async () => {
    const dir = await makeTempDir();
    await writeModule(
      dir,
      'a.ts',
      `import { b } from './sub/b'; exports.a = b;`,
    );
    await writeModule(
      dir,
      'sub/b.ts',
      `import { c } from './sub/c'; exports.b = 'b:' + c;`,
    );
    await writeModule(dir, 'sub/sub/c.ts', `exports.c = 'c';`);

    const run = new RunScript(join(dir, 'a.ts'), 'esm');
    const exports = (await run.run(
      `import { a } from './a'; exports.result = a;`,
      execESMMethod.transformCjs,
    )) as Record<string, unknown>;
    expect(exports.result).toBe('b:c');
  });

  it('should resolve nested imports relative to each ts file directory', async () => {
    const dir = await makeTempDir();
    await writeModule(dir, 'config/index.ts', `export * from './gongfa';`);
    await writeModule(
      dir,
      'config/gongfa.ts',
      `export const GONGFA = 'gongfa:' + require('./util').v;`,
    );
    await writeModule(dir, 'config/util.ts', `exports.v = 'util';`);

    const run = new RunScript(join(dir, 'entry.ts'), 'esm');
    const exports = (await run.run(
      `import { GONGFA } from './config/index'; exports.value = GONGFA;`,
      execESMMethod.transformCjs,
    )) as Record<string, unknown>;
    expect(exports.value).toBe('gongfa:util');
  });
});

describe('minecraftMock', () => {
  it('should return stubs for arbitrary member access', () => {
    const value = (
      (
        (MINECRAFT_MOCK as Record<string, unknown>).world as Record<
          string,
          unknown
        >
      ).system as Record<string, unknown>
    ).run;
    expect(typeof value).toBe('function');
  });

  it('should be constructible', () => {
    const ItemStack = (MINECRAFT_MOCK as Record<string, unknown>).ItemStack;
    const instance = new (ItemStack as new () => unknown)();
    expect(instance).toBeDefined();
  });

  it('should expose a scope prefix', () => {
    expect(MINECRAFT_MOCK_SCOPE).toBe('@minecraft/');
  });

  it('createMock should return a fresh standalone stub', () => {
    const a = createMock();
    const b = createMock();
    expect(a).not.toBe(b);
    expect((a as { x: unknown }).x).toBeDefined();
  });
});

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import * as vm from 'node:vm';
import { ModuleResolver } from '../src/mcx-component/moduleResolver';

function createVmContext(): vm.Context {
  const ctx: vm.Context = Object.create(null);
  const exports = {};
  Object.assign(ctx, {
    exports,
    module: {
      exports,
      filename: __filename,
      path: __dirname,
      id: __filename,
    },
    require: undefined as any,
    global: ctx,
  });
  return vm.createContext(ctx);
}

describe('ModuleResolver', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = mkdtempSync(join(tmpdir(), 'mcx-test-'));
  });

  afterEach(() => {
    rmSync(tmpDir, { recursive: true, force: true });
  });

  it('should resolve and transpile a .ts file to CJS and return its exports', () => {
    const resolver = new ModuleResolver({});
    const tsPath = join(tmpDir, 'helper.ts');
    writeFileSync(
      tsPath,
      [
        'export function greet(name: string): string {',
        '  return "Hello, " + name;',
        '}',
        'export const version: number = 42;',
      ].join('\n'),
      'utf-8',
    );

    const context = createVmContext();
    const mod = resolver.ensureModule(tsPath, tmpDir, context);

    expect(mod).toBeDefined();
    expect((mod as any).greet('World')).toBe('Hello, World');
    expect((mod as any).version).toBe(42);
  });

  it('should transpile default exports correctly', () => {
    const resolver = new ModuleResolver({});
    const tsPath = join(tmpDir, 'greeter.ts');
    writeFileSync(
      tsPath,
      [
        'class DefaultGreeter {',
        '  greet() { return "Hi!"; }',
        '}',
        'export default DefaultGreeter;',
      ].join('\n'),
      'utf-8',
    );

    const context = createVmContext();
    const mod = resolver.ensureModule(tsPath, tmpDir, context);

    expect(mod).toBeDefined();
    const GreeterClass = (mod as any).default;
    const instance = new GreeterClass();
    expect(instance.greet()).toBe('Hi!');
  });

  it('should cache compiled modules and not re-transpile', () => {
    let callCount = 0;
    const tsPath = join(tmpDir, 'counter.ts');
    writeFileSync(
      tsPath,
      `export const value = ${++callCount};`,
      'utf-8',
    );

    const resolver = new ModuleResolver({});
    const context = createVmContext();

    const mod1 = resolver.ensureModule(tsPath, tmpDir, context);
    expect((mod1 as any).value).toBe(1);

    // Modify the file — cache should prevent seeing the new value
    writeFileSync(
      tsPath,
      `export const value = ${++callCount};`,
      'utf-8',
    );

    const mod2 = resolver.ensureModule(tsPath, tmpDir, context);
    expect((mod2 as any).value).toBe(1); // cached, still 1
    expect(callCount).toBe(2);
  });

  it('should handle relative imports in transpiled code', () => {
    const resolver = new ModuleResolver({});
    const utilsPath = join(tmpDir, 'utils.ts');
    writeFileSync(
      utilsPath,
      'export const add = (a: number, b: number): number => a + b;',
      'utf-8',
    );

    const mainPath = join(tmpDir, 'main.ts');
    writeFileSync(
      mainPath,
      ['import { add } from "./utils";', 'export const result = add(3, 4);'].join(
        '\n',
      ),
      'utf-8',
    );

    const context = createVmContext();
    const require = (id: string) => {
      if (
        id.endsWith('.ts') ||
        id.endsWith('.mts') ||
        id.endsWith('.cts') ||
        id.startsWith('.')
      ) {
        const importer =
          (context.module as { filename?: string })?.filename || mainPath;
        return resolver.ensureModule(id, importer, context);
      }
      throw new Error(`Cannot resolve ${id}`);
    };
    context.require = require;

    const mod = resolver.ensureModule(mainPath, tmpDir, context);

    expect(mod).toBeDefined();
    expect((mod as any).result).toBe(7);
  });
});

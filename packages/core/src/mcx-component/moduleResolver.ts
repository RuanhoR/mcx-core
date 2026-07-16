import { readFileSync } from 'node:fs';
import { extname, resolve, dirname, sep } from 'node:path';
import * as vm from 'node:vm';
import type { CompilerOptions } from 'typescript';
import ts from 'typescript';

const TS_EXTS = new Set(['.ts', '.mts', '.cts']);
const NON_JS_EXTS = new Set(['.ts', '.mts', '.cts', '.tsx']);

export class ModuleResolver {
  private cache = new Map<string, string>();
  private loadingModules = new Set<string>();
  private tsconfigOptions: ts.CompilerOptions;

  constructor(tsconfigOptions: ts.CompilerOptions) {
    this.tsconfigOptions = tsconfigOptions;
  }

  getCache() {
    return this.cache;
  }

  clear() {
    this.cache.clear();
    this.loadingModules.clear();
  }

  ensureModule(
    specifier: string,
    importerPath: string,
    context: vm.Context,
  ): unknown {
    const resolved = this.resolveSync(specifier, importerPath);
    if (!resolved) {
      throw new Error(
        `[mcx component]: cannot resolve '${specifier}' from '${importerPath}'`,
      );
    }

    if (this.cache.has(resolved)) {
      return this.executeInContext(resolved, context);
    }

    if (this.loadingModules.has(resolved)) {
      return context.exports;
    }
    this.loadingModules.add(resolved);

    try {
      const code = readFileSync(resolved, 'utf-8');
      const ext = extname(resolved);
      const compiled = TS_EXTS.has(ext)
        ? this.transformModule(code, resolved)
        : code;

      this.cache.set(resolved, compiled);
      return this.executeInContext(resolved, context);
    } finally {
      this.loadingModules.delete(resolved);
    }
  }

  private resolveSync(specifier: string, importerPath: string): string | null {
    if (specifier.startsWith('.') || specifier.startsWith('/')) {
      const baseDir = dirname(importerPath);
      return this.tryResolvePath(resolve(baseDir, specifier));
    }
    try {
      return require.resolve(specifier, { paths: [dirname(importerPath)] });
    } catch {
      return null;
    }
  }

  private tryResolvePath(filePath: string): string | null {
    const exts = ['.ts', '.mts', '.cts', '.js', '.mjs', '.cjs', ''];
    for (const ext of exts) {
      try {
        const fullPath = filePath + ext;
        readFileSync(fullPath);
        return fullPath;
      } catch {}
    }
    if (filePath.endsWith(sep) || !extname(filePath)) {
      for (const ext of exts) {
        try {
          const fullPath = filePath + '/index' + ext;
          readFileSync(fullPath);
          return fullPath;
        } catch {}
      }
    }
    return null;
  }

  private transformModule(code: string, fileName: string): string {
    return ts.transpileModule(code, {
      compilerOptions: {
        ...this.tsconfigOptions,
        module: ts.ModuleKind.CommonJS,
      },
      fileName,
    }).outputText;
  }

  private executeInContext(resolvedPath: string, context: vm.Context): unknown {
    const compiled = this.cache.get(resolvedPath)!;
    const script = new vm.Script(compiled, { filename: resolvedPath });

    const savedExports = context.exports;
    const savedModule = context.module;

    const childExports = {};
    const childModule = {
      exports: childExports,
      filename: resolvedPath,
      path: dirname(resolvedPath),
      id: resolvedPath,
    };

    context.exports = childExports;
    context.module = childModule;

    try {
      script.runInContext(context);
      return context.exports;
    } finally {
      context.exports = savedExports;
      context.module = savedModule;
    }
  }
}

export function isNonJSRequire(id: string): boolean {
  const ext = extname(id).toLowerCase();
  return NON_JS_EXTS.has(ext);
}

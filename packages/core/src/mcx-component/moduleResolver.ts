import { readFileSync } from 'node:fs';
import { dirname } from 'node:path';
import * as vm from 'node:vm';
import { resolveSync as sharedResolve } from '../compile-mcx/compiler/resolve';

export type FileTransformFn = (code: string, id: string) => string;

export class ModuleResolver {
  private cache: Map<string, string>;
  private loadingModules = new Set<string>();
  private transformFile: FileTransformFn;

  constructor(
    cache: Map<string, string>,
    transformFile: FileTransformFn,
  ) {
    this.cache = cache;
    this.transformFile = transformFile;
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
    nativeRequire?: (id: string) => unknown,
  ): unknown {
    if (nativeRequire) {
      try {
        return nativeRequire(specifier);
      } catch {
        // fall through to custom resolution
      }
    }

    const resolved = sharedResolve(specifier, importerPath);
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
      const compiled = this.transformFile(code, resolved);

      this.cache.set(resolved, compiled);
      return this.executeInContext(resolved, context);
    } finally {
      this.loadingModules.delete(resolved);
    }
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

export function createImageTransformCode(
  absolutePath: string,
  ext: string,
): string {
  const componentMap: Record<string, string> = {
    '.png': 'PNGImageComponent',
    '.svg': 'SVGImageComponent',
    '.jpg': 'JPGImageComponent',
    '.jpeg': 'JPGImageComponent',
    '.gif': 'GIFImageComponent',
  };
  const className = componentMap[ext.toLowerCase()];
  if (!className) {
    throw new Error(
      `[mcx component]: unsupported image extension '${ext}' for '${absolutePath}'`,
    );
  }
  return [
    `Object.defineProperty(exports, '__esModule', { value: true });`,
    `const { ${className} } = require('@mbler/mcx-component');`,
    `const path = require('node:path');`,
    `exports.default = new ${className}(${JSON.stringify(absolutePath)});`,
  ].join('\n');
}

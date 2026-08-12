import * as Module from 'node:module';
import * as vm from 'node:vm';
import { Buffer } from 'node:buffer';
import * as t from '@babel/types';
import { transformESMToCJS } from './cjsTransform';
import { resolveSync } from '../compile-mcx/compiler/resolve';
import ts from 'typescript';
import { readFileSync } from 'node:fs';
import { extname } from 'node:path';
import {
  createImageTransformCode,
  IMAGE_EXTS,
} from '../compile-mcx/compiler/image';
import { MINECRAFT_MOCK, MINECRAFT_MOCK_SCOPE } from './minecraftMock';
// Enumerate the methods for converting ESM to CJS
export enum execESMMethod {
  transformCjs = 0,
  runInVm = 1,
  importESM = 2,
}

export class RunScript {
  private _context;
  constructor(
    public filePath: string = '<repl>',
    public module: 'esm' | 'cjs' = 'cjs',
  ) {
    this._context = this.getContext();
  }
  /**
   * run code in nodejs vm
   * @param code {string} exetuce code
   * @returns code exports
   */
  public async run(
    code: string,
    esmExecMethod: execESMMethod = execESMMethod.transformCjs,
    transformCjsHook?: (
      data: t.CallExpression | t.MemberExpression,
      setData?: (newData: t.Expression) => void,
    ) => void,
  ): Promise<unknown> {
    if (this.module === 'esm') {
      if (esmExecMethod == execESMMethod.importESM) {
        const processedCode = code;
        const dataUrl = `data:application/javascript;base64,${Buffer.from(processedCode).toString('base64')}`;
        return await import(dataUrl);
      } else if (esmExecMethod == execESMMethod.transformCjs) {
        const compiledCode = transformESMToCJS(code, transformCjsHook);
        const script = new vm.Script(compiledCode, { filename: this.filePath });
        const rel = script.runInContext(this._context);
        return this._context.exports || rel;
      } else if (esmExecMethod == execESMMethod.runInVm) {
        if (typeof vm.SourceTextModule !== 'function') {
          throw new Error('[exec esm]: not support vm.SourceTextModule');
        } else {
          const script = new vm.SourceTextModule(code, {
            context: this._context,
          });
          await script.link(async specifier => {
            return new vm.SourceTextModule(specifier, {
              context: this._context,
            });
          });
          await script.evaluate();
          return script.namespace;
        }
      }
    } else {
      const script = new vm.Script(code, { filename: this.filePath });
      const rel = script.runInContext(this._context);
      return this._context.exports || rel;
    }
  }
  private proxyRequire(origin: typeof require, basePath: string = this.filePath) {
    return (id: string) => {
      const resolved = resolveSync(id, basePath);
      if (!resolved) {
        if (id.startsWith(MINECRAFT_MOCK_SCOPE)) {
          return MINECRAFT_MOCK;
        }
        throw new TypeError('Cannot find module ' + id);
      }
      if (
        resolved?.endsWith('.js') ||
        resolved?.endsWith('.mjs') ||
        resolved?.endsWith('.cjs')
      ) {
        return origin(resolved);
      } else {
        if (
          resolved?.endsWith('.ts') ||
          resolved?.endsWith('.mts') ||
          resolved?.endsWith('.cts')
        ) {
          const transformed = ts.transpileModule(
            readFileSync(resolved, 'utf-8'),
            {
              compilerOptions: {
                target: ts.ScriptTarget.ES2024,
                module: ts.ModuleKind.ESNext,
              },
            },
          ).outputText;
          const compiledCode = transformESMToCJS(transformed);
          const context = this.createModuleContext(resolved);
          const script = new vm.Script(compiledCode, { filename: resolved });
          const rel = script.runInContext(context);
          return context.module.exports || rel;
        } else {
          const ext = extname(resolved as string);
          if (IMAGE_EXTS.has(ext)) {
            const transformed = createImageTransformCode(
              resolved as string,
              ext,
            );
            const context = this.createModuleContext(resolved);
            const script = new vm.Script(transformed, {
              filename: resolved as string,
            });
            const rel = script.runInContext(context);
            return context.module.exports || rel;
          }
        }
      }
      throw new TypeError('Unknown File ' + resolved);
    };
  }
  private createModuleContext(basePath: string): vm.Context {
    const exports = {};
    const module = {
      exports,
      filename: basePath,
      path: basePath,
      paths: require.resolve.paths(basePath) || [],
      id: basePath,
    };
    return vm.createContext({
      exports,
      module,
      require: this.proxyRequire(Module.createRequire(basePath), basePath),
    });
  }
  private getContext(): vm.Context {
    // CJS context setup
    const exports = {};
    const module = {
      exports,
      filename: this.filePath,
      path: this.filePath,
      paths: require.resolve.paths(this.filePath) || [],
      id: this.filePath,
    };

    return vm.createContext({
      exports,
      module,
      require: this.proxyRequire(Module.createRequire(this.filePath)),
    });
  }
  public static isCanUseEsmRunVm = typeof vm.SourceTextModule == 'function';
}
export { transformESMToCJS };

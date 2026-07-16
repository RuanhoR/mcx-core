import * as Module from 'node:module';
import * as vm from 'node:vm';
import { Buffer } from 'node:buffer';
import * as t from '@babel/types';
import { parse } from '@babel/parser';
import * as generator from '@babel/generator';
import { transformESMToCJS } from './cjsTransform';
import { ModuleResolver, isNonJSRequire } from './moduleResolver';
const BLOCKED_MODULES = new Set([
  'child_process',
  'node:child_process',
  'fs',
  'node:fs',
  'node:fs/promises',
  'worker_threads',
  'node:worker_threads',
  'cluster',
  'node:cluster',
  'dgram',
  'node:dgram',
  'net',
  'node:net',
  'tls',
  'node:tls',
  'tty',
  'node:tty',
  'v8',
  'node:v8',
  'vm',
  'node:vm',
  'async_hooks',
  'node:async_hooks',
  'diagnostics_channel',
  'node:diagnostics_channel',
]);
// Enumerate the methods for converting ESM to CJS
export enum execESMMethod {
  transformCjs = 0,
  runInVm = 1,
  importESM = 2,
}

export class RunScript {
  private _context;
  private _module;
  private _pluginContext;
  private _moduleResolver: ModuleResolver | undefined;
  constructor(
    public filePath: string = '<repl>',
    public module: 'esm' | 'cjs' = 'cjs',
    private pluginContext?: Record<string, string | null | boolean | number>,
  ) {
    this._module = new Module.Module(this.filePath);
    this._pluginContext = pluginContext || {};
    this._context = this.getContext(this._pluginContext);
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
    moduleResolver?: ModuleResolver,
  ): Promise<unknown> {
    if (moduleResolver) {
      this._moduleResolver = moduleResolver;
    }
    // When moduleResolver is available, update the context's require to handle
    // non-JS modules (e.g. TypeScript files) through the shared transform pipeline.
    if (this._moduleResolver && this.module === 'esm') {
      this._context.require = this._createEnhancedRequire(
        this._moduleResolver,
        this._context,
        this.filePath,
      );
    }
    if (this.module === 'esm') {
      if (esmExecMethod == execESMMethod.importESM) {
        let processedCode = code;

        if (this.pluginContext) {
          const ast = parse(code, {
            sourceType: 'module',
            plugins: ['typescript', 'jsx'],
          });
          const contextDefines = Object.entries(this.pluginContext).map(
            ([key, value]): t.VariableDeclarator =>
              t.variableDeclarator(
                t.identifier(key),
                typeof value == 'string'
                  ? t.stringLiteral(value)
                  : typeof value == 'boolean'
                    ? t.booleanLiteral(value)
                    : typeof value == 'number'
                      ? t.numericLiteral(value)
                      : t.nullLiteral(),
              ),
          );
          const contextDeclaration = t.variableDeclaration(
            'var',
            contextDefines,
          );
          ast.program.body.unshift(contextDeclaration);
          processedCode = generator.generate(ast).code;
        }
        const dataUrl = `data:application/javascript;base64,${Buffer.from(processedCode).toString('base64')}`;
        return await import(dataUrl);
      } else if (esmExecMethod == execESMMethod.transformCjs) {
        const compiledCode = transformESMToCJS(
          code,
          this.pluginContext,
          transformCjsHook,
        );
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
  private getContext(pluginContext?: Record<string, unknown>): vm.Context {
    const context: vm.Context = Object.create(pluginContext || null);
    // CJS context setup
    const exports = {};
    const module = {
      exports,
      filename: this.filePath,
      path: this.filePath,
      paths: require.resolve.paths(this.filePath) || [],
      id: this.filePath,
    };
    const originalRequire = Module.createRequire
      ? Module.createRequire(this.filePath)
      : require;
    const restrictedRequire = new Proxy(originalRequire, {
      apply(target, thisArg, args) {
        const id = args[0];
        if (typeof id === 'string' && BLOCKED_MODULES.has(id)) {
          throw new Error(
            `[mcx component]: require('${id}') is not allowed in component scripts`,
          );
        }
        return Reflect.apply(target, thisArg, args);
      },
    });
    Object.assign(context, {
      exports,
      module,
      require: restrictedRequire,
      global: context,
    });
    return vm.createContext(context);
  }
  /**
   * Create an enhanced require proxy that intercepts non-JS module requests
   * and loads them through the ModuleResolver's transform pipeline (TS→JS, etc).
   * For JS files and Node built-ins, it delegates to the original require.
   */
  private _createEnhancedRequire(
    moduleResolver: ModuleResolver,
    context: vm.Context,
    importerPath: string,
  ): { (id: string): unknown; resolve: { (id: string): string; paths: (request: string) => string[] | null } } {
    const originalRequire = Module.createRequire
      ? Module.createRequire(importerPath)
      : require;
    return new Proxy(originalRequire, {
      apply(target, thisArg, args) {
        const id = args[0];
        if (typeof id === 'string' && BLOCKED_MODULES.has(id)) {
          throw new Error(
            `[mcx component]: require('${id}') is not allowed in component scripts`,
          );
        }
        // Route through ModuleResolver for:
        // 1. Explicit non-JS extensions (.ts, .mts, .cts)
        // 2. All relative/absolute paths (which may need extension resolution after TS transpilation)
        if (
          typeof id === 'string' &&
          (isNonJSRequire(id) || id.startsWith('.') || id.startsWith('/'))
        ) {
          const currentImporter =
            (context.module as { filename?: string })?.filename || importerPath;
          return moduleResolver.ensureModule(id, currentImporter, context);
        }
        return Reflect.apply(target, thisArg, args);
      },
    });
  }
  public static isCanUseEsmRunVm = typeof vm.SourceTextModule == 'function';
}
export { transformESMToCJS };

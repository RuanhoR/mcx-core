import type { Plugin, TransformResult } from 'rollup';
import type { Plugin as RolldownPlugin } from 'rolldown';
import { CompileOpt } from '../types';
import { extname } from 'node:path';
import { CompileError, compileMCXFn } from '.';
import { transform } from '../../transforms';
import type { MCXCompileData } from './compileData';
import { readFile } from 'node:fs/promises';
import MagicString from 'magic-string';
import * as path from 'node:path';
import { createRequire } from 'node:module';
import { transformCtx } from '../../types';
import ts from 'typescript';
import { readFileSync } from 'node:fs';
import {
  generateItemTextureJson,
  clearCachedOptions,
} from '../../mcx-component';
import {
  ModuleResolver,
  createImageTransformCode,
} from '../../mcx-component/moduleResolver';

const IMAGE_EXTS = new Set(['.png', '.svg', '.jpg', '.jpeg', '.gif']);

function createMcxPlugin(opt: CompileOpt, output: transformCtx['output']) {
  let cache: Map<string, MCXCompileData> = new Map();
  let moduleTransformCache: Map<string, string>;
  let moduleResolver: ModuleResolver;
  let tsconfig: ts.ParsedCommandLine;
  try {
    const configResult = ts.readConfigFile(opt.tsconfigPath, path => {
      try {
        return readFileSync(path, 'utf-8');
      } catch (error) {
        throw new Error(
          `Failed to read TypeScript config file at ${path}: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    });

    if (configResult.error) {
      throw new Error(
        `TypeScript configuration error: ${configResult.error.messageText}`,
      );
    }

    if (!configResult.config) {
      throw new Error(
        `Empty TypeScript configuration file at ${opt.tsconfigPath}`,
      );
    }

    const parsedConfig = ts.parseJsonConfigFileContent(
      configResult.config,
      ts.sys,
      path.dirname(opt.tsconfigPath),
      undefined,
      opt.tsconfigPath,
    );

    if (parsedConfig.errors.length > 0) {
      const errorMessages = parsedConfig.errors
        .map(err => err.messageText)
        .join('\n');
      throw new Error(
        `TypeScript configuration parsing errors:\n${errorMessages}`,
      );
    }

    tsconfig = parsedConfig;
  } catch (error) {
    console.warn(
      `Failed to load TypeScript config from ${opt.tsconfigPath}: ${error instanceof Error ? error.message : String(error)}`,
    );
    console.warn('Using default TypeScript configuration');
    tsconfig = {
      options: {},
      fileNames: [],
      errors: [],
    };
  }
  const resolveExtensions = ['', '.ts', '.mts', '.cts', '.js', '.mjs', '.cjs'];
  const indexExtensions = resolveExtensions.map(ext => '/index' + ext);

  async function tryResolvePath(filePath: string): Promise<string | null> {
    for (const idxExt of indexExtensions) {
      try {
        const fullPath = filePath + idxExt;
        await readFile(fullPath, 'utf-8');
        return fullPath;
      } catch {}
    }
    for (const ext of resolveExtensions) {
      try {
        const fullPath = filePath + ext;
        await readFile(fullPath, 'utf-8');
        return fullPath;
      } catch {}
    }
    return null;
  }

  async function resolvePackageExports(
    pkgDir: string,
    subPath: string,
    pkgJson: Record<string, unknown>,
  ): Promise<string | null> {
    const exports = pkgJson.exports;
    if (exports) {
      const subImport = subPath.startsWith('./') ? subPath : `./${subPath}`;
      if (typeof exports === 'object' && exports !== null) {
        const exp = exports as Record<string, unknown>;
        if (exp[subImport]) {
          const target = exp[subImport];
          if (typeof target === 'string') {
            return path.join(pkgDir, target);
          } else if (typeof target === 'object' && target !== null) {
            const targetObj = target as Record<string, unknown>;
            if (targetObj.import) {
              return path.join(pkgDir, targetObj.import as string);
            }
            return path.join(
              pkgDir,
              (targetObj.default as string) ||
                (Object.values(targetObj)[0] as string),
            );
          }
        }
        if (subImport.endsWith('/') || subImport.endsWith('/*')) {
          const dirMapping = subImport.slice(0, -1);
          for (const [key, value] of Object.entries(exp)) {
            if (key.startsWith(dirMapping) && key !== dirMapping) {
              const target = value as string;
              return path.join(pkgDir, target);
            }
          }
        }
      } else if (typeof exports === 'string') {
        return path.join(pkgDir, exports);
      }
    }
    return null;
  }

  return {
    name: 'mbler-mcx-core',
    async resolveId(id, imp) {
      const i = path.parse(id);
      if (i.dir.startsWith('.') || i.root) {
        if (imp) {
          const baseDir = path.dirname(imp);
          const resolved = await tryResolvePath(path.join(baseDir, id));
          if (resolved) return resolved;
        }
        return null;
      } else {
        if (imp) {
          try {
            const localRequire = createRequire(imp);
            const resolved = localRequire.resolve(id);
            if (resolved) return resolved;
          } catch {
            // fall through to manual resolution
          }
        }
        const isScopedPackage = id.startsWith('@');
        const parts = id.split('/');
        const pkgName = isScopedPackage
          ? `${parts[0]}/${parts[1]}`
          : (parts[0] as string);
        const subPath = isScopedPackage
          ? parts.slice(2).join('/')
          : parts.slice(1).join('/');
        const d = path.join(opt.moduleDir, pkgName);
        let pkgJson: Record<string, unknown>;
        try {
          pkgJson = JSON.parse(
            await readFile(path.join(d, 'package.json'), 'utf-8'),
          );
        } catch (err: unknown) {
          const nodeErr = err as { code?: string; message?: string };
          if (!nodeErr.code || nodeErr.code === 'ENOENT') {
            throw new Error(
              `[mcx resolveId]: package.json not found for '${id}' at '${d}'`,
            );
          } else {
            throw new Error(
              `[mcx resolveId]: invalid package.json for '${id}': ${nodeErr.message}`,
            );
          }
        }
        if (subPath) {
          const fromExports = await resolvePackageExports(d, subPath, pkgJson);
          if (fromExports) return fromExports;
          const fromDist = await tryResolvePath(
            path.join(d, './dist', subPath),
          );
          if (fromDist) return fromDist;
          const fromRoot = await tryResolvePath(path.join(d, subPath));
          if (fromRoot) return fromRoot;
          return null;
        }
        return path.join(d, pkgJson.main as string);
      }
    },
    transform: async function (
      code: string,
      id: string,
    ): Promise<TransformResult> {
      const magic = new MagicString(code);
      const ext = extname(id).slice(1);
      const tsRegex = /^.+?\.(ts|mts|cts)$/;
      if (ext == 'mcx') {
        let compileData: MCXCompileData;
        try {
          compileData = cache.has(id)
            ? (cache.get(id) as MCXCompileData)
            : compileMCXFn(code);
          cache.set(id, compileData);
        } catch (err: unknown) {
          if (err instanceof CompileError) {
            this.error(err.message, {
              column: err.loc.column,
              line: err.loc.line,
            });
          } else {
            this.error(
              err instanceof Error
                ? `${err.message} : ${err.stack}`
                : String(err),
            );
          }
          return;
        }
        compileData.setFilePath(id);
        const compiledCode = await transform(
          compileData,
          cache,
          id,
          this,
          opt,
          output,
          moduleResolver,
        );
        return {
          code: compiledCode,
          map: opt.sourcemap
            ? magic.generateMap({ hires: true, source: id })
            : void 0,
        };
      } else if (tsRegex.test(id)) {
        const cached = moduleTransformCache.get(id);
        if (cached) {
          return {
            code: cached,
            map: opt.sourcemap
              ? magic.generateMap({ hires: true, source: id })
              : void 0,
          };
        }
        const compiledCode = ts.transpileModule(code, {
          compilerOptions: tsconfig.options,
          fileName: id,
        }).outputText;
        moduleTransformCache.set(id, compiledCode);
        return {
          code: compiledCode,
          map: opt.sourcemap
            ? magic.generateMap({ hires: true, source: id })
            : void 0,
        };
      }
      return null;
    },
    async buildEnd() {
      cache.clear();
      moduleResolver?.clear();
      await generateItemTextureJson(output);
      clearCachedOptions();
    },
    buildStart() {
      cache = new Map();
      moduleTransformCache = new Map();
      const tsOptions = tsconfig.options;
      moduleResolver = new ModuleResolver(
        tsOptions,
        moduleTransformCache,
        (fileCode: string, fileId: string) => {
          const fileExt = extname(fileId).toLowerCase();
          if (IMAGE_EXTS.has(fileExt)) {
            return createImageTransformCode(fileId, fileExt);
          }
          return fileCode;
        },
      );
    },
  } satisfies Plugin;
}

export function rollupPlugin(
  opt: CompileOpt,
  output: transformCtx['output'],
): Plugin {
  return createMcxPlugin(opt, output);
}

export function rolldownPlugin(
  opt: CompileOpt,
  output: transformCtx['output'],
): RolldownPlugin {
  return createMcxPlugin(opt, output) as unknown as RolldownPlugin;
}

import type { Plugin } from 'rollup';
import type { Plugin as RolldownPlugin } from 'rolldown';
import { CompileOpt } from '../types';
import { extname } from 'node:path';
import { CompileError, compileMCXFn, clearCompileCaches } from '.';
import { transform } from '../../transforms';
import type { MCXCompileData } from './compileData';
import MagicString from 'magic-string';
import * as path from 'node:path';
import { createRequire } from 'node:module';
import { transformCtx } from '../../types';
import ts from 'typescript';
import { getFs } from '../../state';
import {
  generateItemTextureJson,
  generateTerrainTextureJson,
  clearCachedOptions,
} from '../../mcx-component';
import { resolveFileAsync } from './resolve';
import { createImageTransformCode, IMAGE_EXTS } from './image';
import { resetFileIdCounter } from '../../transforms/file_id';
function createMcxPlugin(
  opt: CompileOpt,
  output: transformCtx['output'],
): Plugin {
  let cache: Map<string, MCXCompileData> = new Map();
  let tsconfig: ts.ParsedCommandLine;
  try {
    const configResult = ts.readConfigFile(opt.tsconfigPath, path => {
      try {
        return getFs().readFileSync(path, 'utf-8');
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
    async resolveId(id: string, imp: string | undefined) {
      const i = path.parse(id);
      if (i.dir.startsWith('.') || i.root) {
        if (imp) {
          const baseDir = path.dirname(imp);
          const resolved = await resolveFileAsync(path.join(baseDir, id));
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
            await getFs().promises.readFile(path.join(d, 'package.json'), 'utf-8'),
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
          const fromDist = await resolveFileAsync(
            path.join(d, './dist', subPath),
          );
          if (fromDist) return fromDist;
          const fromRoot = await resolveFileAsync(path.join(d, subPath));
          if (fromRoot) return fromRoot;
          return null;
        }
        return path.join(d, pkgJson.main as string);
      }
    },
    async transform(code: string, id: string) {
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
        );
        return {
          code: compiledCode,
          ...(opt.sourcemap
            ? {
                map: new MagicString(code).generateMap({
                  hires: true,
                  source: id,
                }),
              }
            : {}),
        };
      }
      let compiledCode: string | null = null;
      if (tsRegex.test(id)) {
        compiledCode = ts.transpileModule(code, {
          compilerOptions: tsconfig.options,
          fileName: id,
        }).outputText;
      } else {
        const fileExt = extname(id).toLowerCase();
        if (IMAGE_EXTS.has(fileExt)) {
          compiledCode = createImageTransformCode(id, fileExt);
        }
      }
      if (compiledCode !== null) {
        return {
          code: compiledCode,
          ...(opt.sourcemap
            ? {
                map: new MagicString(code).generateMap({
                  hires: true,
                  source: id,
                }),
              }
            : {}),
        };
      }
      return null;
    },
    async buildEnd() {
      cache.clear();
      await generateItemTextureJson(output);
      await generateTerrainTextureJson(output);
      clearCachedOptions();
    },
    buildStart() {
      cache = new Map();
      clearCompileCaches();
      resetFileIdCounter();
    },
  };
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

import type { Plugin, TransformResult } from 'rollup';
import type { Plugin as RolldownPlugin } from 'rolldown';
import { CompileOpt } from '../types';
import { extname, isAbsolute, join } from 'node:path';
import { CompileError, compileMCXFn } from '.';
import { transform } from '../../transforms';
import type { MCXCompileData } from './compileData';
import { readFile, rm } from 'node:fs/promises';
import MagicString from 'magic-string';
import path from 'node:path';
import { transformCtx } from '../../types';
import ts from 'typescript';
import { readFileSync } from 'node:fs';
import {
  generateItemTextureJson,
  clearCachedOptions,
} from '../../mcx-component';
function createMcxPlugin(
  opt: CompileOpt,
  output: transformCtx['output'],
): Plugin {
  let cache: Map<string, MCXCompileData> = new Map();
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

    // Parse the configuration with proper path resolution
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
    // Fallback to default configuration if reading fails
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
    pkgJson: any,
  ): Promise<string | null> {
    const exports = pkgJson.exports;
    if (exports) {
      const subImport = subPath.startsWith('./') ? subPath : `./${subPath}`;
      if (typeof exports === 'object' && exports !== null) {
        if (exports[subImport]) {
          const target = exports[subImport];
          if (typeof target === 'string') {
            return path.join(pkgDir, target);
          } else if (typeof target === 'object' && target !== null) {
            if (target.import) {
              return path.join(pkgDir, target.import);
            }
            return path.join(
              pkgDir,
              target.default || (Object.values(target)[0] as string),
            );
          }
        }
        if (subImport.endsWith('/') || subImport.endsWith('/*')) {
          const dirMapping = subImport.slice(0, -1);
          for (const [key, value] of Object.entries(exports)) {
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
        const isScopedPackage = id.startsWith('@');
        const parts = id.split('/');
        const pkgName = isScopedPackage
          ? `${parts[0]}/${parts[1]}`
          : (parts[0] as string);
        const subPath = isScopedPackage
          ? parts.slice(2).join('/')
          : parts.slice(1).join('/');
        const d = path.join(opt.moduleDir, pkgName);
        let pkgJson: any;
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
        return path.join(d, pkgJson.main);
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
            const error: CompileError = err;
            this.error(error.message, {
              column: error.loc.column,
              line: error.loc.line,
            });
          }
          this.error(String(err));
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
          map: opt.sourcemap
            ? magic.generateMap({ hires: true, source: id })
            : void 0,
        };
      } else if (tsRegex.test(id)) {
        // Use the parsed TypeScript configuration
        const compiledCode = ts.transpileModule(code, {
          compilerOptions: tsconfig.options,
          fileName: id,
        }).outputText;
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
      await generateItemTextureJson(output);
      clearCachedOptions();
    },
    buildStart() {
      cache = new Map();
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

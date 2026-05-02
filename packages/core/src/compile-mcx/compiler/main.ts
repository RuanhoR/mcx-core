import { Plugin, TransformResult } from "rollup";
import { CompileOpt } from "../types";
import { extname, isAbsolute, join } from "node:path";
import { CompileError, compileMCXFn } from ".";
import { transform } from "../../transforms";
import type { MCXCompileData } from "./compileData";
import { readFile, rm } from "node:fs/promises";
import MagicString from "magic-string";
import path from "node:path";
import { transformCtx } from "../../types";
import * as ts from "typescript"
import { readFileSync } from "node:fs";
export function mcxPlugn(opt: CompileOpt, output: transformCtx["output"]): Plugin {
  let cache: Map<string, MCXCompileData> = new Map();
  let tsconfig: ts.ParsedCommandLine;
  try {
    const configResult = ts.readConfigFile(opt.tsconfigPath, (path) => {
      try {
        return readFileSync(path, "utf-8");
      } catch (error) {
        throw new Error(`Failed to read TypeScript config file at ${path}: ${error instanceof Error ? error.message : String(error)}`);
      }
    });

    if (configResult.error) {
      throw new Error(`TypeScript configuration error: ${configResult.error.messageText}`);
    }

    if (!configResult.config) {
      throw new Error(`Empty TypeScript configuration file at ${opt.tsconfigPath}`);
    }

    // Parse the configuration with proper path resolution
    const parsedConfig = ts.parseJsonConfigFileContent(
      configResult.config,
      ts.sys,
      path.dirname(opt.tsconfigPath),
      undefined,
      opt.tsconfigPath
    );

    if (parsedConfig.errors.length > 0) {
      const errorMessages = parsedConfig.errors.map(err => err.messageText).join('\n');
      throw new Error(`TypeScript configuration parsing errors:\n${errorMessages}`);
    }

    tsconfig = parsedConfig;
  } catch (error) {
    // Fallback to default configuration if reading fails
    console.warn(`Failed to load TypeScript config from ${opt.tsconfigPath}: ${error instanceof Error ? error.message : String(error)}`);
    console.warn('Using default TypeScript configuration');
    tsconfig = {
      options: {},
      fileNames: [],
      errors: []
    };
  }
  return {
    name: "mbler-mcx-core",
    async resolveId(id, imp) {
      const i = path.parse(id);
      // if is not a file path
      if (!i.root && !i.dir.startsWith(".")) {
        // read module package.json
        const d = path.join(opt.moduleDir, id);
        let pkgJson: any;
        try {
          pkgJson = JSON.parse(
            await readFile(path.join(d, "package.json"), "utf-8"),
          );
        } catch (err: any) {
          if (err.code === "ENOENT") {
            throw new Error(
              `[mcx resolveId]\: package.json not found for '${id}'`,
            );
          } else {
            throw new Error(
              `[mcx resolveId]\: invalid package.json for '${id}'`,
            );
          }
        }
        return path.join(d, pkgJson.main);
      } else if (imp) {
        return path.join(path.dirname(imp), id);
      }
      return null;
    },
    transform: async function (
      code: string,
      id: string,
    ): Promise<TransformResult> {
      const magic = new MagicString(code);
      const ext = extname(id).slice(1);
      const tsRegex = /^.+?\.(ts|mts|cts)$/
      if (ext == "mcx") {
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
        const compiledCode = await transform(compileData, cache, id, this, opt, output);
        return {
          code: compiledCode,
          map: opt.sourcemap ? magic.generateMap({ hires: true, source: id }) : void 0,
        };
      } else if (tsRegex.test(id)) {
        // Use the parsed TypeScript configuration
        const compiledCode = ts.transpileModule(code, {
          compilerOptions: tsconfig.options,
          fileName: id
        }).outputText;
        return {
          code: compiledCode,
          map: opt.sourcemap ? magic.generateMap({ hires: true, source: id }) : void 0
        };
      }
      return null;
    },
    buildEnd() {
      cache.clear();
    },
    buildStart() {
      cache = new Map()
    }
  };
}
function AbsoluteJoin(base: string, dir: string): string {
  return isAbsolute(dir) ? dir : join(base, dir);
}
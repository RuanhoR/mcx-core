import { Plugin, rollup, TransformResult } from "rollup";
import { CompileOpt } from "../types";
import * as t from "@babel/types";
import { extname, isAbsolute, join } from "node:path";
import { tmpdir } from "node:os";
import commjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import module_resolve from "@rollup/plugin-node-resolve";
import { CompileError, compileMCXFn } from ".";
import { transform } from "../../transforms";
import type { MCXCompileData } from "./compileData";
import { readFile, rm } from "node:fs/promises";
import MagicString from "magic-string";
import path from "node:path";
const cache: Map<string, MCXCompileData> = new Map();

function mcxPlugn(opt: CompileOpt): Plugin {
  return {
    name: "mbler-mcx-core",
    async resolveId(id, imp) {
      const i = path.parse(id);
      if (!i.root && !i.dir.startsWith(".")) {
        const d = path.join(opt.moduleDir, id);
        const code = JSON.parse(
          await readFile(path.join(d, "package.json"), "utf-8"),
        );
        return path.join(d, code.main);
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
      if (ext == "mcx") {
        let compileData: MCXCompileData;
        try {
          compileData = cache.has(id)
            ? (cache.get(id) as MCXCompileData)
            : compileMCXFn(code);
          cache.set(id, compileData);
        } catch (err: any) {
          if (err instanceof CompileError) {
            const error: CompileError = err;
            this.error(error.message, {
              column: error.loc.pos,
              line: error.loc.line,
            });
          }
          this.error(err.message);
          return;
        }
        compileData.setFilePath(id);
        return {
          code: await transform(compileData, cache, id, this, opt),
          map: magic.generateMap({ hires: true, source: id }),
        };
      }
      return null;
    },
  };
}
function AbsoluteJoin(base: string, dir: string): string {
  return isAbsolute(dir) ? dir : join(base, dir);
}
export default async function CompileProject(opt: CompileOpt) {
  const rollupResult = await rollup({
    input: opt.main,
    // only minecraft package
    external: ["@minecraft/server", "@minecraft/server-ui"],
    plugins: [
      mcxPlugn(opt),
      commjs(),
      json(),
      module_resolve({
        modulePaths: [opt.moduleDir],
      }),
    ],
  });
  // only index.js
  await rm(opt.output, {
    recursive: true,
  });
  await rollupResult.write({
    file: AbsoluteJoin(opt.output, "./index.js"),
    format: "esm",
    sourcemap: true,
  });
}

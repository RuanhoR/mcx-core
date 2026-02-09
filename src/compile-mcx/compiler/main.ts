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
import { rm } from "node:fs/promises";

function mcxPlugn(): Plugin {
  return {
    name: "mbler-mcx-core",
    async transform(code, id, options): Promise<TransformResult> {
      const ext = extname(id).slice(1);
      if (ext == "mcx") {
        let compileData: MCXCompileData;
        try {
          compileData = compileMCXFn(code);
        } catch (err: any) {
          if (err instanceof CompileError) {
            const error: CompileError = err;
            this.error(error.message, {
              column: error.loc.pos,
              line: error.loc.line,
            });
          };
          this.error(err.message);
          return;
        }
        compileData.setFilePath(id);
        return {
          code: await transform(compileData)
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
    input: AbsoluteJoin(opt.ProjectDir, opt.main),
    external: ["@minecraft/server", "@minecraft/server-ui"],
    plugins: [mcxPlugn(), commjs(), json(), module_resolve()],
  });
  await rm(opt.output, {
    recursive: true
  });
  await rollupResult.write({
    file: AbsoluteJoin(opt.output, "./index.js"),
    format: "esm",
    sourcemap: true
  });
}

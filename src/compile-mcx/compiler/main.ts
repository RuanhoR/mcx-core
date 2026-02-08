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

function mcxPlugn(): Plugin {
  return {
    name: "mbler-mcx-core",
    transform(code, id, options): TransformResult | Promise<TransformResult> {
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
          }
          this.error(err.message);
          return;
        }
        compileData.setFilePath(id);
        return transform(compileData);
      }
      return null;
    },
  };
}
function AbsoluteJoin(base: string, dir: string): string {
  return isAbsolute(dir) ? dir : join(base, dir);
}
export default async function CompileProject(opt: CompileOpt) {
  await rollup({
    input: AbsoluteJoin(opt.ProjectDir, opt.main),
    output: {
      file: join(opt.output, "index.js"),
      format: "esm",
    },
    external: ["@minecraft/server", "@minecraft/server-ui"],
    plugins: [mcxPlugn(), commjs(), json(), module_resolve()],
  });
}

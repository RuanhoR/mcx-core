import { CompileOpt } from "@mbler/mcx-types";
import { MCXCompileData } from "../compile-mcx/compiler/compileData";
import { CompileError } from "../compile-mcx/compiler";
import path from "node:path";
import { _MCXstructureLocComponentTypes } from "../compile-mcx/types";
function handlerPath(p: string, base: string): string {
  const dir = p.split("/");
  if (dir[0] && dir[0] in _MCXstructureLocComponentTypes) {
    return path.join(base, p);
  }
  throw new Error(`[component path]: path '${p}' is unreasonable. because root is not in '${Object.keys(_MCXstructureLocComponentTypes)}'`)
}
const cache: Map<CompileOpt, boolean> = new Map();
async function compileComponent(compileData: MCXCompileData, opt: CompileOpt) {
  const component =  compileData.strLoc.Component;
  if (cache.get(opt)) {
    throw new CompileError("[compile comonent]: can't load two and more component mcx in same project", {
      pos: 1,
      line: 1
    });
  }
  cache.set(opt, true);
  const projectDir = path.dirname(opt.ProjectDir)
  for (const jsonKey in component) {
    const jsonPath = handlerPath(jsonKey, projectDir);
    const content = component[jsonKey];
  }
}

export { compileComponent }
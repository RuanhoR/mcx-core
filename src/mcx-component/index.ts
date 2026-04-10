import { mkdir, writeFile } from "node:fs/promises";
import { MCXCompileData } from "../compile-mcx/compiler/compileData";
import { execESMMethod, RunScript } from "./vm"; import path from "node:path";
import lib from "./lib";
import { MCXstructureLocComponentType } from "../compile-mcx/types";
import McxUtlis from "../utils";
import { transformCtx } from "../types";
export async function compileComponent(compiledCode: MCXCompileData, ctx: transformCtx) {
  const component = compiledCode.strLoc.Component;
  const src = compiledCode.strLoc.script;
  const scriptRunResult = (await (new RunScript(compiledCode.File, "esm")).run(src, execESMMethod.transformCjs)) as Record<string, InstanceType<typeof lib[MCXstructureLocComponentType]> | undefined>
  if (!component) throw new Error("[component internal error]: compile component: mcx is not component: filePath: " + compiledCode.File)
  if (typeof scriptRunResult !== "object") throw new Error("[component compile error]: exec code: mcx export type is not object")
  for (const i of Object.entries(component)) {
    const filePoint = path.join(ctx.output.behavior, i[0]);
    if (!path.relative(filePoint, ctx.output.behavior).startsWith("..")) throw new Error("[component]: Path Traversal: path: " + filePoint)
    const pointExport = i[1].useExpore;
    const pointData = scriptRunResult[pointExport] as InstanceType<typeof lib[keyof typeof lib]>
    if (!pointExport/* || !(pointData instanceof pointComponentClass) */) {
      throw new Error("[component]: compile: check: not found Component class of file: " + compiledCode.File)
    }
    if (!await McxUtlis.FileExsit(path.dirname(filePoint))) {
      mkdir(path.dirname(filePoint), {
        recursive: true
      })
    }
    await writeFile(filePoint, JSON.stringify(pointData.toJSON(), null, 2))
  }
}
export * from "./vm"
export { ItemComponent, EntityComponent, BlockComponent } from "./lib"
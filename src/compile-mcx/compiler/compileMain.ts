import { CompileOpt } from "../types";
import { join } from "node:path"
import * as CompileData from "./compileData"
import * as compiler from "./"
import { readFile } from "node:fs/promises";
import { extname } from "node:path";
import { loader } from "../loader";
import { genentateModuleNode } from "./moduleParser";
export default class CompileMain {
  main: string = "";
  cacheMap: Map<string, CompileData.JsCompileData | CompileData.MCXCompileData | string> = new Map();
  constructor(public opt: CompileOpt) {
    if (typeof opt.main == "string") this.main = join(opt.ProjectDir, opt.main);
  }
  async start() {
    if (!this.main) throw new Error("[mcx load]: mcx loader must has a main file")
    const mainCode = await readFile(this.main, "utf-8");
    const IR = this.compMain(mainCode);
    if (!IR) throw new Error("[mcx compile]: compile main file error");
    IR.setFilePath(this.main);
    for (const importPackage of IR.BuildCache.import) {
      const source = genentateModuleNode(importPackage.source, this.main);
      if (source.stat === "skip" || !source.data) continue;
      if (this.cacheMap.has(source.data)) continue;
      const moduleData = await loader(source.data);
      this.cacheMap.set(source.data, moduleData);
    }
    for (const call of IR.BuildCache.call) {
      if (call.source.type == "Identifier") {
        if ()
      }
    }
  }
  private compMain(code: string): CompileData.JsCompileData {
    const ext = extname(this.main);
    if (ext !== ".js") {
      throw new Error("[load project]: main file must is a javascript.");
    }
    const ir = compiler.compileJSFn(code);
    return ir;
  }
}
import type { CompileOpt } from "./types.js";
import Utils from "./../utils.js";
import CompileMain from "./compiler/main.js";
import { mkdir } from "node:fs/promises";
/**
 * @description - this is a function factory to generate mcxProject
 */
export default function CompileMcxProject(BuildOpt: CompileOpt): Promise<void> {
  return new Compile(BuildOpt).start();
}
class Compile {
  constructor(public BuildOpt: CompileOpt) {
    // 类型验证
    if (
      !Utils.TypeVerify(this.BuildOpt, {
        main: "string", // 启动文件路径
        moduleDir: "string", // 模块路径
        output: "string", // 输出的目录的scripts文件夹
      })
    ) {
      throw new TypeError("[compile checker]: Input Opt is not right");
    }
  }
  async start(): Promise<void> {
    if (!(await Utils.FileExsit(this.BuildOpt.moduleDir)))
      await mkdir(this.BuildOpt.moduleDir, {
        recursive: true,
      });
    await CompileMain(this.BuildOpt);
  }
}

import { extname } from "node:path";
import McxLoader from "./mcx";
import { Utils } from "./utils";
import { JsCompileData, MCXCompileData } from "../compiler/compileData";
const LoaderMap: Record<string, (fileDir: string) => Promise<JsCompileData | MCXCompileData | string>> = {
  mcx: McxLoader
}
function isExsitLoader(name: string): name is keyof typeof LoaderMap {
  return Object.keys(LoaderMap).includes(name);
}
export async function loader(_dir: string) {
  const dir = Utils.CheckPath(_dir);
  const ext = extname(dir).slice(1);
  if (isExsitLoader(ext)) return await (LoaderMap[ext] as typeof LoaderMap[keyof typeof LoaderMap])(dir);
  throw new Error(`[mcx load]: cannot find loader for file ${dir}`);
}
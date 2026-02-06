import { existsSync } from "node:fs";
import { dirname, join, parse } from "node:path";
const cacheModule: Map<string, string> = new Map();
function findNodeModule(dir: string, name: string): string {
  if (cacheModule.has(name)) {
    return cacheModule.get(name) as string;
  }
  if (dir.length <= 3) {
    throw new Error(`[mcx compile]: cannot find module ${name}`);
  }
  const basename = dirname(dir);
  const nodeModulePath = join(basename, "node_modules", name);
  if (existsSync(nodeModulePath)) {
    cacheModule.set(name, nodeModulePath);
    return nodeModulePath;
  } else {
    return findNodeModule(basename, name);
  }
}
export function genentateModuleNode(moduleName: string, FilePath: string): {stat: "skip" | "success", data: null | string} {
  const _module = parse(moduleName);
  if (_module.root) throw new Error(`[mcx compile]: module name invalid ${moduleName} in ${FilePath} (You should not use absolute path as module name)`);

  if (_module.dir.startsWith(".")) {
    return {
      stat: "success",
      data: join(FilePath, _module.dir, _module.base)
    }
  }
  if (moduleName.startsWith("@minecraft/") || moduleName.startsWith("minecraft/") || moduleName.startsWith("@ruanhor/mcx")) {
    return {
      stat: "skip",
      data: null
    }
  }
  return {
    stat: "success",
    data: findNodeModule(FilePath, moduleName)
  }
}
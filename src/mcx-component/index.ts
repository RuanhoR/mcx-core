import { MCXCompileData } from "../compile-mcx/compiler/compileData";

export async function compileComponent(compiledCode: MCXCompileData, project: string) {
  const component = compiledCode.strLoc.Component;
  for (const i of Object.entries(component)) {
    // TODO: compele compile component
  }
}
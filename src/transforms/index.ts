import { MCXCompileData } from "../compile-mcx/compiler/compileData";
import * as t from "@babel/types";
import generate from "@babel/generator";
import { MCXstructureLoc } from "../compile-mcx/types";
function addImport(
  statement: t.Statement[],
  source: string,
  importArray: t.ImportSpecifier[],
) {
  statement.unshift(t.importDeclaration(importArray, t.stringLiteral(source)));
}
async function compileComponent(compileData: MCXCompileData) {
  // TODO
}
function loadEvent() {}
export async function transform(compileData: MCXCompileData): Promise<string> {
  const mcxModule = "@mbler/mcx";
  const statement: t.Statement[] = [];
  if (compileData.strLoc.Event.isLoad) {
    addImport(statement, mcxModule, [
      t.importSpecifier(t.identifier("__mcx__event"), t.identifier("Event")),
    ]);
    loadEvent();
  }
  if (Object.keys(compileData.strLoc.Component).length >= 1) {
    compileComponent(compileData);
  }
  return ""
}

import { MCXCompileData } from "../compile-mcx/compiler/compileData";
import * as t from "@babel/types"
import generate from "@babel/generator"
function addImport(statement: t.Statement[]) {
  statement.unshift(t.importDeclaration([
    t.importSpecifier(
      t.identifier("__mcx__event"),
      t.identifier("Event"))
  ], t.stringLiteral("@mbler/mcx-use")));
}
export function transform(compileData: MCXCompileData): string {
  const statement: t.Statement[] = [];
  if (compileData.raw)
}
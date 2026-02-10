import {
  JsCompileData,
  MCXCompileData,
} from "../compile-mcx/compiler/compileData";
import * as t from "@babel/types";
import * as generator from "@babel/generator";
import { MCXstructureLoc } from "../compile-mcx/types";
import { generateMain } from "./utils";
import config from "./config";
import { mcxType } from "../types";
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
function loadEvent(event: MCXstructureLoc["Event"], body: t.Statement[]): void {
  const subscribeBody: t.ObjectProperty[] = [];
  for (const [name, useExport] of Object.entries(event.subscribe)) {
    subscribeBody.push(
      t.objectProperty(
        t.identifier(name),
        t.memberExpression(
          t.identifier(config.scriptCompileFn),
          t.identifier(useExport),
        ),
      ),
    );
  }
  const armg = t.objectExpression([
    t.objectProperty(t.identifier("on"), t.stringLiteral(event.on)),
    t.objectProperty(t.identifier("data"), t.objectExpression(subscribeBody)),
  ]);
  body.push(
    t.variableDeclaration("const", [
      t.variableDeclarator(
        t.identifier(config.eventVarName),
        t.newExpression(t.identifier(config.eventImported), [armg]),
      ),
    ]),
  );
}

export async function transform(compileData: MCXCompileData): Promise<string> {
  const mcxModule = "@mbler/mcx";
  // first compile script
  const statement: t.Statement[] = generateMain(compileData.JSIR);
  const exportIndex: Array<t.ExportSpecifier> = [];
  let mcxtype: mcxType | null = null;
  if (compileData.strLoc.Event.isLoad) {
    mcxtype = "event";
    addImport(statement, mcxModule, [
      t.importSpecifier(
        t.identifier(config.eventImported),
        t.identifier("Event"),
      ),
    ]);
    loadEvent(compileData.strLoc.Event, statement);
    exportIndex.push(
      t.exportSpecifier(
        t.identifier(config.eventVarName),
        t.identifier("event"),
      ),
    );
  }
  if (Object.keys(compileData.strLoc.Component).length >= 1) {
    if (mcxtype == "event")
      throw new Error(
        "[compile component]: a mcx must event or component, can't both",
      );
    compileComponent(compileData);
    // component 是宏，不必参与编译
    return "export default {use(){}}";
  }
  exportIndex.push(
    t.exportSpecifier(t.identifier("__main"), t.identifier("default")),
  );
  statement.push(t.exportNamedDeclaration(null, exportIndex));
  return generator.generate(t.program(statement)).code;
}


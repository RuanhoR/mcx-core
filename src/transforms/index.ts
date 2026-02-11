import {
  JsCompileData,
  MCXCompileData,
} from "../compile-mcx/compiler/compileData";
import * as t from "@babel/types";
import * as generator from "@babel/generator";
import { compileMCXFn } from "../compile-mcx/compiler";
import { MCXstructureLoc } from "../compile-mcx/types";
import { generateMain } from "./utils";
import config from "./config";
import { mcxType } from "../types";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { TransformPluginContext } from "rollup";
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

export async function transform(
  compileData: MCXCompileData,
  cache: Map<string, MCXCompileData>,
  id: string,
  context: TransformPluginContext,
): Promise<string> {
  const mcxModule = "@mbler/mcx";
  // first compile script
  const statement: t.Statement[] = generateMain(compileData.JSIR);
  const exportIndex: Array<t.ExportSpecifier> = [];
  let mcxtype: mcxType | null = null;

  // detect imported mcx modules that are events by checking cache or compiling
  const eventImportIds: (t.Identifier | t.MemberExpression)[] = [];

  // event MCX
  if (compileData.strLoc.Event.isLoad) {
    mcxtype = "event";
    addImport(statement, mcxModule, [
      t.importSpecifier(
        t.identifier(config.eventImported),
        t.identifier("Event"),
      ),
    ]);
    loadEvent(compileData.strLoc.Event, statement);
    // export named event object
    exportIndex.push(
      t.exportSpecifier(
        t.identifier(config.eventVarName),
        t.identifier("event"),
      ),
    );
  }

  // component MCX
  if (Object.keys(compileData.strLoc.Component).length >= 1) {
    if (mcxtype == "event")
      throw new Error(
        "[compile component]: a mcx must event or component, can't both",
      );
    // leave placeholder for component compilation
    await compileComponent(compileData);
    // export a MCXFile-like default for components
    const defObj = t.objectExpression([
      t.objectProperty(t.identifier("type"), t.stringLiteral("component")),
      t.objectProperty(
        t.identifier("setup"),
        t.identifier(config.scriptCompileFn),
      ),
    ]);
    statement.push(t.exportDefaultDeclaration(defObj));
    return generator.generate(t.program(statement)).code;
  }

  // app (default) MCX
  if (!mcxtype) {
    mcxtype = "app";
    for (const imp of compileData.JSIR.BuildCache.import || []) {
      if (path.parse(imp.source).dir == "") continue;
      const source = path.join(id, imp.source);
      if (!source.endsWith(".mcx")) continue;

      let moduleData: MCXCompileData;
      if (cache.has(source)) moduleData = cache.get(source) as MCXCompileData;
      else {
        let code: string;
        try {
          code = await readFile(source, "utf-8");
        } catch (err: any) {
          context.error("import '" + source + "' not exsit");
        }
        moduleData = compileMCXFn(code);
        cache.set(source, moduleData);
      }
      if (!moduleData.strLoc.Event.isLoad) continue;
      for (const item of imp.imported) {
        const base = t.identifier(item.as);
        if (item.isAll)
          eventImportIds.push(t.memberExpression(base, t.identifier("event")));
        else if (item.import == "event") eventImportIds.push(base);
      }
    }
  }
  // build default export object: { type: <mcxtype>, setup: __main, ...(event?) }
  const props: t.ObjectProperty[] = [
    t.objectProperty(t.identifier("type"), t.stringLiteral(mcxtype)),
    t.objectProperty(
      t.identifier("setup"),
      t.identifier(config.scriptCompileFn),
    ),
  ];

  // if this app imports an event mcx, attach it under `event` property
  if (mcxtype === "app" && eventImportIds.length > 0) {
    // prefer first discovered event import id
    props.push(
      t.objectProperty(
        t.identifier("event"),
        eventImportIds[0] as t.Identifier | t.MemberExpression,
      ),
    );
  }

  // if this is an event mcx we still need to provide named export 'event'
  if (mcxtype === "event") {
    // ensure default export still includes type and setup
    const defObj = t.objectExpression(props);
    statement.push(t.exportDefaultDeclaration(defObj));
    // add named exports (e.g., export { __use_event as event })
    if (exportIndex.length > 0)
      statement.push(t.exportNamedDeclaration(null, exportIndex));
    return generator.generate(t.program(statement)).code;
  }

  // normal app default export
  const defObj = t.objectExpression(props);
  statement.push(t.exportDefaultDeclaration(defObj));
  return generator.generate(t.program(statement)).code;
}

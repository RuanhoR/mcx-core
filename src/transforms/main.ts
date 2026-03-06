import { JsCompileData } from "../compile-mcx/compiler/compileData";
import { mcxType, ParsedTagNode, transformCtx } from "../types";
import * as t from "@babel/types";
import generator from "@babel/generator";
import config from "./config";
import path from "node:path";
import McxUtlis from "../utils";
import traverse, { cache } from "@babel/traverse"
import { readFile } from "node:fs/promises";
import { compileMCXFn } from "../compile-mcx/compiler";
import Utils from "../compile-mcx/compiler/utils";

function extrectVarDefIdList(express: t.LVal | t.VoidPattern): string[] {
  const result: string[] = [];
  if (t.isIdentifier(express)) result.push(express.name);
  if (t.isObjectPattern(express))
    express.properties.forEach((prop) => {
      // const {xxx:xxx,xxx=Litter} = xxx
      if (t.isObjectProperty(prop))
        return result.push(
          ...extrectVarDefIdList(
            prop.value as t.Identifier | t.AssignmentPattern,
          ),
        );
      // const {...restElement} = xx (restElement in this, ,must identifier)
      if (t.isRestElement(prop) && prop.argument.type == "Identifier")
        result.push(prop.argument.name);
    });
  if (t.isArrayPattern(express)) {
    for (const element of express.elements) {
      if (!element) continue;
      result.push(...extrectVarDefIdList(element));
    }
  }
  if (t.isAssignmentPattern(express)) {
    result.push(...extrectVarDefIdList(express.left));
  }
  return result;
}
function extractIdList(expression: t.Declaration): string[] {
  if (t.isFunctionDeclaration(expression)) {
    return [expression.id?.name || ""];
  }
  if (t.isVariableDeclaration(expression)) {
    const result: string[] = [];
    for (const varDef of expression.declarations) {
      result.push(...extrectVarDefIdList(varDef.id));
    }
    return result;
  }
  if (t.isClassDeclaration(expression)) {
    // 'export class {}'is not vaild(error: class name is required).
    return [expression.id?.name || ""];
  }
  return [];
}
function ToExpression(
  s: t.ExportDefaultDeclaration["declaration"],
): t.Expression {
  if (t.isFunctionDeclaration(s))
    return t.functionExpression(s.id, s.params, s.body, s.generator, s.async);
  if (t.isClassDeclaration(s))
    return t.classExpression(s.id, s.superClass, s.body, s.decorators);
  if (t.isTSDeclareFunction(s)) return t.objectExpression([]);
  return s;
}
function generateMain(
  code: JsCompileData,
): [t.Statement[], t.ImportDeclaration[]] {
  const expBody: (t.ObjectProperty | t.SpreadElement)[] = [];
  const impBody: t.ImportDeclaration[] = code.BuildCache.import.map((item): t.ImportDeclaration => {
    return Utils.CacheToImportNode(item)
  });
  const codeBody: t.Statement[] = code.node.body;
  for (const exp of code.BuildCache.export) {
    if (t.isExportNamedDeclaration(exp)) {
      // export {xxx} from "./xxx" or export xxx from "./xxx"
      if (
        exp.source &&
        exp.specifiers &&
        exp.specifiers.length >= 1 &&
        exp.source.value.length >= 1
      ) {
        impBody.push(
          t.importDeclaration(
            exp.specifiers.map((item) => {
              if (t.isExportDefaultSpecifier(item)) {
                expBody.push(t.objectProperty(item.exported, item.exported));
                return t.importDefaultSpecifier(item.exported);
              }
              if (t.isExportSpecifier(item)) {
                expBody.push(t.objectProperty(item.exported, item.exported));
                return t.importSpecifier(item.local, item.exported);
              }
              if (t.isExportNamespaceSpecifier(item)) {
                expBody.push(t.spreadElement(item.exported));
                return t.importNamespaceSpecifier(item.exported);
              }
              // 不加的话，ts就报错
              throw new Error(
                "[build import]: 这也不是那也不是,  你是个登啊(ts也是galgame)",
              );
            }),
            exp.source,
          ),
        );
      }
      if (exp.declaration) {
        const idList = extractIdList(exp.declaration);
        // be like: const {} = {}; (worthless)
        if (idList.length < 1) continue;
        codeBody.push(exp.declaration);
        expBody.push(
          ...idList.map((id) => {
            return t.objectProperty(t.identifier(id), t.identifier(id));
          }),
        );
      }
      // export { xxx }
      if (exp.specifiers && !exp.source) {
        expBody.push(
          ...exp.specifiers.map((item) => {
            if (!t.isExportSpecifier(item))
              throw new Error(`[build import]: invaild specifiers`);
            return t.objectProperty(item.exported, item.local);
          }),
        );
      }
      // export * from "xxx"
    } else if (t.isExportAllDeclaration(exp)) {
      // xxx.js => xxx_js(id)
      const id = exp.source.value.replace(/[!a-zA-Z0-9]+/g, "_");
      impBody.push(
        t.importDeclaration(
          [t.importNamespaceSpecifier(t.identifier(id))],
          exp.source,
        ),
      );
      expBody.push(t.objectProperty(t.identifier(id), t.identifier(id)));
      // export default {} or export default function a(){}
    } else if (t.isExportDefaultDeclaration(exp)) {
      // to expression
      expBody.push(
        t.objectProperty(
          t.identifier("default"),
          ToExpression(exp.declaration),
        ),
      );
    }
  }
  return [
    [...codeBody, t.returnStatement(t.objectExpression(expBody))],
    impBody,
  ];
}
async function generateEventConfig(
  eventTag: ParsedTagNode,
  ctx: transformCtx,
  impBody: t.ImportDeclaration[],
): Promise<t.ObjectExpression> {
  const prop = ctx.compiledCode.strLoc.Event.subscribe;
  const argm: t.ObjectExpression = t.objectExpression([]);
  if (eventTag.arr.tick) {
    const num = parseFloat(eventTag.arr.tick as string);
    if (!Number.isNaN(num))
      argm.properties.push(
        t.objectProperty(t.identifier("tick"), t.numericLiteral(num)),
      );
  }
  // extract event and hanler
  const data: t.ObjectProperty[] = [];
  const extend: t.Expression[] = [];
  for (const [name, handlerName] of Object.entries(prop)) {
    if (name == config.eventExtendsName) {
      const extendsFile = handlerName.split(",");
      for (const extFile of extendsFile) {
        if (
          !(await McxUtlis.FileExsit(
            path.join(path.dirname(ctx.currentId), extFile),
          ))
        )
          throw new Error("[transform event]: can't resolve");
        const id = extFile.replace(/[!a-zA-Z0-9]+/g, "_");
        impBody.push(
          t.importDeclaration(
            [t.importDefaultSpecifier(t.identifier(id))],
            t.stringLiteral(extFile),
          ),
        );
        extend.push(t.identifier(id));
      }
    }
    data.push(t.objectProperty(t.identifier(name), t.identifier(handlerName)));
  }
  argm.properties.push(
    t.objectProperty(t.identifier("data"), t.objectExpression(data)),
    t.objectProperty(t.identifier("extends"), t.arrayExpression(extend)),
  );
  return argm;
}
/**
 * record enable
 * @returns {(): void} - only call one
 */
function _enable(): (() => void) {
  let success = false;
  const fn = function () {
    if (success) throw new Error("[enable]: can't enable again")
    success = true;
    fn.prototype.enable = success;
  }
  fn.prototype.enable = success;
  return fn;
}
export async function _transform(ctx: transformCtx): Promise<string> {
  const _temp_main = generateMain(ctx.compiledCode.JSIR);
  const impBody = _temp_main[1];
  const mainFn = ctx.mainFn.body = _temp_main[0];
  const prop: t.ObjectProperty[] = [];
  let type: mcxType = "app";
  const params: t.FunctionParameter[] = ctx.mainFn.param = [
    t.identifier(config.paramCtx)
  ]
  const enableSetup = _enable()
  if (ctx.compiledCode.strLoc.Event) {
    // handler event type mcx
    type = "event";
    // enable export setup
    enableSetup()
    prop.push(
      t.objectProperty( // set prop's app = {event = eventConfig}
        t.identifier("app"),
        t.objectExpression([
          t.objectProperty(
            t.identifier("event"),
            await generateEventConfig(
              ctx.compiledCode.raw.find(
                (node) => node.name === "Event", // compileMCXFn had verify, don't verify
              ) as ParsedTagNode,
              ctx,
              impBody,
            ),
          ),
        ]),
      ),
    );
  }
  if (ctx.compiledCode.strLoc.UI) {
    /**
     * Completed UI handler
     * @todo - handler
     */
    type = "ui"; // ui mcx
  }
  if (ctx.compiledCode.strLoc.Component) {
    type = "component";
    return `export default {type:'component',setup:null,app:{}}`;
  }
  if (type == "app") {
    const eventImportIdList: ({
      type: "default" | "all",
      as: string
    })[] = [];
    // enable setup export
    enableSetup()
    // find event mcx import
    for (const impNode of ctx.compiledCode.JSIR.BuildCache.import) {
      const source = impNode.source;
      const parsed = path.parse(source);
      if (!parsed.root && !parsed.dir.startsWith(".")) {
        continue;
      };
      // path
      const fPath = path.join(ctx.currentId, "../", source)
      try {
        // read file
        const code = await readFile(fPath, "utf-8");
        const compiledCode = compileMCXFn(code);
        // write cache
        ctx.cache.set(fPath, compiledCode)
        if (compiledCode.strLoc.Event.isLoad) {
          for (const impItem of impNode.imported) {
            let type: "all" | "default";
            if (impItem.isAll) type = "all";
            else if (impItem.import == "default") type = "default";
            else {
              throw new Error("not vaild importDeclartion: Event mcx only resolve default and all import, can't use other import");
            }
            eventImportIdList.push({
              type,
              as: impItem.as
            });
          }
        }
      } catch (err) {
        // if error: file not found, file can't write, mcx syntax error
        ctx.rollupContext.warn(`[extract import]: can't resolve file ${fPath} and import by ${ctx.currentId}\n- err: ${(err instanceof Error) ? err.stack : err}`)
      }
    }
    mainFn.unshift(
      // add declaration
      t.variableDeclaration("var", eventImportIdList.map(
        (item, index) => {
          if (item.type == "all") {
            return t.variableDeclarator(t.identifier(item.as), t.objectExpression([
              t.objectProperty(t.identifier("default"),
                t.memberExpression(
                  t.identifier(config.paramCtx),
                  t.identifier(`event$$${index}`)
                ),
              ),
            ]))
          } else if (item.type == "default") {
            return t.variableDeclarator(
              t.identifier(item.as),
              t.memberExpression(
                t.identifier(config.paramCtx),
                t.identifier(`event$$${index}`)
              )
            )
          }
          // ts galgame
          throw new Error("[javascript error]: why it not in [default, all]")
        })
      )
    );
    // app: add event export to runtime framework
    prop.push(t.objectProperty(
      t.identifier("app"),
      t.objectExpression([
        t.objectProperty(
          t.identifier("event"),
          t.arrayExpression(eventImportIdList.map(vl => {
            if (vl.type == "all") {
              return t.memberExpression(
                t.identifier(vl.as),
                t.identifier("default")
              )
            } else if (vl.type == "default") {
              return t.identifier(vl.as)
            };
            throw new Error("[add prop]: can't format eventImportList")
          }))
        )
      ])
    ));
  }
  // add default export: type
  prop.push(t.objectProperty(t.identifier("type"), t.stringLiteral(type)));
  if (enableSetup.prototype.enable) {
    prop.push(t.objectProperty(
      t.identifier("setup"),
      t.identifier(config.scriptCompileFn)
    ))
  }
  const code = generator(
    (ctx.currentAST = t.program([
      ...impBody,
      t.functionDeclaration(
        t.identifier(config.scriptCompileFn),
        params,
        t.blockStatement(mainFn),
        false,
        false
      ),
      t.exportDefaultDeclaration(t.objectExpression(prop)),
    ])),
  ).code;
  return code;
}
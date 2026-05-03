import * as t from "@babel/types";
import { JsCompileData } from "../compile-mcx/compiler/compileData";
import Utils from "../compile-mcx/compiler/utils";
import { ParsedTagNode, transformCtx } from "../types";
import config from "./config";
import McxUtlis from "../utils";
import path from "node:path";
import { generateFileId } from "./file_id";

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
      const id = generateFileId();
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
  const argm: t.ObjectExpression = t.objectExpression([
    t.objectProperty(t.identifier("on"), t.stringLiteral(ctx.compiledCode.strLoc.Event.on))
  ]);
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
        ) throw new Error("[transform event]: can't resolve");
        const id = generateFileId();
        impBody.push(
          t.importDeclaration(
            [t.importDefaultSpecifier(t.identifier(id))],
            t.stringLiteral(extFile),
          ),
        );
        extend.push(t.identifier(id));
      }
    } else {
      data.push(
        t.objectProperty(t.identifier(name), t.stringLiteral(handlerName))
      );
    }
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
function _enable(): (() => void) & {
  prototype: {
    enable: boolean
  }
} {
  let success = false;
  const fn = function () {
    if (success) throw new Error("[enable]: can't enable again")
    success = true;
    fn.prototype.enable = success;
  }
  fn.prototype.enable = success;
  return fn;
}
function _enableWithData<T>(): ((data: T) => void) & {
  prototype: {
    enable: T | null
  }
} {
  let d: null | T = null;
  const fn = function (data: T) {
    if (d) throw new Error("[enable]: can't enable again")
    d = data;
    fn.prototype.enable = d;
  }
  fn.prototype.enable = d;
  return fn;
}
// export
export {
  extractIdList,
  extrectVarDefIdList,
  generateEventConfig,
  _enable,
  generateMain,
  _enableWithData
}
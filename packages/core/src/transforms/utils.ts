import * as t from '@babel/types';
import { JsCompileData } from '../compile-mcx/compiler/compileData';
import Utils from '../compile-mcx/compiler/utils';
import { ParsedTagNode, transformCtx } from '../types';
import config from './config';
import McxUtils from '../utils';
import * as path from 'node:path';
import { generateFileId } from './file_id';

function extractVarDefIdList(express: t.LVal | t.VoidPattern): string[] {
  const result: string[] = [];
  if (t.isIdentifier(express)) result.push(express.name);
  if (t.isObjectPattern(express))
    express.properties.forEach(prop => {
      // const {xxx:xxx,xxx=Litter} = xxx
      if (t.isObjectProperty(prop))
        return result.push(
          ...extractVarDefIdList(
            prop.value as t.Identifier | t.AssignmentPattern,
          ),
        );
      // const {...restElement} = xx (restElement in this, ,must identifier)
      if (t.isRestElement(prop) && prop.argument.type == 'Identifier')
        result.push(prop.argument.name);
    });
  if (t.isArrayPattern(express)) {
    for (const element of express.elements) {
      if (!element) continue;
      result.push(...extractVarDefIdList(element));
    }
  }
  if (t.isAssignmentPattern(express)) {
    result.push(...extractVarDefIdList(express.left));
  }
  return result;
}
function extractIdList(expression: t.Declaration): string[] {
  if (t.isFunctionDeclaration(expression)) {
    return [expression.id?.name || ''];
  }
  if (t.isVariableDeclaration(expression)) {
    const result: string[] = [];
    for (const varDef of expression.declarations) {
      result.push(...extractVarDefIdList(varDef.id));
    }
    return result;
  }
  if (t.isClassDeclaration(expression)) {
    // 'export class {}'is not vaild(error: class name is required).
    return [expression.id?.name || ''];
  }
  return [];
}
function ToExpression(
  s: t.ExportDefaultDeclaration['declaration'],
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
  const impBody: t.ImportDeclaration[] = code.BuildCache.import.map(
    (item): t.ImportDeclaration => {
      return Utils.CacheToImportNode(item);
    },
  );
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
            exp.specifiers.map(item => {
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
              // 这也不是那也不是, 你是个登啊(ts也是galgame)
              throw new Error(
                '[build import]: unexpected export specifier type',
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
          ...idList.map(id => {
            return t.objectProperty(t.identifier(id), t.identifier(id));
          }),
        );
      }
      // export { xxx }
      if (exp.specifiers && !exp.source) {
        expBody.push(
          ...exp.specifiers.map(item => {
            if (!t.isExportSpecifier(item))
              throw new Error(`[build import]: invalid specifiers`);
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
          t.identifier('default'),
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
    t.objectProperty(
      t.identifier('on'),
      t.stringLiteral(ctx.compiledCode.strLoc.Event.on),
    ),
  ]);
  if (eventTag.arr.tick) {
    const num = parseFloat(eventTag.arr.tick as string);
    if (!Number.isNaN(num))
      argm.properties.push(
        t.objectProperty(t.identifier('tick'), t.numericLiteral(num)),
      );
  }
  // extract event and hanler
  const data: t.ObjectProperty[] = [];
  const extend: t.Expression[] = [];
  for (const [name, handlerName] of Object.entries(prop)) {
    if (name == config.eventExtendsName) {
      const extendsFile = handlerName.split(',');
      for (const extFile of extendsFile) {
        if (
          !(await McxUtils.FileExist(
            path.join(path.dirname(ctx.currentId), extFile),
          ))
        )
          throw new Error(
            "[transform event]: [ERR: NOT_FOUND]: can't resolve extend file: " +
              extFile,
          );
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
        t.objectProperty(t.identifier(name), t.stringLiteral(handlerName)),
      );
    }
  }
  argm.properties.push(
    t.objectProperty(t.identifier('data'), t.objectExpression(data)),
    t.objectProperty(t.identifier('extends'), t.arrayExpression(extend)),
  );
  return argm;
}
/**
 * record enable
 * @returns {(): void} - only call one
 */
function _enable(): (() => void) & {
  prototype: {
    enable: boolean;
  };
} {
  let success = false;
  const fn = function () {
    if (success) throw new Error("[enable]: can't enable again");
    success = true;
    fn.prototype.enable = success;
  };
  fn.prototype.enable = success;
  return fn;
}
function _enableWithData<T>(): ((data: T) => void) & {
  prototype: {
    enable: T | null;
  };
} {
  let d: null | T = null;
  const fn = function (data: T) {
    if (d) throw new Error("[enable]: can't enable again");
    d = data;
    fn.prototype.enable = d;
  };
  fn.prototype.enable = d;
  return fn;
}
// export
function processDefineProp(
  code: JsCompileData,
  mode: 'form' | 'ui',
  impBody: t.ImportDeclaration[],
): void {
  const obsMap: Record<string, string> = {};

  for (const stmt of code.node.body) {
    if (t.isVariableDeclaration(stmt)) {
      for (const decl of stmt.declarations) {
        if (
          t.isCallExpression(decl.init) &&
          t.isIdentifier(decl.init.callee) &&
          decl.init.callee.name === 'defineProp' &&
          t.isIdentifier(decl.id)
        ) {
          const varName = decl.id.name;
          // args: defineProp(defaultValue) or defineProp(name, defaultValue)
          const defaultVal = decl.init.arguments[1] || decl.init.arguments[0];
          let defaultExpr: t.Expression = t.nullLiteral();
          if (defaultVal && t.isExpression(defaultVal)) {
            defaultExpr = defaultVal as t.Expression;
          }

          // Build: __mcx__ctx.$prop.varName ?? defaultValue
          const propAccess = t.logicalExpression(
            '??',
            t.memberExpression(
              t.memberExpression(
                t.identifier('__mcx__ctx'),
                t.identifier('$prop'),
              ),
              t.identifier(varName),
            ),
            defaultExpr,
          );

          if (mode === 'ui') {
            // Wrap in Observable constructor for CustomForm
            const obsType = inferObservableType(defaultExpr);
            if (obsType) {
              obsMap[obsType] = obsType;
              decl.init = t.newExpression(t.identifier(obsType), [propAccess]);
            } else {
              decl.init = propAccess;
            }
          } else {
            decl.init = propAccess;
          }
        }
      }
    }
  }

  if (mode === 'ui' && Object.keys(obsMap).length > 0) {
    impBody.push(
      t.importDeclaration(
        Object.values(obsMap).map(name =>
          t.importSpecifier(t.identifier(name), t.identifier(name)),
        ),
        t.stringLiteral('@minecraft/server-ui'),
      ),
    );
  }
}

function inferObservableType(expr: t.Expression): string | null {
  if (t.isStringLiteral(expr)) return 'ObservableString';
  if (t.isBooleanLiteral(expr)) return 'ObservableBoolean';
  if (t.isNumericLiteral(expr)) return 'ObservableNumber';
  if (t.isNullLiteral(expr)) return 'ObservableString';
  if (t.isIdentifier(expr) && expr.name === 'undefined')
    return 'ObservableString';
  return null;
}

function collectSetupDeclarations(
  code: JsCompileData,
  existingReturnMembers: Set<string>,
): t.ObjectProperty[] {
  const result: t.ObjectProperty[] = [];
  const seen = new Set(existingReturnMembers);

  for (const stmt of code.node.body) {
    if (!t.isDeclaration(stmt)) continue;
    const ids = extractIdList(stmt);
    for (const id of ids) {
      if (id && !seen.has(id)) {
        seen.add(id);
        result.push(t.objectProperty(t.identifier(id), t.identifier(id)));
      }
    }
  }
  return result;
}

function processHooks(code: JsCompileData): {
  startup: t.Expression | null;
  mounted: t.Expression | null;
} {
  let startup: t.Expression | null = null;
  let mounted: t.Expression | null = null;

  const toRemove: number[] = [];

  for (let i = 0; i < code.node.body.length; i++) {
    const stmt = code.node.body[i];
    if (!stmt) continue;

    if (t.isExpressionStatement(stmt) && t.isCallExpression(stmt.expression)) {
      const call = stmt.expression;
      if (t.isIdentifier(call.callee)) {
        const name = call.callee.name;
        if (name === 'onStartup' || name === 'onMounted') {
          if (call.arguments.length > 0) {
            const cb = call.arguments[0];
            if (t.isExpression(cb)) {
              if (name === 'onStartup') startup = cb as t.Expression;
              else mounted = cb as t.Expression;
            }
          }
          toRemove.push(i);
        }
      }
    }
  }

  for (const idx of toRemove.reverse()) {
    code.node.body.splice(idx, 1);
  }

  // Clean up imports of onStartup/onMounted from BuildCache
  const hookNames = new Set(['onStartup', 'onMounted']);
  for (const imp of code.BuildCache.import) {
    if (imp.source === '@mbler/mcx') {
      imp.imported = imp.imported.filter(
        item => !hookNames.has(item.import || item.as),
      );
    }
  }
  code.BuildCache.import = code.BuildCache.import.filter(
    imp => imp.source !== '@mbler/mcx' || imp.imported.length > 0,
  );

  return { startup, mounted };
}

// export
export {
  extractIdList,
  extractVarDefIdList,
  generateEventConfig,
  _enable,
  generateMain,
  _enableWithData,
  processDefineProp,
  collectSetupDeclarations,
  processHooks,
};

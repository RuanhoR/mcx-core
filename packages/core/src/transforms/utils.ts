import * as t from '@babel/types';
import { JsCompileData } from '../compile-mcx/compiler/compileData';
import Utils from '../compile-mcx/compiler/utils';
import { ParsedTagNode, transformCtx } from '../types';
import config from './config';
import McxUtils from '../utils';
import * as path from 'node:path';
import { generateFileId } from './file_id';
import { extractIdList, toExpression } from './ast-utils';

export { extractIdList, extractVarDefIdList, toExpression } from './ast-utils';
export { createOnceGuard, createOnceData } from './enable';
export { processDefineProp } from './prop';
export { processHooks } from './hooks';

export function generateMain(
  code: JsCompileData,
): [t.Statement[], t.ImportDeclaration[]] {
  const exportProps: (t.ObjectProperty | t.SpreadElement)[] = [];
  const importDecls: t.ImportDeclaration[] = code.BuildCache.import.map(
    (item): t.ImportDeclaration => {
      return Utils.CacheToImportNode(item);
    },
  );
  const programBody: t.Statement[] = [...code.node.body];
  for (const exp of code.BuildCache.export) {
    if (t.isExportNamedDeclaration(exp)) {
      if (
        exp.source &&
        exp.specifiers &&
        exp.specifiers.length >= 1 &&
        exp.source.value.length >= 1
      ) {
        importDecls.push(
          t.importDeclaration(
            exp.specifiers.map(item => {
              if (t.isExportDefaultSpecifier(item)) {
                exportProps.push(t.objectProperty(item.exported, item.exported));
                return t.importDefaultSpecifier(item.exported);
              }
              if (t.isExportSpecifier(item)) {
                exportProps.push(t.objectProperty(item.exported, item.exported));
                return t.importSpecifier(item.local, item.exported);
              }
              if (t.isExportNamespaceSpecifier(item)) {
                exportProps.push(t.spreadElement(item.exported));
                return t.importNamespaceSpecifier(item.exported);
              }
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
        if (idList.length < 1) continue;
        programBody.push(exp.declaration);
        exportProps.push(
          ...idList.map(id => {
            return t.objectProperty(t.identifier(id), t.identifier(id));
          }),
        );
      }
      if (exp.specifiers && !exp.source) {
        exportProps.push(
          ...exp.specifiers.map(item => {
            if (!t.isExportSpecifier(item))
              throw new Error(`[build import]: invalid specifiers`);
            return t.objectProperty(item.exported, item.local);
          }),
        );
      }
    } else if (t.isExportAllDeclaration(exp)) {
      const id = generateFileId();
      importDecls.push(
        t.importDeclaration(
          [t.importNamespaceSpecifier(t.identifier(id))],
          exp.source,
        ),
      );
      exportProps.push(t.objectProperty(t.identifier(id), t.identifier(id)));
    } else if (t.isExportDefaultDeclaration(exp)) {
      exportProps.push(
        t.objectProperty(
          t.identifier('default'),
          toExpression(exp.declaration),
        ),
      );
    }
  }
  return [
    [...programBody, t.returnStatement(t.objectExpression(exportProps))],
    importDecls,
  ];
}

export async function generateEventConfig(
  eventTag: ParsedTagNode,
  ctx: transformCtx,
  importDecls: t.ImportDeclaration[],
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
        importDecls.push(
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

export function collectSetupDeclarations(
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

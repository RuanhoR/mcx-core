import { compileJSFn } from '../compile-mcx/compiler';
import { ImportList } from '../compile-mcx/types';
import * as t from '@babel/types';
import { generateFileId } from '../transforms/file_id';
import * as generator from '@babel/generator';
/**
 * ESM => CJS
 */
function transformESMToCJS(
  code: string,
  pluginContext?: Record<string, string | null | boolean | number>,
  hook?: (
    data: t.CallExpression | t.MemberExpression,
    setData?: (newData: t.Expression) => void,
  ) => void,
): string {
  const compileData = compileJSFn(code);
  const body = compileData.node.body;
  const defines: t.VariableDeclarator[] = [];
  // import transform
  const importDefines = transformImportIRtoRequire(
    compileData.BuildCache.import,
  );
  for (const importDefine of importDefines) {
    const data = importDefine.init as t.CallExpression | t.MemberExpression;
    if (hook) {
      hook(data, newData => {
        importDefine.init = newData;
      });
    }
    defines.push(importDefine);
  }
  // add plugin context
  if (pluginContext) {
    defines.push(
      ...Object.entries(pluginContext).map(
        ([key, value]): t.VariableDeclarator =>
          t.variableDeclarator(
            t.identifier(key),
            typeof value == 'string'
              ? t.stringLiteral(value)
              : typeof value == 'boolean'
                ? t.booleanLiteral(value)
                : typeof value == 'number'
                  ? t.numericLiteral(value)
                  : t.nullLiteral(),
          ),
      ),
    );
  }

  const exportsArr = compileData.BuildCache.export
    .map(i => {
      if (t.isExportAllDeclaration(i)) {
        const fileId = generateFileId();
        defines.push(
          t.variableDeclarator(
            t.identifier(fileId),
            t.callExpression(t.identifier('require'), [i.source]),
          ),
        );
        return t.assignmentExpression(
          '=',
          t.memberExpression(t.identifier('module'), t.identifier('exports')),
          t.objectExpression([
            t.spreadElement(t.identifier(fileId)),
            t.spreadElement(
              t.memberExpression(
                t.identifier('module'),
                t.identifier('exports'),
              ),
            ),
          ]),
        );
      } else if (t.isExportDefaultDeclaration(i)) {
        if (!i.declaration || t.isTSDeclareFunction(i.declaration))
          return void 0;
        if (t.isExpression(i.declaration)) {
          return t.assignmentExpression(
            '=',
            t.memberExpression(
              t.identifier('exports'),
              t.identifier('default'),
            ),
            i.declaration,
          );
        }
        if (!i.declaration.id)
          i.declaration.id = t.identifier(generateFileId());
        body.push(i.declaration);
        return t.assignmentExpression(
          '=',
          t.memberExpression(t.identifier('exports'), t.identifier('default')),
          i.declaration.id,
        );
      } else if (t.isExportNamedDeclaration(i)) {
        if (i.source && i.specifiers.length >= 1) {
          const id = t.identifier(generateFileId());
          defines.push(
            t.variableDeclarator(
              id,
              t.callExpression(t.identifier('require'), [i.source]),
            ),
          );
          const exportExprs = i.specifiers
            .map(
              (
                specifier:
                  | t.ExportNamespaceSpecifier
                  | t.ExportDefaultSpecifier
                  | t.ExportSpecifier,
              ) => {
                if (t.isExportNamespaceSpecifier(specifier)) {
                  const exportedName = t.isIdentifier(specifier.exported)
                    ? specifier.exported.name
                    : (specifier.exported as t.StringLiteral).value;
                  return t.assignmentExpression(
                    '=',
                    t.memberExpression(
                      t.identifier('exports'),
                      t.identifier(exportedName),
                    ),
                    id,
                  );
                } else if (t.isExportSpecifier(specifier)) {
                  const exportedName = t.isIdentifier(specifier.exported)
                    ? specifier.exported.name
                    : (specifier.exported as t.StringLiteral).value;
                  return t.assignmentExpression(
                    '=',
                    t.memberExpression(
                      t.identifier('exports'),
                      t.identifier(exportedName),
                    ),
                    t.memberExpression(id, t.identifier(specifier.local.name)),
                  );
                }
                return null;
              },
            )
            .filter(Boolean) as t.AssignmentExpression[];
          return exportExprs.length === 1
            ? exportExprs[0]
            : t.sequenceExpression(exportExprs);
        } else {
          if (i.declaration) {
            if (
              t.isFunctionDeclaration(i.declaration) ||
              t.isVariableDeclaration(i.declaration)
            ) {
              if (t.isVariableDeclaration(i.declaration)) {
                body.push(i.declaration);
                const assignExprs = i.declaration.declarations.map(decl => {
                  const varName = (decl.id as t.Identifier).name;
                  return t.assignmentExpression(
                    '=',
                    t.memberExpression(
                      t.identifier('exports'),
                      t.identifier(varName),
                    ),
                    t.identifier(varName),
                  );
                });
                return assignExprs.length === 1
                  ? assignExprs[0]
                  : t.sequenceExpression(assignExprs);
              } else {
                const functionId =
                  i.declaration.id || t.identifier(generateFileId());
                const funcDecl = t.functionDeclaration(
                  functionId,
                  i.declaration.params,
                  i.declaration.body,
                  i.declaration.generator,
                  i.declaration.async,
                );
                body.push(funcDecl);
                return t.assignmentExpression(
                  '=',
                  t.memberExpression(
                    t.identifier('exports'),
                    t.identifier((functionId as t.Identifier).name),
                  ),
                  functionId,
                );
              }
            }
          } else {
            // Handle export { item } - simple variable export
            if (i.specifiers.length >= 1) {
              const exportExprs = i.specifiers
                .map(specifier => {
                  if (t.isExportSpecifier(specifier)) {
                    const exportedName = t.isIdentifier(specifier.exported)
                      ? specifier.exported.name
                      : (specifier.exported as t.StringLiteral).value;
                    return t.assignmentExpression(
                      '=',
                      t.memberExpression(
                        t.identifier('exports'),
                        t.identifier(exportedName),
                      ),
                      t.identifier(specifier.local.name),
                    );
                  }
                  return null;
                })
                .filter(Boolean) as t.AssignmentExpression[];
              return exportExprs.length === 1
                ? exportExprs[0]
                : t.sequenceExpression(exportExprs);
            }
          }
        }
        return null;
      }
    })
    .filter(Boolean) as t.AssignmentExpression[];

  body.unshift(t.variableDeclaration('var', defines));
  body.push(...exportsArr.map(i => t.expressionStatement(i)));

  return generator.generate(t.program(body)).code;
}

/**
 * import IR => require
 */
function transformImportIRtoRequire(
  importIR: ImportList[],
): t.VariableDeclarator[] {
  const define: t.VariableDeclarator[] = [
    t.variableDeclarator(
      t.identifier('__import_default'),
      t.functionExpression(
        null,
        [t.identifier('obj')],
        t.blockStatement([
          t.returnStatement(
            t.conditionalExpression(
              t.memberExpression(
                t.identifier('obj'),
                t.identifier('__esModule'),
              ),
              t.memberExpression(t.identifier('obj'), t.identifier('default')),
              t.identifier('obj'),
            ),
          ),
        ]),
      ),
    ),
  ];

  for (const data of importIR) {
    for (const imported of data.imported) {
      let vl: t.CallExpression | t.MemberExpression;
      if (!imported.isAll && imported.import) {
        if (imported.import == 'default') {
          vl = t.callExpression(t.identifier('__import_default'), [
            t.callExpression(t.identifier('require'), [
              t.stringLiteral(data.source),
            ]),
          ]);
        } else {
          vl = t.memberExpression(
            t.callExpression(t.identifier('require'), [
              t.stringLiteral(data.source),
            ]),
            t.identifier(imported.import),
          );
        }
      } else {
        vl = t.callExpression(t.identifier('require'), [
          t.stringLiteral(data.source),
        ]);
      }
      define.push(t.variableDeclarator(t.identifier(imported.as), vl));
    }
  }
  return define;
}
export { transformESMToCJS, transformImportIRtoRequire };

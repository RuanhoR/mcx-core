import * as t from '@babel/types';
import { JsCompileData } from '../compile-mcx/compiler/compileData';

function inferObservableType(expr: t.Expression): string | null {
  if (t.isStringLiteral(expr)) return 'ObservableString';
  if (t.isBooleanLiteral(expr)) return 'ObservableBoolean';
  if (t.isNumericLiteral(expr)) return 'ObservableNumber';
  if (t.isNullLiteral(expr)) return 'ObservableString';
  if (t.isIdentifier(expr) && expr.name === 'undefined')
    return 'ObservableString';
  return null;
}

/**
 * Rewrites defineProp() calls to __mcx__ctx.$prop.varName ?? defaultValue.
 * For 'ui' mode, wraps in Observable constructors when applicable.
 */
export function processDefineProp(
  code: JsCompileData,
  mode: 'form' | 'ui',
  importDecls: t.ImportDeclaration[],
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
          const defaultVal = decl.init.arguments[1] || decl.init.arguments[0];
          let defaultExpr: t.Expression = t.nullLiteral();
          if (defaultVal && t.isExpression(defaultVal)) {
            defaultExpr = defaultVal as t.Expression;
          }

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
    importDecls.push(
      t.importDeclaration(
        Object.values(obsMap).map(name =>
          t.importSpecifier(t.identifier(name), t.identifier(name)),
        ),
        t.stringLiteral('@minecraft/server-ui'),
      ),
    );
  }
}

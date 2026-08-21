import * as t from '@babel/types';
import { JsCompileData } from '../compile-mcx/compiler/compileData';

const FUNC_LIKE = new Set([
  'FunctionDeclaration',
  'FunctionExpression',
  'ArrowFunctionExpression',
  'ObjectMethod',
  'ClassMethod',
  'ClassPrivateMethod',
]);

function inferObservableType(expr: t.Expression): string | null {
  if (t.isParenthesizedExpression(expr)) {
    return inferObservableType(expr.expression);
  }
  if (t.isStringLiteral(expr)) return 'ObservableString';
  if (t.isBooleanLiteral(expr)) return 'ObservableBoolean';
  if (t.isNumericLiteral(expr)) return 'ObservableNumber';
  // negative numeric literals: -1 is a UnaryExpression, not a NumericLiteral
  if (
    t.isUnaryExpression(expr) &&
    expr.operator === '-' &&
    t.isNumericLiteral(expr.argument)
  ) {
    return 'ObservableNumber';
  }
  // string literals via template literal without substitutions: `abc`
  if (t.isTemplateLiteral(expr) && expr.expressions.length === 0) {
    return 'ObservableString';
  }
  if (t.isNullLiteral(expr)) return 'ObservableString';
  if (t.isIdentifier(expr) && expr.name === 'undefined')
    return 'ObservableString';
  return null;
}

function collectVarDeclStatements(
  node: t.Node | null,
  out: t.VariableDeclaration[],
): void {
  if (!node || typeof node.type !== 'string') return;
  if (!FUNC_LIKE.has(node.type)) {
    if (t.isVariableDeclaration(node)) out.push(node);
    const keys = t.VISITOR_KEYS[node.type] ?? [];
    for (const key of keys) {
      const child = (node as unknown as Record<string, unknown>)[key];
      if (Array.isArray(child)) {
        for (const c of child) {
          if (c && typeof (c as t.Node).type === 'string') {
            collectVarDeclStatements(c as t.Node, out);
          }
        }
      } else if (child && typeof (child as t.Node).type === 'string') {
        collectVarDeclStatements(child as t.Node, out);
      }
    }
  }
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
  const statements: t.VariableDeclaration[] = [];
  for (const stmt of code.node.body) {
    collectVarDeclStatements(stmt, statements);
  }

  for (const stmt of statements) {
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

import * as t from '@babel/types';
import { JsCompileData } from '../compile-mcx/compiler/compileData';

/**
 * Extracts onStartup/onMounted hook callbacks from the AST body,
 * removes them from the body, and cleans up their imports.
 */
export function processHooks(code: JsCompileData): {
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

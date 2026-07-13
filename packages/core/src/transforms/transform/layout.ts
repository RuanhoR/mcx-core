import { ParsedTagNode, transformParseCtx } from '../../types';
import * as t from '@babel/types';

/**
 * Shared layout generation for both <Form> and <Ui>.
 * Generates layout config with (s) => expr functions for content and params.
 */
export function generateLayout(
  ctx: transformParseCtx,
  tagNode: ParsedTagNode,
  tagName: string,
  mode: 'form' | 'ui',
) {
  const internalCtx = ctx.ctx;

  const parsedObj: t.Expression[] = [];
  const typeTags: string[] = [];

  // Collect child elements
  const elements: {
    arr: Record<string, string | boolean>;
    content: string;
    type: string;
    loc?: ParsedTagNode['loc'];
    for?: { variable: string; useSetup: string };
    if?: { useSetup: string };
  }[] = [];

  for (const child of tagNode.content) {
    if (child.type !== 'TagNode') continue;

    if (child.content.some(i => i.type === 'TagNode')) {
      internalCtx.rollupContext.error(
        `[${tagName}]: can't support nested elements`,
        child.loc
          ? { column: child.loc.start.column, line: child.loc.start.line }
          : void 0,
      );
    }

    // parse for
    let _for: { variable: string; useSetup: string } | undefined;
    if (typeof child.arr.for === 'string') {
      const match = (child.arr.for as string).match(
        /^(\w+)\s+in\s+(\w+)$/,
      );
      if (match) {
        _for = { variable: match[1]!, useSetup: match[2]! };
      } else {
        internalCtx.rollupContext.error(
          `[${tagName}]: invalid for syntax, expected 'variable in propName'`,
          child.loc
            ? { column: child.loc.start.column, line: child.loc.start.line }
            : void 0,
        );
      }
    }

    // parse if
    let _if: { useSetup: string } | undefined;
    if (typeof child.arr.if === 'string') {
      _if = { useSetup: child.arr.if as string };
    }

    elements.push({
      arr: child.arr,
      content: child.content
        .map(i => (i.type === 'TagContent' && i.data) || '')
        .join(''),
      type: child.name,
      loc: child.loc,
      ...(_for ? { for: _for } : {}),
      ...(_if ? { if: _if } : {}),
    });
  }

  // Build layout objects
  for (const el of elements) {
    const name = el.type;
    const cleanedArr = { ...el.arr };
    delete cleanedArr.for;
    delete cleanedArr.if;

    // Validate tag type
    const formType = detectFormType(name);
    if (formType === 'invalid') {
      internalCtx.rollupContext.error(
        `[${tagName}]: don't support tag: ${name}`,
        el.loc
          ? { line: el.loc.start.line, column: el.loc.start.column }
          : void 0,
      );
      continue;
    }
    if (formType) typeTags.push(formType);

    // Build params: static values as literals, dynamic (:attr) as (s) => expr
    const paramsObj = t.objectExpression(
      Object.entries(cleanedArr)
        .filter(([key]) => key !== 'for' && key !== 'if')
        .map(([key, value]) => {
          const isDynamic = key.startsWith(':');
          const paramName = isDynamic ? key.slice(1) : key;
          // click is always a function reference to setup
          if (paramName === 'click') {
            return t.objectProperty(
              t.identifier(paramName),
              arrowFn(String(value)),
            );
          }
          return t.objectProperty(
            t.identifier(paramName),
            isDynamic
              ? arrowFn(String(value))
              : typeof value === 'boolean'
                ? t.booleanLiteral(value)
                : t.stringLiteral(value),
          );
        }),
    );

    // Content: {{ expr }} → (__ctx) => __ctx[0].expr, else string literal
    const contentExpr =
      el.content.startsWith('{{ ') && el.content.endsWith(' }}')
        ? arrowFn(el.content.slice(3, el.content.length - 3).trim())
        : t.stringLiteral(el.content);

    const props: t.ObjectProperty[] = [
      t.objectProperty(t.identifier('type'), t.stringLiteral(name)),
      t.objectProperty(t.identifier('params'), paramsObj),
      t.objectProperty(t.identifier('content'), contentExpr),
    ];

    // for
    if (el.for) {
      props.push(
        t.objectProperty(
          t.identifier('for'),
          t.objectExpression([
            t.objectProperty(
              t.identifier('variable'),
              t.stringLiteral(el.for.variable),
            ),
            t.objectProperty(
              t.identifier('useSetup'),
              t.stringLiteral(el.for.useSetup),
            ),
          ]),
        ),
      );
    }

    // if
    if (el.if) {
      props.push(
        t.objectProperty(
          t.identifier('if'),
          t.objectExpression([
            t.objectProperty(
              t.identifier('useSetup'),
              t.stringLiteral(el.if.useSetup),
            ),
          ]),
        ),
      );
    }

    parsedObj.push(t.objectExpression(props));
  }

  // Detect which form type was used
  let formTypeStr = 'ActionFormData';
  if (typeTags.some(t => ['input', 'dropdown', 'submit', 'toggle', 'slider'].includes(t))) {
    formTypeStr = 'ModalFormData';
  } else if (typeTags.some(t => t === 'button-m')) {
    formTypeStr = 'MessageFormData';
  } else if (typeTags.some(t => t === 'button')) {
    formTypeStr = 'ActionFormData';
  }

  return { parsedObj, formTypeStr };
}

function detectFormType(
  tag: string,
): 'modal' | 'message' | 'action' | 'shared' | 'invalid' | null {
  if (['input', 'dropdown', 'submit', 'toggle', 'slider'].includes(tag))
    return 'modal';
  if (tag === 'button-m') return 'message';
  if (tag === 'button') return 'action';
  if (['body', 'divider', 'title', 'label', 'header', 'spacer', 'close-button'].includes(tag))
    return 'shared';
  return 'invalid';
}

/** Generate (__ctx) => __ctx[0].a.b.c arrow function */
function arrowFn(expr: string): t.ArrowFunctionExpression {
  const ctx = t.identifier('__ctx');
  const body = dotAccess(expr, ctx);
  return t.arrowFunctionExpression([ctx], body);
}

/** "a.b.c" → __ctx[0].a.b.c */
function dotAccess(expr: string, root: t.Identifier): t.Expression {
  const parts = expr.split('.');
  // First part accesses root[0] (the setup object)
  let node: t.Expression = t.memberExpression(root, t.numericLiteral(0), true);
  for (const part of parts) {
    node = t.memberExpression(node, t.identifier(part));
  }
  return node;
}

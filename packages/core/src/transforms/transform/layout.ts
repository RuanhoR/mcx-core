import { ParsedTagNode, transformParseCtx } from '../../types';
import * as t from '@babel/types';

const SETUP_CTX_INDEX = 0;

const UI_TAGS = new Set([
  'input',
  'textField',
  'toggle',
  'dropdown',
  'slider',
  'button',
  'label',
  'body',
  'header',
  'title',
  'divider',
  'spacer',
  'close-button',
]);

const FORM_TAGS = new Set([
  'input',
  'dropdown',
  'submit',
  'toggle',
  'slider',
  'button',
  'button-m',
  'body',
  'divider',
  'title',
]);

const COMMON_ATTRS = new Set([
  'id',
  'for',
  'if',
  'tip',
  'disabled',
  'visible',
  'description',
  ':id',
  ':for',
  ':if',
  ':tip',
  ':disabled',
  ':visible',
  ':description',
]);

const TAG_ATTRS: Record<string, Set<string>> = {
  input: new Set([
    'placeholderText',
    'default',
    'value',
    ':placeholderText',
    ':default',
    ':value',
  ]),
  textField: new Set([
    'placeholderText',
    'default',
    'value',
    ':placeholderText',
    ':default',
    ':value',
  ]),
  toggle: new Set(['default', 'value', ':default', ':value']),
  dropdown: new Set([
    'default',
    'value',
    'option',
    ':default',
    ':value',
    ':option',
  ]),
  slider: new Set([
    'default',
    'value',
    'min',
    'max',
    ':default',
    ':value',
    ':min',
    ':max',
  ]),
  button: new Set(['click', 'img', ':click', ':img']),
  submit: new Set(['click', ':click']),
  'button-m': new Set(['click', ':click']),
};

// Precomputed combined allowed-attrs per tag (COMMON_ATTRS ∪ TAG_ATTRS[tag])
const COMBINED_ATTRS = new Map<string, Set<string>>();
for (const [tag, specific] of Object.entries(TAG_ATTRS)) {
  const combined = new Set(COMMON_ATTRS);
  for (const attr of specific) combined.add(attr);
  COMBINED_ATTRS.set(tag, combined);
}

const MODAL_FORM_TAGS = new Set([
  'input',
  'dropdown',
  'submit',
  'toggle',
  'slider',
]);

const INTERPOLATION_RE = /\{\{/;

/**
 * Shared layout generation for both <Form> and <Ui>.
 * Generates layout config with (s) => expr functions for content and params.
 * - For 'form' mode: validates tags and auto-detects ModalFormData/ActionFormData/MessageFormData
 * - For 'ui' mode: accepts all tags, always uses CustomForm
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

  // Collect child elements (recursively flatten nested groups)
  const elements: {
    arr: Record<string, string | boolean>;
    content: string;
    type: string;
    loc?: ParsedTagNode['loc'];
    for?: { variable: string; useSetup: string };
    if?: { useSetup: string };
  }[] = [];

  function collectElements(node: ParsedTagNode) {
    for (const child of node.content) {
      if (child.type !== 'TagNode') continue;

      if (child.content.some(i => i.type === 'TagNode')) {
        collectElements(child);
        continue;
      }

      // parse for — support both `in` and `of` keywords
      let _for: { variable: string; useSetup: string } | undefined;
      if (typeof child.arr.for === 'string') {
        const match = (child.arr.for as string).match(
          /^(\w+)\s+(?:in|of)\s+(\w+)$/,
        );
        if (match) {
          _for = { variable: match[1]!, useSetup: match[2]! };
        } else {
          internalCtx.rollupContext.error(
            `[${tagName}]: invalid for syntax, expected 'variable in|of propName'`,
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
  }

  collectElements(tagNode);

  // Build layout objects
  for (const el of elements) {
    const name = el.type;

    // Validate tag name
    const validTags = mode === 'ui' ? UI_TAGS : FORM_TAGS;
    if (!validTags.has(name)) {
      internalCtx.rollupContext.error(
        `[${tagName}]: don't support tag: ${name}`,
        el.loc
          ? { line: el.loc.start.line, column: el.loc.start.column }
          : void 0,
      );
      continue;
    }

    // Validate attributes using precomputed set
    const allowedAttrs = COMBINED_ATTRS.get(name);
    if (allowedAttrs) {
      for (const key of Object.keys(el.arr)) {
        if (key === 'for' || key === 'if') continue;
        if (!allowedAttrs.has(key)) {
          internalCtx.rollupContext.error(
            `[${tagName}]: tag '${name}' does not support attribute '${key}'`,
            el.loc
              ? { line: el.loc.start.line, column: el.loc.start.column }
              : void 0,
          );
        }
      }
    }

    // Track for auto-detection in form mode
    if (mode === 'form') {
      const formType = detectFormType(name);
      if (formType) typeTags.push(formType);
    }

    const _paramCtx = t.identifier('ctx');

    const paramsObj = t.objectExpression(
      Object.entries(el.arr)
        .filter(([key]) => key !== 'for' && key !== 'if')
        .map(([key, value]) => {
          const isDynamic = key.startsWith(':');
          const paramName = isDynamic ? key.slice(1) : key;
          if (paramName === 'click') {
            return t.objectProperty(
              t.identifier(paramName),
              simpleFn(String(value)),
            );
          }
          return t.objectProperty(
            t.identifier(paramName),
            isDynamic
              ? simpleFn(String(value))
              : t.arrowFunctionExpression(
                  [_paramCtx],
                  typeof value === 'boolean'
                    ? t.booleanLiteral(value)
                    : t.stringLiteral(value),
                ),
          );
        }),
    );

    // Content: parse {{ }} interpolation, supports mixed text + multiple interpolations
    const contentExpr =
      mode === 'form' ? parseContentForm(el.content) : parseContent(el.content);

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
  let formTypeStr: string;
  if (mode === 'form') {
    // For <Form> — auto-detect based on child tags or explicit type attr
    const explicitType = tagNode.arr.type;
    if (typeof explicitType === 'string') {
      const typeMap: Record<string, string> = {
        modal: 'ModalFormData',
        action: 'ActionFormData',
        message: 'MessageFormData',
      };
      formTypeStr = typeMap[explicitType] || 'ActionFormData';
    } else {
      formTypeStr = 'ActionFormData';
      if (typeTags.some(t => MODAL_FORM_TAGS.has(t))) {
        formTypeStr = 'ModalFormData';
      } else if (typeTags.includes('button-m')) {
        formTypeStr = 'MessageFormData';
      } else if (typeTags.includes('button')) {
        formTypeStr = 'ActionFormData';
      }
    }
  } else {
    // For <Ui> — always use CustomForm
    formTypeStr = 'CustomForm';
  }

  return { parsedObj, formTypeStr };
}

const SHARED_FORM_TAGS = new Set([
  'body',
  'divider',
  'title',
  'label',
  'header',
  'spacer',
  'close-button',
]);

function detectFormType(
  tag: string,
): 'modal' | 'message' | 'action' | 'shared' | 'invalid' | null {
  if (MODAL_FORM_TAGS.has(tag)) return 'modal';
  if (tag === 'button-m') return 'message';
  if (tag === 'button') return 'action';
  if (SHARED_FORM_TAGS.has(tag)) return 'shared';
  return 'invalid';
}

/** Simple arrow function for params (non-reactive): (ctx) => ctx[0].a.b.c */
function simpleFn(expr: string): t.ArrowFunctionExpression {
  const ctx = t.identifier('ctx');
  const body = dotAccess(expr, ctx);
  return t.arrowFunctionExpression([ctx], body);
}

/** Extract root identifiers from an expression for dependency tracking */
function extractIdentifiers(expr: string): string[] {
  const reserved = new Set([
    'true',
    'false',
    'null',
    'undefined',
    'this',
    'new',
    'typeof',
    'instanceof',
  ]);
  const ids = new Set<string>();
  const regex = /\b([a-zA-Z_$][\w$]*)\b/g;
  let m: RegExpExecArray | null;
  while ((m = regex.exec(expr)) !== null) {
    if (!reserved.has(m[1]!)) ids.add(m[1]!);
  }
  return [...ids];
}

/** Generate new Computation((ctx) => expr, [deps]) */
function arrowFn(expr: string): t.NewExpression {
  const ctx = t.identifier('ctx');
  const body = dotAccess(expr, ctx);
  const evalFn = t.arrowFunctionExpression([ctx], body);
  const ids = extractIdentifiers(expr);
  const deps = ids.map(id => {
    const c = t.identifier('ctx');
    return t.arrowFunctionExpression([c], dotAccess(id, c));
  });
  return t.newExpression(t.identifier('Computation'), [
    evalFn,
    t.arrayExpression(deps),
  ]);
}

/** Parse content for form mode: never creates Computation, uses plain functions */
function parseContentForm(raw: string): t.Expression {
  const ctx = t.identifier('ctx');

  if (!INTERPOLATION_RE.test(raw)) {
    return t.arrowFunctionExpression([ctx], t.stringLiteral(raw));
  }

  const parts = splitInterpolation(raw);

  if (parts.length === 1 && parts[0]?.type === 'expr') {
    return simpleFn(parts[0]?.value);
  }

  const quasis: t.TemplateElement[] = [];
  const expressions: t.Expression[] = [];

  for (const part of parts) {
    if (part.type === 'text') {
      quasis.push(t.templateElement({ raw: part.value, cooked: part.value }));
    } else {
      expressions.push(dotAccess(part.value, ctx));
    }
  }
  quasis.push(t.templateElement({ raw: '', cooked: '' }, true));

  const tpl = t.templateLiteral(quasis, expressions);
  return t.arrowFunctionExpression([ctx], tpl);
}

/**
 * Parse content string, returns an arrow function (ctx) => result:
 * - "Hello" → (ctx) => "Hello"
 * - "{{ a }}" → (ctx) => __mcx__str(ctx[0].a)
 * - "Hi {{ a }}" → (ctx) => `Hi ${__mcx__str(ctx[0].a)}`
 *
 * Interpolated expressions are wrapped in __mcx__str so Ref/Observable
 * values from setup are unwrapped instead of being stringified as
 * "[object Object]" by template literals.
 */
function parseContent(raw: string): t.Expression {
  const ctx = t.identifier('ctx');

  if (!INTERPOLATION_RE.test(raw)) {
    return t.arrowFunctionExpression([ctx], t.stringLiteral(raw));
  }

  const parts = splitInterpolation(raw);

  if (parts.length === 1 && parts[0]?.type === 'expr') {
    return t.arrowFunctionExpression(
      [ctx],
      unwrapStr(dotAccess(parts[0].value, ctx)),
    );
  }

  const quasis: t.TemplateElement[] = [];
  const expressions: t.Expression[] = [];

  for (const part of parts) {
    if (part.type === 'text') {
      quasis.push(t.templateElement({ raw: part.value, cooked: part.value }));
    } else {
      expressions.push(unwrapStr(dotAccess(part.value, ctx)));
    }
  }
  quasis.push(t.templateElement({ raw: '', cooked: '' }, true));

  const tpl = t.templateLiteral(quasis, expressions);
  return t.arrowFunctionExpression([ctx], tpl);
}

/** __mcx__str(expr): unwraps Ref/Observable values at runtime */
function unwrapStr(expr: t.Expression): t.Expression {
  return t.callExpression(t.identifier('__mcx__str'), [expr]);
}

type InterpolationPart =
  | { type: 'text'; value: string }
  | { type: 'expr'; value: string };

function splitInterpolation(raw: string): InterpolationPart[] {
  const result: InterpolationPart[] = [];
  const regex = /\{\{\s*(.*?)\s*\}\}/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(raw)) !== null) {
    // Text before this match
    if (match.index > lastIndex) {
      result.push({ type: 'text', value: raw.slice(lastIndex, match.index) });
    }
    // The expression
    result.push({ type: 'expr', value: match[1]! });
    lastIndex = regex.lastIndex;
  }
  // Trailing text
  if (lastIndex < raw.length) {
    result.push({ type: 'text', value: raw.slice(lastIndex) });
  }
  return result;
}

/** "a.b.c" → __ctx[SETUP_CTX_INDEX].a.b.c */
function dotAccess(expr: string, root: t.Identifier): t.Expression {
  const parts = expr.split('.');
  // First part accesses root[SETUP_CTX_INDEX] (the setup object)
  let node: t.Expression = t.memberExpression(
    root,
    t.numericLiteral(SETUP_CTX_INDEX),
    true,
  );
  for (const part of parts) {
    node = t.memberExpression(node, t.identifier(part));
  }
  return node;
}

/** Build the shared config object expression for both <Ui> and <Form> transforms */
export function buildUIConfig(
  ctx: transformParseCtx,
  tagNode: ParsedTagNode,
  tagName: string,
  mode: 'form' | 'ui',
): t.ObjectExpression {
  const { parsedObj, formTypeStr } = generateLayout(
    ctx,
    tagNode,
    tagName,
    mode,
  );
  return t.objectExpression([
    t.objectProperty(t.identifier('mode'), t.stringLiteral(mode)),
    t.objectProperty(t.identifier('layout'), t.arrayExpression(parsedObj)),
    t.objectProperty(
      t.identifier('use'),
      t.memberExpression(
        t.identifier('__minecraft__ui'),
        t.identifier(formTypeStr),
      ),
    ),
    t.objectProperty(t.identifier('UI'), t.identifier('__minecraft__ui')),
  ]);
}

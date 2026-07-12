import { ParsedTagNode, transformParseCtx } from '../../types';
import * as t from '@babel/types';
import config from '../config';

export async function Comp(ctx: transformParseCtx) {
  const internalCtx = ctx.ctx;

  ctx.impBody.push(
    t.importDeclaration(
      [t.importSpecifier(t.identifier('__mcx__ui'), t.identifier('ui'))],
      t.stringLiteral('@mbler/mcx'),
    ),
    t.importDeclaration(
      [t.importNamespaceSpecifier(t.identifier('__minecraft__ui'))],
      t.stringLiteral('@minecraft/server-ui'),
    ),
  );

  const uiTagNode = ctx.ctx.compiledCode.strLoc.UI;
  if (!uiTagNode || uiTagNode?.name !== 'Ui')
    throw new Error('[UI Component]: why did parent not verify?');

  // detect setup mode
  const setupMode = uiTagNode.arr.setup !== undefined;

  // Collect child elements
  const elements: {
    tag: string;
    attrs: Record<string, string | boolean>;
    content: string;
    loc?: ParsedTagNode['loc'];
  }[] = [];

  let titleContent: string | null = null;

  for (const child of uiTagNode.content) {
    if (child.type === 'TagNode') {
      if (child.content.some(i => i.type === 'TagNode')) {
        internalCtx.rollupContext.error(
          "[Ui]: can't support nested elements",
          child.loc
            ? { column: child.loc.start.column, line: child.loc.start.line }
            : void 0,
        );
      }
      const content = child.content
        .map(i => (i.type === 'TagContent' && i.data) || '')
        .join('');

      if (child.name === 'title') {
        titleContent = content;
      }

      elements.push({
        tag: child.name,
        attrs: child.arr,
        content,
        loc: child.loc,
      });
    }
  }

  // Build the create function body
  const createStmts: t.Statement[] = [];
  const setupIdent = t.identifier('__s');
  const playerIdent = t.identifier('player');
  const formIdent = t.identifier('form');

  // Resolve title: if {{ }} use setup value, else literal
  const titleExpr = titleContent
    ? (titleContent.startsWith('{{ ') && titleContent.endsWith(' }}')
        ? t.memberExpression(
            setupIdent,
            t.identifier(titleContent.slice(3, titleContent.length - 3).trim()),
          )
        : t.stringLiteral(titleContent))
    : t.stringLiteral('');

  // new CustomForm(player, title)
  createStmts.push(
    t.variableDeclaration('const', [
      t.variableDeclarator(
        formIdent,
        t.newExpression(
          t.memberExpression(
            t.identifier('__minecraft__ui'),
            t.identifier('CustomForm'),
          ),
          [playerIdent, titleExpr],
        ),
      ),
    ]),
  );

  // Mapping of tag names to CustomForm methods
  for (const el of elements) {
    if (el.tag === 'title') continue;

    const methodName = customFormMethodName(el.tag);
    if (!methodName) {
      internalCtx.rollupContext.error(
        "[Ui]: don't support tag: " + el.tag,
        el.loc
          ? { line: el.loc.start.line, column: el.loc.start.column }
          : void 0,
      );
      continue;
    }

    // Build arguments for the method call
    const args: t.Expression[] = [];

    // For different element types, resolve content and attributes
    switch (el.tag) {
      case 'input':
      case 'textField': {
        // label: from content ({{ }} resolved from setup, else literal)
        args.push(resolveContent(el.content, setupIdent));
        // value: from :value attribute or from content as observable ref
        const valueObs = resolveValueAttr(el.attrs, setupIdent, el.content);
        args.push(valueObs);
        // options
        const opts = buildOptions(el.attrs, setupIdent);
        if (opts) args.push(opts);
        break;
      }
      case 'toggle': {
        args.push(resolveContent(el.content, setupIdent));
        const toggledObs = resolveValueAttr(el.attrs, setupIdent, el.content);
        args.push(toggledObs);
        const opts = buildOptions(el.attrs, setupIdent);
        if (opts) args.push(opts);
        break;
      }
      case 'dropdown': {
        args.push(resolveContent(el.content, setupIdent));
        const dropdownObs = resolveValueAttr(el.attrs, setupIdent, el.content);
        args.push(dropdownObs);
        // items: from option attr (comma-separated) or :items from setup
        args.push(buildDropdownItems(el.attrs, setupIdent));
        const opts = buildOptions(el.attrs, setupIdent);
        if (opts) args.push(opts);
        break;
      }
      case 'slider': {
        args.push(resolveContent(el.content, setupIdent));
        const sliderObs = resolveValueAttr(el.attrs, setupIdent, el.content);
        args.push(sliderObs);
        args.push(resolveParamNumber(el.attrs.min, setupIdent, 0));
        args.push(resolveParamNumber(el.attrs.max, setupIdent, 100));
        const opts = buildOptions(el.attrs, setupIdent);
        if (opts) args.push(opts);
        break;
      }
      case 'button': {
        args.push(resolveContent(el.content, setupIdent));
        // onClick: from click attr
        args.push(resolveClickHandler(el.attrs, setupIdent));
        const opts = buildOptions(el.attrs, setupIdent);
        if (opts) args.push(opts);
        break;
      }
      case 'body':
      case 'label':
      case 'header': {
        args.push(resolveContent(el.content, setupIdent));
        const opts = buildOptions(el.attrs, setupIdent);
        if (opts) args.push(opts);
        break;
      }
      case 'divider':
      case 'spacer': {
        const opts = buildOptions(el.attrs, setupIdent);
        if (opts) args.push(opts);
        break;
      }
      case 'close-button': {
        // no arguments
        break;
      }
      default: {
        internalCtx.rollupContext.error(
          "[Ui]: don't support tag: " + el.tag,
          el.loc
            ? { line: el.loc.start.line, column: el.loc.start.column }
            : void 0,
        );
        continue;
      }
    }

    createStmts.push(
      t.expressionStatement(
        t.callExpression(
          t.memberExpression(formIdent, t.identifier(methodName)),
          args,
        ),
      ),
    );
  }

  // return form
  createStmts.push(t.returnStatement(formIdent));

  // Create the build function
  const buildFn = t.arrowFunctionExpression(
    [playerIdent, setupIdent],
    t.blockStatement(createStmts),
  );

  // The full config object for the runtime
  const finallyData = t.objectExpression([
    t.objectProperty(
      t.identifier('build'),
      buildFn,
    ),
    t.objectProperty(
      t.identifier('use'),
      t.memberExpression(
        t.identifier('__minecraft__ui'),
        t.identifier('CustomForm'),
      ),
    ),
    t.objectProperty(t.identifier('UI'), t.identifier('__minecraft__ui')),
  ]);

  ctx.app([
    t.objectProperty(
      t.identifier('ui'),
      t.newExpression(t.identifier('__mcx__ui'), [
        finallyData,
        t.identifier(config.scriptCompileFn),
      ]),
    ),
  ]);
}

/** Map MCX tag name to CustomForm method name */
function customFormMethodName(tag: string): string | null {
  const map: Record<string, string> = {
    input: 'textField',
    textField: 'textField',
    toggle: 'toggle',
    dropdown: 'dropdown',
    slider: 'slider',
    button: 'button',
    body: 'label',
    label: 'label',
    header: 'header',
    divider: 'divider',
    spacer: 'spacer',
    'close-button': 'closeButton',
  };
  return map[tag] ?? null;
}

/** Resolve {{ expr }} to setup.expr, otherwise literal string */
function resolveContent(
  content: string,
  setupIdent: t.Identifier,
): t.Expression {
  if (content.startsWith('{{ ') && content.endsWith(' }}')) {
    const expr = content.slice(3, content.length - 3).trim();
    // support dotted access like a.b.c
    const parts = expr.split('.');
    let member: t.Expression = setupIdent;
    for (const part of parts) {
      member = t.memberExpression(member, t.identifier(part));
    }
    return member;
  }
  return t.stringLiteral(content);
}

/** Resolve :value attr or content to an observable reference */
function resolveValueAttr(
  attrs: Record<string, string | boolean>,
  setupIdent: t.Identifier,
  content: string,
): t.Expression {
  // :value attr takes priority
  const valueKey = Object.keys(attrs).find(k => k === ':value' || k === 'value');
  if (valueKey) {
    const val = attrs[valueKey];
    if (valueKey.startsWith(':')) {
      // dynamic: value refers to setup property
      const parts = String(val).split('.');
      let member: t.Expression = setupIdent;
      for (const part of parts) {
        member = t.memberExpression(member, t.identifier(part));
      }
      return member;
    }
    // static: value is literal string (unlikely for observables)
    // but we still treat it as the observable name in setup
    const parts = String(val).split('.');
    let member: t.Expression = setupIdent;
    for (const part of parts) {
      member = t.memberExpression(member, t.identifier(part));
    }
    return member;
  }
  // fallback: content as observable reference
  if (content.startsWith('{{ ') && content.endsWith(' }}')) {
    const expr = content.slice(3, content.length - 3).trim();
    const parts = expr.split('.');
    let member: t.Expression = setupIdent;
    for (const part of parts) {
      member = t.memberExpression(member, t.identifier(part));
    }
    return member;
  }
  // content is literal, use it as property name on setup
  const parts = content.split('.');
  let member: t.Expression = setupIdent;
  for (const part of parts) {
    member = t.memberExpression(member, t.identifier(part));
  }
  return member;
}

/** Resolve click handler: string name resolved from setup */
function resolveClickHandler(
  attrs: Record<string, string | boolean>,
  setupIdent: t.Identifier,
): t.Expression {
  const clickVal = attrs.click || attrs[':click'];
  if (clickVal && typeof clickVal === 'string') {
    if (typeof attrs.click === 'string' && !attrs[':click']) {
      // static: click="handlerName" → setup.handlerName
      const parts = clickVal.split('.');
      let member: t.Expression = setupIdent;
      for (const part of parts) {
        member = t.memberExpression(member, t.identifier(part));
      }
      return t.arrowFunctionExpression([], member);
    }
    // dynamic: :click="name" → setup[name]
    const parts = clickVal.split('.');
    let member: t.Expression = setupIdent;
    for (const part of parts) {
      member = t.memberExpression(member, t.identifier(part));
    }
    return t.arrowFunctionExpression([], member);
  }
  // no handler: empty function
  return t.arrowFunctionExpression([], t.blockStatement([]));
}

/** Resolve a number param: could be static or :dynamic from setup */
function resolveParamNumber(
  val: string | boolean | undefined,
  setupIdent: t.Identifier,
  defaultVal: number,
): t.Expression {
  if (val === undefined || val === true || val === false) {
    return t.numericLiteral(defaultVal);
  }
  const str = String(val);
  const num = parseFloat(str);
  if (!isNaN(num)) return t.numericLiteral(num);
  // assume it's a setup property reference
  const parts = str.split('.');
  let member: t.Expression = setupIdent;
  for (const part of parts) {
    member = t.memberExpression(member, t.identifier(part));
  }
  return member;
}

/** Build dropdown items array */
function buildDropdownItems(
  attrs: Record<string, string | boolean>,
  setupIdent: t.Identifier,
): t.Expression {
  const optionVal = attrs.option || attrs[':option'];
  if (optionVal && typeof optionVal === 'string') {
    if (typeof attrs.option === 'string' && !attrs[':option']) {
      // static: option="a,b,c"
      const items = optionVal.split(',').map((item, idx) =>
        t.objectExpression([
          t.objectProperty(t.identifier('label'), t.stringLiteral(item.trim())),
          t.objectProperty(t.identifier('value'), t.numericLiteral(idx)),
        ]),
      );
      return t.arrayExpression(items);
    }
    // dynamic: :option="itemsVar" → setup.itemsVar
    const parts = optionVal.split('.');
    let member: t.Expression = setupIdent;
    for (const part of parts) {
      member = t.memberExpression(member, t.identifier(part));
    }
    return member;
  }
  return t.arrayExpression([]);
}

/** Build options object for elements */
function buildOptions(
  attrs: Record<string, string | boolean>,
  setupIdent: t.Identifier,
): t.ObjectExpression | null {
  const optProps: t.ObjectProperty[] = [];

  // supported option keys per CustomForm options interfaces
  const optionKeys = ['disabled', 'visible', 'description', 'tooltip', 'step'];

  for (const key of optionKeys) {
    const val = attrs[key] || attrs[`:${key}`];
    if (val === undefined) continue;

    if (key.startsWith(':')) {
      // dynamic
      const cleanKey = key.slice(1);
      optProps.push(
        t.objectProperty(
          t.identifier(cleanKey),
          resolveToSetup(String(val), setupIdent),
        ),
      );
    } else if (key === 'step') {
      optProps.push(
        t.objectProperty(
          t.identifier(key),
          t.numericLiteral(parseFloat(String(val)) || 1),
        ),
      );
    } else {
      optProps.push(
        t.objectProperty(
          t.identifier(key),
          typeof val === 'boolean' ? t.booleanLiteral(val) : t.stringLiteral(String(val)),
        ),
      );
    }
  }

  // tooltip
  const tipVal = attrs.tip || attrs[':tip'];
  if (tipVal && typeof tipVal === 'string') {
    optProps.push(
      t.objectProperty(
        t.identifier('tooltip'),
        typeof attrs.tip === 'string' && !attrs[':tip']
          ? t.stringLiteral(tipVal)
          : resolveToSetup(tipVal, setupIdent),
      ),
    );
  }

  if (optProps.length === 0) return null;
  return t.objectExpression(optProps);
}

/** Resolve a string to setup.x.y.z */
function resolveToSetup(
  expr: string,
  setupIdent: t.Identifier,
): t.Expression {
  const parts = expr.split('.');
  let member: t.Expression = setupIdent;
  for (const part of parts) {
    member = t.memberExpression(member, t.identifier(part));
  }
  return member;
}

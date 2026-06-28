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
    throw new Error("[UI Component]: why didn't parent compeled verify?");
  let MCXUIType: 'ActionFormData' | 'MessageFormData' | 'ModalFormData' | null =
    null;
  const UITree: {
    arr: Record<string, string | boolean>;
    content: string;
    type: string;
    loc?: ParsedTagNode['loc'];
    for?: { variable: string; useProp: string };
    if?: { useProp: string };
  }[] = [];
  for (const uiClientTag of uiTagNode.content) {
    if (uiClientTag.type == 'TagNode') {
      // if has client TagNode
      if (uiClientTag.content.some(i => i.type == 'TagNode')) {
        internalCtx.rollupContext.error(
          "[UI]: can't support ui client element",
          uiClientTag.loc
            ? {
                column: uiClientTag.loc.start.column,
                line: uiClientTag.loc.start.line,
              }
            : void 0,
        );
      }
      // parse for attribute
      let _for: { variable: string; useProp: string } | undefined;
      if (typeof uiClientTag.arr.for === 'string') {
        const match = (uiClientTag.arr.for as string).match(
          /^(\w+)\s+in\s+(\w+)$/,
        );
        if (match) {
          _for = { variable: match[1]!, useProp: match[2]! };
        } else {
          internalCtx.rollupContext.error(
            "[UI]: invalid for syntax, expected 'variable in propName'",
            uiClientTag.loc
              ? {
                  column: uiClientTag.loc.start.column,
                  line: uiClientTag.loc.start.line,
                }
              : void 0,
          );
        }
      }
      // parse if attribute
      let _if: { useProp: string } | undefined;
      if (typeof uiClientTag.arr.if === 'string') {
        _if = { useProp: uiClientTag.arr.if as string };
      }
      // add to tree
      UITree.push({
        arr: uiClientTag.arr,
        content: uiClientTag.content
          .map(i => (i.type == 'TagContent' && i.data) || '')
          .join(''),
        type: uiClientTag.name,
        loc: uiClientTag.loc,
        ...(_for ? { for: _for } : {}),
        ...(_if ? { if: _if } : {}),
      });
    }
    // continue TagContentNode
  }
  const parsedObj: t.Expression[] = [];
  function pushToTree(
    name: string,
    params: Record<string, string | boolean>,
    content: string,
    _for?: { variable: string; useProp: string },
    _if?: { useProp: string },
  ) {
    const props: t.ObjectProperty[] = [
      t.objectProperty(t.identifier('type'), t.stringLiteral(name)),
      t.objectProperty(
        t.identifier('params'),
        t.objectExpression(
          Object.entries(params).map(([key, value]) => {
            const isDynamic = key.startsWith(':');
            const paramName = isDynamic ? key.slice(1) : key;
            return t.objectProperty(
              t.identifier(paramName),
              isDynamic
                ? t.objectExpression([
                    t.objectProperty(
                      t.identifier('useProp'),
                      t.stringLiteral(String(value)),
                    ),
                  ])
                : typeof value == 'boolean'
                  ? t.booleanLiteral(value)
                  : t.stringLiteral(value),
            );
          }),
        ),
      ),
      t.objectProperty(
        t.identifier('content'),
        content.startsWith('{{ ') && content.endsWith(' }}')
          ? t.objectExpression([
              t.objectProperty(
                t.identifier('useProp'),
                t.stringLiteral(content.slice(3, content.length - 3).trim()),
              ),
            ])
          : t.stringLiteral(content),
      ),
    ];
    if (_for) {
      props.push(
        t.objectProperty(
          t.identifier('for'),
          t.objectExpression([
            t.objectProperty(
              t.identifier('variable'),
              t.stringLiteral(_for.variable),
            ),
            t.objectProperty(
              t.identifier('useProp'),
              t.stringLiteral(_for.useProp),
            ),
          ]),
        ),
      );
    }
    if (_if) {
      props.push(
        t.objectProperty(
          t.identifier('if'),
          t.objectExpression([
            t.objectProperty(
              t.identifier('useProp'),
              t.stringLiteral(_if.useProp),
            ),
          ]),
        ),
      );
    }
    parsedObj.push(t.objectExpression(props));
  }
  // generate type and parsed tree
  for (const tp of UITree) {
    const name = tp.type;
    // strip 'for' and 'if' from regular params so they don't appear in both params and top-level
    const cleanedArr = { ...tp.arr };
    delete cleanedArr.for;
    delete cleanedArr.if;
    // only ModalFormData Element
    if (['input', 'dropdown', 'submit', 'toggle', 'slider'].includes(name)) {
      // ModalFromData
      if (MCXUIType && MCXUIType !== 'ModalFormData') {
        internalCtx.rollupContext.error(
          "[UI]: a mcx can't have a ModalFormData Node and other form tag",
          tp.loc
            ? {
                line: tp.loc.start.line,
                column: tp.loc.start.column,
              }
            : void 0,
        );
      }
      MCXUIType = 'ModalFormData';
      pushToTree(name, cleanedArr, tp.content, tp.for, tp.if);
    }
    // only MessageFormData Element
    else if (['button-m'].includes(name)) {
      if (MCXUIType && MCXUIType !== 'MessageFormData') {
        internalCtx.rollupContext.error(
          '[UI]: ',
          tp.loc
            ? {
                line: tp.loc.start.line,
                column: tp.loc.start.column,
              }
            : void 0,
        );
      }
      MCXUIType = 'MessageFormData';
      pushToTree(name, cleanedArr, tp.content, tp.for, tp.if);
    }
    // public
    else if (['body', 'divider', 'title', 'label'].includes(name)) {
      pushToTree(name, cleanedArr, tp.content, tp.for, tp.if);
    } else if (name == 'button') {
      if (MCXUIType !== 'ActionFormData' && MCXUIType)
        internalCtx.rollupContext.error(
          "[UI]: don't support use button for messageFormData",
          tp.loc
            ? {
                line: tp.loc.start.line,
                column: tp.loc.start.column,
              }
            : void 0,
        );
      pushToTree(name, cleanedArr, tp.content, tp.for, tp.if);
      MCXUIType = 'ActionFormData';
    } else {
      internalCtx.rollupContext.error(
        "[UI]: don't support tag: " + name,
        tp.loc
          ? {
              line: tp.loc.start.line,
              column: tp.loc.start.column,
            }
          : void 0,
      );
    }
  }
  if (!MCXUIType) MCXUIType = 'ActionFormData';
  const finallyData = t.objectExpression([
    t.objectProperty(t.identifier('layout'), t.arrayExpression(parsedObj)),
    t.objectProperty(
      t.identifier('use'),
      t.memberExpression(
        t.identifier('__minecraft__ui'),
        t.identifier(MCXUIType),
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

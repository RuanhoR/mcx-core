import { MCXstructureLoc } from '../../compile-mcx/types';
import { ContentToken, ParsedTagNode, transformParseCtx } from '../../types';
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
  let MCXUIType: 'ActionFromData' | 'MessageFormData' | 'ModalFormData' | null =
    null;
  const UITree: {
    arr: Record<string, string | boolean>;
    content: string;
    type: string;
    loc?: ParsedTagNode['loc'];
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
      // add to tree
      UITree.push({
        arr: uiClientTag.arr,
        content: uiClientTag.content
          .map(i => (i.type == 'TagContent' && i.data) || '')
          .join(''),
        type: uiClientTag.name,
        loc: uiClientTag.loc,
      });
    }
    // continue TagContentNode
  }
  const parsedObj: t.Expression[] = [];
  function pushToTree(
    name: string,
    params: Record<string, string | boolean>,
    content: string,
  ) {
    parsedObj.push(
      t.objectExpression([
        t.objectProperty(t.identifier('type'), t.stringLiteral(name)),
        t.objectProperty(
          t.identifier('params'),
          t.objectExpression(
            Object.entries(params).map(i => {
              return t.objectProperty(
                t.identifier(i[0]),
                typeof i[1] == 'boolean'
                  ? t.booleanLiteral(i[1])
                  : t.stringLiteral(i[1]),
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
      ]),
    );
  }
  // generate type and parsed tree
  for (const tp of UITree) {
    const name = tp.type;
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
      pushToTree(name, tp.arr, tp.content);
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
      pushToTree(name, tp.arr, tp.content);
    }
    // public
    else if (['body', 'divider', 'title', 'label'].includes(name)) {
      pushToTree(name, tp.arr, tp.content);
    } else if (name == 'button') {
      if (MCXUIType !== 'ActionFromData' && MCXUIType)
        internalCtx.rollupContext.error(
          "[UI]: don't support use button for messageFormData",
          tp.loc
            ? {
                line: tp.loc.start.line,
                column: tp.loc.start.column,
              }
            : void 0,
        );
      pushToTree(name, tp.arr, tp.content);
      MCXUIType = 'ActionFromData';
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
  if (!MCXUIType) MCXUIType = 'ActionFromData';
  const finallyData = t.objectExpression([
    t.objectProperty(t.identifier('layout'), t.arrayExpression(parsedObj)),
    t.objectProperty(
      t.identifier('use'),
      t.memberExpression(
        t.identifier('__minecraft__ui'),
        t.identifier(MCXUIType),
      ),
    ),
    t.objectProperty(t.identifier('_UI'), t.identifier('__minecraft__ui')),
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

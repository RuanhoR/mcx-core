import { transformParseCtx } from '../../types';
import * as t from '@babel/types';
import config from '../config';
import { buildUIConfig } from './layout';

export async function Comp(ctx: transformParseCtx) {
  ctx.impBody.push(
    t.importDeclaration(
      [t.importSpecifier(t.identifier('__mcx__ui'), t.identifier('ui')),
        t.importSpecifier(t.identifier('Computation'), t.identifier('Computation'))],
      t.stringLiteral('@mbler/mcx'),
    ),
    t.importDeclaration(
      [t.importNamespaceSpecifier(t.identifier('__minecraft__ui'))],
      t.stringLiteral('@minecraft/server-ui'),
    ),
  );

  const tagNode = ctx.ctx.compiledCode.strLoc.UI;
  if (!tagNode || tagNode.name !== 'Ui')
    throw new Error('[UI Component]: why did parent not verify?');

  const configObj = buildUIConfig(ctx, tagNode, 'Ui', 'ui');

  ctx.app([
    t.objectProperty(
      t.identifier('ui'),
      t.newExpression(t.identifier('__mcx__ui'), [
        configObj,
        t.identifier(config.scriptCompileFn),
      ]),
    ),
  ]);
}

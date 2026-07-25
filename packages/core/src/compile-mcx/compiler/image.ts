import * as generator from '@babel/generator';
import * as t from '@babel/types';
export const IMAGE_EXTS = new Set(['.png', '.svg', '.jpg', '.jpeg', '.gif']);
export function createImageTransformCode(id: string, fileExt: string) {
  const program = t.program([
    t.variableDeclaration('var', [
      t.variableDeclarator(
        t.identifier('__'),
        t.callExpression(t.identifier('require'), [
          t.stringLiteral('@mbler/mcx-component'),
        ]),
      ),
    ]),
    t.expressionStatement(
      t.assignmentExpression(
        '=',
        t.memberExpression(t.identifier('module'), t.identifier('exports')),
        t.newExpression(
          t.memberExpression(
            t.identifier('__'),
            t.identifier(
              {
                png: 'PNGImageComponent',
                jpg: 'JPGImageComponent',
                jpeg: 'JPGImageComponent',
                svg: 'SVGImageComponent',
                gif: 'GIFImageComponent',
              }[fileExt.slice(1)] as string,
            ),
          ),
          [t.stringLiteral(id)],
        ),
      ),
    ),
  ]);

  return generator.generate(program).code;
}

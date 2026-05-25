import { mkdir, writeFile } from 'node:fs/promises'
import { MCXCompileData } from '../compile-mcx/compiler/compileData'
import { execESMMethod, RunScript } from './vm'
import path from 'node:path'
import lib from './lib'
import { MCXstructureLocComponentType } from '../compile-mcx/types'
import McxUtlis from '../utils'
import { transformCtx } from '../types'
import * as t from '@babel/types'
export async function compileComponent(
  compiledCode: MCXCompileData,
  ctx: transformCtx,
) {
  const component = compiledCode.strLoc.Component
  const src = compiledCode.strLoc.script
  // run component in vm(no console and more)
  const scriptRunResult = (await new RunScript(compiledCode.File, 'esm').run(
    src,
    execESMMethod.transformCjs,
    (data, setData) => {
      if (
        setData &&
        data.type == 'CallExpression' &&
        data.callee.type == 'Identifier' &&
        data.arguments.length == 1 &&
        data.arguments[0]?.type == 'CallExpression' &&
        data.arguments[0].callee.type == 'Identifier' &&
        data.arguments[0].callee.name == 'require'
      ) {
        const callRequire = data.arguments[0]
        const arg = callRequire.arguments[0]
        if (arg && arg.type == 'StringLiteral') {
          if (/^.+?\.(png|svg|jpg|jpeg|gif)$/.test(arg.value)) {
            const imageComponentRequire = t.memberExpression(
              t.callExpression(t.identifier('require'), [
                t.stringLiteral('@mbler/mcx-core'),
              ]),
              t.identifier(
                {
                  png: 'PNGImageComponent',
                  svg: 'SVGImageComponent',
                  jpg: 'JPGImageComponent',
                  jpeg: 'JPGImageComponent',
                  gif: 'GIFImageComponent',
                }[path.extname(arg.value).slice(1)] as string,
              ),
            )
            const finishExpression = t.newExpression(imageComponentRequire, [
              t.callExpression(
                t.memberExpression(
                  t.callExpression(t.identifier('require'), [
                    t.stringLiteral('node:path'),
                  ]),
                  t.identifier('join'),
                ),
                [t.stringLiteral(path.dirname(compiledCode.File)), arg],
              ),
            ])
            setData(finishExpression)
          }
        }
      }
    },
  )) as Record<
    string,
    InstanceType<(typeof lib)[MCXstructureLocComponentType]> | undefined
  >
  // check have export
  if (!component)
    throw new Error(
      '[component internal error]: compile component: mcx is not component: filePath: ' +
        compiledCode.File,
    )
  if (typeof scriptRunResult !== 'object')
    throw new Error(
      '[component compile error]: exec code: mcx export type is not object',
    )
  for (const i of Object.entries(component)) {
    const filePoint = path.join(ctx.output.behavior, i[0])
    // check the file point is child of behavior output
    if (!path.relative(filePoint, ctx.output.behavior).startsWith('..'))
      throw new Error('[component]: Path Traversal: path: ' + filePoint)
    const pointExport = i[1].useExpore
    // export data
    const pointData = scriptRunResult[pointExport] as InstanceType<
      (typeof lib)[keyof typeof lib]
    >
    if (!pointExport /* || !(pointData instanceof pointComponentClass) */) {
      throw new Error(
        '[component]: compile: check: not found Component class of file: ' +
          compiledCode.File,
      )
    }
    // check dir exists
    if (!(await McxUtlis.FileExsit(path.dirname(filePoint)))) {
      mkdir(path.dirname(filePoint), {
        recursive: true,
      })
    }
    // write file
    await writeFile(filePoint, JSON.stringify(pointData.toJSON(), null, 2))
  }
}
export * from './vm'
export {
  ItemComponent,
  EntityComponent,
  BlockComponent,
  PNGImageComponent,
  SVGImageComponent,
  GIFImageComponent,
  JPGImageComponent,
} from './lib'

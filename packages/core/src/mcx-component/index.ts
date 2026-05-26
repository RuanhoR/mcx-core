import { cp, mkdir, readFile, writeFile } from 'node:fs/promises'
import { MCXCompileData } from '../compile-mcx/compiler/compileData'
import { execESMMethod, RunScript } from './vm'
import path from 'node:path'
import lib from './lib'
import { MCXstructureLocComponentType } from '../compile-mcx/types'
import { transformCtx } from '../types'
import * as t from '@babel/types'
import type { BaseJSON, EditFileBindSourceExpression, FilePoint } from './types'
import { existsSync } from 'node:fs'
const cachedOption = {} as Record<
  EditFileBindSourceExpression['bind'],
  string[] | string | [string, string][]
>
export function resolveFilePoint(point: FilePoint, ctx: transformCtx) {
  if (point.base == 'root') {
    return path.resolve(point.file)
  } else if (point.base == 'behavior') {
    return path.join(ctx.output.behavior, point.file)
  } else if (point.base == 'resources') {
    return path.join(ctx.output.resources, point.file)
  }
  throw new Error('[mcx component]: invaild FilePoint Base')
}
export async function execEdit(
  option: BaseJSON['_meta']['file_edit'],
  ctx: transformCtx,
) {
  if (!option) return
  for (const editOption of option) {
    if (editOption.type == 'batch') {
      // batch -> call base
      execEdit(editOption.options, ctx)
    } else {
      if (editOption.type == 'copy_assets') {
        await cp(
          resolveFilePoint(editOption.source, ctx),
          resolveFilePoint(editOption.output, ctx),
          {
            recursive: true,
            force: true,
          },
        )
      } else if (editOption.type == 'edit') {
        // first exec expression
        const defineVars = {} as Record<string, string>
        for (const varDefine of Object.entries(editOption.expression.define)) {
          const value = varDefine[1]
          if (value.from == 'var') {
            defineVars[varDefine[0]] = value.data
          } else {
            const fileContent = await readFile(
              resolveFilePoint(value.data, ctx),
              'utf-8',
            )
            defineVars[varDefine[0]] = fileContent || value.default || ''
          }
        }
        const execResult = await editOption.expression.run(defineVars)
        // if editOption.source == FilePoint
        if ('file' in editOption.source) {
          const filePath = resolveFilePoint(editOption.source, ctx)
          await writeFile(filePath, execResult.toString())
        }
        if ('bind' in editOption.source) {
          if (editOption.source.type == 'append') {
          }
        }
      }
    }
  }
}
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
    if (
      !pointExport /* || !(pointData instanceof pointComponentClass)  (note: vm class is not instance of ComponentClass)*/
    ) {
      throw new Error(
        '[component]: compile: check: not found Component class of file: ' +
          compiledCode.File,
      )
    }
    // check dir exists
    if (!existsSync(path.dirname(filePoint))) {
      mkdir(path.dirname(filePoint), {
        recursive: true,
      })
    }
    const json = pointData.toJSON() as BaseJSON
    if (
      !json._meta ||
      !json._meta.type ||
      (json._meta.type !== 'item' && json._meta.type !== 'entity')
    )
      throw new Error('[mcx component]: not mcx json component: unkown type')
    if (json._meta.file_edit) execEdit(json._meta.file_edit, ctx)
    // write file
    await writeFile(filePoint, JSON.stringify(json, null, 2))
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

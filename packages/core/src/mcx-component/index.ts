import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { MCXCompileData } from '../compile-mcx/compiler/compileData'
import { execESMMethod, RunScript } from './vm'
import path from 'node:path'
import zlib from 'node:zlib'
import lib from './lib'
import { MCXstructureLocComponentType } from '../compile-mcx/types'
import McxUtlis from '../utils'
import { transformCtx } from '../types'
import * as t from '@babel/types'
export async function compileComponent(
  compiledCode: MCXCompileData,
  ctx: transformCtx,
) {
  const crc32 = (buf: Buffer) => {
    let crc = ~0
    for (let i = 0; i < buf.length; i++) {
      crc ^= buf[i] as number
      for (let j = 0; j < 8; j++) {
        crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1))
      }
    }
    return (~crc >>> 0) as number
  }
  const pngChunk = (type: string, data: Buffer) => {
    const typeBuf = Buffer.from(type)
    const lenBuf = Buffer.alloc(4)
    lenBuf.writeUInt32BE(data.length, 0)
    const crcBuf = Buffer.alloc(4)
    crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0)
    return Buffer.concat([lenBuf, typeBuf, data, crcBuf])
  }
  const createSolidPng = (hexColor: string) => {
    const color = hexColor.replace('#', '')
    const rgb =
      color.length === 3
        ? color
            .split('')
            .map((c) => c + c)
            .join('')
        : color
    const r = parseInt(rgb.slice(0, 2), 16)
    const g = parseInt(rgb.slice(2, 4), 16)
    const b = parseInt(rgb.slice(4, 6), 16)
    const signature = Buffer.from('89504e470d0a1a0a', 'hex')
    const ihdr = Buffer.alloc(13)
    ihdr.writeUInt32BE(1, 0)
    ihdr.writeUInt32BE(1, 4)
    ihdr[8] = 8
    ihdr[9] = 6
    const idat = zlib.deflateSync(Buffer.from([0, r, g, b, 255]))
    return Buffer.concat([
      signature,
      pngChunk('IHDR', ihdr),
      pngChunk('IDAT', idat),
      pngChunk('IEND', Buffer.alloc(0)),
    ])
  }
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
    const jsonData = pointData.toJSON() as any
    const iconComp =
      jsonData['minecraft:item']?.components?.['minecraft:icon']?.textures
    if (typeof iconComp == 'string' && /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(iconComp)) {
      const id = jsonData['minecraft:item'].description.identifier
      const texKey = `${id.replace(/[:/]/g, '_')}_icon`
      const texFile = path.join(ctx.output.resources, 'textures', 'items', `${texKey}.png`)
      const itemTextureFile = path.join(ctx.output.resources, 'textures', 'item_texture.json')
      if (!(await McxUtlis.FileExsit(path.dirname(texFile)))) {
        await mkdir(path.dirname(texFile), { recursive: true })
      }
      await writeFile(texFile, createSolidPng(iconComp))
      const textureJson = (await McxUtlis.FileExsit(itemTextureFile))
        ? JSON.parse(await readFile(itemTextureFile, 'utf-8'))
        : { resource_pack_name: 'vanilla', texture_name: 'atlas.items', texture_data: {} }
      textureJson.texture_data = textureJson.texture_data || {}
      textureJson.texture_data[texKey] = { textures: `textures/items/${texKey}` }
      await writeFile(itemTextureFile, JSON.stringify(textureJson, null, 2))
      jsonData['minecraft:item'].components['minecraft:icon'] = { textures: texKey }
    }
    // write file
    await writeFile(filePoint, JSON.stringify(jsonData, null, 2))
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

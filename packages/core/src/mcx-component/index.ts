import { cp, mkdir, readFile, writeFile } from 'node:fs/promises';
import { MCXCompileData } from '../compile-mcx/compiler/compileData';
import { execESMMethod, RunScript } from './vm';
import path from 'node:path';
import lib from './lib';
import { MCXstructureLocComponentType } from '../compile-mcx/types';
import { transformCtx } from '../types';
import * as t from '@babel/types';
import type { BaseJson, FilePoint } from './types';
import { existsSync, readFileSync } from 'node:fs';

let cachedOption: Record<string, string[] | [string, string][]> = {};

/** Clear all cached bind options (called between builds) */
export function clearCachedOptions() {
  cachedOption = {};
}

export function resolveFilePoint(point: FilePoint, ctx: transformCtx) {
  if (point.base == 'root') {
    return path.resolve(point.file);
  } else if (point.base == 'behavior') {
    return path.join(ctx.output.behavior, point.file);
  } else if (point.base == 'resources') {
    return path.join(ctx.output.resources, point.file);
  }
  throw new Error('[mcx component]: invaild FilePoint Base');
}
export async function execEdit(
  option: BaseJson['_meta']['file_edit'],
  ctx: transformCtx,
) {
  if (!option) return;
  for (const editOption of option) {
    if (editOption.type == 'batch') {
      await execEdit(editOption.options, ctx);
    } else {
      if (editOption.type == 'copy_assets') {
        await cp(
          resolveFilePoint(editOption.source, ctx),
          resolveFilePoint(editOption.output, ctx),
          {
            recursive: true,
            force: true,
          },
        );
      } else if (editOption.type == 'edit') {
        const defineVars = {} as Record<string, string>;
        for (const [key, entry] of Object.entries(
          editOption.expression.define,
        )) {
          const value = entry as
            | { from: 'var'; data: string }
            | { from: 'read_file'; data: FilePoint; default?: string };
          if (value.from == 'var') {
            defineVars[key] = value.data;
          } else {
            const fileContent = await readFile(
              resolveFilePoint(value.data, ctx),
              'utf-8',
            );
            defineVars[key] = fileContent || value.default || '';
          }
        }
        const execResult = await editOption.expression.run(defineVars);
        if ('file' in editOption.source) {
          const filePath = resolveFilePoint(editOption.source, ctx);
          await writeFile(filePath, execResult.toString());
        }
        if ('bind' in editOption.source) {
          if (
            editOption.source.bind == 'item_texture' &&
            editOption.source.type == 'append'
          ) {
            if (!cachedOption['item_texture'])
              cachedOption['item_texture'] = [];
            if (Array.isArray(execResult)) {
              cachedOption['item_texture'] = [
                ...(cachedOption['item_texture'] as [string, string][]),
                ...(execResult as [string, string][]),
              ];
            }
          }
        }
      }
    }
  }
}

/**
 * Generate the final textures/item_texture.json from accumulated bind data.
 * Call this in the plugin's buildEnd / onEnd hook.
 */
export async function generateItemTextureJson(output: {
  resources: string;
}): Promise<void> {
  const entries = cachedOption['item_texture'] as
    | [string, string][]
    | undefined;
  if (!entries || entries.length === 0) return;

  const dir = path.join(output.resources, 'textures');
  const filePath = path.join(dir, 'item_texture.json');

  const data: {
    resource_pack_name: string;
    texture_name: string;
    texture_data: Record<string, { textures: string }>;
  } = {
    resource_pack_name: 'mcx.pack.v.',
    texture_name: 'atlas.items',
    texture_data: {},
  };

  try {
    const existing = JSON.parse(readFileSync(filePath, 'utf-8'));
    if (existing.texture_data) {
      data.texture_data = existing.texture_data;
    }
  } catch {
    // File doesn't exist yet, use default
  }

  for (const [key, textures] of entries) {
    data.texture_data[key] = { textures };
  }

  await mkdir(dir, { recursive: true });
  await writeFile(filePath, JSON.stringify(data, null, 2));
}

export async function compileComponent(
  compiledCode: MCXCompileData,
  ctx: transformCtx,
) {
  const component = compiledCode.strLoc.Component;
  const src = compiledCode.strLoc.script;
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
        const callRequire = data.arguments[0];
        const arg = callRequire.arguments[0];
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
            );
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
            ]);
            setData(finishExpression);
          }
        }
      }
    },
  )) as Record<
    string,
    InstanceType<(typeof lib)[MCXstructureLocComponentType]> | undefined
  >;
  if (!component)
    throw new Error(
      '[component internal error]: compile component: mcx is not component: filePath: ' +
        compiledCode.File,
    );
  if (typeof scriptRunResult !== 'object')
    throw new Error(
      '[component compile error]: exec code: mcx export type is not object',
    );
  for (const i of Object.entries(component)) {
    const filePoint = path.join(ctx.output.behavior, i[0]);
    if (!path.relative(filePoint, ctx.output.behavior).startsWith('..'))
      throw new Error('[component]: Path Traversal: path: ' + filePoint);
    const pointExport = i[1].useExpore;
    const pointData = scriptRunResult[pointExport] as InstanceType<
      (typeof lib)[keyof typeof lib]
    >;
    if (!pointExport) {
      throw new Error(
        '[component]: compile: check: not found Component class of file: ' +
          compiledCode.File,
      );
    }
    if (!existsSync(path.dirname(filePoint))) {
      await mkdir(path.dirname(filePoint), {
        recursive: true,
      });
    }
    const json = pointData.toJSON() as BaseJson;
    if (
      !json._meta ||
      !json._meta.type ||
      (json._meta.type !== 'item' && json._meta.type !== 'entity')
    )
      throw new Error('[mcx component]: not mcx json component: unkown type');
    if (json._meta.file_edit) await execEdit(json._meta.file_edit, ctx);
    delete (json as unknown as Record<string, string>)['_meta'];
    await writeFile(filePoint, JSON.stringify(json, null, 2));
  }
}
export * from './vm';
export {
  ItemComponent,
  EntityComponent,
  BlockComponent,
  PNGImageComponent,
  SVGImageComponent,
  GIFImageComponent,
  JPGImageComponent,
} from './lib';

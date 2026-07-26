import { mkdir, writeFile } from 'node:fs/promises';
import { MCXCompileData } from '../compile-mcx/compiler/compileData';
import { execESMMethod, RunScript } from './vm';
import * as path from 'node:path';
import { MCXstructureLocComponentType } from '../compile-mcx/types';
import { transformCtx } from '../types';
import { existsSync } from 'node:fs';
import type { BaseJson } from './types';
import type { ItemComponent } from '@mbler/mcx-component/item';
import type { BlockComponent } from '@mbler/mcx-component/block';
import type { EntityComponent } from '@mbler/mcx-component/entity';
import { execEdit } from './fileEdit';
import { collectExportSources, checkComponentImports } from './importScan';
export { clearCachedOptions } from './cache';
export { resolveFilePoint, execEdit } from './fileEdit';
export { collectExportSources, checkComponentImports } from './importScan';
export { generateItemTextureJson } from './texture';
export * from './vm';

/**
 * Compile a single MCX component: parse its source, validate imports, execute
 * the script in a VM, then iterate over each declared component to produce
 * its JSON output file.
 */
export async function compileComponent(
  compiledCode: MCXCompileData,
  ctx: transformCtx,
) {
  const component = compiledCode.strLoc.Component;
  const src = compiledCode.strLoc.script;

  const exportSources = collectExportSources(src);
  checkComponentImports(exportSources, compiledCode.File);

  const scriptRunResult = (await new RunScript(compiledCode.File, 'esm').run(
    src,
    execESMMethod.transformCjs,
  )) as Record<
    string,
    InstanceType<typeof ItemComponent | typeof BlockComponent | typeof EntityComponent> | undefined
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

  for (const [entryKey, entryData] of Object.entries(component)) {
    const filePoint = path.join(ctx.output.behavior, entryKey);

    if (!path.relative(filePoint, ctx.output.behavior).startsWith('..'))
      throw new Error('[component]: Path Traversal: path: ' + filePoint);

    const pointExport = entryData.useExport;
    const pointData = scriptRunResult[pointExport] as InstanceType<
      typeof ItemComponent | typeof BlockComponent | typeof EntityComponent
    >;
    if (!pointExport) {
      throw new Error(
        '[component]: compile: check: not found Component class of file: ' +
          compiledCode.File,
      );
    }

    if (!existsSync(path.dirname(filePoint))) {
      await mkdir(path.dirname(filePoint), { recursive: true });
    }

    const json = pointData.toJSON() as unknown as BaseJson;
    if (
      !json._meta ||
      !json._meta.type ||
      !['item', 'entity'].includes(json._meta.type)
    )
      throw new Error('[mcx component]: not mcx json component: unknown type');

    if (json._meta.file_edit) {
      const isMcxCoreSource = Object.values(exportSources).some(
        src => src && src.startsWith('@mbler/mcx-component'),
      );
      await execEdit(json._meta.file_edit, ctx, isMcxCoreSource);
    }

    delete (json as unknown as Record<string, string>)['_meta'];
    await writeFile(filePoint, JSON.stringify(json, null, 2));
  }
}

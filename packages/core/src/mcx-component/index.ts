import { mkdir, writeFile } from 'node:fs/promises';
import { MCXCompileData } from '../compile-mcx/compiler/compileData';
import { execESMMethod, RunScript } from './vm';
import * as path from 'node:path';
import {
  MCXstructureLocComponentType,
  _MCXComponentGroupOutputDir,
} from '../compile-mcx/types';
import { transformCtx } from '../types';
import { existsSync } from 'node:fs';
import type { BaseJson } from './types';
import type {
  ItemComponent,
  BlockComponent,
  EntityComponent,
} from '@mbler/mcx-component';
import { execEdit } from './fileEdit';
import { collectExportSources, checkComponentImports } from './importScan';
export { clearCachedOptions } from './cache';
export { resolveFilePoint, execEdit } from './fileEdit';
export { collectExportSources, checkComponentImports } from './importScan';
export { generateItemTextureJson, generateTerrainTextureJson } from './texture';
export * from './vm';
export {
  MINECRAFT_MOCK,
  MINECRAFT_MOCK_SCOPE,
  createMock,
} from './minecraftMock';

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
    | InstanceType<
        typeof ItemComponent | typeof BlockComponent | typeof EntityComponent
      >
    | undefined
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

  for (const [componentKey, entryData] of Object.entries(component)) {
    // component keys look like "<group>/<file>.json" (e.g. "blocks/x.json");
    // some groups write to a different directory than their group name
    // (trade tables live under "trading/").
    const slash = componentKey.indexOf('/');
    const groupKey = componentKey.slice(0, slash);
    const fileName = componentKey.slice(slash + 1);
    const dir =
      _MCXComponentGroupOutputDir[
        groupKey as keyof typeof _MCXComponentGroupOutputDir
      ] ?? groupKey;
    const entryKey = `${dir}/${fileName}`;
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
      entryData.type === 'recipe' ||
      entryData.type === 'lootTable' ||
      entryData.type === 'tradeTable' ||
      entryData.type === 'feature' ||
      entryData.type === 'featureRule' ||
      entryData.type == 'itemCatalog'
    ) {
      // these component types have no _meta wrapper
      if ('_meta' in json) {
        throw new Error(
          '[mcx component]: recipe component must not contain _meta',
        );
      }
    } else if (!json._meta || json._meta.type !== entryData.type) {
      throw new Error(
        `[mcx component]: not mcx json component: expected type "${entryData.type}"`,
      );
    }

    if (json._meta?.file_edit) {
      const isMcxCoreSource = Object.values(exportSources).some(
        src => src && src.startsWith('@mbler/mcx-component'),
      );
      await execEdit(json._meta.file_edit, ctx, isMcxCoreSource);
    }

    delete (json as unknown as Record<string, string>)['_meta'];
    await writeFile(filePoint, JSON.stringify(json, null, 2));
  }
}

import { cp, readFile, writeFile } from 'node:fs/promises';
import * as path from 'node:path';
import { transformCtx } from '../types';
import type { BaseJson, FilePoint } from './types';
import { getCachedOption } from './cache';

const MAX_FILE_WRITES = 5;
const MAX_FILE_READS = 1;

/**
 * Resolve a FilePoint to an absolute path on disk.
 *
 * - `base: 'root'` is only allowed when the calling component originates from
 *   @mbler/mcx-component (the `sourceIsMcxCore` flag). This prevents third-party
 *   components from reading arbitrary filesystem locations.
 * - For `behavior` / `resources`, the file is resolved relative to the
 *   corresponding output directory. A path-traversal check ensures the resolved
 *   path does not escape the base directory (e.g. via `../`).
 */
export function resolveFilePoint(
  point: FilePoint,
  ctx: transformCtx,
  sourceIsMcxCore = false,
) {
  if (point.base === 'root') {
    if (!sourceIsMcxCore) {
      throw new Error(
        '[mcx component]: "root" base is only allowed for components imported from @mbler/mcx-component',
      );
    }
    return path.resolve(point.file);
  }
  let baseDir: string;
  if (point.base === 'behavior') {
    baseDir = ctx.output.behavior;
  } else if (point.base === 'resources') {
    baseDir = ctx.output.resources;
  } else {
    throw new Error('[mcx component]: invalid FilePoint Base');
  }
  const resolved = path.resolve(baseDir, point.file);
  if (!resolved.startsWith(path.resolve(baseDir))) {
    throw new Error('[mcx component]: Path Traversal detected: ' + point.file);
  }
  return resolved;
}

/**
 * Execute file_edit operations defined in a component's _meta.
 * Delegates to execEditInternal with a fresh limits counter.
 */
export async function execEdit(
  option: BaseJson['_meta']['file_edit'],
  ctx: transformCtx,
  isMcxCoreSource = false,
) {
  if (!option) return;
  const limits = { writeCount: 0, readCount: 0 };
  await execEditInternal(option, ctx, limits, isMcxCoreSource);
}

async function execEditInternal(
  option: BaseJson['_meta']['file_edit'],
  ctx: transformCtx,
  limits: { writeCount: number; readCount: number },
  isMcxCoreSource: boolean,
) {
  if (!option) return;
  const cachedOption = getCachedOption();

  for (const editOption of option) {
    if (editOption.type == 'batch') {
      await execEditInternal(editOption.options, ctx, limits, isMcxCoreSource);
    } else if (editOption.type == 'copy_assets') {
      await cp(
        resolveFilePoint(editOption.source, ctx, isMcxCoreSource),
        resolveFilePoint(editOption.output, ctx, isMcxCoreSource),
        { recursive: true, force: true },
      );
    } else if (editOption.type == 'edit') {
      const defineVars = {} as Record<string, string>;
      for (const [key, entry] of Object.entries(editOption.expression.define)) {
        const value = entry as
          | { from: 'var'; data: string }
          | { from: 'read_file'; data: FilePoint; default?: string };
        if (value.from == 'var') {
          defineVars[key] = value.data;
        } else {
          if (!isMcxCoreSource) {
            limits.readCount++;
            if (limits.readCount > MAX_FILE_READS) {
              throw new Error(
                `[mcx component]: File read limit exceeded (max ${MAX_FILE_READS})`,
              );
            }
          }
          const fileContent = await readFile(
            resolveFilePoint(value.data, ctx, isMcxCoreSource),
            'utf-8',
          );
          defineVars[key] = fileContent || value.default || '';
        }
      }
      const execResult = await editOption.expression.run(defineVars);

      if ('file' in editOption.source) {
        if (!isMcxCoreSource) {
          limits.writeCount++;
          if (limits.writeCount > MAX_FILE_WRITES) {
            throw new Error(
              `[mcx component]: File write limit exceeded (max ${MAX_FILE_WRITES})`,
            );
          }
        }
        const filePath = resolveFilePoint(editOption.source, ctx, isMcxCoreSource);
        await writeFile(filePath, execResult.toString());
      } else if ('bind' in editOption.source) {
        if (
          editOption.source.bind == 'item_texture' &&
          editOption.source.type == 'append'
        ) {
          if (!Array.isArray(execResult))
            throw new Error(
              '[mcx component]: json._meta.file_edit: error exec result',
            );
          if (!cachedOption['item_texture'])
            cachedOption['item_texture'] = [];
          cachedOption['item_texture'] = [
            ...(cachedOption['item_texture'] as [string, string][]),
            ...(execResult as [string, string][]),
          ];
        }
      } else {
        throw new Error(
          '[mcx component]: json._meta.file_edit: unknown output place.',
        );
      }
    }
  }
}

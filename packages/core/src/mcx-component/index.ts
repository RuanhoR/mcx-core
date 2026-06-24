import { cp, mkdir, readFile, writeFile } from 'node:fs/promises';
import { MCXCompileData } from '../compile-mcx/compiler/compileData';
import { execESMMethod, RunScript } from './vm';
import path from 'node:path';
import lib from '@mbler/mcx-component';
import { MCXstructureLocComponentType } from '../compile-mcx/types';
import { transformCtx } from '../types';
import * as t from '@babel/types';
import type { BaseJson, FilePoint } from './types';
import { existsSync, readFileSync } from 'node:fs';
import { parse } from '@babel/parser';
import { styleText } from 'node:util';

/** Accumulated bind data (e.g. item_texture entries) across all components in a build. */
let cachedOption: Record<string, string[] | [string, string][]> = {};

/**
 * Security limits for file I/O operations inside file_edit expressions.
 * Components from @mbler/mcx-core are exempt from these limits.
 */
const MAX_FILE_WRITES = 5;
const MAX_FILE_READS = 1;

/** Clear all cached bind options (called between builds). */
export function clearCachedOptions() {
  cachedOption = {};
}

/**
 * Resolve a FilePoint to an absolute path on disk.
 *
 * - `base: 'root'` is only allowed when the calling component originates from
 *   @mbler/mcx-core (the `sourceIsMcxCore` flag). This prevents third-party
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
  // "root" base: resolve the file path directly against cwd. Only internal
  // mcx-core components are trusted to use this — third-party components
  // would gain unrestricted filesystem access otherwise.
  if (point.base === 'root') {
    if (!sourceIsMcxCore) {
      throw new Error(
        '[mcx component]: "root" base is only allowed for components imported from @mbler/mcx-core',
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
  // Path traversal guard: after resolving, the result must still be inside the
  // base directory. If the file contains "../" that escapes the root, the
  // startsWith check will fail.
  if (!resolved.startsWith(path.resolve(baseDir))) {
    throw new Error('[mcx component]: Path Traversal detected: ' + point.file);
  }
  return resolved;
}

/**
 * Maps each locally-bound identifier name to the package it was imported from.
 * Built by walking the AST of the component source code.
 *
 * Example:
 *   import { ItemComponent } from '@mbler/mcx-core'
 *   → { ItemComponent: '@mbler/mcx-core' }
 *
 *   const { SomeHelper } = require('some-lib')
 *   → { SomeHelper: 'some-lib' }
 */
type ExportSourceMap = Record<string, string>;

/**
 * Walk the component source AST and build a mapping from local variable names
 * to the npm package they were imported/required from.
 *
 * Covers three import patterns:
 * 1. ES module named/default/namespace imports:  import { X } from 'pkg'
 * 2. CommonJS direct require:                    const X = require('pkg')
 * 3. CommonJS destructured require:              const { X } = require('pkg')
 *    which desugars to a MemberExpression in the AST.
 */
function collectExportSources(code: string): ExportSourceMap {
  const sources: ExportSourceMap = {};
  let ast: ReturnType<typeof parse>;
  try {
    ast = parse(code, {
      sourceType: 'module',
      plugins: ['typescript', 'jsx'],
    });
  } catch {
    // Parse failure is non-fatal — return empty map and skip the check.
    return sources;
  }

  function walk(node: t.Node) {
    if (!node) return;

    // Pattern 1: ES module import declarations.
    // e.g. import { ItemComponent, EntityComponent as Entity } from '@mbler/mcx-core'
    if (t.isImportDeclaration(node)) {
      const pkg =
        typeof node.source.value === 'string' ? node.source.value : '';
      for (const spec of node.specifiers) {
        if (t.isImportSpecifier(spec)) {
          // Named import — local.name is the locally bound name,
          // imported.name is the original export name.
          const importedName = t.isIdentifier(spec.imported)
            ? spec.imported.name
            : (spec.imported as t.StringLiteral).value;
          const localName = spec.local.name;
          sources[localName] = pkg;
        } else if (t.isImportDefaultSpecifier(spec)) {
          // import Default from 'pkg'
          sources[spec.local.name] = pkg;
        } else if (t.isImportNamespaceSpecifier(spec)) {
          // import * as ns from 'pkg'
          sources[spec.local.name] = pkg;
        }
      }
    }

    // Patterns 2 & 3: CommonJS require calls inside variable declarations.
    if (t.isVariableDeclaration(node)) {
      for (const decl of node.declarations) {
        // Pattern 2: const X = require('pkg')
        if (
          t.isIdentifier(decl.id) &&
          decl.init &&
          t.isCallExpression(decl.init) &&
          t.isIdentifier(decl.init.callee, { name: 'require' }) &&
          decl.init.arguments.length === 1 &&
          t.isStringLiteral(decl.init.arguments[0])
        ) {
          sources[decl.id.name] = decl.init.arguments[0].value;
        }
        // Pattern 3: const { X } = require('pkg')
        // In the AST this becomes:
        //   VariableDeclarator {
        //     id: Identifier(X),
        //     init: CallExpression {
        //       callee: MemberExpression {
        //         object: CallExpression { callee: require, arguments: ['pkg'] },
        //         property: Identifier(X)
        //       }
        //     }
        //   }
        if (
          t.isIdentifier(decl.id) &&
          decl.init &&
          t.isCallExpression(decl.init) &&
          t.isMemberExpression(decl.init.callee) &&
          t.isCallExpression(decl.init.callee.object) &&
          t.isIdentifier(decl.init.callee.object.callee, { name: 'require' }) &&
          decl.init.callee.object.arguments.length === 1 &&
          t.isStringLiteral(decl.init.callee.object.arguments[0])
        ) {
          sources[decl.id.name] = decl.init.callee.object.arguments[0].value;
        }
      }
    }

    // Generic AST traversal using @babel/types VISITOR_KEYS.
    for (const key of t.VISITOR_KEYS[node.type] || []) {
      const child = (node as unknown as Record<string, unknown>)[key];
      if (Array.isArray(child)) {
        for (const item of child) {
          if (item && typeof item === 'object' && (item as t.Node).type) {
            walk(item as t.Node);
          }
        }
      } else if (child && typeof child === 'object' && (child as t.Node).type) {
        walk(child as t.Node);
      }
    }
  }
  walk(ast.program);
  return sources;
}

/**
 * Validate that the component only imports from @mbler/mcx-core.
 * Non-mcx-core imports are collected and each unique offending package
 * triggers a console warning (once per package per file).
 * Relative imports ('./...', '../...') are silently allowed.
 */
function checkComponentImports(sources: ExportSourceMap, filePath: string) {
  const allowedPackage = '@mbler/mcx-core';
  const warned = new Set<string>();
  for (const [, pkg] of Object.entries(sources)) {
    if (
      pkg &&
      !pkg.startsWith(allowedPackage) &&
      !pkg.startsWith('.') &&
      !warned.has(pkg)
    ) {
      warned.add(pkg);
      console.warn(
        `[${styleText('red', 'mcx component warning')}]: "${pkg}" in ${filePath} is not from "${allowedPackage}". Only imports/requires from "${allowedPackage}" are recommended.`,
      );
    }
  }
}

/**
 * Execute file_edit operations defined in a component's _meta.
 * Delegates to execEditInternal with a fresh limits counter.
 *
 * @param isMcxCoreSource - when true, the component originates from
 *   @mbler/mcx-core and is exempt from file I/O limits and root base
 *   restrictions.
 */
export async function execEdit(
  option: BaseJson['_meta']['file_edit'],
  ctx: transformCtx,
  isMcxCoreSource = false,
) {
  if (!option) return;
  // Shared mutable limits object passed through recursive batch calls so that
  // the total write/read count across the entire file_edit tree is enforced.
  const limits = { writeCount: 0, readCount: 0 };
  await execEditInternal(option, ctx, limits, isMcxCoreSource);
}

/**
 * Internal recursive implementation of execEdit.
 * Handles three editOption types:
 *   - batch: recursively processes a nested array of options
 *   - copy_assets: copies a file from source to output via FilePoint resolution
 *   - edit: evaluates an expression with define vars, then writes to a file or
 *     appends to a bind target (e.g. item_texture)
 *
 * File I/O limits (writes ≤ 5, reads ≤ 1) are enforced on the limits object
 * but skipped entirely when isMcxCoreSource is true.
 */
async function execEditInternal(
  option: BaseJson['_meta']['file_edit'],
  ctx: transformCtx,
  limits: { writeCount: number; readCount: number },
  isMcxCoreSource: boolean,
) {
  if (!option) return;
  for (const editOption of option) {
    if (editOption.type == 'batch') {
      // Recurse into nested batch — limits object is shared so counts persist.
      await execEditInternal(editOption.options, ctx, limits, isMcxCoreSource);
    } else {
      if (editOption.type == 'copy_assets') {
        // copy_assets: resolve both source and output paths, then copy.
        await cp(
          resolveFilePoint(editOption.source, ctx, isMcxCoreSource),
          resolveFilePoint(editOption.output, ctx, isMcxCoreSource),
          {
            recursive: true,
            force: true,
          },
        );
      } else if (editOption.type == 'edit') {
        // edit: build the define variables map from the expression config,
        // then run the expression to produce the output content.
        const defineVars = {} as Record<string, string>;
        for (const [key, entry] of Object.entries(
          editOption.expression.define,
        )) {
          const value = entry as
            | { from: 'var'; data: string }
            | { from: 'read_file'; data: FilePoint; default?: string };
          if (value.from == 'var') {
            // Simple variable reference — just pass through the string value.
            defineVars[key] = value.data;
          } else {
            // File read — enforce the read limit for non-mcx-core sources.
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

        // If the target is a file on disk, write the result and enforce write limit.
        if ('file' in editOption.source) {
          if (!isMcxCoreSource) {
            limits.writeCount++;
            if (limits.writeCount > MAX_FILE_WRITES) {
              throw new Error(
                `[mcx component]: File write limit exceeded (max ${MAX_FILE_WRITES})`,
              );
            }
          }
          const filePath = resolveFilePoint(
            editOption.source,
            ctx,
            isMcxCoreSource,
          );
          await writeFile(filePath, execResult.toString());
        }

        // If the target is a bind slot (e.g. item_texture), accumulate entries.
        if ('bind' in editOption.source) {
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
            if (Array.isArray(execResult)) {
              cachedOption['item_texture'] = [
                ...(cachedOption['item_texture'] as [string, string][]),
                ...(execResult as [string, string][]),
              ];
            }
          }
        } else {
          throw new Error(
            '[mcx component]: json._meta.file_edit: unknown output place.',
          );
        }
      }
    }
  }
}

/**
 * Generate the final textures/item_texture.json from accumulated bind data.
 * Call this in the plugin's buildEnd / onEnd hook.
 * Merges with any existing item_texture.json in the output directory.
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

  // Merge with existing data if the file already exists from a prior run.
  try {
    const existing = JSON.parse(readFileSync(filePath, 'utf-8'));
    if (existing.texture_data) {
      data.texture_data = existing.texture_data;
    }
  } catch {
    // File doesn't exist yet, use default empty data.
  }

  for (const [key, textures] of entries) {
    data.texture_data[key] = { textures };
  }

  await mkdir(dir, { recursive: true });
  await writeFile(filePath, JSON.stringify(data, null, 2));
}

/**
 * Compile a single MCX component: parse its source, validate imports, execute
 * the script in a VM, then iterate over each declared component to produce
 * its JSON output file.
 *
 * Security measures applied before VM execution:
 * 1. collectExportSources — maps each import to its source package
 * 2. checkComponentImports — warns on non-mcx-core dependencies
 *
 * Per-component restrictions (checked after VM execution):
 * - path traversal guard on the output file point
 * - root base: only allowed if the export came from @mbler/mcx-core
 * - file write limit (≤5) and read limit (≤1): only enforced for
 *   non-mcx-core components
 */
export async function compileComponent(
  compiledCode: MCXCompileData,
  ctx: transformCtx,
) {
  const component = compiledCode.strLoc.Component;
  const src = compiledCode.strLoc.script;

  // Pre-flight: scan imports and build the export → source package map.
  // This is used both for import validation and for per-component restriction
  // decisions later.
  const exportSources = collectExportSources(src);
  checkComponentImports(exportSources, compiledCode.File);

  // Execute the component script in a VM. The transformCjsHook rewrites
  // image file requires (e.g. require('./icon.png')) into
  // require('@mbler/mcx-core').PNGImageComponent(require('node:path').join(...))
  // so that image assets are handled by the mcx-core ImageComponent classes.
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

  // Iterate over each declared component entry and produce its output JSON.
  for (const i of Object.entries(component)) {
    const filePoint = path.join(ctx.output.behavior, i[0]);

    // Path traversal check: the resolved output must stay inside the behavior dir.
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

    // Ensure the output directory exists before writing.
    if (!existsSync(path.dirname(filePoint))) {
      await mkdir(path.dirname(filePoint), {
        recursive: true,
      });
    }

    const json = pointData.toJSON() as BaseJson;
    if (
      !json._meta ||
      !json._meta.type ||
      !['item', 'entity'].includes(json._meta.type)
    )
      throw new Error('[mcx component]: not mcx json component: unknown type');

    if (json._meta.file_edit) {
      // Determine if THIS specific export comes from @mbler/mcx-core.
      // If yes, the component is trusted and bypasses file I/O limits
      // and root base restrictions. If not, restrictions apply.
      const isMcxCoreSource = (exportSources[pointExport] ?? '').startsWith(
        '@mbler/mcx-core',
      );
      await execEdit(json._meta.file_edit, ctx, isMcxCoreSource);
    }

    // Strip the internal _meta field before writing the final JSON.
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
} from '@mbler/mcx-component';

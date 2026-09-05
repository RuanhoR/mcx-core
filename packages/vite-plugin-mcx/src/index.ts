import { createHash } from 'node:crypto';
import * as nodeFs from 'node:fs';
import * as path from 'node:path';
import type { Plugin } from 'vite';
import type { Plugin as RollupPlugin } from 'rollup';
import { rollupPlugin, setGlobalFS } from '@mbler/mcx-core';
import type { CompileOpt } from '@mbler/mcx-types';

export type { CompileOpt };

/** Output directories consumed by @mbler/mcx-core (same shape mbler passes). */
export interface McxOutputDirs {
  dist: string;
  behavior: string;
  resources: string;
}

type LooseHook = (this: unknown, ...args: unknown[]) => unknown;

function unwrapHook(hook: unknown): LooseHook | undefined {
  if (!hook) return undefined;
  return typeof hook === 'function'
    ? (hook as LooseHook)
    : ((hook as { handler: unknown }).handler as LooseHook);
}

/**
 * Wrap `@mbler/mcx-core`'s rollup plugin for Vite/Vitest without changing core:
 * - only `.mcx` modules enter the inner transform, so `.ts` files and images
 *   keep using Vite's own esbuild/asset pipeline;
 * - `resolveId` failures fall through to the host resolver instead of throwing;
 * - the inner plugin is rebuilt when a `.mcx` file's content changes, so
 *   watch mode never serves stale results from the inner per-id cache;
 * - `buildEnd` side effects (texture JSON generation) are never forwarded.
 */
export function mcxPlugin(
  opt: CompileOpt,
  output: McxOutputDirs,
): Plugin {
  // core >= 1.1.5-dev.1 requires the host to inject its fs module
  setGlobalFS(nodeFs);
  let inner: RollupPlugin = rollupPlugin(opt, output);
  let innerResolveId = unwrapHook(inner.resolveId);
  let innerTransform = unwrapHook(inner.transform);
  // id -> hash of the last source seen, to detect watch-mode edits
  const seen = new Map<string, string>();
  const isMcx = (id: string) => path.extname(id).toLowerCase() === '.mcx';

  const rebuild = () => {
    inner = rollupPlugin(opt, output);
    innerResolveId = unwrapHook(inner.resolveId);
    innerTransform = unwrapHook(inner.transform);
  };

  const plugin: Plugin = {
    name: 'mcx-vite-plugin',
    async resolveId(id: string, importer: string | undefined) {
      // bare ids may map into opt.moduleDir (e.g. the @mbler/mcx runtime);
      // everything else is left to Vite's resolver
      if (!importer || id.startsWith('.') || path.isAbsolute(id)) {
        return null;
      }
      try {
        const result = (await innerResolveId?.call(
          undefined,
          id,
          importer,
        )) as string | null | undefined;
        return result ?? null;
      } catch {
        return null;
      }
    },
    buildStart() {
      seen.clear();
    },
  };
  // assigned separately: Vite's TransformPluginContext type is stricter than
  // the rollup context core's hook expects, and `this` must pass through
  (plugin as { transform: unknown }).transform = {
    handler(this: unknown, code: string, id: string) {
      if (!isMcx(id)) return null;
      const hash = createHash('sha256').update(code).digest('hex');
      const prev = seen.get(id);
      if (prev !== undefined && prev !== hash) {
        rebuild();
      }
      seen.set(id, hash);
      return innerTransform!.call(this, code, id);
    },
  };
  return plugin;
}

export default mcxPlugin;

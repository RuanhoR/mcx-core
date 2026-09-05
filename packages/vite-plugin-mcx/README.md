# @mbler/vite-plugin-mcx

Vite/Vitest plugin for `.mcx` files — lets tests import compiled MCX modules directly:

```ts
import event from './event.mcx';
```

It wraps `@mbler/mcx-core`'s `rollupPlugin` without modifying core:

- only `.mcx` modules go through the inner transform, so `.ts` files and images keep using Vite's own esbuild/asset pipeline;
- `resolveId` failures fall through to the host resolver instead of throwing (bare ids still resolve against `moduleDir`);
- the inner compile cache is invalidated when a `.mcx` file changes, so watch mode never serves stale output;
- `buildEnd` side effects (texture JSON generation) are never forwarded.

## Install

```bash
pnpm add -D @mbler/vite-plugin-mcx
```

## Usage

```ts
// vitest.config.ts
import ts from 'typescript';
import { defineConfig } from 'vitest/config';
import { mcxPlugin } from '@mbler/vite-plugin-mcx';

export default defineConfig({
  plugins: [
    mcxPlugin(
      {
        moduleDir: 'behavior/modules', // where bare ids like @mbler/mcx resolve
        tsconfigPath: 'tsconfig.json',
        sourcemap: false,
        ts,
      },
      // output dirs required by mcx-core; use throwaway paths for tests
      { dist: '.mcx-out', behavior: '.mcx-out', resources: '.mcx-out' },
    ),
  ],
  test: { /* ... */ },
});
```

The same plugin works in `vite.config.ts` for regular Vite builds.

## Notes

- core >= 1.1.5-dev.1 requires the host to inject its fs module; this plugin calls `setGlobalFS` for you.
- For TypeScript, add a module declaration:

```ts
declare module '*.mcx' {
  const mod: { type: string; setup?: (...args: unknown[]) => unknown; app?: Record<string, unknown> };
  export default mod;
}
```

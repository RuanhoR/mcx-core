# MCX Core — Agent Guide

Monorepo for **MCX**, a DSL that compiles `.mcx` files into Minecraft Bedrock Edition addon JSON/JS (components, UI, events). pnpm workspace, ESM everywhere, Node >=22.

## Workspace packages (6, all in `packages/`)

- `core/` — `@mbler/mcx-core` — the DSL compiler (parser → AST → Babel transform → codegen). Entry `src/index.ts`.
- `client/` — `@mbler/mcx` — runtime framework (`createApp`, `Event`, `ui`).
- `mcx-component/` — `@mbler/mcx-component` — component runtime classes (Item/Block/Entity + image components) instantiated at compile time. Often overlooked because it has no dedicated section in older docs.
- `types/` — `@mbler/mcx-types` — pure `.d.ts` declarations. **Has no build, no tests, excluded from lint and `check`.** Do not add runtime code here.
- `create-mbler/` — CLI scaffolding tool (`cac` + `inquirer`). Entry `bin/create-mbler.js`. Generates projects with `type-check: mcx-tsc` (adds `mcx-tsc` to the generated project's devDependencies).
- `mcx-tsc/` — `mcx-tsc` (unscoped) — standalone MCX type-checker binary. Was split out of `mbler`; uses `@volar/typescript`'s `runTsc` + `@mbler/mcx-server`'s `createMCXLanguagePlugin`. Entry `src/index.ts`, bin `bin/mcx-tsc.cjs`.

## Commands

```bash
pnpm install            # also installs git hooks (simple-git-hooks)
pnpm build              # pnpm -r build  (rolldown -c per package)
pnpm test               # root `vitest run` — runs ALL package tests once
pnpm lint:packages      # pnpm -r lint   (eslint per package)
pnpm lint:packages:fix  # pnpm -r lint:fix
pnpm format             # prettier --write on core/client/types/create-mbler src only (NOT mcx-component)
pnpm check              # test + lint:packages + tsc --noEmit on core/client/create-mbler ONLY (excludes types & mcx-component)
```

`mcx-tsc` is **not** type-checked by `check` (the `tsc --noEmit` filter list covers only `@mbler/mcx-core`, `@mbler/mcx`, `create-mbler`, `@mbler/mcx-component`) and has no tests — run `pnpm --filter=mcx-tsc exec tsc --noEmit` manually when touching it.

Single-package / focused runs:
```bash
pnpm --filter=@mbler/mcx-core test
pnpm --filter=@mbler/mcx-core exec vitest run path/to/spec   # run one spec
pnpm --filter=@mbler/mcx-core build
```

## Gotchas an agent will miss

- **Test directory is `__test__/`, not `tests/`.** This is what ESLint's config globs for (`packages/**/__test__/**`). Don't create `tests/`.
- **`pnpm test` is root `vitest run`, not `pnpm -r`.** It uses the root vitest config to run every package's `__test__`.
- **`check` does not typecheck `types` or `mcx-component`** and **`format` skips `mcx-component`**. If you touch those, typecheck/build them explicitly.
- **`types/` package is declarations-only** and is ignored by ESLint (config ignores `packages/types/**`). Adding `.ts` source there will break expectations.
- **`mcx-tsc/` has no tests and is excluded from `check`'s tsc filter and `format`.** Its runtime deps (`@volar/typescript`, `@mbler/mcx-server`, `typescript`) must stay in `dependencies`, not devDependencies, since the published bin resolves `typescript/lib/tsc` via `createRequire`.
- **Commit messages are enforced** by `scripts/verify-commit.js` (commit-msg hook): must match `^(feat|fix|docs|...)(\(.+\))?: .{1,50}`. Wrong format aborts the commit.
- **ESLint is deliberately quiet**: only `@typescript-eslint/no-explicit-any: error` and `prefer-const: error` are on; `no-unused-vars`, `no-console` are OFF. Don't "fix" disabled rules or assume a clean lint means no unused vars.
- **Prettier config**: `semi: true`, `singleQuote: true`, `arrowParens: 'avoid'`.
- **No comments / no console.log in production code** (convention, not lint-enforced).

## Compiler architecture (non-obvious wiring)

- Pipeline: `.mcx` source → `compileMCXFn()` parser → `MCXCompileData` → `transform()` (Babel AST) → compiled JS.
- `packages/core/src/transforms/main.ts` `_transform()` detects file type (`component` | `event` | `ui` | `app`) by content and routes to a handler.
- Components are executed at compile time: `src/mcx-component/vm.ts` (`RunScript`, `BLOCKED_MODULES`, path-traversal guards, `MAX_FILE_WRITES=5`, `MAX_FILE_READS=1`) + `cjsTransform.ts` (`transformESMToCJS`). `require('./icon.png')` is rewritten to an `ImageComponent` constructor call.
- Compiler depends on `@vue/compiler-core` / `@vue/compiler-sfc` (template parsing) in addition to Babel — not just Babel.
- Build plugins: `rollupPlugin` / `rolldownPlugin` wrap `createMcxPlugin` (`resolveId` + `transform` hooks). `rolldown` is the actual bundler; `rollup` is peer-only.

## Publishing

`@mbler/mcx-core`, `@mbler/mcx`, `@mbler/mcx-types`, `@mbler/mcx-component` publish to npm under `@mbler` (public). `create-mbler` and `mcx-tsc` publish under their own unscoped names (also public). Publish with `pnpm publish --tag latest` (from the package directory or with `--filter`). `mcx-tsc` must be published before `create-mbler` releases that reference it, since `create-mbler` resolves its version from the npm registry at scaffold time.

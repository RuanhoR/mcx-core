# MCX Core — Agent Guide

## Project Overview

**mcx-core** is the core monorepo for **MCX**, a domain-specific language (DSL) for building Minecraft Bedrock Edition (MCBE) addons. It compiles `.mcx` files into MCBE-compatible JSON components, UI, and event systems.

GitHub: https://github.com/Ruanhor/mcx-core

## Monorepo Structure (pnpm workspace)

```
mcx-core/
├── packages/
│   ├── core/              # @mbler/mcx-core — DSL compiler (parser → AST → transform → codegen)
│   ├── client/            # @mbler/mcx — runtime framework (createApp, Event, UI)
│   ├── types/             # @mbler/mcx-types — shared TypeScript type declarations
│   ├── mcx-component/     # @mbler/mcx-component — component runtime classes (Item, Block, Entity, Image)
│   └── create-mbler/      # create-mbler — CLI scaffolding tool for new mbler projects
├── changelog/             # Release notes (next.md, v0.0.1-alpha.md, v0.0.1.md)
├── docs/                  # README translations (zh, ja, ko) + TODO.md
├── scripts/               # verify-commit.js (commit-msg hook)
├── eslint.config.js       # ESLint flat config
├── .simple-git-hooks.mjs  # Git hooks configuration
└── pnpm-workspace.yaml    # Workspace package definitions
```

## Package Details

### `@mbler/mcx-core` (packages/core) — v0.1.2-rc.7

The compiler. Entry: `src/index.ts` exports `AST`, `compiler`, `utils`, `transform`, `compile_component`, `rollupPlugin`, `rolldownPlugin`, `PubType`, `ComponentType`, plus re-exports all component classes from `@mbler/mcx-component` (`ItemComponent`, `BlockComponent`, `EntityComponent`, `PNGImageComponent`, `JPGImageComponent`, `SVGImageComponent`, `GIFImageComponent`).

- **src/ast/** — AST node definitions (tag, prop)
- **src/compile-mcx/** — `compileMCXFn` parser that converts `.mcx` source into `MCXCompileData`; Rollup/Rolldown plugins; `compiler/compileData.ts` (JsCompileData, MCXCompileData classes); `compiler/utils.ts`; `types.ts` (MCXstructureLoc, BuildCache, ImportList); `utils.node.ts` (NodeUtils expression evaluator)
- **src/transforms/** — Transform pipeline: detects MCX file type (`event`, `ui`, `component`, `app`) and generates compiled JS output using Babel AST
  - `main.ts` — `_transform()` orchestrator (generates JSIR → detects type → routes to handler)
  - `config.ts` — config constants (scriptCompileFn, eventImported, paramCtx)
  - `file_id.ts` — `generateFileId()` counter
  - `utils.ts` — `generateMain()`, `generateEventConfig()`, `_enable()`, `_enableWithData()`, `extractVarDefIdList()`, `extractIdList()`
  - `transform/index.ts` — barrel exports `UIComp`, `EventComp`, `AppComp`
- **src/mcx-component/** — Component compilation (CJS transform, VM sandbox, item texture generation)
  - `cjsTransform.ts` — `transformESMToCJS()` (rewrites ESM imports to require(), handles image asset require rewriting)
  - `vm.ts` — `RunScript` class; `execESMMethod` enum (transformCjs, runInVm, importESM); `BLOCKED_MODULES` security set
  - `types.ts` — FilePoint, FileBindSource, DefineEntry, FileEditExpression types
- **src/types.ts** — Token, AST node, transform context type definitions
- **src/utils.ts** — `Utils` class (FileExist, readFile, sleep, TypeVerify, AbsoluteJoin)
- **client.d.ts** — Declares TypeScript module types for image file extensions (`.png`, `.svg`, `.jpg`, `.jpeg`, `.gif`), each mapping to its ImageComponent class
- **peerDependencies**: `rolldown` (1.0.0-rc.18), `rollup` (4.59.0)

### `@mbler/mcx` (packages/client) — v0.0.3

Runtime framework. Entry: `src/index.ts` exports `createApp`, `Event`, `ui`, `Utils`, `types`.

- **createApp** — wraps `App` class
- **event.ts** — event subscription system
- **ui.ts** — UI form builder
- **src/types.ts** — `MCXUIOpt` interface for UI layout
- **lib/App.ts** — app lifecycle and registry
- **lib/Utils.ts** — utility helpers
- **Types** built to `dist/types/` via `rolldown-plugin-dts`

### `@mbler/mcx-types` (packages/types) — v0.0.4-rc.1

Pure type declarations (`index.d.ts`). Defines `CompileOpt`, `MCXFile`, `EventOpt`, `MCXCtx`, `MCXUIOpt`, and extensive Minecraft JSON types (ItemComponentOptions, BlockComponentOptions, EntityComponentOptions, SoundEvent, ParticleType, etc.). Depends on `@minecraft/server`, `@minecraft/server-ui`, and `@volar/language-core`. No tests, no tsconfig.

### `@mbler/mcx-component` (packages/mcx-component) — v0.0.0-alpha.1

Runtime component classes used by the DSL at compile time:
- `ItemComponent`, `BlockComponent`, `EntityComponent` — Minecraft component builders
- `PNGImageComponent`, `JPGImageComponent`, `SVGImageComponent`, `GIFImageComponent` — image asset components
- `src/lib.ts` — defines `ImageComponent` base class and the `lib` export map
- `src/utils.ts` — `compareVar()` semantic version comparison
- `src/types/` — Minecraft enum type files (ParticleType, SoundEvent, EnchantableSlot, AttackCriticalHitChoices, StartSoundChoices)

### `create-mbler` (packages/create-mbler) — v0.0.1

CLI tool (`create-mbler`) for scaffolding new mbler projects. Uses `commander` + `inquirer`. Supports i18n (en/zh). Entry: `bin/create-mbler.js` → `dist/main.mjs`.

- **src/init.ts** — `initProject()` copies templates, generates package.json, mbler.config.js, tsconfig.json, .gitignore; optionally runs git init and pnpm install
- **src/i18n.ts** — i18n map for `zh` and `en`
- **src/types.ts** — `InputResult`, `PackageManager` types
- **src/utils.ts** — `showText()`, `verifyType()` utilities
- **Templates**: `template/mcx/`, `template/ts/`, `template/js/` with `behavior/scripts/` and `resources/` subdirectories
- **Exports**: `"."` → `./dist/main.mjs`, `"./cli"` → `./bin/cli.js`

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Language | TypeScript 5.9.3 (strict mode) |
| Package manager | pnpm 11.0.9 |
| Build | rolldown 1.0.0-rc.18 |
| Bundler plugins | Rollup/Rolldown plugin for `.mcx` files |
| AST | Babel (`@babel/parser`, `@babel/generator`, `@babel/types`) |
| Type system | `@volar/language-core` for language service |
| Type generation | `rolldown-plugin-dts` 0.25.2 |
| Testing | Vitest ^4.1.8 |
| Linting | ESLint flat config (`eslint.config.js`) + Prettier 3.8.3 |
| CI | Planned (no workflows yet) |
| Runtime | Node >=20 |

## Development Commands

```bash
# Install dependencies (also sets up git hooks)
pnpm install

# Build all packages
pnpm build

# Test all packages
pnpm test

# Lint all packages
pnpm lint:packages

# Lint + Test + TypeCheck (full check)
pnpm check

# Format code
pnpm format

# Lint with auto-fix
pnpm lint:packages:fix
```

## Testing Conventions

- Tests live in each package's `tests/` directory
- Framework: Vitest (each package has its own `vitest.config.ts`)
- Run tests: `pnpm test` (recursive) or `pnpm --filter=<package> test`
- `@mbler/mcx-types` has no tests

## CI/CD

- **CI**: Planned (no GitHub Actions workflows have been committed yet)

## Code Conventions

- **Module system**: ESM (`"type": "module"` in all package.json)
- **TypeScript**: strict mode, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `verbatimModuleSyntax` off
- **Imports**: named imports from Babel types; barrel exports from `index.ts`
- **Formatting**: Prettier (config in root `.prettierrc` with `semi: true`, `singleQuote: true`, `arrowParens: 'avoid'`)
- **ESLint**: Flat config (`eslint.config.js`) with `@eslint/js` recommended + `@typescript-eslint` plugin; only enforces `@typescript-eslint/no-explicit-any: 'error'` and `prefer-const: 'error'`; `no-console` is not enforced
- **Git hooks**: simple-git-hooks with commit message verification via `scripts/verify-commit.js`
- **No comments** in production code
- **No console.log** (convention, not lint-enforced)

## Key Patterns

1. **MCX DSL Pipeline**: `.mcx` file → `compileMCXFn()` parser → `MCXCompileData` → `transform()` (Babel AST) → compiled JS
2. **Plugin Architecture**: Two build plugins (`rollupPlugin`, `rolldownPlugin`) wrap `createMcxPlugin` which implements `resolveId` and `transform` hooks
3. **Component System**: Runtime classes in `mcx-component` are instantiated during compilation via VM sandbox (`vm.ts`) and CJS transform (`cjsTransform.ts`)
4. **File Types**: Each `.mcx` file is one of `component`, `event`, `ui`, `app` — detected by content analysis during transform
5. **Component Security Model**: `BLOCKED_MODULES` in `vm.ts` blocks dangerous Node.js modules; `resolveFilePoint()` guards against path traversal; `MAX_FILE_WRITES = 5`, `MAX_FILE_READS = 1` for third-party components
6. **ESM Execution Strategies**: `execESMMethod` enum with `transformCjs` (default, rewrites to require()), `runInVm` (vm.SourceTextModule), `importESM` (dynamic import with data URL)
7. **File Edit System**: Components define `_meta.file_edit` operations (edit, copy_assets, batch) that run at compile time; `bind` targets like `item_texture` accumulate texture data, output as `textures/item_texture.json`
8. **CJS Image Require Transform**: `require('./icon.png')` is rewritten to the corresponding `ImageComponent` constructor call during CJS transform

## Workspace Dependencies

| Package | Depends On |
|---------|-----------|
| `@mbler/mcx-core` | `@mbler/mcx-component`, `@mbler/mcx-types`, Babel, Volar, typescript, magic-string, rollup (peer/dev), rolldown (peer/dev) |
| `@mbler/mcx` | `@mbler/mcx-types` (dev), rolldown (dev), rolldown-plugin-dts (dev) |
| `@mbler/mcx-types` | `@minecraft/server`, `@minecraft/server-ui`, `@volar/language-core` |
| `@mbler/mcx-component` | `@mbler/mcx-types`, rolldown (dev), rolldown-plugin-dts (dev) |
| `create-mbler` | commander, inquirer, rolldown (dev), rolldown-plugin-dts (dev) |

## Publishing

All packages except `create-mbler` are published to npm under the `@mbler` scope with public access via `https://registry.npmjs.org`.

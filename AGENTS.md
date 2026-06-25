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
├── docs/                  # README translations (zh, ja, ko) + TODO.md
├── scripts/               # verify-commit.js (commit-msg hook)
├── .github/workflows/     # CI (pnpm install → lint:packages → test)
```

## Package Details

### `@mbler/mcx-core` (packages/core)
The compiler. Entry: `src/index.ts` exports `AST`, `compiler`, `utils`, `transform`, `compile_component`, `rollupPlugin`, `rolldownPlugin`.

- **src/ast/** — AST node definitions (tag, prop)
- **src/compile-mcx/** — `compileMCXFn` parser that converts `.mcx` source into `MCXCompileData`; Rollup/Rolldown plugins
- **src/transforms/** — Transform pipeline: detects MCX file type (`event`, `ui`, `component`, `app`) and generates compiled JS output using Babel AST
  - `transform/event.ts`, `ui.ts`, `app.ts` — per-type transform logic
- **src/mcx-component/** — Component compilation (CJS transform, VM sandbox, item texture generation)

### `@mbler/mcx` (packages/client)
Runtime framework. Entry: `src/index.ts` exports `createApp`, `Event`, `ui`, `Utils`, `types`.

- **createApp** — wraps `App` class
- **event.ts** — event subscription system
- **ui.ts** — UI form builder
- **lib/App.ts** — app lifecycle and registry
- **lib/Utils.ts** — utility helpers

### `@mbler/mcx-types` (packages/types)
Pure type declarations (`index.d.ts`). Defines `CompileOpt`, `MCXFile`, `EventOpt`, `MCXCtx`, `MCXUIOpt`, and extensive Minecraft JSON types (ItemComponentOptions, BlockComponentOptions, EntityComponentOptions, SoundEvent, ParticleType, etc.). Depends on `@minecraft/server` and `@volar/language-core`.

### `@mbler/mcx-component` (packages/mcx-component)
Runtime component classes used by the DSL at compile time:
- `ItemComponent`, `BlockComponent`, `EntityComponent` — Minecraft component builders
- `PNGImageComponent`, `JPGImageComponent`, `SVGImageComponent`, `GIFImageComponent` — image asset components
- `src/types/` — Minecraft enum type files (ParticleType, SoundEvent, EnchantableSlot, etc.)

### `create-mbler` (packages/create-mbler)
CLI tool (`create-mbler`) for scaffolding new mbler projects. Uses `commander` + `inquirer`. Supports i18n (en/zh/ja/ko). Entry: `src/main.ts`.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Language | TypeScript (strict mode) |
| Package manager | pnpm 11 |
| Build | rolldown |
| Bundler plugins | Rollup/Rolldown plugin for `.mcx` files |
| AST | Babel (`@babel/parser`, `@babel/generator`, `@babel/types`) |
| Type system | `@volar/language-core` for language service |
| Testing | Vitest |
| Linting | ESLint + Prettier |
| CI | GitHub Actions (push/PR to main) |

## Development Commands

```bash
# Install dependencies
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
```

## Testing Conventions

- Tests live in each package's `tests/` directory or co-located as `*.spec.ts` in `src/`
- Framework: Vitest (each package has its own `vitest.config.ts`)
- Run tests: `pnpm test` (recursive) or `pnpm --filter=<package> test`

## CI/CD

- **CI**: Triggered on push/PR to `main`. Steps: checkout → pnpm setup → node 22 → `pnpm install --ignore-scripts` → `pnpm lint:packages` → `pnpm test`.

## Code Conventions

- **Module system**: ESM (`"type": "module"` in all package.json)
- **TypeScript**: strict mode, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `verbatimModuleSyntax` off
- **Imports**: named imports from Babel types; barrel exports from `index.ts`
- **Formatting**: Prettier (config in root `.prettierrc`)
- **Git hooks**: simple-git-hooks with commit message verification via `scripts/verify-commit.js`
- **No comments** in production code
- **No console.log** — use lint rules

## Key Patterns

1. **MCX DSL Pipeline**: `.mcx` file → `compileMCXFn()` parser → `MCXCompileData` → `transform()` (Babel AST) → compiled JS
2. **Plugin Architecture**: Two build plugins (`rollupPlugin`, `rolldownPlugin`) wrap `createMcxPlugin` which implements `resolveId` and `transform` hooks
3. **Component System**: Runtime classes in `mcx-component` are instantiated during compilation via VM sandbox (`vm.ts`) and CJS transform (`cjsTransform.ts`)
4. **File Types**: Each `.mcx` file is one of `component`, `event`, `ui`, `app` — detected by content analysis during transform

## Workspace Dependencies

| Package | Depends On |
|---------|-----------|
| `@mbler/mcx-core` | `@mbler/mcx-component`, `@mbler/mcx-types`, Babel, Volar, typescript, magic-string |
| `@mbler/mcx` | `@mbler/mcx-types` (dev) |
| `@mbler/mcx-component` | `@mbler/mcx-types` |
| `create-mbler` | commander, inquirer |

## Publishing

All packages except `create-mbler` are published to npm under the `@mbler` scope with public access.

# Unreleased (since v0.0.1 / 2026-05-25)

This changelog tracks changes committed after the v0.0.1 release tag.

### 2026-07-02

- **refactor(core)**: Replaced custom XML parser (`Tokenizer`/`Lexer`/`Parser` in `ast/tag.ts`) with `@vue/compiler-core`'s `baseParse()`; added `@vue/compiler-core` and `@vue/compiler-sfc` as dependencies (`532 lines → 220 lines`)

### 2026-05-26 — 2026-05-31

- **wip**: `setIcon(PNGImageComponent)` — ItemComponent integration with filesystem (`ef937db`)
- **refactor(core)**: Updated types and improved item component functionality (`2be4e5b`)
- **feat**: Use generics to auto-deduce `run` parameter types (`132f6d7`)
- **style**: Code cleanup, removed unused functions (`e4f2bac`, `1695170`)
- **refactor**: Updated import handling and error messages for clarity (`ac13a9a`)
- **fix**: `let` → `const` cleanup (`04bd4e3`)
- **chore**: Updated package versions and improved type definitions (`70a6269`)

### 2026-06-04

- **fix(type)**: Fixed `MCXFile<"ui">` type definition (`59aa28f`)

### 2026-06-08

- **chore**: Fixed config issues and cleaned up comments (`5ca3967`)
- **fix**: Corrected spelling errors — `Utlis`→`Utils`, `FileExsit`→`FileExist`, `invaild`→`invalid`, `unkown`→`unknown` (`39f7663`)
- **fix**: Replaced Chinese meme error messages with proper English (`4141bf3`)
- **fix**: Renamed `extrectVarDefIdList` → `extractVarDefIdList` (`ee96240`)
- **fix**: Lint errors — removed unused imports, added TS parser for tests, ignored template files (`524dc74`)
- **ci**: Added `packageManager` field, updated pnpm action to v4 (`e4b3f16`)
- **ci**: Fixed `simple-git-hooks` config and hook name (`b37cb5e`)
- **ci**: Use `pnpm install --ignore-scripts` to work around pnpm v11 `ERR_PNPM_IGNORED_BUILDS` (`7ae3289`)
- **test**: Migrated all tests to Vitest with GitHub CI — 17 compiler tests + 12 runtime tests with mocked Minecraft APIs; added CI workflow; removed old `__test__/` harness (`d7a6590`)

### 2026-06-09

- **fix**: Fixed binary expression evaluation bug; set `engines.node>=20`; renamed `PUBTYPE`→`PubType`, `genenrateJSIR`→`generateJSIR`; changed types package `module`→`type` (`272c9fe`)
- **fix**: Removed unused `content` variable; moved chalk compat to shared utils; removed `console.log`; added `await` to `tryMkdir` (`09a8ca6`)
- **chore**: Added ISSUE_TEMPLATE and `changelog/` directory with version history (`a36a300`)
- **chore**: Added CODE_OF_CONDUCT.md (Contributor Covenant v2.1) (`25d41a9`)
- **chore**: Cleaned up todo comments (`9189761`)

### 2026-06-10

- **chore**: Fixed git hook configuration and hook name (`4c2c64b`)

### 2026-06-13

- **test**: Added Vitest tests for create-mbler package (`279b282`)

### 2026-06-14

- **fix**: Fixed test code (`f905aab`)
- **chore**: Updated `package.json` and `pnpm-lock.yaml` for Rolldown & TypeScript; added `rolldown.config.mjs`, removed `rollup.config.mjs` (`d1f4ec4`)

### 2026-06-19

- **feat(ui)**: Added `:param` dynamic binding syntax with runtime support; fixed silent fallback (`d120d4f`)
- **fix(ui)**: Aligned generated UI config with runtime (`1e8dfc7`)

### 2026-06-20 — 2026-06-27

- **refactor**: Extracted `@mbler/mcx-component` package; moved types to `@mbler/mcx-types`; added BlockComponent; enabled `no-explicit-any` lint rule (`444a437`, `64d52d6`, `75e8a7b`, `bb0351d`, `39acee1`)
- **feat**: Added ESM→CJS transformation and security defenses for component sandbox (`379f6da`, `6e3b9a1`)
- **fix**: Various TypeScript error fixes and type improvements (`d5474a1`, `2f71e50`, `5e844d0`, `79357f8`)
- **ci**: Added build step before test, consolidated test config (`2b46b2a`, `fb38a4d`)
- **docs**: Added AGENTS.md, commit-convention.md, enhanced README with badges and quick start (`cefbc59`, `c29bbca`, `bb15ba4`)
- **fix(core)**: Use `createRequire.resolve` first in `resolveId`; check any import from `@mbler/mcx-component` (`11e6f6f`, `1ee06f3`)
- **feat**: Template components import from `@mbler/mcx-component`; added to generated deps (`8a01498`)
- **docs**: Added Example MCX section to README (en/zh) (`0552f5d`)
- **chore**: Cross-platform compatibility — replaced `rm -rf` with `fs.rmSync`, Windows path fix for `import()`, `shell: true` on Windows spawn (`ad15c74`)

### 2026-06-28

- **feat(ui)**: Added `for` attribute support for repeated UI elements — syntax: `<button for="v in prop">{{ v.label }}</button>`; compiler parses `for` into layout item, runtime expands array prop with `v.xxxxx` loop variable resolution (`3cbffe6`)
- **fix(ast)**: Fixed `parseAttributes` `quoteChar` bug where attribute values containing spaces were parsed incorrectly (`3cbffe6`)
- **publish**: `@mbler/mcx-types@0.0.4-rc.2`, `@mbler/mcx-core@0.1.2-rc.9`, `@mbler/mcx@0.0.4-rc.1`

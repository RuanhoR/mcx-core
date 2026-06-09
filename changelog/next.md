# Unreleased (since v0.0.1 / 2026-05-25)

This changelog tracks changes committed after the v0.0.1 release tag.

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

# Unreleased (since v0.0.2 / 2026-07-26)

This changelog tracks changes committed after the v0.0.2 release tag.

### 2026-09-25
- **feat(mcx-component)**: fill entity components and behaviors (`2ac89f6`)
- **feat(core)**: add spawn_rules component group (`0bbbf8a`)
- **chore(release)**: bump mcx-component 0.0.4-rc.4, mcx-core 1.1.5-rc.2

### 2026-09-06
- **chore(release)**: bump all packages to rc (`e960c34`)
- **refactor**: merge vite plugin into mcx-core (`b7c99d6`)
- **feat(eslint-plugin)**: dynamic event lists per project (`3bf44eb`)

### 2026-09-05
- **chore(create-mbler)**: update author email (`4f2acec`)
- **fix(eslint-plugin)**: expose configs on default export (`3ac20e4`)
- **feat**: add mcx eslint plugin and vite plugin (`4f40ad2`)
- **chore**: fix dep not found (`865b67d`)
- **chore**: use LucklyBlock as create-mbler package template (`577ab4c`)

### 2026-09-01
- **chore(core)**: bump 1.1.5-dev.2 (`7de0ba4`)
- **fix(core)**: Object.assign for export * to keep named exports (`4f5b686`)

### 2026-08-30
- **test(core)**: add matrix suites, 281 -> 609 tests (`8ae4c98`)

### 2026-08-29
- **chore(core)**: bump 1.1.5-dev.1 (`d89002e`)
- **refactor(core)**: inject fs via state.ts (`e1d2c8e`)

### 2026-08-27
- **ci**: remove unused (`5ada818`)
- **fix**: update package versions to rc.1 for consistency (`739c45c`)
- **chore**: bump rc (`f2168e1`)
- **fix(component)**: optimize texture resolution (`d3ec6ea`)
- **chore**: bump core (`a0692d0`)
- **fix(component)**: add itemCatalog to types and output dir (`601a0f3`)

### 2026-08-26
- **chore(component)**: bump to 0.0.3-rc.7 (`7af5375`)
- **feat(component)**: add unlock field to RecipeComponent (`f6174e4`)
- **fix(component)**: remove double textures/ prefix in terrain_texture path (`861f1af`)
- **fix(component)**: sanitize texture key filenames for Windows compatibility (`9ea5e4b`)
- **fix(component)**: correct FeatureReplaceRule field names to match vanilla schema (`1583d62`)

### 2026-08-24
- **chore(client)**: bump to 0.0.6 (`68c0393`)
- **fix(client)**: respect externals in dts, clean dist before build (`967a099`)
- **chore(component)**: bump to 0.0.3-rc.3 (`262c392`)
- **fix(component)**: clean dist before build, respect externals in dts (`a25c0e4`)
- **fix(client)**: multi-command registration and enum param support (`3d70883`)

### 2026-08-23
- **test(component)**: expand test coverage with loot/trade/pool/image specs (`91bfb1d`)
- **fix(core)**: restore root manifest, pin core version to rc.17 (`80afddd`)
- **chore(core)**: bump to 0.1.3-rc.17 (`bca8670`)
- **feat(component)**: loot table and trade table components (`226732b`)
- **chore**: move mcx-tsc package to mcx-language-server repo (`28c7a9e`)
- **test**: clean up temp dirs after each test (`cbf8c5c`)

### 2026-08-22
- **chore(component)**: bump to 0.0.3-rc.1 (`37d7ffc`)
- **fix(component)**: emit custom components as direct keys (`0ad8c59`)
- **chore(component)**: bump to 0.0.3-rc.0 (`9e6909e`)
- **chore(types)**: bump to 0.0.4-rc.8 (`7bf6a5d`)
- **chore(core)**: bump to 0.1.3-rc.16 (`d022354`)
- **chore(core)**: bump to 0.1.3-rc.15 (`93117e2`)
- **feat(core)**: support block & recipe components (`1079956`)
- **fix(core)**: address codacy findings in ast and transforms (`cb839fa`)
- **fix(compiler)**: parse script as ts superset of js (`2546b64`)
- **fix(compiler)**: harden edge cases across packages (`32df078`)
- **fix(ui)**: repair CustomForm reactive bindings (`793089c`)

### 2026-08-21
- **chore**: remove @mbler/mcx-srerv dep and bump to 0.0.2 (`02b4b5d`)
- **chore(component)**: bump to 0.0.1-rc.2 (`7e927ee`)
- **build(component)**: update mcx-server dep to 0.1.4 (`1d55bfe`)
- **chore(core)**: bump to 0.1.3-rc.14 (`32496a6`)
- **chore(tsc)**: bump to 0.0.2-rc.2 (`9fc9d20`)
- **feat(component)**: add feature/spawnRule/itemCatalog (`bb1db67`)
- **chore**: clean readme (`e0b29e1`)

### 2026-08-16
- **chore**: codacy badge (`a809947`)

### 2026-08-13
- **docs**: add codacy badge to readme (`57d8981`)
- **fix(create-mbler)**: use cross-spawn and harden security (`ae8fa4a`)
- **chore**: harden types and remove any (`5c5946b`)

### 2026-08-12
- **feat(mcx-component)**: add item description menu_category, group, and is_hidden_in_commands getters/setters (`8563fba`)
- **fix(core)**: prevent duplicate export declarations and preserve order in component transform (`43a58d9`)
- **chore(mcx-component)**: reformat and add mcx-types dependency (`761c6a7`)
- **fix(core)**: resolve nested relative requires against current file; add @minecraft/* mock (`976b951`)

### 2026-08-01
- **fix(core)**: import path and remove empty catch in rolldown config (`27d1e39`)
- **release(mcx-tsc)**: 0.0.2-rc.1, bump @mbler/mcx-server to 0.1.3 (`f50b3bb`)
- **build(mcx-tsc)**: move typescript to peerDependencies (`bf4ce31`)
- **docs**: update AGENTS.md for mcx-tsc split (`089483a`)
- **chore**: add mcx-component to root workspaces (`7db160c`)
- **chore**: add mcx-tsc to root workspaces (`a6509ee`)
- **chore**: bump create-mbler to 0.0.5 (`c39361d`)
- **feat(mcx-tsc)**: extract mcx type checker into mcx-core package (`90408b1`)
- **chore(mcx-component)**: update deps (`37efbb6`)
- **chore**: bump create-mbler to 0.0.4 (`6df2c01`)
- **refactor(create-mbler)**: replace commander with cac (`d0c48c6`)

### 2026-07-31
- **fix(core)**: allow TS generics in script tag (`25c2950`)
- **feat(client)**: packCall (`f1ab27f`)

### 2026-07-26
- **chore**: update root version (`32a341d`)

## @mbler/mcx-component 0.0.4-rc.2

### fix(mcx-component)

- `EntityComponent.toJSON()` now emits the config object written by `setPhysics(config)`
  (`components['minecraft:physics']`); previously the config was silently dropped and only the
  `physics: boolean` shorthand (emitting an empty `minecraft:physics: {}`) was handled.
  The `hasComponents` detection chain also includes the key so an entity with only a physics
  config still gets a `components` section.

# Unreleased (since v0.0.2 / 2026-07-26)

This changelog tracks changes committed after the v0.0.2 release tag.

### 2026-11-14

- **feat(mcx-component)**: Molang API for JSON UI — `MolangExpression` (query / variable / context / math / call / ternary / concat plus arithmetic, comparison and logical operators), `MolangBinding` (`view` / `global` / `collection`, `toJSON()` produces a JSON UI `bindings` entry) and a `Molang` facade; exported from `@mbler/mcx-component` so `<script>` code can build bindings instead of hand-writing Molang strings
- **feat(jsonui)**: `<script>` blocks in `@mbler/mcx-plugin-jsonui` files now reach the generated module — the plugin short-circuits the built-in transform, so it extracts the script, transpiles it with the compiler's own TypeScript (honouring `lang="js"`) and appends it after the document export; script code shares the module scope and can call `jsonui` / `Molang`. `export default` is rejected with a compile error because the descriptor owns that export
- **feat(jsonui)**: `JSONUIComponent` gained runtime control helpers — `bind` / `addBinding` / `setBindings` / `clearBindings` / `getBindings`, `text` / `visible` shortcuts, `addControl` / `removeControl`, `findElement` (nested controls included) and `{ create: true }` to declare a missing control on demand
- **feat(jsonui)**: completion data now describes the JSON UI control set (`image`, `panel`, `stack_panel`, `grid`, `scroll_view`, `collection`, `custom`, `factory`, `screen`, `edit_box`) with `size` / `offset` / `anchor_from` / `bindings` / text properties, and `<JsonUi>` suggests those children; names shared with classic `<Ui>` leaves contribute no attributes so CustomForm completion is unchanged
- **chore(release)**: bump mcx-component 0.0.4-rc.7, mcx-plugin-jsonui 0.0.1-alpha.2
- **feat(jsonui)**: `mcx-plugin-jsonui preview` — a preview server plus browser UI listing every `<Ui type="jsonui">` file in a tree, rendering the compiled document with the game's layout rules (anchor pairs, `%` / `px` / `%x` lengths, `stack_panel`, `grid`, `$variables`, `#bindings`), resolving textures from the project resource packs, hot reloading over SSE and reporting attribute values that look like JSON but do not parse; `--port` / `--host` / `--size` / `--no-open` / `--no-watch`
- **feat(jsonui)**: screenshot API computed in-process — `/api/screenshot?id=…&format=png|svg&scale=…&bg=…` rasterises the same layout tree with a built-in PNG encoder and 5x7 pixel font (no browser, no native image library), while `format=svg` keeps exact vector output and embeds pack textures as data URIs
- **chore(release)**: bump mcx-plugin-jsonui 0.0.2-alpha.0

### 2026-11-01
- **fix(core)**: stable module ids in pnpm workspaces — the rolldown/vite `resolveId` bare-id fallback now walks up parent `node_modules` dirs (packages installed at a workspace root are found), realpaths the resolved package dir so both resolution strategies (Node `createRequire` and the manual `moduleDir` lookup) agree on the same id instead of the bundler seeing a pnpm symlink path and its realpath as two distinct modules, and root imports prefer `exports["."]` over a possibly missing `main` field
- **test**: verified against a real pnpm addon layout; the one-project `init.spec.ts` timeout under full-suite load is a pre-existing flake
- **chore(release)**: bump mcx-core 1.1.5-rc.5

### 2026-10-25
- **fix(core)**: map script error positions back to the .mcx file — TS script blocks are transpiled before babel parses them, so parse/traversal errors were reported in the transpiled coordinate space (wrong lines after reformatting and import elision). `compileMCX` now registers a TS-sourcemap + script-tag-offset mapper per compiled script and `compileJSFn` rewrites `CompileError` positions with it; `ts.transpileModule` runs with `reportDiagnostics` so real TS syntax errors (e.g. `Identifier expected.` on a trailing `expr.`) surface at the original position instead of a babel error on rewritten output (`fd6ae95`)
- **test(core)**: `script-loc.spec.ts` covers TS syntax errors, JS offset-only scripts, traversal errors after import elision, and valid-script compilation
- **chore(release)**: bump mcx-core 1.1.5-rc.4

### 2026-09-25
- **feat(mcx-component)**: fill entity components and behaviors (`2ac89f6`)
- **feat(core)**: add spawn_rules component group (`0bbbf8a`)
- **fix(core)**: resolve directory imports to index file (`f687fe2`)
- **chore(release)**: bump mcx-component 0.0.4-rc.4, mcx-core 1.1.5-rc.2
- **chore(release)**: bump mcx-core 1.1.5-rc.3
- **fix(mcx-component)**: replace invalid jump.strength with jump.static (`0528680`)
- **chore(release)**: bump mcx-component 0.0.4-rc.5

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

## @mbler/mcx-core / @mbler/mcx-types (unreleased)

### feat(core): compiler plugin hooks (custom layout / custom root tags)

- `CompileOpt.mcxPlugin` accepts one `McxPlugin` object, a factory, or an array/nested array of
  either (`[jsonui(), other()]` and `[jsonui, other]` both work; factories are called once, in
  order). A plugin looks like a
  bundler plugin: `{ name, tags, onTransform, onTransformed, onThrow, onBuildStart, onBuildEnd }`.
  Types live in `@mbler/mcx-types` and are re-exported from `@mbler/mcx-core` together with
  `defineMcxPlugin()` and the hook helpers in `src/plugin.ts`.
- `tags` (or `ctx.registerTag()` from `onTransform`) handles custom root tags: the handler gets
  the parsed tag node and a hook context with `tag()/tags()`, `addImport()`, `addStatement()`,
  `addExport()`, `setType()`, `error()`. Injections are applied through the Babel AST to the
  generated default export object; without plugins the output is byte-for-byte unchanged.
- `onTransform` runs before the built-in transform and can short-circuit it by returning JS;
  `onTransformed` chains over the generated JS; `onThrow` can recover both transform errors and
  parse errors raised before `transform()`. Lifecycle hooks are forwarded from the
  Rollup/Rolldown plugin and from `vitePlugin`.

## @mbler/mcx-plugin-jsonui (new official plugin)

- New workspace package `packages/official-plugin/jsonui`. Adds `<Ui type="jsonui" ...>` support:
  `target` (optional), `availability` / `avail` / `use`, `namespace` / `ns`, `file` / `save`,
  `id`; every other attribute is passed through to the generated JSON UI element, and child
  tags become controls. Attribute values are JSON-coerced, so sizes, arrays and objects work.
- Transform is split from attachment: the `<Ui>` is first compiled into a plain JSON UI
  document, then an availability adapter decides where it goes. Built-ins: `file` (plain JSON +
  `_ui_defs.json` registration), `server_form` (`ui/server_form.json` gated factory routing,
  following the Bedrock Wiki route-shell model), `hud` (modifications on `hud_screen`), `vanilla`
  (singleton, no `target` required, vanilla element overrides), `none`. Use
  `defineJsonUIAvailability()` to register more; adapters declare `requiresTarget` / `singleton`.
- Generated `.mcx` modules export a `JSONUIComponent` (runtime subpath
  `@mbler/mcx-plugin-jsonui/component`), usable from `<Component>` files or Script API forms
  (`component.formTitle` for `server_form` routing). `file`/`save` also dumps the raw document.
- A `.mcx` file containing only `<Ui type="jsonui">` (no `<script>`) is recovered through
  `onThrow`.

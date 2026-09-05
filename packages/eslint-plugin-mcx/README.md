# @mbler/eslint-plugin-mcx

ESLint parser and rules for `.mcx` files — the MCX DSL compiled by [mbler](https://github.com/RuanhoR/mcx-core).

The template part is parsed by `@mbler/mcx-core`'s own AST (so lint results match the compiler), and every `<script>` block is parsed by typescript-eslint with locations shifted back into original-file coordinates.

## Install

```bash
pnpm add -D @mbler/eslint-plugin-mcx
```

## Usage (flat config)

```js
// eslint.config.js
import mcx from '@mbler/eslint-plugin-mcx';

export default [
  ...yourOtherConfigs,
  mcx.configs.recommended,
];
```

`mcx.configs.recommended` applies to `**/*.mcx` and enables:

| Rule | Default | Description |
| --- | --- | --- |
| `mcx/valid-event-binding` | error | `<Event>` bindings must use known `@minecraft/server` world events (validated per `@after`/`@before` scope) and handlers exported from `<script>` |
| `mcx/no-duplicate-root-tag` | error | `App` / `Event` / `Ui` / `Form` / `script` may appear only once per file (configurable via `unique`) |
| `mcx/valid-prop-value` | error | prop values that look like JSON objects/arrays must parse as JSON |
| `mcx/require-script-lang` | warn | `<script>` must declare its language (`lang="ts"`) |

### How event names are resolved

`mcx/valid-event-binding` does not use a hardcoded list. At lint time the plugin
reads the `WorldAfterEvents` / `WorldBeforeEvents` classes from the
`@minecraft/server` typings installed **in your project**, so the known events
always match the version you build against. The result is cached at
`<project>/node_modules/.tmp/eslint-plugin-mcx/events-<version>.json` and
regenerated automatically when the version changes. If `@minecraft/server`
cannot be resolved, a bundled fallback list (generated from
`@minecraft/server` via `pnpm --filter @mbler/eslint-plugin-mcx gen:events`)
is used.

Manual setup (pick rules yourself):

```js
export default [
  {
    files: ['**/*.mcx'],
    languageOptions: { parser: mcx.parser },
    plugins: { mcx },
    rules: {
      'mcx/valid-event-binding': ['error', { extraEvents: ['myEvent'], allowUnknown: false }],
    },
  },
];
```

## Rule options

- `valid-event-binding`: `{ allowUnknown?: boolean, extraEvents?: string[], ignoreKeys?: string[] }`. `McxExtendsBy` and other `Mcx*` compiler directives are always allowed. Event names are validated against the list matching the tag's `@after`/`@before` scope; without a scope attribute an event from either list is accepted.
- `no-duplicate-root-tag`: `{ unique?: string[] }` (default `['App', 'Event', 'Ui', 'Form', 'script']`).
- `require-script-lang`: `{ allow?: string[] }` (default `['ts']`).

## Notes

- The parsed template tree is exposed as `ast.mcxTemplate` (and via `services.mcxTemplate`) for custom rules.
- Multiple `<script>` blocks are merged into one Program; scope analysis is based on the first block.

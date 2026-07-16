# @mbler/mcx-core

The MCX DSL compiler — the core of the MCX ecosystem. Compiles `.mcx` source files into MCBE-compatible JSON components, UI forms, and event systems.

## Pipeline

`.mcx` file → **parser** → AST → **transform** (Babel) → compiled JS → MCBE JSON

## Features

- **MCX Parser** — Parses `.mcx` source into a tokenized AST (`tag`, `prop`)
- **Transform Pipeline** — Detects file type (`event`, `ui`, `component`, `app`) and generates compiled Babel AST
- **Component Compilation** — Runs component scripts in a sandboxed VM, generates MCBE JSON, executes file edit operations
- **CJS Transform** — Rewrites ESM imports to CommonJS `require()` for VM execution
- **Image Assets** — Compiles PNG, JPG, SVG, GIF image references into MCBE texture assets
- **Rollup/Rolldown Plugin** — Seamless `.mcx` file resolution and transformation in your build pipeline

## Installation

```bash
pnpm add -D @mbler/mcx-core
```

## Usage
1. Use manually
Add the plugin to your Rollup or Rolldown/Rollup config:

```ts
import { rollupPlugin } from '@mbler/mcx-core'

export default {
  plugins: [rollupPlugin({ moduleDir: './modules', tsconfigPath: './tsconfig.json' })],
}
```
2. Use with [mbler](https://npmjs.com/package/mbler)
```bash
pnpm create mbler
```
For full documentation, visit the **[Docs](https://mbler-docs.ruanhor.dpdns.org/guide/mcx)**.

## License

MIT

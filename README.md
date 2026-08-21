<div align="center">

# mcx-core

The core monorepo for **MCX** — a domain-specific language (DSL) for building Minecraft Bedrock Edition (MCBE) addons.
[![Codacy Badge](https://app.codacy.com/project/badge/Grade/48f0484c6291499bad7c9226f0f03679)](https://app.codacy.com/gh/RuanhoR/mcx-core/dashboard?utm_source=gh&utm_medium=referral&utm_content=&utm_campaign=Badge_grade)

<p>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge" alt="MIT License"></a>
  <img src="https://img.shields.io/badge/TypeScript-strict-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
  <a href="https://learn.microsoft.com/en-us/minecraft/creator/?view=minecraft-bedrock-stable"><img src="https://img.shields.io/badge/MCBE-Addon-7C3AED?style=for-the-badge" alt="MCBE Addon"></a>
  <a href="https://app.codacy.com/gh/RuanhoR/mcx-core/dashboard?utm_source=gh&utm_medium=referral&utm_content=&utm_campaign=Badge_grade"><img src="hhttps://app.codacy.com/project/badge/Grade/48f0484c6291499bad7c9226f0f03679" alt="Codacy"></a>
</p>

</div>

> **Disclaimer:** MCX is not affiliated with or endorsed by Mojang/Microsoft. It is an independent, community-driven project.

---

## Other README Versions

| Language | Link                                       |
| -------- | ------------------------------------------ |
| 中文     | [./docs/README.zh.md](./docs/README.zh.md) |

## Introduction

MCX is a DSL that compiles `.mcx` source files into MCBE-compatible JSON components, UI forms, and event systems. It lets you build Minecraft Bedrock addons in a simple, declarative, and type-safe way — without hand-writing hundreds of JSON files.

The pipeline: **`.mcx` file → parser → AST → transform (Babel) → compiled JS → MCBE JSON**.

## Features

- **Component MCX** — Generate MCBE component JSON (items, blocks, entities) fast and declaratively
- **Form MCX** (`<Form>`) — Build in-game forms using traditional FormData (ModalFormData / ActionFormData / MessageFormData)
- **UI MCX** (`<Ui>`) — Build in-game CustomForm UIs with Observable reactive binding (DDUI)
- **Explicit form type** — Set `type="modal|action|message"` on `<Ui>` or `<Form>` to override heuristic detection
- **Nested UI elements** — Child elements recursively flattened; grouping containers supported
- **`for` loops with `in` / `of`** — Iterate over arrays in templates with `for="item in items"` or `for="item of items"`
- **Setup system** — `<Form setup>` / `<Ui setup>` auto-collect declarations, no manual `export` needed
- **`defineProp` macro** — Compile-time prop declarations with defaults
- **Lifecycle hooks** — `onStartup` (once) and `onMounted` (per show) for setup logic
- **Event MCX** — Subscribe to and handle game events cleanly
- **App MCX** — Tie components, UI, and events together into a runnable app
- **MCX Client** — Runtime framework (`createApp`, `Event`, `ui`, `Utils`) that runs your app in-game
- **MCX Compiler** — Core compiler with Rollup/Rolldown plugin support, paired with [mbler](https://github.com/RuanhoR/mbler) for project scaffolding and builds
- **Type-safe** — Full TypeScript type definitions for all Minecraft component options, sound events, particle types, and more
- **I18n** — Built-in internationalization support (en / zh / ja / ko)
- **Image assets** — PNG, JPG, SVG, and GIF image components for texture generation

## Packages

This is a pnpm workspace monorepo containing the following packages:

| Package                                            | Version                                                                                                             | Description                                                                     |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| [`@mbler/mcx-core`](./packages/core)               | [![npm](https://img.shields.io/npm/v/@mbler/mcx-core.svg)](https://www.npmjs.com/package/@mbler/mcx-core)           | The DSL compiler — parser, AST, transform pipeline, and Rollup/Rolldown plugins |
| [`@mbler/mcx`](./packages/client)                  | [![npm](https://img.shields.io/npm/v/@mbler/mcx.svg)](https://www.npmjs.com/package/@mbler/mcx)                     | Runtime framework — `createApp`, `Event`, `ui`, `Utils`                         |
| [`@mbler/mcx-types`](./packages/types)             | [![npm](https://img.shields.io/npm/v/@mbler/mcx-types.svg)](https://www.npmjs.com/package/@mbler/mcx-types)         | Shared TypeScript type declarations for MCBE JSON formats                       |
| [`@mbler/mcx-component`](./packages/mcx-component) | [![npm](https://img.shields.io/npm/v/@mbler/mcx-component.svg)](https://www.npmjs.com/package/@mbler/mcx-component) | Component runtime classes (Item, Block, Entity, Image) used at compile time     |
| [`create-mbler`](./packages/create-mbler)          | [![npm](https://img.shields.io/npm/v/create-mbler.svg)](https://www.npmjs.com/package/create-mbler)                 | CLI scaffolding tool for new mbler projects                                     |

### Monorepo Structure

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
└── .github/workflows/     # CI (pnpm install → lint:packages → test)
```

## Example MCX

Below is a complete example showcasing all four MCX file types — Component, Event, UI, and App.

### 1. Define an Item Component (`items/custom_sword.mcx`)

```vue
<Component>
  <items>
    <item id="sword.json">sword</item>
  </items>
</Component>
<script lang="ts">
import { ItemComponent } from '@mbler/mcx-component';

export const sword = new ItemComponent({
  id: 'demo:custom_sword',
  name: 'Custom Sword',
  components: {},
});
sword.setDam;
</script>
```

### 2. Subscribe to a Game Event (`events/player_join.mcx`)

```vue
<Event @after>
playerJoin = onPlayerJoin
</Event>
<script lang="ts">
import { world } from '@minecraft/server';
import { showForm } from '@mbler/mcx';
import form from '../ui/greeting.mcx';
export function onPlayerJoin(event: PlayerJoinAfterEvent) {
  const player = world.getPlayers({
    name: event.playerName,
  });
  player.sendMessage('Welcome to the server!');
  showForm(form, player, {
    playerName: event.playerName,
  });
}
</script>
```

### 3. Build a Legacy Form (`ui/greeting.mcx`)

Use `<Form>` for traditional FormData (ModalFormData / ActionFormData / MessageFormData):

```vue
<Form>
  <label>{{ playerName }}!</label>
  <label>Hello</label>
  <button click="onClick">Close</button>
</Form>
<script lang="ts">
export function onClick() {
  // close the form
}
</script>
```

### 3b. Build a CustomForm (`ui/settings.mcx`)

Use `<Ui>` for new CustomForm with Observable reactive binding:

```vue
<Ui setup>
  <title>Settings</title>
  <input :value="name">Player name</input>
  <toggle :value="enabled">Enabled</toggle>
  <slider :value="volume" min="0" max="100">Volume</slider>
  <button :if="advanced" click="onAdvanced">Advanced</button>
  <button click="handleSave">Save</button>
</Ui>
<script>
import { ref } from '@mbler/mcx';

const name = defineProp('Player'); // → ObservableString
const enabled = defineProp(false); // → ObservableBoolean
const volume = defineProp(50); // → ObservableNumber
const advanced = ref(true); // ref() works too

function onAdvanced() {
  advanced.value = !advanced.value;
}

function handleSave() {
  // name.getData() gets current value
}
</script>
```

`defineProp` accepts string / boolean / number literal defaults (including template
literals and negative numbers) and wraps them in the matching Observable automatically.
Non-literal defaults are passed through as plain values.

Reactive bindings: `{{ x }}` interpolation unwraps Ref/Observable values,
`:value` gives two-way binding, `:if` toggles visibility live, and
`:disabled` / `:tip` / `:description` accept Ref/Observable bindings.
Elements inside `for="x in list"` loops support `:if` and the other attributes too.

### 4. Auto subscribe event in App mcx (`app.mcx`)

```vue
<script lang="ts">
import event from './events/player_join.mcx';
event.subscribe();
// also can use: event.subscribe("playerJoin")
</script>
```

### 5. CreateApp in index.ts (`index.ts`)

```typescript
import app from './app.mcx';
import { createApp } from '@mbler/mcx';
import { world } from '@minecraft/server';

createApp(app).mount(world);
```

### More Usage See [Bedwars Addon](https://github.com/RuanhoR/mcbe-bedwars-addon)

## Quick Start

### Create a new project

```bash
# Using the create-mbler CLI
pnpm create mbler
```

### Manual setup

```bash
# Install the compiler and runtime
pnpm add -D @mbler/mcx-core
pnpm add @mbler/mcx
```

Then configure your bundler (Rollup/Rolldown) with the MCX plugin and start writing `.mcx` files.

For full documentation and tutorials, visit the **[Docs](https://mbler-docs.ruanhor.dpdns.org)**.

## Tech Stack

| Layer           | Technology                                                  |
| --------------- | ----------------------------------------------------------- |
| Language        | TypeScript (strict mode)                                    |
| Package manager | pnpm 11                                                     |
| Build           | Rolldown                                                    |
| Bundler plugins | Rollup / Rolldown plugin for `.mcx` files                   |
| AST             | Babel (`@babel/parser`, `@babel/generator`, `@babel/types`) |
| Type system     | `@volar/language-core` for language service                 |
| Testing         | Vitest                                                      |
| Linting         | ESLint + Prettier                                           |
| CI              | GitHub Actions                                              |

## Development

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run tests
pnpm test

# Lint all packages
pnpm lint:packages

# Full check (lint + test + typecheck)
pnpm check

# Format code
pnpm format
```

## Contributing

Contributions are welcome! Please read the [Contributing Guide](./CONTRIBUTING.md) before submitting a pull request.

Before committing, make sure to run:

```bash
pnpm check
```

Commit messages must follow the [conventional commits](https://www.conventionalcommits.org/) standard (enforced via git hooks).

## License

[MIT](./LICENSE) © [ruanhor](https://github.com/RuanhoR)

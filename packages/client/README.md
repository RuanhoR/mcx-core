# @mbler/mcx

The runtime framework for MCX — executes compiled `.mcx` apps inside Minecraft Bedrock Edition.

## Features

- **`createApp`** — Boots your MCX app with lifecycle management (`mount`, `setup`)
- **`Event`** — Subscribe to and handle Minecraft game events (`PlayerJoin`, `EntityDie`, etc.) with anti-shake ticking
- **`ui`** — Build in-game UI forms (`ModalFormData`, `ActionFormData`, `MessageFormData`) from compiled layouts with dynamic `$prop` content
- **`Utils`** — Utility helpers like `generateAntiShake` for debounced event handlers

## Installation

```bash
pnpm add @mbler/mcx
```

## Quick Example

```ts
import { createApp, Event } from '@mbler/mcx'
import type { MCXFile } from '@mbler/mcx-types'

const app = createApp({
  type: 'app',
  setup: () => console.log('App started'),
})

const event = new Event(
  { on: 'after', data: { PlayerJoin: (event) => console.log('Welcome!') } },
  () => {},
)
```

For full documentation, visit the **[Docs](https://mbler-docs.ruanhor.dpdns.org)**.

## License

MIT

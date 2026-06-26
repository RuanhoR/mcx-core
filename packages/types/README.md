# @mbler/mcx-types

Shared TypeScript type declarations for the MCX DSL ecosystem. Provides type safety for MCBE JSON components, UI options, events, and enums.

## Contents

- `CompileOpt`, `MCXFile`, `EventOpt` — Compiler and runtime option types
- `MCXCtx`, `MCXUIOpt`, `MCXUI` — UI layout and context types
- `ItemComponentOptions` — Full Minecraft item JSON component options
- `BlockComponentOptions` — Full Minecraft block JSON component options
- `EntityComponentOptions` — Full Minecraft entity JSON component options
- `SoundEvent`, `ParticleType`, `Rarity`, `FoodEffect` — Game enum types
- `EnchantableSlot`, `NavigationConfig`, `MobEffectConfig` — Component config types

## Installation

```bash
pnpm add -D @mbler/mcx-types
```

## Usage

```ts
import type { MCXFile, EventOpt } from '@mbler/mcx-types'

const event: MCXFile<'event'> = {
  type: 'event',
  data: { PlayerJoin: (e) => {} },
}
```

## License

MIT

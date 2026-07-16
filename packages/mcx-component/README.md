# @mbler/mcx-component

Runtime component classes used by the MCX DSL at compile time. These classes are instantiated inside the compiler's VM sandbox to generate MCBE-compatible JSON output.

## Components

| Class | Description |
|-------|-------------|
| `ItemComponent` | Builder for Minecraft item JSON (`minecraft:item`) — damage, food, durability, digger, enchantable, wearable, cooldown, etc. |
| `BlockComponent` | Builder for Minecraft block JSON (`minecraft:block`) — display_name, light_emission, geometry, material_instances, collision_box, etc. |
| `EntityComponent` | Builder for Minecraft entity JSON (`minecraft:entity`) — health, movement, navigation, combat, behavior, equipment, etc. |
| `PNGImageComponent` | PNG image asset component |
| `JPGImageComponent` | JPEG image asset component |
| `SVGImageComponent` | SVG image asset component |
| `GIFImageComponent` | GIF image asset component |

## Installation

```bash
pnpm add @mbler/mcx-component
```

## Usage

```ts
import { ItemComponent } from '@mbler/mcx-component'

const item = new ItemComponent({
  id: 'my:item',
  name: 'My Item',
  format: '1.21.0',
  components: {
    damage: 5,
    offHand: true,
  },
})

const json = item.toJSON()
// Outputs MCBE-compatible item JSON
```
## How to use `toJSON` return data?
1. Use with [MCX CORE](https://npmjs.com/package/@mbler/mcx-core)
```bash
git clone https://github.com/RuanhoR/mcbe-bedwars-addon.git
cd mcbe-bedwars-addon
# Edit ./behavior/scripts/component/Menu.mcx to test Component mcx
```
2. Use on your app
Read [`file_edit` handle in MCX CORE Open source repo](https://github.com/RuanhoR/mcx-core/blob/main/packages/core/src/mcx-component/index.ts) and impl in your app
## License

MIT

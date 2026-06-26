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

## License

MIT

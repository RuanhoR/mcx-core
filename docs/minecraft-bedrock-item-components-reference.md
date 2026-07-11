# Minecraft Bedrock Edition Item Components — Complete Reference

> Source: https://learn.microsoft.com/en-us/minecraft/creator/reference/content/itemreference/?view=minecraft-bedrock-stable
> Retrieved: 2026-07-11

---

## Item Definition Structure

```json
{
  "format_version": "1.20.20",
  "minecraft:item": {
    "description": {
      "identifier": "minecraft:blaze_rod",
      "menu_category": {
        "group": "itemGroup.name.blaze",
        "category": "equipment",
        "is_hidden_in_commands": true
      }
    },
    "components": {
      ...
    }
  }
}
```

### Description Properties

| Name | Default Value | Type | Description |
|------|---------------|------|-------------|
| menu_category | "items" | Object | The Creative Category that includes the specified item |
| group | | String | The Creative Group that includes the specified item (max 256 chars) |
| is_hidden_in_commands | | Boolean | Determines whether this item can be used with commands |

---

## 1. minecraft:allow_off_hand

**Description:** Determines whether the item can be placed in the off hand slot.
**Min format version:** 1.20.30
**Simple representation:** `Boolean true/false`

| Name | Default | Type | Description |
|------|---------|------|-------------|
| value | *not set* | Boolean | Whether item can be placed in off hand |

---

## 2. minecraft:block_placer

**Description:** Sets the item as a placer item component for blocks. Can be used instead of `minecraft:icon` to render the block as icon.
**Min format version:** 1.21.50

| Name | Default | Type | Description |
|------|---------|------|-------------|
| aligned_placement | false | Boolean | When true, block placement is aligned while interaction button held (min 1.26.10) |
| block | *not set* | String/Object | Defines the block that will be placed |
| replace_block_item | false | Boolean | If true, item registered as the item for this block (identifier must match block) |
| use_on | [] | Array | List of block descriptors this item can be used on (max 256 items) |

### use_on Properties

| Name | Default | Type | Description |
|------|---------|------|-------------|
| name | | String | |
| states | {} | Integer/String/Boolean | |
| tags | | String | |

**Sample:**
```json
"minecraft:block_placer": {
  "block": "seeds",
  "use_on": ["dirt", "grass"],
  "replace_block_item": true
}
```

---

## 3. minecraft:bundle_interaction

**Description:** Enables bundle-specific interaction scheme and tooltip.
**Requires:** minecraft:storage_item component.
**Min format version:** 1.21.40
**Available without experimental:** 1.21.110

| Name | Default | Type | Description |
|------|---------|------|-------------|
| num_viewable_slots | 12 | Integer | Max slots viewable by player (1-64) |

**Note:** Requires texture files: `<item>.png`, `<item>_open_front.png`, `<item>_open_back.png` in `textures_list.json`.

**Sample:**
```json
"minecraft:bundle_interaction": {
  "num_viewable_slots": 8
}
```

---

## 4. minecraft:can_destroy_in_creative

**Description:** Determines if the item can break blocks in creative mode.
**Min format version:** 1.20.10
**Simple representation:** `Boolean true/false`

| Name | Default | Type | Description |
|------|---------|------|-------------|
| value | *not set* | Boolean | Whether item can destroy blocks in creative |

---

## 5. minecraft:compostable

**Description:** Specifies that an item is compostable and provides composting chance.
**Min format version:** 1.21.60

| Name | Default | Type | Description |
|------|---------|------|-------------|
| composting_chance | *not set* | Integer | Chance to create a layer (1-100) |

---

## 6. minecraft:cooldown

**Description:** Adds a cooldown to an item. Items sharing the same category enter cooldown together.
**Min format version:** 1.20.10

| Name | Default | Type | Description |
|------|---------|------|-------------|
| category | *not set* | String | Groups items together for shared cooldown |
| duration | *not set* | Decimal | Cooldown time in seconds |
| type | "use" | String | "use" or "attack" (min 1.21.130) |

**Sample:**
```json
"minecraft:cooldown": {
  "category": "attack",
  "duration": 0.2
}
```

---

## 7. minecraft:damage

**Description:** Determines how much extra damage the item does on attack.
**Min format version:** 1.20.30
**Simple representation:** `Integer number`
**Note:** From 1.26.0 onward, supports 0-32767 range.

| Name | Default | Type | Description |
|------|---------|------|-------------|
| value | *not set* | Integer | Extra damage dealt when attacking |

---

## 8. minecraft:damage_absorption

**Description:** Allows an item to absorb damage dealt to its wearer. Requires `minecraft:durability`.
**Min format version:** 1.21.20

| Name | Default | Type | Description |
|------|---------|------|-------------|
| absorbable_causes | *not set* | Array of strings | List of damage causes that can be absorbed (min 1 item) |

---

## 9. minecraft:digger

**Description:** Configures an item as a digging tool with block-specific speed multipliers.
**Min format version:** 1.20.30

| Name | Default | Type | Description |
|------|---------|------|-------------|
| destroy_speeds | [] | Array | Block dig speed entries |
| use_efficiency | false | Boolean | Whether Efficiency enchantment increases dig speed |

### destroy_speeds Properties

| Name | Default | Type | Description |
|------|---------|------|-------------|
| block | *not set* | String/Object | Block to be dug (by name, ID, or tag query) |
| speed | *not set* | Integer | Digging speed for correlating block(s) |

**Sample:**
```json
"minecraft:digger": {
  "use_efficiency": true,
  "destroy_speeds": [
    { "speed": 6, "block": { "tags": "query.any_tag('wood')" } },
    { "block": "minecraft:coal_ore", "speed": 2 }
  ]
}
```

---

## 10. minecraft:display_name

**Description:** Sets the item display name. Can pull from localization file.
**Min format version:** 1.20.0

| Name | Default | Type | Description |
|------|---------|------|-------------|
| value | | String | Item display name or localization key |

**Sample:**
```json
"minecraft:display_name": {
  "value": "item.apple.name"
}
```

---

## 11. minecraft:durability

**Description:** Sets how much damage the item can take before breaking.
**Min format version:** 1.20.0

| Name | Default | Type | Description |
|------|---------|------|-------------|
| damage_chance | {"max":100,"min":100} | Object | Percentage chance of losing durability (int range min/max) |
| max_durability | *not set* | Integer | Amount of damage before breaking (min 0) |

**Sample:**
```json
"minecraft:durability": {
  "damage_chance": { "min": 10, "max": 50 },
  "max_durability": 36
}
```

---

## 12. minecraft:durability_sensor

**Description:** Enables an item to emit effects when it receives damage. Requires `minecraft:durability`.
**Min format version:** 1.21.20

| Name | Default | Type | Description |
|------|---------|------|-------------|
| durability_thresholds | *not set* | Array | List of durability thresholds and effects (min 1 item) |
| sound_event | *not set* | String | Sound effect to emit when threshold is met |

### durability_thresholds Properties

| Name | Default | Type | Description |
|------|---------|------|-------------|
| durability | 0 | Integer | Effects emitted when durability <= this value |
| particle_type | "none" | String | Particle effect to emit |
| sound_event | "undefined" | String | Sound effect to emit |

---

## 13. minecraft:dyeable

**Description:** Enables players to dye this item using dyes (like leather armor).
**Min format version:** 1.21.30

| Name | Default | Type | Description |
|------|---------|------|-------------|
| default_color | [255, 255, 255] | String or Array of numbers | Default color when undyed |

**Sample:**
```json
"minecraft:dyeable": {
  "default_color": "#175882"
}
```

---

## 14. minecraft:enchantable

**Description:** Determines what enchantments can be applied to the item.
**Min format version:** 1.20.30

| Name | Default | Type | Description |
|------|---------|------|-------------|
| slot | *not set* | String | Enchantment slot type (sword, bow, pickaxe, armor_head, armor_torso, armor_legs, armor_feet, etc.) |
| value | *not set* | Integer | Enchantment value (min 0) |

**Valid slot values:** `none|all|g_armor|armor_head|armor_torso|armor_feet|armor_legs|sword|bow|spear|crossbow|melee_spear|g_tool|hoe|shears|flintsteel|shield|g_digging|axe|pickaxe|shovel|fishing_rod|carrot_stick|elytra|cosmetic_head`

---

## 15. minecraft:entity_placer

**Description:** Allows an item to place entities into the world.
**Min format version:** 1.20.10

| Name | Default | Type | Description |
|------|---------|------|-------------|
| dispense_on | [] | Array | Block descriptors for dispense |
| entity | | String | Entity to be placed (identifier pattern) |
| use_on | [] | Array | Block descriptors for use-on |

**Sample:**
```json
"minecraft:entity_placer": {
  "entity": "minecraft:spider",
  "dispense_on": ["minecraft:web"],
  "use_on": ["minecraft:web"]
}
```

---

## 16. minecraft:fire_resistant

**Description:** Determines whether the item is immune to burning in fire/lava.
**No version requirement listed.**

| Name | Default | Type | Description |
|------|---------|------|-------------|
| value | true | Boolean | Whether item is immune to burning |

---

## 17. minecraft:food

**Description:** Sets the item as edible food.
**Min format version:** 1.20.30
**Requires:** minecraft:use_modifiers

| Name | Default | Type | Description |
|------|---------|------|-------------|
| can_always_eat | false | Boolean | Can always eat (even when not hungry) |
| nutrition | 0 | Integer | Nutrition value added |
| saturation_modifier | 0.6 | Decimal | Used in formula: nutrition * saturation_modifier * 2 |
| using_converts_to | {} | String | Item to convert to after eating |
| remove_effects | *not set* | Array of strings | **Deprecated** |

**Sample:**
```json
"minecraft:food": {
  "can_always_eat": false,
  "nutrition": 3,
  "saturation_modifier": 0.6,
  "using_converts_to": "bowl"
}
```

---

## 18. minecraft:fuel

**Description:** Allows the item to be used as fuel in a furnace.
**Min format version:** 1.20.0
**Simple representation:** `Decimal number`

| Name | Default | Type | Description |
|------|---------|------|-------------|
| duration | *not set* | Decimal | How long in seconds (>= 0.05) |

---

## 19. minecraft:glint

**Description:** Determines whether the item has the enchanted glint render effect.
**Min format version:** 1.20.30
**Simple representation:** `Boolean true/false`

| Name | Default | Type | Description |
|------|---------|------|-------------|
| value | *not set* | Boolean | Whether item has enchanted glint |

---

## 20. minecraft:hand_equipped

**Description:** Determines if item is rendered like a tool while in hand.
**Min format version:** 1.20.30
**Simple representation:** `Boolean true/false`

| Name | Default | Type | Description |
|------|---------|------|-------------|
| value | *not set* | Boolean | Whether item is rendered like a tool |

---

## 21. minecraft:hover_text_color

**Description:** Determines the color of the item name when hovering.
**Min format version:** 1.20.10
**Simple representation:** `String`

| Name | Default | Type | Description |
|------|---------|------|-------------|
| value | *not set* | String | Color of the item hover text |

---

## 22. minecraft:icon

**Description:** Determines the icon to represent the item in UI.
**Min format version:** 1.20.0
**Simple representation:** `String`

| Name | Default | Type | Description |
|------|---------|------|-------------|
| textures | *not set* | Object | Map of different textures (default + optional armor trim textures) |
| texture | *not set* | String | **Deprecated** - single texture name |

### textures Properties

| Name | Default | Type | Description |
|------|---------|------|-------------|
| default | *not set* | String | Default icon texture key |

**Samples:**
```json
"minecraft:icon": "oak_slab"
"minecraft:icon": { "texture": "apple" }
"minecraft:icon": { "textures": { "default": "bundle_black" } }
```

---

## 23. minecraft:interact_button

**Description:** Boolean or string determining if the interact button is shown in touch controls.

Simple boolean or string representation (no object properties documented).

---

## 24. minecraft:item (definition)

**Description:** Root item definition wrapper containing description and components sections.

### v1.26.0
Standard item definition with "description" and "components" sections.

### v1.21.90
Item definition includes "description" and "components" sections.

---

## 25. minecraft:kinetic_weapon

**Description:** Allows an item to deal kinetic damage based on relative velocity.
**Min format version:** 1.21.130

| Name | Default | Type | Description |
|------|---------|------|-------------|
| creative_reach | *not set* | Object | FloatRange (min/max) for creative mode reach |
| damage_conditions | *not set* | Object | Conditions for damage to be applied |
| damage_modifier | 0 | Decimal | Value added to scaled dot product |
| damage_multiplier | 1 | Decimal | Value multiplied to velocity dot products |
| delay | 0 | Integer | Ticks before kinetic damage starts |
| dismount_conditions | *not set* | Object | Conditions for rider dismount |
| hitbox_margin | 0 | Decimal | Added tolerance to raycast |
| knockback_conditions | *not set* | Object | Conditions for knockback |
| reach | {"max":3,"min":0} | Object | FloatRange of reach in blocks |

### damage_conditions Properties

| Name | Default | Type | Description |
|------|---------|------|-------------|
| max_duration | -1 | Integer | Ticks effect applies after delay (-1 = indefinite) |
| min_relative_speed | 0 | Decimal | Min relative speed of user vs target |
| min_speed | 0 | Decimal | Min user speed |

---

## 26. minecraft:liquid_clipped

**Description:** Determines whether item interacts with liquid blocks on use.
**Min format version:** 1.20.30
**Simple representation:** `Boolean true/false`

| Name | Default | Type | Description |
|------|---------|------|-------------|
| value | *not set* | Boolean | Whether item interacts with liquid blocks |

---

## 27. minecraft:max_stack_size

**Description:** Determines how many of an item can stack together.
**Min format version:** 1.20.10
**Simple representation:** `Integer number`

| Name | Default | Type | Description |
|------|---------|------|-------------|
| value | 64 | Integer | Max stack size |

---

## 28. minecraft:piercing_weapon

**Description:** Allows item to deal damage to all entities in a straight line. Cannot destroy blocks.
**Min format version:** 1.21.130

| Name | Default | Type | Description |
|------|---------|------|-------------|
| creative_reach | *not set* | Object | FloatRange (min/max) for creative |
| hitbox_margin | 0 | Decimal | Tolerance to raycast |
| reach | {"max":3,"min":0} | Object | FloatRange reach in blocks |

---

## 29. minecraft:projectile

**Description:** Defines an item as a projectile for dispensers or as ammunition with minecraft:shooter.
**Min format version:** 1.20.10

| Name | Default | Type | Description |
|------|---------|------|-------------|
| minimum_critical_power | 0 | Decimal | Charge required for critical hit |
| projectile_entity | *not set* | String | Entity fired as projectile |

**Sample:**
```json
"minecraft:projectile": {
  "minimum_critical_power": 1.25,
  "projectile_entity": "arrow"
}
```

---

## 30. minecraft:rarity

**Description:** Specifies base rarity and hover text color.
**Min format version:** 1.21.30
**Simple representation:** `String`

| Name | Default | Type | Description |
|------|---------|------|-------------|
| value | *not set* | String | "common", "uncommon", "rare", or "epic" |

Rarity auto-increases when enchanted: Common/Uncommon → Rare, Rare → Epic.

---

## 31. minecraft:record

**Description:** Used by record items to play music.
**Min format version:** 1.20.10

| Name | Default | Type | Description |
|------|---------|------|-------------|
| comparator_signal | 1 | Integer | Signal strength for comparators (1-13) |
| duration | 0 | Decimal | Duration of sound event in seconds |
| sound_event | "undefined" | String | Sound event type |

**Sample:**
```json
"minecraft:record": {
  "comparator_signal": 1,
  "duration": 5,
  "sound_event": "ambient.tame"
}
```

---

## 32. minecraft:repairable

**Description:** Defines items that can repair this item and durability restored.
**Min format version:** 1.20.10

| Name | Default | Type | Description |
|------|---------|------|-------------|
| repair_items | [] | Array | List of repair item entries |

### repair_items Properties

| Name | Default | Type | Description |
|------|---------|------|-------------|
| items | *not set* | String/Array | Items that may be used for repair |
| repair_amount | | Decimal/Object | How much durability is repaired |

**Sample:**
```json
"minecraft:repairable": {
  "on_repaired": "minecraft:celebrate",
  "repair_items": ["anvil"]
}
```

---

## 33. minecraft:seed

**Description:** Sets the item as a plantable seed.
**Min format version:** 1.10.0

| Name | Default | Type | Description |
|------|---------|------|-------------|
| crop_result | *not set* | String | Block identifier placed when planted |
| plant_at | *not set* | Array of strings | Block identifiers seed can be planted on |
| plant_at_any_solid_surface | false | Boolean | **Deprecated** (removed after 1.18) |
| plant_at_face | *not set* | String | **Deprecated** (removed after 1.18) |

**Sample:**
```json
"minecraft:seed": {
  "crop_result": "beetroot"
}
```

---

## 34. minecraft:shooter

**Description:** Compels an item to shoot projectiles (like a bow/crossbow). Requires minecraft:use_modifiers.
**Min format version:** 1.20.10
**Requires:** minecraft:projectile on ammunition items

| Name | Default | Type | Description |
|------|---------|------|-------------|
| ammunition | [] | Array | List of ammunition entries |
| charge_on_draw | false | Boolean | Starts charging when player draws (crossbow-like) |
| max_draw_duration | 0 | Decimal | Max time in seconds to draw before auto-fire |
| scale_power_by_draw_duration | false | Boolean | Launch power increases with draw time |

### ammunition Properties

| Name | Default | Type | Description |
|------|---------|------|-------------|
| item | *not set* | String | Ammunition item identifier |
| search_inventory | false | Boolean | Can search inventory |
| use_in_creative | false | Boolean | Can use in creative mode |
| use_offhand | false | Boolean | Can use off-hand |

**Sample:**
```json
"minecraft:shooter": {
  "ammunition": [{
    "item": "custom_projectile",
    "use_offhand": true,
    "search_inventory": true,
    "use_in_creative": true
  }],
  "max_draw_duration": 1,
  "scale_power_by_draw_duration": true,
  "charge_on_draw": false
}
```

---

## 35. minecraft:should_despawn

**Description:** Determines whether the item should despawn while floating in the world.
**Min format version:** 1.20.30
**Simple representation:** `Boolean true/false`

| Name | Default | Type | Description |
|------|---------|------|-------------|
| value | *not set* | Boolean | Whether item should eventually despawn |

---

## 36. minecraft:stacked_by_data

**Description:** Determines whether same items with different aux values can stack.
**Min format version:** 1.20.30
**Simple representation:** `Boolean true/false`

| Name | Default | Type | Description |
|------|---------|------|-------------|
| value | *not set* | Boolean | Whether items with different aux values can stack |

---

## 37. minecraft:storage_item

**Description:** Enables an item to store data of a dynamic container.
**Min format version:** 1.21.40
**Available without experimental:** 1.21.110

| Name | Default | Type | Description |
|------|---------|------|-------------|
| allow_nested_storage_items | true | Boolean | Whether another Storage Item is allowed inside |
| allowed_items | [] | Array | Items exclusively allowed (empty = all allowed) |
| banned_items | [] | Array | Items not allowed |
| max_slots | 64 | Integer | Max slots (<= 64) |

**Sample:**
```json
"minecraft:storage_item": {
  "max_slots": 64,
  "allow_nested_storage_items": true,
  "banned_items": ["minecraft:shulker_box", "minecraft:undyed_shulker_box"]
}
```

---

## 38. minecraft:storage_weight_limit

**Description:** Specifies max weight limit a storage item can hold.
**Min format version:** 1.21.110

| Name | Default | Type | Description |
|------|---------|------|-------------|
| max_weight_limit | 64 | Integer | Max allowed weight (<= 64) |

---

## 39. minecraft:storage_weight_modifier

**Description:** Specifies weight of this item when inside another storage item.
**Min format version:** 1.21.110

| Name | Default | Type | Description |
|------|---------|------|-------------|
| weight_in_storage_item | 4 | Integer | Weight inside another storage item (0 = not allowed) |

---

## 40. minecraft:swing_duration

**Description:** Duration in seconds of the item's swing animation. Visual only.
**Min format version:** 1.21.120

| Name | Default | Type | Description |
|------|---------|------|-------------|
| value | 0.3 | Decimal | Swing animation duration in seconds |

---

## 41. minecraft:swing_sounds

**Description:** Overrides the swing sounds emitted by the user.
**Min format version:** 1.21.130

| Name | Default | Type | Description |
|------|---------|------|-------------|
| attack_critical_hit | *not set* | String | Sound on critical hit |
| attack_hit | *not set* | String | Sound on hit |
| attack_miss | *not set* | String | Sound on miss |

---

## 42. minecraft:tags

**Description:** Determines which tags are included on an item.
**Min format version:** 1.20.50

| Name | Default | Type | Description |
|------|---------|------|-------------|
| tags | [] | Array of strings | Item tag list |

**Sample:**
```json
"minecraft:tags": {
  "tags": ["minecraft:is_food"]
}
```

---

## 43. minecraft:throwable

**Description:** Makes an item throwable (like snowball/ender pearl).
**Min format version:** 1.20.10

| Name | Default | Type | Description |
|------|---------|------|-------------|
| do_swing_animation | false | Boolean | Use swing animation when thrown |
| launch_power_scale | 1 | Decimal | Scale of throw power increase |
| max_draw_duration | 0 | Decimal | Max draw duration |
| max_launch_power | 1 | Decimal | Max launch power |
| min_draw_duration | 0 | Decimal | Min draw duration |
| scale_power_by_draw_duration | false | Boolean | Power increases with charge time |

**Sample:**
```json
"minecraft:throwable": {
  "do_swing_animation": true,
  "launch_power_scale": 1.5,
  "max_launch_power": 1.5
}
```

---

## 44. minecraft:use_animation

**Description:** Specifies which animation is played when the player uses the item.
**Min format version:** 1.20.30
**Simple representation:** `String`

| Name | Default | Type | Description |
|------|---------|------|-------------|
| value | *not set* | String | Animation to play (e.g., "eat") |

---

## 45. minecraft:use_modifiers

**Description:** Determines how long an item takes to use (for Shooter, Throwable, or Food).
**Min format version:** 1.20.50

| Name | Default | Type | Description |
|------|---------|------|-------------|
| emit_vibrations | true | Boolean | Whether vibrations are emitted |
| movement_modifier | *not set* | Decimal | Movement speed multiplier while in use (<= 1) |
| start_sound | *not set* | String | Sound when item starts being used |
| start_using | "always" | String | "always" or "on_attack" (min 1.26.30) |
| use_duration | 0 | Decimal | Time in seconds to use |

**Sample:**
```json
"minecraft:use_modifiers": {
  "start_using": "always",
  "use_duration": 1.6,
  "movement_modifier": 0.35
}
```

---

## 46. minecraft:wearable

**Description:** Allows an item to be worn in a specified equipment slot.
**Min format version:** 1.20.30

| Name | Default | Type | Description |
|------|---------|------|-------------|
| hides_player_location | false | Boolean | Hide player location on maps when worn |
| protection | 0 | Integer | Protection value |
| slot | *not set* | String | Equipment slot |
| dispensable | *not set* | Boolean | |

**Valid slot values:** `slot.armor.head`, `slot.armor.chest`, `slot.armor.legs`, `slot.armor.feet`, `slot.armor.body`, `slot.weapon.mainhand`, `slot.weapon.offhand`

---

## Internal / Deprecated Components

| Component | Description | Status |
|-----------|-------------|--------|
| chargeable | Event trigger when item completes use duration | Deprecated |
| custom_components | Array of custom script components | Internal |
| render_offsets | Offset rendering of the item | Internal |
| use_duration | How long item takes to use | Deprecated (use minecraft:use_modifiers) |
| weapon | Deprecated weapon component | Deprecated |

---

## Enchantment Slot Types (for minecraft:enchantable)

`none`, `all`, `g_armor`, `armor_head`, `armor_torso`, `armor_feet`, `armor_legs`, `sword`, `bow`, `spear`, `crossbow`, `melee_spear`, `g_tool`, `hoe`, `shears`, `flintsteel`, `shield`, `g_digging`, `axe`, `pickaxe`, `shovel`, `fishing_rod`, `carrot_stick`, `elytra`, `cosmetic_head`

## Rarity Values (for minecraft:rarity)

`common`, `uncommon`, `rare`, `epic`

## Cooldown Types (for minecraft:cooldown type)

`attack`, `use`

## Use Modifiers Start Using Values

`always`, `on_attack` (min 1.26.30)

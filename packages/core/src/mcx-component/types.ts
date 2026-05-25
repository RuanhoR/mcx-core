import ParticleType from './types/ParticleType'
import SoundEvent from './types/SoundEvent'
import EnchantableSlot from './types/EnchantableSlot'

interface ItemComponentOpt {
  id: string
  name: string
  format: string
  components: Partial<{
    offHand: boolean
    damage: number
    DestroyInCreate: boolean
    icon: string
    block_placer?: {
      aligned_placement?: boolean
      block: string
      replace_block_item?: boolean
      use_on?: Array<
        | string
        | {
            name: string
            states?: Record<string, number | string | boolean>
            tags?: string
          }
      >
    }
    cooldown?: {
      category: string
      duration: number
      type?: 'use' | 'attack'
    }
    compostable?: {
      composting_chance: number
    }
    bundle_interaction?: {
      num_viewable_slots?: number
    }
    /**
     * Enables an item to store data of the dynamic container associated with it.
     * A dynamic container is a container for storing items that is linked to an item instead of a block or an entity.
     *
     * Tip：While this component can be defined on its own, to be able to interact with the item's storage container
     * the item must have a minecraft:bundle_interaction item component defined.
     *
     * Tip：This item requires a format version of at least 1.21.40.
     *
     * @example {
     *   "max_slots": 64,
     *   "max_weight_limit": 64,
     *   "weight_in_storage_item": 4,
     *   "allow_nested_storage_items": true,
     *   "banned_items": ["minecraft:shulker_box", "minecraft:undyed_shulker_box"]
     * }
     */
    'minecraft:storage_item'?: {
      /**
       * Determines whether another Storage Item is allowed inside of this item.
       * @default true
       */
      allow_nested_storage_items?: boolean

      /**
       * List of items that are exclusively allowed in this Storage Item.
       * If empty all items are allowed.
       * @default []
       */
      allowed_items?: string[]

      /**
       * List of items that are not allowed in this Storage Item.
       * @default []
       * @example ["minecraft:shulker_box", "minecraft:undyed_shulker_box"]
       */
      banned_items?: string[]

      /**
       * The maximum number of slots in the storage container.
       * Maximum is 64. Default is 64. Value must be <= 64.
       * @default 64
       * @type Integer number
       */
      max_slots?: number

      /**
       * The maximum allowed weight of the sum of all contained items.
       * Maximum is 64. Default is 64. Value must be <= 64.
       * @default 64
       * @type Decimal number
       */
      max_weight_limit?: number

      /**
       * The weight of this item when inside another Storage Item.
       * Default is 4. 0 means item is not allowed in another Storage Item.
       * @default 4
       * @type Decimal number
       */
      weight_in_storage_item?: number
    }

    /**
     * Specifies the weight of an item when stored inside another storage item.
     * Controls how much weight this item contributes to storage's total weight.
     *
     * @example {"weight_in_storage_item": 4}
     */
    'minecraft:storage_weight_modifier'?: {
      /**
       * The weight of this item when inside another Storage Item.
       * Default is 4. 0 means item is not allowed in another Storage Item.
       * @default 4
       * @type Integer number
       */
      weight_in_storage_item: number
    }

    /**
     * Specifies the maximum weight limit that a storage item can hold.
     * Controls the total weight capacity of the storage container.
     *
     * @example {"max_weight_limit": 64}
     */
    'minecraft:storage_weight_limit'?: {
      /**
       * The maximum allowed weight of the sum of all contained items.
       * Maximum is 64. Default is 64. Value must be <= 64.
       * @default 64
       * @type Integer number
       */
      max_weight_limit: number
    }

    /**
     * Makes an item throwable by the player, similar to a snowball or ender pearl.
     * Use with minecraft:projectile to specify which entity is spawned when thrown.
     *
     * 注意：Combine with minecraft:projectile to define the projectile entity.
     * For charged throws (like tridents), set scale_power_by_draw_duration to true and configure min/max draw durations.
     */
    'minecraft:throwable'?: {
      /**
       * Determines whether the item should use the swing animation when thrown.
       * @default false
       */
      do_swing_animation?: boolean

      /**
       * The scale at which the power of the throw increases.
       * @default 1.0
       */
      launch_power_scale?: number

      /**
       * The maximum duration to draw a throwable item.
       * @default 0.0
       */
      max_draw_duration?: number

      /**
       * The maximum power to launch the throwable item.
       * @default 1.0
       */
      max_launch_power?: number

      /**
       * The minimum duration to draw a throwable item.
       * @default 0.0
       */
      min_draw_duration?: number

      /**
       * Whether or not the power of the throw increases with duration charged.
       * @default false
       */
      scale_power_by_draw_duration?: boolean
    }

    // Alias for minecraft:throwable
    throwable?: {
      do_swing_animation?: boolean
      launch_power_scale?: number
      max_draw_duration?: number
      max_launch_power?: number
      min_draw_duration?: number
      scale_power_by_draw_duration?: boolean
    }

    /**
     * Determines which tags are included on a given item.
     */
    'minecraft:tags'?: {
      /**
       * An array that can contain multiple item tags.
       * @default []
       */
      tags?: string[]
    }

    // Alias for minecraft:tags
    tags?: {
      tags?: string[]
    }

    /**
     * Duration, in seconds, of the item's swing animation played when mining or attacking.
     * Affects visuals only and does not impact attack frequency or other gameplay mechanics.
     */
    'minecraft:swing_duration'?: {
      /**
       * Duration, in seconds, of the item's swing animation played when mining or attacking.
       * Affects visuals only and does not impact attack frequency or other gameplay mechanics.
       * @default 0.30000001192092896
       */
      value?: number
    }

    // Alias for minecraft:swing_duration
    swing_duration?: {
      value?: number
    }

    /**
     * Use_animation specifies which animation is played when the player uses the item.
     * Supported animations: 'eat', 'drink', 'block', 'bow', 'camera', 'spear', 'crossbow', 'spyglass', 'toot_horn', 'brush'.
     */
    'minecraft:use_animation'?:
      | string
      | {
          /**
           * The animation type to play when the item is used.
           */
          value?: string
        }

    /**
     * Sets the wearable item component, which allows an item to be worn by a player in a specified equipment slot.
     * Valid slot values: slot.armor.head, slot.armor.chest, slot.armor.legs, slot.armor.feet, slot.armor.body,
     * slot.weapon.mainhand, slot.weapon.offhand, slot.hotbar, slot.inventory, slot.enderchest, slot.saddle, slot.armor, slot.chest
     */
    'minecraft:wearable'?: {
      /**
       * Defines the equipment slot this item can be equipped to (required).
       */
      slot:
        | 'slot.armor.head'
        | 'slot.armor.chest'
        | 'slot.armor.legs'
        | 'slot.armor.feet'
        | 'slot.armor.body'
        | 'slot.weapon.mainhand'
        | 'slot.weapon.offhand'
        | 'slot.hotbar'
        | 'slot.inventory'
        | 'slot.enderchest'
        | 'slot.saddle'
        | 'slot.armor'
        | 'slot.chest'
      /**
       * Determines how much armor protection this wearable item provides (non-negative integer).
       */
      protection?: number
      /**
       * Determines whether the player's location relative to the origin is hidden from other entities.
       */
      hides_player_location?: boolean
      /**
       * Determines whether this wearable item can be dispensed from dispensers.
       */
      dispensable?: boolean
    }

    /**
     * Determines how long an item takes to use and optional use modifiers.
     * Use duration is required, and movement modifier must be ≤ 1.0.
     */
    'minecraft:use_modifiers'?: {
      /**
       * How long it takes to use the item (required, non-negative).
       */
      use_duration: number
      /**
       * Optional value that modifiers the entity's movement speed when this item is used (must be ≤ 1.0).
       */
      movement_modifier?: number
      /**
       * Whether vibrations are emitted when the item starts or stops being used.
       */
      emit_vibrations?: boolean
      /**
       * Sound played when the item starts being used.
       */
      start_sound?: string
    }

    /**
     * Overrides the swing sounds emitted by the user while the item is being used.
     * Specifies the sound to play when swinging the item.
     */
    'minecraft:swing_sounds'?: {
      /**
       * Sound played when an attack hits and deals critical damage.
       */
      attack_critical_hit?: string
      /**
       * Sound played when an attack hits.
       */
      attack_hit?: string
      /**
       * Sound played when an attack misses or deals no damage due to invulnerability.
       */
      attack_miss?: string
    }

    // Alias for minecraft:use_animation
    use_animation?:
      | string
      | {
          value?: string
        }

    // Alias for minecraft:wearable
    wearable?: {
      slot:
        | 'slot.armor.head'
        | 'slot.armor.chest'
        | 'slot.armor.legs'
        | 'slot.armor.feet'
        | 'slot.armor.body'
        | 'slot.weapon.mainhand'
        | 'slot.weapon.offhand'
      protection?: number
      hides_player_location?: boolean
      dispensable?: boolean
    }

    // Alias for minecraft:use_modifiers
    use_modifiers?: {
      use_duration: number
      movement_modifier?: number
      emit_vibrations?: boolean
      start_sound?: string
    }

    // Alias for minecraft:swing_sounds
    swing_sounds?: {
      attack_critical_hit?: string
      attack_hit?: string
      attack_miss?: string
    }

    // Alias for minecraft:storage_item
    storage_item?: {
      allow_nested_storage_items?: boolean
      allowed_items?: string[]
      banned_items?: string[]
      max_slots?: number
      max_weight_limit?: number
      weight_in_storage_item?: number
    }

    // Alias for minecraft:storage_weight_modifier
    storage_weight_modifier?: {
      weight_in_storage_item: number
    }

    // Alias for minecraft:storage_weight_limit
    storage_weight_limit?: {
      max_weight_limit: number
    }
    glint?: boolean
    hand_equipped?: boolean
    digger?: {
      use_efficiency?: boolean
      destroy_speeds?: Array<{
        block:
          | string
          | {
              name?: string
              states?: Record<string, number | string | boolean>
              tags?: string
            }
        speed: number
      }>
    }
    damage_absorption?: {
      absorbable_causes: string[]
    }
    durability?: {
      max_durability: number
      damage_chance?: {
        min: number
        max: number
      }
    }
    durability_sensor?: {
      /**
       * The durability value at which the effects are emitted
       */
      durability?: number

      /**
       * Defines both the durability threshold, and the effects emitted when that threshold is met.
       */
      durability_thresholds?: Array<{
        /**
         * The effects are emitted when the item durability value is less than or equal to this value.
         * @default 0
         * @type Integer number
         */
        durability: number

        /**
         * Particle effect to emit when the threshold is met.
         * @type Particle Type choices
         */
        particle_type?: ParticleType

        /**
         * Sound effect to emit when the threshold is met.
         * @type Sound Event choices
         */
        sound_event?: SoundEvent
      }>

      /**
       * Particle effect to emit when durability sensor triggers
       * @type Particle Type choices
       */
      particle_type?: ParticleType

      /**
       * Sound effect to emit when durability sensor triggers
       * @type Sound Event choices
       */
      sound_event?: SoundEvent
    }
    /**
     * Enables custom items to be dyed in cauldrons.
     * Requires format version 1.21.30 or greater.
     */
    dyeable?: {
      /**
       * The default color for the dyed item
       * Can be a hex string (e.g., "#175882") or array of RGB numbers [255, 255, 255]
       * @default [255, 255, 255]
       */
      default_color?: string | [number, number, number]
    }
    /**
     * Determines what enchantments can be applied to the item.
     * Not all enchantments will have an effect on all item components.
     */
    enchantable?: {
      /**
       * Specifies which types of enchantments can be applied.
       * For example, "bow" would allow this item to be enchanted as if it were a bow.
       * @example "armor_torso" for chestplate, "armor_feet" for boots
       */
      slot?: EnchantableSlot

      /**
       * Specifies the value of the enchantment (minimum of 0).
       * @default 0
       * @type Integer number
       * @example Chestplate: 10
       */
      value?: number
    }
    /**
     * Determines whether the item is immune to burning when dropped in fire or lava.
     */
    'minecraft:fire_resistant'?: {
      value?: boolean
    }

    /**
     * Allows an item to place entities into the world.
     * Additionally, in version 1.19.80 and above, the component allows the item to set the spawn type of a monster spawner.
     */
    'minecraft:entity_placer'?: {
      /**
       * List of block descriptors of the blocks that this item can be dispensed on.
       * If left empty, all blocks will be allowed.
       */
      dispense_on?: Array<
        | string
        | {
            name: string
            states?: Record<string, number | string | boolean>
            tags?: string
          }
      >
      /**
       * The entity to be placed in the world.
       * Value must match a regular expression pattern of "^(?:\\w+(?:.\\w+):(?=\\w))?(?:\\w+(?:.\\w+))(?:<((?:\\w+(?:.\\w+):(?=\\w))?\\w+(?:.\\w+))*>)?$"
       * @example "minecraft:turtle"
       */
      entity: string
      /**
       * List of block descriptors of the blocks that this item can be used on.
       * If left empty, all blocks will be allowed.
       */
      use_on?: Array<
        | string
        | {
            name: string
            states?: Record<string, number | string | boolean>
            tags?: string
          }
      >
    }

    /**
     * Allows this item to be used as fuel in a furnace to 'cook' other items.
     * This item can also be represented as a Decimal number.
     */
    'minecraft:fuel'?: {
      /**
       * How long in seconds will this fuel cook items for.
       * Value must be >= 0.05.
       */
      duration: number
    }

    /**
     * Allows an item to deal kinetic damage and its effects.
     * This happens every tick while in use, in a straight line along the user's view vector.
     */
    'minecraft:kinetic_weapon'?: {
      /**
       * Defines the reach used when the user is in Creative Mode.
       * Defaults to "reach" if unspecified.
       */
      creative_reach?: {
        max?: number
        min?: number
      }
      /**
       * Conditions that need to be satisfied for damage to be applied.
       * If not specified, damage is not applied.
       */
      damage_conditions?: {
        max_duration?: number
        min_relative_speed?: number
        min_speed?: number
      }
      /**
       * Value added to the the scaled dot product (after applying "damage_multiplier").
       * @default 0
       */
      damage_modifier?: number
      /**
       * Value multiplied to sum of the dot products of the user and target's velocity vectors projected onto the view vector.
       * @default 1
       */
      damage_multiplier?: number
      /**
       * Time, in ticks, after which kinetic damage and its effects start being applied.
       * @default 0
       */
      delay?: number
      /**
       * Conditions that need to be satisfied for riders to be dismounted.
       * If not specified, riders cannot be dismounted.
       */
      dismount_conditions?: {
        max_duration?: number
        min_relative_speed?: number
        min_speed?: number
      }
      /**
       * Added tolerance to the view vector raycast for detecting entity collisions.
       * @default 0
       */
      hitbox_margin?: number
      /**
       * Conditions that need to be satisfied for knockback to be applied.
       * If not specified, knockback is not applied.
       */
      knockback_conditions?: {
        max_duration?: number
        min_relative_speed?: number
        min_speed?: number
      }
      /**
       * Conditions that need to be satisfied for a specific effect of a kinetic weapon to be applied.
       * If negative, the effect is applied indefinitely.
       */
      kinetic_effect_conditions?: {
        /**
         * Time, in ticks, during which the effect can be applied after "delay" elapses.
         * If negative, the effect is applied indefinitely.
         * @default -1
         * @type Integer number
         */
        max_duration?: number
        /**
         * Minimum relative speed of the user with respect to the target (projected onto the view vector via a dot product) required for the effect to be applied.
         * @default 0
         * @type Decimal number
         */
        min_relative_speed?: number
        /**
         * Minimum user's speed (projected onto the view vector via a dot product) required for the effect to be applied.
         * @default 0
         * @type Decimal number
         */
        min_speed?: number
      }
      /**
       * Defines the range (in blocks) along the user's view vector where entities can be hit.
       * @default {"max":3,"min":0}
       */
      reach?: {
        max?: number
        min?: number
      }
    }

    /**
     * A boolean or string that determines if the interact button is shown in touch controls,
     * and what text is displayed on the button.
     */
    'minecraft:interact_button'?: boolean | string

    /**
     * Determines the color of the item name when hovering over it.
     * This item can also be represented as a String.
     */
    'minecraft:hover_text_color'?: {
      /**
       * The color of the item hover text.
       */
      value?: string
    }

    /**
     * Sets the item as a food component, allowing it to be edible to the player.
     */
    'minecraft:food'?: {
      /**
       * If true you can always eat this item (even when not hungry).
       * @default false
       * @example AppleEnchanted: true
       */
      can_always_eat?: boolean

      /**
       * Cooldown time in seconds
       * @type Decimal number
       */
      cooldown_time?: number

      /**
       * Cooldown type
       * @example "chorusfruit" for chorus fruit cooldown
       */
      cooldown_type?: string

      /**
       * Array of effects applied when consuming the food
       * @example [{"name":"regeneration","chance":1,"duration":30,"amplifier":1}]
       */
      effects?: FoodEffect[]

      /**
       * Whether the food is a meat item
       */
      is_meat?: boolean

      /**
       * Value that is added to the entity's nutrition when the item is used.
       * @default 0
       * @type Integer number
       * @example Apple: 4, Baked Potato: 5, Beef: 3
       */
      nutrition?: number

      /**
       * Minecraft event trigger for on use action
       * @example "chorus_teleport" for chorus fruit
       */
      on_use_action?: string

      /**
       * Minecraft event trigger for on use range
       * @example [8, 8, 8] for chorus fruit
       */
      on_use_range?: [number, number, number]

      /**
       * saturation_modifier is used in this formula: (nutrition * saturation_modifier * 2) when applying the saturation buff.
       * Can be a number or string values like "poor", "low", "normal", "good", "supernatural".
       * @default 0.6000000238418579
       * @type Decimal number | string
       * @example Apple: 0.3, AppleEnchanted: "supernatural", Baked Potato: "normal"
       */
      saturation_modifier?:
        | number
        | 'poor'
        | 'low'
        | 'normal'
        | 'good'
        | 'supernatural'

      /**
       * When used, converts to the item specified by the string in this field.
       * @example "bowl" for soup items, "glass_bottle" for honey bottle
       */
      using_converts_to?: string

      /**
       * Deprecated - no longer in use.
       * Array of effect names to remove when eating this food.
       * This property was deprecated and is no longer supported in newer versions.
       */
      remove_effects?: string[]
    }

    /**
     * Sets the item as a food component, allowing it to be edible to the player.
     */
    food?: {
      /**
       * If true you can always eat this item (even when not hungry).
       * @default false
       * @example AppleEnchanted: true
       */
      can_always_eat?: boolean

      /**
       * Cooldown time in seconds
       * @type Decimal number
       */
      cooldown_time?: number

      /**
       * Cooldown type
       * @example "chorusfruit" for chorus fruit cooldown
       */
      cooldown_type?: string

      /**
       * Array of effects applied when consuming the food
       * @example [{"name":"regeneration","chance":1,"duration":30,"amplifier":1}]
       */
      effects?: FoodEffect[]

      /**
       * Whether the food is a meat item
       */
      is_meat?: boolean

      /**
       * Value that is added to the entity's nutrition when the item is used.
       * @default 0
       * @type Integer number
       * @example Apple: 4, Baked Potato: 5, Beef: 3
       */
      nutrition?: number

      /**
       * Minecraft event trigger for on use action
       * @example "chorus_teleport" for chorus fruit
       */
      on_use_action?: string

      /**
       * Minecraft event trigger for on use range
       * @example [8, 8, 8] for chorus fruit
       */
      on_use_range?: [number, number, number]

      /**
       * saturation_modifier is used in this formula: (nutrition * saturation_modifier * 2) when applying the saturation buff.
       * Can be a number or string values like "poor", "low", "normal", "good", "supernatural".
       * @default 0.6000000238418579
       * @type Decimal number | string
       * @example Apple: 0.3, AppleEnchanted: "supernatural", Baked Potato: "normal"
       */
      saturation_modifier?:
        | number
        | 'poor'
        | 'low'
        | 'normal'
        | 'good'
        | 'supernatural'

      /**
       * When used, converts to the item specified by the string in this field.
       * @example "bowl" for soup items, "glass_bottle" for honey bottle
       */
      using_converts_to?: string

      /**
       * Deprecated - no longer in use.
       * Array of effect names to remove when eating this food.
       * This property was deprecated and is no longer supported in newer versions.
       */
      remove_effects?: string[]
    }
    /**
     * Determines whether the item is immune to burning when dropped in fire or lava.
     */
    fire_resistant?: {
      /**
       * Determines whether the item is immune to burning when dropped in fire or lava.
       * @default true
       */
      value?: boolean
    }

    /**
     * Allows an item to place entities into the world.
     * Additionally, in version 1.19.80 and above, the component allows the item to set the spawn type of a monster spawner.
     */
    entity_placer?: {
      /**
       * List of block descriptors of the blocks that this item can be dispensed on.
       * If left empty, all blocks will be allowed.
       */
      dispense_on?: Array<
        | string
        | {
            name: string
            states?: Record<string, number | string | boolean>
            tags?: string
          }
      >
      /**
       * The entity to be placed in the world.
       * Value must match a regular expression pattern of "^(?:\\w+(?:.\\w+):(?=\\w))?(?:\\w+(?:.\\w+))(?:<((?:\\w+(?:.\\w+):(?=\\w))?\\w+(?:.\\w+))*>)?$"
       * @example "minecraft:turtle"
       */
      entity: string
      /**
       * List of block descriptors of the blocks that this item can be used on.
       * If left empty, all blocks will be allowed.
       */
      use_on?: Array<
        | string
        | {
            name: string
            states?: Record<string, number | string | boolean>
            tags?: string
          }
      >
    }

    /**
     * Allows this item to be used as fuel in a furnace to 'cook' other items.
     * This item can also be represented as a Decimal number.
     */
    fuel?: {
      duration: number
    }
    kinetic_weapon?: {
      creative_reach?: { max?: number; min?: number }
      damage_conditions?: {
        max_duration?: number
        min_relative_speed?: number
        min_speed?: number
      }
      damage_modifier?: number
      damage_multiplier?: number
      delay?: number
      dismount_conditions?: {
        max_duration?: number
        min_relative_speed?: number
        min_speed?: number
      }
      hitbox_margin?: number
      knockback_conditions?: {
        max_duration?: number
        min_relative_speed?: number
        min_speed?: number
      }
      kinetic_effect_conditions?: {
        max_duration?: number
        min_relative_speed?: number
        min_speed?: number
      }
      reach?: { max?: number; min?: number }
    }
    interact_button?: boolean | string
    hover_text_color?: { value?: string }
    /**
     * Determines whether the item interacts with liquid blocks on use.
     * To allow placement of blocks on liquids, see the 'placement_filter' block component.
     * This item can also be represented as a Boolean true/false.
     */
    'minecraft:liquid_clipped'?:
      | boolean
      | {
          /**
           * Determines whether the item interacts with liquid blocks on use.
           */
          value?: boolean
        }
    liquid_clipped?:
      | boolean
      | {
          /**
           * Determines whether the item interacts with liquid blocks on use.
           */
          value?: boolean
        }
    /**
     * Determines how many of an item can be stacked together.
     * This item can also be represented as a Integer number.
     * @default 64
     */
    'minecraft:max_stack_size'?:
      | number
      | {
          /**
           * How many of an item that can be stacked together.
           * @default 64
           */
          value?: number
        }
    max_stack_size?:
      | number
      | {
          /**
           * How many of an item that can be stacked together.
           * @default 64
           */
          value?: number
        }
  }>
}
type JSONValue<T> =
  | T
  | {
      value: T
    }

/**
 * Food effects interface for minecraft:food component
 */
interface FoodEffect {
  /**
   * Effect amplifier
   * @example 1 for regeneration amplifier
   */
  amplifier?: number

  /**
   * Chance of the effect being applied (0.0 to 1.0)
   * @example 0.3 for 30% chance
   */
  chance?: number

  /**
   * Duration of the effect in seconds
   * @example 30 for 30 seconds duration
   */
  duration?: number

  /**
   * Name of the effect
   * @example "regeneration", "absorption", "hunger"
   */
  name?: string
}

type ItemGroupEnum =
  | 'minecraft:itemGroup.name.planks'
  | 'minecraft:itemGroup.name.walls'
  | 'minecraft:itemGroup.name.fence'
  | 'minecraft:itemGroup.name.fenceGate'
  | 'minecraft:itemGroup.name.glass'
  | 'minecraft:itemGroup.name.trapdoor'
  | 'minecraft:itemGroup.name.door'
  | 'minecraft:itemGroup.name.stairs'
  | 'minecraft:itemGroup.name.glassPane'
  | 'minecraft:itemGroup.name.slab'
  | 'minecraft:itemGroup.name.stoneBrick'
  | 'minecraft:itemGroup.name.sandstone'
  | 'minecraft:itemGroup.name.copper'
  | 'minecraft:itemGroup.name.wool'
  | 'minecraft:itemGroup.name.woolCarpet'
  | 'minecraft:itemGroup.name.concretePowder'
  | 'minecraft:itemGroup.name.concrete'
  | 'minecraft:itemGroup.name.stainedClay'
  | 'minecraft:itemGroup.name.glazedTerracotta'
  | 'minecraft:itemGroup.name.ore'
  | 'minecraft:itemGroup.name.stone'
  | 'minecraft:itemGroup.name.log'
  | 'minecraft:itemGroup.name.wood'
  | 'minecraft:itemGroup.name.leaves'
  | 'minecraft:itemGroup.name.sapling'
  | 'minecraft:itemGroup.name.seed'
  | 'minecraft:itemGroup.name.crop'
  | 'minecraft:itemGroup.name.grass'
  | 'minecraft:itemGroup.name.coral_decorations'
  | 'minecraft:itemGroup.name.flower'
  | 'minecraft:itemGroup.name.dye'
  | 'minecraft:itemGroup.name.rawFood'
  | 'minecraft:itemGroup.name.mushroom'
  | 'minecraft:itemGroup.name.monsterStoneEgg'
  | 'minecraft:itemGroup.name.mobEgg'
  | 'minecraft:itemGroup.name.coral'
  | 'minecraft:itemGroup.name.sculk'
  | 'minecraft:itemGroup.name.helmet'
  | 'minecraft:itemGroup.name.chestplate'
  | 'minecraft:itemGroup.name.leggings'
  | 'minecraft:itemGroup.name.boots'
  | 'minecraft:itemGroup.name.sword'
  | 'minecraft:itemGroup.name.axe'
  | 'minecraft:itemGroup.name.pickaxe'
  | 'minecraft:itemGroup.name.shovel'
  | 'minecraft:itemGroup.name.hoe'
  | 'minecraft:itemGroup.name.arrow'
  | 'minecraft:itemGroup.name.cookedFood'
  | 'minecraft:itemGroup.name.miscFood'
  | 'minecraft:itemGroup.name.goatHorn'
  | 'minecraft:itemGroup.name.bundles'
  | 'minecraft:itemGroup.name.horseArmor'
  | 'minecraft:itemGroup.name.potion'
  | 'minecraft:itemGroup.name.splashPotion'
  | 'minecraft:itemGroup.name.lingeringPotion'
  | 'minecraft:itemGroup.name.ominousBottle'
  | 'minecraft:itemGroup.name.bed'
  | 'minecraft:itemGroup.name.candles'
  | 'minecraft:itemGroup.name.anvil'
  | 'minecraft:itemGroup.name.chest'
  | 'minecraft:itemGroup.name.shulkerBox'
  | 'minecraft:itemGroup.name.record'
  | 'minecraft:itemGroup.name.sign'
  | 'minecraft:itemGroup.name.hanging_sign'
  | 'minecraft:itemGroup.name.skull'
  | 'minecraft:itemGroup.name.boat'
  | 'minecraft:itemGroup.name.chestboat'
  | 'minecraft:itemGroup.name.rail'
  | 'minecraft:itemGroup.name.minecart'
  | 'minecraft:itemGroup.name.buttons'
  | 'minecraft:itemGroup.name.pressurePlate'
  | 'minecraft:itemGroup.name.banner_pattern'
  | 'minecraft:itemGroup.name.potterySherds'
  | 'minecraft:itemGroup.name.smithing_templates'
interface ItemJSON {
  format_version: string
  'minecraft:item': {
    description: {
      identifier: string
      category?: string
      menu_category?: {
        category: string
        group: ItemGroupEnum
      }
    }
    components: {
      'minecraft:display_name'?: JSONValue<string>
      'minecraft:allow_off_hand'?: JSONValue<boolean>
      'minecraft:can_destroy_in_creative'?: JSONValue<boolean>
      'minecraft:compostable'?: {
        composting_chance: number
      }
      'minecraft:cooldown'?: {
        category: string
        // 正整数 10 进制
        duration: number
        type: 'use' | 'attack'
      }
      'minecraft:damage'?: JSONValue<number>
      'minecraft:icon'?: JSONValue<string>
      'minecraft:block_placer'?: {
        aligned_placement?: boolean
        block: string
        replace_block_item?: boolean
        use_on?: Array<
          | string
          | {
              name: string
              states?: Record<string, number | string | boolean>
              tags?: string
            }
        >
      }
      'minecraft:bundle_interaction'?: {
        num_viewable_slots?: number
      }
      'minecraft:storage_item'?: {
        max_slots?: number
        max_weight_limit?: number
        weight_in_storage_item?: number
        allow_nested_storage_items?: boolean
        allowed_items?: string[]
        banned_items?: string[]
      }
      'minecraft:storage_weight_limit'?: {
        /**
         * 存储物品允许的最大总重量（十进制数）
         * @default undefined
         */
        limit?: number
      }
      'minecraft:storage_weight_modifier'?: {
        /**
         * 应用于存储物品的重量乘数
         * 在计算中，物品的基本重量会乘以该值
         * @default undefined
         */
        multiplier?: number
      }
      'minecraft:glint'?: JSONValue<boolean>
      'minecraft:hand_equipped'?: JSONValue<boolean>
      'minecraft:digger'?: {
        use_efficiency?: boolean
        destroy_speeds?: Array<{
          block:
            | string
            | {
                name?: string
                states?: Record<string, number | string | boolean>
                tags?: string
              }
          speed: number
        }>
      }
      'minecraft:damage_absorption'?: {
        absorbable_causes: string[]
      }
      'minecraft:durability'?: {
        max_durability: number
        damage_chance?: {
          min: number
          max: number
        }
      }
      'minecraft:durability_sensor'?: {
        durability?: number
        durability_thresholds?: Array<{
          durability: number
          particle_type?: ParticleType
          sound_event?: SoundEvent
        }>
        particle_type?: ParticleType
        sound_event?: SoundEvent
      }
      /**
       * Enables custom items to be dyed in cauldrons.
       * Requires format version 1.21.30 or greater.
       */
      'minecraft:dyeable'?: {
        /**
         * The default color for the dyed item
         * Can be a hex string (e.g., "#175882") or array of RGB numbers [255, 255, 255]
         * @default [255, 255, 255]
         */
        default_color?: string | [number, number, number]
      }
      /**
       * Determines what enchantments can be applied to the item.
       * Not all enchantments will have an effect on all item components.
       */
      'minecraft:enchantable'?: {
        /**
         * Specifies which types of enchantments can be applied.
         * For example, "bow" would allow this item to be enchanted as if it were a bow.
         * @example "armor_torso" for chestplate, "armor_feet" for boots
         */
        slot?: EnchantableSlot

        /**
         * Specifies the value of the enchantment (minimum of 0).
         * @default 0
         * @type Integer number
         * @example Chestplate: 10
         */
        value?: number
      }

      /**
       * Sets the item as a food component, allowing it to be edible to the player.
       */
      'minecraft:food'?: {
        can_always_eat?: boolean
        cooldown_time?: number
        cooldown_type?: string
        effects?: FoodEffect[]
        is_meat?: boolean
        nutrition?: number
        on_use_action?: string
        on_use_range?: [number, number, number]
        saturation_modifier?:
          | number
          | 'poor'
          | 'low'
          | 'normal'
          | 'good'
          | 'supernatural'
        using_converts_to?: string
        remove_effects?: string[]
      }

      /**
       * Determines whether the item is immune to burning when dropped in fire or lava.
       */
      'minecraft:fire_resistant'?: {
        value?: boolean
      }

      /**
       * Allows an item to place entities into the world.
       * Additionally, in version 1.19.80 and above, the component allows the item to set the spawn type of a monster spawner.
       */
      'minecraft:entity_placer'?: {
        /**
         * List of block descriptors of the blocks that this item can be dispensed on.
         * If left empty, all blocks will be allowed.
         */
        dispense_on?: Array<
          | string
          | {
              name: string
              states?: Record<string, number | string | boolean>
              tags?: string
            }
        >
        /**
         * The entity to be placed in the world.
         * Value must match a regular expression pattern of "^(?:\w+(?:.\w+):(?=\w))?(?:\w+(?:.\w+))(?:<((?:\w+(?:.\w+):(?=\w))?\w+(?:.\w+))*>)?$"
         * @example "minecraft:turtle"
         */
        entity: string
        /**
         * List of block descriptors of the blocks that this item can be used on.
         * If left empty, all blocks will be allowed.
         */
        use_on?: Array<
          | string
          | {
              name: string
              states?: Record<string, number | string | boolean>
              tags?: string
            }
        >
      }

      /**
       * Allows this item to be used as fuel in a furnace to 'cook' other items.
       * This item can also be represented as a Decimal number.
       */
      'minecraft:fuel'?: {
        /**
         * How long in seconds will this fuel cook items for.
         * Value must be >= 0.05.
         */
        duration: number
      }
      'minecraft:kinetic_weapon'?: {
        /**
         * Defines the reach used when the user is in Creative Mode.
         * Defaults to "reach" if unspecified.
         */
        creative_reach?: { max?: number; min?: number }
        /**
         * Conditions that need to be satisfied for damage to be applied.
         * If not specified, damage is not applied.
         */
        damage_conditions?: {
          max_duration?: number
          min_relative_speed?: number
          min_speed?: number
        }
        /**
         * Value added to the the scaled dot product (after applying "damage_multiplier").
         * @default 0
         */
        damage_modifier?: number
        /**
         * Value multiplied to sum of the dot products of the user and target's velocity vectors projected onto the view vector.
         * @default 1
         */
        damage_multiplier?: number
        /**
         * Time, in ticks, after which kinetic damage and its effects start being applied.
         * @default 0
         */
        delay?: number
        /**
         * Conditions that need to be satisfied for riders to be dismounted.
         * If not specified, riders cannot be dismounted.
         */
        dismount_conditions?: {
          max_duration?: number
          min_relative_speed?: number
          min_speed?: number
        }
        /**
         * Added tolerance to the view vector raycast for detecting entity collisions.
         * @default 0
         */
        hitbox_margin?: number
        /**
         * Conditions that need to be satisfied for knockback to be applied.
         * If not specified, knockback is not applied.
         */
        knockback_conditions?: {
          max_duration?: number
          min_relative_speed?: number
          min_speed?: number
        }
        /**
         * Conditions that need to be satisfied for a specific effect of a kinetic weapon to be applied.
         */
        kinetic_effect_conditions?: {
          max_duration?: number
          min_relative_speed?: number
          min_speed?: number
        }
        /**
         * Defines the reach used for kinetic weapon effects.
         */
        reach?: { max?: number; min?: number }
      }
      'minecraft:interact_button'?: boolean | string
      'minecraft:hover_text_color'?: {
        /**
         * The color of the item hover text.
         */
        value?: string
      }
      /**
       * The liquid_clipped component determines whether the item interacts with liquid blocks on use.
       * To allow placement of blocks on liquids, see the 'placement_filter' block component.
       * This item can also be represented as a Boolean true/false.
       */
      'minecraft:liquid_clipped'?:
        | boolean
        | {
            /**
             * Determines whether the item interacts with liquid blocks on use.
             */
            value?: boolean
          }
      /**
       * Determines how many of an item can be stacked together.
       * This item can also be represented as a Integer number.
       * @default 64
       */
      'minecraft:max_stack_size'?:
        | number
        | {
            /**
             * How many of an item that can be stacked together.
             * @default 64
             */
            value?: number
          }
      /**
       * Allows an item to deal damage to all entities detected in a straight line along the user's view vector.
       * Items with this component cannot destroy blocks, as the attack action always takes priority, regardless of what the user is looking at.
       */
      'minecraft:piercing_weapon'?: {
        /**
         * Defines the reach used when the user is in Creative Mode. Defaults to "reach" if unspecified.
         */
        creative_reach?: {
          max?: number
          min?: number
        }
        /**
         * Added tolerance to the view vector raycast for detecting entity collisions.
         * @default 0
         */
        hitbox_margin?: number
        /**
         * Defines the range (in blocks) along the user's view vector where entities can be hit.
         * @default {"max":3,"min":0}
         */
        reach?: {
          max?: number
          min?: number
        }
      }
      piercing_weapon?: {
        creative_reach?: {
          max?: number
          min?: number
        }
        hitbox_margin?: number
        reach?: {
          max?: number
          min?: number
        }
      }
      /**
       * Defines an item as a projectile that can be shot from dispensers or used as ammunition with minecraft:shooter.
       * When combined with minecraft:throwable, this component specifies which entity is spawned when the item is thrown.
       */
      'minecraft:projectile'?: {
        /**
         * Specifies how long a player must charge a projectile for it to critically hit.
         * @example "My Sword Chuck": 1.25
         * @default 0
         */
        minimum_critical_power?: number
        /**
         * Which entity is to be fired as a projectile.
         * Value must match a regular expression pattern of "^(?:\\w+(?:.\\w+):(?=\\w))?(?:\\w+(?:.\\w+))(?:<((?:\\w+(?:.\\w+):(?=\\w))?\\w+(?:.\\w+))*>)?$".
         * @example "Wind Charge": "wind_charge_projectile", "My Sword Chuck": "minecraft:snowball"
         */
        projectile_entity: string
      }

      /**
       * Used by record items to play music.
       * @example "My Sword Singing"
       */
      'minecraft:record'?: {
        /**
         * Specifies signal strength for comparator blocks to use, from 1 - 13.
         * @example "My Sword Singing": 1
         * @default 1
         */
        comparator_signal?: number
        /**
         * Specifies duration of sound event in seconds, float value.
         * @example "My Sword Singing": 5
         * @default 0
         */
        duration?: number
        /**
         * Sound event type.
         * Values: 13, cat, blocks, chirp, far, mall, mellohi, stal, strad, ward, 11, wait, pigstep, otherside, 5, relic
         * @example "My Sword Singing": "pigstep"
         */
        sound_event: SoundEvent
      }

      /**
       * Specifies the base rarity and subsequently color of the item name when the player hovers the cursor over the item.
       * This item requires a format version of at least 1.21.30.
       * This item can also be represented as a String.
       */
      'minecraft:rarity'?: {
        /**
         * Sets the base rarity of the item.
         * The rarity of an item automatically increases when enchanted, either to Rare when the base rarity is Common or Uncommon,
         * or Epic when the base rarity is Rare.
         * @example "rare"
         */
        value: Rarity
      }

      /**
       * Defines the items that can be used to repair a defined item, and the amount of durability each item restores upon repair.
       * Each entry needs to define a list of strings for 'items' that can be used for the repair and an optional 'repair_amount' for how much durability is repaired.
       * @example Chestplate: {"on_repaired":"minecraft:celebrate","repair_items":["anvil"]}
       * @example My Sword Chuck: {"repair_items":[{"items":["minecraft:diamond"],"repair_amount":"query.max_durability * 0.25"}]}
       */
      'minecraft:repairable'?: {
        /**
         * Event triggered when the item is repaired
         * @example "minecraft:celebrate"
         */
        on_repaired?: string

        /**
         * List of repair item entries.
         * Each entry needs to define a list of strings for items that can be used for the repair and an optional repair_amount for how much durability is gained.
         */
        repair_items?: Array<
          | string
          | {
              /**
               * Items that can be used to repair an item.
               * @example ["minecraft:stick"]
               * @example ["minecraft:diamond"]
               */
              items: string[]

              /**
               * How much the item is repaired.
               * Can be a string expression or a numeric value.
               * @example "context.other->query.remaining_durability + 0.05 * context.other->query.max_durability"
               * @example "query.max_durability * 0.25"
               */
              repair_amount?: string | number
            }
        >
      }

      /**
       * Sets the item as a seed that can be planted to grow crops.
       * When used on valid ground, the seed will place the specified crop block.
       * This item requires a format version of at least 1.10.0.
       * @example Beetroot Seeds: {"crop_result":"beetroot"}
       * @example Glow Berries: {"crop_result":"cave_vines","plant_at":["cave_vines","cave_vines_head_with_berries"],"plant_at_any_solid_surface":true,"plant_at_face":"DOWN"}
       */
      'minecraft:seed'?: {
        /**
         * The block identifier that will be placed when the seed is planted.
         * @example "beetroot"
         * @example "cave_vines"
         */
        crop_result: string

        /**
         * Array of block identifiers that this seed can be planted on or attached to.
         * If not specified, standard farmland rules apply.
         * @example ["cave_vines","cave_vines_head_with_berries"]
         */
        plant_at?: string[]

        /**
         * Deprecated - no longer in use.
         * If true, the seed can be planted on any solid surface, not just farmland or specified blocks.
         * This property was deprecated and removed in versions after 1.18.
         * This property no longer works after format versions of at least 1.19.0.
         */
        plant_at_any_solid_surface?: boolean

        /**
         * Deprecated - no longer in use.
         * The face of a block where this seed can be planted.
         * Values: 'UP' for top of blocks (normal crops), 'DOWN' for bottom (hanging plants like glow berries).
         * This property was deprecated and removed in versions after 1.18.
         * This property no longer works after format versions of at least 1.19.0.
         */
        plant_at_face?: 'UP' | 'DOWN'
      }
      projectile?: {
        minimum_critical_power?: number
        projectile_entity: string
      }

      /**
       * Used by record items to play music.
       * @example "My Sword Singing"
       */
      record?: {
        /**
         * Specifies signal strength for comparator blocks to use, from 1 - 13.
         * @example "My Sword Singing": 1
         * @default 1
         */
        comparator_signal?: number
        /**
         * Specifies duration of sound event in seconds, float value.
         * @example "My Sword Singing": 5
         * @default 0
         */
        duration?: number
        /**
         * Sound event type.
         * Values: 13, cat, blocks, chirp, far, mall, mellohi, stal, strad, ward, 11, wait, pigstep, otherside, 5, relic
         * @example "My Sword Singing": "pigstep"
         */
        sound_event: SoundEvent
      }

      /**
       * Specifies the base rarity and subsequently color of the item name when the player hovers the cursor over the item.
       * This item requires a format version of at least 1.21.30.
       * This item can also be represented as a String.
       */
      rarity?: {
        /**
         * Sets the base rarity of the item.
         * The rarity of an item automatically increases when enchanted, either to Rare when the base rarity is Common or Uncommon,
         * or Epic when the base rarity is Rare.
         * @example "rare"
         */
        value: Rarity
      }

      /**
       * Alias for minecraft:repairable
       * Defines the items that can be used to repair a defined item, and the amount of durability each item restores upon repair.
       * @example Chestplate: {"on_repaired":"minecraft:celebrate","repair_items":["anvil"]}
       */
      repairable?: {
        on_repaired?: string
        repair_items?: Array<
          | string
          | {
              items: string[]
              repair_amount?: string | number
            }
        >
      }

      /**
       * Alias for minecraft:seed
       * Sets the item as a seed that can be planted to grow crops.
       * This item requires a format version of at least 1.10.0.
       * @example Beetroot Seeds: {"crop_result":"beetroot"}
       */
      seed?: {
        crop_result: string
        plant_at?: string[]
        plant_at_any_solid_surface?: boolean
        plant_at_face?: 'UP' | 'DOWN'
      }

      /**
       * Controls whether items with different aux values can be stacked together.
       * If true (default), items with different damage, custom data, or other aux values cannot stack.
       * If false, all items of this type stack regardless of aux values.
       * This is primarily used for items like armor with different durability values.
       * @default true
       */
      'minecraft:stacked_by_data'?: {
        value?: boolean
      }

      /**
       * Controls whether dropped items should despawn while floating on water.
       * If true, items will despawn when floating (default for most items).
       * If false, items will not despawn while floating on water.
       * @default true
       */
      'minecraft:should_despawn'?: {
        value?: boolean
      }

      /**
       * Allows an item to be used for shooting projectiles like bows, crossbows, or thrown items.
       * Requires the entity to have the minecraft:projectile component.
       * @example Bow: {"ammunition":["arrow"],"charge_on_draw":true,"max_draw_duration":1.0}
       */
      'minecraft:shooter'?: {
        /**
         * Array of ammunition item identifiers that can be used with this shooter.
         * Each item can have specific launch power and other properties.
         * @example ["arrow", {"item":"spectral_arrow","launch_power_scale":1.2}]
         */
        ammunition: Array<
          | string
          | {
              /** Specific item identifier */
              item: string
              /** Scale factor for launch power (default 1.0) */
              launch_power_scale?: number
              /** Maximum draw duration in seconds (optional override) */
              max_draw_duration?: number
              /** Whether to apply charge effects (optional override) */
              charge_on_draw?: boolean
            }
        >

        /**
         * Whether power/strength increases while drawing (like bows).
         * If true, power scales with draw duration up to max_draw_duration.
         * @default false
         */
        charge_on_draw?: boolean

        /**
         * Maximum time in seconds that the item can be drawn/charged.
         * @default 0.0
         */
        max_draw_duration?: number

        /**
         * Whether the shooter automatically charges when held.
         * @default false
         */
        auto_charge?: boolean

        /**
         * Base power/velocity multiplier for projectiles.
         * @default 1.0
         */
        launch_power?: number

        /**
         * Whether to scale power based on draw duration.
         * @default true
         */
        scale_power_by_draw_duration?: boolean
      }

      /**
       * Alias for minecraft:stacked_by_data
       * Controls whether items with different aux values can be stacked together.
       * @default true
       */
      stacked_by_data?: {
        value?: boolean
      }

      /**
       * Alias for minecraft:should_despawn
       * Controls whether dropped items should despawn while floating on water.
       * @default true
       */
      should_despawn?: {
        value?: boolean
      }

      /**
       * Makes an item throwable by the player, similar to a snowball or ender pearl.
       * Use with minecraft:projectile to specify which entity is spawned when thrown.
       *
       * 注意：Combine with minecraft:projectile to define the projectile entity.
       * For charged throws (like tridents), set scale_power_by_draw_duration to true and configure min/max draw durations.
       */
      'minecraft:throwable'?: {
        /**
         * Determines whether the item should use the swing animation when thrown.
         * @default false
         */
        do_swing_animation?: boolean

        /**
         * The scale at which the power of the throw increases.
         * @default 1.0
         */
        launch_power_scale?: number

        /**
         * The maximum duration to draw a throwable item.
         * @default 0.0
         */
        max_draw_duration?: number

        /**
         * The maximum power to launch the throwable item.
         * @default 1.0
         */
        max_launch_power?: number

        /**
         * The minimum duration to draw a throwable item.
         * @default 0.0
         */
        min_draw_duration?: number

        /**
         * Whether or not the power of the throw increases with duration charged.
         * @default false
         */
        scale_power_by_draw_duration?: boolean
      }

      /**
       * Determines which tags are included on a given item.
       */
      'minecraft:tags'?: {
        /**
         * An array that can contain multiple item tags.
         * @default []
         */
        tags?: string[]
      }

      /**
       * Duration, in seconds, of the item's swing animation played when mining or attacking.
       * Affects visuals only and does not impact attack frequency or other gameplay mechanics.
       */
      'minecraft:swing_duration'?: {
        /**
         * Duration, in seconds, of the item's swing animation played when mining or attacking.
         * Affects visuals only and does not impact attack frequency or other gameplay mechanics.
         * @default 0.30000001192092896
         */
        value?: number
      }

      /**
       * Use_animation specifies which animation is played when the player uses the item.
       * This item can also be represented as a String.
       * Supported animations: 'eat', 'drink', 'block', 'bow', 'camera', 'spear', 'crossbow', 'spyglass', 'toot_horn', 'brush'.
       */
      'minecraft:use_animation'?:
        | string
        | {
            /**
             * The animation type to play when the item is used.
             */
            value?: string
          }

      // Alias for minecraft:use_animation
      use_animation?:
        | string
        | {
            value?: string
          }

      /**
       * Sets the wearable item component, which allows an item to be worn by a player in a specified equipment slot.
       * Valid equipment slots: slot.armor.head, slot.armor.chest, slot.armor.legs, slot.armor.feet, slot.armor.body, slot.weapon.mainhand, slot.weapon.offhand.
       * When a non-hand armor slot is used, the max stack size is automatically set to 1.
       */
      'minecraft:wearable'?: {
        /**
         * Specifies where the item can be worn.
         * If any non-hand slot is chosen, the max stack size is set to 1.
         * @example "slot.armor.chest", "slot.armor.head", "slot.armor.feet"
         */
        slot:
          | 'slot.armor.head'
          | 'slot.armor.chest'
          | 'slot.armor.legs'
          | 'slot.armor.feet'
          | 'slot.armor.body'
          | 'slot.weapon.mainhand'
          | 'slot.weapon.offhand'

        /**
         * How much protection the wearable item provides.
         * @default 0
         * @type Integer number
         */
        protection?: number

        /**
         * Determines whether the Player's location is hidden on Locator Maps and the Locator Bar when the wearable item is worn.
         * @default false
         */
        hides_player_location?: boolean

        /**
         * Whether the item can be used by dispensers.
         * @example true
         */
        dispensable?: boolean
      }

      // Alias for minecraft:wearable
      wearable?: {
        slot:
          | 'slot.armor.head'
          | 'slot.armor.chest'
          | 'slot.armor.legs'
          | 'slot.armor.feet'
          | 'slot.armor.body'
          | 'slot.weapon.mainhand'
          | 'slot.weapon.offhand'
        protection?: number
        hides_player_location?: boolean
        dispensable?: boolean
      }

      /**
       * Determines how long an item takes to use in combination with components such as Shooter, Throwable, or Food.
       */
      'minecraft:use_modifiers'?: {
        /**
         * Time, in seconds, that the item takes to use.
         * @example 1.6
         * @type Decimal number
         */
        use_duration: number

        /**
         * Multiplier applied to the player's movement speed while the item is in use.
         * Value must be <= 1.
         * @example 0.35
         * @type Decimal number
         */
        movement_modifier?: number

        /**
         * Whether vibrations are emitted when the item starts or stops being used.
         * @default true
         */
        emit_vibrations?: boolean

        /**
         * Sound played when the item starts being used.
         * @see StartSoundChoices
         */
        start_sound?: string
      }

      // Alias for minecraft:use_modifiers
      use_modifiers?: {
        use_duration: number
        movement_modifier?: number
        emit_vibrations?: boolean
        start_sound?: string
      }

      /**
       * Overrides the swing sounds emitted by the user.
       */
      'minecraft:swing_sounds'?: {
        /**
         * Sound played when an attack hits and deals critical damage.
         * @see AttackCriticalHitChoices
         */
        attack_critical_hit?: string

        /**
         * Sound played when an attack hits.
         * @see AttackHitChoices
         */
        attack_hit?: string

        /**
         * Sound played when an attack misses or deals no damage due to invulnerability.
         * @see AttackMissChoices
         */
        attack_miss?: string
      }

      // Alias for minecraft:swing_sounds
      swing_sounds?: {
        attack_critical_hit?: string
        attack_hit?: string
        attack_miss?: string
      }

      /**
       * Alias for minecraft:shooter
       * Allows an item to be used for shooting projectiles like bows, crossbows, or thrown items.
       * Requires the entity to have the minecraft:projectile component.
       */
      shooter?: {
        ammunition: Array<
          | string
          | {
              item: string
              launch_power_scale?: number
              max_draw_duration?: number
              charge_on_draw?: boolean
            }
        >
        charge_on_draw?: boolean
        max_draw_duration?: number
        auto_charge?: boolean
        launch_power?: number
        scale_power_by_draw_duration?: boolean
      }
    }
  }
}
export type {
  ItemComponentOpt,
  ItemGroupEnum,
  ItemJSON,
  ParticleType,
  SoundEvent,
  EnchantableSlot,
  RepairItem,
  RepairAmountExpression,
  SeedProperties,
}
// Rarity type constants
type Rarity = 'common' | 'uncommon' | 'rare' | 'epic'

const RarityEnum = ['common', 'uncommon', 'rare', 'epic'] as const

export { SoundEventEnum } from './types/SoundEvent'
export { ParticleTypeEnum } from './types/ParticleType'
export { EnchantableSlotEnum } from './types/EnchantableSlot'
export { RarityEnum }
export type { Rarity }

// Plant face enum for seed component
type PlantFace = 'UP' | 'DOWN'
const PlantFaceEnum = ['UP', 'DOWN'] as const

// Block pattern for validation
const BlockPattern = /^\w+(?::\w+)*$/

// Export all new types and enums
export type { PlantFace }
export { PlantFaceEnum, BlockPattern }

// Repairable types
type RepairItem = {
  /**
   * Items that may be used to repair an item.
   * @example ["minecraft:diamond"]
   */
  items: string[]

  /**
   * How much the item is repaired. Can be a string expression or a numeric value.
   * @example "query.max_durability * 0.25"
   * @example "context.other->query.remaining_durability + 0.05 * context.other->query.max_durability"
   */
  repair_amount?: string | number
}

type RepairAmountExpression = {
  /**
   * The expression for repair amount calculation
   */
  expression: string

  /**
   * Version identifier
   */
  version: number
}

const RepairItemSchema = {
  items: 'string[]',
  repair_amount: 'string | number',
} as const

// Seed types
type SeedProperties = {
  /**
   * The block identifier that will be placed when the seed is planted
   * @example "beetroot"
   * @example "cave_vines"
   */
  crop_result: string

  /**
   * Array of block identifiers that this seed can be planted on or attached to.
   * If not specified, standard farmland rules apply.
   * @example ["cave_vines","cave_vines_head_with_berries"]
   */
  plant_at?: string[]

  /**
   * Deprecated - no longer in use.
   * This property was available in versions 1.16.0 through 1.18.x for items like glow berries.
   * This property no longer works after format versions of at least 1.19.0.
   */
  plant_at_any_solid_surface?: boolean

  /**
   * Deprecated - no longer in use.
   * The face of a block where this seed can be planted.
   * Values: 'UP' for top of blocks (normal crops), 'DOWN' for bottom (hanging plants like glow berries).
   * This property no longer works after format versions of at least 1.19.0.
   */
  plant_at_face?: 'UP' | 'DOWN'
}

const SeedPropertiesSchema = {
  crop_result: 'string',
  plant_at: 'string[]',
  plant_at_any_solid_surface: 'boolean',
  plant_at_face: '"UP" | "DOWN"',
} as const

// Entity Component Interfaces
interface EntityComponentOpt {
  id: string
  format: string
  is_spawnable?: boolean
  is_summonable?: boolean
  components?: {
    physics?: boolean
    /**
     * Adds a rider to the entity.
     * Requires the following component in order to work properly: Rideable (minecraft:rideable)
     */
    addrider?: {
      /** Type of entity to acquire as a rider */
      entity_type?: string
      /**
       * List of riders to be added to the entity. Can only spawn as many riders as
       * "minecraft:rideable" has "seat_count".
       */
      riders?: Array<{
        entity_type: string
        spawn_event?: string
      }>
      /** Trigger event when a rider is acquired */
      spawn_event?: string
    }

    /**
     * Allows an entity to ignore attackable targets for a given duration.
     */
    'minecraft:admire_item'?: {
      /** Duration, in seconds, for which mob won't admire items if it was hurt */
      cooldown_after_being_attacked?: number
      /** Duration, in seconds, that the mob is pacified */
      duration?: number
    }
    /**
     * Adds a timer for the entity to grow up. It can be accelerated by giving the entity
     * the items it likes as defined by feed_items.
     */
    'minecraft:ageable'?: {
      /** List of items that are dropped when an entity grows up */
      drop_items?: string[]
      /** Length of time before an entity grows up (-1 to always stay a baby) */
      duration?: number
      /**
       * List of items that can be fed to an entity to age them up. Can be a single item string,
       * an array of strings, or an array of objects with item and growth properties.
       */
      feed_items?:
        | string
        | string[]
        | Array<{
            growth?: number
            item: string
          }>
      /** Event to fire when an entity grows up. Can be an object with event and target properties, or a simple event string. */
      grow_up?:
        | string
        | {
            event: string
            target: string
          }
      /** List of conditions to meet so that the entity can be fed. */
      interact_filters?: any
      /** List of items that can be fed to the entity to pause growth for baby entities. */
      pause_growth_items?: string[]
      /** List of items that can be used to reset growth for baby entities. */
      reset_growth_items?: string[]
    }
    /**
     * Delay for an entity playing its sound.
     */
    'minecraft:ambient_sound_interval'?: {
      /** Level sound event to be played as the ambient sound. */
      event_name?: string
      /**
       * List of dynamic level sound events, with conditions for choosing between them.
       * Evaluated in order, first one wins. If none evaluate to true, 'event_name' will take precedence.
       */
      event_names?: Array<{
        /** The condition that must be satisfied to select the given ambient sound */
        condition?: string
        /** Level sound event to be played as the ambient sound */
        event_name?: string
      }>
      /** Maximum time in seconds to randomly add to the ambient sound delay time. */
      range?: number
      /** Minimum time in seconds before the entity plays its ambient sound again. */
      value?: number
    }
    'minecraft:attack_damage'?: {
      value?: number | { min: number; max: number }
    }
    /**
     * Compels the entity to track anger towards a set of nuisances.
     */
    'minecraft:anger_level'?: {
      /** Anger level will decay over time. Defines how often anger towards all nuisances will decrease by one. */
      anger_decrement_interval?: number
      /** Anger boost applied to angry threshold when mob gets angry Value must be >= 0. */
      angry_boost?: number
      /** Threshold that define when the mob is considered angry at a nuisance Value must be >= 0. */
      angry_threshold?: number
      /** If set, other entities of the same entity definition within the broadcastRange will also become angry */
      broadcast_anger?: boolean
      /** If set, other entities of the same entity definition within the broadcastRange will also become angry whenever this mob attacks */
      broadcast_anger_on_attack?: boolean
      /** Conditions that make this entry in the list valid */
      broadcast_filters?: any
      /** Distance in blocks within which other entities of the same entity type will become angry */
      broadcast_range?: number
      /** A list of entity families to broadcast anger to */
      broadcast_targets?: string[]
      /** Event to fire when this entity is calmed down */
      calm_event?: string
      /** The default amount of annoyingness for any given nuisance. Specifies how much to raise anger level on each provocation. */
      default_annoyingness?: number
      /** Default projectile annoyingness value */
      default_projectile_annoyingness?: number
      /** The amount of time in seconds that the entity will be angry. */
      duration?: number
      /** Variance in seconds added to the duration [-delta, delta]. */
      duration_delta?: number
      /** Filter out mob types that it should not attack while angry (other Piglins) */
      filters?: any
      /** The maximum anger level that can be reached. Applies to any nuisance Value must be >= 0. */
      max_anger?: number
      /** Filter that is applied to determine if a mob can be a nuisance */
      nuisance_filter?: any
      /**
       * Sounds to play when the entity is getting provoked. Evaluated in order.
       * First matching condition wins
       */
      on_increase_sounds?: Array<{
        /** A Molang expression describing under which conditions to play this sound, given that the entity was provoked */
        condition?: string
        /** The sound to play */
        sound?: string
      }>
      /** Defines if the mob should remove target if it falls below 'angry' threshold */
      remove_targets_below_angry_threshold?: boolean
      /** The range of time in seconds to randomly wait before playing the sound again. */
      sound_interval?: { min: number; max: number }
    }
    /**
     * Defines an entity's 'angry' state using a timer.
     */
    'minecraft:angry'?: {
      /** The sound event to play when the mob is angry */
      angry_sound?: string
      /** If set, other entities of the same entity definition within the broadcastRange will also become angry */
      broadcast_anger?: boolean
      /** If set, other entities of the same entity definition within the broadcastRange will also become angry whenever this mob attacks */
      broadcast_anger_on_attack?: boolean
      /** If true, other entities of the same entity definition within the broadcastRange will also become angry whenever this mob is attacked */
      broadcast_anger_on_being_attacked?: boolean
      /** If false, when this mob is killed it does not spread its anger to other entities of the same entity definition within the broadcastRange */
      broadcast_anger_when_dying?: boolean
      /** Conditions that make this entry in the list valid */
      broadcast_filters?: any
      /** Distance in blocks within which other entities of the same entity type will become angry */
      broadcast_range?: number
      /** A list of entity families to broadcast anger to */
      broadcast_targets?: string[]
      /** Event to fire when this entity is calmed down. Can be a simple event name string or an object with event and target properties. */
      calm_event?: string | { event: string; target: string }
      /** The amount of time in seconds that the entity will be angry. */
      duration?: number
      /** Variance in seconds added to the duration [-delta, delta]. */
      duration_delta?: number
      /** Filter out mob types that it should not attack while angry (other Piglins) */
      filters?: any
      /** The range of time in seconds to randomly wait before playing the sound again. */
      sound_interval?: { min: number; max: number }
    }
    /**
     * Allows an entity to break doors, assuming that that flags set up for the component to use in navigation.
     * Tip: Requires the entity's navigation component to have the parameter can_break_doors set to true.
     */
    'minecraft:annotation.break_door'?: {
      /** The time in seconds required to break through doors. */
      break_time?: number
      /** The minimum difficulty that the world must be on for this entity to break doors. */
      min_difficulty?: 'hard' | 'normal' | 'easy' | 'peaceful'
    }
    'minecraft:annotation.open_door'?: {}
    'minecraft:attack'?: {
      damage?:
        | number
        | [number, number]
        | { range_min: number; range_max: number }
      effect_duration?: number
      effect_name?: string
    }
    'minecraft:area_attack'?: {
      cause?: string
      damage_cooldown?: number
      damage_per_tick?: number
      damage_range?: number
      entity_filter?: any
      play_attack_sound?: boolean
    }
    'minecraft:attack_cooldown'?: {
      attack_cooldown_complete_event?:
        | string
        | { event: string; target?: string }
      attack_cooldown_time?: number | { min: number; max: number }
    }
    'minecraft:balloonable'?: {
      mass?: number
      max_distance?: number
      on_balloon?: any
      on_unballoon?: any
      soft_distance?: number
    }
    'minecraft:barter'?: {
      barter_table?: string
      cooldown_after_being_attacked?: { min: number; max: number }
    }
    'minecraft:block_climber'?: {}
    'minecraft:block_sensor'?: {
      on_break?: Array<{
        block_list?: string[]
        on_block_broken?: string
      }>
      sensor_radius?: number
      sources?: any
    }
    'minecraft:body_rotation_axis_aligned'?: {}
    'minecraft:body_rotation_always_follows_head'?: {}
    'minecraft:body_rotation_blocked'?: {}
    'minecraft:body_rotation_locked_to_vehicle'?: {}
    'minecraft:boostable'?: {
      boost_items?: Array<{
        damage?: number
        item: string
        replace_item?: string
      }>
      duration?: number
      speed_multiplier?: number
    }
    'minecraft:boss'?: {
      hud_range?: number
      name?: string
      should_darken_sky?: boolean
    }
    'minecraft:break_blocks'?: {
      breakable_blocks?: string[]
    }
    'minecraft:breathable'?: {
      breathe_blocks?: string[]
      breathes_air?: boolean
      breathes_lava?: boolean
      breathes_solids?: boolean
      breathes_water?: boolean
      generates_bubbles?: boolean
      inhale_time?: number
      non_breathe_blocks?: string[]
      suffocate_time?: number
      suffocateTime?: number
      total_supply?: number
      totalSupply?: number
    }
    'minecraft:bribeable'?: {
      bribe_cooldown?: number
      bribe_items?: string[] | string
    }
    'minecraft:breedable'?: {
      allow_sitting?: boolean
      blend_attributes?: boolean
      breed_cooldown?: number
      breed_items?: string[] | string
      breeds_with?:
        | Array<{
            baby_type?: string
            breed_event?: string | { event: string; filters?: any }
            mate_type?: string
          }>
        | {
            baby_type?: string
            breed_event?: string | { event: string; filters?: any }
            mate_type?: string
          }
      causes_pregnancy?: boolean
      deny_parents_variant?: {
        chance?: number
        max_variant?: string
        min_variant?: string
      }
      environment_requirements?: Array<{
        block_types?: string[]
        count?: number
        radius?: number
      }>
      extra_baby_chance?: { min: number; max: number }
      inherit_tamed?: boolean
      love_filters?: any
      mutation_factor?: {
        color?: { min: number; max: number } | number
        extra_variant?: { min: number; max: number } | number
        variant?: { min: number; max: number } | number
      }
      require_full_health?: boolean
      require_tame?: boolean
    }
    'minecraft:buoyant'?: {
      apply_gravity?: boolean
      base_buoyancy?: number
      big_wave_probability?: number
      big_wave_speed?: number
      can_auto_step_from_liquid?: boolean
      drag_down_on_buoyancy_removed?: number
      liquid_blocks?: string[]
      movement_type?: 'waves' | 'bobbing' | 'none'
    }
    'minecraft:burns_in_daylight'?: {
      protection_slot?:
        | 'slot.armor.body'
        | 'slot.armor.chest'
        | 'slot.armor.feet'
        | 'slot.armor.head'
        | 'slot.armor.legs'
        | 'slot.weapon.mainhand'
        | 'slot.weapon.offhand'
    }
    'minecraft:cannot_be_attacked'?: {}
    'minecraft:can_climb'?: {}
    'minecraft:can_fly'?: {}
    'minecraft:can_join_raid'?: {}
    'minecraft:can_power_jump'?: {}
    'minecraft:celebrate_hunt'?: {
      broadcast?: boolean
      celeberation_targets?: any
      celebrate_sound?: string
      duration?: number
      radius?: number
      sound_interval?: { min: number; max: number }
    }
    'minecraft:collision_box'?: {
      height?: number
      width?: number
    }
    'minecraft:color'?: {
      value?: number
    }
    'minecraft:color2'?: {
      value?: number
    }
    'minecraft:combat_regeneration'?: {
      apply_to_family?: boolean
      apply_to_self?: boolean
      regeneration_duration?: number | 'infinite'
    }
    'minecraft:conditional_bandwidth_optimization'?: {
      conditional_values?: Array<{
        conditional_values?: any
        max_dropped_ticks?: number
        max_optimized_distance?: number
        use_motion_prediction_hints?: boolean
      }>
      default_values?: {
        max_dropped_ticks?: number
        max_optimized_distance?: number
        use_motion_prediction_hints?: boolean
      }
    }
    'minecraft:custom_hit_test'?: {
      hitboxes?: Array<{
        height?: number
        pivot?: [number, number, number]
        width?: number
      }>
    }
    'minecraft:damage_over_time'?: {
      damage_per_hurt?: number
      time_between_hurt?: number
    }
    'minecraft:damage_sensor'?: {
      deals_damage?: boolean | 'yes' | 'no' | 'no_but_side_effects_apply'
      triggers?:
        | Array<{
            cause?: string
            damage_modifier?: number
            damage_multiplier?: number
            deals_damage?: boolean | string
            event?: string
            filters?: any
            on_damage?: {
              filters?: any
            }
            on_damage_sound_event?: string
          }>
        | {
            cause?: string
            damage_modifier?: number
            damage_multiplier?: number
            deals_damage?: boolean | string
            event?: string
            filters?: any
            on_damage?: {
              filters?: any
            }
            on_damage_sound_event?: string
          }
    }
    'minecraft:dash'?: {
      cooldown_time?: number
      horizontal_momentum?: number
      vertical_momentum?: number
    }
    'minecraft:dash_action'?: {
      can_dash_underwater?: boolean
      cooldown_time?: number
      direction?: 'entity' | 'passenger'
      horizontal_momentum?: number
      vertical_momentum?: number
    }
    'minecraft:default_look_angle'?: {
      value?: number
    }
    'minecraft:despawn'?: {
      despawn_from_chance?: boolean
      despawn_from_distance?: {
        max_distance?: number
        min_distance?: number
      }
      despawn_from_inactivity?: boolean
      despawn_from_simulation_edge?: boolean
      filters?: any
      min_range_inactivity_timer?: number
      min_range_random_chance?: number
      remove_child_entities?: boolean
    }
    'minecraft:dimension_bound'?: {}
    'minecraft:drying_out_timer'?: {
      dried_out_event?: string | { event: string; target?: string }
      recover_after_dried_out_event?:
        | string
        | { event: string; target?: string }
      stopped_drying_out_event?: string | { event: string; target?: string }
      total_time?: number
      water_bottle_refill_time?: number
    }
    'minecraft:dweller'?: {
      can_find_poi?: boolean
      can_migrate?: boolean
      dweller_role?: string
      dwelling_bounds_tolerance?: number
      dwelling_role?: string
      dwelling_type?: string
      first_founding_reward?: number
      preferred_profession?: string
      update_interval_base?: number
      update_interval_variant?: number
    }
    'minecraft:economy_trade_table'?: {
      convert_trades_economy?: boolean
      cured_discount?: number | [number, number]
      display_name?: string
      hero_demand_discount?: number
      max_cured_discount?: number | [number, number]
      max_nearby_cured_discount?: number
      nearby_cured_discount?: number
      new_screen?: boolean
      persist_trades?: boolean
      show_trade_screen?: boolean
      table?: string
      use_legacy_price_formula?: boolean
    }
    'minecraft:entity_armor_equipment_slot_mapping'?: {
      armor_slot?: string
    }
    'minecraft:entity_sensor'?: {
      find_players_only?: boolean
      relative_range?: boolean
      subsensors?: Array<{
        cooldown?: number
        event?: string | { event: string; target?: string }
        event_filters?: any // Minecraft filter can be complex
        maximum_count?: number
        minimum_count?: number
        range?: [number, number] | [number, number, number] // [x,z] or [x,y,z]
        require_all?: boolean
        y_offset?: number
      }>
    }
    'minecraft:equipment'?: {
      slot_drop_chance?: Array<
        | string // Slot name string
        | {
            drop_chance?: number // Decimal number (0.0 to 1.0)
            slot?: string // Equipment slot name
          }
      >
      table?: string // File path to equipment table
    }
    'minecraft:equippable'?: {
      slots?: Array<{
        accepted_items?: string[] // List of items that can go in this slot
        interact_text?: string // Text for touch-screen controls
        item?: string // Identifier of the item
        on_equip?: any // Minecraft Event Trigger
        on_unequip?: any // Minecraft Event Trigger
        slot?: number // Slot number
        [key: string]: any // Allow additional slot properties
      }>
    }
    'minecraft:equip_item'?: {
      can_wear_armor?: boolean // If true, entity can pick up armor
      excluded_items?: Array<{
        item?: string // Excluded item identifier
        [key: string]: any // Allow additional excluded item properties
      }>
    }
    'minecraft:environment_sensor'?: {
      triggers?:
        | {
            event?: string | { event: string; target?: string }
            filters?: any // Can be complex filter objects
            [key: string]: any // Allow additional trigger properties
          }
        | Array<{
            event?: string | { event: string; target?: string }
            filters?: any // Can be complex filter objects
            [key: string]: any // Allow additional trigger properties
          }>
    }
    'minecraft:exhaustion_values'?: {
      attack?: number // Amount of exhaustion when attacking
      damage?: number // Amount of exhaustion when taking damage
      heal?: number // Amount of exhaustion when healed
      jump?: number // Amount of exhaustion when jumping
      lunge?: number // Amount of exhaustion when lunge enchantment triggers
      mine?: number // Amount of exhaustion when mining
      sprint?: number // Amount of exhaustion when sprinting
      sprint_jump?: number // Amount of exhaustion when sprint jumping
      swim?: number // Amount of exhaustion when swimming
      walk?: number // Amount of exhaustion when walking
      [key: string]: any // Allow additional exhaustion properties
    }
    'minecraft:experience_reward'?: {
      on_bred?:
        | string
        | number
        | {
            // Molang expression or decimal number
            expression?: string
            version?: number
          }
      on_death?:
        | string
        | number
        | {
            // Molang expression or decimal number
            expression?: string
            version?: number
          }
      [key: string]: any // Allow additional experience reward properties
    }
    'minecraft:explode'?: {
      add?: {
        // Add component groups
        component_groups?: string[]
        [key: string]: any // Allow additional add properties
      }
      allow_underwater?: boolean // If true, affects underwater blocks/entities
      breaks_blocks?: boolean // If true, destroys blocks in explosion radius
      causes_fire?: boolean // If true, sets blocks on fire
      damage_scaling?: number // Scale factor for explosion damage
      destroy_affected_by_griefing?: boolean // Affected by mob griefing game rule
      fire_affected_by_griefing?: boolean // Fire affected by mob griefing game rule
      fuse_length?: number | [number, number] // Range for random fuse length
      fuse_lit?: boolean // If true, fuse already lit
      knockback_scaling?: number // Scale factor for knockback force
      max_resistance?: number // Cap for block explosion resistance
      negates_fall_damage?: boolean // Apply fall damage negation to players
      particle_effect?: string // Particle effect name (explosion, wind_burst, breeze_wind_burst)
      power?: number // Explosion radius and damage amount
      sound_effect?: string // Sound effect when explosion triggers
      toggles_blocks?: boolean // If true, toggles blocks in explosion radius
      [key: string]: any // Allow additional explosion properties
    }
    'minecraft:fire_immune'?: {
      // Empty object indicates entity is immune to fire damage
    }
    'minecraft:floats_in_liquid'?: {
      // Empty object indicates entity can float in liquid blocks
    }
    'minecraft:flocking'?: {
      block_distance?: number // The amount of blocks away the entity will look at to push away from
      block_weight?: number // The weight of the push back away from blocks
      breach_influence?: number // The amount of push back given to a flocker that breaches out of the water
      cohesion_threshold?: number // The threshold in which to start applying cohesion
      cohesion_weight?: number // The weight applied for the cohesion steering of the flock
      goal_weight?: number // The weight on which to apply on the goal output
      high_flock_limit?: number // Determines the high bound amount of entities that can be allowed in the flock
      in_water?: boolean // Tells the Flocking Component if the entity exists in water
      influence_radius?: number // The area around the entity that allows others to be added to the flock
      innner_cohesion_threshold?: number // The distance in which the flocker will stop applying cohesion
      loner_chance?: number // The percentage chance between 0-1 that a fish will spawn and not want to join flocks
      low_flock_limit?: number // Determines the low bound amount of entities that can be allowed in the flock
      match_variants?: boolean // Tells the flockers that they can only match similar entities
      max_height?: number // The max height allowable in the air or water
      min_height?: number // The min height allowable in the air or water
      separation_threshold?: number // The distance that is determined to be to close to another flocking and to start applying separation
      separation_weight?: number // The weight applied to the separation of the flock
      use_center_of_mass?: boolean // Tells the flockers that they will follow flocks based on the center of mass
      [key: string]: any
    }
    'minecraft:flying_speed'?: {
      value?: number // Flying speed in blocks per tick
    }
    'minecraft:follow_range'?: {
      max?: number // Maximum follow distance in blocks
      value?: number // The default follow range in blocks
    }
    'minecraft:free_camera_controlled'?: {
      backwards_movement_modifier?: number // Modifies speed going backwards
      strafe_speed_modifier?: number // Modifies the strafe speed
    }
    'minecraft:friction_modifier'?: {
      value?: number // The higher the number, the more friction affects this entity
    }
    'minecraft:game_event_movement_tracking'?: {
      emit_flap?: boolean // If true, the flap game event will be emitted when the entity moves through air
      emit_move?: boolean // If true, the entityMove game event will be emitted when the entity moves on ground or through a solid
      emit_swim?: boolean // If true, the swim game event will be emitted when the entity moves through a liquid
    }
    'minecraft:genetics'?: {
      mutation_rate?: number // Chance that an allele will be replaced with a random one instead of the parent's allele during birth
      genes?: Array<{
        name: string // The name of the gene
        use_simplified_breeding?: boolean // If true, mobs will inherit main alleles from parents' main alleles
        mutation_rate?: number // Override for this gene's mutation rate
        allele_range?:
          | number
          | {
              // The range of positive integer allele values
              range_min: number // Minimum allele value
              range_max: number // Maximum allele value
            }
        genetic_variants?: Array<{
          birth_event?:
            | string
            | {
                // Event to run when this mob is created and matches the allele conditions
                event: string
                target?: string
              }
          main_allele?:
            | number
            | {
                // Compare the mob's main allele with this value
                range_min: number
                range_max: number
              }
          hidden_allele?:
            | number
            | {
                // Compare the mob's hidden allele with this value
                range_min: number
                range_max: number
              }
          both_allele?:
            | number
            | {
                // Compare both main and hidden alleles with this value
                range_min: number
                range_max: number
              }
          either_allele?:
            | number
            | {
                // Compare either main or hidden allele with this value
                range_min: number
                range_max: number
              }
        }>
      }>
    }
    'minecraft:giveable'?: {
      cooldown?: number // An optional cool down in seconds to prevent spamming interactions
      items?: string | string[] // The list of items that can be given to the entity
      on_give?:
        | string
        | {
            // Event to fire when the correct item is given
            event: string
            target?: string
          }
    }
    'minecraft:ground_offset'?: {
      value?: number // The value of the entity's offset from the terrain, in blocks
    }
    'minecraft:group_size'?: {
      radius?: number // Radius from center of entity
      filters?: any // The list of conditions that must be satisfied for other entities to be counted
    }
    'minecraft:grows_crop'?: {
      chance?: number // Value between 0-1. Chance of success per tick
      charges?: number // Number of charges
    }
    'minecraft:health'?: {
      max?: number // Maximum health this entity can have
      value?:
        | number
        | {
            range_min?: number // Minimum health value
            range_max?: number // Maximum health value
          }
    }
    'minecraft:heartbeat'?: {
      interval?: string // A Molang expression defining the inter-beat interval in seconds
      sound_event?: string // Level sound event to be played as the heartbeat sound
    }
    'minecraft:hide'?: {} // Moves to and hides at their owned POI or the closest nearby
    'minecraft:home'?: {
      home_block_list?: string[] // Optional list of blocks that can be considered a valid home
      restriction_radius?: number // Optional radius that the entity will be restricted to
      restriction_type?: 'none' | 'random_movement' | 'all_movement' // How the entity will be restricted to its home
    }
    'minecraft:horse.jump_strength'?: {
      value?:
        | number
        | {
            range_min?: number // Minimum jump strength value
            range_max?: number // Maximum jump strength value
          }
    }
    'minecraft:hurt_on_condition'?: {
      damage_conditions?: Array<{
        cause?: string // The kind of damage that is caused to the entity
        damage_per_tick?: number // The amount of damage done each tick that the conditions are met
        filters?: {
          subject?: string // The subject of the filter test
          test?: string // The test to perform
          value?: any // The value to compare against
          operator?: string // The operator to use for comparison
          [key: string]: any // Allow for other filter properties
        }
      }>
    }
    'minecraft:ignore_cannot_be_attacked'?: {
      filters?: {
        subject?: string // The subject of the filter test
        test?: string // The test to perform
        value?: any // The value to compare against
        operator?: string // The operator to use for comparison
        [key: string]: any // Allow for other filter properties
      }
    }
    'minecraft:input_air_controlled'?: {
      [key: string]: any // Flexible structure for movement modifiers
    }
    'minecraft:input_ground_controlled'?: {
      // Empty object as specified
    }
    'minecraft:inside_block_notifier'?: {
      block_list?: Array<{
        block?: {
          name?: string // The name of the block to listen for
          states?: {
            [key: string]: string | number | boolean // The specific block states to match
          }
        }
        entered_block_event?: {
          event?: string // The event to run when the block is entered
          target?: string // The target of the event
        }
        exited_block_event?: {
          event?: string // The event to run when the block is exited
          target?: string // The target of the event
        }
      }>
    }
    'minecraft:insomnia'?: {
      days_until_insomnia?: number // Number of days the mob has to stay up until the insomnia effect begins
    }
    'minecraft:instant_despawn'?: {
      remove_child_entities?: boolean // If true, all entities linked to this entity in a child relationship will also be despawned
    }
    'minecraft:interact'?: {
      cooldown?: number // Time in seconds before this entity can be interacted with again
      cooldown_after_being_attacked?: number // Time in seconds before this entity can be interacted with after being attacked
      drop_item_slot?: string | number // The entity's slot to remove and drop the item from
      drop_item_y_offset?: number // Will offset the item drop position this amount in the y direction
      equip_item_slot?: string | number // The entity's slot to equip the item to
      health_amount?: number // The amount of health this entity will recover or lose when interacting
      hurt_item?: number // The amount of damage the item will take when used to interact
      interact_text?: string // Text to show when the player is able to interact
      interactions?: Array<{
        give_item?: boolean // If true, the player can give items to the entity
        hurt_item?: number // Amount of damage the item will take
        interact_text?: string // Interaction text
        on_interact?:
          | string
          | {
              // Event to fire when the interaction occurs
              filters?: {
                subject?: string
                test?: string
                value?: any
                operator?: string
                [key: string]: any
              }
            }
        particle_on_start?: Array<{
          particle_offset_towards_interactor?: boolean // Whether particle appears closer to interactor
          particle_type?: string // The type of particle to spawn
          particle_y_offset?: number // Y direction offset for particles
        }>
        play_sounds?: string // List of sounds to play
        repair_entity_item?: Array<{
          amount?: number // How much durability to restore
          slot?: string | number // The entity's slot containing the item to be repaired
        }>
        spawn_entities?: string // List of entities to spawn
        spawn_items?: Array<{
          table?: string // File path to the loot table file
          y_offset?: number // Y direction offset for item spawn
        }>
        swing?: boolean // If true, player will do 'swing' animation
        take_item?: boolean // If true, player can take items from the entity
        transform_to_item?: string // Item used will transform to this item
        use_item?: boolean // If true, interaction will use an item
        vibration?:
          | 'none'
          | 'shear'
          | 'entity_die'
          | 'entity_act'
          | 'entity_interact' // Vibration to emit
      }>
    }
    'minecraft:inventory'?: {
      additional_slots_per_strength?: number // Number of slots that this entity can gain per extra strength
      can_be_siphoned_from?: boolean // If true, the contents of this inventory can be removed by a hopper
      container_type?: string // Type of container this entity has
      inventory_size?: number // Number of slots the container has
      private?: boolean // If true, the entity will not drop its inventory on death
      restrict_to_owner?: boolean // If true, the entity's inventory can only be accessed by its owner
    }
    'minecraft:is_baby'?: {
      // Empty object as specified
    }
    'minecraft:is_charged'?: {
      // Empty object as specified
    }
    'minecraft:is_chested'?: {
      // Empty object as specified
    }
    'minecraft:is_dyeable'?: {
      interact_text?: string // The text that will display when interacting with this entity with a dye
    }
    'minecraft:is_ignited'?: {
      // Empty object as specified
    }
    'minecraft:is_pregnant'?: {
      // Empty object as specified
    }
    'minecraft:item_controllable'?: {
      control_items?: string | string[] // List of items that can be used to control this entity while ridden
    }
    'minecraft:item_hopper'?: {
      // Empty object as specified
    }
    'minecraft:jump.dynamic'?: {
      fast_skip_data?: {
        animation_duration?: number // Duration of the jump animation
        distance_scale?: number // The multiplier applied to horizontal velocity when jumping
        height?: number // The force applied vertically when jumping
        jump_delay?: number // Amount of ticks between sequential jumps
      }
      regular_skip_data?: {
        animation_duration?: number // Duration of the jump animation
        distance_scale?: number // The multiplier applied to horizontal velocity when jumping
        height?: number // The force applied vertically when jumping
        jump_delay?: number // Amount of ticks between sequential jumps
      }
    }
    'minecraft:jump.static'?: {
      jump_power?: number // The initial vertical velocity for the jump (default 0.42)
    }
    'minecraft:knockback_resistance'?:
      | number
      | {
          max?: number // Maximum potential knockback resistance
          value?: number // The amount of knockback resistance from 0.0 to 1.0
        }
    'minecraft:lava_movement'?: {
      value?: number // The speed the mob moves over a lava block
    }
    'minecraft:leashable'?: {
      can_be_cut?: boolean // If true, players can cut both incoming and outgoing leashes
      can_be_stolen?: boolean // If true, players can leash this entity even if already leashed
      hard_distance?: number // Distance in blocks at which the leash stiffens
      max_distance?: number // Distance in blocks at which the leash breaks
      on_leash?: string | { event: string; target?: string } // Event to call when leashed
      on_unleash?: string | { event: string; target?: string } // Event to call when unleashed
      on_unleash_interact_only?: boolean // Triggers only for player interactions
      presets?: Array<{
        filter?: {
          subject?: string
          test?: string
          value?: any
          operator?: string
          [key: string]: any
        } // Conditions for preset application
        hard_distance?: number // Distance for spring-like force
        max_distance?: number // Distance at which leash breaks
        rotation_adjustment?: number // Rotation adjustment for equilibrium
        soft_distance?: number // Distance for pathfinding
        spring_type?: 'bouncy' | 'dampened' | 'quad_dampened' // Type of spring force
      }> // Behavior presets for different leashed scenarios
      soft_distance?: number // Distance for spring effect start
    }
    'minecraft:leashable_to'?: {
      can_retrieve_from?: boolean // Allows retrieving entities leashed to this entity
    }
    'minecraft:looked_at'?: {
      field_of_view?: number // Width of field of view in degrees
      filters?: {
        subject?: string
        test?: string
        value?: any
        operator?: string
        [key: string]: any
      } // Which entities are considered
      find_players_only?: boolean // Limit search to nearest Player only
      line_of_sight_obstruction_type?:
        | 'outline'
        | 'collision'
        | 'collision_for_camera' // Block shape for obstruction
      look_at_locations?: string[] // Locations on entity for line of sight checks
      looked_at_cooldown?: { min: number; max: number } // Range for cooldown
      looked_at_event?: string | { event: string; target?: string } // Event when looked at
      min_looked_at_duration?: number // Minimum continuous look time
      not_looked_at_event?: string | { event: string; target?: string } // Event when not looked at
      scale_fov_by_distance?: boolean // Narrow FOV with distance
      search_radius?: number // Maximum search distance
      set_target?:
        | boolean
        | 'never'
        | 'once_and_stop_scanning'
        | 'once_and_keep_scanning' // Combat targeting behavior
    }
    'minecraft:loot'?: {
      table?: string // Path to loot table JSON file
    }
    'minecraft:managed_wandering_trader'?: {
      // Component that manages the wandering trader's ability to trade
      // Can only be used on wandering_trader entities
    }
    'minecraft:mark_variant'?: {
      value: number // The ID of the mark_variant (0 for base entity)
    }
    'minecraft:mob_effect'?: {
      ambient?: boolean // If the effect is considered an ambient effect
      cooldown_time?: number // Time in seconds between effect applications
      effect_range?: number // How close an entity must be to have effect applied
      effect_time?: number | 'infinite' // Duration in seconds or infinite
      entity_filter?: {
        subject?: string
        test?: string
        value?: any
        operator?: string
        [key: string]: any
      } // Set of entities valid for the effect
      mob_effect: string // The mob effect that is applied
    }
    'minecraft:mob_effect_immunity'?: {
      mob_effects: string[] // List of effect names the entity is immune to
    }
    'minecraft:movement'?: {
      max?: number // Maximum movement speed this entity can have
      value?: number | { range_min: number; range_max: number } // Base movement speed value or range
    }
    'minecraft:movement.amphibious'?: {
      max_turn?: number // The maximum number in degrees the mob can turn per tick
    }
    'minecraft:movement.basic'?: {
      max_turn?: number // The maximum number in degrees the mob can turn per tick
    }
    'minecraft:movement.dolphin'?: {
      // This movement is not currently being used in game
      // 组件占位符，用于海豚式移动控制
    }
    'minecraft:movement.fly'?: {
      max_turn?: number // The maximum number in degrees the mob can turn per tick
      speed_when_turning?: number // Speed that the mob adjusts to when it has to turn quickly
      start_speed?: number // Initial speed of the mob when it starts gliding
    }
    'minecraft:movement.generic'?: {
      max_turn?: number // The maximum number in degrees the mob can turn per tick
    }
    'minecraft:movement.glide'?: {
      max_turn?: number // The maximum number in degrees the mob can turn per tick
      speed_when_turning?: number // Speed that the mob adjusts to when it has to turn quickly
    }
    'minecraft:movement.hover'?: {
      max_turn?: number // The maximum number in degrees the mob can turn per tick
    }
    'minecraft:movement.jump'?: {
      jump_delay?:
        | number
        | [number, number]
        | { range_min: number; range_max: number } // Delay in seconds after landing
      max_turn?: number // The maximum number in degrees the mob can turn per tick
    }
    'minecraft:movement.skip'?: {
      max_turn?: number // The maximum number in degrees the mob can turn per tick
    }
    'minecraft:movement.sound_distance_offset'?: {
      value?: number // The higher the number, the less often the movement sound will be played
    }
    'minecraft:movement.sway'?: {
      max_turn?: number // The maximum number in degrees the mob can turn per tick
      sway_amplitude?: number // Strength of the sway movement
      sway_frequency?: number // Multiplier for the frequency of the sway movement
    }
    'minecraft:nameable'?: {
      allow_name_tag_renaming?: boolean // If true, this entity can be renamed with name tags
      always_show?: boolean // If true, the name will always be shown
      default_trigger?: string // Trigger to run when the entity gets named
      name_actions?: Array<{
        name_filter?: string[] // List of special names that will cause the events to fire
        on_named?: string | { event: string; target?: string } // Event to be called when this entity acquires the name
      }> // Describes special names and corresponding events
    }
    'minecraft:navigation.climb'?: {
      avoid_damage_blocks?: boolean // Tells the pathfinder to avoid blocks that cause damage
      avoid_portals?: boolean // Tells the pathfinder to avoid portals (like nether portals)
      avoid_sun?: boolean // Whether or not the pathfinder should avoid tiles exposed to the sun
      avoid_water?: boolean // Tells the pathfinder to avoid water when creating a path
      blocks_to_avoid?: string[] // Tells the pathfinder which blocks to avoid
      can_breach?: boolean // Tells the pathfinder whether or not it can jump out of water
      can_break_doors?: boolean // Tells the pathfinder that it can path through a closed door and break it
      can_jump?: boolean // Tells the pathfinder whether or not it can jump up blocks
      can_open_doors?: boolean // Tells the pathfinder that it can path through a closed door
      can_open_iron_doors?: boolean // Tells the pathfinder that it can path through a closed iron door
      can_pass_doors?: boolean // Whether a path can be created through a door
      can_path_from_air?: boolean // Tells the pathfinder that it can start pathing when in the air
      can_path_over_lava?: boolean // Tells the pathfinder whether or not it can travel on lava surface
      can_path_over_water?: boolean // Tells the pathfinder whether or not it can travel on water surface
      can_sink?: boolean // Tells the pathfinder whether or not it will be pulled down by gravity in water
      can_swim?: boolean // Tells the pathfinder whether or not it can path through water
      can_walk?: boolean // Tells the pathfinder whether or not it can walk on the ground outside water
      can_walk_in_lava?: boolean // Tells the pathfinder whether or not it can travel in lava
      is_amphibious?: boolean // Tells the pathfinder whether or not it can walk underwater
      using_door_annotation?: boolean // Tells the pathfinder whether to use door annotations
    }
    'minecraft:navigation.float'?: {
      avoid_damage_blocks?: boolean // Tells the pathfinder to avoid blocks that cause damage
      avoid_portals?: boolean // Tells the pathfinder to avoid portals (like nether portals)
      avoid_sun?: boolean // Whether or not the pathfinder should avoid tiles exposed to the sun
      avoid_water?: boolean // Tells the pathfinder to avoid water when creating a path
      blocks_to_avoid?: string[] // Tells the pathfinder which blocks to avoid
      can_breach?: boolean // Tells the pathfinder whether or not it can jump out of water
      can_break_doors?: boolean // Tells the pathfinder that it can path through a closed door and break it
      can_jump?: boolean // Tells the pathfinder whether or not it can jump up blocks
      can_open_doors?: boolean // Tells the pathfinder that it can path through a closed door
      can_open_iron_doors?: boolean // Tells the pathfinder that it can path through a closed iron door
      can_pass_doors?: boolean // Whether a path can be created through a door
      can_path_from_air?: boolean // Tells the pathfinder that it can start pathing when in the air
      can_path_over_lava?: boolean // Tells the pathfinder whether or not it can travel on lava surface
      can_path_over_water?: boolean // Tells the pathfinder whether or not it can travel on water surface
      can_sink?: boolean // Tells the pathfinder whether or not it will be pulled down by gravity in water
      can_swim?: boolean // Tells the pathfinder whether or not it can path through water
      can_walk?: boolean // Tells the pathfinder whether or not it can walk on the ground outside water
      can_walk_in_lava?: boolean // Tells the pathfinder whether or not it can travel in lava
      is_amphibious?: boolean // Tells the pathfinder whether or not it can walk underwater
      using_door_annotation?: boolean // Tells the pathfinder whether to use door annotations
    }
    'minecraft:navigation.fly'?: {
      avoid_damage_blocks?: boolean // Tells the pathfinder to avoid blocks that cause damage
      avoid_portals?: boolean // Tells the pathfinder to avoid portals (like nether portals)
      avoid_sun?: boolean // Whether or not the pathfinder should avoid tiles exposed to the sun
      avoid_water?: boolean // Tells the pathfinder to avoid water when creating a path
      blocks_to_avoid?: string[] // Tells the pathfinder which blocks to avoid
      can_breach?: boolean // Tells the pathfinder whether or not it can jump out of water
      can_break_doors?: boolean // Tells the pathfinder that it can path through a closed door and break it
      can_jump?: boolean // Tells the pathfinder whether or not it can jump up blocks
      can_open_doors?: boolean // Tells the pathfinder that it can path through a closed door
      can_open_iron_doors?: boolean // Tells the pathfinder that it can path through a closed iron door
      can_pass_doors?: boolean // Whether a path can be created through a door
      can_path_from_air?: boolean // Tells the pathfinder that it can start pathing when in the air
      can_path_over_lava?: boolean // Tells the pathfinder whether or not it can travel on lava surface
      can_path_over_water?: boolean // Tells the pathfinder whether or not it can travel on water surface
      can_sink?: boolean // Tells the pathfinder whether or not it will be pulled down by gravity in water
      can_swim?: boolean // Tells the pathfinder whether or not it can path through water
      can_walk?: boolean // Tells the pathfinder whether or not it can walk on the ground outside water
      can_walk_in_lava?: boolean // Tells the pathfinder whether or not it can travel in lava
      is_amphibious?: boolean // Tells the pathfinder whether or not it can walk underwater
      using_door_annotation?: boolean // Tells the pathfinder whether to use door annotations
    }
    'minecraft:navigation.generic'?: {
      avoid_damage_blocks?: boolean // Tells the pathfinder to avoid blocks that cause damage
      avoid_portals?: boolean // Tells the pathfinder to avoid portals (like nether portals)
      avoid_sun?: boolean // Whether or not the pathfinder should avoid tiles exposed to the sun
      avoid_water?: boolean // Tells the pathfinder to avoid water when creating a path
      blocks_to_avoid?: string[] // Tells the pathfinder which blocks to avoid
      can_breach?: boolean // Tells the pathfinder whether or not it can jump out of water
      can_break_doors?: boolean // Tells the pathfinder that it can path through a closed door and break it
      can_jump?: boolean // Tells the pathfinder whether or not it can jump up blocks
      can_open_doors?: boolean // Tells the pathfinder that it can path through a closed door
      can_open_iron_doors?: boolean // Tells the pathfinder that it can path through a closed iron door
      can_pass_doors?: boolean // Whether a path can be created through a door
      can_path_from_air?: boolean // Tells the pathfinder that it can start pathing when in the air
      can_path_over_lava?: boolean // Tells the pathfinder whether or not it can travel on lava surface
      can_path_over_water?: boolean // Tells the pathfinder whether or not it can travel on water surface
      can_sink?: boolean // Tells the pathfinder whether or not it will be pulled down by gravity in water
      can_swim?: boolean // Tells the pathfinder whether or not it can path through water
      can_walk?: boolean // Tells the pathfinder whether or not it can walk on the ground outside water
      can_walk_in_lava?: boolean // Tells the pathfinder whether or not it can travel in lava
      is_amphibious?: boolean // Tells the pathfinder whether or not it can walk underwater
      using_door_annotation?: boolean // Tells the pathfinder whether to use door annotations
    }
    'minecraft:navigation.hover'?: {
      avoid_damage_blocks?: boolean // Tells the pathfinder to avoid blocks that cause damage
      avoid_portals?: boolean // Tells the pathfinder to avoid portals (like nether portals)
      avoid_sun?: boolean // Whether or not the pathfinder should avoid tiles exposed to the sun
      avoid_water?: boolean // Tells the pathfinder to avoid water when creating a path
      blocks_to_avoid?: string[] // Tells the pathfinder which blocks to avoid
      can_breach?: boolean // Tells the pathfinder whether or not it can jump out of water
      can_break_doors?: boolean // Tells the pathfinder that it can path through a closed door and break it
      can_jump?: boolean // Tells the pathfinder whether or not it can jump up blocks
      can_open_doors?: boolean // Tells the pathfinder that it can path through a closed door
      can_open_iron_doors?: boolean // Tells the pathfinder that it can path through a closed iron door
      can_pass_doors?: boolean // Whether a path can be created through a door
      can_path_from_air?: boolean // Tells the pathfinder that it can start pathing when in the air
      can_path_over_lava?: boolean // Tells the pathfinder whether or not it can travel on lava surface
      can_path_over_water?: boolean // Tells the pathfinder whether or not it can travel on water surface
      can_sink?: boolean // Tells the pathfinder whether or not it will be pulled down by gravity in water
      can_swim?: boolean // Tells the pathfinder whether or not it can path through water
      can_walk?: boolean // Tells the pathfinder whether or not it can walk on the ground outside water
      can_walk_in_lava?: boolean // Tells the pathfinder whether or not it can travel in lava
      is_amphibious?: boolean // Tells the pathfinder whether or not it can walk underwater
      using_door_annotation?: boolean // Tells the pathfinder whether to use door annotations
    }
    'minecraft:navigation.swim'?: {
      avoid_damage_blocks?: boolean // Tells the pathfinder to avoid blocks that cause damage
      avoid_portals?: boolean // Tells the pathfinder to avoid portals (like nether portals)
      avoid_sun?: boolean // Whether or not the pathfinder should avoid tiles exposed to the sun
      avoid_water?: boolean // Tells the pathfinder to avoid water when creating a path
      blocks_to_avoid?:
        | string[]
        | Array<{
            name?: string // Block identifier to avoid
            tags?: string // Molang expression to match block tags, e.g. query.any_tag('trapdoors')
          }> // Tells the pathfinder which blocks to avoid
      can_breach?: boolean // Tells the pathfinder whether or not it can jump out of water (like a dolphin)
      can_break_doors?: boolean // Tells the pathfinder that it can path through a closed door and break it
      can_jump?: boolean // Tells the pathfinder whether or not it can jump up blocks
      can_open_doors?: boolean // Tells the pathfinder that it can path through a closed door assuming the AI will open the door
      can_open_iron_doors?: boolean // Tells the pathfinder that it can path through a closed iron door assuming the AI will open the door
      can_pass_doors?: boolean // Whether a path can be created through a door
      can_path_from_air?: boolean // Tells the pathfinder that it can start pathing when in the air
      can_path_over_lava?: boolean // Tells the pathfinder whether or not it can travel on the surface of the lava
      can_path_over_water?: boolean // Tells the pathfinder whether or not it can travel on the surface of the water
      can_sink?: boolean // Tells the pathfinder whether or not it will be pulled down by gravity while in water
      can_swim?: boolean // Tells the pathfinder whether or not it can path anywhere through water and plays swimming animation along that path
      can_walk?: boolean // Tells the pathfinder whether or not it can walk on the ground outside water
      can_walk_in_lava?: boolean // Tells the pathfinder whether or not it can travel in lava like walking on ground
      is_amphibious?: boolean // Tells the pathfinder whether or not it can walk on the ground underwater
      using_door_annotation?: boolean // Tells the pathfinder whether to use door annotations
    }
    'minecraft:navigation.walk'?: {
      avoid_damage_blocks?: boolean // Tells the pathfinder to avoid blocks that cause damage when finding a path
      avoid_portals?: boolean // Tells the pathfinder to avoid portals (like nether portals) when finding a path
      avoid_sun?: boolean // Whether or not the pathfinder should avoid tiles that are exposed to the sun when creating paths
      avoid_water?: boolean // Tells the pathfinder to avoid water when creating a path
      blocks_to_avoid?:
        | string[]
        | Array<{
            name?: string // Block identifier to avoid
            tags?: string // Molang expression to match block tags, e.g. query.any_tag('trapdoors')
          }> // Tells the pathfinder which blocks to avoid
      can_breach?: boolean // Tells the pathfinder whether or not it can jump out of water (like a dolphin)
      can_break_doors?: boolean // Tells the pathfinder that it can path through a closed door and break it
      can_float?: boolean // Tells the pathfinder whether or not it can float
      can_jump?: boolean // Tells the pathfinder whether or not it can jump up blocks
      can_open_doors?: boolean // Tells the pathfinder that it can path through a closed door assuming the AI will open the door
      can_open_iron_doors?: boolean // Tells the pathfinder that it can path through a closed iron door assuming the AI will open the door
      can_pass_doors?: boolean // Whether a path can be created through a door
      can_path_from_air?: boolean // Tells the pathfinder that it can start pathing when in the air
      can_path_over_lava?: boolean // Tells the pathfinder whether or not it can travel on the surface of the lava
      can_path_over_water?: boolean // Tells the pathfinder whether or not it can travel on the surface of the water
      can_sink?: boolean // Tells the pathfinder whether or not it will be pulled down by gravity while in water
      can_swim?: boolean // Tells the pathfinder whether or not it can path anywhere through water and plays swimming animation along that path
      can_walk?: boolean // Tells the pathfinder whether or not it can walk on the ground outside water
      can_walk_in_lava?: boolean // Tells the pathfinder whether or not it can travel in lava like walking on ground
      is_amphibious?: boolean // Tells the pathfinder whether or not it can walk on the ground underwater
      using_door_annotation?: boolean // Tells the pathfinder whether to use door annotations
    }
    'minecraft:preferred_path'?: {
      /** Cost for non-preferred blocks */
      default_block_cost?: number
      /** Added cost for jumping up a node */
      jump_cost?: number
      /** Distance mob can fall without taking damage */
      max_fall_blocks?: number
      /** A list of block types with their associated pathfinding costs */
      preferred_path_blocks?: Array<{
        /** Array of block identifiers that share this cost value */
        blocks: string[]
        /** The cost value for these blocks during pathfinding. Lower costs make paths more preferred */
        cost: number
      }>
    }
    'minecraft:out_of_control'?: {} // Defines the entity's 'out of control' state
    'minecraft:peek'?: {
      on_close?: {
        event?: string // Event to call when the entity is done peeking
      }
      on_open?: {
        event?: string // Event to call when the entity starts peeking
      }
      on_target_open?: {
        event?: string // Event to call when the entity's target entity starts peeking
      }
    } // Defines the entity's 'peek' behavior
    'minecraft:persistent'?: {} // Defines whether an entity should be persistent in the game world
    'minecraft:physics'?: {
      has_collision?: boolean // Whether or not the entity collides with things
      has_gravity?: boolean // Whether or not the entity is affected by gravity
      push_towards_closest_space?: boolean // Whether or not the entity should be pushed towards the nearest open area when stuck inside a block
    } // Defines physics properties of an actor
    'minecraft:player.exhaustion'?: {
      max?: number // A maximum value for a player's exhaustion
      value?: number // The initial value of a player's exhaustion level
    } // Defines the player's exhaustion level
    'minecraft:offspring'?: {
      born_event?: {
        event?: string
        target?: string
      }
      breed_event?: {
        event?: string
        target?: string
      }
      breed_items?: string[]
      blend_attributes?: boolean // If true, the entities will blend their attributes in the offspring after they breed
      cooldown?: number
      delayed_growth?: boolean
      deny_parents_baby_variant?: boolean
      deny_parents_variant?: Array<{
        chance?: number // The percentage chance of denying the parents' variant
        max_variant?: number // The inclusive maximum of the variant range
        min_variant?: number // The inclusive minimum of the variant range
      }> // Determines how likely the baby of parents with the same variant will deny that variant
      grow_up_duration?: number
      inherit_tamed?: boolean // If true, the babies will be automatically tamed if its parents are
      initial_variant?: number
      inheritance_chance?: {
        angry?: number
        attacker?: number
        color?: number
        gene?: number
        variant?: number
      }
      mutation_factor?: {
        color?: number // The percentage chance of the offspring getting its color as if spawned
        gene?: number // The percentage chance of a mutation on the entity's gene
        extra?: number // The percentage chance of a mutation on the entity's extra attribute
        health?: number // The percentage chance of a mutation on the entity's health attribute
        speed?: number // The percentage chance of a mutation on the entity's speed attribute
        extra_variant?: number // The percentage chance of a mutation on the entity's extra variant type
        variant?: number // The percentage chance of a mutation on the entity's variant type
      } // Determines how likely the babies are to NOT inherit one of their parent's variances
      num_variants?: number
      offspring_pairs?: Record<string, string> // The map of entity to offspring definitions that this entity can make offspring with
      parent_centric_attribute_blending?: {
        attribute?: string
        dampening?: number
      }
      property_inheritance?: Record<string, any> // List of Entity Properties that should be inherited from the parent entities and potentially mutated
      random_extra_variant_mutation_interval?: {
        range_max?: number
        range_min?: number
      } // Range used to determine random extra variant
      random_variant_mutation_interval?: {
        range_max?: number
        range_min?: number
      } // Range used to determine random variant
      should_baby_face_parent?: boolean
      variants?: Record<string | number, number>
    }
    // 后面可以根据需要添加更多实体组件
  }
}

interface EntityJSON {
  format_version: string
  'minecraft:entity': {
    description: {
      identifier: string
      is_spawnable?: boolean
      is_summonable?: boolean
    }
    components?: EntityComponentOpt['components']
    component_groups?: Record<string, {}>
  }
}
export type { EntityComponentOpt, EntityJSON }
export { RepairItemSchema, SeedPropertiesSchema }

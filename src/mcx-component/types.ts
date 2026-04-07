import ParticleType from "./types/ParticleType"
import SoundEvent from "./types/SoundEvent"
import EnchantableSlot from "./types/EnchantableSlot"

interface ItemComponentOpt {
  id: string
  name: string
  format: string
  components: {
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
     * 注意：While this component can be defined on its own, to be able to interact with the item's storage container 
     * the item must have a minecraft:bundle_interaction item component defined.
     * 
     * 注意：This item requires a format version of at least 1.21.40.
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
    'minecraft:use_animation'?: string | {
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
      slot: 'slot.armor.head' | 'slot.armor.chest' | 'slot.armor.legs' | 'slot.armor.feet' | 'slot.armor.body' | 'slot.weapon.mainhand' | 'slot.weapon.offhand' |
      'slot.hotbar' | 'slot.inventory' | 'slot.enderchest' | 'slot.saddle' | 'slot.armor' | 'slot.chest'
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
    use_animation?: string | {
      value?: string
    }

    // Alias for minecraft:wearable
    wearable?: {
      slot: 'slot.armor.head' | 'slot.armor.chest' | 'slot.armor.legs' | 'slot.armor.feet' | 'slot.armor.body' | 'slot.weapon.mainhand' | 'slot.weapon.offhand'
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
      saturation_modifier?: number | 'poor' | 'low' | 'normal' | 'good' | 'supernatural'

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
      saturation_modifier?: number | 'poor' | 'low' | 'normal' | 'good' | 'supernatural'

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
      damage_conditions?: { max_duration?: number; min_relative_speed?: number; min_speed?: number }
      damage_modifier?: number
      damage_multiplier?: number
      delay?: number
      dismount_conditions?: { max_duration?: number; min_relative_speed?: number; min_speed?: number }
      hitbox_margin?: number
      knockback_conditions?: { max_duration?: number; min_relative_speed?: number; min_speed?: number }
      kinetic_effect_conditions?: { max_duration?: number; min_relative_speed?: number; min_speed?: number }
      reach?: { max?: number; min?: number }
    }
    interact_button?: boolean | string
    hover_text_color?: { value?: string }
    /**
     * Determines whether the item interacts with liquid blocks on use.
     * To allow placement of blocks on liquids, see the 'placement_filter' block component.
     * This item can also be represented as a Boolean true/false.
     */
    'minecraft:liquid_clipped'?: boolean | {
      /**
       * Determines whether the item interacts with liquid blocks on use.
       */
      value?: boolean
    }
    liquid_clipped?: boolean | {
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
    'minecraft:max_stack_size'?: number | {
      /**
       * How many of an item that can be stacked together.
       * @default 64
       */
      value?: number
    }
    max_stack_size?: number | {
      /**
       * How many of an item that can be stacked together.
       * @default 64
       */
      value?: number
    }
  }
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
        saturation_modifier?: number | 'poor' | 'low' | 'normal' | 'good' | 'supernatural'
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
        damage_conditions?: { max_duration?: number; min_relative_speed?: number; min_speed?: number }
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
        dismount_conditions?: { max_duration?: number; min_relative_speed?: number; min_speed?: number }
        /**
         * Added tolerance to the view vector raycast for detecting entity collisions.
         * @default 0
         */
        hitbox_margin?: number
        /**
         * Conditions that need to be satisfied for knockback to be applied.
         * If not specified, knockback is not applied.
         */
        knockback_conditions?: { max_duration?: number; min_relative_speed?: number; min_speed?: number }
        /**
         * Conditions that need to be satisfied for a specific effect of a kinetic weapon to be applied.
         */
        kinetic_effect_conditions?: { max_duration?: number; min_relative_speed?: number; min_speed?: number }
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
      'minecraft:liquid_clipped'?: boolean | {
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
      'minecraft:max_stack_size'?: number | {
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
        repair_items?: Array<string | {
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
        }>
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
        repair_items?: Array<string | {
          items: string[]
          repair_amount?: string | number
        }>
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
      'minecraft:use_animation'?: string | {
        /**
         * The animation type to play when the item is used.
         */
        value?: string
      }

      // Alias for minecraft:use_animation
      use_animation?: string | {
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
        slot: 'slot.armor.head' | 'slot.armor.chest' | 'slot.armor.legs' | 'slot.armor.feet' | 'slot.armor.body' | 'slot.weapon.mainhand' | 'slot.weapon.offhand'

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
        slot: 'slot.armor.head' | 'slot.armor.chest' | 'slot.armor.legs' | 'slot.armor.feet' | 'slot.armor.body' | 'slot.weapon.mainhand' | 'slot.weapon.offhand'
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

export { SoundEventEnum } from "./types/SoundEvent"
export { ParticleTypeEnum } from "./types/ParticleType"
export { EnchantableSlotEnum } from "./types/EnchantableSlot"
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
  repair_amount: 'string | number'
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
  plant_at_face: '"UP" | "DOWN"'
} as const

export { RepairItemSchema, SeedPropertiesSchema }
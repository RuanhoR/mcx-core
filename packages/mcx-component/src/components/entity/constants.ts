/**
 * Documented enums and shapes for the entity reference.
 *
 * https://learn.microsoft.com/en-us/minecraft/creator/reference/content/entityreference
 */

/** `minecraft:entity > description > spawn_category` */
export const SPAWN_CATEGORIES = [
  'monster',
  'creature',
  'ambient',
  'axolotls',
  'underground_water_creature',
  'water_creature',
  'water_ambient',
  'misc',
] as const;

export type SpawnCategory = (typeof SPAWN_CATEGORIES)[number];

/** documented `minecraft:interact > interactions[]` fields (Entity InteractionData) */
export interface EntityInteractionData {
  add_items?: { table?: string };
  admire?: boolean;
  barter?: boolean;
  cooldown?: number;
  cooldown_after_being_attacked?: number;
  drop_item_slot?: string | number;
  drop_item_y_offset?: number;
  equip_item_slot?: string | number;
  give_item?: boolean;
  health_amount?: number;
  hurt_item?: number;
  interact_text?: string;
  on_interact?:
    | string
    | {
        event?: string;
        target?: string;
        filters?: Record<string, unknown>;
      };
  particle_on_start?: {
    copper_event?: string;
    particle_offset_towards_interactor?: boolean;
    particle_type?: string;
    particle_y_offset?: number;
  };
  play_sounds?: string[];
  repair_entity_item?: { amount?: number; slot?: string | number };
  spawn_entities?: string[];
  spawn_items?: { table?: string; y_offset?: number };
  swing?: boolean;
  take_item?: boolean;
  transform_to_item?: string;
  use_item?: boolean;
  vibration?:
    | 'none'
    | 'shear'
    | 'entity_die'
    | 'entity_act'
    | 'entity_interact';
}

/** documented `minecraft:leashable > presets[] spring_type` */
export const SPRING_TYPES = ['bouncy', 'dampened', 'quad_dampened'] as const;

/** documented `minecraft:leashable > presets[]` numeric fields */
export const LEASH_PRESET_NUMBERS = [
  'hard_distance',
  'max_distance',
  'rotation_adjustment',
  'soft_distance',
] as const;

/** `minecraft:offspring` documented array-of-object fields */
export const OFFSPRING_ARRAY_FIELDS = [
  'deny_parents_variant',
  'mutation_factor',
] as const;

/** `minecraft:offspring` documented object-map fields */
export const OFFSPRING_MAP_FIELDS = [
  'offspring_pairs',
  'property_inheritance',
] as const;

/** `minecraft:offspring` documented range fields */
export const OFFSPRING_RANGE_FIELDS = [
  'random_extra_variant_mutation_interval',
  'random_variant_mutation_interval',
] as const;

/** `minecraft:breedable` documented boolean fields */
export const BREEDABLE_BOOLEANS = [
  'allow_sitting',
  'blend_attributes',
  'causes_pregnancy',
  'combine_parent_colors',
  'inherit_tamed',
  'require_full_health',
  'require_tame',
] as const;

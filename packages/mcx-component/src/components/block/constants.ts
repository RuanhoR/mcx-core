/**
 * Documented closed enums and value ranges for the block reference.
 *
 * https://learn.microsoft.com/en-us/minecraft/creator/reference/content/blockreference
 */

/** `minecraft:chest_obstruction > obstruction_rule` */
export const OBSTRUCTION_RULES = ['always', 'never', 'shape'] as const;

/** `minecraft:instrument_sound` note block instruments */
export const INSTRUMENT_SOUNDS = [
  'note.none',
  'note.harp',
  'note.bd',
  'note.snare',
  'note.hat',
  'note.bassattack',
  'note.flute',
  'note.bell',
  'note.guitar',
  'note.chime',
  'note.xylophone',
  'note.iron_xylophone',
  'note.cow_bell',
  'note.didgeridoo',
  'note.bit',
] as const;

/** `tint_method`, shared by material_instances / map_color / destruction_particles */
export const TINT_METHODS = [
  'none',
  'default_foliage',
  'birch_foliage',
  'evergreen_foliage',
  'dry_foliage',
  'grass',
  'water',
] as const;

/** the six block faces, used by connection_rule / redstone_producer / liquid_detection */
export const FACES = ['down', 'up', 'north', 'south', 'east', 'west'] as const;

/** `minecraft:precipitation_interactions > precipitation_behavior` */
export const PRECIPITATION_BEHAVIORS = [
  'none',
  'obstruct_rain',
  'obstruct_rain_accumulate_snow',
  'snowlogging',
  // removed in 1.26.30 but still parsed by the game
  'snow_log_no_collision',
] as const;

/** light components and redstone power are 0-15 per the 1.26.20 schema */
export const LIGHT_RANGE = { min: 0, max: 15 } as const;

/** `minecraft:material_instances > ambient_occlusion` is 0.0-10.0 */
export const AMBIENT_OCCLUSION_RANGE = { min: 0, max: 10 } as const;

/** `minecraft:destruction_particles > particle_count` */
export const PARTICLE_COUNT_RANGE = { min: 0, max: 255 } as const;

/** `minecraft:friction` is 0.0-0.9 */
export const FRICTION_RANGE = { min: 0, max: 0.9 } as const;

/** at most 64 entries per material_instances map */
export const MAX_MATERIAL_INSTANCES = 64;

/** `minecraft:block_entity > container > slot_count` is 1-54 */
export const SLOT_COUNT_RANGE = { min: 1, max: 54 } as const;

/** `minecraft:multi_block > parts` is clamped to 2-4 */
export const MULTI_BLOCK_PARTS_RANGE = { min: 2, max: 4 } as const;

/** `minecraft:placement_direction > y_rotation_offset` */
export const Y_ROTATION_OFFSETS = [0, 90, 180, 270] as const;

/** the only documented `minecraft:liquid_detection > liquid_type` */
export const LIQUID_TYPES = ['water'] as const;

/**
 * Pure validators and normalizers for the block reference.
 *
 * Every helper here is stateless so `BlockComponent` only has to own the option
 * object and delegate; nothing in this module touches `#opt`.
 */

import {
  AMBIENT_OCCLUSION_RANGE,
  FACES,
  LIGHT_RANGE,
  LIQUID_TYPES,
  MAX_MATERIAL_INSTANCES,
  MULTI_BLOCK_PARTS_RANGE,
  OBSTRUCTION_RULES,
  PARTICLE_COUNT_RANGE,
  TINT_METHODS,
  Y_ROTATION_OFFSETS,
} from './constants';

export const assertRange = (
  value: number,
  label: string,
  range: { min: number; max: number },
): void => {
  if (
    typeof value !== 'number' ||
    !Number.isInteger(value) ||
    value < range.min ||
    value > range.max
  ) {
    throw new Error(
      `[set error]: ${label}: must be an integer between ${range.min} and ${range.max}`,
    );
  }
};

export const assertEnum = <T extends string>(
  value: unknown,
  allowed: readonly T[],
  label: string,
): void => {
  if (typeof value !== 'string' || !allowed.includes(value as T)) {
    throw new Error(`[set error]: ${label}: must be one of ${allowed.join(', ')}`);
  }
};

/** `minecraft:chest_obstruction` — a bare object means "use the default rule". */
export const normalizeChestObstruction = (
  value: unknown,
): Record<string, unknown> => {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    return {};
  }
  const rule = (value as Record<string, unknown>).obstruction_rule;
  if (rule === undefined) return {};
  assertEnum(rule, OBSTRUCTION_RULES, 'chest_obstruction: obstruction_rule');
  return { obstruction_rule: rule };
};

/** `minecraft:sound` is `{ sound: "<id>" }`; a bare string is accepted too. */
export const normalizeBlockSound = (
  value: unknown,
): string | { sound: string } => {
  if (typeof value === 'string') {
    if (!value.trim()) {
      throw new Error('[set error]: sound: must be a non-empty string');
    }
    return { sound: value.trim() };
  }
  if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
    const sound = (value as Record<string, unknown>).sound;
    if (typeof sound === 'string' && sound.trim()) return { sound: sound.trim() };
  }
  throw new Error(
    '[set error]: sound: must be a sound id string or { sound: string }',
  );
};

/**
 * `[x, y, z]` or `{ x, y, z }` — the schema accepts both for bounding boxes and
 * transformation pivots.
 */
export const normalizeVec3 = (value: unknown, label: string): unknown => {
  if (Array.isArray(value)) {
    if (value.length === 3 && value.every(n => typeof n === 'number')) return value;
    throw new Error(`[set error]: ${label}: must be [x, y, z] of numbers`);
  }
  if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
    const vec = value as Record<string, unknown>;
    if (['x', 'y', 'z'].every(axis => typeof vec[axis] === 'number')) {
      return { x: vec.x, y: vec.y, z: vec.z };
    }
  }
  throw new Error(`[set error]: ${label}: must be [x, y, z] or { x, y, z }`);
};

export const assertVec3 = (value: unknown, label: string): void => {
  normalizeVec3(value, label);
};

/** `minecraft:light_emission` / `minecraft:light_dampening` */
export const assertLightLevel = (value: number, label: string): void => {
  assertRange(value, label, LIGHT_RANGE);
};

/** `minecraft:redstone_producer > power` / `redstone_consumer > min_power` */
export const assertRedstonePower = (value: number, label: string): void => {
  assertRange(value, label, LIGHT_RANGE);
};

export const assertFaces = (
  values: readonly string[] | undefined,
  label: string,
): void => {
  for (const face of values ?? []) assertEnum(face, FACES, label);
};

/** `minecraft:map_color` */
export const normalizeMapColor = (
  value:
    | string
    | [number, number, number]
    | { color: string | [number, number, number]; tint_method?: string },
): unknown => {
  if (Array.isArray(value)) {
    if (value.length !== 3 || !value.every(n => typeof n === 'number')) {
      throw new Error('[set error]: map_color: must be [R, G, B] of numbers');
    }
    return value;
  }
  if (typeof value === 'object' && value !== null) {
    if (value.tint_method !== undefined) {
      assertEnum(value.tint_method, TINT_METHODS, 'map_color: tint_method');
    }
    if (Array.isArray(value.color)) {
      if (value.color.length !== 3 || !value.color.every(n => typeof n === 'number')) {
        throw new Error('[set error]: map_color.color: must be [R, G, B] of numbers');
      }
    } else if (typeof value.color !== 'string' || !value.color.trim()) {
      throw new Error('[set error]: map_color.color: must be a hex string or [R, G, B]');
    }
    return value;
  }
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(
      '[set error]: map_color: must be a hex string, [R, G, B], or { color, tint_method }',
    );
  }
  return value;
};

/** `minecraft:material_instances` — validated after textures are resolved. */
export const assertMaterialInstance = (key: string, instance: unknown): void => {
  if (typeof instance !== 'object' || instance === null) return;
  const { ambient_occlusion: ao, alpha_masked_tint: alphaMasked } =
    instance as Record<string, unknown>;
  if (ao !== undefined) {
    if (typeof ao === 'boolean' || typeof ao !== 'number' || ao < AMBIENT_OCCLUSION_RANGE.min || ao > AMBIENT_OCCLUSION_RANGE.max) {
      throw new Error(
        `[set error]: material_instances.${key}.ambient_occlusion: must be a number between ${AMBIENT_OCCLUSION_RANGE.min}.0 and ${AMBIENT_OCCLUSION_RANGE.max}.0`,
      );
    }
  }
  if (alphaMasked !== undefined && typeof alphaMasked !== 'boolean') {
    throw new Error(
      `[set error]: material_instances.${key}.alpha_masked_tint: must be a boolean`,
    );
  }
};

export const assertMaterialInstanceCount = (count: number): void => {
  if (count > MAX_MATERIAL_INSTANCES) {
    throw new Error(
      `[set error]: material_instances: at most ${MAX_MATERIAL_INSTANCES} instances`,
    );
  }
};

/** `minecraft:liquid_detection`, including its nested `detection_rules` */
export const assertLiquidDetection = (value: {
  liquid_type?: string;
  stops_liquid_flowing_from_direction?: string[];
  detection_rules?: Array<{
    liquid_type?: string;
    stops_liquid_flowing_from_direction?: string[];
  }>;
}): void => {
  const rules = [
    value,
    ...(value.detection_rules ?? []),
  ] as Array<{
    liquid_type?: string;
    stops_liquid_flowing_from_direction?: string[];
  }>;
  for (const rule of rules) {
    if (rule.liquid_type !== undefined) {
      assertEnum(rule.liquid_type, LIQUID_TYPES, 'liquid_detection: liquid_type');
    }
    assertFaces(
      rule.stops_liquid_flowing_from_direction,
      'liquid_detection: stops_liquid_flowing_from_direction',
    );
  }
};

/** `minecraft:transformation` — every axis field may be array or object form. */
export const assertTransformation = (value: {
  rotation?: unknown;
  rotation_pivot?: unknown;
  scale?: unknown;
  scale_pivot?: unknown;
  translation?: unknown;
}): void => {
  for (const key of [
    'rotation',
    'rotation_pivot',
    'scale',
    'scale_pivot',
    'translation',
  ] as const) {
    const vec = value[key];
    if (vec === undefined) continue;
    assertVec3(vec, `transformation.${key}`);
  }
};

/** `description.states` values */
export const assertBlockStateValues = (
  name: string,
  value: unknown,
): void => {
  if (Array.isArray(value)) {
    if (!value.every(entry => typeof entry === 'string')) {
      throw new Error(
        `[compile component]: states["${name}"] must be a string array`,
      );
    }
    return;
  }
  if (typeof value === 'object' && value !== null) {
    return;
  }
  throw new Error(
    `[compile component]: states["${name}"] must be a string array, { values } or { min, max }`,
  );
};

/** `description.traits`, including the documented per-trait rules */
export const assertTraits = (
  traits: Record<
    string,
    { enabled_states?: string[]; [key: string]: unknown } | undefined
  >,
): void => {
  for (const [name, trait] of Object.entries(traits)) {
    if (trait === undefined) continue;
    if (typeof trait !== 'object' || Array.isArray(trait)) {
      throw new TypeError(`[set error]: traits.${name}: must be an object`);
    }
    const states = trait.enabled_states;
    if (states !== undefined && !Array.isArray(states)) {
      throw new TypeError(
        `[set error]: traits.${name}.enabled_states: must be an array of strings`,
      );
    }
  }
  const multiBlock = traits['minecraft:multi_block'] as
    | { parts?: number; direction?: string }
    | undefined;
  if (multiBlock?.parts !== undefined) {
    assertRange(multiBlock.parts, 'traits.minecraft:multi_block.parts', MULTI_BLOCK_PARTS_RANGE);
  }
  if (multiBlock?.direction !== undefined) {
    assertEnum(
      multiBlock.direction,
      FACES,
      'traits.minecraft:multi_block: direction',
    );
  }
  const placementDirection = traits['minecraft:placement_direction'] as
    | { y_rotation_offset?: number }
    | undefined;
  if (placementDirection?.y_rotation_offset !== undefined) {
    assertEnum(
      String(placementDirection.y_rotation_offset),
      Y_ROTATION_OFFSETS.map(String),
      'traits.minecraft:placement_direction: y_rotation_offset',
    );
  }
};

/** `minecraft:instrument_sound` — at least one face is required */
export const assertInstrumentSound = (value: {
  up?: string;
  down?: string;
}): void => {
  if (value.up === undefined && value.down === undefined) {
    throw new Error(
      '[compile component]: instrument_sound: at least one of up or down is required',
    );
  }
};

export const assertParticleCount = (value: unknown): void => {
  assertRange(
    value as number,
    'destruction_particles: particle_count',
    PARTICLE_COUNT_RANGE,
  );
};

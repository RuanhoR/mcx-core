/**
 * Pure validators and normalizers for the entity reference.
 *
 * Everything here is stateless so `EntityComponent` only owns the option object
 * and delegates; no helper reads `#opt`.
 */

import {
  BREEDABLE_BOOLEANS,
  LEASH_PRESET_NUMBERS,
  OFFSPRING_ARRAY_FIELDS,
  OFFSPRING_MAP_FIELDS,
  OFFSPRING_RANGE_FIELDS,
  SPRING_TYPES,
  type EntityInteractionData,
} from './constants';
import type { OffspringConfig } from '../../types';

export const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

/** `minecraft:interact` — per-interaction shape checks. */
export const assertInteractionEntry = (
  interaction: EntityInteractionData,
  index: number,
): void => {
  if (!isRecord(interaction)) {
    throw new TypeError(
      `[set error]: interact: interactions[${index}] must be an object`,
    );
  }
  if (
    interaction.hurt_item !== void 0 &&
    (typeof interaction.hurt_item !== 'number' ||
      !Number.isInteger(interaction.hurt_item) ||
      interaction.hurt_item < 0)
  ) {
    throw new TypeError(
      `[set error]: interact: interactions[${index}].hurt_item must be an integer >= 0`,
    );
  }
  for (const key of ['play_sounds', 'spawn_entities'] as const) {
    const value = interaction[key];
    if (value === void 0) continue;
    if (!Array.isArray(value) || !value.every(item => typeof item === 'string')) {
      throw new TypeError(
        `[set error]: interact: interactions[${index}].${key} must be an array of strings`,
      );
    }
  }
  for (const key of [
    'add_items',
    'particle_on_start',
    'repair_entity_item',
    'spawn_items',
  ] as const) {
    const value = interaction[key];
    if (value === void 0) continue;
    if (!isRecord(value)) {
      throw new TypeError(
        `[set error]: interact: interactions[${index}].${key} must be an object`,
      );
    }
  }
  if (interaction.on_interact !== void 0) {
    if (typeof interaction.on_interact === 'string') {
      if (!interaction.on_interact.trim()) {
        throw new TypeError(
          `[set error]: interact: interactions[${index}].on_interact must be a non-empty string`,
        );
      }
    } else if (!isRecord(interaction.on_interact)) {
      throw new TypeError(
        `[set error]: interact: interactions[${index}].on_interact must be a string or object`,
      );
    }
  }
};

/** `minecraft:leashable` */
export const assertLeashable = (config: {
  on_unleash_interact_only?: boolean;
  unleash_on_removal?: boolean;
  presets?: Array<Record<string, unknown>>;
}): void => {
  if (
    config.on_unleash_interact_only !== void 0 &&
    typeof config.on_unleash_interact_only !== 'boolean'
  ) {
    throw new TypeError(
      '[set error]: leashable: on_unleash_interact_only must be boolean',
    );
  }
  if (
    config.unleash_on_removal !== void 0 &&
    typeof config.unleash_on_removal !== 'boolean'
  ) {
    throw new TypeError(
      '[set error]: leashable: unleash_on_removal must be boolean',
    );
  }
  for (const preset of config.presets ?? []) {
    if (!isRecord(preset)) {
      throw new TypeError('[set error]: leashable: presets must contain objects');
    }
    for (const key of LEASH_PRESET_NUMBERS) {
      const value = preset[key];
      if (value === void 0) continue;
      if (typeof value !== 'number' || !Number.isFinite(value)) {
        throw new TypeError(
          `[set error]: leashable: presets[].${key} must be a number`,
        );
      }
    }
    const spring = preset.spring_type;
    if (
      spring !== void 0 &&
      (typeof spring !== 'string' ||
        !SPRING_TYPES.includes(spring as never))
    ) {
      throw new TypeError(
        `[set error]: leashable: presets[].spring_type must be one of ${SPRING_TYPES.join(', ')}`,
      );
    }
  }
};

/** `minecraft:leashable_to` */
export const assertLeashableTo = (config: {
  can_retrieve_from?: boolean;
  unleash_on_removal?: boolean;
}): void => {
  for (const key of ['can_retrieve_from', 'unleash_on_removal'] as const) {
    const value = config[key];
    if (value !== void 0 && typeof value !== 'boolean') {
      throw new TypeError(
        `[set error]: leashable_to: ${key} must be boolean`,
      );
    }
  }
};

/** `minecraft:breedable` */
export const assertBreedable = (config: Record<string, unknown>): void => {
  for (const key of BREEDABLE_BOOLEANS) {
    const value = config[key];
    if (value !== void 0 && typeof value !== 'boolean') {
      throw new TypeError(`[set error]: breedable: ${key} must be a boolean`);
    }
  }
  if (
    config.breed_cooldown !== void 0 &&
    (typeof config.breed_cooldown !== 'number' || config.breed_cooldown < 0)
  ) {
    throw new TypeError(
      '[set error]: breedable: breed_cooldown must be a number >= 0',
    );
  }
};

/** `minecraft:knockback_resistance` */
export const assertKnockbackResistance = (config: {
  value?: number;
  max?: number;
}): void => {
  if (!isRecord(config)) {
    throw new TypeError(
      '[set error]: knockback_resistance: must be an object configuration',
    );
  }
  for (const key of ['value', 'max'] as const) {
    const value = config[key];
    if (value === void 0) continue;
    if (typeof value !== 'number') {
      throw new TypeError(
        `[set error]: knockback_resistance: ${key} must be a number`,
      );
    }
  }
};

/** `minecraft:attack` */
export const assertAttack = (config: {
  effect_amplifier?: number;
}): void => {
  if (
    config.effect_amplifier !== void 0 &&
    (typeof config.effect_amplifier !== 'number' ||
      !Number.isInteger(config.effect_amplifier))
  ) {
    throw new TypeError(
      '[set error]: attack: effect_amplifier must be an integer',
    );
  }
};

/** `minecraft:offspring` — validates the documented field set. */
export const assertOffspring = (config: OffspringConfig): void => {
  if (!isRecord(config)) {
    throw new TypeError(
      '[set error]: offspring: must be an object configuration',
    );
  }
  if (
    config.blend_attributes !== void 0 &&
    typeof config.blend_attributes !== 'boolean'
  ) {
    throw new TypeError(
      '[set error]: offspring: blend_attributes must be a boolean',
    );
  }
  if (
    config.inherit_tamed !== void 0 &&
    typeof config.inherit_tamed !== 'boolean'
  ) {
    throw new TypeError(
      '[set error]: offspring: inherit_tamed must be a boolean',
    );
  }
  for (const key of OFFSPRING_ARRAY_FIELDS) {
    const value = config[key];
    if (value === void 0) continue;
    if (!Array.isArray(value)) {
      throw new TypeError(`[set error]: offspring: ${key} must be an array`);
    }
    for (const entry of value) {
      if (!isRecord(entry)) {
        throw new TypeError(
          `[set error]: offspring: ${key} entries must be objects`,
        );
      }
      for (const [field, fieldValue] of Object.entries(entry)) {
        if (fieldValue !== void 0 && typeof fieldValue !== 'number') {
          throw new TypeError(
            `[set error]: offspring: ${key}.${field} must be a number`,
          );
        }
      }
    }
  }
  for (const key of OFFSPRING_MAP_FIELDS) {
    const value = config[key];
    if (value === void 0) continue;
    if (!isRecord(value)) {
      throw new TypeError(`[set error]: offspring: ${key} must be an object`);
    }
  }
  if (config.parent_centric_attribute_blending !== void 0) {
    if (
      !Array.isArray(config.parent_centric_attribute_blending) ||
      !config.parent_centric_attribute_blending.every(
        item => typeof item === 'string',
      )
    ) {
      throw new TypeError(
        '[set error]: offspring: parent_centric_attribute_blending must be an array of strings',
      );
    }
  }
  for (const key of OFFSPRING_RANGE_FIELDS) {
    const range = config[key];
    if (range === void 0) continue;
    if (!isRecord(range)) {
      throw new TypeError(
        `[set error]: offspring: ${key} must be a { min, max } range`,
      );
    }
    for (const [field, fieldValue] of Object.entries(range)) {
      if (fieldValue !== void 0 && (typeof fieldValue !== 'number' || fieldValue < 0)) {
        throw new TypeError(
          `[set error]: offspring: ${key}.${field} must be a non-negative number`,
        );
      }
    }
  }
};

/**
 * Copies the documented `minecraft:offspring` fields into output order.
 * Anything outside the reference is dropped rather than passed through.
 */
export const normalizeOffspring = (config: OffspringConfig): OffspringConfig => {
  const out: OffspringConfig = {};
  if (typeof config.blend_attributes === 'boolean') {
    out.blend_attributes = config.blend_attributes;
  }
  if (typeof config.inherit_tamed === 'boolean') {
    out.inherit_tamed = config.inherit_tamed;
  }
  if (config.deny_parents_variant !== void 0) {
    out.deny_parents_variant = config.deny_parents_variant.map(entry => ({
      ...entry,
    }));
  }
  if (config.mutation_factor !== void 0) {
    out.mutation_factor = config.mutation_factor.map(entry => ({ ...entry }));
  }
  if (config.offspring_pairs !== void 0) {
    out.offspring_pairs = { ...config.offspring_pairs };
  }
  if (config.parent_centric_attribute_blending !== void 0) {
    out.parent_centric_attribute_blending = [
      ...config.parent_centric_attribute_blending,
    ];
  }
  if (config.property_inheritance !== void 0) {
    out.property_inheritance = { ...config.property_inheritance };
  }
  if (config.random_extra_variant_mutation_interval !== void 0) {
    out.random_extra_variant_mutation_interval = {
      ...config.random_extra_variant_mutation_interval,
    };
  }
  if (config.random_variant_mutation_interval !== void 0) {
    out.random_variant_mutation_interval = {
      ...config.random_variant_mutation_interval,
    };
  }
  return out;
};

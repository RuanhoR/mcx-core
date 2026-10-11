/**
 * Pure validators and normalizers for the item reference.
 *
 * https://learn.microsoft.com/en-us/minecraft/creator/reference/content/itemreference
 *
 * Everything here is stateless, so `ItemComponent` only owns the option object
 * and delegates; no helper reads `#opt`.
 */

/** status effects accepted by `minecraft:food > effects` */
export const STATUS_EFFECTS = [
  'regeneration',
  'absorption',
  'blindness',
  'conduit_power',
  'darkness',
  'fatal_poison',
  'fire_resistance',
  'haste',
  'health_boost',
  'hunger',
  'instant_damage',
  'instant_health',
  'invisibility',
  'jump_boost',
  'levitation',
  'mining_fatigue',
  'nausea',
  'night_vision',
  'poison',
  'resistance',
  'saturation',
  'slow_falling',
  'slowness',
  'speed',
  'strength',
  'water_breathing',
  'weakness',
  'wither',
] as const;

export interface FoodEffectLike {
  name?: string;
  amplifier?: number;
  chance?: number;
  duration?: number;
}

export const assertFoodEffects = <T extends FoodEffectLike>(effects: T[]): T[] => {
  for (const effect of effects) {
    if (effect.name && !STATUS_EFFECTS.includes(effect.name as never)) {
      throw new Error(
        `[compile component]: food: effect name must be a valid status effect. Got: ${effect.name}`,
      );
    }
    if (typeof effect.amplifier === 'number' && effect.amplifier < 0) {
      throw new Error(
        '[compile component]: food: effect amplifier must be at least 0',
      );
    }
    if (
      typeof effect.chance === 'number' &&
      (effect.chance < 0 || effect.chance > 1)
    ) {
      throw new Error(
        '[compile component]: food: effect chance must be between 0 and 1',
      );
    }
    if (typeof effect.duration === 'number' && effect.duration < 0) {
      throw new Error(
        '[compile component]: food: effect duration must be at least 0',
      );
    }
  }
  return effects;
};

/**
 * `minecraft:icon` accepts a bare texture id, `{ texture }` (deprecated) or
 * `{ textures: { default } }`.
 */
export const normalizeItemIcon = (value: unknown): unknown => {
  if (typeof value === 'string') {
    if (!value.trim()) {
      throw new Error('[compile component]: icon: must be a non-empty string');
    }
    return value.trim();
  }
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new Error(
      '[compile component]: icon: must be a string, { texture } or { textures: { default } }',
    );
  }
  const icon = value as Record<string, unknown>;
  if (typeof icon.texture === 'string') {
    if (!icon.texture.trim()) {
      throw new Error('[compile component]: icon: texture must be a non-empty string');
    }
    return { texture: icon.texture.trim() };
  }
  const textures = icon.textures as Record<string, unknown> | undefined;
  if (textures && typeof textures === 'object' && !Array.isArray(textures)) {
    if (typeof textures.default !== 'string' || !textures.default.trim()) {
      throw new Error(
        '[compile component]: icon: textures.default must be a non-empty string',
      );
    }
    return { textures: { default: textures.default.trim() } };
  }
  throw new Error(
    '[compile component]: icon: must be a string, { texture } or { textures: { default } }',
  );
};

/**
 * `minecraft:repairable > repair_items > repair_amount` accepts a decimal, a
 * molang string, or the legacy `{ expression, version }` object.
 */
export const normalizeRepairAmount = (
  value: unknown,
  scope: 'compile component' | 'set error',
): unknown => {
  if (typeof value === 'number' || typeof value === 'string') return value;
  if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
    const molang = value as Record<string, unknown>;
    if (
      typeof molang.expression === 'string' &&
      molang.expression.trim() &&
      typeof molang.version === 'number'
    ) {
      return { expression: molang.expression, version: molang.version };
    }
  }
  throw new Error(
    `[${scope}]: repairable: repair_amount must be a number, a molang string or { expression, version }`,
  );
};

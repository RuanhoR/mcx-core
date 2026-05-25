/**
 * Enchantable slot types for minecraft:enchantable component
 * Specifies which types of enchantments can be applied to items
 * @description Update time UTC 2026/4/8
 */
export const EnchantableSlotArray = [
  'none',
  'all',
  'g_armor',
  'armor_head',
  'armor_torso',
  'armor_feet',
  'armor_legs',
  'sword',
  'bow',
  'spear',
  'crossbow',
  'melee_spear',
  'g_tool',
  'hoe',
  'shears',
  'flintsteel',
  'shield',
  'g_digging',
  'axe',
  'pickaxe',
  'shovel',
  'fishing_rod',
  'carrot_stick',
  'elytra',
  'cosmetic_head',
] as const

export type EnchantableSlot = (typeof EnchantableSlotArray)[number]

export const EnchantableSlotEnum = EnchantableSlotArray

export default EnchantableSlot

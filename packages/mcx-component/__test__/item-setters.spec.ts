import { describe, it, expect } from 'vitest';
import { ItemComponent } from '../src/components/item';

type Json = Record<string, unknown>;

function deep(obj: unknown, path: string[]): unknown {
  let cur: unknown = obj;
  for (const key of path) {
    if (cur === null || typeof cur !== 'object') throw new Error(`missing ${path.join('.')}`);
    cur = (cur as Json)[key];
  }
  return cur;
}

const COMP = 'minecraft:item';
const DESC = 'description';
const FMT = '1.21.0';
const NEW = '1.21.100';
const make = (format = FMT) =>
  new ItemComponent({ format, id: 'test:item', components: {} } as never);

interface Case {
  name: string;
  args: unknown[];
  fmt?: string;
  /** 先行调用的 setter（满足组件间依赖） */
  pre?: Array<[string, unknown[]]>;
}

const validCases: Case[] = [
  { name: 'setName', args: ['Demo'] },
  { name: 'setMenuCategory', args: ['items'] },
  { name: 'setMenuCategory', args: [{ category: 'nature', group: 'itemGroup.name.leaves' }] },
  { name: 'setGroup', args: ['itemGroup.name.leaves'] },
  { name: 'setIsHiddenInCommands', args: [true] },
  { name: 'setAllowOffHand', args: [true] },
  { name: 'setGlint', args: [true] },
  { name: 'setGlint', args: [false] },
  { name: 'setHandEquipped', args: [true] },
  { name: 'setCooldown', args: [{ category: 'attack', duration: 5 }] },
  { name: 'setCompostable', args: [{ composting_chance: 30 }], fmt: NEW },
  { name: 'setCompostable', args: [{ composting_chance: 100 }], fmt: NEW },
  { name: 'setCompostable', args: [{ composting_chance: 1 }], fmt: NEW },
  { name: 'setBundleInteraction', args: [{ num_viewable_slots: 12 }], fmt: NEW, pre: [['setStorageItem', [{}]]] },
  { name: 'setDamageAbsorption', args: [{ absorbable_causes: ['fire'] }] },
  { name: 'setDurability', args: [{ max_durability: 100 }] },
  { name: 'setDurability', args: [{ max_durability: 50, damage_chance: { min: 1, max: 5 } }] },
  { name: 'setDyeable', args: [{ default_color: '#175882' }], fmt: NEW },
  { name: 'setDyeable', args: [{ default_color: [255, 0, 0] }], fmt: NEW },
  { name: 'setEnchantable', args: [{ slot: 'sword', value: 10 }] },
  { name: 'setEnchantable', args: [{ value: 1 }] },
  { name: 'setFood', args: [{ nutrition: 4, saturation_modifier: 0.6 }] },
  { name: 'setFood', args: [{ nutrition: 2, can_always_eat: true }] },
  { name: 'setFireResistant', args: [{ value: true }] },
  { name: 'setFuel', args: [{ duration: 30 }] },
  { name: 'setFuel', args: [{ duration: 1 }] },
  { name: 'setInteractButton', args: [true] },
  { name: 'setInteractButton', args: ['Use'] },
  { name: 'setHoverTextColor', args: ['red'] },
  { name: 'setHoverTextColor', args: [{ value: 'green' }] },
  { name: 'setLiquidClipped', args: [true] },
  { name: 'setLiquidClipped', args: [{ value: false }] },
  { name: 'setMaxStackSize', args: [16] },
  { name: 'setMaxStackSize', args: [{ value: 1 }] },
  { name: 'setMaxStackSize', args: [64] },
  { name: 'setRarity', args: [{ value: 'epic' }] },
  { name: 'setStackedByData', args: [{ value: true }] },
  { name: 'setShouldDespawn', args: [{ value: false }] },
  { name: 'setTags', args: [['minecraft:is_food']] },
  { name: 'setCustomComponents', args: [['demo:custom']] },
  { name: 'setSwingDuration', args: [2] },
  { name: 'setUseAnimation', args: ['eat'] },
  { name: 'setUseAnimation', args: [{ value: 'drink' }] },
  { name: 'setUseAnimation', args: ['bow'] },
  { name: 'setDamage', args: [7] },
  { name: 'setCanDestroyInCreative', args: [false] },
  { name: 'setSwingSounds', args: [{ sound: 'item.sword.hit' }] },
  { name: 'setWeapon', args: [{ on_hit_block: 'minecraft:stone' }] },
  { name: 'setKnockbackResistance', args: [{ value: 0.5 }] },
  { name: 'setKnockbackResistance', args: [{ value: 1, protection: 0.2 }] },
  { name: 'setDurability', args: [{ max_durability: 1 }] },
];

describe('ItemComponent setter matrix (valid args do not throw and keep JSON valid)', () => {
  it.each(validCases)('$name %j', ({ name, args, fmt, pre }) => {
    const item = make(fmt);
    const setters = item as never as Record<string, (...a: unknown[]) => void>;
    for (const [preName, preArgs] of pre ?? []) setters[preName](...preArgs);
    expect(() => setters[name](...args)).not.toThrow();
    expect(() => item.toJSON()).not.toThrow();
  });
});

describe('ItemComponent setter matrix (values are stored)', () => {
  it.each([
    { name: 'setAllowOffHand', args: [true], path: [COMP, 'components', 'minecraft:allow_off_hand', 'value'], value: true },
    { name: 'setGlint', args: [true], path: [COMP, 'components', 'minecraft:glint', 'value'], value: true },
    { name: 'setGlint', args: [false], path: [COMP, 'components', 'minecraft:glint', 'value'], value: false },
    { name: 'setHandEquipped', args: [true], path: [COMP, 'components', 'minecraft:hand_equipped', 'value'], value: true },
    { name: 'setDamage', args: [9], path: [COMP, 'components', 'minecraft:damage', 'value'], value: 9 },
    { name: 'setCanDestroyInCreative', args: [false], path: [COMP, 'components', 'minecraft:can_destroy_in_creative', 'value'], value: false },
    { name: 'setIsHiddenInCommands', args: [true], path: [COMP, DESC, 'is_hidden_in_commands'], value: true },
    { name: 'setFuel', args: [{ duration: 80 }], path: [COMP, 'components', 'minecraft:fuel', 'duration'], value: 80 },
    { name: 'setFood', args: [{ nutrition: 6 }], path: [COMP, 'components', 'minecraft:food', 'nutrition'], value: 6 },
    { name: 'setCooldown', args: [{ category: 'ender_pearl', duration: 12 }], path: [COMP, 'components', 'minecraft:cooldown', 'duration'], value: 12 },
    { name: 'setSwingDuration', args: [3], path: [COMP, 'components', 'minecraft:swing_duration', 'value'], value: 3 },
    { name: 'setMaxStackSize', args: [32], path: [COMP, 'components', 'minecraft:max_stack_size'], value: 32 },
    { name: 'setInteractButton', args: ['Push'], path: [COMP, 'components', 'minecraft:interact_button'], value: 'Push' },
    { name: 'setRarity', args: [{ value: 'rare' }], path: [COMP, 'components', 'minecraft:rarity', 'value'], value: 'rare' },
  ])('$name stores $path', ({ name, args, path, value }) => {
    const item = make();
    (item as never as Record<string, (...a: unknown[]) => void>)[name](...args);
    expect(deep(item.toJSON() as unknown as Json, path)).toBe(value);
  });
});

describe('ItemComponent setter validation errors', () => {
  it.each([
    { name: 'setGroup', args: [''], match: /type error|limited/ },
    { name: 'setIsHiddenInCommands', args: ['yes'] },
    { name: 'setAllowOffHand', args: [1] },
    { name: 'setGlint', args: ['yes'] },
    { name: 'setInteractButton', args: [123] },
    { name: 'setRarity', args: [{ value: 'legendary' }] },
    { name: 'setTags', args: ['not-an-array'] },
    { name: 'setCustomComponents', args: ['demo:x'] },
    { name: 'setSwingDuration', args: [-1] },
    { name: 'setDamageAbsorption', args: [{ absorbable_causes: [] }] },
    { name: 'setDyeable', args: [{ default_color: 'red' }] },
    { name: 'setCompostable', args: [{ composting_chance: 0 }] },
    { name: 'setCompostable', args: [{ composting_chance: 101 }] },
  ])('$name %j throws', ({ name, args, match }) => {
    const item = make(NEW);
    const fn = () =>
      (item as never as Record<string, (...a: unknown[]) => void>)[name](...args);
    if (match) expect(fn).toThrow(match);
    else expect(fn).toThrow();
  });
});

describe('ItemComponent id / meta handling', () => {
  it.each(['test:apple', 'demo:multi_word_id', 'a:b', 'x:1234'])(
    'accepts namespaced id %s',
    id => {
      const item = new ItemComponent({ format: FMT, id, components: {} } as never);
      expect(deep(item.toJSON() as unknown as Json, [COMP, DESC, 'identifier'])).toBe(id);
    },
  );
  it.each(['plain', ':nocolon', 'trailing:'])('rejects id %s', id => {
    expect(
      () => new ItemComponent({ format: FMT, id, components: {} } as never).toJSON(),
    ).toThrow();
  });
  it.each(['1.21.0', '1.21.100', '1.26.40'])('accepts format %s', format => {
    const item = new ItemComponent({ format, id: 'test:item', components: {} } as never);
    expect(() => item.toJSON()).not.toThrow();
  });
});

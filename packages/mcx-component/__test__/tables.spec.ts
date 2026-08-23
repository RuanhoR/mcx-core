import { describe, it, expect } from 'vitest';
import { LootTableComponent, LootPool } from '../src/components/lootTable';
import { TradeTableComponent } from '../src/components/tradeTable';
import { RecipeComponent } from '../src/components/recipe';

type Json = Record<string, unknown>;

function deep(obj: unknown, dotPath: string): unknown {
  let cur: unknown = obj;
  for (const key of dotPath.split('.')) {
    if (cur === null || typeof cur !== 'object') throw new Error(`missing ${dotPath}`);
    cur = (cur as Json)[key];
  }
  return cur;
}

const entry = { type: 'item' as const, name: 'minecraft:diamond', weight: 5 };
const tier = {
  groups: [
    {
      trades: [
        {
          wants: [{ item: 'minecraft:emerald', quantity: 3 }],
          gives: [{ item: 'test:gem' }],
          max_uses: 8,
        },
      ],
    },
  ],
};

describe('LootTableComponent', () => {
  it('requires pools', () => {
    expect(() => new LootTableComponent({ pools: [] }).toJSON()).toThrow('pool');
  });
  it('accepts plain pool objects via addPool', () => {
    const t = new LootTableComponent({ pools: [] });
    t.addPool({ rolls: 1, entries: [entry] });
    const json = t.toJSON() as Json;
    expect(deep(json, 'pools.0.rolls')).toBe(1);
    expect(deep(json, 'pools.0.entries.0.name')).toBe('minecraft:diamond');
  });
  it('normalizes LootPool class instances', () => {
    const pool = new LootPool({ rolls: { min: 1, max: 2 }, entries: [entry] });
    const t = new LootTableComponent({ pools: [pool] });
    expect(deep(t.toJSON(), 'pools.0.rolls')).toEqual({ min: 1, max: 2 });
  });
  it('omits format_version when omitted', () => {
    const t = new LootTableComponent({ pools: [{ rolls: 1, entries: [entry] }] });
    expect((t.toJSON() as Json).format_version).toBeUndefined();
  });
  it('keeps provided format_version', () => {
    const t = new LootTableComponent({
      format: '1.12.0',
      pools: [{ rolls: 1, entries: [entry] }],
    });
    expect(deep(t.toJSON(), 'format_version')).toBe('1.12.0');
  });
  it('rejects malformed format strings', () => {
    const t = new LootTableComponent({ format: 'latest', pools: [{ rolls: 1, entries: [entry] }] });
    expect(() => t.toJSON()).toThrow('invalid loot table format');
  });
  it('preserves entry functions and conditions', () => {
    const t = new LootTableComponent({
      pools: [
        {
          rolls: 1,
          entries: [
            {
              ...entry,
              functions: [{ function: 'set_count', count: { min: 1, max: 2 } }],
              conditions: [
                { condition: 'killed_by_player' },
                { condition: 'random_chance', chance: 0.5 },
              ],
            },
          ],
        },
      ],
    });
    const e = deep(t.toJSON(), 'pools.0.entries.0') as Json;
    expect(e.functions).toEqual([{ function: 'set_count', count: { min: 1, max: 2 } }]);
    expect(e.conditions).toHaveLength(2);
  });
  it('supports pool-level conditions', () => {
    const t = new LootTableComponent({
      pools: [
        { rolls: 1, entries: [entry], conditions: [{ condition: 'is_explosion' }] },
      ],
    });
    expect(deep(t.toJSON(), 'pools.0.conditions')).toEqual([
      { condition: 'is_explosion' },
    ]);
  });
  it('supports loot_table and empty entry types', () => {
    const t = new LootTableComponent({
      pools: [
        {
          rolls: 1,
          entries: [
            { type: 'loot_table', name: 'other.json' },
            { type: 'empty', weight: 3 },
          ],
        },
      ],
    });
    const json = t.toJSON() as Json;
    const entries = deep(json, 'pools.0.entries') as Array<Json>;
    expect(entries[0]?.type).toBe('loot_table');
    expect(entries[1]?.type).toBe('empty');
  });
});

describe('LootPool class', () => {
  it('setRolls accepts numbers', () => {
    const p = new LootPool({ entries: [] });
    p.setRolls(3);
    expect(p.getRolls()).toBe(3);
  });
  it('setRolls accepts ranges', () => {
    const p = new LootPool({ entries: [] });
    p.setRolls({ min: 1, max: 5 });
    expect(p.getRolls()).toEqual({ min: 1, max: 5 });
  });
  it('entries default to empty array', () => {
    expect(new LootPool({ entries: [] }).getEntries()).toEqual([]);
  });
  it('addEntry appends', () => {
    const p = new LootPool({ entries: [] });
    p.addEntry(entry);
    expect(p.getEntries().length).toBeGreaterThanOrEqual(1);
  });
  it('conditions default to undefined when omitted', () => {
    expect(new LootPool({ entries: [] }).getConditions()).toBeUndefined();
  });
  it('addCondition initialises the array', () => {
    const p = new LootPool({ entries: [] });
    p.addCondition({ condition: 'killed_by_player' });
    expect(p.getConditions()).toHaveLength(1);
  });
  it('toJSON omits unset optional fields', () => {
    const j = new LootPool({ entries: [{ type: 'empty' }] }).toJSON();
    expect(j).not.toHaveProperty('rolls');
    expect(j).not.toHaveProperty('conditions');
  });
});

describe('TradeTableComponent', () => {
  it('requires at least one tier', () => {
    expect(() => new TradeTableComponent({ tiers: [] }).toJSON()).toThrow('tier');
  });
  it('emits tiers via addTier', () => {
    const t = new TradeTableComponent({ tiers: [] });
    t.addTier(tier);
    const json = t.toJSON() as Json;
    expect(deep(json, 'tiers.0.groups.0.trades.0.wants.0.item')).toBe(
      'minecraft:emerald'
    );
    expect(deep(json, 'tiers.0.groups.0.trades.0.max_uses')).toBe(8);
  });
  it('omits format_version when not provided', () => {
    const t = new TradeTableComponent({ tiers: [] });
    t.addTier(tier);
    expect((t.toJSON() as Json).format_version).toBeUndefined();
  });
  it('rejects malformed format strings', () => {
    const t = new TradeTableComponent({ format: 'nope', tiers: [] });
    t.addTier(tier);
    expect(() => t.toJSON()).toThrow('invalid trade table format');
  });
  it('supports multiple groups per tier', () => {
    const t = new TradeTableComponent({
      tiers: [],
    });
    t.addTier({
      groups: [
        { trades: [{ wants: [{ item: 'a:b' }], gives: [{ item: 'c:d' }] }] },
        { trades: [{ wants: [{ item: 'e:f' }], gives: [{ item: 'g:h' }] }] },
      ],
    });
    const groups = deep(t.toJSON(), 'tiers.0.groups') as unknown[];
    expect(groups).toHaveLength(2);
  });
});

describe('RecipeComponent extras', () => {
  it('furnace recipes use input/output', () => {
    const r = new RecipeComponent({
      format: '1.12.0',
      id: 'test:f',
      type: 'furnace',
      input: { item: 'minecraft:sand' },
      output: 'minecraft:glass',
    });
    expect((r.toJSON() as Json)['minecraft:recipe_furnace']).toBeDefined();
  });

  it('shapeless recipes carry ingredients', () => {
    const r = new RecipeComponent({
      format: '1.12.0',
      id: 'test:sl',
      type: 'shapeless',
      ingredients: [{ item: 'a:b' }],
      result: { item: 'c:d' },
    });
    const sl = (r.toJSON() as Json)['minecraft:recipe_shapeless'] as Json;
    expect((sl.ingredients as unknown[]).length).toBe(1);
  });

  it('throws on unknown recipe types', () => {
    const r = new RecipeComponent({
      format: '1.12.0',
      id: 'test:r3',
      type: 'bogus' as never,
    });
    expect(() => r.toJSON()).toThrow('unknown recipe type');
  });

  it('defaults format to 1.12 for shaped', () => {
    const r = new RecipeComponent({
        format: '1.12.0',
        id: 'test:d',
      type: 'shaped',
      pattern: ['A'],
      key: { A: { item: 'x:y' } },
      result: 'z:w',
    });
    expect((r.toJSON() as Json).format_version).toBe('1.12.0');
  });

  it('smithing_transform defaults to 1.17', () => {
    const r = new RecipeComponent({
        format: '1.17.0',
        id: 'test:s',
      type: 'smithing_transform',
      template: 't',
      base: 'b',
      addition: 'a',
      result: 'r',
    });
    expect((r.toJSON() as Json).format_version).toBe('1.17.0');
  });
});

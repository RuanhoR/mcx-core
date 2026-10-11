import { describe, it, expect } from 'vitest';
import {
  isFormatVersion,
  parseFormatVersion,
  compareFormatVersion,
  isFormatAtLeast,
  resolveFormatVersion,
  applyFormatVersion,
  requireFormatAtLeast,
  requireField,
  requirePresent,
  requireIdentifier,
} from '../src/shared';
import { RecipeComponent } from '../src/components/recipe';
import { FeatureComponent } from '../src/components/feature';
import { FeatureRuleComponent } from '../src/components/featureRule';
import { SpawnRuleComponent } from '../src/components/spawnRule';
import { ItemCatalogComponent } from '../src/components/itemCatalog';
import { LootTableComponent } from '../src/components/lootTable';
import { TradeTableComponent } from '../src/components/tradeTable';

type Json = Record<string, unknown>;

const shaped = (over?: Partial<ConstructorParameters<typeof RecipeComponent>[0]>) =>
  new RecipeComponent({
    format: '1.20.0',
    id: 'test:r',
    type: 'shaped',
    result: { item: 'test:out' },
    ...over,
  });

describe('shared: version parsing', () => {
  it('accepts one, two and three part versions', () => {
    expect(isFormatVersion('1')).toBe(true);
    expect(isFormatVersion('1.20')).toBe(true);
    expect(isFormatVersion('1.20.80')).toBe(true);
  });
  it('rejects junk and extra parts', () => {
    expect(isFormatVersion('latest')).toBe(false);
    expect(isFormatVersion('1.2.3.4')).toBe(false);
    expect(isFormatVersion('1.20.0-beta')).toBe(false);
    expect(isFormatVersion(120)).toBe(false);
    expect(isFormatVersion(undefined)).toBe(false);
  });
  it('enforces an exact part count when asked', () => {
    expect(isFormatVersion('1.20', 3)).toBe(false);
    expect(isFormatVersion('1.20.0', 3)).toBe(true);
    expect(isFormatVersion('1.20.0.1', 3)).toBe(false);
  });
  it('fills missing parts with zero', () => {
    expect(parseFormatVersion('1.21')).toEqual([1, 21, 0]);
    expect(parseFormatVersion('1')).toEqual([1, 0, 0]);
    expect(parseFormatVersion('1.20.80')).toEqual([1, 20, 80]);
  });
  it('compares numerically, not lexically', () => {
    expect(compareFormatVersion('1.9.0', '1.10.0')).toBe(-1);
    expect(compareFormatVersion('1.21.0', '1.21.0')).toBe(0);
    expect(compareFormatVersion('1.21.100', '1.21.40')).toBe(1);
  });
  it('isFormatAtLeast handles the patch level', () => {
    expect(isFormatAtLeast('1.20.80', 1, 20, 80)).toBe(true);
    expect(isFormatAtLeast('1.20.70', 1, 20, 80)).toBe(false);
    expect(isFormatAtLeast('1.21.0', 1, 20, 80)).toBe(true);
    expect(isFormatAtLeast('2.0.0', 1, 20, 80)).toBe(true);
  });
});

describe('shared: resolveFormatVersion', () => {
  it('trims and returns a valid version', () => {
    expect(resolveFormatVersion({ component: 'x', format: ' 1.21.0 ' })).toBe('1.21.0');
  });
  it('uses the fallback when missing or blank', () => {
    expect(resolveFormatVersion({ component: 'x', fallback: '1.17' })).toBe('1.17');
    expect(resolveFormatVersion({ component: 'x', format: '  ', fallback: '1.17' })).toBe('1.17');
  });
  it('omits the key when nothing resolves and not required', () => {
    expect(resolveFormatVersion({ component: 'x' })).toBeUndefined();
    expect(resolveFormatVersion({ component: 'x', format: '' })).toBeUndefined();
  });
  it('throws "no format" when required and unresolvable', () => {
    expect(() => resolveFormatVersion({ component: 'x', required: true })).toThrow('no format');
    expect(() => resolveFormatVersion({ component: 'x', format: '', required: true })).toThrow('no format');
  });
  it('throws "invalid <component> format" for malformed values', () => {
    expect(() => resolveFormatVersion({ component: 'loot table', format: 'latest' })).toThrow(
      'invalid loot table format',
    );
    expect(() => resolveFormatVersion({ component: 'item', format: 'a.b.c' })).toThrow(
      'invalid item format: a.b.c',
    );
  });
  it('never falls back when the supplied value is malformed', () => {
    expect(() => resolveFormatVersion({ component: 'x', format: 'nope', fallback: '1.17' })).toThrow(
      'invalid x format',
    );
  });
  it('applyFormatVersion writes and deletes the key', () => {
    const withVersion: Json = {};
    applyFormatVersion(withVersion, { component: 'x', format: '1.12' });
    expect(withVersion.format_version).toBe('1.12');
    applyFormatVersion(withVersion, { component: 'x' });
    expect(withVersion).not.toHaveProperty('format_version');
  });
});

describe('shared: assertions', () => {
  it('requireFormatAtLeast passes and throws', () => {
    expect(() => requireFormatAtLeast('1.21.50', 'block_placer', '1.21.50')).not.toThrow();
    expect(() => requireFormatAtLeast('1.21.50', 'block_placer', '1.21.50.0')).not.toThrow();
    expect(() => requireFormatAtLeast('1.21.40', 'block_placer', '1.21.50')).toThrow(
      '[compile component]: block_placer component requires format version 1.21.50 or higher',
    );
    expect(() => requireFormatAtLeast('1.9.0', 'seed:', '1.10.0', 'set')).toThrow(
      '[set error]: seed: component requires format version 1.10.0 or higher',
    );
  });
  it('requireField only accepts non-empty strings', () => {
    expect(requireField('a:b', 'recipe', 'output')).toBe('a:b');
    expect(() => requireField('', 'recipe', 'output')).toThrow('recipe: output is required');
    expect(() => requireField(undefined, 'recipe', 'output')).toThrow('recipe: output is required');
  });
  it('requirePresent accepts strings, objects and arrays', () => {
    expect(requirePresent({ tag: 'minecraft:planks' }, 'recipe', 'template')).toEqual({
      tag: 'minecraft:planks',
    });
    expect(requirePresent([{ item: 'a:b' }], 'recipe', 'result')).toHaveLength(1);
    expect(() => requirePresent({}, 'recipe', 'template')).toThrow('recipe: template is required');
    expect(() => requirePresent([], 'recipe', 'result')).toThrow('recipe: result is required');
  });
  it('requireIdentifier enforces the namespaced form', () => {
    expect(requireIdentifier('test:block', 'block')).toBe('test:block');
    expect(requireIdentifier('test:block/sub', 'block')).toBe('test:block/sub');
    expect(() => requireIdentifier('plain', 'block')).toThrow('block: no id');
    expect(() => requireIdentifier('!!!a:b', 'block')).toThrow('block: no id');
  });
});

describe('recipe: required result / output', () => {
  it('shaped without result throws', () => {
    const r = new RecipeComponent({ format: '1.20.0', id: 'test:r', type: 'shaped' });
    expect(() => r.toJSON()).toThrow('recipe: result is required');
  });
  it('shapeless without result throws', () => {
    const r = new RecipeComponent({ format: '1.20.0', id: 'test:r', type: 'shapeless' });
    expect(() => r.toJSON()).toThrow('recipe: result is required');
  });
  it('furnace without output throws', () => {
    const r = new RecipeComponent({
      format: '1.20.0',
      id: 'test:r',
      type: 'furnace',
      input: { item: 'minecraft:sand' },
    });
    expect(() => r.toJSON()).toThrow('recipe: output is required');
  });
  it('furnace without input throws', () => {
    const r = new RecipeComponent({
      format: '1.20.0',
      id: 'test:r',
      type: 'furnace',
      output: 'minecraft:glass',
    });
    expect(() => r.toJSON()).toThrow('recipe: input is required');
  });
  it('smithing_transform without template/base/addition throws', () => {
    expect(() =>
      new RecipeComponent({ format: '1.20.0', id: 'test:t', type: 'smithing_transform', result: 'a:b' }).toJSON(),
    ).toThrow('recipe: template is required');
    expect(() =>
      new RecipeComponent({
        format: '1.20.0',
        id: 'test:t',
        type: 'smithing_transform',
        template: 'a:b',
        result: 'a:b',
      }).toJSON(),
    ).toThrow('recipe: base is required');
  });
  it('smithing_transform without result throws', () => {
    expect(() =>
      new RecipeComponent({
        format: '1.20.0',
        id: 'test:t',
        type: 'smithing_transform',
        template: 'a:b',
        base: 'c:d',
        addition: 'e:f',
      }).toJSON(),
    ).toThrow('recipe: result is required');
  });
  it('brewing recipes require input, reagent and output', () => {
    expect(() =>
      new RecipeComponent({ format: '1.20.0', id: 'test:t', type: 'brewing_mix' }).toJSON(),
    ).toThrow('recipe: input is required');
    expect(() =>
      new RecipeComponent({
        format: '1.20.0',
        id: 'test:t',
        type: 'brewing_mix',
        input: 'minecraft:potion',
      }).toJSON(),
    ).toThrow('recipe: reagent is required');
    expect(() =>
      new RecipeComponent({
        format: '1.20.0',
        id: 'test:t',
        type: 'brewing_mix',
        input: 'minecraft:potion',
        reagent: 'minecraft:gunpowder',
      }).toJSON(),
    ).toThrow('recipe: output is required');
  });
  it('rejects a non-namespaced identifier', () => {
    expect(() => shaped({ id: 'plain' }).toJSON()).toThrow('recipe: no id');
  });
});

describe('recipe: documented field coverage', () => {
  it('emits the recipe book group', () => {
    const json = shaped({ group: 'tools' }).toJSON() as Json;
    expect((json['minecraft:recipe_shaped'] as Json).group).toBe('tools');
  });
  it('accepts tags in key and ingredients', () => {
    const json = shaped({
      pattern: ['A'],
      key: { A: { tag: 'minecraft:planks' } },
    }).toJSON() as Json;
    expect(((json['minecraft:recipe_shaped'] as Json).key as Json).A).toEqual({
      tag: 'minecraft:planks',
    });
  });
  it('accepts an array of results', () => {
    const json = shaped({ result: [{ item: 'a:b' }, { item: 'c:d' }] }).toJSON() as Json;
    expect((json['minecraft:recipe_shaped'] as Json).result).toHaveLength(2);
  });
  it('carries unlock entries with their context', () => {
    const json = shaped({
      unlock: [{ item: 'minecraft:iron_ingot', context: 'PlayerInWater' }],
    }).toJSON() as Json;
    expect((json['minecraft:recipe_shaped'] as Json).unlock).toEqual([
      { item: 'minecraft:iron_ingot', context: 'PlayerInWater' },
    ]);
  });
  it('accepts object form for smithing_trim template/base/addition', () => {
    const r = new RecipeComponent({
      format: '1.20.0',
      id: 'test:trim',
      type: 'smithing_trim',
      template: { tag: 'minecraft:trim_templates' },
      base: { tag: 'minecraft:trimmable_armors' },
      addition: { tag: 'minecraft:trim_materials' },
    });
    const json = r.toJSON() as Json;
    expect(json['minecraft:recipe_smithing_trim']).toEqual({
      description: { identifier: 'test:trim' },
      tags: ['smithing_table'],
      template: { tag: 'minecraft:trim_templates' },
      base: { tag: 'minecraft:trimmable_armors' },
      addition: { tag: 'minecraft:trim_materials' },
    });
  });
  it('keeps explicit tags instead of the per-type default', () => {
    const json = shaped({ tags: ['stonecutter'] }).toJSON() as Json;
    expect((json['minecraft:recipe_shaped'] as Json).tags).toEqual(['stonecutter']);
  });
  it('falls back to the per-type default tags when the list is empty', () => {
    const json = shaped({ tags: [] }).toJSON() as Json;
    expect((json['minecraft:recipe_shaped'] as Json).tags).toEqual(['crafting_table']);
  });
});

describe('recipe: format_version handling', () => {
  it('accepts the two part versions the docs use', () => {
    expect(shaped({ format: '1.12' }).toJSON().format_version).toBe('1.12');
    expect(
      new RecipeComponent({
        format: '1.18',
        id: 'test:t',
        type: 'brewing_mix',
        input: 'a:b',
        reagent: 'c:d',
        output: 'e:f',
      }).toJSON().format_version,
    ).toBe('1.18');
  });
  it('rejects malformed versions', () => {
    expect(() => shaped({ format: 'latest' }).toJSON()).toThrow('invalid recipe format: latest');
  });
  it('throws for non-smithing recipes with no format', () => {
    expect(() => shaped({ format: '' }).toJSON()).toThrow('no format');
  });
  it('still defaults smithing recipes to 1.17', () => {
    const r = new RecipeComponent({
      format: '',
      id: 'test:t',
      type: 'smithing_transform',
      template: 'a:b',
      base: 'c:d',
      addition: 'e:f',
      result: 'g:h',
    });
    expect(r.toJSON().format_version).toBe('1.17');
  });
});

describe('worldgen components: format_version validation', () => {
  it('feature defaults to 1.17.0 and validates overrides', () => {
    expect(new FeatureComponent({ identifier: 'a:b' }).toJSON().format_version).toBe('1.17.0');
    expect(new FeatureComponent({ identifier: 'a:b', format: '1.20.10' }).getFormat()).toBe('1.20.10');
    expect(() => new FeatureComponent({ identifier: 'a:b', format: 'nope' }).toJSON()).toThrow(
      'invalid feature format: nope',
    );
  });
  it('feature_rule defaults to 1.13.0 and requires places_feature', () => {
    const ok = new FeatureRuleComponent({ identifier: 'a:b', places_feature: 'c:d' });
    expect(ok.toJSON().format_version).toBe('1.13.0');
    expect(() => new FeatureRuleComponent({ identifier: 'a:b' } as never).toJSON()).toThrow(
      'feature_rule: places_feature is required',
    );
  });
  it('spawn_rule defaults to 1.21.0', () => {
    const s = new SpawnRuleComponent({ identifier: 'a:b' });
    expect(s.toJSON().format_version).toBe('1.21.0');
    expect(() => new SpawnRuleComponent({ identifier: 'a:b', format: 'x.y' }).toJSON()).toThrow(
      'invalid spawn rule format: x.y',
    );
  });
  it('item_catalog defaults to 1.26.30', () => {
    const c = new ItemCatalogComponent();
    expect(c.getFormat()).toBe('1.26.30');
    expect(c.toJSON().format_version).toBe('1.26.30');
  });
});

describe('table components: format_version handling', () => {
  const entry = { type: 'item' as const, name: 'minecraft:diamond', weight: 1 };
  const tier = { groups: [{ trades: [{ wants: [{ item: 'a:b' }], gives: [{ item: 'c:d' }] }] }] };

  it('loot tables accept two part versions and stay optional', () => {
    const t = new LootTableComponent({ format: '1.12', pools: [{ entries: [entry] }] });
    expect(t.toJSON().format_version).toBe('1.12');
    expect(
      (new LootTableComponent({ format: '  ', pools: [{ entries: [entry] }] }).toJSON() as Json)
        .format_version,
    ).toBeUndefined();
  });
  it('trade tables accept two part versions and stay optional', () => {
    const t = new TradeTableComponent({ format: '1.12', tiers: [tier] });
    expect(t.toJSON().format_version).toBe('1.12');
    expect((new TradeTableComponent({ tiers: [tier] }).toJSON() as Json).format_version).toBeUndefined();
  });
  it('trade tables require each tier to expose groups or trades', () => {
    expect(() => new TradeTableComponent({ tiers: [{ total_exp_required: 10 }] }).toJSON()).toThrow(
      'tiers[0]',
    );
    expect(
      new TradeTableComponent({
        tiers: [{ total_exp_required: 10, trades: [{ wants: [{ item: 'a:b' }], gives: [{ item: 'c:d' }] }] }],
      }).toJSON(),
    ).toBeDefined();
  });
});

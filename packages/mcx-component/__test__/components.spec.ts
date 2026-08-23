import { describe, it, expect } from 'vitest';
import { ItemComponent } from '../src/components/item';
import { BlockComponent } from '../src/components/block';
import { EntityComponent } from '../src/components/entity';
import { RecipeComponent } from '../src/components/recipe';
import { LootTableComponent, LootPool } from '../src/components/lootTable';
import { TradeTableComponent } from '../src/components/tradeTable';
import {
  FeatureComponent,
  FeatureRuleComponent,
  SpawnRuleComponent,
  ItemCatalogComponent,
} from '../src/index';

type Json = Record<string, unknown>;

function deep(obj: unknown, dotPath: string): unknown {
  let cur: unknown = obj;
  for (const key of dotPath.split('.')) {
    if (cur === null || typeof cur !== 'object') throw new Error(`missing ${dotPath}`);
    cur = (cur as Json)[key];
  }
  return cur;
}

const FMT = '1.21.0';

// ---- helpers ----
const item = (opts?: Partial<Json>) =>
  new ItemComponent({ format: FMT, id: 'test:item', components: {}, ...opts } as never);
const block = (id = 'test:block') => new BlockComponent({ format: '1.26.40', id });
const entity = () => new EntityComponent({ format: FMT, id: 'test:e' });
const shaped = () =>
  new RecipeComponent({
    format: '1.12.0',
    id: 'test:r',
    type: 'shaped',
    tags: ['crafting_table'],
    pattern: ['AA'],
    key: { A: { item: 'minecraft:stone' } },
    result: { item: 'test:result' },
  });

// ---- ItemComponent ----
describe('ItemComponent', () => {
  it('constructs', () => expect(item()).toBeDefined());
  it('emits _meta.type item', () => {
    const j = item().toJSON() as unknown as Json;
    expect(deep(j, '_meta.type')).toBe('item');
  });
  it('emits identifier', () => {
    expect(deep(item().toJSON(), 'minecraft:item.description.identifier')).toBe('test:item');
  });
  it('throws on missing format', () => {
    expect(() => new ItemComponent({ format: '', id: 'test:x', components: {} }).toJSON()).toThrow();
  });
  it('throws on non-namespaced id', () => {
    expect(() => new ItemComponent({ format: FMT, id: 'plain', components: {} }).toJSON()).toThrow('no id');
  });
  it('setGlint does not throw', () => {
    const i = new ItemComponent({ format: FMT, id: 'test:g', components: {} });
    expect(() => i.setGlint(true)).not.toThrow();
  });
});

// ---- BlockComponent ----
describe('BlockComponent', () => {
  it('constructs and emits identifier', () => {
    const b = block();
    const json = b.toJSON() as unknown as Json;
    expect(deep(json, '_meta.type')).toBe('block');
    expect(deep(json, 'minecraft:block.description.identifier')).toBe('test:block');
  });

  const blockFields: Array<[string, (b: BlockComponent) => void, string, unknown]> = [
    ['collision_box', b => b.setCollisionBox({ origin: [-8, 0, -8], size: [16, 16, 16] }), 'origin', [-8, 0, -8]],
    ['geometry', b => b.setGeometry('minecraft:geometry.full_block'), undefined as never, 'minecraft:geometry.full_block'],
    ['loot', b => b.setLoot('loot_tables/empty.json'), undefined as never, 'loot_tables/empty.json'],
    ['redstone_consumer', b => b.setRedstoneConsumer({ min_power: 1 }), 'min_power', 1],
    ['block_entity', b => b.setBlockEntity({ dynamic_properties: true }), 'dynamic_properties', true],
    ['light_emission', b => b.setLightEmission(7), undefined as never, 7],
    ['friction', b => b.setFriction(0.4), undefined as never, 0.4],
    ['map_color', b => b.setMapColor('#ff0000'), undefined as never, '#ff0000'],
    ['sound', b => b.setSound('stone'), undefined as never, 'stone'],
  ];

  for (const [name, apply, subKey, want] of blockFields) {
    it(`sets ${name}`, () => {
      const b = block();
      apply(b);
      const json = b.toJSON() as Json;
      const comps = deep(json, 'minecraft:block.components') as Json;
      const key = `minecraft:${name}`;
      if (subKey !== undefined) {
        expect((comps[key] as Json)[subKey as string]).toEqual(want);
      } else {
        expect(comps[key]).toEqual(want);
      }
    });
  }

  it('emits menu_category', () => {
    const b = new BlockComponent({
      format: '1.26.40',
      id: 'test:b',
      menu_category: { category: 'construction' },
    });
    expect(deep(b.toJSON(), 'minecraft:block.description.menu_category.category')).toBe('construction');
  });

  it('keeps traits verbatim', () => {
    const b = block();
    b.setTraits({ 'minecraft:placement_direction': { enabled_states: ['north'] } });
    const traits = deep(b.toJSON(), 'minecraft:block.description.traits') as Json;
    expect(Object.keys(traits).length).toBeGreaterThan(0);
  });

  it('collects permutations', () => {
    const b = block();
    b.addPermutation('q.state == "north"', {});
    expect((deep(b.toJSON(), 'minecraft:block.permutations') as unknown[]).length).toBe(1);
  });

  it('flattens material instances', () => {
    const b = block();
    b.setMaterialInstances({ all: { texture: 'tex' } });
    expect(
      deep(b.toJSON(), 'minecraft:block.components.minecraft:material_instances.all.texture')
    ).toBe('tex');
  });

  it('writes item visual', () => {
    const b = block();
    b.setItemVisual({ geometry: 'g', material_instances: { '*': { texture: 't' } } });
    expect(
      deep(b.toJSON(), 'minecraft:block.components.minecraft:item_visual.material_instances.*.texture')
    ).toBe('t');
  });

  it('emits direct-key custom components', () => {
    const b = block();
    b.setCustomComponents(['test:ctrl']);
    const json = b.toJSON() as Json;
    const comps = deep(json, 'minecraft:block.components') as Json;
    expect(comps['test:ctrl']).toEqual({});
  });

  it('rejects custom component ids without namespace', () => {
    const b = block();
    b.setCustomComponents(['nocolon']);
    expect(() => b.toJSON()).toThrow('invalid custom component id');
  });

  it('supports selection box', () => {
    const b = block();
    b.setSelectionBox({ origin: [0, 0, 0], size: [8, 8, 8] });
    expect(deep(b.toJSON(), 'minecraft:block.components.minecraft:selection_box.size')).toEqual([8, 8, 8]);
  });

  it('supports light dampening', () => {
    const b = block();
    b.setLightDampening(3);
    expect(deep(b.toJSON(), 'minecraft:block.components.minecraft:light_dampening')).toBe(3);
  });
});

// ---- EntityComponent ----
describe('EntityComponent', () => {
  it('constructs', () => expect(entity()).toBeDefined());
  it('emits _meta.type entity', () => {
    expect(deep(entity().toJSON(), '_meta.type')).toBe('entity');
  });
  it('emits identifier', () => {
    expect(deep(entity().toJSON(), 'minecraft:entity.description.identifier')).toBe('test:e');
  });
  it('rejects invalid formats', () => {
    expect(() => new EntityComponent({ format: 'bad', id: 'test:e' }).toJSON()).toThrow();
  });
});

// ---- other components ----
describe('other components', () => {
  it('exports SpawnRuleComponent as a function', () => {
    expect(typeof SpawnRuleComponent).toBe('function');
  });

  it('exports FeatureRuleComponent as a function', () => {
    expect(typeof FeatureRuleComponent).toBe('function');
  });

  it('exports FeatureComponent as a function', () => {
    expect(typeof FeatureComponent).toBe('function');
  });

  it('exports ItemCatalogComponent as a function', () => {
    expect(typeof ItemCatalogComponent).toBe('function');
  });
});

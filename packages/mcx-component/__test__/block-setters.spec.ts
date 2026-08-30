import { describe, it, expect } from 'vitest';
import { BlockComponent } from '../src/components/block';

type Json = Record<string, unknown>;

function deep(obj: unknown, path: string[]): unknown {
  let cur: unknown = obj;
  for (const key of path) {
    if (cur === null || typeof cur !== 'object') throw new Error(`missing ${path.join('.')}`);
    cur = (cur as Json)[key];
  }
  return cur;
}

const FMT = '1.26.40';
const BC = 'minecraft:block';
const COMP = 'components';
const make = () => new BlockComponent({ format: FMT, id: 'test:block' } as never);

interface Case {
  name: string;
  args: unknown[];
}

const validCases: Case[] = [
  { name: 'setFormat', args: ['1.21.0'] },
  { name: 'setId', args: ['test:block2'] },
  { name: 'setMenuCategory', args: ['construction'] },
  { name: 'setDisplayName', args: ['Demo Block'] },
  { name: 'setLightEmission', args: [7] },
  { name: 'setLightDampening', args: [3] },
  { name: 'setFriction', args: [0.4] },
  { name: 'setLoot', args: ['loot_tables/blocks/demo.json'] },
  { name: 'setDestructibleByExplosion', args: [false] },
  { name: 'setDestructibleByExplosion', args: [{ explosion_resistance: 10 }] },
  { name: 'setDestructibleByMining', args: [false] },
  { name: 'setDestructibleByMining', args: [{ seconds_to_destroy: 2 }] },
  { name: 'setFlammable', args: [false] },
  { name: 'setFlammable', args: [{ catch_chance_modifier: 5, destroy_chance_modifier: 20 }] },
  { name: 'setCollisionBox', args: [false] },
  { name: 'setCollisionBox', args: [{ origin: [-4, 0, -4], size: [8, 8, 8] }] },
  { name: 'setSelectionBox', args: [false] },
  { name: 'setSelectionBox', args: [{ origin: [-4, 0, -4], size: [8, 8, 8] }] },
  { name: 'setGeometry', args: ['minecraft:geometry.full_block'] },
  { name: 'setGeometry', args: [{ identifier: 'minecraft:geometry.full_block' }] },
  { name: 'setMapColor', args: ['#7bb659'] },
  { name: 'setMapColor', args: [{ color: '#7bb659', tint_method: 'multiply' }] },
  { name: 'setCraftingTable', args: [{ crafting_tags: ['crafting_table'], table_name: 'Demo' }] },
  { name: 'setTransformation', args: [{ rotation: [0, 90, 0] }] },
  { name: 'setTransformation', args: [{ rotation: { x: 0, y: 90, z: 0 }, rotation_pivot: [0, 0, 0] }] },
  { name: 'setTick', args: [{ interval_range: [10, 20], looping: true }] },
  { name: 'setRandomOffset', args: [{ x: { range: { min: 0, max: 1 } } }] },
  { name: 'setRandomOffset', args: [{ x: { range: { min: 0, max: 1 }, steps: 4 }, y: { steps: 2 }, z: { steps: 2 } }] },
  { name: 'setMovable', args: [{ movement_type: 'push_pull' }] },
  { name: 'setMovable', args: [{ movement_type: 'immovable', sticky: 'same' }] },
  { name: 'setPlacementFilter', args: [{ conditions: [{ allowed_faces: ['up'], block_filter: ['minecraft:grass'] }] }] },
  { name: 'setRedstoneConductivity', args: [{ redstone_conductor: true }] },
  { name: 'setSupport', args: [{ shape: 'fence' }] },
  { name: 'setSupport', args: [{ shape: 'stair' }] },
  { name: 'setEntityFallOn', args: [{ min_fall_distance: 3 }] },
  { name: 'setReplaceable', args: [] },
  { name: 'setFlowerPottable', args: [] },
  { name: 'setChestObstruction', args: [] },
  { name: 'setIcon', args: ['test_icon'] },
  { name: 'setBreathability', args: ['solid'] },
  { name: 'setDestructionParticles', args: ['particles'] },
  { name: 'setSound', args: ['stone'] },
  { name: 'setTags', args: [['minecraft:stone', 'demo:custom']] },
  { name: 'setCustomComponents', args: [['demo:custom_block']] },
  { name: 'setPermutations', args: [[{ condition: 'q.block_state("demo") == 1', components: { 'minecraft:light_emission': 15 } }]] },
  { name: 'setTraits', args: [{ 'minecraft:placement_position': { enabled_states: ['minecraft:block_face'] } }] },
  { name: 'setMaterialInstances', args: [{ '*': { texture: 'test_texture', render_method: 'opaque' } }] },
  { name: 'setLiquidDetection', args: [{ detection_rules: [{ can_contain_liquid: false }] }] },
];

describe('BlockComponent setter matrix (valid args do not throw and keep JSON valid)', () => {
  it.each(validCases)('$name %j', ({ name, args }) => {
    const block = make();
    expect(() =>
      (block as never as Record<string, (...a: unknown[]) => void>)[name](...args),
    ).not.toThrow();
    expect(() => block.toJSON()).not.toThrow();
  });
});

describe('BlockComponent setter matrix (values are stored)', () => {
  it.each([
    { name: 'setDisplayName', args: ['Demo Block'], path: [BC, COMP, 'minecraft:display_name'], value: 'Demo Block' },
    { name: 'setLightEmission', args: [7], path: [BC, COMP, 'minecraft:light_emission'], value: 7 },
    { name: 'setLightDampening', args: [3], path: [BC, COMP, 'minecraft:light_dampening'], value: 3 },
    { name: 'setFriction', args: [0.4], path: [BC, COMP, 'minecraft:friction'], value: 0.4 },
    { name: 'setLoot', args: ['loot_tables/blocks/demo.json'], path: [BC, COMP, 'minecraft:loot'], value: 'loot_tables/blocks/demo.json' },
    { name: 'setMapColor', args: ['#7bb659'], path: [BC, COMP, 'minecraft:map_color'], value: '#7bb659' },
    { name: 'setSound', args: ['stone'], path: [BC, COMP, 'minecraft:sound'], value: 'stone' },
    { name: 'setDestructibleByExplosion', args: [false], path: [BC, COMP, 'minecraft:destructible_by_explosion'], value: false },
    { name: 'setFlammable', args: [false], path: [BC, COMP, 'minecraft:flammable'], value: false },
    { name: 'setCollisionBox', args: [false], path: [BC, COMP, 'minecraft:collision_box'], value: false },
    { name: 'setSelectionBox', args: [false], path: [BC, COMP, 'minecraft:selection_box'], value: false },
    { name: 'setGeometry', args: ['minecraft:geometry.full_block'], path: [BC, COMP, 'minecraft:geometry'], value: 'minecraft:geometry.full_block' },
    { name: 'setFormat', args: ['1.21.0'], path: ['format_version'], value: '1.21.0' },
  ])('$name stores $path', ({ name, args, path, value }) => {
    const block = make();
    (block as never as Record<string, (...a: unknown[]) => void>)[name](...args);
    expect(deep(block.toJSON() as unknown as Json, path)).toBe(value);
  });
  it.each([
    { name: 'setLightEmission', args: [-1], path: [BC, COMP, 'minecraft:light_emission'], value: -1 },
    { name: 'setFriction', args: [2], path: [BC, COMP, 'minecraft:friction'], value: 2 },
    { name: 'setSupport', args: [{ shape: 'wall' }], path: [BC, COMP, 'minecraft:support', 'shape'], value: 'wall' },
  ])('$name stores raw values without extra validation', ({ name, args, path, value }) => {
    const block = make();
    (block as never as Record<string, (...a: unknown[]) => void>)[name](...args);
    expect(deep(block.toJSON() as unknown as Json, path)).toBe(value);
  });
});

describe('BlockComponent identity', () => {
  it.each(['test:block2', 'demo:multi_word_id', 'a:b'])('setId accepts %s', id => {
    const block = make();
    block.setId(id);
    expect(block.getId()).toBe(id);
  });
  it('emits _meta.type block', () => {
    expect(deep(make().toJSON() as unknown as Json, ['_meta', 'type'])).toBe('block');
  });
  it.each([
    'minecraft:block',
    'minecraft:stone',
  ])('setTags stores tags for block', () => {
    const block = make();
    block.setTags(['minecraft:stone']);
    const j = block.toJSON() as unknown as Json;
    expect(deep(j, [BC, 'components', 'minecraft:tags'])).toBeDefined();
  });
});

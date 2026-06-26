import { describe, it, expect } from 'vitest';
import {
  ItemComponent,
  BlockComponent,
  EntityComponent,
  ParticleTypeEnum,
  SoundEventEnum,
  EnchantableSlotEnum,
  EnchantableSlotArray,
} from '../src/index';
import compareVar from '../src/utils';

describe('ItemComponent', () => {
  it('should throw on missing format', () => {
    const item = new ItemComponent({
      id: 'test:item',
      name: 'Test',
      format: '',
      components: {},
    });
    expect(() => item.toJSON()).toThrow('no format');
  });

  it('should throw on missing id', () => {
    const item = new ItemComponent({
      id: '',
      name: 'Test',
      format: '1.21.0',
      components: {},
    });
    expect(() => item.toJSON()).toThrow('no id');
  });

  it('should create valid item JSON', () => {
    const item = new ItemComponent({
      id: 'test:item',
      name: 'Test Item',
      format: '1.21.0',
      components: {
        damage: 5,
        offHand: true,
      },
    });
    const json = item.toJSON();
    expect(json['minecraft:item'].description.identifier).toBe('test:item');
    expect(json['minecraft:item'].components['minecraft:damage'].value).toBe(5);
    expect(
      json['minecraft:item'].components['minecraft:allow_off_hand'].value,
    ).toBe(true);
  });
});

describe('BlockComponent', () => {
  it('should throw on missing format', () => {
    const block = new BlockComponent({ id: 'test:block', format: '' });
    expect(() => block.toJSON()).toThrow('no format');
  });

  it('should throw on missing id', () => {
    const block = new BlockComponent({ id: '', format: '1.21.0' });
    expect(() => block.toJSON()).toThrow('no id');
  });

  it('should create valid block JSON with components', () => {
    const block = new BlockComponent({
      id: 'test:block',
      format: '1.21.0',
      components: {
        display_name: 'Test Block',
        light_emission: 12,
        light_dampening: 15,
        friction: 0.6,
        destructible_by_explosion: { explosion_resistance: 30 },
        destructible_by_mining: { seconds_to_destroy: 3 },
        flammable: { catch_chance_modifier: 10, destroy_chance_modifier: 15 },
        collision_box: true,
        selection_box: { origin: [-8, 0, -8], size: [16, 16, 16] },
        geometry: 'geometry.test_block',
        material_instances: {
          '*': { texture: 'test_block', render_method: 'opaque' },
        },
        map_color: '#ff0000',
        crafting_table: {
          crafting_tags: ['crafting_table'],
          table_name: 'Test Workbench',
        },
        tick: { interval_range: [20, 60], looping: true },
        random_offset: { x: { range: { min: -2, max: 2 }, steps: 1 } },
        movable: { movement_type: 'immovable' },
        redstone_conductivity: { redstone_conductor: true },
        redstone_consumer: { min_power: 1, propagates_power: false },
        redstone_producer: { power: 15, connected_faces: ['up'] },
        support: { shape: 'fence' },
        connection_rule: {
          accepts_connections_from: 'all',
          enabled_directions: ['north', 'south'],
        },
        liquid_detection: {
          can_contain_liquid: true,
          on_liquid_touches: 'blocking',
        },
        precipitation_interactions: { precipitation_behavior: 'snowlogging' },
        entity_fall_on: { minimum_fall_distance: 2 },
        replaceable: {},
        flower_pottable: {},
        chest_obstruction: {},
        transformation: { rotation: [0, 90, 0], scale: [1, 1, 1] },
      },
    });
    const json = block.toJSON();
    expect(json['minecraft:block'].description.identifier).toBe('test:block');
    expect(json['minecraft:block'].components['minecraft:display_name']).toBe(
      'Test Block',
    );
    expect(json['minecraft:block'].components['minecraft:light_emission']).toBe(
      12,
    );
    expect(
      (json['minecraft:block'].components['minecraft:crafting_table'] || {})
        .crafting_tags,
    ).toContain('crafting_table');
  });
});

describe('EntityComponent', () => {
  it('should throw on missing format', () => {
    const entity = new EntityComponent({ id: 'test:entity', format: '' });
    expect(() => entity.toJSON()).toThrow('no format');
  });

  it('should create valid entity JSON', () => {
    const entity = new EntityComponent({
      id: 'test:entity',
      format: '1.21.0',
      is_spawnable: true,
      is_summonable: true,
    });
    const json = entity.toJSON();
    expect(json['minecraft:entity'].description.identifier).toBe('test:entity');
    expect(json['minecraft:entity'].description.is_spawnable).toBe(true);
    expect(json['minecraft:entity'].description.is_summonable).toBe(true);
  });
});

describe('enums', () => {
  it('should export ParticleTypeEnum', () => {
    expect(ParticleTypeEnum).toContain('explode');
    expect(ParticleTypeEnum).toContain('flame');
  });

  it('should export SoundEventEnum', () => {
    expect(SoundEventEnum).toContain('explode');
    expect(SoundEventEnum).toContain('ambient.cave');
  });

  it('should export EnchantableSlotEnum', () => {
    expect(EnchantableSlotEnum).toContain('sword');
    expect(EnchantableSlotEnum).toContain('bow');
  });

  it('should export EnchantableSlotArray', () => {
    expect(EnchantableSlotArray).toContain('all');
    expect(EnchantableSlotArray).toContain('armor_head');
  });
});

describe('compareVar', () => {
  it('should return 0 for equal versions', () => {
    expect(compareVar('1.0.0', '1.0.0')).toBe(0);
  });

  it('should return 1 when first is greater', () => {
    expect(compareVar('2.0.0', '1.0.0')).toBe(1);
  });

  it('should return -1 when first is smaller', () => {
    expect(compareVar('1.0.0', '2.0.0')).toBe(-1);
  });

  it('should handle partial versions', () => {
    expect(compareVar('1', '2')).toBe(-1);
  });

  it('should handle null/undefined inputs', () => {
    expect(() => compareVar(null as unknown as string, '1.0.0')).not.toThrow();
  });
});

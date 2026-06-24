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

describe('ItemComponent', () => {
  it('should throw on missing format', () => {
    const item = new ItemComponent({ id: 'test:item', name: 'Test', format: '', components: {} });
    expect(() => item.toJSON()).toThrow('no format');
  });

  it('should throw on missing id', () => {
    const item = new ItemComponent({ id: '', name: 'Test', format: '1.21.0', components: {} });
    expect(() => item.toJSON()).toThrow('cno id');
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
    expect(json['minecraft:item'].components['minecraft:allow_off_hand'].value).toBe(true);
  });
});

describe('BlockComponent', () => {
  it('should return empty JSON', () => {
    const block = new BlockComponent();
    expect(block.toJSON()).toEqual({});
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

import { describe, it, expect } from 'vitest';
import { EntityComponent } from '../src/components/entity';

type Json = Record<string, unknown>;

function deep(obj: unknown, path: string[]): unknown {
  let cur: unknown = obj;
  for (const key of path) {
    if (cur === null || typeof cur !== 'object') throw new Error(`missing ${path.join('.')}`);
    cur = (cur as Json)[key];
  }
  return cur;
}

const FMT = '1.21.0';
const EE = 'minecraft:entity';
const EC = 'components';
const make = () => new EntityComponent({ format: FMT, id: 'test:e' } as never);

// 无参 boolean 组件 setter
const flagCases = [
  'setAnnotationOpenDoor',
  'setBlockClimber',
  'setBodyRotationAxisAligned',
  'setBodyRotationAlwaysFollowsHead',
  'setBodyRotationBlocked',
  'setBodyRotationLockedToVehicle',
  'setCannotBeAttacked',
  'setCanClimb',
  'setCanFly',
  'setCanJoinRaid',
  'setCanPowerJump',
] as const;

describe('EntityComponent flag setters', () => {
  it.each(flagCases)('%s() emits a component entry', name => {
    const entity = make();
    expect(() =>
      (entity as never as Record<string, () => void>)[name]!(),
    ).not.toThrow();
    const j = entity.toJSON() as unknown as Json;
    expect(Object.keys(deep(j, [EE, EC]) as Record<string, unknown>).length).toBeGreaterThanOrEqual(1);
    expect(() => entity.toJSON()).not.toThrow();
  });

  it.each([
    { name: 'setCanClimb', key: 'minecraft:can_climb' },
    { name: 'setCanFly', key: 'minecraft:can_fly' },
    { name: 'setCanPowerJump', key: 'minecraft:can_power_jump' },
    { name: 'setCannotBeAttacked', key: 'minecraft:cannot_be_attacked' },
    { name: 'setBlockClimber', key: 'minecraft:block_climber' },
    { name: 'setBodyRotationBlocked', key: 'minecraft:body_rotation_blocked' },
  ])('$name stores $key', ({ name, key }) => {
    const entity = make();
    (entity as never as Record<string, () => void>)[name]!();
    expect(deep(entity.toJSON() as unknown as Json, [EE, EC, key])).toBeDefined();
  });

  it.each([
    { name: 'setIsSpawnable', args: [true], key: 'is_spawnable', value: true },
    { name: 'setIsSpawnable', args: [false], key: 'is_spawnable', value: false },
    { name: 'setIsSummonable', args: [true], key: 'is_summonable', value: true },
    { name: 'setIsSummonable', args: [false], key: 'is_summonable', value: false },
    { name: 'setIsExperimental', args: [true], key: 'is_experimental', value: true },
    { name: 'setIsExperimental', args: [false], key: 'is_experimental', value: false },
  ])('$name(%j) stores description.$key', ({ name, args, key, value }) => {
    const entity = make();
    (entity as never as Record<string, (...a: unknown[]) => void>)[name]!(...args);
    expect(deep(entity.toJSON() as unknown as Json, [EE, 'description', key])).toBe(value);
  });
});

describe('EntityComponent identity', () => {
  it.each(['test:zombie', 'demo:multi_part', 'a:b'])('accepts namespaced id %s', id => {
    const entity = new EntityComponent({ format: FMT, id } as never);
    expect(deep(entity.toJSON() as unknown as Json, [EE, 'description', 'identifier'])).toBe(id);
  });
  it.each(['plain', ':x', 'x:'])('rejects id %s', id => {
    expect(() => new EntityComponent({ format: FMT, id } as never).toJSON()).toThrow();
  });
  it.each(['1.21.0', '1.21.100', '1.26.40'])('accepts format %s', format => {
    expect(() => new EntityComponent({ format, id: 'test:e' } as never).toJSON()).not.toThrow();
  });
  it.each(['', '21.0', 'a.b.c', '1.2'])('rejects format %s', format => {
    expect(() => new EntityComponent({ format, id: 'test:e' } as never).toJSON()).toThrow();
  });
  it('emits _meta.type entity', () => {
    expect(deep(make().toJSON() as unknown as Json, ['_meta', 'type'])).toBe('entity');
  });
});

describe('EntityComponent physics config (setPhysics regression)', () => {
  it('setPhysics emits minecraft:physics config in toJSON', () => {
    const entity = new EntityComponent({ format: '1.21.0', id: 'test:e' } as never);
    entity.setPhysics({ has_gravity: false, has_collision: false });
    const j = entity.toJSON() as unknown as Json;
    expect(deep(j, [EE, EC, 'minecraft:physics', 'has_gravity'])).toBe(false);
    expect(deep(j, [EE, EC, 'minecraft:physics', 'has_collision'])).toBe(false);
  });
  it('physics: boolean shorthand still emits empty physics component', () => {
    const entity = new EntityComponent({
      format: '1.21.0',
      id: 'test:e',
      components: { physics: true },
    } as never);
    const j = entity.toJSON() as unknown as Json;
    expect(deep(j, [EE, EC, 'minecraft:physics'])).toEqual({});
  });
  it('physics config alone counts as a component (hasComponents chain)', () => {
    const entity = new EntityComponent({ format: '1.21.0', id: 'test:e' } as never);
    entity.setPhysics({ has_gravity: false });
    const j = entity.toJSON() as unknown as Json;
    expect(deep(j, [EE, EC, 'minecraft:physics'])).toBeDefined();
  });
});

describe('EntityComponent docs gap-fill', () => {
  it('passthrough emits new entity components from options', () => {
    const entity = new EntityComponent({
      format: FMT,
      id: 'test:e',
      components: {
        'minecraft:type_family': { family: ['mushroom_man', 'mob'] },
        'minecraft:pushable': { is_pushable: true, is_pushable_by_piston: true },
        'minecraft:knockback_resistance': { value: 0.1 },
        'minecraft:jump.strength': { value: 0.42 },
        'minecraft:scale': { value: 1.5 },
      },
    } as never);
    const j = entity.toJSON() as unknown as Json;
    expect(deep(j, [EE, EC, 'minecraft:type_family', 'family'])).toEqual(['mushroom_man', 'mob']);
    expect(deep(j, [EE, EC, 'minecraft:pushable', 'is_pushable'])).toBe(true);
    expect(deep(j, [EE, EC, 'minecraft:knockback_resistance', 'value'])).toBe(0.1);
    expect(deep(j, [EE, EC, 'minecraft:jump.strength', 'value'])).toBe(0.42);
    expect(deep(j, [EE, EC, 'minecraft:scale', 'value'])).toBe(1.5);
  });

  it('passthrough emits minecraft:behavior.* goals', () => {
    const entity = new EntityComponent({
      format: FMT,
      id: 'test:e',
      components: {
        'minecraft:behavior.float': { priority: 0 },
        'minecraft:behavior.melee_attack': { priority: 3, speed_multiplier: 1.1 },
        'minecraft:behavior.hurt_by_player': { priority: 4 },
      },
    } as never);
    const j = entity.toJSON() as unknown as Json;
    expect(deep(j, [EE, EC, 'minecraft:behavior.float', 'priority'])).toBe(0);
    expect(deep(j, [EE, EC, 'minecraft:behavior.melee_attack', 'speed_multiplier'])).toBe(1.1);
    expect(deep(j, [EE, EC, 'minecraft:behavior.hurt_by_player', 'priority'])).toBe(4);
  });

  it('entity with only a behavior goal still gets a components section', () => {
    const entity = new EntityComponent({
      format: FMT,
      id: 'test:e',
      components: { 'minecraft:behavior.float': { priority: 0 } },
    } as never);
    const j = entity.toJSON() as unknown as Json;
    expect(deep(j, [EE, EC, 'minecraft:behavior.float'])).toBeDefined();
  });

  it('passthrough does not clobber explicitly copied components', () => {
    const entity = new EntityComponent({
      format: FMT,
      id: 'test:e',
      components: {
        'minecraft:health': { value: 10, max: 10 },
        'minecraft:physics': { has_gravity: false },
      },
    } as never);
    const j = entity.toJSON() as unknown as Json;
    expect(deep(j, [EE, EC, 'minecraft:health', 'value'])).toBe(10);
    expect(deep(j, [EE, EC, 'minecraft:physics', 'has_gravity'])).toBe(false);
  });

  it('setTypeFamily stores minecraft:type_family', () => {
    const entity = make();
    entity.setTypeFamily({ family: ['mob'] });
    expect(deep(entity.toJSON() as unknown as Json, [EE, EC, 'minecraft:type_family', 'family'])).toEqual(['mob']);
    expect(() => entity.setTypeFamily({ family: [1] as never })).toThrow();
    expect(() => entity.setTypeFamily(null as never)).toThrow();
  });

  it('setPushable stores minecraft:pushable', () => {
    const entity = make();
    entity.setPushable({ is_pushable: true, is_pushable_by_piston: false });
    const j = entity.toJSON() as unknown as Json;
    expect(deep(j, [EE, EC, 'minecraft:pushable', 'is_pushable'])).toBe(true);
    expect(deep(j, [EE, EC, 'minecraft:pushable', 'is_pushable_by_piston'])).toBe(false);
    expect(() => entity.setPushable({ is_pushable: 'yes' as never })).toThrow();
  });

  it('setJumpStrength stores minecraft:jump.strength', () => {
    const entity = make();
    entity.setJumpStrength({ value: 0.42 });
    expect(deep(entity.toJSON() as unknown as Json, [EE, EC, 'minecraft:jump.strength', 'value'])).toBe(0.42);
    expect(() => entity.setJumpStrength({ value: 'x' as never })).toThrow();
  });

  it('setKnockbackResistance stores minecraft:knockback_resistance', () => {
    const entity = make();
    entity.setKnockbackResistance({ value: 0.5 });
    expect(
      deep(entity.toJSON() as unknown as Json, [EE, EC, 'minecraft:knockback_resistance', 'value']),
    ).toBe(0.5);
    expect(() => entity.setKnockbackResistance({ value: 'x' as never })).toThrow();
  });

  it('setBehavior stores a behavior goal and validates the name', () => {
    const entity = make();
    entity.setBehavior('minecraft:behavior.random_stroll', { priority: 6, speed_multiplier: 0.8 });
    expect(
      deep(entity.toJSON() as unknown as Json, [EE, EC, 'minecraft:behavior.random_stroll', 'priority']),
    ).toBe(6);
    expect(() => entity.setBehavior('minecraft:health', {})).toThrow();
    expect(() => entity.setBehavior('behavior.float', {})).toThrow();
    expect(() => entity.setBehavior('minecraft:behavior.float', null as never)).toThrow();
  });
});

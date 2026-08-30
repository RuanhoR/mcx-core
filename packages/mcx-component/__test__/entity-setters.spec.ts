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
      (entity as never as Record<string, () => void>)[name](),
    ).not.toThrow();
    const j = entity.toJSON() as unknown as Json;
    expect(Object.keys(deep(j, [EE, EC])).length).toBeGreaterThanOrEqual(1);
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
    (entity as never as Record<string, () => void>)[name]();
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
    (entity as never as Record<string, (...a: unknown[]) => void>)[name](...args);
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

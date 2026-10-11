import { describe, it, expect } from 'vitest';
import { ItemComponent } from '../src/components/item';
import { BlockComponent } from '../src/components/block';
import { EntityComponent } from '../src/components/entity';

type Json = Record<string, unknown>;

const deep = (obj: unknown, path: string[]): unknown => {
  let cur: unknown = obj;
  for (const key of path) {
    if (cur === null || typeof cur !== 'object') throw new Error(`missing ${path.join('.')}`);
    cur = (cur as Json)[key];
  }
  return cur;
};

const item = (components: Record<string, unknown>, format = '1.26.40') =>
  new ItemComponent({
    format,
    id: 'test:item',
    components: components as never,
  });

const itemJson = (components: Record<string, unknown>, format?: string) =>
  item(components, format).toJSON() as unknown as Json;

describe('item: minecraft:icon forms', () => {
  it('accepts a bare texture id', () => {
    expect(deep(itemJson({ icon: 'apple' }), ['minecraft:item', 'components', 'minecraft:icon'])).toBe('apple');
  });
  it('accepts the deprecated { texture } object', () => {
    expect(deep(itemJson({ icon: { texture: 'apple' } }), ['minecraft:item', 'components', 'minecraft:icon'])).toEqual({
      texture: 'apple',
    });
  });
  it('accepts the { textures: { default } } object', () => {
    expect(
      deep(itemJson({ icon: { textures: { default: 'bundle_black' } } }), [
        'minecraft:item',
        'components',
        'minecraft:icon',
      ]),
    ).toEqual({ textures: { default: 'bundle_black' } });
  });
  it('rejects shapes with no texture key', () => {
    expect(() => itemJson({ icon: { nope: 1 } })).toThrow('icon');
    expect(() => itemJson({ icon: '' })).toThrow('icon');
  });
});

describe('item: use_modifiers', () => {
  it('emits emit_vibrations, not has_vibration', () => {
    const comps = deep(
      itemJson({
        'minecraft:use_modifiers': { use_duration: 1.6, emit_vibrations: false },
      }),
      ['minecraft:item', 'components', 'minecraft:use_modifiers'],
    ) as Json;
    expect(comps.emit_vibrations).toBe(false);
    expect(comps).not.toHaveProperty('has_vibration');
  });
  it('emits start_sound and start_using', () => {
    const comps = deep(
      itemJson({
        'minecraft:use_modifiers': {
          use_duration: 1.6,
          start_sound: 'mob.sheep.sheared',
          start_using: 'on_attack',
        },
      }),
      ['minecraft:item', 'components', 'minecraft:use_modifiers'],
    ) as Json;
    expect(comps.start_sound).toBe('mob.sheep.sheared');
    expect(comps.start_using).toBe('on_attack');
  });
  it('rejects an unknown start_using', () => {
    expect(() =>
      itemJson({
        'minecraft:use_modifiers': { use_duration: 1, start_using: 'sometimes' },
      }),
    ).toThrow('start_using');
  });
});

describe('item: swing_sounds', () => {
  it('emits the three documented props', () => {
    const comps = deep(
      itemJson(
        {
          'minecraft:swing_sounds': {
            attack_critical_hit: 'attack.critical',
            attack_hit: 'attack.strong',
            attack_miss: 'attack.nodamage',
          },
        },
        '1.21.130',
      ),
      ['minecraft:item', 'components', 'minecraft:swing_sounds'],
    ) as Json;
    expect(comps).toEqual({
      attack_critical_hit: 'attack.critical',
      attack_hit: 'attack.strong',
      attack_miss: 'attack.nodamage',
    });
  });
  it('no longer requires an undocumented `sound` prop', () => {
    expect(() => itemJson({ 'minecraft:swing_sounds': {} }, '1.21.130')).toThrow(
      'at least one of attack_critical_hit',
    );
  });
  it('requires format 1.21.130', () => {
    expect(() => itemJson({ 'minecraft:swing_sounds': { attack_hit: 'attack.strong' } }, '1.21.0')).toThrow(
      '1.21.130',
    );
  });
});

describe('item: version gates actually fire', () => {
  it('rejects rarity below 1.21.30 and accepts it at 1.21.30', () => {
    expect(() => itemJson({ 'minecraft:rarity': { value: 'rare' } }, '1.21.0')).toThrow(
      'rarity component requires format version 1.21.30',
    );
    expect(() => itemJson({ 'minecraft:rarity': { value: 'rare' } }, '1.21.30')).not.toThrow();
  });
  it('rejects shooter below 1.16.100', () => {
    const ammo = { ammunition: [{ item: 'minecraft:arrow' }] };
    expect(() => itemJson({ 'minecraft:shooter': ammo }, '1.16.0')).toThrow('1.16.100');
    expect(() => itemJson({ 'minecraft:shooter': ammo }, '1.16.100')).not.toThrow();
  });
  it('rejects seed below 1.10.0', () => {
    expect(() => itemJson({ 'minecraft:seed': { crop_result: 'a:b' } }, '1.9.0')).toThrow('1.10.0');
    expect(() => itemJson({ 'minecraft:seed': { crop_result: 'a:b' } }, '1.10.0')).not.toThrow();
  });
  it('rejects compostable below 1.21.60 and bundle_interaction below 1.21.40', () => {
    expect(() => itemJson({ compostable: { composting_chance: 50 } }, '1.21.40')).toThrow(
      'compostable component requires format version 1.21.60',
    );
    expect(() => itemJson({ bundle_interaction: {} }, '1.21.30')).toThrow(
      'bundle_interaction component requires format version 1.21.40',
    );
  });
  it('rejects storage_item below 1.21.40 and block_placer below 1.21.50', () => {
    expect(() => itemJson({ storage_item: { max_slots: 27 } }, '1.21.30')).toThrow(
      'storage_item component requires format version 1.21.40',
    );
    expect(() => itemJson({ block_placer: { block: 'a:b' } }, '1.21.40')).toThrow(
      'block_placer component requires format version 1.21.50',
    );
  });
});

describe('item: storage components', () => {
  it('uses max_weight_limit on storage_weight_limit', () => {
    const it = item({}, '1.21.110');
    it.setStorageWeightLimit({ max_weight_limit: 64 });
    expect(
      deep(it.toJSON() as unknown as Json, [
        'minecraft:item',
        'components',
        'minecraft:storage_weight_limit',
        'max_weight_limit',
      ]),
    ).toBe(64);
  });
  it('rejects an out-of-range max_weight_limit', () => {
    const it = item({}, '1.21.110');
    expect(() => it.setStorageWeightLimit({ max_weight_limit: 0 })).toThrow('max_weight_limit');
    expect(() => it.setStorageWeightLimit({ max_weight_limit: 65 })).toThrow('max_weight_limit');
  });
  it('does not put weight fields on storage_item', () => {
    const comps = deep(
      itemJson({ 'minecraft:storage_item': { max_slots: 27 } }, '1.21.110'),
      ['minecraft:item', 'components', 'minecraft:storage_item'],
    ) as Json;
    expect(comps).not.toHaveProperty('max_weight_limit');
    expect(comps).not.toHaveProperty('weight_in_storage_item');
  });
  it('enforces the documented minimum versions', () => {
    expect(() =>
      itemJson({ 'minecraft:storage_weight_limit': { max_weight_limit: 64 } }, '1.21.40'),
    ).toThrow('1.21.110');
    expect(() =>
      itemJson({ 'minecraft:storage_weight_modifier': { weight_in_storage_item: 4 } }, '1.21.40'),
    ).toThrow('1.21.110');
  });
});

describe('item: no entity components leak into item files', () => {
  it('drops minecraft:knockback_resistance', () => {
    const comps = deep(
      itemJson({ 'minecraft:knockback_resistance': { value: 0.5 } }),
      ['minecraft:item', 'components'],
    ) as Json;
    expect(comps).not.toHaveProperty('minecraft:knockback_resistance');
  });
});

describe('item: shooter ammunition', () => {
  it('accepts the documented search_inventory/use_in_creative/use_offhand', () => {
    const ammo = deep(
      itemJson({
        'minecraft:shooter': {
          ammunition: [
            {
              item: 'minecraft:arrow',
              search_inventory: true,
              use_in_creative: true,
              use_offhand: false,
            },
          ],
        },
      }),
      ['minecraft:item', 'components', 'minecraft:shooter', 'ammunition', '0'],
    ) as Json;
    expect(ammo).toEqual({
      item: 'minecraft:arrow',
      search_inventory: true,
      use_in_creative: true,
      use_offhand: false,
    });
  });
});

describe('item: repairable repair_amount', () => {
  it('accepts the legacy molang expression object', () => {
    const comps = deep(
      itemJson({
        'minecraft:repairable': {
          repair_items: [
            {
              items: ['minecraft:iron_ingot'],
              repair_amount: { expression: 'q.remaining_durability + 50', version: 1 },
            },
          ],
        },
      }),
      ['minecraft:item', 'components', 'minecraft:repairable', 'repair_items', '0', 'repair_amount'],
    );
    expect(comps).toEqual({ expression: 'q.remaining_durability + 50', version: 1 });
  });
  it('still accepts a plain decimal', () => {
    const comps = deep(
      itemJson({
        'minecraft:repairable': { repair_items: [{ items: ['a:b'], repair_amount: 100 }] },
      }),
      ['minecraft:item', 'components', 'minecraft:repairable', 'repair_items', '0', 'repair_amount'],
    );
    expect(comps).toBe(100);
  });
});

describe('item: wearable slot enum', () => {
  it('accepts the documented slots', () => {
    for (const slot of [
      'slot.armor.head',
      'slot.armor.chest',
      'slot.armor.legs',
      'slot.armor.feet',
      'slot.armor.body',
      'slot.weapon.mainhand',
      'slot.weapon.offhand',
    ]) {
      expect(() => itemJson({ 'minecraft:wearable': { slot } })).not.toThrow();
    }
  });
  it('rejects the undocumented slots the old code allowed', () => {
    for (const slot of ['slot.hotbar', 'slot.inventory', 'slot.saddle', 'slot.chest']) {
      expect(() => itemJson({ 'minecraft:wearable': { slot } })).toThrow('not a valid slot');
    }
  });
});

describe('item: seed plant_at_face', () => {
  it('accepts all six documented faces', () => {
    for (const face of ['UP', 'DOWN', 'NORTH', 'SOUTH', 'EAST', 'WEST']) {
      expect(() =>
        itemJson({ 'minecraft:seed': { crop_result: 'wheat', plant_at_face: face } }, '1.18.0'),
      ).not.toThrow();
    }
  });
  it('rejects anything else', () => {
    expect(() =>
      itemJson({ 'minecraft:seed': { crop_result: 'wheat', plant_at_face: 'SIDEWAYS' } }, '1.18.0'),
    ).toThrow('plant_at_face');
  });
});

describe('item: render_offsets', () => {
  it('is emitted when provided', () => {
    expect(
      deep(
        itemJson({ 'minecraft:render_offsets': { main_hand: { x: 0.1 } } }),
        ['minecraft:item', 'components', 'minecraft:render_offsets'],
      ),
    ).toEqual({ main_hand: { x: 0.1 } });
  });
});

describe('entity: description, groups and events', () => {
  const entity = (extra: Record<string, unknown>) =>
    new EntityComponent({
      format: '1.21.0',
      id: 'test:e',
      ...extra,
    } as never);

  it('emits runtime_identifier, animations, scripts and spawn_category', () => {
    const json = entity({
      runtime_identifier: 'minecraft:zombie',
      animations: { 'animation.a': { animation: 'a' } },
      scripts: { animate: ['animation.a'] },
      spawn_category: 'misc',
    }).toJSON() as unknown as Json;
    const desc = deep(json, ['minecraft:entity', 'description']) as Json;
    expect(desc.runtime_identifier).toBe('minecraft:zombie');
    expect(desc.animations).toEqual({ 'animation.a': { animation: 'a' } });
    expect(desc.scripts).toEqual({ animate: ['animation.a'] });
    expect(desc.spawn_category).toBe('misc');
  });
  it('rejects an unknown spawn_category', () => {
    expect(() => entity({ spawn_category: 'dragon' }).toJSON()).toThrow('unknown spawn_category');
  });
  it('emits component_groups and events', () => {
    const json = entity({
      component_groups: { g: { 'minecraft:variant': { value: 1 } } },
      events: { e: { sequence: [{ add: { component_groups: ['g'] } }] } },
    }).toJSON() as unknown as Json;
    expect(deep(json, ['minecraft:entity', 'component_groups', 'g'])).toEqual({
      'minecraft:variant': { value: 1 },
    });
    expect(deep(json, ['minecraft:entity', 'events', 'e'])).toEqual({
      sequence: [{ add: { component_groups: ['g'] } }],
    });
  });
  it('rejects non-object groups/events', () => {
    expect(() => entity({ component_groups: { g: 'nope' } }).toJSON()).toThrow('component_groups');
    expect(() => entity({ events: { e: [] } }).toJSON()).toThrow('events');
  });
});

describe('entity: minecraft:offspring', () => {
  it('emits the documented field set', () => {
    const json = new EntityComponent({
      format: '1.21.0',
      id: 'test:e',
      components: {
        'minecraft:offspring': {
          offspring_pairs: { 'minecraft:chicken': 'minecraft:chicken' },
          property_inheritance: { 'minecraft:climate_variant': {} },
          inherit_tamed: true,
          blend_attributes: false,
          deny_parents_variant: [{ chance: 0.5, max_variant: 2, min_variant: 1 }],
          mutation_factor: [{ color: 0.1, extra_variant: 0.2, variant: 0.3 }],
          parent_centric_attribute_blending: ['health', 'movement'],
          random_variant_mutation_interval: { min: 0, max: 100 },
          random_extra_variant_mutation_interval: { min: 0, max: 100 },
        },
      },
    } as never).toJSON() as unknown as Json;
    expect(deep(json, ['minecraft:entity', 'components', 'minecraft:offspring'])).toEqual({
      offspring_pairs: { 'minecraft:chicken': 'minecraft:chicken' },
      property_inheritance: { 'minecraft:climate_variant': {} },
      inherit_tamed: true,
      blend_attributes: false,
      deny_parents_variant: [{ chance: 0.5, max_variant: 2, min_variant: 1 }],
      mutation_factor: [{ color: 0.1, extra_variant: 0.2, variant: 0.3 }],
      parent_centric_attribute_blending: ['health', 'movement'],
      random_variant_mutation_interval: { min: 0, max: 100 },
      random_extra_variant_mutation_interval: { min: 0, max: 100 },
    });
  });
  it('no longer emits the undocumented fields', () => {
    const json = new EntityComponent({
      format: '1.21.0',
      id: 'test:e',
      components: {
        'minecraft:offspring': {
          born_event: 'a',
          breed_event: 'b',
          breed_items: [{ item: 'minecraft:wheat' }],
          cooldown: 30,
          grow_up_duration: 10,
          variants: { type: 1 },
        },
      },
    } as never).toJSON() as unknown as Json;
    const comps = deep(json, [
      'minecraft:entity',
      'components',
      'minecraft:offspring',
    ]) as Json;
    for (const key of [
      'born_event',
      'breed_event',
      'breed_items',
      'cooldown',
      'grow_up_duration',
      'variants',
      'initial_variant',
      'num_variants',
      'inheritance_chance',
      'should_baby_face_parent',
      'delayed_growth',
    ]) {
      expect(comps).not.toHaveProperty(key);
    }
  });
});

describe('entity: namespaced and documented component keys', () => {
  const build = (components: Record<string, unknown>) =>
    new EntityComponent({
      format: '1.21.0',
      id: 'test:e',
      components,
    } as never).toJSON() as unknown as Json;

  it('reaches addrider through the namespaced key', () => {
    const json = build({ 'minecraft:addrider': { entity_type: 'minecraft:pig' } });
    expect(deep(json, ['minecraft:entity', 'components', 'minecraft:addrider', 'entity_type'])).toBe(
      'minecraft:pig',
    );
  });
  it('emits minecraft:movement_sound_distance_offset, not the dotted spelling', () => {
    const json = build({ 'minecraft:movement_sound_distance_offset': { value: 2 } });
    const comps = deep(json, ['minecraft:entity', 'components']) as Json;
    expect(comps['minecraft:movement_sound_distance_offset']).toEqual({ value: 2 });
    expect(comps).not.toHaveProperty('minecraft:movement.sound_distance_offset');
  });
  it('passes through attack_damage, trade_resupply, trust and scaffolding_climber', () => {
    const comps = deep(
      build({
        'minecraft:attack_damage': { value: { min: 1, max: 3 } },
        'minecraft:trust': { trust_player: true },
        'minecraft:trade_resupply': {},
        'minecraft:scaffolding_climber': {},
      }),
      ['minecraft:entity', 'components'],
    ) as Json;
    expect(comps['minecraft:attack_damage']).toEqual({ value: { min: 1, max: 3 } });
    expect(comps['minecraft:trust']).toEqual({ trust_player: true });
    expect(comps['minecraft:trade_resupply']).toEqual({});
    expect(comps['minecraft:scaffolding_climber']).toEqual({});
  });
});

describe('entity: interact interaction entries', () => {
  it('accepts the documented array / object shapes', () => {
    const e = new EntityComponent({ format: '1.21.0', id: 'test:e' });
    expect(() =>
      e.setInteract({
        interactions: [
          {
            play_sounds: ['mob.pig.ambient'],
            spawn_entities: ['minecraft:zombie'],
            particle_on_start: { particle_type: 'heart' },
            repair_entity_item: { amount: 5 },
            spawn_items: { table: 'loot_tables/x.json' },
            add_items: { table: 'loot_tables/y.json' },
            admire: true,
            barter: true,
            cooldown: 2,
            health_amount: 4,
            drop_item_slot: 'slot.weapon.mainhand',
            equip_item_slot: 1,
            drop_item_y_offset: 1,
            on_interact: { event: 'a', target: 'self' },
          },
        ],
      }),
    ).not.toThrow();
  });
  it('rejects the array shapes the old code required', () => {
    const e = new EntityComponent({ format: '1.21.0', id: 'test:e' });
    expect(() =>
      e.setInteract({ interactions: [{ particle_on_start: [] as never }] }),
    ).toThrow('must be an object');
    expect(() =>
      e.setInteract({ interactions: [{ play_sounds: 'a' as never }] }),
    ).toThrow('array of strings');
    expect(() =>
      e.setInteract({ interactions: [{ spawn_entities: 'a' as never }] }),
    ).toThrow('array of strings');
  });
});

describe('entity: attack, breedable, leashable', () => {
  const e = () => new EntityComponent({ format: '1.21.0', id: 'test:e' });

  it('accepts attack effect_amplifier', () => {
    const entity = e();
    entity.setAttack({
      damage: 5,
      effect_name: 'minecraft:poison',
      effect_duration: 3,
      effect_amplifier: 2,
    });
    const comps = deep(
      entity.toJSON() as unknown as Json,
      ['minecraft:entity', 'components', 'minecraft:attack'],
    ) as Json;
    expect(comps.effect_amplifier).toBe(2);
  });
  it('rejects a non-integer effect_amplifier', () => {
    expect(() => e().setAttack({ effect_amplifier: 1.5 })).toThrow('effect_amplifier');
  });
  it('accepts breedable combine_parent_colors and integer variant bounds', () => {
    const entity = e();
    expect(() =>
      entity.setBreedable({
        combine_parent_colors: true,
        deny_parents_variant: { chance: 0.5, max_variant: 2, min_variant: 1 },
      }),
    ).not.toThrow();
  });
  it('accepts leashable unleash flags and the full preset shape', () => {
    const entity = e();
    expect(() =>
      entity.setLeashable({
        on_unleash_interact_only: true,
        unleash_on_removal: false,
        presets: [
          {
            filter: { subject: 'other', test: 'is_family', value: 'happy_ghast' },
            hard_distance: 4,
            max_distance: 12,
            rotation_adjustment: 90,
            soft_distance: 2,
            spring_type: 'quad_dampened',
          },
        ],
      }),
    ).not.toThrow();
    expect(() => e().setLeashableTo({ unleash_on_removal: false })).not.toThrow();
  });
  it('accepts knockback_resistance max', () => {
    const entity = e();
    entity.setKnockbackResistance({ value: 1, max: 100 });
    const comps = deep(
      entity.toJSON() as unknown as Json,
      ['minecraft:entity', 'components', 'minecraft:knockback_resistance'],
    ) as Json;
    expect(comps.max).toBe(100);
  });
});

describe('block: documented component coverage', () => {
  const blockJson = (build: (b: BlockComponent) => void) => {
    const b = new BlockComponent({ format: '1.26.40', id: 'test:b' });
    build(b);
    return b.toJSON() as unknown as Json;
  };
  const comps = (json: Json) => deep(json, ['minecraft:block', 'components']) as Json;

  it('emits description.states', () => {
    const json = new BlockComponent({
      format: '1.26.40',
      id: 'test:b',
      components: { states: { direction: ['north', 'south'], age: { min: 0, max: 3 } } },
    } as never).toJSON() as unknown as Json;
    expect(deep(json, ['minecraft:block', 'description', 'states'])).toEqual({
      direction: ['north', 'south'],
      age: { min: 0, max: 3 },
    });
  });
  it('emits minecraft:instrument_sound', () => {
    const json = blockJson(b => b.setInstrumentSound({ up: 'note.bassattack' }));
    expect(comps(json)['minecraft:instrument_sound']).toEqual({ up: 'note.bassattack' });
  });
  it('emits block_entity.container.slot_count', () => {
    const json = blockJson(b => b.setBlockEntity({ container: { slot_count: 27 } }));
    expect(comps(json)['minecraft:block_entity']).toEqual({ container: { slot_count: 27 } });
  });
  it('emits chest_obstruction.obstruction_rule', () => {
    const json = blockJson(b => b.setChestObstruction({ obstruction_rule: 'never' }));
    expect(comps(json)['minecraft:chest_obstruction']).toEqual({ obstruction_rule: 'never' });
  });
  it('emits minecraft:sound as an object', () => {
    const json = blockJson(b => b.setSound('stone'));
    expect(comps(json)['minecraft:sound']).toEqual({ sound: 'stone' });
  });
  it('emits the legacy pre-1.19.40 components', () => {
    const b = new BlockComponent({
      format: '1.18.0',
      id: 'test:b',
      components: {
        destroy_time: 1.5,
        explosion_resistance: 10,
        block_light_absorption: 4,
        block_light_emission: 12,
      },
    } as never);
    const c = deep(b.toJSON() as unknown as Json, ['minecraft:block', 'components']) as Json;
    expect(c['minecraft:destroy_time']).toBe(1.5);
    expect(c['minecraft:explosion_resistance']).toBe(10);
    expect(c['minecraft:block_light_absorption']).toBe(4);
    expect(c['minecraft:block_light_emission']).toBe(12);
  });
  it('emits the deprecated and event components', () => {
    const b = new BlockComponent({
      format: '1.26.40',
      id: 'test:b',
      components: {
        bone_visibility: { bone: false },
        queued_ticking: { interval_range: [1, 2] },
        random_ticking: { interval_range: [1, 2] },
        unit_cube: {},
        on_interact: { onEntityInteract: {} },
        on_step_on: { onEntityStepOn: {} },
      },
    } as never);
    const c = deep(b.toJSON() as unknown as Json, ['minecraft:block', 'components']) as Json;
    expect(c['bone_visibility']).toEqual({ bone: false });
    expect(c['minecraft:queued_ticking']).toEqual({ interval_range: [1, 2] });
    expect(c['minecraft:random_ticking']).toEqual({ interval_range: [1, 2] });
    expect(c['minecraft:unit_cube']).toEqual({});
    expect(c['minecraft:on_interact']).toEqual({ onEntityInteract: {} });
    expect(c['minecraft:on_step_on']).toEqual({ onEntityStepOn: {} });
  });
  it('rejects minecraft:icon on a block', () => {
    const b = new BlockComponent({
      format: '1.26.40',
      id: 'test:b',
      components: { icon: 'x' },
    } as never);
    expect(() => b.toJSON()).toThrow('not a block component');
  });
  it('accepts the map_color [R,G,B] array and object forms', () => {
    expect(
      comps(blockJson(b => b.setMapColor([255, 0, 128])))['minecraft:map_color'],
    ).toEqual([255, 0, 128]);
    expect(
      comps(blockJson(b => b.setMapColor({ color: [1, 2, 3], tint_method: 'grass' })))[
        'minecraft:map_color'
      ],
    ).toEqual({ color: [1, 2, 3], tint_method: 'grass' });
  });
  it('accepts {x,y,z} collision boxes and multi-box arrays', () => {
    const b = new BlockComponent({ format: '1.26.40', id: 'test:b' });
    expect(() =>
      b.setCollisionBox({ origin: { x: -8, y: 0, z: -8 }, size: { x: 16, y: 16, z: 16 } }),
    ).not.toThrow();
    expect(() =>
      b.setCollisionBox([
        { origin: [0, 0, 0], size: [8, 8, 8] },
        { origin: [8, 0, 0], size: [8, 8, 8] },
      ]),
    ).not.toThrow();
    expect(() => b.setSelectionBox({ origin: [1, 2] as never })).toThrow('selection_box.origin');
  });
  it('accepts {x,y,z} transformation pivots', () => {
    const b = new BlockComponent({ format: '1.26.40', id: 'test:b' });
    expect(() =>
      b.setTransformation({
        rotation: { x: 0, y: 90, z: 0 },
        rotation_pivot: { x: 0, y: 0.5, z: 0 },
        scale: { x: 1, y: 1, z: 1 },
        scale_pivot: { x: 0.5, y: 0.5, z: 0.5 },
        translation: { x: 0, y: 0, z: 0 },
      }),
    ).not.toThrow();
  });
  it('accepts material_instances.alpha_masked_tint and validates ambient_occlusion', () => {
    const b = new BlockComponent({ format: '1.26.40', id: 'test:b' });
    b.setMaterialInstances({ '*': { texture: 'x', alpha_masked_tint: true } });
    expect(
      comps(b.toJSON() as unknown as Json)['minecraft:material_instances'],
    ).toEqual({ '*': { texture: 'x', alpha_masked_tint: true } });
    const bad = new BlockComponent({ format: '1.26.40', id: 'test:b' });
    expect(() => bad.setMaterialInstances({ '*': { texture: 'x', ambient_occlusion: true as never } })).toThrow(
      'ambient_occlusion',
    );
  });
  it('validates traits', () => {
    const b = new BlockComponent({ format: '1.26.40', id: 'test:b' });
    expect(() =>
      b.setTraits({
        'minecraft:multi_block': { parts: 9, direction: 'up' },
      }),
    ).toThrow('parts');
    expect(() =>
      b.setTraits({ 'minecraft:multi_block': { direction: 'sideways' as never } }),
    ).toThrow('direction');
    expect(() =>
      b.setTraits({ 'minecraft:placement_direction': { y_rotation_offset: 45 as never } }),
    ).toThrow('y_rotation_offset');
    const ok = new BlockComponent({ format: '1.26.40', id: 'test:b' });
    expect(() =>
      ok.setTraits({
        'minecraft:placement_direction': {
          enabled_states: ['minecraft:cardinal_direction'],
          y_rotation_offset: 90,
          blocks_to_corner_with: [{ tags: "q.any_tag('minecraft:cornerable_stairs')" }],
        },
        'minecraft:multi_block': { parts: 4, direction: 'north' },
      }),
    ).not.toThrow();
  });
  it('validates the menu_category enum', () => {
    const b = new BlockComponent({ format: '1.26.40', id: 'test:b' });
    expect(() => b.setMenuCategory('nope' as never)).toThrow('unknown category');
    expect(() => b.setMenuCategory('construction')).not.toThrow();
  });
});

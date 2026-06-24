import * as t from '../types';

class BlockComponent {
  #opt: t.BlockComponentOptions;
  constructor(opt: t.BlockComponentOptions) {
    this.#opt = opt;
  }
  public toJSON() {
    if (!this.#opt) throw new Error('[mcx component]: cannot read component');
    const result: Record<string, any> = {
      format_version: '',
      'minecraft:block': {
        components: {},
        description: {
          identifier: '',
        },
      },
    };
    if (
      typeof this.#opt.format == 'string' &&
      /\d+\.\d+\.\d+/.test(this.#opt.format)
    ) {
      result['format_version'] = this.#opt.format;
    } else {
      throw new Error('[compile component]: no format');
    }
    if (
      typeof this.#opt.id == 'string' &&
      /[a-zA-Z0-9_]:[a-zA-Z0-9_]/.test(this.#opt.id)
    ) {
      result['minecraft:block'].description.identifier = this.#opt.id;
    } else {
      throw new Error('[compile component]: no id');
    }
    const ApplyComponents = result['minecraft:block'].components;
    if (this.#opt.components) {
      const c = this.#opt.components;
      if (typeof c.display_name == 'string') {
        ApplyComponents['minecraft:display_name'] = c.display_name;
      }
      if (typeof c.light_emission == 'number') {
        ApplyComponents['minecraft:light_emission'] = c.light_emission;
      }
      if (typeof c.light_dampening == 'number') {
        ApplyComponents['minecraft:light_dampening'] = c.light_dampening;
      }
      if (typeof c.friction == 'number') {
        ApplyComponents['minecraft:friction'] = c.friction;
      }
      if (typeof c.loot == 'string') {
        ApplyComponents['minecraft:loot'] = c.loot;
      }
      if (c.destructible_by_explosion !== undefined) {
        ApplyComponents['minecraft:destructible_by_explosion'] = c.destructible_by_explosion;
      }
      if (c.destructible_by_mining !== undefined) {
        ApplyComponents['minecraft:destructible_by_mining'] = c.destructible_by_mining;
      }
      if (c.flammable !== undefined) {
        ApplyComponents['minecraft:flammable'] = c.flammable;
      }
      if (c.collision_box !== undefined) {
        ApplyComponents['minecraft:collision_box'] = c.collision_box;
      }
      if (c.selection_box !== undefined) {
        ApplyComponents['minecraft:selection_box'] = c.selection_box;
      }
      if (c.geometry !== undefined) {
        ApplyComponents['minecraft:geometry'] = c.geometry;
      }
      if (c.material_instances !== undefined) {
        ApplyComponents['minecraft:material_instances'] = c.material_instances;
      }
      if (c.map_color !== undefined) {
        ApplyComponents['minecraft:map_color'] = c.map_color;
      }
      if (c.crafting_table !== undefined) {
        ApplyComponents['minecraft:crafting_table'] = c.crafting_table;
      }
      if (c.transformation !== undefined) {
        ApplyComponents['minecraft:transformation'] = c.transformation;
      }
      if (c.tick !== undefined) {
        ApplyComponents['minecraft:tick'] = c.tick;
      }
      if (c.random_offset !== undefined) {
        ApplyComponents['minecraft:random_offset'] = c.random_offset;
      }
      if (c.movable !== undefined) {
        ApplyComponents['minecraft:movable'] = c.movable;
      }
      if (c.placement_filter !== undefined) {
        ApplyComponents['minecraft:placement_filter'] = c.placement_filter;
      }
      if (c.redstone_conductivity !== undefined) {
        ApplyComponents['minecraft:redstone_conductivity'] = c.redstone_conductivity;
      }
      if (c.redstone_consumer !== undefined) {
        ApplyComponents['minecraft:redstone_consumer'] = c.redstone_consumer;
      }
      if (c.redstone_producer !== undefined) {
        ApplyComponents['minecraft:redstone_producer'] = c.redstone_producer;
      }
      if (c.support !== undefined) {
        ApplyComponents['minecraft:support'] = c.support;
      }
      if (c.connection_rule !== undefined) {
        ApplyComponents['minecraft:connection_rule'] = c.connection_rule;
      }
      if (c.liquid_detection !== undefined) {
        ApplyComponents['minecraft:liquid_detection'] = c.liquid_detection;
      }
      if (c.precipitation_interactions !== undefined) {
        ApplyComponents['minecraft:precipitation_interactions'] = c.precipitation_interactions;
      }
      if (c.entity_fall_on !== undefined) {
        ApplyComponents['minecraft:entity_fall_on'] = c.entity_fall_on;
      }
      if (c.replaceable !== undefined) {
        ApplyComponents['minecraft:replaceable'] = {};
      }
      if (c.flower_pottable !== undefined) {
        ApplyComponents['minecraft:flower_pottable'] = {};
      }
      if (c.chest_obstruction !== undefined) {
        ApplyComponents['minecraft:chest_obstruction'] = {};
      }
      if (typeof c.icon == 'string' && c.icon.trim()) {
        ApplyComponents['minecraft:icon'] = {
          textures: c.icon.trim(),
        };
      } else if (
        typeof c.icon == 'object' &&
        c.icon &&
        'classId' in c.icon &&
        c.icon.classId == 'mcx_png_2340192'
      ) {
        ApplyComponents['minecraft:icon'] = {
          textures: c.icon.filePath,
        };
      }
    }
    return result;
  }
}
export { BlockComponent };

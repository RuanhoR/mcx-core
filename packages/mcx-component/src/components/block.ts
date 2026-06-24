import * as t from '../types';

class BlockComponent {
  #opt: t.BlockComponentOptions;
  constructor(opt: t.BlockComponentOptions) {
    this.#opt = opt;
    if (!this.#opt.components) this.#opt.components = {};
  }

  getFormat(): string { return this.#opt.format; }
  setFormat(value: string) { this.#opt.format = value; }
  getId(): string { return this.#opt.id; }
  setId(value: string) { this.#opt.id = value; }

  getDisplayName(): string | undefined { return this.#opt.components?.display_name; }
  setDisplayName(value: string) { if (!this.#opt.components) this.#opt.components = {}; this.#opt.components.display_name = value; }
  getLightEmission(): number | undefined { return this.#opt.components?.light_emission; }
  setLightEmission(value: number) { if (!this.#opt.components) this.#opt.components = {}; this.#opt.components.light_emission = value; }
  getLightDampening(): number | undefined { return this.#opt.components?.light_dampening; }
  setLightDampening(value: number) { if (!this.#opt.components) this.#opt.components = {}; this.#opt.components.light_dampening = value; }
  getFriction(): number | undefined { return this.#opt.components?.friction; }
  setFriction(value: number) { if (!this.#opt.components) this.#opt.components = {}; this.#opt.components.friction = value; }
  getLoot(): string | undefined { return this.#opt.components?.loot; }
  setLoot(value: string) { if (!this.#opt.components) this.#opt.components = {}; this.#opt.components.loot = value; }
  getDestructibleByExplosion(): boolean | { explosion_resistance?: number } | undefined { return this.#opt.components?.destructible_by_explosion; }
  setDestructibleByExplosion(value: boolean | { explosion_resistance?: number }) { if (!this.#opt.components) this.#opt.components = {}; this.#opt.components.destructible_by_explosion = value; }
  getDestructibleByMining(): boolean | { seconds_to_destroy?: number; item_specific_speeds?: Array<{ item: string | { tags?: string }; destroy_speed: number }> } | undefined { return this.#opt.components?.destructible_by_mining; }
  setDestructibleByMining(value: boolean | { seconds_to_destroy?: number; item_specific_speeds?: Array<{ item: string | { tags?: string }; destroy_speed: number }> }) { if (!this.#opt.components) this.#opt.components = {}; this.#opt.components.destructible_by_mining = value; }
  getFlammable(): boolean | { catch_chance_modifier?: number; destroy_chance_modifier?: number; lava_flammable?: boolean } | undefined { return this.#opt.components?.flammable; }
  setFlammable(value: boolean | { catch_chance_modifier?: number; destroy_chance_modifier?: number; lava_flammable?: boolean }) { if (!this.#opt.components) this.#opt.components = {}; this.#opt.components.flammable = value; }
  getCollisionBox(): boolean | { origin?: [number, number, number]; size?: [number, number, number] } | undefined { return this.#opt.components?.collision_box; }
  setCollisionBox(value: boolean | { origin?: [number, number, number]; size?: [number, number, number] }) { if (!this.#opt.components) this.#opt.components = {}; this.#opt.components.collision_box = value; }
  getSelectionBox(): boolean | { origin?: [number, number, number]; size?: [number, number, number] } | undefined { return this.#opt.components?.selection_box; }
  setSelectionBox(value: boolean | { origin?: [number, number, number]; size?: [number, number, number] }) { if (!this.#opt.components) this.#opt.components = {}; this.#opt.components.selection_box = value; }
  getGeometry(): string | { identifier: string; bone_visibility?: Record<string, boolean>; culling?: string; culling_layer?: string; culling_shape?: string; n_way_visual_rotation?: string; uv_lock?: boolean | string[] } | undefined { return this.#opt.components?.geometry; }
  setGeometry(value: string | { identifier: string; bone_visibility?: Record<string, boolean>; culling?: string; culling_layer?: string; culling_shape?: string; n_way_visual_rotation?: string; uv_lock?: boolean | string[] }) { if (!this.#opt.components) this.#opt.components = {}; this.#opt.components.geometry = value; }
  getMaterialInstances(): Record<string, string | { texture: string; render_method?: string; ambient_occlusion?: number; face_dimming?: boolean | string; isotropic?: boolean; tint_method?: string | boolean }> | undefined { return this.#opt.components?.material_instances; }
  setMaterialInstances(value: Record<string, string | { texture: string; render_method?: string; ambient_occlusion?: number; face_dimming?: boolean | string; isotropic?: boolean; tint_method?: string | boolean }>) { if (!this.#opt.components) this.#opt.components = {}; this.#opt.components.material_instances = value; }
  getMapColor(): string | { color: string; tint_method?: string } | undefined { return this.#opt.components?.map_color; }
  setMapColor(value: string | { color: string; tint_method?: string }) { if (!this.#opt.components) this.#opt.components = {}; this.#opt.components.map_color = value; }
  getCraftingTable(): { crafting_tags?: string[]; table_name?: string } | undefined { return this.#opt.components?.crafting_table; }
  setCraftingTable(value: { crafting_tags?: string[]; table_name?: string }) { if (!this.#opt.components) this.#opt.components = {}; this.#opt.components.crafting_table = value; }
  getTransformation(): { rotation?: [number, number, number] | { x?: number; y?: number; z?: number }; rotation_pivot?: [number, number, number]; scale?: [number, number, number] | { x?: number; y?: number; z?: number }; scale_pivot?: [number, number, number]; translation?: [number, number, number] | { x?: number; y?: number; z?: number } } | undefined { return this.#opt.components?.transformation; }
  setTransformation(value: { rotation?: [number, number, number] | { x?: number; y?: number; z?: number }; rotation_pivot?: [number, number, number]; scale?: [number, number, number] | { x?: number; y?: number; z?: number }; scale_pivot?: [number, number, number]; translation?: [number, number, number] | { x?: number; y?: number; z?: number } }) { if (!this.#opt.components) this.#opt.components = {}; this.#opt.components.transformation = value; }
  getTick(): { interval_range: [number, number]; looping?: boolean } | undefined { return this.#opt.components?.tick; }
  setTick(value: { interval_range: [number, number]; looping?: boolean }) { if (!this.#opt.components) this.#opt.components = {}; this.#opt.components.tick = value; }
  getRandomOffset(): { x?: { range?: { min?: number; max?: number }; steps?: number }; y?: { range?: { min?: number; max?: number }; steps?: number }; z?: { range?: { min?: number; max?: number }; steps?: number } } | undefined { return this.#opt.components?.random_offset; }
  setRandomOffset(value: { x?: { range?: { min?: number; max?: number }; steps?: number }; y?: { range?: { min?: number; max?: number }; steps?: number }; z?: { range?: { min?: number; max?: number }; steps?: number } }) { if (!this.#opt.components) this.#opt.components = {}; this.#opt.components.random_offset = value; }
  getMovable(): { movement_type?: 'push_pull' | 'push' | 'popped' | 'immovable'; sticky?: 'none' | 'same' } | undefined { return this.#opt.components?.movable; }
  setMovable(value: { movement_type?: 'push_pull' | 'push' | 'popped' | 'immovable'; sticky?: 'none' | 'same' }) { if (!this.#opt.components) this.#opt.components = {}; this.#opt.components.movable = value; }
  getPlacementFilter(): { conditions: Array<{ allowed_faces?: string[]; block_filter?: Array<string | { name?: string; states?: Record<string, number | string | boolean>; tags?: string }> }> } | undefined { return this.#opt.components?.placement_filter; }
  setPlacementFilter(value: { conditions: Array<{ allowed_faces?: string[]; block_filter?: Array<string | { name?: string; states?: Record<string, number | string | boolean>; tags?: string }> }> }) { if (!this.#opt.components) this.#opt.components = {}; this.#opt.components.placement_filter = value; }
  getRedstoneConductivity(): { allows_wire_to_step_down?: boolean; redstone_conductor?: boolean } | undefined { return this.#opt.components?.redstone_conductivity; }
  setRedstoneConductivity(value: { allows_wire_to_step_down?: boolean; redstone_conductor?: boolean }) { if (!this.#opt.components) this.#opt.components = {}; this.#opt.components.redstone_conductivity = value; }
  getRedstoneConsumer(): { min_power?: number; propagates_power?: boolean } | undefined { return this.#opt.components?.redstone_consumer; }
  setRedstoneConsumer(value: { min_power?: number; propagates_power?: boolean }) { if (!this.#opt.components) this.#opt.components = {}; this.#opt.components.redstone_consumer = value; }
  getRedstoneProducer(): { power?: number; connected_faces?: string[]; strongly_powered_face?: string; transform_relative?: boolean } | undefined { return this.#opt.components?.redstone_producer; }
  setRedstoneProducer(value: { power?: number; connected_faces?: string[]; strongly_powered_face?: string; transform_relative?: boolean }) { if (!this.#opt.components) this.#opt.components = {}; this.#opt.components.redstone_producer = value; }
  getSupport(): { shape: 'fence' | 'stair' } | undefined { return this.#opt.components?.support; }
  setSupport(value: { shape: 'fence' | 'stair' }) { if (!this.#opt.components) this.#opt.components = {}; this.#opt.components.support = value; }
  getConnectionRule(): { accepts_connections_from?: 'all' | 'none' | 'only_fences'; enabled_directions?: string[] } | undefined { return this.#opt.components?.connection_rule; }
  setConnectionRule(value: { accepts_connections_from?: 'all' | 'none' | 'only_fences'; enabled_directions?: string[] }) { if (!this.#opt.components) this.#opt.components = {}; this.#opt.components.connection_rule = value; }
  getLiquidDetection(): { can_contain_liquid?: boolean; liquid_type?: string; on_liquid_touches?: 'blocking' | 'broken' | 'popped' | 'no_reaction'; stops_liquid_flowing_from_direction?: string[]; use_liquid_clipping?: boolean; detection_rules?: Array<{ can_contain_liquid?: boolean; liquid_type?: string; on_liquid_touches?: 'blocking' | 'broken' | 'popped' | 'no_reaction'; stops_liquid_flowing_from_direction?: string[]; use_liquid_clipping?: boolean }> } | undefined { return this.#opt.components?.liquid_detection; }
  setLiquidDetection(value: { can_contain_liquid?: boolean; liquid_type?: string; on_liquid_touches?: 'blocking' | 'broken' | 'popped' | 'no_reaction'; stops_liquid_flowing_from_direction?: string[]; use_liquid_clipping?: boolean; detection_rules?: Array<{ can_contain_liquid?: boolean; liquid_type?: string; on_liquid_touches?: 'blocking' | 'broken' | 'popped' | 'no_reaction'; stops_liquid_flowing_from_direction?: string[]; use_liquid_clipping?: boolean }> }) { if (!this.#opt.components) this.#opt.components = {}; this.#opt.components.liquid_detection = value; }
  getPrecipitationInteractions(): { precipitation_behavior?: 'none' | 'obstruct_rain' | 'obstruct_rain_accumulate_snow' | 'snowlogging' } | undefined { return this.#opt.components?.precipitation_interactions; }
  setPrecipitationInteractions(value: { precipitation_behavior?: 'none' | 'obstruct_rain' | 'obstruct_rain_accumulate_snow' | 'snowlogging' }) { if (!this.#opt.components) this.#opt.components = {}; this.#opt.components.precipitation_interactions = value; }
  getEntityFallOn(): { min_fall_distance?: number; minimum_fall_distance?: number } | undefined { return this.#opt.components?.entity_fall_on; }
  setEntityFallOn(value: { min_fall_distance?: number; minimum_fall_distance?: number }) { if (!this.#opt.components) this.#opt.components = {}; this.#opt.components.entity_fall_on = value; }
  getReplaceable(): Record<string, never> | undefined { return this.#opt.components?.replaceable; }
  setReplaceable() { if (!this.#opt.components) this.#opt.components = {}; this.#opt.components.replaceable = {}; }
  getFlowerPottable(): Record<string, never> | undefined { return this.#opt.components?.flower_pottable; }
  setFlowerPottable() { if (!this.#opt.components) this.#opt.components = {}; this.#opt.components.flower_pottable = {}; }
  getChestObstruction(): Record<string, never> | undefined { return this.#opt.components?.chest_obstruction; }
  setChestObstruction() { if (!this.#opt.components) this.#opt.components = {}; this.#opt.components.chest_obstruction = {}; }
  getIcon(): string | { filePath: string; classId: string } | undefined { return this.#opt.components?.icon; }
  setIcon(value: string | { filePath: string; classId: string }) { if (!this.#opt.components) this.#opt.components = {}; this.#opt.components.icon = value; }

  public toJSON() {
    if (!this.#opt) throw new Error('[mcx component]: cannot read component');
    const result: Record<string, any> = {
      format_version: '',
      'minecraft:block': {
        components: {},
        description: { identifier: '' },
      },
    };
    if (typeof this.#opt.format == 'string' && /\d+\.\d+\.\d+/.test(this.#opt.format)) {
      result['format_version'] = this.#opt.format;
    } else {
      throw new Error('[compile component]: no format');
    }
    if (typeof this.#opt.id == 'string' && /[a-zA-Z0-9_]:[a-zA-Z0-9_]/.test(this.#opt.id)) {
      result['minecraft:block'].description.identifier = this.#opt.id;
    } else {
      throw new Error('[compile component]: no id');
    }
    const ApplyComponents = result['minecraft:block'].components;
    if (this.#opt.components) {
      const c = this.#opt.components;
      if (typeof c.display_name == 'string') ApplyComponents['minecraft:display_name'] = c.display_name;
      if (typeof c.light_emission == 'number') ApplyComponents['minecraft:light_emission'] = c.light_emission;
      if (typeof c.light_dampening == 'number') ApplyComponents['minecraft:light_dampening'] = c.light_dampening;
      if (typeof c.friction == 'number') ApplyComponents['minecraft:friction'] = c.friction;
      if (typeof c.loot == 'string') ApplyComponents['minecraft:loot'] = c.loot;
      if (c.destructible_by_explosion !== undefined) ApplyComponents['minecraft:destructible_by_explosion'] = c.destructible_by_explosion;
      if (c.destructible_by_mining !== undefined) ApplyComponents['minecraft:destructible_by_mining'] = c.destructible_by_mining;
      if (c.flammable !== undefined) ApplyComponents['minecraft:flammable'] = c.flammable;
      if (c.collision_box !== undefined) ApplyComponents['minecraft:collision_box'] = c.collision_box;
      if (c.selection_box !== undefined) ApplyComponents['minecraft:selection_box'] = c.selection_box;
      if (c.geometry !== undefined) ApplyComponents['minecraft:geometry'] = c.geometry;
      if (c.material_instances !== undefined) ApplyComponents['minecraft:material_instances'] = c.material_instances;
      if (c.map_color !== undefined) ApplyComponents['minecraft:map_color'] = c.map_color;
      if (c.crafting_table !== undefined) ApplyComponents['minecraft:crafting_table'] = c.crafting_table;
      if (c.transformation !== undefined) ApplyComponents['minecraft:transformation'] = c.transformation;
      if (c.tick !== undefined) ApplyComponents['minecraft:tick'] = c.tick;
      if (c.random_offset !== undefined) ApplyComponents['minecraft:random_offset'] = c.random_offset;
      if (c.movable !== undefined) ApplyComponents['minecraft:movable'] = c.movable;
      if (c.placement_filter !== undefined) ApplyComponents['minecraft:placement_filter'] = c.placement_filter;
      if (c.redstone_conductivity !== undefined) ApplyComponents['minecraft:redstone_conductivity'] = c.redstone_conductivity;
      if (c.redstone_consumer !== undefined) ApplyComponents['minecraft:redstone_consumer'] = c.redstone_consumer;
      if (c.redstone_producer !== undefined) ApplyComponents['minecraft:redstone_producer'] = c.redstone_producer;
      if (c.support !== undefined) ApplyComponents['minecraft:support'] = c.support;
      if (c.connection_rule !== undefined) ApplyComponents['minecraft:connection_rule'] = c.connection_rule;
      if (c.liquid_detection !== undefined) ApplyComponents['minecraft:liquid_detection'] = c.liquid_detection;
      if (c.precipitation_interactions !== undefined) ApplyComponents['minecraft:precipitation_interactions'] = c.precipitation_interactions;
      if (c.entity_fall_on !== undefined) ApplyComponents['minecraft:entity_fall_on'] = c.entity_fall_on;
      if (c.replaceable !== undefined) ApplyComponents['minecraft:replaceable'] = {};
      if (c.flower_pottable !== undefined) ApplyComponents['minecraft:flower_pottable'] = {};
      if (c.chest_obstruction !== undefined) ApplyComponents['minecraft:chest_obstruction'] = {};
      if (typeof c.icon == 'string' && c.icon.trim()) {
        ApplyComponents['minecraft:icon'] = { textures: c.icon.trim() };
      } else if (typeof c.icon == 'object' && c.icon && 'classId' in c.icon && c.icon.classId == 'mcx_png_2340192') {
        ApplyComponents['minecraft:icon'] = { textures: c.icon.filePath };
      }
    }
    return result;
  }
}
export { BlockComponent };

import * as t from '../types';

class ItemComponent {
  #opt: t.ItemComponentOptions;
  constructor(opt: t.ItemComponentOptions) {
    this.#opt = opt;
    if (!this.#opt.components) this.#opt.components = {};
  }

  getFormat(): string { return this.#opt.format; }
  setFormat(value: string) { this.#opt.format = value; }
  getId(): string { return this.#opt.id; }
  setId(value: string) { this.#opt.id = value; }
  getName(): string { return this.#opt.name; }
  setName(value: string) { this.#opt.name = value; }

  getDamage(): number | undefined { return this.#opt.components?.damage; }
  setDamage(value: number) { if (!this.#opt.components) this.#opt.components = {}; this.#opt.components.damage = value; }
  getOffHand(): boolean | undefined { return this.#opt.components?.offHand; }
  setOffHand(value: boolean) { if (!this.#opt.components) this.#opt.components = {}; this.#opt.components.offHand = value; }
  getCanDestroyInCreative(): boolean | undefined { return this.#opt.components?.canDestroyInCreative; }
  setCanDestroyInCreative(value: boolean) { if (!this.#opt.components) this.#opt.components = {}; this.#opt.components.canDestroyInCreative = value; }
  getIcon(): string | { filePath: string; classId: string } | undefined { return this.#opt.components?.icon; }
  setIcon(value: string | { filePath: string; classId: string }) { if (!this.#opt.components) this.#opt.components = {}; this.#opt.components.icon = value; }
  getGlint(): boolean | undefined { return this.#opt.components?.glint; }
  setGlint(value: boolean) { if (!this.#opt.components) this.#opt.components = {}; this.#opt.components.glint = value; }
  getHandEquipped(): boolean | undefined { return this.#opt.components?.hand_equipped; }
  setHandEquipped(value: boolean) { if (!this.#opt.components) this.#opt.components = {}; this.#opt.components.hand_equipped = value; }
  getBlockPlacer(): { aligned_placement?: boolean; block: string; replace_block_item?: boolean; use_on?: Array<string | { name: string; states?: Record<string, number | string | boolean>; tags?: string }> } | undefined { return this.#opt.components?.block_placer; }
  setBlockPlacer(value: { aligned_placement?: boolean; block: string; replace_block_item?: boolean; use_on?: Array<string | { name: string; states?: Record<string, number | string | boolean>; tags?: string }> }) { if (!this.#opt.components) this.#opt.components = {}; this.#opt.components.block_placer = value; }
  getCooldown(): { category: string; duration: number; type?: 'use' | 'attack' } | undefined { return this.#opt.components?.cooldown; }
  setCooldown(value: { category: string; duration: number; type?: 'use' | 'attack' }) { if (!this.#opt.components) this.#opt.components = {}; this.#opt.components.cooldown = value; }
  getCompostable(): { composting_chance: number } | undefined { return this.#opt.components?.compostable; }
  setCompostable(value: { composting_chance: number }) { if (!this.#opt.components) this.#opt.components = {}; this.#opt.components.compostable = value; }
  getBundleInteraction(): { num_viewable_slots?: number } | undefined { return this.#opt.components?.bundle_interaction; }
  setBundleInteraction(value: { num_viewable_slots?: number }) { if (!this.#opt.components) this.#opt.components = {}; this.#opt.components.bundle_interaction = value; }
  getStorageItem(): { allow_nested_storage_items?: boolean; allowed_items?: string[]; banned_items?: string[]; max_slots?: number; max_weight_limit?: number; weight_in_storage_item?: number } | undefined { return this.#opt.components?.storage_item; }
  setStorageItem(value: { allow_nested_storage_items?: boolean; allowed_items?: string[]; banned_items?: string[]; max_slots?: number; max_weight_limit?: number; weight_in_storage_item?: number }) { if (!this.#opt.components) this.#opt.components = {}; this.#opt.components.storage_item = value; }
  getStorageWeightModifier(): { weight_in_storage_item: number } | undefined { return this.#opt.components?.storage_weight_modifier; }
  setStorageWeightModifier(value: { weight_in_storage_item: number }) { if (!this.#opt.components) this.#opt.components = {}; this.#opt.components.storage_weight_modifier = value; }
  getStorageWeightLimit(): { max_weight_limit: number } | undefined { return this.#opt.components?.storage_weight_limit; }
  setStorageWeightLimit(value: { max_weight_limit: number }) { if (!this.#opt.components) this.#opt.components = {}; this.#opt.components.storage_weight_limit = value; }
  getThrowable(): { do_swing_animation?: boolean; launch_power_scale?: number; max_draw_duration?: number; max_launch_power?: number; min_draw_duration?: number; scale_power_by_draw_duration?: boolean } | undefined { return this.#opt.components?.throwable; }
  setThrowable(value: { do_swing_animation?: boolean; launch_power_scale?: number; max_draw_duration?: number; max_launch_power?: number; min_draw_duration?: number; scale_power_by_draw_duration?: boolean }) { if (!this.#opt.components) this.#opt.components = {}; this.#opt.components.throwable = value; }
  getTags(): { tags?: string[] } | undefined { return this.#opt.components?.tags; }
  setTags(value: { tags?: string[] }) { if (!this.#opt.components) this.#opt.components = {}; this.#opt.components.tags = value; }
  getSwingDuration(): { value?: number } | undefined { return this.#opt.components?.swing_duration; }
  setSwingDuration(value: { value?: number }) { if (!this.#opt.components) this.#opt.components = {}; this.#opt.components.swing_duration = value; }
  getUseAnimation(): string | { value?: string } | undefined { return this.#opt.components?.use_animation; }
  setUseAnimation(value: string | { value?: string }) { if (!this.#opt.components) this.#opt.components = {}; this.#opt.components.use_animation = value; }
  getWearable(): { slot: string; protection?: number; hides_player_location?: boolean; dispensable?: boolean } | undefined { return this.#opt.components?.wearable; }
  setWearable(value: { slot: 'slot.armor.head' | 'slot.armor.chest' | 'slot.armor.legs' | 'slot.armor.feet' | 'slot.armor.body' | 'slot.weapon.mainhand' | 'slot.weapon.offhand'; protection?: number; hides_player_location?: boolean; dispensable?: boolean }) { if (!this.#opt.components) this.#opt.components = {}; this.#opt.components.wearable = value; }
  getUseModifiers(): { use_duration: number; movement_modifier?: number; emit_vibrations?: boolean; start_sound?: string } | undefined { return this.#opt.components?.use_modifiers; }
  setUseModifiers(value: { use_duration: number; movement_modifier?: number; emit_vibrations?: boolean; start_sound?: string }) { if (!this.#opt.components) this.#opt.components = {}; this.#opt.components.use_modifiers = value; }
  getSwingSounds(): { attack_critical_hit?: string; attack_hit?: string; attack_miss?: string } | undefined { return this.#opt.components?.swing_sounds; }
  setSwingSounds(value: { attack_critical_hit?: string; attack_hit?: string; attack_miss?: string }) { if (!this.#opt.components) this.#opt.components = {}; this.#opt.components.swing_sounds = value; }
  getDigger(): { use_efficiency?: boolean; destroy_speeds?: Array<{ block: string | { name?: string; states?: Record<string, number | string | boolean>; tags?: string }; speed: number }> } | undefined { return this.#opt.components?.digger; }
  setDigger(value: { use_efficiency?: boolean; destroy_speeds?: Array<{ block: string | { name?: string; states?: Record<string, number | string | boolean>; tags?: string }; speed: number }> }) { if (!this.#opt.components) this.#opt.components = {}; this.#opt.components.digger = value; }
  getDamageAbsorption(): { absorbable_causes: string[] } | undefined { return this.#opt.components?.damage_absorption; }
  setDamageAbsorption(value: { absorbable_causes: string[] }) { if (!this.#opt.components) this.#opt.components = {}; this.#opt.components.damage_absorption = value; }
  getDurability(): { max_durability: number; damage_chance?: { min: number; max: number } } | undefined { return this.#opt.components?.durability; }
  setDurability(value: { max_durability: number; damage_chance?: { min: number; max: number } }) { if (!this.#opt.components) this.#opt.components = {}; this.#opt.components.durability = value; }
  getDurabilitySensor(): { durability?: number; durability_thresholds?: Array<{ durability: number; particle_type?: t.ParticleType; sound_event?: t.SoundEvent }>; particle_type?: t.ParticleType; sound_event?: t.SoundEvent } | undefined { return this.#opt.components?.durability_sensor; }
  setDurabilitySensor(value: { durability?: number; durability_thresholds?: Array<{ durability: number; particle_type?: t.ParticleType; sound_event?: t.SoundEvent }>; particle_type?: t.ParticleType; sound_event?: t.SoundEvent }) { if (!this.#opt.components) this.#opt.components = {}; this.#opt.components.durability_sensor = value; }
  getDyeable(): { default_color?: string | [number, number, number] } | undefined { return this.#opt.components?.dyeable; }
  setDyeable(value: { default_color?: string | [number, number, number] }) { if (!this.#opt.components) this.#opt.components = {}; this.#opt.components.dyeable = value; }
  getEnchantable(): { slot?: t.EnchantableSlot; value?: number } | undefined { return this.#opt.components?.enchantable; }
  setEnchantable(value: { slot?: t.EnchantableSlot; value?: number }) { if (!this.#opt.components) this.#opt.components = {}; this.#opt.components.enchantable = value; }
  getFireResistant(): { value?: boolean } | undefined { return this.#opt.components?.fire_resistant; }
  setFireResistant(value: { value?: boolean }) { if (!this.#opt.components) this.#opt.components = {}; this.#opt.components.fire_resistant = value; }
  getEntityPlacer(): { dispense_on?: Array<string | { name: string; states?: Record<string, number | string | boolean>; tags?: string }>; entity: string; use_on?: Array<string | { name: string; states?: Record<string, number | string | boolean>; tags?: string }> } | undefined { return this.#opt.components?.entity_placer; }
  setEntityPlacer(value: { dispense_on?: Array<string | { name: string; states?: Record<string, number | string | boolean>; tags?: string }>; entity: string; use_on?: Array<string | { name: string; states?: Record<string, number | string | boolean>; tags?: string }> }) { if (!this.#opt.components) this.#opt.components = {}; this.#opt.components.entity_placer = value; }
  getFuel(): { duration: number } | undefined { return this.#opt.components?.fuel; }
  setFuel(value: { duration: number }) { if (!this.#opt.components) this.#opt.components = {}; this.#opt.components.fuel = value; }
  getKineticWeapon(): { creative_reach?: { max?: number; min?: number }; damage_conditions?: { max_duration?: number; min_relative_speed?: number; min_speed?: number }; damage_modifier?: number; damage_multiplier?: number; delay?: number; dismount_conditions?: { max_duration?: number; min_relative_speed?: number; min_speed?: number }; hitbox_margin?: number; knockback_conditions?: { max_duration?: number; min_relative_speed?: number; min_speed?: number }; kinetic_effect_conditions?: { max_duration?: number; min_relative_speed?: number; min_speed?: number }; reach?: { max?: number; min?: number } } | undefined { return this.#opt.components?.kinetic_weapon; }
  setKineticWeapon(value: { creative_reach?: { max?: number; min?: number }; damage_conditions?: { max_duration?: number; min_relative_speed?: number; min_speed?: number }; damage_modifier?: number; damage_multiplier?: number; delay?: number; dismount_conditions?: { max_duration?: number; min_relative_speed?: number; min_speed?: number }; hitbox_margin?: number; knockback_conditions?: { max_duration?: number; min_relative_speed?: number; min_speed?: number }; kinetic_effect_conditions?: { max_duration?: number; min_relative_speed?: number; min_speed?: number }; reach?: { max?: number; min?: number } }) { if (!this.#opt.components) this.#opt.components = {}; this.#opt.components.kinetic_weapon = value; }
  getInteractButton(): boolean | string | undefined { return this.#opt.components?.interact_button; }
  setInteractButton(value: boolean | string) { if (!this.#opt.components) this.#opt.components = {}; this.#opt.components.interact_button = value; }
  getHoverTextColor(): { value?: string } | undefined { return this.#opt.components?.hover_text_color; }
  setHoverTextColor(value: { value?: string }) { if (!this.#opt.components) this.#opt.components = {}; this.#opt.components.hover_text_color = value; }
  getLiquidClipped(): boolean | { value?: boolean } | undefined { return this.#opt.components?.liquid_clipped; }
  setLiquidClipped(value: boolean | { value?: boolean }) { if (!this.#opt.components) this.#opt.components = {}; this.#opt.components.liquid_clipped = value; }
  getMaxStackSize(): number | { value?: number } | undefined { return this.#opt.components?.max_stack_size; }
  setMaxStackSize(value: number | { value?: number }) { if (!this.#opt.components) this.#opt.components = {}; this.#opt.components.max_stack_size = value; }
  getFood(): { can_always_eat?: boolean; cooldown_time?: number; cooldown_type?: string; effects?: t.FoodEffect[]; is_meat?: boolean; nutrition?: number; on_use_action?: string; on_use_range?: [number, number, number]; saturation_modifier?: number | 'poor' | 'low' | 'normal' | 'good' | 'supernatural'; using_converts_to?: string; remove_effects?: string[] } | undefined { return this.#opt.components?.food; }
  setFood(value: { can_always_eat?: boolean; cooldown_time?: number; cooldown_type?: string; effects?: t.FoodEffect[]; is_meat?: boolean; nutrition?: number; on_use_action?: string; on_use_range?: [number, number, number]; saturation_modifier?: number | 'poor' | 'low' | 'normal' | 'good' | 'supernatural'; using_converts_to?: string; remove_effects?: string[] }) { if (!this.#opt.components) this.#opt.components = {}; this.#opt.components.food = value; }

  public toJSON() {
    if (!this.#opt) throw new Error('[mcx component]: cannot read component');
    const result: {
      format_version: string;
      'minecraft:item': {
        description: { identifier: string };
        components: Partial<{
          'minecraft:display_name': { value: string };
          'minecraft:damage': { value: number };
          'minecraft:allow_off_hand': { value: boolean };
          'minecraft:can_destroy_in_creative': { value: boolean };
          'minecraft:icon': { textures: string };
          'minecraft:glint': { value: boolean };
          'minecraft:hand_equipped': { value: boolean };
          'minecraft:block_placer': {
            aligned_placement?: boolean;
            block: string;
            replace_block_item?: boolean;
            use_on?: Array<
              | string
              | {
                  name: string;
                  states?: Record<string, number | string | boolean>;
                  tags?: string;
                }
            >;
          };
          'minecraft:cooldown': { category: string; duration: number; type?: 'use' | 'attack' };
          'minecraft:compostable': { composting_chance: number };
          'minecraft:bundle_interaction': { num_viewable_slots?: number };
          'minecraft:storage_item': {
            allow_nested_storage_items?: boolean;
            allowed_items?: string[];
            banned_items?: string[];
            max_slots?: number;
            max_weight_limit?: number;
            weight_in_storage_item?: number;
          };
          'minecraft:storage_weight_modifier': { weight_in_storage_item: number };
          'minecraft:storage_weight_limit': { max_weight_limit: number };
          'minecraft:throwable': {
            do_swing_animation?: boolean;
            launch_power_scale?: number;
            max_draw_duration?: number;
            max_launch_power?: number;
            min_draw_duration?: number;
            scale_power_by_draw_duration?: boolean;
          };
          'minecraft:tags': { tags?: string[] };
          'minecraft:swing_duration': { value?: number };
          'minecraft:use_animation': string | { value?: string };
          'minecraft:wearable': {
            slot: 'slot.armor.head' | 'slot.armor.chest' | 'slot.armor.legs' | 'slot.armor.feet' | 'slot.armor.body' | 'slot.weapon.mainhand' | 'slot.weapon.offhand';
            protection?: number;
            hides_player_location?: boolean;
            dispensable?: boolean;
          };
          'minecraft:use_modifiers': {
            use_duration: number;
            movement_modifier?: number;
            emit_vibrations?: boolean;
            start_sound?: string;
          };
          'minecraft:swing_sounds': {
            attack_critical_hit?: string;
            attack_hit?: string;
            attack_miss?: string;
          };
          'minecraft:digger': {
            use_efficiency?: boolean;
            destroy_speeds?: Array<{
              block:
                | string
                | {
                    name?: string;
                    states?: Record<string, number | string | boolean>;
                    tags?: string;
                  };
              speed: number;
            }>;
          };
          'minecraft:damage_absorption': { absorbable_causes: string[] };
          'minecraft:durability': {
            max_durability: number;
            damage_chance?: { min: number; max: number };
          };
          'minecraft:durability_sensor': {
            durability?: number;
            durability_thresholds?: Array<{
              durability: number;
              particle_type?: t.ParticleType;
              sound_event?: t.SoundEvent;
            }>;
            particle_type?: t.ParticleType;
            sound_event?: t.SoundEvent;
          };
          'minecraft:dyeable': { default_color?: string | [number, number, number] };
          'minecraft:enchantable': { slot?: t.EnchantableSlot; value?: number };
          'minecraft:fire_resistant': { value?: boolean };
          'minecraft:entity_placer': {
            dispense_on?: Array<
              | string
              | {
                  name: string;
                  states?: Record<string, number | string | boolean>;
                  tags?: string;
                }
            >;
            entity: string;
            use_on?: Array<
              | string
              | {
                  name: string;
                  states?: Record<string, number | string | boolean>;
                  tags?: string;
                }
            >;
          };
          'minecraft:fuel': { duration: number };
          'minecraft:kinetic_weapon': {
            creative_reach?: { max?: number; min?: number };
            damage_conditions?: { max_duration?: number; min_relative_speed?: number; min_speed?: number };
            damage_modifier?: number;
            damage_multiplier?: number;
            delay?: number;
            dismount_conditions?: { max_duration?: number; min_relative_speed?: number; min_speed?: number };
            hitbox_margin?: number;
            knockback_conditions?: { max_duration?: number; min_relative_speed?: number; min_speed?: number };
            kinetic_effect_conditions?: { max_duration?: number; min_relative_speed?: number; min_speed?: number };
            reach?: { max?: number; min?: number };
          };
          'minecraft:interact_button': boolean | string;
          'minecraft:hover_text_color': { value?: string };
          'minecraft:liquid_clipped': boolean | { value?: boolean };
          'minecraft:max_stack_size': number | { value?: number };
          'minecraft:food': {
            can_always_eat?: boolean;
            cooldown_time?: number;
            cooldown_type?: string;
            effects?: t.FoodEffect[];
            is_meat?: boolean;
            nutrition?: number;
            on_use_action?: string;
            on_use_range?: [number, number, number];
            saturation_modifier?: number | 'poor' | 'low' | 'normal' | 'good' | 'supernatural';
            using_converts_to?: string;
            remove_effects?: string[];
          };
        }>;
      };
    } = {
      format_version: '',
      'minecraft:item': {
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
      result['minecraft:item'].description.identifier = this.#opt.id;
    } else {
      throw new Error('[compile component]:cno id');
    }
    const ApplyComponents = result['minecraft:item'].components;
    if (typeof this.#opt.name == 'string') {
      ApplyComponents['minecraft:display_name'] = { value: this.#opt.name };
    }
    if (this.#opt.components) {
      const c = this.#opt.components;
      if (typeof c.damage == 'number') ApplyComponents['minecraft:damage'] = { value: c.damage };
      if (typeof c.offHand == 'boolean') ApplyComponents['minecraft:allow_off_hand'] = { value: c.offHand };
      if (typeof c.canDestroyInCreative == 'boolean') ApplyComponents['minecraft:can_destroy_in_creative'] = { value: c.canDestroyInCreative };
      if (typeof c.icon == 'string' && c.icon.trim()) {
        ApplyComponents['minecraft:icon'] = { textures: c.icon.trim() };
      } else if (typeof c.icon == 'object' && c.icon && 'classId' in c.icon && c.icon.classId == 'mcx_png_2340192') {
        ApplyComponents['minecraft:icon'] = { textures: c.icon.filePath };
      }
      if (typeof c.glint === 'boolean') ApplyComponents['minecraft:glint'] = { value: c.glint };
      if (typeof c.hand_equipped === 'boolean') ApplyComponents['minecraft:hand_equipped'] = { value: c.hand_equipped };
      if (c.block_placer !== undefined) ApplyComponents['minecraft:block_placer'] = c.block_placer;
      if (c.cooldown !== undefined) ApplyComponents['minecraft:cooldown'] = c.cooldown;
      if (c.compostable !== undefined) ApplyComponents['minecraft:compostable'] = c.compostable;
      if (c.bundle_interaction !== undefined) ApplyComponents['minecraft:bundle_interaction'] = c.bundle_interaction;
      if (c.storage_item !== undefined) ApplyComponents['minecraft:storage_item'] = c.storage_item;
      if (c.storage_weight_modifier !== undefined) ApplyComponents['minecraft:storage_weight_modifier'] = c.storage_weight_modifier;
      if (c.storage_weight_limit !== undefined) ApplyComponents['minecraft:storage_weight_limit'] = c.storage_weight_limit;
      if (c.throwable !== undefined) ApplyComponents['minecraft:throwable'] = c.throwable;
      if (c.tags !== undefined) ApplyComponents['minecraft:tags'] = c.tags;
      if (c.swing_duration !== undefined) ApplyComponents['minecraft:swing_duration'] = c.swing_duration;
      if (c.use_animation !== undefined) ApplyComponents['minecraft:use_animation'] = c.use_animation;
      if (c.wearable !== undefined) ApplyComponents['minecraft:wearable'] = c.wearable;
      if (c.use_modifiers !== undefined) ApplyComponents['minecraft:use_modifiers'] = c.use_modifiers;
      if (c.swing_sounds !== undefined) ApplyComponents['minecraft:swing_sounds'] = c.swing_sounds;
      if (c.digger !== undefined) ApplyComponents['minecraft:digger'] = c.digger;
      if (c.damage_absorption !== undefined) ApplyComponents['minecraft:damage_absorption'] = c.damage_absorption;
      if (c.durability !== undefined) ApplyComponents['minecraft:durability'] = c.durability;
      if (c.durability_sensor !== undefined) ApplyComponents['minecraft:durability_sensor'] = c.durability_sensor;
      if (c.dyeable !== undefined) ApplyComponents['minecraft:dyeable'] = c.dyeable;
      if (c.enchantable !== undefined) ApplyComponents['minecraft:enchantable'] = c.enchantable;
      if (c.fire_resistant !== undefined) ApplyComponents['minecraft:fire_resistant'] = c.fire_resistant;
      if (c.entity_placer !== undefined) ApplyComponents['minecraft:entity_placer'] = c.entity_placer;
      if (c.fuel !== undefined) ApplyComponents['minecraft:fuel'] = c.fuel;
      if (c.kinetic_weapon !== undefined) ApplyComponents['minecraft:kinetic_weapon'] = c.kinetic_weapon;
      if (c.interact_button !== undefined) ApplyComponents['minecraft:interact_button'] = c.interact_button;
      if (c.hover_text_color !== undefined) ApplyComponents['minecraft:hover_text_color'] = c.hover_text_color;
      if (c.liquid_clipped !== undefined) ApplyComponents['minecraft:liquid_clipped'] = c.liquid_clipped;
      if (c.max_stack_size !== undefined) ApplyComponents['minecraft:max_stack_size'] = c.max_stack_size;
      if (c.food !== undefined) ApplyComponents['minecraft:food'] = c.food;
    }
    return result;
  }
}
export { ItemComponent };

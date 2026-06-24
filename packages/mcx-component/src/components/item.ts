import * as t from '../types';

class ItemComponent {
  #opt: t.ItemComponentOptions;

  constructor(opt: t.ItemComponentOptions) {
    this.#opt = opt;
    if (!this.#opt.components) this.#opt.components = {};
  }

  public toJSON(): t.ItemJson {
    if (!this.#opt) throw new Error('[mcx component]: cannot read component');

    const result: t.ItemJson = {
      format_version: '',
      _meta: {
        type: 'item',
        file_edit: [],
      },
      'minecraft:item': {
        description: { identifier: '' },
        components: {},
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
      throw new Error('[compile component]: no id');
    }

    const ApplyComponents = result['minecraft:item'].components;
    const c = this.#opt.components;

    if (typeof this.#opt.name == 'string') {
      ApplyComponents['minecraft:display_name'] = { value: this.#opt.name };
    }

    if (typeof c.damage == 'number') {
      if (c.damage < 0 || !Number.isInteger(c.damage)) {
        throw new Error('[compile component]: damage must be a non-negative integer');
      }
      ApplyComponents['minecraft:damage'] = { value: c.damage };
    }

    if (typeof c.offHand == 'boolean') {
      ApplyComponents['minecraft:allow_off_hand'] = { value: c.offHand };
    }

    if (typeof c.canDestroyInCreative == 'boolean') {
      ApplyComponents['minecraft:can_destroy_in_creative'] = { value: c.canDestroyInCreative };
    }

    if (typeof c.icon == 'string' && c.icon.trim()) {
      ApplyComponents['minecraft:icon'] = { textures: c.icon.trim() };
    } else if (typeof c.icon == 'object' && c.icon && 'classId' in c.icon && c.icon.classId == 'mcx_png_2340192') {
      ApplyComponents['minecraft:icon'] = { textures: c.icon.filePath };
    }

    if (typeof c.glint === 'boolean') {
      ApplyComponents['minecraft:glint'] = { value: c.glint };
    }

    if (typeof c.hand_equipped === 'boolean') {
      ApplyComponents['minecraft:hand_equipped'] = { value: c.hand_equipped };
    }

    if (c.block_placer !== void 0) {
      const blockPlacerConfig = c.block_placer;
      if (typeof blockPlacerConfig.block !== 'string') {
        throw new Error('[compile component]: block_placer.block must be a string');
      }
      if (blockPlacerConfig.use_on !== void 0) {
        if (!Array.isArray(blockPlacerConfig.use_on)) {
          throw new Error('[compile component]: block_placer.use_on must be an array');
        }
      }
      ApplyComponents['minecraft:block_placer'] = blockPlacerConfig;
    }

    if (c.cooldown !== void 0) {
      const cooldownConfig = c.cooldown;
      if (typeof cooldownConfig.category !== 'string') {
        throw new Error('[compile component]: cooldown.category must be a string');
      }
      if (typeof cooldownConfig.duration !== 'number' || cooldownConfig.duration < 0) {
        throw new Error('[compile component]: cooldown.duration must be a non-negative number');
      }
      ApplyComponents['minecraft:cooldown'] = cooldownConfig;
    }

    if (c.compostable !== void 0) {
      const compostableConfig = c.compostable;
      if (typeof compostableConfig.composting_chance !== 'number' || compostableConfig.composting_chance < 0 || compostableConfig.composting_chance > 1) {
        throw new Error('[compile component]: compostable.composting_chance must be a number between 0 and 1');
      }
      ApplyComponents['minecraft:compostable'] = compostableConfig;
    }

    if (c.bundle_interaction !== void 0) {
      ApplyComponents['minecraft:bundle_interaction'] = c.bundle_interaction;
    }

    const storageItemConfig = c['minecraft:storage_item'] || c.storage_item;
    if (storageItemConfig !== void 0) {
      ApplyComponents['minecraft:storage_item'] = storageItemConfig;
    }

    const storageWeightModifierConfig = c['minecraft:storage_weight_modifier'] || c.storage_weight_modifier;
    if (storageWeightModifierConfig !== void 0) {
      if (typeof storageWeightModifierConfig.weight_in_storage_item !== 'number') {
        throw new Error('[compile component]: storage_weight_modifier.weight_in_storage_item must be a number');
      }
      ApplyComponents['minecraft:storage_weight_modifier'] = storageWeightModifierConfig;
    }

    const storageWeightLimitConfig = c['minecraft:storage_weight_limit'] || c.storage_weight_limit;
    if (storageWeightLimitConfig !== void 0) {
      if (typeof storageWeightLimitConfig.max_weight_limit !== 'number') {
        throw new Error('[compile component]: storage_weight_limit.max_weight_limit must be a number');
      }
      ApplyComponents['minecraft:storage_weight_limit'] = storageWeightLimitConfig;
    }

    const throwableConfig = c['minecraft:throwable'] || c.throwable;
    if (throwableConfig !== void 0) {
      ApplyComponents['minecraft:throwable'] = throwableConfig;
    }

    const tagsConfig = c['minecraft:tags'] || c.tags;
    if (tagsConfig !== void 0) {
      ApplyComponents['minecraft:tags'] = tagsConfig;
    }

    const swingDurationConfig = c['minecraft:swing_duration'] || c.swing_duration;
    if (swingDurationConfig !== void 0) {
      if (swingDurationConfig.value !== void 0 && (typeof swingDurationConfig.value !== 'number' || swingDurationConfig.value < 0)) {
        throw new Error('[compile component]: swing_duration.value must be a non-negative number');
      }
      ApplyComponents['minecraft:swing_duration'] = swingDurationConfig;
    }

    const useAnimationConfig = c['minecraft:use_animation'] || c.use_animation;
    if (useAnimationConfig !== void 0) {
      const useAnimationFinal: Record<string, unknown> = {};
      if (typeof useAnimationConfig === 'string') {
        const validAnimations = [
          'animation.idle', 'animation.attack', 'animation.bow', 'animation.camera',
          'animation.crossbow', 'animation.drink', 'animation.eat', 'animation.interact',
          'animation.none', 'animation.spear', 'animation.spyglass', 'animation.brush',
          'animation.summon_spell_alt', 'animation.portal', 'animation.block',
        ];
        if (!validAnimations.includes(useAnimationConfig)) {
          throw new Error(`[compile component]: use_animation must be a valid animation type. Got: ${useAnimationConfig}`);
        }
        useAnimationFinal.value = useAnimationConfig;
      } else if (typeof useAnimationConfig === 'object' && useAnimationConfig !== null) {
        if (typeof useAnimationConfig.value === 'string') {
          useAnimationFinal.value = useAnimationConfig.value;
        } else {
          throw new Error('[compile component]: use_animation object must have a value string property');
        }
      }
      ApplyComponents['minecraft:use_animation'] = useAnimationFinal;
    }

    const wearableConfig = c['minecraft:wearable'] || c.wearable;
    if (wearableConfig !== void 0) {
      const validSlots = [
        'slot.armor.head', 'slot.armor.chest', 'slot.armor.legs', 'slot.armor.feet',
        'slot.armor.body', 'slot.weapon.mainhand', 'slot.weapon.offhand', 'slot.hotbar',
        'slot.inventory', 'slot.enderchest', 'slot.saddle', 'slot.armor', 'slot.chest',
      ];
      if (!validSlots.includes(wearableConfig.slot)) {
        throw new Error(`[compile component]: wearable.slot must be a valid slot identifier. Got: ${wearableConfig.slot}`);
      }
      if (wearableConfig.protection !== void 0 && (typeof wearableConfig.protection !== 'number' || wearableConfig.protection < 0)) {
        throw new Error('[compile component]: wearable.protection must be a non-negative number');
      }
      ApplyComponents['minecraft:wearable'] = wearableConfig;
    }

    const useModifiersConfig = c['minecraft:use_modifiers'] || c.use_modifiers;
    if (useModifiersConfig !== void 0) {
      if (typeof useModifiersConfig.use_duration !== 'number' || useModifiersConfig.use_duration < 0) {
        throw new Error('[compile component]: use_modifiers.use_duration must be a non-negative number');
      }
      ApplyComponents['minecraft:use_modifiers'] = useModifiersConfig;
    }

    const swingSoundsConfig = c['minecraft:swing_sounds'] || c.swing_sounds;
    if (swingSoundsConfig !== void 0) {
      ApplyComponents['minecraft:swing_sounds'] = swingSoundsConfig;
    }

    if (c.digger !== void 0) {
      const diggerConfig = c.digger;
      if (diggerConfig.destroy_speeds !== void 0) {
        if (!Array.isArray(diggerConfig.destroy_speeds)) {
          throw new Error('[compile component]: digger.destroy_speeds must be an array');
        }
        for (const ds of diggerConfig.destroy_speeds) {
          if (typeof ds.block !== 'string' && (typeof ds.block !== 'object' || ds.block === null)) {
            throw new Error('[compile component]: digger.destroy_speeds block must be a string or object');
          }
          if (typeof ds.speed !== 'number' || ds.speed < 0) {
            throw new Error('[compile component]: digger.destroy_speeds speed must be a non-negative number');
          }
          if (typeof ds.block === 'object' && ds.block !== null) {
            const blockObj = ds.block as Record<string, unknown>;
            if (blockObj.name !== void 0 && typeof blockObj.name !== 'string') {
              throw new Error('[compile component]: digger.destroy_speeds block.name must be a string');
            }
          }
        }
      }
      ApplyComponents['minecraft:digger'] = diggerConfig;
    }

    if (c.damage_absorption !== void 0) {
      if (!Array.isArray(c.damage_absorption.absorbable_causes)) {
        throw new Error('[compile component]: damage_absorption.absorbable_causes must be an array');
      }
      ApplyComponents['minecraft:damage_absorption'] = c.damage_absorption;
    }

    if (c.durability !== void 0) {
      const durabilityConfig = c.durability;
      if (typeof durabilityConfig.max_durability !== 'number' || durabilityConfig.max_durability < 0) {
        throw new Error('[compile component]: durability.max_durability must be a non-negative number');
      }
      if (durabilityConfig.damage_chance !== void 0) {
        if (typeof durabilityConfig.damage_chance.min !== 'number' || typeof durabilityConfig.damage_chance.max !== 'number') {
          throw new Error('[compile component]: durability.damage_chance must have min and max numbers');
        }
      }
      ApplyComponents['minecraft:durability'] = durabilityConfig;
    }

    if (c.durability_sensor !== void 0) {
      const dsConfig = c.durability_sensor;
      if (dsConfig.durability_thresholds !== void 0) {
        if (!Array.isArray(dsConfig.durability_thresholds)) {
          throw new Error('[compile component]: durability_sensor.durability_thresholds must be an array');
        }
        for (const threshold of dsConfig.durability_thresholds) {
          if (typeof threshold.durability !== 'number') {
            throw new Error('[compile component]: durability_sensor.durability_thresholds durability must be a number');
          }
        }
      }
      ApplyComponents['minecraft:durability_sensor'] = dsConfig;
    }

    if (c.dyeable !== void 0) {
      ApplyComponents['minecraft:dyeable'] = c.dyeable;
    }

    if (c.enchantable !== void 0) {
      ApplyComponents['minecraft:enchantable'] = c.enchantable;
    }

    const fireResistantConfig = c['minecraft:fire_resistant'] || c.fire_resistant;
    if (fireResistantConfig !== void 0) {
      ApplyComponents['minecraft:fire_resistant'] = fireResistantConfig;
    }

    const entityPlacerConfig = c['minecraft:entity_placer'] || c.entity_placer;
    if (entityPlacerConfig !== void 0) {
      if (typeof entityPlacerConfig.entity !== 'string') {
        throw new Error('[compile component]: entity_placer.entity must be a string');
      }
      ApplyComponents['minecraft:entity_placer'] = entityPlacerConfig;
    }

    const fuelConfig = c['minecraft:fuel'] || c.fuel;
    if (fuelConfig !== void 0) {
      if (typeof fuelConfig.duration !== 'number' || fuelConfig.duration < 0) {
        throw new Error('[compile component]: fuel.duration must be a non-negative number');
      }
      ApplyComponents['minecraft:fuel'] = fuelConfig;
    }

    const kineticWeaponConfig = c['minecraft:kinetic_weapon'] || c.kinetic_weapon;
    if (kineticWeaponConfig !== void 0) {
      ApplyComponents['minecraft:kinetic_weapon'] = kineticWeaponConfig;
    }

    const interactButtonConfig = c['minecraft:interact_button'] || c.interact_button;
    if (interactButtonConfig !== void 0) {
      ApplyComponents['minecraft:interact_button'] = interactButtonConfig;
    }

    const hoverTextColorConfig = c['minecraft:hover_text_color'] || c.hover_text_color;
    if (hoverTextColorConfig !== void 0) {
      ApplyComponents['minecraft:hover_text_color'] = hoverTextColorConfig;
    }

    const liquidClippedConfig = c['minecraft:liquid_clipped'] || c.liquid_clipped;
    if (liquidClippedConfig !== void 0) {
      const lcFinal: Record<string, unknown> = {};
      if (typeof liquidClippedConfig === 'boolean') {
        lcFinal.value = liquidClippedConfig;
      } else if (typeof liquidClippedConfig === 'object' && liquidClippedConfig !== null) {
        if (typeof (liquidClippedConfig as Record<string, unknown>).value === 'boolean') {
          lcFinal.value = (liquidClippedConfig as Record<string, unknown>).value;
        } else {
          throw new Error('[compile component]: liquid_clipped object must have a value boolean property');
        }
      }
      ApplyComponents['minecraft:liquid_clipped'] = lcFinal;
    }

    const maxStackSizeConfig = c['minecraft:max_stack_size'] || c.max_stack_size;
    if (maxStackSizeConfig !== void 0) {
      const mssFinal: Record<string, unknown> = {};
      if (typeof maxStackSizeConfig === 'number') {
        if (maxStackSizeConfig < 1 || maxStackSizeConfig > 64 || !Number.isInteger(maxStackSizeConfig)) {
          throw new Error('[compile component]: max_stack_size must be an integer between 1 and 64');
        }
        mssFinal.value = maxStackSizeConfig;
      } else if (typeof maxStackSizeConfig === 'object' && maxStackSizeConfig !== null) {
        const val = (maxStackSizeConfig as Record<string, unknown>).value;
        if (typeof val === 'number' && val >= 1 && val <= 64 && Number.isInteger(val)) {
          mssFinal.value = val;
        } else {
          throw new Error('[compile component]: max_stack_size object must have a value integer between 1 and 64');
        }
      }
      ApplyComponents['minecraft:max_stack_size'] = mssFinal;
    }

    const foodConfig = c['minecraft:food'] || c.food;
    if (foodConfig !== void 0) {
      const foodFinal: Record<string, unknown> = {};

      if (foodConfig.can_always_eat !== void 0) {
        if (typeof foodConfig.can_always_eat !== 'boolean') {
          throw new Error('[compile component]: food.can_always_eat must be boolean');
        }
        foodFinal.can_always_eat = foodConfig.can_always_eat;
      }

      if (foodConfig.cooldown_time !== void 0) {
        if (typeof foodConfig.cooldown_time !== 'number' || foodConfig.cooldown_time < 0) {
          throw new Error('[compile component]: food.cooldown_time must be a non-negative number');
        }
        foodFinal.cooldown_time = foodConfig.cooldown_time;
      }

      if (foodConfig.cooldown_type !== void 0) {
        if (typeof foodConfig.cooldown_type !== 'string') {
          throw new Error('[compile component]: food.cooldown_type must be a string');
        }
        foodFinal.cooldown_type = foodConfig.cooldown_type;
      }

      if (foodConfig.effects !== void 0) {
        if (!Array.isArray(foodConfig.effects)) {
          throw new Error('[compile component]: food.effects must be an array');
        }
        const validEffects = [
          'regeneration', 'absorption', 'blindness', 'conduit_power', 'darkness',
          'fatal_poison', 'fire_resistance', 'haste', 'health_boost', 'hunger',
          'instant_damage', 'instant_health', 'invisibility', 'jump_boost',
          'levitation', 'mining_fatigue', 'nausea', 'night_vision', 'poison',
          'resistance', 'saturation', 'slow_falling', 'slowness', 'speed',
          'strength', 'water_breathing', 'weakness', 'wither',
        ];
        for (const effect of foodConfig.effects) {
          if ((effect as Record<string, unknown>).name && !validEffects.includes((effect as Record<string, unknown>).name as string)) {
            throw new Error(`[compile component]: food.effects name must be valid. Got: ${(effect as Record<string, unknown>).name}`);
          }
          if (typeof (effect as Record<string, unknown>).amplifier === 'number' && (effect as Record<string, unknown>).amplifier as number < 0) {
            throw new Error('[compile component]: food.effects amplifier must be >= 0');
          }
          if (typeof (effect as Record<string, unknown>).chance === 'number') {
            const chance = (effect as Record<string, unknown>).chance as number;
            if (chance < 0 || chance > 1) {
              throw new Error('[compile component]: food.effects chance must be between 0 and 1');
            }
          }
          if (typeof (effect as Record<string, unknown>).duration === 'number' && (effect as Record<string, unknown>).duration as number < 0) {
            throw new Error('[compile component]: food.effects duration must be >= 0');
          }
        }
        foodFinal.effects = foodConfig.effects;
      }

      if (foodConfig.is_meat !== void 0) {
        if (typeof foodConfig.is_meat !== 'boolean') {
          throw new Error('[compile component]: food.is_meat must be boolean');
        }
        foodFinal.is_meat = foodConfig.is_meat;
      }

      if (foodConfig.nutrition !== void 0) {
        if (typeof foodConfig.nutrition !== 'number' || foodConfig.nutrition < 0) {
          throw new Error('[compile component]: food.nutrition must be a non-negative number');
        }
        foodFinal.nutrition = foodConfig.nutrition;
      }

      if (foodConfig.on_use_action !== void 0) {
        if (typeof foodConfig.on_use_action !== 'string') {
          throw new Error('[compile component]: food.on_use_action must be a string');
        }
        foodFinal.on_use_action = foodConfig.on_use_action;
      }

      if (foodConfig.on_use_range !== void 0) {
        if (!Array.isArray(foodConfig.on_use_range) || foodConfig.on_use_range.length !== 3) {
          throw new Error('[compile component]: food.on_use_range must be an array of 3 numbers');
        }
        foodFinal.on_use_range = foodConfig.on_use_range;
      }

      if (foodConfig.saturation_modifier !== void 0) {
        const validModifiers = ['poor', 'low', 'normal', 'good', 'supernatural'];
        if (typeof foodConfig.saturation_modifier === 'string' && !validModifiers.includes(foodConfig.saturation_modifier)) {
          throw new Error(`[compile component]: food.saturation_modifier must be one of: ${validModifiers.join(', ')}`);
        }
        if (typeof foodConfig.saturation_modifier === 'number' && foodConfig.saturation_modifier < 0) {
          throw new Error('[compile component]: food.saturation_modifier number must be >= 0');
        }
        foodFinal.saturation_modifier = foodConfig.saturation_modifier;
      }

      if (foodConfig.using_converts_to !== void 0) {
        if (typeof foodConfig.using_converts_to !== 'string') {
          throw new Error('[compile component]: food.using_converts_to must be a string');
        }
        foodFinal.using_converts_to = foodConfig.using_converts_to;
      }

      if (foodConfig.remove_effects !== void 0) {
        if (!Array.isArray(foodConfig.remove_effects)) {
          throw new Error('[compile component]: food.remove_effects must be an array');
        }
        foodFinal.remove_effects = foodConfig.remove_effects;
      }

      ApplyComponents['minecraft:food'] = foodFinal;
    }

    return result;
  }

  getFormat(): string { return this.#opt.format; }
  setFormat(value: string) {
    if (typeof value !== 'string') throw new TypeError('[set error]: format must be a string');
    this.#opt.format = value;
  }

  getId(): string { return this.#opt.id; }
  setId(value: string) {
    if (typeof value !== 'string' || !/[a-zA-Z0-9_]:[a-zA-Z0-9_]/.test(value)) {
      throw new TypeError('[set error]: id must be a valid Minecraft identifier (namespace:name)');
    }
    this.#opt.id = value;
  }

  getName(): string { return this.#opt.name; }
  setName(value: string) {
    if (typeof value !== 'string') throw new TypeError('[set error]: name must be a string');
    this.#opt.name = value;
  }

  getDamage(): number | undefined { return this.#opt.components?.damage; }
  setDamage(value: number) {
    if (typeof value !== 'number' || value < 0 || !Number.isInteger(value)) {
      throw new TypeError('[set error]: damage must be a non-negative integer');
    }
    this.#opt.components.damage = value;
  }

  getOffHand(): boolean | undefined { return this.#opt.components?.offHand; }
  setOffHand(value: boolean) {
    if (typeof value !== 'boolean') throw new TypeError('[set error]: offHand must be a boolean');
    this.#opt.components.offHand = value;
  }

  getCanDestroyInCreative(): boolean | undefined { return this.#opt.components?.canDestroyInCreative; }
  setCanDestroyInCreative(value: boolean) {
    if (typeof value !== 'boolean') throw new TypeError('[set error]: canDestroyInCreative must be a boolean');
    this.#opt.components.canDestroyInCreative = value;
  }

  getIcon(): string | { filePath: string; classId: string } | undefined { return this.#opt.components?.icon; }
  setIcon(value: string | { filePath: string; classId: string }) {
    if (typeof value === 'string') {
      if (!value.trim()) throw new TypeError('[set error]: icon string must not be empty');
    } else if (typeof value === 'object' && value !== null) {
      if (typeof value.filePath !== 'string' || typeof value.classId !== 'string') {
        throw new TypeError('[set error]: icon object must have filePath and classId strings');
      }
    } else {
      throw new TypeError('[set error]: icon must be a string or object with filePath and classId');
    }
    this.#opt.components.icon = value;
  }

  getGlint(): boolean | undefined { return this.#opt.components?.glint; }
  setGlint(value: boolean) {
    if (typeof value !== 'boolean') throw new TypeError('[set error]: glint must be a boolean');
    this.#opt.components.glint = value;
  }

  getHandEquipped(): boolean | undefined { return this.#opt.components?.hand_equipped; }
  setHandEquipped(value: boolean) {
    if (typeof value !== 'boolean') throw new TypeError('[set error]: hand_equipped must be a boolean');
    this.#opt.components.hand_equipped = value;
  }

  getBlockPlacer(): t.ItemComponentOptions['components']['block_placer'] { return this.#opt.components?.block_placer; }
  setBlockPlacer(value: t.ItemComponentOptions['components']['block_placer']) {
    if (typeof value !== 'object' || value === null) throw new TypeError('[set error]: block_placer must be an object');
    if (typeof value.block !== 'string') throw new TypeError('[set error]: block_placer.block must be a string');
    this.#opt.components.block_placer = value;
  }

  getCooldown(): t.ItemComponentOptions['components']['cooldown'] { return this.#opt.components?.cooldown; }
  setCooldown(value: t.ItemComponentOptions['components']['cooldown']) {
    if (typeof value !== 'object' || value === null) throw new TypeError('[set error]: cooldown must be an object');
    if (typeof value.category !== 'string') throw new TypeError('[set error]: cooldown.category must be a string');
    if (typeof value.duration !== 'number' || value.duration < 0) throw new TypeError('[set error]: cooldown.duration must be a non-negative number');
    this.#opt.components.cooldown = value;
  }

  getCompostable(): t.ItemComponentOptions['components']['compostable'] { return this.#opt.components?.compostable; }
  setCompostable(value: t.ItemComponentOptions['components']['compostable']) {
    if (typeof value !== 'object' || value === null) throw new TypeError('[set error]: compostable must be an object');
    if (typeof value.composting_chance !== 'number' || value.composting_chance < 0 || value.composting_chance > 1) {
      throw new TypeError('[set error]: compostable.composting_chance must be a number between 0 and 1');
    }
    this.#opt.components.compostable = value;
  }

  getBundleInteraction(): t.ItemComponentOptions['components']['bundle_interaction'] { return this.#opt.components?.bundle_interaction; }
  setBundleInteraction(value: t.ItemComponentOptions['components']['bundle_interaction']) {
    if (typeof value !== 'object' || value === null) throw new TypeError('[set error]: bundle_interaction must be an object');
    this.#opt.components.bundle_interaction = value;
  }

  getStorageItem(): t.ItemComponentOptions['components']['storage_item'] { return this.#opt.components?.['minecraft:storage_item'] || this.#opt.components?.storage_item; }
  setStorageItem(value: t.ItemComponentOptions['components']['storage_item']) {
    if (typeof value !== 'object' || value === null) throw new TypeError('[set error]: storage_item must be an object');
    this.#opt.components['minecraft:storage_item'] = value;
  }

  getStorageWeightModifier(): t.ItemComponentOptions['components']['storage_weight_modifier'] { return this.#opt.components?.['minecraft:storage_weight_modifier'] || this.#opt.components?.storage_weight_modifier; }
  setStorageWeightModifier(value: t.ItemComponentOptions['components']['storage_weight_modifier']) {
    if (typeof value !== 'object' || value === null) throw new TypeError('[set error]: storage_weight_modifier must be an object');
    if (typeof value.weight_in_storage_item !== 'number') throw new TypeError('[set error]: storage_weight_modifier.weight_in_storage_item must be a number');
    this.#opt.components['minecraft:storage_weight_modifier'] = value;
  }

  getStorageWeightLimit(): t.ItemComponentOptions['components']['storage_weight_limit'] { return this.#opt.components?.['minecraft:storage_weight_limit'] || this.#opt.components?.storage_weight_limit; }
  setStorageWeightLimit(value: t.ItemComponentOptions['components']['storage_weight_limit']) {
    if (typeof value !== 'object' || value === null) throw new TypeError('[set error]: storage_weight_limit must be an object');
    if (typeof value.max_weight_limit !== 'number') throw new TypeError('[set error]: storage_weight_limit.max_weight_limit must be a number');
    this.#opt.components['minecraft:storage_weight_limit'] = value;
  }

  getThrowable(): t.ItemComponentOptions['components']['throwable'] { return this.#opt.components?.['minecraft:throwable'] || this.#opt.components?.throwable; }
  setThrowable(value: t.ItemComponentOptions['components']['throwable']) {
    if (typeof value !== 'object' || value === null) throw new TypeError('[set error]: throwable must be an object');
    this.#opt.components['minecraft:throwable'] = value;
  }

  getTags(): t.ItemComponentOptions['components']['tags'] { return this.#opt.components?.['minecraft:tags'] || this.#opt.components?.tags; }
  setTags(value: t.ItemComponentOptions['components']['tags']) {
    if (typeof value !== 'object' || value === null) throw new TypeError('[set error]: tags must be an object');
    this.#opt.components['minecraft:tags'] = value;
  }

  getSwingDuration(): t.ItemComponentOptions['components']['swing_duration'] { return this.#opt.components?.['minecraft:swing_duration'] || this.#opt.components?.swing_duration; }
  setSwingDuration(value: t.ItemComponentOptions['components']['swing_duration']) {
    if (typeof value !== 'object' || value === null) throw new TypeError('[set error]: swing_duration must be an object');
    if (value.value !== void 0 && (typeof value.value !== 'number' || value.value < 0)) {
      throw new TypeError('[set error]: swing_duration.value must be a non-negative number');
    }
    this.#opt.components['minecraft:swing_duration'] = value;
  }

  getUseAnimation(): t.ItemComponentOptions['components']['use_animation'] { return this.#opt.components?.['minecraft:use_animation'] || this.#opt.components?.use_animation; }
  setUseAnimation(value: t.ItemComponentOptions['components']['use_animation']) {
    if (typeof value === 'string') {
      const validAnimations = [
        'animation.idle', 'animation.attack', 'animation.bow', 'animation.camera',
        'animation.crossbow', 'animation.drink', 'animation.eat', 'animation.interact',
        'animation.none', 'animation.spear', 'animation.spyglass', 'animation.brush',
        'animation.summon_spell_alt', 'animation.portal', 'animation.block',
      ];
      if (!validAnimations.includes(value)) {
        throw new TypeError(`[set error]: use_animation must be a valid animation type. Got: ${value}`);
      }
    } else if (typeof value === 'object' && value !== null) {
      if (typeof value.value !== 'string') {
        throw new TypeError('[set error]: use_animation object must have a string value property');
      }
    } else {
      throw new TypeError('[set error]: use_animation must be a string or object with value');
    }
    this.#opt.components['minecraft:use_animation'] = value;
  }

  getWearable(): { slot: string; protection?: number; hides_player_location?: boolean; dispensable?: boolean } | undefined {
    return this.#opt.components?.['minecraft:wearable'] || this.#opt.components?.wearable;
  }
  setWearable(value: t.ItemComponentOptions['components']['wearable']) {
    if (typeof value !== 'object' || value === null) throw new TypeError('[set error]: wearable must be an object');
    const validSlots = [
      'slot.armor.head', 'slot.armor.chest', 'slot.armor.legs', 'slot.armor.feet',
      'slot.armor.body', 'slot.weapon.mainhand', 'slot.weapon.offhand', 'slot.hotbar',
      'slot.inventory', 'slot.enderchest', 'slot.saddle', 'slot.armor', 'slot.chest',
    ];
    if (!validSlots.includes(value.slot)) {
      throw new TypeError(`[set error]: wearable.slot must be valid. Got: ${value.slot}`);
    }
    if (value.protection !== void 0 && (typeof value.protection !== 'number' || value.protection < 0)) {
      throw new TypeError('[set error]: wearable.protection must be a non-negative number');
    }
    this.#opt.components['minecraft:wearable'] = value;
  }

  getUseModifiers(): t.ItemComponentOptions['components']['use_modifiers'] { return this.#opt.components?.['minecraft:use_modifiers'] || this.#opt.components?.use_modifiers; }
  setUseModifiers(value: t.ItemComponentOptions['components']['use_modifiers']) {
    if (typeof value !== 'object' || value === null) throw new TypeError('[set error]: use_modifiers must be an object');
    if (typeof value.use_duration !== 'number' || value.use_duration < 0) {
      throw new TypeError('[set error]: use_modifiers.use_duration must be a non-negative number');
    }
    this.#opt.components['minecraft:use_modifiers'] = value;
  }

  getSwingSounds(): t.ItemComponentOptions['components']['swing_sounds'] { return this.#opt.components?.['minecraft:swing_sounds'] || this.#opt.components?.swing_sounds; }
  setSwingSounds(value: t.ItemComponentOptions['components']['swing_sounds']) {
    if (typeof value !== 'object' || value === null) throw new TypeError('[set error]: swing_sounds must be an object');
    this.#opt.components['minecraft:swing_sounds'] = value;
  }

  getDigger(): t.ItemComponentOptions['components']['digger'] { return this.#opt.components?.digger; }
  setDigger(value: t.ItemComponentOptions['components']['digger']) {
    if (typeof value !== 'object' || value === null) throw new TypeError('[set error]: digger must be an object');
    if (value.destroy_speeds !== void 0) {
      if (!Array.isArray(value.destroy_speeds)) throw new TypeError('[set error]: digger.destroy_speeds must be an array');
      for (const ds of value.destroy_speeds) {
        if (typeof ds.speed !== 'number' || ds.speed < 0) throw new TypeError('[set error]: digger.destroy_speeds speed must be a non-negative number');
      }
    }
    this.#opt.components.digger = value;
  }

  getDamageAbsorption(): t.ItemComponentOptions['components']['damage_absorption'] { return this.#opt.components?.damage_absorption; }
  setDamageAbsorption(value: t.ItemComponentOptions['components']['damage_absorption']) {
    if (typeof value !== 'object' || value === null) throw new TypeError('[set error]: damage_absorption must be an object');
    if (!Array.isArray(value.absorbable_causes)) throw new TypeError('[set error]: damage_absorption.absorbable_causes must be an array');
    this.#opt.components.damage_absorption = value;
  }

  getDurability(): t.ItemComponentOptions['components']['durability'] { return this.#opt.components?.durability; }
  setDurability(value: t.ItemComponentOptions['components']['durability']) {
    if (typeof value !== 'object' || value === null) throw new TypeError('[set error]: durability must be an object');
    if (typeof value.max_durability !== 'number' || value.max_durability < 0) {
      throw new TypeError('[set error]: durability.max_durability must be a non-negative number');
    }
    this.#opt.components.durability = value;
  }

  getDurabilitySensor(): t.ItemComponentOptions['components']['durability_sensor'] { return this.#opt.components?.durability_sensor; }
  setDurabilitySensor(value: t.ItemComponentOptions['components']['durability_sensor']) {
    if (typeof value !== 'object' || value === null) throw new TypeError('[set error]: durability_sensor must be an object');
    if (value.durability_thresholds !== void 0) {
      if (!Array.isArray(value.durability_thresholds)) throw new TypeError('[set error]: durability_sensor.durability_thresholds must be an array');
    }
    this.#opt.components.durability_sensor = value;
  }

  getDyeable(): t.ItemComponentOptions['components']['dyeable'] { return this.#opt.components?.dyeable; }
  setDyeable(value: t.ItemComponentOptions['components']['dyeable']) {
    if (typeof value !== 'object' || value === null) throw new TypeError('[set error]: dyeable must be an object');
    this.#opt.components.dyeable = value;
  }

  getEnchantable(): t.ItemComponentOptions['components']['enchantable'] { return this.#opt.components?.enchantable; }
  setEnchantable(value: t.ItemComponentOptions['components']['enchantable']) {
    if (typeof value !== 'object' || value === null) throw new TypeError('[set error]: enchantable must be an object');
    this.#opt.components.enchantable = value;
  }

  getFireResistant(): t.ItemComponentOptions['components']['fire_resistant'] { return this.#opt.components?.['minecraft:fire_resistant'] || this.#opt.components?.fire_resistant; }
  setFireResistant(value: t.ItemComponentOptions['components']['fire_resistant']) {
    if (typeof value !== 'object' || value === null) throw new TypeError('[set error]: fire_resistant must be an object');
    this.#opt.components['minecraft:fire_resistant'] = value;
  }

  getEntityPlacer(): t.ItemComponentOptions['components']['entity_placer'] { return this.#opt.components?.['minecraft:entity_placer'] || this.#opt.components?.entity_placer; }
  setEntityPlacer(value: t.ItemComponentOptions['components']['entity_placer']) {
    if (typeof value !== 'object' || value === null) throw new TypeError('[set error]: entity_placer must be an object');
    if (typeof value.entity !== 'string') throw new TypeError('[set error]: entity_placer.entity must be a string');
    this.#opt.components['minecraft:entity_placer'] = value;
  }

  getFuel(): t.ItemComponentOptions['components']['fuel'] { return this.#opt.components?.['minecraft:fuel'] || this.#opt.components?.fuel; }
  setFuel(value: t.ItemComponentOptions['components']['fuel']) {
    if (typeof value !== 'object' || value === null) throw new TypeError('[set error]: fuel must be an object');
    if (typeof value.duration !== 'number' || value.duration < 0) {
      throw new TypeError('[set error]: fuel.duration must be a non-negative number');
    }
    this.#opt.components['minecraft:fuel'] = value;
  }

  getKineticWeapon(): t.ItemComponentOptions['components']['kinetic_weapon'] { return this.#opt.components?.['minecraft:kinetic_weapon'] || this.#opt.components?.kinetic_weapon; }
  setKineticWeapon(value: t.ItemComponentOptions['components']['kinetic_weapon']) {
    if (typeof value !== 'object' || value === null) throw new TypeError('[set error]: kinetic_weapon must be an object');
    this.#opt.components['minecraft:kinetic_weapon'] = value;
  }

  getInteractButton(): t.ItemComponentOptions['components']['interact_button'] { return this.#opt.components?.['minecraft:interact_button'] || this.#opt.components?.interact_button; }
  setInteractButton(value: t.ItemComponentOptions['components']['interact_button']) {
    if (typeof value !== 'boolean' && typeof value !== 'string') {
      throw new TypeError('[set error]: interact_button must be a boolean or string');
    }
    this.#opt.components['minecraft:interact_button'] = value;
  }

  getHoverTextColor(): t.ItemComponentOptions['components']['hover_text_color'] { return this.#opt.components?.['minecraft:hover_text_color'] || this.#opt.components?.hover_text_color; }
  setHoverTextColor(value: t.ItemComponentOptions['components']['hover_text_color']) {
    if (typeof value !== 'object' || value === null) throw new TypeError('[set error]: hover_text_color must be an object');
    this.#opt.components['minecraft:hover_text_color'] = value;
  }

  getLiquidClipped(): t.ItemComponentOptions['components']['liquid_clipped'] { return this.#opt.components?.['minecraft:liquid_clipped'] || this.#opt.components?.liquid_clipped; }
  setLiquidClipped(value: t.ItemComponentOptions['components']['liquid_clipped']) {
    if (typeof value !== 'boolean' && (typeof value !== 'object' || value === null)) {
      throw new TypeError('[set error]: liquid_clipped must be a boolean or { value: boolean }');
    }
    this.#opt.components['minecraft:liquid_clipped'] = value;
  }

  getMaxStackSize(): t.ItemComponentOptions['components']['max_stack_size'] { return this.#opt.components?.['minecraft:max_stack_size'] || this.#opt.components?.max_stack_size; }
  setMaxStackSize(value: t.ItemComponentOptions['components']['max_stack_size']) {
    if (typeof value === 'number') {
      if (value < 1 || value > 64 || !Number.isInteger(value)) {
        throw new TypeError('[set error]: max_stack_size must be an integer between 1 and 64');
      }
    } else if (typeof value === 'object' && value !== null) {
      const v = (value as Record<string, unknown>).value;
      if (typeof v !== 'number' || v < 1 || v > 64 || !Number.isInteger(v)) {
        throw new TypeError('[set error]: max_stack_size object value must be an integer between 1 and 64');
      }
    } else {
      throw new TypeError('[set error]: max_stack_size must be a number or { value: number }');
    }
    this.#opt.components['minecraft:max_stack_size'] = value;
  }

  getFood(): t.ItemComponentOptions['components']['food'] { return this.#opt.components?.['minecraft:food'] || this.#opt.components?.food; }
  setFood(value: t.ItemComponentOptions['components']['food']) {
    if (typeof value !== 'object' || value === null) throw new TypeError('[set error]: food must be an object');
    if (value.nutrition !== void 0 && (typeof value.nutrition !== 'number' || value.nutrition < 0)) {
      throw new TypeError('[set error]: food.nutrition must be a non-negative number');
    }
    if (value.saturation_modifier !== void 0) {
      const validModifiers = ['poor', 'low', 'normal', 'good', 'supernatural'];
      if (typeof value.saturation_modifier === 'string' && !validModifiers.includes(value.saturation_modifier)) {
        throw new TypeError(`[set error]: food.saturation_modifier must be one of: ${validModifiers.join(', ')}`);
      }
    }
    this.#opt.components['minecraft:food'] = value;
  }
}
export { ItemComponent };

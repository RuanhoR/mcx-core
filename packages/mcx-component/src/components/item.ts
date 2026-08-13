import { randomUUID } from 'node:crypto';
import { PNGImageComponent } from '../lib';
import * as t from './../types';
class ItemComponent {
  #opt: t.ItemComponentOptions;
  #edit: t.BaseJson['_meta']['file_edit'] = [];
  constructor(opt: t.ItemComponentOptions) {
    this.#opt = opt;
  }
  public toJSON(): t.ItemJson {
    if (!this.#opt) throw new Error('[mcx component]: cannot read component');
    const result: t.ItemJson = {
      format_version: '',
      _meta: {
        type: 'item',
        file_edit: this.#edit || [],
      },
      'minecraft:item': {
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
      result['minecraft:item'].description.identifier = this.#opt.id;
    } else {
      throw new Error('[compile component]: no id');
    }
    const description = result['minecraft:item'].description;
    if (typeof this.#opt.group == 'string' && this.#opt.group.trim()) {
      if (this.#opt.group.length > 256) {
        throw new Error(
          '[compile component]: description: group name limited to 256 characters',
        );
      }
      description.group = this.#opt.group;
    }
    if (typeof this.#opt.is_hidden_in_commands == 'boolean') {
      description.is_hidden_in_commands = this.#opt.is_hidden_in_commands;
    }
    if (this.#opt.menu_category) {
      const menuCategory: Record<string, unknown> = {};
      if (
        typeof this.#opt.menu_category.category == 'string' &&
        this.#opt.menu_category.category.trim()
      ) {
        menuCategory.category = this.#opt.menu_category.category;
      }
      if (
        typeof this.#opt.menu_category.group == 'string' &&
        this.#opt.menu_category.group.trim()
      ) {
        if (this.#opt.menu_category.group.length > 256) {
          throw new Error(
            '[compile component]: menu_category: group name limited to 256 characters',
          );
        }
        menuCategory.group = this.#opt.menu_category.group;
      }
      if (typeof this.#opt.menu_category.is_hidden_in_commands == 'boolean') {
        menuCategory.is_hidden_in_commands =
          this.#opt.menu_category.is_hidden_in_commands;
      }
      if (Object.keys(menuCategory).length > 0) {
        description.menu_category = menuCategory as t.MenuCategory;
      }
    }
    const ApplyComponents = result['minecraft:item'].components;
    if (typeof this.#opt.name == 'string') {
      ApplyComponents['minecraft:display_name'] = {
        value: this.#opt.name,
      };
    }
    if (this.#opt.components) {
      const components = this.#opt.components;
      if (typeof components.damage == 'number') {
        ApplyComponents['minecraft:damage'] = {
          value: components.damage,
        };
      }
      if (typeof components.offHand == 'boolean') {
        ApplyComponents['minecraft:allow_off_hand'] = {
          value: components.offHand,
        };
      }
      if (typeof components.canDestroyInCreative == 'boolean') {
        ApplyComponents['minecraft:can_destroy_in_creative'] = {
          value: components.canDestroyInCreative,
        };
      }
      if (typeof components.icon == 'string' && components.icon.trim()) {
        ApplyComponents['minecraft:icon'] = components.icon;
      }

      if (components.block_placer) {
        // Validate format version for block_placer (requires 1.21.50+)
        const formatParts = this.#opt.format.split('.');
        const major = parseInt(formatParts[0]!);
        const minor = parseInt(formatParts[1]!);
        const patch = parseInt(formatParts[2] || '0');

        function isVersionGE(
          reqMajor: number,
          reqMinor: number,
          reqPatch: number,
        ): boolean {
          if (major > reqMajor) return true;
          if (major < reqMajor) return false;
          if (minor > reqMinor) return true;
          if (minor < reqMinor) return false;
          return patch >= reqPatch;
        }

        if (!isVersionGE(1, 21, 50)) {
          throw new Error(
            '[compile component]: block_placer component requires format version 1.21.50 or higher',
          );
        }

        const blockPlacerConfig: Record<string, unknown> = {};

        if (typeof components.block_placer.aligned_placement === 'boolean') {
          blockPlacerConfig.aligned_placement =
            components.block_placer.aligned_placement;
        }

        if (typeof components.block_placer.block === 'string') {
          blockPlacerConfig.block = components.block_placer.block;
        }

        if (typeof components.block_placer.replace_block_item === 'boolean') {
          blockPlacerConfig.replace_block_item =
            components.block_placer.replace_block_item;
        }

        if (Array.isArray(components.block_placer.use_on)) {
          blockPlacerConfig.use_on = [...components.block_placer.use_on];
        }

        ApplyComponents['minecraft:block_placer'] = blockPlacerConfig;
      }

      if (components.cooldown) {
        const cooldownConfig: Record<string, unknown> = {};

        if (typeof components.cooldown.category === 'string') {
          cooldownConfig.category = components.cooldown.category;
        } else {
          throw new Error(
            '[compile component]: cooldown: category must be a string',
          );
        }

        if (typeof components.cooldown.duration === 'number') {
          cooldownConfig.duration = components.cooldown.duration;
        } else {
          throw new Error(
            '[compile component]: cooldown: duration must be a number',
          );
        }

        if (
          components.cooldown.type &&
          (components.cooldown.type === 'use' ||
            components.cooldown.type === 'attack')
        ) {
          cooldownConfig.type = components.cooldown.type;
        }

        ApplyComponents['minecraft:cooldown'] = cooldownConfig;
      }

      if (components.compostable) {
        // Validate format version for compostable (requires 1.21.60+)
        const formatParts = this.#opt.format.split('.');
        const major = parseInt(formatParts[0]!);
        const minor = parseInt(formatParts[1]!);
        const patch = parseInt(formatParts[2] || '0');

        function isVersionGE(
          reqMajor: number,
          reqMinor: number,
          reqPatch: number,
        ): boolean {
          if (major > reqMajor) return true;
          if (major < reqMajor) return false;
          if (minor > reqMinor) return true;
          if (minor < reqMinor) return false;
          return patch >= reqPatch;
        }

        if (!isVersionGE(1, 21, 60)) {
          throw new Error(
            '[compile component]: compostable component requires format version 1.21.60 or higher',
          );
        }

        const compostableConfig: Record<string, unknown> = {};

        if (typeof components.compostable.composting_chance === 'number') {
          if (
            components.compostable.composting_chance < 1 ||
            components.compostable.composting_chance > 100
          ) {
            throw new Error(
              '[compile component]: compostable: composting_chance must be between 1 and 100',
            );
          }
          compostableConfig.composting_chance =
            components.compostable.composting_chance;
        } else {
          throw new Error(
            '[compile component]: compostable: composting_chance must be a number',
          );
        }

        ApplyComponents['minecraft:compostable'] = compostableConfig;
      }

      if (components.bundle_interaction) {
        // Validate format version for bundle_interaction (requires 1.21.40+)
        const formatParts = this.#opt.format.split('.');
        const major = parseInt(formatParts[0]!);
        const minor = parseInt(formatParts[1]!);
        const patch = parseInt(formatParts[2] || '0');

        function isVersionGE(
          reqMajor: number,
          reqMinor: number,
          reqPatch: number,
        ): boolean {
          if (major > reqMajor) return true;
          if (major < reqMajor) return false;
          if (minor > reqMinor) return true;
          if (minor < reqMinor) return false;
          return patch >= reqPatch;
        }

        if (!isVersionGE(1, 21, 40)) {
          throw new Error(
            '[compile component]: bundle_interaction component requires format version 1.21.40 or higher',
          );
        }

        // Validate that storage_item is defined
        if (!components.storage_item) {
          throw new Error(
            '[compile component]: bundle_interaction requires minecraft:storage_item component to be defined',
          );
        }

        const bundleInteractionConfig: Record<string, unknown> = {};

        if (
          typeof components.bundle_interaction.num_viewable_slots === 'number'
        ) {
          if (
            components.bundle_interaction.num_viewable_slots < 1 ||
            components.bundle_interaction.num_viewable_slots > 64
          ) {
            throw new Error(
              '[compile component]: bundle_interaction: num_viewable_slots must be between 1 and 64',
            );
          }
          bundleInteractionConfig.num_viewable_slots =
            components.bundle_interaction.num_viewable_slots;
        }

        ApplyComponents['minecraft:bundle_interaction'] =
          bundleInteractionConfig;
      }

      if (components.storage_item) {
        // Validate format version for storage_item (requires 1.21.40+)
        const formatParts = this.#opt.format.split('.');
        const major = parseInt(formatParts[0]!);
        const minor = parseInt(formatParts[1]!);
        const patch = parseInt(formatParts[2] || '0');

        function isVersionGE(
          reqMajor: number,
          reqMinor: number,
          reqPatch: number,
        ): boolean {
          if (major > reqMajor) return true;
          if (major < reqMajor) return false;
          if (minor > reqMinor) return true;
          if (minor < reqMinor) return false;
          return patch >= reqPatch;
        }

        if (!isVersionGE(1, 21, 40)) {
          throw new Error(
            '[compile component]: storage_item component requires format version 1.21.40 or higher',
          );
        }

        const storageItemConfig: Record<string, unknown> = {};

        if (typeof components.storage_item.max_slots === 'number') {
          if (components.storage_item.max_slots > 64) {
            throw new Error(
              '[compile component]: storage_item: max_slots cannot exceed 64',
            );
          }
          storageItemConfig.max_slots = components.storage_item.max_slots;
        }

        if (typeof components.storage_item.max_weight_limit === 'number') {
          storageItemConfig.max_weight_limit =
            components.storage_item.max_weight_limit;
        }

        if (
          typeof components.storage_item.weight_in_storage_item === 'number'
        ) {
          storageItemConfig.weight_in_storage_item =
            components.storage_item.weight_in_storage_item;
        }

        if (
          typeof components.storage_item.allow_nested_storage_items ===
          'boolean'
        ) {
          storageItemConfig.allow_nested_storage_items =
            components.storage_item.allow_nested_storage_items;
        }

        if (Array.isArray(components.storage_item.allowed_items)) {
          storageItemConfig.allowed_items = [
            ...components.storage_item.allowed_items,
          ];
        }

        if (Array.isArray(components.storage_item.banned_items)) {
          storageItemConfig.banned_items = [
            ...components.storage_item.banned_items,
          ];
        }

        ApplyComponents['minecraft:storage_item'] = storageItemConfig;
      }

      if (typeof components.glint === 'boolean') {
        ApplyComponents['minecraft:glint'] = {
          value: components.glint,
        };
      }

      if (typeof components.hand_equipped === 'boolean') {
        ApplyComponents['minecraft:hand_equipped'] = {
          value: components.hand_equipped,
        };
      }

      if (components.digger) {
        const diggerConfig: Record<string, unknown> = {};

        if (typeof components.digger.use_efficiency === 'boolean') {
          diggerConfig.use_efficiency = components.digger.use_efficiency;
        }

        if (Array.isArray(components.digger.destroy_speeds)) {
          diggerConfig.destroy_speeds = [];
          for (const speedEntry of components.digger.destroy_speeds) {
            const entry: Record<string, unknown> = {};

            if (speedEntry.block) {
              entry.block = speedEntry.block;
            } else {
              throw new Error(
                '[compile component]: digger: destroy_speeds entry must have a block',
              );
            }

            if (typeof speedEntry.speed === 'number') {
              entry.speed = speedEntry.speed;
            } else {
              throw new Error(
                '[compile component]: digger: destroy_speeds entry speed must be a number',
              );
            }

            (
              diggerConfig.destroy_speeds as Array<Record<string, unknown>>
            ).push(entry);
          }
        }

        ApplyComponents['minecraft:digger'] = diggerConfig;
      }

      if (components.damage_absorption) {
        const damageAbsorptionConfig: Record<string, unknown> = {};

        if (Array.isArray(components.damage_absorption.absorbable_causes)) {
          if (components.damage_absorption.absorbable_causes.length === 0) {
            throw new Error(
              '[compile component]: damage_absorption: absorbable_causes must have at least 1 item',
            );
          }
          damageAbsorptionConfig.absorbable_causes = [
            ...components.damage_absorption.absorbable_causes,
          ];
        } else {
          throw new Error(
            '[compile component]: damage_absorption: absorbable_causes must be an array',
          );
        }

        ApplyComponents['minecraft:damage_absorption'] = damageAbsorptionConfig;
      }

      if (components.durability) {
        const durabilityConfig: Record<string, unknown> = {};

        if (typeof components.durability.max_durability === 'number') {
          if (components.durability.max_durability < 0) {
            throw new Error(
              '[compile component]: durability: max_durability must be at least 0',
            );
          }
          durabilityConfig.max_durability =
            components.durability.max_durability;
        } else {
          throw new Error(
            '[compile component]: durability: max_durability must be a number',
          );
        }

        if (components.durability.damage_chance) {
          const damageChance = components.durability.damage_chance;

          if (
            typeof damageChance.min === 'number' &&
            typeof damageChance.max === 'number'
          ) {
            if (damageChance.min < 0 || damageChance.max < 0) {
              throw new Error(
                '[compile component]: durability: damage_chance min and max must be at least 0',
              );
            }
            if (damageChance.min > damageChance.max) {
              throw new Error(
                '[compile component]: durability: damage_chance min cannot be greater than max',
              );
            }
            durabilityConfig.damage_chance = {
              min: damageChance.min,
              max: damageChance.max,
            };
          } else {
            throw new Error(
              '[compile component]: durability: damage_chance must have both min and max values',
            );
          }
        }

        ApplyComponents['minecraft:durability'] = durabilityConfig;
      }

      if (components.durability_sensor) {
        // Validate format version for durability_sensor (requires 1.21.50+)
        const formatParts = this.#opt.format.split('.');
        const major = parseInt(formatParts[0]!);
        const minor = parseInt(formatParts[1]!);
        const patch = parseInt(formatParts[2] || '0');

        function isVersionGE(
          reqMajor: number,
          reqMinor: number,
          reqPatch: number,
        ): boolean {
          if (major > reqMajor) return true;
          if (major < reqMajor) return false;
          if (minor > reqMinor) return true;
          if (minor < reqMinor) return false;
          return patch >= reqPatch;
        }

        if (!isVersionGE(1, 21, 50)) {
          throw new Error(
            '[compile component]: durability_sensor component requires format version 1.21.50 or higher',
          );
        }

        // Validate that durability component is defined
        if (!components.durability) {
          throw new Error(
            '[compile component]: durability_sensor requires minecraft:durability component to be defined',
          );
        }

        const durabilitySensorConfig: Record<string, unknown> = {};

        if (typeof components.durability_sensor.durability === 'number') {
          durabilitySensorConfig.durability =
            components.durability_sensor.durability;
        }

        if (Array.isArray(components.durability_sensor.durability_thresholds)) {
          if (components.durability_sensor.durability_thresholds.length === 0) {
            throw new Error(
              '[compile component]: durability_sensor: durability_thresholds must have at least 1 item',
            );
          }

          durabilitySensorConfig.durability_thresholds = [];
          for (const threshold of components.durability_sensor
            .durability_thresholds) {
            const thresholdConfig: Record<string, unknown> = {};

            if (typeof threshold.durability === 'number') {
              thresholdConfig.durability = threshold.durability;
            } else {
              throw new Error(
                '[compile component]: durability_sensor: durability_thresholds entry durability must be a number',
              );
            }

            if (typeof threshold.particle_type === 'string') {
              if (
                !t.ParticleTypeEnum.includes(
                  threshold.particle_type as t.ParticleType,
                )
              ) {
                throw new Error(
                  `[compile component]: durability_sensor: durability_thresholds entry particle_type must be a valid particle type. Got: ${threshold.particle_type}`,
                );
              }
              thresholdConfig.particle_type = threshold.particle_type;
            }

            if (typeof threshold.sound_event === 'string') {
              if (
                !t.SoundEventEnum.includes(
                  threshold.sound_event as t.SoundEvent,
                )
              ) {
                throw new Error(
                  `[compile component]: durability_sensor: durability_thresholds entry sound_event must be a valid sound event. Got: ${threshold.sound_event}`,
                );
              }
              thresholdConfig.sound_event = threshold.sound_event;
            }

            (
              durabilitySensorConfig.durability_thresholds as Array<
                Record<string, unknown>
              >
            ).push(thresholdConfig);
          }
        }

        if (typeof components.durability_sensor.particle_type === 'string') {
          if (
            !t.ParticleTypeEnum.includes(
              components.durability_sensor.particle_type as t.ParticleType,
            )
          ) {
            throw new Error(
              `[compile component]: durability_sensor: particle_type must be a valid particle type. Got: ${components.durability_sensor.particle_type}`,
            );
          }
          durabilitySensorConfig.particle_type =
            components.durability_sensor.particle_type;
        }

        if (typeof components.durability_sensor.sound_event === 'string') {
          if (
            !t.SoundEventEnum.includes(
              components.durability_sensor.sound_event as t.SoundEvent,
            )
          ) {
            throw new Error(
              `[compile component]: durability_sensor: sound_event must be a valid sound event. Got: ${components.durability_sensor.sound_event}`,
            );
          }
          durabilitySensorConfig.sound_event =
            components.durability_sensor.sound_event;
        }

        ApplyComponents['minecraft:durability_sensor'] = durabilitySensorConfig;
      }

      if (components.dyeable) {
        // Validate format version for dyeable (requires 1.21.30+)
        const formatParts = this.#opt.format.split('.');
        const major = parseInt(formatParts[0]!);
        const minor = parseInt(formatParts[1]!);
        const patch = parseInt(formatParts[2] || '0');

        function isVersionGE(
          reqMajor: number,
          reqMinor: number,
          reqPatch: number,
        ): boolean {
          if (major > reqMajor) return true;
          if (major < reqMajor) return false;
          if (minor > reqMinor) return true;
          if (minor < reqMinor) return false;
          return patch >= reqPatch;
        }

        if (!isVersionGE(1, 21, 30)) {
          throw new Error(
            '[compile component]: dyeable component requires format version 1.21.30 or higher',
          );
        }

        const dyeableConfig: Record<string, unknown> = {};

        if (components.dyeable.default_color !== undefined) {
          if (typeof components.dyeable.default_color === 'string') {
            // Validate hex color format
            if (!/^#[0-9A-Fa-f]{6}$/.test(components.dyeable.default_color)) {
              throw new Error(
                "[compile component]: dyeable: default_color string must be a valid hex color (e.g., '#175882')",
              );
            }
            dyeableConfig.default_color = components.dyeable.default_color;
          } else if (
            Array.isArray(components.dyeable.default_color) &&
            components.dyeable.default_color.length === 3
          ) {
            // Validate RGB array
            const [r, g, b] = components.dyeable.default_color;
            if (
              typeof r !== 'number' ||
              typeof g !== 'number' ||
              typeof b !== 'number' ||
              r < 0 ||
              r > 255 ||
              g < 0 ||
              g > 255 ||
              b < 0 ||
              b > 255
            ) {
              throw new Error(
                '[compile component]: dyeable: default_color array must contain 3 numbers between 0 and 255',
              );
            }
            dyeableConfig.default_color = components.dyeable.default_color;
          } else {
            throw new Error(
              '[compile component]: dyeable: default_color must be a hex string or array of 3 numbers',
            );
          }
        }

        ApplyComponents['minecraft:dyeable'] = dyeableConfig;
      }

      if (components.enchantable) {
        const enchantableConfig: Record<string, unknown> = {};

        if (typeof components.enchantable.slot === 'string') {
          // Validate slot enum
          if (
            !t.EnchantableSlotEnum.includes(
              components.enchantable.slot as t.EnchantableSlot,
            )
          ) {
            throw new Error(
              `[compile component]: enchantable: slot must be a valid enchantment slot. Got: ${components.enchantable.slot}`,
            );
          }
          enchantableConfig.slot = components.enchantable.slot;
        } else if (components.enchantable.slot !== undefined) {
          throw new Error(
            '[compile component]: enchantable: slot must be a string',
          );
        }

        if (typeof components.enchantable.value === 'number') {
          // Validate value minimum (must be at least 0)
          if (components.enchantable.value < 0) {
            throw new Error(
              '[compile component]: enchantable: value must be at least 0',
            );
          }
          enchantableConfig.value = components.enchantable.value;
        } else if (components.enchantable.value !== undefined) {
          throw new Error(
            '[compile component]: enchantable: value must be a number',
          );
        }

        ApplyComponents['minecraft:enchantable'] = enchantableConfig;
      }

      // Helper function to validate food effects array
      const validateFoodEffects = (effects?: t.FoodEffect[]) => {
        if (effects && Array.isArray(effects)) {
          const validEffects = [
            'regeneration',
            'absorption',
            'blindness',
            'conduit_power',
            'darkness',
            'fatal_poison',
            'fire_resistance',
            'haste',
            'health_boost',
            'hunger',
            'instant_damage',
            'instant_health',
            'invisibility',
            'jump_boost',
            'levitation',
            'mining_fatigue',
            'nausea',
            'night_vision',
            'poison',
            'resistance',
            'saturation',
            'slow_falling',
            'slowness',
            'speed',
            'strength',
            'water_breathing',
            'weakness',
            'wither',
          ];

          for (const effect of effects) {
            if (effect.name && !validEffects.includes(effect.name)) {
              throw new Error(
                `[compile component]: food: effect name must be a valid status effect. Got: ${effect.name}`,
              );
            }

            if (typeof effect.amplifier === 'number' && effect.amplifier < 0) {
              throw new Error(
                '[compile component]: food: effect amplifier must be at least 0',
              );
            }

            if (
              typeof effect.chance === 'number' &&
              (effect.chance < 0 || effect.chance > 1)
            ) {
              throw new Error(
                '[compile component]: food: effect chance must be between 0 and 1',
              );
            }

            if (typeof effect.duration === 'number' && effect.duration < 0) {
              throw new Error(
                '[compile component]: food: effect duration must be at least 0',
              );
            }
          }
          return effects;
        }
        return effects;
      };

      // Handle food component (both 'minecraft:food' and 'food' aliases)
      const foodConfig = components['minecraft:food'] || components.food;
      if (foodConfig) {
        const foodConfigFinal: Record<string, unknown> = {};

        if (typeof foodConfig.can_always_eat === 'boolean') {
          foodConfigFinal.can_always_eat = foodConfig.can_always_eat;
        }

        if (typeof foodConfig.cooldown_time === 'number') {
          if (foodConfig.cooldown_time < 0) {
            throw new Error(
              '[compile component]: food: cooldown_time must be at least 0',
            );
          }
          foodConfigFinal.cooldown_time = foodConfig.cooldown_time;
        }

        if (typeof foodConfig.cooldown_type === 'string') {
          foodConfigFinal.cooldown_type = foodConfig.cooldown_type;
        }

        if (foodConfig.effects) {
          foodConfigFinal.effects = validateFoodEffects(foodConfig.effects);
        }

        if (typeof foodConfig.is_meat === 'boolean') {
          foodConfigFinal.is_meat = foodConfig.is_meat;
        }

        if (typeof foodConfig.nutrition === 'number') {
          if (foodConfig.nutrition < 0) {
            throw new Error(
              '[compile component]: food: nutrition must be at least 0',
            );
          }
          foodConfigFinal.nutrition = foodConfig.nutrition;
        }

        if (typeof foodConfig.on_use_action === 'string') {
          foodConfigFinal.on_use_action = foodConfig.on_use_action;
        }

        if (
          Array.isArray(foodConfig.on_use_range) &&
          foodConfig.on_use_range.length === 3
        ) {
          const [x, y, z] = foodConfig.on_use_range;
          if (
            typeof x === 'number' &&
            typeof y === 'number' &&
            typeof z === 'number'
          ) {
            foodConfigFinal.on_use_range = [x, y, z];
          } else {
            throw new Error(
              '[compile component]: food: on_use_range must be an array of 3 numbers',
            );
          }
        }

        if (foodConfig.saturation_modifier !== undefined) {
          const validSaturationModifiers = [
            'poor',
            'low',
            'normal',
            'good',
            'supernatural',
          ];

          if (typeof foodConfig.saturation_modifier === 'number') {
            foodConfigFinal.saturation_modifier =
              foodConfig.saturation_modifier;
          } else if (typeof foodConfig.saturation_modifier === 'string') {
            if (
              !validSaturationModifiers.includes(foodConfig.saturation_modifier)
            ) {
              throw new Error(
                `[compile component]: food: saturation_modifier string must be one of: ${validSaturationModifiers.join(', ')}. Got: ${foodConfig.saturation_modifier}`,
              );
            }
            foodConfigFinal.saturation_modifier =
              foodConfig.saturation_modifier;
          } else {
            throw new Error(
              '[compile component]: food: saturation_modifier must be a number or string',
            );
          }
        }

        if (typeof foodConfig.using_converts_to === 'string') {
          foodConfigFinal.using_converts_to = foodConfig.using_converts_to;
        }

        // Deprecated: remove_effects (only include if defined)
        if (
          foodConfig.remove_effects &&
          Array.isArray(foodConfig.remove_effects)
        ) {
          console.warn(
            '[compile component]: food: remove_effects is deprecated and no longer supported in newer versions',
          );
          foodConfigFinal.remove_effects = [...foodConfig.remove_effects];
        }

        ApplyComponents['minecraft:food'] = foodConfigFinal;
      }

      // Handle fire_resistant component (both 'minecraft:fire_resistant' and 'fire_resistant' aliases)
      const fireResistantConfig =
        components['minecraft:fire_resistant'] || components.fire_resistant;
      if (fireResistantConfig !== undefined) {
        if (typeof fireResistantConfig.value === 'boolean') {
          ApplyComponents['minecraft:fire_resistant'] = fireResistantConfig;
        } else if (fireResistantConfig.value !== undefined) {
          throw new Error(
            '[compile component]: fire_resistant: value must be a boolean',
          );
        } else {
          // If no explicit value, use default (true)
          ApplyComponents['minecraft:fire_resistant'] = { value: true };
        }
      }

      // Handle entity_placer component (both 'minecraft:entity_placer' and 'entity_placer' aliases)
      const entityPlacerConfig =
        components['minecraft:entity_placer'] || components.entity_placer;
      if (entityPlacerConfig) {
        // Check if durability component is defined (if needed for format version validation)
        const formatParts = this.#opt.format.split('.');
        const major = parseInt(formatParts[0]!);
        const minor = parseInt(formatParts[1]!);
        const patch = parseInt(formatParts[2] || '0');

        function isVersionGE(
          reqMajor: number,
          reqMinor: number,
          reqPatch: number,
        ): boolean {
          if (major > reqMajor) return true;
          if (major < reqMajor) return false;
          if (minor > reqMinor) return true;
          if (minor < reqMinor) return false;
          return patch >= reqPatch;
        }

        if (!isVersionGE(1, 19, 80)) {
          console.warn(
            '[compile component]: entity_placer: monster spawner functionality requires format version 1.19.80 or higher',
          );
        }

        const entityPlacerFinal: Record<string, unknown> = {};

        // Validate entity regex pattern
        if (typeof entityPlacerConfig.entity === 'string') {
          const entityRegex =
            /^(?:\w+(?:\.\w+):(?=\w))?(?:\w+(?:\.\w+))?(?:<((?:\w+(?:\.\w+):(?=\w))?\w+(?:\.\w+))*>)?$/;
          if (!entityRegex.test(entityPlacerConfig.entity)) {
            throw new Error(
              `[compile component]: entity_placer: entity must match the pattern "^(?:\\w+(?:.\\w+):(?=\\w))?(?:\\w+(?:.\\w+))(?:<((?:\\w+(?:.\\w+):(?=\\w))?\\w+(?:.\\w+))*>)?$". Got: ${entityPlacerConfig.entity}`,
            );
          }
          entityPlacerFinal.entity = entityPlacerConfig.entity;
        } else {
          throw new Error(
            '[compile component]: entity_placer: entity is required and must be a string',
          );
        }

        if (entityPlacerConfig.dispense_on !== undefined) {
          if (
            Array.isArray(entityPlacerConfig.dispense_on) &&
            entityPlacerConfig.dispense_on.length > 0
          ) {
            entityPlacerFinal.dispense_on = [];
            for (const dispenseOnItem of entityPlacerConfig.dispense_on) {
              if (typeof dispenseOnItem === 'string') {
                (
                  entityPlacerFinal.dispense_on as Array<
                    string | Record<string, unknown>
                  >
                ).push(dispenseOnItem);
              } else if (
                typeof dispenseOnItem === 'object' &&
                dispenseOnItem !== null
              ) {
                const dispenseOnObj: Record<string, unknown> = {};

                if (typeof dispenseOnItem.name === 'string') {
                  dispenseOnObj.name = dispenseOnItem.name;
                } else {
                  throw new Error(
                    '[compile component]: entity_placer: dispense_on object must have a name property',
                  );
                }

                if (
                  dispenseOnItem.states &&
                  typeof dispenseOnItem.states === 'object'
                ) {
                  dispenseOnObj.states = { ...dispenseOnItem.states };
                }

                if (typeof dispenseOnItem.tags === 'string') {
                  dispenseOnObj.tags = dispenseOnItem.tags;
                }

                (
                  entityPlacerFinal.dispense_on as Array<
                    string | Record<string, unknown>
                  >
                ).push(dispenseOnObj);
              } else {
                throw new Error(
                  '[compile component]: entity_placer: dispense_on items must be strings or objects',
                );
              }
            }
          } else if (!Array.isArray(entityPlacerConfig.dispense_on)) {
            throw new Error(
              '[compile component]: entity_placer: dispense_on must be an array',
            );
          } else {
            // Use empty array (default behavior)
            entityPlacerFinal.dispense_on = [];
          }
        }

        if (entityPlacerConfig.use_on !== undefined) {
          if (
            Array.isArray(entityPlacerConfig.use_on) &&
            entityPlacerConfig.use_on.length > 0
          ) {
            entityPlacerFinal.use_on = [];
            for (const useOnItem of entityPlacerConfig.use_on) {
              if (typeof useOnItem === 'string') {
                (
                  entityPlacerFinal.use_on as Array<
                    string | Record<string, unknown>
                  >
                ).push(useOnItem);
              } else if (typeof useOnItem === 'object' && useOnItem !== null) {
                const useOnObj: Record<string, unknown> = {};

                if (typeof useOnItem.name === 'string') {
                  useOnObj.name = useOnItem.name;
                } else {
                  throw new Error(
                    '[compile component]: entity_placer: use_on object must have a name property',
                  );
                }

                if (useOnItem.states && typeof useOnItem.states === 'object') {
                  useOnObj.states = { ...useOnItem.states };
                }

                if (typeof useOnItem.tags === 'string') {
                  useOnObj.tags = useOnItem.tags;
                }

                (
                  entityPlacerFinal.use_on as Array<
                    string | Record<string, unknown>
                  >
                ).push(useOnObj);
              } else {
                throw new Error(
                  '[compile component]: entity_placer: use_on items must be strings or objects',
                );
              }
            }
          } else if (!Array.isArray(entityPlacerConfig.use_on)) {
            throw new Error(
              '[compile component]: entity_placer: use_on must be an array',
            );
          } else {
            // Use empty array (default behavior)
            entityPlacerFinal.use_on = [];
          }
        }

        ApplyComponents['minecraft:entity_placer'] = entityPlacerFinal;
      }

      // Handle fuel component (both 'minecraft:fuel' and 'fuel' aliases)
      const fuelConfig = components['minecraft:fuel'] || components.fuel;
      if (fuelConfig) {
        const fuelFinal: Record<string, unknown> = {};

        if (typeof fuelConfig.duration === 'number') {
          if (fuelConfig.duration >= 0.05) {
            fuelFinal.duration = fuelConfig.duration;
          } else {
            throw new Error(
              '[compile component]: fuel: duration must be >= 0.05',
            );
          }
        } else {
          throw new Error(
            '[compile component]: fuel: duration is required and must be a number',
          );
        }

        // Check if fuel is represented as a simple number (alternative representation)
        if (typeof components.fuel === 'number' && components.fuel >= 0.05) {
          ApplyComponents['minecraft:fuel'] = { duration: components.fuel };
        } else {
          ApplyComponents['minecraft:fuel'] = fuelFinal;
        }
      } else if (typeof components.fuel === 'number') {
        // Handle simple number representation
        if (components.fuel >= 0.05) {
          ApplyComponents['minecraft:fuel'] = { duration: components.fuel };
        } else {
          throw new Error(
            '[compile component]: fuel: duration must be >= 0.05',
          );
        }
      }

      // Handle kinetic_weapon component (both 'minecraft:kinetic_weapon' and 'kinetic_weapon' aliases)
      const kineticWeaponConfig =
        components['minecraft:kinetic_weapon'] || components.kinetic_weapon;
      if (kineticWeaponConfig) {
        const kineticWeaponFinal: Record<string, unknown> = {};

        // Validate creative_reach if present
        if (kineticWeaponConfig.creative_reach !== undefined) {
          if (typeof kineticWeaponConfig.creative_reach === 'object') {
            kineticWeaponFinal.creative_reach = {
              ...kineticWeaponConfig.creative_reach,
            };
            if (
              kineticWeaponConfig.creative_reach.min !== undefined &&
              typeof kineticWeaponConfig.creative_reach.min !== 'number'
            ) {
              throw new Error(
                '[compile component]: kinetic_weapon: creative_reach.min must be a number',
              );
            }
            if (
              kineticWeaponConfig.creative_reach.max !== undefined &&
              typeof kineticWeaponConfig.creative_reach.max !== 'number'
            ) {
              throw new Error(
                '[compile component]: kinetic_weapon: creative_reach.max must be a number',
              );
            }
          } else {
            throw new Error(
              '[compile component]: kinetic_weapon: creative_reach must be an object',
            );
          }
        }

        // Validate damage_conditions if present
        if (kineticWeaponConfig.damage_conditions !== undefined) {
          if (typeof kineticWeaponConfig.damage_conditions === 'object') {
            kineticWeaponFinal.damage_conditions = {
              ...kineticWeaponConfig.damage_conditions,
            };
            if (
              kineticWeaponConfig.damage_conditions.max_duration !==
                undefined &&
              typeof kineticWeaponConfig.damage_conditions.max_duration !==
                'number'
            ) {
              throw new Error(
                '[compile component]: kinetic_weapon: damage_conditions.max_duration must be a number',
              );
            }
            if (
              kineticWeaponConfig.damage_conditions.min_relative_speed !==
                undefined &&
              typeof kineticWeaponConfig.damage_conditions
                .min_relative_speed !== 'number'
            ) {
              throw new Error(
                '[compile component]: kinetic_weapon: damage_conditions.min_relative_speed must be a number',
              );
            }
            if (
              kineticWeaponConfig.damage_conditions.min_speed !== undefined &&
              typeof kineticWeaponConfig.damage_conditions.min_speed !==
                'number'
            ) {
              throw new Error(
                '[compile component]: kinetic_weapon: damage_conditions.min_speed must be a number',
              );
            }
          } else {
            throw new Error(
              '[compile component]: kinetic_weapon: damage_conditions must be an object',
            );
          }
        }

        // Validate numeric properties
        if (kineticWeaponConfig.damage_modifier !== undefined) {
          if (typeof kineticWeaponConfig.damage_modifier === 'number') {
            kineticWeaponFinal.damage_modifier =
              kineticWeaponConfig.damage_modifier;
          } else {
            throw new Error(
              '[compile component]: kinetic_weapon: damage_modifier must be a number',
            );
          }
        }

        if (kineticWeaponConfig.damage_multiplier !== undefined) {
          if (typeof kineticWeaponConfig.damage_multiplier === 'number') {
            kineticWeaponFinal.damage_multiplier =
              kineticWeaponConfig.damage_multiplier;
          } else {
            throw new Error(
              '[compile component]: kinetic_weapon: damage_multiplier must be a number',
            );
          }
        }

        if (kineticWeaponConfig.delay !== undefined) {
          if (typeof kineticWeaponConfig.delay === 'number') {
            kineticWeaponFinal.delay = kineticWeaponConfig.delay;
          } else {
            throw new Error(
              '[compile component]: kinetic_weapon: delay must be a number',
            );
          }
        }

        if (kineticWeaponConfig.hitbox_margin !== undefined) {
          if (typeof kineticWeaponConfig.hitbox_margin === 'number') {
            kineticWeaponFinal.hitbox_margin =
              kineticWeaponConfig.hitbox_margin;
          } else {
            throw new Error(
              '[compile component]: kinetic_weapon: hitbox_margin must be a number',
            );
          }
        }

        // Validate dismount_conditions if present
        if (kineticWeaponConfig.dismount_conditions !== undefined) {
          if (typeof kineticWeaponConfig.dismount_conditions === 'object') {
            kineticWeaponFinal.dismount_conditions = {
              ...kineticWeaponConfig.dismount_conditions,
            };
            if (
              kineticWeaponConfig.dismount_conditions.max_duration !==
                undefined &&
              typeof kineticWeaponConfig.dismount_conditions.max_duration !==
                'number'
            ) {
              throw new Error(
                '[compile component]: kinetic_weapon: dismount_conditions.max_duration must be a number',
              );
            }
            if (
              kineticWeaponConfig.dismount_conditions.min_relative_speed !==
                undefined &&
              typeof kineticWeaponConfig.dismount_conditions
                .min_relative_speed !== 'number'
            ) {
              throw new Error(
                '[compile component]: kinetic_weapon: dismount_conditions.min_relative_speed must be a number',
              );
            }
            if (
              kineticWeaponConfig.dismount_conditions.min_speed !== undefined &&
              typeof kineticWeaponConfig.dismount_conditions.min_speed !==
                'number'
            ) {
              throw new Error(
                '[compile component]: kinetic_weapon: dismount_conditions.min_speed must be a number',
              );
            }
          } else {
            throw new Error(
              '[compile component]: kinetic_weapon: dismount_conditions must be an object',
            );
          }
        }

        // Validate knockback_conditions if present
        if (kineticWeaponConfig.knockback_conditions !== undefined) {
          if (typeof kineticWeaponConfig.knockback_conditions === 'object') {
            kineticWeaponFinal.knockback_conditions = {
              ...kineticWeaponConfig.knockback_conditions,
            };
            if (
              kineticWeaponConfig.knockback_conditions.max_duration !==
                undefined &&
              typeof kineticWeaponConfig.knockback_conditions.max_duration !==
                'number'
            ) {
              throw new Error(
                '[compile component]: kinetic_weapon: knockback_conditions.max_duration must be a number',
              );
            }
            if (
              kineticWeaponConfig.knockback_conditions.min_relative_speed !==
                undefined &&
              typeof kineticWeaponConfig.knockback_conditions
                .min_relative_speed !== 'number'
            ) {
              throw new Error(
                '[compile component]: kinetic_weapon: knockback_conditions.min_relative_speed must be a number',
              );
            }
            if (
              kineticWeaponConfig.knockback_conditions.min_speed !==
                undefined &&
              typeof kineticWeaponConfig.knockback_conditions.min_speed !==
                'number'
            ) {
              throw new Error(
                '[compile component]: kinetic_weapon: knockback_conditions.min_speed must be a number',
              );
            }
          } else {
            throw new Error(
              '[compile component]: kinetic_weapon: knockback_conditions must be an object',
            );
          }
        }

        // Validate kinetic_effect_conditions if present
        if (kineticWeaponConfig.kinetic_effect_conditions !== undefined) {
          if (
            typeof kineticWeaponConfig.kinetic_effect_conditions === 'object'
          ) {
            kineticWeaponFinal.kinetic_effect_conditions = {
              ...kineticWeaponConfig.kinetic_effect_conditions,
            };
            if (
              kineticWeaponConfig.kinetic_effect_conditions.max_duration !==
                undefined &&
              typeof kineticWeaponConfig.kinetic_effect_conditions
                .max_duration !== 'number'
            ) {
              throw new Error(
                '[compile component]: kinetic_weapon: kinetic_effect_conditions.max_duration must be a number',
              );
            }
            if (
              kineticWeaponConfig.kinetic_effect_conditions
                .min_relative_speed !== undefined &&
              typeof kineticWeaponConfig.kinetic_effect_conditions
                .min_relative_speed !== 'number'
            ) {
              throw new Error(
                '[compile component]: kinetic_weapon: kinetic_effect_conditions.min_relative_speed must be a number',
              );
            }
            if (
              kineticWeaponConfig.kinetic_effect_conditions.min_speed !==
                undefined &&
              typeof kineticWeaponConfig.kinetic_effect_conditions.min_speed !==
                'number'
            ) {
              throw new Error(
                '[compile component]: kinetic_weapon: kinetic_effect_conditions.min_speed must be a number',
              );
            }
          } else {
            throw new Error(
              '[compile component]: kinetic_weapon: kinetic_effect_conditions must be an object',
            );
          }
        }

        // Validate reach if present
        if (kineticWeaponConfig.reach !== undefined) {
          if (typeof kineticWeaponConfig.reach === 'object') {
            kineticWeaponFinal.reach = { ...kineticWeaponConfig.reach };
            if (
              kineticWeaponConfig.reach.min !== undefined &&
              typeof kineticWeaponConfig.reach.min !== 'number'
            ) {
              throw new Error(
                '[compile component]: kinetic_weapon: reach.min must be a number',
              );
            }
            if (
              kineticWeaponConfig.reach.max !== undefined &&
              typeof kineticWeaponConfig.reach.max !== 'number'
            ) {
              throw new Error(
                '[compile component]: kinetic_weapon: reach.max must be a number',
              );
            }
          } else {
            throw new Error(
              '[compile component]: kinetic_weapon: reach must be an object',
            );
          }
        }

        ApplyComponents['minecraft:kinetic_weapon'] = kineticWeaponFinal;
      }

      // Handle interact_button component (both 'minecraft:interact_button' and 'interact_button' aliases)
      const interactButtonConfig =
        components['minecraft:interact_button'] || components.interact_button;
      if (interactButtonConfig !== undefined) {
        if (
          typeof interactButtonConfig === 'boolean' ||
          typeof interactButtonConfig === 'string'
        ) {
          ApplyComponents['minecraft:interact_button'] = interactButtonConfig;
        } else {
          throw new Error(
            '[compile component]: interact_button: must be a boolean or string',
          );
        }
      }

      // Handle hover_text_color component (both 'minecraft:hover_text_color' and 'hover_text_color' aliases)
      const hoverTextColorConfig =
        components['minecraft:hover_text_color'] || components.hover_text_color;
      if (hoverTextColorConfig) {
        const hoverTextColorFinal: Record<string, unknown> = {};

        if (typeof hoverTextColorConfig === 'string') {
          // Alternative string representation
          hoverTextColorFinal.value = hoverTextColorConfig;
        } else if (typeof hoverTextColorConfig === 'object') {
          // Object representation
          if (hoverTextColorConfig.value !== undefined) {
            if (typeof hoverTextColorConfig.value === 'string') {
              hoverTextColorFinal.value = hoverTextColorConfig.value;
            } else {
              throw new Error(
                '[compile component]: hover_text_color: value must be a string',
              );
            }
          } else {
            throw new Error(
              '[compile component]: hover_text_color: value is required',
            );
          }
        } else {
          throw new Error(
            '[compile component]: hover_text_color: must be a string or object',
          );
        }

        ApplyComponents['minecraft:hover_text_color'] = hoverTextColorFinal;
      }

      // Handle liquid_clipped component (both 'minecraft:liquid_clipped' and 'liquid_clipped' aliases)
      const liquidClippedConfig =
        components['minecraft:liquid_clipped'] || components.liquid_clipped;
      if (liquidClippedConfig !== undefined) {
        if (typeof liquidClippedConfig === 'boolean') {
          // Alternative boolean representation
          ApplyComponents['minecraft:liquid_clipped'] = liquidClippedConfig;
        } else if (typeof liquidClippedConfig === 'object') {
          // Object representation
          const liquidClippedFinal: Record<string, unknown> = {};

          if (liquidClippedConfig.value !== undefined) {
            if (typeof liquidClippedConfig.value === 'boolean') {
              liquidClippedFinal.value = liquidClippedConfig.value;
            } else {
              throw new Error(
                '[compile component]: liquid_clipped: value must be a boolean',
              );
            }
          } else {
            throw new Error(
              '[compile component]: liquid_clipped: value is required',
            );
          }

          ApplyComponents['minecraft:liquid_clipped'] = liquidClippedFinal;
        } else {
          throw new Error(
            '[compile component]: liquid_clipped: must be a boolean or object',
          );
        }
      }

      // Handle max_stack_size component (both 'minecraft:max_stack_size' and 'max_stack_size' aliases)
      const maxStackSizeConfig =
        components['minecraft:max_stack_size'] || components.max_stack_size;
      if (maxStackSizeConfig !== undefined) {
        if (typeof maxStackSizeConfig === 'number') {
          // Alternative number representation
          ApplyComponents['minecraft:max_stack_size'] = maxStackSizeConfig;
        } else if (typeof maxStackSizeConfig === 'object') {
          // Object representation
          const maxStackSizeFinal: Record<string, unknown> = {};

          if (maxStackSizeConfig.value !== undefined) {
            if (typeof maxStackSizeConfig.value === 'number') {
              maxStackSizeFinal.value = maxStackSizeConfig.value;
            } else {
              throw new Error(
                '[compile component]: max_stack_size: value must be a number',
              );
            }
          } else {
            throw new Error(
              '[compile component]: max_stack_size: value is required',
            );
          }

          ApplyComponents['minecraft:max_stack_size'] = maxStackSizeFinal;
        } else {
          throw new Error(
            '[compile component]: max_stack_size: must be a number or object',
          );
        }
      }

      // Handle piercing_weapon component (both 'minecraft:piercing_weapon' and 'piercing_weapon' aliases)
      const piercingWeaponConfig =
        (components as Record<string, unknown>)['minecraft:piercing_weapon'] ||
        (components as Record<string, unknown>).piercing_weapon;
      if (piercingWeaponConfig !== undefined) {
        if (
          typeof piercingWeaponConfig === 'object' &&
          piercingWeaponConfig !== null
        ) {
          const cfg = piercingWeaponConfig as Record<string, unknown>;
          const piercingWeaponFinal: Record<string, unknown> = {};

          if (cfg.creative_reach !== undefined) {
            const creativeReachFinal: Record<string, unknown> = {};
            const creativeReachCfg = cfg.creative_reach as Record<
              string,
              unknown
            >;
            if (typeof creativeReachCfg.max === 'number') {
              creativeReachFinal.max = creativeReachCfg.max;
            }
            if (typeof creativeReachCfg.min === 'number') {
              creativeReachFinal.min = creativeReachCfg.min;
            }
            piercingWeaponFinal.creative_reach = creativeReachFinal;
          }

          if (typeof cfg.hitbox_margin === 'number') {
            piercingWeaponFinal.hitbox_margin = cfg.hitbox_margin;
          }

          if (cfg.reach !== undefined) {
            const reachFinal: Record<string, unknown> = {};
            const reachCfg = cfg.reach as Record<string, unknown>;
            if (typeof reachCfg.max === 'number') {
              reachFinal.max = reachCfg.max;
            }
            if (typeof reachCfg.min === 'number') {
              reachFinal.min = reachCfg.min;
            }
            piercingWeaponFinal.reach = reachFinal;
          }

          ApplyComponents['minecraft:piercing_weapon'] = piercingWeaponFinal;
        } else {
          throw new Error(
            '[compile component]: piercing_weapon: must be an object',
          );
        }
      }

      // Handle projectile component (both 'minecraft:projectile' and 'projectile' aliases)
      const projectileConfig =
        (components as Record<string, unknown>)['minecraft:projectile'] ||
        (components as Record<string, unknown>).projectile;
      if (projectileConfig !== undefined) {
        if (typeof projectileConfig === 'object' && projectileConfig !== null) {
          const cfg = projectileConfig as Record<string, unknown>;
          const projectileFinal: Record<string, unknown> = {};

          if (typeof cfg.minimum_critical_power === 'number') {
            if (cfg.minimum_critical_power < 0) {
              throw new Error(
                '[compile component]: projectile: minimum_critical_power must be >= 0',
              );
            }
            projectileFinal.minimum_critical_power = cfg.minimum_critical_power;
          }

          if (typeof cfg.projectile_entity === 'string') {
            const entityPattern =
              /^(?:\w+(?:\.\w+):(?=\w))?(?:\w+(?:\.\w+))(?:<((?:\w+(?:\.\w+):(?=\w))?\w+(?:\.\w+))*>)?$/;
            if (!entityPattern.test(cfg.projectile_entity)) {
              throw new Error(
                '[compile component]: projectile: projectile_entity must match pattern ^(?:\\w+(?:\\.\\w+):(?=\\w))?(?:\\w+(?:\\.\\w+))(?:<((?:\\w+(?:\\.\\w+):(?=\\w))?\\w+(?:\\.\\w+))*>)?$',
              );
            }
            projectileFinal.projectile_entity = cfg.projectile_entity;
          } else {
            throw new Error(
              '[compile component]: projectile: projectile_entity is required and must be a string',
            );
          }

          ApplyComponents['minecraft:projectile'] = projectileFinal;
        } else {
          throw new Error('[compile component]: projectile: must be an object');
        }
      }

      // Handle record component (both 'minecraft:record' and 'record' aliases)
      const recordConfig =
        (components as Record<string, unknown>)['minecraft:record'] ||
        (components as Record<string, unknown>).record;
      if (recordConfig !== undefined) {
        if (typeof recordConfig === 'object' && recordConfig !== null) {
          const cfg = recordConfig as Record<string, unknown>;
          const recordFinal: Record<string, unknown> = {};

          if (typeof cfg.comparator_signal === 'number') {
            if (cfg.comparator_signal < 0) {
              throw new Error(
                '[compile component]: record: comparator_signal must be >= 0',
              );
            }
            recordFinal.comparator_signal = cfg.comparator_signal;
          }

          if (typeof cfg.duration === 'number') {
            if (cfg.duration <= 0) {
              throw new Error(
                '[compile component]: record: duration must be > 0',
              );
            }
            recordFinal.duration = cfg.duration;
          }

          if (typeof cfg.sound_event === 'string') {
            recordFinal.sound_event = cfg.sound_event;
          } else {
            throw new Error(
              '[compile component]: record: sound_event is required and must be a string',
            );
          }

          ApplyComponents['minecraft:record'] = recordFinal;
        } else {
          throw new Error('[compile component]: record: must be an object');
        }
      }

      // Handle rarity component (both 'minecraft:rarity' and 'rarity' aliases)
      const rarityConfig =
        (components as Record<string, unknown>)['minecraft:rarity'] ||
        (components as Record<string, unknown>).rarity;
      if (rarityConfig !== undefined) {
        if (typeof rarityConfig === 'object' && rarityConfig !== null) {
          const cfg = rarityConfig as Record<string, unknown>;
          const rarityFinal: Record<string, unknown> = {};

          if (typeof cfg.value === 'string') {
            const validRarities = [
              'common',
              'uncommon',
              'rare',
              'epic',
            ] as const;
            if (!validRarities.includes(cfg.value as never)) {
              throw new Error(
                '[compile component]: rarity: value must be one of: common, uncommon, rare, epic',
              );
            }
            rarityFinal.value = cfg.value;
          } else {
            throw new Error(
              '[compile component]: rarity: value is required and must be a string',
            );
          }

          // Validate format version for rarity component (requires 1.21.30+)
          const formatParts = this.#opt.format.split('.');
          const formatVersion = parseFloat(
            formatParts[1] + '.' + formatParts[2],
          );
          const patchVersion = formatParts[3] ? parseInt(formatParts[3]) : 0;

          if (
            formatVersion < 1.21 ||
            (formatVersion === 1.21 && patchVersion < 30)
          ) {
            throw new Error(
              '[compile component]: rarity component requires format version 1.21.30 or higher',
            );
          }

          ApplyComponents['minecraft:rarity'] = rarityFinal;
        } else {
          throw new Error('[compile component]: rarity: must be an object');
        }
      }

      // Handle repairable component (both 'minecraft:repairable' and 'repairable' aliases)
      const repairableConfig =
        (components as Record<string, unknown>)['minecraft:repairable'] ||
        (components as Record<string, unknown>).repairable;
      if (repairableConfig !== undefined) {
        if (typeof repairableConfig === 'object' && repairableConfig !== null) {
          const cfg = repairableConfig as Record<string, unknown>;
          const repairableFinal: Record<string, unknown> = {};

          // Handle on_repaired event
          if (cfg.on_repaired !== undefined) {
            if (typeof cfg.on_repaired === 'string') {
              const eventRegex = /^[a-zA-Z_]\w*(?::[a-zA-Z_]\w*)?$/;
              if (!eventRegex.test(cfg.on_repaired)) {
                throw new Error(
                  '[compile component]: repairable: on_repaired must be a valid event identifier pattern',
                );
              }
              repairableFinal.on_repaired = cfg.on_repaired;
            } else {
              throw new Error(
                '[compile component]: repairable: on_repaired must be a string',
              );
            }
          }

          // Handle repair_items array
          if (cfg.repair_items !== undefined) {
            if (Array.isArray(cfg.repair_items)) {
              const repairItemsFinal: Record<string, unknown>[] = [];

              for (const repairItem of cfg.repair_items) {
                if (typeof repairItem === 'string') {
                  // Simple string format - just add as is
                  (
                    repairItemsFinal as (string | Record<string, unknown>)[]
                  ).push(repairItem);
                } else if (
                  typeof repairItem === 'object' &&
                  repairItem !== null
                ) {
                  // Complex object format with items and repair_amount
                  const repairItemFinal: Record<string, unknown> = {};

                  // Validate items array
                  if (Array.isArray(repairItem.items)) {
                    const itemsValid = repairItem.items.every(
                      (item: unknown) => {
                        if (typeof item !== 'string') return false;
                        const itemRegex = /^[a-zA-Z_]\w*(?::[a-zA-Z_]\w*)?$/;
                        return itemRegex.test(item);
                      },
                    );

                    if (!itemsValid) {
                      throw new Error(
                        '[compile component]: repairable: repair_items items must be valid Minecraft item identifiers',
                      );
                    }

                    repairItemFinal.items = [...repairItem.items];
                  } else {
                    throw new Error(
                      '[compile component]: repairable: repair_items items must be an array of strings',
                    );
                  }

                  // Validate repair_amount (optional)
                  if (repairItem.repair_amount !== undefined) {
                    if (
                      typeof repairItem.repair_amount === 'string' ||
                      typeof repairItem.repair_amount === 'number'
                    ) {
                      repairItemFinal.repair_amount = repairItem.repair_amount;
                    } else {
                      throw new Error(
                        '[compile component]: repairable: repair_amount must be a string or number',
                      );
                    }
                  }

                  repairItemsFinal.push(repairItemFinal);
                } else {
                  throw new Error(
                    '[compile component]: repairable: each repair_items entry must be a string or object',
                  );
                }
              }

              repairableFinal.repair_items = repairItemsFinal;
            } else {
              throw new Error(
                '[compile component]: repairable: repair_items must be an array',
              );
            }
          }

          ApplyComponents['minecraft:repairable'] = repairableFinal;
        } else {
          throw new Error('[compile component]: repairable: must be an object');
        }
      }

      // Handle seed component (both 'minecraft:seed' and 'seed' aliases)
      const seedConfig =
        (components as Record<string, unknown>)['minecraft:seed'] ||
        (components as Record<string, unknown>).seed;
      if (seedConfig !== undefined) {
        if (typeof seedConfig === 'object' && seedConfig !== null) {
          const cfg = seedConfig as Record<string, unknown>;
          const seedFinal: Record<string, unknown> = {};

          // Validate format version for seed component (requires 1.10.0+)
          const formatParts = this.#opt.format.split('.');
          const formatVersion = parseFloat(
            formatParts[1] + '.' + formatParts[2],
          );
          const patchVersion = formatParts[3] ? parseInt(formatParts[3]) : 0;

          if (
            formatVersion < 1.1 ||
            (formatVersion === 1.1 && patchVersion < 0)
          ) {
            throw new Error(
              '[compile component]: seed component requires format version 1.10.0 or higher',
            );
          }

          // Handle crop_result (required)
          if (cfg.crop_result !== undefined) {
            if (typeof cfg.crop_result === 'string') {
              const blockRegex = /^\w+(?::\w+)*$/;
              if (!blockRegex.test(cfg.crop_result)) {
                throw new Error(
                  '[compile component]: seed: crop_result must be a valid block identifier',
                );
              }
              seedFinal.crop_result = cfg.crop_result;
            } else {
              throw new Error(
                '[compile component]: seed: crop_result is required and must be a string',
              );
            }
          } else {
            throw new Error(
              '[compile component]: seed: crop_result is required',
            );
          }

          // Handle plant_at array
          if (cfg.plant_at !== undefined) {
            if (Array.isArray(cfg.plant_at)) {
              const plantAtValid = cfg.plant_at.every((block: unknown) => {
                if (typeof block !== 'string') return false;
                const blockRegex = /^\w+(?::\w+)*$/;
                return blockRegex.test(block);
              });

              if (!plantAtValid) {
                throw new Error(
                  '[compile component]: seed: plant_at entries must be valid block identifiers',
                );
              }

              seedFinal.plant_at = [...cfg.plant_at];
            } else {
              throw new Error(
                '[compile component]: seed: plant_at must be an array of strings',
              );
            }
          }

          // Handle deprecated properties (with warnings based on format version)
          if (cfg.plant_at_any_solid_surface !== undefined) {
            if (typeof cfg.plant_at_any_solid_surface === 'boolean') {
              // Check if format version supports this deprecated property
              if (formatVersion >= 1.19) {
                throw new Error(
                  '[compile component]: seed: plant_at_any_solid_surface is deprecated and no longer works after format versions of at least 1.19.0',
                );
              }
              seedFinal.plant_at_any_solid_surface =
                cfg.plant_at_any_solid_surface;
            } else {
              throw new Error(
                '[compile component]: seed: plant_at_any_solid_surface must be a boolean',
              );
            }
          }

          if (cfg.plant_at_face !== undefined) {
            if (typeof cfg.plant_at_face === 'string') {
              const validFaces = ['UP', 'DOWN'] as const;
              if (!validFaces.includes(cfg.plant_at_face as never)) {
                throw new Error(
                  "[compile component]: seed: plant_at_face must be either 'UP' or 'DOWN'",
                );
              }
              // Check if format version supports this deprecated property
              if (formatVersion >= 1.19) {
                throw new Error(
                  '[compile component]: seed: plant_at_face is deprecated and no longer works after format versions of at least 1.19.0',
                );
              }
              seedFinal.plant_at_face = cfg.plant_at_face;
            } else {
              throw new Error(
                '[compile component]: seed: plant_at_face must be a string',
              );
            }
          }

          ApplyComponents['minecraft:seed'] = seedFinal;
        } else {
          throw new Error('[compile component]: seed: must be an object');
        }
      }

      // Handle stacked_by_data component (both 'minecraft:stacked_by_data' and 'stacked_by_data' aliases)
      const stackedByDataConfig =
        (components as Record<string, unknown>)['minecraft:stacked_by_data'] ||
        (components as Record<string, unknown>).stacked_by_data;
      if (stackedByDataConfig !== undefined) {
        if (
          typeof stackedByDataConfig === 'object' &&
          stackedByDataConfig !== null
        ) {
          const cfg = stackedByDataConfig as Record<string, unknown>;
          const stackedByDataFinal: Record<string, unknown> = {};

          if (cfg.value === undefined) {
            stackedByDataFinal.value = true;
          } else if (typeof cfg.value === 'boolean') {
            stackedByDataFinal.value = cfg.value;
          } else {
            throw new Error(
              '[compile component]: stacked_by_data: value must be a boolean if provided',
            );
          }

          ApplyComponents['minecraft:stacked_by_data'] = stackedByDataFinal;
        } else {
          throw new Error(
            '[compile component]: stacked_by_data: must be an object',
          );
        }
      }

      // Handle should_despawn component (both 'minecraft:should_despawn' and 'should_despawn' aliases)
      const shouldDespawnConfig =
        (components as Record<string, unknown>)['minecraft:should_despawn'] ||
        (components as Record<string, unknown>).should_despawn;
      if (shouldDespawnConfig !== undefined) {
        if (
          typeof shouldDespawnConfig === 'object' &&
          shouldDespawnConfig !== null
        ) {
          const cfg = shouldDespawnConfig as Record<string, unknown>;
          const shouldDespawnFinal: Record<string, unknown> = {};

          if (cfg.value === undefined) {
            shouldDespawnFinal.value = true;
          } else if (typeof cfg.value === 'boolean') {
            shouldDespawnFinal.value = cfg.value;
          } else {
            throw new Error(
              '[compile component]: should_despawn: value must be a boolean if provided',
            );
          }

          ApplyComponents['minecraft:should_despawn'] = shouldDespawnFinal;
        } else {
          throw new Error(
            '[compile component]: should_despawn: must be an object',
          );
        }
      }

      // Handle shooter component (both 'minecraft:shooter' and 'shooter' aliases)
      const shooterConfig =
        (components as Record<string, unknown>)['minecraft:shooter'] ||
        (components as Record<string, unknown>).shooter;
      if (shooterConfig !== undefined) {
        if (typeof shooterConfig === 'object' && shooterConfig !== null) {
          const cfg = shooterConfig as Record<string, unknown>;
          const shooterFinal: Record<string, unknown> = {};

          // Validate format version for shooter component
          const formatParts = this.#opt.format.split('.');
          const formatVersion = parseFloat(
            formatParts[1] + '.' + formatParts[2],
          );
          const patchVersion = formatParts[3] ? parseInt(formatParts[3]) : 0;

          if (
            formatVersion < 1.16 ||
            (formatVersion === 1.16 && patchVersion < 100)
          ) {
            throw new Error(
              '[compile component]: shooter component requires format version 1.16.100 or higher',
            );
          }

          // Handle ammunition (required)
          if (cfg.ammunition === undefined) {
            throw new Error(
              '[compile component]: shooter: ammunition is required',
            );
          }

          if (Array.isArray(cfg.ammunition)) {
            const ammunitionFinal: Record<string, unknown>[] = [];

            for (const ammunitionItem of cfg.ammunition) {
              if (typeof ammunitionItem === 'string') {
                // Simple string format - just add as is
                const itemRegex = /^[a-zA-Z_]\w*(?::[a-zA-Z_]\w*)?$/;
                if (!itemRegex.test(ammunitionItem)) {
                  throw new Error(
                    '[compile component]: shooter: ammunition entries must be valid item identifiers when using string format',
                  );
                }
                (ammunitionFinal as (string | Record<string, unknown>)[]).push(
                  ammunitionItem,
                );
              } else if (
                typeof ammunitionItem === 'object' &&
                ammunitionItem !== null
              ) {
                // Complex object format with detailed properties
                const ammunitionObject: Record<string, unknown> = {};

                // Validate item (required)
                if (typeof ammunitionItem.item === 'string') {
                  const itemRegex = /^[a-zA-Z_]\w*(?::[a-zA-Z_]\w*)?$/;
                  if (!itemRegex.test(ammunitionItem.item)) {
                    throw new Error(
                      '[compile component]: shooter: ammunition item property must be a valid item identifier',
                    );
                  }
                  ammunitionObject.item = ammunitionItem.item;
                } else {
                  throw new Error(
                    '[compile component]: shooter: ammunition item property is required and must be a string',
                  );
                }

                // Handle launch_power_scale (optional)
                if (ammunitionItem.launch_power_scale !== undefined) {
                  if (
                    typeof ammunitionItem.launch_power_scale === 'number' &&
                    ammunitionItem.launch_power_scale > 0
                  ) {
                    ammunitionObject.launch_power_scale =
                      ammunitionItem.launch_power_scale;
                  } else {
                    throw new Error(
                      '[compile component]: shooter: ammunition launch_power_scale must be a positive number',
                    );
                  }
                }

                // Handle max_draw_duration (optional)
                if (ammunitionItem.max_draw_duration !== undefined) {
                  if (
                    typeof ammunitionItem.max_draw_duration === 'number' &&
                    ammunitionItem.max_draw_duration >= 0
                  ) {
                    ammunitionObject.max_draw_duration =
                      ammunitionItem.max_draw_duration;
                  } else {
                    throw new Error(
                      '[compile component]: shooter: ammunition max_draw_duration must be a non-negative number',
                    );
                  }
                }

                // Handle charge_on_draw (optional)
                if (ammunitionItem.charge_on_draw !== undefined) {
                  if (typeof ammunitionItem.charge_on_draw === 'boolean') {
                    ammunitionObject.charge_on_draw =
                      ammunitionItem.charge_on_draw;
                  } else {
                    throw new Error(
                      '[compile component]: shooter: ammunition charge_on_draw must be a boolean',
                    );
                  }
                }

                ammunitionFinal.push(ammunitionObject);
              } else {
                throw new Error(
                  '[compile component]: shooter: ammunition entries must be strings or objects',
                );
              }
            }

            shooterFinal.ammunition = ammunitionFinal;
          } else {
            throw new Error(
              '[compile component]: shooter: ammunition must be an array',
            );
          }

          // Handle charge_on_draw (optional)
          if (cfg.charge_on_draw !== undefined) {
            if (typeof cfg.charge_on_draw === 'boolean') {
              shooterFinal.charge_on_draw = cfg.charge_on_draw;
            } else {
              throw new Error(
                '[compile component]: shooter: charge_on_draw must be a boolean',
              );
            }
          }

          // Handle max_draw_duration (optional)
          if (cfg.max_draw_duration !== undefined) {
            if (
              typeof cfg.max_draw_duration === 'number' &&
              cfg.max_draw_duration >= 0
            ) {
              shooterFinal.max_draw_duration = cfg.max_draw_duration;
            } else {
              throw new Error(
                '[compile component]: shooter: max_draw_duration must be a non-negative number',
              );
            }
          }

          // Handle auto_charge (optional)
          if (cfg.auto_charge !== undefined) {
            if (typeof cfg.auto_charge === 'boolean') {
              shooterFinal.auto_charge = cfg.auto_charge;
            } else {
              throw new Error(
                '[compile component]: shooter: auto_charge must be a boolean',
              );
            }
          }

          // Handle launch_power (optional)
          if (cfg.launch_power !== undefined) {
            if (typeof cfg.launch_power === 'number' && cfg.launch_power >= 0) {
              shooterFinal.launch_power = cfg.launch_power;
            } else {
              throw new Error(
                '[compile component]: shooter: launch_power must be a non-negative number',
              );
            }
          }

          // Handle scale_power_by_draw_duration (optional)
          if (cfg.scale_power_by_draw_duration !== undefined) {
            if (typeof cfg.scale_power_by_draw_duration === 'boolean') {
              shooterFinal.scale_power_by_draw_duration =
                cfg.scale_power_by_draw_duration;
            } else {
              throw new Error(
                '[compile component]: shooter: scale_power_by_draw_duration must be a boolean',
              );
            }
          }

          ApplyComponents['minecraft:shooter'] = shooterFinal;
        } else {
          throw new Error('[compile component]: shooter: must be an object');
        }
      }

      // Handle storage_weight_modifier component
      const storageWeightModifierConfig =
        components['minecraft:storage_weight_modifier'] ||
        components.storage_weight_modifier;
      if (storageWeightModifierConfig !== undefined) {
        if (
          typeof storageWeightModifierConfig === 'object' &&
          storageWeightModifierConfig !== null
        ) {
          const storageWeightModifierFinal: Record<string, unknown> = {};

          // Validate format version (requires 1.21.40+)
          const formatParts = this.#opt.format.split('.');
          const formatVersion = parseFloat(
            formatParts[1] + '.' + formatParts[2],
          );
          const patchVersion = formatParts[3] ? parseInt(formatParts[3]) : 0;

          if (
            formatVersion < 1.21 ||
            (formatVersion === 1.21 && patchVersion < 40)
          ) {
            throw new Error(
              '[compile component]: storage_weight_modifier component requires format version 1.21.40 or higher',
            );
          }

          // Handle weight_in_storage_item (required)
          if (
            storageWeightModifierConfig.weight_in_storage_item === undefined
          ) {
            throw new Error(
              '[compile component]: storage_weight_modifier: weight_in_storage_item is required',
            );
          }

          if (
            typeof storageWeightModifierConfig.weight_in_storage_item !==
            'number'
          ) {
            throw new Error(
              '[compile component]: storage_weight_modifier: weight_in_storage_item must be a number',
            );
          }

          if (
            storageWeightModifierConfig.weight_in_storage_item < 0 ||
            storageWeightModifierConfig.weight_in_storage_item > 64
          ) {
            throw new Error(
              '[compile component]: storage_weight_modifier: weight_in_storage_item must be between 0 and 64',
            );
          }

          storageWeightModifierFinal.weight_in_storage_item =
            storageWeightModifierConfig.weight_in_storage_item;

          ApplyComponents['minecraft:storage_weight_modifier'] =
            storageWeightModifierFinal;
        } else {
          throw new Error(
            '[compile component]: storage_weight_modifier: must be an object',
          );
        }
      }

      // Handle storage_weight_limit component
      const storageWeightLimitConfig =
        components['minecraft:storage_weight_limit'] ||
        components.storage_weight_limit;
      if (storageWeightLimitConfig !== undefined) {
        if (
          typeof storageWeightLimitConfig === 'object' &&
          storageWeightLimitConfig !== null
        ) {
          const storageWeightLimitFinal: Record<string, unknown> = {};

          // Validate format version (requires 1.21.40+)
          const formatParts = this.#opt.format.split('.');
          const formatVersion = parseFloat(
            formatParts[1] + '.' + formatParts[2],
          );
          const patchVersion = formatParts[3] ? parseInt(formatParts[3]) : 0;

          if (
            formatVersion < 1.21 ||
            (formatVersion === 1.21 && patchVersion < 40)
          ) {
            throw new Error(
              '[compile component]: storage_weight_limit component requires format version 1.21.40 or higher',
            );
          }

          // Handle max_weight_limit (required)
          if (storageWeightLimitConfig.max_weight_limit === undefined) {
            throw new Error(
              '[compile component]: storage_weight_limit: max_weight_limit is required',
            );
          }

          if (typeof storageWeightLimitConfig.max_weight_limit !== 'number') {
            throw new Error(
              '[compile component]: storage_weight_limit: max_weight_limit must be a number',
            );
          }

          if (
            storageWeightLimitConfig.max_weight_limit <= 0 ||
            storageWeightLimitConfig.max_weight_limit > 64
          ) {
            throw new Error(
              '[compile component]: storage_weight_limit: max_weight_limit must be between 0 and 64',
            );
          }

          storageWeightLimitFinal.max_weight_limit =
            storageWeightLimitConfig.max_weight_limit;

          ApplyComponents['minecraft:storage_weight_limit'] =
            storageWeightLimitFinal;
        } else {
          throw new Error(
            '[compile component]: storage_weight_limit: must be an object',
          );
        }
      }

      // Handle storage_item component
      const storageItemConfig =
        components['minecraft:storage_item'] || components.storage_item;
      if (storageItemConfig !== undefined) {
        if (
          typeof storageItemConfig === 'object' &&
          storageItemConfig !== null
        ) {
          const storageItemFinal: Record<string, unknown> = {};

          // Validate format version (requires 1.21.40+)
          const formatParts = this.#opt.format.split('.');
          const formatVersion = parseFloat(
            formatParts[1] + '.' + formatParts[2],
          );
          const patchVersion = formatParts[3] ? parseInt(formatParts[3]) : 0;

          if (
            formatVersion < 1.21 ||
            (formatVersion === 1.21 && patchVersion < 40)
          ) {
            throw new Error(
              '[compile component]: storage_item component requires format version 1.21.40 or higher',
            );
          }

          // Handle allow_nested_storage_items (optional, defaults to true)
          if (storageItemConfig.allow_nested_storage_items === undefined) {
            storageItemFinal.allow_nested_storage_items = true;
          } else if (
            typeof storageItemConfig.allow_nested_storage_items === 'boolean'
          ) {
            storageItemFinal.allow_nested_storage_items =
              storageItemConfig.allow_nested_storage_items;
          } else {
            throw new Error(
              '[compile component]: storage_item: allow_nested_storage_items must be a boolean',
            );
          }

          // Handle allowed_items (optional, defaults to empty array)
          if (storageItemConfig.allowed_items !== undefined) {
            if (Array.isArray(storageItemConfig.allowed_items)) {
              const allowedItemsValid = storageItemConfig.allowed_items.every(
                (item: unknown) => {
                  if (typeof item !== 'string') return false;
                  const itemRegex = /^[a-zA-Z_]\w*(?::[a-zA-Z_]\w*)?$/;
                  return itemRegex.test(item);
                },
              );

              if (!allowedItemsValid) {
                throw new Error(
                  '[compile component]: storage_item: allowed_items entries must be valid Minecraft item identifiers',
                );
              }

              storageItemFinal.allowed_items = [
                ...storageItemConfig.allowed_items,
              ];
            } else {
              throw new Error(
                '[compile component]: storage_item: allowed_items must be an array of strings',
              );
            }
          }

          // Handle banned_items (optional, defaults to empty array)
          if (storageItemConfig.banned_items !== undefined) {
            if (Array.isArray(storageItemConfig.banned_items)) {
              const bannedItemsValid = storageItemConfig.banned_items.every(
                (item: unknown) => {
                  if (typeof item !== 'string') return false;
                  const itemRegex = /^[a-zA-Z_]\w*(?::[a-zA-Z_]\w*)?$/;
                  return itemRegex.test(item);
                },
              );

              if (!bannedItemsValid) {
                throw new Error(
                  '[compile component]: storage_item: banned_items entries must be valid Minecraft item identifiers',
                );
              }

              storageItemFinal.banned_items = [
                ...storageItemConfig.banned_items,
              ];
            } else {
              throw new Error(
                '[compile component]: storage_item: banned_items must be an array of strings',
              );
            }
          }

          // Handle max_slots (optional, defaults to 64)
          if (storageItemConfig.max_slots === undefined) {
            storageItemFinal.max_slots = 64;
          } else if (typeof storageItemConfig.max_slots === 'number') {
            if (
              storageItemConfig.max_slots > 0 &&
              storageItemConfig.max_slots <= 64
            ) {
              storageItemFinal.max_slots = storageItemConfig.max_slots;
            } else {
              throw new Error(
                '[compile component]: storage_item: max_slots must be between 1 and 64',
              );
            }
          } else {
            throw new Error(
              '[compile component]: storage_item: max_slots must be a number',
            );
          }

          // Handle max_weight_limit (optional, defaults to 64)
          if (storageItemConfig.max_weight_limit === undefined) {
            storageItemFinal.max_weight_limit = 64;
          } else if (typeof storageItemConfig.max_weight_limit === 'number') {
            if (
              storageItemConfig.max_weight_limit > 0 &&
              storageItemConfig.max_weight_limit <= 64
            ) {
              storageItemFinal.max_weight_limit =
                storageItemConfig.max_weight_limit;
            } else {
              throw new Error(
                '[compile component]: storage_item: max_weight_limit must be between 1 and 64',
              );
            }
          } else {
            throw new Error(
              '[compile component]: storage_item: max_weight_limit must be a number',
            );
          }

          // Handle weight_in_storage_item (optional, defaults to 4)
          if (storageItemConfig.weight_in_storage_item === undefined) {
            storageItemFinal.weight_in_storage_item = 4;
          } else if (
            typeof storageItemConfig.weight_in_storage_item === 'number'
          ) {
            if (
              storageItemConfig.weight_in_storage_item >= 0 &&
              storageItemConfig.weight_in_storage_item <= 64
            ) {
              storageItemFinal.weight_in_storage_item =
                storageItemConfig.weight_in_storage_item;
            } else {
              throw new Error(
                '[compile component]: storage_item: weight_in_storage_item must be between 0 and 64',
              );
            }
          } else {
            throw new Error(
              '[compile component]: storage_item: weight_in_storage_item must be a number',
            );
          }

          ApplyComponents['minecraft:storage_item'] = storageItemFinal;
        } else {
          throw new Error(
            '[compile component]: storage_item: must be an object',
          );
        }
      }

      // Handle minecraft:throwable component
      const throwableConfig =
        components['minecraft:throwable'] || components.throwable;
      if (throwableConfig !== undefined) {
        if (typeof throwableConfig === 'object' && throwableConfig !== null) {
          const throwableFinal: Record<string, unknown> = {};

          // Handle do_swing_animation (optional, defaults to false)
          if (throwableConfig.do_swing_animation !== undefined) {
            if (typeof throwableConfig.do_swing_animation === 'boolean') {
              throwableFinal.do_swing_animation =
                throwableConfig.do_swing_animation;
            } else {
              throw new Error(
                '[compile component]: throwable: do_swing_animation must be a boolean',
              );
            }
          }

          // Handle launch_power_scale (optional, defaults to 1)
          if (throwableConfig.launch_power_scale !== undefined) {
            if (
              typeof throwableConfig.launch_power_scale === 'number' &&
              throwableConfig.launch_power_scale >= 0
            ) {
              throwableFinal.launch_power_scale =
                throwableConfig.launch_power_scale;
            } else {
              throw new Error(
                '[compile component]: throwable: launch_power_scale must be a non-negative number',
              );
            }
          }

          // Handle max_draw_duration (optional, defaults to 0)
          if (throwableConfig.max_draw_duration !== undefined) {
            if (
              typeof throwableConfig.max_draw_duration === 'number' &&
              throwableConfig.max_draw_duration >= 0
            ) {
              throwableFinal.max_draw_duration =
                throwableConfig.max_draw_duration;
            } else {
              throw new Error(
                '[compile component]: throwable: max_draw_duration must be a non-negative number',
              );
            }
          }

          // Handle max_launch_power (optional, defaults to 1)
          if (throwableConfig.max_launch_power !== undefined) {
            if (
              typeof throwableConfig.max_launch_power === 'number' &&
              throwableConfig.max_launch_power >= 0
            ) {
              throwableFinal.max_launch_power =
                throwableConfig.max_launch_power;
            } else {
              throw new Error(
                '[compile component]: throwable: max_launch_power must be a non-negative number',
              );
            }
          }

          // Handle min_draw_duration (optional, defaults to 0)
          if (throwableConfig.min_draw_duration !== undefined) {
            if (
              typeof throwableConfig.min_draw_duration === 'number' &&
              throwableConfig.min_draw_duration >= 0
            ) {
              throwableFinal.min_draw_duration =
                throwableConfig.min_draw_duration;
            } else {
              throw new Error(
                '[compile component]: throwable: min_draw_duration must be a non-negative number',
              );
            }
          }

          // Handle scale_power_by_draw_duration (optional, defaults to false)
          if (throwableConfig.scale_power_by_draw_duration !== undefined) {
            if (
              typeof throwableConfig.scale_power_by_draw_duration === 'boolean'
            ) {
              throwableFinal.scale_power_by_draw_duration =
                throwableConfig.scale_power_by_draw_duration;
            } else {
              throw new Error(
                '[compile component]: throwable: scale_power_by_draw_duration must be a boolean',
              );
            }
          }

          ApplyComponents['minecraft:throwable'] = throwableFinal;
        } else {
          throw new Error('[compile component]: throwable: must be an object');
        }
      }

      // Handle minecraft:tags component
      const tagsConfig = components['minecraft:tags'] || components.tags;
      if (tagsConfig !== undefined) {
        if (typeof tagsConfig === 'object' && tagsConfig !== null) {
          const tagsFinal: Record<string, unknown> = {};

          // Handle tags array (required)
          if (tagsConfig.tags !== undefined) {
            if (Array.isArray(tagsConfig.tags)) {
              const tagsValid = tagsConfig.tags.every((tag: unknown) => {
                if (typeof tag !== 'string') return false;
                const tagRegex = /^[a-zA-Z_][\w:]*$/;
                return tagRegex.test(tag);
              });

              if (tagsValid) {
                tagsFinal.tags = tagsConfig.tags;
              } else {
                throw new Error(
                  '[compile component]: tags: all tags must be valid strings',
                );
              }
            } else {
              throw new Error(
                '[compile component]: tags: tags must be an array',
              );
            }
          } else {
            throw new Error(
              '[compile component]: tags: tags array is required',
            );
          }

          ApplyComponents['minecraft:tags'] = tagsFinal;
        } else {
          throw new Error('[compile component]: tags: must be an object');
        }
      }

      // Handle minecraft:swing_duration component
      const swingDurationConfig =
        components['minecraft:swing_duration'] || components.swing_duration;
      if (swingDurationConfig !== undefined) {
        if (
          typeof swingDurationConfig === 'object' &&
          swingDurationConfig !== null
        ) {
          const swingDurationFinal: Record<string, unknown> = {};

          // Handle value (required)
          if (swingDurationConfig.value !== undefined) {
            if (
              typeof swingDurationConfig.value === 'number' &&
              swingDurationConfig.value >= 0
            ) {
              swingDurationFinal.value = swingDurationConfig.value;
            } else {
              throw new Error(
                '[compile component]: swing_duration: value must be a non-negative number',
              );
            }
          } else {
            throw new Error(
              '[compile component]: swing_duration: value is required',
            );
          }

          ApplyComponents['minecraft:swing_duration'] = swingDurationFinal;
        } else {
          throw new Error(
            '[compile component]: swing_duration: must be an object',
          );
        }
      }

      // Handle minecraft:use_animation component
      const useAnimationConfig =
        components['minecraft:use_animation'] || components.use_animation;
      if (useAnimationConfig !== undefined) {
        // Handle both string format (simplified) and object format
        if (typeof useAnimationConfig === 'string') {
          // Simplified string format: "eat", "drink", etc.
          const animationValue = useAnimationConfig.trim();
          if (animationValue.length > 0) {
            ApplyComponents['minecraft:use_animation'] = animationValue;
          } else {
            throw new Error(
              '[compile component]: use_animation: animation string cannot be empty',
            );
          }
        } else if (typeof useAnimationConfig === 'object') {
          // Object format: { "value": "eat" }
          const useAnimationFinal: Record<string, unknown> = {};

          // Handle value (required)
          if (useAnimationConfig.value !== undefined) {
            if (
              typeof useAnimationConfig.value === 'string' &&
              useAnimationConfig.value.trim().length > 0
            ) {
              useAnimationFinal.value = useAnimationConfig.value.trim();
            } else {
              throw new Error(
                '[compile component]: use_animation: value must be a non-empty string',
              );
            }
          } else {
            throw new Error(
              '[compile component]: use_animation: value is required in object format',
            );
          }

          ApplyComponents['minecraft:use_animation'] = useAnimationFinal;
        } else {
          throw new Error(
            '[compile component]: use_animation: must be a string or object',
          );
        }
      }

      // Handle minecraft:wearable component
      const wearableConfig =
        components['minecraft:wearable'] || components.wearable;
      if (wearableConfig !== undefined) {
        if (typeof wearableConfig === 'object') {
          const wearableFinal: Record<string, unknown> = {};

          // Handle slot (required)
          if (wearableConfig.slot !== undefined) {
            const validSlots = [
              'slot.armor.head',
              'slot.armor.chest',
              'slot.armor.legs',
              'slot.armor.feet',
              'slot.weapon.mainhand',
              'slot.weapon.offhand',
              'slot.hotbar',
              'slot.inventory',
              'slot.enderchest',
              'slot.saddle',
              'slot.armor',
              'slot.chest',
            ];
            if (validSlots.includes(wearableConfig.slot)) {
              wearableFinal.slot = wearableConfig.slot;
            } else {
              throw new Error(
                `[compile component]: wearable: slot "${wearableConfig.slot}" is not a valid slot`,
              );
            }
          } else {
            throw new Error('[compile component]: wearable: slot is required');
          }

          // Handle protection (optional, non-negative integer)
          if (wearableConfig.protection !== undefined) {
            if (
              typeof wearableConfig.protection === 'number' &&
              Number.isInteger(wearableConfig.protection) &&
              wearableConfig.protection >= 0
            ) {
              wearableFinal.protection = wearableConfig.protection;
            } else {
              throw new Error(
                '[compile component]: wearable: protection must be a non-negative integer',
              );
            }
          }

          // Handle hides_player_location (optional, boolean)
          if (wearableConfig.hides_player_location !== undefined) {
            if (typeof wearableConfig.hides_player_location === 'boolean') {
              wearableFinal.hides_player_location =
                wearableConfig.hides_player_location;
            } else {
              throw new Error(
                '[compile component]: wearable: hides_player_location must be a boolean',
              );
            }
          }

          // Handle dispensable (optional, boolean)
          if (wearableConfig.dispensable !== undefined) {
            if (typeof wearableConfig.dispensable === 'boolean') {
              wearableFinal.dispensable = wearableConfig.dispensable;
            } else {
              throw new Error(
                '[compile component]: wearable: dispensable must be a boolean',
              );
            }
          }

          ApplyComponents['minecraft:wearable'] = wearableFinal;
        } else {
          throw new Error('[compile component]: wearable: must be an object');
        }
      }

      // Handle minecraft:use_modifiers component
      const useModifiersConfig =
        (components as Record<string, unknown>)['minecraft:use_modifiers'] ||
        (components as Record<string, unknown>).use_modifiers;
      if (useModifiersConfig !== undefined) {
        if (
          typeof useModifiersConfig === 'object' &&
          useModifiersConfig !== null
        ) {
          const umCfg = useModifiersConfig as Record<string, unknown>;
          const useModifiersFinal: Record<string, unknown> = {};

          // Handle use_duration (required, non-negative number)
          if (umCfg.use_duration !== undefined) {
            if (
              typeof umCfg.use_duration === 'number' &&
              umCfg.use_duration >= 0
            ) {
              useModifiersFinal.use_duration = umCfg.use_duration;
            } else {
              throw new Error(
                '[compile component]: use_modifiers: use_duration must be a non-negative number',
              );
            }
          } else {
            throw new Error(
              '[compile component]: use_modifiers: use_duration is required',
            );
          }

          // Handle movement_modifier (optional, number ≤ 1)
          if (umCfg.movement_modifier !== undefined) {
            if (
              typeof umCfg.movement_modifier === 'number' &&
              umCfg.movement_modifier <= 1
            ) {
              useModifiersFinal.movement_modifier = umCfg.movement_modifier;
            } else {
              throw new Error(
                '[compile component]: use_modifiers: movement_modifier must be a number ≤ 1',
              );
            }
          }

          // Handle has_vibration (optional, boolean)
          if (umCfg.has_vibration !== undefined) {
            if (typeof umCfg.has_vibration === 'boolean') {
              useModifiersFinal.has_vibration = umCfg.has_vibration;
            } else {
              throw new Error(
                '[compile component]: use_modifiers: has_vibration must be a boolean',
              );
            }
          }

          ApplyComponents['minecraft:use_modifiers'] = useModifiersFinal;
        } else {
          throw new Error(
            '[compile component]: use_modifiers: must be an object',
          );
        }
      }

      // Handle minecraft:swing_sounds component
      const swingSoundsConfig =
        (components as Record<string, unknown>)['minecraft:swing_sounds'] ||
        (components as Record<string, unknown>).swing_sounds;
      if (swingSoundsConfig !== undefined) {
        if (
          typeof swingSoundsConfig === 'object' &&
          swingSoundsConfig !== null
        ) {
          const ssCfg = swingSoundsConfig as Record<string, unknown>;
          const swingSoundsFinal: Record<string, unknown> = {};

          // Handle sound (required)
          if (ssCfg.sound !== undefined) {
            if (
              typeof ssCfg.sound === 'string' &&
              ssCfg.sound.trim().length > 0
            ) {
              swingSoundsFinal.sound = ssCfg.sound.trim();
            } else {
              throw new Error(
                '[compile component]: swing_sounds: sound must be a non-empty string',
              );
            }
          } else {
            throw new Error(
              '[compile component]: swing_sounds: sound is required',
            );
          }

          ApplyComponents['minecraft:swing_sounds'] = swingSoundsFinal;
        } else {
          throw new Error(
            '[compile component]: swing_sounds: must be an object',
          );
        }
      }

      // minecraft:weapon
      if (
        (this.#opt.components as Record<string, unknown>)[
          'minecraft:weapon'
        ] !== undefined
      ) {
        ApplyComponents['minecraft:weapon'] = (
          this.#opt.components as Record<string, unknown>
        )['minecraft:weapon'];
      }

      // minecraft:knockback_resistance
      if (
        (this.#opt.components as Record<string, unknown>)[
          'minecraft:knockback_resistance'
        ] !== undefined
      ) {
        ApplyComponents['minecraft:knockback_resistance'] = (
          this.#opt.components as Record<string, unknown>
        )['minecraft:knockback_resistance'];
      }
    }
    return result;
  }
  /**
   * set name
   * @throws {Error}&
   * @param {string} newValue
   * @returns {void}
   */
  public setName(newValue: string): void {
    if (typeof newValue == 'string') {
      this.#opt.name = newValue;
    } else {
      throw new Error('[set error]: name type error');
    }
  }
  public setIcon(newValue: string): void;
  public setIcon(newValue: PNGImageComponent): void;
  public setIcon(newValue: PNGImageComponent | string): void {
    if (typeof newValue == 'string') {
      this.#opt.components.icon = newValue;
      return;
    }
    if (newValue.classId == 'mcx_png_2340192') {
      const filePath = newValue.filePath;
      const textureKey: string = this.#opt.id.includes(':')
        ? (this.#opt.id.split(':')[1] as string)
        : this.#opt.id;
      if (!this.#edit) this.#edit = [];
      let idx: number = -1;
      const idKey = '__icon_key__';
      const found = this.#edit.find(
        (v, i: number) => {
          const options = v.options as Array<{ id?: string }> | undefined;
          if (
            v.type == 'batch' &&
            options &&
            options[0] &&
            options[1] &&
            options[0].id &&
            options[0].id == idKey &&
            options[1].id &&
            options[1].id == `_w_${idKey}`
          ) {
            idx = i;
            return true;
          }
        },
      );
      if (found && idx !== -1) {
        this.#edit.splice(idx, 1);
      }
      this.#edit.push({
        type: 'batch',
        options: [
          {
            type: 'copy_assets',
            id: idKey,
            source: {
              base: 'root',
              file: filePath,
            },
            output: {
              base: 'resources',
              file: `textures/items/${textureKey}.png`,
            },
          },
          {
            type: 'edit',
            id: `_w_${idKey}`,
            source: {
              type: 'append',
              bind: 'item_texture',
            },
            expression: t.createFileEdit({
              define: {
                key: {
                  from: 'var',
                  data: textureKey,
                },
                texture: {
                  from: 'var',
                  data: `items/${textureKey}.png`,
                },
              } as const,
              run: async define => {
                return [
                  [define['key'], `textures/${define['texture']}`],
                ] satisfies [string, string][];
              },
            }),
          },
        ],
      });
      this.#opt.components.icon = textureKey;
      return;
    }
    throw new Error(
      "[mcx component json]: unknown icon value: err: can't handle value",
    );
  }
  /**
   * get name
   * @returns {string} name
   */
  public getName(): string | undefined {
    return this.#opt.name;
  }
  /**
   * set identifier
   * @param {string} newValue
   */
  public setId(newValue: string): void {
    if (typeof newValue == 'string') {
      this.#opt.id = newValue;
    } else {
      throw new Error('[set error]: id: type error');
    }
  }
  /**
   * get item component identifier
   */
  public getId() {
    return this.#opt.id;
  }
  /**
   * set creative menu category
   * @param config {string | {category?: string, group?: string, is_hidden_in_commands?: boolean}} category or full menu_category config
   */
  public setMenuCategory(
    config:
      | string
      | {
          category?: string;
          group?: string;
          is_hidden_in_commands?: boolean;
        },
  ): void {
    if (typeof config == 'string') {
      if (!config.trim()) throw new TypeError('[set error]: menuCategory: category type error');
      this.#opt.menu_category = {
        ...this.#opt.menu_category,
        category: config,
      };
      return;
    }
    if (typeof config != 'object' || config === null) {
      throw new TypeError('[set error]: menuCategory: config type error');
    }
    const existing = this.#opt.menu_category || {};
    if (config.category !== undefined) {
      if (typeof config.category != 'string' || !config.category.trim())
        throw new TypeError('[set error]: menuCategory: category type error');
      existing.category = config.category;
    }
    if (config.group !== undefined) {
      if (typeof config.group != 'string' || !config.group.trim())
        throw new TypeError('[set error]: menuCategory: group type error');
      if (config.group.length > 256)
        throw new Error(
          '[set error]: menuCategory: group name limited to 256 characters',
        );
      existing.group = config.group;
    }
    if (config.is_hidden_in_commands !== undefined) {
      if (typeof config.is_hidden_in_commands != 'boolean')
        throw new TypeError(
          '[set error]: menuCategory: is_hidden_in_commands type error',
        );
      existing.is_hidden_in_commands = config.is_hidden_in_commands;
    }
    this.#opt.menu_category = existing;
  }
  /**
   * get creative menu category
   */
  public getMenuCategory(): t.MenuCategory | undefined {
    return this.#opt.menu_category;
  }
  /**
   * set description creative group
   * @param group {string} group name (max 256 chars)
   */
  public setGroup(group: string): void {
    if (typeof group != 'string' || !group.trim())
      throw new TypeError('[set error]: group: type error');
    if (group.length > 256)
      throw new Error('[set error]: group: name limited to 256 characters');
    this.#opt.group = group;
  }
  /**
   * get description creative group
   */
  public getGroup(): string | undefined {
    return this.#opt.group;
  }
  /**
   * set description is_hidden_in_commands
   * @param value {boolean} whether this item can be used with commands
   */
  public setIsHiddenInCommands(value: boolean): void {
    if (typeof value != 'boolean')
      throw new TypeError('[set error]: isHiddenInCommands: type error');
    this.#opt.is_hidden_in_commands = value;
  }
  /**
   * get description is_hidden_in_commands
   */
  public getIsHiddenInCommands(): boolean | undefined {
    return this.#opt.is_hidden_in_commands;
  }
  /**
   * setAllowOffHand
   * @param vl {boolean} allow off hand
   */
  public setAllowOffHand(vl: boolean) {
    if (typeof vl == 'boolean') {
      this.#opt.components.offHand = vl;
    } else {
      throw new TypeError('[set error]: allowOffHand: type error');
    }
  }

  /**
   * setBlockPlacer
   * @param config {object} Block placer configuration
   */
  public setBlockPlacer(config: {
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
  }) {
    if (!this.#opt.components.block_placer) {
      this.#opt.components.block_placer = { block: '' };
    }

    if (typeof config.aligned_placement === 'boolean') {
      this.#opt.components.block_placer.aligned_placement =
        config.aligned_placement;
    }

    if (typeof config.block === 'string') {
      this.#opt.components.block_placer.block = config.block;
    } else {
      throw new Error('[set error]: block_placer: block must be a string');
    }

    if (typeof config.replace_block_item === 'boolean') {
      this.#opt.components.block_placer.replace_block_item =
        config.replace_block_item;
    }

    if (Array.isArray(config.use_on)) {
      this.#opt.components.block_placer.use_on = [...config.use_on];
    }
  }

  /**
   * setCooldown
   * @param config {object} Cooldown configuration
   */
  public setCooldown(config: {
    category: string;
    duration: number;
    type?: 'use' | 'attack';
  }) {
    if (!this.#opt.components.cooldown) {
      this.#opt.components.cooldown = { category: '', duration: 0 };
    }

    if (typeof config.category === 'string') {
      this.#opt.components.cooldown.category = config.category;
    } else {
      throw new Error('[set error]: cooldown: category must be a string');
    }

    if (typeof config.duration === 'number') {
      this.#opt.components.cooldown.duration = config.duration;
    } else {
      throw new Error('[set error]: cooldown: duration must be a number');
    }

    if (config.type && (config.type === 'use' || config.type === 'attack')) {
      this.#opt.components.cooldown.type = config.type;
    }
  }

  /**
   * setCompostable
   * @param config {object} Compostable configuration
   */
  public setCompostable(config: { composting_chance: number }) {
    if (!this.#opt.components.compostable) {
      this.#opt.components.compostable = { composting_chance: 0 };
    }

    if (typeof config.composting_chance === 'number') {
      if (config.composting_chance < 1 || config.composting_chance > 100) {
        throw new Error(
          '[set error]: compostable: composting_chance must be between 1 and 100',
        );
      }
      this.#opt.components.compostable.composting_chance =
        config.composting_chance;
    } else {
      throw new Error(
        '[set error]: compostable: composting_chance must be a number',
      );
    }
  }

  /**
   * setBundleInteraction
   * @param config {object} Bundle interaction configuration
   */
  public setBundleInteraction(config: { num_viewable_slots?: number }) {
    if (!this.#opt.components.bundle_interaction) {
      this.#opt.components.bundle_interaction = {};
    }

    if (typeof config.num_viewable_slots === 'number') {
      if (config.num_viewable_slots < 1 || config.num_viewable_slots > 64) {
        throw new Error(
          '[set error]: bundle_interaction: num_viewable_slots must be between 1 and 64',
        );
      }
      this.#opt.components.bundle_interaction.num_viewable_slots =
        config.num_viewable_slots;
    }
  }

  /**
   * setGlint
   * @param value {boolean} Whether the item has glint effect
   */
  public setGlint(value: boolean): void {
    if (typeof value === 'boolean') {
      this.#opt.components.glint = value;
    } else {
      throw new TypeError('[set error]: glint: type error');
    }
  }

  /**
   * setHandEquipped
   * @param value {boolean} Whether the item is hand equipped
   */
  public setHandEquipped(value: boolean): void {
    if (typeof value === 'boolean') {
      this.#opt.components.hand_equipped = value;
    } else {
      throw new TypeError('[set error]: hand_equipped: type error');
    }
  }

  /**
   * setDigger
   * @param config {object} Digger configuration
   */
  public setDigger(config: {
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
  }) {
    if (!this.#opt.components.digger) {
      this.#opt.components.digger = {};
    }

    if (typeof config.use_efficiency === 'boolean') {
      this.#opt.components.digger.use_efficiency = config.use_efficiency;
    }

    if (Array.isArray(config.destroy_speeds)) {
      this.#opt.components.digger.destroy_speeds = [];
      for (const speedEntry of config.destroy_speeds) {
        const entry: Record<string, unknown> = {};

        if (speedEntry.block) {
          entry.block = speedEntry.block;
        } else {
          throw new Error(
            '[set error]: digger: destroy_speeds entry must have a block',
          );
        }

        if (typeof speedEntry.speed === 'number') {
          entry.speed = speedEntry.speed;
        } else {
          throw new Error(
            '[set error]: digger: destroy_speeds entry speed must be a number',
          );
        }

        this.#opt.components.digger.destroy_speeds.push(
          entry as {
            block:
              | string
              | {
                  name?: string;
                  states?: Record<string, number | string | boolean>;
                  tags?: string;
                };
            speed: number;
          },
        );
      }
    }
  }

  /**
   * setDamageAbsorption
   * @param config {object} Damage absorption configuration
   */
  public setDamageAbsorption(config: { absorbable_causes: string[] }) {
    if (!this.#opt.components.damage_absorption) {
      this.#opt.components.damage_absorption = { absorbable_causes: [] };
    }

    if (Array.isArray(config.absorbable_causes)) {
      if (config.absorbable_causes.length === 0) {
        throw new Error(
          '[set error]: damage_absorption: absorbable_causes must have at least 1 item',
        );
      }
      this.#opt.components.damage_absorption.absorbable_causes = [
        ...config.absorbable_causes,
      ];
    } else {
      throw new Error(
        '[set error]: damage_absorption: absorbable_causes must be an array',
      );
    }
  }

  /**
   * setDurability
   * @param config {object} Durability configuration
   */
  public setDurability(config: {
    max_durability: number;
    damage_chance?: {
      min: number;
      max: number;
    };
  }) {
    if (!this.#opt.components.durability) {
      this.#opt.components.durability = { max_durability: 0 };
    }

    if (typeof config.max_durability === 'number') {
      if (config.max_durability < 0) {
        throw new Error(
          '[set error]: durability: max_durability must be at least 0',
        );
      }
      this.#opt.components.durability.max_durability = config.max_durability;
    } else {
      throw new Error(
        '[set error]: durability: max_durability must be a number',
      );
    }

    if (config.damage_chance) {
      const damageChance = config.damage_chance;

      if (
        typeof damageChance.min === 'number' &&
        typeof damageChance.max === 'number'
      ) {
        if (damageChance.min < 0 || damageChance.max < 0) {
          throw new Error(
            '[set error]: durability: damage_chance min and max must be at least 0',
          );
        }
        if (damageChance.min > damageChance.max) {
          throw new Error(
            '[set error]: durability: damage_chance min cannot be greater than max',
          );
        }
        this.#opt.components.durability.damage_chance = {
          min: damageChance.min,
          max: damageChance.max,
        };
      } else {
        throw new Error(
          '[set error]: durability: damage_chance must have both min and max values',
        );
      }
    }
  }

  /**
   * setDurabilitySensor
   * @param config {object} Durability Sensor configuration
   */
  public setDurabilitySensor(config: {
    durability?: number;
    durability_thresholds?: Array<{
      durability: number;
      particle_type?: t.ParticleType;
      sound_event?: t.SoundEvent;
    }>;
    particle_type?: t.ParticleType;
    sound_event?: t.SoundEvent;
  }) {
    if (!this.#opt.components.durability_sensor) {
      this.#opt.components.durability_sensor = {};
    }

    if (typeof config.durability === 'number') {
      this.#opt.components.durability_sensor.durability = config.durability;
    }

    if (Array.isArray(config.durability_thresholds)) {
      if (config.durability_thresholds.length === 0) {
        throw new Error(
          '[set error]: durability_sensor: durability_thresholds must have at least 1 item',
        );
      }

      this.#opt.components.durability_sensor.durability_thresholds = [];
      for (const threshold of config.durability_thresholds) {
        const thresholdConfig: Record<string, unknown> = {};

        if (typeof threshold.durability === 'number') {
          thresholdConfig.durability = threshold.durability;
        } else {
          throw new Error(
            '[set error]: durability_sensor: durability_thresholds entry durability must be a number',
          );
        }

        if (typeof threshold.particle_type === 'string') {
          if (
            !t.ParticleTypeEnum.includes(
              threshold.particle_type as t.ParticleType,
            )
          ) {
            throw new Error(
              `[set error]: durability_sensor: durability_thresholds entry particle_type must be a valid particle type. Got: ${threshold.particle_type}`,
            );
          }
          thresholdConfig.particle_type = threshold.particle_type;
        }

        if (typeof threshold.sound_event === 'string') {
          if (
            !t.SoundEventEnum.includes(threshold.sound_event as t.SoundEvent)
          ) {
            throw new Error(
              `[set error]: durability_sensor: durability_thresholds entry sound_event must be a valid sound event. Got: ${threshold.sound_event}`,
            );
          }
          thresholdConfig.sound_event = threshold.sound_event;
        }

        this.#opt.components.durability_sensor.durability_thresholds.push(
          thresholdConfig as {
            durability: number;
            particle_type?: t.ParticleType;
            sound_event?: t.SoundEvent;
          },
        );
      }
    }

    if (typeof config.particle_type === 'string') {
      if (
        !t.ParticleTypeEnum.includes(config.particle_type as t.ParticleType)
      ) {
        throw new Error(
          `[set error]: durability_sensor: particle_type must be a valid particle type. Got: ${config.particle_type}`,
        );
      }
      this.#opt.components.durability_sensor.particle_type =
        config.particle_type;
    }

    if (typeof config.sound_event === 'string') {
      if (!t.SoundEventEnum.includes(config.sound_event as t.SoundEvent)) {
        throw new Error(
          `[set error]: durability_sensor: sound_event must be a valid sound event. Got: ${config.sound_event}`,
        );
      }
      this.#opt.components.durability_sensor.sound_event = config.sound_event;
    }
  }

  /**
   * setDyeable
   * @param config {object} Dyeable configuration
   */
  public setDyeable(config: {
    default_color?: string | [number, number, number];
  }) {
    if (!this.#opt.components.dyeable) {
      this.#opt.components.dyeable = {};
    }

    if (config.default_color !== undefined) {
      if (typeof config.default_color === 'string') {
        // Validate hex color format
        if (!/^#[0-9A-Fa-f]{6}$/.test(config.default_color)) {
          throw new Error(
            "[set error]: dyeable: default_color string must be a valid hex color (e.g., '#175882')",
          );
        }
        this.#opt.components.dyeable.default_color = config.default_color;
      } else if (
        Array.isArray(config.default_color) &&
        config.default_color.length === 3
      ) {
        // Validate RGB array
        const [r, g, b] = config.default_color;
        if (
          typeof r !== 'number' ||
          typeof g !== 'number' ||
          typeof b !== 'number' ||
          r < 0 ||
          r > 255 ||
          g < 0 ||
          g > 255 ||
          b < 0 ||
          b > 255
        ) {
          throw new Error(
            '[set error]: dyeable: default_color array must contain 3 numbers between 0 and 255',
          );
        }
        this.#opt.components.dyeable.default_color = config.default_color;
      } else {
        throw new Error(
          '[set error]: dyeable: default_color must be a hex string or array of 3 numbers',
        );
      }
    }
  }

  /**
   * setEnchantable
   * @param config {object} Enchantable configuration
   */
  public setEnchantable(config: { slot?: t.EnchantableSlot; value?: number }) {
    if (!this.#opt.components.enchantable) {
      this.#opt.components.enchantable = {};
    }

    if (config.slot !== undefined) {
      if (typeof config.slot === 'string') {
        // Validate slot enum
        if (!t.EnchantableSlotEnum.includes(config.slot as t.EnchantableSlot)) {
          throw new Error(
            `[set error]: enchantable: slot must be a valid enchantment slot. Got: ${config.slot}`,
          );
        }
        this.#opt.components.enchantable.slot = config.slot;
      } else {
        throw new Error('[set error]: enchantable: slot must be a string');
      }
    }

    if (config.value !== undefined) {
      if (typeof config.value === 'number') {
        // Validate value minimum (must be at least 0)
        if (config.value < 0) {
          throw new Error('[set error]: enchantable: value must be at least 0');
        }
        this.#opt.components.enchantable.value = config.value;
      } else {
        throw new Error('[set error]: enchantable: value must be a number');
      }
    }
  }

  /**
   * setFood
   * @param config {object} Food configuration
   */
  public setFood(config: {
    can_always_eat?: boolean;
    cooldown_time?: number;
    cooldown_type?: string;
    effects?: Array<{
      amplifier?: number;
      chance?: number;
      duration?: number;
      name?: string;
    }>;
    is_meat?: boolean;
    nutrition?: number;
    on_use_action?: string;
    on_use_range?: [number, number, number];
    saturation_modifier?:
      | number
      | 'poor'
      | 'low'
      | 'normal'
      | 'good'
      | 'supernatural';
    using_converts_to?: string;
    remove_effects?: string[]; // deprecated
  }) {
    // Validate food effects
    const validateFoodEffects = (effects?: t.FoodEffect[]) => {
      if (effects && Array.isArray(effects)) {
        const validEffects = [
          'regeneration',
          'absorption',
          'blindness',
          'conduit_power',
          'darkness',
          'fatal_poison',
          'fire_resistance',
          'haste',
          'health_boost',
          'hunger',
          'instant_damage',
          'instant_health',
          'invisibility',
          'jump_boost',
          'levitation',
          'mining_fatigue',
          'nausea',
          'night_vision',
          'poison',
          'resistance',
          'saturation',
          'slow_falling',
          'slowness',
          'speed',
          'strength',
          'water_breathing',
          'weakness',
          'wither',
        ];

        for (const effect of effects) {
          if (effect.name && !validEffects.includes(effect.name)) {
            throw new Error(
              `[set error]: food: effect name must be a valid status effect. Got: ${effect.name}`,
            );
          }

          if (typeof effect.amplifier === 'number' && effect.amplifier < 0) {
            throw new Error(
              '[set error]: food: effect amplifier must be at least 0',
            );
          }

          if (
            typeof effect.chance === 'number' &&
            (effect.chance < 0 || effect.chance > 1)
          ) {
            throw new Error(
              '[set error]: food: effect chance must be between 0 and 1',
            );
          }

          if (typeof effect.duration === 'number' && effect.duration < 0) {
            throw new Error(
              '[set error]: food: effect duration must be at least 0',
            );
          }
        }
      }
    };

    // Use the main minecraft:food property for consistency
    if (!this.#opt.components['minecraft:food']) {
      this.#opt.components['minecraft:food'] = {};
    }

    if (config.can_always_eat !== undefined) {
      if (typeof config.can_always_eat === 'boolean') {
        this.#opt.components['minecraft:food'].can_always_eat =
          config.can_always_eat;
      } else {
        throw new Error('[set error]: food: can_always_eat must be a boolean');
      }
    }

    if (config.cooldown_time !== undefined) {
      if (typeof config.cooldown_time === 'number') {
        if (config.cooldown_time < 0) {
          throw new Error(
            '[set error]: food: cooldown_time must be at least 0',
          );
        }
        this.#opt.components['minecraft:food'].cooldown_time =
          config.cooldown_time;
      } else {
        throw new Error('[set error]: food: cooldown_time must be a number');
      }
    }

    if (config.cooldown_type !== undefined) {
      if (typeof config.cooldown_type === 'string') {
        this.#opt.components['minecraft:food'].cooldown_type =
          config.cooldown_type;
      } else {
        throw new Error('[set error]: food: cooldown_type must be a string');
      }
    }

    if (config.effects !== undefined) {
      validateFoodEffects(config.effects);
      this.#opt.components['minecraft:food'].effects = config.effects;
    }

    if (config.is_meat !== undefined) {
      if (typeof config.is_meat === 'boolean') {
        this.#opt.components['minecraft:food'].is_meat = config.is_meat;
      } else {
        throw new Error('[set error]: food: is_meat must be a boolean');
      }
    }

    if (config.nutrition !== undefined) {
      if (typeof config.nutrition === 'number') {
        if (config.nutrition < 0) {
          throw new Error('[set error]: food: nutrition must be at least 0');
        }
        this.#opt.components['minecraft:food'].nutrition = config.nutrition;
      } else {
        throw new Error('[set error]: food: nutrition must be a number');
      }
    }

    if (config.on_use_action !== undefined) {
      if (typeof config.on_use_action === 'string') {
        this.#opt.components['minecraft:food'].on_use_action =
          config.on_use_action;
      } else {
        throw new Error('[set error]: food: on_use_action must be a string');
      }
    }

    if (config.on_use_range !== undefined) {
      if (
        Array.isArray(config.on_use_range) &&
        config.on_use_range.length === 3
      ) {
        const [x, y, z] = config.on_use_range;
        if (
          typeof x === 'number' &&
          typeof y === 'number' &&
          typeof z === 'number'
        ) {
          this.#opt.components['minecraft:food'].on_use_range = [x, y, z];
        } else {
          throw new Error(
            '[set error]: food: on_use_range must be an array of 3 numbers',
          );
        }
      } else {
        throw new Error(
          '[set error]: food: on_use_range must be an array of 3 numbers',
        );
      }
    }

    if (config.saturation_modifier !== undefined) {
      const validSaturationModifiers = [
        'poor',
        'low',
        'normal',
        'good',
        'supernatural',
      ];

      if (typeof config.saturation_modifier === 'number') {
        this.#opt.components['minecraft:food'].saturation_modifier =
          config.saturation_modifier;
      } else if (typeof config.saturation_modifier === 'string') {
        if (!validSaturationModifiers.includes(config.saturation_modifier)) {
          throw new Error(
            `[set error]: food: saturation_modifier string must be one of: ${validSaturationModifiers.join(', ')}. Got: ${config.saturation_modifier}`,
          );
        }
        this.#opt.components['minecraft:food'].saturation_modifier =
          config.saturation_modifier;
      } else {
        throw new Error(
          '[set error]: food: saturation_modifier must be a number or string',
        );
      }
    }

    if (config.using_converts_to !== undefined) {
      if (typeof config.using_converts_to === 'string') {
        this.#opt.components['minecraft:food'].using_converts_to =
          config.using_converts_to;
      } else {
        throw new Error(
          '[set error]: food: using_converts_to must be a string',
        );
      }
    }

    if (config.remove_effects !== undefined) {
      if (Array.isArray(config.remove_effects)) {
        console.warn(
          '[set error]: food: remove_effects is deprecated and no longer supported in newer versions',
        );
        this.#opt.components['minecraft:food'].remove_effects = [
          ...config.remove_effects,
        ];
      } else {
        throw new Error('[set error]: food: remove_effects must be an array');
      }
    }
  }

  /**
   * setFireResistant
   * @param config {object} Fire resistant configuration
   */
  public setFireResistant(config: { value?: boolean }) {
    // Use the main minecraft:fire_resistant property for consistency
    if (!this.#opt.components['minecraft:fire_resistant']) {
      this.#opt.components['minecraft:fire_resistant'] = { value: true };
    }

    if (config.value !== undefined) {
      if (typeof config.value === 'boolean') {
        this.#opt.components['minecraft:fire_resistant'].value = config.value;
      } else {
        throw new Error('[set error]: fire_resistant: value must be a boolean');
      }
    } else {
      // Default to true if no value specified
      this.#opt.components['minecraft:fire_resistant'].value = true;
    }
  }

  /**
   * setEntityPlacer
   * @param config {object} Entity placer configuration
   */
  public setEntityPlacer(config: {
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
  }) {
    // Use the main minecraft:entity_placer property for consistency
    if (!this.#opt.components['minecraft:entity_placer']) {
      this.#opt.components['minecraft:entity_placer'] = { entity: '' };
    }

    // Validate entity regex pattern
    if (config.entity !== undefined) {
      if (typeof config.entity === 'string') {
        const entityRegex =
          /^(?:\w+(?:\.\w+):(?=\w))?(?:\w+(?:\.\w+))?(?:<((?:\w+(?:\.\w+):(?=\w))?\w+(?:\.\w+))*>)?$/;
        if (!entityRegex.test(config.entity)) {
          throw new Error(
            `[set error]: entity_placer: entity must match the pattern "^(?:\\w+(?:.\\w+):(?=\\w))?(?:\\w+(?:.\\w+))(?:<((?:\\w+(?:.\\w+):(?=\\w))?\\w+(?:.\\w+))*>)?$". Got: ${config.entity}`,
          );
        }
        this.#opt.components['minecraft:entity_placer'].entity = config.entity;
      } else {
        throw new Error('[set error]: entity_placer: entity must be a string');
      }
    }

    if (config.dispense_on !== undefined) {
      if (Array.isArray(config.dispense_on)) {
        this.#opt.components['minecraft:entity_placer'].dispense_on = [
          ...config.dispense_on,
        ];
      } else {
        throw new Error(
          '[set error]: entity_placer: dispense_on must be an array',
        );
      }
    }

    if (config.use_on !== undefined) {
      if (Array.isArray(config.use_on)) {
        this.#opt.components['minecraft:entity_placer'].use_on = [
          ...config.use_on,
        ];
      } else {
        throw new Error('[set error]: entity_placer: use_on must be an array');
      }
    }
  }

  /**
   * setFuel
   * @param config {object} Fuel configuration
   */
  public setFuel(config: { duration: number }) {
    // Use the main minecraft:fuel property for consistency
    if (!this.#opt.components['minecraft:fuel']) {
      this.#opt.components['minecraft:fuel'] = { duration: 0 };
    }

    if (config.duration !== undefined) {
      if (typeof config.duration === 'number') {
        if (config.duration >= 0.05) {
          this.#opt.components['minecraft:fuel'].duration = config.duration;
        } else {
          throw new Error('[set error]: fuel: duration must be >= 0.05');
        }
      } else {
        throw new Error('[set error]: fuel: duration must be a number');
      }
    } else {
      throw new Error('[set error]: fuel: duration is required');
    }
  }

  /**
   * setKineticWeapon
   * @param config {object} Kinetic weapon configuration
   */
  public setKineticWeapon(config: {
    creative_reach?: { max?: number; min?: number };
    damage_conditions?: {
      max_duration?: number;
      min_relative_speed?: number;
      min_speed?: number;
    };
    damage_modifier?: number;
    damage_multiplier?: number;
    delay?: number;
    dismount_conditions?: {
      max_duration?: number;
      min_relative_speed?: number;
      min_speed?: number;
    };
    hitbox_margin?: number;
    knockback_conditions?: {
      max_duration?: number;
      min_relative_speed?: number;
      min_speed?: number;
    };
    kinetic_effect_conditions?: {
      max_duration?: number;
      min_relative_speed?: number;
      min_speed?: number;
    };
    reach?: { max?: number; min?: number };
  }) {
    // Use the main minecraft:kinetic_weapon property for consistency
    if (!this.#opt.components['minecraft:kinetic_weapon']) {
      this.#opt.components['minecraft:kinetic_weapon'] = {};
    }

    // Handle creative_reach configuration
    if (config.creative_reach !== undefined) {
      if (typeof config.creative_reach === 'object') {
        this.#opt.components['minecraft:kinetic_weapon'].creative_reach = {
          ...config.creative_reach,
        };

        // Validate creative_reach properties
        if (
          config.creative_reach.max !== undefined &&
          typeof config.creative_reach.max !== 'number'
        ) {
          throw new Error(
            '[set error]: kinetic_weapon: creative_reach.max must be a number',
          );
        }
        if (
          config.creative_reach.min !== undefined &&
          typeof config.creative_reach.min !== 'number'
        ) {
          throw new Error(
            '[set error]: kinetic_weapon: creative_reach.min must be a number',
          );
        }
      } else {
        throw new Error(
          '[set error]: kinetic_weapon: creative_reach must be an object',
        );
      }
    }

    // Handle damage_conditions configuration
    if (config.damage_conditions !== undefined) {
      if (typeof config.damage_conditions === 'object') {
        this.#opt.components['minecraft:kinetic_weapon'].damage_conditions = {
          ...config.damage_conditions,
        };

        // Validate damage_conditions properties
        if (
          config.damage_conditions.max_duration !== undefined &&
          typeof config.damage_conditions.max_duration !== 'number'
        ) {
          throw new Error(
            '[set error]: kinetic_weapon: damage_conditions.max_duration must be a number',
          );
        }
        if (
          config.damage_conditions.min_relative_speed !== undefined &&
          typeof config.damage_conditions.min_relative_speed !== 'number'
        ) {
          throw new Error(
            '[set error]: kinetic_weapon: damage_conditions.min_relative_speed must be a number',
          );
        }
        if (
          config.damage_conditions.min_speed !== undefined &&
          typeof config.damage_conditions.min_speed !== 'number'
        ) {
          throw new Error(
            '[set error]: kinetic_weapon: damage_conditions.min_speed must be a number',
          );
        }
      } else {
        throw new Error(
          '[set error]: kinetic_weapon: damage_conditions must be an object',
        );
      }
    }

    // Handle dismount_conditions configuration
    if (config.dismount_conditions !== undefined) {
      if (typeof config.dismount_conditions === 'object') {
        this.#opt.components['minecraft:kinetic_weapon'].dismount_conditions = {
          ...config.dismount_conditions,
        };

        // Validate dismount_conditions properties
        if (
          config.dismount_conditions.max_duration !== undefined &&
          typeof config.dismount_conditions.max_duration !== 'number'
        ) {
          throw new Error(
            '[set error]: kinetic_weapon: dismount_conditions.max_duration must be a number',
          );
        }
        if (
          config.dismount_conditions.min_relative_speed !== undefined &&
          typeof config.dismount_conditions.min_relative_speed !== 'number'
        ) {
          throw new Error(
            '[set error]: kinetic_weapon: dismount_conditions.min_relative_speed must be a number',
          );
        }
        if (
          config.dismount_conditions.min_speed !== undefined &&
          typeof config.dismount_conditions.min_speed !== 'number'
        ) {
          throw new Error(
            '[set error]: kinetic_weapon: dismount_conditions.min_speed must be a number',
          );
        }
      } else {
        throw new Error(
          '[set error]: kinetic_weapon: dismount_conditions must be an object',
        );
      }
    }

    // Handle knockback_conditions configuration
    if (config.knockback_conditions !== undefined) {
      if (typeof config.knockback_conditions === 'object') {
        this.#opt.components['minecraft:kinetic_weapon'].knockback_conditions =
          { ...config.knockback_conditions };

        // Validate knockback_conditions properties
        if (
          config.knockback_conditions.max_duration !== undefined &&
          typeof config.knockback_conditions.max_duration !== 'number'
        ) {
          throw new Error(
            '[set error]: kinetic_weapon: knockback_conditions.max_duration must be a number',
          );
        }
        if (
          config.knockback_conditions.min_relative_speed !== undefined &&
          typeof config.knockback_conditions.min_relative_speed !== 'number'
        ) {
          throw new Error(
            '[set error]: kinetic_weapon: knockback_conditions.min_relative_speed must be a number',
          );
        }
        if (
          config.knockback_conditions.min_speed !== undefined &&
          typeof config.knockback_conditions.min_speed !== 'number'
        ) {
          throw new Error(
            '[set error]: kinetic_weapon: knockback_conditions.min_speed must be a number',
          );
        }
      } else {
        throw new Error(
          '[set error]: kinetic_weapon: knockback_conditions must be an object',
        );
      }
    }

    // Handle kinetic_effect_conditions configuration
    if (config.kinetic_effect_conditions !== undefined) {
      if (typeof config.kinetic_effect_conditions === 'object') {
        this.#opt.components[
          'minecraft:kinetic_weapon'
        ].kinetic_effect_conditions = { ...config.kinetic_effect_conditions };

        // Validate kinetic_effect_conditions properties
        if (
          config.kinetic_effect_conditions.max_duration !== undefined &&
          typeof config.kinetic_effect_conditions.max_duration !== 'number'
        ) {
          throw new Error(
            '[set error]: kinetic_weapon: kinetic_effect_conditions.max_duration must be a number',
          );
        }
        if (
          config.kinetic_effect_conditions.min_relative_speed !== undefined &&
          typeof config.kinetic_effect_conditions.min_relative_speed !==
            'number'
        ) {
          throw new Error(
            '[set error]: kinetic_weapon: kinetic_effect_conditions.min_relative_speed must be a number',
          );
        }
        if (
          config.kinetic_effect_conditions.min_speed !== undefined &&
          typeof config.kinetic_effect_conditions.min_speed !== 'number'
        ) {
          throw new Error(
            '[set error]: kinetic_weapon: kinetic_effect_conditions.min_speed must be a number',
          );
        }
      } else {
        throw new Error(
          '[set error]: kinetic_weapon: kinetic_effect_conditions must be an object',
        );
      }
    }

    // Handle reach configuration
    if (config.reach !== undefined) {
      if (typeof config.reach === 'object') {
        this.#opt.components['minecraft:kinetic_weapon'].reach = {
          ...config.reach,
        };

        // Validate reach properties
        if (
          config.reach.max !== undefined &&
          typeof config.reach.max !== 'number'
        ) {
          throw new Error(
            '[set error]: kinetic_weapon: reach.max must be a number',
          );
        }
        if (
          config.reach.min !== undefined &&
          typeof config.reach.min !== 'number'
        ) {
          throw new Error(
            '[set error]: kinetic_weapon: reach.min must be a number',
          );
        }
      } else {
        throw new Error('[set error]: kinetic_weapon: reach must be an object');
      }
    }

    // Handle simple numeric properties
    if (config.damage_modifier !== undefined) {
      if (typeof config.damage_modifier === 'number') {
        this.#opt.components['minecraft:kinetic_weapon'].damage_modifier =
          config.damage_modifier;
      } else {
        throw new Error(
          '[set error]: kinetic_weapon: damage_modifier must be a number',
        );
      }
    }

    if (config.damage_multiplier !== undefined) {
      if (typeof config.damage_multiplier === 'number') {
        this.#opt.components['minecraft:kinetic_weapon'].damage_multiplier =
          config.damage_multiplier;
      } else {
        throw new Error(
          '[set error]: kinetic_weapon: damage_multiplier must be a number',
        );
      }
    }

    if (config.delay !== undefined) {
      if (typeof config.delay === 'number') {
        this.#opt.components['minecraft:kinetic_weapon'].delay = config.delay;
      } else {
        throw new Error('[set error]: kinetic_weapon: delay must be a number');
      }
    }

    if (config.hitbox_margin !== undefined) {
      if (typeof config.hitbox_margin === 'number') {
        this.#opt.components['minecraft:kinetic_weapon'].hitbox_margin =
          config.hitbox_margin;
      } else {
        throw new Error(
          '[set error]: kinetic_weapon: hitbox_margin must be a number',
        );
      }
    }
  }

  /**
   * setInteractButton
   * @param config {boolean | string} Interact button configuration - boolean to enable/disable, or string for custom text
   */
  public setInteractButton(config: boolean | string) {
    // Use the main minecraft:interact_button property for consistency
    if (typeof config === 'boolean' || typeof config === 'string') {
      this.#opt.components['minecraft:interact_button'] = config;
    } else {
      throw new Error(
        '[set error]: interact_button: must be a boolean or string',
      );
    }
  }

  /**
   * setHoverTextColor
   * @param config {object | string} Hover text color configuration - object with value property, or string color value
   */
  public setHoverTextColor(config: { value?: string } | string) {
    // Use the main minecraft:hover_text_color property for consistency
    if (!this.#opt.components['minecraft:hover_text_color']) {
      this.#opt.components['minecraft:hover_text_color'] = { value: '' };
    }

    if (typeof config === 'string') {
      // String format support for convenience
      this.#opt.components['minecraft:hover_text_color'].value = config;
    } else if (typeof config === 'object' && config !== null) {
      // Object format support
      if (config.value !== undefined) {
        this.#opt.components['minecraft:hover_text_color'].value = config.value;
      }
    } else {
      throw new Error(
        '[set error]: hover_text_color: must be a string or object with value property',
      );
    }
  }

  /**
   * setLiquidClipped
   * @param config {boolean | { value?: boolean }} Liquid clipped configuration - boolean to enable/disable, or object with value property
   */
  public setLiquidClipped(config: boolean | { value?: boolean }) {
    // Use the main minecraft:liquid_clipped property for consistency
    if (!this.#opt.components['minecraft:liquid_clipped']) {
      // Initialize as empty object if it doesn't exist
      this.#opt.components['minecraft:liquid_clipped'] = {} as Record<
        string,
        unknown
      >;
    }

    if (typeof config === 'boolean') {
      // Boolean format support for convenience
      this.#opt.components['minecraft:liquid_clipped'] = config;
    } else if (typeof config === 'object' && config !== null) {
      // Object format support
      if (config.value !== undefined) {
        if (typeof config.value === 'boolean') {
          this.#opt.components['minecraft:liquid_clipped'] = {
            value: config.value,
          };
        } else {
          throw new Error(
            '[set error]: liquid_clipped: value must be a boolean',
          );
        }
      } else {
        throw new Error(
          '[set error]: liquid_clipped: value is required in object configuration',
        );
      }
    } else {
      throw new Error(
        '[set error]: liquid_clipped: must be a boolean or object with value property',
      );
    }
  }

  /**
   * setMaxStackSize
   * @param config {number | { value?: number }} Max stack size configuration - number for direct value, or object with value property
   */
  public setMaxStackSize(config: number | { value?: number }) {
    // Use the main minecraft:max_stack_size property for consistency
    if (!this.#opt.components['minecraft:max_stack_size']) {
      // Initialize as empty object if it doesn't exist
      this.#opt.components['minecraft:max_stack_size'] = {} as Record<
        string,
        unknown
      >;
    }

    if (typeof config === 'number') {
      // Number format support for convenience
      this.#opt.components['minecraft:max_stack_size'] = config;
    } else if (typeof config === 'object' && config !== null) {
      // Object format support
      if (config.value !== undefined) {
        if (typeof config.value === 'number') {
          this.#opt.components['minecraft:max_stack_size'] = {
            value: config.value,
          };
        } else {
          throw new Error(
            '[set error]: max_stack_size: value must be a number',
          );
        }
      } else {
        throw new Error(
          '[set error]: max_stack_size: value is required in object configuration',
        );
      }
    } else {
      throw new Error(
        '[set error]: max_stack_size: must be a number or object with value property',
      );
    }
  }

  /**
   * setPiercingWeapon
   * @param config {{ creative_reach?: { max?: number; min?: number }; hitbox_margin?: number; reach?: { max?: number; min?: number } }} Piercing weapon configuration
   */
  public setPiercingWeapon(config: {
    creative_reach?: { max?: number; min?: number };
    hitbox_margin?: number;
    reach?: { max?: number; min?: number };
  }) {
    if (typeof config !== 'object' || config === null) {
      throw new Error(
        '[set error]: piercing_weapon: must be an object configuration',
      );
    }

    const cfg: Record<string, unknown> = {};

    // Handle creative_reach
    if (config.creative_reach !== undefined) {
      if (
        typeof config.creative_reach !== 'object' ||
        config.creative_reach === null
      ) {
        throw new Error(
          '[set error]: piercing_weapon: creative_reach must be an object',
        );
      }

      const creativeReachFinal: Record<string, unknown> = {};
      if (typeof config.creative_reach.max === 'number') {
        creativeReachFinal.max = config.creative_reach.max;
      }
      if (typeof config.creative_reach.min === 'number') {
        creativeReachFinal.min = config.creative_reach.min;
      }
      cfg.creative_reach = creativeReachFinal;
    }

    // Handle hitbox_margin
    if (config.hitbox_margin !== undefined) {
      if (typeof config.hitbox_margin !== 'number') {
        throw new Error(
          '[set error]: piercing_weapon: hitbox_margin must be a number',
        );
      }
      cfg.hitbox_margin = config.hitbox_margin;
    }

    // Handle reach
    if (config.reach !== undefined) {
      if (typeof config.reach !== 'object' || config.reach === null) {
        throw new Error(
          '[set error]: piercing_weapon: reach must be an object',
        );
      }

      const reachFinal: Record<string, unknown> = {};
      if (typeof config.reach.max === 'number') {
        reachFinal.max = config.reach.max;
      }
      if (typeof config.reach.min === 'number') {
        reachFinal.min = config.reach.min;
      }
      cfg.reach = reachFinal;
    }

    (this.#opt.components as Record<string, unknown>)[
      'minecraft:piercing_weapon'
    ] = cfg;
  }

  /**
   * setProjectile
   * @param config {{ minimum_critical_power?: number; projectile_entity: string }} Projectile configuration
   */
  public setProjectile(config: {
    minimum_critical_power?: number;
    projectile_entity: string;
  }) {
    if (typeof config !== 'object' || config === null) {
      throw new Error(
        '[set error]: projectile: must be an object configuration',
      );
    }

    const cfg: Record<string, unknown> = {};

    // Handle minimum_critical_power
    if (config.minimum_critical_power !== undefined) {
      if (
        typeof config.minimum_critical_power !== 'number' ||
        config.minimum_critical_power < 0
      ) {
        throw new Error(
          '[set error]: projectile: minimum_critical_power must be a number >= 0',
        );
      }
      cfg.minimum_critical_power = config.minimum_critical_power;
    }

    // Handle projectile_entity (required)
    if (typeof config.projectile_entity !== 'string') {
      throw new Error(
        '[set error]: projectile: projectile_entity is required and must be a string',
      );
    }

    const entityPattern =
      /^(?:\w+(?:\.\w+):(?=\w))?(?:\w+(?:\.\w+))(?:<((?:\w+(?:\.\w+):(?=\w))?\w+(?:\.\w+))*>)?$/;
    if (!entityPattern.test(config.projectile_entity)) {
      throw new Error(
        '[set error]: projectile: projectile_entity must match pattern ^(?:\\w+(?:\\.\\w+):(?=\\w))?(?:\\w+(?:\\.\\w+))(?:<((?:\\w+(?:\\.\\w+):(?=\\w))?\\w+(?:\\.\\w+))*>)?$',
      );
    }

    cfg.projectile_entity = config.projectile_entity;
    (this.#opt.components as Record<string, unknown>)['minecraft:projectile'] =
      cfg;
  }

  /**
   * setRecord
   * @param config {{ comparator_signal?: number; duration?: number; sound_event: string }} Record configuration
   */
  public setRecord(config: {
    comparator_signal?: number;
    duration?: number;
    sound_event: string;
  }) {
    if (typeof config !== 'object' || config === null) {
      throw new Error('[set error]: record: must be an object configuration');
    }

    const cfg: Record<string, unknown> = {};

    // Handle comparator_signal
    if (config.comparator_signal !== undefined) {
      if (
        typeof config.comparator_signal !== 'number' ||
        config.comparator_signal < 0
      ) {
        throw new Error(
          '[set error]: record: comparator_signal must be a number >= 0',
        );
      }
      cfg.comparator_signal = config.comparator_signal;
    }

    // Handle duration
    if (config.duration !== undefined) {
      if (typeof config.duration !== 'number' || config.duration <= 0) {
        throw new Error('[set error]: record: duration must be a number > 0');
      }
      cfg.duration = config.duration;
    }

    // Handle sound_event (required)
    if (typeof config.sound_event !== 'string') {
      throw new Error(
        '[set error]: record: sound_event is required and must be a string',
      );
    }
    cfg.sound_event = config.sound_event;
    (this.#opt.components as Record<string, unknown>)['minecraft:record'] = cfg;
  }

  /**
   * setRarity
   * @param config {{ value: 'common' | 'uncommon' | 'rare' | 'epic' }} Rarity configuration
   */
  public setRarity(config: { value: 'common' | 'uncommon' | 'rare' | 'epic' }) {
    if (typeof config !== 'object' || config === null) {
      throw new Error('[set error]: rarity: must be an object configuration');
    }

    const cfg: Record<string, unknown> = {};

    // Handle value (required)
    if (config.value === undefined) {
      throw new Error('[set error]: rarity: value is required');
    }

    if (typeof config.value !== 'string') {
      throw new Error('[set error]: rarity: value must be a string');
    }

    const validRarities = ['common', 'uncommon', 'rare', 'epic'] as const;
    if (!validRarities.includes(config.value as never)) {
      throw new Error(
        '[set error]: rarity: value must be one of: common, uncommon, rare, epic',
      );
    }

    cfg.value = config.value;
    (this.#opt.components as Record<string, unknown>)['minecraft:rarity'] = cfg;
  }

  /**
   * setRepairable
   * @param config {{ on_repaired?: string; repair_items?: Array<string | { items: string[]; repair_amount?: string | number }> }} Repairable configuration
   */
  public setRepairable(config: {
    on_repaired?: string;
    repair_items?: Array<
      string | { items: string[]; repair_amount?: string | number }
    >;
  }) {
    if (typeof config !== 'object' || config === null) {
      throw new Error(
        '[set error]: repairable: must be an object configuration',
      );
    }

    const cfg: Record<string, unknown> = {};

    // Handle on_repaired event
    if (config.on_repaired !== undefined) {
      if (typeof config.on_repaired === 'string') {
        const eventRegex = /^[a-zA-Z_]\w*(?::[a-zA-Z_]\w*)?$/;
        if (!eventRegex.test(config.on_repaired)) {
          throw new Error(
            '[set error]: repairable: on_repaired must be a valid event identifier pattern',
          );
        }
        cfg.on_repaired = config.on_repaired;
      } else {
        throw new Error(
          '[set error]: repairable: on_repaired must be a string',
        );
      }
    }

    // Handle repair_items array
    if (config.repair_items !== undefined) {
      if (Array.isArray(config.repair_items)) {
        const repairItemsFinal: Record<string, unknown>[] = [];

        for (const repairItem of config.repair_items) {
          if (typeof repairItem === 'string') {
            // Simple string format - validate identifier
            const itemRegex = /^[a-zA-Z_]\w*(?::[a-zA-Z_]\w*)?$/;
            if (!itemRegex.test(repairItem)) {
              throw new Error(
                '[set error]: repairable: repair_items string entries must be valid Minecraft item identifiers',
              );
            }
            (repairItemsFinal as (string | Record<string, unknown>)[]).push(
              repairItem,
            );
          } else if (typeof repairItem === 'object' && repairItem !== null) {
            // Complex object format
            const repairItemFinal: Record<string, unknown> = {};

            // Validate required items array
            if (!Array.isArray(repairItem.items)) {
              throw new Error(
                '[set error]: repairable: repair_items object must contain an items array',
              );
            }

            const itemsValid = repairItem.items.every((item: unknown) => {
              if (typeof item !== 'string') return false;
              const itemRegex = /^[a-zA-Z_]\w*(?::[a-zA-Z_]\w*)?$/;
              return itemRegex.test(item);
            });

            if (!itemsValid || repairItem.items.length === 0) {
              throw new Error(
                '[set error]: repairable: repair_items items must be non-empty array of valid Minecraft item identifiers',
              );
            }

            repairItemFinal.items = [...repairItem.items];

            // Validate repair_amount (optional)
            if (repairItem.repair_amount !== undefined) {
              if (
                typeof repairItem.repair_amount === 'string' ||
                typeof repairItem.repair_amount === 'number'
              ) {
                repairItemFinal.repair_amount = repairItem.repair_amount;
              } else {
                throw new Error(
                  '[set error]: repairable: repair_amount must be a string or number',
                );
              }
            }

            repairItemsFinal.push(repairItemFinal);
          } else {
            throw new Error(
              '[set error]: repairable: each repair_items entry must be a string or object',
            );
          }
        }

        cfg.repair_items = repairItemsFinal;
      } else {
        throw new Error(
          '[set error]: repairable: repair_items must be an array',
        );
      }
    }

    (this.#opt.components as Record<string, unknown>)['minecraft:repairable'] =
      cfg;
  }

  /**
   * setSeed
   * @param config {{ crop_result: string; plant_at?: string[]; plant_at_any_solid_surface?: boolean; plant_at_face?: 'UP' | 'DOWN' }} Seed configuration
   */
  public setSeed(config: {
    crop_result: string;
    plant_at?: string[];
    plant_at_any_solid_surface?: boolean;
    plant_at_face?: 'UP' | 'DOWN';
  }) {
    if (typeof config !== 'object' || config === null) {
      throw new Error('[set error]: seed: must be an object configuration');
    }

    const cfg: Record<string, unknown> = {};

    // Validate format version for seed component (requires 1.10.0+)
    const formatParts = this.#opt.format.split('.');
    const major = parseInt(formatParts[0]!);
    const minor = parseInt(formatParts[1]!);
    const patch = parseInt(formatParts[2] || '0');

    function isVersionGE(
      reqMajor: number,
      reqMinor: number,
      reqPatch: number,
    ): boolean {
      if (major > reqMajor) return true;
      if (major < reqMajor) return false;
      if (minor > reqMinor) return true;
      if (minor < reqMinor) return false;
      return patch >= reqPatch;
    }

    if (!isVersionGE(1, 10, 0)) {
      throw new Error(
        '[set error]: seed: component requires format version 1.10.0 or higher',
      );
    }

    // Handle crop_result (required)
    if (typeof config.crop_result !== 'string') {
      throw new Error(
        '[set error]: seed: crop_result is required and must be a string',
      );
    }

    const blockRegex = /^\w+(?::\w+)*$/;
    if (!blockRegex.test(config.crop_result)) {
      throw new Error(
        '[set error]: seed: crop_result must be a valid block identifier',
      );
    }
    cfg.crop_result = config.crop_result;

    // Handle plant_at array
    if (config.plant_at !== undefined) {
      if (Array.isArray(config.plant_at)) {
        const plantAtValid = config.plant_at.every((block: unknown) => {
          if (typeof block !== 'string') return false;
          return blockRegex.test(block);
        });

        if (!plantAtValid) {
          throw new Error(
            '[set error]: seed: plant_at entries must be valid block identifiers',
          );
        }

        cfg.plant_at = [...config.plant_at];
      } else {
        throw new Error(
          '[set error]: seed: plant_at must be an array of strings',
        );
      }
    }

    // Handle deprecated properties (with format version checks)
    const fmtParts = this.#opt.format.split('.');
    const fmtVer = parseFloat(fmtParts[0]! + '.' + fmtParts[1]!);
    if (config.plant_at_any_solid_surface !== undefined) {
      if (typeof config.plant_at_any_solid_surface === 'boolean') {
        if (fmtVer >= 1.19) {
          throw new Error(
            '[set error]: seed: plant_at_any_solid_surface is deprecated and no longer works after format versions of at least 1.19.0',
          );
        }
        cfg.plant_at_any_solid_surface = config.plant_at_any_solid_surface;
      } else {
        throw new Error(
          '[set error]: seed: plant_at_any_solid_surface must be a boolean',
        );
      }
    }

    if (config.plant_at_face !== undefined) {
      if (typeof config.plant_at_face === 'string') {
        const validFaces = ['UP', 'DOWN'] as const;
        if (!validFaces.includes(config.plant_at_face as never)) {
          throw new Error(
            "[set error]: seed: plant_at_face must be either 'UP' or 'DOWN'",
          );
        }
        if (fmtVer >= 1.19) {
          throw new Error(
            '[set error]: seed: plant_at_face is deprecated and no longer works after format versions of at least 1.19.0',
          );
        }
        cfg.plant_at_face = config.plant_at_face;
      } else {
        throw new Error('[set error]: seed: plant_at_face must be a string');
      }
    }

    (this.#opt.components as Record<string, unknown>)['minecraft:seed'] = cfg;
  }

  /**
   * setStackedByData
   * @param config {{ value?: boolean }} StackedByData configuration
   */
  public setStackedByData(config: { value?: boolean }) {
    if (typeof config !== 'object' || config === null) {
      throw new Error(
        '[set error]: stacked_by_data: must be an object configuration',
      );
    }

    const cfg: Record<string, unknown> = {};

    // Handle value (optional, defaults to true)
    if (config.value === undefined) {
      cfg.value = true;
    } else if (typeof config.value === 'boolean') {
      cfg.value = config.value;
    } else {
      throw new Error(
        '[set error]: stacked_by_data: value must be a boolean if provided',
      );
    }

    (this.#opt.components as Record<string, unknown>)[
      'minecraft:stacked_by_data'
    ] = cfg;
  }

  /**
   * setShouldDespawn
   * @param config {{ value?: boolean }} ShouldDespawn configuration
   */
  public setShouldDespawn(config: { value?: boolean }) {
    if (typeof config !== 'object' || config === null) {
      throw new Error(
        '[set error]: should_despawn: must be an object configuration',
      );
    }

    const cfg: Record<string, unknown> = {};

    // Handle value (optional, defaults to true)
    if (config.value === undefined) {
      cfg.value = true;
    } else if (typeof config.value === 'boolean') {
      cfg.value = config.value;
    } else {
      throw new Error(
        '[set error]: should_despawn: value must be a boolean if provided',
      );
    }

    (this.#opt.components as Record<string, unknown>)[
      'minecraft:should_despawn'
    ] = cfg;
  }

  /**
   * setShooter
   * @param config {{
   *   ammunition: Array<string | { item: string; launch_power_scale?: number; max_draw_duration?: number; charge_on_draw?: boolean }>;
   *   charge_on_draw?: boolean;
   *   max_draw_duration?: number;
   *   auto_charge?: boolean;
   *   launch_power?: number;
   *   scale_power_by_draw_duration?: boolean;
   * }} Shooter configuration
   */
  public setShooter(config: {
    ammunition: Array<
      | string
      | {
          item: string;
          launch_power_scale?: number;
          max_draw_duration?: number;
          charge_on_draw?: boolean;
        }
    >;
    charge_on_draw?: boolean;
    max_draw_duration?: number;
    auto_charge?: boolean;
    launch_power?: number;
    scale_power_by_draw_duration?: boolean;
  }) {
    if (typeof config !== 'object' || config === null) {
      throw new Error('[set error]: shooter: must be an object configuration');
    }

    const cfg: Record<string, unknown> = {};

    // Validate format version for shooter component
    const formatParts = this.#opt.format.split('.');
    const major = parseInt(formatParts[0]!);
    const minor = parseInt(formatParts[1]!);
    const patch = parseInt(formatParts[2] || '0');

    function isVersionGE(
      reqMajor: number,
      reqMinor: number,
      reqPatch: number,
    ): boolean {
      if (major > reqMajor) return true;
      if (major < reqMajor) return false;
      if (minor > reqMinor) return true;
      if (minor < reqMinor) return false;
      return patch >= reqPatch;
    }

    if (!isVersionGE(1, 16, 100)) {
      throw new Error(
        '[set error]: shooter: component requires format version 1.16.100 or higher',
      );
    }

    // Handle ammunition (required)
    if (config.ammunition === undefined) {
      throw new Error('[set error]: shooter: ammunition is required');
    }

    if (Array.isArray(config.ammunition)) {
      const ammunitionFinal: Record<string, unknown>[] = [];

      for (const ammunitionItem of config.ammunition) {
        if (typeof ammunitionItem === 'string') {
          // Simple string format - validate identifier
          const itemRegex = /^[a-zA-Z_]\w*(?::[a-zA-Z_]\w*)?$/;
          if (!itemRegex.test(ammunitionItem)) {
            throw new Error(
              '[set error]: shooter: ammunition entries must be valid item identifiers when using string format',
            );
          }
          (ammunitionFinal as (string | Record<string, unknown>)[]).push(
            ammunitionItem,
          );
        } else if (
          typeof ammunitionItem === 'object' &&
          ammunitionItem !== null
        ) {
          // Complex object format with detailed properties
          const ammunitionObject: Record<string, unknown> = {};

          // Validate item (required)
          if (typeof ammunitionItem.item === 'string') {
            const itemRegex = /^[a-zA-Z_]\w*(?::[a-zA-Z_]\w*)?$/;
            if (!itemRegex.test(ammunitionItem.item)) {
              throw new Error(
                '[set error]: shooter: ammunition item property must be a valid item identifier',
              );
            }
            ammunitionObject.item = ammunitionItem.item;
          } else {
            throw new Error(
              '[set error]: shooter: ammunition item property is required and must be a string',
            );
          }

          // Handle launch_power_scale (optional)
          if (ammunitionItem.launch_power_scale !== undefined) {
            if (
              typeof ammunitionItem.launch_power_scale === 'number' &&
              ammunitionItem.launch_power_scale > 0
            ) {
              ammunitionObject.launch_power_scale =
                ammunitionItem.launch_power_scale;
            } else {
              throw new Error(
                '[set error]: shooter: ammunition launch_power_scale must be a positive number',
              );
            }
          }

          // Handle max_draw_duration (optional)
          if (ammunitionItem.max_draw_duration !== undefined) {
            if (
              typeof ammunitionItem.max_draw_duration === 'number' &&
              ammunitionItem.max_draw_duration >= 0
            ) {
              ammunitionObject.max_draw_duration =
                ammunitionItem.max_draw_duration;
            } else {
              throw new Error(
                '[set error]: shooter: ammunition max_draw_duration must be a non-negative number',
              );
            }
          }

          // Handle charge_on_draw (optional)
          if (ammunitionItem.charge_on_draw !== undefined) {
            if (typeof ammunitionItem.charge_on_draw === 'boolean') {
              ammunitionObject.charge_on_draw = ammunitionItem.charge_on_draw;
            } else {
              throw new Error(
                '[set error]: shooter: ammunition charge_on_draw must be a boolean',
              );
            }
          }

          ammunitionFinal.push(ammunitionObject);
        } else {
          throw new Error(
            '[set error]: shooter: ammunition entries must be strings or objects',
          );
        }
      }

      cfg.ammunition = ammunitionFinal;
    } else {
      throw new Error('[set error]: shooter: ammunition must be an array');
    }

    // Handle charge_on_draw (optional)
    if (config.charge_on_draw !== undefined) {
      if (typeof config.charge_on_draw === 'boolean') {
        cfg.charge_on_draw = config.charge_on_draw;
      } else {
        throw new Error(
          '[set error]: shooter: charge_on_draw must be a boolean',
        );
      }
    }

    // Handle max_draw_duration (optional)
    if (config.max_draw_duration !== undefined) {
      if (
        typeof config.max_draw_duration === 'number' &&
        config.max_draw_duration >= 0
      ) {
        cfg.max_draw_duration = config.max_draw_duration;
      } else {
        throw new Error(
          '[set error]: shooter: max_draw_duration must be a non-negative number',
        );
      }
    }

    // Handle auto_charge (optional)
    if (config.auto_charge !== undefined) {
      if (typeof config.auto_charge === 'boolean') {
        cfg.auto_charge = config.auto_charge;
      } else {
        throw new Error('[set error]: shooter: auto_charge must be a boolean');
      }
    }

    // Handle launch_power (optional)
    if (config.launch_power !== undefined) {
      if (typeof config.launch_power === 'number' && config.launch_power >= 0) {
        cfg.launch_power = config.launch_power;
      } else {
        throw new Error(
          '[set error]: shooter: launch_power must be a non-negative number',
        );
      }
    }

    // Handle scale_power_by_draw_duration (optional)
    if (config.scale_power_by_draw_duration !== undefined) {
      if (typeof config.scale_power_by_draw_duration === 'boolean') {
        cfg.scale_power_by_draw_duration = config.scale_power_by_draw_duration;
      } else {
        throw new Error(
          '[set error]: shooter: scale_power_by_draw_duration must be a boolean',
        );
      }
    }

    (this.#opt.components as Record<string, unknown>)['minecraft:shooter'] =
      cfg;
  }

  /**
   * setStorageWeightModifier
   * @param config {{ weight_in_storage_item: number }} Storage weight modifier configuration
   */
  public setStorageWeightModifier(config: { weight_in_storage_item: number }) {
    // Validate format version for storage_weight_modifier component
    const formatParts = this.#opt.format.split('.');
    const major = parseInt(formatParts[0]!);
    const minor = parseInt(formatParts[1]!);
    const patch = parseInt(formatParts[2] || '0');

    function isVersionGE(
      reqMajor: number,
      reqMinor: number,
      reqPatch: number,
    ): boolean {
      if (major > reqMajor) return true;
      if (major < reqMajor) return false;
      if (minor > reqMinor) return true;
      if (minor < reqMinor) return false;
      return patch >= reqPatch;
    }

    if (!isVersionGE(1, 21, 40)) {
      throw new Error(
        '[set error]: storage_weight_modifier: component requires format version 1.21.40 or higher',
      );
    }

    // Validate weight_in_storage_item (required)
    if (config.weight_in_storage_item === undefined) {
      throw new Error(
        '[set error]: storage_weight_modifier: weight_in_storage_item is required',
      );
    }

    if (typeof config.weight_in_storage_item !== 'number') {
      throw new Error(
        '[set error]: storage_weight_modifier: weight_in_storage_item must be a number',
      );
    }

    if (
      config.weight_in_storage_item < 0 ||
      config.weight_in_storage_item > 64
    ) {
      throw new Error(
        '[set error]: storage_weight_modifier: weight_in_storage_item must be between 0 and 64',
      );
    }

    (this.#opt.components as Record<string, unknown>)[
      'minecraft:storage_weight_modifier'
    ] = {
      weight_in_storage_item: config.weight_in_storage_item,
    };
  }

  /**
   * setStorageWeightLimit
   * @param config {{ storage_capacity_per_slot: number; }} Storage weight limit configuration
   */
  public setStorageWeightLimit(config: { storage_capacity_per_slot: number }) {
    // Validate format version for storage_weight_limit component
    const formatParts = this.#opt.format.split('.');
    const major = parseInt(formatParts[0]!);
    const minor = parseInt(formatParts[1]!);
    const patch = parseInt(formatParts[2] || '0');

    function isVersionGE(
      reqMajor: number,
      reqMinor: number,
      reqPatch: number,
    ): boolean {
      if (major > reqMajor) return true;
      if (major < reqMajor) return false;
      if (minor > reqMinor) return true;
      if (minor < reqMinor) return false;
      return patch >= reqPatch;
    }

    if (!isVersionGE(1, 21, 40)) {
      throw new Error(
        '[set error]: storage_weight_limit: component requires format version 1.21.40 or higher',
      );
    }

    // Validate storage_capacity_per_slot (required)
    if (config.storage_capacity_per_slot === undefined) {
      throw new Error(
        '[set error]: storage_weight_limit: storage_capacity_per_slot is required',
      );
    }

    if (typeof config.storage_capacity_per_slot !== 'number') {
      throw new Error(
        '[set error]: storage_weight_limit: storage_capacity_per_slot must be a number',
      );
    }

    if (
      config.storage_capacity_per_slot < 0 ||
      config.storage_capacity_per_slot > 64
    ) {
      throw new Error(
        '[set error]: storage_weight_limit: storage_capacity_per_slot must be between 0 and 64',
      );
    }

    (this.#opt.components as Record<string, unknown>)[
      'minecraft:storage_weight_limit'
    ] = {
      storage_capacity_per_slot: config.storage_capacity_per_slot,
    };
  }

  /**
   * setStorageItem (enhanced existing method)
   * @param config {object} Storage item configuration
   */
  public setStorageItem(config: {
    max_slots?: number;
    max_weight_limit?: number;
    weight_in_storage_item?: number;
    allow_nested_storage_items?: boolean;
    allowed_items?: string[];
    banned_items?: string[];
  }) {
    // Validate format version for storage_item component
    const formatParts = this.#opt.format.split('.');
    const major = parseInt(formatParts[0]!);
    const minor = parseInt(formatParts[1]!);
    const patch = parseInt(formatParts[2] || '0');

    function isVersionGE(
      reqMajor: number,
      reqMinor: number,
      reqPatch: number,
    ): boolean {
      if (major > reqMajor) return true;
      if (major < reqMajor) return false;
      if (minor > reqMinor) return true;
      if (minor < reqMinor) return false;
      return patch >= reqPatch;
    }

    if (!isVersionGE(1, 21, 40)) {
      throw new Error(
        '[set error]: storage_item: component requires format version 1.21.40 or higher',
      );
    }

    if (!this.#opt.components.storage_item) {
      this.#opt.components.storage_item = {};
    }

    // Validate max_slots if provided
    if (typeof config.max_slots === 'number') {
      if (config.max_slots < 1 || config.max_slots > 64) {
        throw new Error(
          '[set error]: storage_item: max_slots must be between 1 and 64',
        );
      }
      this.#opt.components.storage_item.max_slots = config.max_slots;
    }

    // Validate max_weight_limit if provided
    if (typeof config.max_weight_limit === 'number') {
      if (config.max_weight_limit < 0) {
        throw new Error(
          '[set error]: storage_item: max_weight_limit must be non-negative',
        );
      }
      this.#opt.components.storage_item.max_weight_limit =
        config.max_weight_limit;
    }

    // Validate weight_in_storage_item if provided
    if (typeof config.weight_in_storage_item === 'number') {
      if (
        config.weight_in_storage_item < 0 ||
        config.weight_in_storage_item > 64
      ) {
        throw new Error(
          '[set error]: storage_item: weight_in_storage_item must be between 0 and 64',
        );
      }
      this.#opt.components.storage_item.weight_in_storage_item =
        config.weight_in_storage_item;
    }

    // Handle boolean properties
    if (typeof config.allow_nested_storage_items === 'boolean') {
      this.#opt.components.storage_item.allow_nested_storage_items =
        config.allow_nested_storage_items;
    }

    // Validate allowed_items if provided
    if (Array.isArray(config.allowed_items)) {
      for (const item of config.allowed_items) {
        if (typeof item !== 'string') {
          throw new Error(
            '[set error]: storage_item: allowed_items entries must be strings',
          );
        }
        const itemRegex = /^[a-zA-Z_][\w.]*(?::[a-zA-Z_][\w.]*)?$/;
        if (!itemRegex.test(item)) {
          throw new Error(
            '[set error]: storage_item: allowed_items entries must be valid item identifiers',
          );
        }
      }
      this.#opt.components.storage_item.allowed_items = [
        ...config.allowed_items,
      ];
    }

    // Validate banned_items if provided
    if (Array.isArray(config.banned_items)) {
      for (const item of config.banned_items) {
        if (typeof item !== 'string') {
          throw new Error(
            '[set error]: storage_item: banned_items entries must be strings',
          );
        }
        const itemRegex = /^[a-zA-Z_][\w.]*(?::[a-zA-Z_][\w.]*)?$/;
        if (!itemRegex.test(item)) {
          throw new Error(
            '[set error]: storage_item: banned_items entries must be valid item identifiers',
          );
        }
      }
      this.#opt.components.storage_item.banned_items = [...config.banned_items];
    }
  }

  /**
   * Set minecraft:throwable component
   * @param config {object} Throwable configuration
   */
  public setThrowable(config: {
    do_swing_animation?: boolean;
    launch_power_scale?: number;
    max_draw_duration?: number;
    max_launch_power?: number;
    min_draw_duration?: number;
    scale_power_by_draw_duration?: boolean;
  }) {
    // Initialize the component if it doesn't exist
    if (!this.#opt.components['minecraft:throwable']) {
      this.#opt.components['minecraft:throwable'] = {};
    }

    // Handle do_swing_animation
    if (typeof config.do_swing_animation === 'boolean') {
      this.#opt.components['minecraft:throwable'].do_swing_animation =
        config.do_swing_animation;
    }

    // Handle launch_power_scale - must be non-negative
    if (typeof config.launch_power_scale === 'number') {
      if (config.launch_power_scale >= 0) {
        this.#opt.components['minecraft:throwable'].launch_power_scale =
          config.launch_power_scale;
      } else {
        throw new Error(
          '[set error]: throwable: launch_power_scale must be non-negative',
        );
      }
    }

    // Handle max_draw_duration - must be non-negative
    if (typeof config.max_draw_duration === 'number') {
      if (config.max_draw_duration >= 0) {
        this.#opt.components['minecraft:throwable'].max_draw_duration =
          config.max_draw_duration;
      } else {
        throw new Error(
          '[set error]: throwable: max_draw_duration must be non-negative',
        );
      }
    }

    // Handle max_launch_power - must be non-negative
    if (typeof config.max_launch_power === 'number') {
      if (config.max_launch_power >= 0) {
        this.#opt.components['minecraft:throwable'].max_launch_power =
          config.max_launch_power;
      } else {
        throw new Error(
          '[set error]: throwable: max_launch_power must be non-negative',
        );
      }
    }

    // Handle min_draw_duration - must be non-negative
    if (typeof config.min_draw_duration === 'number') {
      if (config.min_draw_duration >= 0) {
        this.#opt.components['minecraft:throwable'].min_draw_duration =
          config.min_draw_duration;
      } else {
        throw new Error(
          '[set error]: throwable: min_draw_duration must be non-negative',
        );
      }
    }

    // Handle scale_power_by_draw_duration
    if (typeof config.scale_power_by_draw_duration === 'boolean') {
      this.#opt.components['minecraft:throwable'].scale_power_by_draw_duration =
        config.scale_power_by_draw_duration;
    }
  }

  /**
   * Set minecraft:tags component
   * @param tags {string[]} Array of item tags
   */
  public setTags(tags: string[]) {
    // Initialize the component if it doesn't exist
    if (!this.#opt.components['minecraft:tags']) {
      this.#opt.components['minecraft:tags'] = {};
    }

    // Validate the tags array
    if (!Array.isArray(tags)) {
      throw new Error('[set error]: tags: must be an array');
    }

    // Validate each tag
    for (const tag of tags) {
      if (typeof tag !== 'string') {
        throw new Error('[set error]: tags: all entries must be strings');
      }

      const tagRegex = /^[a-zA-Z_][\w:]*$/;
      if (!tagRegex.test(tag)) {
        throw new Error(
          `[set error]: tags: tag "${tag}" is not a valid tag format`,
        );
      }
    }

    this.#opt.components['minecraft:tags'].tags = [...tags];
  }

  /**
   * Set minecraft:swing_duration component
   * @param duration {number} Swing animation duration in seconds
   */
  public setSwingDuration(duration: number) {
    // Validate the duration
    if (typeof duration !== 'number' || duration < 0) {
      throw new Error(
        '[set error]: swing_duration: must be a non-negative number',
      );
    }

    // Initialize the component if it doesn't exist
    if (!this.#opt.components['minecraft:swing_duration']) {
      this.#opt.components['minecraft:swing_duration'] = {};
    }

    this.#opt.components['minecraft:swing_duration'].value = duration;
  }

  /**
   * Set minecraft:use_animation component
   * @param animation {string | { value?: string }} Animation configuration - can be string ("eat", "drink", etc.) or object ({ value: "eat" })
   */
  public setUseAnimation(animation: string | { value?: string }) {
    // Initialize the component if it doesn't exist
    if (!this.#opt.components['minecraft:use_animation']) {
      this.#opt.components['minecraft:use_animation'] = {};
    }

    if (typeof animation === 'string') {
      // String format - validate it's not empty
      const trimmedValue = animation.trim();
      if (trimmedValue.length === 0) {
        throw new Error(
          '[set error]: use_animation: string value cannot be empty',
        );
      }

      // Store the string value directly
      this.#opt.components['minecraft:use_animation'] = trimmedValue;
    } else if (typeof animation === 'object' && animation !== null) {
      // Object format - validate and store
      if (typeof animation.value === 'string') {
        const trimmedValue = animation.value.trim();
        if (trimmedValue.length === 0) {
          throw new Error(
            '[set error]: use_animation: object value cannot be empty',
          );
        }
        // Initialize as object if it's currently a string
        if (
          typeof this.#opt.components['minecraft:use_animation'] === 'string'
        ) {
          this.#opt.components['minecraft:use_animation'] = {};
        }
        (
          this.#opt.components['minecraft:use_animation'] as Record<
            string,
            unknown
          >
        ).value = trimmedValue;
      }
    } else {
      throw new Error(
        '[set error]: use_animation: must be a string or object with value property',
      );
    }
  }

  /**
   * Set minecraft:wearable component
   * @param config {object} Wearable configuration
   */
  public setWearable(config: {
    slot:
      | 'slot.armor.head'
      | 'slot.armor.chest'
      | 'slot.armor.legs'
      | 'slot.armor.feet'
      | 'slot.armor.body'
      | 'slot.weapon.mainhand'
      | 'slot.weapon.offhand';
    protection?: number;
    hides_player_location?: boolean;
    dispensable?: boolean;
  }) {
    // Initialize the component if it doesn't exist
    if (!this.#opt.components['minecraft:wearable']) {
      this.#opt.components['minecraft:wearable'] = {
        slot: config.slot,
      };
    } else {
      this.#opt.components['minecraft:wearable']!.slot = config.slot;
    }

    // Validate and set slot (required)
    if (typeof config.slot !== 'string' || !config.slot.startsWith('slot.')) {
      throw new Error(
        '[set error]: wearable: slot must be a valid equipment slot',
      );
    }

    // Set protection (optional, must be non-negative integer)
    if (typeof config.protection === 'number') {
      if (config.protection >= 0 && Number.isInteger(config.protection)) {
        this.#opt.components['minecraft:wearable']!.protection =
          config.protection;
      } else {
        throw new Error(
          '[set error]: wearable: protection must be a non-negative integer',
        );
      }
    }

    // Set hides_player_location (optional boolean)
    if (typeof config.hides_player_location === 'boolean') {
      this.#opt.components['minecraft:wearable']!.hides_player_location =
        config.hides_player_location;
    }

    // Set dispensable (optional boolean)
    if (typeof config.dispensable === 'boolean') {
      this.#opt.components['minecraft:wearable']!.dispensable =
        config.dispensable;
    }
  }

  /**
   * Set minecraft:use_modifiers component
   * @param config {object} Use modifiers configuration
   */
  public setUseModifiers(config: {
    use_duration: number;
    movement_modifier?: number;
    emit_vibrations?: boolean;
    start_sound?: string;
  }) {
    // Validate use_duration (required, non-negative)
    if (typeof config.use_duration !== 'number' || config.use_duration < 0) {
      throw new Error(
        '[set error]: use_modifiers: use_duration must be a non-negative number',
      );
    }

    // Validate movement_modifier (optional, must be ≤ 1.0)
    if (
      typeof config.movement_modifier === 'number' &&
      config.movement_modifier > 1.0
    ) {
      throw new Error(
        '[set error]: use_modifiers: movement_modifier must be ≤ 1.0',
      );
    }

    // Initialize the component if it doesn't exist
    if (!this.#opt.components['minecraft:use_modifiers']) {
      this.#opt.components['minecraft:use_modifiers'] = {
        use_duration: config.use_duration,
      };
    } else {
      this.#opt.components['minecraft:use_modifiers']!.use_duration =
        config.use_duration;
    }

    // Set movement_modifier if provided
    if (typeof config.movement_modifier === 'number') {
      this.#opt.components['minecraft:use_modifiers']!.movement_modifier =
        config.movement_modifier;
    } else if (config.movement_modifier === undefined) {
      delete this.#opt.components['minecraft:use_modifiers']!.movement_modifier;
    }

    // Set emit_vibrations if provided
    if (typeof config.emit_vibrations === 'boolean') {
      this.#opt.components['minecraft:use_modifiers']!.emit_vibrations =
        config.emit_vibrations;
    } else if (config.emit_vibrations === undefined) {
      delete this.#opt.components['minecraft:use_modifiers']!.emit_vibrations;
    }

    // Set start_sound if provided (optional string)
    if (typeof config.start_sound === 'string') {
      const trimmedSound = config.start_sound.trim();
      if (trimmedSound.length > 0) {
        this.#opt.components['minecraft:use_modifiers']!.start_sound =
          trimmedSound;
      }
    } else if (config.start_sound === undefined) {
      delete this.#opt.components['minecraft:use_modifiers']!.start_sound;
    }
  }

  public setDamage(value: number) {
    this.#opt.components.damage = value;
  }

  public setCanDestroyInCreative(value: boolean) {
    this.#opt.components.canDestroyInCreative = value;
  }

  public setSwingSounds(
    config:
      | { sound: string }
      | {
          attack_critical_hit?: string;
          attack_hit?: string;
          attack_miss?: string;
        },
  ) {
    (this.#opt.components as Record<string, unknown>)[
      'minecraft:swing_sounds'
    ] = config;
  }

  public setWeapon(config: Record<string, unknown>) {
    (this.#opt.components as Record<string, unknown>)['minecraft:weapon'] =
      config;
  }

  public setKnockbackResistance(config: {
    value?: number;
    protection?: number;
  }) {
    (this.#opt.components as Record<string, unknown>)[
      'minecraft:knockback_resistance'
    ] = config;
  }

  public getIcon() {
    return this.#opt.components.icon;
  }
  public getAllowOffHand() {
    return this.#opt.components.offHand;
  }
  public getTags() {
    return this.#opt.components.tags;
  }
  public getDamageAbsorption() {
    return this.#opt.components.damage_absorption;
  }
  public getDurability() {
    return this.#opt.components.durability;
  }
  public getMaxStackSize() {
    return this.#opt.components.max_stack_size;
  }
  public getShouldDespawn() {
    return (this.#opt.components as Record<string, unknown>).should_despawn;
  }
  public getHandEquipped() {
    return this.#opt.components.hand_equipped;
  }
  public getRepairable() {
    return (this.#opt.components as Record<string, unknown>).repairable;
  }
  public getFuel() {
    return this.#opt.components.fuel;
  }
  public getStorageWeightModifier() {
    return this.#opt.components['minecraft:storage_weight_modifier'];
  }
  public getStorageWeightLimit() {
    return this.#opt.components['minecraft:storage_weight_limit'];
  }
  public getStorageItem() {
    return this.#opt.components['minecraft:storage_item'];
  }
  public getBundleInteraction() {
    return this.#opt.components.bundle_interaction;
  }
  public getCooldown() {
    return this.#opt.components.cooldown;
  }
  public getCompostable() {
    return this.#opt.components.compostable;
  }
  public getBlockPlacer() {
    return this.#opt.components.block_placer;
  }
  public getThrowable() {
    return this.#opt.components['minecraft:throwable'];
  }
  public getProjectile() {
    return (this.#opt.components as Record<string, unknown>)[
      'minecraft:projectile'
    ];
  }
  public getRecord() {
    return (this.#opt.components as Record<string, unknown>)[
      'minecraft:record'
    ];
  }
  public getGlint() {
    return (this.#opt.components as Record<string, unknown>)['minecraft:glint'];
  }
  public getUseAnimation() {
    return this.#opt.components['minecraft:use_animation'];
  }
  public getWearable() {
    return this.#opt.components['minecraft:wearable'];
  }
  public getUseModifiers() {
    return this.#opt.components['minecraft:use_modifiers'];
  }
  public getFormat() {
    return this.#opt.format;
  }
  public getDamage() {
    return this.#opt.components.damage;
  }
  public getCanDestroyInCreative() {
    return this.#opt.components.canDestroyInCreative;
  }
  public getDigger() {
    return this.#opt.components.digger;
  }
  public getDurabilitySensor() {
    return this.#opt.components.durability_sensor;
  }
  public getDyeable() {
    return this.#opt.components.dyeable;
  }
  public getEnchantable() {
    return this.#opt.components.enchantable;
  }
  public getFood() {
    return this.#opt.components['minecraft:food'];
  }
  public getFireResistant() {
    return this.#opt.components['minecraft:fire_resistant'];
  }
  public getEntityPlacer() {
    return this.#opt.components['minecraft:entity_placer'];
  }
  public getKineticWeapon() {
    return this.#opt.components['minecraft:kinetic_weapon'];
  }
  public getInteractButton() {
    return this.#opt.components['minecraft:interact_button'];
  }
  public getHoverTextColor() {
    return this.#opt.components['minecraft:hover_text_color'];
  }
  public getLiquidClipped() {
    return this.#opt.components['minecraft:liquid_clipped'];
  }
  public getPiercingWeapon() {
    return (this.#opt.components as Record<string, unknown>).piercing_weapon;
  }
  public getRarity() {
    return (this.#opt.components as Record<string, unknown>).rarity;
  }
  public getSeed() {
    return (this.#opt.components as Record<string, unknown>).seed;
  }
  public getStackedByData() {
    return (this.#opt.components as Record<string, unknown>).stacked_by_data;
  }
  public getShooter() {
    return (this.#opt.components as Record<string, unknown>).shooter;
  }
  public getSwingDuration() {
    return this.#opt.components['minecraft:swing_duration'];
  }
  public getSwingSounds() {
    return this.#opt.components['minecraft:swing_sounds'];
  }
  public getWeapon() {
    return (this.#opt.components as Record<string, unknown>)[
      'minecraft:weapon'
    ];
  }
  public getKnockbackResistance() {
    return (this.#opt.components as Record<string, unknown>)[
      'minecraft:knockback_resistance'
    ];
  }
}
export { ItemComponent };

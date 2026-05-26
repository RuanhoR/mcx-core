import * as t from './../types'

class EntityComponent {
  #opt: t.EntityComponentOpt

  constructor(opt: t.EntityComponentOpt) {
    this.#opt = opt
  }

  public toJSON(): t.EntityJSON {
    if (!this.#opt) throw new Error('[mcx component]: cannot read component')

    const result: t.EntityJSON = {
      format_version: '',
      _meta: {
        type: 'entity',
        file_edit: [],
      },
      'minecraft:entity': {
        description: {
          identifier: '',
        },
      },
    }

    // 设置格式版本
    if (
      typeof this.#opt.format == 'string' &&
      /\d.\d.\d/.test(this.#opt.format)
    ) {
      result['format_version'] = this.#opt.format
    } else {
      throw new Error('[compile component]: no format')
    }

    // 设置实体标识符
    if (
      typeof this.#opt.id == 'string' &&
      /[a-zA-Z0-9_]:[a-zA-Z0-9_]/.test(this.#opt.id)
    ) {
      result['minecraft:entity'].description.identifier = this.#opt.id
    } else {
      throw new Error('[compile component]: no id')
    }

    // 设置是否可生成和召唤
    if (typeof this.#opt.is_spawnable === 'boolean') {
      result['minecraft:entity'].description.is_spawnable =
        this.#opt.is_spawnable
    }

    if (typeof this.#opt.is_summonable === 'boolean') {
      result['minecraft:entity'].description.is_summonable =
        this.#opt.is_summonable
    }

    // 处理组件
    if (this.#opt.components) {
      const components = this.#opt.components

      // 检查是否需要components字段
      const hasComponents =
        typeof components.physics === 'boolean' ||
        components.addrider !== void 0 ||
        components['minecraft:admire_item'] !== void 0 ||
        components['minecraft:ageable'] !== void 0 ||
        components['minecraft:anger_level'] !== void 0 ||
        components['minecraft:angry'] !== void 0 ||
        components['minecraft:annotation.break_door'] !== void 0 ||
        components['minecraft:annotation.open_door'] !== void 0 ||
        components['minecraft:attack'] !== void 0 ||
        components['minecraft:area_attack'] !== void 0 ||
        components['minecraft:attack_cooldown'] !== void 0 ||
        components['minecraft:balloonable'] !== void 0 ||
        components['minecraft:barter'] !== void 0 ||
        components['minecraft:block_climber'] !== void 0 ||
        components['minecraft:block_sensor'] !== void 0 ||
        components['minecraft:body_rotation_axis_aligned'] !== void 0 ||
        components['minecraft:body_rotation_always_follows_head'] !== void 0 ||
        components['minecraft:body_rotation_blocked'] !== void 0 ||
        components['minecraft:body_rotation_locked_to_vehicle'] !== void 0 ||
        components['minecraft:boostable'] !== void 0 ||
        components['minecraft:boss'] !== void 0 ||
        components['minecraft:break_blocks'] !== void 0 ||
        components['minecraft:breathable'] !== void 0 ||
        components['minecraft:bribeable'] !== void 0 ||
        components['minecraft:breedable'] !== void 0 ||
        components['minecraft:buoyant'] !== void 0 ||
        components['minecraft:burns_in_daylight'] !== void 0 ||
        components['minecraft:cannot_be_attacked'] !== void 0 ||
        components['minecraft:can_climb'] !== void 0 ||
        components['minecraft:can_fly'] !== void 0 ||
        components['minecraft:can_join_raid'] !== void 0 ||
        components['minecraft:can_power_jump'] !== void 0 ||
        components['minecraft:celebrate_hunt'] !== void 0 ||
        components['minecraft:collision_box'] !== void 0 ||
        components['minecraft:color'] !== void 0 ||
        components['minecraft:color2'] !== void 0 ||
        components['minecraft:combat_regeneration'] !== void 0 ||
        components['minecraft:conditional_bandwidth_optimization'] !== void 0 ||
        components['minecraft:custom_hit_test'] !== void 0 ||
        components['minecraft:damage_over_time'] !== void 0 ||
        components['minecraft:damage_sensor'] !== void 0 ||
        components['minecraft:dash'] !== void 0 ||
        components['minecraft:dash_action'] !== void 0 ||
        components['minecraft:default_look_angle'] !== void 0 ||
        components['minecraft:despawn'] !== void 0 ||
        components['minecraft:dimension_bound'] !== void 0 ||
        components['minecraft:drying_out_timer'] !== void 0 ||
        components['minecraft:dweller'] !== void 0 ||
        components['minecraft:economy_trade_table'] !== void 0 ||
        components['minecraft:entity_armor_equipment_slot_mapping'] !==
          void 0 ||
        components['minecraft:entity_sensor'] !== void 0 ||
        components['minecraft:environment_sensor'] !== void 0 ||
        components['minecraft:equipment'] !== void 0 ||
        components['minecraft:equippable'] !== void 0 ||
        components['minecraft:equip_item'] !== void 0 ||
        components['minecraft:exhaustion_values'] !== void 0 ||
        components['minecraft:experience_reward'] !== void 0 ||
        components['minecraft:explode'] !== void 0 ||
        components['minecraft:fire_immune'] !== void 0 ||
        components['minecraft:floats_in_liquid'] !== void 0 ||
        components['minecraft:flocking'] !== void 0 ||
        components['minecraft:flying_speed'] !== void 0 ||
        components['minecraft:follow_range'] !== void 0 ||
        components['minecraft:free_camera_controlled'] !== void 0 ||
        components['minecraft:friction_modifier'] !== void 0 ||
        components['minecraft:game_event_movement_tracking'] !== void 0 ||
        components['minecraft:genetics'] !== void 0 ||
        components['minecraft:giveable'] !== void 0 ||
        components['minecraft:ground_offset'] !== void 0 ||
        components['minecraft:group_size'] !== void 0 ||
        components['minecraft:grows_crop'] !== void 0 ||
        components['minecraft:health'] !== void 0 ||
        components['minecraft:heartbeat'] !== void 0 ||
        components['minecraft:hide'] !== void 0 ||
        components['minecraft:home'] !== void 0 ||
        components['minecraft:horse.jump_strength'] !== void 0 ||
        components['minecraft:hurt_on_condition'] !== void 0 ||
        components['minecraft:ignore_cannot_be_attacked'] !== void 0 ||
        components['minecraft:input_air_controlled'] !== void 0 ||
        components['minecraft:input_ground_controlled'] !== void 0 ||
        components['minecraft:inside_block_notifier'] !== void 0 ||
        components['minecraft:insomnia'] !== void 0 ||
        components['minecraft:instant_despawn'] !== void 0 ||
        components['minecraft:interact'] !== void 0 ||
        components['minecraft:inventory'] !== void 0 ||
        components['minecraft:is_baby'] !== void 0 ||
        components['minecraft:is_charged'] !== void 0 ||
        components['minecraft:is_chested'] !== void 0 ||
        components['minecraft:is_dyeable'] !== void 0 ||
        components['minecraft:is_ignited'] !== void 0 ||
        components['minecraft:is_pregnant'] !== void 0 ||
        components['minecraft:item_controllable'] !== void 0 ||
        components['minecraft:leashable'] !== void 0 ||
        components['minecraft:leashable_to'] !== void 0 ||
        components['minecraft:looked_at'] !== void 0 ||
        components['minecraft:loot'] !== void 0 ||
        components['minecraft:item_hopper'] !== void 0 ||
        components['minecraft:managed_wandering_trader'] !== void 0 ||
        components['minecraft:mark_variant'] !== void 0 ||
        components['minecraft:mob_effect'] !== void 0 ||
        components['minecraft:mob_effect_immunity'] !== void 0 ||
        components['minecraft:movement'] !== void 0 ||
        components['minecraft:movement.amphibious'] !== void 0 ||
        components['minecraft:movement.basic'] !== void 0 ||
        components['minecraft:movement.dolphin'] !== void 0 ||
        components['minecraft:movement.fly'] !== void 0 ||
        components['minecraft:movement.generic'] !== void 0 ||
        components['minecraft:movement.glide'] !== void 0 ||
        components['minecraft:movement.hover'] !== void 0 ||
        components['minecraft:movement.jump'] !== void 0 ||
        components['minecraft:movement.skip'] !== void 0 ||
        components['minecraft:movement.sound_distance_offset'] !== void 0 ||
        components['minecraft:movement.sway'] !== void 0 ||
        components['minecraft:nameable'] !== void 0 ||
        components['minecraft:navigation.climb'] !== void 0 ||
        components['minecraft:navigation.float'] !== void 0 ||
        components['minecraft:navigation.fly'] !== void 0 ||
        components['minecraft:navigation.generic'] !== void 0 ||
        components['minecraft:navigation.hover'] !== void 0 ||
        components['minecraft:navigation.swim'] !== void 0 ||
        components['minecraft:navigation.walk'] !== void 0 ||
        components['minecraft:offspring'] !== void 0 ||
        components['minecraft:preferred_path'] !== void 0

      if (hasComponents) {
        result['minecraft:entity'].components = {}
        const ApplyComponents = result['minecraft:entity'].components
        if (typeof components.physics === 'boolean') {
          ApplyComponents['minecraft:physics'] = {}
        }
        if (components.addrider) {
          const addriderConfig: any = {}

          if (components.addrider.entity_type) {
            addriderConfig.entity_type = components.addrider.entity_type
          }

          if (
            Array.isArray(components.addrider.riders) &&
            components.addrider.riders.length > 0
          ) {
            addriderConfig.riders = [...components.addrider.riders]
          }

          if (components.addrider.spawn_event) {
            addriderConfig.spawn_event = components.addrider.spawn_event
          }

          ApplyComponents['addrider'] = addriderConfig
        }
        if (components['minecraft:admire_item']) {
          const admireItemConfig = components['minecraft:admire_item']
          ApplyComponents['minecraft:admire_item'] = { ...admireItemConfig }
        }
        if (components['minecraft:ageable']) {
          const ageableConfig = components['minecraft:ageable']
          ApplyComponents['minecraft:ageable'] = { ...ageableConfig }
        }
        if (components['minecraft:anger_level']) {
          const angerLevelConfig = components['minecraft:anger_level']
          ApplyComponents['minecraft:anger_level'] = { ...angerLevelConfig }
        }
        if (components['minecraft:angry']) {
          const angryConfig = components['minecraft:angry']
          ApplyComponents['minecraft:angry'] = { ...angryConfig }
        }
        if (components['minecraft:annotation.break_door']) {
          const breakDoorConfig = components['minecraft:annotation.break_door']
          ApplyComponents['minecraft:annotation.break_door'] = {
            ...breakDoorConfig,
          }
        }
        if (components['minecraft:annotation.open_door']) {
          // minecraft:annotation.open_door是一个空对象{}
          ApplyComponents['minecraft:annotation.open_door'] = {}
        }
        if (components['minecraft:attack']) {
          const attackConfig = components['minecraft:attack']
          ApplyComponents['minecraft:attack'] = { ...attackConfig }
        }
        if (components['minecraft:area_attack']) {
          const areaAttackConfig = components['minecraft:area_attack']
          ApplyComponents['minecraft:area_attack'] = { ...areaAttackConfig }
        }
        if (components['minecraft:attack_cooldown']) {
          const attackCooldownConfig = components['minecraft:attack_cooldown']
          ApplyComponents['minecraft:attack_cooldown'] = {
            ...attackCooldownConfig,
          }
        }
        if (components['minecraft:balloonable']) {
          const balloonableConfig = components['minecraft:balloonable']
          ApplyComponents['minecraft:balloonable'] = { ...balloonableConfig }
        }
        if (components['minecraft:barter']) {
          const barterConfig = components['minecraft:barter']
          ApplyComponents['minecraft:barter'] = { ...barterConfig }
        }
        if (components['minecraft:block_climber']) {
          // minecraft:block_climber 是一个空对象{}
          ApplyComponents['minecraft:block_climber'] = {}
        }
        if (components['minecraft:block_sensor']) {
          const blockSensorConfig = components['minecraft:block_sensor']
          ApplyComponents['minecraft:block_sensor'] = { ...blockSensorConfig }
        }
        if (components['minecraft:body_rotation_axis_aligned']) {
          ApplyComponents['minecraft:body_rotation_axis_aligned'] = {}
        }
        if (components['minecraft:body_rotation_always_follows_head']) {
          ApplyComponents['minecraft:body_rotation_always_follows_head'] = {}
        }
        if (components['minecraft:body_rotation_blocked']) {
          ApplyComponents['minecraft:body_rotation_blocked'] = {}
        }
        if (components['minecraft:body_rotation_locked_to_vehicle']) {
          ApplyComponents['minecraft:body_rotation_locked_to_vehicle'] = {}
        }
        if (components['minecraft:boostable']) {
          const boostableConfig = components['minecraft:boostable']
          ApplyComponents['minecraft:boostable'] = { ...boostableConfig }
        }
        if (components['minecraft:boss']) {
          const bossConfig = components['minecraft:boss']
          ApplyComponents['minecraft:boss'] = { ...bossConfig }
        }
        if (components['minecraft:break_blocks']) {
          const breakBlocksConfig = components['minecraft:break_blocks']
          ApplyComponents['minecraft:break_blocks'] = { ...breakBlocksConfig }
        }
        if (components['minecraft:breathable']) {
          const breathableConfig = components['minecraft:breathable']
          ApplyComponents['minecraft:breathable'] = { ...breathableConfig }
        }
        if (components['minecraft:bribeable']) {
          const bribeableConfig = components['minecraft:bribeable']
          ApplyComponents['minecraft:bribeable'] = { ...bribeableConfig }
        }
        if (components['minecraft:breedable']) {
          const breedableConfig = components['minecraft:breedable']
          ApplyComponents['minecraft:breedable'] = { ...breedableConfig }
        }
        if (components['minecraft:buoyant']) {
          const buoyantConfig = components['minecraft:buoyant']
          ApplyComponents['minecraft:buoyant'] = { ...buoyantConfig }
        }
        if (components['minecraft:burns_in_daylight']) {
          const burnsInDaylightConfig =
            components['minecraft:burns_in_daylight']
          ApplyComponents['minecraft:burns_in_daylight'] = {
            ...burnsInDaylightConfig,
          }
        }
        if (components['minecraft:cannot_be_attacked']) {
          ApplyComponents['minecraft:cannot_be_attacked'] = {}
        }
        if (components['minecraft:can_climb']) {
          ApplyComponents['minecraft:can_climb'] = {}
        }
        if (components['minecraft:can_fly']) {
          ApplyComponents['minecraft:can_fly'] = {}
        }
        if (components['minecraft:can_join_raid']) {
          ApplyComponents['minecraft:can_join_raid'] = {}
        }
        if (components['minecraft:can_power_jump']) {
          ApplyComponents['minecraft:can_power_jump'] = {}
        }
        if (components['minecraft:celebrate_hunt']) {
          const celebrateHuntConfig = components['minecraft:celebrate_hunt']
          ApplyComponents['minecraft:celebrate_hunt'] = {
            ...celebrateHuntConfig,
          }
        }
        if (components['minecraft:collision_box']) {
          const collisionBoxConfig = components['minecraft:collision_box']
          ApplyComponents['minecraft:collision_box'] = { ...collisionBoxConfig }
        }
        if (components['minecraft:color']) {
          const colorConfig = components['minecraft:color']
          ApplyComponents['minecraft:color'] = { ...colorConfig }
        }
        if (components['minecraft:color2']) {
          const color2Config = components['minecraft:color2']
          ApplyComponents['minecraft:color2'] = { ...color2Config }
        }
        if (components['minecraft:combat_regeneration']) {
          const combatRegenerationConfig =
            components['minecraft:combat_regeneration']
          ApplyComponents['minecraft:combat_regeneration'] = {
            ...combatRegenerationConfig,
          }
        }
        if (components['minecraft:conditional_bandwidth_optimization']) {
          const conditionalBandwidthOptimizationConfig =
            components['minecraft:conditional_bandwidth_optimization']
          ApplyComponents['minecraft:conditional_bandwidth_optimization'] = {
            ...conditionalBandwidthOptimizationConfig,
          }
        }
        if (components['minecraft:custom_hit_test']) {
          const customHitTestConfig = components['minecraft:custom_hit_test']
          ApplyComponents['minecraft:custom_hit_test'] = {
            ...customHitTestConfig,
          }
        }
        if (components['minecraft:damage_over_time']) {
          const damageOverTimeConfig = components['minecraft:damage_over_time']
          ApplyComponents['minecraft:damage_over_time'] = {
            ...damageOverTimeConfig,
          }
        }
        if (components['minecraft:damage_sensor']) {
          const damageSensorConfig = components['minecraft:damage_sensor']
          ApplyComponents['minecraft:damage_sensor'] = { ...damageSensorConfig }
        }
        if (components['minecraft:dash']) {
          const dashConfig = components['minecraft:dash']
          ApplyComponents['minecraft:dash'] = { ...dashConfig }
        }
        if (components['minecraft:dash_action']) {
          const dashActionConfig = components['minecraft:dash_action']
          ApplyComponents['minecraft:dash_action'] = { ...dashActionConfig }
        }
        if (components['minecraft:default_look_angle']) {
          const defaultLookAngleConfig =
            components['minecraft:default_look_angle']
          ApplyComponents['minecraft:default_look_angle'] = {
            ...defaultLookAngleConfig,
          }
        }
        if (components['minecraft:despawn']) {
          const despawnConfig = components['minecraft:despawn']
          ApplyComponents['minecraft:despawn'] = { ...despawnConfig }
        }
        if (components['minecraft:dimension_bound']) {
          ApplyComponents['minecraft:dimension_bound'] = {}
        }
        if (components['minecraft:drying_out_timer']) {
          const dryingOutTimerConfig = components['minecraft:drying_out_timer']
          ApplyComponents['minecraft:drying_out_timer'] = {
            ...dryingOutTimerConfig,
          }
        }
        if (components['minecraft:dweller']) {
          const dwellerConfig = components['minecraft:dweller']
          ApplyComponents['minecraft:dweller'] = { ...dwellerConfig }
        }
        if (components['minecraft:economy_trade_table']) {
          const economyTradeTableConfig =
            components['minecraft:economy_trade_table']
          ApplyComponents['minecraft:economy_trade_table'] = {
            ...economyTradeTableConfig,
          }
        }
        if (components['minecraft:entity_armor_equipment_slot_mapping']) {
          const entityArmorEquipmentSlotMappingConfig =
            components['minecraft:entity_armor_equipment_slot_mapping']
          ApplyComponents['minecraft:entity_armor_equipment_slot_mapping'] = {
            ...entityArmorEquipmentSlotMappingConfig,
          }
        }
        if (components['minecraft:entity_sensor']) {
          const entitySensorConfig = components['minecraft:entity_sensor']
          ApplyComponents['minecraft:entity_sensor'] = { ...entitySensorConfig }
        }
        if (components['minecraft:environment_sensor']) {
          const environmentSensorConfig =
            components['minecraft:environment_sensor']
          ApplyComponents['minecraft:environment_sensor'] = {
            ...environmentSensorConfig,
          }
        }
        if (components['minecraft:equipment']) {
          const equipmentConfig = components['minecraft:equipment']
          ApplyComponents['minecraft:equipment'] = { ...equipmentConfig }
        }
        if (components['minecraft:equippable']) {
          const equippableConfig = components['minecraft:equippable']
          ApplyComponents['minecraft:equippable'] = { ...equippableConfig }
        }
        if (components['minecraft:equip_item']) {
          const equipItemConfig = components['minecraft:equip_item']
          ApplyComponents['minecraft:equip_item'] = { ...equipItemConfig }
        }
        if (components['minecraft:exhaustion_values']) {
          const exhaustionValuesConfig =
            components['minecraft:exhaustion_values']
          ApplyComponents['minecraft:exhaustion_values'] = {
            ...exhaustionValuesConfig,
          }
        }
        if (components['minecraft:experience_reward']) {
          const experienceRewardConfig =
            components['minecraft:experience_reward']
          ApplyComponents['minecraft:experience_reward'] = {
            ...experienceRewardConfig,
          }
        }
        if (components['minecraft:explode']) {
          const explodeConfig = components['minecraft:explode']
          ApplyComponents['minecraft:explode'] = { ...explodeConfig }
        }
        if (components['minecraft:fire_immune']) {
          ApplyComponents['minecraft:fire_immune'] = {}
        }
        if (components['minecraft:floats_in_liquid']) {
          ApplyComponents['minecraft:floats_in_liquid'] = {}
        }
        if (components['minecraft:flocking']) {
          const flockingConfig = components['minecraft:flocking']
          ApplyComponents['minecraft:flocking'] = { ...flockingConfig }
        }
        if (components['minecraft:flying_speed']) {
          const flyingSpeedConfig = components['minecraft:flying_speed']
          ApplyComponents['minecraft:flying_speed'] = { ...flyingSpeedConfig }
        }
        if (components['minecraft:follow_range']) {
          const followRangeConfig = components['minecraft:follow_range']
          ApplyComponents['minecraft:follow_range'] = { ...followRangeConfig }
        }
        if (components['minecraft:free_camera_controlled']) {
          const freeCameraConfig =
            components['minecraft:free_camera_controlled']
          ApplyComponents['minecraft:free_camera_controlled'] = {
            ...freeCameraConfig,
          }
        }
        if (components['minecraft:friction_modifier']) {
          const frictionConfig = components['minecraft:friction_modifier']
          ApplyComponents['minecraft:friction_modifier'] = { ...frictionConfig }
        }
        if (components['minecraft:game_event_movement_tracking']) {
          const gameEventConfig =
            components['minecraft:game_event_movement_tracking']
          ApplyComponents['minecraft:game_event_movement_tracking'] = {
            ...gameEventConfig,
          }
        }
        if (components['minecraft:genetics']) {
          const geneticsConfig = components['minecraft:genetics']
          ApplyComponents['minecraft:genetics'] = { ...geneticsConfig }
        }
        if (components['minecraft:giveable']) {
          const giveableConfig = components['minecraft:giveable']
          ApplyComponents['minecraft:giveable'] = { ...giveableConfig }
        }
        if (components['minecraft:ground_offset']) {
          const groundOffsetConfig = components['minecraft:ground_offset']
          ApplyComponents['minecraft:ground_offset'] = { ...groundOffsetConfig }
        }
        if (components['minecraft:group_size']) {
          const groupSizeConfig = components['minecraft:group_size']
          ApplyComponents['minecraft:group_size'] = { ...groupSizeConfig }
        }
        if (components['minecraft:grows_crop']) {
          const growsCropConfig = components['minecraft:grows_crop']
          ApplyComponents['minecraft:grows_crop'] = { ...growsCropConfig }
        }
        if (components['minecraft:health']) {
          const healthConfig = components['minecraft:health']
          ApplyComponents['minecraft:health'] = { ...healthConfig }
        }
        if (components['minecraft:heartbeat']) {
          const heartbeatConfig = components['minecraft:heartbeat']
          ApplyComponents['minecraft:heartbeat'] = { ...heartbeatConfig }
        }
        if (components['minecraft:hide']) {
          ApplyComponents['minecraft:hide'] = {}
        }
        if (components['minecraft:home']) {
          const homeConfig = components['minecraft:home']
          ApplyComponents['minecraft:home'] = { ...homeConfig }
        }
        if (components['minecraft:horse.jump_strength']) {
          const jumpConfig = components['minecraft:horse.jump_strength']
          ApplyComponents['minecraft:horse.jump_strength'] = { ...jumpConfig }
        }
        const hurtConfig = components['minecraft:hurt_on_condition']
        if (hurtConfig !== void 0) {
          ApplyComponents['minecraft:hurt_on_condition'] = { ...hurtConfig }
        }
        const ignoreAttackConfig =
          components['minecraft:ignore_cannot_be_attacked']
        if (ignoreAttackConfig !== void 0) {
          ApplyComponents['minecraft:ignore_cannot_be_attacked'] = {
            ...ignoreAttackConfig,
          }
        }
        const airControlConfig = components['minecraft:input_air_controlled']
        if (airControlConfig !== void 0) {
          ApplyComponents['minecraft:input_air_controlled'] = {
            ...airControlConfig,
          }
        }
        const groundControlConfig =
          components['minecraft:input_ground_controlled']
        if (groundControlConfig !== void 0) {
          ApplyComponents['minecraft:input_ground_controlled'] = {
            ...groundControlConfig,
          }
        }
        const blockNotifierConfig =
          components['minecraft:inside_block_notifier']
        if (blockNotifierConfig !== void 0) {
          ApplyComponents['minecraft:inside_block_notifier'] = {
            ...blockNotifierConfig,
          }
        }
        const insomniaConfig = components['minecraft:insomnia']
        if (insomniaConfig !== void 0) {
          ApplyComponents['minecraft:insomnia'] = { ...insomniaConfig }
        }
        const instantDespawnConfig = components['minecraft:instant_despawn']
        if (instantDespawnConfig !== void 0) {
          ApplyComponents['minecraft:instant_despawn'] = {
            ...instantDespawnConfig,
          }
        }
        const interactConfig = components['minecraft:interact']
        if (interactConfig !== void 0) {
          ApplyComponents['minecraft:interact'] = { ...interactConfig }
        }
        const inventoryConfig = components['minecraft:inventory']
        if (inventoryConfig !== void 0) {
          ApplyComponents['minecraft:inventory'] = { ...inventoryConfig }
        }
        const isBabyConfig = components['minecraft:is_baby']
        if (isBabyConfig !== void 0) {
          ApplyComponents['minecraft:is_baby'] = { ...isBabyConfig }
        }
        const isChargedConfig = components['minecraft:is_charged']
        if (isChargedConfig !== void 0) {
          ApplyComponents['minecraft:is_charged'] = { ...isChargedConfig }
        }
        const isChestedConfig = components['minecraft:is_chested']
        if (isChestedConfig !== void 0) {
          ApplyComponents['minecraft:is_chested'] = { ...isChestedConfig }
        }
        const isDyeableConfig = components['minecraft:is_dyeable']
        if (isDyeableConfig !== void 0) {
          ApplyComponents['minecraft:is_dyeable'] = { ...isDyeableConfig }
        }
        const isIgnitedConfig = components['minecraft:is_ignited']
        if (isIgnitedConfig !== void 0) {
          ApplyComponents['minecraft:is_ignited'] = { ...isIgnitedConfig }
        }
        const isPregnantConfig = components['minecraft:is_pregnant']
        if (isPregnantConfig !== void 0) {
          ApplyComponents['minecraft:is_pregnant'] = { ...isPregnantConfig }
        }
        const itemControllableConfig = components['minecraft:item_controllable']
        if (itemControllableConfig !== void 0) {
          ApplyComponents['minecraft:item_controllable'] = {
            ...itemControllableConfig,
          }
        }
        const leashableConfig = components['minecraft:leashable']
        if (leashableConfig !== void 0) {
          ApplyComponents['minecraft:leashable'] = { ...leashableConfig }
        }
        const leashableToConfig = components['minecraft:leashable_to']
        if (leashableToConfig !== void 0) {
          ApplyComponents['minecraft:leashable_to'] = { ...leashableToConfig }
        }
        const lookedAtConfig = components['minecraft:looked_at']
        if (lookedAtConfig !== void 0) {
          ApplyComponents['minecraft:looked_at'] = { ...lookedAtConfig }
        }
        const lootConfig = components['minecraft:loot']
        if (lootConfig !== void 0) {
          ApplyComponents['minecraft:loot'] = { ...lootConfig }
        }
        const itemHopperConfig = components['minecraft:item_hopper']
        if (itemHopperConfig !== void 0) {
          ApplyComponents['minecraft:item_hopper'] = {}
        }
        const managedTraderConfig =
          components['minecraft:managed_wandering_trader']
        if (managedTraderConfig !== void 0) {
          ApplyComponents['minecraft:managed_wandering_trader'] = {}
        }
        const markVariantConfig = components['minecraft:mark_variant']
        if (
          markVariantConfig !== void 0 &&
          markVariantConfig.value !== void 0
        ) {
          ApplyComponents['minecraft:mark_variant'] = {
            value: markVariantConfig.value,
          }
        }
        const mobEffectConfig = components['minecraft:mob_effect']
        if (
          mobEffectConfig !== void 0 &&
          mobEffectConfig.mob_effect !== void 0
        ) {
          const effectConfig: any = { mob_effect: mobEffectConfig.mob_effect }
          if (mobEffectConfig.ambient !== void 0)
            effectConfig.ambient = mobEffectConfig.ambient
          if (mobEffectConfig.cooldown_time !== void 0)
            effectConfig.cooldown_time = mobEffectConfig.cooldown_time
          if (mobEffectConfig.effect_range !== void 0)
            effectConfig.effect_range = mobEffectConfig.effect_range
          if (mobEffectConfig.effect_time !== void 0)
            effectConfig.effect_time = mobEffectConfig.effect_time
          if (mobEffectConfig.entity_filter !== void 0)
            effectConfig.entity_filter = mobEffectConfig.entity_filter
          ApplyComponents['minecraft:mob_effect'] = effectConfig
        }
        const mobImmunityConfig = components['minecraft:mob_effect_immunity']
        if (
          mobImmunityConfig !== void 0 &&
          mobImmunityConfig.mob_effects !== void 0
        ) {
          ApplyComponents['minecraft:mob_effect_immunity'] = {
            mob_effects: mobImmunityConfig.mob_effects,
          }
        }
        const movementConfig = components['minecraft:movement']
        if (movementConfig !== void 0) {
          const moveConfig: any = {}
          if (movementConfig.max !== void 0) moveConfig.max = movementConfig.max
          if (movementConfig.value !== void 0)
            moveConfig.value = movementConfig.value
          ApplyComponents['minecraft:movement'] = moveConfig
        }
        const amphibiousConfig = components['minecraft:movement.amphibious']
        if (amphibiousConfig !== void 0) {
          const amphibConfig: any = {}
          if (amphibiousConfig.max_turn !== void 0)
            amphibConfig.max_turn = amphibiousConfig.max_turn
          ApplyComponents['minecraft:movement.amphibious'] = amphibConfig
        }
        const basicMovementConfig = components['minecraft:movement.basic']
        if (basicMovementConfig !== void 0) {
          const basicConfig: any = {}
          if (basicMovementConfig.max_turn !== void 0)
            basicConfig.max_turn = basicMovementConfig.max_turn
          ApplyComponents['minecraft:movement.basic'] = basicConfig
        }
        const dolphinConfig = components['minecraft:movement.dolphin']
        if (dolphinConfig !== void 0) {
          ApplyComponents['minecraft:movement.dolphin'] = {}
        }
        const flyConfig = components['minecraft:movement.fly']
        if (flyConfig !== void 0) {
          const flyMovementConfig: any = {}
          if (flyConfig.max_turn !== void 0)
            flyMovementConfig.max_turn = flyConfig.max_turn
          if (flyConfig.speed_when_turning !== void 0)
            flyMovementConfig.speed_when_turning = flyConfig.speed_when_turning
          if (flyConfig.start_speed !== void 0)
            flyMovementConfig.start_speed = flyConfig.start_speed
          ApplyComponents['minecraft:movement.fly'] = flyMovementConfig
        }
        const genericConfig = components['minecraft:movement.generic']
        if (genericConfig !== void 0) {
          const genericMovementConfig: any = {}
          if (genericConfig.max_turn !== void 0)
            genericMovementConfig.max_turn = genericConfig.max_turn
          ApplyComponents['minecraft:movement.generic'] = genericMovementConfig
        }
        const glideConfig = components['minecraft:movement.glide']
        if (glideConfig !== void 0) {
          const glideMovementConfig: any = {}
          if (glideConfig.max_turn !== void 0)
            glideMovementConfig.max_turn = glideConfig.max_turn
          if (glideConfig.speed_when_turning !== void 0)
            glideMovementConfig.speed_when_turning =
              glideConfig.speed_when_turning
          ApplyComponents['minecraft:movement.glide'] = glideMovementConfig
        }
        const hoverConfig = components['minecraft:movement.hover']
        if (hoverConfig !== void 0) {
          const hoverMovementConfig: any = {}
          if (hoverConfig.max_turn !== void 0)
            hoverMovementConfig.max_turn = hoverConfig.max_turn
          ApplyComponents['minecraft:movement.hover'] = hoverMovementConfig
        }
        const jumpConfig = components['minecraft:movement.jump']
        if (jumpConfig !== void 0) {
          const jumpMovementConfig: any = {}
          if (jumpConfig.jump_delay !== void 0) {
            // 支持三种格式的jump_delay参数
            if (typeof jumpConfig.jump_delay === 'number') {
              jumpMovementConfig.jump_delay = jumpConfig.jump_delay
            } else if (
              Array.isArray(jumpConfig.jump_delay) &&
              jumpConfig.jump_delay.length === 2
            ) {
              jumpMovementConfig.jump_delay = [...jumpConfig.jump_delay]
            } else if (
              typeof jumpConfig.jump_delay === 'object' &&
              jumpConfig.jump_delay !== null &&
              'range_min' in jumpConfig.jump_delay
            ) {
              const delayObj = jumpConfig.jump_delay as {
                range_min?: number
                range_max?: number
              }
              jumpMovementConfig.jump_delay = {
                range_min: delayObj.range_min,
                range_max: delayObj.range_max,
              }
              // 删除void 0属性
              if (jumpMovementConfig.jump_delay.range_min === void 0)
                delete jumpMovementConfig.jump_delay.range_min
              if (jumpMovementConfig.jump_delay.range_max === void 0)
                delete jumpMovementConfig.jump_delay.range_max
              if (Object.keys(jumpMovementConfig.jump_delay).length === 0)
                delete jumpMovementConfig.jump_delay
            }
          }
          if (jumpConfig.max_turn !== void 0)
            jumpMovementConfig.max_turn = jumpConfig.max_turn
          ApplyComponents['minecraft:movement.jump'] = jumpMovementConfig
        }
        const skipConfig = components['minecraft:movement.skip']
        if (skipConfig !== void 0) {
          const skipMovementConfig: any = {}
          if (skipConfig.max_turn !== void 0)
            skipMovementConfig.max_turn = skipConfig.max_turn
          ApplyComponents['minecraft:movement.skip'] = skipMovementConfig
        }
        const soundDistanceOffsetConfig =
          components['minecraft:movement.sound_distance_offset']
        if (soundDistanceOffsetConfig !== void 0) {
          const soundDistanceOffsetMovementConfig: any = {}
          if (soundDistanceOffsetConfig.value !== void 0)
            soundDistanceOffsetMovementConfig.value =
              soundDistanceOffsetConfig.value
          ApplyComponents['minecraft:movement.sound_distance_offset'] =
            soundDistanceOffsetMovementConfig
        }
        const swayConfig = components['minecraft:movement.sway']
        if (swayConfig !== void 0) {
          const swayMovementConfig: any = {}
          if (swayConfig.sway_amplitude !== void 0)
            swayMovementConfig.sway_amplitude = swayConfig.sway_amplitude
          if (swayConfig.sway_frequency !== void 0)
            swayMovementConfig.sway_frequency = swayConfig.sway_frequency
          ApplyComponents['minecraft:movement.sway'] = swayMovementConfig
        }
        const nameableConfig = components['minecraft:nameable']
        if (nameableConfig !== void 0) {
          const nameableConfigObj: any = {}
          if (
            Array.isArray(nameableConfig.name_actions) &&
            nameableConfig.name_actions.length > 0
          ) {
            nameableConfigObj.name_actions = nameableConfig.name_actions.map(
              action => {
                const actionObj: any = {}
                if (
                  Array.isArray(action.name_filter) &&
                  action.name_filter.length > 0
                ) {
                  actionObj.name_filter = [...action.name_filter]
                }
                if (action.on_named !== void 0) {
                  if (typeof action.on_named === 'string') {
                    actionObj.on_named = action.on_named
                  } else if (
                    typeof action.on_named === 'object' &&
                    action.on_named !== null
                  ) {
                    actionObj.on_named = {
                      event: action.on_named.event,
                    }
                    if (action.on_named.target !== void 0)
                      actionObj.on_named.target = action.on_named.target
                  }
                }
                return actionObj
              },
            )
          }
          ApplyComponents['minecraft:nameable'] = nameableConfigObj
        }
        const navigationClimbConfig = components['minecraft:navigation.climb']
        if (navigationClimbConfig !== void 0) {
          const navigationClimbConfigObj: any = {}
          if (navigationClimbConfig.avoid_damage_blocks !== void 0) {
            navigationClimbConfigObj.avoid_damage_blocks =
              navigationClimbConfig.avoid_damage_blocks
          }
          if (navigationClimbConfig.avoid_portals !== void 0) {
            navigationClimbConfigObj.avoid_portals =
              navigationClimbConfig.avoid_portals
          }
          if (navigationClimbConfig.avoid_sun !== void 0) {
            navigationClimbConfigObj.avoid_sun = navigationClimbConfig.avoid_sun
          }
          if (navigationClimbConfig.avoid_water !== void 0) {
            navigationClimbConfigObj.avoid_water =
              navigationClimbConfig.avoid_water
          }
          if (navigationClimbConfig.blocks_to_avoid !== void 0) {
            navigationClimbConfigObj.blocks_to_avoid = [
              ...navigationClimbConfig.blocks_to_avoid,
            ]
          }
          if (navigationClimbConfig.can_breach !== void 0) {
            navigationClimbConfigObj.can_breach =
              navigationClimbConfig.can_breach
          }
          if (navigationClimbConfig.can_break_doors !== void 0) {
            navigationClimbConfigObj.can_break_doors =
              navigationClimbConfig.can_break_doors
          }
          if (navigationClimbConfig.can_jump !== void 0) {
            navigationClimbConfigObj.can_jump = navigationClimbConfig.can_jump
          }
          if (navigationClimbConfig.can_open_doors !== void 0) {
            navigationClimbConfigObj.can_open_doors =
              navigationClimbConfig.can_open_doors
          }
          if (navigationClimbConfig.can_open_iron_doors !== void 0) {
            navigationClimbConfigObj.can_open_iron_doors =
              navigationClimbConfig.can_open_iron_doors
          }
          if (navigationClimbConfig.can_pass_doors !== void 0) {
            navigationClimbConfigObj.can_pass_doors =
              navigationClimbConfig.can_pass_doors
          }
          if (navigationClimbConfig.can_path_from_air !== void 0) {
            navigationClimbConfigObj.can_path_from_air =
              navigationClimbConfig.can_path_from_air
          }
          if (navigationClimbConfig.can_path_over_lava !== void 0) {
            navigationClimbConfigObj.can_path_over_lava =
              navigationClimbConfig.can_path_over_lava
          }
          if (navigationClimbConfig.can_path_over_water !== void 0) {
            navigationClimbConfigObj.can_path_over_water =
              navigationClimbConfig.can_path_over_water
          }
          if (navigationClimbConfig.can_sink !== void 0) {
            navigationClimbConfigObj.can_sink = navigationClimbConfig.can_sink
          }
          if (navigationClimbConfig.can_swim !== void 0) {
            navigationClimbConfigObj.can_swim = navigationClimbConfig.can_swim
          }
          if (navigationClimbConfig.can_walk !== void 0) {
            navigationClimbConfigObj.can_walk = navigationClimbConfig.can_walk
          }
          if (navigationClimbConfig.can_walk_in_lava !== void 0) {
            navigationClimbConfigObj.can_walk_in_lava =
              navigationClimbConfig.can_walk_in_lava
          }
          ApplyComponents['minecraft:navigation.climb'] =
            navigationClimbConfigObj
        }
        const navigationFloatConfig = components['minecraft:navigation.float']
        if (navigationFloatConfig !== void 0) {
          const navigationFloatConfigObj: any = {}
          if (navigationFloatConfig.avoid_damage_blocks !== void 0) {
            navigationFloatConfigObj.avoid_damage_blocks =
              navigationFloatConfig.avoid_damage_blocks
          }
          if (navigationFloatConfig.avoid_portals !== void 0) {
            navigationFloatConfigObj.avoid_portals =
              navigationFloatConfig.avoid_portals
          }
          if (navigationFloatConfig.avoid_sun !== void 0) {
            navigationFloatConfigObj.avoid_sun = navigationFloatConfig.avoid_sun
          }
          if (navigationFloatConfig.avoid_water !== void 0) {
            navigationFloatConfigObj.avoid_water =
              navigationFloatConfig.avoid_water
          }
          if (navigationFloatConfig.blocks_to_avoid !== void 0) {
            navigationFloatConfigObj.blocks_to_avoid = [
              ...navigationFloatConfig.blocks_to_avoid,
            ]
          }
          if (navigationFloatConfig.can_breach !== void 0) {
            navigationFloatConfigObj.can_breach =
              navigationFloatConfig.can_breach
          }
          if (navigationFloatConfig.can_break_doors !== void 0) {
            navigationFloatConfigObj.can_break_doors =
              navigationFloatConfig.can_break_doors
          }
          if (navigationFloatConfig.can_jump !== void 0) {
            navigationFloatConfigObj.can_jump = navigationFloatConfig.can_jump
          }
          if (navigationFloatConfig.can_open_doors !== void 0) {
            navigationFloatConfigObj.can_open_doors =
              navigationFloatConfig.can_open_doors
          }
          if (navigationFloatConfig.can_open_iron_doors !== void 0) {
            navigationFloatConfigObj.can_open_iron_doors =
              navigationFloatConfig.can_open_iron_doors
          }
          if (navigationFloatConfig.can_pass_doors !== void 0) {
            navigationFloatConfigObj.can_pass_doors =
              navigationFloatConfig.can_pass_doors
          }
          if (navigationFloatConfig.can_path_from_air !== void 0) {
            navigationFloatConfigObj.can_path_from_air =
              navigationFloatConfig.can_path_from_air
          }
          if (navigationFloatConfig.can_path_over_water !== void 0) {
            navigationFloatConfigObj.can_path_over_water =
              navigationFloatConfig.can_path_over_water
          }
          if (navigationFloatConfig.can_sink !== void 0) {
            navigationFloatConfigObj.can_sink = navigationFloatConfig.can_sink
          }
          if (navigationFloatConfig.can_swim !== void 0) {
            navigationFloatConfigObj.can_swim = navigationFloatConfig.can_swim
          }
          if (navigationFloatConfig.can_walk !== void 0) {
            navigationFloatConfigObj.can_walk = navigationFloatConfig.can_walk
          }
          if (navigationFloatConfig.can_walk_in_lava !== void 0) {
            navigationFloatConfigObj.can_walk_in_lava =
              navigationFloatConfig.can_walk_in_lava
          }
          if (navigationFloatConfig.is_amphibious !== void 0) {
            navigationFloatConfigObj.is_amphibious =
              navigationFloatConfig.is_amphibious
          }
          if (navigationFloatConfig.using_door_annotation !== void 0) {
            navigationFloatConfigObj.using_door_annotation =
              navigationFloatConfig.using_door_annotation
          }
          ApplyComponents['minecraft:navigation.float'] =
            navigationFloatConfigObj
        }
        const navigationFlyConfig = components['minecraft:navigation.fly']
        if (navigationFlyConfig !== void 0) {
          const navigationFlyConfigObj: any = {}
          if (navigationFlyConfig.avoid_damage_blocks !== void 0) {
            navigationFlyConfigObj.avoid_damage_blocks =
              navigationFlyConfig.avoid_damage_blocks
          }
          if (navigationFlyConfig.avoid_portals !== void 0) {
            navigationFlyConfigObj.avoid_portals =
              navigationFlyConfig.avoid_portals
          }
          if (navigationFlyConfig.avoid_sun !== void 0) {
            navigationFlyConfigObj.avoid_sun = navigationFlyConfig.avoid_sun
          }
          if (navigationFlyConfig.avoid_water !== void 0) {
            navigationFlyConfigObj.avoid_water = navigationFlyConfig.avoid_water
          }
          if (navigationFlyConfig.blocks_to_avoid !== void 0) {
            navigationFlyConfigObj.blocks_to_avoid = [
              ...navigationFlyConfig.blocks_to_avoid,
            ]
          }
          if (navigationFlyConfig.can_breach !== void 0) {
            navigationFlyConfigObj.can_breach = navigationFlyConfig.can_breach
          }
          if (navigationFlyConfig.can_break_doors !== void 0) {
            navigationFlyConfigObj.can_break_doors =
              navigationFlyConfig.can_break_doors
          }
          if (navigationFlyConfig.can_jump !== void 0) {
            navigationFlyConfigObj.can_jump = navigationFlyConfig.can_jump
          }
          if (navigationFlyConfig.can_open_doors !== void 0) {
            navigationFlyConfigObj.can_open_doors =
              navigationFlyConfig.can_open_doors
          }
          if (navigationFlyConfig.can_open_iron_doors !== void 0) {
            navigationFlyConfigObj.can_open_iron_doors =
              navigationFlyConfig.can_open_iron_doors
          }
          if (navigationFlyConfig.can_pass_doors !== void 0) {
            navigationFlyConfigObj.can_pass_doors =
              navigationFlyConfig.can_pass_doors
          }
          if (navigationFlyConfig.can_path_from_air !== void 0) {
            navigationFlyConfigObj.can_path_from_air =
              navigationFlyConfig.can_path_from_air
          }
          if (navigationFlyConfig.can_path_over_water !== void 0) {
            navigationFlyConfigObj.can_path_over_water =
              navigationFlyConfig.can_path_over_water
          }
          if (navigationFlyConfig.can_sink !== void 0) {
            navigationFlyConfigObj.can_sink = navigationFlyConfig.can_sink
          }
          if (navigationFlyConfig.can_swim !== void 0) {
            navigationFlyConfigObj.can_swim = navigationFlyConfig.can_swim
          }
          if (navigationFlyConfig.can_walk !== void 0) {
            navigationFlyConfigObj.can_walk = navigationFlyConfig.can_walk
          }
          if (navigationFlyConfig.can_walk_in_lava !== void 0) {
            navigationFlyConfigObj.can_walk_in_lava =
              navigationFlyConfig.can_walk_in_lava
          }
          if (navigationFlyConfig.is_amphibious !== void 0) {
            navigationFlyConfigObj.is_amphibious =
              navigationFlyConfig.is_amphibious
          }
          if (navigationFlyConfig.using_door_annotation !== void 0) {
            navigationFlyConfigObj.using_door_annotation =
              navigationFlyConfig.using_door_annotation
          }
          ApplyComponents['minecraft:navigation.fly'] = navigationFlyConfigObj
        }
        const navigationGenericConfig =
          components['minecraft:navigation.generic']
        if (navigationGenericConfig !== void 0) {
          const navigationGenericConfigObj: any = {}
          if (navigationGenericConfig.avoid_damage_blocks !== void 0) {
            navigationGenericConfigObj.avoid_damage_blocks =
              navigationGenericConfig.avoid_damage_blocks
          }
          if (navigationGenericConfig.avoid_portals !== void 0) {
            navigationGenericConfigObj.avoid_portals =
              navigationGenericConfig.avoid_portals
          }
          if (navigationGenericConfig.avoid_sun !== void 0) {
            navigationGenericConfigObj.avoid_sun =
              navigationGenericConfig.avoid_sun
          }
          if (navigationGenericConfig.avoid_water !== void 0) {
            navigationGenericConfigObj.avoid_water =
              navigationGenericConfig.avoid_water
          }
          if (navigationGenericConfig.blocks_to_avoid !== void 0) {
            navigationGenericConfigObj.blocks_to_avoid = [
              ...navigationGenericConfig.blocks_to_avoid,
            ]
          }
          if (navigationGenericConfig.can_breach !== void 0) {
            navigationGenericConfigObj.can_breach =
              navigationGenericConfig.can_breach
          }
          if (navigationGenericConfig.can_break_doors !== void 0) {
            navigationGenericConfigObj.can_break_doors =
              navigationGenericConfig.can_break_doors
          }
          if (navigationGenericConfig.can_jump !== void 0) {
            navigationGenericConfigObj.can_jump =
              navigationGenericConfig.can_jump
          }
          if (navigationGenericConfig.can_open_doors !== void 0) {
            navigationGenericConfigObj.can_open_doors =
              navigationGenericConfig.can_open_doors
          }
          if (navigationGenericConfig.can_open_iron_doors !== void 0) {
            navigationGenericConfigObj.can_open_iron_doors =
              navigationGenericConfig.can_open_iron_doors
          }
          if (navigationGenericConfig.can_pass_doors !== void 0) {
            navigationGenericConfigObj.can_pass_doors =
              navigationGenericConfig.can_pass_doors
          }
          if (navigationGenericConfig.can_path_from_air !== void 0) {
            navigationGenericConfigObj.can_path_from_air =
              navigationGenericConfig.can_path_from_air
          }
          if (navigationGenericConfig.can_path_over_water !== void 0) {
            navigationGenericConfigObj.can_path_over_water =
              navigationGenericConfig.can_path_over_water
          }
          if (navigationGenericConfig.can_sink !== void 0) {
            navigationGenericConfigObj.can_sink =
              navigationGenericConfig.can_sink
          }
          if (navigationGenericConfig.can_swim !== void 0) {
            navigationGenericConfigObj.can_swim =
              navigationGenericConfig.can_swim
          }
          if (navigationGenericConfig.can_walk !== void 0) {
            navigationGenericConfigObj.can_walk =
              navigationGenericConfig.can_walk
          }
          if (navigationGenericConfig.can_walk_in_lava !== void 0) {
            navigationGenericConfigObj.can_walk_in_lava =
              navigationGenericConfig.can_walk_in_lava
          }
          if (navigationGenericConfig.is_amphibious !== void 0) {
            navigationGenericConfigObj.is_amphibious =
              navigationGenericConfig.is_amphibious
          }
          if (navigationGenericConfig.using_door_annotation !== void 0) {
            navigationGenericConfigObj.using_door_annotation =
              navigationGenericConfig.using_door_annotation
          }
          ApplyComponents['minecraft:navigation.generic'] =
            navigationGenericConfigObj
        }
        const navigationHoverConfig = components['minecraft:navigation.hover']
        if (navigationHoverConfig !== void 0) {
          const navigationHoverConfigObj: any = {}
          // Using type assertion to bypass TypeScript errors temporarily
          const hoverConfig = navigationHoverConfig
          if (hoverConfig.avoid_damage_blocks !== void 0) {
            navigationHoverConfigObj.avoid_damage_blocks =
              hoverConfig.avoid_damage_blocks
          }
          if (navigationHoverConfig.avoid_portals !== void 0) {
            navigationHoverConfigObj.avoid_portals =
              navigationHoverConfig.avoid_portals
          }
          if (navigationHoverConfig.avoid_sun !== void 0) {
            navigationHoverConfigObj.avoid_sun = navigationHoverConfig.avoid_sun
          }
          if (navigationHoverConfig.avoid_water !== void 0) {
            navigationHoverConfigObj.avoid_water =
              navigationHoverConfig.avoid_water
          }
          if (navigationHoverConfig.blocks_to_avoid !== void 0) {
            navigationHoverConfigObj.blocks_to_avoid = [
              ...navigationHoverConfig.blocks_to_avoid,
            ]
          }
          if (navigationHoverConfig.can_breach !== void 0) {
            navigationHoverConfigObj.can_breach =
              navigationHoverConfig.can_breach
          }
          if (navigationHoverConfig.can_break_doors !== void 0) {
            navigationHoverConfigObj.can_break_doors =
              navigationHoverConfig.can_break_doors
          }
          if (navigationHoverConfig.can_jump !== void 0) {
            navigationHoverConfigObj.can_jump = navigationHoverConfig.can_jump
          }
          if (navigationHoverConfig.can_open_doors !== void 0) {
            navigationHoverConfigObj.can_open_doors =
              navigationHoverConfig.can_open_doors
          }
          if (navigationHoverConfig.can_open_iron_doors !== void 0) {
            navigationHoverConfigObj.can_open_iron_doors =
              navigationHoverConfig.can_open_iron_doors
          }
          if (navigationHoverConfig.can_pass_doors !== void 0) {
            navigationHoverConfigObj.can_pass_doors =
              navigationHoverConfig.can_pass_doors
          }
          if (navigationHoverConfig.can_path_from_air !== void 0) {
            navigationHoverConfigObj.can_path_from_air =
              navigationHoverConfig.can_path_from_air
          }
          if (navigationHoverConfig.can_path_over_water !== void 0) {
            navigationHoverConfigObj.can_path_over_water =
              navigationHoverConfig.can_path_over_water
          }
          if (navigationHoverConfig.can_sink !== void 0) {
            navigationHoverConfigObj.can_sink = navigationHoverConfig.can_sink
          }
          if (navigationHoverConfig.can_swim !== void 0) {
            navigationHoverConfigObj.can_swim = navigationHoverConfig.can_swim
          }
          if (navigationHoverConfig.can_walk !== void 0) {
            navigationHoverConfigObj.can_walk = navigationHoverConfig.can_walk
          }
          if (navigationHoverConfig.can_walk_in_lava !== void 0) {
            navigationHoverConfigObj.can_walk_in_lava =
              navigationHoverConfig.can_walk_in_lava
          }
          if (navigationHoverConfig.is_amphibious !== void 0) {
            navigationHoverConfigObj.is_amphibious =
              navigationHoverConfig.is_amphibious
          }
          if (navigationHoverConfig.using_door_annotation !== void 0) {
            navigationHoverConfigObj.using_door_annotation =
              navigationHoverConfig.using_door_annotation
          }
          ApplyComponents['minecraft:navigation.hover'] =
            navigationHoverConfigObj
        }
        const navigationSwimConfig = components['minecraft:navigation.swim']
        if (navigationSwimConfig !== void 0) {
          const navigationSwimConfigObj: any = {}
          if (navigationSwimConfig.avoid_damage_blocks !== void 0) {
            navigationSwimConfigObj.avoid_damage_blocks =
              navigationSwimConfig.avoid_damage_blocks
          }
          if (navigationSwimConfig.avoid_portals !== void 0) {
            navigationSwimConfigObj.avoid_portals =
              navigationSwimConfig.avoid_portals
          }
          if (navigationSwimConfig.avoid_sun !== void 0) {
            navigationSwimConfigObj.avoid_sun = navigationSwimConfig.avoid_sun
          }
          if (navigationSwimConfig.avoid_water !== void 0) {
            navigationSwimConfigObj.avoid_water =
              navigationSwimConfig.avoid_water
          }
          if (navigationSwimConfig.can_breach !== void 0) {
            navigationSwimConfigObj.can_breach = navigationSwimConfig.can_breach
          }
          if (navigationSwimConfig.can_break_doors !== void 0) {
            navigationSwimConfigObj.can_break_doors =
              navigationSwimConfig.can_break_doors
          }
          if (navigationSwimConfig.can_jump !== void 0) {
            navigationSwimConfigObj.can_jump = navigationSwimConfig.can_jump
          }
          if (navigationSwimConfig.can_open_doors !== void 0) {
            navigationSwimConfigObj.can_open_doors =
              navigationSwimConfig.can_open_doors
          }
          if (navigationSwimConfig.can_open_iron_doors !== void 0) {
            navigationSwimConfigObj.can_open_iron_doors =
              navigationSwimConfig.can_open_iron_doors
          }
          if (navigationSwimConfig.can_pass_doors !== void 0) {
            navigationSwimConfigObj.can_pass_doors =
              navigationSwimConfig.can_pass_doors
          }
          if (navigationSwimConfig.can_path_from_air !== void 0) {
            navigationSwimConfigObj.can_path_from_air =
              navigationSwimConfig.can_path_from_air
          }
          if (navigationSwimConfig.can_path_over_water !== void 0) {
            navigationSwimConfigObj.can_path_over_water =
              navigationSwimConfig.can_path_over_water
          }
          if (navigationSwimConfig.can_sink !== void 0) {
            navigationSwimConfigObj.can_sink = navigationSwimConfig.can_sink
          }
          if (navigationSwimConfig.can_swim !== void 0) {
            navigationSwimConfigObj.can_swim = navigationSwimConfig.can_swim
          }
          if (navigationSwimConfig.can_walk !== void 0) {
            navigationSwimConfigObj.can_walk = navigationSwimConfig.can_walk
          }
          if (navigationSwimConfig.can_walk_in_lava !== void 0) {
            navigationSwimConfigObj.can_walk_in_lava =
              navigationSwimConfig.can_walk_in_lava
          }
          if (navigationSwimConfig.is_amphibious !== void 0) {
            navigationSwimConfigObj.is_amphibious =
              navigationSwimConfig.is_amphibious
          }
          if (navigationSwimConfig.using_door_annotation !== void 0) {
            navigationSwimConfigObj.using_door_annotation =
              navigationSwimConfig.using_door_annotation
          }
          ApplyComponents['minecraft:navigation.swim'] = navigationSwimConfigObj
        }
        const navigationWalkConfig = components['minecraft:navigation.walk']
        if (navigationWalkConfig !== void 0) {
          const navigationWalkConfigObj: any = {}
          if (navigationWalkConfig.avoid_damage_blocks !== void 0) {
            navigationWalkConfigObj.avoid_damage_blocks =
              navigationWalkConfig.avoid_damage_blocks
          }
          if (navigationWalkConfig.avoid_portals !== void 0) {
            navigationWalkConfigObj.avoid_portals =
              navigationWalkConfig.avoid_portals
          }
          if (navigationWalkConfig.avoid_sun !== void 0) {
            navigationWalkConfigObj.avoid_sun = navigationWalkConfig.avoid_sun
          }
          if (navigationWalkConfig.avoid_water !== void 0) {
            navigationWalkConfigObj.avoid_water =
              navigationWalkConfig.avoid_water
          }
          if (navigationWalkConfig.blocks_to_avoid !== void 0) {
            navigationWalkConfigObj.blocks_to_avoid = [
              ...navigationWalkConfig.blocks_to_avoid,
            ].map(item => {
              if (typeof item === 'object' && item !== null) {
                // 处理包含name和tags的复杂对象
                const blockObj: any = {}
                if (item.name !== void 0) {
                  blockObj.name = item.name
                }
                if (item.tags !== void 0) {
                  blockObj.tags = item.tags
                }
                return blockObj
              }
              return item // 简单字符串
            })
          }
          if (navigationWalkConfig.can_breach !== void 0) {
            navigationWalkConfigObj.can_breach = navigationWalkConfig.can_breach
          }
          if (navigationWalkConfig.can_break_doors !== void 0) {
            navigationWalkConfigObj.can_break_doors =
              navigationWalkConfig.can_break_doors
          }
          if (navigationWalkConfig.can_jump !== void 0) {
            navigationWalkConfigObj.can_jump = navigationWalkConfig.can_jump
          }
          if (navigationWalkConfig.can_open_doors !== void 0) {
            navigationWalkConfigObj.can_open_doors =
              navigationWalkConfig.can_open_doors
          }
          if (navigationWalkConfig.can_open_iron_doors !== void 0) {
            navigationWalkConfigObj.can_open_iron_doors =
              navigationWalkConfig.can_open_iron_doors
          }
          if (navigationWalkConfig.can_pass_doors !== void 0) {
            navigationWalkConfigObj.can_pass_doors =
              navigationWalkConfig.can_pass_doors
          }
          if (navigationWalkConfig.can_path_from_air !== void 0) {
            navigationWalkConfigObj.can_path_from_air =
              navigationWalkConfig.can_path_from_air
          }
          if (navigationWalkConfig.can_path_over_water !== void 0) {
            navigationWalkConfigObj.can_path_over_water =
              navigationWalkConfig.can_path_over_water
          }
          if (navigationWalkConfig.can_sink !== void 0) {
            navigationWalkConfigObj.can_sink = navigationWalkConfig.can_sink
          }
          if (navigationWalkConfig.can_swim !== void 0) {
            navigationWalkConfigObj.can_swim = navigationWalkConfig.can_swim
          }
          if (navigationWalkConfig.can_walk !== void 0) {
            navigationWalkConfigObj.can_walk = navigationWalkConfig.can_walk
          }
          if (navigationWalkConfig.can_walk_in_lava !== void 0) {
            navigationWalkConfigObj.can_walk_in_lava =
              navigationWalkConfig.can_walk_in_lava
          }
          if (navigationWalkConfig.is_amphibious !== void 0) {
            navigationWalkConfigObj.is_amphibious =
              navigationWalkConfig.is_amphibious
          }
          if (navigationWalkConfig.using_door_annotation !== void 0) {
            navigationWalkConfigObj.using_door_annotation =
              navigationWalkConfig.using_door_annotation
          }
          ApplyComponents['minecraft:navigation.walk'] = navigationWalkConfigObj
        }
        const preferredPathConfig = components['minecraft:preferred_path']
        if (preferredPathConfig !== void 0) {
          const preferredPathConfigObj: any = {}
          if (preferredPathConfig.default_block_cost !== void 0) {
            preferredPathConfigObj.default_block_cost =
              preferredPathConfig.default_block_cost
          }
          if (preferredPathConfig.jump_cost !== void 0) {
            preferredPathConfigObj.jump_cost = preferredPathConfig.jump_cost
          }
          if (preferredPathConfig.max_fall_blocks !== void 0) {
            preferredPathConfigObj.max_fall_blocks =
              preferredPathConfig.max_fall_blocks
          }
          if (preferredPathConfig.preferred_path_blocks !== void 0) {
            preferredPathConfigObj.preferred_path_blocks = [
              ...preferredPathConfig.preferred_path_blocks,
            ]
          }
          ApplyComponents['minecraft:preferred_path'] = preferredPathConfigObj
        }
        const offspringConfig = components['minecraft:offspring']
        if (offspringConfig !== void 0) {
          const offspringConfigObj: any = {}
          if (offspringConfig.born_event !== void 0) {
            offspringConfigObj.born_event = offspringConfig.born_event
          }
          if (offspringConfig.cooldown !== void 0) {
            offspringConfigObj.cooldown = offspringConfig.cooldown
          }
          if (offspringConfig.mutation_factor !== void 0) {
            const mutationFactorObj: any = {}
            if (offspringConfig.mutation_factor.color !== void 0) {
              mutationFactorObj.color = offspringConfig.mutation_factor.color
            }
            if (offspringConfig.mutation_factor.gene !== void 0) {
              mutationFactorObj.gene = offspringConfig.mutation_factor.gene
            }
            if (offspringConfig.mutation_factor.extra !== void 0) {
              mutationFactorObj.extra = offspringConfig.mutation_factor.extra
            }
            if (offspringConfig.mutation_factor.health !== void 0) {
              mutationFactorObj.health = offspringConfig.mutation_factor.health
            }
            if (offspringConfig.mutation_factor.speed !== void 0) {
              mutationFactorObj.speed = offspringConfig.mutation_factor.speed
            }
            if (Object.keys(mutationFactorObj).length > 0) {
              offspringConfigObj.mutation_factor = mutationFactorObj
            }
          }
          if (offspringConfig.breed_event !== void 0) {
            offspringConfigObj.breed_event = offspringConfig.breed_event
          }
          if (offspringConfig.breed_items !== void 0) {
            offspringConfigObj.breed_items = [...offspringConfig.breed_items]
          }
          if (offspringConfig.delayed_growth !== void 0) {
            offspringConfigObj.delayed_growth = offspringConfig.delayed_growth
          }
          if (offspringConfig.deny_parents_baby_variant !== void 0) {
            offspringConfigObj.deny_parents_baby_variant =
              offspringConfig.deny_parents_baby_variant
          }
          if (offspringConfig.grow_up_duration !== void 0) {
            offspringConfigObj.grow_up_duration =
              offspringConfig.grow_up_duration
          }
          if (offspringConfig.initial_variant !== void 0) {
            offspringConfigObj.initial_variant = offspringConfig.initial_variant
          }
          if (offspringConfig.inheritance_chance !== void 0) {
            const inheritanceChanceObj: any = {}
            if (offspringConfig.inheritance_chance.angry !== void 0) {
              inheritanceChanceObj.angry =
                offspringConfig.inheritance_chance.angry
            }
            if (offspringConfig.inheritance_chance.attacker !== void 0) {
              inheritanceChanceObj.attacker =
                offspringConfig.inheritance_chance.attacker
            }
            if (offspringConfig.inheritance_chance.color !== void 0) {
              inheritanceChanceObj.color =
                offspringConfig.inheritance_chance.color
            }
            if (offspringConfig.inheritance_chance.gene !== void 0) {
              inheritanceChanceObj.gene =
                offspringConfig.inheritance_chance.gene
            }
            if (offspringConfig.inheritance_chance.variant !== void 0) {
              inheritanceChanceObj.variant =
                offspringConfig.inheritance_chance.variant
            }
            if (Object.keys(inheritanceChanceObj).length > 0) {
              offspringConfigObj.inheritance_chance = inheritanceChanceObj
            }
          }
          if (offspringConfig.num_variants !== void 0) {
            offspringConfigObj.num_variants = offspringConfig.num_variants
          }
          if (offspringConfig.parent_centric_attribute_blending !== void 0) {
            const attributeBlendingObj: any = {}
            if (
              offspringConfig.parent_centric_attribute_blending.attribute !==
              void 0
            ) {
              attributeBlendingObj.attribute =
                offspringConfig.parent_centric_attribute_blending.attribute
            }
            if (
              offspringConfig.parent_centric_attribute_blending.dampening !==
              void 0
            ) {
              attributeBlendingObj.dampening =
                offspringConfig.parent_centric_attribute_blending.dampening
            }
            if (Object.keys(attributeBlendingObj).length > 0) {
              offspringConfigObj.parent_centric_attribute_blending =
                attributeBlendingObj
            }
          }
          if (offspringConfig.should_baby_face_parent !== void 0) {
            offspringConfigObj.should_baby_face_parent =
              offspringConfig.should_baby_face_parent
          }
          if (offspringConfig.variants !== void 0) {
            offspringConfigObj.variants = { ...offspringConfig.variants }
          }
          ApplyComponents['minecraft:offspring'] = offspringConfigObj
        }
      }
    }

    return result
  }

  // Setter方法
  public setId(newValue: string): void {
    if (
      typeof newValue == 'string' &&
      /[a-zA-Z0-9_]:[a-zA-Z0-9_]/.test(newValue)
    ) {
      this.#opt.id = newValue
    } else {
      throw new Error('[set error]: id: type error or invalid format')
    }
  }

  public setFormat(newValue: string): void {
    if (typeof newValue == 'string' && /\d.\d.\d/.test(newValue)) {
      this.#opt.format = newValue
    } else {
      throw new Error('[set error]: format: type error or invalid format')
    }
  }

  public setIsSpawnable(value: boolean): void {
    if (typeof value === 'boolean') {
      this.#opt.is_spawnable = value
    } else {
      throw new TypeError('[set error]: is_spawnable: type error')
    }
  }

  public setIsSummonable(value: boolean): void {
    if (typeof value === 'boolean') {
      this.#opt.is_summonable = value
    } else {
      throw new TypeError('[set error]: is_summonable: type error')
    }
  }

  public setAddrider(config: {
    entity_type?: string
    riders?: Array<{
      entity_type: string
      spawn_event?: string
    }>
    spawn_event?: string
  }): void {
    if (typeof config !== 'object' || config === null) {
      throw new Error('[set error]: addrider: must be an object configuration')
    }
    if (!this.#opt.components) {
      this.#opt.components = {}
    }

    this.#opt.components.addrider = config
  }

  public setAdmireItem(config: {
    cooldown_after_being_attacked?: number
    duration?: number
  }): void {
    if (typeof config !== 'object' || config === null) {
      throw new Error(
        '[set error]: admire_item: must be an object configuration',
      )
    }
    if (!this.#opt.components) {
      this.#opt.components = {}
    }
    if (
      config.cooldown_after_being_attacked !== void 0 &&
      typeof config.cooldown_after_being_attacked !== 'number'
    ) {
      throw new TypeError(
        '[set error]: admire_item: cooldown_after_being_attacked must be a number',
      )
    }
    if (config.duration !== void 0 && typeof config.duration !== 'number') {
      throw new TypeError('[set error]: admire_item: duration must be a number')
    }

    this.#opt.components['minecraft:admire_item'] = config
  }

  public setAgeable(config: {
    drop_items?: string[]
    duration?: number
    feed_items?:
      | string
      | string[]
      | Array<{
          growth?: number
          item: string
        }>
    grow_up?:
      | string
      | {
          event: string
          target: string
        }
    interact_filters?: any
    pause_growth_items?: string[]
    reset_growth_items?: string[]
  }): void {
    if (typeof config !== 'object' || config === null) {
      throw new Error('[set error]: ageable: must be an object configuration')
    }
    if (!this.#opt.components) {
      this.#opt.components = {}
    }
    if (config.duration !== void 0 && typeof config.duration !== 'number') {
      throw new TypeError('[set error]: ageable: duration must be a number')
    }
    if (config.feed_items !== void 0) {
      if (
        !(
          typeof config.feed_items === 'string' ||
          Array.isArray(config.feed_items)
        )
      ) {
        throw new TypeError(
          '[set error]: ageable: feed_items must be a string or array',
        )
      }
    }

    this.#opt.components['minecraft:ageable'] = config
  }

  public setAngerLevel(config: {
    anger_decrement_interval?: number
    angry_boost?: number
    angry_threshold?: number
    broadcast_anger?: boolean
    broadcast_anger_on_attack?: boolean
    broadcast_filters?: any
    broadcast_range?: number
    broadcast_targets?: string[]
    calm_event?: string
    default_annoyingness?: number
    default_projectile_annoyingness?: number
    duration?: number
    duration_delta?: number
    filters?: any
    max_anger?: number
    nuisance_filter?: any
    on_increase_sounds?: Array<{
      condition?: string
      sound?: string
    }>
    remove_targets_below_angry_threshold?: boolean
    sound_interval?: { min: number; max: number }
  }): void {
    if (typeof config !== 'object' || config === null) {
      throw new Error(
        '[set error]: anger_level: must be an object configuration',
      )
    }
    if (!this.#opt.components) {
      this.#opt.components = {}
    }
    if (
      config.anger_decrement_interval !== void 0 &&
      typeof config.anger_decrement_interval !== 'number'
    ) {
      throw new TypeError(
        '[set error]: anger_level: anger_decrement_interval must be a number',
      )
    }
    if (
      config.angry_boost !== void 0 &&
      (typeof config.angry_boost !== 'number' || config.angry_boost < 0)
    ) {
      throw new TypeError(
        '[set error]: anger_level: angry_boost must be a number >= 0',
      )
    }
    if (
      config.angry_threshold !== void 0 &&
      (typeof config.angry_threshold !== 'number' || config.angry_threshold < 0)
    ) {
      throw new TypeError(
        '[set error]: anger_level: angry_threshold must be a number >= 0',
      )
    }
    if (
      config.max_anger !== void 0 &&
      (typeof config.max_anger !== 'number' || config.max_anger < 0)
    ) {
      throw new TypeError(
        '[set error]: anger_level: max_anger must be a number >= 0',
      )
    }
    if (
      config.broadcast_range !== void 0 &&
      (typeof config.broadcast_range !== 'number' || config.broadcast_range < 0)
    ) {
      throw new TypeError(
        '[set error]: anger_level: broadcast_range must be a number >= 0',
      )
    }
    if (
      config.broadcast_targets !== void 0 &&
      !Array.isArray(config.broadcast_targets)
    ) {
      throw new TypeError(
        '[set error]: anger_level: broadcast_targets must be an array',
      )
    }

    this.#opt.components['minecraft:anger_level'] = config
  }

  public setAngry(config: {
    angry_sound?: string
    broadcast_anger?: boolean
    broadcast_anger_on_attack?: boolean
    broadcast_anger_on_being_attacked?: boolean
    broadcast_anger_when_dying?: boolean
    broadcast_filters?: any
    broadcast_range?: number
    broadcast_targets?: string[]
    calm_event?: string | { event: string; target: string }
    duration?: number
    duration_delta?: number
    filters?: any
    sound_interval?: { min: number; max: number }
  }): void {
    if (typeof config !== 'object' || config === null) {
      throw new Error('[set error]: angry: must be an object configuration')
    }
    if (!this.#opt.components) {
      this.#opt.components = {}
    }
    if (config.duration !== void 0 && typeof config.duration !== 'number') {
      throw new TypeError('[set error]: angry: duration must be a number')
    }
    if (
      config.duration_delta !== void 0 &&
      typeof config.duration_delta !== 'number'
    ) {
      throw new TypeError('[set error]: angry: duration_delta must be a number')
    }
    if (
      config.broadcast_range !== void 0 &&
      (typeof config.broadcast_range !== 'number' || config.broadcast_range < 0)
    ) {
      throw new TypeError(
        '[set error]: angry: broadcast_range must be a number >= 0',
      )
    }
    if (
      config.broadcast_targets !== void 0 &&
      !Array.isArray(config.broadcast_targets)
    ) {
      throw new TypeError(
        '[set error]: angry: broadcast_targets must be an array',
      )
    }

    this.#opt.components['minecraft:angry'] = config
  }

  public setAnnotationBreakDoor(config: {
    break_time?: number
    min_difficulty?: 'hard' | 'normal' | 'easy' | 'peaceful'
  }): void {
    if (typeof config !== 'object' || config === null) {
      throw new Error(
        '[set error]: annotation.break_door: must be an object configuration',
      )
    }
    if (!this.#opt.components) {
      this.#opt.components = {}
    }
    if (
      config.break_time !== void 0 &&
      (typeof config.break_time !== 'number' || config.break_time < 0)
    ) {
      throw new TypeError(
        '[set error]: annotation.break_door: break_time must be a number >= 0',
      )
    }
    if (
      config.min_difficulty !== void 0 &&
      !['hard', 'normal', 'easy', 'peaceful'].includes(config.min_difficulty)
    ) {
      throw new TypeError(
        "[set error]: annotation.break_door: min_difficulty must be one of 'hard', 'normal', 'easy', 'peaceful'",
      )
    }

    this.#opt.components['minecraft:annotation.break_door'] = config
  }

  public setAnnotationOpenDoor(): void {
    if (!this.#opt.components) {
      this.#opt.components = {}
    }

    // minecraft:annotation.open_door 是一个空对象组件
    this.#opt.components['minecraft:annotation.open_door'] = {}
  }

  public setAttack(config: {
    damage?:
      | number
      | [number, number]
      | { range_min: number; range_max: number }
    effect_duration?: number
    effect_name?: string
  }): void {
    if (typeof config !== 'object' || config === null) {
      throw new Error('[set error]: attack: must be an object configuration')
    }
    if (!this.#opt.components) {
      this.#opt.components = {}
    }
    if (config.damage !== void 0) {
      if (typeof config.damage === 'number') {
        // 单一数字，有效
      } else if (
        Array.isArray(config.damage) &&
        config.damage.length === 2 &&
        typeof config.damage[0] === 'number' &&
        typeof config.damage[1] === 'number'
      ) {
        // 数组[min, max]，有效
      } else if (
        typeof config.damage === 'object' &&
        config.damage !== null &&
        'range_min' in config.damage &&
        'range_max' in config.damage &&
        typeof config.damage.range_min === 'number' &&
        typeof config.damage.range_max === 'number'
      ) {
        // 对象{range_min, range_max}，有效
      } else {
        throw new TypeError(
          '[set error]: attack: damage must be a number, [min, max] array, or {range_min, range_max} object',
        )
      }
    }
    if (
      config.effect_duration !== void 0 &&
      typeof config.effect_duration !== 'number'
    ) {
      throw new TypeError(
        '[set error]: attack: effect_duration must be a number',
      )
    }

    this.#opt.components['minecraft:attack'] = config
  }

  public setAreaAttack(config: {
    cause?: string
    damage_cooldown?: number
    damage_per_tick?: number
    damage_range?: number
    entity_filter?: any
    play_attack_sound?: boolean
  }): void {
    if (typeof config !== 'object' || config === null) {
      throw new Error(
        '[set error]: area_attack: must be an object configuration',
      )
    }
    if (!this.#opt.components) {
      this.#opt.components = {}
    }
    if (
      config.damage_cooldown !== void 0 &&
      (typeof config.damage_cooldown !== 'number' || config.damage_cooldown < 0)
    ) {
      throw new TypeError(
        '[set error]: area_attack: damage_cooldown must be a number >= 0',
      )
    }
    if (
      config.damage_per_tick !== void 0 &&
      (typeof config.damage_per_tick !== 'number' || config.damage_per_tick < 0)
    ) {
      throw new TypeError(
        '[set error]: area_attack: damage_per_tick must be a number >= 0',
      )
    }
    if (
      config.damage_range !== void 0 &&
      (typeof config.damage_range !== 'number' || config.damage_range < 0)
    ) {
      throw new TypeError(
        '[set error]: area_attack: damage_range must be a number >= 0',
      )
    }
    if (
      config.play_attack_sound !== void 0 &&
      typeof config.play_attack_sound !== 'boolean'
    ) {
      throw new TypeError(
        '[set error]: area_attack: play_attack_sound must be a boolean',
      )
    }

    this.#opt.components['minecraft:area_attack'] = config
  }

  public setAttackCooldown(config: {
    attack_cooldown_complete_event?: string | { event: string; target?: string }
    attack_cooldown_time?: number | { min: number; max: number }
  }): void {
    if (typeof config !== 'object' || config === null) {
      throw new Error(
        '[set error]: attack_cooldown: must be an object configuration',
      )
    }
    if (!this.#opt.components) {
      this.#opt.components = {}
    }
    if (config.attack_cooldown_time !== void 0) {
      if (typeof config.attack_cooldown_time === 'number') {
        // 单一数字，有效
      } else if (
        typeof config.attack_cooldown_time === 'object' &&
        config.attack_cooldown_time !== null &&
        'min' in config.attack_cooldown_time &&
        'max' in config.attack_cooldown_time &&
        typeof config.attack_cooldown_time.min === 'number' &&
        typeof config.attack_cooldown_time.max === 'number'
      ) {
        // 对象{min, max}，有效
      } else {
        throw new TypeError(
          '[set error]: attack_cooldown: attack_cooldown_time must be a number or {min, max} object',
        )
      }
    }

    this.#opt.components['minecraft:attack_cooldown'] = config
  }

  public setBalloonable(config: {
    mass?: number
    max_distance?: number
    on_balloon?: any
    on_unballoon?: any
    soft_distance?: number
  }): void {
    if (typeof config !== 'object' || config === null) {
      throw new Error(
        '[set error]: balloonable: must be an object configuration',
      )
    }
    if (!this.#opt.components) {
      this.#opt.components = {}
    }
    if (config.mass !== void 0 && typeof config.mass !== 'number') {
      throw new TypeError('[set error]: balloonable: mass must be a number')
    }
    if (
      config.max_distance !== void 0 &&
      (typeof config.max_distance !== 'number' || config.max_distance < 0)
    ) {
      throw new TypeError(
        '[set error]: balloonable: max_distance must be a number >= 0',
      )
    }
    if (
      config.soft_distance !== void 0 &&
      (typeof config.soft_distance !== 'number' || config.soft_distance < 0)
    ) {
      throw new TypeError(
        '[set error]: balloonable: soft_distance must be a number >= 0',
      )
    }

    this.#opt.components['minecraft:balloonable'] = config
  }

  public setBarter(config: {
    barter_table?: string
    cooldown_after_being_attacked?: { min: number; max: number }
  }): void {
    if (typeof config !== 'object' || config === null) {
      throw new Error('[set error]: barter: must be an object configuration')
    }
    if (!this.#opt.components) {
      this.#opt.components = {}
    }
    if (config.cooldown_after_being_attacked !== void 0) {
      if (
        typeof config.cooldown_after_being_attacked !== 'object' ||
        config.cooldown_after_being_attacked === null ||
        !('min' in config.cooldown_after_being_attacked) ||
        !('max' in config.cooldown_after_being_attacked) ||
        typeof config.cooldown_after_being_attacked.min !== 'number' ||
        typeof config.cooldown_after_being_attacked.max !== 'number'
      ) {
        throw new TypeError(
          '[set error]: barter: cooldown_after_being_attacked must be a {min, max} object',
        )
      }
    }

    this.#opt.components['minecraft:barter'] = config
  }

  public setBlockClimber(): void {
    if (!this.#opt.components) {
      this.#opt.components = {}
    }

    // minecraft:block_climber 是一个空对象组件
    this.#opt.components['minecraft:block_climber'] = {}
  }

  public setBlockSensor(config: {
    on_break?: Array<{
      block_list?: string[]
      on_block_broken?: string
    }>
    sensor_radius?: number
    sources?: any
  }): void {
    if (typeof config !== 'object' || config === null) {
      throw new Error(
        '[set error]: block_sensor: must be an object configuration',
      )
    }
    if (!this.#opt.components) {
      this.#opt.components = {}
    }
    if (
      config.sensor_radius !== void 0 &&
      (typeof config.sensor_radius !== 'number' ||
        config.sensor_radius < 0 ||
        config.sensor_radius > 32.0)
    ) {
      throw new TypeError(
        '[set error]: block_sensor: sensor_radius must be a number between 0 and 32.0',
      )
    }
    if (config.on_break !== void 0 && !Array.isArray(config.on_break)) {
      throw new TypeError(
        '[set error]: block_sensor: on_break must be an array',
      )
    }

    this.#opt.components['minecraft:block_sensor'] = config
  }

  public setBodyRotationAxisAligned(): void {
    if (!this.#opt.components) {
      this.#opt.components = {}
    }

    // minecraft:body_rotation_axis_aligned 是一个空对象组件
    this.#opt.components['minecraft:body_rotation_axis_aligned'] = {}
  }

  public setBodyRotationAlwaysFollowsHead(): void {
    if (!this.#opt.components) {
      this.#opt.components = {}
    }

    // minecraft:body_rotation_always_follows_head 是一个空对象组件
    this.#opt.components['minecraft:body_rotation_always_follows_head'] = {}
  }

  public setBodyRotationBlocked(): void {
    if (!this.#opt.components) {
      this.#opt.components = {}
    }

    // minecraft:body_rotation_blocked 是一个空对象组件
    this.#opt.components['minecraft:body_rotation_blocked'] = {}
  }

  public setBodyRotationLockedToVehicle(): void {
    if (!this.#opt.components) {
      this.#opt.components = {}
    }

    // minecraft:body_rotation_locked_to_vehicle 是一个空对象组件
    this.#opt.components['minecraft:body_rotation_locked_to_vehicle'] = {}
  }

  public setBoostable(config: {
    boost_items?: Array<{
      damage?: number
      item: string
      replace_item?: string
    }>
    duration?: number
    speed_multiplier?: number
  }): void {
    if (typeof config !== 'object' || config === null) {
      throw new Error('[set error]: boostable: must be an object configuration')
    }
    if (!this.#opt.components) {
      this.#opt.components = {}
    }
    if (config.boost_items !== void 0 && !Array.isArray(config.boost_items)) {
      throw new TypeError(
        '[set error]: boostable: boost_items must be an array',
      )
    }
    if (config.boost_items !== void 0) {
      for (const item of config.boost_items) {
        if (
          !item ||
          typeof item !== 'object' ||
          !item.item ||
          typeof item.item !== 'string'
        ) {
          throw new TypeError(
            "[set error]: boostable: boost_items must contain objects with 'item' string property",
          )
        }
        if (item.damage !== void 0 && typeof item.damage !== 'number') {
          throw new TypeError(
            '[set error]: boostable: boost_items item damage must be a number',
          )
        }
      }
    }
    if (
      config.duration !== void 0 &&
      (typeof config.duration !== 'number' || config.duration < 0)
    ) {
      throw new TypeError(
        '[set error]: boostable: duration must be a number >= 0',
      )
    }
    if (
      config.speed_multiplier !== void 0 &&
      (typeof config.speed_multiplier !== 'number' ||
        config.speed_multiplier <= 0)
    ) {
      throw new TypeError(
        '[set error]: boostable: speed_multiplier must be a number > 0',
      )
    }

    this.#opt.components['minecraft:boostable'] = config
  }

  public setBoss(config: {
    hud_range?: number
    name?: string
    should_darken_sky?: boolean
  }): void {
    if (typeof config !== 'object' || config === null) {
      throw new Error('[set error]: boss: must be an object configuration')
    }

    if (!this.#opt.components) {
      this.#opt.components = {}
    }

    if (
      config.hud_range !== void 0 &&
      (typeof config.hud_range !== 'number' || config.hud_range < 0)
    ) {
      throw new TypeError('[set error]: boss: hud_range must be a number >= 0')
    }

    if (config.name !== void 0 && typeof config.name !== 'string') {
      throw new TypeError('[set error]: boss: name must be a string')
    }

    if (
      config.should_darken_sky !== void 0 &&
      typeof config.should_darken_sky !== 'boolean'
    ) {
      throw new TypeError(
        '[set error]: boss: should_darken_sky must be a boolean',
      )
    }

    this.#opt.components['minecraft:boss'] = config
  }

  public setBreakBlocks(config: { breakable_blocks?: string[] }): void {
    if (typeof config !== 'object' || config === null) {
      throw new Error(
        '[set error]: break_blocks: must be an object configuration',
      )
    }

    if (!this.#opt.components) {
      this.#opt.components = {}
    }

    if (config.breakable_blocks !== void 0) {
      if (!Array.isArray(config.breakable_blocks)) {
        throw new TypeError(
          '[set error]: break_blocks: breakable_blocks must be an array',
        )
      }
      for (const block of config.breakable_blocks) {
        if (typeof block !== 'string') {
          throw new TypeError(
            '[set error]: break_blocks: breakable_blocks must contain string values',
          )
        }
      }
    }

    this.#opt.components['minecraft:break_blocks'] = config
  }

  public setBreathable(config: {
    breathe_blocks?: string[]
    breathes_air?: boolean
    breathes_lava?: boolean
    breathes_solids?: boolean
    breathes_water?: boolean
    generates_bubbles?: boolean
    inhale_time?: number
    non_breathe_blocks?: string[]
    suffocate_time?: number
    suffocateTime?: number
    total_supply?: number
    totalSupply?: number
  }): void {
    if (typeof config !== 'object' || config === null) {
      throw new Error(
        '[set error]: breathable: must be an object configuration',
      )
    }
    if (!this.#opt.components) {
      this.#opt.components = {}
    }
    const arrayProperties = [
      { prop: 'breathe_blocks', name: 'breathe_blocks' },
      { prop: 'non_breathe_blocks', name: 'non_breathe_blocks' },
    ]

    for (const { prop, name } of arrayProperties) {
      if (config[prop as keyof typeof config] !== void 0) {
        const value = config[prop as keyof typeof config]
        if (!Array.isArray(value)) {
          throw new TypeError(
            `[set error]: breathable: ${name} must be an array`,
          )
        }
        for (const item of value) {
          if (typeof item !== 'string') {
            throw new TypeError(
              `[set error]: breathable: ${name} must contain string values`,
            )
          }
        }
      }
    }
    const booleanProperties = [
      'breathes_air',
      'breathes_lava',
      'breathes_solids',
      'breathes_water',
      'generates_bubbles',
    ]

    for (const prop of booleanProperties) {
      if (
        config[prop as keyof typeof config] !== void 0 &&
        typeof config[prop as keyof typeof config] !== 'boolean'
      ) {
        throw new TypeError(
          `[set error]: breathable: ${prop} must be a boolean`,
        )
      }
    }
    const numberProperties = [
      'inhale_time',
      'suffocate_time',
      'suffocateTime',
      'total_supply',
      'totalSupply',
    ]

    for (const prop of numberProperties) {
      if (
        config[prop as keyof typeof config] !== void 0 &&
        typeof config[prop as keyof typeof config] !== 'number'
      ) {
        throw new TypeError(`[set error]: breathable: ${prop} must be a number`)
      }
    }

    this.#opt.components['minecraft:breathable'] = config
  }

  public setBribeable(config: {
    bribe_cooldown?: number
    bribe_items?: string[] | string
  }): void {
    if (typeof config !== 'object' || config === null) {
      throw new Error('[set error]: bribeable: must be an object configuration')
    }
    if (!this.#opt.components) {
      this.#opt.components = {}
    }
    if (
      config.bribe_cooldown !== void 0 &&
      (typeof config.bribe_cooldown !== 'number' || config.bribe_cooldown < 0)
    ) {
      throw new TypeError(
        '[set error]: bribeable: bribe_cooldown must be a number >= 0',
      )
    }
    if (config.bribe_items !== void 0) {
      if (
        typeof config.bribe_items !== 'string' &&
        !Array.isArray(config.bribe_items)
      ) {
        throw new TypeError(
          '[set error]: bribeable: bribe_items must be a string or an array of strings',
        )
      }

      // 如果是数组，验证数组元素都是字符串
      if (Array.isArray(config.bribe_items)) {
        for (const item of config.bribe_items) {
          if (typeof item !== 'string') {
            throw new TypeError(
              '[set error]: bribeable: bribe_items array must contain string values',
            )
          }
        }
      }
    }

    this.#opt.components['minecraft:bribeable'] = config
  }

  public setBreedable(config: {
    allow_sitting?: boolean
    blend_attributes?: boolean
    breed_cooldown?: number
    breed_items?: string[] | string
    breeds_with?:
      | Array<{
          baby_type?: string
          breed_event?: string | { event: string; filters?: any }
          mate_type?: string
        }>
      | {
          baby_type?: string
          breed_event?: string | { event: string; filters?: any }
          mate_type?: string
        }
    causes_pregnancy?: boolean
    deny_parents_variant?: {
      chance?: number
      max_variant?: string
      min_variant?: string
    }
    environment_requirements?: Array<{
      block_types?: string[]
      count?: number
      radius?: number
    }>
    extra_baby_chance?: { min: number; max: number }
    inherit_tamed?: boolean
    love_filters?: any
    mutation_factor?: {
      color?: { min: number; max: number } | number
      extra_variant?: { min: number; max: number } | number
      variant?: { min: number; max: number } | number
    }
    require_full_health?: boolean
    require_tame?: boolean
  }): void {
    if (typeof config !== 'object' || config === null) {
      throw new Error('[set error]: breedable: must be an object configuration')
    }
    if (!this.#opt.components) {
      this.#opt.components = {}
    }
    const booleanProperties = [
      'allow_sitting',
      'blend_attributes',
      'causes_pregnancy',
      'inherit_tamed',
      'require_full_health',
      'require_tame',
    ]

    for (const prop of booleanProperties) {
      if (
        config[prop as keyof typeof config] !== void 0 &&
        typeof config[prop as keyof typeof config] !== 'boolean'
      ) {
        throw new TypeError(`[set error]: breedable: ${prop} must be a boolean`)
      }
    }
    if (
      config.breed_cooldown !== void 0 &&
      (typeof config.breed_cooldown !== 'number' || config.breed_cooldown < 0)
    ) {
      throw new TypeError(
        '[set error]: breedable: breed_cooldown must be a number >= 0',
      )
    }
    if (config.breed_items !== void 0) {
      if (
        typeof config.breed_items !== 'string' &&
        !Array.isArray(config.breed_items)
      ) {
        throw new TypeError(
          '[set error]: breedable: breed_items must be a string or an array of strings',
        )
      }

      // 如果是数组，验证数组元素都是字符串
      if (Array.isArray(config.breed_items)) {
        for (const item of config.breed_items) {
          if (typeof item !== 'string') {
            throw new TypeError(
              '[set error]: breedable: breed_items array must contain string values',
            )
          }
        }
      }
    }
    if (config.extra_baby_chance !== void 0) {
      if (
        typeof config.extra_baby_chance !== 'object' ||
        config.extra_baby_chance === null ||
        typeof config.extra_baby_chance.min !== 'number' ||
        typeof config.extra_baby_chance.max !== 'number' ||
        config.extra_baby_chance.min < 0 ||
        config.extra_baby_chance.max < 0 ||
        config.extra_baby_chance.min > config.extra_baby_chance.max
      ) {
        throw new TypeError(
          '[set error]: breedable: extra_baby_chance must be an object with min and max numbers, where min <= max and both >= 0',
        )
      }
    }

    this.#opt.components['minecraft:breedable'] = config
  }

  public setBuoyant(config: {
    apply_gravity?: boolean
    base_buoyancy?: number
    big_wave_probability?: number
    big_wave_speed?: number
    can_auto_step_from_liquid?: boolean
    drag_down_on_buoyancy_removed?: number
    liquid_blocks?: string[]
    movement_type?: 'waves' | 'bobbing' | 'none'
  }): void {
    if (typeof config !== 'object' || config === null) {
      throw new Error('[set error]: buoyant: must be an object configuration')
    }
    if (!this.#opt.components) {
      this.#opt.components = {}
    }
    const booleanProperties = ['apply_gravity', 'can_auto_step_from_liquid']
    for (const prop of booleanProperties) {
      if (
        config[prop as keyof typeof config] !== void 0 &&
        typeof config[prop as keyof typeof config] !== 'boolean'
      ) {
        throw new TypeError(`[set error]: buoyant: ${prop} must be a boolean`)
      }
    }
    const numberProperties = [
      'base_buoyancy',
      'big_wave_probability',
      'big_wave_speed',
      'drag_down_on_buoyancy_removed',
    ]
    for (const prop of numberProperties) {
      if (
        config[prop as keyof typeof config] !== void 0 &&
        typeof config[prop as keyof typeof config] !== 'number'
      ) {
        throw new TypeError(`[set error]: buoyant: ${prop} must be a number`)
      }

      // 特殊验证：big_wave_probability应在[0,1]范围内
      if (
        prop === 'big_wave_probability' &&
        config.big_wave_probability !== void 0 &&
        (config.big_wave_probability < 0 || config.big_wave_probability > 1)
      ) {
        throw new TypeError(
          '[set error]: buoyant: big_wave_probability must be between 0 and 1',
        )
      }
    }
    if (
      config.movement_type !== void 0 &&
      !['waves', 'bobbing', 'none'].includes(config.movement_type)
    ) {
      throw new TypeError(
        "[set error]: buoyant: movement_type must be 'waves', 'bobbing', or 'none'",
      )
    }
    if (config.liquid_blocks !== void 0) {
      if (!Array.isArray(config.liquid_blocks)) {
        throw new TypeError(
          '[set error]: buoyant: liquid_blocks must be an array',
        )
      }
      for (const block of config.liquid_blocks) {
        if (typeof block !== 'string') {
          throw new TypeError(
            '[set error]: buoyant: liquid_blocks must contain string values',
          )
        }
      }
    }

    this.#opt.components['minecraft:buoyant'] = config
  }

  // 以下为新的空对象组件方法
  public setBurnsInDaylight(
    config: {
      protection_slot?:
        | 'slot.armor.body'
        | 'slot.armor.chest'
        | 'slot.armor.feet'
        | 'slot.armor.head'
        | 'slot.armor.legs'
        | 'slot.weapon.mainhand'
        | 'slot.weapon.offhand'
    } = {},
  ): void {
    if (!this.#opt.components) {
      this.#opt.components = {}
    }
    if (
      config.protection_slot !== void 0 &&
      ![
        'slot.armor.body',
        'slot.armor.chest',
        'slot.armor.feet',
        'slot.armor.head',
        'slot.armor.legs',
        'slot.weapon.mainhand',
        'slot.weapon.offhand',
      ].includes(config.protection_slot)
    ) {
      throw new TypeError(
        '[set error]: burns_in_daylight: protection_slot must be a valid armor slot',
      )
    }

    this.#opt.components['minecraft:burns_in_daylight'] = config
  }

  public setCannotBeAttacked(): void {
    if (!this.#opt.components) {
      this.#opt.components = {}
    }

    // minecraft:cannot_be_attacked 是一个空对象组件
    this.#opt.components['minecraft:cannot_be_attacked'] = {}
  }

  public setCanClimb(): void {
    if (!this.#opt.components) {
      this.#opt.components = {}
    }

    // minecraft:can_climb 是一个空对象组件
    this.#opt.components['minecraft:can_climb'] = {}
  }

  public setCanFly(): void {
    if (!this.#opt.components) {
      this.#opt.components = {}
    }

    // minecraft:can_fly 是一个空对象组件
    this.#opt.components['minecraft:can_fly'] = {}
  }

  public setCanJoinRaid(): void {
    if (!this.#opt.components) {
      this.#opt.components = {}
    }

    // minecraft:can_join_raid 是一个空对象组件
    this.#opt.components['minecraft:can_join_raid'] = {}
  }

  public setCanPowerJump(): void {
    if (!this.#opt.components) {
      this.#opt.components = {}
    }

    // minecraft:can_power_jump 是一个空对象组件
    this.#opt.components['minecraft:can_power_jump'] = {}
  }

  public setCelebrateHunt(config: {
    broadcast?: boolean
    celeberation_targets?: any
    celebrate_sound?: string
    duration?: number
    radius?: number
    sound_interval?: { min: number; max: number }
  }): void {
    if (typeof config !== 'object' || config === null) {
      throw new Error(
        '[set error]: celebrate_hunt: must be an object configuration',
      )
    }
    if (!this.#opt.components) {
      this.#opt.components = {}
    }
    if (config.broadcast !== void 0 && typeof config.broadcast !== 'boolean') {
      throw new TypeError(
        '[set error]: celebrate_hunt: broadcast must be a boolean',
      )
    }
    if (
      config.celebrate_sound !== void 0 &&
      typeof config.celebrate_sound !== 'string'
    ) {
      throw new TypeError(
        '[set error]: celebrate_hunt: celebrate_sound must be a string',
      )
    }
    const numberProperties = ['duration', 'radius']
    for (const prop of numberProperties) {
      if (
        config[prop as keyof typeof config] !== void 0 &&
        typeof config[prop as keyof typeof config] !== 'number'
      ) {
        throw new TypeError(
          `[set error]: celebrate_hunt: ${prop} must be a number`,
        )
      }
    }
    if (config.duration !== void 0 && config.duration < 0) {
      throw new TypeError('[set error]: celebrate_hunt: duration must be >= 0')
    }
    if (config.radius !== void 0 && config.radius < 0) {
      throw new TypeError('[set error]: celebrate_hunt: radius must be >= 0')
    }
    if (config.sound_interval !== void 0) {
      if (
        typeof config.sound_interval !== 'object' ||
        config.sound_interval === null ||
        typeof config.sound_interval.min !== 'number' ||
        typeof config.sound_interval.max !== 'number' ||
        config.sound_interval.min < 0 ||
        config.sound_interval.max < 0 ||
        config.sound_interval.min > config.sound_interval.max
      ) {
        throw new TypeError(
          '[set error]: celebrate_hunt: sound_interval must be an object with min and max numbers, where min <= max and both >= 0',
        )
      }
    }

    this.#opt.components['minecraft:celebrate_hunt'] = config
  }

  public setCollisionBox(
    config: {
      height?: number
      width?: number
    } = {},
  ): void {
    if (typeof config !== 'object' || config === null) {
      throw new Error(
        '[set error]: collision_box: must be an object configuration',
      )
    }
    if (!this.#opt.components) {
      this.#opt.components = {}
    }
    if (config.height !== void 0) {
      if (typeof config.height !== 'number') {
        throw new TypeError(
          '[set error]: collision_box: height must be a number',
        )
      }
      if (config.height < 0) {
        throw new TypeError('[set error]: collision_box: height must be >= 0')
      }
    }
    if (config.width !== void 0) {
      if (typeof config.width !== 'number') {
        throw new TypeError(
          '[set error]: collision_box: width must be a number',
        )
      }
      if (config.width < 0) {
        throw new TypeError('[set error]: collision_box: width must be >= 0')
      }
    }

    this.#opt.components['minecraft:collision_box'] = config
  }

  public setColor(
    config: {
      value?: number
    } = {},
  ): void {
    if (typeof config !== 'object' || config === null) {
      throw new Error('[set error]: color: must be an object configuration')
    }
    if (!this.#opt.components) {
      this.#opt.components = {}
    }
    if (config.value !== void 0 && typeof config.value !== 'number') {
      throw new TypeError('[set error]: color: value must be a number')
    }

    this.#opt.components['minecraft:color'] = config
  }

  public setColor2(
    config: {
      value?: number
    } = {},
  ): void {
    if (typeof config !== 'object' || config === null) {
      throw new Error('[set error]: color2: must be an object configuration')
    }
    if (!this.#opt.components) {
      this.#opt.components = {}
    }
    if (config.value !== void 0 && typeof config.value !== 'number') {
      throw new TypeError('[set error]: color2: value must be a number')
    }

    this.#opt.components['minecraft:color2'] = config
  }

  public setCombatRegeneration(
    config: {
      apply_to_family?: boolean
      apply_to_self?: boolean
      regeneration_duration?: number | 'infinite'
    } = {},
  ): void {
    if (typeof config !== 'object' || config === null) {
      throw new Error(
        '[set error]: combat_regeneration: must be an object configuration',
      )
    }
    if (!this.#opt.components) {
      this.#opt.components = {}
    }
    const booleanProperties = ['apply_to_family', 'apply_to_self']
    for (const prop of booleanProperties) {
      if (
        config[prop as keyof typeof config] !== void 0 &&
        typeof config[prop as keyof typeof config] !== 'boolean'
      ) {
        throw new TypeError(
          `[set error]: combat_regeneration: ${prop} must be a boolean`,
        )
      }
    }
    if (config.regeneration_duration !== void 0) {
      if (typeof config.regeneration_duration === 'number') {
        if (config.regeneration_duration < 0) {
          throw new TypeError(
            '[set error]: combat_regeneration: regeneration_duration must be >= 0 when a number',
          )
        }
      } else if (config.regeneration_duration !== 'infinite') {
        throw new TypeError(
          "[set error]: combat_regeneration: regeneration_duration must be a number or 'infinite'",
        )
      }
    }

    this.#opt.components['minecraft:combat_regeneration'] = config
  }

  public setConditionalBandwidthOptimization(
    config: {
      conditional_values?: Array<{
        conditional_values?: any
        max_dropped_ticks?: number
        max_optimized_distance?: number
        use_motion_prediction_hints?: boolean
      }>
      default_values?: {
        max_dropped_ticks?: number
        max_optimized_distance?: number
        use_motion_prediction_hints?: boolean
      }
    } = {},
  ): void {
    if (typeof config !== 'object' || config === null) {
      throw new Error(
        '[set error]: conditional_bandwidth_optimization: must be an object configuration',
      )
    }
    if (!this.#opt.components) {
      this.#opt.components = {}
    }
    if (config.conditional_values !== void 0) {
      if (!Array.isArray(config.conditional_values)) {
        throw new TypeError(
          '[set error]: conditional_bandwidth_optimization: conditional_values must be an array',
        )
      }

      for (let i = 0; i < config.conditional_values.length; i++) {
        const item = config.conditional_values[i]
        if (typeof item !== 'object' || item === null) {
          throw new TypeError(
            `[set error]: conditional_bandwidth_optimization: conditional_values[${i}] must be an object`,
          )
        }
        if (
          item.max_dropped_ticks !== void 0 &&
          typeof item.max_dropped_ticks !== 'number'
        ) {
          throw new TypeError(
            `[set error]: conditional_bandwidth_optimization: conditional_values[${i}].max_dropped_ticks must be a number`,
          )
        }
        if (
          item.max_optimized_distance !== void 0 &&
          typeof item.max_optimized_distance !== 'number'
        ) {
          throw new TypeError(
            `[set error]: conditional_bandwidth_optimization: conditional_values[${i}].max_optimized_distance must be a number`,
          )
        }
        if (
          item.use_motion_prediction_hints !== void 0 &&
          typeof item.use_motion_prediction_hints !== 'boolean'
        ) {
          throw new TypeError(
            `[set error]: conditional_bandwidth_optimization: conditional_values[${i}].use_motion_prediction_hints must be a boolean`,
          )
        }
      }
    }
    if (config.default_values !== void 0) {
      if (
        typeof config.default_values !== 'object' ||
        config.default_values === null
      ) {
        throw new TypeError(
          '[set error]: conditional_bandwidth_optimization: default_values must be an object',
        )
      }
      if (
        config.default_values.max_dropped_ticks !== void 0 &&
        typeof config.default_values.max_dropped_ticks !== 'number'
      ) {
        throw new TypeError(
          '[set error]: conditional_bandwidth_optimization: default_values.max_dropped_ticks must be a number',
        )
      }
      if (
        config.default_values.max_optimized_distance !== void 0 &&
        typeof config.default_values.max_optimized_distance !== 'number'
      ) {
        throw new TypeError(
          '[set error]: conditional_bandwidth_optimization: default_values.max_optimized_distance must be a number',
        )
      }
      if (
        config.default_values.use_motion_prediction_hints !== void 0 &&
        typeof config.default_values.use_motion_prediction_hints !== 'boolean'
      ) {
        throw new TypeError(
          '[set error]: conditional_bandwidth_optimization: default_values.use_motion_prediction_hints must be a boolean',
        )
      }
    }

    this.#opt.components['minecraft:conditional_bandwidth_optimization'] =
      config
  }

  public setCustomHitTest(
    config: {
      hitboxes?: Array<{
        height?: number
        pivot?: [number, number, number]
        width?: number
      }>
    } = {},
  ): void {
    if (typeof config !== 'object' || config === null) {
      throw new Error(
        '[set error]: custom_hit_test: must be an object configuration',
      )
    }
    if (!this.#opt.components) {
      this.#opt.components = {}
    }
    if (config.hitboxes !== void 0) {
      if (!Array.isArray(config.hitboxes)) {
        throw new TypeError(
          '[set error]: custom_hit_test: hitboxes must be an array',
        )
      }

      for (let i = 0; i < config.hitboxes.length; i++) {
        const hitbox = config.hitboxes[i]
        if (typeof hitbox !== 'object' || hitbox === null) {
          throw new TypeError(
            `[set error]: custom_hit_test: hitboxes[${i}] must be an object`,
          )
        }
        if (hitbox.height !== void 0) {
          if (typeof hitbox.height !== 'number') {
            throw new TypeError(
              `[set error]: custom_hit_test: hitboxes[${i}].height must be a number`,
            )
          }
          if (hitbox.height < 0) {
            throw new TypeError(
              `[set error]: custom_hit_test: hitboxes[${i}].height must be >= 0`,
            )
          }
        }
        if (hitbox.width !== void 0) {
          if (typeof hitbox.width !== 'number') {
            throw new TypeError(
              `[set error]: custom_hit_test: hitboxes[${i}].width must be a number`,
            )
          }
          if (hitbox.width < 0) {
            throw new TypeError(
              `[set error]: custom_hit_test: hitboxes[${i}].width must be >= 0`,
            )
          }
        }
        if (hitbox.pivot !== void 0) {
          if (!Array.isArray(hitbox.pivot) || hitbox.pivot.length !== 3) {
            throw new TypeError(
              `[set error]: custom_hit_test: hitboxes[${i}].pivot must be an array with 3 numbers [x, y, z]`,
            )
          }
          for (let j = 0; j < hitbox.pivot.length; j++) {
            if (typeof hitbox.pivot[j] !== 'number') {
              throw new TypeError(
                `[set error]: custom_hit_test: hitboxes[${i}].pivot[${j}] must be a number`,
              )
            }
          }
        }
      }
    }

    this.#opt.components['minecraft:custom_hit_test'] = config
  }

  public setDamageOverTime(
    config: {
      damage_per_hurt?: number
      time_between_hurt?: number
    } = {},
  ): void {
    if (typeof config !== 'object' || config === null) {
      throw new Error(
        '[set error]: damage_over_time: must be an object configuration',
      )
    }
    if (!this.#opt.components) {
      this.#opt.components = {}
    }
    if (config.damage_per_hurt !== void 0) {
      if (
        typeof config.damage_per_hurt !== 'number' ||
        !Number.isInteger(config.damage_per_hurt)
      ) {
        throw new TypeError(
          '[set error]: damage_over_time: damage_per_hurt must be an integer',
        )
      }
      if (config.damage_per_hurt < 0) {
        throw new TypeError(
          '[set error]: damage_over_time: damage_per_hurt must be >= 0',
        )
      }
    }
    if (config.time_between_hurt !== void 0) {
      if (typeof config.time_between_hurt !== 'number') {
        throw new TypeError(
          '[set error]: damage_over_time: time_between_hurt must be a number',
        )
      }
      if (config.time_between_hurt < 0) {
        throw new TypeError(
          '[set error]: damage_over_time: time_between_hurt must be >= 0',
        )
      }
    }

    this.#opt.components['minecraft:damage_over_time'] = config
  }

  public setDamageSensor(
    config: {
      deals_damage?: boolean | 'yes' | 'no' | 'no_but_side_effects_apply'
      triggers?:
        | Array<{
            cause?: string
            damage_modifier?: number
            damage_multiplier?: number
            deals_damage?: boolean | string
            event?: string
            filters?: any
            on_damage?: {
              filters?: any
            }
            on_damage_sound_event?: string
          }>
        | {
            cause?: string
            damage_modifier?: number
            damage_multiplier?: number
            deals_damage?: boolean | string
            event?: string
            filters?: any
            on_damage?: {
              filters?: any
            }
            on_damage_sound_event?: string
          }
    } = {},
  ): void {
    if (typeof config !== 'object' || config === null) {
      throw new Error(
        '[set error]: damage_sensor: must be an object configuration',
      )
    }
    if (!this.#opt.components) {
      this.#opt.components = {}
    }
    if (config.deals_damage !== void 0) {
      if (typeof config.deals_damage === 'boolean') {
        // 布尔值，有效
      } else if (typeof config.deals_damage === 'string') {
        const validValues = ['yes', 'no', 'no_but_side_effects_apply']
        if (!validValues.includes(config.deals_damage)) {
          throw new TypeError(
            "[set error]: damage_sensor: deals_damage must be boolean or one of 'yes', 'no', 'no_but_side_effects_apply'",
          )
        }
      } else {
        throw new TypeError(
          '[set error]: damage_sensor: deals_damage must be boolean or string',
        )
      }
    }
    if (config.triggers !== void 0) {
      if (typeof config.triggers === 'object' && config.triggers !== null) {
        if (Array.isArray(config.triggers)) {
          // 数组格式的triggers
          for (let i = 0; i < config.triggers.length; i++) {
            const trigger = config.triggers[i]
            if (typeof trigger !== 'object' || trigger === null) {
              throw new TypeError(
                `[set error]: damage_sensor: triggers[${i}] must be an object`,
              )
            }
            this.#validateDamageSensorTrigger(trigger)
          }
        } else {
          // 单对象格式的triggers
          this.#validateDamageSensorTrigger(config.triggers)
        }
      } else {
        throw new TypeError(
          '[set error]: damage_sensor: triggers must be an object or array of objects',
        )
      }
    }

    this.#opt.components['minecraft:damage_sensor'] = config
  }

  // 私有方法用于验证damage_sensor的trigger对象
  #validateDamageSensorTrigger(trigger: any): void {
    if (trigger.cause !== void 0 && typeof trigger.cause !== 'string') {
      throw new TypeError(
        '[set error]: damage_sensor: trigger.cause must be a string',
      )
    }
    if (
      trigger.damage_modifier !== void 0 &&
      typeof trigger.damage_modifier !== 'number'
    ) {
      throw new TypeError(
        '[set error]: damage_sensor: trigger.damage_modifier must be a number',
      )
    }
    if (
      trigger.damage_multiplier !== void 0 &&
      typeof trigger.damage_multiplier !== 'number'
    ) {
      throw new TypeError(
        '[set error]: damage_sensor: trigger.damage_multiplier must be a number',
      )
    }
    if (trigger.deals_damage !== void 0) {
      if (typeof trigger.deals_damage === 'boolean') {
        // 布尔值，有效
      } else if (typeof trigger.deals_damage === 'string') {
        // 字符串值，无需额外验证，因为可以接受任何字符串
      } else {
        throw new TypeError(
          '[set error]: damage_sensor: trigger.deals_damage must be boolean or string',
        )
      }
    }
    if (trigger.event !== void 0 && typeof trigger.event !== 'string') {
      throw new TypeError(
        '[set error]: damage_sensor: trigger.event must be a string',
      )
    }
    if (
      trigger.on_damage_sound_event !== void 0 &&
      typeof trigger.on_damage_sound_event !== 'string'
    ) {
      throw new TypeError(
        '[set error]: damage_sensor: trigger.on_damage_sound_event must be a string',
      )
    }
  }

  public setDash(
    config: {
      cooldown_time?: number
      horizontal_momentum?: number
      vertical_momentum?: number
    } = {},
  ): void {
    if (typeof config !== 'object' || config === null) {
      throw new Error('[set error]: dash: must be an object configuration')
    }
    if (!this.#opt.components) {
      this.#opt.components = {}
    }
    if (config.cooldown_time !== void 0) {
      if (typeof config.cooldown_time !== 'number') {
        throw new TypeError('[set error]: dash: cooldown_time must be a number')
      }
      if (config.cooldown_time < 0) {
        throw new TypeError('[set error]: dash: cooldown_time must be >= 0')
      }
    }
    if (
      config.horizontal_momentum !== void 0 &&
      typeof config.horizontal_momentum !== 'number'
    ) {
      throw new TypeError(
        '[set error]: dash: horizontal_momentum must be a number',
      )
    }
    if (
      config.vertical_momentum !== void 0 &&
      typeof config.vertical_momentum !== 'number'
    ) {
      throw new TypeError(
        '[set error]: dash: vertical_momentum must be a number',
      )
    }

    this.#opt.components['minecraft:dash'] = config
  }

  public setDashAction(
    config: {
      can_dash_underwater?: boolean
      cooldown_time?: number
      direction?: 'entity' | 'passenger'
      horizontal_momentum?: number
      vertical_momentum?: number
    } = {},
  ): void {
    if (typeof config !== 'object' || config === null) {
      throw new Error(
        '[set error]: dash_action: must be an object configuration',
      )
    }
    if (!this.#opt.components) {
      this.#opt.components = {}
    }
    if (
      config.can_dash_underwater !== void 0 &&
      typeof config.can_dash_underwater !== 'boolean'
    ) {
      throw new TypeError(
        '[set error]: dash_action: can_dash_underwater must be a boolean',
      )
    }
    if (config.cooldown_time !== void 0) {
      if (typeof config.cooldown_time !== 'number') {
        throw new TypeError(
          '[set error]: dash_action: cooldown_time must be a number',
        )
      }
      if (config.cooldown_time < 0) {
        throw new TypeError(
          '[set error]: dash_action: cooldown_time must be >= 0',
        )
      }
    }
    if (config.direction !== void 0) {
      if (config.direction !== 'entity' && config.direction !== 'passenger') {
        throw new TypeError(
          "[set error]: dash_action: direction must be 'entity' or 'passenger'",
        )
      }
    }
    if (
      config.horizontal_momentum !== void 0 &&
      typeof config.horizontal_momentum !== 'number'
    ) {
      throw new TypeError(
        '[set error]: dash_action: horizontal_momentum must be a number',
      )
    }
    if (
      config.vertical_momentum !== void 0 &&
      typeof config.vertical_momentum !== 'number'
    ) {
      throw new TypeError(
        '[set error]: dash_action: vertical_momentum must be a number',
      )
    }

    this.#opt.components['minecraft:dash_action'] = config
  }

  public setDefaultLookAngle(
    config: {
      value?: number
    } = {},
  ): void {
    if (typeof config !== 'object' || config === null) {
      throw new Error(
        '[set error]: default_look_angle: must be an object configuration',
      )
    }
    if (!this.#opt.components) {
      this.#opt.components = {}
    }
    if (config.value !== void 0 && typeof config.value !== 'number') {
      throw new TypeError(
        '[set error]: default_look_angle: value must be a number',
      )
    }

    this.#opt.components['minecraft:default_look_angle'] = config
  }

  public setDespawn(
    config: {
      despawn_from_chance?: boolean
      despawn_from_distance?: {
        max_distance?: number
        min_distance?: number
      }
      despawn_from_inactivity?: boolean
      despawn_from_simulation_edge?: boolean
      filters?: any
      min_range_inactivity_timer?: number
      min_range_random_chance?: number
      remove_child_entities?: boolean
    } = {},
  ): void {
    if (typeof config !== 'object' || config === null) {
      throw new Error('[set error]: despawn: must be an object configuration')
    }
    if (!this.#opt.components) {
      this.#opt.components = {}
    }
    const booleanProperties = [
      'despawn_from_chance',
      'despawn_from_inactivity',
      'despawn_from_simulation_edge',
      'remove_child_entities',
    ]
    for (const prop of booleanProperties) {
      if (
        config[prop as keyof typeof config] !== void 0 &&
        typeof config[prop as keyof typeof config] !== 'boolean'
      ) {
        throw new TypeError(`[set error]: despawn: ${prop} must be a boolean`)
      }
    }
    const numberProperties = [
      'min_range_inactivity_timer',
      'min_range_random_chance',
    ]
    for (const prop of numberProperties) {
      if (config[prop as keyof typeof config] !== void 0) {
        if (
          typeof config[prop as keyof typeof config] !== 'number' ||
          !Number.isInteger(config[prop as keyof typeof config])
        ) {
          throw new TypeError(
            `[set error]: despawn: ${prop} must be an integer`,
          )
        }
        if ((config[prop as keyof typeof config] as number) < 0) {
          throw new TypeError(`[set error]: despawn: ${prop} must be >= 0`)
        }
      }
    }
    if (config.despawn_from_distance !== void 0) {
      if (
        typeof config.despawn_from_distance !== 'object' ||
        config.despawn_from_distance === null
      ) {
        throw new TypeError(
          '[set error]: despawn: despawn_from_distance must be an object',
        )
      }
      if (config.despawn_from_distance.max_distance !== void 0) {
        if (
          typeof config.despawn_from_distance.max_distance !== 'number' ||
          !Number.isInteger(config.despawn_from_distance.max_distance)
        ) {
          throw new TypeError(
            '[set error]: despawn: despawn_from_distance.max_distance must be an integer',
          )
        }
        if (config.despawn_from_distance.max_distance < 0) {
          throw new TypeError(
            '[set error]: despawn: despawn_from_distance.max_distance must be >= 0',
          )
        }
      }
      if (config.despawn_from_distance.min_distance !== void 0) {
        if (
          typeof config.despawn_from_distance.min_distance !== 'number' ||
          !Number.isInteger(config.despawn_from_distance.min_distance)
        ) {
          throw new TypeError(
            '[set error]: despawn: despawn_from_distance.min_distance must be an integer',
          )
        }
        if (config.despawn_from_distance.min_distance < 0) {
          throw new TypeError(
            '[set error]: despawn: despawn_from_distance.min_distance must be >= 0',
          )
        }
      }
    }

    this.#opt.components['minecraft:despawn'] = config
  }

  public setDimensionBound(): void {
    if (!this.#opt.components) {
      this.#opt.components = {}
    }

    // minecraft:dimension_bound 是一个空对象组件
    this.#opt.components['minecraft:dimension_bound'] = {}
  }

  public setDryingOutTimer(
    config: {
      dried_out_event?: string | { event: string; target?: string }
      recover_after_dried_out_event?:
        | string
        | { event: string; target?: string }
      stopped_drying_out_event?: string | { event: string; target?: string }
      total_time?: number
      water_bottle_refill_time?: number
    } = {},
  ): void {
    if (typeof config !== 'object' || config === null) {
      throw new Error(
        '[set error]: drying_out_timer: must be an object configuration',
      )
    }
    if (!this.#opt.components) {
      this.#opt.components = {}
    }
    if (config.total_time !== void 0) {
      if (typeof config.total_time !== 'number' || config.total_time < 0) {
        throw new TypeError(
          '[set error]: drying_out_timer: total_time must be a non-negative number',
        )
      }
    }
    if (config.water_bottle_refill_time !== void 0) {
      if (
        typeof config.water_bottle_refill_time !== 'number' ||
        config.water_bottle_refill_time < 0
      ) {
        throw new TypeError(
          '[set error]: drying_out_timer: water_bottle_refill_time must be a non-negative number',
        )
      }
    }
    const validEventTypes = ['string', 'object']

    if (config.dried_out_event !== void 0) {
      if (!validEventTypes.includes(typeof config.dried_out_event)) {
        throw new TypeError(
          '[set error]: drying_out_timer: dried_out_event must be a string or object',
        )
      }
      if (
        typeof config.dried_out_event === 'object' &&
        (config.dried_out_event.event === void 0 ||
          typeof config.dried_out_event.event !== 'string')
      ) {
        throw new TypeError(
          "[set error]: drying_out_timer: dried_out_event object must have an 'event' string property",
        )
      }
    }

    if (config.recover_after_dried_out_event !== void 0) {
      if (
        !validEventTypes.includes(typeof config.recover_after_dried_out_event)
      ) {
        throw new TypeError(
          '[set error]: drying_out_timer: recover_after_dried_out_event must be a string or object',
        )
      }
      if (
        typeof config.recover_after_dried_out_event === 'object' &&
        (config.recover_after_dried_out_event.event === void 0 ||
          typeof config.recover_after_dried_out_event.event !== 'string')
      ) {
        throw new TypeError(
          "[set error]: drying_out_timer: recover_after_dried_out_event object must have an 'event' string property",
        )
      }
    }

    if (config.stopped_drying_out_event !== void 0) {
      if (!validEventTypes.includes(typeof config.stopped_drying_out_event)) {
        throw new TypeError(
          '[set error]: drying_out_timer: stopped_drying_out_event must be a string or object',
        )
      }
      if (
        typeof config.stopped_drying_out_event === 'object' &&
        (config.stopped_drying_out_event.event === void 0 ||
          typeof config.stopped_drying_out_event.event !== 'string')
      ) {
        throw new TypeError(
          "[set error]: drying_out_timer: stopped_drying_out_event object must have an 'event' string property",
        )
      }
    }

    this.#opt.components['minecraft:drying_out_timer'] = config
  }

  public setDweller(
    config: {
      can_find_poi?: boolean
      can_migrate?: boolean
      dweller_role?: string
      dwelling_bounds_tolerance?: number
      dwelling_role?: string
      dwelling_type?: string
      first_founding_reward?: number
      preferred_profession?: string
      update_interval_base?: number
      update_interval_variant?: number
    } = {},
  ): void {
    if (typeof config !== 'object' || config === null) {
      throw new Error('[set error]: dweller: must be an object configuration')
    }
    if (!this.#opt.components) {
      this.#opt.components = {}
    }
    if (
      config.can_find_poi !== void 0 &&
      typeof config.can_find_poi !== 'boolean'
    ) {
      throw new TypeError(
        '[set error]: dweller: can_find_poi must be a boolean',
      )
    }

    if (
      config.can_migrate !== void 0 &&
      typeof config.can_migrate !== 'boolean'
    ) {
      throw new TypeError('[set error]: dweller: can_migrate must be a boolean')
    }
    const numericProperties = [
      'dwelling_bounds_tolerance',
      'first_founding_reward',
      'update_interval_base',
      'update_interval_variant',
    ] as Array<keyof typeof config>

    for (const prop of numericProperties) {
      if (config[prop] !== void 0) {
        if (typeof config[prop] !== 'number' || config[prop] < 0) {
          throw new TypeError(
            `[set error]: dweller: ${prop} must be a non-negative number`,
          )
        }
      }
    }

    this.#opt.components['minecraft:dweller'] = config
  }

  public setEconomyTradeTable(
    config: {
      convert_trades_economy?: boolean
      cured_discount?: number | [number, number]
      display_name?: string
      hero_demand_discount?: number
      max_cured_discount?: number | [number, number]
      max_nearby_cured_discount?: number
      nearby_cured_discount?: number
      new_screen?: boolean
      persist_trades?: boolean
      show_trade_screen?: boolean
      table?: string
      use_legacy_price_formula?: boolean
    } = {},
  ): void {
    if (typeof config !== 'object' || config === null) {
      throw new Error(
        '[set error]: economy_trade_table: must be an object configuration',
      )
    }
    if (!this.#opt.components) {
      this.#opt.components = {}
    }
    const booleanProperties = [
      'convert_trades_economy',
      'new_screen',
      'persist_trades',
      'show_trade_screen',
      'use_legacy_price_formula',
    ] as Array<keyof typeof config>

    for (const prop of booleanProperties) {
      if (config[prop] !== void 0 && typeof config[prop] !== 'boolean') {
        throw new TypeError(
          `[set error]: economy_trade_table: ${prop} must be a boolean`,
        )
      }
    }
    if (config.cured_discount !== void 0) {
      if (Array.isArray(config.cured_discount)) {
        if (
          config.cured_discount.length !== 2 ||
          typeof config.cured_discount[0] !== 'number' ||
          typeof config.cured_discount[1] !== 'number'
        ) {
          throw new TypeError(
            '[set error]: economy_trade_table: cured_discount array must contain exactly 2 numbers',
          )
        }
      } else if (typeof config.cured_discount !== 'number') {
        throw new TypeError(
          '[set error]: economy_trade_table: cured_discount must be a number or array of 2 numbers',
        )
      }
    }
    if (config.max_cured_discount !== void 0) {
      if (Array.isArray(config.max_cured_discount)) {
        if (
          config.max_cured_discount.length !== 2 ||
          typeof config.max_cured_discount[0] !== 'number' ||
          typeof config.max_cured_discount[1] !== 'number'
        ) {
          throw new TypeError(
            '[set error]: economy_trade_table: max_cured_discount array must contain exactly 2 numbers',
          )
        }
      } else if (typeof config.max_cured_discount !== 'number') {
        throw new TypeError(
          '[set error]: economy_trade_table: max_cured_discount must be a number or array of 2 numbers',
        )
      }
    }
    const singleNumericProperties = [
      'hero_demand_discount',
      'max_nearby_cured_discount',
      'nearby_cured_discount',
    ] as Array<keyof typeof config>

    for (const prop of singleNumericProperties) {
      if (config[prop] !== void 0 && typeof config[prop] !== 'number') {
        throw new TypeError(
          `[set error]: economy_trade_table: ${prop} must be a number`,
        )
      }
    }

    this.#opt.components['minecraft:economy_trade_table'] = config
  }

  public setEntityArmorEquipmentSlotMapping(
    config: {
      armor_slot?: string
    } = {},
  ): void {
    if (typeof config !== 'object' || config === null) {
      throw new Error(
        '[set error]: entity_armor_equipment_slot_mapping: must be an object configuration',
      )
    }
    if (!this.#opt.components) {
      this.#opt.components = {}
    }
    if (config.armor_slot !== void 0 && typeof config.armor_slot !== 'string') {
      throw new TypeError(
        '[set error]: entity_armor_equipment_slot_mapping: armor_slot must be a string',
      )
    }

    this.#opt.components['minecraft:entity_armor_equipment_slot_mapping'] =
      config
  }

  public setEntitySensor(
    config: {
      find_players_only?: boolean
      relative_range?: boolean
      subsensors?: Array<{
        cooldown?: number
        event?: string | { event: string; target?: string }
        event_filters?: any
        maximum_count?: number
        minimum_count?: number
        range?: [number, number] | [number, number, number]
        require_all?: boolean
        y_offset?: number
      }>
    } = {},
  ): void {
    if (typeof config !== 'object' || config === null) {
      throw new Error(
        '[set error]: entity_sensor: must be an object configuration',
      )
    }
    if (!this.#opt.components) {
      this.#opt.components = {}
    }
    if (
      config.find_players_only !== void 0 &&
      typeof config.find_players_only !== 'boolean'
    ) {
      throw new TypeError(
        '[set error]: entity_sensor: find_players_only must be a boolean',
      )
    }

    if (
      config.relative_range !== void 0 &&
      typeof config.relative_range !== 'boolean'
    ) {
      throw new TypeError(
        '[set error]: entity_sensor: relative_range must be a boolean',
      )
    }
    if (config.subsensors !== void 0) {
      if (!Array.isArray(config.subsensors)) {
        throw new TypeError(
          '[set error]: entity_sensor: subsensors must be an array',
        )
      }

      for (let i = 0; i < config.subsensors.length; i++) {
        const subsensor = config.subsensors[i]
        if (subsensor && subsensor.event !== void 0) {
          if (
            typeof subsensor.event !== 'string' &&
            (typeof subsensor.event !== 'object' ||
              subsensor.event === null ||
              typeof subsensor.event.event !== 'string')
          ) {
            throw new TypeError(
              `[set error]: entity_sensor: subsensors[${i}].event must be a string or event object`,
            )
          }
        }
        const numericProperties = [
          'cooldown',
          'maximum_count',
          'minimum_count',
          'y_offset',
        ] as const
        for (const prop of numericProperties) {
          if (
            subsensor &&
            subsensor[prop] !== void 0 &&
            typeof subsensor[prop] !== 'number'
          ) {
            throw new TypeError(
              `[set error]: entity_sensor: subsensors[${i}].${prop} must be a number`,
            )
          }
        }
        if (subsensor && subsensor.range !== void 0) {
          if (
            !Array.isArray(subsensor.range) ||
            (subsensor.range.length !== 2 && subsensor.range.length !== 3) ||
            !subsensor.range.every(item => typeof item === 'number')
          ) {
            throw new TypeError(
              `[set error]: entity_sensor: subsensors[${i}].range must be an array of 2 or 3 numbers`,
            )
          }
        }
        if (
          subsensor &&
          subsensor.require_all !== void 0 &&
          typeof subsensor.require_all !== 'boolean'
        ) {
          throw new TypeError(
            `[set error]: entity_sensor: subsensors[${i}].require_all must be a boolean`,
          )
        }
      }
    }

    this.#opt.components['minecraft:entity_sensor'] = config
  }

  public setEnvironmentSensor(
    config: {
      triggers?:
        | {
            event?: string | { event: string; target?: string }
            filters?: any
          }
        | Array<{
            event?: string | { event: string; target?: string }
            filters?: any
          }>
    } = {},
  ): void {
    if (typeof config !== 'object' || config === null) {
      throw new Error(
        '[set error]: environment_sensor: must be an object configuration',
      )
    }
    if (!this.#opt.components) {
      this.#opt.components = {}
    }
    if (config.triggers !== void 0) {
      if (typeof config.triggers !== 'object' || config.triggers === null) {
        throw new TypeError(
          '[set error]: environment_sensor: triggers must be an object or array',
        )
      }

      // 处理数组格式的triggers
      if (Array.isArray(config.triggers)) {
        for (let i = 0; i < config.triggers.length; i++) {
          const trigger = config.triggers[i]
          if (trigger && trigger.event !== void 0) {
            if (
              typeof trigger.event !== 'string' &&
              (typeof trigger.event !== 'object' ||
                trigger.event === null ||
                typeof trigger.event.event !== 'string')
            ) {
              throw new TypeError(
                `[set error]: environment_sensor: triggers[${i}].event must be a string or event object`,
              )
            }
          }
        }
      } else {
        // 处理对象格式的trigger
        if (config.triggers.event !== void 0) {
          const event = config.triggers.event
          if (
            typeof event !== 'string' &&
            (typeof event !== 'object' ||
              event === null ||
              typeof event.event !== 'string')
          ) {
            throw new TypeError(
              '[set error]: environment_sensor: triggers.event must be a string or event object',
            )
          }
        }
      }
    }

    this.#opt.components['minecraft:environment_sensor'] = config
  }

  /**
   * Sets the Equipment table to use for this Entity
   * @param config Equipment configuration
   */
  public setEquipment(
    config: {
      slot_drop_chance?: Array<
        | string
        | {
            drop_chance?: number
            slot?: string
          }
      >
      table?: string
    } = {},
  ): void {
    if (config.slot_drop_chance !== void 0) {
      if (!Array.isArray(config.slot_drop_chance)) {
        throw new TypeError(
          '[set error]: equipment: slot_drop_chance must be an array',
        )
      }
      for (let i = 0; i < config.slot_drop_chance.length; i++) {
        const item = config.slot_drop_chance[i]
        if (
          typeof item !== 'string' &&
          (typeof item !== 'object' ||
            item === null ||
            !('slot' in item) ||
            !('drop_chance' in item))
        ) {
          throw new TypeError(
            `[set error]: equipment: slot_drop_chance[${i}] must be a string or object with slot and drop_chance properties`,
          )
        }
        if (
          typeof item === 'object' &&
          item.drop_chance !== void 0 &&
          (typeof item.drop_chance !== 'number' ||
            item.drop_chance < 0 ||
            item.drop_chance > 1)
        ) {
          throw new TypeError(
            `[set error]: equipment: slot_drop_chance[${i}].drop_chance must be a decimal number between 0.0 and 1.0`,
          )
        }
      }
    }
    if (config.table !== void 0 && typeof config.table !== 'string') {
      throw new TypeError('[set error]: equipment: table must be a string')
    }

    if (!this.#opt.components) {
      this.#opt.components = {}
    }
    this.#opt.components['minecraft:equipment'] = config
  }

  /**
   * Defines an entity's behavior for having items equipped to it
   * @param config Equippable configuration
   */
  public setEquippable(
    config: {
      slots?: Array<{
        accepted_items?: string[]
        interact_text?: string
        item?: string
        on_equip?: any
        on_unequip?: any
        slot?: number
        [key: string]: any
      }>
    } = {},
  ): void {
    if (config.slots !== void 0) {
      if (!Array.isArray(config.slots)) {
        throw new TypeError('[set error]: equippable: slots must be an array')
      }
      for (let i = 0; i < config.slots.length; i++) {
        const slot = config.slots[i]
        if (typeof slot !== 'object' || slot === null) {
          throw new TypeError(
            `[set error]: equippable: slots[${i}] must be an object`,
          )
        }
        if (
          slot.accepted_items !== void 0 &&
          (!Array.isArray(slot.accepted_items) ||
            !slot.accepted_items.every(item => typeof item === 'string'))
        ) {
          throw new TypeError(
            `[set error]: equippable: slots[${i}].accepted_items must be an array of strings`,
          )
        }
        if (
          slot.interact_text !== void 0 &&
          typeof slot.interact_text !== 'string'
        ) {
          throw new TypeError(
            `[set error]: equippable: slots[${i}].interact_text must be a string`,
          )
        }
        if (slot.item !== void 0 && typeof slot.item !== 'string') {
          throw new TypeError(
            `[set error]: equippable: slots[${i}].item must be a string`,
          )
        }
        if (
          slot.slot !== void 0 &&
          (typeof slot.slot !== 'number' || slot.slot < 0)
        ) {
          throw new TypeError(
            `[set error]: equippable: slots[${i}].slot must be a non-negative number`,
          )
        }
      }
    }

    if (!this.#opt.components) {
      this.#opt.components = {}
    }
    this.#opt.components['minecraft:equippable'] = config
  }

  /**
   * The entity puts on the desired equipment
   * @param config Equip Item configuration
   */
  public setEquipItem(
    config: {
      can_wear_armor?: boolean
      excluded_items?: Array<{
        item?: string
        [key: string]: any
      }>
    } = {},
  ): void {
    if (
      config.can_wear_armor !== void 0 &&
      typeof config.can_wear_armor !== 'boolean'
    ) {
      throw new TypeError(
        '[set error]: equip_item: can_wear_armor must be a boolean',
      )
    }
    if (config.excluded_items !== void 0) {
      if (!Array.isArray(config.excluded_items)) {
        throw new TypeError(
          '[set error]: equip_item: excluded_items must be an array',
        )
      }
      for (let i = 0; i < config.excluded_items.length; i++) {
        const excludedItem = config.excluded_items[i]
        if (typeof excludedItem !== 'object' || excludedItem === null) {
          throw new TypeError(
            `[set error]: equip_item: excluded_items[${i}] must be an object`,
          )
        }
        if (
          excludedItem.item !== void 0 &&
          typeof excludedItem.item !== 'string'
        ) {
          throw new TypeError(
            `[set error]: equip_item: excluded_items[${i}].item must be a string`,
          )
        }
      }
    }

    if (!this.#opt.components) {
      this.#opt.components = {}
    }
    if (!this.#opt.components) {
      this.#opt.components = {}
    }
    this.#opt.components['minecraft:equip_item'] = config
  }

  /**
   * Defines how much exhaustion each player action should take
   * @param config Exhaustion values configuration
   */
  public setExhaustionValues(
    config: {
      attack?: number
      damage?: number
      heal?: number
      jump?: number
      lunge?: number
      mine?: number
      sprint?: number
      sprint_jump?: number
      swim?: number
      walk?: number
      [key: string]: any
    } = {},
  ): void {
    const numericProperties = [
      'attack',
      'damage',
      'heal',
      'jump',
      'lunge',
      'mine',
      'sprint',
      'sprint_jump',
      'swim',
      'walk',
    ] as const
    for (const prop of numericProperties) {
      if (
        config[prop] !== void 0 &&
        (typeof config[prop] !== 'number' || config[prop] < 0)
      ) {
        throw new TypeError(
          `[set error]: exhaustion_values: ${prop} must be a non-negative number`,
        )
      }
    }

    if (!this.#opt.components) {
      this.#opt.components = {}
    }
    this.#opt.components['minecraft:exhaustion_values'] = config
  }

  /**
   * Defines experience rewards for entity interactions
   * @param config Experience reward configuration
   */
  public setExperienceReward(
    config: {
      on_bred?:
        | string
        | number
        | {
            expression?: string
            version?: number
          }
      on_death?:
        | string
        | number
        | {
            expression?: string
            version?: number
          }
      [key: string]: any
    } = {},
  ): void {
    if (config.on_bred !== void 0) {
      if (
        typeof config.on_bred === 'string' ||
        typeof config.on_bred === 'number'
      ) {
        // 有效的字符串(Molang)或数字格式
      } else if (
        typeof config.on_bred === 'object' &&
        config.on_bred !== null
      ) {
        if (
          config.on_bred.expression !== void 0 &&
          typeof config.on_bred.expression !== 'string'
        ) {
          throw new TypeError(
            '[set error]: experience_reward: on_bred.expression must be a string',
          )
        }
        if (
          config.on_bred.version !== void 0 &&
          (typeof config.on_bred.version !== 'number' ||
            config.on_bred.version < 0)
        ) {
          throw new TypeError(
            '[set error]: experience_reward: on_bred.version must be a non-negative integer',
          )
        }
      } else {
        throw new TypeError(
          '[set error]: experience_reward: on_bred must be a string, number, or expression object',
        )
      }
    }
    if (config.on_death !== void 0) {
      if (
        typeof config.on_death === 'string' ||
        typeof config.on_death === 'number'
      ) {
        // 有效的字符串(Molang)或数字格式
      } else if (
        typeof config.on_death === 'object' &&
        config.on_death !== null
      ) {
        if (
          config.on_death.expression !== void 0 &&
          typeof config.on_death.expression !== 'string'
        ) {
          throw new TypeError(
            '[set error]: experience_reward: on_death.expression must be a string',
          )
        }
        if (
          config.on_death.version !== void 0 &&
          (typeof config.on_death.version !== 'number' ||
            config.on_death.version < 0)
        ) {
          throw new TypeError(
            '[set error]: experience_reward: on_death.version must be a non-negative integer',
          )
        }
      } else {
        throw new TypeError(
          '[set error]: experience_reward: on_death must be a string, number, or expression object',
        )
      }
    }

    if (!this.#opt.components) {
      this.#opt.components = {}
    }
    this.#opt.components['minecraft:experience_reward'] = config
  }

  /**
   * Defines how the entity explodes
   * @param config Explode configuration
   */
  public setExplode(
    config: {
      add?: {
        component_groups?: string[]
        [key: string]: any
      }
      allow_underwater?: boolean
      breaks_blocks?: boolean
      causes_fire?: boolean
      damage_scaling?: number
      destroy_affected_by_griefing?: boolean
      fire_affected_by_griefing?: boolean
      fuse_length?: number | [number, number]
      fuse_lit?: boolean
      knockback_scaling?: number
      max_resistance?: number
      negates_fall_damage?: boolean
      particle_effect?: string
      power?: number
      sound_effect?: string
      toggles_blocks?: boolean
      [key: string]: any
    } = {},
  ): void {
    if (config.add !== void 0 && typeof config.add !== 'object') {
      throw new TypeError('[set error]: explode: add must be an object')
    }
    if (
      config.add?.component_groups !== void 0 &&
      (!Array.isArray(config.add.component_groups) ||
        !config.add.component_groups.every(item => typeof item === 'string'))
    ) {
      throw new TypeError(
        '[set error]: explode: add.component_groups must be an array of strings',
      )
    }
    const booleanProperties = [
      'allow_underwater',
      'breaks_blocks',
      'causes_fire',
      'destroy_affected_by_griefing',
      'fire_affected_by_griefing',
      'fuse_lit',
      'negates_fall_damage',
      'toggles_blocks',
    ] as const
    for (const prop of booleanProperties) {
      if (config[prop] !== void 0 && typeof config[prop] !== 'boolean') {
        throw new TypeError(`[set error]: explode: ${prop} must be a boolean`)
      }
    }
    const numericProperties = [
      'damage_scaling',
      'knockback_scaling',
      'max_resistance',
      'power',
    ] as const
    for (const prop of numericProperties) {
      if (config[prop] !== void 0 && typeof config[prop] !== 'number') {
        throw new TypeError(`[set error]: explode: ${prop} must be a number`)
      }
    }
    if (config.fuse_length !== void 0) {
      if (typeof config.fuse_length === 'number') {
        // 单个数字值
      } else if (
        Array.isArray(config.fuse_length) &&
        config.fuse_length.length === 2 &&
        typeof config.fuse_length[0] === 'number' &&
        typeof config.fuse_length[1] === 'number'
      ) {
        // 范围数组 [min, max]
      } else {
        throw new TypeError(
          '[set error]: explode: fuse_length must be a number or array of two numbers',
        )
      }
    }
    if (
      config.particle_effect !== void 0 &&
      !['explosion', 'wind_burst', 'breeze_wind_burst'].includes(
        config.particle_effect,
      )
    ) {
      throw new TypeError(
        "[set error]: explode: particle_effect must be 'explosion', 'wind_burst', or 'breeze_wind_burst'",
      )
    }

    if (!this.#opt.components) {
      this.#opt.components = {}
    }
    this.#opt.components['minecraft:explode'] = config
  }

  /**
   * Sets that this entity doesn't take damage from fire
   */
  public setFireImmune(config: {} = {}): void {
    if (!this.#opt.components) {
      this.#opt.components = {}
    }
    this.#opt.components['minecraft:fire_immune'] = config
  }

  /**
   * Sets that this entity can float in liquid blocks
   */
  public setFloatsInLiquid(config: {} = {}): void {
    if (!this.#opt.components) {
      this.#opt.components = {}
    }
    this.#opt.components['minecraft:floats_in_liquid'] = config
  }

  /**
   * Allows entities to flock in groups in water or not
   */
  public setFlocking(
    config: {
      block_distance?: number
      block_weight?: number
      breach_influence?: number
      cohesion_threshold?: number
      cohesion_weight?: number
      goal_weight?: number
      high_flock_limit?: number
      in_water?: boolean
      influence_radius?: number
      innner_cohesion_threshold?: number
      loner_chance?: number
      low_flock_limit?: number
      match_variants?: boolean
      max_height?: number
      min_height?: number
      separation_threshold?: number
      separation_weight?: number
      use_center_of_mass?: boolean
    } = {},
  ): void {
    // Validate numeric parameters
    const validateNumber = (value: any, name: string): void => {
      if (value !== void 0 && typeof value !== 'number') {
        throw new TypeError(`[set error]: flocking: ${name} must be a number`)
      }
    }

    const validateInteger = (value: any, name: string): void => {
      if (
        value !== void 0 &&
        (typeof value !== 'number' || !Number.isInteger(value))
      ) {
        throw new TypeError(`[set error]: flocking: ${name} must be an integer`)
      }
    }

    const validateBoolean = (value: any, name: string): void => {
      if (value !== void 0 && typeof value !== 'boolean') {
        throw new TypeError(`[set error]: flocking: ${name} must be a boolean`)
      }
    }

    // Validate loner_chance is between 0 and 1
    if (config.loner_chance !== void 0) {
      if (
        typeof config.loner_chance !== 'number' ||
        config.loner_chance < 0 ||
        config.loner_chance > 1
      ) {
        throw new TypeError(
          '[set error]: flocking: loner_chance must be a number between 0 and 1',
        )
      }
    }

    // Validate all numeric parameters
    const numericParams = [
      'block_distance',
      'block_weight',
      'breach_influence',
      'cohesion_threshold',
      'cohesion_weight',
      'goal_weight',
      'influence_radius',
      'innner_cohesion_threshold',
      'separation_threshold',
      'separation_weight',
      'max_height',
      'min_height',
    ] as const

    numericParams.forEach(param => {
      if (config[param] !== void 0) {
        validateNumber(config[param], param)
      }
    })

    // Validate integer parameters
    if (config.high_flock_limit !== void 0)
      validateInteger(config.high_flock_limit, 'high_flock_limit')
    if (config.low_flock_limit !== void 0)
      validateInteger(config.low_flock_limit, 'low_flock_limit')

    // Validate boolean parameters
    validateBoolean(config.in_water, 'in_water')
    validateBoolean(config.match_variants, 'match_variants')
    validateBoolean(config.use_center_of_mass, 'use_center_of_mass')

    if (!this.#opt.components) {
      this.#opt.components = {}
    }
    this.#opt.components['minecraft:flocking'] = config
  }

  /**
   * Sets the flying speed in blocks that this entity flies at
   */
  public setFlyingSpeed(
    config: {
      value?: number
    } = {},
  ): void {
    if (config.value !== void 0 && typeof config.value !== 'number') {
      throw new TypeError('[set error]: flying_speed: value must be a number')
    }

    if (!this.#opt.components) {
      this.#opt.components = {}
    }
    this.#opt.components['minecraft:flying_speed'] = config
  }

  /**
   * Defines the maximum range, in blocks, that a mob will pursue a target
   */
  public setFollowRange(
    config: {
      max?: number
      value?: number
    } = {},
  ): void {
    if (
      (config.max !== void 0 && typeof config.max !== 'number') ||
      (config.value !== void 0 && typeof config.value !== 'number')
    ) {
      throw new TypeError(
        '[set error]: follow_range: parameters must be numbers',
      )
    }

    if (!this.#opt.components) {
      this.#opt.components = {}
    }
    this.#opt.components['minecraft:follow_range'] = config
  }

  /**
   * When configured as a rideable entity, the entity will be controlled using WASD controls
   */
  public setFreeCameraControlled(
    config: {
      backwards_movement_modifier?: number
      strafe_speed_modifier?: number
    } = {},
  ): void {
    if (
      (config.backwards_movement_modifier !== void 0 &&
        typeof config.backwards_movement_modifier !== 'number') ||
      (config.strafe_speed_modifier !== void 0 &&
        typeof config.strafe_speed_modifier !== 'number')
    ) {
      throw new TypeError(
        '[set error]: free_camera_controlled: parameters must be numbers',
      )
    }

    if (!this.#opt.components) {
      this.#opt.components = {}
    }
    this.#opt.components['minecraft:free_camera_controlled'] = config
  }

  /**
   * Defines how much friction affects this entity
   */
  public setFrictionModifier(
    config: {
      value?: number
    } = {},
  ): void {
    if (config.value !== void 0 && typeof config.value !== 'number') {
      throw new TypeError(
        '[set error]: friction_modifier: value must be a number',
      )
    }

    if (!this.#opt.components) {
      this.#opt.components = {}
    }
    this.#opt.components['minecraft:friction_modifier'] = config
  }

  /**
   * Allows an entity to emit entityMove, swim and flap game events
   */
  public setGameEventMovementTracking(
    config: {
      emit_flap?: boolean
      emit_move?: boolean
      emit_swim?: boolean
    } = {},
  ): void {
    if (
      (config.emit_flap !== void 0 && typeof config.emit_flap !== 'boolean') ||
      (config.emit_move !== void 0 && typeof config.emit_move !== 'boolean') ||
      (config.emit_swim !== void 0 && typeof config.emit_swim !== 'boolean')
    ) {
      throw new TypeError(
        '[set error]: game_event_movement_tracking: parameters must be booleans',
      )
    }

    if (!this.#opt.components) {
      this.#opt.components = {}
    }
    this.#opt.components['minecraft:game_event_movement_tracking'] = config
  }

  /**
   * Defines the way a mob's genes and alleles are passed on to its offspring
   */
  public setGenetics(
    config: {
      mutation_rate?: number
      genes?: Array<{
        name: string
        use_simplified_breeding?: boolean
        mutation_rate?: number
        allele_range?:
          | number
          | {
              range_min: number
              range_max: number
            }
        genetic_variants?: Array<{
          birth_event?:
            | string
            | {
                event: string
                target?: string
              }
          main_allele?:
            | number
            | {
                range_min: number
                range_max: number
              }
          hidden_allele?:
            | number
            | {
                range_min: number
                range_max: number
              }
          both_allele?:
            | number
            | {
                range_min: number
                range_max: number
              }
          either_allele?:
            | number
            | {
                range_min: number
                range_max: number
              }
        }>
      }>
    } = {},
  ): void {
    // Validate mutation_rate
    if (
      config.mutation_rate !== void 0 &&
      (typeof config.mutation_rate !== 'number' || config.mutation_rate < 0)
    ) {
      throw new TypeError(
        '[set error]: genetics: mutation_rate must be a non-negative number',
      )
    }

    // Validate genes array
    if (config.genes !== void 0) {
      if (!Array.isArray(config.genes)) {
        throw new TypeError('[set error]: genetics: genes must be an array')
      }

      for (let i = 0; i < config.genes.length; i++) {
        const gene = config.genes[i]
        if (!gene) continue // Skip void 0 entries

        // Validate gene name is required
        if (typeof gene.name !== 'string' || gene.name.trim() === '') {
          throw new TypeError(
            `[set error]: genetics: genes[${i}].name is required and must be a non-empty string`,
          )
        }

        // Validate use_simplified_breeding
        if (
          gene.use_simplified_breeding !== void 0 &&
          typeof gene.use_simplified_breeding !== 'boolean'
        ) {
          throw new TypeError(
            `[set error]: genetics: genes[${i}].use_simplified_breeding must be a boolean`,
          )
        }

        // Validate gene mutation_rate
        if (
          gene.mutation_rate !== void 0 &&
          (typeof gene.mutation_rate !== 'number' || gene.mutation_rate < -1)
        ) {
          throw new TypeError(
            `[set error]: genetics: genes[${i}].mutation_rate must be a number >= -1`,
          )
        }

        // Validate allele_range
        if (gene.allele_range !== void 0) {
          if (typeof gene.allele_range === 'number') {
            if (!Number.isInteger(gene.allele_range) || gene.allele_range < 1) {
              throw new TypeError(
                `[set error]: genetics: genes[${i}].allele_range as number must be a positive integer`,
              )
            }
          } else if (
            typeof gene.allele_range === 'object' &&
            gene.allele_range !== null
          ) {
            if (
              typeof gene.allele_range.range_min !== 'number' ||
              typeof gene.allele_range.range_max !== 'number' ||
              !Number.isInteger(gene.allele_range.range_min) ||
              !Number.isInteger(gene.allele_range.range_max) ||
              gene.allele_range.range_min < 1 ||
              gene.allele_range.range_max < gene.allele_range.range_min
            ) {
              throw new TypeError(
                `[set error]: genetics: genes[${i}].allele_range object must have valid range_min and range_max integers`,
              )
            }
          } else {
            throw new TypeError(
              `[set error]: genetics: genes[${i}].allele_range must be a number or object`,
            )
          }
        }

        // Validate genetic_variants array
        if (gene.genetic_variants !== void 0) {
          if (!Array.isArray(gene.genetic_variants)) {
            throw new TypeError(
              `[set error]: genetics: genes[${i}].genetic_variants must be an array`,
            )
          }

          for (let j = 0; j < gene.genetic_variants.length; j++) {
            const variant = gene.genetic_variants[j]
            if (!variant) continue // Skip void 0 entries

            // Validate allele properties
            const validateAllele = (value: any, propName: string): void => {
              if (value !== void 0) {
                if (typeof value === 'number') {
                  if (!Number.isInteger(value) || value < -1) {
                    throw new TypeError(
                      `[set error]: genetics: genes[${i}].genetic_variants[${j}].${propName} must be an integer >= -1`,
                    )
                  }
                } else if (typeof value === 'object' && value !== null) {
                  if (
                    typeof value.range_min !== 'number' ||
                    typeof value.range_max !== 'number' ||
                    !Number.isInteger(value.range_min) ||
                    !Number.isInteger(value.range_max) ||
                    value.range_min < 0 ||
                    value.range_max < value.range_min
                  ) {
                    throw new TypeError(
                      `[set error]: genetics: genes[${i}].genetic_variants[${j}].${propName} object must have valid range_min and range_max integers`,
                    )
                  }
                } else {
                  throw new TypeError(
                    `[set error]: genetics: genes[${i}].genetic_variants[${j}].${propName} must be a number or object`,
                  )
                }
              }
            }

            validateAllele(variant.main_allele, 'main_allele')
            validateAllele(variant.hidden_allele, 'hidden_allele')
            validateAllele(variant.both_allele, 'both_allele')
            validateAllele(variant.either_allele, 'either_allele')

            // Validate birth_event
            if (variant.birth_event !== void 0) {
              if (
                typeof variant.birth_event !== 'string' &&
                (typeof variant.birth_event !== 'object' ||
                  variant.birth_event === null ||
                  typeof variant.birth_event.event !== 'string')
              ) {
                throw new TypeError(
                  `[set error]: genetics: genes[${i}].genetic_variants[${j}].birth_event must be a string or event object`,
                )
              }
            }
          }
        }
      }
    }

    if (!this.#opt.components) {
      this.#opt.components = {}
    }
    this.#opt.components['minecraft:genetics'] = config
  }

  /**
   * Defines sets of items that can be used to trigger events when used on this entity
   */
  public setGiveable(
    config: {
      cooldown?: number
      items?: string | string[]
      on_give?:
        | string
        | {
            event: string
            target?: string
          }
    } = {},
  ): void {
    // Validate cooldown
    if (
      config.cooldown !== void 0 &&
      (typeof config.cooldown !== 'number' || config.cooldown < 0)
    ) {
      throw new TypeError(
        '[set error]: giveable: cooldown must be a non-negative number',
      )
    }

    // Validate items
    if (config.items !== void 0) {
      if (typeof config.items === 'string') {
        // Valid string
      } else if (Array.isArray(config.items)) {
        for (let i = 0; i < config.items.length; i++) {
          if (typeof config.items[i] !== 'string') {
            throw new TypeError(
              `[set error]: giveable: items[${i}] must be a string`,
            )
          }
        }
      } else {
        throw new TypeError(
          '[set error]: giveable: items must be a string or array of strings',
        )
      }
    }

    // Validate on_give
    if (config.on_give !== void 0) {
      if (
        typeof config.on_give !== 'string' &&
        (typeof config.on_give !== 'object' ||
          config.on_give === null ||
          typeof config.on_give.event !== 'string')
      ) {
        throw new TypeError(
          '[set error]: giveable: on_give must be a string or event object',
        )
      }
    }

    if (!this.#opt.components) {
      this.#opt.components = {}
    }
    this.#opt.components['minecraft:giveable'] = config
  }

  /**
   * Sets the offset from the ground that the entity is actually at
   */
  public setGroundOffset(
    config: {
      value?: number
    } = {},
  ): void {
    if (config.value !== void 0 && typeof config.value !== 'number') {
      throw new TypeError('[set error]: ground_offset: value must be a number')
    }

    if (!this.#opt.components) {
      this.#opt.components = {}
    }
    this.#opt.components['minecraft:ground_offset'] = config
  }

  /**
   * Keeps track of entity group size in the given radius
   */
  public setGroupSize(
    config: {
      radius?: number
      filters?: any
    } = {},
  ): void {
    // Validate radius
    if (
      config.radius !== void 0 &&
      (typeof config.radius !== 'number' || config.radius < 0)
    ) {
      throw new TypeError(
        '[set error]: group_size: radius must be a non-negative number',
      )
    }

    // Filters can be any valid Minecraft filter object - minimal validation
    if (
      config.filters !== void 0 &&
      (typeof config.filters !== 'object' || config.filters === null)
    ) {
      throw new TypeError('[set error]: group_size: filters must be an object')
    }

    if (!this.#opt.components) {
      this.#opt.components = {}
    }
    this.#opt.components['minecraft:group_size'] = config
  }

  /**
   * Could increase crop growth when entity walks over crop
   */
  public setGrowsCrop(
    config: {
      chance?: number
      charges?: number
    } = {},
  ): void {
    // Validate chance (0-1)
    if (
      config.chance !== void 0 &&
      (typeof config.chance !== 'number' ||
        config.chance < 0 ||
        config.chance > 1)
    ) {
      throw new TypeError(
        '[set error]: grows_crop: chance must be a number between 0 and 1',
      )
    }

    // Validate charges (must be integer >= 1)
    if (
      config.charges !== void 0 &&
      (typeof config.charges !== 'number' ||
        !Number.isInteger(config.charges) ||
        config.charges < 1)
    ) {
      throw new TypeError(
        '[set error]: grows_crop: charges must be a positive integer',
      )
    }

    if (!this.#opt.components) {
      this.#opt.components = {}
    }
    this.#opt.components['minecraft:grows_crop'] = config
  }

  /**
   * Defines the health pool for an entity, measured in health points (1 point = half a heart)
   */
  public setHealth(
    config: {
      max?: number
      value?:
        | number
        | {
            range_min?: number
            range_max?: number
          }
    } = {},
  ): void {
    if (typeof config !== 'object' || config === null) {
      throw new TypeError(
        '[set error]: health: must be an object configuration',
      )
    }

    // Validate max health (must be integer >= 1)
    if (
      config.max !== void 0 &&
      (typeof config.max !== 'number' ||
        !Number.isInteger(config.max) ||
        config.max < 1)
    ) {
      throw new TypeError('[set error]: health: max must be a positive integer')
    }

    // Validate value as number
    if (config.value !== void 0 && typeof config.value === 'number') {
      if (!Number.isInteger(config.value) || config.value < 0) {
        throw new TypeError(
          '[set error]: health: value as number must be an integer >= 0',
        )
      }
    }
    // Validate value as object
    else if (
      config.value !== void 0 &&
      typeof config.value === 'object' &&
      config.value !== null
    ) {
      if (
        config.value.range_min !== void 0 &&
        (typeof config.value.range_min !== 'number' ||
          !Number.isInteger(config.value.range_min) ||
          config.value.range_min < 0)
      ) {
        throw new TypeError(
          '[set error]: health: value.range_min must be an integer >= 0',
        )
      }
      if (
        config.value.range_max !== void 0 &&
        (typeof config.value.range_max !== 'number' ||
          !Number.isInteger(config.value.range_max) ||
          config.value.range_max < 0)
      ) {
        throw new TypeError(
          '[set error]: health: value.range_max must be an integer >= 0',
        )
      }
      if (
        config.value.range_min !== void 0 &&
        config.value.range_max !== void 0 &&
        config.value.range_max < config.value.range_min
      ) {
        throw new TypeError(
          '[set error]: health: value.range_max must be >= range_min',
        )
      }
    }
    // Validate value is not invalid type
    else if (
      config.value !== void 0 &&
      typeof config.value !== 'number' &&
      (typeof config.value !== 'object' || config.value === null)
    ) {
      throw new TypeError(
        '[set error]: health: value must be a number or range object',
      )
    }

    if (!this.#opt.components) {
      this.#opt.components = {}
    }
    this.#opt.components['minecraft:health'] = config
  }

  /**
   * Defines the entity's heartbeat
   */
  public setHeartbeat(
    config: {
      interval?: string
      sound_event?: string
    } = {},
  ): void {
    if (typeof config !== 'object' || config === null) {
      throw new TypeError(
        '[set error]: heartbeat: must be an object configuration',
      )
    }

    // Validate interval (should be a string, typically a Molang expression)
    if (config.interval !== void 0 && typeof config.interval !== 'string') {
      throw new TypeError(
        '[set error]: heartbeat: interval must be a string (Molang expression)',
      )
    }

    // Validate sound_event (must be string if provided)
    if (
      config.sound_event !== void 0 &&
      typeof config.sound_event !== 'string'
    ) {
      throw new TypeError(
        '[set error]: heartbeat: sound_event must be a string',
      )
    }

    if (!this.#opt.components) {
      this.#opt.components = {}
    }
    this.#opt.components['minecraft:heartbeat'] = config
  }

  /**
   * Moves to and hides at their owned POI or the closest nearby
   */
  public setHide(): void {
    if (!this.#opt.components) {
      this.#opt.components = {}
    }
    this.#opt.components['minecraft:hide'] = {}
  }

  /**
   * Saves a home position for when the entity is spawned
   */
  public setHome(
    config: {
      home_block_list?: string[]
      restriction_radius?: number
      restriction_type?: 'none' | 'random_movement' | 'all_movement'
    } = {},
  ): void {
    if (typeof config !== 'object' || config === null) {
      throw new TypeError('[set error]: home: must be an object configuration')
    }

    // Validate home_block_list (must be array of strings if provided)
    if (config.home_block_list !== void 0) {
      if (!Array.isArray(config.home_block_list)) {
        throw new TypeError(
          '[set error]: home: home_block_list must be an array',
        )
      }
      for (let i = 0; i < config.home_block_list.length; i++) {
        const block = config.home_block_list[i]
        if (typeof block !== 'string' || block.trim() === '') {
          throw new TypeError(
            `[set error]: home: home_block_list[${i}] must be a non-empty string`,
          )
        }
      }
    }

    // Validate restriction_radius (must be integer >= 0)
    if (
      config.restriction_radius !== void 0 &&
      (typeof config.restriction_radius !== 'number' ||
        !Number.isInteger(config.restriction_radius) ||
        config.restriction_radius < 0)
    ) {
      throw new TypeError(
        '[set error]: home: restriction_radius must be an integer >= 0',
      )
    }

    // Validate restriction_type (must be one of the valid values)
    if (
      config.restriction_type !== void 0 &&
      !['none', 'random_movement', 'all_movement'].includes(
        config.restriction_type,
      )
    ) {
      throw new TypeError(
        "[set error]: home: restriction_type must be 'none', 'random_movement', or 'all_movement'",
      )
    }

    if (!this.#opt.components) {
      this.#opt.components = {}
    }
    this.#opt.components['minecraft:home'] = config
  }

  /**
   * Determines the jump height for a horse or similar entity
   */
  public setHorseJumpStrength(
    config: {
      value?:
        | number
        | {
            range_min?: number
            range_max?: number
          }
    } = {},
  ): void {
    if (typeof config !== 'object' || config === null) {
      throw new TypeError(
        '[set error]: horse.jump_strength: must be an object configuration',
      )
    }

    // Validate value as number
    if (config.value !== void 0 && typeof config.value === 'number') {
      if (typeof config.value !== 'number' || config.value < 0) {
        throw new TypeError(
          '[set error]: horse.jump_strength: value as number must be >= 0',
        )
      }
    }
    // Validate value as object
    else if (
      config.value !== void 0 &&
      typeof config.value === 'object' &&
      config.value !== null
    ) {
      if (
        config.value.range_min !== void 0 &&
        (typeof config.value.range_min !== 'number' ||
          config.value.range_min < 0)
      ) {
        throw new TypeError(
          '[set error]: horse.jump_strength: value.range_min must be >= 0',
        )
      }
      if (
        config.value.range_max !== void 0 &&
        (typeof config.value.range_max !== 'number' ||
          config.value.range_max < 0)
      ) {
        throw new TypeError(
          '[set error]: horse.jump_strength: value.range_max must be >= 0',
        )
      }
      if (
        config.value.range_min !== void 0 &&
        config.value.range_max !== void 0 &&
        config.value.range_max < config.value.range_min
      ) {
        throw new TypeError(
          '[set error]: horse.jump_strength: value.range_max must be >= range_min',
        )
      }
    }
    // Validate value is not invalid type
    else if (
      config.value !== void 0 &&
      typeof config.value !== 'number' &&
      (typeof config.value !== 'object' || config.value === null)
    ) {
      throw new TypeError(
        '[set error]: horse.jump_strength: value must be a number or range object',
      )
    }

    if (!this.#opt.components) {
      this.#opt.components = {}
    }
    this.#opt.components['minecraft:horse.jump_strength'] = config
  }

  /**
   * Defines a set of conditions under which an entity should take damage
   */
  public setHurtOnCondition(
    config: {
      damage_conditions?: Array<{
        cause?: string
        damage_per_tick?: number
        filters?: {
          subject?: string
          test?: string
          value?: any
          operator?: string
          [key: string]: any
        }
      }>
    } = {},
  ): void {
    if (typeof config !== 'object' || config === null) {
      throw new TypeError(
        '[set error]: hurt_on_condition: must be an object configuration',
      )
    }

    // Validate damage_conditions array
    if (config.damage_conditions !== void 0) {
      if (!Array.isArray(config.damage_conditions)) {
        throw new TypeError(
          '[set error]: hurt_on_condition: damage_conditions must be an array',
        )
      }

      for (let i = 0; i < config.damage_conditions.length; i++) {
        const condition = config.damage_conditions[i]
        if (!condition) continue // Skip void 0 entries

        // Validate cause (must be string if provided)
        if (condition.cause !== void 0 && typeof condition.cause !== 'string') {
          throw new TypeError(
            `[set error]: hurt_on_condition: damage_conditions[${i}].cause must be a string`,
          )
        }

        // Validate damage_per_tick (must be integer >= 0 if provided)
        if (
          condition.damage_per_tick !== void 0 &&
          (typeof condition.damage_per_tick !== 'number' ||
            !Number.isInteger(condition.damage_per_tick) ||
            condition.damage_per_tick < 0)
        ) {
          throw new TypeError(
            `[set error]: hurt_on_condition: damage_conditions[${i}].damage_per_tick must be an integer >= 0`,
          )
        }

        // Validate filters (must be object if provided)
        if (
          condition.filters !== void 0 &&
          (typeof condition.filters !== 'object' || condition.filters === null)
        ) {
          throw new TypeError(
            `[set error]: hurt_on_condition: damage_conditions[${i}].filters must be an object`,
          )
        }
      }
    }

    if (!this.#opt.components) {
      this.#opt.components = {}
    }
    this.#opt.components['minecraft:hurt_on_condition'] = config
  }

  /**
   * Prevents entities from attacking the owner entity unless explicitly allowed
   */
  public setIgnoreCannotBeAttacked(
    config: {
      filters?: {
        subject?: string
        test?: string
        value?: any
        operator?: string
        [key: string]: any
      }
    } = {},
  ): void {
    if (typeof config !== 'object' || config === null) {
      throw new TypeError(
        '[set error]: ignore_cannot_be_attacked: must be an object configuration',
      )
    }

    // Validate filters (must be object if provided)
    if (
      config.filters !== void 0 &&
      (typeof config.filters !== 'object' || config.filters === null)
    ) {
      throw new TypeError(
        '[set error]: ignore_cannot_be_attacked: filters must be an object',
      )
    }

    // Validate subject in filters (must be string if provided)
    if (
      config.filters?.subject !== void 0 &&
      typeof config.filters.subject !== 'string'
    ) {
      throw new TypeError(
        '[set error]: ignore_cannot_be_attacked: filters.subject must be a string',
      )
    }

    // Validate test in filters (must be string if provided)
    if (
      config.filters?.test !== void 0 &&
      typeof config.filters.test !== 'string'
    ) {
      throw new TypeError(
        '[set error]: ignore_cannot_be_attacked: filters.test must be a string',
      )
    }

    // Validate operator in filters (must be string if provided)
    if (
      config.filters?.operator !== void 0 &&
      typeof config.filters.operator !== 'string'
    ) {
      throw new TypeError(
        '[set error]: ignore_cannot_be_attacked: filters.operator must be a string',
      )
    }

    if (!this.#opt.components) {
      this.#opt.components = {}
    }
    this.#opt.components['minecraft:ignore_cannot_be_attacked'] = config
  }

  /**
   * Applies WASD controls for rideable entities in air (3D movement control)
   */
  public setInputAirControlled(config: Record<string, any> = {}): void {
    if (typeof config !== 'object' || config === null) {
      throw new TypeError(
        '[set error]: input_air_controlled: must be an object configuration',
      )
    }

    if (!this.#opt.components) {
      this.#opt.components = {}
    }
    this.#opt.components['minecraft:input_air_controlled'] = config
  }

  /**
   * Applies WASD controls for rideable entities on ground
   */
  public setInputGroundControlled(): void {
    if (!this.#opt.components) {
      this.#opt.components = {}
    }
    this.#opt.components['minecraft:input_ground_controlled'] = {}
  }

  /**
   * Monitors when the entity enters or exits specific blocks and triggers events
   */
  public setInsideBlockNotifier(
    config: {
      block_list?: Array<{
        block?: {
          name?: string
          states?: {
            [key: string]: string | number | boolean
          }
        }
        entered_block_event?: {
          event?: string
          target?: string
        }
        exited_block_event?: {
          event?: string
          target?: string
        }
      }>
    } = {},
  ): void {
    if (typeof config !== 'object' || config === null) {
      throw new TypeError(
        '[set error]: inside_block_notifier: must be an object configuration',
      )
    }

    // Validate block_list array
    if (config.block_list !== void 0) {
      if (!Array.isArray(config.block_list)) {
        throw new TypeError(
          '[set error]: inside_block_notifier: block_list must be an array',
        )
      }

      for (let i = 0; i < config.block_list.length; i++) {
        const blockEntry = config.block_list[i]
        if (!blockEntry) continue // Skip void 0 entries

        // Validate block object (must be object if provided)
        if (
          blockEntry.block !== void 0 &&
          (typeof blockEntry.block !== 'object' || blockEntry.block === null)
        ) {
          throw new TypeError(
            `[set error]: inside_block_notifier: block_list[${i}].block must be an object`,
          )
        }

        // Validate block name (must be string if provided)
        if (
          blockEntry.block?.name !== void 0 &&
          typeof blockEntry.block.name !== 'string'
        ) {
          throw new TypeError(
            `[set error]: inside_block_notifier: block_list[${i}].block.name must be a string`,
          )
        }

        // Validate block states (must be object if provided)
        if (
          blockEntry.block?.states !== void 0 &&
          (typeof blockEntry.block.states !== 'object' ||
            blockEntry.block.states === null)
        ) {
          throw new TypeError(
            `[set error]: inside_block_notifier: block_list[${i}].block.states must be an object`,
          )
        }

        // Validate entered_block_event (must be object if provided)
        if (
          blockEntry.entered_block_event !== void 0 &&
          (typeof blockEntry.entered_block_event !== 'object' ||
            blockEntry.entered_block_event === null)
        ) {
          throw new TypeError(
            `[set error]: inside_block_notifier: block_list[${i}].entered_block_event must be an object`,
          )
        }

        // Validate entered_block_event event property (must be string if provided)
        if (
          blockEntry.entered_block_event?.event !== void 0 &&
          typeof blockEntry.entered_block_event.event !== 'string'
        ) {
          throw new TypeError(
            `[set error]: inside_block_notifier: block_list[${i}].entered_block_event.event must be a string`,
          )
        }

        // Validate entered_block_event target property (must be string if provided)
        if (
          blockEntry.entered_block_event?.target !== void 0 &&
          typeof blockEntry.entered_block_event.target !== 'string'
        ) {
          throw new TypeError(
            `[set error]: inside_block_notifier: block_list[${i}].entered_block_event.target must be a string`,
          )
        }

        // Validate exited_block_event (must be object if provided)
        if (
          blockEntry.exited_block_event !== void 0 &&
          (typeof blockEntry.exited_block_event !== 'object' ||
            blockEntry.exited_block_event === null)
        ) {
          throw new TypeError(
            `[set error]: inside_block_notifier: block_list[${i}].exited_block_event must be an object`,
          )
        }

        // Validate exited_block_event event property (must be string if provided)
        if (
          blockEntry.exited_block_event?.event !== void 0 &&
          typeof blockEntry.exited_block_event.event !== 'string'
        ) {
          throw new TypeError(
            `[set error]: inside_block_notifier: block_list[${i}].exited_block_event.event must be a string`,
          )
        }

        // Validate exited_block_event target property (must be string if provided)
        if (
          blockEntry.exited_block_event?.target !== void 0 &&
          typeof blockEntry.exited_block_event.target !== 'string'
        ) {
          throw new TypeError(
            `[set error]: inside_block_notifier: block_list[${i}].exited_block_event.target must be a string`,
          )
        }
      }
    }

    if (!this.#opt.components) {
      this.#opt.components = {}
    }
    this.#opt.components['minecraft:inside_block_notifier'] = config
  }

  /**
   * Adds a timer since last rested to see if phantoms should spawn
   */
  public setInsomnia(
    config: {
      days_until_insomnia?: number // Number of days the mob has to stay up until the insomnia effect begins
    } = {},
  ): void {
    if (typeof config !== 'object' || config === null) {
      throw new TypeError(
        '[set error]: insomnia: must be an object configuration',
      )
    }

    // Validate days_until_insomnia (must be number >= 0 if provided)
    if (
      config.days_until_insomnia !== void 0 &&
      (typeof config.days_until_insomnia !== 'number' ||
        config.days_until_insomnia < 0)
    ) {
      throw new TypeError(
        '[set error]: insomnia: days_until_insomnia must be a number >= 0',
      )
    }

    if (!this.#opt.components) {
      this.#opt.components = {}
    }
    this.#opt.components['minecraft:insomnia'] = config
  }

  /**
   * Despawns the Actor immediately
   */
  public setInstantDespawn(
    config: {
      remove_child_entities?: boolean // If true, all entities linked to this entity in a child relationship will also be despawned
    } = {},
  ): void {
    if (typeof config !== 'object' || config === null) {
      throw new TypeError(
        '[set error]: instant_despawn: must be an object configuration',
      )
    }

    // Validate remove_child_entities (must be boolean if provided)
    if (
      config.remove_child_entities !== void 0 &&
      typeof config.remove_child_entities !== 'boolean'
    ) {
      throw new TypeError(
        '[set error]: instant_despawn: remove_child_entities must be a boolean',
      )
    }

    if (!this.#opt.components) {
      this.#opt.components = {}
    }
    this.#opt.components['minecraft:instant_despawn'] = config
  }

  /**
   * Defines interactions with this entity
   */
  public setInteract(
    config: {
      cooldown?: number
      cooldown_after_being_attacked?: number
      drop_item_slot?: string | number
      drop_item_y_offset?: number
      equip_item_slot?: string | number
      health_amount?: number
      hurt_item?: number
      interact_text?: string
      interactions?: Array<{
        give_item?: boolean
        hurt_item?: number
        interact_text?: string
        on_interact?:
          | string
          | {
              filters?: {
                subject?: string
                test?: string
                value?: any
                operator?: string
                [key: string]: any
              }
            }
        particle_on_start?: Array<{
          particle_offset_towards_interactor?: boolean
          particle_type?: string
          particle_y_offset?: number
        }>
        play_sounds?: string
        repair_entity_item?: Array<{
          amount?: number
          slot?: string | number
        }>
        spawn_entities?: string
        spawn_items?: Array<{
          table?: string
          y_offset?: number
        }>
        swing?: boolean
        take_item?: boolean
        transform_to_item?: string
        use_item?: boolean
        vibration?:
          | 'none'
          | 'shear'
          | 'entity_die'
          | 'entity_act'
          | 'entity_interact'
      }>
    } = {},
  ): void {
    if (typeof config !== 'object' || config === null) {
      throw new TypeError(
        '[set error]: interact: must be an object configuration',
      )
    }

    // Validate cooldown (must be number >= 0 if provided)
    if (
      config.cooldown !== void 0 &&
      (typeof config.cooldown !== 'number' || config.cooldown < 0)
    ) {
      throw new TypeError(
        '[set error]: interact: cooldown must be a number >= 0',
      )
    }

    // Validate cooldown_after_being_attacked (must be number >= 0 if provided)
    if (
      config.cooldown_after_being_attacked !== void 0 &&
      (typeof config.cooldown_after_being_attacked !== 'number' ||
        config.cooldown_after_being_attacked < 0)
    ) {
      throw new TypeError(
        '[set error]: interact: cooldown_after_being_attacked must be a number >= 0',
      )
    }

    // Validate drop_item_y_offset (must be number if provided)
    if (
      config.drop_item_y_offset !== void 0 &&
      typeof config.drop_item_y_offset !== 'number'
    ) {
      throw new TypeError(
        '[set error]: interact: drop_item_y_offset must be a number',
      )
    }

    // Validate health_amount (must be number if provided)
    if (
      config.health_amount !== void 0 &&
      typeof config.health_amount !== 'number'
    ) {
      throw new TypeError(
        '[set error]: interact: health_amount must be a number',
      )
    }

    // Validate hurt_item (must be integer >= 0 if provided)
    if (
      config.hurt_item !== void 0 &&
      (typeof config.hurt_item !== 'number' ||
        !Number.isInteger(config.hurt_item) ||
        config.hurt_item < 0)
    ) {
      throw new TypeError(
        '[set error]: interact: hurt_item must be an integer >= 0',
      )
    }

    // Validate interact_text (must be string if provided)
    if (
      config.interact_text !== void 0 &&
      typeof config.interact_text !== 'string'
    ) {
      throw new TypeError(
        '[set error]: interact: interact_text must be a string',
      )
    }

    // Validate interactions array
    if (config.interactions !== void 0) {
      if (!Array.isArray(config.interactions)) {
        throw new TypeError(
          '[set error]: interact: interactions must be an array',
        )
      }

      for (let i = 0; i < config.interactions.length; i++) {
        const interaction = config.interactions[i]
        if (!interaction) continue // Skip void 0 entries

        // Validate give_item (must be boolean if provided)
        if (
          interaction.give_item !== void 0 &&
          typeof interaction.give_item !== 'boolean'
        ) {
          throw new TypeError(
            `[set error]: interact: interactions[${i}].give_item must be a boolean`,
          )
        }

        // Validate hurt_item (must be number if provided)
        if (
          interaction.hurt_item !== void 0 &&
          typeof interaction.hurt_item !== 'number'
        ) {
          throw new TypeError(
            `[set error]: interact: interactions[${i}].hurt_item must be a number`,
          )
        }

        // Validate interact_text (must be string if provided)
        if (
          interaction.interact_text !== void 0 &&
          typeof interaction.interact_text !== 'string'
        ) {
          throw new TypeError(
            `[set error]: interact: interactions[${i}].interact_text must be a string`,
          )
        }

        // Validate on_interact (must be string or object if provided)
        if (
          interaction.on_interact !== void 0 &&
          typeof interaction.on_interact !== 'string' &&
          (typeof interaction.on_interact !== 'object' ||
            interaction.on_interact === null)
        ) {
          throw new TypeError(
            `[set error]: interact: interactions[${i}].on_interact must be a string or object`,
          )
        }

        // Validate particle_on_start array
        if (interaction.particle_on_start !== void 0) {
          if (!Array.isArray(interaction.particle_on_start)) {
            throw new TypeError(
              `[set error]: interact: interactions[${i}].particle_on_start must be an array`,
            )
          }

          for (let j = 0; j < interaction.particle_on_start.length; j++) {
            const particle = interaction.particle_on_start[j]
            if (!particle) continue

            // Validate particle_offset_towards_interactor (boolean if provided)
            if (
              particle.particle_offset_towards_interactor !== void 0 &&
              typeof particle.particle_offset_towards_interactor !== 'boolean'
            ) {
              throw new TypeError(
                `[set error]: interact: interactions[${i}].particle_on_start[${j}].particle_offset_towards_interactor must be a boolean`,
              )
            }

            // Validate particle_type (string if provided)
            if (
              particle.particle_type !== void 0 &&
              typeof particle.particle_type !== 'string'
            ) {
              throw new TypeError(
                `[set error]: interact: interactions[${i}].particle_on_start[${j}].particle_type must be a string`,
              )
            }

            // Validate particle_y_offset (number if provided)
            if (
              particle.particle_y_offset !== void 0 &&
              typeof particle.particle_y_offset !== 'number'
            ) {
              throw new TypeError(
                `[set error]: interact: interactions[${i}].particle_on_start[${j}].particle_y_offset must be a number`,
              )
            }
          }
        }

        // Validate play_sounds (string if provided)
        if (
          interaction.play_sounds !== void 0 &&
          typeof interaction.play_sounds !== 'string'
        ) {
          throw new TypeError(
            `[set error]: interact: interactions[${i}].play_sounds must be a string`,
          )
        }

        // Validate repair_entity_item array
        if (interaction.repair_entity_item !== void 0) {
          if (!Array.isArray(interaction.repair_entity_item)) {
            throw new TypeError(
              `[set error]: interact: interactions[${i}].repair_entity_item must be an array`,
            )
          }

          for (let j = 0; j < interaction.repair_entity_item.length; j++) {
            const repair = interaction.repair_entity_item[j]
            if (!repair) continue

            // Validate amount (integer if provided)
            if (
              repair.amount !== void 0 &&
              (typeof repair.amount !== 'number' ||
                !Number.isInteger(repair.amount))
            ) {
              throw new TypeError(
                `[set error]: interact: interactions[${i}].repair_entity_item[${j}].amount must be an integer`,
              )
            }
          }
        }

        // Validate spawn_entities (string if provided)
        if (
          interaction.spawn_entities !== void 0 &&
          typeof interaction.spawn_entities !== 'string'
        ) {
          throw new TypeError(
            `[set error]: interact: interactions[${i}].spawn_entities must be a string`,
          )
        }

        // Validate spawn_items array
        if (interaction.spawn_items !== void 0) {
          if (!Array.isArray(interaction.spawn_items)) {
            throw new TypeError(
              `[set error]: interact: interactions[${i}].spawn_items must be an array`,
            )
          }

          for (let j = 0; j < interaction.spawn_items.length; j++) {
            const spawn = interaction.spawn_items[j]
            if (!spawn) continue

            // Validate table (string if provided)
            if (spawn.table !== void 0 && typeof spawn.table !== 'string') {
              throw new TypeError(
                `[set error]: interact: interactions[${i}].spawn_items[${j}].table must be a string`,
              )
            }

            // Validate y_offset (number if provided)
            if (
              spawn.y_offset !== void 0 &&
              typeof spawn.y_offset !== 'number'
            ) {
              throw new TypeError(
                `[set error]: interact: interactions[${i}].spawn_items[${j}].y_offset must be a number`,
              )
            }
          }
        }

        // Validate swing (boolean if provided)
        if (
          interaction.swing !== void 0 &&
          typeof interaction.swing !== 'boolean'
        ) {
          throw new TypeError(
            `[set error]: interact: interactions[${i}].swing must be a boolean`,
          )
        }

        // Validate take_item (boolean if provided)
        if (
          interaction.take_item !== void 0 &&
          typeof interaction.take_item !== 'boolean'
        ) {
          throw new TypeError(
            `[set error]: interact: interactions[${i}].take_item must be a boolean`,
          )
        }

        // Validate transform_to_item (string if provided)
        if (
          interaction.transform_to_item !== void 0 &&
          typeof interaction.transform_to_item !== 'string'
        ) {
          throw new TypeError(
            `[set error]: interact: interactions[${i}].transform_to_item must be a string`,
          )
        }

        // Validate use_item (boolean if provided)
        if (
          interaction.use_item !== void 0 &&
          typeof interaction.use_item !== 'boolean'
        ) {
          throw new TypeError(
            `[set error]: interact: interactions[${i}].use_item must be a boolean`,
          )
        }

        // Validate vibration (must be valid value if provided)
        if (
          interaction.vibration !== void 0 &&
          ![
            'none',
            'shear',
            'entity_die',
            'entity_act',
            'entity_interact',
          ].includes(interaction.vibration)
        ) {
          throw new TypeError(
            `[set error]: interact: interactions[${i}].vibration must be one of: 'none', 'shear', 'entity_die', 'entity_act', 'entity_interact'`,
          )
        }
      }
    }

    if (!this.#opt.components) {
      this.#opt.components = {}
    }
    this.#opt.components['minecraft:interact'] = config
  }

  public setInventory(
    config: {
      additional_slots_per_strength?: number
      can_be_siphoned_from?: boolean
      container_type?: string
      inventory_size?: number
      private?: boolean
      restrict_to_owner?: boolean
    } = {},
  ): void {
    if (typeof config !== 'object' || config === null) {
      throw new TypeError(
        '[set error]: inventory: must be an object configuration',
      )
    }

    // Validate additional_slots_per_strength (number if provided)
    if (
      config.additional_slots_per_strength !== void 0 &&
      typeof config.additional_slots_per_strength !== 'number'
    ) {
      throw new TypeError(
        '[set error]: inventory: additional_slots_per_strength must be a number',
      )
    }

    // Validate can_be_siphoned_from (boolean if provided)
    if (
      config.can_be_siphoned_from !== void 0 &&
      typeof config.can_be_siphoned_from !== 'boolean'
    ) {
      throw new TypeError(
        '[set error]: inventory: can_be_siphoned_from must be a boolean',
      )
    }

    // Validate container_type (string if provided)
    if (
      config.container_type !== void 0 &&
      typeof config.container_type !== 'string'
    ) {
      throw new TypeError(
        '[set error]: inventory: container_type must be a string',
      )
    }

    // Validate inventory_size (number if provided)
    if (
      config.inventory_size !== void 0 &&
      typeof config.inventory_size !== 'number'
    ) {
      throw new TypeError(
        '[set error]: inventory: inventory_size must be a number',
      )
    }

    // Validate private (boolean if provided)
    if (config.private !== void 0 && typeof config.private !== 'boolean') {
      throw new TypeError('[set error]: inventory: private must be a boolean')
    }

    // Validate restrict_to_owner (boolean if provided)
    if (
      config.restrict_to_owner !== void 0 &&
      typeof config.restrict_to_owner !== 'boolean'
    ) {
      throw new TypeError(
        '[set error]: inventory: restrict_to_owner must be a boolean',
      )
    }

    if (!this.#opt.components) {
      this.#opt.components = {}
    }
    this.#opt.components['minecraft:inventory'] = config
  }

  public setIsBaby(): void {
    if (!this.#opt.components) {
      this.#opt.components = {}
    }
    this.#opt.components['minecraft:is_baby'] = {}
  }

  public setIsCharged(): void {
    if (!this.#opt.components) {
      this.#opt.components = {}
    }
    this.#opt.components['minecraft:is_charged'] = {}
  }

  public setIsChested(): void {
    if (!this.#opt.components) {
      this.#opt.components = {}
    }
    this.#opt.components['minecraft:is_chested'] = {}
  }

  public setIsDyeable(
    config: {
      interact_text?: string
    } = {},
  ): void {
    if (typeof config !== 'object' || config === null) {
      throw new TypeError(
        '[set error]: is_dyeable: must be an object configuration',
      )
    }

    // Validate interact_text (string if provided)
    if (
      config.interact_text !== void 0 &&
      typeof config.interact_text !== 'string'
    ) {
      throw new TypeError(
        '[set error]: is_dyeable: interact_text must be a string',
      )
    }

    if (!this.#opt.components) {
      this.#opt.components = {}
    }
    this.#opt.components['minecraft:is_dyeable'] = config
  }

  public setIsIgnited(): void {
    if (!this.#opt.components) {
      this.#opt.components = {}
    }
    this.#opt.components['minecraft:is_ignited'] = {}
  }

  public setIsPregnant(): void {
    if (!this.#opt.components) {
      this.#opt.components = {}
    }
    this.#opt.components['minecraft:is_pregnant'] = {}
  }

  public setItemControllable(
    config: {
      control_items?: string | string[]
    } = {},
  ): void {
    if (typeof config !== 'object' || config === null) {
      throw new TypeError(
        '[set error]: item_controllable: must be an object configuration',
      )
    }

    // Validate control_items (string or string array if provided)
    if (config.control_items !== void 0) {
      if (
        typeof config.control_items !== 'string' &&
        (!Array.isArray(config.control_items) ||
          config.control_items.some((item: any) => typeof item !== 'string'))
      ) {
        throw new TypeError(
          '[set error]: item_controllable: control_items must be a string or array of strings',
        )
      }
    }

    if (!this.#opt.components) {
      this.#opt.components = {}
    }
    this.#opt.components['minecraft:item_controllable'] = config
  }

  /**
   * Makes the entity leashable with customized spring behavior
   */
  public setLeashable(
    config: {
      can_be_cut?: boolean
      can_be_stolen?: boolean
      hard_distance?: number
      max_distance?: number
      on_leash?: string | { event: string; target?: string }
      on_unleash?: string | { event: string; target?: string }
      soft_distance?: number
      presets?: Array<{
        filter?: {
          subject?: string
          test?: string
          value?: any
          operator?: string
          [key: string]: any
        }
        spring_type?: 'bouncy' | 'dampened' | 'quad_dampened'
      }>
    } = {},
  ): void {
    if (typeof config !== 'object' || config === null) {
      throw new TypeError(
        '[set error]: leashable: must be an object configuration',
      )
    }

    // Validate boolean values
    if (
      config.can_be_cut !== void 0 &&
      typeof config.can_be_cut !== 'boolean'
    ) {
      throw new TypeError('[set error]: leashable: can_be_cut must be boolean')
    }
    if (
      config.can_be_stolen !== void 0 &&
      typeof config.can_be_stolen !== 'boolean'
    ) {
      throw new TypeError(
        '[set error]: leashable: can_be_stolen must be boolean',
      )
    }

    // Validate number values
    if (
      config.hard_distance !== void 0 &&
      typeof config.hard_distance !== 'number'
    ) {
      throw new TypeError(
        '[set error]: leashable: hard_distance must be a number',
      )
    }
    if (
      config.max_distance !== void 0 &&
      typeof config.max_distance !== 'number'
    ) {
      throw new TypeError(
        '[set error]: leashable: max_distance must be a number',
      )
    }
    if (
      config.soft_distance !== void 0 &&
      typeof config.soft_distance !== 'number'
    ) {
      throw new TypeError(
        '[set error]: leashable: soft_distance must be a number',
      )
    }

    // Validate event handlers
    if (config.on_leash !== void 0) {
      if (
        typeof config.on_leash !== 'string' &&
        (typeof config.on_leash !== 'object' ||
          config.on_leash === null ||
          !('event' in config.on_leash))
      ) {
        throw new TypeError(
          '[set error]: leashable: on_leash must be string or object with event property',
        )
      }
    }
    if (config.on_unleash !== void 0) {
      if (
        typeof config.on_unleash !== 'string' &&
        (typeof config.on_unleash !== 'object' ||
          config.on_unleash === null ||
          !('event' in config.on_unleash))
      ) {
        throw new TypeError(
          '[set error]: leashable: on_unleash must be string or object with event property',
        )
      }
    }

    // Validate presets array
    if (config.presets !== void 0) {
      if (!Array.isArray(config.presets)) {
        throw new TypeError('[set error]: leashable: presets must be an array')
      }

      for (const preset of config.presets) {
        if (typeof preset !== 'object' || preset === null) {
          throw new TypeError(
            '[set error]: leashable: presets must contain objects',
          )
        }

        if (
          preset.spring_type !== void 0 &&
          !['bouncy', 'dampened', 'quad_dampened'].includes(preset.spring_type)
        ) {
          throw new TypeError(
            "[set error]: leashable: spring_type must be one of 'bouncy', 'dampened', or 'quad_dampened'",
          )
        }
      }
    }

    if (!this.#opt.components) {
      this.#opt.components = {}
    }
    this.#opt.components['minecraft:leashable'] = config
  }

  /**
   * Allows entities to be leashed to this entity with retrieval option
   */
  public setLeashableTo(
    config: {
      can_retrieve_from?: boolean
    } = {},
  ): void {
    if (typeof config !== 'object' || config === null) {
      throw new TypeError(
        '[set error]: leashable_to: must be an object configuration',
      )
    }

    // Validate can_retrieve_from
    if (
      config.can_retrieve_from !== void 0 &&
      typeof config.can_retrieve_from !== 'boolean'
    ) {
      throw new TypeError(
        '[set error]: leashable_to: can_retrieve_from must be boolean',
      )
    }

    if (!this.#opt.components) {
      this.#opt.components = {}
    }
    this.#opt.components['minecraft:leashable_to'] = config
  }

  /**
   * Defines behavior when entities look at the owner entity
   */
  public setLookedAt(
    config: {
      field_of_view?: number
      filters?: {
        subject?: string
        test?: string
        value?: any
        operator?: string
        [key: string]: any
      }
      find_players_only?: boolean
      line_of_sight_obstruction_type?:
        | 'outline'
        | 'collision'
        | 'collision_for_camera'
      look_at_locations?: string[]
      looked_at_cooldown?: { min: number; max: number }
      looked_at_event?: string | { event: string; target?: string }
      min_looked_at_duration?: number
      not_looked_at_event?: string | { event: string; target?: string }
      scale_fov_by_distance?: boolean
      search_radius?: number
      set_target?:
        | boolean
        | 'never'
        | 'once_and_stop_scanning'
        | 'once_and_keep_scanning'
    } = {},
  ): void {
    if (typeof config !== 'object' || config === null) {
      throw new TypeError(
        '[set error]: looked_at: must be an object configuration',
      )
    }

    // Validate field_of_view
    if (
      config.field_of_view !== void 0 &&
      typeof config.field_of_view !== 'number'
    ) {
      throw new TypeError(
        '[set error]: looked_at: field_of_view must be a number',
      )
    }

    // Validate find_players_only
    if (
      config.find_players_only !== void 0 &&
      typeof config.find_players_only !== 'boolean'
    ) {
      throw new TypeError(
        '[set error]: looked_at: find_players_only must be boolean',
      )
    }

    // Validate line_of_sight_obstruction_type
    if (
      config.line_of_sight_obstruction_type !== void 0 &&
      !['outline', 'collision', 'collision_for_camera'].includes(
        config.line_of_sight_obstruction_type,
      )
    ) {
      throw new TypeError(
        "[set error]: looked_at: line_of_sight_obstruction_type must be 'outline', 'collision', or 'collision_for_camera'",
      )
    }

    // Validate look_at_locations
    if (config.look_at_locations !== void 0) {
      if (
        !Array.isArray(config.look_at_locations) ||
        config.look_at_locations.some((loc: any) => typeof loc !== 'string')
      ) {
        throw new TypeError(
          '[set error]: looked_at: look_at_locations must be an array of strings',
        )
      }
    }

    // Validate looked_at_cooldown
    if (config.looked_at_cooldown !== void 0) {
      if (
        typeof config.looked_at_cooldown !== 'object' ||
        config.looked_at_cooldown === null ||
        typeof config.looked_at_cooldown.min !== 'number' ||
        typeof config.looked_at_cooldown.max !== 'number'
      ) {
        throw new TypeError(
          '[set error]: looked_at: looked_at_cooldown must be an object with min and max numbers',
        )
      }
    }

    // Validate looked_at_event
    if (config.looked_at_event !== void 0) {
      if (
        typeof config.looked_at_event !== 'string' &&
        (typeof config.looked_at_event !== 'object' ||
          config.looked_at_event === null ||
          !('event' in config.looked_at_event))
      ) {
        throw new TypeError(
          '[set error]: looked_at: looked_at_event must be string or object with event property',
        )
      }
    }

    // Validate min_looked_at_duration
    if (
      config.min_looked_at_duration !== void 0 &&
      typeof config.min_looked_at_duration !== 'number'
    ) {
      throw new TypeError(
        '[set error]: looked_at: min_looked_at_duration must be a number',
      )
    }

    // Validate not_looked_at_event
    if (config.not_looked_at_event !== void 0) {
      if (
        typeof config.not_looked_at_event !== 'string' &&
        (typeof config.not_looked_at_event !== 'object' ||
          config.not_looked_at_event === null ||
          !('event' in config.not_looked_at_event))
      ) {
        throw new TypeError(
          '[set error]: looked_at: not_looked_at_event must be string or object with event property',
        )
      }
    }

    // Validate scale_fov_by_distance
    if (
      config.scale_fov_by_distance !== void 0 &&
      typeof config.scale_fov_by_distance !== 'boolean'
    ) {
      throw new TypeError(
        '[set error]: looked_at: scale_fov_by_distance must be boolean',
      )
    }

    // Validate search_radius
    if (
      config.search_radius !== void 0 &&
      typeof config.search_radius !== 'number'
    ) {
      throw new TypeError(
        '[set error]: looked_at: search_radius must be a number',
      )
    }

    // Validate set_target
    if (config.set_target !== void 0) {
      if (
        typeof config.set_target !== 'boolean' &&
        config.set_target !== 'never' &&
        config.set_target !== 'once_and_stop_scanning' &&
        config.set_target !== 'once_and_keep_scanning'
      ) {
        throw new TypeError(
          "[set error]: looked_at: set_target must be boolean, 'never', 'once_and_stop_scanning', or 'once_and_keep_scanning'",
        )
      }
    }

    if (!this.#opt.components) {
      this.#opt.components = {}
    }
    this.#opt.components['minecraft:looked_at'] = config
  }

  /**
   * Sets the loot table for the entity
   */
  public setLoot(config: { table: string }): void {
    if (typeof config !== 'object' || config === null) {
      throw new TypeError('[set error]: loot: must be an object configuration')
    }

    // Validate required table property
    if (typeof config.table !== 'string' || config.table.trim() === '') {
      throw new TypeError('[set error]: loot: table must be a non-empty string')
    }

    if (!this.#opt.components) {
      this.#opt.components = {}
    }
    this.#opt.components['minecraft:loot'] = config
  }

  /**
   * Enables wandering trader management for the entity
   */
  public setManagedWanderingTrader(): void {
    if (!this.#opt.components) {
      this.#opt.components = {}
    }
    this.#opt.components['minecraft:managed_wandering_trader'] = {}
  }

  /**
   * Sets the mark variant for the entity (visual differentiation)
   */
  public setMarkVariant(value: number): void {
    if (typeof value !== 'number' || !Number.isInteger(value) || value < 0) {
      throw new TypeError(
        '[set error]: mark_variant: value must be a non-negative integer',
      )
    }

    if (!this.#opt.components) {
      this.#opt.components = {}
    }
    this.#opt.components['minecraft:mark_variant'] = { value }
  }

  /**
   * Applies a mob effect to entities within range
   */
  public setMobEffect(config: {
    ambient?: boolean
    cooldown_time?: number
    effect_range?: number
    effect_time?: number | 'infinite'
    entity_filter?: {
      subject?: string
      test?: string
      value?: any
      operator?: string
      [key: string]: any
    }
    mob_effect: string
  }): void {
    if (typeof config !== 'object' || config === null) {
      throw new TypeError(
        '[set error]: mob_effect: must be an object configuration',
      )
    }

    // Validate required mob_effect property
    if (
      typeof config.mob_effect !== 'string' ||
      config.mob_effect.trim() === ''
    ) {
      throw new TypeError(
        '[set error]: mob_effect: mob_effect must be a non-empty string',
      )
    }

    // Validate ambient
    if (config.ambient !== void 0 && typeof config.ambient !== 'boolean') {
      throw new TypeError('[set error]: mob_effect: ambient must be boolean')
    }

    // Validate cooldown_time
    if (config.cooldown_time !== void 0) {
      if (
        typeof config.cooldown_time !== 'number' ||
        config.cooldown_time < 0
      ) {
        throw new TypeError(
          '[set error]: mob_effect: cooldown_time must be a non-negative number',
        )
      }
    }

    // Validate effect_range
    if (config.effect_range !== void 0) {
      if (typeof config.effect_range !== 'number' || config.effect_range <= 0) {
        throw new TypeError(
          '[set error]: mob_effect: effect_range must be a positive number',
        )
      }
    }

    // Validate effect_time
    if (config.effect_time !== void 0) {
      if (config.effect_time === 'infinite') {
        // Valid case
      } else if (
        typeof config.effect_time !== 'number' ||
        config.effect_time <= 0
      ) {
        throw new TypeError(
          "[set error]: mob_effect: effect_time must be 'infinite' or a positive number",
        )
      }
    }

    // Validate entity_filter (if provided)
    if (config.entity_filter !== void 0) {
      if (
        typeof config.entity_filter !== 'object' ||
        config.entity_filter === null
      ) {
        throw new TypeError(
          '[set error]: mob_effect: entity_filter must be an object',
        )
      }
    }

    if (!this.#opt.components) {
      this.#opt.components = {}
    }
    this.#opt.components['minecraft:mob_effect'] = config
  }

  /**
   * Sets mob effect immunity for the entity
   */
  public setMobEffectImmunity(mob_effects: string[]): void {
    if (!Array.isArray(mob_effects)) {
      throw new TypeError(
        '[set error]: mob_effect_immunity: mob_effects must be an array',
      )
    }

    // Validate each mob effect name
    for (const effect of mob_effects) {
      if (typeof effect !== 'string' || effect.trim() === '') {
        throw new TypeError(
          '[set error]: mob_effect_immunity: each mob effect must be a non-empty string',
        )
      }
    }

    if (!this.#opt.components) {
      this.#opt.components = {}
    }
    this.#opt.components['minecraft:mob_effect_immunity'] = { mob_effects }
  }

  public setItemHopper(): void {
    if (!this.#opt.components) {
      this.#opt.components = {}
    }
    this.#opt.components['minecraft:item_hopper'] = {}
  }

  /**
   * Sets the base movement speed for the entity
   */
  public setMovement(
    config: {
      max?: number
      value?: number | { range_min: number; range_max: number }
    } = {},
  ): void {
    if (typeof config !== 'object' || config === null) {
      throw new TypeError(
        '[set error]: movement: must be an object configuration',
      )
    }

    // Validate max
    if (
      config.max !== void 0 &&
      (typeof config.max !== 'number' || config.max <= 0)
    ) {
      throw new TypeError(
        '[set error]: movement: max must be a positive number',
      )
    }

    // Validate value
    if (config.value !== void 0) {
      if (typeof config.value === 'number') {
        if (config.value <= 0) {
          throw new TypeError(
            '[set error]: movement: value must be a positive number when provided as number',
          )
        }
      } else if (typeof config.value === 'object' && config.value !== null) {
        if (
          typeof config.value.range_min !== 'number' ||
          config.value.range_min < 0
        ) {
          throw new TypeError(
            '[set error]: movement: value.range_min must be a non-negative number',
          )
        }
        if (
          typeof config.value.range_max !== 'number' ||
          config.value.range_max <= 0
        ) {
          throw new TypeError(
            '[set error]: movement: value.range_max must be a positive number',
          )
        }
        if (config.value.range_min >= config.value.range_max) {
          throw new TypeError(
            '[set error]: movement: value.range_min must be less than value.range_max',
          )
        }
      } else {
        throw new TypeError(
          '[set error]: movement: value must be a number or object with range_min and range_max',
        )
      }
    }

    if (!this.#opt.components) {
      this.#opt.components = {}
    }
    this.#opt.components['minecraft:movement'] = config
  }

  /**
   * Sets amphibious movement control (swim in water and walk on land)
   */
  public setMovementAmphibious(max_turn?: number): void {
    const config: any = {}

    if (max_turn !== void 0) {
      if (typeof max_turn !== 'number' || max_turn <= 0) {
        throw new TypeError(
          '[set error]: movement.amphibious: max_turn must be a positive number',
        )
      }
      config.max_turn = max_turn
    }

    if (!this.#opt.components) {
      this.#opt.components = {}
    }
    this.#opt.components['minecraft:movement.amphibious'] = config
  }

  /**
   * Sets basic movement control
   */
  public setMovementBasic(max_turn?: number): void {
    const config: any = {}

    if (max_turn !== void 0) {
      if (typeof max_turn !== 'number' || max_turn <= 0) {
        throw new TypeError(
          '[set error]: movement.basic: max_turn must be a positive number',
        )
      }
      config.max_turn = max_turn
    }

    if (!this.#opt.components) {
      this.#opt.components = {}
    }
    this.#opt.components['minecraft:movement.basic'] = config
  }

  /**
   * Note: This component is not currently being used in game
   */
  public setMovementDolphin(): void {
    if (!this.#opt.components) {
      this.#opt.components = {}
    }
    this.#opt.components['minecraft:movement.dolphin'] = {}
  }

  /**
   * Sets fly movement control
   */
  public setMovementFly(
    config: {
      max_turn?: number
      speed_when_turning?: number
      start_speed?: number
    } = {},
  ): void {
    if (typeof config !== 'object' || config === null) {
      throw new TypeError(
        '[set error]: movement.fly: must be an object configuration',
      )
    }

    // Validate max_turn
    if (
      config.max_turn !== void 0 &&
      (typeof config.max_turn !== 'number' || config.max_turn <= 0)
    ) {
      throw new TypeError(
        '[set error]: movement.fly: max_turn must be a positive number',
      )
    }

    // Validate speed_when_turning
    if (
      config.speed_when_turning !== void 0 &&
      (typeof config.speed_when_turning !== 'number' ||
        config.speed_when_turning <= 0)
    ) {
      throw new TypeError(
        '[set error]: movement.fly: speed_when_turning must be a positive number',
      )
    }

    // Validate start_speed
    if (
      config.start_speed !== void 0 &&
      (typeof config.start_speed !== 'number' || config.start_speed <= 0)
    ) {
      throw new TypeError(
        '[set error]: movement.fly: start_speed must be a positive number',
      )
    }

    if (!this.#opt.components) {
      this.#opt.components = {}
    }
    this.#opt.components['minecraft:movement.fly'] = config
  }

  /**
   * Sets generic movement control (fly, swim, climb, etc.)
   */
  public setMovementGeneric(max_turn?: number): void {
    const config: any = {}

    if (max_turn !== void 0) {
      if (typeof max_turn !== 'number' || max_turn <= 0) {
        throw new TypeError(
          '[set error]: movement.generic: max_turn must be a positive number',
        )
      }
      config.max_turn = max_turn
    }

    if (!this.#opt.components) {
      this.#opt.components = {}
    }
    this.#opt.components['minecraft:movement.generic'] = config
  }

  /**
   * Sets glide movement control
   */
  public setMovementGlide(
    config: {
      max_turn?: number
      speed_when_turning?: number
    } = {},
  ): void {
    if (typeof config !== 'object' || config === null) {
      throw new TypeError(
        '[set error]: movement.glide: must be an object configuration',
      )
    }

    // Validate max_turn
    if (
      config.max_turn !== void 0 &&
      (typeof config.max_turn !== 'number' || config.max_turn <= 0)
    ) {
      throw new TypeError(
        '[set error]: movement.glide: max_turn must be a positive number',
      )
    }

    // Validate speed_when_turning
    if (
      config.speed_when_turning !== void 0 &&
      (typeof config.speed_when_turning !== 'number' ||
        config.speed_when_turning <= 0)
    ) {
      throw new TypeError(
        '[set error]: movement.glide: speed_when_turning must be a positive number',
      )
    }

    if (!this.#opt.components) {
      this.#opt.components = {}
    }
    this.#opt.components['minecraft:movement.glide'] = config
  }

  /**
   * Sets hover movement control
   */
  public setMovementHover(max_turn?: number): void {
    const config: any = {}

    if (max_turn !== void 0) {
      if (typeof max_turn !== 'number' || max_turn <= 0) {
        throw new TypeError(
          '[set error]: movement.hover: max_turn must be a positive number',
        )
      }
      config.max_turn = max_turn
    }

    if (!this.#opt.components) {
      this.#opt.components = {}
    }
    this.#opt.components['minecraft:movement.hover'] = config
  }

  /**
   * Sets jump movement control (requires minecraft:behavior.slime_attack for target following)
   */
  public setMovementJump(
    config: {
      jump_delay?:
        | number
        | [number, number]
        | { range_min: number; range_max: number }
      max_turn?: number
    } = {},
  ): void {
    if (typeof config !== 'object' || config === null) {
      throw new TypeError(
        '[set error]: movement.jump: must be an object configuration',
      )
    }

    // Validate jump_delay
    if (config.jump_delay !== void 0) {
      if (typeof config.jump_delay === 'number') {
        if (config.jump_delay < 0) {
          throw new TypeError(
            '[set error]: movement.jump: jump_delay must be a non-negative number when provided as number',
          )
        }
      } else if (
        Array.isArray(config.jump_delay) &&
        config.jump_delay.length === 2
      ) {
        if (
          typeof config.jump_delay[0] !== 'number' ||
          config.jump_delay[0] < 0
        ) {
          throw new TypeError(
            '[set error]: movement.jump: jump_delay[0] must be a non-negative number',
          )
        }
        if (
          typeof config.jump_delay[1] !== 'number' ||
          config.jump_delay[1] <= 0
        ) {
          throw new TypeError(
            '[set error]: movement.jump: jump_delay[1] must be a positive number',
          )
        }
        if (config.jump_delay[0] >= config.jump_delay[1]) {
          throw new TypeError(
            '[set error]: movement.jump: jump_delay[0] must be less than jump_delay[1]',
          )
        }
      } else if (
        typeof config.jump_delay === 'object' &&
        config.jump_delay !== null &&
        'range_min' in config.jump_delay
      ) {
        const jumpDelay = config.jump_delay as {
          range_min?: number
          range_max?: number
        }
        if (
          typeof jumpDelay.range_min !== 'number' ||
          jumpDelay.range_min < 0
        ) {
          throw new TypeError(
            '[set error]: movement.jump: jump_delay.range_min must be a non-negative number',
          )
        }
        if (
          typeof jumpDelay.range_max !== 'number' ||
          jumpDelay.range_max <= 0
        ) {
          throw new TypeError(
            '[set error]: movement.jump: jump_delay.range_max must be a positive number',
          )
        }
        if (jumpDelay.range_min >= jumpDelay.range_max) {
          throw new TypeError(
            '[set error]: movement.jump: jump_delay.range_min must be less than jump_delay.range_max',
          )
        }
      } else {
        throw new TypeError(
          '[set error]: movement.jump: jump_delay must be number, array [min, max], or object with range_min and range_max',
        )
      }
    }

    // Validate max_turn
    if (
      config.max_turn !== void 0 &&
      (typeof config.max_turn !== 'number' || config.max_turn <= 0)
    ) {
      throw new TypeError(
        '[set error]: movement.jump: max_turn must be a positive number',
      )
    }

    if (!this.#opt.components) {
      this.#opt.components = {}
    }
    this.#opt.components['minecraft:movement.jump'] = config
  }

  /**
   * Sets skip movement control
   */
  public setMovementSkip(max_turn?: number): void {
    const config: any = {}

    if (max_turn !== void 0) {
      if (typeof max_turn !== 'number' || max_turn <= 0) {
        throw new TypeError(
          '[set error]: movement.skip: max_turn must be a positive number',
        )
      }
      config.max_turn = max_turn
    }

    if (!this.#opt.components) {
      this.#opt.components = {}
    }
    this.#opt.components['minecraft:movement.skip'] = config
  }

  /**
   * Sets movement sound distance offset
   */
  public setMovementSoundDistanceOffset(value?: number): void {
    const config: any = {}

    if (value !== void 0) {
      if (typeof value !== 'number' || value <= 0) {
        throw new TypeError(
          '[set error]: movement.sound_distance_offset: value must be a positive number',
        )
      }
      config.value = value
    }

    if (!this.#opt.components) {
      this.#opt.components = {}
    }
    this.#opt.components['minecraft:movement.sound_distance_offset'] = config
  }

  /**
   * Sets sway movement control
   */
  public setMovementSway(
    config: {
      max_turn?: number
      sway_amplitude?: number
      sway_frequency?: number
    } = {},
  ): void {
    if (typeof config !== 'object' || config === null) {
      throw new TypeError(
        '[set error]: movement.sway: must be an object configuration',
      )
    }

    // Validate max_turn
    if (
      config.max_turn !== void 0 &&
      (typeof config.max_turn !== 'number' || config.max_turn <= 0)
    ) {
      throw new TypeError(
        '[set error]: movement.sway: max_turn must be a positive number',
      )
    }

    // Validate sway_amplitude
    if (
      config.sway_amplitude !== void 0 &&
      (typeof config.sway_amplitude !== 'number' || config.sway_amplitude <= 0)
    ) {
      throw new TypeError(
        '[set error]: movement.sway: sway_amplitude must be a positive number',
      )
    }

    // Validate sway_frequency
    if (
      config.sway_frequency !== void 0 &&
      (typeof config.sway_frequency !== 'number' || config.sway_frequency <= 0)
    ) {
      throw new TypeError(
        '[set error]: movement.sway: sway_frequency must be a positive number',
      )
    }

    if (!this.#opt.components) {
      this.#opt.components = {}
    }
    this.#opt.components['minecraft:movement.sway'] = config
  }

  /**
   * Makes the entity nameable with customization options
   */
  public setNameable(
    config: {
      allow_name_tag_renaming?: boolean
      always_show?: boolean
      default_trigger?: string
      name_actions?: Array<{
        name_filter?: string[]
        on_named?: string | { event: string; target?: string }
      }>
    } = {},
  ): void {
    if (typeof config !== 'object' || config === null) {
      throw new TypeError(
        '[set error]: nameable: must be an object configuration',
      )
    }

    // Validate allow_name_tag_renaming
    if (
      config.allow_name_tag_renaming !== void 0 &&
      typeof config.allow_name_tag_renaming !== 'boolean'
    ) {
      throw new TypeError(
        '[set error]: nameable: allow_name_tag_renaming must be boolean',
      )
    }

    // Validate always_show
    if (
      config.always_show !== void 0 &&
      typeof config.always_show !== 'boolean'
    ) {
      throw new TypeError('[set error]: nameable: always_show must be boolean')
    }

    // Validate default_trigger
    if (
      config.default_trigger !== void 0 &&
      (typeof config.default_trigger !== 'string' ||
        config.default_trigger.trim() === '')
    ) {
      throw new TypeError(
        '[set error]: nameable: default_trigger must be a non-empty string',
      )
    }

    // Validate name_actions
    if (config.name_actions !== void 0) {
      if (!Array.isArray(config.name_actions)) {
        throw new TypeError(
          '[set error]: nameable: name_actions must be an array',
        )
      }

      for (const action of config.name_actions) {
        if (typeof action !== 'object' || action === null) {
          throw new TypeError(
            '[set error]: nameable: each name_action must be an object',
          )
        }

        // Validate name_filter
        if (action.name_filter !== void 0) {
          if (!Array.isArray(action.name_filter)) {
            throw new TypeError(
              '[set error]: nameable: name_action.name_filter must be an array',
            )
          }
          for (const filter of action.name_filter) {
            if (typeof filter !== 'string' || filter.trim() === '') {
              throw new TypeError(
                '[set error]: nameable: each name_filter item must be a non-empty string',
              )
            }
          }
        }

        // Validate on_named
        if (action.on_named !== void 0) {
          if (
            typeof action.on_named !== 'string' &&
            (typeof action.on_named !== 'object' ||
              action.on_named === null ||
              !('event' in action.on_named))
          ) {
            throw new TypeError(
              '[set error]: nameable: name_action.on_named must be string or object with event property',
            )
          }
        }
      }
    }

    if (!this.#opt.components) {
      this.#opt.components = {}
    }
    this.#opt.components['minecraft:nameable'] = config
  }

  /**
   * Sets climb navigation for the entity (like vanilla spiders)
   */
  public setNavigationClimb(
    config: {
      avoid_damage_blocks?: boolean
      avoid_portals?: boolean
      avoid_sun?: boolean
      avoid_water?: boolean
      blocks_to_avoid?: string[]
      can_breach?: boolean
      can_break_doors?: boolean
      can_jump?: boolean
      can_open_doors?: boolean
      can_open_iron_doors?: boolean
      can_pass_doors?: boolean
      can_path_from_air?: boolean
      can_path_over_lava?: boolean
      can_path_over_water?: boolean
      can_sink?: boolean
      can_swim?: boolean
      can_walk?: boolean
      can_walk_in_lava?: boolean
      is_amphibious?: boolean
    } = {},
  ): void {
    if (typeof config !== 'object' || config === null) {
      throw new TypeError(
        '[set error]: navigation.climb: must be an object configuration',
      )
    }

    // Validate boolean properties
    const booleanProps = [
      'avoid_damage_blocks',
      'avoid_portals',
      'avoid_sun',
      'avoid_water',
      'can_breach',
      'can_break_doors',
      'can_jump',
      'can_open_doors',
      'can_open_iron_doors',
      'can_pass_doors',
      'can_path_from_air',
      'can_path_over_lava',
      'can_path_over_water',
      'can_sink',
      'can_swim',
      'can_walk',
      'can_walk_in_lava',
      'is_amphibious',
    ]

    for (const prop of booleanProps) {
      if (
        config[prop as keyof typeof config] !== void 0 &&
        typeof config[prop as keyof typeof config] !== 'boolean'
      ) {
        throw new TypeError(
          `[set error]: navigation.climb: ${prop} must be boolean`,
        )
      }
    }

    // Validate blocks_to_avoid
    if (config.blocks_to_avoid !== void 0) {
      if (!Array.isArray(config.blocks_to_avoid)) {
        throw new TypeError(
          '[set error]: navigation.climb: blocks_to_avoid must be an array',
        )
      }
      for (const block of config.blocks_to_avoid) {
        if (typeof block !== 'string' || block.trim() === '') {
          throw new TypeError(
            '[set error]: navigation.climb: each block in blocks_to_avoid must be a non-empty string',
          )
        }
      }
    }

    if (!this.#opt.components) {
      this.#opt.components = {}
    }
    this.#opt.components['minecraft:navigation.climb'] = config
  }

  /**
   * Sets float navigation for the entity
   */
  public setNavigationFloat(config: {
    avoid_damage_blocks?: boolean
    avoid_portals?: boolean
    avoid_sun?: boolean
    avoid_water?: boolean
    blocks_to_avoid?: string[]
    can_breach?: boolean
    can_break_doors?: boolean
    can_jump?: boolean
    can_open_doors?: boolean
    can_open_iron_doors?: boolean
    can_pass_doors?: boolean
    can_path_from_air?: boolean
    can_path_over_water?: boolean
    can_sink?: boolean
    can_swim?: boolean
    can_walk?: boolean
    can_walk_in_lava?: boolean
    is_amphibious?: boolean
    using_door_annotation?: boolean
  }) {
    if (typeof config !== 'object' || config === null) {
      throw new TypeError(
        '[set error]: navigation.float: must be an object configuration',
      )
    }

    // Validate boolean properties
    const booleanProps = [
      'avoid_damage_blocks',
      'avoid_portals',
      'avoid_sun',
      'avoid_water',
      'can_breach',
      'can_break_doors',
      'can_jump',
      'can_open_doors',
      'can_open_iron_doors',
      'can_pass_doors',
      'can_path_from_air',
      'can_path_over_water',
      'can_sink',
      'can_swim',
      'can_walk',
      'can_walk_in_lava',
      'is_amphibious',
      'using_door_annotation',
    ]

    for (const prop of booleanProps) {
      if (
        config[prop as keyof typeof config] !== void 0 &&
        typeof config[prop as keyof typeof config] !== 'boolean'
      ) {
        throw new TypeError(
          `[set error]: navigation.float: ${prop} must be boolean`,
        )
      }
    }

    // Validate blocks_to_avoid
    if (config.blocks_to_avoid !== void 0) {
      if (!Array.isArray(config.blocks_to_avoid)) {
        throw new TypeError(
          '[set error]: navigation.float: blocks_to_avoid must be an array',
        )
      }
      for (const block of config.blocks_to_avoid) {
        if (typeof block !== 'string' || block.trim() === '') {
          throw new TypeError(
            '[set error]: navigation.float: each block in blocks_to_avoid must be a non-empty string',
          )
        }
      }
    }

    if (!this.#opt.components) {
      this.#opt.components = {}
    }
    this.#opt.components['minecraft:navigation.float'] = config
  }

  /**
   * Sets fly navigation for the entity
   */
  public setNavigationFly(config: {
    avoid_damage_blocks?: boolean
    avoid_portals?: boolean
    avoid_sun?: boolean
    avoid_water?: boolean
    blocks_to_avoid?: string[]
    can_breach?: boolean
    can_break_doors?: boolean
    can_jump?: boolean
    can_open_doors?: boolean
    can_open_iron_doors?: boolean
    can_pass_doors?: boolean
    can_path_from_air?: boolean
    can_path_over_water?: boolean
    can_sink?: boolean
    can_swim?: boolean
    can_walk?: boolean
    can_walk_in_lava?: boolean
    is_amphibious?: boolean
    using_door_annotation?: boolean
  }) {
    if (typeof config !== 'object' || config === null) {
      throw new TypeError(
        '[set error]: navigation.fly: must be an object configuration',
      )
    }

    // Validate boolean properties
    const booleanProps = [
      'avoid_damage_blocks',
      'avoid_portals',
      'avoid_sun',
      'avoid_water',
      'can_breach',
      'can_break_doors',
      'can_jump',
      'can_open_doors',
      'can_open_iron_doors',
      'can_pass_doors',
      'can_path_from_air',
      'can_path_over_water',
      'can_sink',
      'can_swim',
      'can_walk',
      'can_walk_in_lava',
      'is_amphibious',
      'using_door_annotation',
    ]

    for (const prop of booleanProps) {
      if (
        config[prop as keyof typeof config] !== void 0 &&
        typeof config[prop as keyof typeof config] !== 'boolean'
      ) {
        throw new TypeError(
          `[set error]: navigation.fly: ${prop} must be boolean`,
        )
      }
    }

    // Validate blocks_to_avoid
    if (config.blocks_to_avoid !== void 0) {
      if (!Array.isArray(config.blocks_to_avoid)) {
        throw new TypeError(
          '[set error]: navigation.fly: blocks_to_avoid must be an array',
        )
      }
      for (const block of config.blocks_to_avoid) {
        if (typeof block !== 'string' || block.trim() === '') {
          throw new TypeError(
            '[set error]: navigation.fly: each block in blocks_to_avoid must be a non-empty string',
          )
        }
      }
    }

    if (!this.#opt.components) {
      this.#opt.components = {}
    }
    this.#opt.components['minecraft:navigation.fly'] = config
  }

  /**
   * Sets generic navigation for the entity
   */
  public setNavigationGeneric(config: {
    avoid_damage_blocks?: boolean
    avoid_portals?: boolean
    avoid_sun?: boolean
    avoid_water?: boolean
    blocks_to_avoid?: string[]
    can_breach?: boolean
    can_break_doors?: boolean
    can_jump?: boolean
    can_open_doors?: boolean
    can_open_iron_doors?: boolean
    can_pass_doors?: boolean
    can_path_from_air?: boolean
    can_path_over_water?: boolean
    can_sink?: boolean
    can_swim?: boolean
    can_walk?: boolean
    can_walk_in_lava?: boolean
    is_amphibious?: boolean
    using_door_annotation?: boolean
  }) {
    if (typeof config !== 'object' || config === null) {
      throw new TypeError(
        '[set error]: navigation.generic: must be an object configuration',
      )
    }

    // Validate boolean properties
    const booleanProps = [
      'avoid_damage_blocks',
      'avoid_portals',
      'avoid_sun',
      'avoid_water',
      'can_breach',
      'can_break_doors',
      'can_jump',
      'can_open_doors',
      'can_open_iron_doors',
      'can_pass_doors',
      'can_path_from_air',
      'can_path_over_water',
      'can_sink',
      'can_swim',
      'can_walk',
      'can_walk_in_lava',
      'is_amphibious',
      'using_door_annotation',
    ]

    for (const prop of booleanProps) {
      if (
        config[prop as keyof typeof config] !== void 0 &&
        typeof config[prop as keyof typeof config] !== 'boolean'
      ) {
        throw new TypeError(
          `[set error]: navigation.generic: ${prop} must be boolean`,
        )
      }
    }

    // Validate blocks_to_avoid
    if (config.blocks_to_avoid !== void 0) {
      if (!Array.isArray(config.blocks_to_avoid)) {
        throw new TypeError(
          '[set error]: navigation.generic: blocks_to_avoid must be an array',
        )
      }
      for (const block of config.blocks_to_avoid) {
        if (typeof block !== 'string' || block.trim() === '') {
          throw new TypeError(
            '[set error]: navigation.generic: each block in blocks_to_avoid must be a non-empty string',
          )
        }
      }
    }

    if (!this.#opt.components) {
      this.#opt.components = {}
    }
    this.#opt.components['minecraft:navigation.generic'] = config
  }

  /**
   * Sets hover navigation for the entity
   */
  public setNavigationHover(config: {
    avoid_damage_blocks?: boolean
    avoid_portals?: boolean
    avoid_sun?: boolean
    avoid_water?: boolean
    blocks_to_avoid?: string[]
    can_breach?: boolean
    can_break_doors?: boolean
    can_jump?: boolean
    can_open_doors?: boolean
    can_open_iron_doors?: boolean
    can_pass_doors?: boolean
    can_path_from_air?: boolean
    can_path_over_water?: boolean
    can_sink?: boolean
    can_swim?: boolean
    can_walk?: boolean
    can_walk_in_lava?: boolean
    is_amphibious?: boolean
    using_door_annotation?: boolean
  }) {
    if (typeof config !== 'object' || config === null) {
      throw new TypeError(
        '[set error]: navigation.hover: must be an object configuration',
      )
    }

    // Validate boolean properties
    const booleanProps = [
      'avoid_damage_blocks',
      'avoid_portals',
      'avoid_sun',
      'avoid_water',
      'can_breach',
      'can_break_doors',
      'can_jump',
      'can_open_doors',
      'can_open_iron_doors',
      'can_pass_doors',
      'can_path_from_air',
      'can_path_over_water',
      'can_sink',
      'can_swim',
      'can_walk',
      'can_walk_in_lava',
      'is_amphibious',
      'using_door_annotation',
    ]

    for (const prop of booleanProps) {
      if (
        config[prop as keyof typeof config] !== void 0 &&
        typeof config[prop as keyof typeof config] !== 'boolean'
      ) {
        throw new TypeError(
          `[set error]: navigation.hover: ${prop} must be boolean`,
        )
      }
    }

    // Validate blocks_to_avoid
    if (config.blocks_to_avoid !== void 0) {
      if (!Array.isArray(config.blocks_to_avoid)) {
        throw new TypeError(
          '[set error]: navigation.hover: blocks_to_avoid must be an array',
        )
      }
      for (const block of config.blocks_to_avoid) {
        if (typeof block !== 'string' || block.trim() === '') {
          throw new TypeError(
            '[set error]: navigation.hover: each block in blocks_to_avoid must be a non-empty string',
          )
        }
      }
    }

    if (!this.#opt.components) {
      this.#opt.components = {}
    }
    this.#opt.components['minecraft:navigation.hover'] = config
  }

  /**
   * Sets swim navigation for the entity
   */
  public setNavigationSwim(config: {
    avoid_damage_blocks?: boolean
    avoid_portals?: boolean
    avoid_sun?: boolean
    avoid_water?: boolean
    blocks_to_avoid?:
      | string[]
      | Array<{
          name?: string
          tags?: string
        }>
    can_breach?: boolean
    can_break_doors?: boolean
    can_jump?: boolean
    can_open_doors?: boolean
    can_open_iron_doors?: boolean
    can_pass_doors?: boolean
    can_path_from_air?: boolean
    can_path_over_lava?: boolean
    can_path_over_water?: boolean
    can_sink?: boolean
    can_swim?: boolean
    can_walk?: boolean
    can_walk_in_lava?: boolean
    is_amphibious?: boolean
  }) {
    if (typeof config !== 'object' || config === null) {
      throw new TypeError(
        '[set error]: navigation.swim: must be an object configuration',
      )
    }

    // Validate boolean properties
    const booleanProps = [
      'avoid_damage_blocks',
      'avoid_portals',
      'avoid_sun',
      'avoid_water',
      'can_breach',
      'can_break_doors',
      'can_jump',
      'can_open_doors',
      'can_open_iron_doors',
      'can_pass_doors',
      'can_path_from_air',
      'can_path_over_lava',
      'can_path_over_water',
      'can_sink',
      'can_swim',
      'can_walk',
      'can_walk_in_lava',
      'is_amphibious',
    ]

    for (const prop of booleanProps) {
      if (
        config[prop as keyof typeof config] !== void 0 &&
        typeof config[prop as keyof typeof config] !== 'boolean'
      ) {
        throw new TypeError(
          `[set error]: navigation.swim: ${prop} must be boolean`,
        )
      }
    }

    // Validate blocks_to_avoid
    if (config.blocks_to_avoid !== void 0) {
      if (!Array.isArray(config.blocks_to_avoid)) {
        throw new TypeError(
          '[set error]: navigation.swim: blocks_to_avoid must be an array',
        )
      }
      for (const block of config.blocks_to_avoid) {
        if (typeof block === 'string') {
          if (block.trim() === '') {
            throw new TypeError(
              '[set error]: navigation.swim: each block string in blocks_to_avoid must be non-empty',
            )
          }
        } else if (typeof block === 'object' && block !== null) {
          if (block.name !== void 0 && typeof block.name !== 'string') {
            throw new TypeError(
              '[set error]: navigation.swim: block.name must be a string',
            )
          }
          if (block.tags !== void 0 && typeof block.tags !== 'string') {
            throw new TypeError(
              '[set error]: navigation.swim: block.tags must be a string',
            )
          }
        } else {
          throw new TypeError(
            '[set error]: navigation.swim: each block in blocks_to_avoid must be a string or object',
          )
        }
      }
    }

    if (!this.#opt.components) {
      this.#opt.components = {}
    }
    this.#opt.components['minecraft:navigation.swim'] = config
  }

  /**
   * Sets walk navigation for the entity
   */
  public setNavigationWalk(config: {
    avoid_damage_blocks?: boolean
    avoid_portals?: boolean
    avoid_sun?: boolean
    avoid_water?: boolean
    blocks_to_avoid?:
      | string[]
      | Array<{
          name?: string
          tags?: string
        }>
    can_breach?: boolean
    can_break_doors?: boolean
    can_float?: boolean
    can_jump?: boolean
    can_open_doors?: boolean
    can_open_iron_doors?: boolean
    can_pass_doors?: boolean
    can_path_from_air?: boolean
    can_path_over_lava?: boolean
    can_path_over_water?: boolean
    can_sink?: boolean
    can_swim?: boolean
    can_walk?: boolean
    can_walk_in_lava?: boolean
    is_amphibious?: boolean
    using_door_annotation?: boolean
  }) {
    if (typeof config !== 'object' || config === null) {
      throw new TypeError(
        '[set error]: navigation.walk: must be an object configuration',
      )
    }

    // Validate boolean properties
    const booleanProps = [
      'avoid_damage_blocks',
      'avoid_portals',
      'avoid_sun',
      'avoid_water',
      'can_breach',
      'can_break_doors',
      'can_float',
      'can_jump',
      'can_open_doors',
      'can_open_iron_doors',
      'can_pass_doors',
      'can_path_from_air',
      'can_path_over_lava',
      'can_path_over_water',
      'can_sink',
      'can_swim',
      'can_walk',
      'can_walk_in_lava',
      'is_amphibious',
      'using_door_annotation',
    ]

    for (const prop of booleanProps) {
      if (
        config[prop as keyof typeof config] !== void 0 &&
        typeof config[prop as keyof typeof config] !== 'boolean'
      ) {
        throw new TypeError(
          `[set error]: navigation.walk: ${prop} must be boolean`,
        )
      }
    }

    // Validate blocks_to_avoid
    if (config.blocks_to_avoid !== void 0) {
      if (!Array.isArray(config.blocks_to_avoid)) {
        throw new TypeError(
          '[set error]: navigation.walk: blocks_to_avoid must be an array',
        )
      }
      for (const block of config.blocks_to_avoid) {
        if (typeof block === 'string') {
          if (block.trim() === '') {
            throw new TypeError(
              '[set error]: navigation.walk: each block string in blocks_to_avoid must be non-empty',
            )
          }
        } else if (typeof block === 'object' && block !== null) {
          if (block.name !== void 0 && typeof block.name !== 'string') {
            throw new TypeError(
              '[set error]: navigation.walk: block.name must be a string',
            )
          }
          if (block.tags !== void 0 && typeof block.tags !== 'string') {
            throw new TypeError(
              '[set error]: navigation.walk: block.tags must be a string',
            )
          }
        } else {
          throw new TypeError(
            '[set error]: navigation.walk: each block in blocks_to_avoid must be a string or object',
          )
        }
      }
    }

    if (!this.#opt.components) {
      this.#opt.components = {}
    }
    this.#opt.components['minecraft:navigation.walk'] = config
  }

  /**
   * Sets out_of_control configuration for the entity, defining the entity's 'out of control' state
   */
  public setOutOfControl(): void {
    if (!this.#opt.components) {
      this.#opt.components = {}
    }
    this.#opt.components['minecraft:out_of_control'] = {}
  }

  /**
   * Sets peek configuration for the entity, defining the events that should be called during it
   */
  public setPeek(config: {
    on_close?: {
      event?: string // Event to call when the entity is done peeking
    }
    on_open?: {
      event?: string // Event to call when the entity starts peeking
    }
    on_target_open?: {
      event?: string // Event to call when the entity's target entity starts peeking
    }
  }): void {
    if (typeof config !== 'object' || config === null) {
      throw new TypeError('[set error]: peek: must be an object configuration')
    }

    if (!this.#opt.components) {
      this.#opt.components = {}
    }
    this.#opt.components['minecraft:peek'] = config
  }

  /**
   * Sets persistent configuration for the entity, defining whether an entity should be persistent
   */
  public setPersistent(): void {
    if (!this.#opt.components) {
      this.#opt.components = {}
    }
    this.#opt.components['minecraft:persistent'] = {}
  }

  /**
   * Sets physics configuration for the entity, defining physics properties
   */
  public setPhysics(config: {
    has_collision?: boolean // Whether or not the entity collides with things
    has_gravity?: boolean // Whether or not the entity is affected by gravity
    push_towards_closest_space?: boolean // Whether or not the entity should be pushed towards the nearest open area
  }): void {
    if (typeof config !== 'object' || config === null) {
      throw new TypeError(
        '[set error]: physics: must be an object configuration',
      )
    }

    // Validate boolean properties
    if (
      config.has_collision !== void 0 &&
      typeof config.has_collision !== 'boolean'
    ) {
      throw new TypeError('[set error]: physics: has_collision must be boolean')
    }
    if (
      config.has_gravity !== void 0 &&
      typeof config.has_gravity !== 'boolean'
    ) {
      throw new TypeError('[set error]: physics: has_gravity must be boolean')
    }
    if (
      config.push_towards_closest_space !== void 0 &&
      typeof config.push_towards_closest_space !== 'boolean'
    ) {
      throw new TypeError(
        '[set error]: physics: push_towards_closest_space must be boolean',
      )
    }

    if (!this.#opt.components) {
      this.#opt.components = {}
    }
    this.#opt.components['minecraft:physics'] = config
  }

  /**
   * Sets player.exhaustion configuration for the player, defining the player's exhaustion level
   */
  public setPlayerExhaustion(config: {
    max?: number // A maximum value for a player's exhaustion
    value?: number // The initial value of a player's exhaustion level
  }): void {
    if (typeof config !== 'object' || config === null) {
      throw new TypeError(
        '[set error]: player.exhaustion: must be an object configuration',
      )
    }

    // Validate numeric properties
    if (
      config.max !== void 0 &&
      (typeof config.max !== 'number' || config.max < 0)
    ) {
      throw new TypeError(
        '[set error]: player.exhaustion: max must be a non-negative number',
      )
    }
    if (
      config.value !== void 0 &&
      (typeof config.value !== 'number' || config.value < 0)
    ) {
      throw new TypeError(
        '[set error]: player.exhaustion: value must be a non-negative number',
      )
    }

    if (!this.#opt.components) {
      this.#opt.components = {}
    }
    this.#opt.components['minecraft:player.exhaustion'] = config
  }

  /**
   * Sets offspring configuration for the entity
   */
  public setOffspring(config: {
    blend_attributes?: boolean
    deny_parents_variant?: Array<{
      chance?: number
      max_variant?: number
      min_variant?: number
    }>
    inherit_tamed?: boolean
    mutation_factor?: {
      color?: number
      extra_variant?: number
      variant?: number
    }
    offspring_pairs?: Record<string, string>
    parent_centric_attribute_blending?: {
      attribute?: string
      dampening?: number
    }
    property_inheritance?: Record<string, any>
    random_extra_variant_mutation_interval?: {
      range_max?: number
      range_min?: number
    }
    random_variant_mutation_interval?: {
      range_max?: number
      range_min?: number
    }
  }) {
    if (typeof config !== 'object' || config === null) {
      throw new TypeError(
        '[set error]: offspring: must be an object configuration',
      )
    }

    // Validate boolean properties
    if (
      config.blend_attributes !== void 0 &&
      typeof config.blend_attributes !== 'boolean'
    ) {
      throw new TypeError(
        '[set error]: offspring: blend_attributes must be boolean',
      )
    }
    if (
      config.inherit_tamed !== void 0 &&
      typeof config.inherit_tamed !== 'boolean'
    ) {
      throw new TypeError(
        '[set error]: offspring: inherit_tamed must be boolean',
      )
    }

    // Validate deny_parents_variant array
    if (config.deny_parents_variant !== void 0) {
      if (!Array.isArray(config.deny_parents_variant)) {
        throw new TypeError(
          '[set error]: offspring: deny_parents_variant must be an array',
        )
      }
      for (const item of config.deny_parents_variant) {
        if (
          item.chance !== void 0 &&
          (typeof item.chance !== 'number' || item.chance < 0)
        ) {
          throw new TypeError(
            '[set error]: offspring: deny_parents_variant.chance must be a non-negative number',
          )
        }
        if (
          item.max_variant !== void 0 &&
          (typeof item.max_variant !== 'number' || item.max_variant < 0)
        ) {
          throw new TypeError(
            '[set error]: offspring: deny_parents_variant.max_variant must be a non-negative integer',
          )
        }
        if (
          item.min_variant !== void 0 &&
          (typeof item.min_variant !== 'number' || item.min_variant < 0)
        ) {
          throw new TypeError(
            '[set error]: offspring: deny_parents_variant.min_variant must be a non-negative integer',
          )
        }
      }
    }

    // Validate mutation_factor
    if (config.mutation_factor !== void 0) {
      if (
        config.mutation_factor.color !== void 0 &&
        (typeof config.mutation_factor.color !== 'number' ||
          config.mutation_factor.color < 0 ||
          config.mutation_factor.color > 1)
      ) {
        throw new TypeError(
          '[set error]: offspring: mutation_factor.color must be a number between 0.0 and 1.0',
        )
      }
      if (
        config.mutation_factor.extra_variant !== void 0 &&
        (typeof config.mutation_factor.extra_variant !== 'number' ||
          config.mutation_factor.extra_variant < 0 ||
          config.mutation_factor.extra_variant > 1)
      ) {
        throw new TypeError(
          '[set error]: offspring: mutation_factor.extra_variant must be a number between 0.0 and 1.0',
        )
      }
      if (
        config.mutation_factor.variant !== void 0 &&
        (typeof config.mutation_factor.variant !== 'number' ||
          config.mutation_factor.variant < 0 ||
          config.mutation_factor.variant > 1)
      ) {
        throw new TypeError(
          '[set error]: offspring: mutation_factor.variant must be a number between 0.0 and 1.0',
        )
      }
    }

    // Validate parent_centric_attribute_blending
    if (config.parent_centric_attribute_blending !== void 0) {
      if (
        typeof config.parent_centric_attribute_blending !== 'object' ||
        config.parent_centric_attribute_blending === null
      ) {
        throw new TypeError(
          '[set error]: offspring: parent_centric_attribute_blending must be an object',
        )
      }
      const item = config.parent_centric_attribute_blending
      if (item.attribute !== void 0 && typeof item.attribute !== 'string') {
        throw new TypeError(
          '[set error]: offspring: parent_centric_attribute_blending attribute must be string',
        )
      }
      if (item.dampening !== void 0 && typeof item.dampening !== 'number') {
        throw new TypeError(
          '[set error]: offspring: parent_centric_attribute_blending dampening must be number',
        )
      }
    }

    // Validate random intervals
    if (config.random_extra_variant_mutation_interval !== void 0) {
      if (
        config.random_extra_variant_mutation_interval.range_max !== void 0 &&
        (typeof config.random_extra_variant_mutation_interval.range_max !==
          'number' ||
          config.random_extra_variant_mutation_interval.range_max < 0)
      ) {
        throw new TypeError(
          '[set error]: offspring: random_extra_variant_mutation_interval.range_max must be a non-negative number',
        )
      }
      if (
        config.random_extra_variant_mutation_interval.range_min !== void 0 &&
        (typeof config.random_extra_variant_mutation_interval.range_min !==
          'number' ||
          config.random_extra_variant_mutation_interval.range_min < 0)
      ) {
        throw new TypeError(
          '[set error]: offspring: random_extra_variant_mutation_interval.range_min must be a non-negative number',
        )
      }
    }
    if (config.random_variant_mutation_interval !== void 0) {
      if (
        config.random_variant_mutation_interval.range_max !== void 0 &&
        (typeof config.random_variant_mutation_interval.range_max !==
          'number' ||
          config.random_variant_mutation_interval.range_max < 0)
      ) {
        throw new TypeError(
          '[set error]: offspring: random_variant_mutation_interval.range_max must be a non-negative number',
        )
      }
      if (
        config.random_variant_mutation_interval.range_min !== void 0 &&
        (typeof config.random_variant_mutation_interval.range_min !==
          'number' ||
          config.random_variant_mutation_interval.range_min < 0)
      ) {
        throw new TypeError(
          '[set error]: offspring: random_variant_mutation_interval.range_min must be a non-negative number',
        )
      }
    }
    if (!this.#opt.components) {
      this.#opt.components = {}
    }
    this.#opt.components['minecraft:offspring'] = config
  }
}
export { EntityComponent }

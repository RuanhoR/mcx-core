import * as t from "./../types"

class EntityComponent {
  #opt: t.EntityComponentOpt

  constructor(opt: t.EntityComponentOpt) {
    this.#opt = opt;
  }

  public toJSON(): t.EntityJSON {
    if (!this.#opt) throw new Error("[mcx component]: cannot read component")

    const result: t.EntityJSON = {
      format_version: "",
      "minecraft:entity": {
        description: {
          identifier: ""
        }
      }
    }

    // 设置格式版本
    if (typeof this.#opt.format == "string" && /\d.\d.\d/.test(this.#opt.format)) {
      result["format_version"] = this.#opt.format;
    } else {
      throw new Error("[compile component]: no format")
    }

    // 设置实体标识符
    if (typeof this.#opt.id == "string" && /[a-zA-Z0-9_]:[a-zA-Z0-9_]/.test(this.#opt.id)) {
      result["minecraft:entity"].description.identifier = this.#opt.id
    } else {
      throw new Error("[compile component]: no id")
    }

    // 设置是否可生成和召唤
    if (typeof this.#opt.is_spawnable === "boolean") {
      result["minecraft:entity"].description.is_spawnable = this.#opt.is_spawnable;
    }

    if (typeof this.#opt.is_summonable === "boolean") {
      result["minecraft:entity"].description.is_summonable = this.#opt.is_summonable;
    }

    // 处理组件
    if (this.#opt.components) {
      const components = this.#opt.components;

      // 检查是否需要components字段
      const hasComponents =
        typeof components.physics === "boolean" ||
        components.addrider !== undefined ||
        components["minecraft:admire_item"] !== undefined ||
        components["minecraft:ageable"] !== undefined ||
        components["minecraft:anger_level"] !== undefined ||
        components["minecraft:angry"] !== undefined ||
        components["minecraft:annotation.break_door"] !== undefined ||
        components["minecraft:annotation.open_door"] !== undefined ||
        components["minecraft:attack"] !== undefined ||
        components["minecraft:area_attack"] !== undefined ||
        components["minecraft:attack_cooldown"] !== undefined ||
        components["minecraft:balloonable"] !== undefined ||
        components["minecraft:barter"] !== undefined ||
        components["minecraft:block_climber"] !== undefined ||
        components["minecraft:block_sensor"] !== undefined ||
        components["minecraft:body_rotation_axis_aligned"] !== undefined ||
        components["minecraft:body_rotation_always_follows_head"] !== undefined ||
        components["minecraft:body_rotation_blocked"] !== undefined ||
        components["minecraft:body_rotation_locked_to_vehicle"] !== undefined ||
        components["minecraft:boostable"] !== undefined ||
        components["minecraft:boss"] !== undefined ||
        components["minecraft:break_blocks"] !== undefined ||
        components["minecraft:breathable"] !== undefined ||
        components["minecraft:bribeable"] !== undefined ||
        components["minecraft:breedable"] !== undefined ||
        components["minecraft:buoyant"] !== undefined ||
        components["minecraft:burns_in_daylight"] !== undefined ||
        components["minecraft:cannot_be_attacked"] !== undefined ||
        components["minecraft:can_climb"] !== undefined ||
        components["minecraft:can_fly"] !== undefined ||
        components["minecraft:can_join_raid"] !== undefined ||
        components["minecraft:can_power_jump"] !== undefined ||
        components["minecraft:celebrate_hunt"] !== undefined ||
        components["minecraft:collision_box"] !== undefined ||
        components["minecraft:color"] !== undefined ||
        components["minecraft:color2"] !== undefined ||
        components["minecraft:combat_regeneration"] !== undefined ||
        components["minecraft:conditional_bandwidth_optimization"] !== undefined ||
        components["minecraft:custom_hit_test"] !== undefined ||
        components["minecraft:damage_over_time"] !== undefined ||
        components["minecraft:damage_sensor"] !== undefined ||
        components["minecraft:dash"] !== undefined ||
        components["minecraft:dash_action"] !== undefined ||
        components["minecraft:default_look_angle"] !== undefined ||
        components["minecraft:despawn"] !== undefined ||
        components["minecraft:dimension_bound"] !== undefined ||
        components["minecraft:drying_out_timer"] !== undefined ||
        components["minecraft:dweller"] !== undefined ||
        components["minecraft:economy_trade_table"] !== undefined ||
        components["minecraft:entity_armor_equipment_slot_mapping"] !== undefined ||
        components["minecraft:entity_sensor"] !== undefined ||
        components["minecraft:environment_sensor"] !== undefined ||
        components["minecraft:equipment"] !== undefined ||
        components["minecraft:equippable"] !== undefined ||
        components["minecraft:equip_item"] !== undefined ||
        components["minecraft:exhaustion_values"] !== undefined ||
        components["minecraft:experience_reward"] !== undefined ||
        components["minecraft:explode"] !== undefined ||
        components["minecraft:fire_immune"] !== undefined ||
        components["minecraft:floats_in_liquid"] !== undefined ||
        components["minecraft:flocking"] !== undefined ||
        components["minecraft:flying_speed"] !== undefined ||
        components["minecraft:follow_range"] !== undefined ||
        components["minecraft:free_camera_controlled"] !== undefined ||
        components["minecraft:friction_modifier"] !== undefined ||
        components["minecraft:game_event_movement_tracking"] !== undefined ||
        components["minecraft:genetics"] !== undefined ||
        components["minecraft:giveable"] !== undefined ||
        components["minecraft:ground_offset"] !== undefined ||
        components["minecraft:group_size"] !== undefined ||
        components["minecraft:grows_crop"] !== undefined ||
        components["minecraft:health"] !== undefined ||
        components["minecraft:heartbeat"] !== undefined ||
        components["minecraft:hide"] !== undefined ||
        components["minecraft:home"] !== undefined ||
        components["minecraft:horse.jump_strength"] !== undefined ||
        components["minecraft:hurt_on_condition"] !== undefined ||
        components["minecraft:ignore_cannot_be_attacked"] !== undefined ||
        components["minecraft:input_air_controlled"] !== undefined ||
        components["minecraft:input_ground_controlled"] !== undefined ||
        components["minecraft:inside_block_notifier"] !== undefined ||
        components["minecraft:insomnia"] !== undefined ||
        components["minecraft:instant_despawn"] !== undefined ||
        components["minecraft:interact"] !== undefined ||
        components["minecraft:inventory"] !== undefined ||
        components["minecraft:is_baby"] !== undefined ||
        components["minecraft:is_charged"] !== undefined ||
        components["minecraft:is_chested"] !== undefined ||
        components["minecraft:is_dyeable"] !== undefined;

      if (hasComponents) {
        result["minecraft:entity"].components = {};
        const ApplyComponents = result["minecraft:entity"].components;

        // 添加physics组件
        if (typeof components.physics === "boolean") {
          ApplyComponents["minecraft:physics"] = {};
        }

        // 添加addrider组件
        if (components.addrider) {
          const addriderConfig: any = {};

          if (components.addrider.entity_type) {
            addriderConfig.entity_type = components.addrider.entity_type;
          }

          if (Array.isArray(components.addrider.riders) && components.addrider.riders.length > 0) {
            addriderConfig.riders = [...components.addrider.riders];
          }

          if (components.addrider.spawn_event) {
            addriderConfig.spawn_event = components.addrider.spawn_event;
          }

          ApplyComponents["minecraft:addrider"] = addriderConfig;
        }

        // 添加admire_item组件
        if (components["minecraft:admire_item"]) {
          const admireItemConfig = components["minecraft:admire_item"];
          ApplyComponents["minecraft:admire_item"] = { ...admireItemConfig };
        }

        // 添加ageable组件
        if (components["minecraft:ageable"]) {
          const ageableConfig = components["minecraft:ageable"];
          ApplyComponents["minecraft:ageable"] = { ...ageableConfig };
        }

        // 添加anger_level组件
        if (components["minecraft:anger_level"]) {
          const angerLevelConfig = components["minecraft:anger_level"];
          ApplyComponents["minecraft:anger_level"] = { ...angerLevelConfig };
        }

        // 添加angry组件
        if (components["minecraft:angry"]) {
          const angryConfig = components["minecraft:angry"];
          ApplyComponents["minecraft:angry"] = { ...angryConfig };
        }

        // 添加annotation.break_door组件
        if (components["minecraft:annotation.break_door"]) {
          const breakDoorConfig = components["minecraft:annotation.break_door"];
          ApplyComponents["minecraft:annotation.break_door"] = { ...breakDoorConfig };
        }

        // 添加annotation.open_door组件
        if (components["minecraft:annotation.open_door"]) {
          // minecraft:annotation.open_door是一个空对象{}
          ApplyComponents["minecraft:annotation.open_door"] = {};
        }

        // 添加attack组件
        if (components["minecraft:attack"]) {
          const attackConfig = components["minecraft:attack"];
          ApplyComponents["minecraft:attack"] = { ...attackConfig };
        }

        // 添加area_attack组件
        if (components["minecraft:area_attack"]) {
          const areaAttackConfig = components["minecraft:area_attack"];
          ApplyComponents["minecraft:area_attack"] = { ...areaAttackConfig };
        }

        // 添加attack_cooldown组件
        if (components["minecraft:attack_cooldown"]) {
          const attackCooldownConfig = components["minecraft:attack_cooldown"];
          ApplyComponents["minecraft:attack_cooldown"] = { ...attackCooldownConfig };
        }

        // 添加balloonable组件
        if (components["minecraft:balloonable"]) {
          const balloonableConfig = components["minecraft:balloonable"];
          ApplyComponents["minecraft:balloonable"] = { ...balloonableConfig };
        }

        // 添加barter组件
        if (components["minecraft:barter"]) {
          const barterConfig = components["minecraft:barter"];
          ApplyComponents["minecraft:barter"] = { ...barterConfig };
        }

        // 添加block_climber组件
        if (components["minecraft:block_climber"]) {
          // minecraft:block_climber 是一个空对象{}
          ApplyComponents["minecraft:block_climber"] = {};
        }

        // 添加block_sensor组件
        if (components["minecraft:block_sensor"]) {
          const blockSensorConfig = components["minecraft:block_sensor"];
          ApplyComponents["minecraft:block_sensor"] = { ...blockSensorConfig };
        }

        // 添加body_rotation_axis_aligned组件
        if (components["minecraft:body_rotation_axis_aligned"]) {
          ApplyComponents["minecraft:body_rotation_axis_aligned"] = {};
        }

        // 添加body_rotation_always_follows_head组件
        if (components["minecraft:body_rotation_always_follows_head"]) {
          ApplyComponents["minecraft:body_rotation_always_follows_head"] = {};
        }

        // 添加body_rotation_blocked组件
        if (components["minecraft:body_rotation_blocked"]) {
          ApplyComponents["minecraft:body_rotation_blocked"] = {};
        }

        // 添加body_rotation_locked_to_vehicle组件
        if (components["minecraft:body_rotation_locked_to_vehicle"]) {
          ApplyComponents["minecraft:body_rotation_locked_to_vehicle"] = {};
        }

        // 添加boostable组件
        if (components["minecraft:boostable"]) {
          const boostableConfig = components["minecraft:boostable"];
          ApplyComponents["minecraft:boostable"] = { ...boostableConfig };
        }

        // 添加boss组件
        if (components["minecraft:boss"]) {
          const bossConfig = components["minecraft:boss"];
          ApplyComponents["minecraft:boss"] = { ...bossConfig };
        }

        // 添加break_blocks组件
        if (components["minecraft:break_blocks"]) {
          const breakBlocksConfig = components["minecraft:break_blocks"];
          ApplyComponents["minecraft:break_blocks"] = { ...breakBlocksConfig };
        }

        // 添加breathable组件
        if (components["minecraft:breathable"]) {
          const breathableConfig = components["minecraft:breathable"];
          ApplyComponents["minecraft:breathable"] = { ...breathableConfig };
        }

        // 添加bribeable组件
        if (components["minecraft:bribeable"]) {
          const bribeableConfig = components["minecraft:bribeable"];
          ApplyComponents["minecraft:bribeable"] = { ...bribeableConfig };
        }

        // 添加breedable组件
        if (components["minecraft:breedable"]) {
          const breedableConfig = components["minecraft:breedable"];
          ApplyComponents["minecraft:breedable"] = { ...breedableConfig };
        }

        // 添加buoyant组件
        if (components["minecraft:buoyant"]) {
          const buoyantConfig = components["minecraft:buoyant"];
          ApplyComponents["minecraft:buoyant"] = { ...buoyantConfig };
        }

        // 添加burns_in_daylight组件
        if (components["minecraft:burns_in_daylight"]) {
          const burnsInDaylightConfig = components["minecraft:burns_in_daylight"];
          ApplyComponents["minecraft:burns_in_daylight"] = { ...burnsInDaylightConfig };
        }

        // 添加cannot_be_attacked组件
        if (components["minecraft:cannot_be_attacked"]) {
          ApplyComponents["minecraft:cannot_be_attacked"] = {};
        }

        // 添加can_climb组件
        if (components["minecraft:can_climb"]) {
          ApplyComponents["minecraft:can_climb"] = {};
        }

        // 添加can_fly组件
        if (components["minecraft:can_fly"]) {
          ApplyComponents["minecraft:can_fly"] = {};
        }

        // 添加can_join_raid组件
        if (components["minecraft:can_join_raid"]) {
          ApplyComponents["minecraft:can_join_raid"] = {};
        }

        // 添加can_power_jump组件
        if (components["minecraft:can_power_jump"]) {
          ApplyComponents["minecraft:can_power_jump"] = {};
        }

        // 添加celebrate_hunt组件
        if (components["minecraft:celebrate_hunt"]) {
          const celebrateHuntConfig = components["minecraft:celebrate_hunt"];
          ApplyComponents["minecraft:celebrate_hunt"] = { ...celebrateHuntConfig };
        }

        // 添加collision_box组件
        if (components["minecraft:collision_box"]) {
          const collisionBoxConfig = components["minecraft:collision_box"];
          ApplyComponents["minecraft:collision_box"] = { ...collisionBoxConfig };
        }

        // 添加color组件
        if (components["minecraft:color"]) {
          const colorConfig = components["minecraft:color"];
          ApplyComponents["minecraft:color"] = { ...colorConfig };
        }

        // 添加color2组件
        if (components["minecraft:color2"]) {
          const color2Config = components["minecraft:color2"];
          ApplyComponents["minecraft:color2"] = { ...color2Config };
        }

        // 添加combat_regeneration组件
        if (components["minecraft:combat_regeneration"]) {
          const combatRegenerationConfig = components["minecraft:combat_regeneration"];
          ApplyComponents["minecraft:combat_regeneration"] = { ...combatRegenerationConfig };
        }

        // 添加conditional_bandwidth_optimization组件
        if (components["minecraft:conditional_bandwidth_optimization"]) {
          const conditionalBandwidthOptimizationConfig = components["minecraft:conditional_bandwidth_optimization"];
          ApplyComponents["minecraft:conditional_bandwidth_optimization"] = { ...conditionalBandwidthOptimizationConfig };
        }

        // 添加custom_hit_test组件
        if (components["minecraft:custom_hit_test"]) {
          const customHitTestConfig = components["minecraft:custom_hit_test"];
          ApplyComponents["minecraft:custom_hit_test"] = { ...customHitTestConfig };
        }

        // 添加damage_over_time组件
        if (components["minecraft:damage_over_time"]) {
          const damageOverTimeConfig = components["minecraft:damage_over_time"];
          ApplyComponents["minecraft:damage_over_time"] = { ...damageOverTimeConfig };
        }

        // 添加damage_sensor组件
        if (components["minecraft:damage_sensor"]) {
          const damageSensorConfig = components["minecraft:damage_sensor"];
          ApplyComponents["minecraft:damage_sensor"] = { ...damageSensorConfig };
        }

        // 添加dash组件
        if (components["minecraft:dash"]) {
          const dashConfig = components["minecraft:dash"];
          ApplyComponents["minecraft:dash"] = { ...dashConfig };
        }

        // 添加dash_action组件
        if (components["minecraft:dash_action"]) {
          const dashActionConfig = components["minecraft:dash_action"];
          ApplyComponents["minecraft:dash_action"] = { ...dashActionConfig };
        }

        // 添加default_look_angle组件
        if (components["minecraft:default_look_angle"]) {
          const defaultLookAngleConfig = components["minecraft:default_look_angle"];
          ApplyComponents["minecraft:default_look_angle"] = { ...defaultLookAngleConfig };
        }

        // 添加despawn组件
        if (components["minecraft:despawn"]) {
          const despawnConfig = components["minecraft:despawn"];
          ApplyComponents["minecraft:despawn"] = { ...despawnConfig };
        }

        // 添加dimension_bound组件
        if (components["minecraft:dimension_bound"]) {
          ApplyComponents["minecraft:dimension_bound"] = {};
        }

        // 添加drying_out_timer组件
        if (components["minecraft:drying_out_timer"]) {
          const dryingOutTimerConfig = components["minecraft:drying_out_timer"];
          ApplyComponents["minecraft:drying_out_timer"] = { ...dryingOutTimerConfig };
        }

        // 添加dweller组件
        if (components["minecraft:dweller"]) {
          const dwellerConfig = components["minecraft:dweller"];
          ApplyComponents["minecraft:dweller"] = { ...dwellerConfig };
        }

        // 添加economy_trade_table组件
        if (components["minecraft:economy_trade_table"]) {
          const economyTradeTableConfig = components["minecraft:economy_trade_table"];
          ApplyComponents["minecraft:economy_trade_table"] = { ...economyTradeTableConfig };
        }

        // 添加entity_armor_equipment_slot_mapping组件
        if (components["minecraft:entity_armor_equipment_slot_mapping"]) {
          const entityArmorEquipmentSlotMappingConfig = components["minecraft:entity_armor_equipment_slot_mapping"];
          ApplyComponents["minecraft:entity_armor_equipment_slot_mapping"] = { ...entityArmorEquipmentSlotMappingConfig };
        }

        // 添加entity_sensor组件
        if (components["minecraft:entity_sensor"]) {
          const entitySensorConfig = components["minecraft:entity_sensor"];
          ApplyComponents["minecraft:entity_sensor"] = { ...entitySensorConfig };
        }

        // 添加environment_sensor组件
        if (components["minecraft:environment_sensor"]) {
          const environmentSensorConfig = components["minecraft:environment_sensor"];
          ApplyComponents["minecraft:environment_sensor"] = { ...environmentSensorConfig };
        }

        // 添加equipment组件
        if (components["minecraft:equipment"]) {
          const equipmentConfig = components["minecraft:equipment"];
          ApplyComponents["minecraft:equipment"] = { ...equipmentConfig };
        }

        // 添加equippable组件
        if (components["minecraft:equippable"]) {
          const equippableConfig = components["minecraft:equippable"];
          ApplyComponents["minecraft:equippable"] = { ...equippableConfig };
        }

        // 添加equip_item组件
        if (components["minecraft:equip_item"]) {
          const equipItemConfig = components["minecraft:equip_item"];
          ApplyComponents["minecraft:equip_item"] = { ...equipItemConfig };
        }

        // 添加exhaustion_values组件
        if (components["minecraft:exhaustion_values"]) {
          const exhaustionValuesConfig = components["minecraft:exhaustion_values"];
          ApplyComponents["minecraft:exhaustion_values"] = { ...exhaustionValuesConfig };
        }

        // 添加experience_reward组件
        if (components["minecraft:experience_reward"]) {
          const experienceRewardConfig = components["minecraft:experience_reward"];
          ApplyComponents["minecraft:experience_reward"] = { ...experienceRewardConfig };
        }

        // 添加explode组件
        if (components["minecraft:explode"]) {
          const explodeConfig = components["minecraft:explode"];
          ApplyComponents["minecraft:explode"] = { ...explodeConfig };
        }

        // 添加fire_immune组件
        if (components["minecraft:fire_immune"]) {
          ApplyComponents["minecraft:fire_immune"] = {};
        }

        // 添加floats_in_liquid组件
        if (components["minecraft:floats_in_liquid"]) {
          ApplyComponents["minecraft:floats_in_liquid"] = {};
        }

        // 添加flocking组件
        if (components["minecraft:flocking"]) {
          const flockingConfig = components["minecraft:flocking"];
          ApplyComponents["minecraft:flocking"] = { ...flockingConfig };
        }

        // 添加flying_speed组件
        if (components["minecraft:flying_speed"]) {
          const flyingSpeedConfig = components["minecraft:flying_speed"];
          ApplyComponents["minecraft:flying_speed"] = { ...flyingSpeedConfig };
        }

        // 添加follow_range组件
        if (components["minecraft:follow_range"]) {
          const followRangeConfig = components["minecraft:follow_range"];
          ApplyComponents["minecraft:follow_range"] = { ...followRangeConfig };
        }

        // 添加free_camera_controlled组件
        if (components["minecraft:free_camera_controlled"]) {
          const freeCameraConfig = components["minecraft:free_camera_controlled"];
          ApplyComponents["minecraft:free_camera_controlled"] = { ...freeCameraConfig };
        }

        // 添加friction_modifier组件
        if (components["minecraft:friction_modifier"]) {
          const frictionConfig = components["minecraft:friction_modifier"];
          ApplyComponents["minecraft:friction_modifier"] = { ...frictionConfig };
        }

        // 添加game_event_movement_tracking组件
        if (components["minecraft:game_event_movement_tracking"]) {
          const gameEventConfig = components["minecraft:game_event_movement_tracking"];
          ApplyComponents["minecraft:game_event_movement_tracking"] = { ...gameEventConfig };
        }

        // 添加genetics组件
        if (components["minecraft:genetics"]) {
          const geneticsConfig = components["minecraft:genetics"];
          ApplyComponents["minecraft:genetics"] = { ...geneticsConfig };
        }

        // 添加giveable组件
        if (components["minecraft:giveable"]) {
          const giveableConfig = components["minecraft:giveable"];
          ApplyComponents["minecraft:giveable"] = { ...giveableConfig };
        }

        // 添加ground_offset组件
        if (components["minecraft:ground_offset"]) {
          const groundOffsetConfig = components["minecraft:ground_offset"];
          ApplyComponents["minecraft:ground_offset"] = { ...groundOffsetConfig };
        }

        // 添加group_size组件
        if (components["minecraft:group_size"]) {
          const groupSizeConfig = components["minecraft:group_size"];
          ApplyComponents["minecraft:group_size"] = { ...groupSizeConfig };
        }

        // 添加grows_crop组件
        if (components["minecraft:grows_crop"]) {
          const growsCropConfig = components["minecraft:grows_crop"];
          ApplyComponents["minecraft:grows_crop"] = { ...growsCropConfig };
        }

        // 添加health组件
        if (components["minecraft:health"]) {
          const healthConfig = components["minecraft:health"];
          ApplyComponents["minecraft:health"] = { ...healthConfig };
        }

        // 添加heartbeat组件
        if (components["minecraft:heartbeat"]) {
          const heartbeatConfig = components["minecraft:heartbeat"];
          ApplyComponents["minecraft:heartbeat"] = { ...heartbeatConfig };
        }

        // 添加hide组件
        if (components["minecraft:hide"]) {
          ApplyComponents["minecraft:hide"] = {};
        }

        // 添加home组件
        if (components["minecraft:home"]) {
          const homeConfig = components["minecraft:home"];
          ApplyComponents["minecraft:home"] = { ...homeConfig };
        }

        // 添加horse.jump_strength组件
        if (components["minecraft:horse.jump_strength"]) {
          const jumpConfig = components["minecraft:horse.jump_strength"];
          ApplyComponents["minecraft:horse.jump_strength"] = { ...jumpConfig };
        }

        // 添加hurt_on_condition组件
        const hurtConfig = components["minecraft:hurt_on_condition"];
        if (hurtConfig !== undefined) {
          ApplyComponents["minecraft:hurt_on_condition"] = { ...hurtConfig };
        }

        // 添加ignore_cannot_be_attacked组件
        const ignoreAttackConfig = components["minecraft:ignore_cannot_be_attacked"];
        if (ignoreAttackConfig !== undefined) {
          ApplyComponents["minecraft:ignore_cannot_be_attacked"] = { ...ignoreAttackConfig };
        }

        // 添加input_air_controlled组件
        const airControlConfig = components["minecraft:input_air_controlled"];
        if (airControlConfig !== undefined) {
          ApplyComponents["minecraft:input_air_controlled"] = { ...airControlConfig };
        }

        // 添加input_ground_controlled组件
        const groundControlConfig = components["minecraft:input_ground_controlled"];
        if (groundControlConfig !== undefined) {
          ApplyComponents["minecraft:input_ground_controlled"] = { ...groundControlConfig };
        }

        // 添加inside_block_notifier组件
        const blockNotifierConfig = components["minecraft:inside_block_notifier"];
        if (blockNotifierConfig !== undefined) {
          ApplyComponents["minecraft:inside_block_notifier"] = { ...blockNotifierConfig };
        }

        // 添加insomnia组件
        const insomniaConfig = components["minecraft:insomnia"];
        if (insomniaConfig !== undefined) {
          ApplyComponents["minecraft:insomnia"] = { ...insomniaConfig };
        }

        // 添加instant_despawn组件
        const instantDespawnConfig = components["minecraft:instant_despawn"];
        if (instantDespawnConfig !== undefined) {
          ApplyComponents["minecraft:instant_despawn"] = { ...instantDespawnConfig };
        }

        // 添加interact组件
        const interactConfig = components["minecraft:interact"];
        if (interactConfig !== undefined) {
          ApplyComponents["minecraft:interact"] = { ...interactConfig };
        }

        // 添加inventory组件
        const inventoryConfig = components["minecraft:inventory"];
        if (inventoryConfig !== undefined) {
          ApplyComponents["minecraft:inventory"] = { ...inventoryConfig };
        }

        // 添加is_baby组件
        const isBabyConfig = components["minecraft:is_baby"];
        if (isBabyConfig !== undefined) {
          ApplyComponents["minecraft:is_baby"] = { ...isBabyConfig };
        }

        // 添加is_charged组件
        const isChargedConfig = components["minecraft:is_charged"];
        if (isChargedConfig !== undefined) {
          ApplyComponents["minecraft:is_charged"] = { ...isChargedConfig };
        }

        // 添加is_chested组件
        const isChestedConfig = components["minecraft:is_chested"];
        if (isChestedConfig !== undefined) {
          ApplyComponents["minecraft:is_chested"] = { ...isChestedConfig };
        }

        // 添加is_dyeable组件
        const isDyeableConfig = components["minecraft:is_dyeable"];
        if (isDyeableConfig !== undefined) {
          ApplyComponents["minecraft:is_dyeable"] = { ...isDyeableConfig };
        }
      }
    }

    return result;
  }

  // Setter方法
  public setId(newValue: string): void {
    if (typeof newValue == "string" && /[a-zA-Z0-9_]:[a-zA-Z0-9_]/.test(newValue)) {
      this.#opt.id = newValue
    } else {
      throw new Error("[set error]: id: type error or invalid format")
    }
  }

  public setFormat(newValue: string): void {
    if (typeof newValue == "string" && /\d.\d.\d/.test(newValue)) {
      this.#opt.format = newValue
    } else {
      throw new Error("[set error]: format: type error or invalid format")
    }
  }

  public setIsSpawnable(value: boolean): void {
    if (typeof value === "boolean") {
      this.#opt.is_spawnable = value;
    } else {
      throw new TypeError("[set error]: is_spawnable: type error");
    }
  }

  public setIsSummonable(value: boolean): void {
    if (typeof value === "boolean") {
      this.#opt.is_summonable = value;
    } else {
      throw new TypeError("[set error]: is_summonable: type error");
    }
  }

  public setPhysics(enabled: boolean): void {
    if (typeof enabled === "boolean") {
      // 初始化components对象如果不存在
      if (!this.#opt.components) {
        this.#opt.components = {};
      }
      this.#opt.components.physics = enabled;
    } else {
      throw new TypeError("[set error]: physics: type error");
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
    if (typeof config !== "object" || config === null) {
      throw new Error("[set error]: addrider: must be an object configuration");
    }

    // 初始化components对象如果不存在
    if (!this.#opt.components) {
      this.#opt.components = {};
    }

    this.#opt.components.addrider = config;
  }

  public setAdmireItem(config: {
    cooldown_after_being_attacked?: number
    duration?: number
  }): void {
    if (typeof config !== "object" || config === null) {
      throw new Error("[set error]: admire_item: must be an object configuration");
    }

    // 初始化components对象如果不存在
    if (!this.#opt.components) {
      this.#opt.components = {};
    }

    // 验证参数类型
    if (config.cooldown_after_being_attacked !== undefined && typeof config.cooldown_after_being_attacked !== "number") {
      throw new TypeError("[set error]: admire_item: cooldown_after_being_attacked must be a number");
    }
    if (config.duration !== undefined && typeof config.duration !== "number") {
      throw new TypeError("[set error]: admire_item: duration must be a number");
    }

    this.#opt.components["minecraft:admire_item"] = config;
  }

  public setAgeable(config: {
    drop_items?: string[]
    duration?: number
    feed_items?: string | string[] | Array<{
      growth?: number
      item: string
    }>
    grow_up?: string | {
      event: string
      target: string
    }
    interact_filters?: any
    pause_growth_items?: string[]
    reset_growth_items?: string[]
  }): void {
    if (typeof config !== "object" || config === null) {
      throw new Error("[set error]: ageable: must be an object configuration");
    }

    // 初始化components对象如果不存在
    if (!this.#opt.components) {
      this.#opt.components = {};
    }

    // 验证duration类型
    if (config.duration !== undefined && typeof config.duration !== "number") {
      throw new TypeError("[set error]: ageable: duration must be a number");
    }

    // 验证feed_items类型
    if (config.feed_items !== undefined) {
      if (!(typeof config.feed_items === "string" || Array.isArray(config.feed_items))) {
        throw new TypeError("[set error]: ageable: feed_items must be a string or array");
      }
    }

    this.#opt.components["minecraft:ageable"] = config;
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
    sound_interval?: { min: number, max: number }
  }): void {
    if (typeof config !== "object" || config === null) {
      throw new Error("[set error]: anger_level: must be an object configuration");
    }

    // 初始化components对象如果不存在
    if (!this.#opt.components) {
      this.#opt.components = {};
    }

    // 验证数值参数
    if (config.anger_decrement_interval !== undefined && typeof config.anger_decrement_interval !== "number") {
      throw new TypeError("[set error]: anger_level: anger_decrement_interval must be a number");
    }
    if (config.angry_boost !== undefined && (typeof config.angry_boost !== "number" || config.angry_boost < 0)) {
      throw new TypeError("[set error]: anger_level: angry_boost must be a number >= 0");
    }
    if (config.angry_threshold !== undefined && (typeof config.angry_threshold !== "number" || config.angry_threshold < 0)) {
      throw new TypeError("[set error]: anger_level: angry_threshold must be a number >= 0");
    }
    if (config.max_anger !== undefined && (typeof config.max_anger !== "number" || config.max_anger < 0)) {
      throw new TypeError("[set error]: anger_level: max_anger must be a number >= 0");
    }

    // 验证broadcast_range类型
    if (config.broadcast_range !== undefined && (typeof config.broadcast_range !== "number" || config.broadcast_range < 0)) {
      throw new TypeError("[set error]: anger_level: broadcast_range must be a number >= 0");
    }

    // 验证数组类型
    if (config.broadcast_targets !== undefined && !Array.isArray(config.broadcast_targets)) {
      throw new TypeError("[set error]: anger_level: broadcast_targets must be an array");
    }

    this.#opt.components["minecraft:anger_level"] = config;
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
    calm_event?: string | { event: string, target: string }
    duration?: number
    duration_delta?: number
    filters?: any
    sound_interval?: { min: number, max: number }
  }): void {
    if (typeof config !== "object" || config === null) {
      throw new Error("[set error]: angry: must be an object configuration");
    }

    // 初始化components对象如果不存在
    if (!this.#opt.components) {
      this.#opt.components = {};
    }

    // 验证duration和duration_delta类型
    if (config.duration !== undefined && typeof config.duration !== "number") {
      throw new TypeError("[set error]: angry: duration must be a number");
    }
    if (config.duration_delta !== undefined && typeof config.duration_delta !== "number") {
      throw new TypeError("[set error]: angry: duration_delta must be a number");
    }

    // 验证broadcast_range类型
    if (config.broadcast_range !== undefined && (typeof config.broadcast_range !== "number" || config.broadcast_range < 0)) {
      throw new TypeError("[set error]: angry: broadcast_range must be a number >= 0");
    }

    // 验证数组类型
    if (config.broadcast_targets !== undefined && !Array.isArray(config.broadcast_targets)) {
      throw new TypeError("[set error]: angry: broadcast_targets must be an array");
    }

    this.#opt.components["minecraft:angry"] = config;
  }

  public setAnnotationBreakDoor(config: {
    break_time?: number
    min_difficulty?: 'hard' | 'normal' | 'easy' | 'peaceful'
  }): void {
    if (typeof config !== "object" || config === null) {
      throw new Error("[set error]: annotation.break_door: must be an object configuration");
    }

    // 初始化components对象如果不存在
    if (!this.#opt.components) {
      this.#opt.components = {};
    }

    // 验证break_time类型
    if (config.break_time !== undefined && (typeof config.break_time !== "number" || config.break_time < 0)) {
      throw new TypeError("[set error]: annotation.break_door: break_time must be a number >= 0");
    }

    // 验证min_difficulty类型
    if (config.min_difficulty !== undefined && !['hard', 'normal', 'easy', 'peaceful'].includes(config.min_difficulty)) {
      throw new TypeError("[set error]: annotation.break_door: min_difficulty must be one of 'hard', 'normal', 'easy', 'peaceful'");
    }

    this.#opt.components["minecraft:annotation.break_door"] = config;
  }

  public setAnnotationOpenDoor(): void {
    // 初始化components对象如果不存在
    if (!this.#opt.components) {
      this.#opt.components = {};
    }

    // minecraft:annotation.open_door 是一个空对象组件
    this.#opt.components["minecraft:annotation.open_door"] = {};
  }

  public setAttack(config: {
    damage?: number | [number, number] | { range_min: number, range_max: number }
    effect_duration?: number
    effect_name?: string
  }): void {
    if (typeof config !== "object" || config === null) {
      throw new Error("[set error]: attack: must be an object configuration");
    }

    // 初始化components对象如果不存在
    if (!this.#opt.components) {
      this.#opt.components = {};
    }

    // 验证damage类型
    if (config.damage !== undefined) {
      if (typeof config.damage === "number") {
        // 单一数字，有效
      } else if (Array.isArray(config.damage) && config.damage.length === 2 &&
        typeof config.damage[0] === "number" && typeof config.damage[1] === "number") {
        // 数组[min, max]，有效
      } else if (typeof config.damage === "object" &&
        config.damage !== null &&
        "range_min" in config.damage && "range_max" in config.damage &&
        typeof config.damage.range_min === "number" && typeof config.damage.range_max === "number") {
        // 对象{range_min, range_max}，有效
      } else {
        throw new TypeError("[set error]: attack: damage must be a number, [min, max] array, or {range_min, range_max} object");
      }
    }

    // 验证effect_duration类型
    if (config.effect_duration !== undefined && typeof config.effect_duration !== "number") {
      throw new TypeError("[set error]: attack: effect_duration must be a number");
    }

    this.#opt.components["minecraft:attack"] = config;
  }

  public setAreaAttack(config: {
    cause?: string
    damage_cooldown?: number
    damage_per_tick?: number
    damage_range?: number
    entity_filter?: any
    play_attack_sound?: boolean
  }): void {
    if (typeof config !== "object" || config === null) {
      throw new Error("[set error]: area_attack: must be an object configuration");
    }

    // 初始化components对象如果不存在
    if (!this.#opt.components) {
      this.#opt.components = {};
    }

    // 验证数值参数
    if (config.damage_cooldown !== undefined &&
      (typeof config.damage_cooldown !== "number" || config.damage_cooldown < 0)) {
      throw new TypeError("[set error]: area_attack: damage_cooldown must be a number >= 0");
    }
    if (config.damage_per_tick !== undefined &&
      (typeof config.damage_per_tick !== "number" || config.damage_per_tick < 0)) {
      throw new TypeError("[set error]: area_attack: damage_per_tick must be a number >= 0");
    }
    if (config.damage_range !== undefined &&
      (typeof config.damage_range !== "number" || config.damage_range < 0)) {
      throw new TypeError("[set error]: area_attack: damage_range must be a number >= 0");
    }

    // 验证布尔类型
    if (config.play_attack_sound !== undefined && typeof config.play_attack_sound !== "boolean") {
      throw new TypeError("[set error]: area_attack: play_attack_sound must be a boolean");
    }

    this.#opt.components["minecraft:area_attack"] = config;
  }

  public setAttackCooldown(config: {
    attack_cooldown_complete_event?: string | { event: string, target?: string }
    attack_cooldown_time?: number | { min: number, max: number }
  }): void {
    if (typeof config !== "object" || config === null) {
      throw new Error("[set error]: attack_cooldown: must be an object configuration");
    }

    // 初始化components对象如果不存在
    if (!this.#opt.components) {
      this.#opt.components = {};
    }

    // 验证attack_cooldown_time类型
    if (config.attack_cooldown_time !== undefined) {
      if (typeof config.attack_cooldown_time === "number") {
        // 单一数字，有效
      } else if (typeof config.attack_cooldown_time === "object" &&
        config.attack_cooldown_time !== null &&
        "min" in config.attack_cooldown_time && "max" in config.attack_cooldown_time &&
        typeof config.attack_cooldown_time.min === "number" && typeof config.attack_cooldown_time.max === "number") {
        // 对象{min, max}，有效
      } else {
        throw new TypeError("[set error]: attack_cooldown: attack_cooldown_time must be a number or {min, max} object");
      }
    }

    this.#opt.components["minecraft:attack_cooldown"] = config;
  }

  public setBalloonable(config: {
    mass?: number
    max_distance?: number
    on_balloon?: any
    on_unballoon?: any
    soft_distance?: number
  }): void {
    if (typeof config !== "object" || config === null) {
      throw new Error("[set error]: balloonable: must be an object configuration");
    }

    // 初始化components对象如果不存在
    if (!this.#opt.components) {
      this.#opt.components = {};
    }

    // 验证数值参数类型
    if (config.mass !== undefined && typeof config.mass !== "number") {
      throw new TypeError("[set error]: balloonable: mass must be a number");
    }
    if (config.max_distance !== undefined && (typeof config.max_distance !== "number" || config.max_distance < 0)) {
      throw new TypeError("[set error]: balloonable: max_distance must be a number >= 0");
    }
    if (config.soft_distance !== undefined && (typeof config.soft_distance !== "number" || config.soft_distance < 0)) {
      throw new TypeError("[set error]: balloonable: soft_distance must be a number >= 0");
    }

    this.#opt.components["minecraft:balloonable"] = config;
  }

  public setBarter(config: {
    barter_table?: string
    cooldown_after_being_attacked?: { min: number, max: number }
  }): void {
    if (typeof config !== "object" || config === null) {
      throw new Error("[set error]: barter: must be an object configuration");
    }

    // 初始化components对象如果不存在
    if (!this.#opt.components) {
      this.#opt.components = {};
    }

    // 验证cooldown_after_being_attacked类型
    if (config.cooldown_after_being_attacked !== undefined) {
      if (typeof config.cooldown_after_being_attacked !== "object" ||
        config.cooldown_after_being_attacked === null ||
        !("min" in config.cooldown_after_being_attacked) ||
        !("max" in config.cooldown_after_being_attacked) ||
        typeof config.cooldown_after_being_attacked.min !== "number" ||
        typeof config.cooldown_after_being_attacked.max !== "number") {
        throw new TypeError("[set error]: barter: cooldown_after_being_attacked must be a {min, max} object");
      }
    }

    this.#opt.components["minecraft:barter"] = config;
  }

  public setBlockClimber(): void {
    // 初始化components对象如果不存在
    if (!this.#opt.components) {
      this.#opt.components = {};
    }

    // minecraft:block_climber 是一个空对象组件
    this.#opt.components["minecraft:block_climber"] = {};
  }

  public setBlockSensor(config: {
    on_break?: Array<{
      block_list?: string[]
      on_block_broken?: string
    }>
    sensor_radius?: number
    sources?: any
  }): void {
    if (typeof config !== "object" || config === null) {
      throw new Error("[set error]: block_sensor: must be an object configuration");
    }

    // 初始化components对象如果不存在
    if (!this.#opt.components) {
      this.#opt.components = {};
    }

    // 验证sensor_radius类型
    if (config.sensor_radius !== undefined &&
      (typeof config.sensor_radius !== "number" ||
        config.sensor_radius < 0 ||
        config.sensor_radius > 32.0)) {
      throw new TypeError("[set error]: block_sensor: sensor_radius must be a number between 0 and 32.0");
    }

    // 验证on_break数组类型
    if (config.on_break !== undefined && !Array.isArray(config.on_break)) {
      throw new TypeError("[set error]: block_sensor: on_break must be an array");
    }

    this.#opt.components["minecraft:block_sensor"] = config;
  }

  public setBodyRotationAxisAligned(): void {
    // 初始化components对象如果不存在
    if (!this.#opt.components) {
      this.#opt.components = {};
    }

    // minecraft:body_rotation_axis_aligned 是一个空对象组件
    this.#opt.components["minecraft:body_rotation_axis_aligned"] = {};
  }

  public setBodyRotationAlwaysFollowsHead(): void {
    // 初始化components对象如果不存在
    if (!this.#opt.components) {
      this.#opt.components = {};
    }

    // minecraft:body_rotation_always_follows_head 是一个空对象组件
    this.#opt.components["minecraft:body_rotation_always_follows_head"] = {};
  }

  public setBodyRotationBlocked(): void {
    // 初始化components对象如果不存在
    if (!this.#opt.components) {
      this.#opt.components = {};
    }

    // minecraft:body_rotation_blocked 是一个空对象组件
    this.#opt.components["minecraft:body_rotation_blocked"] = {};
  }

  public setBodyRotationLockedToVehicle(): void {
    // 初始化components对象如果不存在
    if (!this.#opt.components) {
      this.#opt.components = {};
    }

    // minecraft:body_rotation_locked_to_vehicle 是一个空对象组件
    this.#opt.components["minecraft:body_rotation_locked_to_vehicle"] = {};
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
    if (typeof config !== "object" || config === null) {
      throw new Error("[set error]: boostable: must be an object configuration");
    }

    // 初始化components对象如果不存在
    if (!this.#opt.components) {
      this.#opt.components = {};
    }

    // 验证boost_items数组类型
    if (config.boost_items !== undefined && !Array.isArray(config.boost_items)) {
      throw new TypeError("[set error]: boostable: boost_items must be an array");
    }

    // 验证boost_items数组元素
    if (config.boost_items !== undefined) {
      for (const item of config.boost_items) {
        if (!item || typeof item !== "object" || !item.item || typeof item.item !== "string") {
          throw new TypeError("[set error]: boostable: boost_items must contain objects with 'item' string property");
        }
        if (item.damage !== undefined && typeof item.damage !== "number") {
          throw new TypeError("[set error]: boostable: boost_items item damage must be a number");
        }
      }
    }

    // 验证数值参数
    if (config.duration !== undefined && (typeof config.duration !== "number" || config.duration < 0)) {
      throw new TypeError("[set error]: boostable: duration must be a number >= 0");
    }
    if (config.speed_multiplier !== undefined && (typeof config.speed_multiplier !== "number" || config.speed_multiplier <= 0)) {
      throw new TypeError("[set error]: boostable: speed_multiplier must be a number > 0");
    }

    this.#opt.components["minecraft:boostable"] = config;
  }

  public setBoss(config: {
    hud_range?: number
    name?: string
    should_darken_sky?: boolean
  }): void {
    if (typeof config !== "object" || config === null) {
      throw new Error("[set error]: boss: must be an object configuration");
    }

    // 初始化components对象如果不存在
    if (!this.#opt.components) {
      this.#opt.components = {};
    }

    // 验证hud_range参数
    if (config.hud_range !== undefined && (typeof config.hud_range !== "number" || config.hud_range < 0)) {
      throw new TypeError("[set error]: boss: hud_range must be a number >= 0");
    }

    // 验证name参数
    if (config.name !== undefined && typeof config.name !== "string") {
      throw new TypeError("[set error]: boss: name must be a string");
    }

    // 验证should_darken_sky参数
    if (config.should_darken_sky !== undefined && typeof config.should_darken_sky !== "boolean") {
      throw new TypeError("[set error]: boss: should_darken_sky must be a boolean");
    }

    this.#opt.components["minecraft:boss"] = config;
  }

  public setBreakBlocks(config: {
    breakable_blocks?: string[]
  }): void {
    if (typeof config !== "object" || config === null) {
      throw new Error("[set error]: break_blocks: must be an object configuration");
    }

    // 初始化components对象如果不存在
    if (!this.#opt.components) {
      this.#opt.components = {};
    }

    // 验证breakable_blocks数组类型
    if (config.breakable_blocks !== undefined) {
      if (!Array.isArray(config.breakable_blocks)) {
        throw new TypeError("[set error]: break_blocks: breakable_blocks must be an array");
      }

      // 验证数组元素都是字符串
      for (const block of config.breakable_blocks) {
        if (typeof block !== "string") {
          throw new TypeError("[set error]: break_blocks: breakable_blocks must contain string values");
        }
      }
    }

    this.#opt.components["minecraft:break_blocks"] = config;
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
    if (typeof config !== "object" || config === null) {
      throw new Error("[set error]: breathable: must be an object configuration");
    }

    // 初始化components对象如果不存在
    if (!this.#opt.components) {
      this.#opt.components = {};
    }

    // 验证数组类型的参数
    const arrayProperties = [
      { prop: "breathe_blocks", name: "breathe_blocks" },
      { prop: "non_breathe_blocks", name: "non_breathe_blocks" }
    ];

    for (const { prop, name } of arrayProperties) {
      if (config[prop as keyof typeof config] !== undefined) {
        const value = config[prop as keyof typeof config];
        if (!Array.isArray(value)) {
          throw new TypeError(`[set error]: breathable: ${name} must be an array`);
        }

        // 验证数组元素都是字符串
        for (const item of value as any[]) {
          if (typeof item !== "string") {
            throw new TypeError(`[set error]: breathable: ${name} must contain string values`);
          }
        }
      }
    }

    // 验证布尔类型的参数
    const booleanProperties = [
      "breathes_air", "breathes_lava", "breathes_solids", "breathes_water", "generates_bubbles"
    ];

    for (const prop of booleanProperties) {
      if (config[prop as keyof typeof config] !== undefined &&
        typeof config[prop as keyof typeof config] !== "boolean") {
        throw new TypeError(`[set error]: breathable: ${prop} must be a boolean`);
      }
    }

    // 验证数值类型的参数
    const numberProperties = [
      "inhale_time", "suffocate_time", "suffocateTime", "total_supply", "totalSupply"
    ];

    for (const prop of numberProperties) {
      if (config[prop as keyof typeof config] !== undefined &&
        typeof config[prop as keyof typeof config] !== "number") {
        throw new TypeError(`[set error]: breathable: ${prop} must be a number`);
      }
    }

    this.#opt.components["minecraft:breathable"] = config;
  }

  public setBribeable(config: {
    bribe_cooldown?: number
    bribe_items?: string[] | string
  }): void {
    if (typeof config !== "object" || config === null) {
      throw new Error("[set error]: bribeable: must be an object configuration");
    }

    // 初始化components对象如果不存在
    if (!this.#opt.components) {
      this.#opt.components = {};
    }

    // 验证bribe_cooldown参数
    if (config.bribe_cooldown !== undefined && (typeof config.bribe_cooldown !== "number" || config.bribe_cooldown < 0)) {
      throw new TypeError("[set error]: bribeable: bribe_cooldown must be a number >= 0");
    }

    // 验证bribe_items参数
    if (config.bribe_items !== undefined) {
      if (typeof config.bribe_items !== "string" && !Array.isArray(config.bribe_items)) {
        throw new TypeError("[set error]: bribeable: bribe_items must be a string or an array of strings");
      }

      // 如果是数组，验证数组元素都是字符串
      if (Array.isArray(config.bribe_items)) {
        for (const item of config.bribe_items) {
          if (typeof item !== "string") {
            throw new TypeError("[set error]: bribeable: bribe_items array must contain string values");
          }
        }
      }
    }

    this.#opt.components["minecraft:bribeable"] = config;
  }

  public setBreedable(config: {
    allow_sitting?: boolean
    blend_attributes?: boolean
    breed_cooldown?: number
    breed_items?: string[] | string
    breeds_with?: Array<{
      baby_type?: string
      breed_event?: string | { event: string; filters?: any }
      mate_type?: string
    }> | { baby_type?: string; breed_event?: string | { event: string; filters?: any }; mate_type?: string }
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
    if (typeof config !== "object" || config === null) {
      throw new Error("[set error]: breedable: must be an object configuration");
    }

    // 初始化components对象如果不存在
    if (!this.#opt.components) {
      this.#opt.components = {};
    }

    // 验证布尔类型的参数
    const booleanProperties = [
      "allow_sitting", "blend_attributes", "causes_pregnancy", "inherit_tamed",
      "require_full_health", "require_tame"
    ];

    for (const prop of booleanProperties) {
      if (config[prop as keyof typeof config] !== undefined &&
        typeof config[prop as keyof typeof config] !== "boolean") {
        throw new TypeError(`[set error]: breedable: ${prop} must be a boolean`);
      }
    }

    // 验证数值类型的参数
    if (config.breed_cooldown !== undefined && (typeof config.breed_cooldown !== "number" || config.breed_cooldown < 0)) {
      throw new TypeError("[set error]: breedable: breed_cooldown must be a number >= 0");
    }

    // 验证breed_items参数
    if (config.breed_items !== undefined) {
      if (typeof config.breed_items !== "string" && !Array.isArray(config.breed_items)) {
        throw new TypeError("[set error]: breedable: breed_items must be a string or an array of strings");
      }

      // 如果是数组，验证数组元素都是字符串
      if (Array.isArray(config.breed_items)) {
        for (const item of config.breed_items) {
          if (typeof item !== "string") {
            throw new TypeError("[set error]: breedable: breed_items array must contain string values");
          }
        }
      }
    }

    // 验证extra_baby_chance参数
    if (config.extra_baby_chance !== undefined) {
      if (typeof config.extra_baby_chance !== "object" || config.extra_baby_chance === null ||
        typeof config.extra_baby_chance.min !== "number" || typeof config.extra_baby_chance.max !== "number" ||
        config.extra_baby_chance.min < 0 || config.extra_baby_chance.max < 0 ||
        config.extra_baby_chance.min > config.extra_baby_chance.max) {
        throw new TypeError("[set error]: breedable: extra_baby_chance must be an object with min and max numbers, where min <= max and both >= 0");
      }
    }

    this.#opt.components["minecraft:breedable"] = config;
  }

  public setBuoyant(config: {
    apply_gravity?: boolean
    base_buoyancy?: number
    big_wave_probability?: number
    big_wave_speed?: number
    can_auto_step_from_liquid?: boolean
    drag_down_on_buoyancy_removed?: number
    liquid_blocks?: string[]
    movement_type?: "waves" | "bobbing" | "none"
  }): void {
    if (typeof config !== "object" || config === null) {
      throw new Error("[set error]: buoyant: must be an object configuration");
    }

    // 初始化components对象如果不存在
    if (!this.#opt.components) {
      this.#opt.components = {};
    }

    // 验证布尔类型的参数
    const booleanProperties = ["apply_gravity", "can_auto_step_from_liquid"];
    for (const prop of booleanProperties) {
      if (config[prop as keyof typeof config] !== undefined &&
        typeof config[prop as keyof typeof config] !== "boolean") {
        throw new TypeError(`[set error]: buoyant: ${prop} must be a boolean`);
      }
    }

    // 验证数值类型的参数
    const numberProperties = ["base_buoyancy", "big_wave_probability", "big_wave_speed", "drag_down_on_buoyancy_removed"];
    for (const prop of numberProperties) {
      if (config[prop as keyof typeof config] !== undefined &&
        typeof config[prop as keyof typeof config] !== "number") {
        throw new TypeError(`[set error]: buoyant: ${prop} must be a number`);
      }

      // 特殊验证：big_wave_probability应在[0,1]范围内
      if (prop === "big_wave_probability" && config.big_wave_probability !== undefined &&
        (config.big_wave_probability < 0 || config.big_wave_probability > 1)) {
        throw new TypeError("[set error]: buoyant: big_wave_probability must be between 0 and 1");
      }
    }

    // 验证movement_type参数
    if (config.movement_type !== undefined &&
      !["waves", "bobbing", "none"].includes(config.movement_type)) {
      throw new TypeError("[set error]: buoyant: movement_type must be 'waves', 'bobbing', or 'none'");
    }

    // 验证liquid_blocks数组
    if (config.liquid_blocks !== undefined) {
      if (!Array.isArray(config.liquid_blocks)) {
        throw new TypeError("[set error]: buoyant: liquid_blocks must be an array");
      }

      // 验证数组元素都是字符串
      for (const block of config.liquid_blocks) {
        if (typeof block !== "string") {
          throw new TypeError("[set error]: buoyant: liquid_blocks must contain string values");
        }
      }
    }

    this.#opt.components["minecraft:buoyant"] = config;
  }

  // 以下为新的空对象组件方法
  public setBurnsInDaylight(config: {
    protection_slot?: "slot.armor.body" | "slot.armor.chest" | "slot.armor.feet" | "slot.armor.head" | "slot.armor.legs" | "slot.weapon.mainhand" | "slot.weapon.offhand"
  } = {}): void {
    // 初始化components对象如果不存在
    if (!this.#opt.components) {
      this.#opt.components = {};
    }

    // 验证protection_slot参数
    if (config.protection_slot !== undefined && ![
      "slot.armor.body", "slot.armor.chest", "slot.armor.feet",
      "slot.armor.head", "slot.armor.legs", "slot.weapon.mainhand", "slot.weapon.offhand"
    ].includes(config.protection_slot)) {
      throw new TypeError("[set error]: burns_in_daylight: protection_slot must be a valid armor slot");
    }

    this.#opt.components["minecraft:burns_in_daylight"] = config;
  }

  public setCannotBeAttacked(): void {
    // 初始化components对象如果不存在
    if (!this.#opt.components) {
      this.#opt.components = {};
    }

    // minecraft:cannot_be_attacked 是一个空对象组件
    this.#opt.components["minecraft:cannot_be_attacked"] = {};
  }

  public setCanClimb(): void {
    // 初始化components对象如果不存在
    if (!this.#opt.components) {
      this.#opt.components = {};
    }

    // minecraft:can_climb 是一个空对象组件
    this.#opt.components["minecraft:can_climb"] = {};
  }

  public setCanFly(): void {
    // 初始化components对象如果不存在
    if (!this.#opt.components) {
      this.#opt.components = {};
    }

    // minecraft:can_fly 是一个空对象组件
    this.#opt.components["minecraft:can_fly"] = {};
  }

  public setCanJoinRaid(): void {
    // 初始化components对象如果不存在
    if (!this.#opt.components) {
      this.#opt.components = {};
    }

    // minecraft:can_join_raid 是一个空对象组件
    this.#opt.components["minecraft:can_join_raid"] = {};
  }

  public setCanPowerJump(): void {
    // 初始化components对象如果不存在
    if (!this.#opt.components) {
      this.#opt.components = {};
    }

    // minecraft:can_power_jump 是一个空对象组件
    this.#opt.components["minecraft:can_power_jump"] = {};
  }

  public setCelebrateHunt(config: {
    broadcast?: boolean
    celeberation_targets?: any
    celebrate_sound?: string
    duration?: number
    radius?: number
    sound_interval?: { min: number; max: number }
  }): void {
    if (typeof config !== "object" || config === null) {
      throw new Error("[set error]: celebrate_hunt: must be an object configuration");
    }

    // 初始化components对象如果不存在
    if (!this.#opt.components) {
      this.#opt.components = {};
    }

    // 验证布尔类型的参数
    if (config.broadcast !== undefined && typeof config.broadcast !== "boolean") {
      throw new TypeError("[set error]: celebrate_hunt: broadcast must be a boolean");
    }

    // 验证字符串类型的参数
    if (config.celebrate_sound !== undefined && typeof config.celebrate_sound !== "string") {
      throw new TypeError("[set error]: celebrate_hunt: celebrate_sound must be a string");
    }

    // 验证数值类型的参数
    const numberProperties = ["duration", "radius"];
    for (const prop of numberProperties) {
      if (config[prop as keyof typeof config] !== undefined &&
        typeof config[prop as keyof typeof config] !== "number") {
        throw new TypeError(`[set error]: celebrate_hunt: ${prop} must be a number`);
      }
    }

    // 验证duration必须为正数
    if (config.duration !== undefined && config.duration < 0) {
      throw new TypeError("[set error]: celebrate_hunt: duration must be >= 0");
    }

    // 验证radius必须为正数
    if (config.radius !== undefined && config.radius < 0) {
      throw new TypeError("[set error]: celebrate_hunt: radius must be >= 0");
    }

    // 验证sound_interval参数
    if (config.sound_interval !== undefined) {
      if (typeof config.sound_interval !== "object" || config.sound_interval === null ||
        typeof config.sound_interval.min !== "number" || typeof config.sound_interval.max !== "number" ||
        config.sound_interval.min < 0 || config.sound_interval.max < 0 ||
        config.sound_interval.min > config.sound_interval.max) {
        throw new TypeError("[set error]: celebrate_hunt: sound_interval must be an object with min and max numbers, where min <= max and both >= 0");
      }
    }

    this.#opt.components["minecraft:celebrate_hunt"] = config;
  }

  public setCollisionBox(config: {
    height?: number
    width?: number
  } = {}): void {
    if (typeof config !== "object" || config === null) {
      throw new Error("[set error]: collision_box: must be an object configuration");
    }

    // 初始化components对象如果不存在
    if (!this.#opt.components) {
      this.#opt.components = {};
    }

    // 验证height参数
    if (config.height !== undefined) {
      if (typeof config.height !== "number") {
        throw new TypeError("[set error]: collision_box: height must be a number");
      }
      if (config.height < 0) {
        throw new TypeError("[set error]: collision_box: height must be >= 0");
      }
    }

    // 验证width参数
    if (config.width !== undefined) {
      if (typeof config.width !== "number") {
        throw new TypeError("[set error]: collision_box: width must be a number");
      }
      if (config.width < 0) {
        throw new TypeError("[set error]: collision_box: width must be >= 0");
      }
    }

    this.#opt.components["minecraft:collision_box"] = config;
  }

  public setColor(config: {
    value?: number
  } = {}): void {
    if (typeof config !== "object" || config === null) {
      throw new Error("[set error]: color: must be an object configuration");
    }

    // 初始化components对象如果不存在
    if (!this.#opt.components) {
      this.#opt.components = {};
    }

    // 验证value参数
    if (config.value !== undefined && typeof config.value !== "number") {
      throw new TypeError("[set error]: color: value must be a number");
    }

    this.#opt.components["minecraft:color"] = config;
  }

  public setColor2(config: {
    value?: number
  } = {}): void {
    if (typeof config !== "object" || config === null) {
      throw new Error("[set error]: color2: must be an object configuration");
    }

    // 初始化components对象如果不存在
    if (!this.#opt.components) {
      this.#opt.components = {};
    }

    // 验证value参数
    if (config.value !== undefined && typeof config.value !== "number") {
      throw new TypeError("[set error]: color2: value must be a number");
    }

    this.#opt.components["minecraft:color2"] = config;
  }

  public setCombatRegeneration(config: {
    apply_to_family?: boolean
    apply_to_self?: boolean
    regeneration_duration?: number | "infinite"
  } = {}): void {
    if (typeof config !== "object" || config === null) {
      throw new Error("[set error]: combat_regeneration: must be an object configuration");
    }

    // 初始化components对象如果不存在
    if (!this.#opt.components) {
      this.#opt.components = {};
    }

    // 验证布尔类型的参数
    const booleanProperties = ["apply_to_family", "apply_to_self"];
    for (const prop of booleanProperties) {
      if (config[prop as keyof typeof config] !== undefined &&
        typeof config[prop as keyof typeof config] !== "boolean") {
        throw new TypeError(`[set error]: combat_regeneration: ${prop} must be a boolean`);
      }
    }

    // 验证regeneration_duration参数
    if (config.regeneration_duration !== undefined) {
      if (typeof config.regeneration_duration === "number") {
        if (config.regeneration_duration < 0) {
          throw new TypeError("[set error]: combat_regeneration: regeneration_duration must be >= 0 when a number");
        }
      } else if (config.regeneration_duration !== "infinite") {
        throw new TypeError("[set error]: combat_regeneration: regeneration_duration must be a number or 'infinite'");
      }
    }

    this.#opt.components["minecraft:combat_regeneration"] = config;
  }

  public setConditionalBandwidthOptimization(config: {
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
  } = {}): void {
    if (typeof config !== "object" || config === null) {
      throw new Error("[set error]: conditional_bandwidth_optimization: must be an object configuration");
    }

    // 初始化components对象如果不存在
    if (!this.#opt.components) {
      this.#opt.components = {};
    }

    // 验证conditional_values数组
    if (config.conditional_values !== undefined) {
      if (!Array.isArray(config.conditional_values)) {
        throw new TypeError("[set error]: conditional_bandwidth_optimization: conditional_values must be an array");
      }

      for (let i = 0; i < config.conditional_values.length; i++) {
        const item = config.conditional_values[i];
        if (typeof item !== "object" || item === null) {
          throw new TypeError(`[set error]: conditional_bandwidth_optimization: conditional_values[${i}] must be an object`);
        }

        // 验证max_dropped_ticks
        if (item.max_dropped_ticks !== undefined && typeof item.max_dropped_ticks !== "number") {
          throw new TypeError(`[set error]: conditional_bandwidth_optimization: conditional_values[${i}].max_dropped_ticks must be a number`);
        }

        // 验证max_optimized_distance
        if (item.max_optimized_distance !== undefined && typeof item.max_optimized_distance !== "number") {
          throw new TypeError(`[set error]: conditional_bandwidth_optimization: conditional_values[${i}].max_optimized_distance must be a number`);
        }

        // 验证use_motion_prediction_hints
        if (item.use_motion_prediction_hints !== undefined && typeof item.use_motion_prediction_hints !== "boolean") {
          throw new TypeError(`[set error]: conditional_bandwidth_optimization: conditional_values[${i}].use_motion_prediction_hints must be a boolean`);
        }
      }
    }

    // 验证default_values对象
    if (config.default_values !== undefined) {
      if (typeof config.default_values !== "object" || config.default_values === null) {
        throw new TypeError("[set error]: conditional_bandwidth_optimization: default_values must be an object");
      }

      // 验证max_dropped_ticks
      if (config.default_values.max_dropped_ticks !== undefined && typeof config.default_values.max_dropped_ticks !== "number") {
        throw new TypeError("[set error]: conditional_bandwidth_optimization: default_values.max_dropped_ticks must be a number");
      }

      // 验证max_optimized_distance
      if (config.default_values.max_optimized_distance !== undefined && typeof config.default_values.max_optimized_distance !== "number") {
        throw new TypeError("[set error]: conditional_bandwidth_optimization: default_values.max_optimized_distance must be a number");
      }

      // 验证use_motion_prediction_hints
      if (config.default_values.use_motion_prediction_hints !== undefined && typeof config.default_values.use_motion_prediction_hints !== "boolean") {
        throw new TypeError("[set error]: conditional_bandwidth_optimization: default_values.use_motion_prediction_hints must be a boolean");
      }
    }

    this.#opt.components["minecraft:conditional_bandwidth_optimization"] = config;
  }

  public setCustomHitTest(config: {
    hitboxes?: Array<{
      height?: number
      pivot?: [number, number, number]
      width?: number
    }>
  } = {}): void {
    if (typeof config !== "object" || config === null) {
      throw new Error("[set error]: custom_hit_test: must be an object configuration");
    }

    // 初始化components对象如果不存在
    if (!this.#opt.components) {
      this.#opt.components = {};
    }

    // 验证hitboxes数组
    if (config.hitboxes !== undefined) {
      if (!Array.isArray(config.hitboxes)) {
        throw new TypeError("[set error]: custom_hit_test: hitboxes must be an array");
      }

      for (let i = 0; i < config.hitboxes.length; i++) {
        const hitbox = config.hitboxes[i];
        if (typeof hitbox !== "object" || hitbox === null) {
          throw new TypeError(`[set error]: custom_hit_test: hitboxes[${i}] must be an object`);
        }

        // 验证height
        if (hitbox.height !== undefined) {
          if (typeof hitbox.height !== "number") {
            throw new TypeError(`[set error]: custom_hit_test: hitboxes[${i}].height must be a number`);
          }
          if (hitbox.height < 0) {
            throw new TypeError(`[set error]: custom_hit_test: hitboxes[${i}].height must be >= 0`);
          }
        }

        // 验证width
        if (hitbox.width !== undefined) {
          if (typeof hitbox.width !== "number") {
            throw new TypeError(`[set error]: custom_hit_test: hitboxes[${i}].width must be a number`);
          }
          if (hitbox.width < 0) {
            throw new TypeError(`[set error]: custom_hit_test: hitboxes[${i}].width must be >= 0`);
          }
        }

        // 验证pivot数组
        if (hitbox.pivot !== undefined) {
          if (!Array.isArray(hitbox.pivot) || hitbox.pivot.length !== 3) {
            throw new TypeError(`[set error]: custom_hit_test: hitboxes[${i}].pivot must be an array with 3 numbers [x, y, z]`);
          }
          for (let j = 0; j < hitbox.pivot.length; j++) {
            if (typeof hitbox.pivot[j] !== "number") {
              throw new TypeError(`[set error]: custom_hit_test: hitboxes[${i}].pivot[${j}] must be a number`);
            }
          }
        }
      }
    }

    this.#opt.components["minecraft:custom_hit_test"] = config;
  }

  public setDamageOverTime(config: {
    damage_per_hurt?: number
    time_between_hurt?: number
  } = {}): void {
    if (typeof config !== "object" || config === null) {
      throw new Error("[set error]: damage_over_time: must be an object configuration");
    }

    // 初始化components对象如果不存在
    if (!this.#opt.components) {
      this.#opt.components = {};
    }

    // 验证damage_per_hurt参数
    if (config.damage_per_hurt !== undefined) {
      if (typeof config.damage_per_hurt !== "number" || !Number.isInteger(config.damage_per_hurt)) {
        throw new TypeError("[set error]: damage_over_time: damage_per_hurt must be an integer");
      }
      if (config.damage_per_hurt < 0) {
        throw new TypeError("[set error]: damage_over_time: damage_per_hurt must be >= 0");
      }
    }

    // 验证time_between_hurt参数
    if (config.time_between_hurt !== undefined) {
      if (typeof config.time_between_hurt !== "number") {
        throw new TypeError("[set error]: damage_over_time: time_between_hurt must be a number");
      }
      if (config.time_between_hurt < 0) {
        throw new TypeError("[set error]: damage_over_time: time_between_hurt must be >= 0");
      }
    }

    this.#opt.components["minecraft:damage_over_time"] = config;
  }

  public setDamageSensor(config: {
    deals_damage?: boolean | "yes" | "no" | "no_but_side_effects_apply"
    triggers?: Array<{
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
    }> | {
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
  } = {}): void {
    if (typeof config !== "object" || config === null) {
      throw new Error("[set error]: damage_sensor: must be an object configuration");
    }

    // 初始化components对象如果不存在
    if (!this.#opt.components) {
      this.#opt.components = {};
    }

    // 验证deals_damage参数
    if (config.deals_damage !== undefined) {
      if (typeof config.deals_damage === "boolean") {
        // 布尔值，有效
      } else if (typeof config.deals_damage === "string") {
        const validValues = ["yes", "no", "no_but_side_effects_apply"];
        if (!validValues.includes(config.deals_damage)) {
          throw new TypeError("[set error]: damage_sensor: deals_damage must be boolean or one of 'yes', 'no', 'no_but_side_effects_apply'");
        }
      } else {
        throw new TypeError("[set error]: damage_sensor: deals_damage must be boolean or string");
      }
    }

    // 验证triggers参数
    if (config.triggers !== undefined) {
      if (typeof config.triggers === "object" && config.triggers !== null) {
        if (Array.isArray(config.triggers)) {
          // 数组格式的triggers
          for (let i = 0; i < config.triggers.length; i++) {
            const trigger = config.triggers[i];
            if (typeof trigger !== "object" || trigger === null) {
              throw new TypeError(`[set error]: damage_sensor: triggers[${i}] must be an object`);
            }
            this.#validateDamageSensorTrigger(trigger);
          }
        } else {
          // 单对象格式的triggers
          this.#validateDamageSensorTrigger(config.triggers);
        }
      } else {
        throw new TypeError("[set error]: damage_sensor: triggers must be an object or array of objects");
      }
    }

    this.#opt.components["minecraft:damage_sensor"] = config;
  }

  // 私有方法用于验证damage_sensor的trigger对象
  #validateDamageSensorTrigger(trigger: any): void {
    // 验证cause参数
    if (trigger.cause !== undefined && typeof trigger.cause !== "string") {
      throw new TypeError("[set error]: damage_sensor: trigger.cause must be a string");
    }

    // 验证damage_modifier参数
    if (trigger.damage_modifier !== undefined && typeof trigger.damage_modifier !== "number") {
      throw new TypeError("[set error]: damage_sensor: trigger.damage_modifier must be a number");
    }

    // 验证damage_multiplier参数
    if (trigger.damage_multiplier !== undefined && typeof trigger.damage_multiplier !== "number") {
      throw new TypeError("[set error]: damage_sensor: trigger.damage_multiplier must be a number");
    }

    // 验证deals_damage参数（可以是布尔值或字符串）
    if (trigger.deals_damage !== undefined) {
      if (typeof trigger.deals_damage === "boolean") {
        // 布尔值，有效
      } else if (typeof trigger.deals_damage === "string") {
        // 字符串值，无需额外验证，因为可以接受任何字符串
      } else {
        throw new TypeError("[set error]: damage_sensor: trigger.deals_damage must be boolean or string");
      }
    }

    // 验证event参数
    if (trigger.event !== undefined && typeof trigger.event !== "string") {
      throw new TypeError("[set error]: damage_sensor: trigger.event must be a string");
    }

    // 验证on_damage_sound_event参数
    if (trigger.on_damage_sound_event !== undefined && typeof trigger.on_damage_sound_event !== "string") {
      throw new TypeError("[set error]: damage_sensor: trigger.on_damage_sound_event must be a string");
    }
  }

  public setDash(config: {
    cooldown_time?: number
    horizontal_momentum?: number
    vertical_momentum?: number
  } = {}): void {
    if (typeof config !== "object" || config === null) {
      throw new Error("[set error]: dash: must be an object configuration");
    }

    // 初始化components对象如果不存在
    if (!this.#opt.components) {
      this.#opt.components = {};
    }

    // 验证cooldown_time参数
    if (config.cooldown_time !== undefined) {
      if (typeof config.cooldown_time !== "number") {
        throw new TypeError("[set error]: dash: cooldown_time must be a number");
      }
      if (config.cooldown_time < 0) {
        throw new TypeError("[set error]: dash: cooldown_time must be >= 0");
      }
    }

    // 验证horizontal_momentum参数
    if (config.horizontal_momentum !== undefined && typeof config.horizontal_momentum !== "number") {
      throw new TypeError("[set error]: dash: horizontal_momentum must be a number");
    }

    // 验证vertical_momentum参数
    if (config.vertical_momentum !== undefined && typeof config.vertical_momentum !== "number") {
      throw new TypeError("[set error]: dash: vertical_momentum must be a number");
    }

    this.#opt.components["minecraft:dash"] = config;
  }

  public setDashAction(config: {
    can_dash_underwater?: boolean
    cooldown_time?: number
    direction?: "entity" | "passenger"
    horizontal_momentum?: number
    vertical_momentum?: number
  } = {}): void {
    if (typeof config !== "object" || config === null) {
      throw new Error("[set error]: dash_action: must be an object configuration");
    }

    // 初始化components对象如果不存在
    if (!this.#opt.components) {
      this.#opt.components = {};
    }

    // 验证can_dash_underwater参数
    if (config.can_dash_underwater !== undefined && typeof config.can_dash_underwater !== "boolean") {
      throw new TypeError("[set error]: dash_action: can_dash_underwater must be a boolean");
    }

    // 验证cooldown_time参数
    if (config.cooldown_time !== undefined) {
      if (typeof config.cooldown_time !== "number") {
        throw new TypeError("[set error]: dash_action: cooldown_time must be a number");
      }
      if (config.cooldown_time < 0) {
        throw new TypeError("[set error]: dash_action: cooldown_time must be >= 0");
      }
    }

    // 验证direction参数
    if (config.direction !== undefined) {
      if (config.direction !== "entity" && config.direction !== "passenger") {
        throw new TypeError("[set error]: dash_action: direction must be 'entity' or 'passenger'");
      }
    }

    // 验证horizontal_momentum参数
    if (config.horizontal_momentum !== undefined && typeof config.horizontal_momentum !== "number") {
      throw new TypeError("[set error]: dash_action: horizontal_momentum must be a number");
    }

    // 验证vertical_momentum参数
    if (config.vertical_momentum !== undefined && typeof config.vertical_momentum !== "number") {
      throw new TypeError("[set error]: dash_action: vertical_momentum must be a number");
    }

    this.#opt.components["minecraft:dash_action"] = config;
  }

  public setDefaultLookAngle(config: {
    value?: number
  } = {}): void {
    if (typeof config !== "object" || config === null) {
      throw new Error("[set error]: default_look_angle: must be an object configuration");
    }

    // 初始化components对象如果不存在
    if (!this.#opt.components) {
      this.#opt.components = {};
    }

    // 验证value参数
    if (config.value !== undefined && typeof config.value !== "number") {
      throw new TypeError("[set error]: default_look_angle: value must be a number");
    }

    this.#opt.components["minecraft:default_look_angle"] = config;
  }

  public setDespawn(config: {
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
  } = {}): void {
    if (typeof config !== "object" || config === null) {
      throw new Error("[set error]: despawn: must be an object configuration");
    }

    // 初始化components对象如果不存在
    if (!this.#opt.components) {
      this.#opt.components = {};
    }

    // 验证布尔类型的参数
    const booleanProperties = ["despawn_from_chance", "despawn_from_inactivity", "despawn_from_simulation_edge", "remove_child_entities"];
    for (const prop of booleanProperties) {
      if (config[prop as keyof typeof config] !== undefined &&
        typeof config[prop as keyof typeof config] !== "boolean") {
        throw new TypeError(`[set error]: despawn: ${prop} must be a boolean`);
      }
    }

    // 验证数值类型的参数
    const numberProperties = ["min_range_inactivity_timer", "min_range_random_chance"];
    for (const prop of numberProperties) {
      if (config[prop as keyof typeof config] !== undefined) {
        if (typeof config[prop as keyof typeof config] !== "number" ||
          !Number.isInteger(config[prop as keyof typeof config])) {
          throw new TypeError(`[set error]: despawn: ${prop} must be an integer`);
        }
        if ((config[prop as keyof typeof config] as number) < 0) {
          throw new TypeError(`[set error]: despawn: ${prop} must be >= 0`);
        }
      }
    }

    // 验证despawn_from_distance对象
    if (config.despawn_from_distance !== undefined) {
      if (typeof config.despawn_from_distance !== "object" || config.despawn_from_distance === null) {
        throw new TypeError("[set error]: despawn: despawn_from_distance must be an object");
      }

      // 验证max_distance参数
      if (config.despawn_from_distance.max_distance !== undefined) {
        if (typeof config.despawn_from_distance.max_distance !== "number" ||
          !Number.isInteger(config.despawn_from_distance.max_distance)) {
          throw new TypeError("[set error]: despawn: despawn_from_distance.max_distance must be an integer");
        }
        if (config.despawn_from_distance.max_distance < 0) {
          throw new TypeError("[set error]: despawn: despawn_from_distance.max_distance must be >= 0");
        }
      }

      // 验证min_distance参数
      if (config.despawn_from_distance.min_distance !== undefined) {
        if (typeof config.despawn_from_distance.min_distance !== "number" ||
          !Number.isInteger(config.despawn_from_distance.min_distance)) {
          throw new TypeError("[set error]: despawn: despawn_from_distance.min_distance must be an integer");
        }
        if (config.despawn_from_distance.min_distance < 0) {
          throw new TypeError("[set error]: despawn: despawn_from_distance.min_distance must be >= 0");
        }
      }
    }

    this.#opt.components["minecraft:despawn"] = config;
  }

  public setDimensionBound(): void {
    // 初始化components对象如果不存在
    if (!this.#opt.components) {
      this.#opt.components = {};
    }

    // minecraft:dimension_bound 是一个空对象组件
    this.#opt.components["minecraft:dimension_bound"] = {};
  }

  public setDryingOutTimer(config: {
    dried_out_event?: string | { event: string, target?: string }
    recover_after_dried_out_event?: string | { event: string, target?: string }
    stopped_drying_out_event?: string | { event: string, target?: string }
    total_time?: number
    water_bottle_refill_time?: number
  } = {}): void {
    if (typeof config !== "object" || config === null) {
      throw new Error("[set error]: drying_out_timer: must be an object configuration");
    }

    // 初始化components对象如果不存在
    if (!this.#opt.components) {
      this.#opt.components = {};
    }

    // 验证total_time参数
    if (config.total_time !== undefined) {
      if (typeof config.total_time !== "number" || config.total_time < 0) {
        throw new TypeError("[set error]: drying_out_timer: total_time must be a non-negative number");
      }
    }

    // 验证water_bottle_refill_time参数
    if (config.water_bottle_refill_time !== undefined) {
      if (typeof config.water_bottle_refill_time !== "number" || config.water_bottle_refill_time < 0) {
        throw new TypeError("[set error]: drying_out_timer: water_bottle_refill_time must be a non-negative number");
      }
    }

    // 验证事件参数
    const validEventTypes = ["string", "object"];

    if (config.dried_out_event !== undefined) {
      if (!validEventTypes.includes(typeof config.dried_out_event)) {
        throw new TypeError("[set error]: drying_out_timer: dried_out_event must be a string or object");
      }
      if (typeof config.dried_out_event === "object" &&
        (config.dried_out_event.event === undefined || typeof config.dried_out_event.event !== "string")) {
        throw new TypeError("[set error]: drying_out_timer: dried_out_event object must have an 'event' string property");
      }
    }

    if (config.recover_after_dried_out_event !== undefined) {
      if (!validEventTypes.includes(typeof config.recover_after_dried_out_event)) {
        throw new TypeError("[set error]: drying_out_timer: recover_after_dried_out_event must be a string or object");
      }
      if (typeof config.recover_after_dried_out_event === "object" &&
        (config.recover_after_dried_out_event.event === undefined || typeof config.recover_after_dried_out_event.event !== "string")) {
        throw new TypeError("[set error]: drying_out_timer: recover_after_dried_out_event object must have an 'event' string property");
      }
    }

    if (config.stopped_drying_out_event !== undefined) {
      if (!validEventTypes.includes(typeof config.stopped_drying_out_event)) {
        throw new TypeError("[set error]: drying_out_timer: stopped_drying_out_event must be a string or object");
      }
      if (typeof config.stopped_drying_out_event === "object" &&
        (config.stopped_drying_out_event.event === undefined || typeof config.stopped_drying_out_event.event !== "string")) {
        throw new TypeError("[set error]: drying_out_timer: stopped_drying_out_event object must have an 'event' string property");
      }
    }

    this.#opt.components["minecraft:drying_out_timer"] = config;
  }

  public setDweller(config: {
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
  } = {}): void {
    if (typeof config !== "object" || config === null) {
      throw new Error("[set error]: dweller: must be an object configuration");
    }

    // 初始化components对象如果不存在
    if (!this.#opt.components) {
      this.#opt.components = {};
    }

    // 验证布尔参数
    if (config.can_find_poi !== undefined && typeof config.can_find_poi !== "boolean") {
      throw new TypeError("[set error]: dweller: can_find_poi must be a boolean");
    }

    if (config.can_migrate !== undefined && typeof config.can_migrate !== "boolean") {
      throw new TypeError("[set error]: dweller: can_migrate must be a boolean");
    }

    // 验证数字参数（必须为非负数）
    const numericProperties = [
      "dwelling_bounds_tolerance",
      "first_founding_reward",
      "update_interval_base",
      "update_interval_variant"
    ];

    for (const prop of numericProperties) {
      if ((config as any)[prop] !== undefined) {
        if (typeof (config as any)[prop] !== "number" || (config as any)[prop] < 0) {
          throw new TypeError(`[set error]: dweller: ${prop} must be a non-negative number`);
        }
      }
    }

    this.#opt.components["minecraft:dweller"] = config;
  }

  public setEconomyTradeTable(config: {
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
  } = {}): void {
    if (typeof config !== "object" || config === null) {
      throw new Error("[set error]: economy_trade_table: must be an object configuration");
    }

    // 初始化components对象如果不存在
    if (!this.#opt.components) {
      this.#opt.components = {};
    }

    // 验证布尔参数
    const booleanProperties = [
      "convert_trades_economy",
      "new_screen",
      "persist_trades",
      "show_trade_screen",
      "use_legacy_price_formula"
    ];

    for (const prop of booleanProperties) {
      if ((config as any)[prop] !== undefined && typeof (config as any)[prop] !== "boolean") {
        throw new TypeError(`[set error]: economy_trade_table: ${prop} must be a boolean`);
      }
    }

    // 验证cured_discount参数（可以是单个数字或数组）
    if (config.cured_discount !== undefined) {
      if (Array.isArray(config.cured_discount)) {
        if (config.cured_discount.length !== 2 ||
          typeof config.cured_discount[0] !== "number" ||
          typeof config.cured_discount[1] !== "number") {
          throw new TypeError("[set error]: economy_trade_table: cured_discount array must contain exactly 2 numbers");
        }
      } else if (typeof config.cured_discount !== "number") {
        throw new TypeError("[set error]: economy_trade_table: cured_discount must be a number or array of 2 numbers");
      }
    }

    // 验证max_cured_discount参数
    if (config.max_cured_discount !== undefined) {
      if (Array.isArray(config.max_cured_discount)) {
        if (config.max_cured_discount.length !== 2 ||
          typeof config.max_cured_discount[0] !== "number" ||
          typeof config.max_cured_discount[1] !== "number") {
          throw new TypeError("[set error]: economy_trade_table: max_cured_discount array must contain exactly 2 numbers");
        }
      } else if (typeof config.max_cured_discount !== "number") {
        throw new TypeError("[set error]: economy_trade_table: max_cured_discount must be a number or array of 2 numbers");
      }
    }

    // 验证单一数字参数
    const singleNumericProperties = [
      "hero_demand_discount",
      "max_nearby_cured_discount",
      "nearby_cured_discount"
    ];

    for (const prop of singleNumericProperties) {
      if ((config as any)[prop] !== undefined && typeof (config as any)[prop] !== "number") {
        throw new TypeError(`[set error]: economy_trade_table: ${prop} must be a number`);
      }
    }

    this.#opt.components["minecraft:economy_trade_table"] = config;
  }

  public setEntityArmorEquipmentSlotMapping(config: {
    armor_slot?: string
  } = {}): void {
    if (typeof config !== "object" || config === null) {
      throw new Error("[set error]: entity_armor_equipment_slot_mapping: must be an object configuration");
    }

    // 初始化components对象如果不存在
    if (!this.#opt.components) {
      this.#opt.components = {};
    }

    // 验证armor_slot参数（虽然文档说最好不要显式使用这个组件）
    if (config.armor_slot !== undefined && typeof config.armor_slot !== "string") {
      throw new TypeError("[set error]: entity_armor_equipment_slot_mapping: armor_slot must be a string");
    }

    this.#opt.components["minecraft:entity_armor_equipment_slot_mapping"] = config;
  }

  public setEntitySensor(config: {
    find_players_only?: boolean
    relative_range?: boolean
    subsensors?: Array<{
      cooldown?: number
      event?: string | { event: string, target?: string }
      event_filters?: any
      maximum_count?: number
      minimum_count?: number
      range?: [number, number] | [number, number, number]
      require_all?: boolean
      y_offset?: number
    }>
  } = {}): void {
    if (typeof config !== "object" || config === null) {
      throw new Error("[set error]: entity_sensor: must be an object configuration");
    }

    // 初始化components对象如果不存在
    if (!this.#opt.components) {
      this.#opt.components = {};
    }

    // 验证布尔参数
    if (config.find_players_only !== undefined && typeof config.find_players_only !== "boolean") {
      throw new TypeError("[set error]: entity_sensor: find_players_only must be a boolean");
    }

    if (config.relative_range !== undefined && typeof config.relative_range !== "boolean") {
      throw new TypeError("[set error]: entity_sensor: relative_range must be a boolean");
    }

    // 验证subsensors数组
    if (config.subsensors !== undefined) {
      if (!Array.isArray(config.subsensors)) {
        throw new TypeError("[set error]: entity_sensor: subsensors must be an array");
      }

      for (let i = 0; i < config.subsensors.length; i++) {
        const subsensor = config.subsensors[i];

        // 验证事件参数（字符串或对象）
        if (subsensor && subsensor.event !== undefined) {
          if (typeof subsensor.event !== "string" &&
            (typeof subsensor.event !== "object" || subsensor.event === null ||
              typeof (subsensor.event as any).event !== "string")) {
            throw new TypeError(`[set error]: entity_sensor: subsensors[${i}].event must be a string or event object`);
          }
        }

        // 验证数字参数
        const numericProperties = ["cooldown", "maximum_count", "minimum_count", "y_offset"] as const;
        for (const prop of numericProperties) {
          if (subsensor && subsensor[prop] !== undefined && typeof subsensor[prop] !== "number") {
            throw new TypeError(`[set error]: entity_sensor: subsensors[${i}].${prop} must be a number`);
          }
        }

        // 验证range参数
        if (subsensor && subsensor.range !== undefined) {
          if (!Array.isArray(subsensor.range) ||
            (subsensor.range.length !== 2 && subsensor.range.length !== 3) ||
            !subsensor.range.every(item => typeof item === "number")) {
            throw new TypeError(`[set error]: entity_sensor: subsensors[${i}].range must be an array of 2 or 3 numbers`);
          }
        }

        // 验证布尔参数
        if (subsensor && subsensor.require_all !== undefined && typeof subsensor.require_all !== "boolean") {
          throw new TypeError(`[set error]: entity_sensor: subsensors[${i}].require_all must be a boolean`);
        }
      }
    }

    this.#opt.components["minecraft:entity_sensor"] = config;
  }

  public setEnvironmentSensor(config: {
    triggers?: {
      event?: string | { event: string, target?: string }
      filters?: any
    } | Array<{
      event?: string | { event: string, target?: string }
      filters?: any
    }>
  } = {}): void {
    if (typeof config !== "object" || config === null) {
      throw new Error("[set error]: environment_sensor: must be an object configuration");
    }

    // 初始化components对象如果不存在
    if (!this.#opt.components) {
      this.#opt.components = {};
    }

    // 验证triggers参数
    if (config.triggers !== undefined) {
      if (typeof config.triggers !== "object" || config.triggers === null) {
        throw new TypeError("[set error]: environment_sensor: triggers must be an object or array");
      }

      // 处理数组格式的triggers
      if (Array.isArray(config.triggers)) {
        for (let i = 0; i < config.triggers.length; i++) {
          const trigger = config.triggers[i];

          // 验证事件参数
          if (trigger && trigger.event !== undefined) {
            if (typeof trigger.event !== "string" &&
              (typeof trigger.event !== "object" || trigger.event === null ||
                typeof (trigger.event as any).event !== "string")) {
              throw new TypeError(`[set error]: environment_sensor: triggers[${i}].event must be a string or event object`);
            }
          }
        }
      } else {
        // 处理对象格式的trigger
        if ((config.triggers as any).event !== undefined) {
          const event = (config.triggers as any).event;
          if (typeof event !== "string" &&
            (typeof event !== "object" || event === null ||
              typeof (event as any).event !== "string")) {
            throw new TypeError("[set error]: environment_sensor: triggers.event must be a string or event object");
          }
        }
      }
    }

    this.#opt.components["minecraft:environment_sensor"] = config;
  }

  /**
   * Sets the Equipment table to use for this Entity
   * @param config Equipment configuration
   */
  public setEquipment(config: {
    slot_drop_chance?: Array<
      | string
      | {
        drop_chance?: number
        slot?: string
      }
    >
    table?: string
  } = {}): void {
    // 验证slot_drop_chance参数
    if (config.slot_drop_chance !== undefined) {
      if (!Array.isArray(config.slot_drop_chance)) {
        throw new TypeError("[set error]: equipment: slot_drop_chance must be an array");
      }
      for (let i = 0; i < config.slot_drop_chance.length; i++) {
        const item = config.slot_drop_chance[i];
        if (typeof item !== "string" &&
          (typeof item !== "object" || item === null ||
            !("slot" in item) || !("drop_chance" in item))) {
          throw new TypeError(`[set error]: equipment: slot_drop_chance[${i}] must be a string or object with slot and drop_chance properties`);
        }
        if (typeof item === "object" && item.drop_chance !== undefined &&
          (typeof item.drop_chance !== "number" || item.drop_chance < 0 || item.drop_chance > 1)) {
          throw new TypeError(`[set error]: equipment: slot_drop_chance[${i}].drop_chance must be a decimal number between 0.0 and 1.0`);
        }
      }
    }

    // 验证table参数
    if (config.table !== undefined && typeof config.table !== "string") {
      throw new TypeError("[set error]: equipment: table must be a string");
    }

    if (!this.#opt.components) {
      this.#opt.components = {};
    }
    this.#opt.components["minecraft:equipment"] = config;
  }

  /**
   * Defines an entity's behavior for having items equipped to it
   * @param config Equippable configuration
   */
  public setEquippable(config: {
    slots?: Array<{
      accepted_items?: string[]
      interact_text?: string
      item?: string
      on_equip?: any
      on_unequip?: any
      slot?: number
      [key: string]: any
    }>
  } = {}): void {
    // 验证slots参数
    if (config.slots !== undefined) {
      if (!Array.isArray(config.slots)) {
        throw new TypeError("[set error]: equippable: slots must be an array");
      }
      for (let i = 0; i < config.slots.length; i++) {
        const slot = config.slots[i];
        if (typeof slot !== "object" || slot === null) {
          throw new TypeError(`[set error]: equippable: slots[${i}] must be an object`);
        }

        // 验证accepted_items
        if (slot.accepted_items !== undefined &&
          (!Array.isArray(slot.accepted_items) ||
            !slot.accepted_items.every(item => typeof item === "string"))) {
          throw new TypeError(`[set error]: equippable: slots[${i}].accepted_items must be an array of strings`);
        }

        // 验证interact_text
        if (slot.interact_text !== undefined && typeof slot.interact_text !== "string") {
          throw new TypeError(`[set error]: equippable: slots[${i}].interact_text must be a string`);
        }

        // 验证item
        if (slot.item !== undefined && typeof slot.item !== "string") {
          throw new TypeError(`[set error]: equippable: slots[${i}].item must be a string`);
        }

        // 验证slot number
        if (slot.slot !== undefined && (typeof slot.slot !== "number" || slot.slot < 0)) {
          throw new TypeError(`[set error]: equippable: slots[${i}].slot must be a non-negative number`);
        }
      }
    }

    if (!this.#opt.components) {
      this.#opt.components = {};
    }
    this.#opt.components["minecraft:equippable"] = config;
  }

  /**
   * The entity puts on the desired equipment
   * @param config Equip Item configuration
   */
  public setEquipItem(config: {
    can_wear_armor?: boolean
    excluded_items?: Array<{
      item?: string
      [key: string]: any
    }>
  } = {}): void {
    // 验证can_wear_armor参数
    if (config.can_wear_armor !== undefined && typeof config.can_wear_armor !== "boolean") {
      throw new TypeError("[set error]: equip_item: can_wear_armor must be a boolean");
    }

    // 验证excluded_items参数
    if (config.excluded_items !== undefined) {
      if (!Array.isArray(config.excluded_items)) {
        throw new TypeError("[set error]: equip_item: excluded_items must be an array");
      }
      for (let i = 0; i < config.excluded_items.length; i++) {
        const excludedItem = config.excluded_items[i];
        if (typeof excludedItem !== "object" || excludedItem === null) {
          throw new TypeError(`[set error]: equip_item: excluded_items[${i}] must be an object`);
        }
        if (excludedItem.item !== undefined && typeof excludedItem.item !== "string") {
          throw new TypeError(`[set error]: equip_item: excluded_items[${i}].item must be a string`);
        }
      }
    }

    if (!this.#opt.components) {
      this.#opt.components = {};
    }
    if (!this.#opt.components) {
      this.#opt.components = {};
    }
    this.#opt.components["minecraft:equip_item"] = config;
  }

  /**
   * Defines how much exhaustion each player action should take
   * @param config Exhaustion values configuration
   */
  public setExhaustionValues(config: {
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
  } = {}): void {
    // 验证数字参数（必须为数字且非负数）
    const numericProperties = ["attack", "damage", "heal", "jump", "lunge", "mine", "sprint", "sprint_jump", "swim", "walk"] as const;
    for (const prop of numericProperties) {
      if (config[prop] !== undefined && (typeof config[prop] !== "number" || config[prop] < 0)) {
        throw new TypeError(`[set error]: exhaustion_values: ${prop} must be a non-negative number`);
      }
    }

    if (!this.#opt.components) {
      this.#opt.components = {};
    }
    this.#opt.components["minecraft:exhaustion_values"] = config;
  }

  /**
   * Defines experience rewards for entity interactions
   * @param config Experience reward configuration
   */
  public setExperienceReward(config: {
    on_bred?: string | number | {
      expression?: string
      version?: number
    }
    on_death?: string | number | {
      expression?: string
      version?: number
    }
    [key: string]: any
  } = {}): void {
    // 验证on_bred参数
    if (config.on_bred !== undefined) {
      if (typeof config.on_bred === "string" || typeof config.on_bred === "number") {
        // 有效的字符串(Molang)或数字格式
      } else if (typeof config.on_bred === "object" && config.on_bred !== null) {
        // 验证表达式对象
        if (config.on_bred.expression !== undefined && typeof config.on_bred.expression !== "string") {
          throw new TypeError("[set error]: experience_reward: on_bred.expression must be a string");
        }
        if (config.on_bred.version !== undefined && (typeof config.on_bred.version !== "number" || config.on_bred.version < 0)) {
          throw new TypeError("[set error]: experience_reward: on_bred.version must be a non-negative integer");
        }
      } else {
        throw new TypeError("[set error]: experience_reward: on_bred must be a string, number, or expression object");
      }
    }

    // 验证on_death参数（同on_bred的逻辑）
    if (config.on_death !== undefined) {
      if (typeof config.on_death === "string" || typeof config.on_death === "number") {
        // 有效的字符串(Molang)或数字格式
      } else if (typeof config.on_death === "object" && config.on_death !== null) {
        // 验证表达式对象
        if (config.on_death.expression !== undefined && typeof config.on_death.expression !== "string") {
          throw new TypeError("[set error]: experience_reward: on_death.expression must be a string");
        }
        if (config.on_death.version !== undefined && (typeof config.on_death.version !== "number" || config.on_death.version < 0)) {
          throw new TypeError("[set error]: experience_reward: on_death.version must be a non-negative integer");
        }
      } else {
        throw new TypeError("[set error]: experience_reward: on_death must be a string, number, or expression object");
      }
    }

    if (!this.#opt.components) {
      this.#opt.components = {};
    }
    this.#opt.components["minecraft:experience_reward"] = config;
  }

  /**
   * Defines how the entity explodes
   * @param config Explode configuration
   */
  public setExplode(config: {
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
  } = {}): void {
    // 验证add参数
    if (config.add !== undefined && typeof config.add !== "object") {
      throw new TypeError("[set error]: explode: add must be an object");
    }
    if (config.add?.component_groups !== undefined && (!Array.isArray(config.add.component_groups) ||
      !config.add.component_groups.every(item => typeof item === "string"))) {
      throw new TypeError("[set error]: explode: add.component_groups must be an array of strings");
    }

    // 验证布尔参数
    const booleanProperties = ["allow_underwater", "breaks_blocks", "causes_fire", "destroy_affected_by_griefing",
      "fire_affected_by_griefing", "fuse_lit", "negates_fall_damage", "toggles_blocks"] as const;
    for (const prop of booleanProperties) {
      if (config[prop] !== undefined && typeof config[prop] !== "boolean") {
        throw new TypeError(`[set error]: explode: ${prop} must be a boolean`);
      }
    }

    // 验证数字参数
    const numericProperties = ["damage_scaling", "knockback_scaling", "max_resistance", "power"] as const;
    for (const prop of numericProperties) {
      if (config[prop] !== undefined && typeof config[prop] !== "number") {
        throw new TypeError(`[set error]: explode: ${prop} must be a number`);
      }
    }

    // 验证fuse_length参数（可以是数字或长度为2的数组）
    if (config.fuse_length !== undefined) {
      if (typeof config.fuse_length === "number") {
        // 单个数字值
      } else if (Array.isArray(config.fuse_length) && config.fuse_length.length === 2 &&
        typeof config.fuse_length[0] === "number" && typeof config.fuse_length[1] === "number") {
        // 范围数组 [min, max]
      } else {
        throw new TypeError("[set error]: explode: fuse_length must be a number or array of two numbers");
      }
    }

    // 验证枚举字符串参数
    if (config.particle_effect !== undefined &&
      !["explosion", "wind_burst", "breeze_wind_burst"].includes(config.particle_effect)) {
      throw new TypeError("[set error]: explode: particle_effect must be 'explosion', 'wind_burst', or 'breeze_wind_burst'");
    }

    if (!this.#opt.components) {
      this.#opt.components = {};
    }
    this.#opt.components["minecraft:explode"] = config;
  }

  /**
   * Sets that this entity doesn't take damage from fire
   */
  public setFireImmune(config: {} = {}): void {
    if (!this.#opt.components) {
      this.#opt.components = {};
    }
    this.#opt.components["minecraft:fire_immune"] = config;
  }

  /**
   * Sets that this entity can float in liquid blocks
   */
  public setFloatsInLiquid(config: {} = {}): void {
    if (!this.#opt.components) {
      this.#opt.components = {};
    }
    this.#opt.components["minecraft:floats_in_liquid"] = config;
  }

  /**
   * Allows entities to flock in groups in water or not
   */
  public setFlocking(config: {
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
  } = {}): void {
    // Validate numeric parameters
    const validateNumber = (value: any, name: string): void => {
      if (value !== undefined && typeof value !== "number") {
        throw new TypeError(`[set error]: flocking: ${name} must be a number`);
      }
    };

    const validateInteger = (value: any, name: string): void => {
      if (value !== undefined && (typeof value !== "number" || !Number.isInteger(value))) {
        throw new TypeError(`[set error]: flocking: ${name} must be an integer`);
      }
    };

    const validateBoolean = (value: any, name: string): void => {
      if (value !== undefined && typeof value !== "boolean") {
        throw new TypeError(`[set error]: flocking: ${name} must be a boolean`);
      }
    };

    // Validate loner_chance is between 0 and 1
    if (config.loner_chance !== undefined) {
      if (typeof config.loner_chance !== "number" || config.loner_chance < 0 || config.loner_chance > 1) {
        throw new TypeError("[set error]: flocking: loner_chance must be a number between 0 and 1");
      }
    }

    // Validate all numeric parameters
    const numericParams = [
      "block_distance", "block_weight", "breach_influence", "cohesion_threshold",
      "cohesion_weight", "goal_weight", "influence_radius", "innner_cohesion_threshold",
      "separation_threshold", "separation_weight", "max_height", "min_height"
    ] as const;

    numericParams.forEach(param => {
      if (config[param] !== undefined) {
        validateNumber(config[param], param);
      }
    });

    // Validate integer parameters
    if (config.high_flock_limit !== undefined) validateInteger(config.high_flock_limit, "high_flock_limit");
    if (config.low_flock_limit !== undefined) validateInteger(config.low_flock_limit, "low_flock_limit");

    // Validate boolean parameters
    validateBoolean(config.in_water, "in_water");
    validateBoolean(config.match_variants, "match_variants");
    validateBoolean(config.use_center_of_mass, "use_center_of_mass");

    if (!this.#opt.components) {
      this.#opt.components = {};
    }
    this.#opt.components["minecraft:flocking"] = config;
  }

  /**
   * Sets the flying speed in blocks that this entity flies at
   */
  public setFlyingSpeed(config: {
    value?: number
  } = {}): void {
    if (config.value !== undefined && typeof config.value !== "number") {
      throw new TypeError("[set error]: flying_speed: value must be a number");
    }

    if (!this.#opt.components) {
      this.#opt.components = {};
    }
    this.#opt.components["minecraft:flying_speed"] = config;
  }

  /**
   * Defines the maximum range, in blocks, that a mob will pursue a target
   */
  public setFollowRange(config: {
    max?: number
    value?: number
  } = {}): void {
    if ((config.max !== undefined && typeof config.max !== "number") ||
      (config.value !== undefined && typeof config.value !== "number")) {
      throw new TypeError("[set error]: follow_range: parameters must be numbers");
    }

    if (!this.#opt.components) {
      this.#opt.components = {};
    }
    this.#opt.components["minecraft:follow_range"] = config;
  }

  /**
   * When configured as a rideable entity, the entity will be controlled using WASD controls
   */
  public setFreeCameraControlled(config: {
    backwards_movement_modifier?: number
    strafe_speed_modifier?: number
  } = {}): void {
    if ((config.backwards_movement_modifier !== undefined && typeof config.backwards_movement_modifier !== "number") ||
      (config.strafe_speed_modifier !== undefined && typeof config.strafe_speed_modifier !== "number")) {
      throw new TypeError("[set error]: free_camera_controlled: parameters must be numbers");
    }

    if (!this.#opt.components) {
      this.#opt.components = {};
    }
    this.#opt.components["minecraft:free_camera_controlled"] = config;
  }

  /**
   * Defines how much friction affects this entity
   */
  public setFrictionModifier(config: {
    value?: number
  } = {}): void {
    if (config.value !== undefined && typeof config.value !== "number") {
      throw new TypeError("[set error]: friction_modifier: value must be a number");
    }

    if (!this.#opt.components) {
      this.#opt.components = {};
    }
    this.#opt.components["minecraft:friction_modifier"] = config;
  }

  /**
   * Allows an entity to emit entityMove, swim and flap game events
   */
  public setGameEventMovementTracking(config: {
    emit_flap?: boolean
    emit_move?: boolean
    emit_swim?: boolean
  } = {}): void {
    if ((config.emit_flap !== undefined && typeof config.emit_flap !== "boolean") ||
      (config.emit_move !== undefined && typeof config.emit_move !== "boolean") ||
      (config.emit_swim !== undefined && typeof config.emit_swim !== "boolean")) {
      throw new TypeError("[set error]: game_event_movement_tracking: parameters must be booleans");
    }

    if (!this.#opt.components) {
      this.#opt.components = {};
    }
    this.#opt.components["minecraft:game_event_movement_tracking"] = config;
  }

  /**
   * Defines the way a mob's genes and alleles are passed on to its offspring
   */
  public setGenetics(config: {
    mutation_rate?: number
    genes?: Array<{
      name: string
      use_simplified_breeding?: boolean
      mutation_rate?: number
      allele_range?: number | {
        range_min: number
        range_max: number
      }
      genetic_variants?: Array<{
        birth_event?: string | {
          event: string
          target?: string
        }
        main_allele?: number | {
          range_min: number
          range_max: number
        }
        hidden_allele?: number | {
          range_min: number
          range_max: number
        }
        both_allele?: number | {
          range_min: number
          range_max: number
        }
        either_allele?: number | {
          range_min: number
          range_max: number
        }
      }>
    }>
  } = {}): void {
    // Validate mutation_rate
    if (config.mutation_rate !== undefined && (typeof config.mutation_rate !== "number" || config.mutation_rate < 0)) {
      throw new TypeError("[set error]: genetics: mutation_rate must be a non-negative number");
    }

    // Validate genes array
    if (config.genes !== undefined) {
      if (!Array.isArray(config.genes)) {
        throw new TypeError("[set error]: genetics: genes must be an array");
      }

      for (let i = 0; i < config.genes.length; i++) {
        const gene = config.genes[i];
        if (!gene) continue; // Skip undefined entries

        // Validate gene name is required
        if (typeof gene.name !== "string" || gene.name.trim() === "") {
          throw new TypeError(`[set error]: genetics: genes[${i}].name is required and must be a non-empty string`);
        }

        // Validate use_simplified_breeding
        if (gene.use_simplified_breeding !== undefined && typeof gene.use_simplified_breeding !== "boolean") {
          throw new TypeError(`[set error]: genetics: genes[${i}].use_simplified_breeding must be a boolean`);
        }

        // Validate gene mutation_rate
        if (gene.mutation_rate !== undefined && (typeof gene.mutation_rate !== "number" || gene.mutation_rate < -1)) {
          throw new TypeError(`[set error]: genetics: genes[${i}].mutation_rate must be a number >= -1`);
        }

        // Validate allele_range
        if (gene.allele_range !== undefined) {
          if (typeof gene.allele_range === "number") {
            if (!Number.isInteger(gene.allele_range) || gene.allele_range < 1) {
              throw new TypeError(`[set error]: genetics: genes[${i}].allele_range as number must be a positive integer`);
            }
          } else if (typeof gene.allele_range === "object" && gene.allele_range !== null) {
            if (typeof gene.allele_range.range_min !== "number" || typeof gene.allele_range.range_max !== "number" ||
              !Number.isInteger(gene.allele_range.range_min) || !Number.isInteger(gene.allele_range.range_max) ||
              gene.allele_range.range_min < 1 || gene.allele_range.range_max < gene.allele_range.range_min) {
              throw new TypeError(`[set error]: genetics: genes[${i}].allele_range object must have valid range_min and range_max integers`);
            }
          } else {
            throw new TypeError(`[set error]: genetics: genes[${i}].allele_range must be a number or object`);
          }
        }

        // Validate genetic_variants array
        if (gene.genetic_variants !== undefined) {
          if (!Array.isArray(gene.genetic_variants)) {
            throw new TypeError(`[set error]: genetics: genes[${i}].genetic_variants must be an array`);
          }

          for (let j = 0; j < gene.genetic_variants.length; j++) {
            const variant = gene.genetic_variants[j];
            if (!variant) continue; // Skip undefined entries

            // Validate allele properties
            const validateAllele = (value: any, propName: string): void => {
              if (value !== undefined) {
                if (typeof value === "number") {
                  if (!Number.isInteger(value) || value < -1) {
                    throw new TypeError(`[set error]: genetics: genes[${i}].genetic_variants[${j}].${propName} must be an integer >= -1`);
                  }
                } else if (typeof value === "object" && value !== null) {
                  if (typeof value.range_min !== "number" || typeof value.range_max !== "number" ||
                    !Number.isInteger(value.range_min) || !Number.isInteger(value.range_max) ||
                    value.range_min < 0 || value.range_max < value.range_min) {
                    throw new TypeError(`[set error]: genetics: genes[${i}].genetic_variants[${j}].${propName} object must have valid range_min and range_max integers`);
                  }
                } else {
                  throw new TypeError(`[set error]: genetics: genes[${i}].genetic_variants[${j}].${propName} must be a number or object`);
                }
              }
            };

            validateAllele(variant.main_allele, "main_allele");
            validateAllele(variant.hidden_allele, "hidden_allele");
            validateAllele(variant.both_allele, "both_allele");
            validateAllele(variant.either_allele, "either_allele");

            // Validate birth_event
            if (variant.birth_event !== undefined) {
              if (typeof variant.birth_event !== "string" &&
                (typeof variant.birth_event !== "object" || variant.birth_event === null ||
                  typeof (variant.birth_event as any).event !== "string")) {
                throw new TypeError(`[set error]: genetics: genes[${i}].genetic_variants[${j}].birth_event must be a string or event object`);
              }
            }
          }
        }
      }
    }

    if (!this.#opt.components) {
      this.#opt.components = {};
    }
    this.#opt.components["minecraft:genetics"] = config;
  }

  /**
   * Defines sets of items that can be used to trigger events when used on this entity
   */
  public setGiveable(config: {
    cooldown?: number
    items?: string | string[]
    on_give?: string | {
      event: string
      target?: string
    }
  } = {}): void {
    // Validate cooldown
    if (config.cooldown !== undefined && (typeof config.cooldown !== "number" || config.cooldown < 0)) {
      throw new TypeError("[set error]: giveable: cooldown must be a non-negative number");
    }

    // Validate items
    if (config.items !== undefined) {
      if (typeof config.items === "string") {
        // Valid string
      } else if (Array.isArray(config.items)) {
        for (let i = 0; i < config.items.length; i++) {
          if (typeof config.items[i] !== "string") {
            throw new TypeError(`[set error]: giveable: items[${i}] must be a string`);
          }
        }
      } else {
        throw new TypeError("[set error]: giveable: items must be a string or array of strings");
      }
    }

    // Validate on_give
    if (config.on_give !== undefined) {
      if (typeof config.on_give !== "string" &&
        (typeof config.on_give !== "object" || config.on_give === null ||
          typeof (config.on_give as any).event !== "string")) {
        throw new TypeError("[set error]: giveable: on_give must be a string or event object");
      }
    }

    if (!this.#opt.components) {
      this.#opt.components = {};
    }
    this.#opt.components["minecraft:giveable"] = config;
  }

  /**
   * Sets the offset from the ground that the entity is actually at
   */
  public setGroundOffset(config: {
    value?: number
  } = {}): void {
    if (config.value !== undefined && typeof config.value !== "number") {
      throw new TypeError("[set error]: ground_offset: value must be a number");
    }

    if (!this.#opt.components) {
      this.#opt.components = {};
    }
    this.#opt.components["minecraft:ground_offset"] = config;
  }

  /**
   * Keeps track of entity group size in the given radius
   */
  public setGroupSize(config: {
    radius?: number
    filters?: any
  } = {}): void {
    // Validate radius
    if (config.radius !== undefined && (typeof config.radius !== "number" || config.radius < 0)) {
      throw new TypeError("[set error]: group_size: radius must be a non-negative number");
    }

    // Filters can be any valid Minecraft filter object - minimal validation
    if (config.filters !== undefined && (typeof config.filters !== "object" || config.filters === null)) {
      throw new TypeError("[set error]: group_size: filters must be an object");
    }

    if (!this.#opt.components) {
      this.#opt.components = {};
    }
    this.#opt.components["minecraft:group_size"] = config;
  }

  /**
   * Could increase crop growth when entity walks over crop
   */
  public setGrowsCrop(config: {
    chance?: number
    charges?: number
  } = {}): void {
    // Validate chance (0-1)
    if (config.chance !== undefined && (typeof config.chance !== "number" || config.chance < 0 || config.chance > 1)) {
      throw new TypeError("[set error]: grows_crop: chance must be a number between 0 and 1");
    }

    // Validate charges (must be integer >= 1)
    if (config.charges !== undefined && (typeof config.charges !== "number" || !Number.isInteger(config.charges) || config.charges < 1)) {
      throw new TypeError("[set error]: grows_crop: charges must be a positive integer");
    }

    if (!this.#opt.components) {
      this.#opt.components = {};
    }
    this.#opt.components["minecraft:grows_crop"] = config;
  }

  /**
   * Defines the health pool for an entity, measured in health points (1 point = half a heart)
   */
  public setHealth(config: {
    max?: number
    value?: number | {
      range_min?: number
      range_max?: number
    }
  } = {}): void {
    if (typeof config !== "object" || config === null) {
      throw new TypeError("[set error]: health: must be an object configuration");
    }

    // Validate max health (must be integer >= 1)
    if (config.max !== undefined && (typeof config.max !== "number" || !Number.isInteger(config.max) || config.max < 1)) {
      throw new TypeError("[set error]: health: max must be a positive integer");
    }

    // Validate value as number
    if (config.value !== undefined && typeof config.value === "number") {
      if (!Number.isInteger(config.value) || config.value < 0) {
        throw new TypeError("[set error]: health: value as number must be an integer >= 0");
      }
    }
    // Validate value as object
    else if (config.value !== undefined && typeof config.value === "object" && config.value !== null) {
      if (config.value.range_min !== undefined &&
        (typeof config.value.range_min !== "number" || !Number.isInteger(config.value.range_min) || config.value.range_min < 0)) {
        throw new TypeError("[set error]: health: value.range_min must be an integer >= 0");
      }
      if (config.value.range_max !== undefined &&
        (typeof config.value.range_max !== "number" || !Number.isInteger(config.value.range_max) || config.value.range_max < 0)) {
        throw new TypeError("[set error]: health: value.range_max must be an integer >= 0");
      }
      if (config.value.range_min !== undefined && config.value.range_max !== undefined &&
        config.value.range_max < config.value.range_min) {
        throw new TypeError("[set error]: health: value.range_max must be >= range_min");
      }
    }
    // Validate value is not invalid type
    else if (config.value !== undefined && typeof config.value !== "number" &&
      (typeof config.value !== "object" || config.value === null)) {
      throw new TypeError("[set error]: health: value must be a number or range object");
    }

    if (!this.#opt.components) {
      this.#opt.components = {};
    }
    this.#opt.components["minecraft:health"] = config;
  }

  /**
   * Defines the entity's heartbeat
   */
  public setHeartbeat(config: {
    interval?: string
    sound_event?: string
  } = {}): void {
    if (typeof config !== "object" || config === null) {
      throw new TypeError("[set error]: heartbeat: must be an object configuration");
    }

    // Validate interval (should be a string, typically a Molang expression)
    if (config.interval !== undefined && typeof config.interval !== "string") {
      throw new TypeError("[set error]: heartbeat: interval must be a string (Molang expression)");
    }

    // Validate sound_event (must be string if provided)
    if (config.sound_event !== undefined && typeof config.sound_event !== "string") {
      throw new TypeError("[set error]: heartbeat: sound_event must be a string");
    }

    if (!this.#opt.components) {
      this.#opt.components = {};
    }
    this.#opt.components["minecraft:heartbeat"] = config;
  }

  /**
   * Moves to and hides at their owned POI or the closest nearby
   */
  public setHide(): void {
    if (!this.#opt.components) {
      this.#opt.components = {};
    }
    this.#opt.components["minecraft:hide"] = {};
  }

  /**
   * Saves a home position for when the entity is spawned
   */
  public setHome(config: {
    home_block_list?: string[]
    restriction_radius?: number
    restriction_type?: 'none' | 'random_movement' | 'all_movement'
  } = {}): void {
    if (typeof config !== "object" || config === null) {
      throw new TypeError("[set error]: home: must be an object configuration");
    }

    // Validate home_block_list (must be array of strings if provided)
    if (config.home_block_list !== undefined) {
      if (!Array.isArray(config.home_block_list)) {
        throw new TypeError("[set error]: home: home_block_list must be an array");
      }
      for (let i = 0; i < config.home_block_list.length; i++) {
        const block = config.home_block_list[i];
        if (typeof block !== "string" || block.trim() === "") {
          throw new TypeError(`[set error]: home: home_block_list[${i}] must be a non-empty string`);
        }
      }
    }

    // Validate restriction_radius (must be integer >= 0)
    if (config.restriction_radius !== undefined &&
      (typeof config.restriction_radius !== "number" || !Number.isInteger(config.restriction_radius) || config.restriction_radius < 0)) {
      throw new TypeError("[set error]: home: restriction_radius must be an integer >= 0");
    }

    // Validate restriction_type (must be one of the valid values)
    if (config.restriction_type !== undefined &&
      !['none', 'random_movement', 'all_movement'].includes(config.restriction_type)) {
      throw new TypeError("[set error]: home: restriction_type must be 'none', 'random_movement', or 'all_movement'");
    }

    if (!this.#opt.components) {
      this.#opt.components = {};
    }
    this.#opt.components["minecraft:home"] = config;
  }

  /**
   * Determines the jump height for a horse or similar entity
   */
  public setHorseJumpStrength(config: {
    value?: number | {
      range_min?: number
      range_max?: number
    }
  } = {}): void {
    if (typeof config !== "object" || config === null) {
      throw new TypeError("[set error]: horse.jump_strength: must be an object configuration");
    }

    // Validate value as number
    if (config.value !== undefined && typeof config.value === "number") {
      if (typeof config.value !== "number" || config.value < 0) {
        throw new TypeError("[set error]: horse.jump_strength: value as number must be >= 0");
      }
    }
    // Validate value as object
    else if (config.value !== undefined && typeof config.value === "object" && config.value !== null) {
      if (config.value.range_min !== undefined &&
        (typeof config.value.range_min !== "number" || config.value.range_min < 0)) {
        throw new TypeError("[set error]: horse.jump_strength: value.range_min must be >= 0");
      }
      if (config.value.range_max !== undefined &&
        (typeof config.value.range_max !== "number" || config.value.range_max < 0)) {
        throw new TypeError("[set error]: horse.jump_strength: value.range_max must be >= 0");
      }
      if (config.value.range_min !== undefined && config.value.range_max !== undefined &&
        config.value.range_max < config.value.range_min) {
        throw new TypeError("[set error]: horse.jump_strength: value.range_max must be >= range_min");
      }
    }
    // Validate value is not invalid type
    else if (config.value !== undefined && typeof config.value !== "number" &&
      (typeof config.value !== "object" || config.value === null)) {
      throw new TypeError("[set error]: horse.jump_strength: value must be a number or range object");
    }

    if (!this.#opt.components) {
      this.#opt.components = {};
    }
    this.#opt.components["minecraft:horse.jump_strength"] = config;
  }

  /**
   * Defines a set of conditions under which an entity should take damage
   */
  public setHurtOnCondition(config: {
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
  } = {}): void {
    if (typeof config !== "object" || config === null) {
      throw new TypeError("[set error]: hurt_on_condition: must be an object configuration");
    }

    // Validate damage_conditions array
    if (config.damage_conditions !== undefined) {
      if (!Array.isArray(config.damage_conditions)) {
        throw new TypeError("[set error]: hurt_on_condition: damage_conditions must be an array");
      }

      for (let i = 0; i < config.damage_conditions.length; i++) {
        const condition = config.damage_conditions[i];
        if (!condition) continue; // Skip undefined entries

        // Validate cause (must be string if provided)
        if (condition.cause !== undefined && typeof condition.cause !== "string") {
          throw new TypeError(`[set error]: hurt_on_condition: damage_conditions[${i}].cause must be a string`);
        }

        // Validate damage_per_tick (must be integer >= 0 if provided)
        if (condition.damage_per_tick !== undefined &&
          (typeof condition.damage_per_tick !== "number" || !Number.isInteger(condition.damage_per_tick) || condition.damage_per_tick < 0)) {
          throw new TypeError(`[set error]: hurt_on_condition: damage_conditions[${i}].damage_per_tick must be an integer >= 0`);
        }

        // Validate filters (must be object if provided)
        if (condition.filters !== undefined &&
          (typeof condition.filters !== "object" || condition.filters === null)) {
          throw new TypeError(`[set error]: hurt_on_condition: damage_conditions[${i}].filters must be an object`);
        }
      }
    }

    if (!this.#opt.components) {
      this.#opt.components = {};
    }
    this.#opt.components["minecraft:hurt_on_condition"] = config;
  }

  /**
   * Prevents entities from attacking the owner entity unless explicitly allowed
   */
  public setIgnoreCannotBeAttacked(config: {
    filters?: {
      subject?: string
      test?: string
      value?: any
      operator?: string
      [key: string]: any
    }
  } = {}): void {
    if (typeof config !== "object" || config === null) {
      throw new TypeError("[set error]: ignore_cannot_be_attacked: must be an object configuration");
    }

    // Validate filters (must be object if provided)
    if (config.filters !== undefined &&
      (typeof config.filters !== "object" || config.filters === null)) {
      throw new TypeError("[set error]: ignore_cannot_be_attacked: filters must be an object");
    }

    // Validate subject in filters (must be string if provided)
    if (config.filters?.subject !== undefined && typeof config.filters.subject !== "string") {
      throw new TypeError("[set error]: ignore_cannot_be_attacked: filters.subject must be a string");
    }

    // Validate test in filters (must be string if provided)
    if (config.filters?.test !== undefined && typeof config.filters.test !== "string") {
      throw new TypeError("[set error]: ignore_cannot_be_attacked: filters.test must be a string");
    }

    // Validate operator in filters (must be string if provided)
    if (config.filters?.operator !== undefined && typeof config.filters.operator !== "string") {
      throw new TypeError("[set error]: ignore_cannot_be_attacked: filters.operator must be a string");
    }

    if (!this.#opt.components) {
      this.#opt.components = {};
    }
    this.#opt.components["minecraft:ignore_cannot_be_attacked"] = config;
  }

  /**
   * Applies WASD controls for rideable entities in air (3D movement control)
   */
  public setInputAirControlled(config: Record<string, any> = {}): void {
    if (typeof config !== "object" || config === null) {
      throw new TypeError("[set error]: input_air_controlled: must be an object configuration");
    }

    if (!this.#opt.components) {
      this.#opt.components = {};
    }
    this.#opt.components["minecraft:input_air_controlled"] = config;
  }

  /**
   * Applies WASD controls for rideable entities on ground
   */
  public setInputGroundControlled(): void {
    if (!this.#opt.components) {
      this.#opt.components = {};
    }
    this.#opt.components["minecraft:input_ground_controlled"] = {};
  }

  /**
   * Monitors when the entity enters or exits specific blocks and triggers events
   */
  public setInsideBlockNotifier(config: {
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
  } = {}): void {
    if (typeof config !== "object" || config === null) {
      throw new TypeError("[set error]: inside_block_notifier: must be an object configuration");
    }

    // Validate block_list array
    if (config.block_list !== undefined) {
      if (!Array.isArray(config.block_list)) {
        throw new TypeError("[set error]: inside_block_notifier: block_list must be an array");
      }

      for (let i = 0; i < config.block_list.length; i++) {
        const blockEntry = config.block_list[i];
        if (!blockEntry) continue; // Skip undefined entries

        // Validate block object (must be object if provided)
        if (blockEntry.block !== undefined &&
          (typeof blockEntry.block !== "object" || blockEntry.block === null)) {
          throw new TypeError(`[set error]: inside_block_notifier: block_list[${i}].block must be an object`);
        }

        // Validate block name (must be string if provided)
        if (blockEntry.block?.name !== undefined && typeof blockEntry.block.name !== "string") {
          throw new TypeError(`[set error]: inside_block_notifier: block_list[${i}].block.name must be a string`);
        }

        // Validate block states (must be object if provided)
        if (blockEntry.block?.states !== undefined &&
          (typeof blockEntry.block.states !== "object" || blockEntry.block.states === null)) {
          throw new TypeError(`[set error]: inside_block_notifier: block_list[${i}].block.states must be an object`);
        }

        // Validate entered_block_event (must be object if provided)
        if (blockEntry.entered_block_event !== undefined &&
          (typeof blockEntry.entered_block_event !== "object" || blockEntry.entered_block_event === null)) {
          throw new TypeError(`[set error]: inside_block_notifier: block_list[${i}].entered_block_event must be an object`);
        }

        // Validate entered_block_event event property (must be string if provided)
        if (blockEntry.entered_block_event?.event !== undefined && typeof blockEntry.entered_block_event.event !== "string") {
          throw new TypeError(`[set error]: inside_block_notifier: block_list[${i}].entered_block_event.event must be a string`);
        }

        // Validate entered_block_event target property (must be string if provided)
        if (blockEntry.entered_block_event?.target !== undefined && typeof blockEntry.entered_block_event.target !== "string") {
          throw new TypeError(`[set error]: inside_block_notifier: block_list[${i}].entered_block_event.target must be a string`);
        }

        // Validate exited_block_event (must be object if provided)
        if (blockEntry.exited_block_event !== undefined &&
          (typeof blockEntry.exited_block_event !== "object" || blockEntry.exited_block_event === null)) {
          throw new TypeError(`[set error]: inside_block_notifier: block_list[${i}].exited_block_event must be an object`);
        }

        // Validate exited_block_event event property (must be string if provided)
        if (blockEntry.exited_block_event?.event !== undefined && typeof blockEntry.exited_block_event.event !== "string") {
          throw new TypeError(`[set error]: inside_block_notifier: block_list[${i}].exited_block_event.event must be a string`);
        }

        // Validate exited_block_event target property (must be string if provided)
        if (blockEntry.exited_block_event?.target !== undefined && typeof blockEntry.exited_block_event.target !== "string") {
          throw new TypeError(`[set error]: inside_block_notifier: block_list[${i}].exited_block_event.target must be a string`);
        }
      }
    }

    if (!this.#opt.components) {
      this.#opt.components = {};
    }
    this.#opt.components["minecraft:inside_block_notifier"] = config;
  }

  /**
   * Adds a timer since last rested to see if phantoms should spawn
   */
  public setInsomnia(config: {
    days_until_insomnia?: number // Number of days the mob has to stay up until the insomnia effect begins
  } = {}): void {
    if (typeof config !== "object" || config === null) {
      throw new TypeError("[set error]: insomnia: must be an object configuration");
    }

    // Validate days_until_insomnia (must be number >= 0 if provided)
    if (config.days_until_insomnia !== undefined &&
      (typeof config.days_until_insomnia !== "number" || config.days_until_insomnia < 0)) {
      throw new TypeError("[set error]: insomnia: days_until_insomnia must be a number >= 0");
    }

    if (!this.#opt.components) {
      this.#opt.components = {};
    }
    this.#opt.components["minecraft:insomnia"] = config;
  }

  /**
   * Despawns the Actor immediately
   */
  public setInstantDespawn(config: {
    remove_child_entities?: boolean // If true, all entities linked to this entity in a child relationship will also be despawned
  } = {}): void {
    if (typeof config !== "object" || config === null) {
      throw new TypeError("[set error]: instant_despawn: must be an object configuration");
    }

    // Validate remove_child_entities (must be boolean if provided)
    if (config.remove_child_entities !== undefined &&
      typeof config.remove_child_entities !== "boolean") {
      throw new TypeError("[set error]: instant_despawn: remove_child_entities must be a boolean");
    }

    if (!this.#opt.components) {
      this.#opt.components = {};
    }
    this.#opt.components["minecraft:instant_despawn"] = config;
  }

  /**
   * Defines interactions with this entity
   */
  public setInteract(config: {
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
      on_interact?: string | {
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
      vibration?: 'none' | 'shear' | 'entity_die' | 'entity_act' | 'entity_interact'
    }>
  } = {}): void {
    if (typeof config !== "object" || config === null) {
      throw new TypeError("[set error]: interact: must be an object configuration");
    }

    // Validate cooldown (must be number >= 0 if provided)
    if (config.cooldown !== undefined &&
      (typeof config.cooldown !== "number" || config.cooldown < 0)) {
      throw new TypeError("[set error]: interact: cooldown must be a number >= 0");
    }

    // Validate cooldown_after_being_attacked (must be number >= 0 if provided)
    if (config.cooldown_after_being_attacked !== undefined &&
      (typeof config.cooldown_after_being_attacked !== "number" || config.cooldown_after_being_attacked < 0)) {
      throw new TypeError("[set error]: interact: cooldown_after_being_attacked must be a number >= 0");
    }

    // Validate drop_item_y_offset (must be number if provided)
    if (config.drop_item_y_offset !== undefined &&
      typeof config.drop_item_y_offset !== "number") {
      throw new TypeError("[set error]: interact: drop_item_y_offset must be a number");
    }

    // Validate health_amount (must be number if provided)
    if (config.health_amount !== undefined &&
      typeof config.health_amount !== "number") {
      throw new TypeError("[set error]: interact: health_amount must be a number");
    }

    // Validate hurt_item (must be integer >= 0 if provided)
    if (config.hurt_item !== undefined &&
      (typeof config.hurt_item !== "number" || !Number.isInteger(config.hurt_item) || config.hurt_item < 0)) {
      throw new TypeError("[set error]: interact: hurt_item must be an integer >= 0");
    }

    // Validate interact_text (must be string if provided)
    if (config.interact_text !== undefined &&
      typeof config.interact_text !== "string") {
      throw new TypeError("[set error]: interact: interact_text must be a string");
    }

    // Validate interactions array
    if (config.interactions !== undefined) {
      if (!Array.isArray(config.interactions)) {
        throw new TypeError("[set error]: interact: interactions must be an array");
      }

      for (let i = 0; i < config.interactions.length; i++) {
        const interaction = config.interactions[i];
        if (!interaction) continue; // Skip undefined entries

        // Validate give_item (must be boolean if provided)
        if (interaction.give_item !== undefined &&
          typeof interaction.give_item !== "boolean") {
          throw new TypeError(`[set error]: interact: interactions[${i}].give_item must be a boolean`);
        }

        // Validate hurt_item (must be number if provided)
        if (interaction.hurt_item !== undefined &&
          typeof interaction.hurt_item !== "number") {
          throw new TypeError(`[set error]: interact: interactions[${i}].hurt_item must be a number`);
        }

        // Validate interact_text (must be string if provided)
        if (interaction.interact_text !== undefined &&
          typeof interaction.interact_text !== "string") {
          throw new TypeError(`[set error]: interact: interactions[${i}].interact_text must be a string`);
        }

        // Validate on_interact (must be string or object if provided)
        if (interaction.on_interact !== undefined &&
          typeof interaction.on_interact !== "string" &&
          (typeof interaction.on_interact !== "object" || interaction.on_interact === null)) {
          throw new TypeError(`[set error]: interact: interactions[${i}].on_interact must be a string or object`);
        }

        // Validate particle_on_start array
        if (interaction.particle_on_start !== undefined) {
          if (!Array.isArray(interaction.particle_on_start)) {
            throw new TypeError(`[set error]: interact: interactions[${i}].particle_on_start must be an array`);
          }

          for (let j = 0; j < interaction.particle_on_start.length; j++) {
            const particle = interaction.particle_on_start[j];
            if (!particle) continue;

            // Validate particle_offset_towards_interactor (boolean if provided)
            if (particle.particle_offset_towards_interactor !== undefined &&
              typeof particle.particle_offset_towards_interactor !== "boolean") {
              throw new TypeError(`[set error]: interact: interactions[${i}].particle_on_start[${j}].particle_offset_towards_interactor must be a boolean`);
            }

            // Validate particle_type (string if provided)
            if (particle.particle_type !== undefined &&
              typeof particle.particle_type !== "string") {
              throw new TypeError(`[set error]: interact: interactions[${i}].particle_on_start[${j}].particle_type must be a string`);
            }

            // Validate particle_y_offset (number if provided)
            if (particle.particle_y_offset !== undefined &&
              typeof particle.particle_y_offset !== "number") {
              throw new TypeError(`[set error]: interact: interactions[${i}].particle_on_start[${j}].particle_y_offset must be a number`);
            }
          }
        }

        // Validate play_sounds (string if provided)
        if (interaction.play_sounds !== undefined &&
          typeof interaction.play_sounds !== "string") {
          throw new TypeError(`[set error]: interact: interactions[${i}].play_sounds must be a string`);
        }

        // Validate repair_entity_item array
        if (interaction.repair_entity_item !== undefined) {
          if (!Array.isArray(interaction.repair_entity_item)) {
            throw new TypeError(`[set error]: interact: interactions[${i}].repair_entity_item must be an array`);
          }

          for (let j = 0; j < interaction.repair_entity_item.length; j++) {
            const repair = interaction.repair_entity_item[j];
            if (!repair) continue;

            // Validate amount (integer if provided)
            if (repair.amount !== undefined &&
              (typeof repair.amount !== "number" || !Number.isInteger(repair.amount))) {
              throw new TypeError(`[set error]: interact: interactions[${i}].repair_entity_item[${j}].amount must be an integer`);
            }
          }
        }

        // Validate spawn_entities (string if provided)
        if (interaction.spawn_entities !== undefined &&
          typeof interaction.spawn_entities !== "string") {
          throw new TypeError(`[set error]: interact: interactions[${i}].spawn_entities must be a string`);
        }

        // Validate spawn_items array
        if (interaction.spawn_items !== undefined) {
          if (!Array.isArray(interaction.spawn_items)) {
            throw new TypeError(`[set error]: interact: interactions[${i}].spawn_items must be an array`);
          }

          for (let j = 0; j < interaction.spawn_items.length; j++) {
            const spawn = interaction.spawn_items[j];
            if (!spawn) continue;

            // Validate table (string if provided)
            if (spawn.table !== undefined &&
              typeof spawn.table !== "string") {
              throw new TypeError(`[set error]: interact: interactions[${i}].spawn_items[${j}].table must be a string`);
            }

            // Validate y_offset (number if provided)
            if (spawn.y_offset !== undefined &&
              typeof spawn.y_offset !== "number") {
              throw new TypeError(`[set error]: interact: interactions[${i}].spawn_items[${j}].y_offset must be a number`);
            }
          }
        }

        // Validate swing (boolean if provided)
        if (interaction.swing !== undefined &&
          typeof interaction.swing !== "boolean") {
          throw new TypeError(`[set error]: interact: interactions[${i}].swing must be a boolean`);
        }

        // Validate take_item (boolean if provided)
        if (interaction.take_item !== undefined &&
          typeof interaction.take_item !== "boolean") {
          throw new TypeError(`[set error]: interact: interactions[${i}].take_item must be a boolean`);
        }

        // Validate transform_to_item (string if provided)
        if (interaction.transform_to_item !== undefined &&
          typeof interaction.transform_to_item !== "string") {
          throw new TypeError(`[set error]: interact: interactions[${i}].transform_to_item must be a string`);
        }

        // Validate use_item (boolean if provided)
        if (interaction.use_item !== undefined &&
          typeof interaction.use_item !== "boolean") {
          throw new TypeError(`[set error]: interact: interactions[${i}].use_item must be a boolean`);
        }

        // Validate vibration (must be valid value if provided)
        if (interaction.vibration !== undefined &&
          !['none', 'shear', 'entity_die', 'entity_act', 'entity_interact'].includes(interaction.vibration)) {
          throw new TypeError(`[set error]: interact: interactions[${i}].vibration must be one of: 'none', 'shear', 'entity_die', 'entity_act', 'entity_interact'`);
        }
      }
    }

    if (!this.#opt.components) {
      this.#opt.components = {};
    }
    this.#opt.components["minecraft:interact"] = config;
  }

  public setInventory(config: {
    additional_slots_per_strength?: number
    can_be_siphoned_from?: boolean
    container_type?: string
    inventory_size?: number
    private?: boolean
    restrict_to_owner?: boolean
  } = {}): void {
    if (typeof config !== "object" || config === null) {
      throw new TypeError("[set error]: inventory: must be an object configuration");
    }

    // Validate additional_slots_per_strength (number if provided)
    if (config.additional_slots_per_strength !== undefined &&
      typeof config.additional_slots_per_strength !== "number") {
      throw new TypeError("[set error]: inventory: additional_slots_per_strength must be a number");
    }

    // Validate can_be_siphoned_from (boolean if provided)
    if (config.can_be_siphoned_from !== undefined &&
      typeof config.can_be_siphoned_from !== "boolean") {
      throw new TypeError("[set error]: inventory: can_be_siphoned_from must be a boolean");
    }

    // Validate container_type (string if provided)
    if (config.container_type !== undefined &&
      typeof config.container_type !== "string") {
      throw new TypeError("[set error]: inventory: container_type must be a string");
    }

    // Validate inventory_size (number if provided)
    if (config.inventory_size !== undefined &&
      typeof config.inventory_size !== "number") {
      throw new TypeError("[set error]: inventory: inventory_size must be a number");
    }

    // Validate private (boolean if provided)
    if (config.private !== undefined &&
      typeof config.private !== "boolean") {
      throw new TypeError("[set error]: inventory: private must be a boolean");
    }

    // Validate restrict_to_owner (boolean if provided)
    if (config.restrict_to_owner !== undefined &&
      typeof config.restrict_to_owner !== "boolean") {
      throw new TypeError("[set error]: inventory: restrict_to_owner must be a boolean");
    }

    if (!this.#opt.components) {
      this.#opt.components = {};
    }
    this.#opt.components["minecraft:inventory"] = config;
  }

  public setIsBaby(): void {
    if (!this.#opt.components) {
      this.#opt.components = {};
    }
    this.#opt.components["minecraft:is_baby"] = {};
  }

  public setIsCharged(): void {
    if (!this.#opt.components) {
      this.#opt.components = {};
    }
    this.#opt.components["minecraft:is_charged"] = {};
  }

  public setIsChested(): void {
    if (!this.#opt.components) {
      this.#opt.components = {};
    }
    this.#opt.components["minecraft:is_chested"] = {};
  }

  public setIsDyeable(config: {
    interact_text?: string
  } = {}): void {
    if (typeof config !== "object" || config === null) {
      throw new TypeError("[set error]: is_dyeable: must be an object configuration");
    }

    // Validate interact_text (string if provided)
    if (config.interact_text !== undefined &&
      typeof config.interact_text !== "string") {
      throw new TypeError("[set error]: is_dyeable: interact_text must be a string");
    }

    if (!this.#opt.components) {
      this.#opt.components = {};
    }
    this.#opt.components["minecraft:is_dyeable"] = config;
  }
}

export { EntityComponent }
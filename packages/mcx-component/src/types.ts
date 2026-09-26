import { ParticleTypeEnum } from './types/ParticleType';
import { SoundEventEnum } from './types/SoundEvent';
import { EnchantableSlotArray, EnchantableSlotEnum } from './types/EnchantableSlot';
import { AttackCriticalHitChoicesEnum } from './types/AttackCriticalHitChoices';
import { StartSoundChoicesEnum } from './types/StartSoundChoices';
import type { EntityComponentOptions as BaseEntityComponentOptions } from '@mbler/mcx-types';

export {
  ParticleTypeEnum,
  SoundEventEnum,
  EnchantableSlotArray,
  EnchantableSlotEnum,
  AttackCriticalHitChoicesEnum,
  StartSoundChoicesEnum,
};

export type {
  ParticleType,
  SoundEvent,
  EnchantableSlot,
  AttackCriticalHitChoices,
  StartSoundChoices,
  Rarity,
  FoodEffect,
  ItemComponentOptions,
  MenuCategory,
  BlockComponentOptions,
  AddRiderConfig,
  MobEffectConfig,
  JumpMovementConfig,
  NavigationConfig,
  NavigationFloatConfig,
  BaseJson,
  EntityJson,
  ItemJson,
  JSONValue,
} from '@mbler/mcx-types';

type DefineEntry =
  | { from: 'var'; data: string }
  | { from: 'read_file'; data: { base: string; file: string }; default?: string };

export type FileEditExpression<T extends Record<string, DefineEntry>> = {
  define: T;
  run: (define: { [K in keyof T]: string }) => Promise<
    string | string[] | [string, string][]
  >;
};

export function createFileEdit<T extends Record<string, DefineEntry>>(
  expression: FileEditExpression<T>,
): FileEditExpression<T> {
  return expression;
}

type EntityComponents = NonNullable<
  BaseEntityComponentOptions['components']
>;

/**
 * EntityComponent options with the complete bedrock entity component key set:
 * base components from @mbler/mcx-types plus every component and
 * minecraft:behavior.* AI goal listed in the entity reference docs.
 */
export type EntityComponentOptions = Omit<
  BaseEntityComponentOptions,
  'components'
> & {
  components?: EntityComponents & {
    'minecraft:ambient_sound_interval'?: Record<string, unknown>;
    'minecraft:apply_knockback_rules'?: Record<string, unknown>;
    'minecraft:apply_knockback_rules_instance'?: Record<string, unknown>;
    'minecraft:block_movement_slowdown_immunity'?: Record<string, unknown>;
    'minecraft:healable'?: Record<string, unknown>;
    'minecraft:is_collidable'?: Record<string, unknown>;
    'minecraft:is_hidden_when_invisible'?: Record<string, unknown>;
    'minecraft:is_illager_captain'?: Record<string, unknown>;
    'minecraft:is_saddled'?: Record<string, unknown>;
    'minecraft:is_shaking'?: Record<string, unknown>;
    'minecraft:is_sheared'?: Record<string, unknown>;
    'minecraft:is_stackable'?: Record<string, unknown>;
    'minecraft:is_stunned'?: Record<string, unknown>;
    'minecraft:is_tamed'?: Record<string, unknown>;
    'minecraft:jump.dynamic'?: Record<string, unknown>;
    'minecraft:jump.static'?: Record<string, unknown>;
    'minecraft:knockback_resistance'?: { value?: number };
    'minecraft:lava_movement'?: Record<string, unknown>;
    'minecraft:movement_sound_distance_offset'?: Record<string, unknown>;
    'minecraft:player.experience'?: Record<string, unknown>;
    'minecraft:player.level'?: Record<string, unknown>;
    'minecraft:player.saturation'?: Record<string, unknown>;
    'minecraft:projectile'?: Record<string, unknown>;
    'minecraft:push_through'?: Record<string, unknown>;
    'minecraft:pushable'?: { is_pushable?: boolean; is_pushable_by_piston?: boolean };
    'minecraft:pushable_by_block'?: Record<string, unknown>;
    'minecraft:pushable_by_entity'?: Record<string, unknown>;
    'minecraft:raid_trigger'?: Record<string, unknown>;
    'minecraft:rail_movement'?: Record<string, unknown>;
    'minecraft:rail_sensor'?: Record<string, unknown>;
    'minecraft:ravager_blocked'?: Record<string, unknown>;
    'minecraft:reflect_projectiles'?: Record<string, unknown>;
    'minecraft:remove_in_peaceful'?: Record<string, unknown>;
    'minecraft:renders_when_invisible'?: Record<string, unknown>;
    'minecraft:rideable'?: Record<string, unknown>;
    'minecraft:rotation_axis_aligned'?: Record<string, unknown>;
    'minecraft:rotation_locked_to_vehicle'?: Record<string, unknown>;
    'minecraft:scale'?: Record<string, unknown>;
    'minecraft:scale_by_age'?: Record<string, unknown>;
    'minecraft:scheduler'?: Record<string, unknown>;
    'minecraft:shareables'?: Record<string, unknown>;
    'minecraft:shooter'?: Record<string, unknown>;
    'minecraft:sittable'?: Record<string, unknown>;
    'minecraft:skin_id'?: Record<string, unknown>;
    'minecraft:sound_volume'?: Record<string, unknown>;
    'minecraft:spawn_egg_interaction'?: Record<string, unknown>;
    'minecraft:spawn_entity'?: Record<string, unknown>;
    'minecraft:spawn_on_death'?: Record<string, unknown>;
    'minecraft:spell_effects'?: Record<string, unknown>;
    'minecraft:strength'?: Record<string, unknown>;
    'minecraft:suspect_tracking'?: Record<string, unknown>;
    'minecraft:tameable'?: Record<string, unknown>;
    'minecraft:tamemount'?: Record<string, unknown>;
    'minecraft:target_nearby_sensor'?: Record<string, unknown>;
    'minecraft:teleport'?: Record<string, unknown>;
    'minecraft:tick_world'?: Record<string, unknown>;
    'minecraft:timer'?: Record<string, unknown>;
    'minecraft:trade_table'?: Record<string, unknown>;
    'minecraft:trail'?: Record<string, unknown>;
    'minecraft:transformation'?: Record<string, unknown>;
    'minecraft:transient'?: Record<string, unknown>;
    'minecraft:trusting'?: Record<string, unknown>;
    'minecraft:type_family'?: { family?: string[] };
    'minecraft:underwater_mount_breathing'?: Record<string, unknown>;
    'minecraft:underwater_movement'?: Record<string, unknown>;
    'minecraft:uses_legacy_friction'?: Record<string, unknown>;
    'minecraft:variable_max_auto_step'?: Record<string, unknown>;
    'minecraft:variant'?: Record<string, unknown>;
    'minecraft:vertical_movement_action'?: Record<string, unknown>;
    'minecraft:vibration_damper'?: Record<string, unknown>;
    'minecraft:vibration_listener'?: Record<string, unknown>;
    'minecraft:walk_animation_speed'?: Record<string, unknown>;
    'minecraft:wants_jockey'?: Record<string, unknown>;
    'minecraft:water_movement'?: Record<string, unknown>;
    'minecraft:wither_target_highest_damage'?: Record<string, unknown>;
    'minecraft:behavior.admire_item'?: Record<string, unknown>;
    'minecraft:behavior.aquatic_charge_attack'?: Record<string, unknown>;
    'minecraft:behavior.avoid_block'?: Record<string, unknown>;
    'minecraft:behavior.avoid_mob_type'?: Record<string, unknown>;
    'minecraft:behavior.barter'?: Record<string, unknown>;
    'minecraft:behavior.beg'?: Record<string, unknown>;
    'minecraft:behavior.break_door'?: Record<string, unknown>;
    'minecraft:behavior.breed'?: Record<string, unknown>;
    'minecraft:behavior.celebrate'?: Record<string, unknown>;
    'minecraft:behavior.celebrate_survive'?: Record<string, unknown>;
    'minecraft:behavior.charge_attack'?: Record<string, unknown>;
    'minecraft:behavior.charge_held_item'?: Record<string, unknown>;
    'minecraft:behavior.circle_around_anchor'?: Record<string, unknown>;
    'minecraft:behavior.controlled_by_player'?: Record<string, unknown>;
    'minecraft:behavior.croak'?: Record<string, unknown>;
    'minecraft:behavior.defend_trusted_target'?: Record<string, unknown>;
    'minecraft:behavior.defend_village_target'?: Record<string, unknown>;
    'minecraft:behavior.delayed_attack'?: Record<string, unknown>;
    'minecraft:behavior.dig'?: Record<string, unknown>;
    'minecraft:behavior.door_interact'?: Record<string, unknown>;
    'minecraft:behavior.dragonchargeplayer'?: Record<string, unknown>;
    'minecraft:behavior.dragondeath'?: Record<string, unknown>;
    'minecraft:behavior.dragonflaming'?: Record<string, unknown>;
    'minecraft:behavior.dragonholdingpattern'?: Record<string, unknown>;
    'minecraft:behavior.dragonlanding'?: Record<string, unknown>;
    'minecraft:behavior.dragonscanning'?: Record<string, unknown>;
    'minecraft:behavior.dragonstrafeplayer'?: Record<string, unknown>;
    'minecraft:behavior.dragontakeoff'?: Record<string, unknown>;
    'minecraft:behavior.drink_milk'?: Record<string, unknown>;
    'minecraft:behavior.drink_potion'?: Record<string, unknown>;
    'minecraft:behavior.drop_item_for'?: Record<string, unknown>;
    'minecraft:behavior.eat_block'?: Record<string, unknown>;
    'minecraft:behavior.eat_carried_item'?: Record<string, unknown>;
    'minecraft:behavior.eat_mob'?: Record<string, unknown>;
    'minecraft:behavior.emerge'?: Record<string, unknown>;
    'minecraft:behavior.enderman_leave_block'?: Record<string, unknown>;
    'minecraft:behavior.enderman_take_block'?: Record<string, unknown>;
    'minecraft:behavior.equip_item'?: Record<string, unknown>;
    'minecraft:behavior.explore_outskirts'?: Record<string, unknown>;
    'minecraft:behavior.fertilize_farm_block'?: Record<string, unknown>;
    'minecraft:behavior.find_cover'?: Record<string, unknown>;
    'minecraft:behavior.find_mount'?: Record<string, unknown>;
    'minecraft:behavior.find_underwater_treasure'?: Record<string, unknown>;
    'minecraft:behavior.fire_at_target'?: Record<string, unknown>;
    'minecraft:behavior.flee_sun'?: Record<string, unknown>;
    'minecraft:behavior.float'?: Record<string, unknown>;
    'minecraft:behavior.float_tempt'?: Record<string, unknown>;
    'minecraft:behavior.float_wander'?: Record<string, unknown>;
    'minecraft:behavior.follow_caravan'?: Record<string, unknown>;
    'minecraft:behavior.follow_mob'?: Record<string, unknown>;
    'minecraft:behavior.follow_owner'?: Record<string, unknown>;
    'minecraft:behavior.follow_parent'?: Record<string, unknown>;
    'minecraft:behavior.follow_target_captain'?: Record<string, unknown>;
    'minecraft:behavior.follow_target_leader'?: Record<string, unknown>;
    'minecraft:behavior.go_and_give_items_to_noteblock'?: Record<string, unknown>;
    'minecraft:behavior.go_and_give_items_to_owner'?: Record<string, unknown>;
    'minecraft:behavior.go_home'?: Record<string, unknown>;
    'minecraft:behavior.guardian_attack'?: Record<string, unknown>;
    'minecraft:behavior.harvest_farm_block'?: Record<string, unknown>;
    'minecraft:behavior.hide'?: Record<string, unknown>;
    'minecraft:behavior.hold_ground'?: Record<string, unknown>;
    'minecraft:behavior.hover'?: Record<string, unknown>;
    'minecraft:behavior.hurt_by_player'?: Record<string, unknown>;
    'minecraft:behavior.hurt_by_target'?: Record<string, unknown>;
    'minecraft:behavior.inspect_bookshelf'?: Record<string, unknown>;
    'minecraft:behavior.investigate_suspicious_location'?: Record<string, unknown>;
    'minecraft:behavior.jump_around_target'?: Record<string, unknown>;
    'minecraft:behavior.jump_to_block'?: Record<string, unknown>;
    'minecraft:behavior.knockback_roar'?: Record<string, unknown>;
    'minecraft:behavior.lay_down'?: Record<string, unknown>;
    'minecraft:behavior.lay_egg'?: Record<string, unknown>;
    'minecraft:behavior.leap_at_target'?: Record<string, unknown>;
    'minecraft:behavior.look_at_entity'?: Record<string, unknown>;
    'minecraft:behavior.look_at_player'?: Record<string, unknown>;
    'minecraft:behavior.look_at_target'?: Record<string, unknown>;
    'minecraft:behavior.look_at_trading_player'?: Record<string, unknown>;
    'minecraft:behavior.make_love'?: Record<string, unknown>;
    'minecraft:behavior.melee_attack'?: Record<string, unknown>;
    'minecraft:behavior.melee_box_attack'?: Record<string, unknown>;
    'minecraft:behavior.mingle'?: Record<string, unknown>;
    'minecraft:behavior.mount_pathing'?: Record<string, unknown>;
    'minecraft:behavior.move_around_target'?: Record<string, unknown>;
    'minecraft:behavior.move_indoors'?: Record<string, unknown>;
    'minecraft:behavior.move_outdoors'?: Record<string, unknown>;
    'minecraft:behavior.move_through_village'?: Record<string, unknown>;
    'minecraft:behavior.move_to_block'?: Record<string, unknown>;
    'minecraft:behavior.move_to_land'?: Record<string, unknown>;
    'minecraft:behavior.move_to_liquid'?: Record<string, unknown>;
    'minecraft:behavior.move_to_poi'?: Record<string, unknown>;
    'minecraft:behavior.move_to_random_block'?: Record<string, unknown>;
    'minecraft:behavior.move_to_village'?: Record<string, unknown>;
    'minecraft:behavior.move_to_water'?: Record<string, unknown>;
    'minecraft:behavior.move_towards_dwelling_restriction'?: Record<string, unknown>;
    'minecraft:behavior.move_towards_home_restriction'?: Record<string, unknown>;
    'minecraft:behavior.move_towards_restriction'?: Record<string, unknown>;
    'minecraft:behavior.move_towards_target'?: Record<string, unknown>;
    'minecraft:behavior.nap'?: Record<string, unknown>;
    'minecraft:behavior.nearest_attackable_target'?: Record<string, unknown>;
    'minecraft:behavior.nearest_prioritized_attackable_target'?: Record<string, unknown>;
    'minecraft:behavior.ocelot_sit_on_block'?: Record<string, unknown>;
    'minecraft:behavior.ocelotattack'?: Record<string, unknown>;
    'minecraft:behavior.offer_flower'?: Record<string, unknown>;
    'minecraft:behavior.open_door'?: Record<string, unknown>;
    'minecraft:behavior.owner_hurt_by_target'?: Record<string, unknown>;
    'minecraft:behavior.owner_hurt_target'?: Record<string, unknown>;
    'minecraft:behavior.panic'?: Record<string, unknown>;
    'minecraft:behavior.pet_sleep_with_owner'?: Record<string, unknown>;
    'minecraft:behavior.pickup_items'?: Record<string, unknown>;
    'minecraft:behavior.place_block'?: Record<string, unknown>;
    'minecraft:behavior.play'?: Record<string, unknown>;
    'minecraft:behavior.play_dead'?: Record<string, unknown>;
    'minecraft:behavior.player_ride_tamed'?: Record<string, unknown>;
    'minecraft:behavior.raid_garden'?: Record<string, unknown>;
    'minecraft:behavior.ram_attack'?: Record<string, unknown>;
    'minecraft:behavior.random_breach'?: Record<string, unknown>;
    'minecraft:behavior.random_fly'?: Record<string, unknown>;
    'minecraft:behavior.random_hover'?: Record<string, unknown>;
    'minecraft:behavior.random_look_around'?: Record<string, unknown>;
    'minecraft:behavior.random_look_around_and_sit'?: Record<string, unknown>;
    'minecraft:behavior.random_search_and_dig'?: Record<string, unknown>;
    'minecraft:behavior.random_sitting'?: Record<string, unknown>;
    'minecraft:behavior.random_stroll'?: Record<string, unknown>;
    'minecraft:behavior.random_swim'?: Record<string, unknown>;
    'minecraft:behavior.ranged_attack'?: Record<string, unknown>;
    'minecraft:behavior.receive_love'?: Record<string, unknown>;
    'minecraft:behavior.restrict_open_door'?: Record<string, unknown>;
    'minecraft:behavior.restrict_sun'?: Record<string, unknown>;
    'minecraft:behavior.rise_to_liquid_level'?: Record<string, unknown>;
    'minecraft:behavior.roar'?: Record<string, unknown>;
    'minecraft:behavior.roll'?: Record<string, unknown>;
    'minecraft:behavior.run_around_like_crazy'?: Record<string, unknown>;
    'minecraft:behavior.scared'?: Record<string, unknown>;
    'minecraft:behavior.send_event'?: Record<string, unknown>;
    'minecraft:behavior.share_items'?: Record<string, unknown>;
    'minecraft:behavior.silverfish_merge_with_stone'?: Record<string, unknown>;
    'minecraft:behavior.silverfish_wake_up_friends'?: Record<string, unknown>;
    'minecraft:behavior.skeleton_horse_trap'?: Record<string, unknown>;
    'minecraft:behavior.sleep'?: Record<string, unknown>;
    'minecraft:behavior.slime_attack'?: Record<string, unknown>;
    'minecraft:behavior.slime_float'?: Record<string, unknown>;
    'minecraft:behavior.slime_keep_on_jumping'?: Record<string, unknown>;
    'minecraft:behavior.slime_random_direction'?: Record<string, unknown>;
    'minecraft:behavior.snacking'?: Record<string, unknown>;
    'minecraft:behavior.sneeze'?: Record<string, unknown>;
    'minecraft:behavior.sniff'?: Record<string, unknown>;
    'minecraft:behavior.sonic_boom'?: Record<string, unknown>;
    'minecraft:behavior.squid_dive'?: Record<string, unknown>;
    'minecraft:behavior.squid_flee'?: Record<string, unknown>;
    'minecraft:behavior.squid_idle'?: Record<string, unknown>;
    'minecraft:behavior.squid_move_away_from_ground'?: Record<string, unknown>;
    'minecraft:behavior.squid_out_of_water'?: Record<string, unknown>;
    'minecraft:behavior.stalk_and_pounce_on_target'?: Record<string, unknown>;
    'minecraft:behavior.stay_near_noteblock'?: Record<string, unknown>;
    'minecraft:behavior.stay_while_sitting'?: Record<string, unknown>;
    'minecraft:behavior.stomp_attack'?: Record<string, unknown>;
    'minecraft:behavior.stomp_turtle_egg'?: Record<string, unknown>;
    'minecraft:behavior.stroll_towards_village'?: Record<string, unknown>;
    'minecraft:behavior.summon_entity'?: Record<string, unknown>;
    'minecraft:behavior.swell'?: Record<string, unknown>;
    'minecraft:behavior.swim_idle'?: Record<string, unknown>;
    'minecraft:behavior.swim_up_for_breath'?: Record<string, unknown>;
    'minecraft:behavior.swim_wander'?: Record<string, unknown>;
    'minecraft:behavior.swim_with_entity'?: Record<string, unknown>;
    'minecraft:behavior.swoop_attack'?: Record<string, unknown>;
    'minecraft:behavior.take_block'?: Record<string, unknown>;
    'minecraft:behavior.take_flower'?: Record<string, unknown>;
    'minecraft:behavior.target_when_pushed'?: Record<string, unknown>;
    'minecraft:behavior.teleport_to_owner'?: Record<string, unknown>;
    'minecraft:behavior.tempt'?: Record<string, unknown>;
    'minecraft:behavior.timer_flag_1'?: Record<string, unknown>;
    'minecraft:behavior.timer_flag_2'?: Record<string, unknown>;
    'minecraft:behavior.timer_flag_3'?: Record<string, unknown>;
    'minecraft:behavior.trade_interest'?: Record<string, unknown>;
    'minecraft:behavior.trade_with_player'?: Record<string, unknown>;
    'minecraft:behavior.transport_items'?: Record<string, unknown>;
    'minecraft:behavior.use_kinetic_weapon'?: Record<string, unknown>;
    'minecraft:behavior.vex_copy_owner_target'?: Record<string, unknown>;
    'minecraft:behavior.vex_random_move'?: Record<string, unknown>;
    'minecraft:behavior.wither_random_attack_pos_goal'?: Record<string, unknown>;
    'minecraft:behavior.wither_target_highest_damage'?: Record<string, unknown>;
    'minecraft:behavior.work'?: Record<string, unknown>;
    'minecraft:behavior.work_composter'?: Record<string, unknown>;
  };
};

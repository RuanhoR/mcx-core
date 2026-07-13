import type { World, Player } from '@minecraft/server';
import type { LanguagePlugin } from '@volar/language-core';
import * as serverUI from '@minecraft/server-ui';
interface CompileOpt {
  moduleDir: string;
  tsconfigPath: string;
  sourcemap: boolean;
  basedir?: string;
  ts?: typeof import('typescript');
  mcxLanguagePlugin?: (
    ts: typeof import('typescript'),
  ) => LanguagePlugin<unknown>;
}
interface EventOpt {
  on: 'after' | 'before';
  data: Record<string, (event: any) => void>;
  extends?: MCXFile<'event'>[];
  tick?: number;
}
interface MCXUIOpt {
  mode?: 'form' | 'ui';
  layout?: {
    type: string;
    params: { [key: string]: (s: any) => unknown };
    content: (s: any) => unknown;
    for?: { variable: string; useSetup: string };
    if?: { useSetup: string };
  }[];
  use?:
    | typeof serverUI.ModalFormData
    | typeof serverUI.MessageFormData
    | typeof serverUI.ActionFormData;
  UI: typeof serverUI;
}
declare class ui {
  constructor(
    UIConfig: MCXUIOpt,
    mcxSrcFn: (ctx: MCXCtx & { $prop?: Record<string, any> }) => any,
  );
  show(player: Player, prop?: Record<string, unknown>): Promise<void>;
}
declare class Event {
  constructor(opt: EventOpt);
  subscribe(...events: string[]): boolean;
  unsubscribe(...events: string[]): boolean;
  useWorld(_world: World): void;
}
type MCXFileType = 'app' | 'component' | 'event' | 'ui';
/** runtime context passed into `setup` */
/**
 * MCX Setup CTX will auto-generate by core
 * You should't use MCXCtx in your other code.
 */
type MCXCtx = {
  event?: Event[];
};

interface MCXFileBase {
  type: MCXFileType;
  setup: (ctx: MCXCtx) => any;
}
interface AppMCXContent {
  event: MCXFile<'event'>[];
}
interface MCXEventData {
  event: {
    data: Record<string, string>;
    on: EventOpt['on'];
    extends: EventOpt['extends'];
    tick: EventOpt['tick'];
  };
}
interface MCXFileTypeMap {
  app: AppMCXContent;
  event: MCXEventData;
  ui: {
    ui: ui;
  };
  component: never;
}
interface MCXFile<T extends MCXFileType> extends MCXFileBase {
  app: MCXFileTypeMap[T] | never;
}

// --- JSON Types ---

interface BaseJson {
  format_version: string;
  _meta: {
    type: 'item' | 'entity';
    file_edit?: Array<Record<string, any>>;
  };
}

interface EntityJson extends BaseJson {
  _meta: {
    type: 'entity';
    file_edit?: BaseJson['_meta']['file_edit'];
  };
  'minecraft:entity': {
    description: {
      identifier: string;
      is_spawnable?: boolean;
      is_summonable?: boolean;
    };
    component_groups?: Record<string, any>;
    components?: Record<string, any>;
    events?: Record<string, any>;
  };
}

interface ItemJson extends BaseJson {
  _meta: {
    type: 'item';
    file_edit?: BaseJson['_meta']['file_edit'];
  };
  'minecraft:item': {
    description: {
      identifier: string;
    };
    components: Record<string, any>;
  };
}

type JSONValue<T> = { value: T };

// --- Component Types ---

type ParticleType =
  | 'balloongas'
  | 'bleach'
  | 'blockforcefield'
  | 'blueflame'
  | 'breezewindexplosion'
  | 'bubble'
  | 'bubblecolumndown'
  | 'bubblecolumnup'
  | 'bubblemanual'
  | 'campfiresmoke'
  | 'campfiresmoketall'
  | 'candleflame'
  | 'carrotboost'
  | 'coloredflame'
  | 'conduit'
  | 'creakingcrumble'
  | 'crit'
  | 'dragonbreath'
  | 'dragonbreathfire'
  | 'dragonbreathtrail'
  | 'dragondestroyblock'
  | 'driphoney'
  | 'driplava'
  | 'dripwater'
  | 'dustplume'
  | 'electricspark'
  | 'enchantingtable'
  | 'endrod'
  | 'evaporation'
  | 'explode'
  | 'eyeblossomclose'
  | 'eyeblossomopen'
  | 'fallingborderdust'
  | 'fallingdust'
  | 'fireworks'
  | 'fireworksoverlay'
  | 'fireworksstarter'
  | 'flame'
  | 'food'
  | 'greenflame'
  | 'heart'
  | 'hugeexplosion'
  | 'iconcrack'
  | 'ink'
  | 'largeexplode'
  | 'largesmoke'
  | 'lava'
  | 'mobappearance'
  | 'mobflame'
  | 'mobspell'
  | 'mobspellambient'
  | 'mobspellinstantaneous'
  | 'myceliumdust'
  | 'none'
  | 'note'
  | 'obsidiantear'
  | 'paleoakleaves'
  | 'pausemobgrowth'
  | 'portal'
  | 'portalreverse'
  | 'rainsplash'
  | 'reddust'
  | 'resetmobgrowth'
  | 'risingborderdust'
  | 'sculksoul'
  | 'shriek'
  | 'shulkerbullet'
  | 'slime'
  | 'smoke'
  | 'sneeze'
  | 'snowballpoof'
  | 'snowflake'
  | 'sonicexplosion'
  | 'soul'
  | 'sparkler'
  | 'spit'
  | 'stalactitedriplava'
  | 'stalactitedripwater'
  | 'terrain'
  | 'totem'
  | 'townaura'
  | 'trackingemitter'
  | 'vaultconnection'
  | 'villagerangry'
  | 'villagerhappy'
  | 'watersplash'
  | 'watersplashmanual'
  | 'waterwake'
  | 'wax'
  | 'whitesmoke'
  | 'windexplosion'
  | 'witchspell'
  | 'wolfarmorcrack';

type SoundEvent =
  | 'activate'
  | 'add.chest'
  | 'admire'
  | 'agitated'
  | 'ambient'
  | 'ambient.aggressive'
  | 'ambient.baby'
  | 'ambient.basalt_deltas.additions'
  | 'ambient.basalt_deltas.loop'
  | 'ambient.basalt_deltas.mood'
  | 'ambient.candle'
  | 'ambient.cave'
  | 'ambient.crimson_forest.additions'
  | 'ambient.crimson_forest.loop'
  | 'ambient.crimson_forest.mood'
  | 'ambient.in.air'
  | 'ambient.in.raid'
  | 'ambient.in.water'
  | 'ambient.nether_wastes.additions'
  | 'ambient.nether_wastes.loop'
  | 'ambient.nether_wastes.mood'
  | 'ambient.pollinate'
  | 'ambient.screamer'
  | 'ambient.soulsand_valley.additions'
  | 'ambient.soulsand_valley.loop'
  | 'ambient.soulsand_valley.mood'
  | 'ambient.tame'
  | 'ambient.underwater.enter'
  | 'ambient.underwater.exit'
  | 'ambient.warped_forest.additions'
  | 'ambient.warped_forest.loop'
  | 'ambient.warped_forest.mood'
  | 'ambient.weather.the_end_light_flash'
  | 'ambient.worried'
  | 'angry'
  | 'apply_effect.bad_omen'
  | 'apply_effect.raid_omen'
  | 'apply_effect.trial_omen'
  | 'armor'
  | 'armor.break_wolf'
  | 'armor.crack_wolf'
  | 'armor.equip_chain'
  | 'armor.equip_copper'
  | 'armor.equip_diamond'
  | 'armor.equip_elytra'
  | 'armor.equip_generic'
  | 'armor.equip_gold'
  | 'armor.equip_iron'
  | 'armor.equip_leather'
  | 'armor.equip_netherite'
  | 'armor.equip_wolf'
  | 'armor.repair_wolf'
  | 'armor.unequip_generic'
  | 'armor.unequip_wolf'
  | 'attach'
  | 'attack'
  | 'attack.critical'
  | 'attack.nodamage'
  | 'attack.strong'
  | 'balloonpop'
  | 'beacon.activate'
  | 'beacon.ambient'
  | 'beacon.deactivate'
  | 'beacon.power'
  | 'blast'
  | 'block.bamboo_sapling.place'
  | 'block.barrel.close'
  | 'block.barrel.open'
  | 'block.beehive.drip'
  | 'block.beehive.enter'
  | 'block.beehive.exit'
  | 'block.beehive.shear'
  | 'block.beehive.work'
  | 'block.bell.hit'
  | 'block.blastfurnace.fire_crackle'
  | 'block.campfire.crackle'
  | 'block.cartography_table.use'
  | 'block.click'
  | 'block.click.fail'
  | 'block.composter.empty'
  | 'block.composter.fill'
  | 'block.composter.fill_success'
  | 'block.composter.ready'
  | 'block.copper_bulb.turn_off'
  | 'block.copper_bulb.turn_on'
  | 'block.creaking_heart.trail'
  | 'block.decorated_pot.insert'
  | 'block.decorated_pot.insert_fail'
  | 'block.enchanting_table.use'
  | 'block.end_portal.spawn'
  | 'block.end_portal_frame.fill'
  | 'block.fletching_table.use'
  | 'block.frog_spawn.break'
  | 'block.frog_spawn.hatch'
  | 'block.furnace.lit'
  | 'block.grindstone.use'
  | 'block.loom.use'
  | 'block.scaffolding.climb'
  | 'block.sculk.spread'
  | 'block.sculk_catalyst.bloom'
  | 'block.sculk_sensor.place'
  | 'block.sculk_shrieker.place'
  | 'block.sculk_shrieker.shriek'
  | 'block.sign.waxed_interact_fail'
  | 'block.smithing_table.use'
  | 'block.smoker.smoke'
  | 'block.sniffer_egg.crack'
  | 'block.sniffer_egg.hatch'
  | 'block.stonecutter.use'
  | 'block.sweet_berry_bush.hurt'
  | 'block.sweet_berry_bush.pick'
  | 'block.turtle_egg.attack'
  | 'block.turtle_egg.break'
  | 'block.turtle_egg.crack'
  | 'block.turtle_egg.hatch'
  | 'boost'
  | 'born'
  | 'bottle.dragonbreath'
  | 'bottle.empty'
  | 'bottle.fill'
  | 'bow'
  | 'bow.hit'
  | 'break'
  | 'break.block'
  | 'break_pot'
  | 'breathe'
  | 'breeze_wind_charge.burst'
  | 'brush'
  | 'brush_completed'
  | 'bubble.down'
  | 'bubble.downinside'
  | 'bubble.pop'
  | 'bubble.up'
  | 'bubble.upinside'
  | 'bucket.empty.fish'
  | 'bucket.empty.lava'
  | 'bucket.empty.powder_snow'
  | 'bucket.empty.water'
  | 'bucket.fill.fish'
  | 'bucket.fill.lava'
  | 'bucket.fill.powder_snow'
  | 'bucket.fill.water'
  | 'bullet.hit'
  | 'bundle.drop_contents'
  | 'bundle.insert'
  | 'bundle.insert_fail'
  | 'bundle.remove_one'
  | 'burp'
  | 'button.click_off'
  | 'button.click_on'
  | 'cake.add_candle'
  | 'camera.take_picture'
  | 'cant_breed'
  | 'cast.spell'
  | 'cauldron_drip.lava.pointed_dripstone'
  | 'cauldron_drip.water.pointed_dripstone'
  | 'celebrate'
  | 'charge'
  | 'charge.sculk'
  | 'chest.closed'
  | 'chest.open'
  | 'chime.amethyst_block'
  | 'chorusdeath'
  | 'chorusgrow'
  | 'close'
  | 'close_long'
  | 'conduit.activate'
  | 'conduit.ambient'
  | 'conduit.attack'
  | 'conduit.deactivate'
  | 'conduit.short'
  | 'convert_mooshroom'
  | 'convert_to_drowned'
  | 'convert_to_frog'
  | 'convert_to_stray'
  | 'converted_to_zombified'
  | 'copper.wax.off'
  | 'copper.wax.on'
  | 'crafter.craft'
  | 'crafter.disable_slot'
  | 'crafter.fail'
  | 'creaking_heart_spawn'
  | 'crossbow.loading.end'
  | 'crossbow.loading.middle'
  | 'crossbow.loading.start'
  | 'crossbow.quick_charge.end'
  | 'crossbow.quick_charge.middle'
  | 'crossbow.quick_charge.start'
  | 'crossbow.shoot'
  | 'dash_ready'
  | 'deactivate'
  | 'death'
  | 'death.baby'
  | 'death.in.water'
  | 'death.mid.volume'
  | 'death.min.volume'
  | 'death.screamer'
  | 'death.to.zombie'
  | 'default'
  | 'deny'
  | 'detach'
  | 'disappeared'
  | 'door.close'
  | 'door.open'
  | 'drink'
  | 'drink.honey'
  | 'drink.milk'
  | 'drip.lava.pointed_dripstone'
  | 'drip.water.pointed_dripstone'
  | 'drop.slot'
  | 'eat'
  | 'elderguardian.curse'
  | 'elemconstruct.open'
  | 'enderchest.closed'
  | 'enderchest.open'
  | 'explode'
  | 'extinguish.candle'
  | 'extinguish.fire'
  | 'fall'
  | 'fall.big'
  | 'fall.small'
  | 'fang'
  | 'fence_gate.close'
  | 'fence_gate.open'
  | 'fire'
  | 'fizz'
  | 'flap'
  | 'flop'
  | 'fly'
  | 'freeze'
  | 'fuse'
  | 'gallop'
  | 'glass'
  | 'glow_squid.ink_squirt'
  | 'glowstick.use'
  | 'growl'
  | 'haggle'
  | 'haggle.idle'
  | 'haggle.no'
  | 'haggle.yes'
  | 'heartbeat'
  | 'heavy.step'
  | 'hit'
  | 'horn_break'
  | 'horn_call0'
  | 'horn_call1'
  | 'horn_call2'
  | 'horn_call3'
  | 'horn_call4'
  | 'horn_call5'
  | 'horn_call6'
  | 'horn_call7'
  | 'hurt'
  | 'hurt.baby'
  | 'hurt.in.water'
  | 'hurt.reduced'
  | 'hurt.screamer'
  | 'icebomb.hit'
  | 'ignite'
  | 'imitate.blaze'
  | 'imitate.bogged'
  | 'imitate.breeze'
  | 'imitate.camel_husk'
  | 'imitate.cave_spider'
  | 'imitate.creaking'
  | 'imitate.creeper'
  | 'imitate.drowned'
  | 'imitate.elder_guardian'
  | 'imitate.ender_dragon'
  | 'imitate.enderman'
  | 'imitate.endermite'
  | 'imitate.evocation_illager'
  | 'imitate.ghast'
  | 'imitate.guardian'
  | 'imitate.happy_ghast'
  | 'imitate.husk'
  | 'imitate.magma_cube'
  | 'imitate.parched'
  | 'imitate.phantom'
  | 'imitate.pillager'
  | 'imitate.polar_bear'
  | 'imitate.ravager'
  | 'imitate.shulker'
  | 'imitate.silverfish'
  | 'imitate.skeleton'
  | 'imitate.slime'
  | 'imitate.spider'
  | 'imitate.stray'
  | 'imitate.vex'
  | 'imitate.vindication_illager'
  | 'imitate.warden'
  | 'imitate.witch'
  | 'imitate.wither'
  | 'imitate.wither_skeleton'
  | 'imitate.wolf'
  | 'imitate.zoglin'
  | 'imitate.zombie'
  | 'imitate.zombie_pigman'
  | 'imitate.zombie_villager'
  | 'insert'
  | 'insert_enchanted'
  | 'irongolem.crack'
  | 'irongolem.repair'
  | 'item.book.put'
  | 'item.copper_spear.attack_hit'
  | 'item.copper_spear.attack_miss'
  | 'item.copper_spear.use'
  | 'item.diamond_spear.attack_hit'
  | 'item.diamond_spear.attack_miss'
  | 'item.diamond_spear.use'
  | 'item.enchant.lunge1'
  | 'item.enchant.lunge2'
  | 'item.enchant.lunge3'
  | 'item.fizz'
  | 'item.golden_spear.attack_hit'
  | 'item.golden_spear.attack_miss'
  | 'item.golden_spear.use'
  | 'item.iron_spear.attack_hit'
  | 'item.iron_spear.attack_miss'
  | 'item.iron_spear.use'
  | 'item.netherite_spear.attack_hit'
  | 'item.netherite_spear.attack_miss'
  | 'item.netherite_spear.use'
  | 'item.shield.block'
  | 'item.spear.attack_hit'
  | 'item.spear.attack_miss'
  | 'item.spear.use'
  | 'item.spyglass.stop_using'
  | 'item.spyglass.use'
  | 'item.stone_spear.attack_hit'
  | 'item.stone_spear.attack_miss'
  | 'item.stone_spear.use'
  | 'item.trident.hit'
  | 'item.trident.hit_ground'
  | 'item.trident.return'
  | 'item.trident.riptide_1'
  | 'item.trident.riptide_2'
  | 'item.trident.riptide_3'
  | 'item.trident.throw'
  | 'item.trident.thunder'
  | 'item.use.on'
  | 'item.wooden_spear.attack_hit'
  | 'item.wooden_spear.attack_miss'
  | 'item.wooden_spear.use'
  | 'item_given'
  | 'item_taken'
  | 'item_thrown'
  | 'jump'
  | 'jump.prevent'
  | 'jump_to_block'
  | 'land'
  | 'large.blast'
  | 'launch'
  | 'lava'
  | 'lava.pop'
  | 'lay_egg'
  | 'lay_spawn'
  | 'lead.break'
  | 'lead.leash'
  | 'lead.unleash'
  | 'leashknot.break'
  | 'leashknot.place'
  | 'levelup'
  | 'listening'
  | 'listening_angry'
  | 'lodestone_compass.link_compass_to_lodestone'
  | 'lt.reaction.bleach'
  | 'lt.reaction.epaste'
  | 'lt.reaction.epaste2'
  | 'lt.reaction.fertilizer'
  | 'lt.reaction.fire'
  | 'lt.reaction.fireball'
  | 'lt.reaction.icebomb'
  | 'lt.reaction.mgsalt'
  | 'lt.reaction.miscexplosion'
  | 'lt.reaction.miscfire'
  | 'lt.reaction.miscmystical'
  | 'lt.reaction.miscmystical2'
  | 'lt.reaction.product'
  | 'mace.heavy_smash_ground'
  | 'mace.smash_air'
  | 'mace.smash_ground'
  | 'mad'
  | 'milk'
  | 'milk.screamer'
  | 'milk_suspiciously'
  | 'mob.armadillo.brush'
  | 'mob.armadillo.scute_drop'
  | 'mob.armor_stand.place'
  | 'mob.hoglin.converted_to_zombified'
  | 'mob.husk.convert_to_zombie'
  | 'mob.pig.death'
  | 'mob.player.hurt_drown'
  | 'mob.player.hurt_freeze'
  | 'mob.player.hurt_on_fire'
  | 'mob.warning'
  | 'mob.warning.baby'
  | 'multi_swap'
  | 'nearby_close'
  | 'nearby_closer'
  | 'nearby_closest'
  | 'note'
  | 'note.bass'
  | 'ominous_bottle.end_use'
  | 'ominous_item_spawner.about_to_spawn_item'
  | 'ominous_item_spawner.spawn_item'
  | 'ominous_item_spawner.spawn_item_begin'
  | 'open'
  | 'open_long'
  | 'panic'
  | 'pant'
  | 'particle.soul_escape.loud'
  | 'particle.soul_escape.quiet'
  | 'pause_growth'
  | 'pick_berries.cave_vines'
  | 'pickup'
  | 'pickup_enchanted'
  | 'piston.in'
  | 'piston.out'
  | 'place'
  | 'place_in_water'
  | 'place_item'
  | 'plop'
  | 'pop'
  | 'portal'
  | 'portal.travel'
  | 'potion.brewed'
  | 'power.off'
  | 'power.off.sculk_sensor'
  | 'power.on'
  | 'power.on.sculk_sensor'
  | 'pre_ram'
  | 'pre_ram.screamer'
  | 'prepare.attack'
  | 'prepare.summon'
  | 'prepare.wololo'
  | 'presneeze'
  | 'pressure_plate.click_off'
  | 'pressure_plate.click_on'
  | 'pumpkin.carve'
  | 'purr'
  | 'purreow'
  | 'raid.horn'
  | 'ram_impact'
  | 'ram_impact.screamer'
  | 'random.anvil_use'
  | 'reappeared'
  | 'record.11'
  | 'record.13'
  | 'record.5'
  | 'record.blocks'
  | 'record.cat'
  | 'record.chirp'
  | 'record.far'
  | 'record.creator'
  | 'record.creator_music_box'
  | 'record.lava_chicken'
  | 'record.mall'
  | 'record.mellohi'
  | 'record.otherside'
  | 'record.pigstep'
  | 'record.precipice'
  | 'record.relic'
  | 'record.stal'
  | 'record.strad'
  | 'record.tears'
  | 'record.wait'
  | 'record.ward'
  | 'reflect'
  | 'remedy'
  | 'reset_growth'
  | 'respawn_anchor.ambient'
  | 'respawn_anchor.charge'
  | 'respawn_anchor.deplete'
  | 'respawn_anchor.set_spawn'
  | 'retreat'
  | 'roar'
  | 'saddle'
  | 'saddle_in_water'
  | 'scared'
  | 'scrape'
  | 'screech'
  | 'shake'
  | 'shatter_pot'
  | 'shear'
  | 'shoot'
  | 'shulker.close'
  | 'shulker.open'
  | 'shulkerbox.closed'
  | 'shulkerbox.open'
  | 'single_swap'
  | 'sleep'
  | 'smithing_table.use'
  | 'sneeze'
  | 'sonic_boom'
  | 'sonic_charge'
  | 'sparkler.active'
  | 'sparkler.use'
  | 'spawn'
  | 'splash'
  | 'sponge.absorb'
  | 'squid.ink_squirt'
  | 'squish.big'
  | 'squish.small'
  | 'stare'
  | 'state_change'
  | 'step'
  | 'step.baby'
  | 'step_lava'
  | 'step_sand'
  | 'stun'
  | 'swim'
  | 'swoop'
  | 'takeoff'
  | 'teleport'
  | 'tempt'
  | 'thorns'
  | 'throw'
  | 'thunder'
  | 'tilt_down.big_dripleaf'
  | 'tilt_up.big_dripleaf'
  | 'tongue'
  | 'trapdoor.close'
  | 'trapdoor.open'
  | 'trial_spawner.ambient'
  | 'trial_spawner.ambient_ominous'
  | 'trial_spawner.charge_activate'
  | 'trial_spawner.close_shutter'
  | 'trial_spawner.detect_player'
  | 'trial_spawner.eject_item'
  | 'trial_spawner.open_shutter'
  | 'trial_spawner.spawn_mob'
  | 'tripod'
  | 'twinkle'
  | 'ui.cartography_table.take_result'
  | 'ui.loom.take_result'
  | 'ui.stonecutter.take_result'
  | 'undefined'
  | 'unfect'
  | 'unfreeze'
  | 'unsaddle'
  | 'vault.activate'
  | 'vault.ambient'
  | 'vault.close_shutter'
  | 'vault.deactivate'
  | 'vault.eject_item'
  | 'vault.insert_item'
  | 'vault.insert_item_fail'
  | 'vault.open_shutter'
  | 'vault.reject_rewarded_player'
  | 'warn'
  | 'water'
  | 'whine'
  | 'wind_charge.burst';

type EnchantableSlot =
  | 'none'
  | 'all'
  | 'g_armor'
  | 'armor_head'
  | 'armor_torso'
  | 'armor_feet'
  | 'armor_legs'
  | 'sword'
  | 'bow'
  | 'spear'
  | 'crossbow'
  | 'melee_spear'
  | 'g_tool'
  | 'hoe'
  | 'shears'
  | 'flintsteel'
  | 'shield'
  | 'g_digging'
  | 'axe'
  | 'pickaxe'
  | 'shovel'
  | 'fishing_rod'
  | 'carrot_stick'
  | 'elytra'
  | 'cosmetic_head';

type AttackCriticalHitChoices = SoundEvent;
type StartSoundChoices = SoundEvent;

type Rarity = 'common' | 'uncommon' | 'rare' | 'epic';

interface FoodEffect {
  amplifier?: number;
  chance?: number;
  duration?: number;
  name?: string;
}

interface ItemComponentOptions {
  id: string;
  name: string;
  format: string;
  components: Partial<{
    offHand: boolean;
    damage: number;
    canDestroyInCreative: boolean;
    icon: string | { filePath: string; classId: string };
    block_placer?: {
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
    cooldown?: { category: string; duration: number; type?: 'use' | 'attack' };
    compostable?: { composting_chance: number };
    bundle_interaction?: { num_viewable_slots?: number };
    'minecraft:storage_item'?: {
      allow_nested_storage_items?: boolean;
      allowed_items?: string[];
      banned_items?: string[];
      max_slots?: number;
      max_weight_limit?: number;
      weight_in_storage_item?: number;
    };
    'minecraft:storage_weight_modifier'?: { weight_in_storage_item: number };
    'minecraft:storage_weight_limit'?: { max_weight_limit: number };
    'minecraft:throwable'?: {
      do_swing_animation?: boolean;
      launch_power_scale?: number;
      max_draw_duration?: number;
      max_launch_power?: number;
      min_draw_duration?: number;
      scale_power_by_draw_duration?: boolean;
    };
    throwable?: {
      do_swing_animation?: boolean;
      launch_power_scale?: number;
      max_draw_duration?: number;
      max_launch_power?: number;
      min_draw_duration?: number;
      scale_power_by_draw_duration?: boolean;
    };
    'minecraft:tags'?: { tags?: string[] };
    tags?: { tags?: string[] };
    'minecraft:swing_duration'?: { value?: number };
    swing_duration?: { value?: number };
    'minecraft:use_animation'?: string | { value?: string };
    'minecraft:wearable'?: {
      slot:
        | 'slot.armor.head'
        | 'slot.armor.chest'
        | 'slot.armor.legs'
        | 'slot.armor.feet'
        | 'slot.armor.body'
        | 'slot.weapon.mainhand'
        | 'slot.weapon.offhand'
        | 'slot.hotbar'
        | 'slot.inventory'
        | 'slot.enderchest'
        | 'slot.saddle'
        | 'slot.armor'
        | 'slot.chest';
      protection?: number;
      hides_player_location?: boolean;
      dispensable?: boolean;
    };
    'minecraft:use_modifiers'?: {
      use_duration: number;
      movement_modifier?: number;
      emit_vibrations?: boolean;
      start_sound?: string;
    };
    'minecraft:swing_sounds'?: {
      attack_critical_hit?: string;
      attack_hit?: string;
      attack_miss?: string;
    };
    use_animation?: string | { value?: string };
    wearable?: {
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
    };
    use_modifiers?: {
      use_duration: number;
      movement_modifier?: number;
      emit_vibrations?: boolean;
      start_sound?: string;
    };
    swing_sounds?: {
      attack_critical_hit?: string;
      attack_hit?: string;
      attack_miss?: string;
    };
    storage_item?: {
      allow_nested_storage_items?: boolean;
      allowed_items?: string[];
      banned_items?: string[];
      max_slots?: number;
      max_weight_limit?: number;
      weight_in_storage_item?: number;
    };
    storage_weight_modifier?: { weight_in_storage_item: number };
    storage_weight_limit?: { max_weight_limit: number };
    glint?: boolean;
    hand_equipped?: boolean;
    digger?: {
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
    damage_absorption?: { absorbable_causes: string[] };
    durability?: {
      max_durability: number;
      damage_chance?: { min: number; max: number };
    };
    durability_sensor?: {
      durability?: number;
      durability_thresholds?: Array<{
        durability: number;
        particle_type?: ParticleType;
        sound_event?: SoundEvent;
      }>;
      particle_type?: ParticleType;
      sound_event?: SoundEvent;
    };
    dyeable?: { default_color?: string | [number, number, number] };
    enchantable?: { slot?: EnchantableSlot; value?: number };
    'minecraft:fire_resistant'?: { value?: boolean };
    'minecraft:entity_placer'?: {
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
    'minecraft:fuel'?: { duration: number };
    'minecraft:kinetic_weapon'?: {
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
    };
    'minecraft:interact_button'?: boolean | string;
    'minecraft:hover_text_color'?: { value?: string };
    'minecraft:food'?: {
      can_always_eat?: boolean;
      cooldown_time?: number;
      cooldown_type?: string;
      effects?: FoodEffect[];
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
      remove_effects?: string[];
    };
    food?: {
      can_always_eat?: boolean;
      cooldown_time?: number;
      cooldown_type?: string;
      effects?: FoodEffect[];
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
      remove_effects?: string[];
    };
    fire_resistant?: { value?: boolean };
    entity_placer?: {
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
    fuel?: { duration: number };
    kinetic_weapon?: {
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
    };
    interact_button?: boolean | string;
    hover_text_color?: { value?: string };
    'minecraft:liquid_clipped'?: boolean | { value?: boolean };
    liquid_clipped?: boolean | { value?: boolean };
    'minecraft:max_stack_size'?: number | { value?: number };
    max_stack_size?: number | { value?: number };
  }>;
}

interface AddRiderConfig {
  entity_type?: string;
  riders?: Array<string | { entity_type: string; spawn_event?: string }>;
  spawn_event?: string;
}

interface MobEffectConfig {
  mob_effect: string;
  ambient?: boolean;
  cooldown_time?: number;
  effect_range?: number;
  effect_time?: number | 'infinite';
  entity_filter?: Record<string, any>;
}

interface JumpMovementConfig {
  jump_delay?:
    | number
    | [number, number]
    | { range_min?: number; range_max?: number };
  max_turn?: number;
}

interface NavigationConfig {
  avoid_damage_blocks?: boolean;
  avoid_portals?: boolean;
  avoid_sun?: boolean;
  avoid_water?: boolean;
  blocks_to_avoid?: Array<string | { name?: string; tags?: string }>;
  can_breach?: boolean;
  can_break_doors?: boolean;
  can_float?: boolean;
  can_jump?: boolean;
  can_open_doors?: boolean;
  can_open_iron_doors?: boolean;
  can_pass_doors?: boolean;
  can_path_from_air?: boolean;
  can_path_over_lava?: boolean;
  can_path_over_water?: boolean;
  can_sink?: boolean;
  can_swim?: boolean;
  can_walk?: boolean;
  can_walk_in_lava?: boolean;
  is_amphibious?: boolean;
  using_door_annotation?: boolean;
}

interface NavigationFloatConfig extends NavigationConfig {}

interface BlockComponentOptions {
  id: string;
  format: string;
  components?: Partial<{
    display_name?: string;
    light_emission?: number;
    light_dampening?: number;
    friction?: number;
    loot?: string;
    destructible_by_explosion?: boolean | { explosion_resistance?: number };
    destructible_by_mining?:
      | boolean
      | {
          seconds_to_destroy?: number;
          item_specific_speeds?: Array<{
            item: string | { tags?: string };
            destroy_speed: number;
          }>;
        };
    flammable?:
      | boolean
      | {
          catch_chance_modifier?: number;
          destroy_chance_modifier?: number;
          lava_flammable?: boolean;
        };
    collision_box?:
      | boolean
      | {
          origin?: [number, number, number];
          size?: [number, number, number];
        };
    selection_box?:
      | boolean
      | {
          origin?: [number, number, number];
          size?: [number, number, number];
        };
    geometry?:
      | string
      | {
          identifier: string;
          bone_visibility?: Record<string, boolean>;
          culling?: string;
          culling_layer?: string;
          culling_shape?: string;
          n_way_visual_rotation?: string;
          uv_lock?: boolean | string[];
        };
    material_instances?: Record<
      string,
      | string
      | {
          texture: string;
          render_method?:
            | 'opaque'
            | 'double_sided'
            | 'blend'
            | 'alpha_test'
            | 'alpha_test_single_sided'
            | 'blend_to_opaque'
            | 'alpha_test_to_opaque'
            | 'alpha_test_single_sided_to_opaque';
          ambient_occlusion?: number;
          face_dimming?: boolean | string;
          isotropic?: boolean;
          tint_method?: string | boolean;
        }
    >;
    map_color?: string | { color: string; tint_method?: string };
    crafting_table?: { crafting_tags?: string[]; table_name?: string };
    transformation?: {
      rotation?:
        | [number, number, number]
        | { x?: number; y?: number; z?: number };
      rotation_pivot?: [number, number, number];
      scale?: [number, number, number] | { x?: number; y?: number; z?: number };
      scale_pivot?: [number, number, number];
      translation?:
        | [number, number, number]
        | { x?: number; y?: number; z?: number };
    };
    tick?: { interval_range: [number, number]; looping?: boolean };
    random_offset?: {
      x?: { range?: { min?: number; max?: number }; steps?: number };
      y?: { range?: { min?: number; max?: number }; steps?: number };
      z?: { range?: { min?: number; max?: number }; steps?: number };
    };
    movable?: {
      movement_type?: 'push_pull' | 'push' | 'popped' | 'immovable';
      sticky?: 'none' | 'same';
    };
    placement_filter?: {
      conditions: Array<{
        allowed_faces?: string[];
        block_filter?: Array<
          | string
          | {
              name?: string;
              states?: Record<string, number | string | boolean>;
              tags?: string;
            }
        >;
      }>;
    };
    redstone_conductivity?: {
      allows_wire_to_step_down?: boolean;
      redstone_conductor?: boolean;
    };
    redstone_consumer?: { min_power?: number; propagates_power?: boolean };
    redstone_producer?: {
      power?: number;
      connected_faces?: string[];
      strongly_powered_face?: string;
      transform_relative?: boolean;
    };
    support?: { shape: 'fence' | 'stair' };
    connection_rule?: {
      accepts_connections_from?: 'all' | 'none' | 'only_fences';
      enabled_directions?: string[];
    };
    liquid_detection?: {
      can_contain_liquid?: boolean;
      liquid_type?: string;
      on_liquid_touches?: 'blocking' | 'broken' | 'popped' | 'no_reaction';
      stops_liquid_flowing_from_direction?: string[];
      use_liquid_clipping?: boolean;
      detection_rules?: Array<{
        can_contain_liquid?: boolean;
        liquid_type?: string;
        on_liquid_touches?: 'blocking' | 'broken' | 'popped' | 'no_reaction';
        stops_liquid_flowing_from_direction?: string[];
        use_liquid_clipping?: boolean;
      }>;
    };
    precipitation_interactions?: {
      precipitation_behavior?:
        | 'none'
        | 'obstruct_rain'
        | 'obstruct_rain_accumulate_snow'
        | 'snowlogging';
    };
    entity_fall_on?: {
      min_fall_distance?: number;
      minimum_fall_distance?: number;
    };
    replaceable?: Record<string, never>;
    flower_pottable?: Record<string, never>;
    chest_obstruction?: Record<string, never>;
    icon?: string | { filePath: string; classId: string };
  }>;
}

interface EntityComponentOptions {
  id: string;
  format: string;
  is_spawnable?: boolean;
  is_summonable?: boolean;
  components?: Partial<{
    physics?: boolean;
    addrider?: AddRiderConfig;
    'minecraft:admire_item'?: Record<string, unknown>;
    'minecraft:ageable'?: Record<string, unknown>;
    'minecraft:anger_level'?: Record<string, unknown>;
    'minecraft:angry'?: Record<string, unknown>;
    'minecraft:annotation.break_door'?: Record<string, unknown>;
    'minecraft:annotation.open_door'?: Record<string, unknown>;
    'minecraft:attack'?: Record<string, unknown>;
    'minecraft:area_attack'?: Record<string, unknown>;
    'minecraft:attack_cooldown'?: Record<string, unknown>;
    'minecraft:balloonable'?: Record<string, unknown>;
    'minecraft:barter'?: Record<string, unknown>;
    'minecraft:block_climber'?: Record<string, unknown>;
    'minecraft:block_sensor'?: Record<string, unknown>;
    'minecraft:body_rotation_axis_aligned'?: Record<string, unknown>;
    'minecraft:body_rotation_always_follows_head'?: Record<string, unknown>;
    'minecraft:body_rotation_blocked'?: Record<string, unknown>;
    'minecraft:body_rotation_locked_to_vehicle'?: Record<string, unknown>;
    'minecraft:boostable'?: Record<string, unknown>;
    'minecraft:boss'?: Record<string, unknown>;
    'minecraft:break_blocks'?: Record<string, unknown>;
    'minecraft:breathable'?: Record<string, unknown>;
    'minecraft:bribeable'?: Record<string, unknown>;
    'minecraft:breedable'?: Record<string, unknown>;
    'minecraft:buoyant'?: Record<string, unknown>;
    'minecraft:burns_in_daylight'?: Record<string, unknown>;
    'minecraft:cannot_be_attacked'?: Record<string, unknown>;
    'minecraft:can_climb'?: Record<string, unknown>;
    'minecraft:can_fly'?: Record<string, unknown>;
    'minecraft:can_join_raid'?: Record<string, unknown>;
    'minecraft:can_power_jump'?: Record<string, unknown>;
    'minecraft:celebrate_hunt'?: Record<string, unknown>;
    'minecraft:collision_box'?: Record<string, unknown>;
    'minecraft:color'?: Record<string, unknown>;
    'minecraft:color2'?: Record<string, unknown>;
    'minecraft:combat_regeneration'?: Record<string, unknown>;
    'minecraft:conditional_bandwidth_optimization'?: Record<string, unknown>;
    'minecraft:custom_hit_test'?: Record<string, unknown>;
    'minecraft:damage_over_time'?: Record<string, unknown>;
    'minecraft:damage_sensor'?: Record<string, unknown>;
    'minecraft:dash'?: Record<string, unknown>;
    'minecraft:dash_action'?: Record<string, unknown>;
    'minecraft:default_look_angle'?: Record<string, unknown>;
    'minecraft:despawn'?: Record<string, unknown>;
    'minecraft:dimension_bound'?: Record<string, unknown>;
    'minecraft:drying_out_timer'?: Record<string, unknown>;
    'minecraft:dweller'?: Record<string, unknown>;
    'minecraft:economy_trade_table'?: Record<string, unknown>;
    'minecraft:entity_armor_equipment_slot_mapping'?: Record<string, unknown>;
    'minecraft:entity_sensor'?: Record<string, unknown>;
    'minecraft:environment_sensor'?: Record<string, unknown>;
    'minecraft:equipment'?: Record<string, unknown>;
    'minecraft:equippable'?: Record<string, unknown>;
    'minecraft:equip_item'?: Record<string, unknown>;
    'minecraft:exhaustion_values'?: Record<string, unknown>;
    'minecraft:experience_reward'?: Record<string, unknown>;
    'minecraft:explode'?: Record<string, unknown>;
    'minecraft:fire_immune'?: Record<string, unknown>;
    'minecraft:floats_in_liquid'?: Record<string, unknown>;
    'minecraft:flocking'?: Record<string, unknown>;
    'minecraft:flying_speed'?: Record<string, unknown>;
    'minecraft:follow_range'?: Record<string, unknown>;
    'minecraft:free_camera_controlled'?: Record<string, unknown>;
    'minecraft:friction_modifier'?: Record<string, unknown>;
    'minecraft:game_event_movement_tracking'?: Record<string, unknown>;
    'minecraft:genetics'?: Record<string, unknown>;
    'minecraft:giveable'?: Record<string, unknown>;
    'minecraft:ground_offset'?: Record<string, unknown>;
    'minecraft:group_size'?: Record<string, unknown>;
    'minecraft:grows_crop'?: Record<string, unknown>;
    'minecraft:health'?: Record<string, unknown>;
    'minecraft:heartbeat'?: Record<string, unknown>;
    'minecraft:hide'?: Record<string, unknown>;
    'minecraft:home'?: Record<string, unknown>;
    'minecraft:horse.jump_strength'?: Record<string, unknown>;
    'minecraft:hurt_on_condition'?: Record<string, unknown>;
    'minecraft:ignore_cannot_be_attacked'?: Record<string, unknown>;
    'minecraft:input_air_controlled'?: Record<string, unknown>;
    'minecraft:input_ground_controlled'?: Record<string, unknown>;
    'minecraft:inside_block_notifier'?: Record<string, unknown>;
    'minecraft:insomnia'?: Record<string, unknown>;
    'minecraft:instant_despawn'?: Record<string, unknown>;
    'minecraft:interact'?: Record<string, unknown>;
    'minecraft:inventory'?: Record<string, unknown>;
    'minecraft:is_baby'?: Record<string, unknown>;
    'minecraft:is_charged'?: Record<string, unknown>;
    'minecraft:is_chested'?: Record<string, unknown>;
    'minecraft:is_dyeable'?: Record<string, unknown>;
    'minecraft:is_ignited'?: Record<string, unknown>;
    'minecraft:is_pregnant'?: Record<string, unknown>;
    'minecraft:item_controllable'?: Record<string, unknown>;
    'minecraft:leashable'?: Record<string, unknown>;
    'minecraft:leashable_to'?: Record<string, unknown>;
    'minecraft:looked_at'?: Record<string, unknown>;
    'minecraft:loot'?: Record<string, unknown>;
    'minecraft:item_hopper'?: Record<string, unknown>;
    'minecraft:managed_wandering_trader'?: Record<string, unknown>;
    'minecraft:mark_variant'?: { value?: number };
    'minecraft:mob_effect'?: MobEffectConfig;
    'minecraft:mob_effect_immunity'?: { mob_effects?: string[] };
    'minecraft:movement'?: {
      max?: number;
      value?: number | { range_min: number; range_max: number };
    };
    'minecraft:movement.amphibious'?: { max_turn?: number };
    'minecraft:movement.basic'?: { max_turn?: number };
    'minecraft:movement.dolphin'?: Record<string, unknown>;
    'minecraft:movement.fly'?: {
      max_turn?: number;
      speed_when_turning?: number;
      start_speed?: number;
    };
    'minecraft:movement.generic'?: { max_turn?: number };
    'minecraft:movement.glide'?: {
      max_turn?: number;
      speed_when_turning?: number;
    };
    'minecraft:movement.hover'?: { max_turn?: number };
    'minecraft:movement.jump'?: JumpMovementConfig;
    'minecraft:movement.skip'?: { max_turn?: number };
    'minecraft:movement.sound_distance_offset'?: { value?: number };
    'minecraft:movement.sway'?: {
      sway_amplitude?: number;
      sway_frequency?: number;
    };
    'minecraft:nameable'?: {
      name_actions?: Array<{
        name_filter?: string[];
        on_named?: string | { event: string; target?: string };
      }>;
    };
    'minecraft:navigation.climb'?: NavigationConfig;
    'minecraft:navigation.float'?: NavigationFloatConfig;
    'minecraft:navigation.fly'?: NavigationConfig;
    'minecraft:navigation.generic'?: NavigationConfig;
    'minecraft:navigation.hover'?: NavigationConfig;
    'minecraft:navigation.swim'?: NavigationConfig;
    'minecraft:navigation.walk'?: NavigationConfig;
    'minecraft:offspring'?: Record<string, any>;
    'minecraft:out_of_control'?: Record<string, unknown>;
    'minecraft:peek'?: Record<string, unknown>;
    'minecraft:persistent'?: Record<string, unknown>;
    'minecraft:physics'?: Record<string, unknown>;
    'minecraft:player.exhaustion'?: { max?: number; value?: number };
    'minecraft:preferred_path'?: Record<string, any>;
  }>;
}

export type {
  CompileOpt,
  MCXFile,
  EventOpt,
  MCXCtx,
  MCXFileBase,
  ui,
  Event,
  MCXUIOpt,
  ParticleType,
  SoundEvent,
  EnchantableSlot,
  AttackCriticalHitChoices,
  StartSoundChoices,
  Rarity,
  FoodEffect,
  ItemComponentOptions,
  BlockComponentOptions,
  AddRiderConfig,
  MobEffectConfig,
  JumpMovementConfig,
  NavigationConfig,
  NavigationFloatConfig,
  EntityComponentOptions,
  BaseJson,
  EntityJson,
  ItemJson,
  JSONValue,
};

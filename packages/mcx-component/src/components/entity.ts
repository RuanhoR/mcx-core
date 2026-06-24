import * as t from '../types';

class EntityComponent {
  #opt: t.EntityComponentOptions;
  constructor(opt: t.EntityComponentOptions) {
    this.#opt = opt;
    if (!this.#opt.components) this.#opt.components = {};
  }

  getFormat(): string { return this.#opt.format; }
  setFormat(value: string) { this.#opt.format = value; }
  getId(): string { return this.#opt.id; }
  setId(value: string) { this.#opt.id = value; }
  getIsSpawnable(): boolean | undefined { return this.#opt.is_spawnable; }
  setIsSpawnable(value: boolean) { this.#opt.is_spawnable = value; }
  getIsSummonable(): boolean | undefined { return this.#opt.is_summonable; }
  setIsSummonable(value: boolean) { this.#opt.is_summonable = value; }

  getPhysics(): boolean | undefined { return this.#opt.components?.physics; }
  setPhysics(value: boolean) { if (!this.#opt.components) this.#opt.components = {}; this.#opt.components.physics = value; }
  getAddrider(): t.AddRiderConfig | undefined { return this.#opt.components?.addrider; }
  setAddrider(value: t.AddRiderConfig) { if (!this.#opt.components) this.#opt.components = {}; this.#opt.components.addrider = value; }

  // Record<string, unknown> generic get/set for all minecraft:* components
  getComponent(key: string): Record<string, unknown> | undefined {
    return (this.#opt.components as Record<string, unknown>)[key] as Record<string, unknown> | undefined;
  }
  setComponent(key: string, value: Record<string, unknown>) {
    if (!this.#opt.components) this.#opt.components = {};
    (this.#opt.components as Record<string, unknown>)[key] = value;
  }

  // Typed getters/setters for specific components
  getMarkVariant(): { value?: number } | undefined { return this.#opt.components?.['minecraft:mark_variant']; }
  setMarkVariant(value: { value?: number }) { if (!this.#opt.components) this.#opt.components = {}; this.#opt.components['minecraft:mark_variant'] = value; }
  getMobEffect(): t.MobEffectConfig | undefined { return this.#opt.components?.['minecraft:mob_effect']; }
  setMobEffect(value: t.MobEffectConfig) { if (!this.#opt.components) this.#opt.components = {}; this.#opt.components['minecraft:mob_effect'] = value; }
  getMobEffectImmunity(): { mob_effects?: string[] } | undefined { return this.#opt.components?.['minecraft:mob_effect_immunity']; }
  setMobEffectImmunity(value: { mob_effects?: string[] }) { if (!this.#opt.components) this.#opt.components = {}; this.#opt.components['minecraft:mob_effect_immunity'] = value; }
  getMovement(): { max?: number; value?: number } | undefined { return this.#opt.components?.['minecraft:movement']; }
  setMovement(value: { max?: number; value?: number }) { if (!this.#opt.components) this.#opt.components = {}; this.#opt.components['minecraft:movement'] = value; }
  getMovementAmphibious(): { max_turn?: number } | undefined { return this.#opt.components?.['minecraft:movement.amphibious']; }
  setMovementAmphibious(value: { max_turn?: number }) { if (!this.#opt.components) this.#opt.components = {}; this.#opt.components['minecraft:movement.amphibious'] = value; }
  getMovementBasic(): { max_turn?: number } | undefined { return this.#opt.components?.['minecraft:movement.basic']; }
  setMovementBasic(value: { max_turn?: number }) { if (!this.#opt.components) this.#opt.components = {}; this.#opt.components['minecraft:movement.basic'] = value; }
  getMovementFly(): { max_turn?: number; speed_when_turning?: number; start_speed?: number } | undefined { return this.#opt.components?.['minecraft:movement.fly']; }
  setMovementFly(value: { max_turn?: number; speed_when_turning?: number; start_speed?: number }) { if (!this.#opt.components) this.#opt.components = {}; this.#opt.components['minecraft:movement.fly'] = value; }
  getMovementGeneric(): { max_turn?: number } | undefined { return this.#opt.components?.['minecraft:movement.generic']; }
  setMovementGeneric(value: { max_turn?: number }) { if (!this.#opt.components) this.#opt.components = {}; this.#opt.components['minecraft:movement.generic'] = value; }
  getMovementGlide(): { max_turn?: number; speed_when_turning?: number } | undefined { return this.#opt.components?.['minecraft:movement.glide']; }
  setMovementGlide(value: { max_turn?: number; speed_when_turning?: number }) { if (!this.#opt.components) this.#opt.components = {}; this.#opt.components['minecraft:movement.glide'] = value; }
  getMovementHover(): { max_turn?: number } | undefined { return this.#opt.components?.['minecraft:movement.hover']; }
  setMovementHover(value: { max_turn?: number }) { if (!this.#opt.components) this.#opt.components = {}; this.#opt.components['minecraft:movement.hover'] = value; }
  getMovementJump(): t.JumpMovementConfig | undefined { return this.#opt.components?.['minecraft:movement.jump']; }
  setMovementJump(value: t.JumpMovementConfig) { if (!this.#opt.components) this.#opt.components = {}; this.#opt.components['minecraft:movement.jump'] = value; }
  getMovementSkip(): { max_turn?: number } | undefined { return this.#opt.components?.['minecraft:movement.skip']; }
  setMovementSkip(value: { max_turn?: number }) { if (!this.#opt.components) this.#opt.components = {}; this.#opt.components['minecraft:movement.skip'] = value; }
  getMovementSoundDistanceOffset(): { value?: number } | undefined { return this.#opt.components?.['minecraft:movement.sound_distance_offset']; }
  setMovementSoundDistanceOffset(value: { value?: number }) { if (!this.#opt.components) this.#opt.components = {}; this.#opt.components['minecraft:movement.sound_distance_offset'] = value; }
  getMovementSway(): { sway_amplitude?: number; sway_frequency?: number } | undefined { return this.#opt.components?.['minecraft:movement.sway']; }
  setMovementSway(value: { sway_amplitude?: number; sway_frequency?: number }) { if (!this.#opt.components) this.#opt.components = {}; this.#opt.components['minecraft:movement.sway'] = value; }
  getNameable(): { name_actions?: Array<{ name_filter?: string[]; on_named?: string | { event: string; target?: string } }> } | undefined { return this.#opt.components?.['minecraft:nameable']; }
  setNameable(value: { name_actions?: Array<{ name_filter?: string[]; on_named?: string | { event: string; target?: string } }> }) { if (!this.#opt.components) this.#opt.components = {}; this.#opt.components['minecraft:nameable'] = value; }
  getNavigationClimb(): t.NavigationConfig | undefined { return this.#opt.components?.['minecraft:navigation.climb']; }
  setNavigationClimb(value: t.NavigationConfig) { if (!this.#opt.components) this.#opt.components = {}; this.#opt.components['minecraft:navigation.climb'] = value; }
  getNavigationFloat(): t.NavigationFloatConfig | undefined { return this.#opt.components?.['minecraft:navigation.float']; }
  setNavigationFloat(value: t.NavigationFloatConfig) { if (!this.#opt.components) this.#opt.components = {}; this.#opt.components['minecraft:navigation.float'] = value; }
  getNavigationFly(): t.NavigationConfig | undefined { return this.#opt.components?.['minecraft:navigation.fly']; }
  setNavigationFly(value: t.NavigationConfig) { if (!this.#opt.components) this.#opt.components = {}; this.#opt.components['minecraft:navigation.fly'] = value; }
  getNavigationGeneric(): t.NavigationConfig | undefined { return this.#opt.components?.['minecraft:navigation.generic']; }
  setNavigationGeneric(value: t.NavigationConfig) { if (!this.#opt.components) this.#opt.components = {}; this.#opt.components['minecraft:navigation.generic'] = value; }
  getNavigationHover(): t.NavigationConfig | undefined { return this.#opt.components?.['minecraft:navigation.hover']; }
  setNavigationHover(value: t.NavigationConfig) { if (!this.#opt.components) this.#opt.components = {}; this.#opt.components['minecraft:navigation.hover'] = value; }
  getNavigationSwim(): t.NavigationConfig | undefined { return this.#opt.components?.['minecraft:navigation.swim']; }
  setNavigationSwim(value: t.NavigationConfig) { if (!this.#opt.components) this.#opt.components = {}; this.#opt.components['minecraft:navigation.swim'] = value; }
  getNavigationWalk(): t.NavigationConfig | undefined { return this.#opt.components?.['minecraft:navigation.walk']; }
  setNavigationWalk(value: t.NavigationConfig) { if (!this.#opt.components) this.#opt.components = {}; this.#opt.components['minecraft:navigation.walk'] = value; }

  public toJSON() {
    if (!this.#opt) throw new Error('[mcx component]: cannot read component');
    const result: Record<string, any> = {
      format_version: '',
      'minecraft:entity': {
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
      result['minecraft:entity'].description.identifier = this.#opt.id;
    } else {
      throw new Error('[compile component]: no id');
    }
    if (typeof this.#opt.is_spawnable === 'boolean') {
      result['minecraft:entity'].description.is_spawnable = this.#opt.is_spawnable;
    }
    if (typeof this.#opt.is_summonable === 'boolean') {
      result['minecraft:entity'].description.is_summonable = this.#opt.is_summonable;
    }
    if (this.#opt.components) {
      const c = this.#opt.components as Record<string, unknown>;
      for (const key of Object.keys(c)) {
        const val = c[key];
        if (val === undefined) continue;
        if (key.startsWith('minecraft:') || key === 'addrider' || key === 'physics') {
          result['minecraft:entity'].components[key] = val;
        }
      }
    }
    return result;
  }
}
export { EntityComponent };

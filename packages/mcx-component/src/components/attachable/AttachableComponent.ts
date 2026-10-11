import { applyFormatVersion, requireIdentifier } from '../../shared';

/**
 * Resource-pack item appearance (`attachables/*.json`).
 *
 * Reference:
 * https://learn.microsoft.com/en-us/minecraft/creator/reference/content/attachablereference
 */

export type AttachableAnimateEntry =
  | string
  | {
      animation_name: string;
      condition?: string;
      script?: string | string[];
      [key: string]: unknown;
    };

export interface AttachableScripts {
  /** animations to play */
  animate?: AttachableAnimateEntry[];
  /** Molang run when the attachable is set up on the parent entity */
  parent_setup?: string;
  /** Molang run before animations are processed */
  pre_animation?: string;
  /** Molang expression for the attachable's scale */
  scale?: string;
  should_update_bones_and_effects_offscreen?: boolean;
  should_update_effects_offscreen?: boolean;
}

export interface AttachableSpawnEgg {
  texture?: string;
  texture_index?: number;
}

export interface AttachableOptions {
  format?: string;
  /** the attachable id; normally matches the item it attaches to */
  id: string;
  /** the item this attachable applies to; defaults to `id` when omitted */
  item?: string;
  min_engine_version?: number;
  /** short name → material name, e.g. `{ default: 'armor', enchanted: 'armor_enchanted' }` */
  materials?: Record<string, string>;
  /** short name → geometry id, e.g. `{ default: 'geometry.helmet' }` */
  geometry?: Record<string, string>;
  /** short name → texture path, e.g. `{ default: 'textures/models/armor/helmet' }` */
  textures?: Record<string, string>;
  /** short name → animation / animation-controller id */
  animations?: Record<string, string>;
  /** short name → particle effect id */
  particle_effects?: Record<string, string>;
  /** short name → sound effect id */
  sound_effects?: Record<string, string>;
  render_controllers?: string[];
  scripts?: AttachableScripts;
  spawn_egg?: AttachableSpawnEgg;
  /** allows this attachable to be nested inside another attachable */
  enable_attachables?: boolean;
  [key: string]: unknown;
}

class AttachableComponent {
  #opt: AttachableOptions;
  #edit: unknown[];

  constructor(opt: AttachableOptions) {
    this.#opt = opt;
    this.#edit = [];
  }

  getFormat(): string | undefined {
    return this.#opt.format;
  }
  setFormat(value: string) {
    this.#opt.format = value;
  }

  getId(): string {
    return this.#opt.id;
  }
  setId(value: string) {
    this.#opt.id = value;
  }

  getItem(): string {
    return this.#opt.item ?? this.#opt.id;
  }
  setItem(value: string) {
    this.#opt.item = value;
  }

  addMaterial(shortName: string, material: string): this {
    (this.#opt.materials ??= {})[shortName] = material;
    return this;
  }

  addGeometry(shortName: string, geometry: string): this {
    (this.#opt.geometry ??= {})[shortName] = geometry;
    return this;
  }

  addTexture(shortName: string, path: string): this {
    (this.#opt.textures ??= {})[shortName] = path;
    return this;
  }

  addAnimation(shortName: string, animation: string): this {
    (this.#opt.animations ??= {})[shortName] = animation;
    return this;
  }

  addParticleEffect(shortName: string, effect: string): this {
    (this.#opt.particle_effects ??= {})[shortName] = effect;
    return this;
  }

  addSoundEffect(shortName: string, effect: string): this {
    (this.#opt.sound_effects ??= {})[shortName] = effect;
    return this;
  }

  addRenderController(controller: string): this {
    (this.#opt.render_controllers ??= []).push(controller);
    return this;
  }

  setScripts(scripts: AttachableScripts): this {
    if (typeof scripts !== 'object' || scripts === null) {
      throw new Error('[set error]: attachable: scripts must be an object');
    }
    if (scripts.animate !== undefined) {
      if (!Array.isArray(scripts.animate)) {
        throw new Error('[set error]: attachable: scripts.animate must be an array');
      }
      for (const entry of scripts.animate) {
        if (typeof entry === 'string') continue;
        if (typeof entry !== 'object' || entry === null) {
          throw new Error(
            '[set error]: attachable: scripts.animate entries must be strings or objects',
          );
        }
        if (typeof entry.animation_name !== 'string' || !entry.animation_name) {
          throw new Error(
            '[set error]: attachable: scripts.animate[].animation_name is required',
          );
        }
      }
    }
    this.#opt.scripts = scripts;
    return this;
  }

  setSpawnEgg(spawnEgg: AttachableSpawnEgg): this {
    if (typeof spawnEgg !== 'object' || spawnEgg === null) {
      throw new Error('[set error]: attachable: spawn_egg must be an object');
    }
    this.#opt.spawn_egg = spawnEgg;
    return this;
  }

  setEnableAttachables(value: boolean): this {
    if (typeof value !== 'boolean') {
      throw new Error('[set error]: attachable: enable_attachables must be a boolean');
    }
    this.#opt.enable_attachables = value;
    return this;
  }

  public toJSON(): Record<string, unknown> {
    if (!this.#opt) throw new Error('[mcx component]: cannot read component');

    const description: Record<string, unknown> = {
      identifier: requireIdentifier(this.#opt.id, 'attachable'),
    };

    for (const key of [
      'item',
      'min_engine_version',
      'materials',
      'geometry',
      'textures',
      'animations',
      'particle_effects',
      'sound_effects',
      'render_controllers',
      'scripts',
      'spawn_egg',
      'enable_attachables',
    ] as const) {
      const value = this.#opt[key];
      if (value !== undefined) description[key] = value;
    }

    for (const [key, value] of Object.entries(this.#opt)) {
      if (key === 'format' || key === 'id') continue;
      if (key in description) continue;
      description[key] = value;
    }

    const result: Record<string, unknown> = {
      _meta: { type: 'attachable', file_edit: this.#edit },
      'minecraft:attachable': { description },
    };
    applyFormatVersion(result, {
      component: 'attachable',
      format: this.#opt.format,
      fallback: '1.8.0',
    });
    return result;
  }
}

export { AttachableComponent };

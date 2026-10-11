import { applyFormatVersion, requireIdentifier } from '../../shared';

/**
 * Resource-pack entity appearance (`entities/*.client.json`).
 *
 * Reference:
 * https://learn.microsoft.com/en-us/minecraft/creator/reference/content/entityreference/examples/cliententitydocumentation/cliententitydocumentationintroduction
 */

export interface SpawnEgg {
  texture?: string;
  texture_index?: number;
  /** `minecraft:undyed_shulker_box` style; the item shown before dyeing */
  background_texture?: string;
  dyeable?: boolean;
}

export interface ClientEntityScripts {
  /** Molang evaluated before animations run */
  pre_animation?: string | string[];
  scale?: string;
  animate?: Array<string | { [animation: string]: string }>;
  [key: string]: unknown;
}

export interface ClientEntityOptions {
  format?: string;
  id: string;
  min_engine_version?: string;
  materials?: Record<string, string>;
  textures?: Record<string, string>;
  geometry?: Record<string, string>;
  animations?: Record<string, string>;
  animation_controllers?: Array<string | Record<string, string>>;
  render_controllers?: Array<string | Record<string, string>>;
  particle_effects?: Record<string, string>;
  sound_effects?: Record<string, string>;
  /** bone name → `[x, y, z]` model-space offsets */
  locators?: Record<string, [number, number, number]>;
  scripts?: ClientEntityScripts;
  spawn_egg?: SpawnEgg;
  /** enables the entity's appearance even when not normally rendered */
  is_hidden_when_invisible?: boolean;
  /** virtual device / XR overrides */
  [key: string]: unknown;
}

class ClientEntityComponent {
  #opt: ClientEntityOptions;
  #edit: { type: string; file_edit: unknown[] }['file_edit'];

  constructor(opt: ClientEntityOptions) {
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

  getMinEngineVersion(): string | undefined {
    return this.#opt.min_engine_version;
  }
  setMinEngineVersion(value: string) {
    this.#opt.min_engine_version = value;
  }

  /** Registers a short name → texture path pair. */
  addTexture(shortName: string, path: string): this {
    if (typeof shortName !== 'string' || !shortName.trim()) {
      throw new Error('[set error]: client entity: texture name must be a string');
    }
    if (typeof path !== 'string' || !path.trim()) {
      throw new Error('[set error]: client entity: texture path must be a string');
    }
    (this.#opt.textures ??= {})[shortName] = path;
    return this;
  }

  addMaterial(shortName: string, material: string): this {
    (this.#opt.materials ??= {})[shortName] = material;
    return this;
  }

  addGeometry(shortName: string, geometry: string): this {
    (this.#opt.geometry ??= {})[shortName] = geometry;
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

  /** Animation controllers are referenced as `{ shortName: controllerId }`. */
  addAnimationController(shortName: string, controller: string): this {
    if (typeof shortName !== 'string' || !shortName.trim()) {
      throw new Error(
        '[set error]: client entity: animation controller name must be a string',
      );
    }
    const list = (this.#opt.animation_controllers ??= []);
    if (
      list.some(entry => typeof entry === 'object' && entry != null && shortName in entry)
    ) {
      throw new Error(
        `[set error]: client entity: animation controller "${shortName}" is already defined`,
      );
    }
    list.push({ [shortName]: controller });
    return this;
  }

  addRenderController(controller: string): this {
    if (typeof controller !== 'string' || !controller.trim()) {
      throw new Error(
        '[set error]: client entity: render controller must be a non-empty string',
      );
    }
    (this.#opt.render_controllers ??= []).push(controller);
    return this;
  }

  setLocator(bone: string, offset: [number, number, number]): this {
    if (
      !Array.isArray(offset) ||
      offset.length !== 3 ||
      !offset.every(n => typeof n === 'number')
    ) {
      throw new Error(
        `[set error]: client entity: locator "${bone}" must be [x, y, z] of numbers`,
      );
    }
    (this.#opt.locators ??= {})[bone] = offset;
    return this;
  }

  setScripts(scripts: ClientEntityScripts): this {
    this.#opt.scripts = scripts;
    return this;
  }

  setSpawnEgg(spawnEgg: SpawnEgg): this {
    if (typeof spawnEgg !== 'object' || spawnEgg === null) {
      throw new Error('[set error]: client entity: spawn_egg must be an object');
    }
    if (
      spawnEgg.texture_index !== undefined &&
      (!Number.isInteger(spawnEgg.texture_index) || spawnEgg.texture_index < 0)
    ) {
      throw new Error(
        '[set error]: client entity: spawn_egg.texture_index must be a non-negative integer',
      );
    }
    this.#opt.spawn_egg = spawnEgg;
    return this;
  }

  public toJSON(): Record<string, unknown> {
    if (!this.#opt) throw new Error('[mcx component]: cannot read component');

    const description: Record<string, unknown> = {
      identifier: requireIdentifier(this.#opt.id, 'client entity'),
    };

    for (const key of [
      'min_engine_version',
      'materials',
      'textures',
      'geometry',
      'animations',
      'animation_controllers',
      'render_controllers',
      'particle_effects',
      'sound_effects',
      'locators',
      'scripts',
      'spawn_egg',
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
      _meta: { type: 'clientEntity', file_edit: this.#edit },
      'minecraft:client_entity': { description },
    };
    applyFormatVersion(result, {
      component: 'client entity',
      format: this.#opt.format,
      fallback: '1.8.0',
    });
    return result;
  }
}

export { ClientEntityComponent };

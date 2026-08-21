interface SpawnBiomeFilter {
  all_of?: SpawnBiomeFilter[];
  any_of?: SpawnBiomeFilter[];
  none_of?: SpawnBiomeFilter[];
  test?: string;
  subject?: string;
  operator?: string;
  value?: string | number | boolean;
  domain?: string;
}

interface SpawnBrightnessFilter {
  min?: number;
  max?: number;
  adjust_for_weather?: boolean;
}

interface SpawnDelayFilter {
  identifier?: string;
  min?: number;
  max?: number;
  spawn_chance?: number;
}

interface SpawnDensityLimit {
  surface?: number;
  underground?: number;
}

interface SpawnDifficultyFilter {
  min?: 'peaceful' | 'easy' | 'normal' | 'hard';
  max?: 'peaceful' | 'easy' | 'normal' | 'hard';
}

interface SpawnDistanceFilter {
  min?: number;
  max?: number;
}

interface SpawnHerd {
  min_size?: number;
  max_size?: number;
  event?: string;
  event_skip_count?: number;
}

interface SpawnMobEventFilter {
  event?: string;
}

interface SpawnPlayerInVillageFilter {
  distance?: number;
  village_border_tolerance?: number;
}

interface SpawnWeight {
  default?: number;
  rarity?: number;
}

interface SpawnWorldAgeFilter {
  min?: number;
  max?: number;
}

interface SpawnCondition {
  'minecraft:biome_filter'?: SpawnBiomeFilter | SpawnBiomeFilter[];
  'minecraft:brightness_filter'?: SpawnBrightnessFilter;
  'minecraft:delay_filter'?: SpawnDelayFilter;
  'minecraft:density_limit'?: SpawnDensityLimit;
  'minecraft:difficulty_filter'?: SpawnDifficultyFilter;
  'minecraft:distance_filter'?: SpawnDistanceFilter;
  'minecraft:height_filter'?: SpawnDistanceFilter;
  'minecraft:herd'?: SpawnHerd | SpawnHerd[];
  'minecraft:is_experimental'?: Record<string, unknown>;
  'minecraft:is_persistent'?: Record<string, unknown>;
  'minecraft:mob_event_filter'?: SpawnMobEventFilter;
  'minecraft:player_in_village_filter'?: SpawnPlayerInVillageFilter;
  'minecraft:spawn_event'?: { event?: string };
  'minecraft:spawns_above_block_filter'?: { blocks?: string[]; distance?: number };
  'minecraft:spawns_lava'?: Record<string, unknown>;
  'minecraft:spawns_on_block_filter'?: string | string[];
  'minecraft:spawns_on_block_prevented_filter'?: string[];
  'minecraft:spawns_on_surface'?: Record<string, unknown>;
  'minecraft:spawns_underground'?: Record<string, unknown>;
  'minecraft:spawns_underwater'?: Record<string, unknown>;
  'minecraft:weight'?: SpawnWeight;
  'minecraft:world_age_filter'?: SpawnWorldAgeFilter;
  [key: string]: unknown;
}

interface SpawnRuleOptions {
  format?: string;
  identifier: string;
  population_control?: string;
  conditions?: SpawnCondition[];
}

class SpawnRuleComponent {
  #opt: SpawnRuleOptions;
  #conditions: SpawnCondition[] = [];

  constructor(opt: SpawnRuleOptions) {
    this.#opt = opt;
    if (opt.conditions) {
      this.#conditions = opt.conditions.map(c => ({ ...c }));
    }
  }

  getFormat(): string {
    return this.#opt.format || '1.21.0';
  }

  setFormat(value: string) {
    this.#opt.format = value;
  }

  getIdentifier(): string {
    return this.#opt.identifier;
  }

  setIdentifier(value: string) {
    this.#opt.identifier = value;
  }

  getPopulationControl(): string | undefined {
    return this.#opt.population_control;
  }

  setPopulationControl(value: string) {
    this.#opt.population_control = value;
  }

  getConditions(): SpawnCondition[] {
    return this.#conditions;
  }

  addCondition(condition: SpawnCondition): this {
    this.#conditions.push(condition);
    return this;
  }

  setBiomeFilter(
    index: number,
    filter: SpawnBiomeFilter | SpawnBiomeFilter[],
  ): this {
    if (!this.#conditions[index]) {
      this.#conditions[index] = {};
    }
    this.#conditions[index]['minecraft:biome_filter'] = filter;
    return this;
  }

  setBrightnessFilter(
    index: number,
    filter: SpawnBrightnessFilter,
  ): this {
    if (!this.#conditions[index]) {
      this.#conditions[index] = {};
    }
    this.#conditions[index]['minecraft:brightness_filter'] = filter;
    return this;
  }

  setDistanceFilter(
    index: number,
    filter: SpawnDistanceFilter,
  ): this {
    if (!this.#conditions[index]) {
      this.#conditions[index] = {};
    }
    this.#conditions[index]['minecraft:distance_filter'] = filter;
    return this;
  }

  setHeightFilter(
    index: number,
    filter: SpawnDistanceFilter,
  ): this {
    if (!this.#conditions[index]) {
      this.#conditions[index] = {};
    }
    this.#conditions[index]['minecraft:height_filter'] = filter;
    return this;
  }

  setWeight(
    index: number,
    weight: SpawnWeight,
  ): this {
    if (!this.#conditions[index]) {
      this.#conditions[index] = {};
    }
    this.#conditions[index]['minecraft:weight'] = weight;
    return this;
  }

  setHerd(
    index: number,
    herd: SpawnHerd | SpawnHerd[],
  ): this {
    if (!this.#conditions[index]) {
      this.#conditions[index] = {};
    }
    this.#conditions[index]['minecraft:herd'] = herd;
    return this;
  }

  setSpawnEvent(
    index: number,
    event: { event?: string },
  ): this {
    if (!this.#conditions[index]) {
      this.#conditions[index] = {};
    }
    this.#conditions[index]['minecraft:spawn_event'] = event;
    return this;
  }

  setIsPersistent(index: number): this {
    if (!this.#conditions[index]) {
      this.#conditions[index] = {};
    }
    this.#conditions[index]['minecraft:is_persistent'] = {};
    return this;
  }

  public toJSON(): Record<string, unknown> {
    if (!this.#opt.identifier) {
      throw new Error('[compile component]: spawn_rule: identifier is required');
    }

    const description: Record<string, unknown> = {
      identifier: this.#opt.identifier,
    };

    if (typeof this.#opt.population_control === 'string') {
      description.population_control = this.#opt.population_control;
    }

    return {
      format_version: this.#opt.format || '1.21.0',
      'minecraft:spawn_rules': {
        description,
        conditions: this.#conditions,
      },
    };
  }
}

export { SpawnRuleComponent };

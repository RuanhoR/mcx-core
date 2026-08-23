/**
 * Bedrock loot table (loot_tables/*.json).
 *
 * Schema reference:
 * https://learn.microsoft.com/en-us/minecraft/creator/reference/content/loottablereference/examples/loottabledefinitionlist
 */

export type LootEntryType = 'item' | 'loot_table' | 'empty';

export interface LootRange {
  min: number;
  max: number;
}

/** number or a min/max range — used by count/damage/rolls style fields */
export type LootNumber = number | LootRange;

// ---------------------------------------------------------------------------
// Conditions
// ---------------------------------------------------------------------------

export interface KilledByPlayerCondition {
  condition: 'killed_by_player';
}

export interface RandomChanceCondition {
  condition: 'random_chance';
  /** chance between 0 and 1 */
  chance: number;
}

export interface RandomChanceWithLootingCondition {
  condition: 'random_chance_with_looting';
  chance: number;
  looting_multiplier: number;
}

export interface EntityPropertiesCondition {
  condition: 'entity_properties';
  /** subject of the check: this / other / killer / damager … */
  entity: string;
  properties: Record<string, unknown>;
}

export interface MatchToolCondition {
  condition: 'match_tool';
  item?: string;
}

export interface SurvivesExplosionCondition {
  condition: 'survives_explosion';
}

export interface IsExplosionCondition {
  condition: 'is_explosion';
}

export interface WeatherCheckCondition {
  condition: 'weather_check';
  raining?: boolean;
  thundering?: boolean;
}

/** Escape hatch for conditions not covered above; keeps autocompletion for known ones. */
export interface CustomLootCondition {
  condition: string & {};
  [key: string]: unknown;
}

export type LootCondition =
  | KilledByPlayerCondition
  | RandomChanceCondition
  | RandomChanceWithLootingCondition
  | EntityPropertiesCondition
  | MatchToolCondition
  | SurvivesExplosionCondition
  | IsExplosionCondition
  | WeatherCheckCondition
  | CustomLootCondition;

// ---------------------------------------------------------------------------
// Functions
// ---------------------------------------------------------------------------

export interface SetCountFunction {
  function: 'set_count';
  count: LootNumber;
}

export interface SetDataFunction {
  function: 'set_data';
  data: LootNumber;
}

export interface SetDamageFunction {
  function: 'set_damage';
  damage: LootNumber;
}

export interface SetNameFunction {
  function: 'set_name';
  name: string;
}

export interface SetLoreFunction {
  function: 'set_lore';
  lore: string[];
}

export interface EnchantRandomlyFunction {
  function: 'enchant_randomly';
}

export interface EnchantWithLevelsFunction {
  function: 'enchant_with_levels';
  levels?: LootNumber;
}

export interface SetPotionFunction {
  function: 'set_potion';
  id: string;
}

export type ExplorationMapDestination =
  | 'buriedtreasure'
  | 'endcity'
  | 'fortress'
  | 'mansion'
  | 'mineshaft'
  | 'monument'
  | 'pillageroutpost'
  | 'ruins'
  | 'shipwreck'
  | 'stronghold'
  | 'temple'
  | 'village';

export interface ExplorationMapFunction {
  function: 'exploration_map';
  destination: ExplorationMapDestination;
}

export interface FillContainerFunction {
  function: 'fill_container';
  loot_table: string;
}

export interface FurnaceSmeltFunction {
  function: 'furnace_smelt';
}

export interface TraderMaterialTypeFunction {
  function: 'trader_material_type';
}

/** Escape hatch for functions not covered above. */
export interface CustomLootFunction {
  function: string & {};
  [key: string]: unknown;
}

export type LootTableFunction =
  | SetCountFunction
  | SetDataFunction
  | SetDamageFunction
  | SetNameFunction
  | SetLoreFunction
  | EnchantRandomlyFunction
  | EnchantWithLevelsFunction
  | SetPotionFunction
  | ExplorationMapFunction
  | FillContainerFunction
  | FurnaceSmeltFunction
  | TraderMaterialTypeFunction
  | CustomLootFunction;

// ---------------------------------------------------------------------------
// Pools / Entries
// ---------------------------------------------------------------------------

export interface LootPoolEntry {
  /** entry type, defaults to "item" when name is present */
  type?: LootEntryType;
  /** item id or referenced loot table path (for type "loot_table") */
  name?: string;
  weight?: number;
  quality?: number;
  functions?: (LootTableFunction & { conditions?: LootCondition[] })[];
  conditions?: LootCondition[];
}

export interface LootPoolOptions {
  /** fixed roll count or a min/max range */
  rolls?: LootNumber;
  entries: LootPoolEntry[];
  conditions?: LootCondition[];
}

/** A single loot pool: rolls over its entries and merges the results. */
export class LootPool {
  #opt: Required<Pick<LootPoolOptions, 'entries'>> & LootPoolOptions;

  constructor(opt: LootPoolOptions) {
    this.#opt = {
      entries: opt.entries ?? [],
      ...(opt.rolls !== undefined ? { rolls: opt.rolls } : {}),
      ...(opt.conditions !== undefined ? { conditions: opt.conditions } : {})
    };
  }

  getRolls(): LootNumber | undefined {
    return this.#opt.rolls;
  }
  setRolls(rolls: LootNumber): this {
    this.#opt.rolls = rolls;
    return this;
  }

  getEntries(): LootPoolEntry[] {
    return this.#opt.entries;
  }
  setEntries(entries: LootPoolEntry[]): this {
    this.#opt.entries = entries;
    return this;
  }
  addEntry(entry: LootPoolEntry): this {
    this.#opt.entries.push(entry);
    return this;
  }

  getConditions(): LootCondition[] | undefined {
    return this.#opt.conditions;
  }
  setConditions(conditions: LootCondition[]): this {
    this.#opt.conditions = conditions;
    return this;
  }
  addCondition(condition: LootCondition): this {
    ;(this.#opt.conditions ??= []).push(condition);
    return this;
  }

  toJSON(): LootPoolOptions {
    return this.#opt;
  }
}

export type LootPoolLike = LootPool | LootPoolOptions;

export interface LootTableComponentOptions {
  /**
   * Optional. Vanilla loot tables usually omit `format_version`;
   * set it only if you specifically need one.
   */
  format?: string;
  pools: Array<LootPool | LootPoolOptions>;
}

class LootTableComponent {
  #opt: LootTableComponentOptions;

  constructor(opt: LootTableComponentOptions) {
    this.#opt = opt;
    this.#opt.pools = (this.#opt.pools ?? []).map(p => this.#toJSONPool(p));
  }

  #toJSONPool(pool: LootPool | LootPoolOptions): LootPoolOptions {
    return pool instanceof LootPool ? pool.toJSON() : pool;
  }

  getFormat(): string | undefined {
    return this.#opt.format;
  }
  setFormat(value: string) {
    this.#opt.format = value;
  }

  getPools(): LootPoolOptions[] {
    return this.#opt.pools.map(p => this.#toJSONPool(p));
  }
  setPools(pools: Array<LootPool | LootPoolOptions>) {
    this.#opt.pools = pools.map(p => this.#toJSONPool(p));
  }
  addPool(pool: LootPool | LootPoolOptions): this {
    this.#opt.pools.push(this.#toJSONPool(pool));
    return this;
  }

  public toJSON(): Record<string, unknown> {
    if (!this.#opt) throw new Error('[mcx component]: cannot read component');
    const pools = this.#opt.pools;
    if (!Array.isArray(pools) || pools.length === 0) {
      throw new Error('[mcx component]: loot table needs at least one pool');
    }
    const result: Record<string, unknown> = { pools };
    const format = this.#opt.format;
    if (typeof format === 'string' && /^\d+\.\d+(\.\d+)?$/.test(format)) {
      result.format_version = format;
    } else if (format !== undefined) {
      throw new Error(
        `[compile component]: invalid loot table format: ${String(format)}`
      );
    }
    return result;
  }
}

export { LootTableComponent };

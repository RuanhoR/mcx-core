/**
 * Bedrock villager trade table (trading/*.json).
 *
 * Schema reference:
 * https://learn.microsoft.com/en-us/minecraft/creator/documents/createtradetable
 */

export interface TradeItem {
  item: string;
  quantity?: number | { min: number; max: number };
  /** price multiplier for villager trades */
  price_multiplier?: number;
  functions?: Array<{ function: string } & Record<string, unknown>>;
}

export interface Trade {
  /** items the villager wants (cost) */
  wants: TradeItem[];
  /** items the villager gives */
  gives: TradeItem[];
  /** experience the trader gains from this trade */
  trader_exp?: number;
  /** how many times this trade can be used before restocking */
  max_uses?: number;
  /** whether using this trade rewards the player with xp */
  reward_exp?: boolean;
}

export interface TradeGroup {
  trades: Trade[];
}

export interface TradeTier {
  groups: TradeGroup[];
}

export interface TradeTableComponentOptions {
  /**
   * Optional. Vanilla trade tables usually omit `format_version`;
   * set it only if you specifically need one.
   */
  format?: string;
  tiers: TradeTier[];
}

class TradeTableComponent {
  #opt: TradeTableComponentOptions;

  constructor(opt: TradeTableComponentOptions) {
    this.#opt = opt;
    if (!Array.isArray(this.#opt.tiers)) this.#opt.tiers = [];
  }

  getFormat(): string | undefined {
    return this.#opt.format;
  }
  setFormat(value: string) {
    this.#opt.format = value;
  }

  getTiers(): TradeTier[] {
    return this.#opt.tiers;
  }
  setTiers(tiers: TradeTier[]) {
    this.#opt.tiers = tiers;
  }
  addTier(tier: TradeTier): this {
    this.#opt.tiers.push(tier);
    return this;
  }

  public toJSON(): Record<string, unknown> {
    if (!this.#opt) throw new Error('[mcx component]: cannot read component');
    const tiers = this.#opt.tiers;
    if (!Array.isArray(tiers) || tiers.length === 0) {
      throw new Error('[mcx component]: trade table needs at least one tier');
    }
    const result: Record<string, unknown> = { tiers };
    const format = this.#opt.format;
    if (typeof format === 'string' && /^\d+\.\d+(\.\d+)?$/.test(format)) {
      result.format_version = format;
    } else if (format !== undefined) {
      throw new Error(
        `[compile component]: invalid trade table format: ${String(format)}`
      );
    }
    return result;
  }
}

export { TradeTableComponent };

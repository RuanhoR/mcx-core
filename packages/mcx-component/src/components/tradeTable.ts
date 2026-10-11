/**
 * Bedrock villager trade table (trading/*.json).
 *
 * Schema reference:
 * https://learn.microsoft.com/en-us/minecraft/creator/documents/createtradetable
 */

import { applyFormatVersion, requirePresent } from '../shared';

export interface TradeItemQuantity {
  min: number;
  max: number;
}

export interface TradeItem {
  item: string;
  quantity?: number | TradeItemQuantity;
  /** price multiplier for villager trades, defaults to 0.05 */
  price_multiplier?: number;
  functions?: Array<{ function: string } & Record<string, unknown>>;
  /** alternative items that also satisfy the trade */
  choice?: unknown[];
  filters?: Record<string, unknown>;
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
  /** how many of `trades` are randomly offered, defaults to 1 */
  num_to_select?: number;
  trades: Trade[];
}

export interface TradeTier {
  /** xp needed before the tier unlocks, defaults to 0 */
  total_exp_required?: number;
  groups?: TradeGroup[];
  /** trades declared directly on the tier, an alternative to `groups` */
  trades?: Trade[];
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
    for (const [index, tier] of tiers.entries()) {
      requirePresent(tier?.groups ?? tier?.trades, 'trade table', `tiers[${index}]`);
    }
    const result: Record<string, unknown> = { tiers };
    applyFormatVersion(result, {
      component: 'trade table',
      format: this.#opt.format,
    });
    return result;
  }
}

export { TradeTableComponent };

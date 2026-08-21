interface FeatureReplaceRule {
  replace_block?: string | string[];
  with_block?: string | string[];
}

interface OreFeatureOptions {
  format?: string;
  identifier: string;
  count?: number;
  replace_rules?: FeatureReplaceRule[];
}

interface FeatureJson {
  format_version: string;
  'minecraft:ore_feature': {
    description: {
      identifier: string;
    };
    count?: number;
    replace_rules?: Array<{
      replace_block?: string | string[];
      with_block?: string | string[];
    }>;
  };
}

class FeatureComponent {
  #opt: OreFeatureOptions;

  constructor(opt: OreFeatureOptions) {
    this.#opt = opt;
  }

  getFormat(): string {
    return this.#opt.format || '1.17.0';
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

  getCount(): number | undefined {
    return this.#opt.count;
  }

  setCount(value: number) {
    if (typeof value !== 'number' || value < 0) {
      throw new Error('[set error]: feature: count must be non-negative number');
    }
    this.#opt.count = value;
  }

  getReplaceRules(): FeatureReplaceRule[] | undefined {
    return this.#opt.replace_rules;
  }

  setReplaceRules(value: FeatureReplaceRule[]) {
    if (!Array.isArray(value)) {
      throw new Error('[set error]: feature: replace_rules must be array');
    }
    this.#opt.replace_rules = value;
  }

  addReplaceRule(rule: FeatureReplaceRule): this {
    if (!this.#opt.replace_rules) {
      this.#opt.replace_rules = [];
    }
    this.#opt.replace_rules.push(rule);
    return this;
  }

  public toJSON(): FeatureJson {
    if (!this.#opt.identifier) {
      throw new Error('[compile component]: feature: identifier is required');
    }

    const result: FeatureJson = {
      format_version: this.#opt.format || '1.17.0',
      'minecraft:ore_feature': {
        description: {
          identifier: this.#opt.identifier,
        },
      },
    };

    if (typeof this.#opt.count === 'number') {
      result['minecraft:ore_feature'].count = this.#opt.count;
    }

    if (Array.isArray(this.#opt.replace_rules)) {
      result['minecraft:ore_feature'].replace_rules =
        this.#opt.replace_rules.map(rule => ({
          ...(rule.replace_block !== undefined && {
            replace_block: rule.replace_block,
          }),
          ...(rule.with_block !== undefined && { with_block: rule.with_block }),
        }));
    }

    return result;
  }
}

export { FeatureComponent };

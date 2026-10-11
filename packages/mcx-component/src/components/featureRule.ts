import {
  applyFormatVersion,
  requireField,
  requireIdentifier,
  resolveFormatVersion,
} from '../shared';

interface FeatureRuleBiomeFilter {
  all_of?: FeatureRuleBiomeFilter[];
  any_of?: FeatureRuleBiomeFilter[];
  none_of?: FeatureRuleBiomeFilter[];
  test?: string;
  subject?: string;
  operator?: string;
  value?: string | number | boolean;
  domain?: string;
}

interface FeatureRuleConditions {
  placement_pass?: string;
  'minecraft:biome_filter'?: FeatureRuleBiomeFilter | FeatureRuleBiomeFilter[];
}

interface FeatureRuleDistributionAxis {
  distribution?: 'uniform' | 'gaussian' | 'inverse_gaussian' | 'uniform_distribution';
  extent?: [number, number] | number;
  step?: number;
  grid?: {
    min_to_center?: number;
    max_to_center?: number;
  };
}

interface FeatureRuleDistribution {
  coordinate_eval_order?: 'xzy' | 'xyz' | 'yxz' | 'yzx' | 'zxy' | 'zyx';
  iterations?: number | string;
  scatter_chance?: number | string;
  x?: FeatureRuleDistributionAxis | number;
  y?: FeatureRuleDistributionAxis | number;
  z?: FeatureRuleDistributionAxis | number;
}

interface FeatureRuleDescription {
  identifier: string;
  places_feature: string;
}

interface FeatureRuleOptions {
  format?: string;
  identifier: string;
  places_feature: string;
  conditions?: FeatureRuleConditions;
  distribution?: FeatureRuleDistribution;
}

class FeatureRuleComponent {
  #opt: FeatureRuleOptions;
  #conditions: FeatureRuleConditions = {};
  #distribution: FeatureRuleDistribution = {};

  constructor(opt: FeatureRuleOptions) {
    this.#opt = opt;
    if (opt.conditions) {
      this.#conditions = { ...opt.conditions };
    }
    if (opt.distribution) {
      this.#distribution = { ...opt.distribution };
    }
  }

  getFormat(): string {
    return resolveFormatVersion({
      component: 'feature rule',
      format: this.#opt.format,
      fallback: '1.13.0',
    })!;
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

  getPlacesFeature(): string {
    return this.#opt.places_feature;
  }

  setPlacesFeature(value: string) {
    this.#opt.places_feature = value;
  }

  getConditions(): FeatureRuleConditions {
    return this.#conditions;
  }

  setPlacementPass(pass: string): this {
    this.#conditions.placement_pass = pass;
    return this;
  }

  setBiomeFilter(filter: FeatureRuleBiomeFilter | FeatureRuleBiomeFilter[]): this {
    this.#conditions['minecraft:biome_filter'] = filter;
    return this;
  }

  getDistribution(): FeatureRuleDistribution {
    return this.#distribution;
  }

  setIterations(iterations: number | string): this {
    this.#distribution.iterations = iterations;
    return this;
  }

  setScatterChance(chance: number | string): this {
    this.#distribution.scatter_chance = chance;
    return this;
  }

  setAxisDistribution(
    axis: 'x' | 'y' | 'z',
    config: FeatureRuleDistributionAxis | number,
  ): this {
    this.#distribution[axis] = config;
    return this;
  }

  setCoordinateEvalOrder(order: 'xzy' | 'xyz' | 'yxz' | 'yzx' | 'zxy' | 'zyx'): this {
    this.#distribution.coordinate_eval_order = order;
    return this;
  }

  public toJSON(): Record<string, unknown> {
    const description: FeatureRuleDescription = {
      identifier: requireIdentifier(this.#opt.identifier, 'feature_rule'),
      places_feature: requireField(
        this.#opt.places_feature,
        'feature_rule',
        'places_feature',
      ),
    };

    const definition: Record<string, unknown> = {
      description,
    };

    if (Object.keys(this.#conditions).length > 0) {
      definition.conditions = this.#conditions;
    }

    if (Object.keys(this.#distribution).length > 0) {
      definition.distribution = this.#distribution;
    }

    const result: Record<string, unknown> = {
      'minecraft:feature_rules': definition,
    };
    applyFormatVersion(result, {
      component: 'feature rule',
      format: this.#opt.format,
      fallback: '1.13.0',
    });
    return result;
  }
}

export { FeatureRuleComponent };

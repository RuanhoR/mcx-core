import * as t from '../types';

class EntityComponent {
  #opt: t.EntityComponentOptions;

  constructor(opt: t.EntityComponentOptions) {
    this.#opt = opt;
  }

  public toJSON() {
    if (!this.#opt) throw new Error('[mcx component]: cannot read component');

    const result: Record<string, any> = {
      format_version: '',
      'minecraft:entity': {
        description: {
          identifier: '',
        },
      },
    };
    if (
      typeof this.#opt.format == 'string' &&
      /\d+\.\d+\.\d+/.test(this.#opt.format)
    ) {
      result['format_version'] = this.#opt.format;
    } else {
      throw new Error('[compile component]: no format');
    }
    if (
      typeof this.#opt.id == 'string' &&
      /[a-zA-Z0-9_]:[a-zA-Z0-9_]/.test(this.#opt.id)
    ) {
      result['minecraft:entity'].description.identifier = this.#opt.id;
    } else {
      throw new Error('[compile component]: no id');
    }
    if (typeof this.#opt.is_spawnable === 'boolean') {
      result['minecraft:entity'].description.is_spawnable =
        this.#opt.is_spawnable;
    }
    if (typeof this.#opt.is_summonable === 'boolean') {
      result['minecraft:entity'].description.is_summonable =
        this.#opt.is_summonable;
    }
    return result;
  }
}
export { EntityComponent };

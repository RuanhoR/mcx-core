import { randomUUID } from 'node:crypto';
import * as t from '../types';

class ItemComponent {
  #opt: t.ItemComponentOptions;
  constructor(opt: t.ItemComponentOptions) {
    this.#opt = opt;
  }
  public toJSON() {
    if (!this.#opt) throw new Error('[mcx component]: cannot read component');
    const result: Record<string, any> = {
      format_version: '',
      'minecraft:item': {
        components: {},
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
      result['minecraft:item'].description.identifier = this.#opt.id;
    } else {
      throw new Error('[compile component]:cno id');
    }
    const ApplyComponents = result['minecraft:item'].components;
    if (typeof this.#opt.name == 'string') {
      ApplyComponents['minecraft:display_name'] = {
        value: this.#opt.name,
      };
    }
    if (this.#opt.components) {
      const components = this.#opt.components;
      if (typeof components.damage == 'number') {
        ApplyComponents['minecraft:damage'] = {
          value: components.damage,
        };
      }
      if (typeof components.offHand == 'boolean') {
        ApplyComponents['minecraft:allow_off_hand'] = {
          value: components.offHand,
        };
      }
      if (typeof components.canDestroyInCreative == 'boolean') {
        ApplyComponents['minecraft:can_destroy_in_creative'] = {
          value: components.canDestroyInCreative,
        };
      }
      if (typeof components.icon == 'string' && components.icon.trim()) {
        ApplyComponents['minecraft:icon'] = {
          textures: components.icon.trim(),
        };
      } else if (
        typeof components.icon == 'object' &&
        components.icon &&
        'classId' in components.icon &&
        components.icon.classId == 'mcx_png_2340192'
      ) {
        ApplyComponents['minecraft:icon'] = {
          textures: components.icon.filePath,
        };
      }
      if (typeof components.glint === 'boolean') {
        ApplyComponents['minecraft:glint'] = {
          value: components.glint,
        };
      }
      if (typeof components.hand_equipped === 'boolean') {
        ApplyComponents['minecraft:hand_equipped'] = {
          value: components.hand_equipped,
        };
      }
    }
    return result;
  }
}
export { ItemComponent };

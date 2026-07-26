import { createLazyClass } from './lazy';
import {
  ImageComponent,
  PNGImageComponent,
  JPGImageComponent,
  SVGImageComponent,
  GIFImageComponent,
} from './lib';

export {
  ImageComponent,
  PNGImageComponent,
  JPGImageComponent,
  SVGImageComponent,
  GIFImageComponent,
};

// Loader: try require() first (works in bundled CJS), fall back to import() (vitest ESM)
function lazyComponent(path: string, name: string) {
  return createLazyClass(() => {
    try {
      return require(path)[name];
    } catch {
      return import(/* @vite-ignore */ path).then(m => m[name]);
    }
  });
}

export const ItemComponent = lazyComponent('./components/item', 'ItemComponent');
export const BlockComponent = lazyComponent('./components/block', 'BlockComponent');
export const EntityComponent = lazyComponent('./components/entity', 'EntityComponent');
export const RecipeComponent = lazyComponent('./components/recipe', 'RecipeComponent');

export { createLazyClass } from './lazy';

export {
  ParticleTypeEnum,
  SoundEventEnum,
  EnchantableSlotArray,
  EnchantableSlotEnum,
  AttackCriticalHitChoicesEnum,
  StartSoundChoicesEnum,
  createFileEdit,
} from './types';

export type {
  ParticleType,
  SoundEvent,
  EnchantableSlot,
  AttackCriticalHitChoices,
  StartSoundChoices,
  Rarity,
  FoodEffect,
  ItemComponentOptions,
  BlockComponentOptions,
  EntityComponentOptions,
  AddRiderConfig,
  MobEffectConfig,
  JumpMovementConfig,
  NavigationConfig,
  NavigationFloatConfig,
  BaseJson,
  EntityJson,
  ItemJson,
  JSONValue,
  FileEditExpression,
} from './types';

export { default as compareVar } from './utils';

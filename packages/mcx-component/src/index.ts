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

export const ItemComponent = createLazyClass(
  () => import('./components/item').then(m => m.ItemComponent),
);
export const BlockComponent = createLazyClass(
  () => import('./components/block').then(m => m.BlockComponent),
);
export const EntityComponent = createLazyClass(
  () => import('./components/entity').then(m => m.EntityComponent),
);
export const RecipeComponent = createLazyClass(
  () => import('./components/recipe').then(m => m.RecipeComponent),
);

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

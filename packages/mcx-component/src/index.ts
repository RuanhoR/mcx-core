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
  () => require('./components/item').ItemComponent,
);
export const BlockComponent = createLazyClass(
  () => require('./components/block').BlockComponent,
);
export const EntityComponent = createLazyClass(
  () => require('./components/entity').EntityComponent,
);
export const RecipeComponent = createLazyClass(
  () => require('./components/recipe').RecipeComponent,
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

import { createLazyClass } from './lazy';
import type { ItemComponent as ItemComponentClass } from './components/item';
import type { BlockComponent as BlockComponentClass } from './components/block';
import type { EntityComponent as EntityComponentClass } from './components/entity';
import type { RecipeComponent as RecipeComponentClass } from './components/recipe';
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

export const ItemComponent = createLazyClass<typeof ItemComponentClass>(
  () => require('./components/item').ItemComponent,
);
export const BlockComponent = createLazyClass<typeof BlockComponentClass>(
  () => require('./components/block').BlockComponent,
);
export const EntityComponent = createLazyClass<typeof EntityComponentClass>(
  () => require('./components/entity').EntityComponent,
);
export const RecipeComponent = createLazyClass<typeof RecipeComponentClass>(
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

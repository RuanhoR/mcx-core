import { createLazyClass } from './lazy';
import type { ItemComponent as ItemComponentClass } from './components/item';
import type { BlockComponent as BlockComponentClass } from './components/block';
import type { EntityComponent as EntityComponentClass } from './components/entity';
import type { RecipeComponent as RecipeComponentClass } from './components/recipe';
import type { ItemCatalogComponent as ItemCatalogComponentClass } from './components/itemCatalog';
import type { FeatureComponent as FeatureComponentClass } from './components/feature';
import type { FeatureRuleComponent as FeatureRuleComponentClass } from './components/featureRule';
import type { SpawnRuleComponent as SpawnRuleComponentClass } from './components/spawnRule';
import type { LootTableComponent as LootTableComponentClass } from './components/lootTable';
import type { TradeTableComponent as TradeTableComponentClass } from './components/tradeTable';
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
export const ItemCatalogComponent = createLazyClass<
  typeof ItemCatalogComponentClass
>(() => require('./components/itemCatalog').ItemCatalogComponent);
export const FeatureComponent = createLazyClass<typeof FeatureComponentClass>(
  () => require('./components/feature').FeatureComponent,
);
export const FeatureRuleComponent = createLazyClass<
  typeof FeatureRuleComponentClass
>(() => require('./components/featureRule').FeatureRuleComponent);
export const SpawnRuleComponent = createLazyClass<
  typeof SpawnRuleComponentClass
>(() => require('./components/spawnRule').SpawnRuleComponent);
export const LootTableComponent = createLazyClass<
  typeof LootTableComponentClass
>(() => require('./components/lootTable').LootTableComponent);
export const TradeTableComponent = createLazyClass<
  typeof TradeTableComponentClass
>(() => require('./components/tradeTable').TradeTableComponent);

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

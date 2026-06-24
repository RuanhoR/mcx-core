import { ParticleTypeEnum } from './types/ParticleType';
import { SoundEventEnum } from './types/SoundEvent';
import { EnchantableSlotArray, EnchantableSlotEnum } from './types/EnchantableSlot';
import { AttackCriticalHitChoicesEnum } from './types/AttackCriticalHitChoices';
import { StartSoundChoicesEnum } from './types/StartSoundChoices';

export {
  ParticleTypeEnum,
  SoundEventEnum,
  EnchantableSlotArray,
  EnchantableSlotEnum,
  AttackCriticalHitChoicesEnum,
  StartSoundChoicesEnum,
};

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
} from '@mbler/mcx-types';

type DefineEntry =
  | { from: 'var'; data: string }
  | { from: 'read_file'; data: { base: string; file: string }; default?: string };

export type FileEditExpression<T extends Record<string, DefineEntry>> = {
  define: T;
  run: (define: { [K in keyof T]: string }) => Promise<
    string | string[] | [string, string][]
  >;
};

export function createFileEdit<T extends Record<string, DefineEntry>>(
  expression: FileEditExpression<T>,
): FileEditExpression<T> {
  return expression;
}

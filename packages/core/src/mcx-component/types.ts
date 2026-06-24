import type { ParticleType, SoundEvent, EnchantableSlot, Rarity, ItemComponentOptions, ItemJson, FoodEffect, EntityComponentOptions, EntityJson } from '@mbler/mcx-component';

export interface FilePoint {
  base: 'behavior' | 'resources' | 'root';
  file: string;
}

export interface FileBindSource {
  bind: 'item_texture';
  type: 'append' | 'all_replace';
}

export type DefineEntry =
  | {
      from: 'var';
      data: string;
    }
  | {
      from: 'read_file';
      data: FilePoint;
      default?: string;
    };

export type FileEditExpression<
  T extends Record<string, DefineEntry> = Record<string, DefineEntry>,
> = {
  define: T;
  run: (define: { [K in keyof T]: string }) => Promise<
    string | string[] | [string, string][]
  >;
};

export function createFileEdit<
  T extends Record<string, DefineEntry>,
>(expression: {
  define: T;
  run: (define: { [K in keyof T]: string }) => Promise<
    string | string[] | [string, string][]
  >;
}): FileEditExpression<T> {
  return expression;
}

export type FileEditOption =
  | {
      type: 'edit';
      id?: string;
      source: FilePoint | FileBindSource;
      expression: FileEditExpression<any>;
    }
  | {
      type: 'copy_assets';
      id?: string;
      source: FilePoint;
      output: FilePoint;
    };

export interface BaseJson {
  format_version: string;
  _meta: {
    type: 'item' | 'entity';
    file_edit?: (
      | FileEditOption
      | {
          type: 'batch';
          options: FileEditOption[];
          id?: string;
        }
    )[];
  };
}

export type { Rarity, ItemComponentOptions, ItemJson, FoodEffect, EntityComponentOptions, EntityJson };
export type { ParticleType, SoundEvent, EnchantableSlot } from '@mbler/mcx-component';

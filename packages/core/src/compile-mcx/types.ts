import type {
  ImportDeclaration,
  ExportAllDeclaration,
  ExportDefaultDeclaration,
  ExportNamedDeclaration,
  Expression,
  SpreadElement,
  ArgumentPlaceholder,
  CallExpression,
} from '@babel/types';
import { CompileOpt } from '@mbler/mcx-types';
import { ParsedTagNode } from '../types';
interface callList {
  source: Expression;
  set: (callEXp: CallExpression) => boolean;
  arguments: Array<SpreadElement | Expression | ArgumentPlaceholder>;
  remove: () => void;
}
interface ImportListImport {
  isAll: boolean;
  import?: string | undefined;
  as: string;
}
interface ImportList {
  source: string;
  imported: ImportListImport[];
  raw?: ImportDeclaration;
}
interface BuildCache {
  call: callList[];
  import: ImportList[];
  export: Array<
    ExportNamedDeclaration | ExportAllDeclaration | ExportDefaultDeclaration
  >;
}
export const _MCXstructureLocComponentTypes = {
  items: 'item',
  blocks: 'block',
  entities: 'entity',
  recipes: 'recipe',
  loot_tables: 'lootTable',
  spawn_rules: 'spawnRule',
  trade_tables: 'tradeTable',
  features: 'feature',
  feature_rules: 'featureRule',
  itemCatalog: 'itemCatalog',
  ui: 'ui',
  client_entities: 'clientEntity',
  attachables: 'attachable',
} as const;

/** Output directory (relative to the pack) for each component group. */
export const _MCXComponentGroupOutputDir = {
  items: 'items',
  blocks: 'blocks',
  entities: 'entities',
  recipes: 'recipes',
  loot_tables: 'loot_tables',
  spawn_rules: 'spawn_rules',
  itemCatalog: 'itemCatalog',
  trade_tables: 'trading',
  features: 'features',
  feature_rules: 'feature_rules',
  ui: 'ui',
  client_entities: 'entities',
  attachables: 'attachables',
} as const;

/**
 * Which pack each group is written into. Groups absent from this map go to the
 * behavior pack.
 */
export const _MCXComponentGroupOutputPack = {
  ui: 'resources',
  client_entities: 'resources',
  attachables: 'resources',
} as const;

type MCXComponentGroup = keyof typeof _MCXstructureLocComponentTypes;
type MCXComponentGroupPack = MCXComponentGroup extends infer G
  ? G extends keyof typeof _MCXComponentGroupOutputPack
    ? (typeof _MCXComponentGroupOutputPack)[G]
    : 'behavior'
  : never;

/** Pack lookup that is safe for group names outside the map. */
export const resolveComponentPack = (
  group: string,
): 'behavior' | 'resources' =>
  ((
    _MCXComponentGroupOutputPack as Record<string, 'resources'>
  )[group] ?? 'behavior') as 'behavior' | 'resources';
type MCXstructureLocComponentType =
  (typeof _MCXstructureLocComponentTypes)[keyof typeof _MCXstructureLocComponentTypes];
interface MCXstructureLoc {
  script: string;
  Event: {
    on: 'after' | 'before';
    subscribe: Record<string, string>;
    loc: { line: number; column: number };
    isLoad: boolean;
  };
  Component: Record<
    string,
    {
      type: MCXstructureLocComponentType;
      useExport: string;
      loc: { line: number; column: number };
    }
  >;
  UI: ParsedTagNode | null;
  Form: ParsedTagNode | null;
}
export type {
  BuildCache,
  ImportList,
  ImportListImport,
  callList,
  CompileOpt,
  MCXstructureLoc,
  MCXstructureLocComponentType,
};

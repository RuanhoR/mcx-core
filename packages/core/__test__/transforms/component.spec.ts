import { describe, it, expect, afterEach } from 'vitest';
import { compileMCXFn } from '../../src/compile-mcx/compiler/index';
import { transform } from '../../src/transforms/index';
import type {
  RollupFsModule,
  ModuleInfo,
  SourceMap,
  TransformPluginContext,
} from 'rollup';
import type { CompileOpt } from '@mbler/mcx-types';
import type { transformCtx } from '../../src/types';
import { mkdir, readFile, rm } from 'node:fs/promises';
import path, { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { setGlobalFS } from '../../src/state';
import * as nodeFs from 'node:fs';

setGlobalFS(nodeFs);

const SPEC_DIR = path.dirname(fileURLToPath(import.meta.url));
// packages/core/node_modules — upward resolution finds workspace deps here
const TMP_ROOT = join(SPEC_DIR, '..', '..', 'node_modules', '.mcx-comp-tmp');
const tempDirs: string[] = [];

afterEach(async () => {
  await Promise.all(
    tempDirs.splice(0).map(dir => rm(dir, { recursive: true, force: true })),
  );
});

function createMockOutput(behavior: string, resources: string) {
  return {
    dist: '',
    behavior,
    resources,
  };
}

async function compileComponentMCX(
  mcxSource: string,
): Promise<{ code: string; behaviorDir: string }> {
  const compileData = compileMCXFn(mcxSource);
  const cache = new Map();
  // keep temp dirs inside the package so upward module resolution finds
  // @mbler/mcx-component in node_modules (mirrors a real project layout)
  const tmpRoot = TMP_ROOT;
  const rand = Math.random().toString(36).slice(2);
  const behaviorDir = join(tmpRoot, rand);
  await mkdir(behaviorDir, { recursive: true });
  tempDirs.push(behaviorDir);
  const resourcesDir = join(tmpRoot, rand + '-rp');
  await mkdir(resourcesDir, { recursive: true });
  tempDirs.push(resourcesDir);
  const output = createMockOutput(behaviorDir, resourcesDir);
  const mcxId = join(behaviorDir, 'test.component.mcx');
  compileData.setFilePath(mcxId);
  const code = await transform(
    compileData,
    cache,
    mcxId,
    {
      error: err => {
        const msg =
          typeof err === 'string' ? err : (err?.message ?? String(err));
        throw new Error(msg);
      },
      warn: _msg => {},
      parse: _input => {
        throw new Error('Not implemented');
      },
      resolve: async (_source, _importer, _options) => null,
      emitFile: _file => '',
      getFileName: (_ref: string) => '',
      getModuleInfo: (_id: string) => null,
      info: _log => {},
      debug: _log => {},
      fs: {} as unknown as RollupFsModule,
      load: _opt => null as unknown as Promise<ModuleInfo>,
      meta: {
        rollupVersion: '',
        watchMode: false,
      },
      getWatchFiles: () => [],
      setAssetSource: () => {},
      getModuleIds: () => null as unknown as IterableIterator<string>,
      addWatchFile: (_id: string) => {},
      getCombinedSourcemap: () => null as unknown as SourceMap,
      cache: new Map(),
    } as TransformPluginContext,
    {} as unknown as CompileOpt,
    output,
  );
  return { code, behaviorDir };
}

describe('Component Transform - blocks and recipes', () => {
  it('should emit a block JSON from a BlockComponent export', async () => {
    const { code, behaviorDir } = await compileComponentMCX(
      `<Component>
  <blocks>
    <block id="test_block.json">myBlock</block>
  </blocks>
</Component>
<script lang="ts">
  import { BlockComponent } from '@mbler/mcx-component';

  export const myBlock = new BlockComponent({
    format: '1.26.40',
    id: 'test:blocky',
    menu_category: { category: 'construction' },
  });

  myBlock.setTraits({
    'minecraft:placement_direction': {
      enabled_states: ['minecraft:cardinal_direction'],
    },
  });
  myBlock.addPermutation(
    "query.block_state('minecraft:cardinal_direction') == 'north'",
    { 'minecraft:transformation': { rotation: [0, 180, 0] } },
  );
  myBlock.setCollisionBox({ origin: [-8, 0, -8], size: [16, 16, 16] });
  myBlock.setRedstoneConsumer({ min_power: 1 });
  myBlock.setCustomComponents(['test:controller']);
</script>`,
    );

    expect(code).toContain("type:'component'");
    const json = JSON.parse(
      await readFile(join(behaviorDir, 'blocks/test_block.json'), 'utf-8'),
    );
    expect(json['format_version']).toBe('1.26.40');
    expect(json['minecraft:block'].description.identifier).toBe('test:blocky');
    expect(json['minecraft:block'].description.menu_category).toEqual({
      category: 'construction',
    });
    expect(
      json['minecraft:block'].description.traits[
        'minecraft:placement_direction'
      ].enabled_states,
    ).toEqual(['minecraft:cardinal_direction']);
    expect(
      json['minecraft:block'].components['minecraft:redstone_consumer'],
    ).toEqual({ min_power: 1 });
    expect(
      json['minecraft:block'].components['test:controller'],
    ).toEqual({});
    expect(
      json['minecraft:block'].components['minecraft:custom_components'],
    ).toBeUndefined();
    expect(json['minecraft:block'].permutations).toHaveLength(1);
    expect(json['_meta']).toBeUndefined();
  });

  it('should reject a block export declared under <items>', async () => {
    await expect(
      compileComponentMCX(`<Component>
  <items>
    <item id="items/bad.json">badExport</item>
  </items>
</Component>
<script lang="ts">
  import { BlockComponent } from '@mbler/mcx-component';
  export const badExport = new BlockComponent({
    format: '1.26.40',
    id: 'test:bad',
  });
</script>`),
    ).rejects.toThrow('expected type "item"');
  });

  it('should emit a recipe JSON from a RecipeComponent export', async () => {
    const { code, behaviorDir } = await compileComponentMCX(
      `<Component>
  <recipes>
    <recipe id="test_recipe.json">myRecipe</recipe>
  </recipes>
</Component>
<script lang="ts">
  import { RecipeComponent } from '@mbler/mcx-component';

  export const myRecipe = new RecipeComponent({
    format: '1.17.0',
    id: 'test:my_recipe',
    type: 'shaped',
    tags: ['crafting_table'],
    pattern: ['AAA', 'BBB'],
    key: {
      A: { item: 'minecraft:iron_ingot' },
      B: { item: 'minecraft:cobblestone' },
    },
    result: { item: 'test:blocky' },
  });
</script>`,
    );

    expect(code).toContain("type:'component'");
    const json = JSON.parse(
      await readFile(join(behaviorDir, 'recipes/test_recipe.json'), 'utf-8'),
    );
    expect(json['format_version']).toBe('1.17.0');
    expect(json['minecraft:recipe_shaped'].description.identifier).toBe(
      'test:my_recipe',
    );
    expect(json['minecraft:recipe_shaped'].tags).toEqual(['crafting_table']);
    expect(json['minecraft:recipe_shaped'].result).toEqual({
      item: 'test:blocky',
    });
    expect(json['_meta']).toBeUndefined();
  });

  it('should emit a loot table JSON under loot_tables/', async () => {
    const { behaviorDir } = await compileComponentMCX(
      `<Component>
  <loot_tables>
    <lootTable id="entities/test_loot.json">myLoot</lootTable>
  </loot_tables>
</Component>
<script lang="ts">
  import { LootTableComponent } from '@mbler/mcx-component';

  export const myLoot = new LootTableComponent({ pools: [] });
  myLoot.addPool({
    rolls: { min: 1, max: 3 },
    entries: [
      {
        type: 'item',
        name: 'minecraft:diamond',
        weight: 1,
        functions: [{ function: 'set_count', count: { min: 1, max: 2 } }],
        conditions: [
          { condition: 'killed_by_player' },
          { condition: 'random_chance', chance: 0.5 },
        ],
      },
    ],
  });
</script>`,
    );

    const json = JSON.parse(
      await readFile(
        join(behaviorDir, 'loot_tables/entities/test_loot.json'),
        'utf-8'
      )
    );
    expect(json['pools']).toHaveLength(1);
    const pool = json['pools'][0];
    expect(pool.rolls).toEqual({ min: 1, max: 3 });
    expect(pool.entries[0].name).toBe('minecraft:diamond');
    expect(pool.entries[0].functions).toEqual([
      { function: 'set_count', count: { min: 1, max: 2 } },
    ]);
    expect(pool.entries[0].conditions).toEqual([
      { condition: 'killed_by_player' },
      { condition: 'random_chance', chance: 0.5 },
    ]);
  });

  it('should emit a trade table JSON under trading/', async () => {
    const { behaviorDir } = await compileComponentMCX(
      `<Component>
  <trade_tables>
    <tradeTable id="test_trades.json">myTrades</tradeTable>
  </trade_tables>
</Component>
<script lang="ts">
  import { TradeTableComponent } from '@mbler/mcx-component';

  export const myTrades = new TradeTableComponent({ tiers: [] });
  myTrades.addTier({
    groups: [
      {
        trades: [
          {
            wants: [{ item: 'minecraft:emerald', quantity: 3 }],
            gives: [{ item: 'test:gem', quantity: 1 }],
            trader_exp: 5,
            max_uses: 8,
            reward_exp: true,
          },
        ],
      },
    ],
  });
</script>`,
    );

    const json = JSON.parse(
      await readFile(join(behaviorDir, 'trading/test_trades.json'), 'utf-8')
    );
    expect(json['tiers']).toHaveLength(1);
    const trade = json['tiers'][0].groups[0].trades[0];
    expect(trade.wants[0].item).toBe('minecraft:emerald');
    expect(trade.gives[0].item).toBe('test:gem');
    expect(trade.max_uses).toBe(8);
  });

  it('should reject a loot table with no pools', async () => {
    await expect(
      compileComponentMCX(`<Component>
  <loot_tables>
    <lootTable id="empty.json">emptyLoot</lootTable>
  </loot_tables>
</Component>
<script lang="ts">
  import { LootTableComponent } from '@mbler/mcx-component';
  export const emptyLoot = new LootTableComponent({ pools: [] });
</script>`)
    ).rejects.toThrow('needs at least one pool');
  });
});


import { describe, it, expect } from 'vitest';
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
import { mkdtemp, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

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
  const behaviorDir = await mkdtemp(join(tmpdir(), 'mcx-comp-bp-'));
  const resourcesDir = await mkdtemp(join(tmpdir(), 'mcx-comp-rp-'));
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
});

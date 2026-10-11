import { describe, it, expect, afterEach } from 'vitest';
import { compileMCXFn } from '../../src/compile-mcx/compiler/index';
import { transform } from '../../src/transforms/index';
import type {
  RollupFsModule,
  ModuleInfo,
  TransformPluginContext,
  SourceMap,
} from 'rollup';
import type { CompileOpt } from '@mbler/mcx-types';
import { mkdir, readFile, rm, readdir } from 'node:fs/promises';
import path, { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { setGlobalFS } from '../../src/state';
import * as nodeFs from 'node:fs';

setGlobalFS(nodeFs);

const SPEC_DIR = path.dirname(fileURLToPath(import.meta.url));
const TMP_ROOT = join(SPEC_DIR, '..', '..', 'node_modules', '.mcx-rp-comp-tmp');
const tempDirs: string[] = [];

afterEach(async () => {
  await Promise.all(
    tempDirs.splice(0).map(dir => rm(dir, { recursive: true, force: true })),
  );
});

async function compileMCX(mcxSource: string) {
  const compileData = compileMCXFn(mcxSource);
  const rand = Math.random().toString(36).slice(2);
  const behaviorDir = join(TMP_ROOT, rand);
  const resourcesDir = join(TMP_ROOT, `${rand}-rp`);
  await mkdir(behaviorDir, { recursive: true });
  await mkdir(resourcesDir, { recursive: true });
  tempDirs.push(behaviorDir, resourcesDir);

  const mcxId = join(behaviorDir, 'test.component.mcx');
  compileData.setFilePath(mcxId);
  const code = await transform(
    compileData,
    new Map(),
    mcxId,
    {
      environment: {} as never,
      error: (err: unknown) => {
        const msg =
          typeof err === 'string'
            ? err
            : ((err as Error | undefined)?.message ?? String(err));
        throw new Error(msg);
      },
      warn: () => {},
      parse: () => {
        throw new Error('Not implemented');
      },
      resolve: async () => null,
      emitFile: () => '',
      getFileName: () => '',
      getModuleInfo: () => null,
      info: () => {},
      debug: () => {},
      fs: {} as unknown as RollupFsModule,
      load: () => null as unknown as Promise<ModuleInfo>,
      meta: { rollupVersion: '', viteVersion: '', watchMode: false },
      getWatchFiles: () => [],
      setAssetSource: () => {},
      getModuleIds: () => null as unknown as IterableIterator<string>,
      addWatchFile: () => {},
      getCombinedSourcemap: () => null as unknown as SourceMap,
      cache: new Map(),
    } as unknown as TransformPluginContext,
    {} as unknown as CompileOpt,
    { dist: '', behavior: behaviorDir, resources: resourcesDir },
  );
  return { code, behaviorDir, resourcesDir };
}

const readJson = async (root: string, rel: string) =>
  JSON.parse(await readFile(join(root, rel), 'utf-8')) as Record<string, any>;

const exists = async (root: string, rel: string) => {
  try {
    await readFile(join(root, rel));
    return true;
  } catch {
    return false;
  }
};

describe('resource pack: ui', () => {
  it('writes a UI screen to resources/ui/ and strips _meta', async () => {
    const { resourcesDir, behaviorDir } = await compileMCX(
      `<Component>
  <ui>
    <ui id="my_screen.json">myScreen</ui>
  </ui>
</Component>
<script lang="ts">
  import { UIComponent } from '@mbler/mcx-component';

  export const myScreen = new UIComponent({
    namespace: 'mcx_demo',
    elements: {
      root_screen: {
        type: 'screen',
        controls: [{ type: 'label', text: 'hello world' }],
      },
    },
  });
</script>`,
    );

    const json = await readJson(resourcesDir, 'ui/my_screen.json');
    expect(json.namespace).toBe('mcx_demo');
    expect(json.root_screen.type).toBe('screen');
    expect(json.root_screen.controls[0].text).toBe('hello world');
    // JSON UI screens carry no _meta and no format_version
    expect(json._meta).toBeUndefined();
    expect(json.format_version).toBeUndefined();
    // nothing leaked into the behavior pack
    expect(await exists(behaviorDir, 'ui/my_screen.json')).toBe(false);
  });

  it('writes _ui_defs.json from defs mode', async () => {
    const { resourcesDir } = await compileMCX(
      `<Component>
  <ui>
    <ui id="_ui_defs.json">myDefs</ui>
  </ui>
</Component>
<script lang="ts">
  import { UIComponent } from '@mbler/mcx-component';

  export const myDefs = new UIComponent({
    mode: 'defs',
    ui_defs: ['ui/my_screen.json', 'ui/my_common.json'],
  });
</script>`,
    );
    const json = await readJson(resourcesDir, 'ui/_ui_defs.json');
    expect(json.ui_defs).toEqual(['ui/my_screen.json', 'ui/my_common.json']);
  });

  it('writes _global_variables.json from globals mode', async () => {
    const { resourcesDir } = await compileMCX(
      `<Component>
  <ui>
    <ui id="_global_variables.json">myVars</ui>
  </ui>
</Component>
<script lang="ts">
  import { UIComponent } from '@mbler/mcx-component';

  export const myVars = new UIComponent({
    mode: 'globals',
    variables: { $button_text_color: [1, 1, 1] },
  });
</script>`,
    );
    const json = await readJson(resourcesDir, 'ui/_global_variables.json');
    expect(json.$button_text_color).toEqual([1, 1, 1]);
  });

  it('rejects a screen without a namespace', async () => {
    await expect(
      compileMCX(
        `<Component>
  <ui>
    <ui id="bad.json">bad</ui>
  </ui>
</Component>
<script lang="ts">
  import { UIComponent } from '@mbler/mcx-component';
  export const bad = new UIComponent({ elements: { root: { type: 'screen' } } });
</script>`,
      ),
    ).rejects.toThrow('namespace');
  });
});

describe('resource pack: client entity', () => {
  it('writes entities/<id>.client.json under resources', async () => {
    const { resourcesDir, behaviorDir } = await compileMCX(
      `<Component>
  <client_entities>
    <clientEntity id="my_mob.client.json">myMob</clientEntity>
  </client_entities>
</Component>
<script lang="ts">
  import { ClientEntityComponent } from '@mbler/mcx-component';

  export const myMob = new ClientEntityComponent({
    format: '1.10.0',
    id: 'demo:my_mob',
    min_engine_version: '1.10.0',
  });
  myMob.addMaterial('default', 'mob');
  myMob.addTexture('default', 'textures/entity/my_mob');
  myMob.addGeometry('default', 'geometry.my_mob');
  myMob.addAnimation('walk', 'animation.quadruped.walk');
  myMob.addRenderController('controller.render.my_mob');
  myMob.addAnimationController('move', 'controller.animation.my_mob.move');
  myMob.setLocator('lead', [0, 14, -6]);
  myMob.setSpawnEgg({ texture: 'spawn_egg', texture_index: 2 });
</script>`,
    );

    const json = await readJson(resourcesDir, 'entities/my_mob.client.json');
    expect(json.format_version).toBe('1.10.0');
    const desc = json['minecraft:client_entity'].description;
    expect(desc.identifier).toBe('demo:my_mob');
    expect(desc.min_engine_version).toBe('1.10.0');
    expect(desc.materials).toEqual({ default: 'mob' });
    expect(desc.textures).toEqual({ default: 'textures/entity/my_mob' });
    expect(desc.geometry).toEqual({ default: 'geometry.my_mob' });
    expect(desc.render_controllers).toEqual(['controller.render.my_mob']);
    expect(desc.animation_controllers).toEqual([
      { move: 'controller.animation.my_mob.move' },
    ]);
    expect(desc.locators).toEqual({ lead: [0, 14, -6] });
    expect(desc.spawn_egg).toEqual({ texture: 'spawn_egg', texture_index: 2 });
    expect(json._meta).toBeUndefined();
    expect(await exists(behaviorDir, 'entities/my_mob.client.json')).toBe(false);
  });

  it('defaults format_version to 1.8.0', async () => {
    const { resourcesDir } = await compileMCX(
      `<Component>
  <client_entities>
    <clientEntity id="d.client.json">d</clientEntity>
  </client_entities>
</Component>
<script lang="ts">
  import { ClientEntityComponent } from '@mbler/mcx-component';
  export const d = new ClientEntityComponent({ id: 'demo:d' });
</script>`,
    );
    expect((await readJson(resourcesDir, 'entities/d.client.json')).format_version).toBe(
      '1.8.0',
    );
  });

  it('rejects a non-namespaced identifier', async () => {
    await expect(
      compileMCX(
        `<Component>
  <client_entities>
    <clientEntity id="x.client.json">x</clientEntity>
  </client_entities>
</Component>
<script lang="ts">
  import { ClientEntityComponent } from '@mbler/mcx-component';
  export const x = new ClientEntityComponent({ id: 'plain' });
</script>`,
      ),
    ).rejects.toThrow('no id');
  });
});

describe('resource pack: attachable', () => {
  it('writes attachables/<id>.json under resources', async () => {
    const { resourcesDir, behaviorDir } = await compileMCX(
      `<Component>
  <attachables>
    <attachable id="my_helmet.json">myHelmet</attachable>
  </attachables>
</Component>
<script lang="ts">
  import { AttachableComponent } from '@mbler/mcx-component';

  export const myHelmet = new AttachableComponent({
    format: '1.10.0',
    id: 'demo:my_helmet',
    item: 'demo:my_helmet',
    materials: { default: 'armor', enchanted: 'armor_enchanted' },
    geometry: { default: 'geometry.helmet' },
    textures: { default: 'textures/models/armor/helmet' },
    render_controllers: ['controller.render.my_helmet'],
  });
  myHelmet.setScripts({
    animate: ['walk', { animation_name: 'idle', condition: 'q.is_first_person' }],
    parent_setup: 'variable.chest_layer_visible = 0.0;',
  });
  myHelmet.setEnableAttachables(true);
</script>`,
    );

    const json = await readJson(resourcesDir, 'attachables/my_helmet.json');
    expect(json.format_version).toBe('1.10.0');
    const desc = json['minecraft:attachable'].description;
    expect(desc.identifier).toBe('demo:my_helmet');
    expect(desc.item).toBe('demo:my_helmet');
    expect(desc.materials).toEqual({
      default: 'armor',
      enchanted: 'armor_enchanted',
    });
    expect(desc.geometry).toEqual({ default: 'geometry.helmet' });
    expect(desc.render_controllers).toEqual(['controller.render.my_helmet']);
    expect(desc.enable_attachables).toBe(true);
    expect(desc.scripts.animate[0]).toBe('walk');
    expect(desc.scripts.animate[1].animation_name).toBe('idle');
    expect(json._meta).toBeUndefined();
    expect(await exists(behaviorDir, 'attachables/my_helmet.json')).toBe(false);
  });

  it('rejects an animate entry without animation_name', async () => {
    await expect(
      compileMCX(
        `<Component>
  <attachables>
    <attachable id="a.json">a</attachable>
  </attachables>
</Component>
<script lang="ts">
  import { AttachableComponent } from '@mbler/mcx-component';
  export const a = new AttachableComponent({ id: 'demo:a' });
  a.setScripts({ animate: [{ condition: 'q.is_first_person' } as never] });
</script>`,
      ),
    ).rejects.toThrow('animation_name');
  });
});

describe('resource pack: pack routing', () => {
  it('writes all resource groups into the resource pack and behaviour groups into the behavior pack', async () => {
    const { behaviorDir, resourcesDir } = await compileMCX(
      `<Component>
  <items>
    <item id="my_item.json">myItem</item>
  </items>
  <ui>
    <ui id="s.json">s</ui>
  </ui>
  <attachables>
    <attachable id="a.json">a</attachable>
  </attachables>
</Component>
<script lang="ts">
  import { ItemComponent, UIComponent, AttachableComponent } from '@mbler/mcx-component';
  export const myItem = new ItemComponent({ format: '1.21.0', id: 'demo:my_item', components: {} });
  export const s = new UIComponent({ namespace: 'demo', elements: { root: { type: 'screen' } } });
  export const a = new AttachableComponent({ id: 'demo:a' });
</script>`,
    );

    expect(await exists(behaviorDir, 'items/my_item.json')).toBe(true);
    expect(await exists(resourcesDir, 'ui/s.json')).toBe(true);
    expect(await exists(resourcesDir, 'attachables/a.json')).toBe(true);
    expect(await readdir(behaviorDir)).toEqual(['items']);
  });

  it('rejects a path that escapes the pack root', async () => {
    await expect(
      compileMCX(
        `<Component>
  <ui>
    <ui id="../../escaped.json">s</ui>
  </ui>
</Component>
<script lang="ts">
  import { UIComponent } from '@mbler/mcx-component';
  export const s = new UIComponent({ namespace: 'demo', elements: { root: { type: 'screen' } } });
</script>`,
      ),
    ).rejects.toThrow('path segments');
  });
});

describe('component id: file name validation and extension', () => {
  const withId = (id: string) =>
    compileMCX(
      `<Component>
  <ui>
    <ui id="${id}">s</ui>
  </ui>
</Component>
<script lang="ts">
  import { UIComponent } from '@mbler/mcx-component';
  export const s = new UIComponent({ namespace: 'demo', elements: { root: { type: 'screen' } } });
</script>`,
    );

  it('appends .json when the id has no extension', async () => {
    const { resourcesDir } = await withId('no_ext');
    expect(await exists(resourcesDir, 'ui/no_ext.json')).toBe(true);
  });

  it('accepts an id that already ends in .json', async () => {
    const { resourcesDir } = await withId('with_ext.json');
    expect(await exists(resourcesDir, 'ui/with_ext.json')).toBe(true);
    expect(await exists(resourcesDir, 'ui/with_ext.json.json')).toBe(false);
  });

  it('appends .client.json for client entities', async () => {
    const { resourcesDir } = await compileMCX(
      `<Component>
  <client_entities>
    <clientEntity id="mob">mob</clientEntity>
  </client_entities>
</Component>
<script lang="ts">
  import { ClientEntityComponent } from '@mbler/mcx-component';
  export const mob = new ClientEntityComponent({ id: 'demo:mob' });
</script>`,
    );
    expect(await exists(resourcesDir, 'entities/mob.client.json')).toBe(true);
  });

  it('accepts an explicit .client.json and does not double it', async () => {
    const { resourcesDir } = await compileMCX(
      `<Component>
  <client_entities>
    <clientEntity id="mob.client.json">mob</clientEntity>
  </client_entities>
</Component>
<script lang="ts">
  import { ClientEntityComponent } from '@mbler/mcx-component';
  export const mob = new ClientEntityComponent({ id: 'demo:mob' });
</script>`,
    );
    expect(await exists(resourcesDir, 'entities/mob.client.json')).toBe(true);
    expect(
      await exists(resourcesDir, 'entities/mob.client.json.client.json'),
    ).toBe(false);
  });

  it('validates nested folder names', async () => {
    const { resourcesDir } = await withId('sub/deep/screen');
    expect(await exists(resourcesDir, 'ui/sub/deep/screen.json')).toBe(true);
  });

  it.each([
    ['../../escaped.json', 'path segments'],
    ['/absolute.json', 'relative to the pack root'],
    ['C:/win.json', 'relative to the pack root'],
    ['back\\slash.json', 'path separator'],
    ['has space.json', 'invalid name segment'],
    ['-leading_dash.json', 'invalid name segment'],
    ['.hidden.json', 'invalid name segment'],
    ['trailing..', 'must not end a name segment with "."'],
    ['ends.with.dot..', 'must not end a name segment with "."'],
    ['con.json', 'reserved file name'],
    ['LPT1.json', 'reserved file name'],
    ['a//b.json', 'empty path segment'],
    ['a/bad:name.json', 'illegal in a file name'],
  ])('rejects id %s', async (id, message) => {
    await expect(withId(id)).rejects.toThrow(message);
  });
});

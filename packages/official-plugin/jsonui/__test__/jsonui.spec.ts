import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { execFileSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import ts from 'typescript';
import type { McxPlugin } from '@mbler/mcx-types';
import * as MCX from '../../../core/src/index.js';
import { Molang } from '../../../mcx-component/src/index.js';
import {
  defineJsonUIAvailability,
  jsonui,
  jsonuiCompletion,
  jsonUiPlugin,
  extractScript,
} from '../src/index.js';
import { JSONUIComponent } from '../src/component.js';
import type { JsonUIElement, JsonUIPluginOptions } from '../src/types.js';

const fixtureTsconfig = path.resolve(
  'packages/core/__test__/vite-plugin-fixture/tsconfig.json',
);

const fakeContext = {
  error: (err: unknown) => {
    const message =
      typeof err === 'string'
        ? err
        : ((err as { message?: string })?.message ?? String(err));
    throw new Error(message);
  },
  warn: () => {},
} as never;

let tmpDir = '';

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'mcx-jsonui-'));
  MCX.setGlobalFS(fs);
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

function readJson(relative: string): Record<string, unknown> {
  return JSON.parse(
    fs.readFileSync(path.join(tmpDir, relative), 'utf-8'),
  ) as Record<string, unknown>;
}

function exists(relative: string): boolean {
  return fs.existsSync(path.join(tmpDir, relative));
}

function makePlugin(options: JsonUIPluginOptions = {}): McxPlugin {
  return jsonUiPlugin({ resourcesDir: tmpDir, ...options });
}

async function compile(
  source: string,
  plugin: McxPlugin,
  fileName = 'shop.mcx',
): Promise<string> {
  return MCX.transform(
    MCX.compiler.compileMCXFn(source),
    new Map(),
    path.join(tmpDir, fileName),
    fakeContext,
    {
      moduleDir: '/dev/null',
      tsconfigPath: fixtureTsconfig,
      sourcemap: false,
      ts,
      mcxPlugin: plugin,
    },
    { dist: '', behavior: '', resources: tmpDir },
    source,
  );
}

async function flush(plugin: McxPlugin): Promise<void> {
  await plugin.onBuildStart?.();
}

describe('@mbler/mcx-plugin-jsonui', () => {
  it('compiles <Ui type="jsonui"> into a JSON file and a JSONUIComponent module', async () => {
    const plugin = makePlugin();
    const source = [
      '<script>export const a = 1</script>',
      '<Ui type="jsonui" target="shop" availability="file" size="[100, 200]">',
      '  <label text="Hello" size="[80, 20]" />',
      '  <button id="buy" text="Buy" />',
      '</Ui>',
    ].join('\n');
    const code = await compile(source, plugin);
    await plugin.onBuildEnd?.();

    expect(code).toContain('@mbler/mcx-plugin-jsonui/component');
    expect(code).toContain('JSONUIComponent');
    expect(code).toContain("type: 'jsonui'");
    expect(code).toContain('"target":"shop"');

    const doc = readJson('ui/shop.json');
    expect(doc['namespace']).toBe('shop');
    const root = doc['shop'] as Record<string, unknown>;
    expect(root['type']).toBe('screen');
    expect(root['size']).toEqual([100, 200]);
    expect((root['controls'] as unknown[]).length).toBe(2);
    expect(doc['buy']).toMatchObject({ type: 'button', text: 'Buy' });

    const defs = readJson('ui/_ui_defs.json');
    expect(defs['ui_defs']).toContain('ui/shop.json');
  });

  it('leaves non-jsonui files to the built-in transform', async () => {
    const plugin = makePlugin();
    const code = await compile(
      '<script>export const plain = 1</script>',
      plugin,
      'plain.mcx',
    );
    expect(code).toContain('export default');
    expect(code).not.toContain('jsonui');
    expect(exists('ui/plain.json')).toBe(false);
  });

  it('supports omitting target and using the custom <JsonUi> root tag', async () => {
    const plugin = makePlugin();
    const code = await compile(
      '<script>export const a = 1</script><JsonUi><label text="Hi" /></JsonUi>',
      plugin,
      'inventory.mcx',
    );
    await plugin.onBuildEnd?.();
    expect(code).toContain('"namespace":"inventory"');
    expect(exists('ui/inventory.json')).toBe(true);
    expect(readJson('ui/inventory.json')['namespace']).toBe('inventory');
  });

  it('routes server_form screens through a shared server_form.json', async () => {
    const plugin = makePlugin();
    const code = await compile(
      '<script>export const a = 1</script><Ui type="jsonui" availability="server_form" target="shop"><label text="Buy" /></Ui>',
      plugin,
    );
    await plugin.onBuildEnd?.();

    expect(code).toContain('mbler_ui:shop');
    expect(exists('ui/shop_shop.json')).toBe(true);
    const screen = readJson('ui/shop_shop.json');
    const root = screen['root'] as Record<string, unknown>;
    expect(root['$panel_id']).toBe('mbler_ui:shop');

    const shell = readJson('ui/server_form.json');
    const main = shell['main_screen_content'] as Record<string, unknown>;
    const modifications = main['modifications'] as Array<
      Record<string, unknown>
    >;
    const factories = modifications[0]?.['value'] as Array<
      Record<string, unknown>
    >;
    expect(factories[0]?.['mbler_form_factory_shop']).toBeDefined();
    expect(readJson('ui/_ui_defs.json')['ui_defs']).toContain(
      'ui/server_form.json',
    );
  });

  it('builds HUD modifications and vanilla overrides', async () => {
    const hud = makePlugin();
    await compile(
      '<script>export const a = 1</script><Ui type="jsonui" availability="hud"><label text="HUD" /></Ui>',
      hud,
      'hud.mcx',
    );
    await hud.onBuildEnd?.();
    const hudDoc = readJson('ui/hud_hud.json');
    const hudScreen = hudDoc['hud_screen'] as Record<string, unknown>;
    expect(hudScreen['modifications']).toBeDefined();

    const vanilla = makePlugin();
    await compile(
      '<script>export const b = 2</script><Ui type="jsonui" availability="vanilla"><label id="hud_title" text="Override" /></Ui>',
      vanilla,
      'vanilla.mcx',
    );
    await vanilla.onBuildEnd?.();
    expect(readJson('ui/vanilla_vanilla.json')['hud_title']).toMatchObject({
      type: 'label',
      text: 'Override',
    });
  });

  it('rejects a second singleton availability in one build', async () => {
    const plugin = makePlugin();
    await flush(plugin);
    await compile(
      '<script>export const a = 1</script><Ui type="jsonui" availability="vanilla"><label text="one" /></Ui>',
      plugin,
      'one.mcx',
    );
    await expect(
      compile(
        '<script>export const b = 2</script><Ui type="jsonui" availability="vanilla"><label text="two" /></Ui>',
        plugin,
        'two.mcx',
      ),
    ).rejects.toThrow(/only be used once per build/);
  });

  it('supports direct raw JSON saving via file/save', async () => {
    const plugin = makePlugin();
    await compile(
      '<script>export const a = 1</script><Ui type="jsonui" availability="none" save="ui/raw_dump.json"><label text="raw" /></Ui>',
      plugin,
      'raw.mcx',
    );
    expect(exists('ui/raw_dump.json')).toBe(true);
    expect(readJson('ui/raw_dump.json')['namespace']).toBe('raw');
  });

  it('accepts custom availability adapters and enforces requiresTarget', async () => {
    const custom = defineJsonUIAvailability({
      name: 'custom',
      requiresTarget: true,
      emit(ctx) {
        const file = `${ctx.uiDir}/${ctx.namespace}.custom.json`;
        return {
          files: [{ path: file, content: ctx.document }],
          uiDefs: [file],
          meta: { path: file },
        };
      },
    });
    const plugin = jsonUiPlugin({
      resourcesDir: tmpDir,
      availabilities: [custom],
    });
    await expect(
      compile(
        '<script>export const a = 1</script><Ui type="jsonui" availability="custom"><label text="x" /></Ui>',
        plugin,
        'no-target.mcx',
      ),
    ).rejects.toThrow(/requires a target attribute/);
    const code = await compile(
      '<script>export const b = 2</script><Ui type="jsonui" availability="custom" target="ok"><label text="x" /></Ui>',
      plugin,
      'with-target.mcx',
    );
    expect(code).toContain('ui/with_target.custom.json');
    expect(exists('ui/with_target.custom.json')).toBe(true);
  });

  it('recovers pure <Ui> files without a <script> tag through onThrow', async () => {
    const plugin = makePlugin();
    const inner = MCX.rollupPlugin(
      {
        moduleDir: '/dev/null',
        tsconfigPath: fixtureTsconfig,
        sourcemap: false,
        mcxPlugin: plugin,
      },
      { dist: '', behavior: '', resources: tmpDir },
    );
    const hook = inner.transform as (
      code: string,
      id: string,
    ) => Promise<{
      code: string;
    } | null>;
    const source =
      '<Ui type="jsonui" target="no_script"><label text="Pure" /></Ui>';
    const result = await hook.call(
      fakeContext,
      source,
      path.join(tmpDir, 'no_script.mcx'),
    );
    expect(result?.code).toContain('JSONUIComponent');
    expect(exists('ui/no_script.json')).toBe(true);
  });

  it('exposes a dependency-free JSONUIComponent runtime class', () => {
    const component = new JSONUIComponent({
      availability: 'file',
      namespace: 'demo',
      root: 'demo',
      path: 'ui/demo.json',
      formTitle: 'mbler_ui:demo',
      files: ['ui/demo.json'],
      document: {
        namespace: 'demo',
        demo: { type: 'screen', controls: [{ a: { type: 'label' } }] },
      },
    });
    expect(component.getPath()).toBe('ui/demo.json');
    expect(component.getFormTitle()).toBe('mbler_ui:demo');
    expect(component.getControls()).toHaveLength(1);
    expect(component.getElement('demo')?.['type']).toBe('screen');
    expect(component.toJSON().namespace).toBe('demo');
  });

  it('emits syntactically valid ESM', async () => {
    const plugin = makePlugin();
    const code = await compile(
      '<script>export const a = 1</script><Ui type="jsonui" availability="server_form" target="syntax"><label text="ok" /></Ui>',
      plugin,
      'syntax.mcx',
    );
    const file = path.join(tmpDir, 'generated.mjs');
    fs.writeFileSync(file, code, 'utf-8');
    expect(() =>
      execFileSync(process.execPath, ['--check', file], { stdio: 'pipe' }),
    ).not.toThrow();
  });

  it('merges an existing _ui_defs.json instead of replacing it', async () => {
    fs.mkdirSync(path.join(tmpDir, 'ui'), { recursive: true });
    fs.writeFileSync(
      path.join(tmpDir, 'ui', '_ui_defs.json'),
      JSON.stringify({ ui_defs: ['ui/existing.json'] }),
    );
    const plugin = makePlugin();
    await compile(
      '<script>export const a = 1</script><Ui type="jsonui"><label text="x" /></Ui>',
      plugin,
      'merged.mcx',
    );
    await plugin.onBuildEnd?.();
    expect(readJson('ui/_ui_defs.json')['ui_defs']).toEqual(
      expect.arrayContaining(['ui/existing.json', 'ui/merged.json']),
    );
  });
});

describe('jsonui editor completion', () => {
  it('attaches completion data to the plugin instance', () => {
    const plugin = jsonui();
    expect(plugin.completion).toBe(jsonuiCompletion);
    expect(plugin.completion?.name).toBe('@mbler/mcx-plugin-jsonui');
  });

  it('contributes <JsonUi> and the <Ui type="jsonui"> attributes', () => {
    expect(jsonuiCompletion.rootTags).toContain('JsonUi');
    const jsonuiTag = jsonuiCompletion.tags?.find(tag => tag.name === 'JsonUi');
    expect(jsonuiTag?.extends).toEqual(['jsonui-root', 'jsonui-control']);
    const attributes = jsonuiCompletion.attributeSets?.['jsonui-root'] ?? [];
    expect(attributes.map(attr => attr.name)).toEqual(
      expect.arrayContaining(['target', 'availability', 'namespace', 'file']),
    );
    expect(
      attributes.find(attr => attr.name === 'availability')?.values,
    ).toEqual(['file', 'server_form', 'hud', 'vanilla', 'none']);
    const uiTag = jsonuiCompletion.tags?.find(tag => tag.name === 'Ui');
    expect(uiTag?.attributes?.some(attr => attr.name === 'type')).toBe(true);
  });
});

describe('jsonui <script> support', () => {
  it('extracts the script block and its lang', () => {
    expect(extractScript('<script lang="js">const a = 1</script>')).toEqual({
      code: 'const a = 1',
      lang: 'js',
    });
    expect(extractScript('<script>export const a = 1</script>')).toEqual({
      code: 'export const a = 1',
      lang: 'ts',
    });
    expect(extractScript('<script>   </script>')).toBeUndefined();
    expect(extractScript('<Ui type="jsonui" />')).toBeUndefined();
  });

  it('appends the transpiled script to the generated module', async () => {
    const plugin = makePlugin();
    const source = [
      '<Ui type="jsonui" target="hud" availability="file">',
      '  <label id="hp" text="HP" />',
      '</Ui>',
      '<script lang="ts">',
      "import { Molang } from '@mbler/mcx-component';",
      'const hp: string = Molang.query("get_health").toString();',
      "jsonui.text('hp', hp);",
      "export const label = 'hp';",
      '</script>',
    ].join('\n');
    const code = await compile(source, plugin, 'hud.mcx');

    // `const hp: string` proves the TypeScript compiler ran.
    expect(code).not.toContain('const hp: string');
    expect(code).toContain('const hp = Molang.query("get_health").toString();');
    expect(code).toContain("jsonui.text('hp', hp);");
    expect(code).toContain("export const label = 'hp';");
    // The document export stays, so the module is still a valid jsonui module.
    expect(code).toContain("type: 'jsonui'");
  });

  it('rejects export default inside the script', async () => {
    const plugin = makePlugin();
    await expect(
      compile(
        '<Ui type="jsonui"><label text="x" /></Ui><script>export default 1</script>',
        plugin,
      ),
    ).rejects.toThrow(/export default/);
  });
});

describe('JSONUIComponent bindings', () => {
  function component(): JSONUIComponent {
    // Mirrors buildDocument(): the root controls list and the top-level key
    // share one element object, so a binding shows up in both views.
    const hp: JsonUIElement = { type: 'label', text: 'HP' };
    return new JSONUIComponent({
      availability: 'file',
      namespace: 'demo',
      root: 'demo',
      document: {
        namespace: 'demo',
        demo: { type: 'screen', controls: [{ hp }] },
        hp,
      },
    });
  }

  it('adds Molang bindings to an element', () => {
    const ui = component();
    ui.bind('hp', Molang.bind.view(Molang.query('get_health'), '#text'));
    expect(ui.getBindings('hp')).toEqual([
      {
        binding_type: 'view',
        binding_condition: 'always',
        source_property_name: 'query.get_health',
        target_property_name: '#text',
      },
    ]);
    // The same object is reachable from the root controls list.
    const controls = ui.getControls() as Array<Record<string, unknown>>;
    const inline = controls[0]?.['hp'] as Record<string, unknown>;
    expect(inline['bindings']).toHaveLength(1);
  });

  it('accepts plain JSON UI bindings and #-prefixed ids', () => {
    const ui = component();
    ui.addBinding('#hp', {
      binding_type: 'view',
      source_property_name: '#text',
      target_property_name: '#visible',
    });
    expect(ui.getBindings('hp')[0]?.['target_property_name']).toBe('#visible');
  });

  it('replaces and clears bindings', () => {
    const ui = component();
    ui.text('hp', Molang.query('get_health'));
    expect(ui.getBindings('hp')).toHaveLength(1);
    ui.setBindings('hp', Molang.bind.view('#text', '#label'));
    expect(ui.getBindings('hp')).toHaveLength(1);
    expect(ui.getBindings('hp')[0]?.['target_property_name']).toBe('#label');
    ui.clearBindings('hp');
    expect(ui.getBindings('hp')).toHaveLength(0);
  });

  it('creates elements and controls on demand', () => {
    const ui = component();
    ui.bind('rows', Molang.bind.view('#text', '#text'), { create: true });
    expect(ui.findElement('rows')?.['type']).toBe('panel');
    ui.addControl('rows', 'row_1', { type: 'label', text: 'Row' });
    expect(ui.findElement('row_1')?.['text']).toBe('Row');
    ui.removeControl('rows', 'row_1');
    expect(ui.findElement('row_1')).toBeUndefined();
  });

  it('throws for unknown elements unless create is set', () => {
    const ui = component();
    expect(() => ui.bind('missing', { binding_type: 'view' })).toThrow(
      /unknown element "missing"/,
    );
  });
});

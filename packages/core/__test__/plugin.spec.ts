import { describe, it, expect, beforeEach } from 'vitest';
import type { TransformPluginContext } from 'rollup';
import * as path from 'node:path';
import * as nodeFs from 'node:fs';
import type { CompileOpt, McxPlugin } from '@mbler/mcx-types';
import { compileMCXFn, clearCompileCaches } from '../src/compile-mcx/compiler';
import { transform } from '../src/transforms/index';
import { setGlobalFS } from '../src/state';
import { defineMcxPlugin, rollupPlugin } from '../src/index';
import {
  applyMcxPluginInjections,
  createMcxPluginContext,
  resolveMcxPlugins,
  runMcxBuildEnd,
  runMcxBuildStart,
} from '../src/plugin';

setGlobalFS(nodeFs);

const output = { dist: '', behavior: '', resources: '' };

function mockContext(): TransformPluginContext {
  return {
    error: (err: unknown) => {
      const message =
        typeof err === 'string'
          ? err
          : ((err as { message?: string })?.message ?? String(err));
      throw new Error(message);
    },
    warn: () => {},
  } as unknown as TransformPluginContext;
}

function optWith(...plugins: McxPlugin[]): CompileOpt {
  return {
    moduleDir: '/dev/null',
    tsconfigPath: '',
    sourcemap: false,
    mcxPlugin: plugins,
  };
}

function optWithFile(...plugins: McxPlugin[]): CompileOpt {
  return {
    ...optWith(...plugins),
    tsconfigPath: path.resolve(
      'packages/core/__test__/vite-plugin-fixture/tsconfig.json',
    ),
  };
}

function compile(source: string, opt: CompileOpt): Promise<string> {
  return transform(
    compileMCXFn(source),
    new Map(),
    '/root/test.mcx',
    mockContext(),
    opt,
    output,
    source,
  );
}

type AsyncHook = (
  this: unknown,
  ...args: unknown[]
) => unknown | Promise<unknown>;

function unwrapHook(hook: unknown): AsyncHook {
  if (typeof hook === 'function') return hook as AsyncHook;
  if (hook && typeof hook === 'object' && 'handler' in hook) {
    return (hook as { handler: AsyncHook }).handler;
  }
  throw new Error('expected hook to be callable');
}

beforeEach(() => {
  clearCompileCaches();
});

describe('mcx compiler plugins', () => {
  it('keeps the built-in output untouched when no plugin is configured', async () => {
    const source = '<script>export const answer = 42</script>';
    const plain = await compile(source, {
      moduleDir: '/dev/null',
      tsconfigPath: '',
      sourcemap: false,
    });
    const withEmptyList = await compile(source, optWith());
    expect(withEmptyList).toBe(plain);
    expect(plain).toContain('export default');
    expect(plain).toContain('answer');
  });

  it('onTransform sees custom root tags and can replace the whole module', async () => {
    const source =
      '<script>export const a = 1</script><MyLayout mode="grid">hello</MyLayout>';
    let nodeNames: string[] = [];
    const plugin = defineMcxPlugin({
      name: 'custom-layout',
      onTransform(ctx) {
        nodeNames = ctx.nodes.map(node => node.name);
        expect(ctx.tag('MyLayout')?.arr.mode).toBe('grid');
        expect(ctx.tags('MyLayout')).toHaveLength(1);
        expect(ctx.source).toBe(source);
        expect(ctx.id).toBe('/root/test.mcx');
        expect(ctx.output).toEqual(output);
        ctx.addImport("import { render } from 'my-runtime'");
        return 'export default { type: "layout", render }';
      },
    });
    const code = await compile(source, optWith(plugin));
    expect(nodeNames).toEqual(['script', 'MyLayout']);
    expect(code).toContain('my-runtime');
    expect(code).toContain('render');
    expect(code).not.toContain('answer');
  });

  it('handles custom root tags via tags and injects imports/exports/type', async () => {
    const source =
      '<script>export const a = 1</script><Panel title="Hi">body</Panel>';
    const plugin: McxPlugin = {
      name: 'panel',
      tags: {
        Panel(node, ctx) {
          expect(node.arr.title).toBe('Hi');
          ctx.addImport("import { PanelView } from 'panel-runtime'");
          ctx.addImport("import { PanelView } from 'panel-runtime'");
          ctx.addStatement("export const panelName = 'main'");
          ctx.addExport('panel', "{ title: 'Hi', view: PanelView }");
          ctx.addExport('with-dash', '42');
          ctx.setType('panel');
        },
      },
    };
    const code = await compile(source, optWith(plugin));
    expect(code.match(/panel-runtime/g)).toHaveLength(1);
    expect(code).toContain('panelName');
    expect(code).toContain('panel:');
    expect(code).toContain('"with-dash": 42');
    expect(code).toMatch(/type:\s*"panel"/);
    expect(code).toContain('export default');
  });

  it('registerTag from onTransform also handles new root tags', async () => {
    const source = '<script>export const a = 1</script><Widget id="w1" />';
    const plugin: McxPlugin = {
      name: 'widget',
      onTransform(ctx) {
        ctx.registerTag('Widget', (node, hook) => {
          hook.addExport('widgetId', JSON.stringify(node.arr.id));
          hook.setType('widget');
        });
      },
    };
    const code = await compile(source, optWith(plugin));
    expect(code).toContain('widgetId: "w1"');
    expect(code).toMatch(/type:\s*"widget"/);
  });

  it('chains onTransformed hooks in plugin order', async () => {
    const source = '<script>export const chained = 1</script>';
    const seen: string[] = [];
    const first: McxPlugin = {
      name: 'first',
      onTransformed(code, ctx) {
        seen.push('first');
        expect(ctx.code).toBe(code);
        return `${code}\n// first`;
      },
    };
    const second: McxPlugin = {
      name: 'second',
      onTransformed(code) {
        seen.push('second');
        expect(code).toContain('// first');
        return `${code}\n// second`;
      },
    };
    const code = await compile(source, optWith(first, second));
    expect(seen).toEqual(['first', 'second']);
    expect(code).toContain('// first');
    expect(code).toContain('// second');
  });

  it('still runs onTransformed when onTransform short-circuits', async () => {
    const source = '<script>export const short = 1</script>';
    const shortCircuit: McxPlugin = {
      name: 'short-circuit',
      onTransform() {
        return 'export default { type: "custom" }';
      },
    };
    const post: McxPlugin = {
      name: 'post',
      onTransformed(code) {
        expect(code).toContain('custom');
        return `${code}\n// post`;
      },
    };
    const code = await compile(source, optWith(shortCircuit, post));
    expect(code).toContain('// post');
    expect(code).toContain('"custom"');
  });

  it('onThrow recovers a transform error', async () => {
    const source =
      '<script>export const a = 1</script><Form><not-a-tag>x</not-a-tag></Form>';
    let caught = '';
    const plugin: McxPlugin = {
      name: 'recover-transform',
      onThrow(error, ctx) {
        caught = error.message;
        expect(ctx.source).toBe(source);
        return 'export default { recovered: true }';
      },
    };
    const code = await compile(source, optWith(plugin));
    expect(caught).toContain("don't support tag");
    expect(code).toContain('recovered: true');
  });

  it('still surfaces errors when onThrow does not recover', async () => {
    const source =
      '<script>export const a = 1</script><Form><not-a-tag>x</not-a-tag></Form>';
    const plugin: McxPlugin = { name: 'observe', onThrow() {} };
    await expect(compile(source, optWith(plugin))).rejects.toThrow(
      "don't support tag",
    );
  });

  it('onThrow recovers parse errors raised before transform', async () => {
    const source = '<script>x</script><script>y</script>';
    const plugin: McxPlugin = {
      name: 'recover-parse',
      onThrow(error, ctx) {
        expect(error.message).toContain('duplicate script');
        expect(ctx.nodes).toEqual([]);
        return 'export default { recovered: true }';
      },
    };
    const inner = rollupPlugin(optWithFile(plugin), output);
    const hook = unwrapHook(inner.transform);
    const result = (await hook.call(
      mockContext(),
      source,
      '/root/broken.mcx',
    )) as { code: string } | null;
    expect(result?.code).toContain('recovered: true');
  });

  it('forwards buildStart/buildEnd lifecycle hooks', async () => {
    const calls: string[] = [];
    const plugin: McxPlugin = {
      name: 'lifecycle',
      onBuildStart() {
        calls.push('start');
      },
      onBuildEnd() {
        calls.push('end');
      },
    };
    const inner = rollupPlugin(optWithFile(plugin), output);
    await unwrapHook(inner.buildStart).call(mockContext());
    await unwrapHook(inner.buildEnd).call(mockContext());
    expect(calls).toEqual(['start', 'end']);
  });

  it('rejects plugins without a name and exposes ctx.error', async () => {
    expect(() => resolveMcxPlugins(optWith({} as McxPlugin))).toThrow(
      /non-empty "name"/,
    );
    const { hook } = createMcxPluginContext({
      id: '/root/x.mcx',
      source: '',
      nodes: [],
      opt: optWith({ name: 'x' }),
      output,
      error: message => {
        throw new Error(`located: ${message}`);
      },
    });
    expect(() => hook.error('boom')).toThrow('located: boom');
  });

  it('applyMcxPluginInjections is a no-op without injections', () => {
    const state = {
      imports: [],
      statements: [],
      exports: {},
      tags: new Map(),
    };
    expect(applyMcxPluginInjections('const a = 1', state)).toBe('const a = 1');
  });

  it('runMcxBuildStart/End are safe without plugins', async () => {
    await expect(runMcxBuildStart([])).resolves.toBeUndefined();
    await expect(runMcxBuildEnd([])).resolves.toBeUndefined();
  });

  it('accepts factories, nested arrays and mixed lists', () => {
    const first = { name: 'first' } as McxPlugin;
    const second = { name: 'second' } as McxPlugin;
    const factory = () => second;
    const raw = (mcxPlugin: CompileOpt['mcxPlugin']): CompileOpt => ({
      moduleDir: '/dev/null',
      tsconfigPath: '',
      sourcemap: false,
      mcxPlugin,
    });

    expect(resolveMcxPlugins(raw(factory))).toEqual([second]);
    expect(resolveMcxPlugins(raw([first, factory]))).toEqual([first, second]);
    expect(
      resolveMcxPlugins(raw([[first], [factory, { name: 'third' }]])),
    ).toEqual([first, second, { name: 'third' }]);
    expect(() => resolveMcxPlugins(raw([() => undefined as never]))).toThrow(
      /mcxPlugin\[0\]/,
    );
  });
});

import { describe, it, expect } from 'vitest';
import type { TransformPluginContext } from 'rollup';
import type {
  ExportAllDeclaration,
  ExportDefaultDeclaration,
  ExportNamedDeclaration,
} from '@babel/types';
import * as t from '@babel/types';
import type {
  ParsedTagNode,
  ParsedTagContentNode,
  ParsedCommentNode,
  MCXPosition,
} from '../src/types';
import * as MCX from '../src/index.js';
import { Lexer } from '../src/ast/prop';
describe('compileJSFn', () => {
  it('should parse imports, calls, and exports', () => {
    const result = MCX.compiler.compileJSFn(
      "import * as test from './'; test.default(); export * from '@babel/parser';",
    );
    expect(result).toBeDefined();
    expect(result.BuildCache).toBeDefined();
    expect(result.BuildCache.import.length).toBeGreaterThanOrEqual(1);
    expect(result.BuildCache.call).toBeDefined();
    expect(result.BuildCache.export.length).toBeGreaterThanOrEqual(1);
  });
  it('should cache result', () => {
    const script = "console.log('Hello world')";
    const resultV1 = MCX.compiler.compileJSFn(script);
    const resultV2 = MCX.compiler.compileJSFn(script);
    expect(resultV1).toBe(resultV2);
  });
  it('should handle empty script', () => {
    const result = MCX.compiler.compileJSFn('');
    expect(result).toBeDefined();
  });

  it('should handle named exports', () => {
    const result = MCX.compiler.compileJSFn(
      'export const foo = 42; export function bar() {}',
    );
    const exports = result.BuildCache.export.filter(
      (
        e:
          | ExportNamedDeclaration
          | ExportAllDeclaration
          | ExportDefaultDeclaration,
      ) => e.type === 'ExportNamedDeclaration',
    );
    expect(exports.length).toBeGreaterThanOrEqual(2);
  });

  it('should handle default export', () => {
    const result = MCX.compiler.compileJSFn('export default 42');
    const defaultExport = result.BuildCache.export.find(
      (
        e:
          | ExportNamedDeclaration
          | ExportAllDeclaration
          | ExportDefaultDeclaration,
      ) => e.type === 'ExportDefaultDeclaration',
    );
    expect(defaultExport).toBeDefined();
  });

  it('should handle re-exports', () => {
    const result = MCX.compiler.compileJSFn('export { foo, bar } from "./mod"');
    const reExports = result.BuildCache.export.filter(
      (
        e:
          | ExportNamedDeclaration
          | ExportAllDeclaration
          | ExportDefaultDeclaration,
      ) =>
        e.type === 'ExportNamedDeclaration' &&
        'source' in e &&
        e.source !== undefined,
    );
    expect(reExports.length).toBeGreaterThanOrEqual(1);
  });
});

describe('compileMCXFn', () => {
  it('should parse basic mcx with Event and script', () => {
    const result = MCX.compiler.compileMCXFn(
      "<script> console.log('test') </script> <Event @after>PlayerJoin=test</Event>",
    );
    expect(result).toBeDefined();
    expect(result.strLoc).toBeDefined();
    expect(result.strLoc.Event).toBeDefined();
    expect(result.strLoc.Event.isLoad).toBe(true);
    expect(result.strLoc.script).toContain("console.log('test')");
  });

  it('should parse Event with tick', () => {
    const result = MCX.compiler.compileMCXFn(
      '<script>x</script> <Event tick="10">PlayerJoin=test</Event>',
    );
    expect(result.strLoc.Event.subscribe.PlayerJoin).toBe('test');
  });

  it('should parse Event with @after modifier', () => {
    const result = MCX.compiler.compileMCXFn(
      '<script>x</script> <Event @after>PlayerJoin=test</Event>',
    );
    expect(result.strLoc.Event.on).toBe('after');
  });

  it('should parse App tag', () => {
    const result = MCX.compiler.compileMCXFn(
      '<script>x</script> <App><setup>init()</setup></App>',
    );
    expect(result.strLoc.script).toBeDefined();
  });

  it('should parse Component tag', () => {
    const result = MCX.compiler.compileMCXFn(
      '<script>x</script> <Component><items><item id="a">a</item></items></Component>',
    );
    expect(result.strLoc.Component).toBeDefined();
  });

  it('should handle script-only mcx', () => {
    const result = MCX.compiler.compileMCXFn(
      "<script> console.log('hello') </script>",
    );
    expect(result.strLoc.script).toContain("console.log('hello')");
  });

  it('should parse multi-line Event content', () => {
    const result = MCX.compiler.compileMCXFn(
      '<script>x</script>\n<Event @after>\nitemUse = onUseItem\nentityHurt = onEntityHurt\nprojectileHitBlock = onProjectileHitBlock\n</Event>',
    );
    expect(Object.keys(result.strLoc.Event.subscribe)).toHaveLength(3);
    expect(result.strLoc.Event.subscribe.itemUse).toBe('onUseItem');
    expect(result.strLoc.Event.subscribe.entityHurt).toBe('onEntityHurt');
    expect(result.strLoc.Event.subscribe.projectileHitBlock).toBe(
      'onProjectileHitBlock',
    );
  });
});

describe('transform', () => {
  const createCtx = (
    overrides: Partial<TransformPluginContext> = {},
  ): TransformPluginContext =>
    ({
      error: (msg: unknown) => {
        throw new Error(String(msg));
      },
      warn: () => {},
      debug: () => {},
      info: () => {},
      getCombinedSourcemap: () =>
        ({ mappings: '' }) as ReturnType<
          TransformPluginContext['getCombinedSourcemap']
        >,
      ...overrides,
    }) as TransformPluginContext;

  const outdirs = { dist: '', behavior: '', resources: '' };

  it('should emit tick and @after for Event', async () => {
    const cd = MCX.compiler.compileMCXFn(
      '<script>console.log("test")</script> <Event @after tick="5">PlayerJoin=test</Event>',
    );
    const code = await MCX.transform(
      cd,
      new Map(),
      '/root/test.mcx',
      createCtx(),
      { moduleDir: '/dev/null', tsconfigPath: '', sourcemap: false },
      outdirs,
    );
    expect(typeof code).toBe('string');
    expect(code).toMatch(/tick\s*[:=]\s*5/);
    expect(code).toMatch(/on\s*[:=].*after/);
  });

  it('should throw when both Event and Component exist', async () => {
    expect(() =>
      MCX.compiler.compileMCXFn(
        '<script>x</script> <Event @after>PlayerJoin=test</Event> <Component><items><item id="a">a</item></items></Component>',
      ),
    ).toThrow();
  });

  it('should handle App transform', async () => {
    const cd = MCX.compiler.compileMCXFn('<script>aaaa()</script>');
    const code = await MCX.transform(
      cd,
      new Map(),
      '/root/test.mcx',
      createCtx(),
      { moduleDir: '/dev/null', tsconfigPath: '', sourcemap: false },
      outdirs,
    );
    expect(typeof code).toBe('string');
  });
});

describe('Form transform (legacy FormData)', () => {
  const createCtx = (
    overrides: Partial<TransformPluginContext> = {},
  ): TransformPluginContext =>
    ({
      error: (msg: unknown) => {
        throw new Error(String(msg));
      },
      warn: () => {},
      debug: () => {},
      info: () => {},
      getCombinedSourcemap: () =>
        ({ mappings: '' }) as ReturnType<
          TransformPluginContext['getCombinedSourcemap']
        >,
      ...overrides,
    }) as TransformPluginContext;

  const outdirs = { dist: '', behavior: '', resources: '' };

  it('should compile basic Form structure', () => {
    const cd = MCX.compiler.compileMCXFn(
      '<script>export const prop = ["name"]; export function handler() {}</script><Form><input placeholderText="input name">{{ name }}</input><title>Form</title></Form>',
    );
    expect(cd.strLoc.Form).toBeDefined();
    expect(cd.strLoc.Form?.name).toBe('Form');
  });

  it('should generate {{ }} content as (s) => expr in output for Form', async () => {
    const cd = MCX.compiler.compileMCXFn(
      '<script>export const prop = ["name"]; export function handler() {}</script><Form><input placeholderText="input name">{{ name }}</input></Form>',
    );
    const code = await MCX.transform(
      cd,
      new Map(),
      '/root/test.mcx',
      createCtx(),
      { moduleDir: '/dev/null', tsconfigPath: '', sourcemap: false },
      outdirs,
    );
    expect(code).not.toContain('Computation');
    expect(code).toContain('ctx[0].name');
    expect(code).toContain('"input name"');
  });

  it('should compile :param syntax into (s) => expr in output for Form', async () => {
    const cd = MCX.compiler.compileMCXFn(
      '<script>export const prop = ["name"]; export function handler() {}</script><Form><input :default="name" placeholderText="Name">{{ name }}</input></Form>',
    );
    const code = await MCX.transform(
      cd,
      new Map(),
      '/root/test.mcx',
      createCtx(),
      { moduleDir: '/dev/null', tsconfigPath: '', sourcemap: false },
      outdirs,
    );
    expect(code).not.toContain('Computation');
    expect(code).toContain('ctx[0].name');
    expect(code).toContain('"Name"');
  });

  it('should pass $prop via ctx at runtime', async () => {
    const cd = MCX.compiler.compileMCXFn(
      '<script>export const prop = ["name"]</script><Form><input placeholderText="Name">{{ name }}</input></Form>',
    );
    const code = await MCX.transform(
      cd,
      new Map(),
      '/root/test.mcx',
      createCtx(),
      { moduleDir: '/dev/null', tsconfigPath: '', sourcemap: false },
      outdirs,
    );
    expect(code).toContain('__mcx__ctx');
  });

  it('should handle Form without :param or {{ }}', async () => {
    const cd = MCX.compiler.compileMCXFn(
      '<script>export function handler() {}</script><Form><button click="handler">Click</button></Form>',
    );
    const code = await MCX.transform(
      cd,
      new Map(),
      '/root/test.mcx',
      createCtx(),
      { moduleDir: '/dev/null', tsconfigPath: '', sourcemap: false },
      outdirs,
    );
    expect(code).toContain('Click');
  });

  it('should compile for attribute into layout for Form', async () => {
    const cd = MCX.compiler.compileMCXFn(
      '<script>export const prop = ["items"]; export function handler() {}</script><Form><button for="v in items" click="handler">{{ v.label }}</button></Form>',
    );
    const code = await MCX.transform(
      cd,
      new Map(),
      '/root/test.mcx',
      createCtx(),
      { moduleDir: '/dev/null', tsconfigPath: '', sourcemap: false },
      outdirs,
    );
    expect(code).toContain('for:');
    expect(code).toContain('variable:');
    expect(code).toContain('"v"');
    expect(code).toContain('useSetup:');
    expect(code).toContain('"items"');
    expect(code).not.toContain('Computation');
    expect(code).toContain('ctx[0].v.label');
  });

  it('should reject invalid for syntax in Form', async () => {
    const cd = MCX.compiler.compileMCXFn(
      '<script>export const prop = ["items"]</script><Form><button for="bad syntax">test</button></Form>',
    );
    await expect(
      MCX.transform(
        cd,
        new Map(),
        '/root/test.mcx',
        createCtx(),
        { moduleDir: '/dev/null', tsconfigPath: '', sourcemap: false },
        outdirs,
      ),
    ).rejects.toThrow();
  });
});

describe('Ui transform (CustomForm)', () => {
  const createCtx = (
    overrides: Partial<TransformPluginContext> = {},
  ): TransformPluginContext =>
    ({
      error: (msg: unknown) => {
        throw new Error(String(msg));
      },
      warn: () => {},
      debug: () => {},
      info: () => {},
      getCombinedSourcemap: () =>
        ({ mappings: '' }) as ReturnType<
          TransformPluginContext['getCombinedSourcemap']
        >,
      ...overrides,
    }) as TransformPluginContext;

  const outdirs = { dist: '', behavior: '', resources: '' };

  it('should compile basic Ui to CustomForm', () => {
    const cd = MCX.compiler.compileMCXFn(
      '<script>export const prop = ["name"]</script><Ui><title>Form</title><input>{{ name }}</input></Ui>',
    );
    expect(cd.strLoc.UI).toBeDefined();
    expect(cd.strLoc.UI?.name).toBe('Ui');
  });

  it('should generate layout with mode ui for Ui', async () => {
    const cd = MCX.compiler.compileMCXFn(
      '<script>export const prop = ["name"]</script><Ui><title>Form</title><input>{{ name }}</input></Ui>',
    );
    const code = await MCX.transform(
      cd,
      new Map(),
      '/root/test.mcx',
      createCtx(),
      { moduleDir: '/dev/null', tsconfigPath: '', sourcemap: false },
      outdirs,
    );
    expect(code).toContain('mode: "ui"');
    expect(code).toContain('layout:');
  });

  it('should resolve {{ }} to (s) => expr in Ui', async () => {
    const cd = MCX.compiler.compileMCXFn(
      '<script>export const prop = ["name"]</script><Ui><title>Settings</title><input>{{ name }}</input></Ui>',
    );
    const code = await MCX.transform(
      cd,
      new Map(),
      '/root/test.mcx',
      createCtx(),
      { moduleDir: '/dev/null', tsconfigPath: '', sourcemap: false },
      outdirs,
    );
    expect(code).not.toContain('Computation');
    expect(code).toContain('__mcx__str(ctx[0].name)');
    expect(code).toContain('"Settings"');
  });

  it('should generate button with click handler in Ui', async () => {
    const cd = MCX.compiler.compileMCXFn(
      '<script>export function handler() {}</script><Ui><button click="handler">Click</button></Ui>',
    );
    const code = await MCX.transform(
      cd,
      new Map(),
      '/root/test.mcx',
      createCtx(),
      { moduleDir: '/dev/null', tsconfigPath: '', sourcemap: false },
      outdirs,
    );
    expect(code).toContain('Click');
    expect(code).toContain('ctx[0].handler');
  });
});

describe('AST - prop parser', () => {
  it('should parse key=value props separated by newlines', () => {
    const lexer = new Lexer('a=1\nb=2\nc=hello');
    const result = Array.from(lexer.tokenize());
    expect(result).toHaveLength(3);
    expect(result[0]?.key).toBe('a');
    expect(result[0]?.value).toBe(1);
    expect(result[1]?.value).toBe(2);
    expect(result[2]?.value).toBe('hello');
  });

  it('should parse JSON array value props', () => {
    const lexer = new Lexer('data=[1,2,3]');
    const result = Array.from(lexer.tokenize());
    expect(result[0]?.value).toEqual([1, 2, 3]);
  });

  it('should parse JSON object value props', () => {
    const lexer = new Lexer('obj={"key":"val"}');
    const result = Array.from(lexer.tokenize());
    expect(result[0]?.value).toEqual({ key: 'val' });
  });

  it('should parse single prop without newline', () => {
    const lexer = new Lexer('a=42');
    const result = Array.from(lexer.tokenize());
    expect(result).toHaveLength(1);
    expect(result[0]?.key).toBe('a');
    expect(result[0]?.value).toBe(42);
  });
});

describe('config constants', () => {
  it('should have required config values', async () => {
    const mod = await import('../src/transforms/config');
    const config = mod.default;
    expect(config.scriptCompileFn).toBe('__main');
    expect(config.eventImported).toBe('__mcx__event');
    expect(config.eventVarName).toBe('__use_event');
    expect(config.paramCtx).toBe('__mcx__ctx');
  });
});

describe('generateFileId', () => {
  it('should generate unique file IDs', async () => {
    const { generateFileId } = await import('../src/transforms/file_id');
    const id1 = generateFileId();
    const id2 = generateFileId();
    expect(id1).not.toBe(id2);
    expect(id1).toMatch(/^__file_import_\d+__$/);
  });
});

describe('JsCompileData', () => {
  it('should create with default values', async () => {
    const { JsCompileData } =
      await import('../src/compile-mcx/compiler/compileData');
    const data = new JsCompileData(t.program([]));
    expect(data.File).toBe('__repl');
    expect(data.isFile).toBe(false);
    expect(data.BuildCache).toBeDefined();
  });

  it('should set file path', async () => {
    const { JsCompileData } =
      await import('../src/compile-mcx/compiler/compileData');
    const data = new JsCompileData(t.program([]));
    data.setFilePath('/test.ts');
    expect(data.isFile).toBe(true);
    expect(data.File).toBe('/test.ts');
  });
});

describe('MCXCompileData', () => {
  it('should create with constructor args', async () => {
    const { JsCompileData, MCXCompileData } =
      await import('../src/compile-mcx/compiler/compileData');
    const jsir = new JsCompileData(t.program([]));
    const data = new MCXCompileData([], jsir, {
      UI: null,
      Form: null,
      script: '',
      Component: {},
      Event: {
        loc: {} as unknown as MCXPosition,
        subscribe: {},
        isLoad: true,
        on: 'after',
      },
    });
    expect(data.raw).toEqual([]);
    expect(data.JSIR).toBe(jsir);
  });

  it('should set file path on MCXCompileData', async () => {
    const { JsCompileData, MCXCompileData } =
      await import('../src/compile-mcx/compiler/compileData');
    const jsir = new JsCompileData(t.program([]));
    const data = new MCXCompileData([], jsir, {
      script: '',
      UI: null,
      Form: null,
      Component: {},
      Event: {
        subscribe: {},
        isLoad: true,
        on: 'after',
        loc: {} as unknown as MCXPosition,
      },
    });
    data.setFilePath('/test.mcx');
    expect(data.isFile).toBe(true);
    expect(data.File).toBe('/test.mcx');
    expect(data.JSIR.isFile).toBe(true);
  });
});

describe('AST - comment handling', () => {
  it('should ignore comments by default', () => {
    const ast = new MCX.AST.tag('<div>Hello<!--comment-->World</div>');
    const result = ast.parseAST();
    expect(result.length).toBe(1);
    const div = result[0]!;
    if (div.content) {
      const hasComment = div.content.some(
        (
          item:
            | ParsedTagContentNode
            | ParsedTagNode
            | ParsedCommentNode
            | undefined,
        ) => item?.type === 'Comment',
      );
      expect(hasComment).toBe(false);
    }
  });

  it('should preserve comments when includeComments is true', () => {
    const ast = new MCX.AST.tag('<div>Hello<!--comment-->World</div>', true);
    const result = ast.parseAST();
    expect(result.length).toBe(1);
    const div = result[0]!;
    if (div.content) {
      const comments = div.content.filter(
        (
          item:
            | ParsedTagContentNode
            | ParsedTagNode
            | ParsedCommentNode
            | undefined,
        ): item is ParsedCommentNode => item?.type === 'Comment',
      );
      expect(comments.length).toBeGreaterThanOrEqual(1);
    }
  });

  it('should handle nested comments', () => {
    const code = `
      <div>
        Hello
        <!-- comment 2 -->
        <span>test</span>
        <!-- comment 3 -->
      </div>
    `;
    const ast = new MCX.AST.tag(code, true);
    const result = ast.parseAST();
    expect(result.length).toBe(1);
    const root = result[0]!;
    if (root.content) {
      const comments = root.content.filter(
        (
          item:
            | ParsedTagContentNode
            | ParsedTagNode
            | ParsedCommentNode
            | undefined,
        ): item is ParsedCommentNode => item?.type === 'Comment',
      );
      expect(comments.length).toBeGreaterThanOrEqual(2);
    }
  });
});

describe('AST - position/location tracking', () => {
  it('should have correct start positions for opening tag', () => {
    const ast = new MCX.AST.tag('<div>Hello</div>');
    const result = ast.parseAST();
    const div = result[0]!;
    expect(div.start.type).toBe('Tag');
    expect(div.start.start.line).toBe(1);
    expect(div.start.start.column).toBe(0);
    expect(div.start.end.line).toBe(1);
    expect(div.start.end.column).toBe(5);
  });

  it('should have correct end positions for closing tag', () => {
    const ast = new MCX.AST.tag('<div>Hello</div>');
    const result = ast.parseAST();
    const div = result[0]!;
    expect(div.end).not.toBeNull();
    expect(div.end?.type).toBe('TagEnd');
    expect(div.end?.start.line).toBe(1);
    expect(div.end?.start.column).toBe(10);
    expect(div.end?.end.line).toBe(1);
    expect(div.end?.end.column).toBe(16);
  });

  it('should have correct loc start/end on ParsedTagNode', () => {
    const ast = new MCX.AST.tag('<div>Hello</div>');
    const result = ast.parseAST();
    const div = result[0]!;
    expect(div.loc.start.line).toBe(1);
    expect(div.loc.start.column).toBeGreaterThan(0);
    expect(div.loc.end.line).toBe(1);
    expect(div.loc.end.column).toBeGreaterThan(div.loc.start.column);
  });

  it('should handle multi-line tag positions', () => {
    const code = '<div>\n  Hello\n</div>';
    const ast = new MCX.AST.tag(code);
    const result = ast.parseAST();
    const div = result[0]!;
    expect(div.start.start.line).toBe(1);
    expect(div.start.start.column).toBe(0);
    expect(div.loc.start.line).toBe(1);
    expect(div.loc.start.column).toBeGreaterThan(0);
    expect(div.loc.end.line).toBe(3);
    expect(div.end).not.toBeNull();
    expect(div.end?.start.line).toBe(3);
  });

  it('should have correct relative positions for nested elements', () => {
    const ast = new MCX.AST.tag('<div><span>text</span></div>');
    const result = ast.parseAST();
    const div = result[0]!;
    const child = div.content[0]!;
    if (child.type === 'TagNode') {
      expect(child.name).toBe('span');
      expect(child.loc.start.line).toBe(1);
      expect(child.loc.start.column).toBeGreaterThan(div.loc.start.column);
      expect(child.loc.end.column).toBeLessThan(div.loc.end.column);
    } else {
      expect(child.type).toBe('TagNode');
    }
  });

  it('should handle content between tags', () => {
    const ast = new MCX.AST.tag('<div>Hello</div>');
    const result = ast.parseAST();
    const div = result[0]!;
    expect(div.content.length).toBeGreaterThanOrEqual(1);
    const contentNode = div.content[0]!;
    if (contentNode.type === 'TagContent') {
      expect(contentNode.data).toBe('Hello');
    } else {
      expect(contentNode.type).toBe('TagContent');
    }
  });
});

describe('MCXCompileData - start data', () => {
  it('should set Event.loc for Event @after tags', () => {
    const result = MCX.compiler.compileMCXFn(
      "<script> console.log('test') </script> <Event @after>PlayerJoin=test</Event>",
    );
    expect(result.strLoc.Event.loc.line).toBe(1);
    expect(result.strLoc.Event.loc.column).toBeGreaterThan(0);
  });

  it('should set Event.loc for Event tick="5" tags', () => {
    const result = MCX.compiler.compileMCXFn(
      '<script>x</script> <Event tick="5">PlayerJoin=test</Event>',
    );
    expect(result.strLoc.Event.loc.line).toBe(1);
    expect(result.strLoc.Event.loc.column).toBeGreaterThan(0);
    expect(result.strLoc.Event.subscribe.PlayerJoin).toBe('test');
  });

  it('should track component locations', () => {
    const result = MCX.compiler.compileMCXFn(
      '<script>x</script> <Component><items><item id="a">a</item></items></Component>',
    );
    expect(result.strLoc.Component).toBeDefined();
    const keys = Object.keys(result.strLoc.Component);
    expect(keys.length).toBeGreaterThanOrEqual(1);
    const compKey = keys.find(k => k.startsWith('items/'));
    expect(compKey).toBeDefined();
    const comp = result.strLoc.Component[compKey!]!;
    expect(comp.type).toBe('item');
    expect(comp.loc.line).toBe(1);
    expect(comp.loc.column).toBeGreaterThan(0);
  });

  it('should correctly extract Event subscribe data', () => {
    const result = MCX.compiler.compileMCXFn(
      '<script>x</script> <Event @after>PlayerJoin=test</Event>',
    );
    expect(result.strLoc.Event.subscribe.PlayerJoin).toBe('test');
    expect(result.strLoc.Event.on).toBe('after');
    expect(result.strLoc.Event.isLoad).toBe(true);
  });

  it('should detect component type (item vs block vs entity)', () => {
    const itemResult = MCX.compiler.compileMCXFn(
      '<script>x</script> <Component><items><item id="a">a</item></items></Component>',
    );
    const itemComp = Object.values(itemResult.strLoc.Component)[0]!;
    expect(itemComp.type).toBe('item');

    const blockResult = MCX.compiler.compileMCXFn(
      '<script>x</script> <Component><blocks><block id="b">b</block></blocks></Component>',
    );
    const blockComp = Object.values(blockResult.strLoc.Component)[0]!;
    expect(blockComp.type).toBe('block');

    const entityResult = MCX.compiler.compileMCXFn(
      '<script>x</script> <Component><entities><entity id="c">c</entity></entities></Component>',
    );
    const entityComp = Object.values(entityResult.strLoc.Component)[0]!;
    expect(entityComp.type).toBe('entity');
  });

  it('should preserve whitespace in script content', () => {
    const result = MCX.compiler.compileMCXFn(
      "<script lang=\"js\"> console.log('test') </script>",
    );
    expect(result.strLoc.script).toContain("console.log('test')");
    expect(result.strLoc.script).toBe(" console.log('test') ");
  });
});

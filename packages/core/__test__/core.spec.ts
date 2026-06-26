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
import { isNonNullChain } from 'typescript';

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

describe('UI transform', () => {
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

  it('should compile basic Ui structure', () => {
    const cd = MCX.compiler.compileMCXFn(
      '<script>export const prop = ["name"]; export function handler() {}</script><Ui><input placeholderText="input name">{{ name }}</input><title>Form</title></Ui>',
    );
    expect(cd.strLoc.UI).toBeDefined();
    expect(cd.strLoc.UI!.name).toBe('Ui');
  });

  it('should generate {{ }} content as { useProp } in output', async () => {
    const cd = MCX.compiler.compileMCXFn(
      '<script>export const prop = ["name"]; export function handler() {}</script><Ui><input placeholderText="input name">{{ name }}</input></Ui>',
    );
    const code = await MCX.transform(
      cd,
      new Map(),
      '/root/test.mcx',
      createCtx(),
      { moduleDir: '/dev/null', tsconfigPath: '', sourcemap: false },
      outdirs,
    );
    expect(code).toContain('useProp');
    expect(code).toContain('"name"');
  });

  it('should compile :param syntax into { useProp } in output', async () => {
    const cd = MCX.compiler.compileMCXFn(
      '<script>export const prop = ["name"]; export function handler() {}</script><Ui><input :default="name" placeholderText="Name">{{ name }}</input></Ui>',
    );
    const code = await MCX.transform(
      cd,
      new Map(),
      '/root/test.mcx',
      createCtx(),
      { moduleDir: '/dev/null', tsconfigPath: '', sourcemap: false },
      outdirs,
    );
    expect(code).toContain('useProp');
    expect(code).toContain('"name"');
    expect(code).toMatch(/default[:\s]*\{[^}]*useProp/);
  });

  it('should pass $prop via ctx at runtime', async () => {
    const cd = MCX.compiler.compileMCXFn(
      '<script>export const prop = ["name"]</script><Ui><input placeholderText="Name">{{ name }}</input></Ui>',
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

  it('should handle Ui without :param or {{ }}', async () => {
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
  });
});

describe('AST - prop parser', () => {
  it('should parse key=value props separated by newlines', () => {
    const lexer = new Lexer('a=1\nb=2\nc=hello');
    const result = Array.from(lexer.tokenize());
    expect(result).toHaveLength(3);
    expect(result[0]!.key).toBe('a');
    expect(result[0]!.value).toBe(1);
    expect(result[1]!.value).toBe(2);
    expect(result[2]!.value).toBe('hello');
  });

  it('should parse JSON array value props', () => {
    const lexer = new Lexer('data=[1,2,3]');
    const result = Array.from(lexer.tokenize());
    expect(result[0]!.value).toEqual([1, 2, 3]);
  });

  it('should parse JSON object value props', () => {
    const lexer = new Lexer('obj={"key":"val"}');
    const result = Array.from(lexer.tokenize());
    expect(result[0]!.value).toEqual({ key: 'val' });
  });

  it('should parse single prop without newline', () => {
    const lexer = new Lexer('a=42');
    const result = Array.from(lexer.tokenize());
    expect(result).toHaveLength(1);
    expect(result[0]!.key).toBe('a');
    expect(result[0]!.value).toBe(42);
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

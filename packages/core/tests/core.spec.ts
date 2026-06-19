import { describe, it, expect } from 'vitest';
import * as MCX from '../src/index.js';

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
      (e: any) => e.type === 'ExportNamedDeclaration',
    );
    expect(exports.length).toBeGreaterThanOrEqual(2);
  });

  it('should handle default export', () => {
    const result = MCX.compiler.compileJSFn('export default 42');
    const defaultExport = result.BuildCache.export.find(
      (e: any) => e.type === 'ExportDefaultDeclaration',
    );
    expect(defaultExport).toBeDefined();
  });

  it('should handle re-exports', () => {
    const result = MCX.compiler.compileJSFn('export { foo, bar } from "./mod"');
    const reExports = result.BuildCache.export.filter(
      (e: any) => e.type === 'ExportNamedDeclaration' && e.source,
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
  const createCtx = (overrides = {}): any => ({
    error: (msg: any) => {
      throw new Error(String(msg));
    },
    warn: () => {},
    ...overrides,
  });

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
  const createCtx = (overrides = {}): any => ({
    error: (msg: any) => {
      throw new Error(String(msg));
    },
    warn: () => {},
    ...overrides,
  });

  const outdirs = { dist: '', behavior: '', resources: '' };

  it('should compile basic Ui structure', () => {
    const cd = MCX.compiler.compileMCXFn(
      '<script>export const prop = ["name"]; export function handler() {}</script><Ui><input placeholderText="input name">{{ name }}</input><title>Form</title></Ui>',
    );
    expect(cd.strLoc.UI).toBeDefined();
    expect(cd.strLoc.UI.name).toBe('Ui');
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

describe('AST - comment handling', () => {
  it('should ignore comments by default', () => {
    const ast = new MCX.AST.tag('<div>Hello<!--comment-->World</div>');
    const result = ast.parseAST();
    expect(result.length).toBe(1);
    const div = result[0];
    if (div.content) {
      const hasComment = div.content.some(
        (item: any) => item?.type === 'Comment',
      );
      expect(hasComment).toBe(false);
    }
  });

  it('should preserve comments when includeComments is true', () => {
    const ast = new MCX.AST.tag('<div>Hello<!--comment-->World</div>', true);
    const result = ast.parseAST();
    expect(result.length).toBe(1);
    const div = result[0];
    if (div.content) {
      const comments = div.content.filter(
        (item: any) => item?.type === 'Comment',
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
    const root = result[0];
    if (root.content) {
      const comments = root.content.filter(
        (item: any) => item?.type === 'Comment',
      );
      expect(comments.length).toBeGreaterThanOrEqual(2);
    }
  });
});

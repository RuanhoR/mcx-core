import { describe, it, expect } from 'vitest';
import * as MCX from '../src/index.js';

const compile = (script: string): string => {
  const out = MCX.compiler.compileMCXFn(
    `${script}\n<Event @after>PlayerJoin=test</Event>`,
  );
  expect(out).toBeTruthy();
  return out.strLoc.script;
};

describe('script content with < > expressions', () => {
  const jsCases: [string, string][] = [
    ['numeric compare', '<script>const ok = 1 < 4;\nconsole.log(ok);</script>'],
    ['lt in comment', '<script>// a < b > c\nconsole.log(1);</script>'],
    ['literal <> string', '<script>const s = "<>";\nconsole.log(s);</script>'],
    [
      'shift ops',
      '<script>const sh = 1 << 2;\nconst sr = 8 >> 1;\nconsole.log(sh, sr);</script>',
    ],
    [
      'chained compare',
      '<script>let r = 1 < 4 && 5 > 2 || 3 <= 3 >= 3;console.log(r);</script>',
    ],
  ];
  for (const [name, src] of jsCases) {
    it(`compiles plain js: ${name}`, () => {
      expect(() => compile(src)).not.toThrow();
    });
  }

  it('keeps plain js script content unchanged', () => {
    const script = compile(
      '<script>const ok = 1 < 4;\nexport { ok };</script>',
    );
    expect(script).toContain('1 < 4');
  });

  it('compiles ts generics with lang="ts"', () => {
    expect(() =>
      compile(
        '<script lang="ts">const m = new Map<string, number>();\nconst f = (x: number): boolean => x < 10;</script>',
      ),
    ).not.toThrow();
  });

  it('defaults missing lang to ts for generics', () => {
    let script = '';
    expect(() => {
      script = compile(
        '<script>const m = new Map<string, number>();\nconst a: Array<number> = [];</script>',
      );
    }).not.toThrow();
    expect(script).not.toContain('<string, number>');
    expect(script).not.toContain(': Array<number>');
  });

  it('defaults missing lang to ts for nested generic type alias', () => {
    expect(() =>
      compile(
        '<script>type Deep = Array<Array<string>>;\nconsole.log(1);</script>',
      ),
    ).not.toThrow();
  });

  it('defaults missing lang to ts for typed arrow function', () => {
    expect(() =>
      compile(
        '<script>const f = (x: number): boolean => x < 10;\nconsole.log(f(1));</script>',
      ),
    ).not.toThrow();
  });

  it('keeps explicit lang="js" content as-is', () => {
    const script = compile(
      '<script lang="js">const ok = 1 < 4;\nconsole.log(ok);</script>',
    );
    expect(script).toContain('const ok = 1 < 4;');
    expect(script).toContain('console.log(ok);');
  });

  it('parses raw < > inside script at AST level', () => {
    const ast = new MCX.AST.tag('<script>a < b && c > d; //</script>');
    const result = ast.parseAST();
    expect(result.length).toBeGreaterThanOrEqual(1);
  });
});

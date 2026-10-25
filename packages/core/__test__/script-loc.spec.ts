import { describe, it, expect } from 'vitest';
import { CompileError, compileMCXFn } from '../src/compile-mcx/compiler';

/**
 * Script errors used to be reported in ts.transpileModule's output coordinate
 * space (which reprints the program and elides unused imports), so positions
 * landed on the wrong lines of the .mcx file.
 */
function compileErrorOf(code: string): CompileError {
  try {
    compileMCXFn(code);
  } catch (err) {
    if (err instanceof CompileError) return err;
    throw err;
  }
  throw new Error('expected compileMCXFn to throw a CompileError');
}

const mcxWithScript = (lang: string, script: string) =>
  `<Component>\n  <blocks><block id="a.json">x</block></blocks>\n</Component>\n<script lang="${lang}">\n${script}</script>`;

describe('script error loc mapping', () => {
  it('reports real TS syntax errors at the original mcx position', () => {
    // `luckBlock.` is incomplete; transpile rewrites it to `luckBlock.;` and
    // reflows lines, so the old babel error pointed at line 18:0 (the `as
    // const` line) instead of the actual broken statement
    const err = compileErrorOf(
      mcxWithScript(
        'ts',
        [
          'import { BlockComponent } from "@mbler/mcx-component";',
          'export const luckBlock = new BlockComponent({',
          '  format: "1.21.80",',
          '  id: "rluckblock:block",',
          '  menu_category: { category: "construction" }',
          '});',
          'luckBlock.setMaterialInstances(Object.fromEntries(',
          '  (["down", "up"] as const).map(v => [v, { texture: "luckblock" }])',
          '));',
          'luckBlock.',
        ].join('\n') + '\n',
      ),
    );
    expect(err.message).toBe('[ts error]: Identifier expected.');
    // `luckBlock.` is script line 11 -> mcx line 14 (script tag on line 4),
    // column 10 = after the dot
    expect(err.loc).toEqual({ line: 14, column: 10 });
  });

  it('maps babel parse errors in js scripts by the script tag offset', () => {
    const err = compileErrorOf(
      mcxWithScript('js', 'import A from "b";\nconst x = ;\n'),
    );
    expect(err.message).toBe('[babel parse error]: Unexpected token');
    // `const x = ;` is script line 3 -> mcx line 6
    expect(err.loc).toEqual({ line: 6, column: 10 });
  });

  it('remaps traversal errors when transpilation shifts lines', () => {
    // `import A` is unused, so TS elides it and `const x;` moves up a line in
    // the transpiled output; the error must still point at the original line
    const err = compileErrorOf(
      mcxWithScript('ts', 'import A from "b";\nconst x;\n'),
    );
    expect(err.loc).toEqual({ line: 6, column: 6 });
  });

  it('still compiles valid scripts', () => {
    expect(() =>
      compileMCXFn(
        mcxWithScript(
          'ts',
          'import A from "b";\nexport const x = ([1,2] as const).map(v => v);\n',
        ),
      ),
    ).not.toThrow();
  });
});

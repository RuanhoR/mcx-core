import { describe, expect, it } from 'vitest';
import { parseForESLint } from '../src/parser';

describe('mcx ESLint parser', () => {
  it('attaches core template tags as mcxTemplate', () => {
    const res = parseForESLint(
      '<Ui>\n<button>go</button>\n</Ui>\n<script lang="ts">\nconst x = 1;\n</script>',
    );
    const template = (
      res.ast as unknown as { mcxTemplate: { name: string }[] }
    ).mcxTemplate;
    expect(template.map(t => t.name)).toEqual(['Ui', 'script']);
  });

  it('shifts script locs and ranges into original-file coordinates', () => {
    const code =
      '<Ui>\n<button>go</button>\n</Ui>\n<script lang="ts">\nconst x = 1;\n</script>';
    const res = parseForESLint(code);
    const stmt = res.ast.body[0]!;
    expect(stmt.loc.start.line).toBe(5);
    expect(code.slice(stmt.range![0], stmt.range![1])).toBe('const x = 1;');
    // last token should end right before the </script> boundary (the script's
    // trailing newline is not part of any token)
    const lastToken = res.ast.tokens![res.ast.tokens!.length - 1]!;
    expect(code.slice(lastToken.range![1], lastToken.range![1] + 10)).toContain(
      '</script',
    );
  });

  it('locates script bounds from core loc fields (no re-parse)', () => {
    // generics inside script must not break parsing and offsets must survive
    const code =
      '<script lang="ts">\nconst map = new Map<string, number>();\n</script>';
    const res = parseForESLint(code);
    const stmt = res.ast.body[0]!;
    expect(code.slice(stmt.range![0], stmt.range![1])).toBe(
      'const map = new Map<string, number>();',
    );
  });

  it('handles files without a script block', () => {
    const res = parseForESLint('<App></App>');
    expect(res.ast.body).toHaveLength(0);
    const template = (
      res.ast as unknown as { mcxTemplate: { name: string }[] }
    ).mcxTemplate;
    expect(template[0]!.name).toBe('App');
  });

  it('merges multiple script blocks into one Program', () => {
    const code =
      '<script lang="ts">\nconst a = 1;\n</script>\n<script lang="ts">\nconst b = 2;\n</script>';
    const res = parseForESLint(code);
    expect(res.ast.body).toHaveLength(2);
  });
});

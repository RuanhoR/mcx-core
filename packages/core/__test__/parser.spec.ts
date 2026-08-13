import { describe, it, expect } from 'vitest';
import type { ParsedTagNode, ParsedTagContentNode } from '../src/types';
import * as MCX from '../src/index.js';

describe('AST tag parser - error handling', () => {
  it('should throw on unmatched end tag', () => {
    expect(() => {
      const ast = new MCX.AST.tag('<div>text</span>');
      ast.parseAST();
    }).toThrow(/Invalid end tag/);
  });
  it('should correctly parse nested matched tags', () => {
    const ast = new MCX.AST.tag(
      '<script>x</script><parent><child>text</child></parent>',
    );
    const result = ast.parseAST();
    expect(result.length).toBe(2);
    expect(result[1]?.name).toBe('parent');
    const child = result[1]?.content[0] as ParsedTagNode;
    expect(child.name).toBe('child');
    const text = child.content[0] as ParsedTagContentNode;
    expect(text.data).toBe('text');
  });
  it('should keep TS generics in script content as raw text', () => {
    const ast = new MCX.AST.tag(
      '<Ui setup>\n  <input>name</input>\n</Ui>\n<script lang="ts">\nconst name = ref<string>("x");\nconst ok = a < b;\nexport { name, ok };\n</script>',
    );
    const result = ast.parseAST();
    const script = result.find(node => node.name === 'script') as ParsedTagNode;
    const content = script.content
      .map(c => (c.type === 'TagContent' ? c.data : ''))
      .join('');
    expect(content).toBe(
      '\nconst name = ref<string>("x");\nconst ok = a < b;\nexport { name, ok };\n',
    );
  });
  it('should preserve loc offsets after script scrubbing', () => {
    const ast = new MCX.AST.tag(
      '<Ui setup>\n  <button>go</button>\n</Ui>\n<script lang="ts">\nconst x = fn<string>();\n</script>',
    );
    const result = ast.parseAST();
    const ui = result.find(node => node.name === 'Ui') as ParsedTagNode;
    expect(ui.loc.start.line).toBe(1);
    const button = ui.content[0] as ParsedTagNode;
    expect(button.loc.start.line).toBe(2);
    expect(button.loc.start.column).toBe(3);
  });
});

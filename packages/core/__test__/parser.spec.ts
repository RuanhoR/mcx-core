import { describe, it, expect } from 'vitest';
import type {
  ParsedTagNode,
  ParsedTagContentNode,
} from '../src/types';
import * as MCX from '../src/index.js';

describe('AST tag parser - error handling', () => {
  it('should throw on unmatched end tag', () => {
    expect(() => {
      const ast = new MCX.AST.tag('<div>text</span>');
      ast.parseAST();
    }).toThrow(/Invalid end tag/);
  });
  it('should correctly parse nested matched tags', () => {
    const ast = new MCX.AST.tag('<script>x</script><parent><child>text</child></parent>');
    const result = ast.parseAST();
    expect(result.length).toBe(2);
    expect(result[1]!.name).toBe('parent');
    const child = result[1]!.content[0] as ParsedTagNode;
    expect(child.name).toBe('child');
    const text = child.content[0] as ParsedTagContentNode;
    expect(text.data).toBe('text');
  });
});

import { describe, it, expect } from 'vitest';
import type {
  ParsedTagNode,
  ParsedTagContentNode,
  ParsedCommentNode,
} from '../src/types';
import * as MCX from '../src/index.js';

describe('AST tag parser - unmatched end tags', () => {
  it('should throw on unmatched end tag', () => {
    expect(() => {
      const ast = new MCX.AST.tag('<div>text</span>');
      ast.parseAST();
    }).toThrow(/Unmatched closing tag/);
  });

  it('should throw on typo in end tag (real bug case)', () => {
    expect(() => {
      const ast = new MCX.AST.tag('<Ui><button></buton></Ui>');
      ast.parseAST();
    }).toThrow(/Unmatched closing tag/);
  });

  it('should throw on first unmatched end tag when multiple are unmatched', () => {
    expect(() => {
      const ast = new MCX.AST.tag('<a></b><c></d>');
      ast.parseAST();
    }).toThrow(/Unmatched closing tag <\/b>/);
  });

  it('should correctly parse matched tags', () => {
    const ast = new MCX.AST.tag('<div><span>text</span></div>');
    const result = ast.parseAST();
    expect(result.length).toBe(1);
    expect(result[0]!.name).toBe('div');
  });

  it('should correctly parse nested matched tags', () => {
    const ast = new MCX.AST.tag('<parent><child>text</child></parent>');
    const result = ast.parseAST();
    expect(result.length).toBe(1);
    expect(result[0]!.name).toBe('parent');
    const child = result[0]!.content[0] as ParsedTagNode;
    expect(child.name).toBe('child');
    const text = child.content[0] as ParsedTagContentNode;
    expect(text.data).toBe('text');
  });
});

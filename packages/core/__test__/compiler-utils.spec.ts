import { describe, it, expect } from 'vitest';
import CompilerUtils from '../src/compile-mcx/compiler/utils';
import * as t from '@babel/types';
import type { ParserOptions } from '@babel/parser';
import type { ImportList } from '../src/compile-mcx/types';

describe('CompilerUtils.ImportToCache', () => {
  it('should parse namespace import', () => {
    const node = t.importDeclaration(
      [t.importNamespaceSpecifier(t.identifier('fs'))],
      t.stringLiteral('node:fs'),
    );
    const result = CompilerUtils.ImportToCache(node);
    expect(result.source).toBe('node:fs');
    expect(result.imported).toHaveLength(1);
    expect(result.imported[0]?.isAll).toBe(true);
    expect(result.imported[0]?.as).toBe('fs');
  });

  it('should parse default import', () => {
    const node = t.importDeclaration(
      [t.importDefaultSpecifier(t.identifier('foo'))],
      t.stringLiteral('./foo'),
    );
    const result = CompilerUtils.ImportToCache(node);
    expect(result.imported[0]?.import).toBe('default');
    expect(result.imported[0]?.as).toBe('foo');
  });

  it('should parse named import', () => {
    const node = t.importDeclaration(
      [t.importSpecifier(t.identifier('bar'), t.identifier('foo'))],
      t.stringLiteral('./mod'),
    );
    const result = CompilerUtils.ImportToCache(node);
    expect(result.imported[0]?.isAll).toBe(false);
    expect(result.imported[0]?.import).toBe('foo');
    expect(result.imported[0]?.as).toBe('bar');
  });

  it('should parse multiple specifiers', () => {
    const node = t.importDeclaration(
      [
        t.importSpecifier(t.identifier('a'), t.identifier('a')),
        t.importSpecifier(t.identifier('b'), t.identifier('b')),
      ],
      t.stringLiteral('./mod'),
    );
    const result = CompilerUtils.ImportToCache(node);
    expect(result.imported).toHaveLength(2);
  });
});

describe('CompilerUtils.CacheToImportNode', () => {
  it('should throw on null input', () => {
    expect(() => CompilerUtils.CacheToImportNode(null as unknown as ImportList)).toThrow();
  });

  it('should convert namespace import', () => {
    const result = CompilerUtils.CacheToImportNode({
      source: 'node:fs',
      imported: [{ isAll: true, as: 'fs', import: '*' }],
    });
    expect(result.type).toBe('ImportDeclaration');
    expect(result.source.value).toBe('node:fs');
    expect(result.specifiers[0]?.type).toBe('ImportNamespaceSpecifier');
    if (result.specifiers[0]?.type === 'ImportNamespaceSpecifier') {
      expect(result.specifiers[0].local.name).toBe('fs');
    }
  });

  it('should convert default import', () => {
    const result = CompilerUtils.CacheToImportNode({
      source: './foo',
      imported: [{ isAll: false, as: 'foo', import: 'default' }],
    });
    expect(result.specifiers[0]?.type).toBe('ImportDefaultSpecifier');
  });

  it('should convert named import', () => {
    const result = CompilerUtils.CacheToImportNode({
      source: './mod',
      imported: [{ isAll: false, as: 'bar', import: 'foo' }],
    });
    expect(result.specifiers[0]?.type).toBe('ImportSpecifier');
  });

  it('should reuse raw node when checksum matches', () => {
    const rawNode = t.importDeclaration(
      [t.importNamespaceSpecifier(t.identifier('fs'))],
      t.stringLiteral('node:fs'),
    );
    const result = CompilerUtils.CacheToImportNode({
      source: 'node:fs',
      imported: [{ isAll: true, as: 'fs' }],
      raw: rawNode,
    });
    expect(result).toBe(rawNode);
  });
});

describe('CompilerUtils.FileAST', () => {
  it('should throw on non-string input', async () => {
    await expect(CompilerUtils.FileAST(null as unknown as string, {} as ParserOptions)).rejects.toThrow();
  });

  it('should throw on non-existent file', async () => {
    await expect(CompilerUtils.FileAST('/nonexistent.ts', { sourceType: 'module' })).rejects.toThrow();
  });
});

describe('CompilerUtils.FileContent', () => {
  it('should throw on non-existent file', async () => {
    await expect(CompilerUtils.FileContent('/nonexistent.ts')).rejects.toThrow();
  });
});

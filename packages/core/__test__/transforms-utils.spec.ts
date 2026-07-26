import { describe, it, expect } from 'vitest';
import * as t from '@babel/types';
import {
  extractIdList,
  extractVarDefIdList,
  createOnceGuard,
  createOnceData,
} from '../src/transforms/utils';

describe('extractVarDefIdList', () => {
  it('should extract identifier name', () => {
    const result = extractVarDefIdList(t.identifier('foo'));
    expect(result).toEqual(['foo']);
  });

  it('should extract object pattern names', () => {
    const pattern = t.objectPattern([
      t.objectProperty(t.identifier('a'), t.identifier('a')),
    ]);
    const result = extractVarDefIdList(pattern);
    expect(result).toEqual(['a']);
  });

  it('should extract array pattern names', () => {
    const pattern = t.arrayPattern([t.identifier('a'), t.identifier('b')]);
    const result = extractVarDefIdList(pattern);
    expect(result).toEqual(['a', 'b']);
  });

  it('should extract rest element from object pattern', () => {
    const pattern = t.objectPattern([
      t.restElement(t.identifier('rest')),
    ]);
    const result = extractVarDefIdList(pattern);
    expect(result).toEqual(['rest']);
  });

  it('should extract assignment pattern', () => {
    const pattern = t.assignmentPattern(t.identifier('x'), t.numericLiteral(1));
    const result = extractVarDefIdList(pattern);
    expect(result).toEqual(['x']);
  });

  it('should skip undefined elements in array pattern', () => {
    const pattern = t.arrayPattern([t.identifier('a'), null, t.identifier('c')]);
    const result = extractVarDefIdList(pattern);
    expect(result).toEqual(['a', 'c']);
  });
});

describe('extractIdList', () => {
  it('should extract function name', () => {
    const decl = t.functionDeclaration(t.identifier('myFunc'), [], t.blockStatement([]));
    const result = extractIdList(decl);
    expect(result).toEqual(['myFunc']);
  });

  it('should extract variable declaration names', () => {
    const decl = t.variableDeclaration('const', [
      t.variableDeclarator(t.identifier('a'), t.numericLiteral(1)),
      t.variableDeclarator(t.identifier('b'), t.numericLiteral(2)),
    ]);
    const result = extractIdList(decl);
    expect(result).toEqual(['a', 'b']);
  });

  it('should extract class name', () => {
    const decl = t.classDeclaration(t.identifier('MyClass'), null, t.classBody([]));
    const result = extractIdList(decl);
    expect(result).toEqual(['MyClass']);
  });

  it('should return empty for unknown declaration type', () => {
    const decl = t.declareFunction(t.identifier('x'));
    const result = extractIdList(decl);
    expect(result).toEqual([]);
  });
});

describe('createOnceGuard', () => {
  it('should create a function that succeeds on first call', () => {
    const fn = createOnceGuard();
    expect(fn.prototype.enable).toBe(false);
    fn();
    expect(fn.prototype.enable).toBe(true);
  });

  it('should throw on second call', () => {
    const fn = createOnceGuard();
    fn();
    expect(() => fn()).toThrow("can't enable again");
  });
});

describe('createOnceData', () => {
  it('should create a function that stores data on first call', () => {
    const fn = createOnceData<string>();
    expect(fn.prototype.enable).toBeNull();
    fn('hello');
    expect(fn.prototype.enable).toBe('hello');
  });

  it('should throw on second call', () => {
    const fn = createOnceData<string>();
    fn('hello');
    expect(() => fn('world')).toThrow("can't enable again");
  });
});

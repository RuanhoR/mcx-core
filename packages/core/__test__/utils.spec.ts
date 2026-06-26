import { describe, it, expect, vi } from 'vitest';
import Utils from '../src/utils';
import { mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

describe('Utils.FileExist', () => {
  it('should return true for existing file', async () => {
    const result = await Utils.FileExist(__filename);
    expect(result).toBe(true);
  });

  it('should return false for non-existing file', async () => {
    const result = await Utils.FileExist('/nonexistent/path/foo.ts');
    expect(result).toBe(false);
  });
});

describe('Utils.TypeVerify', () => {
  it('should return true when types match', () => {
    const obj = { name: 'test', age: 25, active: true };
    expect(Utils.TypeVerify(obj, { name: 'string', age: 'number', active: 'boolean' })).toBe(true);
  });

  it('should return false when types do not match', () => {
    const obj = { name: 'test', age: '25' };
    expect(Utils.TypeVerify(obj, { name: 'string', age: 'number' })).toBe(false);
  });

  it('should return true for object type', () => {
    const obj = { data: { key: 'val' } };
    expect(Utils.TypeVerify(obj, { data: 'object' })).toBe(true);
  });
});

describe('Utils.AbsoluteJoin', () => {
  it('should join relative path with base', () => {
    const result = Utils.AbsoluteJoin('/base', './relative/file.ts');
    expect(result).toBe('/base/relative/file.ts');
  });

  it('should return absolute path as-is', () => {
    const result = Utils.AbsoluteJoin('/base', '/absolute/file.ts');
    expect(result).toBe('/absolute/file.ts');
  });
});

describe('Utils.readFile', () => {
  it('should read file as string by default', async () => {
    const content = await Utils.readFile(__filename);
    expect(typeof content).toBe('string');
    expect((content as string).length).toBeGreaterThan(0);
  });

  it('should read file as object when want is object', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'utils-test-'));
    const jsonPath = join(dir, 'test.json');
    await writeFile(jsonPath, '{"key": "value"}');
    const content = await Utils.readFile(jsonPath, { want: 'object' });
    expect(typeof content).toBe('object');
    expect((content as Record<string, string>).key).toBe('value');
  });

  it('should return empty object for invalid JSON with want object', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'utils-test-'));
    const jsonPath = join(dir, 'bad.json');
    await writeFile(jsonPath, 'not-json');
    const content = await Utils.readFile(jsonPath, { want: 'object' });
    expect(content).toEqual({});
  });

  it('should return empty string for non-existing file', async () => {
    const content = await Utils.readFile('/nonexistent/path/foo.txt');
    expect(content).toBe('');
  });

  it('should return empty string for non-existing file with retry', async () => {
    const content = await Utils.readFile('/definitely/nonexistent/path.ts', { maxRetries: 1, delay: 1 });
    expect(content).toBe('');
  });
});

describe('Utils.sleep', () => {
  it('should resolve after specified time', async () => {
    vi.useFakeTimers();
    const promise = Utils.sleep(100);
    vi.advanceTimersByTime(100);
    await expect(promise).resolves.toBeUndefined();
    vi.useRealTimers();
  });
});

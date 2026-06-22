import { describe, it, expect } from 'vitest';
import { fileExists } from '../src/init';
import { homedir } from 'node:os';

describe('fileExists', () => {
  it('should return true for existing file', async () => {
    const result = await fileExists(homedir());
    expect(result).toBe(true);
  });

  it('should return false for non-existing file', async () => {
    const result = await fileExists('/nonexistent/path/foo.txt');
    expect(result).toBe(false);
  });
});

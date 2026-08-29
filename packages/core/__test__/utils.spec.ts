import { describe, it, expect } from 'vitest';
import { fileExists } from '../src/utils';
import { setGlobalFS } from '../src/state';
import * as nodeFs from 'node:fs';

setGlobalFS(nodeFs);

describe('fileExists', () => {
  it('should return true for existing file', async () => {
    const result = await fileExists(__filename);
    expect(result).toBe(true);
  });

  it('should return false for non-existing file', async () => {
    const result = await fileExists('/nonexistent/path/foo.ts');
    expect(result).toBe(false);
  });
});

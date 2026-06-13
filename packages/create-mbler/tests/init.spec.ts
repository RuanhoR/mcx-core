import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fileExists } from '../src/init'

describe('fileExists', () => {
  it('should return true for existing file', async () => {
    const result = await fileExists(import.meta.dirname + '/init.spec.ts')
    expect(result).toBe(true)
  })

  it('should return false for non-existing file', async () => {
    const result = await fileExists('/nonexistent/path/foo.txt')
    expect(result).toBe(false)
  })
})

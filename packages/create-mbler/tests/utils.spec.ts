import { describe, it, expect, vi } from 'vitest'
import { showText, verifyType } from '../src/utils'

describe('showText', () => {
  it('should write text to stdout with newline', () => {
    const writeSpy = vi.spyOn(process.stdout, 'write').mockImplementation(() => true)
    showText('hello')
    expect(writeSpy).toHaveBeenCalledWith('hello\n')
    writeSpy.mockRestore()
  })
})

describe('verifyType', () => {
  it('should return true when types match', () => {
    const obj = { name: 'test', age: 25, active: true }
    expect(verifyType(obj, { name: 'string', age: 'number', active: 'boolean' })).toBe(true)
  })

  it('should return false when a type does not match', () => {
    const obj = { name: 'test', age: 'twenty-five' }
    expect(verifyType(obj, { name: 'string', age: 'number' })).toBe(false)
  })

  it('should return true for object type', () => {
    const obj = { items: ['a', 'b'] }
    expect(verifyType(obj, { items: 'object' })).toBe(true)
  })
})

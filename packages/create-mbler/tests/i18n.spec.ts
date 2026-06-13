import { describe, it, expect } from 'vitest'
import { getI18n, LanguageList, LanguageMap } from '../src/i18n'

describe('i18n', () => {
  it('should have zh and en languages', () => {
    expect(LanguageList).toEqual(['zh', 'en'])
  })

  it('should return zh text for zh language', () => {
    expect(getI18n('Name', 'zh')).toBe('项目名称')
  })

  it('should return en text for en language', () => {
    expect(getI18n('Name', 'en')).toBe('Project name? ')
  })

  it('should return all keys for both languages', () => {
    const keys = Object.keys(LanguageMap.zh) as (keyof typeof LanguageMap.zh)[]
    for (const key of keys) {
      expect(getI18n(key, 'zh')).toBeDefined()
      expect(getI18n(key, 'en')).toBeDefined()
    }
  })
})

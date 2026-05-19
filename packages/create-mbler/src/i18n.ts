export type I18nKey =
  | 'InputCreateAt'
  | 'Name'
  | 'Description'
  | 'McVersion'
  | 'Need'
export const LanguageList = ['zh', 'en'] as const
export type Language = (typeof LanguageList)[number]
export const LanguageMap = {
  zh: {
    InputCreateAt: '创建在哪呢？',
    Name: '项目名称',
    Need: '需要什么？',
    McVersion: '依赖的 mc 版本（像 1.21.100 ）？',
    Description: '项目描述？',
  },
  en: {
    InputCreateAt: 'Create mbler project at ...?',
    Need: 'Need?',
    Description: 'Project description?',
    McVersion: 'Need mcbe version(like 1.21.100)?',
    Name: 'Project name? ',
  },
} satisfies {
  [key in Language]: {
    [key in I18nKey]: string
  }
}
export function getI18n(key: I18nKey, language: Language): string {
  return LanguageMap[language][key]
}

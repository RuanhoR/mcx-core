export type PackageManager = 'npm' | 'pnpm'

export interface InputResult {
  createAt: string
  OtherModule: ('ui' | 'beta-api' | 'init git' | 'init dep')[]
  McVersion: string
  Description: string
  Name: string
  Language: 'mcx' | 'js' | 'ts'
  PackageManager: PackageManager
}

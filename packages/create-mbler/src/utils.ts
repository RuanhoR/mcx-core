import { stdout } from 'node:process'

export function showText(etxt: string) {
  stdout.write(etxt + '\n')
}
export interface JSTypeMap {
  string: string
  boolean: boolean
  bigint: bigint
  symbol: symbol
  object: object
  number: number
  undefined: undefined
  null: null
}
export function verifyType<
  T extends object,
  U extends Record<keyof T, keyof JSTypeMap>,
>(obj: T, typeMapping: U): obj is T & { [P in keyof U]: JSTypeMap[U[P]] } {
  for (const key in typeMapping) {
    const expected = typeMapping[key]
    const val = (obj as any)[key]
    if (typeof val !== expected) return false
  }
  return true
}

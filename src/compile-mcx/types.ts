import type {
  ParserOptions
} from "@babel/parser";
import type {
  ImportDeclaration,
  ExportAllDeclaration,
  ExportDefaultDeclaration,
  ExportNamedDeclaration,
  Expression,
  SpreadElement,
  ArgumentPlaceholder,
  CallExpression
} from "@babel/types"
import {
  CompileOpt
} from "@mbler/mcx-types"
interface callList {
  source: Expression
  set: (callEXp: CallExpression) => boolean
  arguments: Array<SpreadElement | Expression | ArgumentPlaceholder>
  remove: () => void
}
interface ImportListImport {
  isAll: boolean
  import ? : string | undefined
  as: string
}
interface ImportList {
  source: string
  imported: ImportListImport[]
  raw ? : ImportDeclaration
}
interface BuildCache {
  call: callList[]
  import: ImportList[]
  export: Array<ExportNamedDeclaration | ExportAllDeclaration | ExportDefaultDeclaration>
}
export const _MCXstructureLocComponentTypes = {
  "items": "item",
  "blocks": "block",
  "entities": "entity"
} as const
type MCXstructureLocComponentType = typeof _MCXstructureLocComponentTypes[keyof typeof _MCXstructureLocComponentTypes]
interface MCXstructureLoc {
  script: string
  Event: {
    on: "after" | "before"
    subscribe: Record<string, string>
    loc: { line: number; pos: number }
    isLoad: boolean
  }
  Component: Record<string, {
    type: MCXstructureLocComponentType
    useExpore: string
    loc: { line: number; pos: number }
  }>
}
export type {
  BuildCache,
  ImportList,
  ImportListImport,
  callList,
  CompileOpt,
  MCXstructureLoc,
  MCXstructureLocComponentType
}
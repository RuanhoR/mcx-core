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
import { RollupOptions } from "rollup";
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
type MCX_INFO = {
  author: "github@RuanhoR"
  buildSystem: string
  buildSystemVersion: string
  // time
  buildTime: number
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
  }
  Component: Record<string, {
    type: MCXstructureLocComponentType
    useExpore: string
    loc: { line: number; pos: number }
  }>
}
export type {
  BuildCache,
  MCX_INFO,
  ImportList,
  ImportListImport,
  CompileOpt,
  callList,
  MCXstructureLoc,
  MCXstructureLocComponentType
}
interface CompileUserConfig {
  babelParser ?: ParserOptions
  rollupOptions ?: RollupOptions 
}
interface CompileOpt {
  cacheDir: string
  main: string
  ProjectDir: string
  moduleDir: string
  moduleList: string[]
  output: string
  isCache: boolean
  config: Partial<CompileUserConfig>
}
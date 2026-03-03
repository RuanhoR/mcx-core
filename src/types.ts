import { TransformPluginContext } from "rollup";
import type { MCXCompileData } from "./compile-mcx/compiler/compileData";
import { CompileOpt } from "@mbler/mcx-types";
import * as t from "@babel/types"
interface BaseToken {
  data: string;
  type: TokenType;
  startIndex?: number;
  endIndex?: number;
  startLine?: number;
  loc?: MCXLoc;
}
interface TagToken extends BaseToken {
  type: 'Tag';
}
interface TagEndToken extends BaseToken {
  type: 'TagEnd';
}
interface ContentToken extends BaseToken {
  type: 'Content';
}
type Token = TagToken | TagEndToken | ContentToken;
type AttributeMap = Record<string, string | boolean>;
interface MCXLoc {
  start: { line: number; index: number };
  end: { line: number; index: number };
}
interface ParsedTagNode {
  start: TagToken;
  name: string;
  arr: AttributeMap;
  content: (ParsedTagContentNode | ParsedTagNode)[];
  end: TagEndToken | null;
  loc: MCXLoc;
  type: "TagNode";
}
interface ParsedTagContentNode {
  data: string;
  type: 'TagContent';
}
type TokenType = 'Tag' | 'TagEnd' | 'Content';
type PropValue = number | string | object
interface PropNode {
  key: string
  value: PropValue
  type: "PropChar" | "PropObject"
}
type JsType = "boolean" | "number" | "string" | "object" | "function" | "bigint" | "symbol"
interface TypeVerifyBody {
  [key: string]: JsType
}
export interface ParseReadFileOpt {
  delay: number;
  maxRetries: number;
  want: 'string' | 'object';
}
export type ReadFileOpt = Partial<ParseReadFileOpt>;
export type mcxType = "component" | "event" | "app"
export type {
  Token,
  ContentToken,
  TagEndToken,
  TagToken,
  BaseToken,
  AttributeMap,
  PropValue,
  TokenType,
  ParsedTagContentNode,
  TypeVerifyBody,
  JsType,
  PropNode,
  ParsedTagNode,
  MCXLoc
}
export interface transformCtx {
  rollupContext: TransformPluginContext;
  compiledCode: MCXCompileData;
  cache: Map<string, MCXCompileData>;
  currentId: string;
  scriptTag: ParsedTagNode;
  currentAST: t.Statement[];
  mainFn: {
    param: t.FunctionParameter[];
    body: t.Statement[];
  }
  impAST: t.ImportDeclaration[];
  opt: CompileOpt;
}
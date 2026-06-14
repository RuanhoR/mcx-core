import type { TransformPluginContext } from 'rollup';
import type { MCXCompileData } from './compile-mcx/compiler/compileData';
import { CompileOpt } from '@mbler/mcx-types';
import * as t from '@babel/types';
interface BaseToken {
  data: string;
  type: TokenType;
  start: MCXPosition;
  end: MCXPosition;
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
interface CommentToken extends BaseToken {
  type: 'Comment';
}
type Token = TagToken | TagEndToken | ContentToken | CommentToken;
type AttributeMap = Record<string, string | boolean>;
/** 统一的位置信息结构 */
interface MCXPosition {
  line: number;
  column: number;
}

interface MCXLoc {
  start: MCXPosition;
  end: MCXPosition;
}
interface ParsedTagNode {
  start: TagToken;
  name: string;
  arr: AttributeMap;
  content: (ParsedTagContentNode | ParsedTagNode | ParsedCommentNode)[];
  end: TagEndToken | null;
  loc: MCXLoc;
  type: 'TagNode';
}
interface ParsedTagContentNode {
  data: string;
  type: 'TagContent';
}
interface ParsedCommentNode {
  data: string;
  type: 'Comment';
  loc?: MCXLoc;
}
type TokenType = 'Tag' | 'TagEnd' | 'Content' | 'Comment';
type PropValue = number | string | object;
interface PropNode {
  key: string;
  value: PropValue;
  type: 'PropChar' | 'PropObject';
}
type JsType =
  | 'boolean'
  | 'number'
  | 'string'
  | 'object'
  | 'function'
  | 'bigint'
  | 'symbol';
interface TypeVerifyBody {
  [key: string]: JsType;
}
export interface ParseReadFileOpt {
  delay: number;
  maxRetries: number;
  want: 'string' | 'object';
}
export type ReadFileOpt = Partial<ParseReadFileOpt>;
export type mcxType = 'component' | 'event' | 'app' | 'ui';
export type {
  Token,
  ContentToken,
  TagEndToken,
  TagToken,
  CommentToken,
  BaseToken,
  AttributeMap,
  PropValue,
  TokenType,
  ParsedTagContentNode,
  ParsedCommentNode,
  TypeVerifyBody,
  JsType,
  PropNode,
  ParsedTagNode,
  MCXLoc,
  MCXPosition,
};
export interface transformCtx {
  rollupContext: TransformPluginContext;
  compiledCode: MCXCompileData;
  cache: Map<string, MCXCompileData>;
  currentId: string;
  scriptTag: ParsedTagNode;
  currentAST: t.Program;
  mainFn: {
    param: t.FunctionParameter[];
    body: t.Statement[];
  };
  impAST: t.ImportDeclaration[];
  opt: CompileOpt;
  output: {
    dist: string;
    behavior: string;
    resources: string;
  };
}
export interface transformParseCtx {
  prop: t.ObjectProperty[];
  impBody: t.ImportDeclaration[];
  mainFn: t.Statement[];
  ctx: transformCtx;
  app: ((data: t.ObjectProperty[]) => void) & {
    prototype: { enable: t.ObjectProperty[] | null };
  };
}

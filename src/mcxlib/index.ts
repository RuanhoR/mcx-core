import {
  parse
} from "@babel/parser"
import McxLibModule from "./module.js";
import { FunctionDeclaration } from "@babel/types";
const _parse = (code: Function) => parse(code.toString()).program.body[0] as FunctionDeclaration
const index = {
  module: _parse(McxLibModule),
} as const;
export default index;
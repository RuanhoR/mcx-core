import AST from "./ast/index.js";
import compiler from "./compile-mcx/index.js";
import utils from "./utils.js"
import * as Compiler from "./compile-mcx/compiler"
export default {
  load: compiler,
  AST: AST,
  Compiler,
  utils: utils,
}

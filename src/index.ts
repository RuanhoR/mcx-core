import AST from "./ast/index.js";
import compiler, {
  plugin
} from "./compile-mcx/index.js";
import utils from "./utils.js"
import * as Compiler from "./compile-mcx/compiler"
import * as PUBTYPE from "./types.js";
import * as compile_component from "./mcx-component/index.js"
import {
  transform
} from "./transforms"
import * as TSC from "./tsc/index.js"

export {
  PUBTYPE,
  compiler as compile,
  AST,
  Compiler,
  utils,
  transform,
  compile_component,
  plugin,
  TSC
};
export { ItemComponent, BlockComponent, EntityComponent } from "./mcx-component/lib"
export * as ComponentType from "./mcx-component/types"
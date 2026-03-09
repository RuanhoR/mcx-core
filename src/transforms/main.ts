import { mcxType, ParsedTagNode, transformCtx, transformParseCtx } from "../types";
import * as t from "@babel/types";
import {
  generate
} from "@babel/generator";
import config from "./config";
import path from "node:path";
import { readFile } from "node:fs/promises";
import { compileMCXFn } from "../compile-mcx/compiler";
import { _enable, generateEventConfig, generateMain } from "./utils";
import { Comp } from "./x-comp/x-event";
import { compileComponent } from "../mcx-component";

export async function _transform(ctx: transformCtx): Promise<string> {
  const _temp_main = generateMain(ctx.compiledCode.JSIR);
  const mainFn = ctx.mainFn.body = _temp_main[0];
  const prop: t.ObjectProperty[] = [];
  const params: t.FunctionParameter[] = ctx.mainFn.param = [
    t.identifier(config.paramCtx)
  ]
  const parseCtx: transformParseCtx = {
    impBody: _temp_main[1],
    mainFn,
    prop,
    ctx: ctx
  }
  let type: mcxType = "app";

  // enable setup fn: use to generate setup
  const enableSetup = _enable()
  if (ctx.compiledCode.strLoc.Event.isLoad) {
    // handler event type mcx
    type = "event";
    // enable export setup
    enableSetup()
    Comp(parseCtx)
  }
  if (ctx.compiledCode.strLoc.UI) {
    /**
     * Completed UI handler
     * @todo - handler
     */
    type = "ui"; // ui mcx
    enableSetup();

  }
  if (Object.getOwnPropertyNames(ctx.compiledCode.strLoc.Component).length >= 1) {
    type = "component";
    await compileComponent(ctx.compiledCode, ctx.opt.ProjectDir)
    return `export default {type:'component',setup:null,app:{}}`;
  }
  if (type == "app") {
    // enable setup export
    enableSetup()
    // find event mcx import

  }
  // add default export: type
  prop.push(t.objectProperty(t.identifier("type"), t.stringLiteral(type)));
  if (enableSetup.prototype.enable) {
    prop.push(t.objectProperty(
      t.identifier("setup"),
      t.identifier(config.scriptCompileFn)
    ))
  }
  // generate code
  const code = generate(
    // create program
    (t.program([
      ...parseCtx.impBody,
      t.functionDeclaration(
        t.identifier(config.scriptCompileFn),
        params,
        t.blockStatement(mainFn),
        false,
        false
      ),
      t.exportDefaultDeclaration(t.objectExpression(prop)),
    ])),
  ).code;
  return code;
}
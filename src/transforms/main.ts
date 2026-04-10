import { mcxType, transformCtx, transformParseCtx } from "../types";
import * as t from "@babel/types";
import {
  generate
} from "@babel/generator";
import config from "./config";
import { _enable, _enableWithData, generateMain } from "./utils";
import { EventComp, UIComp, AppComp } from "./x-comp";
import { compileComponent } from "../mcx-component";
export async function _transform(ctx: transformCtx): Promise<string> {
  const _temp_main = generateMain(ctx.compiledCode.JSIR);
  const mainFn = ctx.mainFn.body = _temp_main[0];
  const prop: t.ObjectProperty[] = [];
  const app = _enableWithData<t.ObjectProperty[]>();
  const params: t.FunctionParameter[] = ctx.mainFn.param = [
    t.identifier(config.paramCtx)
  ]
  const parseCtx: transformParseCtx = {
    impBody: _temp_main[1],
    mainFn,
    prop,
    ctx: ctx,
    app
  }
  let type: mcxType = "app";

  // enable setup fn: use to generate setup
  const enableSetup = _enable()
  if (ctx.compiledCode.strLoc.Event.isLoad) {
    // handler event type mcx
    type = "event";
    // enable export setup
    enableSetup()
    await EventComp(parseCtx)
  }
  if (ctx.compiledCode.strLoc.UI) {
    type = "ui"; // ui mcx
    enableSetup();
    await UIComp(parseCtx)
  }
  if (Object.getOwnPropertyNames(ctx.compiledCode.strLoc.Component).length >= 1) {
    type = "component";
    await compileComponent(ctx.compiledCode, ctx)
    return `export default {type:'component',setup:null,app:{}}`;
  }
  if (type == "app") {
    // enable setup export
    enableSetup()
    // find event mcx import
    await AppComp(parseCtx)
  }
  // add default export: type
  prop.push(t.objectProperty(t.identifier("type"), t.stringLiteral(type)));
  if (enableSetup.prototype.enable) {
    prop.push(t.objectProperty(
      t.identifier("setup"),
      t.identifier(config.scriptCompileFn)
    ))
  }
  if (app.prototype.enable) {
    prop.push(t.objectProperty(t.identifier("app"), t.objectExpression(app.prototype.enable)))
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
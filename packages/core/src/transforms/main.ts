import { mcxType, transformCtx, transformParseCtx } from '../types';
import * as t from '@babel/types';
import { generate } from '@babel/generator';
import config from './config';
import {
  _enable,
  _enableWithData,
  generateMain,
  processDefineProp,
  collectSetupDeclarations,
  processHooks,
  extractIdList,
} from './utils';
import { EventComp, UIComp, FormComp, AppComp } from './transform';
import { compileComponent } from '../mcx-component';

export async function _transform(ctx: transformCtx): Promise<string> {
  // Determine setup mode from tag attributes before generateMain
  const formTag = ctx.compiledCode.strLoc.Form;
  const uiTag = ctx.compiledCode.strLoc.UI;
  const isSetupMode =
    (formTag && formTag.arr.setup !== undefined) ||
    (uiTag && uiTag.arr.setup !== undefined);

  // Determine mode type for defineProp (form vs ui)
  const modeType: 'form' | 'ui' | null =
    formTag && formTag.arr.setup !== undefined
      ? 'form'
      : uiTag && uiTag.arr.setup !== undefined
        ? 'ui'
        : null;

  const _temp_main = generateMain(ctx.compiledCode.JSIR);
  const mainFn = (ctx.mainFn.body = _temp_main[0]);
  const prop: t.ObjectProperty[] = [];
  const app = _enableWithData<t.ObjectProperty[]>();
  const params: t.FunctionParameter[] = (ctx.mainFn.param = [
    t.identifier(config.paramCtx),
  ]);
  const parseCtx: transformParseCtx = {
    impBody: _temp_main[1],
    mainFn,
    prop,
    ctx: ctx,
    app,
  };
  let type: mcxType = 'app';

  // Process defineProp for setup mode before component handlers
  if (isSetupMode && modeType) {
    processDefineProp(ctx.compiledCode.JSIR, modeType, parseCtx.impBody);
  }

  // enable setup fn: use to generate setup
  const enableSetup = _enable();
  if (ctx.compiledCode.strLoc.Event.isLoad) {
    // handler event type mcx
    type = 'event';
    // enable export setup
    enableSetup();
    await EventComp(parseCtx);
  }
  if (ctx.compiledCode.strLoc.Form) {
    type = 'form';
    enableSetup();
    await FormComp(parseCtx);
  }
  if (ctx.compiledCode.strLoc.UI) {
    type = 'ui';
    enableSetup();
    await UIComp(parseCtx);
  }
  if (
    Object.getOwnPropertyNames(ctx.compiledCode.strLoc.Component).length >= 1
  ) {
    type = 'component';
    await compileComponent(ctx.compiledCode, ctx);
    return `export default {type:'component',setup:null,app:{}}`;
  }
  if (type == 'app') {
    // enable setup export
    enableSetup();
    // find event mcx import
    await AppComp(parseCtx);
  }

  // In setup mode, collect all non-exported declarations into the main function's return
  if (isSetupMode) {
    const existingExportNames = new Set<string>();
    for (const exp of ctx.compiledCode.JSIR.BuildCache.export) {
      if (t.isExportNamedDeclaration(exp) && exp.declaration) {
        const ids = extractIdList(exp.declaration);
        for (const id of ids) existingExportNames.add(id);
      }
    }
    for (const p of parseCtx.prop) {
      if (t.isObjectProperty(p) && t.isIdentifier(p.key)) {
        existingExportNames.add(p.key.name);
      }
    }
    const setupDecls = collectSetupDeclarations(
      ctx.compiledCode.JSIR,
      existingExportNames,
    );

    // Process hooks (onStartup / onMounted)
    const hooks = processHooks(ctx.compiledCode.JSIR);

    const returnStmt = mainFn[mainFn.length - 1];
    if (
      t.isReturnStatement(returnStmt) &&
      t.isObjectExpression(returnStmt.argument)
    ) {
      returnStmt.argument.properties.push(...setupDecls);
      if (hooks.startup) {
        returnStmt.argument.properties.push(
          t.objectProperty(t.identifier('__mcx_startup'), hooks.startup),
        );
      }
      if (hooks.mounted) {
        returnStmt.argument.properties.push(
          t.objectProperty(t.identifier('__mcx_mounted'), hooks.mounted),
        );
      }
    }
  }

  // add default export: type
  prop.push(t.objectProperty(t.identifier('type'), t.stringLiteral(type)));
  if (enableSetup.prototype.enable) {
    prop.push(
      t.objectProperty(
        t.identifier('setup'),
        t.identifier(config.scriptCompileFn),
      ),
    );
  }
  if (app.prototype.enable) {
    prop.push(
      t.objectProperty(
        t.identifier('app'),
        t.objectExpression(app.prototype.enable),
      ),
    );
  }
  // generate code
  const code = generate(
    // create program
    t.program([
      ...parseCtx.impBody,
      t.functionDeclaration(
        t.identifier(config.scriptCompileFn),
        params,
        t.blockStatement(mainFn),
        false,
        false,
      ),
      t.exportDefaultDeclaration(t.objectExpression(prop)),
    ]),
  ).code;
  return code;
}

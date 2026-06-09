import * as t from '@babel/types';
import {
  _MCXstructureLocComponentTypes,
  ImportList,
  ImportListImport,
  MCXstructureLoc,
  MCXstructureLocComponentType,
} from '../types';
import * as CompileData from './compileData';
import Utils from './utils';
import { parse } from '@babel/parser';
import { ParsedTagContentNode, ParsedTagNode } from '../../types';
import McxAst, { MCXUtils } from '../../ast/tag';
import PropParser from '../../ast/prop';
import ts from 'typescript';
export class CompileError extends Error {
  public loc: { line: number; column: number };
  constructor(message: string, loc: { line: number; column: number }) {
    super(message);
    this.name = 'CompileError';
    this.loc = loc || { line: -1, column: -1 };
  }
}

function extractLoc(node: any): { line: number; column: number } {
  if (!node) return { line: -1, column: -1 };
  // Node with loc.start (Babel or MCX): prefer column
  if (node.loc && node.loc.start) {
    const line =
      typeof node.loc.start.line === 'number' ? node.loc.start.line : -1;
    const column =
      typeof node.loc.start.column === 'number' ? node.loc.start.column : -1;
    return { line, column };
  } else if (node.loc && node.loc.column !== undefined) {
    return {
      line: node.loc.line ?? -1,
      column: node.loc.column,
    };
  }
  // MCX Token with unified position: start: { line, column }
  if (node.start && typeof node.start.line === 'number') {
    return { line: node.start.line, column: node.start.column ?? -1 };
  }
  return { line: -1, column: -1 };
}

function makeError(msg: string, node?: any) {
  return new CompileError(msg, extractLoc(node));
}
interface ImportTemp {
  source: string;
  import?: string | undefined;
  isAll: boolean;
}
export type Context = Record<string, t.Expression | { status: 'wait' }>;
export class CompileJS {
  constructor(public node: t.Program) {
    if (!t.isProgram(node))
      throw makeError(
        "[compile error]: jsCompile can't work in a not program",
        node,
      );
    this.CompileData = new CompileData.JsCompileData(node);
    this.run();
    this.writeBuildCache();
  }
  public TopContext: Context = {};
  private indexTemp: Record<string, ImportTemp> = {};
  private push(source: ImportList) {
    for (const node of source.imported) {
      this.indexTemp[node.as] = {
        source: source.source,
        import: node.import,
        isAll: node.isAll,
      };
    }
  }
  private writeBuildCache() {
    const build: ImportList[] = [];
    for (const [as, data] of Object.entries(this.indexTemp)) {
      let found = false;
      for (const i of build) {
        if (i.source === data.source) {
          i.imported.push({ as, isAll: data.isAll, import: data.import });
          found = true;
          break;
        }
      }
      if (!found) {
        build.push({
          source: data.source,
          imported: [{ as, import: data.import, isAll: data.isAll }],
        });
      }
    }
    this.CompileData.BuildCache.import = build;
  }
  private CompileData: CompileData.JsCompileData;
  public getCompileData(): CompileData.JsCompileData {
    return this.CompileData;
  }

  private tre(node: t.Block, ExtendContext: Context = {}): void {
    if (!t.isBlock(node))
      throw makeError("[compile error]: can't for in not block node", node);
    const isTop: boolean = t.isProgram(node);
    const currenyContext: Context = isTop ? this.TopContext : ExtendContext;
    for (let index = 0; index < node.body.length; index++) {
      const item = node.body[index];
      const remove = () => {
        node.body.splice(index, 1);
        index--;
      };
      if (!item) continue;
      if (item.type == 'ImportDeclaration') {
        if (!isTop)
          throw makeError(
            '[compile node]: import declaration must use in top.',
            item,
          );
        this.push(Utils.ImportToCache(item));
        remove();
      } else if (item.type == 'BlockStatement') {
        this.tre(item, currenyContext);
      } else if (
        item.type == 'BreakStatement' ||
        item.type == 'EmptyStatement' ||
        item.type == 'ContinueStatement' ||
        item.type == 'ThrowStatement' ||
        item.type == 'WithStatement'
      ) {
        continue;
      } else if (item.type == 'TryStatement') {
        this.tre(item.block, currenyContext);
      } else if (item.type == 'IfStatement') {
        const nodes: t.Statement[] = [item.consequent];
        if (item.alternate) nodes.push(item.alternate);
        this.tre(t.blockStatement(nodes), currenyContext);
      } else if (item.type == 'WhileStatement') {
        this.tre(t.blockStatement([item.body]), currenyContext);
      } else if (item.type == 'ClassDeclaration') {
        if (item.superClass) {
          const superClass = item.superClass;
          if (
            superClass.type == 'ArrayExpression' ||
            superClass.type == 'BooleanLiteral' ||
            superClass.type == 'BinaryExpression' ||
            superClass.type == 'ThisExpression' ||
            superClass.type == 'ArrowFunctionExpression' ||
            superClass.type == 'BigIntLiteral' ||
            superClass.type == 'NumericLiteral' ||
            superClass.type == 'NullLiteral' ||
            superClass.type == 'AssignmentExpression' ||
            superClass.type == 'Super' ||
            superClass.type == 'NewExpression' ||
            superClass.type == 'DoExpression' ||
            superClass.type == 'StringLiteral' ||
            superClass.type == 'YieldExpression' ||
            superClass.type == 'RecordExpression' ||
            superClass.type == 'RegExpLiteral' ||
            superClass.type == 'DecimalLiteral' ||
            superClass.type == 'BindExpression'
          )
            throw makeError(
              "[compilr error]: class can't extends a not constructor or null",
              superClass,
            );
        }
      } else if (item.type == 'DoWhileStatement') {
        this.tre(t.blockStatement([item.body]));
      } else if (item.type == 'VariableDeclaration') {
        const declaration = item.declarations;
        for (const varDef of declaration) {
          const init = varDef.init;
          const id = varDef.id;
          if (id.type == 'Identifier') {
            if (!init && (item.kind == 'let' || item.kind == 'var'))
              currenyContext[id.name] = {
                status: 'wait',
              };
            if (!init)
              throw makeError(
                "[compilr node]: 'const' must has a init",
                varDef,
              );
            currenyContext[id.name] = init;
            if (
              init &&
              t.isCallExpression(init) &&
              t.isIdentifier(init.callee) &&
              init.callee.name === 'require' &&
              init.arguments.length > 0 &&
              t.isStringLiteral(init.arguments[0])
            ) {
              this.indexTemp[id.name] = {
                source: (init.arguments[0] as t.StringLiteral).value,
                import: 'default',
                isAll: false,
              };
            } else if (
              init &&
              t.isCallExpression(init) &&
              t.isImport(init.callee) &&
              init.arguments.length > 0 &&
              t.isStringLiteral(init.arguments[0])
            ) {
              this.indexTemp[id.name] = {
                source: (init.arguments[0] as t.StringLiteral).value,
                import: 'default',
                isAll: false,
              };
            }
          }
        }
      } else if (item.type == 'ReturnStatement') {
        continue;
      } else if (
        item.type == 'ExportAllDeclaration' ||
        item.type == 'ExportDefaultDeclaration' ||
        item.type == 'ExportNamedDeclaration'
      ) {
        if (!isTop) {
          throw makeError("[compiler]: export node can't in not top", item);
        }
        this.CompileData.BuildCache.export.push(item);
        remove();
      } else if (item.type == 'SwitchStatement') {
        for (const caseItem of item.cases) {
          this.tre(t.blockStatement(caseItem.consequent), currenyContext);
        }
      } else if (item.type == 'ExpressionStatement') {
        const expr = item.expression;
        if (
          t.isCallExpression(expr) &&
          t.isIdentifier(expr.callee) &&
          expr.callee.name === 'require' &&
          expr.arguments.length > 0 &&
          t.isStringLiteral(expr.arguments[0])
        ) {
          this.indexTemp[
            `__require_${(expr.arguments[0] as t.StringLiteral).value}`
          ] = {
            source: (expr.arguments[0] as t.StringLiteral).value,
            import: 'default',
            isAll: false,
          };
        } else if (
          t.isCallExpression(expr) &&
          t.isImport(expr.callee) &&
          expr.arguments.length > 0 &&
          t.isStringLiteral(expr.arguments[0])
        ) {
          this.indexTemp[
            `__import_${(expr.arguments[0] as t.StringLiteral).value}`
          ] = {
            source: (expr.arguments[0] as t.StringLiteral).value,
            import: 'default',
            isAll: false,
          };
        }
      } else if (item.type == 'FunctionDeclaration') {
        const funcBody = item.body;
        this.tre(funcBody, currenyContext);
      }
    }
  }
  run() {
    if (!t.isBlock(this.node))
      throw makeError("[compile error]: can't for a not block", this.node);
    this.tre(this.node);
  }
}
class CompileMCX {
  constructor(public code: string) {
    const mcxCode = new McxAst(code).parseAST();
    if (!MCXUtils.isParseNode(mcxCode))
      throw makeError(
        "[compile error]: mcxCompile can't work in a not mcxNode",
      );
    this.mcxCode = mcxCode;
    this.structureCheck();
    const JSIR = this.generateJSIR();
    this.CompileData = new CompileData.MCXCompileData(
      mcxCode,
      JSIR,
      this.tempLoc,
    );
  }
  private mcxCode: ParsedTagNode[];
  private tempLoc: MCXstructureLoc = {
    script: '',
    Event: {
      on: 'after',
      subscribe: {},
      loc: { line: -1, column: -1 },
      isLoad: false,
    },
    Component: {},
    UI: null,
  };
  public getCompileData(): CompileData.MCXCompileData {
    return this.CompileData;
  }
  private checkComponentName(
    name: string,
  ): name is MCXstructureLocComponentType {
    return Object.values(_MCXstructureLocComponentTypes).includes(name as any);
  }
  private checkComponentParentName(
    name: string,
  ): name is keyof typeof _MCXstructureLocComponentTypes {
    return Object.keys(_MCXstructureLocComponentTypes).includes(name);
  }
  private commonTagNodeContent(
    node: ParsedTagNode | ParsedTagContentNode,
  ): string {
    if (MCXUtils.isTagContentNode(node)) {
      return node.data;
    }
    if (MCXUtils.isTagNode(node)) {
      return node.content
        .map(sub =>
          sub.type !== 'Comment' ? this.commonTagNodeContent(sub) : '',
        )
        .join('');
    }
    throw makeError('[mcx compile]: internal error: unknown node type', node);
  }
  private getEventOn(node: ParsedTagNode): 'before' | 'after' {
    if (!MCXUtils.isTagNode(node))
      throw makeError('[mcx compile]: internal error: not tag node', node);
    let on: 'before' | 'after' = 'after';
    const isAfter = typeof node.arr['@after'] == 'string';
    const isBefore = typeof node.arr['@before'] == 'string';
    if (isAfter && isBefore)
      throw makeError(
        "[mcx compile]: Event node can't has both @after and @before",
        node,
      );
    if (isAfter) on = 'after';
    if (isBefore) on = 'before';
    return on;
  }
  private structureCheck() {
    let component: ParsedTagNode | null = null;
    const temp: {
      script: string;
      ui: ParsedTagNode | null;
      Event: ParsedTagNode | null;
      Component: Record<MCXstructureLocComponentType, ParsedTagNode>;
    } = {
      script: '',
      Event: null,
      ui: null,
      Component: {} as Record<MCXstructureLocComponentType, ParsedTagNode>,
    };
    for (const node of this.mcxCode || []) {
      if (!MCXUtils.isTagNode(node)) continue;
      if (node.name == 'script') {
        if (temp.script)
          throw makeError('[compile error]: duplicate script node', node);
        const scriptNode =
          node.content.length == 0 ? '' : this.commonTagNodeContent(node);
        let code = scriptNode;
        if (node.arr.lang == 'ts') {
          code = ts.transpileModule(scriptNode, {
            compilerOptions: {
              target: ts.ScriptTarget.ES2024,
              module: ts.ModuleKind.ESNext,
            },
          }).outputText;
        }
        temp.script = code;
      } else if (node.name == 'Event') {
        if (temp.Event)
          throw makeError('[compile error]: duplicate Event node', node);
        // if Component already discovered, report error
        if (component)
          throw makeError(
            '[compile error]: Event node cannot appear after Component',
            node,
          );
        temp.Event = node;
      } else if (node.name == 'Component') {
        if (component)
          throw makeError('[compile error]: duplicate Component node', node);
        // if Event already discovered, report error
        if (temp.Event)
          throw makeError(
            '[compile error]: Component node cannot appear after Event',
            node,
          );
        if (temp.ui)
          throw makeError(
            "[compile error]: Component node can't use with UI node",
          );
        component = node;
      } else if (node.name == 'Ui') {
        if (component || temp.Event || temp.ui)
          throw makeError(
            "[compile error]: UI node can't use with component or event or other ui node",
            node,
          );
        temp.ui = node;
      }
    }
    if (!temp.script) throw makeError('[compile error]: mcx must has a script');
    this.tempLoc.script = temp.script;
    if (temp.Event) {
      const on = this.getEventOn(temp.Event);
      const content = temp.Event.content;
      if (
        content.length == 0 ||
        content.length > 1 ||
        !MCXUtils.isTagContentNode(content[0])
      )
        throw makeError(
          '[compile error]: Event node has invalid content',
          temp.Event,
        );
      const subscribeData = content[0].data.trim();
      this.tempLoc.Event = {
        on: on,
        subscribe: Object.fromEntries(
          PropParser(subscribeData).map(item => [
            item.key,
            item.value.toString(),
          ]),
        ),
        loc: extractLoc(temp.Event),
        isLoad: true,
      };
    }
    if (component) {
      for (const subNode of component.content || []) {
        if (!MCXUtils.isTagNode(subNode)) continue;
        const subName = subNode.name;
        // if is a valid component name
        this.handlerChildComponent(subNode);
      }
    }
    if (temp.ui) {
      this.tempLoc.UI = temp.ui;
    }
  }
  // input: tag node，handler child node（如 items entities）
  private handlerChildComponent(node: ParsedTagNode): void {
    const name = node.name;
    if (!this.checkComponentParentName(name))
      throw makeError(`[compile error]: invalid component name: ${name}`, node);
    const content = node.content;
    if (!content || content.length == 0)
      throw makeError(
        `[compile error]: component ${name} has no content`,
        node,
      );
    for (const subNode of content) {
      if (!MCXUtils.isTagNode(subNode)) continue;
      const subName = subNode.name;
      const _id = subNode.arr.id;
      if (!_id || typeof _id != 'string' || _id.trim() == '') {
        throw makeError(
          `[compile error]: component ${name} child component ${subName} has no id`,
          subNode,
        );
      }
      const id = _id.trim();
      const content = subNode.content;
      if (content.length == 0) {
        throw makeError(
          `[compile error]: component ${name} child component ${subName} has no content`,
          subNode,
        );
      }
      if (!content[0] || !MCXUtils.isTagContentNode(content[0]))
        throw makeError(
          `[compile error]: component ${name} child component ${subName} has invalid content`,
          subNode,
        );
      const useExpore = content[0].data.trim();
      if (subName == _MCXstructureLocComponentTypes[name]) {
        this.tempLoc.Component[`${name}/${id}`] = {
          type: subName,
          useExpore: useExpore,
          loc: extractLoc(subNode),
        };
      }
    }
  }
  private CompileData: CompileData.MCXCompileData;
  private generateJSIR(): CompileData.JsCompileData {
    if (!this.tempLoc.script.trim())
      throw makeError('[compile error]: mcx must has a script');
    const comiler = compileJSFn(this.tempLoc.script);
    return comiler;
  }
}
export const compileJSFn = ((code: string): CompileData.JsCompileData => {
  if (compileJSFn.cache[code]) return compileJSFn.cache[code];
  let parsedCode: t.File;
  try {
    parsedCode = parse(code, {
      sourceType: 'module',
      allowImportExportEverywhere: true,
      errorRecovery: true,
      allowAwaitOutsideFunction: true,
      allowReturnOutsideFunction: true,
      allowSuperOutsideMethod: true,
    });
  } catch (err: unknown) {
    if (err instanceof SyntaxError) {
      const babelErr = err as SyntaxError & {
        loc?: { column: number; line: number };
      };
      const loc = babelErr.loc ?? { column: -1, line: -1 };
      throw makeError(`[babel parse error]: ${err.message}`, {
        loc: { start: loc },
      });
    }
    throw makeError(`[parse error]: ${String(err)}`);
  }
  const comiler = new CompileJS(parsedCode.program);
  comiler.run();
  const data = comiler.getCompileData();
  compileJSFn.cache[code] = data;
  return data;
}) as ((code: string) => CompileData.JsCompileData) & {
  cache: Record<string, CompileData.JsCompileData>;
};
export const compileMCXFn = ((mcxCode: string): CompileData.MCXCompileData => {
  if (compileMCXFn.cache[mcxCode]) return compileMCXFn.cache[mcxCode];
  const compiler = new CompileMCX(mcxCode);
  const data = compiler.getCompileData();
  compileMCXFn.cache[mcxCode] = data;
  return data;
}) as ((mcxCode: string) => CompileData.MCXCompileData) & {
  cache: Record<string, CompileData.MCXCompileData>;
};
compileJSFn.cache = {};
compileMCXFn.cache = {};
export * from './compileData';
export { Utils as MCXNodeUtils };

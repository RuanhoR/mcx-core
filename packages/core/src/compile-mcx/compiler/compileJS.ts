import * as t from '@babel/types';
import { ImportList } from '../types';
import * as CompileData from './compileData';
import Utils from './utils';
import { parse } from '@babel/parser';

export class CompileError extends Error {
  public loc: { line: number; column: number };
  constructor(message: string, loc: { line: number; column: number }) {
    super(message);
    this.name = 'CompileError';
    this.loc = loc || { line: -1, column: -1 };
  }
}

export function extractLoc(node: unknown): { line: number; column: number } {
  if (!node || typeof node !== 'object') return { line: -1, column: -1 };
  const n = node as Record<string, unknown>;
  const loc = n.loc as Record<string, unknown> | undefined;
  if (loc?.start) {
    const start = loc.start as Record<string, unknown>;
    const line = typeof start.line === 'number' ? start.line : -1;
    const column = typeof start.column === 'number' ? start.column : -1;
    return { line, column };
  } else if (loc && loc.column !== undefined) {
    return {
      line: typeof loc.line === 'number' ? loc.line : -1,
      column: loc.column as number,
    };
  }
  const start = n.start as Record<string, unknown> | undefined;
  if (start && typeof start.line === 'number') {
    return {
      line: start.line,
      column: typeof start.column === 'number' ? (start.column as number) : -1,
    };
  }
  return { line: -1, column: -1 };
}

export function makeError(msg: string, node?: unknown) {
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
    const sourceMap = new Map<string, ImportList>();
    for (const [as, data] of Object.entries(this.indexTemp)) {
      let entry = sourceMap.get(data.source);
      if (!entry) {
        entry = { source: data.source, imported: [] };
        sourceMap.set(data.source, entry);
      }
      entry.imported.push({ as, isAll: data.isAll, import: data.import });
    }
    this.CompileData.BuildCache.import = [...sourceMap.values()];
  }
  private CompileData: CompileData.JsCompileData;
  public getCompileData(): CompileData.JsCompileData {
    return this.CompileData;
  }

  private traverse(node: t.Block, ExtendContext: Context = {}): void {
    if (!t.isBlock(node))
      throw makeError("[compile error]: can't for in not block node", node);
    const isTop: boolean = t.isProgram(node);
    const currentContext: Context = isTop ? this.TopContext : ExtendContext;
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
        this.traverse(item, currentContext);
      } else if (
        item.type == 'BreakStatement' ||
        item.type == 'EmptyStatement' ||
        item.type == 'ContinueStatement' ||
        item.type == 'ThrowStatement' ||
        item.type == 'WithStatement'
      ) {
        continue;
      } else if (item.type == 'TryStatement') {
        this.traverse(item.block, currentContext);
      } else if (item.type == 'IfStatement') {
        const nodes: t.Statement[] = [item.consequent];
        if (item.alternate) nodes.push(item.alternate);
        this.traverse(t.blockStatement(nodes), currentContext);
      } else if (item.type == 'WhileStatement') {
        this.traverse(t.blockStatement([item.body]), currentContext);
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
        this.traverse(t.blockStatement([item.body]), currentContext);
      } else if (item.type == 'VariableDeclaration') {
        const declaration = item.declarations;
        for (const varDef of declaration) {
          const init = varDef.init;
          const id = varDef.id;
          if (id.type == 'Identifier') {
            if (!init) {
              if (item.kind == 'const')
                throw makeError(
                  "[compilr node]: 'const' must has a init",
                  varDef,
                );
              currentContext[id.name] = {
                status: 'wait',
              };
              continue;
            }
            currentContext[id.name] = init;
            if (
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
          this.traverse(t.blockStatement(caseItem.consequent), currentContext);
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
        this.traverse(funcBody, currentContext);
      }
    }
  }
  run() {
    if (!t.isBlock(this.node))
      throw makeError("[compile error]: can't for a not block", this.node);
    this.traverse(this.node);
  }
}

export const compileJSFn = ((code: string): CompileData.JsCompileData => {
  const cached = compileJSFn.cache.get(code);
  if (cached) return cached;
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
  const data = comiler.getCompileData();
  compileJSFn.cache.set(code, data);
  return data;
}) as ((code: string) => CompileData.JsCompileData) & {
  cache: Map<string, CompileData.JsCompileData>;
};
compileJSFn.cache = new Map();

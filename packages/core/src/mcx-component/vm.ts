import * as Module from 'node:module'
import * as vm from 'node:vm'
import { Buffer } from 'node:buffer'
import * as t from '@babel/types'
import { parse } from '@babel/parser'
import { compileJSFn } from '../compile-mcx/compiler'
import * as generator from '@babel/generator'
import { ImportList } from '../compile-mcx/types'
import { generateFileId } from '../transforms/file_id'
export enum execESMMethod {
  transformCjs = 0,
  runInVm = 1,
  importESM = 2,
}

/**
 * 将 ESM 模块转换为 CJS 格式
 */
function transformESMToCJS(
  code: string,
  pluginContext?: Record<string, string | null | boolean | number>,
  hook?: (
    data: t.CallExpression | t.MemberExpression,
    setData?: (newData: t.Expression) => void,
  ) => void,
): string {
  const compileData = compileJSFn(code)
  const body = compileData.node.body
  const defines: t.VariableDeclarator[] = []
  // 添加 import 转换
  const importDefines = transformImportIRtoRequire(
    compileData.BuildCache.import,
  )
  for (const importDefine of importDefines) {
    const data = importDefine.init as t.CallExpression | t.MemberExpression
    if (hook) {
      hook(data, newData => {
        importDefine.init = newData
      })
    }
    defines.push(importDefine)
  }
  // 注入 plugin context
  if (pluginContext) {
    defines.push(
      ...Object.entries(pluginContext).map(
        ([key, value]): t.VariableDeclarator =>
          t.variableDeclarator(
            t.identifier(key),
            typeof value == 'string'
              ? t.stringLiteral(value)
              : typeof value == 'boolean'
                ? t.booleanLiteral(value)
                : typeof value == 'number'
                  ? t.numericLiteral(value)
                  : t.nullLiteral(),
          ),
      ),
    )
  }

  const exportsArr = compileData.BuildCache.export
    .map(i => {
      if (t.isExportAllDeclaration(i)) {
        const fileId = generateFileId()
        defines.push(
          t.variableDeclarator(
            t.identifier(fileId),
            t.callExpression(t.identifier('require'), [i.source]),
          ),
        )
        return t.assignmentExpression(
          '=',
          t.memberExpression(t.identifier('module'), t.identifier('exports')),
          t.objectExpression([
            t.spreadElement(t.identifier(fileId)),
            t.spreadElement(
              t.memberExpression(
                t.identifier('module'),
                t.identifier('exports'),
              ),
            ),
          ]),
        )
      } else if (t.isExportDefaultDeclaration(i)) {
        if (!i.declaration || t.isTSDeclareFunction(i.declaration))
          return void 0
        if (t.isExpression(i.declaration)) {
          return t.assignmentExpression(
            '=',
            t.memberExpression(
              t.identifier('exports'),
              t.identifier('default'),
            ),
            i.declaration,
          )
        }
        if (!i.declaration.id) i.declaration.id = t.identifier(generateFileId())
        body.push(i.declaration)
        return t.assignmentExpression(
          '=',
          t.memberExpression(t.identifier('exports'), t.identifier('default')),
          i.declaration.id,
        )
      } else if (t.isExportNamedDeclaration(i)) {
        if (i.source && i.specifiers.length >= 1) {
          const id = t.identifier(generateFileId())
          defines.push(
            t.variableDeclarator(
              id,
              t.callExpression(t.identifier('require'), [i.source]),
            ),
          )
          const exportExprs = i.specifiers
            .map(specifier => {
              if (t.isExportNamespaceSpecifier(specifier)) {
                const exportedName = t.isIdentifier(specifier.exported)
                  ? specifier.exported.name
                  : (specifier.exported as any).value
                return t.assignmentExpression(
                  '=',
                  t.memberExpression(
                    t.identifier('exports'),
                    t.identifier(exportedName),
                  ),
                  id,
                )
              } else if (t.isExportSpecifier(specifier)) {
                const exportedName = t.isIdentifier(specifier.exported)
                  ? specifier.exported.name
                  : (specifier.exported as any).value
                return t.assignmentExpression(
                  '=',
                  t.memberExpression(
                    t.identifier('exports'),
                    t.identifier(exportedName),
                  ),
                  t.memberExpression(id, t.identifier(specifier.local.name)),
                )
              }
              return null
            })
            .filter(Boolean) as t.AssignmentExpression[]
          return exportExprs.length === 1
            ? exportExprs[0]
            : t.sequenceExpression(exportExprs)
        } else {
          if (i.declaration) {
            if (
              t.isFunctionDeclaration(i.declaration) ||
              t.isVariableDeclaration(i.declaration)
            ) {
              if (t.isVariableDeclaration(i.declaration)) {
                body.push(i.declaration)
                const assignExprs = i.declaration.declarations.map(decl => {
                  const varName = (decl.id as t.Identifier).name
                  return t.assignmentExpression(
                    '=',
                    t.memberExpression(
                      t.identifier('exports'),
                      t.identifier(varName),
                    ),
                    t.identifier(varName),
                  )
                })
                return assignExprs.length === 1
                  ? assignExprs[0]
                  : t.sequenceExpression(assignExprs)
              } else {
                const functionId =
                  i.declaration.id || t.identifier(generateFileId())
                const funcDecl = t.functionDeclaration(
                  functionId,
                  i.declaration.params,
                  i.declaration.body,
                  i.declaration.generator,
                  i.declaration.async,
                )
                body.push(funcDecl)
                return t.assignmentExpression(
                  '=',
                  t.memberExpression(
                    t.identifier('exports'),
                    t.identifier((functionId as t.Identifier).name),
                  ),
                  functionId,
                )
              }
            }
          } else {
            // Handle export { item } - simple variable export
            if (i.specifiers.length >= 1) {
              const exportExprs = i.specifiers
                .map(specifier => {
                  if (t.isExportSpecifier(specifier)) {
                    const exportedName = t.isIdentifier(specifier.exported)
                      ? specifier.exported.name
                      : (specifier.exported as any).value
                    return t.assignmentExpression(
                      '=',
                      t.memberExpression(
                        t.identifier('exports'),
                        t.identifier(exportedName),
                      ),
                      t.identifier(specifier.local.name),
                    )
                  }
                  return null
                })
                .filter(Boolean) as t.AssignmentExpression[]
              return exportExprs.length === 1
                ? exportExprs[0]
                : t.sequenceExpression(exportExprs)
            }
          }
        }
        return null
      }
    })
    .filter(Boolean) as t.AssignmentExpression[]

  body.unshift(t.variableDeclaration('var', defines))
  body.push(...exportsArr.map(i => t.expressionStatement(i)))

  return generator.generate(t.program(body)).code
}

/**
 * 将 import IR 转换为 require 声明
 */
function transformImportIRtoRequire(
  importIR: ImportList[],
): t.VariableDeclarator[] {
  const define: t.VariableDeclarator[] = [
    t.variableDeclarator(
      t.identifier('__import_default'),
      t.functionExpression(
        null,
        [t.identifier('obj')],
        t.blockStatement([
          t.returnStatement(
            t.conditionalExpression(
              t.memberExpression(
                t.identifier('obj'),
                t.identifier('__esModule'),
              ),
              t.memberExpression(t.identifier('obj'), t.identifier('default')),
              t.identifier('obj'),
            ),
          ),
        ]),
      ),
    ),
  ]

  for (const data of importIR) {
    for (const imported of data.imported) {
      let vl: t.CallExpression | t.MemberExpression
      if (!imported.isAll && imported.import) {
        if (imported.import == 'default') {
          vl = t.callExpression(t.identifier('__import_default'), [
            t.callExpression(t.identifier('require'), [
              t.stringLiteral(data.source),
            ]),
          ])
        } else {
          vl = t.memberExpression(
            t.callExpression(t.identifier('require'), [
              t.stringLiteral(data.source),
            ]),
            t.identifier(imported.import),
          )
        }
      } else {
        vl = t.callExpression(t.identifier('require'), [
          t.stringLiteral(data.source),
        ])
      }
      define.push(t.variableDeclarator(t.identifier(imported.as), vl))
    }
  }
  return define
}
export class RunScript {
  private _module
  private _context
  private _pluginContext
  constructor(
    public filePath: string = '<repl>',
    public module: 'esm' | 'cjs' = 'cjs',
    private pluginContext?: Record<string, string | null | boolean | number>,
  ) {
    this._module = new Module.Module(this.filePath)
    this._pluginContext = pluginContext || {}
    this._context = this.getContext(this._pluginContext)
  }
  /**
   * run code in nodejs vm
   * @param code {string} exetuce code
   * @returns code exports
   */
  public async run(
    code: string,
    esmExecMethod: execESMMethod = execESMMethod.transformCjs,
    transformCjsHook?: (
      data: t.CallExpression | t.MemberExpression,
      setData?: (newData: t.Expression) => void,
    ) => void,
  ): Promise<unknown> {
    if (this.module === 'esm') {
      if (esmExecMethod == execESMMethod.importESM) {
        let processedCode = code

        if (this.pluginContext) {
          const ast = parse(code, {
            sourceType: 'module',
            plugins: ['typescript', 'jsx'],
          })
          const contextDefines = Object.entries(this.pluginContext).map(
            ([key, value]): t.VariableDeclarator =>
              t.variableDeclarator(
                t.identifier(key),
                typeof value == 'string'
                  ? t.stringLiteral(value)
                  : typeof value == 'boolean'
                    ? t.booleanLiteral(value)
                    : typeof value == 'number'
                      ? t.numericLiteral(value)
                      : t.nullLiteral(),
              ),
          )
          const contextDeclaration = t.variableDeclaration(
            'var',
            contextDefines,
          )
          ast.program.body.unshift(contextDeclaration)
          processedCode = generator.generate(ast).code
        }
        const dataUrl = `data:application/javascript;base64,${Buffer.from(processedCode).toString('base64')}`
        return await import(dataUrl)
      } else if (esmExecMethod == execESMMethod.transformCjs) {
        const compiledCode = transformESMToCJS(
          code,
          this.pluginContext,
          transformCjsHook,
        )
        const script = new vm.Script(compiledCode, { filename: this.filePath })
        const rel = script.runInContext(this._context)
        return this._context.exports || rel
      } else if (esmExecMethod == execESMMethod.runInVm) {
        if (typeof vm.SourceTextModule !== 'function') {
          throw new Error('[exec esm]: not support vm.SourceTextModule')
        } else {
          const script = new vm.SourceTextModule(code, {
            context: this._context,
          })
          await script.link(async specifier => {
            return new vm.SourceTextModule(specifier, {
              context: this._context,
            })
          })
          await script.evaluate()
          return script.namespace
        }
      }
    } else {
      const script = new vm.Script(code, { filename: this.filePath })
      const rel = script.runInContext(this._context)
      return this._context.exports || rel
    }
  }
  private getContext(pluginContext?: Record<string, unknown>): vm.Context {
    const context: vm.Context = Object.create(pluginContext || null)
    // CJS context setup
    const exports = {}
    const module = {
      exports,
      filename: this.filePath,
      path: this.filePath,
      paths: require.resolve.paths(this.filePath) || [],
      id: this.filePath,
    }
    Object.assign(context, {
      exports,
      module,
      require: Module.createRequire
        ? Module.createRequire(this.filePath)
        : require,
      global: context,
    })
    return vm.createContext(context)
  }
  public static isCanUseEsmRunVm = typeof vm.SourceTextModule == 'function'
}
export { transformESMToCJS }

import { callList, CompileOpt, ImportList } from "../types";
import { join } from "node:path";
import * as CompileData from "./compileData";
import * as compiler from "./";
import { readFile } from "node:fs/promises";
import { extname } from "node:path";
import { loader } from "../loader";
import { genentateModuleNode } from "./moduleParser";
import * as t from "@babel/types";
import mcxLib from "../../mcxlib/index.js";
import str from "./str"
import Utils from "./utils";
export default class CompileMain {
  main: string = "";
  cacheMap: Map<
    string,
    CompileData.JsCompileData | CompileData.MCXCompileData | string
  > = new Map();
  constructor(public opt: CompileOpt) {
    if (typeof opt.main == "string") this.main = join(opt.ProjectDir, opt.main);
  }
  bundlerProgram: t.Program | null = null;
  async start() {
    if (!this.main)
      throw new Error("[mcx load]: mcx loader must has a main file");
    const mainCode = await readFile(this.main, "utf-8");
    const IR = this.compMain(mainCode);
    if (!IR) throw new Error("[mcx compile]: compile main file error");
    IR.setFilePath(this.main);
    if (this.bundlerProgram !== null)
      throw new Error("[mcx compile]: bundler program has been generated");
    const bundlerBody: t.Statement[] = [];
    this.loadModule(bundlerBody);
  }
  moduleId: Record<string, number> = {};
  private handlerCall(callList: callList[], plugin: (call: callList) => void) {
    for (const call of callList) {
      if (call.source.type == "Import") {
        call.set(t.callExpression(t.identifier("__mcx__require"), call.arguments))
      }
      if (call)
      plugin(call);
    }
  }
  private loadModule(body: t.Statement[]) {
    body.push(
      mcxLib.module,
      t.variableDeclaration("const", [
        t.variableDeclarator(
          t.identifier(str.module),
          t.callExpression(t.identifier("__mcxlib__module__"), []),
        ),
      ]),
    );
  }
  private generateFnId(filePath: string): {
    name: string;
    id: number;
  } {
    if (this.moduleId[filePath]) {
      this.moduleId[filePath]++;
    } else {
      this.moduleId[filePath] = 1;
    }
    return {
      name: `__mcx_file_${this.moduleId[filePath]}__`,
      id: this.moduleId[filePath],
    };
  }
  private async pushModule({
    body,
    _import,
    importBody,
    filePath,
    bundlerBody
  }: {
    body: t.Statement[];
    _import: ImportList[];
    importBody: t.Statement[];
    filePath: string;
    bundlerBody: t.Statement[];
  }) {
    let internalImport: ImportList | null = null;
    for (const importPackage of _import) {
      const source = genentateModuleNode(importPackage.source, this.main);
      if (source.stat === "skip" || !source.data) {
        if (importPackage.source.trim() === "@mbler/mcx") {
          internalImport = importPackage;
        }
        continue;
      }
      if (this.cacheMap.has(source.data)) continue;
      const moduleData = await loader(source.data);
      this.cacheMap.set(source.data, moduleData);
      importBody.push(Utils.CacheToImportNode(importPackage));
    }
    const functionParam: t.FunctionParameter[] = [];
    const namedImport: [string, string][] = [];
    let HaveImportAll: t.RestElement | null = null;
    if (internalImport) {
      for (const _index in internalImport.imported) {
        const index = Number(_index);
        const importGroup = internalImport.imported[index];
        if (!importGroup) continue;
        if (importGroup.isAll) {
          // import * as xxx from "@mbler/mcx"
          // max a import all
          if (internalImport.imported[index + 1]) {
            throw new Error(
              "[mcx compile]: cannot mixed import all and named import",
            );
          }
          // into param when no param and no named import
          if (functionParam.length > 0 && namedImport.length > 0) {
            throw new Error(
              "[mcx compile]: import all must be the only import in one statement",
            );
          }
          HaveImportAll = t.restElement(t.identifier(importGroup.as));
        }
        // named import
        else {
          if (!importGroup.import) continue;
          namedImport.push([importGroup.import, importGroup.as]);
        }
      }
      // have named import
      if (namedImport.length > 0) {
        let objectPatternProperties: t.ObjectProperty[] = [];
        for (const [importName, asName] of namedImport) {
          objectPatternProperties.push(
            t.objectProperty(t.identifier(importName), t.identifier(asName)),
          );
        }
        functionParam.push(t.objectPattern(objectPatternProperties));
      }
      if (HaveImportAll) {
        if (namedImport.length > 0) {
          throw new Error(
            "[mcx compile]: cannot mixed import all and named import",
          );
        }
        functionParam.push(HaveImportAll);
      }
    }
    const FnId = this.generateFnId(filePath);
    const fn = this.buildFunction(t.blockStatement(body), FnId.name, functionParam);
    bundlerBody.push(
      t.expressionStatement(
        t.callExpression(
          t.memberExpression(
            t.identifier(str.module),
            t.identifier("define"),
          ),
          [
            t.numericLiteral(FnId.id),
            fn
          ],
        )
      )
    )
  }
  private buildFunction(
    body: t.BlockStatement,
    id: string,
    param: t.FunctionParameter[],
  ): t.FunctionExpression {
    // add in most top
    param.unshift(
      t.identifier(str.exp),
      t.identifier(str.imp),
    );
    return t.functionExpression(t.identifier(id), param, body, false, true);
  }
  private compMain(code: string): CompileData.JsCompileData {
    const ext = extname(this.main);
    if (ext !== ".js") {
      throw new Error("[load project]: main file must is a javascript.");
    }
    const ir = compiler.compileJSFn(code);
    return ir;
  }
}

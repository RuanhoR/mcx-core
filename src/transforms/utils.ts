import * as t from "@babel/types";
import { JsCompileData } from "../compile-mcx/compiler/compileData";
import Utils from "../compile-mcx/compiler/utils";
import config from "./config"
const allKeys = ((): ((node: t.Declaration) => string[]) => {
  // 闭包
  const findkeyByVarId = (
    id: t.LVal | t.VoidPattern,
    result: string[],
  ): void => {
    if (id.type == "VoidPattern") return;
    if (id.type == "ArrayPattern") {
      id.elements.forEach((node) => {
        if (!node) return;
        findkeyByVarId(node, result);
      });
    } else if (id.type == "Identifier") {
      result.push(id.name);
    } else if (id.type == "RestElement") {
      const arg = id.argument;
      findkeyByVarId(id, result);
    } else if (id.type == "ObjectPattern") {
      for (const property of id.properties) {
        if (property.type == "ObjectProperty") {
          const key = property.key;
          if (property.value.type == "AssignmentPattern") {
            const assigmentNode = property.value;
            findkeyByVarId(assigmentNode.left, result);
          } else if (key.type == "Identifier") {
            result.push(key.name);
          }
          continue;
        }
        findkeyByVarId(property.argument, result);
      }
    } else if (id.type == "AssignmentPattern") {
      findkeyByVarId(id.left, result);
    }
  };
  return (node: t.Declaration): string[] => {
    let result: string[] = [];
    if (node.type == "VariableDeclaration") {
      for (const declaration of node.declarations) {
        findkeyByVarId(declaration.id, result);
      }
    }
    return result;
  };
})();
const generateTempId = ((): (() => string) => {
  let num = 0;
  return () => {
    num++;
    return `__mcx_${num}`;
  };
})();
function generateMain(
  JSIR: JsCompileData,
): [...t.ImportDeclaration[], t.VariableDeclaration] {
  const base = t.blockStatement(JSIR.node.body);
  const exports: t.ObjectExpression["properties"] = [];
  const returnVaule = [];
  const importDeclarations: t.ImportDeclaration[] = JSIR.BuildCache.import.map(
    Utils.CacheToImportNode,
  );
  if (JSIR.BuildCache.export.length >= 1)
    for (let exportNode of JSIR.BuildCache.export) {
      // namedExport
      if (exportNode.type == "ExportNamedDeclaration") {
        if (exportNode.declaration) {
          // push declaration
          base.body.push(exportNode.declaration);
          // add export
          const keys: string[] = allKeys(exportNode.declaration);
          // ExportNamedDeclaration can export one and more items. So forEach it.
          keys.forEach((item) => {
            const milb = t.identifier(item);
            exports.push(t.objectProperty(milb, milb));
          });
          continue;
        } else if (exportNode.specifiers.length >= 1 && exportNode.source) {
          importDeclarations.push(
            t.importDeclaration(
              exportNode.specifiers.map(
                (
                  vaule,
                ):
                  | t.ImportSpecifier
                  | t.ImportDefaultSpecifier
                  | t.ImportNamespaceSpecifier => {
                  if (vaule) {
                    if (vaule.type == "ExportSpecifier") {
                      return t.importSpecifier(vaule.local, vaule.exported);
                    } else if (vaule.type == "ExportNamespaceSpecifier") {
                      return t.importNamespaceSpecifier(vaule.exported);
                    } else {
                      return t.importDefaultSpecifier(vaule.exported);
                    }
                  }
                  throw new Error("[compile export]: can't handler specifier");
                },
              ),
              exportNode.source,
            ),
          );
        }
      } else if (exportNode.type == "ExportDefaultDeclaration") {
        exports.push(
          t.objectProperty(
            t.identifier("default"),
            t.isExpression(exportNode.declaration)
              ? exportNode.declaration
              : DeclarationToExpression(exportNode.declaration),
          ),
        );
      } else {
        const source = exportNode.source;
        const id = generateTempId();
        importDeclarations.push(
          t.importDeclaration(
            [t.importNamespaceSpecifier(t.identifier(id))],
            source,
          ),
        );
        exports.push(t.spreadElement(t.identifier(id)));
      }
    }
  base.body.push(t.returnStatement(t.objectExpression(exports)));
  return [
    ...importDeclarations,
    t.variableDeclaration("const", [
      t.variableDeclarator(
        t.identifier(config.scriptCompileFn),
        t.callExpression(
          t.functionExpression(null, [], base, false, false),
          [],
        ),
      ),
    ]),
  ];
}
function DeclarationToExpression(
  node: t.FunctionDeclaration | t.ClassDeclaration | t.TSDeclareFunction,
): t.Expression {
  if (node.type == "ClassDeclaration")
    return t.classExpression(
      node.id,
      node.superClass,
      node.body,
      node.decorators,
    );
  if (node.type == "FunctionDeclaration")
    return t.functionExpression(
      node.id,
      node.params,
      node.body,
      node.generator,
      node.async,
    );
  throw new Error("[compile node]: can't to expression: " + node.type);
}
export { DeclarationToExpression, generateMain, allKeys };

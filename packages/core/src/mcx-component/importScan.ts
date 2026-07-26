import * as t from '@babel/types';
import { parse } from '@babel/parser';
import { styleText } from 'node:util';

type ExportSourceMap = Record<string, string>;

/**
 * Walk the component source AST and build a mapping from local variable names
 * to the npm package they were imported/required from.
 *
 * Covers three import patterns:
 * 1. ES module named/default/namespace imports:  import { X } from 'pkg'
 * 2. CommonJS direct require:                    const X = require('pkg')
 * 3. CommonJS destructured require:              const { X } = require('pkg')
 */
export function collectExportSources(code: string): ExportSourceMap {
  const sources: ExportSourceMap = {};
  let ast: ReturnType<typeof parse>;
  try {
    ast = parse(code, {
      sourceType: 'module',
      plugins: ['typescript', 'jsx'],
    });
  } catch {
    return sources;
  }

  function walk(node: t.Node) {
    if (!node) return;

    if (t.isImportDeclaration(node)) {
      const pkg =
        typeof node.source.value === 'string' ? node.source.value : '';
      for (const spec of node.specifiers) {
        if (t.isImportSpecifier(spec)) {
          const localName = spec.local.name;
          sources[localName] = pkg;
        } else if (t.isImportDefaultSpecifier(spec)) {
          sources[spec.local.name] = pkg;
        } else if (t.isImportNamespaceSpecifier(spec)) {
          sources[spec.local.name] = pkg;
        }
      }
    }

    if (t.isVariableDeclaration(node)) {
      for (const decl of node.declarations) {
        // const X = require('pkg')
        if (
          t.isIdentifier(decl.id) &&
          decl.init &&
          t.isCallExpression(decl.init) &&
          t.isIdentifier(decl.init.callee, { name: 'require' }) &&
          decl.init.arguments.length === 1 &&
          t.isStringLiteral(decl.init.arguments[0])
        ) {
          sources[decl.id.name] = decl.init.arguments[0].value;
        }
        // const { X } = require('pkg')
        if (
          t.isIdentifier(decl.id) &&
          decl.init &&
          t.isCallExpression(decl.init) &&
          t.isMemberExpression(decl.init.callee) &&
          t.isCallExpression(decl.init.callee.object) &&
          t.isIdentifier(decl.init.callee.object.callee, { name: 'require' }) &&
          decl.init.callee.object.arguments.length === 1 &&
          t.isStringLiteral(decl.init.callee.object.arguments[0])
        ) {
          sources[decl.id.name] = decl.init.callee.object.arguments[0].value;
        }
      }
    }

    for (const key of t.VISITOR_KEYS[node.type] || []) {
      const child = (node as unknown as Record<string, unknown>)[key];
      if (Array.isArray(child)) {
        for (const item of child) {
          if (item && typeof item === 'object' && (item as t.Node).type) {
            walk(item as t.Node);
          }
        }
      } else if (child && typeof child === 'object' && (child as t.Node).type) {
        walk(child as t.Node);
      }
    }
  }
  walk(ast.program);
  return sources;
}

/**
 * Validate that the component only imports from @mbler/mcx-component.
 * Non-mcx-core imports trigger a console warning (once per package per file).
 */
export function checkComponentImports(sources: ExportSourceMap, filePath: string) {
  const allowedPackage = '@mbler/mcx-component';
  const warned = new Set<string>();
  for (const [, pkg] of Object.entries(sources)) {
    if (
      pkg &&
      !pkg.startsWith(allowedPackage) &&
      !pkg.startsWith('.') &&
      !warned.has(pkg)
    ) {
      warned.add(pkg);
      console.warn(
        `[${styleText('red', 'mcx component warning')}]: "${pkg}" in ${filePath} is not from "${allowedPackage}". Only imports/requires from "${allowedPackage}" are recommended.`,
      );
    }
  }
}

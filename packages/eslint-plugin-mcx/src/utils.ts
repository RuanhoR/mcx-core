import type { AST } from 'eslint';
import type { PubType } from '@mbler/mcx-core';

export type Tag = PubType.ParsedTagNode;

/** Minimal structural node type: parser output has no `parent` pointers, so
 * eslint's `Rule.Node` (which requires one) cannot be used here. */
type AnyNode = { type: string; name?: unknown; [k: string]: unknown };

/** Depth-first walk over the template tag tree. */
export function walkTags(tags: Tag[], visit: (tag: Tag) => void): void {
  for (const tag of tags) {
    visit(tag);
    const children: Tag[] = [];
    for (const item of tag.content) {
      if (item.type === 'TagNode') children.push(item as Tag);
    }
    walkTags(children, visit);
  }
}

/** One `key = value` line from a prop-style block (whitespace normalized). */
export interface PropLine {
  key: string;
  value: string;
  raw: string;
}

export function parsePropLines(content: Tag['content']): PropLine[] {
  const lines: PropLine[] = [];
  for (const item of content) {
    if (item.type !== 'TagContent') continue;
    for (const rawLine of item.data.split(/\r?\n/)) {
      const line = rawLine.trim();
      if (!line || line.startsWith('//')) continue;
      const eq = line.indexOf('=');
      if (eq <= 0) continue;
      const key = line.slice(0, eq).trim();
      const value = line.slice(eq + 1).replace(/\s+/g, '');
      if (!/^[A-Za-z_]\w*$/.test(key) || !value) continue;
      lines.push({ key, value, raw: line });
    }
  }
  return lines;
}

/** Names exported at the top level of the `<script>` AST. */
export function exportedNames(program: AST.Program): Set<string> {
  const names = new Set<string>();
  for (const stmt of program.body as unknown as AnyNode[]) {
    if (stmt.type !== 'ExportNamedDeclaration') continue;
    const declaration = stmt.declaration as AnyNode | undefined;
    if (declaration) {
      collectDeclaredNames(declaration, names);
    }
    for (const spec of (stmt.specifiers ?? []) as AnyNode[]) {
      const exported = spec.exported as AnyNode | undefined;
      if (exported?.type === 'Identifier') names.add(exported.name as string);
    }
  }
  return names;
}

function collectDeclaredNames(node: AnyNode, names: Set<string>): void {
  if (
    node.type === 'FunctionDeclaration' ||
    node.type === 'ClassDeclaration' ||
    node.type === 'TSInterfaceDeclaration' ||
    node.type === 'TSEnumDeclaration' ||
    node.type === 'TSTypeAliasDeclaration'
  ) {
    const id = node.id as AnyNode | undefined;
    if (id?.type === 'Identifier') names.add(id.name as string);
    return;
  }
  if (node.type === 'VariableDeclaration') {
    for (const decl of (node.declarations ?? []) as AnyNode[]) {
      collectPatternNames(decl.id as AnyNode, names);
    }
  }
}

function collectPatternNames(pattern: AnyNode, names: Set<string>): void {
  if (pattern.type === 'Identifier') {
    names.add(pattern.name as string);
  } else if (pattern.type === 'ObjectPattern') {
    for (const prop of (pattern.properties ?? []) as AnyNode[]) {
      if (prop.type === 'Property') collectPatternNames(prop.value as AnyNode, names);
      else collectPatternNames(prop.argument as AnyNode, names);
    }
  } else if (pattern.type === 'ArrayPattern') {
    for (const el of (pattern.elements ?? []) as (AnyNode | null)[]) {
      if (el) collectPatternNames(el, names);
    }
  } else if (pattern.type === 'AssignmentPattern') {
    collectPatternNames(pattern.left as AnyNode, names);
  } else if (pattern.type === 'RestElement') {
    collectPatternNames(pattern.argument as AnyNode, names);
  }
}

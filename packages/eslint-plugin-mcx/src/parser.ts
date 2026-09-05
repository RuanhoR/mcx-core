import * as tsParser from '@typescript-eslint/parser';
import * as mcxCore from '@mbler/mcx-core';
import type { TSESTree } from '@typescript-eslint/types';
import type { PubType } from '@mbler/mcx-core';
import { walkTags } from './utils';

export type McxTemplateNode = PubType.ParsedTagNode;

export interface McxScriptBlock {
  content: string;
  /** absolute offset of the script content start in the original file */
  start: number;
}

function buildLineStarts(code: string): number[] {
  const starts = [0];
  for (let i = 0; i < code.length; i++) {
    if (code.charCodeAt(i) === 10) starts.push(i + 1);
  }
  return starts;
}

function lineOf(lineStarts: number[], offset: number): number {
  let lo = 0;
  let hi = lineStarts.length - 1;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if ((lineStarts[mid] as number) <= offset) lo = mid;
    else hi = mid - 1;
  }
  return lo;
}

/**
 * Script blocks located from the core AST itself: `start.end` is where the
 * open tag ends, `end.start` is where `</script>` begins — the loc fields
 * core already provides, no re-parsing needed.
 */
function collectScriptBlocks(
  code: string,
  tags: McxTemplateNode[],
): McxScriptBlock[] {
  const lineStarts = buildLineStarts(code);
  const toAbs = (pos: { line: number; column: number }) =>
    (lineStarts[pos.line - 1] ?? 0) + pos.column;
  const blocks: McxScriptBlock[] = [];
  walkTags(tags, tag => {
    if (tag.name !== 'script') return;
    const start = toAbs(tag.start.end);
    let end = start;
    for (const item of tag.content) {
      if (item.type === 'TagContent') end += item.data.length;
    }
    if (tag.end) end = toAbs(tag.end.start);
    blocks.push({ content: code.slice(start, end), start });
  });
  return blocks;
}

type Loc = {
  start: { line: number; column: number };
  end: { line: number; column: number };
};

/** Shift every range/loc in a parsed script AST into original-file coordinates. */
function offsetIntoFile(
  node: unknown,
  offset: number,
  lineDelta: number,
  colDelta: number,
  seen: Set<object>,
): void {
  if (!node || typeof node !== 'object') return;
  if (seen.has(node)) return;
  seen.add(node);
  const obj = node as Record<string, unknown>;
  const range = obj.range;
  if (
    Array.isArray(range) &&
    typeof range[0] === 'number' &&
    typeof range[1] === 'number'
  ) {
    obj.range = [range[0] + offset, range[1] + offset];
  }
  const loc = obj.loc as Loc | undefined;
  if (loc && typeof loc === 'object') {
    for (const pos of [loc.start, loc.end]) {
      if (typeof pos?.line !== 'number') continue;
      if (pos.line === 1) pos.column += colDelta;
      pos.line += lineDelta;
    }
  }
  for (const [key, value] of Object.entries(obj)) {
    if (key === 'loc' || key === 'range' || key === 'parent') continue;
    offsetIntoFile(value, offset, lineDelta, colDelta, seen);
  }
}

function shiftScript(
  program: TSESTree.Program,
  block: McxScriptBlock,
  lineStarts: number[],
): void {
  const baseLine = lineOf(lineStarts, block.start);
  const colDelta = block.start - (lineStarts[baseLine] as number);
  offsetIntoFile(program, block.start, baseLine, colDelta, new Set());
}

function emptyProgram(code: string): TSESTree.Program {
  return {
    type: 'Program',
    body: [],
    tokens: [],
    comments: [],
    sourceType: 'module',
    range: [0, code.length],
    loc: {
      start: { line: 1, column: 0 },
      end: { line: lineOf(buildLineStarts(code), code.length) + 1, column: 0 },
    },
  } as unknown as TSESTree.Program;
}

export interface McxParserOptions {
  parserOptions?: Record<string, unknown>;
}

/**
 * ESLint parser for `.mcx`: template tags are parsed by core's `AST.tag` and
 * attached as `ast.mcxTemplate`; every `<script>` block is parsed by
 * typescript-eslint and its AST is shifted into original-file coordinates.
 */
export function parseForESLint(code: string, options: McxParserOptions = {}) {
  const tags = new mcxCore.AST.tag(code, true).parseAST() as McxTemplateNode[];
  const blocks = collectScriptBlocks(code, tags);
  const lineStarts = buildLineStarts(code);

  const parseOptions = {
    sourceType: 'module' as const,
    ecmaVersion: 'latest' as const,
    range: true,
    loc: true,
    tokens: true,
    comments: true,
    ...options.parserOptions,
  };

  const parsed = blocks.map(block => {
    const result = tsParser.parseForESLint(block.content, parseOptions);
    shiftScript(result.ast, block, lineStarts);
    return result;
  });

  const head = parsed[0];
  let ast: TSESTree.Program;
  let visitorKeys: Record<string, readonly string[]> | undefined;
  let scopeManager: unknown;
  if (!head) {
    ast = emptyProgram(code);
  } else {
    ast = head.ast;
    visitorKeys = head.visitorKeys as Record<string, readonly string[]>;
    scopeManager = head.scopeManager;
    // extra script blocks are rare; merge their bodies into the Program so
    // rules still see their top-level declarations
    for (const rest of parsed.slice(1)) {
      ast.body.push(...rest.ast.body);
      ast.tokens?.push(...(rest.ast.tokens ?? []));
      ast.comments?.push(...(rest.ast.comments ?? []));
    }
    ast.tokens?.sort((a, b) => a.range![0] - b.range![0]);
    ast.comments?.sort((a, b) => a.range![0] - b.range![0]);
  }

  const withTemplate = ast as TSESTree.Program & {
    mcxTemplate: McxTemplateNode[];
  };
  withTemplate.mcxTemplate = tags;

  return {
    ast: withTemplate,
    visitorKeys,
    scopeManager,
    services: { mcxTemplate: tags },
  };
}

export const parser = { parseForESLint };

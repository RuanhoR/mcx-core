import type {
  ParsedTagNode,
  ParsedTagContentNode,
  ParsedCommentNode,
  AttributeMap,
  TagToken,
  TagEndToken,
} from '../types';
import {
  baseParse,
  NodeTypes,
  type RootNode,
  type TemplateChildNode,
  type BaseElementNode,
  type AttributeNode,
  type DirectiveNode,
  type TextNode,
  type CommentNode as VueCommentNode,
  type InterpolationNode,
  type SimpleExpressionNode,
} from '@vue/compiler-core';

function getExpressionContent(expr: { content?: string } | undefined): string {
  return expr?.content ?? 'true';
}

/** Build a line-offset index: lineStarts[i] = char offset where line i starts */
function buildLineIndex(source: string): number[] {
  const starts = [0];
  for (let i = 0; i < source.length; i++) {
    if (source.charCodeAt(i) === 10) {
      starts.push(i + 1);
    }
  }
  return starts;
}

/** Convert absolute character offset to MCX position using prebuilt line index */
function absOffsetToMCXPos(
  lineIndex: number[],
  absOffset: number,
): { line: number; column: number } {
  // Binary search for the line containing absOffset
  let lo = 0;
  let hi = lineIndex.length - 1;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (lineIndex[mid]! <= absOffset) lo = mid;
    else hi = mid - 1;
  }
  return { line: lo + 1, column: absOffset - lineIndex[lo]! };
}

/**
 * Replace the content of every <script>...</script> with equal-length spaces so
 * the HTML parser doesn't misread TS code (generics, comparisons) as tags.
 * Keeps character offsets identical to the original source.
 * `scriptContents` maps the script open-tag start offset to its raw content.
 */
function scrubScriptContent(
  text: string,
  scriptContents: Map<number, string>,
): string {
  const openRe = /<script\b[^>]*>/gi;
  const closeRe = /<\/script\s*>/gi;
  let result = '';
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = openRe.exec(text)) !== null) {
    const openStart = m.index;
    const openEnd = m.index + m[0].length;
    closeRe.lastIndex = openEnd;
    const close = closeRe.exec(text);
    if (!close) break;
    const closeStart = close.index;
    result += text.slice(last, openEnd);
    scriptContents.set(openStart, text.slice(openEnd, closeStart));
    result += ' '.repeat(closeStart - openEnd);
    last = closeStart;
  }
  result += text.slice(last);
  return result;
}

export default class McxAst {
  private text: string;
  private includeComments: boolean;
  private lineIndex: number[] = [];
  private scriptContents = new Map<number, string>();

  constructor(text: string, includeComments: boolean = false) {
    this.text = text;
    this.includeComments = includeComments;
  }

  parseAST(): ParsedTagNode[] {
    this.lineIndex = buildLineIndex(this.text);
    this.scriptContents.clear();
    const scrubbed = scrubScriptContent(this.text, this.scriptContents);
    const ast: RootNode = baseParse(scrubbed, {
      comments: true,
      whitespace: 'preserve',
    });
    const result: ParsedTagNode[] = [];
    for (const child of ast.children) {
      const node = this.convertTemplateChild(child);
      if (node && node.type === 'TagNode') result.push(node);
    }
    return result;
  }

  private convertTemplateChild(
    node: TemplateChildNode,
  ): ParsedTagNode | ParsedTagContentNode | ParsedCommentNode | null {
    if (node.type === NodeTypes.ELEMENT) {
      return this.convertVueElement(node as BaseElementNode);
    }
    if (node.type === NodeTypes.TEXT) {
      const textNode = node as TextNode;
      if (textNode.content.trim()) {
        return { data: textNode.content, type: 'TagContent' };
      }
      return null;
    }
    if (node.type === NodeTypes.INTERPOLATION) {
      const interpNode = node as InterpolationNode;
      return {
        data: `{{ ${getExpressionContent(interpNode.content as SimpleExpressionNode)} }}`,
        type: 'TagContent',
      };
    }
    if (this.includeComments && node.type === NodeTypes.COMMENT) {
      const commentNode = node as VueCommentNode;
      return {
        data: commentNode.content,
        type: 'Comment',
        loc: {
          start: {
            line: commentNode.loc.start.line,
            column: commentNode.loc.start.column,
          },
          end: {
            line: commentNode.loc.end.line,
            column: commentNode.loc.end.column,
          },
        },
      };
    }
    return null;
  }

  private convertVueElement(node: BaseElementNode): ParsedTagNode {
    const attrs: AttributeMap = {};
    for (const prop of node.props) {
      if (prop.type === NodeTypes.ATTRIBUTE) {
        const attr = prop as AttributeNode;
        attrs[attr.name] = attr.value?.content ?? 'true';
      } else if (prop.type === NodeTypes.DIRECTIVE) {
        const dir = prop as DirectiveNode;
        if (dir.name === 'bind') {
          const key = `:${getExpressionContent(dir.arg as SimpleExpressionNode)}`;
          attrs[key] = getExpressionContent(dir.exp as SimpleExpressionNode);
        } else if (dir.name === 'on') {
          const key = `@${getExpressionContent(dir.arg as SimpleExpressionNode)}`;
          attrs[key] = getExpressionContent(dir.exp as SimpleExpressionNode);
        }
      }
    }
    let children = this.convertVueChildren(node.children);

    const lineIndex = this.lineIndex;
    const baseOffset = node.loc.start.offset;

    // Script content was scrubbed before parsing (equal-length spaces) so TS
    // generics like ref<string> don't break the HTML parser; restore the raw text.
    if (node.tag === 'script' && this.scriptContents.has(baseOffset)) {
      children = [
        { data: this.scriptContents.get(baseOffset)!, type: 'TagContent' },
      ];
    }

    const elementSource = node.loc.source;

    // Find the end of the opening tag (first unquoted >)
    let openEnd = elementSource.length;
    let inQuote: string | null = null;
    for (let i = 0; i < elementSource.length; i++) {
      const c = elementSource[i];
      if (inQuote) {
        if (c === '\\') {
          i++;
          continue;
        }
        if (c === inQuote) inQuote = null;
      } else if (c === '"' || c === "'") {
        inQuote = c;
      } else if (c === '>') {
        openEnd = i + 1;
        break;
      }
    }

    // Find the start of the closing tag (last </)
    let closeStart = -1;
    if (!node.isSelfClosing) {
      for (let i = elementSource.length - 2; i >= 0; i--) {
        if (elementSource[i] === '<' && elementSource[i + 1] === '/') {
          closeStart = i;
          break;
        }
      }
    }

    const openTagStartAbs = baseOffset;
    const openTagEndAbs = baseOffset + openEnd;

    let endToken: TagEndToken | null = null;
    if (closeStart >= 0) {
      const closeTagStartAbs = baseOffset + closeStart;
      const closeTagEndAbs = baseOffset + elementSource.length;
      endToken = {
        data: elementSource.slice(closeStart),
        type: 'TagEnd',
        start: absOffsetToMCXPos(lineIndex, closeTagStartAbs),
        end: absOffsetToMCXPos(lineIndex, closeTagEndAbs),
      };
    }

    return {
      start: {
        data: elementSource.slice(0, openEnd),
        type: 'Tag',
        start: absOffsetToMCXPos(lineIndex, openTagStartAbs),
        end: absOffsetToMCXPos(lineIndex, openTagEndAbs),
      },
      name: node.tag,
      arr: attrs,
      content: children,
      end: endToken,
      loc: {
        start: {
          line: node.loc.start.line,
          column: node.loc.start.column,
        },
        end: {
          line: node.loc.end.line,
          column: node.loc.end.column,
        },
      },
      type: 'TagNode',
    };
  }

  private convertVueChildren(
    children: TemplateChildNode[],
  ): (ParsedTagNode | ParsedTagContentNode | ParsedCommentNode)[] {
    const result: (ParsedTagNode | ParsedTagContentNode | ParsedCommentNode)[] =
      [];
    for (const child of children) {
      const node = this.convertTemplateChild(child);
      if (node) result.push(node);
    }
    return result;
  }

  static generateCode(node: ParsedTagNode): string {
    let code = `<${node.name}`;
    for (const [key, value] of Object.entries(node.arr || {})) {
      if (value === 'true') {
        code += ` ${key}`;
      } else {
        code += ` ${key}=${String(value)}`;
      }
    }
    code += '>';
    const contentArr = node.content;
    if (Array.isArray(contentArr)) {
      for (const item of contentArr) {
        if ((item as ParsedTagContentNode).type === 'TagContent') {
          code += (item as ParsedTagContentNode).data;
        } else if ((item as ParsedCommentNode).type === 'Comment') {
          code += (item as ParsedCommentNode).data;
        } else {
          code += McxAst.generateCode(item as ParsedTagNode);
        }
      }
    }
    code += `</${node.name}>`;
    return code;
  }
}

export { MCXUtils };
class MCXUtils {
  static isTagNode(node: unknown): node is ParsedTagNode {
    return (
      !!node &&
      typeof node === 'object' &&
      'start' in (node as object) &&
      'name' in (node as object) &&
      'arr' in (node as object) &&
      'content' in (node as object) &&
      'end' in (node as object)
    );
  }
  static isTagContentNode(node: unknown): node is ParsedTagContentNode {
    return (
      !!node &&
      typeof node === 'object' &&
      'data' in (node as object) &&
      'type' in (node as object) &&
      (node as ParsedTagContentNode).type === 'TagContent'
    );
  }
  static isCommentNode(node: unknown): node is ParsedCommentNode {
    return (
      !!node &&
      typeof node === 'object' &&
      'data' in (node as object) &&
      'type' in (node as object) &&
      'loc' in (node as object) &&
      (node as ParsedCommentNode).type === 'Comment'
    );
  }
  static isAttributeMap(obj: unknown): obj is AttributeMap {
    return !!obj && typeof obj === 'object' && !Array.isArray(obj);
  }
  static isParseNode(node: unknown): node is ParsedTagNode[] {
    return Array.isArray(node) && (node as unknown[]).every(MCXUtils.isTagNode);
  }
}

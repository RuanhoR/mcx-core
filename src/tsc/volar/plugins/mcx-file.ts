import { CodeMapping, LanguagePlugin, VirtualCode } from '@volar/language-core';
import type * as ts from 'typescript';
import { URI } from 'vscode-uri';
import AST from '../../../ast/index.js';
import { compileMCXFn } from '../../../compile-mcx/compiler/index.js';
import * as PUBTYPE from '../../../types.js';
/**
 * MCX Volar TSC 插件
 * 为 MCX 文件提供 TypeScript 智能感知支持
 */
const mcxVolarTscPlugin: LanguagePlugin<URI> = {
  getLanguageId(scriptId) {
    if (scriptId.path.endsWith('.mcx')) {
      return 'mcx';
    }
    return undefined;
  },
};

/**
 * MCX 虚拟代码
 * 用于在 Volar 中表示 MCX 文件的内容
 */
class MCXVirtualCode implements VirtualCode {
  id: string;
  languageId: string = 'mcx';
  mappings: CodeMapping[];
  embeddedCodes: VirtualCode[] = [];

  constructor(public snapshot: ts.IScriptSnapshot, id: string = 'root') {
    this.id = id;
    const content = snapshot.getText(0, snapshot.getLength());

    // 基础映射：整个文件
    this.mappings = [{
      sourceOffsets: [0],
      generatedOffsets: [0],
      lengths: [snapshot.getLength()],
      data: {
        verification: true,
        completion: true,
        semantic: true,
        navigation: true,
        structure: true,
        format: true,
      }
    }];

    // 尝试提取 script 标签内容并创建嵌入式 JS/TS 代码
    try {
      const embeddedCode = this.extractScriptContent(content);
      if (embeddedCode) {
        this.embeddedCodes.push(embeddedCode);
      }
    } catch {
      // 解析失败时忽略嵌入式代码
    }
  }

  /**
   * 从 MCX 文件中提取 script 标签内容
   */
  private extractScriptContent(content: string): VirtualCode | null {
    try {
      const ast = new AST.tag(content);
      const nodes = ast.data;

      // 查找 script 标签
      for (const node of nodes) {
        if (node.name === 'script') {
          const scriptContent = this.extractContent(node);
          if (scriptContent) {
            const scriptStart = this.findScriptStart(content);
            const isTypeScript = node.arr?.lang === 'ts';

            return {
              id: 'script',
              languageId: isTypeScript ? 'typescript' : 'javascript',
              snapshot: {
                getText: (start: number, end: number) => scriptContent.slice(start, end),
                getLength: () => scriptContent.length,
                getChangeRange: () => undefined,
              } as ts.IScriptSnapshot,
              mappings: [{
                sourceOffsets: [scriptStart],
                generatedOffsets: [0],
                lengths: [scriptContent.length],
                data: {
                  verification: true,
                  completion: true,
                  semantic: true,
                  navigation: true,
                  structure: true,
                  format: true,
                }
              }],
              embeddedCodes: [],
            };
          }
        }
      }
    } catch {
      // 解析失败
    }

    return null;
  }

  /**
   * 提取标签内容
   */
  private extractContent(node: PUBTYPE.ParsedTagNode): string {
    if (!node.content) return '';

    return node.content
      .map(item => {
        if (item.type === 'TagContent') {
          return (item as PUBTYPE.ParsedTagContentNode).data;
        }
        return '';
      })
      .join('');
  }

  /**
   * 查找 script 标签在源文件中的起始位置
   */
  private findScriptStart(content: string): number {
    const scriptMatch = content.match(/<script[^>]*>([\s\S]*?)<\/script>/);
    if (scriptMatch && scriptMatch.index !== undefined) {
      // 返回 script 内容的开始位置（跳过开始标签）
      const tagEnd = content.indexOf('>', scriptMatch.index);
      return tagEnd + 1;
    }
    return 0;
  }
}

/**
 * 创建 MCX 虚拟代码实例
 */
export function createMCXVirtualCode(
  snapshot: ts.IScriptSnapshot,
  id?: string
): VirtualCode {
  return new MCXVirtualCode(snapshot, id);
}

export { mcxVolarTscPlugin, MCXVirtualCode };

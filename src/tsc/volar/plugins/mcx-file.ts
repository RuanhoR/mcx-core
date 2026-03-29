import { CodeMapping, LanguagePlugin, VirtualCode } from '@volar/language-core';
import type * as ts from 'typescript';
import { compileMCXFn } from '../../../compile-mcx/compiler/index.js';

/**
 * 服务脚本信息
 */
interface ServiceScript {
  code: VirtualCode;
  scriptKind: ts.ScriptKind;
  preventLeadingOffset: boolean;
  extension: string;
}

/**
 * TypeScript 语言插件扩展
 */
interface TypeScriptLanguagePlugin {
  getServiceScript(virtualCode: VirtualCode): ServiceScript | undefined;
  extraFileExtensions: { extension: string; isMixedContent: boolean; scriptKind: ts.ScriptKind }[];
}

/**
 * MCX 语言插件（扩展 LanguagePlugin 添加 typescript 支持）
 */
interface MCXLanguagePlugin extends LanguagePlugin<string> {
  typescript: TypeScriptLanguagePlugin;
}

/**
 * MCX 虚拟代码
 * 用于在 Volar 中表示 MCX 文件的内容
 */
class MCXVirtualCode implements VirtualCode {
  id: string = 'root';
  languageId: string = 'mcx';
  mappings: CodeMapping[];
  embeddedCodes: VirtualCode[] = [];
  snapshot: ts.IScriptSnapshot;

  constructor(snapshot: ts.IScriptSnapshot) {
    this.snapshot = snapshot;
    const content = snapshot.getText(0, snapshot.getLength());

    // 基础映射：整个文件（MCX 本身不需要类型检查）
    this.mappings = [{
      sourceOffsets: [0],
      generatedOffsets: [0],
      lengths: [snapshot.getLength()],
      data: {
        verification: false,
        completion: false,
        semantic: false,
        navigation: false,
        structure: false,
        format: false,
      }
    }];

    // 提取 script 内容并创建嵌入式 JS/TS 代码
    const embeddedCode = this.extractScriptContent(content);
    if (embeddedCode) {
      this.embeddedCodes.push(embeddedCode);
    }
  }

  /**
   * 从 MCX 文件中提取 script 标签内容
   */
  private extractScriptContent(content: string): VirtualCode | null {
    try {
      // 使用 compileMCXFn 解析 MCX 文件
      const compiled = compileMCXFn(content);
      const scriptContent = compiled.strLoc.script;

      if (!scriptContent || scriptContent.trim() === '') {
        return null;
      }

      // 从 raw 中查找 script 标签节点
      const scriptNode = compiled.raw.find(node => node.name === 'script');
      if (!scriptNode) {
        return null;
      }

      // 判断是否是 TypeScript
      const isTypeScript = scriptNode.arr?.lang === 'ts';

      // 计算源码中的起始位置
      const sourceOffset = this.calculateScriptOffset(content, scriptNode);

      // 创建嵌入式代码的 snapshot
      const scriptSnapshot: ts.IScriptSnapshot = {
        getText: (start: number, end: number) => scriptContent.slice(start, end),
        getLength: () => scriptContent.length,
        getChangeRange: () => undefined,
      };

      return {
        id: 'script',
        languageId: isTypeScript ? 'typescript' : 'javascript',
        snapshot: scriptSnapshot,
        mappings: [{
          sourceOffsets: [sourceOffset],
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
    } catch {
      // 解析失败，返回 null
      return null;
    }
  }

  /**
   * 计算 script 内容在源文件中的起始偏移量
   */
  private calculateScriptOffset(content: string, scriptNode: { start: { data: string } }): number {
    const startTagData = scriptNode.start.data;
    const startTagIndex = content.indexOf(startTagData);
    if (startTagIndex === -1) {
      return 0;
    }
    return startTagIndex + startTagData.length;
  }
}

/**
 * 创建 MCX 语言插件（用于 Volar TSC）
 * @param tsModule TypeScript 模块
 * @returns MCXLanguagePlugin 实例
 */
export function createMCXLanguagePlugin(tsModule: typeof import('typescript')): MCXLanguagePlugin {
  return {
    getLanguageId(scriptId: string): string | undefined {
      if (scriptId.endsWith('.mcx')) {
        return 'mcx';
      }
      return undefined;
    },

    createVirtualCode(
      _scriptId: string,
      languageId: string,
      snapshot: ts.IScriptSnapshot
    ): VirtualCode | undefined {
      if (languageId === 'mcx') {
        return new MCXVirtualCode(snapshot);
      }
      return undefined;
    },

    typescript: {
      extraFileExtensions: [
        {
          extension: 'mcx',
          isMixedContent: true,
          scriptKind: tsModule.ScriptKind.JS,
        },
      ],
      getServiceScript(virtualCode: VirtualCode): ServiceScript | undefined {
        const scriptCode = virtualCode.embeddedCodes?.find(
          code => code.languageId === 'typescript' || code.languageId === 'javascript'
        );

        if (!scriptCode) {
          return undefined;
        }

        const isTypeScript = scriptCode.languageId === 'typescript';

        return {
          code: scriptCode,
          scriptKind: isTypeScript ? tsModule.ScriptKind.TS : tsModule.ScriptKind.JS,
          preventLeadingOffset: false,
          extension: isTypeScript ? '.ts' : '.js',
        };
      },
    },
  };
}

/**
 * 创建 MCX 虚拟代码实例
 */
export function createMCXVirtualCode(snapshot: ts.IScriptSnapshot): VirtualCode {
  return new MCXVirtualCode(snapshot);
}

export { MCXVirtualCode };

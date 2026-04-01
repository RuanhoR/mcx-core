import { CodeMapping, LanguagePlugin, VirtualCode } from '@volar/language-core';
import type * as ts from 'typescript';
import { compileMCXFn } from '../../../compile-mcx/compiler/index.js';

interface ServiceScript {
  code: VirtualCode;
  scriptKind: ts.ScriptKind;
  preventLeadingOffset: boolean;
  extension: string;
}
interface TypeScriptLanguagePlugin {
  getServiceScript(virtualCode: VirtualCode): ServiceScript | undefined;
  extraFileExtensions: { extension: string; isMixedContent: boolean; scriptKind: ts.ScriptKind }[];
}
interface MCXLanguagePlugin extends LanguagePlugin<string> {
  typescript: TypeScriptLanguagePlugin;
}
class MCXVirtualCode implements VirtualCode {
  id: string = 'root';
  languageId: string = 'mcx';
  mappings: CodeMapping[];
  embeddedCodes: VirtualCode[] = [];
  snapshot: ts.IScriptSnapshot;

  constructor(snapshot: ts.IScriptSnapshot) {
    this.snapshot = snapshot;
    const content = snapshot.getText(0, snapshot.getLength());
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
    const embeddedCode = this.extractScriptContent(content);
    if (embeddedCode) {
      this.embeddedCodes.push(embeddedCode);
    }
  }
  private extractScriptContent(content: string): VirtualCode | null {
    try {
      const compiled = compileMCXFn(content);
      const scriptContent = compiled.strLoc.script;

      if (!scriptContent || scriptContent.trim() === '') {
        return null;
      }
      const scriptNode = compiled.raw.find(node => node.name === 'script');
      if (!scriptNode) {
        return null;
      }
      const isTypeScript = scriptNode.arr?.lang === 'ts';
      const sourceOffset = this.calculateScriptOffset(content, scriptNode);
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
      return null;
    }
  }
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
 * 创建 MCX 语言插件
 * @param tsModule TypeScript 
 * @returns MCXLanguagePlugin 
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

export function createMCXVirtualCode(snapshot: ts.IScriptSnapshot): VirtualCode {
  return new MCXVirtualCode(snapshot);
}

export { MCXVirtualCode };

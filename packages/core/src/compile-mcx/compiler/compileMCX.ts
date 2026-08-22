import {
  _MCXstructureLocComponentTypes,
  MCXstructureLoc,
  MCXstructureLocComponentType,
} from '../types';
import * as CompileData from './compileData';
import { ParsedTagContentNode, ParsedTagNode } from '../../types';
import McxAst, { MCXUtils } from '../../ast/tag';
import PropParser from '../../ast/prop';
import ts from 'typescript';
import { compileJSFn, makeError, extractLoc } from './compileJS';

class CompileMCX {
  constructor(public code: string) {
    const mcxCode = new McxAst(code).parseAST();
    if (!MCXUtils.isParseNode(mcxCode))
      throw makeError(
        "[compile error]: mcxCompile can't work in a not mcxNode",
      );
    this.mcxCode = mcxCode;
    this.structureCheck();
    const JSIR = this.generateJSIR();
    this.CompileData = new CompileData.MCXCompileData(
      mcxCode,
      JSIR,
      this.tempLoc,
    );
  }
  private mcxCode: ParsedTagNode[];
  private tempLoc: MCXstructureLoc = {
    script: '',
    Event: {
      on: 'after',
      subscribe: {},
      loc: { line: -1, column: -1 },
      isLoad: false,
    },
    Component: {},
    UI: null,
    Form: null,
  };
  public getCompileData(): CompileData.MCXCompileData {
    return this.CompileData;
  }
  private checkComponentName(
    name: string,
  ): name is MCXstructureLocComponentType {
    return (Object.values(_MCXstructureLocComponentTypes) as string[]).includes(
      name,
    );
  }
  private checkComponentParentName(
    name: string,
  ): name is keyof typeof _MCXstructureLocComponentTypes {
    return Object.keys(_MCXstructureLocComponentTypes).includes(name);
  }
  private commonTagNodeContent(
    node: ParsedTagNode | ParsedTagContentNode,
  ): string {
    if (MCXUtils.isTagContentNode(node)) {
      return node.data;
    }
    if (MCXUtils.isTagNode(node)) {
      return node.content
        .map(sub =>
          sub.type !== 'Comment' ? this.commonTagNodeContent(sub) : '',
        )
        .join('');
    }
    throw makeError('[mcx compile]: internal error: unknown node type', node);
  }
  private getEventOn(node: ParsedTagNode): 'before' | 'after' {
    if (!MCXUtils.isTagNode(node))
      throw makeError('[mcx compile]: internal error: not tag node', node);
    let on: 'before' | 'after' = 'after';
    const isAfter = typeof node.arr['@after'] == 'string';
    const isBefore = typeof node.arr['@before'] == 'string';
    if (isAfter && isBefore)
      throw makeError(
        "[mcx compile]: Event node can't has both @after and @before",
        node,
      );
    if (isAfter) on = 'after';
    if (isBefore) on = 'before';
    return on;
  }
  private structureCheck() {
    let component: ParsedTagNode | null = null;
    const temp: {
      script: string;
      ui: ParsedTagNode | null;
      form: ParsedTagNode | null;
      Event: ParsedTagNode | null;
      Component: Record<MCXstructureLocComponentType, ParsedTagNode>;
    } = {
      script: '',
      Event: null,
      ui: null,
      form: null,
      Component: {} as Record<MCXstructureLocComponentType, ParsedTagNode>,
    };
    for (const node of this.mcxCode || []) {
      if (!MCXUtils.isTagNode(node)) continue;
      if (node.name == 'script') {
        if (temp.script)
          throw makeError('[compile error]: duplicate script node', node);
        const scriptNode =
          node.content.length == 0 ? '' : this.commonTagNodeContent(node);
        let code = scriptNode;
        if (node.arr.lang != 'js') {
          code = ts.transpileModule(scriptNode, {
            compilerOptions: {
              target: ts.ScriptTarget.ES2024,
              module: ts.ModuleKind.ESNext,
            },
          }).outputText;
        }
        temp.script = code;
      } else if (node.name == 'Event') {
        if (temp.Event)
          throw makeError('[compile error]: duplicate Event node', node);
        if (component)
          throw makeError(
            '[compile error]: Event node cannot appear after Component',
            node,
          );
        temp.Event = node;
      } else if (node.name == 'Component') {
        if (component)
          throw makeError('[compile error]: duplicate Component node', node);
        if (temp.Event)
          throw makeError(
            '[compile error]: Component node cannot appear after Event',
            node,
          );
        if (temp.ui)
          throw makeError(
            "[compile error]: Component node can't use with UI node",
          );
        component = node;
      } else if (node.name == 'Ui') {
        if (component || temp.Event || temp.ui)
          throw makeError(
            "[compile error]: UI node can't use with component or event or other ui node",
            node,
          );
        temp.ui = node;
      } else if (node.name == 'Form') {
        if (component || temp.Event || temp.form || temp.ui)
          throw makeError(
            "[compile error]: Form node can't use with component, event, Ui, or other Form node",
            node,
          );
        temp.form = node;
      }
    }
    if (!temp.script) throw makeError('[compile error]: mcx must has a script');
    this.tempLoc.script = temp.script;
    if (temp.Event) {
      const on = this.getEventOn(temp.Event);
      const content = temp.Event.content;
      if (
        content.length == 0 ||
        content.length > 1 ||
        !MCXUtils.isTagContentNode(content[0])
      )
        throw makeError(
          '[compile error]: Event node has invalid content',
          temp.Event,
        );
      const subscribeData = content[0].data.trim();
      this.tempLoc.Event = {
        on: on,
        subscribe: Object.fromEntries(
          PropParser(subscribeData).map(item => [
            item.key,
            item.value.toString(),
          ]),
        ),
        loc: extractLoc(temp.Event),
        isLoad: true,
      };
    }
    if (component) {
      for (const subNode of component.content || []) {
        if (!MCXUtils.isTagNode(subNode)) continue;
        const subName = subNode.name;
        this.handlerChildComponent(subNode);
      }
    }
    if (temp.ui) {
      this.tempLoc.UI = temp.ui;
    }
    if (temp.form) {
      this.tempLoc.Form = temp.form;
    }
  }
  private handlerChildComponent(node: ParsedTagNode): void {
    const name = node.name;
    if (!this.checkComponentParentName(name))
      throw makeError(`[compile error]: invalid component name: ${name}`, node);
    const content = node.content;
    if (!content || content.length == 0)
      throw makeError(
        `[compile error]: component ${name} has no content`,
        node,
      );
    for (const subNode of content) {
      if (!MCXUtils.isTagNode(subNode)) continue;
      const subName = subNode.name;
      const _id = subNode.arr.id;
      if (!_id || typeof _id != 'string' || _id.trim() == '') {
        throw makeError(
          `[compile error]: component ${name} child component ${subName} has no id`,
          subNode,
        );
      }
      const id = _id.trim();
      const content = subNode.content;
      if (content.length == 0) {
        throw makeError(
          `[compile error]: component ${name} child component ${subName} has no content`,
          subNode,
        );
      }
      if (!content[0] || !MCXUtils.isTagContentNode(content[0]))
        throw makeError(
          `[compile error]: component ${name} child component ${subName} has invalid content`,
          subNode,
        );
      const useExport = content[0].data.trim();
      if (subName !== _MCXstructureLocComponentTypes[name])
        throw makeError(
          `[compile error]: component ${name} child must be <${_MCXstructureLocComponentTypes[name]}>, got <${subName}>`,
          subNode,
        );
      this.tempLoc.Component[`${name}/${id}`] = {
        type: subName,
        useExport: useExport,
        loc: extractLoc(subNode),
      };
    }
  }
  private CompileData: CompileData.MCXCompileData;
  private generateJSIR(): CompileData.JsCompileData {
    if (!this.tempLoc.script.trim())
      throw makeError('[compile error]: mcx must has a script');
    const comiler = compileJSFn(this.tempLoc.script);
    return comiler;
  }
}

export const compileMCXFn = ((mcxCode: string): CompileData.MCXCompileData => {
  const cached = compileMCXFn.cache.get(mcxCode);
  if (cached) return cached;
  const compiler = new CompileMCX(mcxCode);
  const data = compiler.getCompileData();
  compileMCXFn.cache.set(mcxCode, data);
  return data;
}) as ((mcxCode: string) => CompileData.MCXCompileData) & {
  cache: Map<string, CompileData.MCXCompileData>;
};
compileMCXFn.cache = new Map();

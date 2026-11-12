import { MCXCompileData } from '../compile-mcx/compiler/compileData';
import { CompileOpt } from '@mbler/mcx-types';
import { transformCtx } from '../types';
import { _transform } from './main';
import { program } from '@babel/types';
import { TransformPluginContext } from 'rollup';
import {
  applyMcxPluginInjections,
  cloneMcxNodes,
  createMcxPluginContext,
  resolveMcxPlugins,
  runMcxThrowHooks,
  runMcxTransformHooks,
  runMcxTransformedHooks,
} from '../plugin';

function toMcxError(err: unknown, id: string): { message: string } {
  return {
    message: err instanceof Error ? `${err.message} (At ${id})` : String(err),
  };
}

export async function transform(
  code: MCXCompileData,
  cache: Map<string, MCXCompileData>,
  id: string,
  context: TransformPluginContext,
  opt: CompileOpt,
  output: transformCtx['output'],
  source: string = '',
): Promise<string> {
  const plugins = resolveMcxPlugins(opt);
  const { hook, state } = createMcxPluginContext({
    id,
    source,
    nodes: plugins.length > 0 ? cloneMcxNodes(code.raw) : [],
    opt,
    output,
    error: (message, loc) =>
      loc
        ? context.error(message, { line: loc.line, column: loc.column })
        : context.error(message),
  });
  try {
    let result: string | undefined;
    if (plugins.length > 0) {
      result = await runMcxTransformHooks(hook, state, plugins);
    }
    if (result === undefined) {
      const scriptTag = code.raw.find(node => {
        return node.name == 'script';
      });
      if (!scriptTag)
        throw new Error('[transform check]: not found mcx script tag');
      const transformContext: transformCtx = {
        rollupContext: context,
        impAST: [],
        currentAST: program([]),
        opt,
        currentId: id,
        compiledCode: code,
        cache,
        scriptTag: scriptTag,
        mainFn: {
          param: [],
          body: [],
        },
        output,
      };
      result = await _transform(transformContext);
    }
    hook.code = result;
    if (plugins.length > 0) {
      result = await runMcxTransformedHooks(result, hook, plugins);
    }
    return applyMcxPluginInjections(result, state);
  } catch (err) {
    if (plugins.length > 0) {
      const recovered = await runMcxThrowHooks(
        err instanceof Error ? err : new Error(String(err)),
        hook,
        plugins,
      );
      if (recovered !== undefined) {
        return applyMcxPluginInjections(recovered, state);
      }
    }
    context.error(toMcxError(err, id));
  }
}

import { MCXCompileData } from '../compile-mcx/compiler/compileData';
import { CompileOpt } from '@mbler/mcx-types';
import { transformCtx, McxPluginContext } from '../types';
import { _transform } from './main';
import { program } from '@babel/types';
import type { ModuleResolver } from '../mcx-component/moduleResolver';
function toMcxError(err: unknown, id: string): { message: string } {
  return {
    message: err instanceof Error
      ? `${err.message} (At ${id})`
      : String(err),
  };
}
export async function transform(
  code: MCXCompileData,
  cache: Map<string, MCXCompileData>,
  id: string,
  context: McxPluginContext,
  opt: CompileOpt,
  output: transformCtx['output'],
  moduleResolver?: ModuleResolver,
): Promise<string> {
  try {
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
      ...(moduleResolver ? { moduleResolver } : {}),
    };
    const result = await _transform(transformContext);
    return result;
  } catch (err) {
    context.error(toMcxError(err, id));
    return '';
  }
}

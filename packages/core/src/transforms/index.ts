import { TransformPluginContext } from 'rollup'
import { MCXCompileData } from '../compile-mcx/compiler/compileData'
import { CompileOpt } from '@mbler/mcx-types'
import { transformCtx } from '../types'
import { _transform } from './main'
import { program } from '@babel/types'
import { RollupError } from 'rolldown'
function createErrorProxy(err: unknown, id: string): RollupError {
  if (err instanceof Error) {
    return {
      ...err,
      message: `${err.message} (At ${id})`,
    }
  } else {
    return { message: String(err) }
  }
}
export async function transform(
  code: MCXCompileData,
  cache: Map<string, MCXCompileData>,
  id: string,
  context: TransformPluginContext,
  opt: CompileOpt,
  output: transformCtx['output'],
): Promise<string> {
  try {
    const scriptTag = code.raw.find(node => {
      return node.name == 'script'
    })
    if (!scriptTag)
      throw new Error('[transform check]: not found mcx script tag')
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
    }
    const result = await _transform(transformContext)
    return result
  } catch (err) {
    context.error(createErrorProxy(err, id))
  }
}

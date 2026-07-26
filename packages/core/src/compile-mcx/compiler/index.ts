import Utils from './utils';
import { compileJSFn } from './compileJS';
import { compileMCXFn } from './compileMCX';
export { CompileError, makeError, extractLoc, compileJSFn, CompileJS } from './compileJS';
export type { Context } from './compileJS';
export { compileMCXFn } from './compileMCX';
export * from './compileData';
export { Utils as MCXNodeUtils };

/** Clear all compiler caches between builds. */
export function clearCompileCaches() {
  compileJSFn.cache.clear();
  compileMCXFn.cache.clear();
}

/**
 * Programmatic entry point for the JSON UI preview.
 *
 * The same layout engine powers the browser preview and the screenshot API, so
 * both always produce identical results.
 */
export {
  collectScreens,
  resolveTextureFile,
  documentVariables,
} from './collect.js';
export type {
  CollectOptions,
  PreviewCollection,
  PreviewProblem,
  PreviewScreen,
  PreviewTextureRoot,
  PreviewTreeNode,
} from './collect.js';
export {
  BASE_FONT_SIZE,
  GLYPH_RATIO,
  controlKind,
  cssColor,
  flattenLayout,
  layoutDocument,
  measureText,
  resolveLength,
} from './layout.js';
export type {
  LayoutBox,
  LayoutKind,
  LayoutOptions,
  LayoutResult,
  LayoutText,
  TextureRef,
} from './layout.js';
export { renderSvg } from './svg.js';
export type { SvgRenderOptions } from './svg.js';
export { renderPng } from './png.js';
export type { PngRenderOptions } from './png.js';
export { startPreviewServer } from './server.js';
export type { PreviewServerHandle, PreviewServerOptions } from './server.js';

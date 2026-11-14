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
export { renderSvg, textSvgFragment } from './svg.js';
export type { SvgRenderOptions } from './svg.js';
export { renderPng } from './png.js';
export type { PngRenderOptions } from './png.js';
export { loadGlyphFont, glyphsForCodepoints } from './fonts.js';
export type { GlyphMap } from './fonts.js';
export {
  BEDROCK_COLORS,
  LINE_HEIGHT,
  charWidth,
  measureText as measureFontText,
  parseRich,
  textWidth,
  usesUnifont,
} from './font/metrics.js';
export { startPreviewServer } from './server.js';
export type { PreviewServerHandle, PreviewServerOptions } from './server.js';

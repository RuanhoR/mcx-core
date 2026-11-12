import type { McxPlugin } from '@mbler/mcx-types';
import { jsonUiPlugin } from './plugin.js';
import type { JsonUIPluginOptions } from './types.js';

export { jsonUiPlugin } from './plugin.js';
export {
  defineJsonUIAvailability,
  createAvailabilityRegistry,
  builtinAvailabilities,
  fileAvailability,
  serverFormAvailability,
  hudAvailability,
  vanillaAvailability,
  noneAvailability,
} from './availability.js';
export { JSONUIComponent } from './component.js';
export type { JsonUIComponentInit } from './component.js';
export {
  buildDocument,
  nodeFromMcx,
  parseUiFromSource,
  coerceValue,
  sanitizeIdentifier,
} from './parse.js';
export type { DocumentParts } from './parse.js';
export { buildServerFormShell, writeJsonFile, readUiDefs } from './emit.js';
export type {
  JsonUIAvailability,
  JsonUIAvailabilityResult,
  JsonUICompileContext,
  JsonUIDocument,
  JsonUIElement,
  JsonUIOutputFile,
  JsonUIPluginOptions,
  JsonUIPluginState,
  JsonUIRuntimeMeta,
  JsonUIServerFormPage,
  JsonUIValue,
  UiChild,
  UiNode,
} from './types.js';

/**
 * Plugin factory: `mcxPlugin: [jsonui(), otherPlugin()]` in `mbler.config.js`.
 *
 * A fresh plugin (and therefore a fresh build state) is created per call, so
 * every addon gets its own `_ui_defs.json` / `server_form.json` aggregation.
 */
export function jsonui(options?: JsonUIPluginOptions): McxPlugin {
  return jsonUiPlugin(options);
}

export default jsonui;

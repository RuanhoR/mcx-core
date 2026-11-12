import type { McxPluginContext } from '@mbler/mcx-types';

export type JsonUIValue =
  | string
  | number
  | boolean
  | null
  | JsonUIValue[]
  | { [key: string]: JsonUIValue };

export type JsonUIElement = { [key: string]: JsonUIValue };

export type JsonUIDocument = {
  namespace: string;
} & { [key: string]: JsonUIValue };

/** Normalised template node, shared by the parsed-AST and raw-source paths. */
export interface UiNode {
  name: string;
  arr: Record<string, string | boolean>;
  content: UiChild[];
}
export type UiChild = UiNode | { text: string };

export interface JsonUIPluginOptions {
  /** default availability when <Ui> does not declare one (default `file`) */
  availability?: string;
  /** namespace prefix for generated UI files */
  namespace?: string;
  /** output directory relative to the resource pack (default `ui`) */
  uiDir?: string;
  /** marker prefix used by server_form routing (default `mbler_ui:`) */
  formMarker?: string;
  /** also dump the raw JSON UI document for every compiled Ui */
  saveRaw?: boolean;
  /** override the resource pack output dir (defaults to ctx.output.resources) */
  resourcesDir?: string;
  /** extra availability adapters (built-ins can be overridden by name) */
  availabilities?: JsonUIAvailability[];
}

export interface JsonUICompileContext {
  hook: McxPluginContext;
  root: UiNode;
  attrs: Record<string, string | boolean>;
  document: JsonUIDocument;
  /** child controls keyed by element id */
  elements: Record<string, JsonUIElement>;
  /** inline controls of the root element */
  rootControls: JsonUIValue[];
  rootId: string;
  target: string | undefined;
  namespace: string;
  availability: string;
  uiDir: string;
  formMarker: string;
  /** explicit raw-save path from `file` / `save` */
  savePath: string | undefined;
}

export interface JsonUIOutputFile {
  /** path relative to the resource pack root */
  path: string;
  content: JsonUIDocument;
}

export interface JsonUIRuntimeMeta {
  availability: string;
  namespace: string;
  root: string;
  target: string | undefined;
  path: string | undefined;
  formTitle: string | undefined;
  files: string[];
  document: JsonUIDocument;
}

export interface JsonUIAvailabilityResult {
  files: JsonUIOutputFile[];
  /** paths to add to `_ui_defs.json` */
  uiDefs?: string[];
  meta?: Partial<JsonUIRuntimeMeta>;
}

/**
 * An availability describes *where* a compiled JSON UI document is attached.
 * `singleton: true` means only one <Ui> may use it in a build;
 * `requiresTarget: true` makes the `target` attribute mandatory.
 */
export interface JsonUIAvailability {
  name: string;
  requiresTarget?: boolean;
  singleton?: boolean;
  emit(
    ctx: JsonUICompileContext,
    state: JsonUIPluginState,
  ): JsonUIAvailabilityResult;
}

export interface JsonUIServerFormPage {
  panelId: string;
  namespace: string;
  screen: string;
}

export interface JsonUIPluginState {
  resourcesDir: string;
  uiDefsPath: string;
  uiDefs: string[];
  serverFormPages: JsonUIServerFormPage[];
  singletons: Set<string>;
  loaded: boolean;
}

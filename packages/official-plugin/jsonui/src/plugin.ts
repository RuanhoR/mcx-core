import type { McxPlugin, McxPluginContext, McxTagNode } from '@mbler/mcx-types';
import type {
  JsonUICompileContext,
  JsonUIOutputFile,
  JsonUIPluginOptions,
  JsonUIPluginState,
  JsonUIRuntimeMeta,
  UiNode,
} from './types.js';
import {
  buildDocument,
  nodeFromMcx,
  parseUiFromSource,
  stringAttr,
} from './parse.js';
import { createAvailabilityRegistry } from './availability.js';
import {
  createState,
  flushBuild,
  readUiDefs,
  resetState,
  safeRelativePath,
  writeJsonFile,
} from './emit.js';

const MISSING_SCRIPT_RE = /mcx must has a script|not found mcx script tag/i;

function generateModule(meta: JsonUIRuntimeMeta): string {
  const init = JSON.stringify({
    availability: meta.availability,
    namespace: meta.namespace,
    root: meta.root,
    ...(meta.target !== undefined ? { target: meta.target } : {}),
    ...(meta.path !== undefined ? { path: meta.path } : {}),
    ...(meta.formTitle !== undefined ? { formTitle: meta.formTitle } : {}),
    files: meta.files,
    document: meta.document,
  });
  return [
    `import { JSONUIComponent } from '@mbler/mcx-plugin-jsonui/component';`,
    `const __mcx_jsonui = new JSONUIComponent(${init});`,
    `export { JSONUIComponent };`,
    `export const jsonui = __mcx_jsonui;`,
    `export default {`,
    `  type: 'jsonui',`,
    `  availability: ${JSON.stringify(meta.availability)},`,
    `  namespace: ${JSON.stringify(meta.namespace)},`,
    `  root: ${JSON.stringify(meta.root)},`,
    `  target: ${JSON.stringify(meta.target ?? null)},`,
    `  path: ${JSON.stringify(meta.path ?? null)},`,
    `  formTitle: ${JSON.stringify(meta.formTitle ?? null)},`,
    `  files: ${JSON.stringify(meta.files)},`,
    `  document: __mcx_jsonui.document,`,
    `  jsonui: __mcx_jsonui,`,
    `};`,
    '',
  ].join('\n');
}

function findJsonUiNode(hook: McxPluginContext): McxTagNode | undefined {
  return hook.nodes.find(
    node =>
      node.name === 'JsonUi' ||
      (node.name === 'Ui' && node.arr['type'] === 'jsonui'),
  ) as McxTagNode | undefined;
}

/**
 * Official JSON UI plugin.
 *
 * The transform is deliberately split in two: `<Ui>` is first compiled into a
 * plain JSON UI document, then an availability adapter decides where that
 * document is attached (raw file, server_form routing, HUD, vanilla override…).
 * Custom adapters can be registered through `options.availabilities`.
 */
export function jsonUiPlugin(options: JsonUIPluginOptions = {}): McxPlugin {
  const registry = createAvailabilityRegistry(options.availabilities);
  const state: JsonUIPluginState = createState(options);
  const uiDir = options.uiDir ?? 'ui';
  const formMarker = options.formMarker ?? 'mbler_ui:';

  const ensureState = (hook: McxPluginContext): void => {
    const resolved =
      options.resourcesDir ?? hook.output.resources ?? state.resourcesDir;
    if (!state.loaded) {
      state.resourcesDir = resolved;
      state.uiDefs = readUiDefs(state.resourcesDir, state.uiDefsPath);
      state.loaded = true;
    } else if (!state.resourcesDir && resolved) {
      state.resourcesDir = resolved;
      state.uiDefs = [
        ...new Set([
          ...readUiDefs(state.resourcesDir, state.uiDefsPath),
          ...state.uiDefs,
        ]),
      ];
    }
  };

  const compile = (hook: McxPluginContext, root: UiNode): string => {
    const parts = buildDocument(root, {
      hookId: hook.id,
      ...(options.namespace !== undefined
        ? { namespace: options.namespace }
        : {}),
    });
    const attrs = parts.attrs;
    const availability =
      stringAttr(attrs, 'availability', 'avail', 'use') ??
      options.availability ??
      'file';
    const adapter = registry.get(availability);
    if (!adapter) {
      hook.error(
        `[jsonui]: unknown availability "${availability}" (available: ${[...registry.keys()].join(', ')})`,
      );
    }
    if (adapter.singleton && state.singletons.has(availability)) {
      hook.error(
        `[jsonui]: availability "${availability}" can only be used once per build (${hook.id})`,
      );
    }
    const target = stringAttr(attrs, 'target');
    if (adapter.requiresTarget && !target) {
      hook.error(
        `[jsonui]: availability "${availability}" requires a target attribute (${hook.id})`,
      );
    }
    ensureState(hook);

    const rawSave = stringAttr(attrs, 'file', 'save');
    const savePath = rawSave ? safeRelativePath(rawSave) : undefined;
    if (rawSave && !savePath) {
      hook.error(`[jsonui]: invalid file/save path: ${rawSave}`);
    }
    const compileContext: JsonUICompileContext = {
      hook,
      root,
      attrs,
      document: parts.document,
      elements: parts.elements,
      rootControls: parts.rootControls,
      rootId: parts.rootId,
      target,
      namespace: parts.namespace,
      availability,
      uiDir,
      formMarker,
      savePath,
    };
    const result = adapter.emit(compileContext, state);

    const files: JsonUIOutputFile[] = [...result.files];
    if (savePath && availability !== 'file') {
      files.push({ path: savePath, content: parts.document });
    } else if (!savePath && options.saveRaw) {
      files.push({
        path: `${uiDir}/${parts.namespace}.raw.json`,
        content: parts.document,
      });
    }

    const written: string[] = [];
    const seen = new Set<string>();
    for (const file of files) {
      if (seen.has(file.path)) continue;
      seen.add(file.path);
      const out = writeJsonFile(state.resourcesDir, file.path, file.content);
      if (out) written.push(out);
    }
    const uiDefs = result.uiDefs ?? files.map(file => file.path);
    for (const entry of uiDefs) {
      if (!state.uiDefs.includes(entry)) state.uiDefs.push(entry);
    }
    if (adapter.singleton) state.singletons.add(availability);

    const meta: JsonUIRuntimeMeta = {
      availability,
      namespace: parts.namespace,
      root: parts.rootId,
      target: result.meta?.target ?? target,
      path: result.meta?.path ?? written[0],
      formTitle: result.meta?.formTitle,
      files: [...new Set([...written, ...uiDefs])],
      document: parts.document,
    };
    return generateModule(meta);
  };

  return {
    name: 'mbler-official-jsonui',
    onBuildStart() {
      resetState(state, options);
    },
    onTransform(hook) {
      const node = findJsonUiNode(hook);
      if (!node) return undefined;
      return compile(hook, nodeFromMcx(node));
    },
    onThrow(error, hook) {
      if (!MISSING_SCRIPT_RE.test(error.message)) return undefined;
      const root = parseUiFromSource(hook.source);
      if (!root) return undefined;
      return compile(hook, root);
    },
    onBuildEnd() {
      flushBuild(state, options);
    },
  };
}

import type {
  JsonUIAvailability,
  JsonUIDocument,
  JsonUIElement,
  JsonUICompileContext,
  JsonUIPluginState,
} from './types.js';
import { sanitizeIdentifier } from './parse.js';

/** Identity helper with full typing for custom availability adapters. */
export function defineJsonUIAvailability(
  adapter: JsonUIAvailability,
): JsonUIAvailability {
  return adapter;
}

/** Plain JSON UI file + `_ui_defs.json` registration, no vanilla attachment. */
export const fileAvailability: JsonUIAvailability = {
  name: 'file',
  emit(ctx: JsonUICompileContext) {
    const path = ctx.savePath ?? `${ctx.uiDir}/${ctx.namespace}.json`;
    return {
      files: [{ path, content: ctx.document }],
      uiDefs: [path],
      meta: { path },
    };
  },
};

/**
 * Custom form routed through `ui/server_form.json`.
 * Follows the Bedrock Wiki "Modifying Server Forms" route used by sapdon:
 * a gated factory in `main_screen_content` points to `@<ns>.root`, and the
 * root panel only becomes visible when the ActionForm title carries the marker.
 */
export const serverFormAvailability: JsonUIAvailability = {
  name: 'server_form',
  emit(ctx: JsonUICompileContext, state: JsonUIPluginState) {
    const screen = sanitizeIdentifier(ctx.target ?? ctx.rootId);
    const namespace = sanitizeIdentifier(`${ctx.namespace}_${screen}`);
    const path = `${ctx.uiDir}/${namespace}.json`;
    const panelId = `${ctx.formMarker}${screen}`;
    const root: JsonUIElement = {
      type: 'panel',
      $panel_id: panelId,
      bindings: [
        { binding_name: '#title_text' },
        {
          binding_type: 'view',
          source_property_name: `(not( (#title_text - '${panelId}') = #title_text))`,
          target_property_name: '#visible',
        },
      ],
      controls: ctx.rootControls,
    };
    const document: JsonUIDocument = {
      namespace,
      root,
      ...ctx.elements,
    };
    // watch rebuilds can emit the same screen again; keep the latest route
    for (let i = state.serverFormPages.length - 1; i >= 0; i--) {
      if (state.serverFormPages[i]?.screen === screen) {
        state.serverFormPages.splice(i, 1);
      }
    }
    state.serverFormPages.push({ panelId, namespace, screen });
    return {
      files: [{ path, content: document }],
      uiDefs: [path],
      meta: { path, target: screen, formTitle: panelId },
    };
  },
};

/** Inject the compiled controls into a vanilla screen (HUD by default). */
export const hudAvailability: JsonUIAvailability = {
  name: 'hud',
  emit(ctx: JsonUICompileContext) {
    const target = sanitizeIdentifier(ctx.target ?? 'hud_screen');
    const path = `${ctx.uiDir}/${ctx.namespace}_hud.json`;
    const document: JsonUIDocument = {
      namespace: ctx.namespace,
      [target]: {
        modifications: [
          {
            array_name: 'controls',
            operation: 'insert_back',
            value: ctx.rootControls,
          },
        ],
      },
    };
    return {
      files: [{ path, content: document }],
      uiDefs: [path],
      meta: { path, target },
    };
  },
};

/**
 * Vanilla element override/reload. Needs no `target` (child ids override
 * vanilla elements of the same name) and is only allowed once per build.
 */
export const vanillaAvailability: JsonUIAvailability = {
  name: 'vanilla',
  singleton: true,
  emit(ctx: JsonUICompileContext) {
    const path = `${ctx.uiDir}/${ctx.namespace}_vanilla.json`;
    const document: JsonUIDocument = {
      namespace: ctx.namespace,
      ...ctx.elements,
    };
    if (ctx.target) {
      document[sanitizeIdentifier(ctx.target)] = {
        modifications: [
          {
            array_name: 'controls',
            operation: 'insert_back',
            value: ctx.rootControls,
          },
        ],
      };
    }
    return {
      files: [{ path, content: document }],
      uiDefs: [path],
      meta: { path },
    };
  },
};

/** No files: the generated module only carries the JSON UI document. */
export const noneAvailability: JsonUIAvailability = {
  name: 'none',
  emit() {
    return { files: [] };
  },
};

export const builtinAvailabilities: JsonUIAvailability[] = [
  fileAvailability,
  serverFormAvailability,
  hudAvailability,
  vanillaAvailability,
  noneAvailability,
];

export function createAvailabilityRegistry(
  extra: JsonUIAvailability[] = [],
): Map<string, JsonUIAvailability> {
  const registry = new Map<string, JsonUIAvailability>();
  for (const adapter of [...builtinAvailabilities, ...extra]) {
    if (
      !adapter ||
      typeof adapter.name !== 'string' ||
      adapter.name.length === 0 ||
      typeof adapter.emit !== 'function'
    ) {
      throw new Error('[jsonui]: availability adapter needs a name and emit()');
    }
    registry.set(adapter.name, adapter);
  }
  return registry;
}

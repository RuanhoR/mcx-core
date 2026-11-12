import * as fs from 'node:fs';
import * as path from 'node:path';
import type {
  JsonUIDocument,
  JsonUIPluginOptions,
  JsonUIPluginState,
  JsonUIServerFormPage,
} from './types.js';

/** Reject absolute paths and traversal, keep generated output inside the pack. */
export function safeRelativePath(input: string): string | undefined {
  const normalized = input.replace(/\\/g, '/').trim();
  if (
    !normalized ||
    normalized.startsWith('/') ||
    /^[A-Za-z]:\//.test(normalized)
  ) {
    return undefined;
  }
  const parts = normalized.split('/');
  if (parts.some(part => part === '..' || part === '')) return undefined;
  return parts.join('/');
}

export function writeJsonFile(
  resourcesDir: string,
  relativePath: string,
  content: unknown,
): string | undefined {
  if (!resourcesDir) return undefined;
  const safe = safeRelativePath(relativePath);
  if (!safe) {
    throw new Error(`[jsonui]: invalid output path: ${relativePath}`);
  }
  const target = path.join(resourcesDir, safe);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, `${JSON.stringify(content, null, 2)}\n`, 'utf-8');
  return safe;
}

export function readUiDefs(resourcesDir: string, uiDefsPath: string): string[] {
  if (!resourcesDir) return [];
  try {
    const raw = JSON.parse(
      fs.readFileSync(path.join(resourcesDir, uiDefsPath), 'utf-8'),
    ) as { ui_defs?: unknown };
    return Array.isArray(raw.ui_defs)
      ? raw.ui_defs.filter((item): item is string => typeof item === 'string')
      : [];
  } catch {
    return [];
  }
}

export function createState(options: JsonUIPluginOptions): JsonUIPluginState {
  const uiDir = options.uiDir ?? 'ui';
  return {
    resourcesDir: options.resourcesDir ?? '',
    uiDefsPath: `${uiDir}/_ui_defs.json`,
    uiDefs: [],
    serverFormPages: [],
    singletons: new Set(),
    loaded: false,
  };
}

export function resetState(
  state: JsonUIPluginState,
  options: JsonUIPluginOptions,
): void {
  if (options.resourcesDir) state.resourcesDir = options.resourcesDir;
  state.uiDefs = [];
  state.serverFormPages = [];
  state.singletons.clear();
  state.loaded = false;
}

/** Shared `ui/server_form.json` shell, aggregated from every server_form Ui. */
export function buildServerFormShell(
  pages: JsonUIServerFormPage[],
  marker: string,
): JsonUIDocument {
  const factories = pages.map(page => ({
    [`mbler_form_factory_${page.screen}`]: {
      type: 'panel',
      factory: {
        name: 'server_form_factory',
        control_ids: { long_form: `@${page.namespace}.root` },
      },
    },
  }));
  return {
    namespace: 'server_form',
    main_screen_content: {
      type: 'panel',
      size: ['fill', 'fill'],
      modifications: [
        {
          array_name: 'controls',
          operation: 'insert_back',
          value: factories,
        },
      ],
    },
    long_form: {
      modifications: [
        {
          array_name: 'bindings',
          operation: 'insert_back',
          value: [
            { binding_name: '#title_text' },
            {
              binding_type: 'view',
              source_property_name: `((#title_text - '${marker}') = #title_text)`,
              target_property_name: '#visible',
            },
          ],
        },
      ],
    },
    screen_exit_animation_pop_wait: {
      anim_type: 'offset',
      easing: 'linear',
      duration: 0.1,
      from: [0, 0],
      to: [0, 0],
      play_event: 'screen.exit_pop',
      end_event: 'screen.exit_end',
    },
    third_party_server_screen: {
      type: 'screen',
      button_mappings: [
        {
          from_button_id: 'button.menu_cancel',
          to_button_id: 'button.menu_exit',
          mapping_type: 'global',
        },
      ],
      $screen_content: 'server_form.main_screen_content',
      $screen_animations: ['@server_form.screen_exit_animation_pop_wait'],
      $background_animations: ['@server_form.screen_exit_animation_pop_wait'],
    },
  };
}

/** Flush files that must be shared by all Ui files in one build. */
export function flushBuild(
  state: JsonUIPluginState,
  options: JsonUIPluginOptions,
): string[] {
  if (!state.resourcesDir || !state.loaded) return [];
  const uiDir = options.uiDir ?? 'ui';
  const marker = options.formMarker ?? 'mbler_ui:';
  const written: string[] = [];
  if (state.serverFormPages.length > 0) {
    const shellPath = `${uiDir}/server_form.json`;
    writeJsonFile(
      state.resourcesDir,
      shellPath,
      buildServerFormShell(state.serverFormPages, marker),
    );
    if (!state.uiDefs.includes(shellPath)) state.uiDefs.push(shellPath);
    written.push(shellPath);
  }
  const onDisk = readUiDefs(state.resourcesDir, state.uiDefsPath);
  const merged = [...new Set([...onDisk, ...state.uiDefs])];
  writeJsonFile(state.resourcesDir, state.uiDefsPath, { ui_defs: merged });
  written.push(state.uiDefsPath);
  state.uiDefs = merged;
  return written;
}

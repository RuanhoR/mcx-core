import { requireField, resolveFormatVersion } from '../../shared';
import { assertUIGlobalVariables, assertUIScreen } from './validators';
import type { UINamedElement } from './types';

/**
 * What a `UIComponent` emits. JSON UI has three distinct file shapes:
 * - `screen`   → `ui/<name>.json`, a `{ namespace, ...elements }` document
 * - `defs`     → `ui/_ui_defs.json`, `{ ui_defs: [...] }`
 * - `globals`  → `ui/_global_variables.json`, a flat `{"$var": value}` map
 */
export type UIComponentMode = 'screen' | 'defs' | 'globals';

export interface UIComponentOptions {
  /** required for `screen`, ignored otherwise */
  format?: string;
  mode?: UIComponentMode;
  /** element namespace, e.g. `my_ui` */
  namespace?: string;
  /** named elements; merged into the emitted object */
  elements?: Record<string, UINamedElement>;
  /** `defs` mode: paths relative to the resource pack root */
  ui_defs?: string[];
  /** `globals` mode: `$`-prefixed variable map */
  variables?: Record<string, unknown>;
}

class UIComponent {
  #opt: UIComponentOptions;
  #elements: Record<string, UINamedElement>;

  constructor(opt: UIComponentOptions) {
    this.#opt = opt;
    this.#elements = { ...(opt.elements ?? {}) };
  }

  getFormat(): string | undefined {
    return this.#opt.format;
  }
  setFormat(value: string) {
    this.#opt.format = value;
  }

  getMode(): UIComponentMode {
    return this.#opt.mode ?? 'screen';
  }
  setMode(value: UIComponentMode) {
    this.#opt.mode = value;
  }

  getNamespace(): string | undefined {
    return this.#opt.namespace;
  }
  setNamespace(value: string) {
    this.#opt.namespace = value;
  }

  getElements(): Record<string, UINamedElement> {
    return this.#elements;
  }

  /** Declares one or more named elements. */
  setElements(elements: Record<string, UINamedElement>): this {
    for (const [name, element] of Object.entries(elements)) {
      this.addElement(name, element);
    }
    return this;
  }

  addElement(name: string, element: UINamedElement): this {
    if (typeof name !== 'string' || !name.trim()) {
      throw new Error('[set error]: ui: element name must be a non-empty string');
    }
    if (name === 'namespace') {
      throw new Error(
        '[set error]: ui: "namespace" is reserved; use setNamespace() instead',
      );
    }
    if (typeof element !== 'object' || element === null || Array.isArray(element)) {
      throw new Error(
        `[set error]: ui: element "${name}" must be an object`,
      );
    }
    this.#elements[name] = element;
    return this;
  }

  removeElement(name: string): this {
    delete this.#elements[name];
    return this;
  }

  getUiDefs(): string[] | undefined {
    return this.#opt.ui_defs;
  }
  setUiDefs(paths: string[]): this {
    if (!Array.isArray(paths) || paths.length === 0) {
      throw new Error(
        '[set error]: ui: ui_defs must be a non-empty array of paths',
      );
    }
    for (const path of paths) {
      if (typeof path !== 'string' || !path.trim()) {
        throw new Error('[set error]: ui: ui_defs entries must be strings');
      }
    }
    this.#opt.ui_defs = [...paths];
    return this;
  }

  getVariables(): Record<string, unknown> | undefined {
    return this.#opt.variables;
  }
  setVariables(variables: Record<string, unknown>): this {
    if (typeof variables !== 'object' || variables === null || Array.isArray(variables)) {
      throw new Error('[set error]: ui: variables must be an object');
    }
    this.#opt.variables = { ...variables };
    return this;
  }

  public toJSON(): Record<string, unknown> {
    if (!this.#opt) throw new Error('[mcx component]: cannot read component');
    const mode = this.getMode();

    if (mode === 'defs') {
      const defs = this.#opt.ui_defs;
      if (!defs || defs.length === 0) {
        throw new Error('[compile component]: ui: defs mode requires ui_defs');
      }
      return { ui_defs: [...defs] };
    }
    if (mode === 'globals') {
      const variables = this.#opt.variables;
      if (!variables || Object.keys(variables).length === 0) {
        throw new Error(
          '[compile component]: ui: globals mode requires at least one variable',
        );
      }
      assertUIGlobalVariables(variables);
      return { ...variables };
    }

    // screen
    const namespace = this.#opt.namespace;
    if (typeof namespace !== 'string' || !namespace.trim()) {
      throw new Error('[compile component]: ui: screen requires a namespace');
    }
    const screen: Record<string, unknown> = {
      namespace: namespace.trim(),
      ...this.#elements,
    };
    assertUIScreen(screen);
    // `format` is accepted for symmetry with the other components but JSON UI
    // screen files do not carry a `format_version` key.
    if (this.#opt.format !== undefined) {
      resolveFormatVersion({ component: 'ui', format: this.#opt.format });
    }
    return screen;
  }
}

export { UIComponent };

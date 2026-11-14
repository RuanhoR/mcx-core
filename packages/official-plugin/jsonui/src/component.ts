import type {
  JsonUIDocument,
  JsonUIElement,
  JsonUIRuntimeMeta,
  JsonUIValue,
} from './types.js';

/** One JSON UI binding, as written into `bindings`. */
export type JsonUIBinding = { [key: string]: JsonUIValue };

/**
 * A binding accepted by {@link JSONUIComponent.addBinding}. The Molang classes
 * from `@mbler/mcx-component` implement `toJSON()`, so they can be passed
 * directly; a plain JSON UI object works too.
 */
export type JsonUIBindingInput =
  | JsonUIBinding
  | { toJSON(): Record<string, unknown> };

export interface JsonUIComponentInit {
  availability: string;
  namespace: string;
  root: string;
  target?: string | undefined;
  path?: string | undefined;
  formTitle?: string | undefined;
  files?: string[] | undefined;
  document: JsonUIDocument;
}

export interface AddBindingOptions {
  /**
   * Create the element when it does not exist yet. Handy when a script builds
   * controls dynamically instead of declaring everything in the template.
   */
  create?: boolean;
  /** Replace existing bindings instead of appending. */
  replace?: boolean;
}

function isBindingInput(value: unknown): value is JsonUIBindingInput {
  if (!value || typeof value !== 'object') return false;
  if (typeof (value as { toJSON?: unknown }).toJSON === 'function') return true;
  return !Array.isArray(value);
}

function toBinding(input: JsonUIBindingInput): JsonUIBinding {
  return typeof (input as { toJSON?: unknown }).toJSON === 'function'
    ? ((
        input as { toJSON(): Record<string, unknown> }
      ).toJSON() as JsonUIBinding)
    : (input as JsonUIBinding);
}

/**
 * Runtime handle for a compiled JSON UI.
 *
 * This class has no Node.js dependency, so generated `.mcx` modules can import
 * it from the game script runtime. Use it inside `<Component>` files to read
 * the generated document, or read `formTitle` when building a Script API
 * ActionFormData that should be routed through `ui/server_form.json`.
 *
 * `<script>` code inside a `<Ui type="jsonui">` file gets an instance called
 * `jsonui` and can turn static markup into a data-driven screen:
 *
 * ```ts
 * import { Molang } from '@mbler/mcx-component';
 *
 * jsonui.bind('hp', Molang.bind.view(Molang.query('get_health'), '#text'));
 * jsonui.text('title', Molang.query('get_level')); // #text shortcut
 * ```
 */
export class JSONUIComponent {
  readonly availability: string;
  readonly namespace: string;
  readonly root: string;
  readonly target: string | undefined;
  readonly path: string | undefined;
  readonly formTitle: string | undefined;
  readonly files: string[];
  readonly document: JsonUIDocument;

  constructor(init: JsonUIComponentInit) {
    this.availability = init.availability;
    this.namespace = init.namespace;
    this.root = init.root;
    this.target = init.target;
    this.path = init.path;
    this.formTitle = init.formTitle;
    this.files = init.files ?? [];
    this.document = init.document;
  }

  /** The raw JSON UI document, ready to be written or merged into a pack. */
  toJSON(): JsonUIDocument {
    return this.document;
  }

  /** Primary generated UI file, relative to the resource pack root. */
  getPath(): string {
    return this.path ?? '';
  }

  /** The Script API form title that activates `server_form` routing. */
  getFormTitle(): string {
    return this.formTitle ?? '';
  }

  getElement(id: string): JsonUIElement | undefined {
    const value = this.document[id];
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      return undefined;
    }
    return value as JsonUIElement;
  }

  /**
   * Look an element up by id, including controls nested inside other controls.
   * Ids are matched as written in the template (`hp`) and with the `#` prefix
   * JSON UI uses in bindings (`#hp`).
   */
  findElement(id: string): JsonUIElement | undefined {
    const target = id.startsWith('#') ? id.slice(1) : id;
    const direct = this.getElement(target) ?? this.getElement(id);
    if (direct) return direct;
    const walk = (element: JsonUIElement): JsonUIElement | undefined => {
      const controls = element['controls'];
      if (!Array.isArray(controls)) return undefined;
      for (const control of controls) {
        if (!control || typeof control !== 'object' || Array.isArray(control)) {
          continue;
        }
        for (const [key, value] of Object.entries(control)) {
          if (!value || typeof value !== 'object' || Array.isArray(value)) {
            continue;
          }
          const child = value as JsonUIElement;
          if (key === target || key === id) return child;
          const nested = walk(child);
          if (nested) return nested;
        }
      }
      return undefined;
    };
    return walk(this.getElement(this.root) ?? ({} as JsonUIElement));
  }

  /** Inline controls declared on the root element. */
  getControls(): JsonUIValue[] {
    const root = this.getElement(this.root);
    const controls = root?.['controls'];
    return Array.isArray(controls) ? controls : [];
  }

  /** Bindings currently declared on `elementId`. */
  getBindings(elementId: string): JsonUIBinding[] {
    const element = this.findElement(elementId);
    const bindings = element?.['bindings'];
    if (!Array.isArray(bindings)) return [];
    return bindings.filter(
      (item): item is JsonUIBinding =>
        !!item && typeof item === 'object' && !Array.isArray(item),
    );
  }

  /**
   * Append one binding (or several) to an element.
   *
   * ```ts
   * jsonui.addBinding('hp', {
   *   binding_type: 'view',
   *   source_property_name: 'query.get_health',
   *   target_property_name: '#text',
   * });
   * ```
   */
  addBinding(
    elementId: string,
    binding: JsonUIBindingInput | JsonUIBindingInput[],
    options: AddBindingOptions = {},
  ): this {
    const list = Array.isArray(binding) ? binding : [binding];
    const element = this.requireElement(elementId, options.create);
    const existing = options.replace
      ? []
      : this.getBindings(elementId).map(item => item);
    element['bindings'] = [
      ...existing,
      ...list.filter(isBindingInput).map(item => toBinding(item)),
    ];
    return this;
  }

  /** Alias of {@link addBinding}. */
  bind(
    elementId: string,
    binding: JsonUIBindingInput | JsonUIBindingInput[],
    options: AddBindingOptions = {},
  ): this {
    return this.addBinding(elementId, binding, options);
  }

  /** Replace every binding on an element. */
  setBindings(
    elementId: string,
    binding: JsonUIBindingInput | JsonUIBindingInput[],
  ): this {
    return this.addBinding(elementId, binding, { replace: true });
  }

  /** Drop all bindings of an element. */
  clearBindings(elementId: string): this {
    const element = this.findElement(elementId);
    if (element) delete element['bindings'];
    return this;
  }

  /**
   * Shortcut for the common case: write an expression into `#text`.
   * `source` may be a Molang expression or plain Molang source.
   */
  text(
    elementId: string,
    source: string | { toMolang(): string },
    condition?: string,
  ): this {
    return this.bind(elementId, {
      binding_type: 'view',
      source_property_name:
        typeof source === 'string' ? source : source.toMolang(),
      target_property_name: '#text',
      ...(condition ? { binding_condition: condition } : {}),
    });
  }

  /** Shortcut for `#visible`. */
  visible(
    elementId: string,
    source: string | { toMolang(): string },
    condition = 'always',
  ): this {
    return this.bind(elementId, {
      binding_type: 'view',
      source_property_name:
        typeof source === 'string' ? source : source.toMolang(),
      target_property_name: '#visible',
      binding_condition: condition,
    });
  }

  /**
   * Declare a control at runtime, e.g. rows built from a list:
   *
   * ```ts
   * jsonui.addControl('shop', 'sword', { type: 'label', text: 'Sword' });
   * ```
   */
  addControl(parentId: string, id: string, element: JsonUIElement): this {
    const parent = this.requireElement(parentId, true);
    const controls = Array.isArray(parent['controls'])
      ? (parent['controls'] as JsonUIValue[])
      : [];
    parent['controls'] = [...controls, { [id]: element }];
    this.document[id] = element;
    return this;
  }

  /** Remove a control from its parent (and from the document). */
  removeControl(parentId: string, id: string): this {
    const parent = this.findElement(parentId);
    const controls = parent?.['controls'];
    if (Array.isArray(controls)) {
      parent!['controls'] = controls.filter(control => {
        if (!control || typeof control !== 'object' || Array.isArray(control)) {
          return true;
        }
        return !(id in control);
      });
    }
    delete this.document[id];
    return this;
  }

  private requireElement(elementId: string, create?: boolean): JsonUIElement {
    const element = this.findElement(elementId);
    if (element) return element;
    if (!create) {
      throw new Error(
        `[jsonui]: unknown element "${elementId}" (declare it in the template or pass { create: true })`,
      );
    }
    const id = elementId.startsWith('#') ? elementId.slice(1) : elementId;
    const created: JsonUIElement = { type: 'panel' };
    this.document[id] = created;
    const root = this.getElement(this.root);
    if (root) {
      const controls = Array.isArray(root['controls'])
        ? (root['controls'] as JsonUIValue[])
        : [];
      root['controls'] = [...controls, { [id]: created }];
    }
    return created;
  }

  static from(meta: JsonUIRuntimeMeta): JSONUIComponent {
    return new JSONUIComponent(meta);
  }
}

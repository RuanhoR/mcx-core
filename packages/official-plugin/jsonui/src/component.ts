import type {
  JsonUIDocument,
  JsonUIElement,
  JsonUIRuntimeMeta,
  JsonUIValue,
} from './types.js';

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

/**
 * Runtime handle for a compiled JSON UI.
 *
 * This class has no Node.js dependency, so generated `.mcx` modules can import
 * it from the game script runtime. Use it inside `<Component>` files to read
 * the generated document, or read `formTitle` when building a Script API
 * ActionFormData that should be routed through `ui/server_form.json`.
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

  /** Inline controls declared on the root element. */
  getControls(): JsonUIValue[] {
    const root = this.getElement(this.root);
    const controls = root?.['controls'];
    return Array.isArray(controls) ? controls : [];
  }

  static from(meta: JsonUIRuntimeMeta): JSONUIComponent {
    return new JSONUIComponent(meta);
  }
}

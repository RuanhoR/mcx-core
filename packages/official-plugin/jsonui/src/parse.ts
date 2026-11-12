import type { McxTagNode } from '@mbler/mcx-types';
import type {
  JsonUIDocument,
  JsonUIElement,
  JsonUIValue,
  UiChild,
  UiNode,
} from './types.js';

/** Attributes consumed by the plugin itself; everything else is JSON UI data. */
export const ROOT_RESERVED_ATTRS = new Set([
  'type',
  'target',
  'availability',
  'avail',
  'use',
  'namespace',
  'ns',
  'file',
  'save',
  'id',
  'element-type',
  'control-type',
  'setup',
  'for',
  'if',
]);

/** Attributes that only control MCX code generation, not JSON UI data. */
export const CHILD_RESERVED_ATTRS = new Set([
  'id',
  'name',
  'for',
  'if',
  'setup',
]);

export function sanitizeIdentifier(value: string): string {
  const cleaned = value.replace(/[^A-Za-z0-9_]/g, '_').replace(/^_+|_+$/g, '');
  return cleaned || 'mcx_ui';
}

export function stringAttr(
  attrs: Record<string, string | boolean>,
  ...names: string[]
): string | undefined {
  for (const name of names) {
    const value = attrs[name];
    if (typeof value === 'string' && value.trim() !== '') return value.trim();
  }
  return undefined;
}

/** Coerce template attribute text into JSON UI values when it is valid JSON. */
export function coerceValue(raw: string | boolean): JsonUIValue {
  if (typeof raw === 'boolean') return raw;
  const trimmed = raw.trim();
  if (trimmed === '') return true;
  if (
    trimmed === 'true' ||
    trimmed === 'false' ||
    trimmed === 'null' ||
    /^-?\d/.test(trimmed) ||
    trimmed.startsWith('{') ||
    trimmed.startsWith('[') ||
    trimmed.startsWith('"')
  ) {
    try {
      return JSON.parse(trimmed) as JsonUIValue;
    } catch {
      return raw;
    }
  }
  return raw;
}

function passThroughProps(
  attrs: Record<string, string | boolean>,
  exclude: Set<string>,
): JsonUIElement {
  const props: JsonUIElement = {};
  for (const [key, value] of Object.entries(attrs)) {
    if (exclude.has(key)) continue;
    const name = key.startsWith(':') ? key.slice(1) : key;
    props[name] = key.startsWith(':') ? String(value) : coerceValue(value);
  }
  return props;
}

function toUiNode(value: unknown): UiNode | undefined {
  if (!value || typeof value !== 'object') return undefined;
  const node = value as Record<string, unknown>;
  if (typeof node['name'] !== 'string') return undefined;
  const arr = (
    node['arr'] && typeof node['arr'] === 'object' ? node['arr'] : {}
  ) as Record<string, string | boolean>;
  const content: UiChild[] = [];
  if (Array.isArray(node['content'])) {
    for (const child of node['content'] as unknown[]) {
      if (!child || typeof child !== 'object') continue;
      const item = child as Record<string, unknown>;
      const isNode =
        item['type'] === 'TagNode' ||
        (typeof item['name'] === 'string' && Array.isArray(item['content']));
      if (isNode) {
        const sub = toUiNode(child);
        if (sub) content.push(sub);
      } else if (
        item['type'] === 'TagContent' &&
        typeof item['data'] === 'string' &&
        item['data'].trim() !== ''
      ) {
        content.push({ text: item['data'] });
      }
    }
  }
  return { name: node['name'], arr, content };
}

/** Convert a compiler root tag node into the normalised shape used here. */
export function nodeFromMcx(node: McxTagNode): UiNode {
  return (
    toUiNode(node) ?? {
      name: node.name,
      arr: { ...node.arr },
      content: [],
    }
  );
}

const VOID_TAGS = new Set([
  'area',
  'base',
  'br',
  'col',
  'embed',
  'hr',
  'img',
  'input',
  'link',
  'meta',
  'param',
  'source',
  'track',
  'wbr',
]);

const TOKEN_RE =
  /<!--[\s\S]*?-->|<\/?([A-Za-z_][\w:.-]*)((?:\s+[^\s"'=<>`/]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s"'=<>`]+))?)*)\s*(\/?)>/g;
const ATTR_RE = /([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g;

function parseAttrs(raw: string): Record<string, string | boolean> {
  const attrs: Record<string, string | boolean> = {};
  for (const match of raw.matchAll(ATTR_RE)) {
    const key = match[1];
    if (!key) continue;
    attrs[key] = match[2] ?? match[3] ?? match[4] ?? true;
  }
  return attrs;
}

function scrubScripts(source: string): string {
  return source.replace(/<script\b[^>]*>[\s\S]*?<\/script\s*>/gi, match =>
    ' '.repeat(match.length),
  );
}

/**
 * Minimal template parser for `<Ui type="jsonui">` files that have no
 * `<script>` block. The compiler rejects those before transform(), so the
 * plugin's onThrow hook uses this fallback on the raw source instead.
 */
export function parseUiFromSource(source: string): UiNode | undefined {
  const text = scrubScripts(source);
  const roots: UiNode[] = [];
  const stack: UiNode[] = [];
  let cursor = 0;
  for (const match of text.matchAll(TOKEN_RE)) {
    const index = match.index ?? 0;
    const chunk = text.slice(cursor, index);
    const parent = stack[stack.length - 1];
    if (chunk.trim() && parent) parent.content.push({ text: chunk });
    cursor = index + match[0].length;
    if (match[0].startsWith('<!--')) continue;
    const tagName = match[1];
    if (!tagName) continue;
    if (match[0].startsWith('</')) {
      stack.pop();
      continue;
    }
    const node: UiNode = {
      name: tagName,
      arr: parseAttrs(match[2] ?? ''),
      content: [],
    };
    if (parent) parent.content.push(node);
    else roots.push(node);
    if (!match[3] && !VOID_TAGS.has(tagName.toLowerCase())) stack.push(node);
  }
  return roots.find(
    node => node.name === 'Ui' && node.arr['type'] === 'jsonui',
  );
}

export interface DocumentParts {
  document: JsonUIDocument;
  elements: Record<string, JsonUIElement>;
  rootControls: JsonUIValue[];
  rootId: string;
  namespace: string;
  attrs: Record<string, string | boolean>;
}

function elementFromNode(node: UiNode, exclude: Set<string>): JsonUIElement {
  const element = passThroughProps(node.arr, exclude);
  const rawType = node.arr['type'];
  element['type'] = coerceValue(
    typeof rawType === 'string' && rawType.trim() !== '' ? rawType : node.name,
  );
  const texts: string[] = [];
  const controls: JsonUIValue[] = [];
  let index = 0;
  for (const child of node.content) {
    if ('text' in child) {
      texts.push(child.text.trim());
      continue;
    }
    const id = sanitizeIdentifier(
      stringAttr(child.arr, 'id', 'name') ?? `${child.name}_${index}`,
    );
    controls.push({ [id]: elementFromNode(child, exclude) });
    index++;
  }
  const text = texts.join('').trim();
  if (text && !('text' in element)) element['text'] = text;
  if (controls.length > 0) element['controls'] = controls;
  return element;
}

/** Compile a normalised <Ui> node into a plain JSON UI document. */
export function buildDocument(
  root: UiNode,
  options: { hookId: string; namespace?: string },
): DocumentParts {
  const attrs = { ...root.arr };
  const fromFile =
    options.hookId
      .split(/[\\/]/)
      .pop()
      ?.replace(/\.mcx$/i, '') ?? 'ui';
  const namespace = sanitizeIdentifier(
    stringAttr(attrs, 'namespace', 'ns') ?? options.namespace ?? fromFile,
  );
  const rootId = sanitizeIdentifier(
    stringAttr(attrs, 'id') ?? stringAttr(attrs, 'target') ?? namespace,
  );
  const elements: Record<string, JsonUIElement> = {};
  const rootControls: JsonUIValue[] = [];
  let index = 0;
  for (const child of root.content) {
    if ('text' in child) continue;
    const id = sanitizeIdentifier(
      stringAttr(child.arr, 'id', 'name') ?? `${child.name}_${index}`,
    );
    const element = elementFromNode(child, CHILD_RESERVED_ATTRS);
    elements[id] = element;
    rootControls.push({ [id]: element });
    index++;
  }
  const rootElement = passThroughProps(attrs, ROOT_RESERVED_ATTRS);
  rootElement['type'] = coerceValue(
    stringAttr(attrs, 'element-type', 'control-type') ?? 'screen',
  );
  if (rootControls.length > 0) rootElement['controls'] = rootControls;
  const document: JsonUIDocument = {
    namespace,
    [rootId]: rootElement,
    ...elements,
  };
  return { document, elements, rootControls, rootId, namespace, attrs };
}

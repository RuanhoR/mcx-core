import type { JsonUIElement, JsonUIValue } from '../types.js';
import { measureText as measureFontText } from './font/metrics.js';

/**
 * A resolved JSON UI control tree. Geometry is already in logical pixels of
 * the preview canvas, so both the browser renderer and the SVG screenshot
 * renderer can draw it without repeating any layout maths — the preview and
 * the screenshots therefore always agree with each other.
 */
export interface LayoutBox {
  id: string;
  kind: LayoutKind;
  type: string;
  x: number;
  y: number;
  w: number;
  h: number;
  /** depth in the control tree, used for stable z ordering */
  depth: number;
  alpha: number;
  layer: number;
  clip: boolean;
  rotate: number;
  text: LayoutText | undefined;
  texture: TextureRef | undefined;
  nineslice: number | undefined;
  tiled: boolean;
  /**
   * the rectangle the texture is actually painted in (relative to the box) —
   * `keep_ratio` (default true) scales the image down to fit and centres it
   */
  draw: { x: number; y: number; w: number; h: number } | undefined;
  children: LayoutBox[];
  raw: JsonUIElement;
}

export interface LayoutText {
  text: string;
  color: string;
  fontSize: number;
  shadow: boolean;
  align: 'left' | 'center' | 'right';
  /** text came from a `#binding` / unresolved `$variable` */
  dynamic: boolean;
  /** lines after applying the game's wrapping rules against the final width */
  lines: string[];
}

export interface TextureRef {
  /** texture path as written in the template, e.g. `textures/ui/icon` */
  path: string;
  /** true when the path is a `#binding` instead of a literal */
  dynamic: boolean;
}

export type LayoutKind =
  | 'screen'
  | 'panel'
  | 'label'
  | 'button'
  | 'image'
  | 'stack_panel'
  | 'grid'
  | 'toggle'
  | 'slider'
  | 'input'
  | 'scroll_view'
  | 'custom';

export interface LayoutOptions {
  /** canvas width in logical pixels */
  width: number;
  /** canvas height in logical pixels */
  height: number;
  /** extra variables merged over the document `variables` map */
  variables?: Record<string, JsonUIValue>;
  /** texture pixel sizes for `keep_ratio` (image default true); keyed by path */
  textureSizes?: ((path: string) => [number, number] | undefined) | undefined;
}

/** Vanilla defaults used when a control does not declare an explicit size. */
export const DEFAULT_BUTTON_SIZE: readonly [number, number] = [200, 20];
export const DEFAULT_IMAGE_SIZE = 16;
/** Minecraft's default font is 10 UI units tall in JSON UI space. */
export const BASE_FONT_SIZE = 10;
const NINESLICE_DEFAULT = 4;

const ANCHORS: Record<string, readonly [number, number]> = {
  top_left: [0, 0],
  top_middle: [0.5, 0],
  top_right: [1, 0],
  left_middle: [0, 0.5],
  center: [0.5, 0.5],
  right_middle: [1, 0.5],
  bottom_left: [0, 1],
  bottom_middle: [0.5, 1],
  bottom_right: [1, 1],
};

const KIND_BY_TYPE: Record<string, LayoutKind> = {
  screen: 'screen',
  panel: 'panel',
  label: 'label',
  button: 'button',
  image: 'image',
  stack_panel: 'stack_panel',
  grid: 'grid',
  toggle: 'toggle',
  slider: 'slider',
  input_panel: 'input',
  input: 'input',
  scroll_view: 'scroll_view',
  custom: 'custom',
};

export function controlKind(type: string): LayoutKind {
  return KIND_BY_TYPE[type] ?? 'custom';
}

function anchorOf(value: JsonUIValue | undefined): readonly [number, number] {
  if (typeof value === 'string') {
    const point = ANCHORS[value.trim()];
    if (point) return point;
  }
  return ANCHORS['top_left'] as readonly [number, number];
}

function asNumber(value: JsonUIValue | undefined): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  return undefined;
}

function asString(value: JsonUIValue | undefined): string | undefined {
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean')
    return String(value);
  return undefined;
}

function isReference(value: string): boolean {
  const text = value.trim();
  return text.startsWith('#') || text.startsWith('$');
}

function lookupVariable(
  name: string,
  vars: Record<string, JsonUIValue>,
): JsonUIValue | undefined {
  const key = name.trim().replace(/^\$/, '');
  return Object.hasOwn(vars, key) ? vars[key] : undefined;
}

/** Resolve `$variable` chains (max 8 hops) against the document variables. */
function resolveValue(
  value: JsonUIValue | undefined,
  vars: Record<string, JsonUIValue>,
): JsonUIValue | undefined {
  let current = value;
  let hops = 0;
  while (typeof current === 'string' && hops < 8) {
    const text = current.trim();
    if (!text.startsWith('$')) break;
    const next = lookupVariable(text, vars);
    if (next === undefined) break;
    current = next;
    hops += 1;
  }
  return current;
}

/**
 * Resolve a JSON UI length expression.
 *
 * Supports `12`, `"12"`, `"12px"`, `"50%"` (of the parent), `"50%x"` / `"50%y"`
 * (of the control itself), `"50%c"` and sums such as `"100% - 4px"`.
 * Returns `undefined` for `default` / missing values so callers can fall back
 * to the type specific auto sizing rules.
 */
export function resolveLength(
  value: JsonUIValue | undefined,
  ref: number,
  own: { w: number; h: number } | undefined,
  vars: Record<string, JsonUIValue> = {},
): number | undefined {
  const resolved = resolveValue(value, vars);
  if (resolved === undefined || resolved === null) return undefined;
  if (typeof resolved === 'number') return resolved;
  if (typeof resolved === 'boolean') return undefined;
  if (Array.isArray(resolved)) {
    return resolveLength(resolved[0], ref, own, vars);
  }
  if (typeof resolved === 'object') return undefined;
  const text = String(resolved).trim();
  if (!text || text === 'default') return undefined;
  let total = 0;
  let rest = text;
  let matched = false;
  while (rest.trim().length > 0) {
    const match = /^\s*([+-]?)\s*(\d*\.?\d+)\s*(px|%x|%y|%c|%|c)?/.exec(
      rest,
    );
    if (!match) break;
    const sign = match[1] === '-' ? -1 : 1;
    const amount = Number.parseFloat(match[2] ?? '0');
    const unit = match[3] ?? 'px';
    let px = amount;
    if (unit === '%') px = (ref * amount) / 100;
    else if (unit === '%x' || unit === '%c')
      px = ((own?.w ?? ref) * amount) / 100;
    else if (unit === '%y') px = ((own?.h ?? ref) * amount) / 100;
    else if (unit === 'c') px = amount * 16;
    total += sign * px;
    matched = true;
    rest = rest.slice(match[0].length);
    if (match[0].length === 0) break;
  }
  return matched ? total : undefined;
}

/**
 * Measure a text block the way the game does: `scale` is the
 * `font_scale_factor`, and with a finite `maxWidth` the text wraps with the
 * game's rules (break at spaces; character-wise only when a single word
 * cannot fit a whole line). All units are UI px.
 */
export function measureText(
  text: string,
  scale: number,
  maxWidth = Number.POSITIVE_INFINITY,
): { w: number; h: number; lines: string[] } {
  const m = measureFontText(text, scale, maxWidth);
  return { w: m.width, h: m.height, lines: m.lines };
}

export function cssColor(
  value: JsonUIValue | undefined,
  vars: Record<string, JsonUIValue> = {},
  fallback = '#ffffff',
): string {
  const resolved = resolveValue(value, vars);
  if (Array.isArray(resolved)) {
    const channels = resolved.map(item =>
      typeof item === 'number' ? item : Number.parseFloat(String(item)),
    );
    const [r = 1, g = 1, b = 1, a = 1] = channels;
    const to255 = (channel: number): number =>
      Math.max(0, Math.min(255, Math.round(channel * 255)));
    return `rgba(${to255(r)}, ${to255(g)}, ${to255(b)}, ${Math.max(
      0,
      Math.min(1, a),
    )})`;
  }
  const text = asString(resolved)?.trim();
  if (!text) return fallback;
  if (isReference(text)) return fallback;
  return text;
}

interface ControlEntry {
  id: string;
  control: JsonUIElement;
}

function controlEntries(control: JsonUIElement): ControlEntry[] {
  const list = control['controls'];
  if (!Array.isArray(list)) return [];
  const entries: ControlEntry[] = [];
  let index = 0;
  for (const item of list) {
    if (!item || typeof item !== 'object' || Array.isArray(item)) continue;
    for (const [id, child] of Object.entries(item as Record<string, unknown>)) {
      if (!child || typeof child !== 'object' || Array.isArray(child)) continue;
      entries.push({ id: id || `control_${index}`, control: child as JsonUIElement });
      index += 1;
    }
  }
  return entries;
}

function textOf(
  control: JsonUIElement,
  vars: Record<string, JsonUIValue>,
): LayoutText | undefined {
  let raw = resolveValue(control['text'], vars);
  let dynamic = false;
  if (raw === undefined) {
    const bindings = control['bindings'];
    if (Array.isArray(bindings) && bindings.length > 0) {
      const first = bindings[0];
      if (first && typeof first === 'object' && !Array.isArray(first)) {
        const name =
          asString((first as JsonUIElement)['binding_name_override']) ??
          asString((first as JsonUIElement)['binding_name']);
        if (name) {
          raw = name;
          dynamic = true;
        }
      }
    }
  }
  const text = asString(raw);
  if (text === undefined) return undefined;
  if (isReference(text)) dynamic = true;
  const scale =
    asNumber(resolveValue(control['font_scale_factor'], vars)) ?? 1;
  const fontName = (
    asString(resolveValue(control['font_type'], vars)) ?? 'default'
  ).toLowerCase();
  const base = fontName === 'minecraftten' ? BASE_FONT_SIZE * 2 : BASE_FONT_SIZE;
  const alignRaw = (
    asString(resolveValue(control['text_alignment'], vars)) ?? 'center'
  ).toLowerCase();
  const align: LayoutText['align'] =
    alignRaw === 'left' || alignRaw === 'right' ? alignRaw : 'center';
  return {
    text,
    color: cssColor(control['color'], vars),
    fontSize: base * scale,
    shadow:
      (control['shadow'] === true ||
        asString(resolveValue(control['shadow'], vars)) === 'true') &&
      control['shadow'] !== false,
    align,
    dynamic,
    lines: [],
  };
}

function textureOf(
  control: JsonUIElement,
  vars: Record<string, JsonUIValue>,
): TextureRef | undefined {
  const raw = asString(resolveValue(control['texture'], vars));
  if (!raw) return undefined;
  return { path: raw, dynamic: isReference(raw) };
}

function sizePair(
  value: JsonUIValue | undefined,
  vars: Record<string, JsonUIValue>,
): [JsonUIValue | undefined, JsonUIValue | undefined] {
  const resolved = resolveValue(value, vars);
  if (Array.isArray(resolved)) {
    return [resolved[0], resolved[1]];
  }
  return [resolved, resolved];
}

export interface LayoutResult {
  root: LayoutBox;
  width: number;
  height: number;
}

/**
 * Lay out a JSON UI document.
 *
 * `rootId` is the control that should fill the canvas (usually the document
 * root control). The returned tree uses absolute coordinates.
 */
export function layoutDocument(
  document: Record<string, JsonUIValue>,
  rootId: string,
  options: LayoutOptions,
): LayoutResult {
  const rootControl = document[rootId];
  const control: JsonUIElement =
    rootControl && typeof rootControl === 'object' && !Array.isArray(rootControl)
      ? (rootControl as JsonUIElement)
      : { type: 'screen' };
  const vars: Record<string, JsonUIValue> = {
    ...(document['variables'] && typeof document['variables'] === 'object'
      ? (document['variables'] as Record<string, JsonUIValue>)
      : {}),
    ...(control['variables'] && typeof control['variables'] === 'object'
      ? (control['variables'] as Record<string, JsonUIValue>)
      : {}),
    ...(options.variables ?? {}),
  };

  const root = layoutControl(rootId, control, options.width, options.height, 0, vars, true, options.textureSizes);
  return { root, width: options.width, height: options.height };
}

function layoutControl(
  id: string,
  control: JsonUIElement,
  parentW: number,
  parentH: number,
  depth: number,
  vars: Record<string, JsonUIValue>,
  isRoot = false,
  textureSizes?: LayoutOptions['textureSizes'],
): LayoutBox {
  const type = (asString(resolveValue(control['type'], vars)) ?? 'custom').toLowerCase();
  const kind = isRoot ? 'screen' : controlKind(type);
  const children = controlEntries(control);
  const size = resolveSize(control, kind, parentW, parentH, vars, children);

  const [w, h]: [number, number] = isRoot ? [parentW, parentH] : size;

  const boxes: LayoutBox[] = [];
  if (kind === 'stack_panel') {
    let cursor = 0;
    const vertical =
      (asString(resolveValue(control['orientation'], vars)) ?? 'vertical') !==
      'horizontal';
    for (const entry of children) {
      const childParentW = w;
      const childParentH = h;
      const box = layoutControl(entry.id, entry.control, childParentW, childParentH, depth + 1, vars, false, textureSizes);
      const extra = resolveLength(
        asArrayPair(entry.control['offset'], vars)[vertical ? 1 : 0],
        vertical ? h : w,
        { w: box.w, h: box.h },
        vars,
      );
      if (vertical) {
        box.x = 0;
        box.y = cursor + (extra ?? 0);
        cursor = box.y + box.h;
      } else {
        box.y = 0;
        box.x = cursor + (extra ?? 0);
        cursor = box.x + box.w;
      }
      boxes.push(box);
    }
  } else if (kind === 'grid') {
    const dims = resolveValue(control['grid_dimensions'], vars);
    const cols = Math.max(
      1,
      (Array.isArray(dims) ? asNumber(dims[0]) : undefined) ??
        Math.ceil(Math.sqrt(Math.max(children.length, 1))),
    );
    const cellW = w / cols;
    const rows = Math.max(1, Math.ceil(children.length / cols));
    const cellH = h / rows;
    children.forEach((entry, index) => {
      const box = layoutControl(entry.id, entry.control, cellW, cellH, depth + 1, vars, false, textureSizes);
      box.x = (index % cols) * cellW;
      box.y = Math.floor(index / cols) * cellH;
      boxes.push(box);
    });
  } else {
    for (const entry of children) {
      const box = layoutControl(entry.id, entry.control, w, h, depth + 1, vars, false, textureSizes);
      const [anchorX, anchorY] = anchorOf(
        resolveValue(entry.control['anchor_from'], vars),
      );
      const [targetX, targetY] = anchorOf(
        resolveValue(entry.control['anchor_to'], vars),
      );
      const [offsetX, offsetY] = asArrayPair(entry.control['offset'], vars);
      const dx = resolveLength(offsetX, w, { w: box.w, h: box.h }, vars) ?? 0;
      const dy = resolveLength(offsetY, h, { w: box.w, h: box.h }, vars) ?? 0;
      box.x = w * targetX - box.w * anchorX + dx;
      box.y = h * targetY - box.h * anchorY + dy;
      boxes.push(box);
    }
  }

  const alphaRaw = asNumber(resolveValue(control['alpha'], vars));
  const layer = asNumber(resolveValue(control['layer'], vars)) ?? 0;
  const visible = resolveValue(control['visible'], vars);
  const nineslice = asNumber(resolveValue(control['nineslice_size'], vars));
  const rotate = asNumber(resolveValue(control['rotate'], vars)) ?? 0;

  // keep_ratio (image default true): scale the texture to fit and centre it;
  // nine-slice textures stretch instead
  let draw: LayoutBox['draw'];
  if (kind === 'image') {
    const keepRaw = resolveValue(control['keep_ratio'], vars);
    const keepRatio =
      keepRaw === undefined
        ? true
        : keepRaw !== false && keepRaw !== 'false';
    const texPath = asString(resolveValue(control['texture'], vars));
    if (keepRatio && !nineslice && texPath && !isReference(texPath) && textureSizes) {
      const size = textureSizes(texPath);
      if (size && size[0] > 0 && size[1] > 0 && w > 0 && h > 0) {
        const k = Math.min(w / size[0], h / size[1]);
        draw = {
          x: (w - size[0] * k) / 2,
          y: (h - size[1] * k) / 2,
          w: size[0] * k,
          h: size[1] * k,
        };
      }
    }
  }

  const text = textOf(control, vars);
  if (text) {
    // wrap against the final width the way the game does (only when the
    // width was actually resolved; `default` width fits the text instead)
    const scale = text.fontSize / BASE_FONT_SIZE;
    const fixedW =
      resolveLength(sizePair(control['size'], vars)[0], parentW, undefined, vars) !==
      undefined
        ? w
        : Number.POSITIVE_INFINITY;
    text.lines = measureFontText(text.text, scale, fixedW).lines;
  }

  return {
    id,
    kind,
    type,
    x: 0,
    y: 0,
    w,
    h,
    depth,
    alpha: alphaRaw === undefined ? 1 : Math.max(0, Math.min(1, alphaRaw)),
    layer,
    clip: resolveValue(control['clip'], vars) === true,
    rotate,
    text,
    texture: textureOf(control, vars),
    nineslice: nineslice ?? (kind === 'button' ? NINESLICE_DEFAULT : undefined),
    tiled: control['tiled'] === true,
    draw,
    children: visible === false ? [] : boxes,
    raw: control,
  };
}

function asArrayPair(
  value: JsonUIValue | undefined,
  vars: Record<string, JsonUIValue>,
): [JsonUIValue | undefined, JsonUIValue | undefined] {
  const resolved = resolveValue(value, vars);
  if (Array.isArray(resolved)) return [resolved[0], resolved[1]];
  return [undefined, undefined];
}

function resolveSize(
  control: JsonUIElement,
  kind: LayoutKind,
  parentW: number,
  parentH: number,
  vars: Record<string, JsonUIValue>,
  children: ControlEntry[],
): [number, number] {
  const [rawW, rawH] = sizePair(control['size'], vars);
  let w = resolveLength(rawW, parentW, undefined, vars);
  let h = resolveLength(rawH, parentH, w === undefined ? undefined : { w, h: 0 }, vars);

  const own = { w: w ?? 0, h: h ?? 0 };
  if (w === undefined) {
    const derived = autoWidth(control, kind, parentW, parentH, vars, children, own);
    w = derived;
  }
  if (h === undefined) {
    h = autoHeight(control, kind, parentW, parentH, vars, children, {
      w: w ?? 0,
      h: own.h,
    });
  }
  return [Math.max(0, Math.round(w)), Math.max(0, Math.round(h))];
}

function autoWidth(
  control: JsonUIElement,
  kind: LayoutKind,
  parentW: number,
  parentH: number,
  vars: Record<string, JsonUIValue>,
  children: ControlEntry[],
  own: { w: number; h: number },
): number {
  if (kind === 'label' || kind === 'button' || kind === 'toggle') {
    const text = textOf(control, vars);
    const padding = kind === 'label' ? 0 : 8;
    if (text) {
      // `default` width fits the text (the game does not clamp it to the parent)
      const scale = text.fontSize / BASE_FONT_SIZE;
      return measureFontText(text.text, scale).width + padding;
    }
    return kind === 'label' ? 0 : DEFAULT_BUTTON_SIZE[0];
  }
  if (kind === 'image') return DEFAULT_IMAGE_SIZE;
  if (kind === 'stack_panel') {
    // real device: a stack's %c is the sum of its children in BOTH directions
    // (use %cm to hug the widest/tallest child instead)
    let total = 0;
    for (const entry of children) {
      const size = measureChild(entry.control, parentW, parentH, vars);
      total += size[0];
    }
    return total;
  }
  if (kind === 'grid') return own.w || DEFAULT_BUTTON_SIZE[0];
  return 0;
}

function autoHeight(
  control: JsonUIElement,
  kind: LayoutKind,
  parentW: number,
  parentH: number,
  vars: Record<string, JsonUIValue>,
  children: ControlEntry[],
  own: { w: number; h: number },
): number {
  if (kind === 'label') {
    const text = textOf(control, vars);
    if (!text) return 0;
    // a fixed width wraps the text; `default` width does not wrap
    const scale = text.fontSize / BASE_FONT_SIZE;
    return measureFontText(text.text, scale, own.w > 0 ? own.w : Number.POSITIVE_INFINITY)
      .height;
  }
  if (kind === 'button' || kind === 'toggle' || kind === 'slider') {
    return DEFAULT_BUTTON_SIZE[1];
  }
  if (kind === 'image') return DEFAULT_IMAGE_SIZE;
  if (kind === 'stack_panel') {
    // real device: a stack's %c is the sum of its children in BOTH directions
    let total = 0;
    for (const entry of children) {
      const size = measureChild(entry.control, parentW, parentH, vars);
      total += size[1];
    }
    return total;
  }
  return 0;
}

function measureChild(
  control: JsonUIElement,
  parentW: number,
  parentH: number,
  vars: Record<string, JsonUIValue>,
): [number, number] {
  const kind = controlKind(
    (asString(resolveValue(control['type'], vars)) ?? 'custom').toLowerCase(),
  );
  return resolveSize(control, kind, parentW, parentH, vars, controlEntries(control));
}

/**
 * Flatten a layout tree in paint order, following the real game's rules
 * (bedrock 1.3.0 / 1.4.0 / 1.22.0 stacking experiments): first by layer
 * (accumulated relative to the parent); **within one layer, drawing is
 * batched by material** — all text is one batch, each texture is its own
 * batch — and the batches are ordered by the first appearance of that
 * material in document order (depth-first). Within a batch, document order.
 */
export function flattenLayout(root: LayoutBox): LayoutBox[] {
  const out: LayoutBox[] = [];
  const walk = (box: LayoutBox, parentX: number, parentY: number): void => {
    const absolute: LayoutBox = {
      ...box,
      x: parentX + box.x,
      y: parentY + box.y,
      children: [],
    };
    if (box.draw) {
      absolute.draw = {
        x: absolute.x + box.draw.x,
        y: absolute.y + box.draw.y,
        w: box.draw.w,
        h: box.draw.h,
      };
    }
    out.push(absolute);
    for (const child of box.children) walk(child, absolute.x, absolute.y);
  };
  walk(root, 0, 0);
  const first = new Map<string, number>();
  out.forEach((box, index) => {
    const key = batchKey(box);
    if (key && !first.has(`${box.layer}|${key}`)) first.set(`${box.layer}|${key}`, index);
  });
  const batch = (box: LayoutBox): number => {
    const key = batchKey(box);
    return key ? (first.get(`${box.layer}|${key}`) ?? -1) : -1;
  };
  return out.sort(
    (a, b) => a.layer - b.layer || batch(a) - batch(b) || a.depth - b.depth,
  );
}

/** Draw batches: text is one batch; images batch per texture; others draw nothing. */
function batchKey(box: LayoutBox): string | undefined {
  if (box.text && box.text.text) return 'text';
  if (box.texture) return `image:${box.texture.path}`;
  return undefined;
}

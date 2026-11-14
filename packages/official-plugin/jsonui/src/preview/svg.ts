import { GAME_GLYPHS } from './font/gameGlyphs.js';
import {
  GLYPH_TOP,
  LINE_HEIGHT,
  boldExtra,
  charWidth,
  parseRich,
  PLAIN,
  usesUnifont,
  type RunStyle,
} from './font/metrics.js';
import { BASE_FONT_SIZE, type LayoutBox, type LayoutResult } from './layout.js';

export interface SvgRenderOptions {
  result: LayoutResult;
  /** canvas background; `transparent` keeps the SVG transparent */
  background?: 'checker' | 'dark' | 'transparent';
  /** output pixel density, the viewBox stays in logical pixels */
  scale?: number;
  /** resolve a texture path to a data URI so screenshots stay self contained */
  textureUri?: (path: string) => string | undefined;
  /**
   * Unifont bitmaps for the codepoints used by this screen (codepoint → hex
   * rows, same format as unifont.hex). When provided, text is drawn with the
   * game's pixel glyphs; otherwise the renderer falls back to system fonts.
   */
  glyphs?: Map<number, string> | undefined;
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}

/** Multiply an rgb()/rgba()/hex color's channels by a factor, keeping alpha. */
function dimColor(color: string, factor: number): string {
  const rgba = /rgba?\(([^)]+)\)/i.exec(color);
  if (rgba) {
    const parts = (rgba[1] ?? '')
      .split(',')
      .map(part => Number.parseFloat(part.trim()));
    const [r = 255, g = 255, b = 255, a = 1] = parts;
    return `rgba(${Math.round(r * factor)}, ${Math.round(g * factor)}, ${Math.round(b * factor)}, ${a})`;
  }
  const hex = /^#([0-9a-f]{6})$/i.exec(color.trim());
  if (hex && hex[1]) {
    const value = Number.parseInt(hex[1], 16);
    const ch = (shift: number): number =>
      Math.round(((value >> shift) & 0xff) * factor);
    return `rgb(${ch(16)}, ${ch(8)}, ${ch(0)})`;
  }
  return color;
}

/** Deterministic same-width substitute for §k (the game animates; previews stay stable). */
const OBFUSCATED_POOL = 'abcdefghjkmnopqrsuvwxyzABCDEFGHJKLMNOPQRSTUVWXYZ0123456789#$%&+=?';

function obfuscatedChar(ch: string, index: number, unifont: boolean): string {
  if (ch === ' ') return ch;
  if (unifont) return '.';
  const width = charWidth(ch, false);
  const pool = [...OBFUSCATED_POOL].filter(c => charWidth(c, false) === width);
  if (pool.length === 0) return ch;
  return pool[index % pool.length] ?? ch;
}

/** Convert a unifont hex bitmap into an SVG path of unit grid squares. */
function glyphPath(bits: string): string {
  const w = bits.length === 64 ? 16 : 8;
  const rows: number[] = [];
  for (let i = 0; i < bits.length; i += w / 4)
    rows.push(Number.parseInt(bits.slice(i, i + w / 4), 16));
  let d = '';
  for (let r = 0; r < rows.length; r += 1) {
    const rowBits = rows[r] ?? 0;
    let c = 0;
    while (c < w) {
      if ((rowBits >> (w - 1 - c)) & 1) {
        let run = 1;
        while (c + run < w && (rowBits >> (w - 1 - (c + run))) & 1) run += 1;
        d += `M${c} ${r}h${run}v1h-${run}z`;
        c += run;
      } else {
        c += 1;
      }
    }
  }
  return d;
}

/** Text renderer over glyph bitmaps; returns false when the font data is insufficient. */
function drawTextGlyphs(
  box: LayoutBox,
  out: string[],
  glyphs: Map<number, string>,
  defsOut?: Map<number, string>,
): boolean {
  const text = box.text;
  if (!text || !text.text) return true;
  const fontScale = text.fontSize / BASE_FONT_SIZE;
  const unifont = usesUnifont(text.text);

  // every codepoint (game glyphs excluded) must be available
  for (const ch of text.text.replace(/§./gs, '')) {
    const cp = ch.codePointAt(0) ?? 0;
    if (cp !== 0x20 && cp !== 0x0a && !GAME_GLYPHS[cp] && !glyphs.get(cp)) {
      return false;
    }
  }

  const paths = new Map<number, string>();
  const idOf = (cp: number): string => `mcxg${cp.toString(16)}`;
  const drawGlyph = (
    ch: string,
    x: number,
    y: number,
    fill: string,
    italic: boolean,
  ): void => {
    const cp = ch.codePointAt(0) ?? 0;
    if (cp === 0x20) return;
    const bits = GAME_GLYPHS[cp] ?? glyphs.get(cp);
    if (!bits) return;
    if (!paths.has(cp)) {
      const d = glyphPath(bits);
      if (d) {
        paths.set(cp, d);
        defsOut?.set(cp, d);
      }
    }
    if (!paths.has(cp)) return;
    const cell = unifont ? fontScale / 2 : fontScale;
    const skew = italic ? ' skewX(-7.125)' : '';
    out.push(
      `<use href="#${idOf(cp)}" transform="translate(${round(x)} ${round(
        y,
      )}) scale(${round(cell)})${skew}" fill="${escapeXml(fill)}" />`,
    );
  };

  const drawRuns = (line: string, x0: number, y: number, styleIn: RunStyle): RunStyle => {
    const { runs, end } = parseRich(line, styleIn);
    // advances accumulate in fs=1 UI px and are scaled by fontScale when drawn
    let x = 0;
    let charIndex = 0;
    for (const run of runs) {
      const color = run.style.color ?? text.color;
      const passes: { dx: number; dy: number; fill: string }[] = [];
      if (text.shadow) {
        passes.push({ dx: fontScale, dy: fontScale, fill: dimColor(color, 0.25) });
      }
      passes.push({ dx: 0, dy: 0, fill: color });
      const italic = run.style.italic;
      const skewBase = italic ? fontScale : 0;
      for (const ch of run.text) {
        const shown = run.style.obfuscated
          ? obfuscatedChar(ch, charIndex, unifont)
          : ch;
        const advance = charWidth(shown, unifont);
        for (const pass of passes) {
          drawGlyph(shown, x0 + (x + pass.dx) * fontScale + skewBase, y + pass.dy * fontScale, pass.fill, italic);
          if (run.style.bold) {
            drawGlyph(
              shown,
              x0 + (x + pass.dx + boldExtra(shown, unifont)) * fontScale + skewBase,
              y + pass.dy * fontScale,
              pass.fill,
              italic,
            );
          }
        }
        x += advance;
        charIndex += 1;
      }
    }
    return end;
  };

  // line widths in fs=1 UI px (bold carries across runs, styles across lines)
  const widths = text.lines.map(line => {
    let style: RunStyle = PLAIN;
    let w = 0;
    for (const run of parseRich(line, style).runs) {
      style = run.style;
      for (const ch of run.text) w += charWidth(ch, unifont) + (run.style.bold ? boldExtra(ch, unifont) : 0);
    }
    return w;
  });

  const linePitch = LINE_HEIGHT * fontScale;
  const blockHeight = text.lines.length * linePitch;
  const vCenter = box.kind === 'button' || box.kind === 'toggle';
  const startY = vCenter ? box.y + (box.h - blockHeight) / 2 : box.y;

  let style: RunStyle = PLAIN;
  text.lines.forEach((line, index) => {
    const lineWidth = (widths[index] ?? 0) * fontScale;
    const x0 =
      text.align === 'left'
        ? box.x
        : text.align === 'right'
          ? box.x + box.w - lineWidth
          : box.x + (box.w - lineWidth) / 2;
    const y = startY + index * linePitch + GLYPH_TOP * fontScale;
    style = drawRuns(line, x0, y, style);
  });
  return true;
}

/** Fallback: system-font text (used when no glyph bitmaps are available). */
function drawTextSystem(
  box: LayoutBox,
  out: string[],
  key: string,
): void {
  const text = box.text;
  if (!text || !text.text) return;
  const anchor =
    text.align === 'left' ? 'start' : text.align === 'right' ? 'end' : 'middle';
  const x =
    text.align === 'left'
      ? box.x + 1
      : text.align === 'right'
        ? box.x + box.w - 1
        : box.x + box.w / 2;
  const lines = text.text.split('\n');
  const lineHeight = text.fontSize * 1.18;
  const startY = box.y + box.h / 2 - ((lines.length - 1) * lineHeight) / 2;
  lines.forEach((line, index) => {
    const y = startY + index * lineHeight;
    const common = `x="${round(x)}" y="${round(y)}" text-anchor="${anchor}" font-size="${round(
      text.fontSize,
    )}" font-family="'Minecraftia','Minecraft',ui-monospace,Consolas,monospace" dominant-baseline="middle"`;
    if (text.shadow) {
      out.push(
        `<text ${common} fill="#3f3f3f" transform="translate(1,1)" data-part="${key}-shadow">${escapeXml(
          line,
        )}</text>`,
      );
    }
    out.push(
      `<text ${common} fill="${escapeXml(
        text.color,
      )}" opacity="${text.dynamic ? 0.85 : 1}" data-part="${key}">${escapeXml(line)}</text>`,
    );
  });
}

function drawText(
  box: LayoutBox,
  out: string[],
  key: string,
  glyphs: Map<number, string> | undefined,
): void {
  // drawTextGlyphs validates every codepoint before emitting anything, so a
  // `false` result leaves `out` untouched and the system-font path can take over
  if (glyphs && box.text?.text) {
    const ok = drawTextGlyphs(box, out, glyphs);
    if (ok) return;
  }
  drawTextSystem(box, out, key);
}

function drawBox(
  box: LayoutBox,
  offsetX: number,
  offsetY: number,
  parentAlpha: number,
  options: SvgRenderOptions,
  out: string[],
  glyphs: Map<number, string> | undefined,
): void {
  const alpha = Math.max(0, Math.min(1, box.alpha * parentAlpha));
  if (alpha <= 0.001) return;
  const x = round(offsetX + box.x);
  const y = round(offsetY + box.y);
  const w = round(box.w);
  const h = round(box.h);
  const key = `${box.kind}-${box.id}`;

  out.push(
    `<g opacity="${round(alpha)}" data-id="${escapeXml(box.id)}" data-kind="${box.kind}">`,
  );

  switch (box.kind) {
    case 'button':
    case 'toggle': {
      out.push(
        `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="2" fill="#8b8b8b" stroke="#000000" stroke-width="1" />`,
        `<rect x="${round(x + 1)}" y="${round(y + 1)}" width="${round(
          Math.max(0, w - 2),
        )}" height="${round(Math.max(0, h * 0.45))}" fill="#a0a0a0" opacity="0.55" />`,
      );
      drawText(box, out, key, glyphs);
      break;
    }
    case 'label':
      drawText(box, out, key, glyphs);
      break;
    case 'image': {
      const uri = box.texture ? options.textureUri?.(box.texture.path) : undefined;
      if (uri && !box.texture?.dynamic) {
        const draw = box.draw;
        const ix = round(offsetX + box.x + (draw?.x ?? 0));
        const iy = round(offsetY + box.y + (draw?.y ?? 0));
        out.push(
          `<image x="${ix}" y="${iy}" width="${round(draw?.w ?? box.w)}" height="${round(
            draw?.h ?? box.h,
          )}" href="${uri}" preserveAspectRatio="none" />`,
        );
      } else {
        out.push(
          `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#2f3440" stroke="#4b5563" stroke-width="1" stroke-dasharray="3 3" />`,
          `<text x="${round(x + w / 2)}" y="${round(
            y + h / 2,
          )}" text-anchor="middle" dominant-baseline="middle" font-size="${round(
            Math.min(9, Math.max(5, w / 12)),
          )}" fill="#7c8698" font-family="ui-monospace,Consolas,monospace">${escapeXml(
            box.texture?.path ?? 'image',
          )}</text>`,
        );
      }
      break;
    }
    case 'custom':
    case 'input':
    case 'scroll_view': {
      out.push(
        `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#1f2430" fill-opacity="0.35" stroke="#6b7280" stroke-width="1" stroke-dasharray="4 3" />`,
      );
      if (box.type && box.type !== 'custom') {
        out.push(
          `<text x="${round(x + 2)}" y="${round(
            y + 8,
          )}" font-size="7" fill="#94a3b8" font-family="ui-monospace,Consolas,monospace">${escapeXml(
            box.type,
          )}</text>`,
        );
      }
      drawText(box, out, key, glyphs);
      break;
    }
    default: {
      if (box.text) drawText(box, out, key, glyphs);
      break;
    }
  }

  const clip = box.clip
    ? `<clipPath id="clip-${escapeXml(box.id)}-${box.depth}"><rect x="${x}" y="${y}" width="${w}" height="${h}" /></clipPath>`
    : '';
  if (clip) out.push(`<defs>${clip}</defs>`);
  if (box.clip) out.push(`<g clip-path="url(#clip-${escapeXml(box.id)}-${box.depth})">`);

  const children = [...box.children].sort(
    (a, b) => a.layer - b.layer || a.depth - b.depth,
  );
  for (const child of children) {
    drawBox(child, x, y, alpha, options, out, glyphs);
  }

  if (box.clip) out.push('</g>');
  out.push('</g>');
}

/** Collect every codepoint the tree's text needs (game glyph overrides included). */
function collectCodepoints(box: LayoutBox, into: Set<number>): void {
  if (box.text?.text) {
    for (const ch of box.text.text.replace(/§./gs, '')) {
      const cp = ch.codePointAt(0) ?? 0;
      if (cp !== 0x20 && cp !== 0x0a) into.add(cp);
    }
  }
  for (const child of box.children) collectCodepoints(child, into);
}

/** Render a laid out document into a standalone SVG document. */
export function renderSvg(options: SvgRenderOptions): string {
  const { result } = options;
  const scale = options.scale && options.scale > 0 ? options.scale : 1;
  const background = options.background ?? 'dark';
  const out: string[] = [];
  const w = result.width;
  const h = result.height;

  out.push(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${round(w * scale)}" height="${round(
      h * scale,
    )}" viewBox="0 0 ${w} ${h}" shape-rendering="crispEdges">`,
  );
  if (background === 'checker') {
    out.push(
      `<defs><pattern id="checker" width="16" height="16" patternUnits="userSpaceOnUse"><rect width="16" height="16" fill="#2a2f3a"/><rect width="8" height="8" fill="#323845"/><rect x="8" y="8" width="8" height="8" fill="#323845"/></pattern></defs>`,
      `<rect width="${w}" height="${h}" fill="url(#checker)" />`,
    );
  } else if (background === 'dark') {
    out.push(
      `<rect width="${w}" height="${h}" fill="#141821" />`,
      `<rect width="${w}" height="${h}" fill="none" stroke="#2b3240" />`,
    );
  }

  const glyphs = options.glyphs;
  if (glyphs) {
    // emit all glyph paths up front so <use> never forward-references
    const cps = new Set<number>();
    collectCodepoints(result.root, cps);
    const defs: string[] = [];
    for (const cp of cps) {
      const bits: string | undefined = GAME_GLYPHS[cp] ?? glyphs.get(cp);
      if (!bits) continue;
      const d = glyphPath(bits);
      if (d) defs.push(`<path id="mcxg${cp.toString(16)}" d="${d}" />`);
    }
    if (defs.length > 0) out.push(`<defs>${defs.join('')}</defs>`);
  }

  drawBox(result.root, 0, 0, 1, options, out, options.glyphs);
  out.push('</svg>');
  return out.join('');
}

/**
 * Render one text box as a self-contained inline SVG (glyph defs included),
 * for the browser preview's DOM painting. Returns `undefined` when the glyph
 * data is insufficient for this box.
 */
export function textSvgFragment(
  box: LayoutBox,
  glyphs: Map<number, string>,
): string | undefined {
  if (!box.text || !box.text.text) return undefined;
  const local: LayoutBox = { ...box, x: 0, y: 0 };
  const defs = new Map<number, string>();
  const pieces: string[] = [];
  if (!drawTextGlyphs(local, pieces, glyphs, defs)) return undefined;
  const w = round(Math.max(box.w, 1));
  const h = round(Math.max(box.h, 1));
  const defMarkup =
    defs.size > 0
      ? `<defs>${[...defs]
          .map(([cp, d]) => `<path id="mcxg${cp.toString(16)}" d="${d}" />`)
          .join('')}</defs>`
      : '';
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" ` +
    `viewBox="0 0 ${w} ${h}" shape-rendering="crispEdges" ` +
    `style="position:absolute;inset:0;pointer-events:none">${defMarkup}${pieces.join('')}</svg>`
  );
}

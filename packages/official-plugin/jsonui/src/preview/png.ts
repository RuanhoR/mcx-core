import { deflateSync } from 'node:zlib';
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
import type { GlyphMap } from './fonts.js';
import { BASE_FONT_SIZE, type LayoutBox, type LayoutResult } from './layout.js';

/**
 * Server side rasteriser for screenshots.
 *
 * It consumes the same `LayoutBox` tree as the browser preview, so geometry is
 * identical, and it depends on nothing but `node:zlib` — no browser, no native
 * image library, no external process. Text is drawn with Unifont bitmaps when
 * glyph data is available (the same calibrated font the game uses); otherwise
 * it falls back to the embedded 5×7 font below.
 */
interface Rgba {
  r: number;
  g: number;
  b: number;
  a: number;
}

const FONT: Record<string, string> = {
  ' ': '00000 00000 00000 00000 00000 00000 00000',
  A: '01110 10001 10001 11111 10001 10001 10001',
  B: '11110 10001 10001 11110 10001 10001 11110',
  C: '01110 10001 10000 10000 10000 10001 01110',
  D: '11110 10001 10001 10001 10001 10001 11110',
  E: '11111 10000 10000 11110 10000 10000 11111',
  F: '11111 10000 10000 11110 10000 10000 10000',
  G: '01110 10001 10000 10111 10001 10001 01111',
  H: '10001 10001 10001 11111 10001 10001 10001',
  I: '01110 00100 00100 00100 00100 00100 01110',
  J: '00111 00010 00010 00010 00010 10010 01100',
  K: '10001 10010 10100 11000 10100 10010 10001',
  L: '10000 10000 10000 10000 10000 10000 11111',
  M: '10001 11011 10101 10101 10001 10001 10001',
  N: '10001 11001 10101 10011 10001 10001 10001',
  O: '01110 10001 10001 10001 10001 10001 01110',
  P: '11110 10001 10001 11110 10000 10000 10000',
  Q: '01110 10001 10001 10001 10101 10010 01101',
  R: '11110 10001 10001 11110 10100 10010 10001',
  S: '01111 10000 10000 01110 00001 00001 11110',
  T: '11111 00100 00100 00100 00100 00100 00100',
  U: '10001 10001 10001 10001 10001 10001 01110',
  V: '10001 10001 10001 10001 10001 01010 00100',
  W: '10001 10001 10001 10101 10101 11011 10001',
  X: '10001 10001 01010 00100 01010 10001 10001',
  Y: '10001 10001 01010 00100 00100 00100 00100',
  Z: '11111 00001 00010 00100 01000 10000 11111',
  '0': '01110 10001 10011 10101 11001 10001 01110',
  '1': '00100 01100 00100 00100 00100 00100 01110',
  '2': '01110 10001 00001 00110 01000 10000 11111',
  '3': '11111 00010 00100 00010 00001 10001 01110',
  '4': '00010 00110 01010 10010 11111 00010 00010',
  '5': '11111 10000 11110 00001 00001 10001 01110',
  '6': '00110 01000 10000 11110 10001 10001 01110',
  '7': '11111 00001 00010 00100 01000 01000 01000',
  '8': '01110 10001 10001 01110 10001 10001 01110',
  '9': '01110 10001 10001 01111 00001 00010 01100',
  '.': '00000 00000 00000 00000 00000 01100 01100',
  ',': '00000 00000 00000 00000 01100 01100 00100',
  ':': '00000 01100 01100 00000 01100 01100 00000',
  ';': '00000 01100 01100 00000 01100 01100 00100',
  '!': '00100 00100 00100 00100 00100 00000 00100',
  '?': '01110 10001 00001 00110 00100 00000 00100',
  "'": '00100 00100 00000 00000 00000 00000 00000',
  '"': '01010 01010 00000 00000 00000 00000 00000',
  '-': '00000 00000 00000 11111 00000 00000 00000',
  _: '00000 00000 00000 00000 00000 00000 11111',
  '+': '00000 00100 00100 11111 00100 00100 00000',
  '/': '00001 00010 00100 00100 01000 10000 00000',
  '%': '11001 11010 00010 00100 01000 01011 10011',
  '(': '00010 00100 01000 01000 01000 00100 00010',
  ')': '01000 00100 00010 00010 00010 00100 01000',
  '[': '01110 01000 01000 01000 01000 01000 01110',
  ']': '01110 00010 00010 00010 00010 00010 01110',
  '#': '01010 01010 11111 01010 11111 01010 01010',
  $: '00100 01111 10100 01110 00101 11110 00100',
  '*': '00000 10101 01110 11111 01110 10101 00000',
  '=': '00000 00000 11111 00000 11111 00000 00000',
  '<': '00010 00100 01000 10000 01000 00100 00010',
  '>': '01000 00100 00010 00001 00010 00100 01000',
  '~': '00000 00000 01001 10110 00000 00000 00000',
  '\\': '10000 01000 00100 00100 00010 00001 00000',
};

const GLYPHS = new Map<string, string[]>(
  Object.entries(FONT).map(([char, rows]) => [char, rows.split(' ')]),
);

function fallbackGlyph(): string[] {
  return ['11111', '10001', '10001', '10001', '10001', '10001', '11111'];
}

function glyphFor(char: string): string[] {
  const upper = char.toUpperCase();
  return GLYPHS.get(upper) ?? fallbackGlyph();
}

function parseColor(value: string | undefined, alpha = 1): Rgba {
  const text = (value ?? '').trim();
  const rgba = /^rgba?\(([^)]+)\)$/i.exec(text);
  if (rgba?.[1]) {
    const parts = rgba[1].split(/[,/\s]+/).filter(Boolean).map(Number);
    const [r = 255, g = 255, b = 255, a = 1] = parts;
    const clamp = (v: number, max: number): number =>
      Math.max(0, Math.min(max, Number.isFinite(v) ? v : max));
    return {
      r: clamp(r, 255),
      g: clamp(g, 255),
      b: clamp(b, 255),
      a: clamp(a, 1) * alpha,
    };
  }
  if (text.startsWith('#')) {
    const hex = text.slice(1);
    if (hex.length === 3) {
      const [r, g, b] = hex.split('');
      return {
        r: Number.parseInt(`${r}${r}`, 16),
        g: Number.parseInt(`${g}${g}`, 16),
        b: Number.parseInt(`${b}${b}`, 16),
        a: alpha,
      };
    }
    if (hex.length >= 6) {
      return {
        r: Number.parseInt(hex.slice(0, 2), 16),
        g: Number.parseInt(hex.slice(2, 4), 16),
        b: Number.parseInt(hex.slice(4, 6), 16),
        a: alpha,
      };
    }
  }
  return { r: 255, g: 255, b: 255, a: alpha };
}

class Raster {
  readonly width: number;
  readonly height: number;
  private readonly data: Uint8Array;

  constructor(width: number, height: number) {
    this.width = Math.max(1, Math.round(width));
    this.height = Math.max(1, Math.round(height));
    this.data = new Uint8Array(this.width * this.height * 4);
  }

  private blend(x: number, y: number, color: Rgba, alpha: number): void {
    const px = Math.round(x);
    const py = Math.round(y);
    if (px < 0 || py < 0 || px >= this.width || py >= this.height) return;
    const a = Math.max(0, Math.min(1, color.a * alpha));
    if (a <= 0.002) return;
    const offset = (py * this.width + px) * 4;
    const dstA = (this.data[offset + 3] ?? 0) / 255;
    const outA = a + dstA * (1 - a);
    if (outA <= 0) return;
    const mix = (src: number, dst: number): number =>
      (src * a + dst * dstA * (1 - a)) / outA;
    this.data[offset] = mix(color.r, this.data[offset] ?? 0);
    this.data[offset + 1] = mix(color.g, this.data[offset + 1] ?? 0);
    this.data[offset + 2] = mix(color.b, this.data[offset + 2] ?? 0);
    this.data[offset + 3] = outA * 255;
  }

  fill(color: Rgba): void {
    for (let y = 0; y < this.height; y += 1) {
      for (let x = 0; x < this.width; x += 1) {
        this.blend(x, y, color, 1);
      }
    }
  }

  rect(x: number, y: number, w: number, h: number, color: Rgba, alpha = 1): void {
    const x0 = Math.max(0, Math.round(x));
    const y0 = Math.max(0, Math.round(y));
    const x1 = Math.min(this.width, Math.round(x + w));
    const y1 = Math.min(this.height, Math.round(y + h));
    for (let py = y0; py < y1; py += 1) {
      for (let px = x0; px < x1; px += 1) {
        this.blend(px, py, color, alpha);
      }
    }
  }

  /** The game's dot rasterisation: floor the start, ceil the end, no anti-aliasing. */
  rectGame(x: number, y: number, w: number, h: number, color: Rgba, alpha = 1): void {
    const x0 = Math.max(0, Math.floor(x + 1e-6));
    const y0 = Math.max(0, Math.floor(y + 1e-6));
    const x1 = Math.min(this.width, Math.ceil(x + w - 1e-6));
    const y1 = Math.min(this.height, Math.ceil(y + h - 1e-6));
    for (let py = y0; py < y1; py += 1) {
      for (let px = x0; px < x1; px += 1) {
        this.blend(px, py, color, alpha);
      }
    }
  }

  strokeRect(
    x: number,
    y: number,
    w: number,
    h: number,
    color: Rgba,
    alpha = 1,
    dashed = false,
  ): void {
    const step = dashed ? 4 : 1;
    for (let px = 0; px < w; px += step) {
      if (dashed && Math.floor(px / 2) % 2 === 1) continue;
      this.rect(x + px, y, 1, 1, color, alpha);
      this.rect(x + px, y + h - 1, 1, 1, color, alpha);
    }
    for (let py = 0; py < h; py += step) {
      if (dashed && Math.floor(py / 2) % 2 === 1) continue;
      this.rect(x, y + py, 1, 1, color, alpha);
      this.rect(x + w - 1, y + py, 1, 1, color, alpha);
    }
  }

  glyph(
    char: string,
    x: number,
    y: number,
    cellW: number,
    cellH: number,
    color: Rgba,
    alpha: number,
  ): void {
    const rows = glyphFor(char);
    const px = cellW / 6;
    const py = cellH / 8;
    for (let row = 0; row < rows.length; row += 1) {
      const bits = rows[row] ?? '';
      for (let col = 0; col < bits.length; col += 1) {
        if (bits[col] !== '1') continue;
        this.rect(
          x + col * px,
          y + row * py,
          Math.max(1, Math.ceil(px)),
          Math.max(1, Math.ceil(py)),
          color,
          alpha,
        );
      }
    }
  }

  toPng(): Buffer {
    const stride = this.width * 4;
    const raw = Buffer.alloc((stride + 1) * this.height);
    for (let y = 0; y < this.height; y += 1) {
      raw[y * (stride + 1)] = 0;
      Buffer.from(this.data.subarray(y * stride, (y + 1) * stride)).copy(
        raw,
        y * (stride + 1) + 1,
      );
    }
    const ihdr = Buffer.alloc(13);
    ihdr.writeUInt32BE(this.width, 0);
    ihdr.writeUInt32BE(this.height, 4);
    ihdr[8] = 8;
    ihdr[9] = 6;
    ihdr[10] = 0;
    ihdr[11] = 0;
    ihdr[12] = 0;
    return Buffer.concat([
      Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
      pngChunk('IHDR', ihdr),
      pngChunk('IDAT', deflateSync(raw, { level: 9 })),
      pngChunk('IEND', Buffer.alloc(0)),
    ]);
  }
}

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let index = 0; index < 256; index += 1) {
    let value = index;
    for (let bit = 0; bit < 8; bit += 1) {
      value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
    }
    table[index] = value >>> 0;
  }
  return table;
})();

function crc32(buffer: Buffer): number {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc = (CRC_TABLE[(crc ^ byte) & 0xff] ?? 0) ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function pngChunk(type: string, data: Buffer): Buffer {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  const typeBuffer = Buffer.from(type, 'ascii');
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])), 0);
  return Buffer.concat([length, typeBuffer, data, crc]);
}

const SHADOW: Rgba = { r: 63, g: 63, b: 63, a: 1 };
const BUTTON_FILL: Rgba = { r: 139, g: 139, b: 139, a: 1 };
const BUTTON_LIGHT: Rgba = { r: 165, g: 165, b: 165, a: 1 };
const IMAGE_FILL: Rgba = { r: 47, g: 52, b: 64, a: 1 };
const IMAGE_STROKE: Rgba = { r: 75, g: 85, b: 99, a: 1 };
const CUSTOM_FILL: Rgba = { r: 31, g: 36, b: 48, a: 1 };
const CUSTOM_STROKE: Rgba = { r: 107, g: 114, b: 128, a: 1 };

function dimRgba(color: Rgba, factor: number): Rgba {
  return {
    r: Math.round(color.r * factor),
    g: Math.round(color.g * factor),
    b: Math.round(color.b * factor),
    a: color.a,
  };
}

/** Deterministic same-width substitute for §k (the game animates; previews stay stable). */
const OBFUSCATED_POOL =
  'abcdefghjkmnopqrsuvwxyzABCDEFGHJKLMNOPQRSTUVWXYZ0123456789#$%&+=?';

function obfuscatedChar(ch: string, index: number, unifont: boolean): string {
  if (ch === ' ') return ch;
  if (unifont) return '.';
  const width = charWidth(ch, false);
  const pool = [...OBFUSCATED_POOL].filter(c => charWidth(c, false) === width);
  if (pool.length === 0) return ch;
  return pool[index % pool.length] ?? ch;
}

function glyphBitsFor(
  ch: string,
  glyphs: GlyphMap | undefined,
): string | undefined {
  const cp = ch.codePointAt(0) ?? 0;
  return GAME_GLYPHS[cp] ?? glyphs?.get(cp);
}

/**
 * Draw text with Unifont bitmaps, mirroring the SVG renderer exactly; returns
 * `false` when the glyph data is insufficient so the caller can fall back.
 */
function drawTextGlyphs(
  raster: Raster,
  box: LayoutBox,
  offsetX: number,
  offsetY: number,
  alpha: number,
  color: Rgba,
  glyphs: GlyphMap,
  factor: number,
): boolean {
  const text = box.text;
  if (!text || !text.text) return true;
  const fontScale = text.fontSize / BASE_FONT_SIZE;
  const unifont = usesUnifont(text.text);

  // every codepoint must be available before anything is drawn
  for (const ch of text.text.replace(/§./gs, '')) {
    const cp = ch.codePointAt(0) ?? 0;
    if (cp !== 0x20 && cp !== 0x0a && !glyphBitsFor(ch, glyphs)) return false;
  }

  const rowsCache = new Map<number, { w: number; rows: number[] }>();
  const drawGlyph = (
    ch: string,
    x: number,
    y: number,
    fill: Rgba,
    italic: boolean,
  ): void => {
    const cp = ch.codePointAt(0) ?? 0;
    if (cp === 0x20) return;
    const bits = glyphBitsFor(ch, glyphs);
    if (!bits) return;
    let parsed = rowsCache.get(cp);
    if (!parsed) {
      const w = bits.length === 64 ? 16 : 8;
      const rows: number[] = [];
      for (let i = 0; i < bits.length; i += w / 4)
        rows.push(Number.parseInt(bits.slice(i, i + w / 4), 16));
      parsed = { w, rows };
      rowsCache.set(cp, parsed);
    }
    // ASCII (Minecraft default font): one dot cell = 1 UI px; Unifont: half
    const cell = unifont ? fontScale / 2 : fontScale;
    for (let r = 0; r < parsed.rows.length; r += 1) {
      const rowBits = parsed.rows[r] ?? 0;
      for (let c = 0; c < parsed.w; c += 1) {
        if ((rowBits >> (parsed.w - 1 - c)) & 1) {
          // italic: glyph top shifted right 1 UI px relative to the bottom
          const dx = italic
            ? fontScale * (1 - (r * cell) / (8 * fontScale))
            : 0;
          raster.rectGame(
            x + c * cell + dx,
            y + r * cell,
            cell,
            cell,
            fill,
            alpha,
          );
        }
      }
    }
  };

  const drawRuns = (
    line: string,
    x0: number,
    y: number,
    styleIn: RunStyle,
  ): RunStyle => {
    const { runs, end } = parseRich(line, styleIn);
    // advances accumulate in fs=1 UI px and are scaled by fontScale when drawn
    let x = 0;
    let charIndex = 0;
    for (const run of runs) {
      const runColor = run.style.color
        ? parseColor(run.style.color, alpha)
        : color;
      const shadowColor = dimRgba(runColor, 0.25);
      const passes: { dx: number; dy: number; fill: Rgba }[] = [];
      if (text.shadow) {
        passes.push({ dx: fontScale, dy: fontScale, fill: shadowColor });
      }
      passes.push({ dx: 0, dy: 0, fill: runColor });
      const italic = run.style.italic;
      for (const ch of run.text) {
        const shown = run.style.obfuscated
          ? obfuscatedChar(ch, charIndex, unifont)
          : ch;
        for (const pass of passes) {
          drawGlyph(shown, x0 + (x + pass.dx) * fontScale, y + pass.dy * fontScale, pass.fill, italic);
          if (run.style.bold) {
            drawGlyph(
              shown,
              x0 + (x + pass.dx + boldExtra(shown, unifont)) * fontScale,
              y + pass.dy * fontScale,
              pass.fill,
              italic,
            );
          }
        }
        x += charWidth(shown, unifont);
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
      for (const ch of run.text) {
        w += charWidth(ch, unifont) + (run.style.bold ? boldExtra(ch, unifont) : 0);
      }
    }
    return w;
  });

  const linePitch = LINE_HEIGHT * fontScale;
  const blockHeight = text.lines.length * linePitch;
  const vCenter = box.kind === 'button' || box.kind === 'toggle';
  const startY = vCenter
    ? offsetY + box.y + (box.h - blockHeight) / 2
    : offsetY + box.y;

  let style: RunStyle = PLAIN;
  text.lines.forEach((line, index) => {
    const lineWidth = (widths[index] ?? 0) * fontScale;
    const x0 =
      text.align === 'left'
        ? offsetX + box.x
        : text.align === 'right'
          ? offsetX + box.x + box.w - lineWidth
          : offsetX + box.x + (box.w - lineWidth) / 2;
    const y = startY + index * linePitch + GLYPH_TOP * fontScale;
    style = drawRuns(line, x0, y, style);
  });
  return true;
}

function drawText(
  raster: Raster,
  box: LayoutBox,
  offsetX: number,
  offsetY: number,
  alpha: number,
  glyphs: GlyphMap | undefined,
  factor: number,
): void {
  const text = box.text;
  if (!text || !text.text) return;
  const color = parseColor(text.color, text.dynamic ? alpha * 0.85 : alpha);
  if (glyphs && drawTextGlyphs(raster, box, offsetX, offsetY, alpha, color, glyphs, factor)) {
    return;
  }
  // fallback: the built-in 5x7 uppercase font (no unifont data available)
  const lines = text.text.split('\n');
  const lineHeight = text.fontSize * 1.18;
  const advance = text.fontSize * 0.6;
  const totalHeight = lines.length * lineHeight;
  const startY = offsetY + box.y + box.h / 2 - totalHeight / 2;
  lines.forEach((line, index) => {
    const width = line.length * advance;
    const baseX =
      text.align === 'left'
        ? offsetX + box.x + 1
        : text.align === 'right'
          ? offsetX + box.x + box.w - width - 1
          : offsetX + box.x + (box.w - width) / 2;
    const baseY = startY + index * lineHeight;
    for (let i = 0; i < line.length; i += 1) {
      const char = line[i] ?? '';
      const x = baseX + i * advance;
      if (text.shadow) {
        raster.glyph(char, x + 1, baseY + 1, advance, lineHeight, SHADOW, alpha);
      }
      raster.glyph(char, x, baseY, advance, lineHeight, color, alpha);
    }
  });
}

function drawBox(
  raster: Raster,
  box: LayoutBox,
  offsetX: number,
  offsetY: number,
  parentAlpha: number,
  glyphs: GlyphMap | undefined,
  factor: number,
): void {
  const alpha = Math.max(0, Math.min(1, box.alpha * parentAlpha));
  if (alpha <= 0.002) return;
  const x = offsetX + box.x;
  const y = offsetY + box.y;

  switch (box.kind) {
    case 'button':
    case 'toggle': {
      raster.rect(x, y, box.w, box.h, BUTTON_FILL, alpha);
      raster.rect(x, y, box.w, Math.max(1, box.h * 0.45), BUTTON_LIGHT, alpha * 0.55);
      raster.strokeRect(x, y, box.w, box.h, { r: 0, g: 0, b: 0, a: 1 }, alpha);
      drawText(raster, box, offsetX, offsetY, alpha, glyphs, factor);
      break;
    }
    case 'label':
      drawText(raster, box, offsetX, offsetY, alpha, glyphs, factor);
      break;
    case 'image': {
      const draw = box.draw;
      raster.rect(
        x + (draw?.x ?? 0),
        y + (draw?.y ?? 0),
        draw?.w ?? box.w,
        draw?.h ?? box.h,
        IMAGE_FILL,
        alpha,
      );
      raster.strokeRect(x + (draw?.x ?? 0), y + (draw?.y ?? 0), draw?.w ?? box.w, draw?.h ?? box.h, IMAGE_STROKE, alpha, true);
      break;
    }
    case 'custom':
    case 'input':
    case 'scroll_view':
      raster.rect(x, y, box.w, box.h, CUSTOM_FILL, alpha * 0.35);
      raster.strokeRect(x, y, box.w, box.h, CUSTOM_STROKE, alpha, true);
      drawText(raster, box, offsetX, offsetY, alpha, glyphs, factor);
      break;
    default:
      if (box.text) drawText(raster, box, offsetX, offsetY, alpha, glyphs, factor);
      break;
  }

  const children = [...box.children].sort(
    (a, b) => a.layer - b.layer || a.depth - b.depth,
  );
  for (const child of children) drawBox(raster, child, x, y, alpha, glyphs, factor);
}

export interface PngRenderOptions {
  result: LayoutResult;
  background?: 'checker' | 'dark' | 'transparent';
  /** pixel density multiplier (1 = logical pixels) */
  scale?: number;
  /** Unifont bitmaps (codepoint → hex rows); text falls back without them */
  glyphs?: GlyphMap | undefined;
}

function scaleBox(box: LayoutBox, factor: number): LayoutBox {
  return {
    ...box,
    x: box.x * factor,
    y: box.y * factor,
    w: box.w * factor,
    h: box.h * factor,
    text: box.text
      ? { ...box.text, fontSize: box.text.fontSize * factor }
      : undefined,
    children: box.children.map(child => scaleBox(child, factor)),
  };
}

/** Rasterise a laid out document into a PNG buffer. */
export function renderPng(options: PngRenderOptions): Buffer {
  const factor =
    options.scale && options.scale > 0 ? Math.min(Math.max(options.scale, 0.25), 8) : 1;
  const result =
    factor === 1
      ? options.result
      : {
          root: scaleBox(options.result.root, factor),
          width: Math.round(options.result.width * factor),
          height: Math.round(options.result.height * factor),
        };
  const raster = new Raster(result.width, result.height);
  const background = options.background ?? 'dark';

  if (background === 'dark') {
    raster.fill({ r: 20, g: 24, b: 33, a: 1 });
  } else if (background === 'checker') {
    const cell = Math.max(4, Math.round(8 * factor));
    raster.fill({ r: 42, g: 47, b: 58, a: 1 });
    for (let y = 0; y < raster.height; y += cell) {
      for (let x = 0; x < raster.width; x += cell) {
        if ((Math.floor(x / cell) + Math.floor(y / cell)) % 2 === 0) continue;
        raster.rect(x, y, cell, cell, { r: 50, g: 56, b: 69, a: 1 });
      }
    }
  }

  drawBox(raster, result.root, 0, 0, 1, options.glyphs, factor);
  return raster.toPng();
}

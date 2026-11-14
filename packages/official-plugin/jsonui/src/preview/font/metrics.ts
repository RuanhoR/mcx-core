/**
 * Font metrics calibrated against a real Bedrock device (ported from the cui
 * framework, calibrated 2026-11):
 *
 * - The font used by a whole run of text is decided by its content: any
 *   non-ASCII character (e.g. CJK) makes the entire run use Unifont; only
 *   pure-ASCII text uses the Minecraft default font.
 * - Minecraft default font widths: `! ' , . : ; i |` 2, `` l ` `` 3,
 *   `I t [ ] space` 4, `f k < > ( ) { } " *` 5, `~` 7, everything else 6.
 * - Unifont advance = ink width / 2 + 1 (half-pixel precision): most CJK
 *   glyphs are 8.5, 「中」 is 6.5, full-width comma 2, full-width period 3.
 * - Bold adds 1 (Minecraft font) / 0.5 (Unifont) per glyph.
 * - Line height is 10 UI px (glyph 8 + leading 2); §-codes take no width.
 */
import { GAME_GLYPHS } from './gameGlyphs.js';
import { UNIFONT_HALF } from './unifontWidths.js';

export const LINE_HEIGHT = 10;
/** glyph (8 tall) top offset inside a 10-tall line */
export const GLYPH_TOP = 1;
export const GLYPH_HEIGHT = 8;

const ASCII: Record<string, number> = {};
for (const ch of "!',.:;i|") ASCII[ch] = 2;
for (const ch of 'l`') ASCII[ch] = 3;
for (const ch of 'It[] ') ASCII[ch] = 4;
for (const ch of 'fk<>(){}"*') ASCII[ch] = 5;
for (const ch of '~') ASCII[ch] = 7;

/** Is this an ASCII printable character? */
export const isAscii = (ch: string): boolean => {
  const c = ch.codePointAt(0) ?? 0;
  return c >= 0x20 && c <= 0x7e;
};

/** Will this text be drawn with Unifont (any non-ASCII printable; §-codes and newlines don't count)? */
export const usesUnifont = (text: string): boolean =>
  /[^\x20-\x7e\n]/.test(text.replace(/§./g, ''));

/** Unifont advance in UI px (may be x.5); game glyphs (real-device samples) win over the table. */
export function unifontWidth(ch: string): number {
  const cp = ch.codePointAt(0) ?? 0;
  const bits = GAME_GLYPHS[cp];
  if (bits) {
    const w = bits.length === 64 ? 16 : 8;
    let lo = -1;
    let hi = -1;
    const rows: number[] = [];
    for (let i = 0; i < bits.length; i += w / 4)
      rows.push(Number.parseInt(bits.slice(i, i + w / 4), 16));
    for (let x = 0; x < w; x += 1)
      if (rows.some(r => (r >> (w - 1 - x)) & 1)) {
        if (lo < 0) lo = x;
        hi = x;
      }
    if (lo >= 0) return (hi - lo + 1) / 2 + 1;
  }
  if (cp >= 0x20 && cp < 0x10000) {
    const half = Number.parseInt(UNIFONT_HALF[cp - 0x20] ?? '', 36);
    if (half) return half / 2;
  }
  return 8.5;
}

/** Advance of one character in UI px. */
export function charWidth(ch: string, unifont = !isAscii(ch)): number {
  if (!unifont) return ASCII[ch] ?? 6;
  return unifontWidth(ch);
}

/** Extra advance for bold text: Minecraft font 1, Unifont 0.5. */
export const boldExtra = (ch: string, unifont = !isAscii(ch)): number =>
  unifont ? 0.5 : 1;

/** Strip § format codes. */
export const stripFormat = (s: string): string => s.replace(/§./g, '');

/** Width of a text run in UI px; bold state carries in via `bold`. */
export function textWidth(
  s: string,
  scale = 1,
  bold = false,
  unifont = usesUnifont(s),
): number {
  let w = 0;
  for (let i = 0; i < s.length; i += 1) {
    if (s[i] === '§' && i + 1 < s.length) {
      const c = (s[i + 1] ?? '').toLowerCase();
      if (c === 'l') bold = true;
      else if (c === 'r') bold = false;
      i += 1;
      continue;
    }
    const cp = s.codePointAt(i) ?? 0;
    const ch = String.fromCodePoint(cp);
    if (cp > 0xffff) i += 1;
    w += charWidth(ch, unifont) + (bold ? boldExtra(ch, unifont) : 0);
  }
  return w * scale;
}

export interface TextMetrics {
  lines: string[];
  width: number;
  height: number;
}

/**
 * The game only wraps at spaces (real device 1.20.1 / 1.23.0): a whole
 * word that does not fit moves to the next line as-is; only a single word
 * longer than a full line is broken character by character.
 */
function splitWords(para: string): string[] {
  return para.match(/ +|[^ ]+/g) ?? [];
}

/**
 * Measure / wrap: paragraphs split on `\n`; with a maxWidth the text wraps
 * greedily with the game's rules.
 */
export function measureText(
  text: string,
  scale = 1,
  maxWidth = Number.POSITIVE_INFINITY,
): TextMetrics {
  const uni = usesUnifont(text);
  const tw = (s: string): number => textWidth(s, scale, false, uni);
  const lines: string[] = [];
  for (const para of text.split('\n')) {
    if (maxWidth === Number.POSITIVE_INFINITY) {
      lines.push(para);
      continue;
    }
    let line = '';
    for (const word of splitWords(para)) {
      if (/^ +$/.test(word)) {
        if (line) line += word;
        continue;
      }
      if (tw(line + word) <= maxWidth) {
        line += word;
        continue;
      }
      if (tw(word) <= maxWidth) {
        if (line.trim()) lines.push(line.trimEnd());
        line = word;
        continue;
      }
      for (const ch of word.match(/§.|./gsu) ?? []) {
        if (line.trim() && tw(line + ch) > maxWidth) {
          lines.push(line.trimEnd());
          line = '';
        }
        line += ch;
      }
    }
    lines.push(line.trimEnd());
  }
  const width = Math.max(0, ...lines.map(tw));
  return { lines, width, height: Math.max(lines.length, 1) * LINE_HEIGHT * scale };
}

/** Bedrock § colors (§g onwards are Bedrock-exclusive material colors). */
export const BEDROCK_COLORS: Record<string, string> = {
  '0': '#000000', '1': '#0000AA', '2': '#00AA00', '3': '#00AAAA',
  '4': '#AA0000', '5': '#AA00AA', '6': '#FFAA00', '7': '#AAAAAA',
  '8': '#555555', '9': '#5555FF', a: '#55FF55', b: '#55FFFF',
  c: '#FF5555', d: '#FF55FF', e: '#FFFF55', f: '#FFFFFF',
  g: '#DDD605', h: '#E3D4D1', i: '#CECACA', j: '#443A3B',
  m: '#971607', n: '#B4684D', p: '#DEB12D', q: '#47A036',
  s: '#2CBAA8', t: '#21497B', u: '#9A5CC6', v: '#EB7114',
};

export interface RunStyle {
  color: string | undefined;
  bold: boolean;
  italic: boolean;
  obfuscated: boolean;
}

export const PLAIN: RunStyle = {
  color: undefined,
  bold: false,
  italic: false,
  obfuscated: false,
};

export interface Run {
  text: string;
  style: RunStyle;
}

/** Apply one § code (Bedrock semantics: color does not clear bold/italic; §r resets). */
export function applyCode(style: RunStyle, code: string): RunStyle {
  const c = code.toLowerCase();
  if (c === 'r') return { ...PLAIN };
  if (c === 'l') return { ...style, bold: true };
  if (c === 'o') return { ...style, italic: true };
  if (c === 'k') return { ...style, obfuscated: true };
  if (BEDROCK_COLORS[c]) return { ...style, color: BEDROCK_COLORS[c] };
  return style;
}

/** Split a text run into styled segments. */
export function parseRich(
  text: string,
  start: RunStyle = PLAIN,
): { runs: Run[]; end: RunStyle } {
  const runs: Run[] = [];
  let style = start;
  let buf = '';
  for (let i = 0; i < text.length; i += 1) {
    if (text[i] === '§' && i + 1 < text.length) {
      if (buf) {
        runs.push({ text: buf, style });
        buf = '';
      }
      style = applyCode(style, text[i + 1] ?? '');
      i += 1;
      continue;
    }
    buf += text[i];
  }
  if (buf) runs.push({ text: buf, style });
  return { runs, end: style };
}

/** Collect the codepoints a screen needs glyphs for (§ codes and newlines excluded). */
export function codepointsOf(texts: Iterable<string>): number[] {
  const set = new Set<number>();
  for (const text of texts) {
    for (const ch of text.replace(/§./gs, '')) {
      if (ch === '\n') continue;
      set.add(ch.codePointAt(0) ?? 0);
    }
  }
  return [...set];
}

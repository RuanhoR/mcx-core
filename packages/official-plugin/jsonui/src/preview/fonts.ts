/**
 * Glyph font source for the preview: GNU Unifont bitmaps (dual licensed
 * GPLv2+ with the font embedding exception / SIL OFL 1.1), the same data the
 * game's non-ASCII text is calibrated against.
 *
 * The `.hex` file is NOT shipped in the package. The server looks for it in
 * the user cache (`~/.mcx/fonts/unifont.hex[.gz]`), honours `MCX_UNIFONT`,
 * and otherwise downloads it once from unifoundry.com. When no font data is
 * available the preview falls back to system fonts.
 */
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import * as zlib from 'node:zlib';

export type GlyphMap = Map<number, string>;

const FONT_URLS = [
  // GNU mirror (reachable where unifoundry is not)
  'https://mirrors.tuna.tsinghua.edu.cn/gnu/unifont/unifont-16.0.04/unifont_all-16.0.04.hex.gz',
  'https://ftp.gnu.org/gnu/unifont/unifont-16.0.04/unifont_all-16.0.04.hex.gz',
  'https://unifoundry.com/pub/unifont-16.0.04/font-builds/unifont-16.0.04.hex.gz',
];
const CACHE_DIR = path.join(os.homedir(), '.mcx', 'fonts');
const CACHE_FILE = path.join(CACHE_DIR, 'unifont.hex.gz');

let cached: Promise<GlyphMap | undefined> | undefined;

function parseHex(text: string): GlyphMap {
  const glyphs: GlyphMap = new Map();
  for (const line of text.split('\n')) {
    const index = line.indexOf(':');
    if (index <= 0) continue;
    const cp = Number.parseInt(line.slice(0, index), 16);
    const bits = line.slice(index + 1).trim();
    if (Number.isFinite(cp) && /^[0-9a-f]+$/i.test(bits) && (bits.length === 32 || bits.length === 64)) {
      glyphs.set(cp, bits);
    }
  }
  return glyphs;
}

function readFontFile(file: string): GlyphMap | undefined {
  try {
    const bytes = fs.readFileSync(file);
    const isGzip = bytes[0] === 0x1f && bytes[1] === 0x8b;
    const text = isGzip ? zlib.gunzipSync(bytes).toString('utf-8') : bytes.toString('utf-8');
    const glyphs = parseHex(text);
    return glyphs.size > 0 ? glyphs : undefined;
  } catch {
    return undefined;
  }
}

async function download(url: string): Promise<Buffer> {
  const response = await fetch(url, { signal: AbortSignal.timeout(45_000) });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return Buffer.from(await response.arrayBuffer());
}

async function loadGlyphs(): Promise<GlyphMap | undefined> {
  const env = process.env['MCX_UNIFONT'];
  if (env) {
    const glyphs = readFontFile(env);
    if (glyphs) return glyphs;
  }
  const cachedFile = readFontFile(CACHE_FILE);
  if (cachedFile) return cachedFile;
  try {
    let bytes: Buffer | undefined;
    let lastError: unknown;
    for (const url of FONT_URLS) {
      try {
        bytes = await download(url);
        break;
      } catch (error) {
        lastError = error;
      }
    }
    if (!bytes) throw lastError ?? new Error('no font source reachable');
    try {
      fs.mkdirSync(CACHE_DIR, { recursive: true });
      fs.writeFileSync(CACHE_FILE, bytes);
    } catch {
      // cache write failures are harmless, the data is still usable
    }
    const isGzip = bytes[0] === 0x1f && bytes[1] === 0x8b;
    const glyphs = parseHex(
      isGzip ? zlib.gunzipSync(bytes).toString('utf-8') : bytes.toString('utf-8'),
    );
    return glyphs.size > 0 ? glyphs : undefined;
  } catch {
    return undefined;
  }
}

/** Load the glyph font (cached per process); `undefined` when unavailable. */
export function loadGlyphFont(): Promise<GlyphMap | undefined> {
  cached ??= loadGlyphs();
  return cached;
}

/** Extract the bitmaps a screen needs from the full font. */
export function glyphsForCodepoints(
  font: GlyphMap,
  codepoints: Iterable<number>,
): GlyphMap {
  const out: GlyphMap = new Map();
  for (const cp of codepoints) {
    const bits = font.get(cp);
    if (bits) out.set(cp, bits);
  }
  return out;
}

/** Reset the cached font (used by tests). */
export function resetGlyphFontCache(): void {
  cached = undefined;
}

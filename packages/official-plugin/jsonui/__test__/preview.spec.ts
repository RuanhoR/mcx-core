import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import {
  collectScreens,
  layoutDocument,
  renderSvg,
  resolveLength,
  startPreviewServer,
} from '../src/preview/index.js';
import type { JsonUIValue } from '../src/types.js';
import { DEFAULT_HOST, DEFAULT_PORT, parseArgs } from '../src/cli.js';

const SHOP = `<Ui type="jsonui" namespace="shop" availability="server_form" size="[100%,100%]">
  <panel id="bg" size="[100%,100%]" />
  <stack_panel id="list" orientation="vertical" anchor_from="center" anchor_to="center">
    <button id="buy" text="Buy" size="[200,20]" />
    <button id="sell" text="Sell" size="[200,20]" />
  </stack_panel>
  <label id="hint" text="#hint_text" anchor_from="bottom_middle" anchor_to="bottom_middle" offset="[0,-10px]" color="[1,0.8,0.2,1]" />
</Ui>`;

const SCORE = `<Ui type="jsonui" namespace="score" variables='{"caption":"Score"}' size="[100%,100%]">
  <label id="caption" text="$caption" offset="[6px,6px]" />
  <image id="icon" texture="textures/ui/icon" size="[16,16]" />
</Ui>`;

let projectDir = '';

function writeProject(): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'mcx-preview-'));
  fs.mkdirSync(path.join(dir, 'src', 'ui'), { recursive: true });
  fs.mkdirSync(path.join(dir, 'src', 'hud'), { recursive: true });
  fs.writeFileSync(path.join(dir, 'src', 'ui', 'shop.mcx'), SHOP, 'utf-8');
  fs.writeFileSync(path.join(dir, 'src', 'hud', 'score.mcx'), SCORE, 'utf-8');
  fs.writeFileSync(
    path.join(dir, 'src', 'plain.mcx'),
    '<Form type="action" title="nope"><Button text="ok" /></Form>',
    'utf-8',
  );
  fs.mkdirSync(path.join(dir, 'node_modules', 'dep'), { recursive: true });
  fs.writeFileSync(
    path.join(dir, 'node_modules', 'dep', 'ignored.mcx'),
    SHOP,
    'utf-8',
  );
  return dir;
}

beforeEach(() => {
  projectDir = writeProject();
});

afterEach(() => {
  fs.rmSync(projectDir, { recursive: true, force: true });
});

describe('collectScreens', () => {
  it('finds jsonui files, skips other mcx files and node_modules', () => {
    const collection = collectScreens(projectDir);
    expect(collection.screens.map(screen => screen.relative)).toEqual([
      'src/hud/score.mcx',
      'src/ui/shop.mcx',
    ]);
    expect(collection.problems).toEqual([]);
    const shop = collection.screens.find(screen => screen.name === 'shop');
    expect(shop?.namespace).toBe('shop');
    expect(shop?.rootId).toBe('shop');
    expect(shop?.availability).toBe('server_form');
    expect(shop?.type).toBe('screen');
  });

  it('builds a directory tree of the screens', () => {
    const collection = collectScreens(projectDir);
    const src = collection.tree.children.find(
      child => child.kind === 'dir' && child.name === 'src',
    );
    expect(src?.kind).toBe('dir');
    if (src?.kind !== 'dir') throw new Error('missing src dir');
    expect(src.children.map(child => child.name)).toEqual(['hud', 'ui']);
    const ui = src.children.find(child => child.kind === 'dir' && child.name === 'ui');
    if (ui?.kind !== 'dir') throw new Error('missing ui dir');
    expect(ui.children.map(child => child.name)).toEqual(['shop']);
  });

  it('keeps a single file when only is set', () => {
    const only = path.join(projectDir, 'src', 'hud', 'score.mcx');
    const collection = collectScreens(projectDir, { only });
    expect(collection.screens).toHaveLength(1);
    expect(collection.screens[0]?.name).toBe('score');
  });
});

describe('resolveLength', () => {
  it('handles px, percent and arithmetic', () => {
    expect(resolveLength('12px', 100, undefined)).toBe(12);
    expect(resolveLength(12, 100, undefined)).toBe(12);
    expect(resolveLength('50%', 200, undefined)).toBe(100);
    expect(resolveLength('100% - 4px', 200, undefined)).toBe(196);
    expect(resolveLength('50%x', 200, { w: 40, h: 10 })).toBe(20);
    expect(resolveLength('default', 200, undefined)).toBeUndefined();
  });

  it('resolves variables', () => {
    expect(resolveLength('$pad', 100, undefined, { pad: 7 })).toBe(7);
  });
});

describe('layoutDocument', () => {
  const document: Record<string, JsonUIValue> = {
    namespace: 'demo',
    demo: {
      type: 'screen',
      size: ['100%', '100%'],
      variables: { pad: 8 },
      controls: [
        { bg: { type: 'panel', size: ['100%', '100%'] } },
        {
          title: {
            type: 'label',
            text: 'Hi',
            size: [100, 20],
            anchor_from: 'center',
            anchor_to: 'center',
            offset: [0, '$pad'],
          },
        },
      ],
    },
  };

  it('centers a control with its anchor pair and offset', () => {
    const result = layoutDocument(document, 'demo', { width: 400, height: 200 });
    const title = result.root.children.find(child => child.id === 'title');
    expect(title?.x).toBe(150);
    expect(title?.y).toBe(98);
    expect(title?.w).toBe(100);
    expect(title?.h).toBe(20);
  });

  it('stacks stack_panel children vertically', () => {
    const collection = collectScreens(projectDir);
    const shop = collection.screens.find(screen => screen.name === 'shop');
    if (!shop) throw new Error('missing shop');
    const result = layoutDocument(shop.document, shop.rootId, {
      width: 400,
      height: 200,
    });
    const list = result.root.children.find(child => child.id === 'list');
    expect(list?.kind).toBe('stack_panel');
    expect(list?.children.map(child => [child.id, child.x, child.y])).toEqual([
      ['buy', 0, 0],
      ['sell', 0, 20],
    ]);
  });

  it('auto sizes labels from their text', () => {
    const doc: Record<string, JsonUIValue> = {
      ns: { type: 'screen', controls: [{ t: { type: 'label', text: 'ABCD' } }] },
    };
    const result = layoutDocument(doc, 'ns', { width: 200, height: 100 });
    const label = result.root.children[0];
    // calibrated widths: A/B/C/D are 6 UI px each, one game line is 10 tall
    expect(label?.w).toBe(24);
    expect(label?.h).toBe(10);
  });

  it('measures CJK text with the calibrated Unifont widths', () => {
    // 「中」is 6.5 UI px wide (ink 5.5 / 2 + 1), full-width comma 2
    const result = layoutDocument(
      { ns: { type: 'screen', controls: [{ t: { type: 'label', text: '中' } }] } },
      'ns',
      { width: 200, height: 100 },
    );
    expect(result.root.children[0]?.w).toBe(7); // Math.round(6.5)
  });

  it('wraps label text at spaces the way the game does', () => {
    const doc: Record<string, JsonUIValue> = {
      ns: {
        type: 'screen',
        controls: [
          {
            t: {
              type: 'label',
              text: 'aaa bbb ccc',
              size: [20, 'default'],
              text_alignment: 'left',
            },
          },
        ],
      },
    };
    const result = layoutDocument(doc, 'ns', { width: 200, height: 100 });
    const label = result.root.children[0];
    // each word fits one line (3 × 6 = 18 ≤ 20) so the wrap moves whole words
    expect(label?.text?.lines).toEqual(['aaa', 'bbb', 'ccc']);
    expect(label?.h).toBe(30);
  });

  it('sums stack_panel auto size in both directions (real device %c rule)', () => {
    const doc: Record<string, JsonUIValue> = {
      ns: {
        type: 'screen',
        controls: [
          {
            s: {
              type: 'stack_panel',
              orientation: 'vertical',
              controls: [
                { a: { type: 'panel', size: [30, 10] } },
                { b: { type: 'panel', size: [50, 12] } },
              ],
            },
          },
        ],
      },
    };
    const result = layoutDocument(doc, 'ns', { width: 200, height: 100 });
    const stack = result.root.children[0];
    expect(stack?.w).toBe(80); // sum, not max (50)
    expect(stack?.h).toBe(22);
  });

  it('keeps image ratio when the texture size is known', () => {
    const doc: Record<string, JsonUIValue> = {
      ns: {
        type: 'screen',
        controls: [
          { img: { type: 'image', texture: 'textures/ui/test', size: [40, 10] } },
        ],
      },
    };
    const result = layoutDocument(doc, 'ns', {
      width: 200,
      height: 100,
      textureSizes: path =>
        path === 'textures/ui/test' ? ([16, 8] as [number, number]) : undefined,
    });
    const image = result.root.children[0];
    // k = min(40/16, 10/8) = 1.25 → drawn 20×10, centred horizontally
    expect(image?.draw).toEqual({ x: 10, y: 0, w: 20, h: 10 });
  });

  it('marks binding text as dynamic', () => {
    const collection = collectScreens(projectDir);
    const shop = collection.screens.find(screen => screen.name === 'shop');
    if (!shop) throw new Error('missing shop');
    const result = layoutDocument(shop.document, shop.rootId, {
      width: 400,
      height: 200,
    });
    const hint = result.root.children.find(child => child.id === 'hint');
    expect(hint?.text?.text).toBe('#hint_text');
    expect(hint?.text?.dynamic).toBe(true);
    expect(hint?.text?.color).toBe('rgba(255, 204, 51, 1)');
  });
});

describe('renderSvg', () => {
  it('renders the document into a sized svg with its texts', () => {
    const collection = collectScreens(projectDir);
    const shop = collection.screens.find(screen => screen.name === 'shop');
    if (!shop) throw new Error('missing shop');
    const result = layoutDocument(shop.document, shop.rootId, {
      width: 400,
      height: 200,
    });
    const svg = renderSvg({ result, background: 'dark', scale: 2 });
    expect(svg).toContain('width="800" height="400"');
    expect(svg).toContain('>Buy<');
    expect(svg).toContain('>Sell<');
    expect(svg).toContain('#hint_text');
    expect(svg.startsWith('<svg')).toBe(true);
    expect(svg).toContain('<rect');
  });

  it('draws text with unifont bitmaps when glyph data is available', () => {
    const doc: Record<string, JsonUIValue> = {
      ns: {
        type: 'screen',
        controls: [{ t: { type: 'label', text: 'Buy', size: [100, 20] } }],
      },
    };
    const result = layoutDocument(doc, 'ns', { width: 200, height: 100 });
    // a real unifont bitmap: 'B' (U+0042), 8 wide, 16 tall, top 8 rows inked
    const glyphs = new Map<number, string>([
      [0x42, 'fc6666667e666666' + '0'.repeat(16)],
      [0x75, '0'.repeat(32)], // u
      [0x79, '0'.repeat(32)], // y
    ]);
    const svg = renderSvg({ result, background: 'dark', glyphs });
    expect(svg).toContain('<defs><path id="mcxg42"');
    expect(svg).toContain('<use href="#mcxg42"');
    expect(svg).not.toContain('font-family');
  });

  it('falls back to system fonts when a codepoint is missing', () => {
    const doc: Record<string, JsonUIValue> = {
      ns: {
        type: 'screen',
        controls: [{ t: { type: 'label', text: 'Buy 中', size: [100, 20] } }],
      },
    };
    const result = layoutDocument(doc, 'ns', { width: 200, height: 100 });
    const glyphs = new Map<number, string>([[0x42, '0'.repeat(32)]]);
    const svg = renderSvg({ result, background: 'dark', glyphs });
    // 中 (U+4E2D) is not in the map → the whole label uses the system font
    expect(svg).toContain('font-family');
    expect(svg).not.toContain('<use href="#mcxg');
  });

  it('renders § colour codes as styled runs', () => {
    const doc: Record<string, JsonUIValue> = {
      ns: {
        type: 'screen',
        controls: [
          { t: { type: 'label', text: '§cRed§r rest', size: [200, 20] } },
        ],
      },
    };
    const result = layoutDocument(doc, 'ns', { width: 200, height: 100 });
    const glyphs = new Map<number, string>();
    for (const ch of 'Red rest')
      glyphs.set(ch.codePointAt(0) ?? 0, 'ff'.repeat(16));
    const svg = renderSvg({ result, background: 'dark', glyphs });
    // §c → bedrock red #FF5555; the codes themselves take no width
    expect(svg).toContain('fill="#FF5555"');
    expect(svg).toContain('fill="#ffffff"');
    expect(svg).not.toContain('§');
  });
});

describe('preview server', () => {
  it('serves screens, documents, textures and svg screenshots', async () => {
    const handle = await startPreviewServer({
      root: projectDir,
      port: 0,
      watch: false,
      width: 400,
      height: 200,
    });
    const base = handle.url.replace(/\/$/, '');
    try {
      const screens = await fetch(`${base}/api/screens`);
      expect(screens.status).toBe(200);
      const payload = (await screens.json()) as {
        screens: { id: string }[];
        canvas: { width: number };
        watching: boolean;
      };
      expect(payload.screens).toHaveLength(2);
      expect(payload.canvas.width).toBe(400);
      expect(payload.watching).toBe(false);

      const doc = await fetch(`${base}/api/screen?id=${encodeURIComponent('src/ui/shop.mcx')}`);
      expect(doc.status).toBe(200);
      const body = (await doc.json()) as { document: Record<string, JsonUIValue> };
      expect(body.document['namespace']).toBe('shop');

      const missing = await fetch(`${base}/api/screen?id=nope.mcx`);
      expect(missing.status).toBe(404);

      const page = await fetch(`${base}/`);
      expect(page.status).toBe(200);
      expect(await page.text()).toContain('JSON UI Preview');

      const shot = await fetch(
        `${base}/api/screenshot?id=${encodeURIComponent('src/ui/shop.mcx')}&format=svg`,
      );
      expect(shot.headers.get('content-type')).toContain('image/svg+xml');
      const svg = await shot.text();
      // text is drawn with unifont glyph paths when the font is available
      expect(svg).toContain('<use href="#mcxg42"'); // 'B' of Buy


      const png = await fetch(
        `${base}/api/screenshot?id=${encodeURIComponent('src/ui/shop.mcx')}`,
      );
      expect(png.status).toBe(200);
      expect(png.headers.get('content-type')).toBe('image/png');
      const buffer = Buffer.from(await png.arrayBuffer());
      expect([...buffer.subarray(0, 8)]).toEqual([
        0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
      ]);
      expect(buffer.readUInt32BE(16)).toBe(400);
      expect(buffer.readUInt32BE(20)).toBe(200);

      const scaled = await fetch(
        `${base}/api/screenshot?id=${encodeURIComponent('src/ui/shop.mcx')}&scale=2`,
      );
      const scaledBuffer = Buffer.from(await scaled.arrayBuffer());
      expect(scaledBuffer.readUInt32BE(16)).toBe(800);

      const traversal = await fetch(`${base}/texture/../../package.json`);
      expect(traversal.status).toBe(404);
    } finally {
      await handle.close();
    }
  });
});

describe('preview cli', () => {
  it('parses port, host, size and flags', () => {
    const parsed = parseArgs([
      'preview',
      './src',
      '--port',
      '6000',
      '--host',
      '0.0.0.0',
      '--size',
      '1280x720',
      '--no-open',
      '--no-watch',
    ]);
    expect(parsed.command).toBe('preview');
    expect(parsed.dir).toBe('./src');
    expect(parsed.port).toBe(6000);
    expect(parsed.host).toBe('0.0.0.0');
    expect(parsed.width).toBe(1280);
    expect(parsed.height).toBe(720);
    expect(parsed.open).toBe(false);
    expect(parsed.watch).toBe(false);
  });

  it('supports --flag=value and defaults', () => {
    const parsed = parseArgs(['--port=7000']);
    expect(parsed.port).toBe(7000);
    expect(parsed.host).toBe(DEFAULT_HOST);
    expect(parseArgs([]).port).toBe(DEFAULT_PORT);
    expect(parseArgs(['-h']).help).toBe(true);
    expect(parseArgs(['-v']).version).toBe(true);
  });
});

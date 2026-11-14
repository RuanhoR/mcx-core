import * as fs from 'node:fs';
import * as http from 'node:http';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { collectScreens, resolveTextureFile } from './collect.js';
import type { PreviewCollection, PreviewScreen } from './collect.js';
import { layoutDocument } from './layout.js';
import { renderPng } from './png.js';
import { renderSvg } from './svg.js';

export interface PreviewServerOptions {
  /** project directory (or a single `.mcx` file) to preview */
  root: string;
  port?: number;
  host?: string;
  /** watch the project and push reload events (default true) */
  watch?: boolean;
  /** logical canvas size (default 960x540) */
  width?: number;
  height?: number;
  /** only preview this file */
  only?: string;
  log?: (message: string) => void;
}

export interface PreviewServerHandle {
  url: string;
  port: number;
  host: string;
  collection(): PreviewCollection;
  refresh(): PreviewCollection;
  close(): Promise<void>;
}

const MIME: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
};

function candidateClientBundle(): string | undefined {
  const candidates = [
    './client.js',
    './preview/client.js',
    '../preview/client.js',
  ];
  for (const candidate of candidates) {
    try {
      const url = new URL(candidate, import.meta.url);
      if (fs.existsSync(fileURLToPath(url))) return fileURLToPath(url);
    } catch {
      /* try the next candidate */
    }
  }
  return undefined;
}

function sendJson(res: http.ServerResponse, status: number, body: unknown): void {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
  });
  res.end(payload);
}

function sendText(
  res: http.ServerResponse,
  status: number,
  text: string,
  type = 'text/plain; charset=utf-8',
): void {
  res.writeHead(status, { 'content-type': type, 'cache-control': 'no-store' });
  res.end(text);
}

function screenshotName(screen: PreviewScreen, format: string): string {
  const base = path.basename(screen.name).replace(/[^\w.-]+/g, '_');
  return `${base || 'jsonui'}.${format}`;
}

export async function startPreviewServer(
  options: PreviewServerOptions,
): Promise<PreviewServerHandle> {
  const root = path.resolve(options.root);
  const width = options.width && options.width > 0 ? options.width : 960;
  const height = options.height && options.height > 0 ? options.height : 540;
  const log = options.log ?? (() => undefined);
  const collectOptions = options.only ? { only: options.only } : {};

  let collection = collectScreens(root, collectOptions);
  let clientBundle = candidateClientBundle();

  const watchersEnabled = options.watch !== false;
  const sseClients = new Set<http.ServerResponse>();

  const broadcast = (): void => {
    const payload = JSON.stringify({
      screens: collection.screens.length,
      problems: collection.problems.length,
    });
    for (const client of sseClients) {
      client.write(`event: reload\ndata: ${payload}\n\n`);
    }
  };

  const refresh = (): PreviewCollection => {
    collection = collectScreens(root, collectOptions);
    clientBundle = candidateClientBundle();
    return collection;
  };

  let timer: NodeJS.Timeout | undefined;
  let watcher: fs.FSWatcher | undefined;
  if (watchersEnabled) {
    try {
      watcher = fs.watch(root, { recursive: true }, (_event, filename) => {
        const name = typeof filename === 'string' ? filename : '';
        if (name && !/\.(mcx|json)$/i.test(name)) return;
        if (timer) clearTimeout(timer);
        timer = setTimeout(() => {
          refresh();
          log('reload');
          broadcast();
        }, 120);
      });
      watcher.on('error', () => {
        watcher?.close();
        watcher = undefined;
        log('watch disabled');
      });
    } catch {
      watcher = undefined;
    }
  }

  const findScreen = (id: string | null): PreviewScreen | undefined =>
    id ? collection.screens.find(screen => screen.id === id) : collection.screens[0];

  const server = http.createServer((req, res) => {
    const url = new URL(req.url ?? '/', 'http://localhost');
    const route = url.pathname;

    if (route === '/api/screens') {
      sendJson(res, 200, {
        root: collection.root,
        canvas: { width, height },
        screens: collection.screens.map(screen => ({
          id: screen.id,
          relative: screen.relative,
          name: screen.name,
          namespace: screen.namespace,
          rootId: screen.rootId,
          type: screen.type,
          availability: screen.availability,
          target: screen.target ?? null,
          warnings: screen.warnings.length,
        })),
        tree: collection.tree,
        problems: collection.problems,
        warnings: collection.screens.flatMap(screen => screen.warnings),
        textures: collection.textureRoots.map(item => item.name),
        watching: Boolean(watcher),
      });
      return;
    }

    if (route === '/api/screen') {
      const screen = findScreen(url.searchParams.get('id'));
      if (!screen) {
        sendJson(res, 404, { error: 'no jsonui screens found' });
        return;
      }
      sendJson(res, 200, {
        id: screen.id,
        relative: screen.relative,
        name: screen.name,
        namespace: screen.namespace,
        rootId: screen.rootId,
        type: screen.type,
        availability: screen.availability,
        target: screen.target ?? null,
        document: screen.document,
        warnings: screen.warnings,
      });
      return;
    }

    if (route === '/api/screenshot') {
      const screen = findScreen(url.searchParams.get('id'));
      if (!screen) {
        sendJson(res, 404, { error: 'no jsonui screens found' });
        return;
      }
      const format = (url.searchParams.get('format') ?? 'png').toLowerCase();
      const scale = Number.parseFloat(url.searchParams.get('scale') ?? '1');
      const canvasWidth = Number.parseInt(
        url.searchParams.get('w') ?? String(width),
        10,
      );
      const canvasHeight = Number.parseInt(
        url.searchParams.get('h') ?? String(height),
        10,
      );
      const bgRaw = (url.searchParams.get('bg') ?? 'dark').toLowerCase();
      const background: 'checker' | 'dark' | 'transparent' =
        bgRaw === 'checker' || bgRaw === 'transparent'
          ? (bgRaw as 'checker' | 'transparent')
          : 'dark';
      const layoutWidth = canvasWidth > 0 ? canvasWidth : width;
      const layoutHeight = canvasHeight > 0 ? canvasHeight : height;
      const density =
        Number.isFinite(scale) && scale > 0 ? Math.min(Math.max(scale, 0.25), 8) : 1;
      const result = layoutDocument(screen.document, screen.rootId, {
        width: layoutWidth,
        height: layoutHeight,
      });
      const download = url.searchParams.get('download') === '1';
      const disposition = download
        ? `attachment; filename="${screenshotName(screen, format === 'svg' ? 'svg' : 'png')}"`
        : 'inline';

      if (format === 'svg') {
        const svg = renderSvg({
          result,
          background,
          scale: density,
          textureUri: texturePath => {
            const file = resolveTextureFile(collection.textureRoots, texturePath);
            if (!file) return undefined;
            try {
              const ext = path.extname(file).toLowerCase();
              const mime = MIME[ext] ?? 'image/png';
              return `data:${mime};base64,${fs.readFileSync(file).toString('base64')}`;
            } catch {
              return undefined;
            }
          },
        });
        res.writeHead(200, {
          'content-type': 'image/svg+xml; charset=utf-8',
          'cache-control': 'no-store',
          'content-disposition': disposition,
        });
        res.end(svg);
        return;
      }

      // PNG is rasterised in-process: no browser, no native image library.
      const png = renderPng({ result, background, scale: density });
      res.writeHead(200, {
        'content-type': 'image/png',
        'cache-control': 'no-store',
        'content-disposition': disposition,
      });
      res.end(png);
      return;
    }

    if (route === '/events') {
      res.writeHead(200, {
        'content-type': 'text/event-stream',
        'cache-control': 'no-store',
        connection: 'keep-alive',
      });
      res.write('event: ready\ndata: {}\n\n');
      sseClients.add(res);
      req.on('close', () => sseClients.delete(res));
      return;
    }

    if (route.startsWith('/texture/')) {
      const requested = decodeURIComponent(route.slice('/texture/'.length));
      const file = resolveTextureFile(collection.textureRoots, requested);
      if (!file) {
        sendText(res, 404, 'texture not found');
        return;
      }
      try {
        const buffer = fs.readFileSync(file);
        res.writeHead(200, {
          'content-type': MIME[path.extname(file).toLowerCase()] ?? 'image/png',
          'cache-control': 'no-cache',
        });
        res.end(buffer);
      } catch {
        sendText(res, 500, 'cannot read texture');
      }
      return;
    }

    if (route === '/client.js') {
      if (!clientBundle) {
        sendText(
          res,
          404,
          'preview client bundle is missing — run `pnpm build` in @mbler/mcx-plugin-jsonui',
        );
        return;
      }
      try {
        const source = fs.readFileSync(clientBundle);
        res.writeHead(200, {
          'content-type': 'text/javascript; charset=utf-8',
          'cache-control': 'no-store',
        });
        res.end(source);
      } catch {
        sendText(res, 500, 'cannot read preview client');
      }
      return;
    }

    if (route === '/' || route === '/index.html') {
      res.writeHead(200, {
        'content-type': 'text/html; charset=utf-8',
        'cache-control': 'no-store',
      });
      res.end(renderPage({ width, height, root: collection.root }));
      return;
    }

    sendText(res, 404, 'not found');
  });

  await new Promise<void>((resolve, reject) => {
    server.once('error', reject);
    server.listen(options.port ?? 0, options.host ?? '127.0.0.1', () => {
      server.removeListener('error', reject);
      resolve();
    });
  });

  const address = server.address();
  const actualPort =
    address && typeof address === 'object' && address.port
      ? address.port
      : options.port ?? 0;
  const host = options.host ?? '127.0.0.1';

  return {
    url: `http://${host}:${actualPort}/`,
    port: actualPort,
    host,
    collection: () => collection,
    refresh,
    async close() {
      if (timer) clearTimeout(timer);
      watcher?.close();
      for (const client of sseClients) client.end();
      sseClients.clear();
      await new Promise<void>(resolve => server.close(() => resolve()));
    },
  };
}

function renderPage(context: {
  width: number;
  height: number;
  root: string;
}): string {
  const boot = JSON.stringify(context).replace(/</g, '\\u003c');
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>JSON UI Preview</title>
<style>
  :root {
    color-scheme: dark;
    --bg: #0e1116;
    --panel: #151a22;
    --panel-2: #1b212b;
    --line: #242c38;
    --text: #d7dee8;
    --muted: #7d8798;
    --accent: #4cc2a0;
    --accent-dim: #2b6f5e;
    --warn: #e0a35c;
    --mono: ui-monospace, SFMono-Regular, Consolas, 'Liberation Mono', monospace;
  }
  * { box-sizing: border-box; }
  html, body { height: 100%; margin: 0; }
  body {
    background: var(--bg);
    color: var(--text);
    font: 13px/1.5 -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
    overflow: hidden;
  }
  #app { display: grid; grid-template-rows: 44px 1fr; height: 100%; }
  header {
    display: flex; align-items: center; gap: 14px;
    padding: 0 14px; border-bottom: 1px solid var(--line);
    background: var(--panel); min-width: 0;
  }
  .brand { display: flex; align-items: center; gap: 8px; font-weight: 600; letter-spacing: .2px; }
  .dot { width: 8px; height: 8px; border-radius: 50%; background: var(--accent); box-shadow: 0 0 8px var(--accent); }
  .root-path {
    color: var(--muted); font-family: var(--mono); font-size: 11px;
    overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 34vw;
  }
  header .spacer { flex: 1; }
  .control { display: flex; align-items: center; gap: 6px; color: var(--muted); font-size: 11px; }
  select, button {
    font: inherit; color: var(--text); background: var(--panel-2);
    border: 1px solid var(--line); border-radius: 6px; padding: 4px 8px; cursor: pointer;
  }
  select:hover, button:hover { border-color: var(--accent-dim); color: #fff; }
  button.primary { background: var(--accent-dim); border-color: var(--accent-dim); color: #eafff8; }
  button.primary:hover { background: var(--accent); color: #06231c; }
  #main { display: grid; grid-template-columns: 268px 1fr auto; min-height: 0; }
  aside {
    background: var(--panel); border-right: 1px solid var(--line);
    display: flex; flex-direction: column; min-height: 0;
  }
  .aside-head {
    padding: 8px 12px; font-size: 11px; text-transform: uppercase; letter-spacing: .08em;
    color: var(--muted); border-bottom: 1px solid var(--line); display: flex; justify-content: space-between;
  }
  #tree { overflow: auto; padding: 6px 6px 20px; flex: 1; }
  .node { display: flex; align-items: center; gap: 6px; padding: 3px 6px; border-radius: 5px; cursor: pointer; color: var(--text); }
  .node:hover { background: var(--panel-2); }
  .node.active { background: #1d3b33; color: #d6fff2; }
  .node .caret { width: 10px; color: var(--muted); font-size: 10px; }
  .node .label { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .node.dir { color: var(--muted); }
  .node .badge {
    margin-left: auto; font-size: 9px; color: var(--muted); font-family: var(--mono);
    border: 1px solid var(--line); border-radius: 4px; padding: 0 4px;
  }
  .children { margin-left: 12px; }
  #stage { overflow: auto; display: grid; place-items: center; padding: 26px; min-width: 0; }
  .canvas-wrap { position: relative; box-shadow: 0 20px 60px rgba(0,0,0,.55); border-radius: 4px; }
  #canvas { position: relative; overflow: hidden; background: #141821; transform-origin: top left; }
  #canvas.checker {
    background-image: linear-gradient(45deg, #2a2f3a 25%, transparent 25%), linear-gradient(-45deg, #2a2f3a 25%, transparent 25%),
      linear-gradient(45deg, transparent 75%, #2a2f3a 75%), linear-gradient(-45deg, transparent 75%, #2a2f3a 75%);
    background-size: 16px 16px; background-position: 0 0, 0 8px, 8px -8px, -8px 0;
    background-color: #232833;
  }
  .ctl { position: absolute; box-sizing: border-box; }
  .ctl-label { display: flex; align-items: center; white-space: pre; }
  .ctl-button {
    display: flex; align-items: center; justify-content: center; white-space: pre;
    background: linear-gradient(#8f8f8f, #7a7a7a);
    border: 1px solid #000; border-radius: 2px; color: #fff;
    text-shadow: 1px 1px 0 #3f3f3f; overflow: hidden;
  }
  .ctl-button::after {
    content: ''; position: absolute; inset: 1px 1px auto 1px; height: 45%;
    background: linear-gradient(rgba(255,255,255,.28), rgba(255,255,255,0)); pointer-events: none;
  }
  .ctl-image { background-repeat: no-repeat; background-size: 100% 100%; }
  .ctl-image.missing {
    border: 1px dashed #4b5563; background: rgba(47,52,64,.55);
    display: flex; align-items: center; justify-content: center;
    color: #7c8698; font-family: var(--mono); overflow: hidden;
  }
  .ctl-custom, .ctl-input, .ctl-scroll_view {
    border: 1px dashed #6b7280; background: rgba(31,36,48,.35);
  }
  .ctl-custom > .type-chip {
    position: absolute; top: 0; left: 0; font-family: var(--mono); font-size: 7px;
    color: #94a3b8; padding: 0 2px; background: rgba(20,24,33,.75);
  }
  .hover-outline { outline: 1px solid var(--accent); outline-offset: 0; }
  #inspector {
    width: 0; overflow: hidden; background: var(--panel); border-left: 1px solid var(--line);
    transition: width .16s ease;
  }
  #inspector.open { width: 420px; }
  #inspector pre {
    margin: 0; padding: 12px; font-family: var(--mono); font-size: 11px; line-height: 1.55;
    color: #b6c2d2; overflow: auto; height: 100%; white-space: pre;
  }
  #status {
    position: fixed; bottom: 12px; left: 50%; transform: translateX(-50%);
    background: #14342c; color: #b9ffe9; border: 1px solid #2b6f5e; border-radius: 999px;
    padding: 5px 14px; font-size: 11px; opacity: 0; transition: opacity .2s ease; pointer-events: none;
  }
  #status.show { opacity: 1; }
  .empty { padding: 22px; color: var(--muted); font-size: 12px; line-height: 1.7; }
  .empty code { font-family: var(--mono); color: #a9b6c7; background: var(--panel-2); padding: 1px 4px; border-radius: 4px; }
  .problem { padding: 4px 8px; color: var(--warn); font-size: 11px; font-family: var(--mono); }
  .node .badge.warn { color: var(--warn); border-color: #6b4b2a; }
  .warn-head {
    padding: 12px 10px 4px; font-size: 10px; letter-spacing: .07em;
    text-transform: uppercase; color: var(--warn); border-top: 1px solid var(--line); margin-top: 8px;
  }
  .warn-row {
    padding: 2px 10px; font-family: var(--mono); font-size: 10px; color: var(--warn);
    cursor: pointer; border-radius: 4px; opacity: .9;
  }
  .warn-row:hover { background: var(--panel-2); opacity: 1; }
</style>
</head>
<body>
<div id="app">
  <header>
    <div class="brand"><span class="dot"></span>JSON UI Preview</div>
    <div class="root-path" id="root-path"></div>
    <div class="spacer"></div>
    <label class="control">canvas
      <select id="canvas-size">
        <option value="960x540">960 × 540</option>
        <option value="1280x720">1280 × 720</option>
        <option value="1920x1080">1920 × 1080</option>
        <option value="854x480">854 × 480</option>
      </select>
    </label>
    <label class="control">zoom
      <select id="zoom">
        <option value="fit">fit</option>
        <option value="1">100%</option>
        <option value="2">200%</option>
      </select>
    </label>
    <button id="toggle-json">JSON</button>
    <button id="reload" title="reload">⟳</button>
  </header>
  <div id="main">
    <aside>
      <div class="aside-head"><span>screens</span><span id="count"></span></div>
      <div id="tree"></div>
    </aside>
    <div id="stage"><div class="canvas-wrap"><div id="canvas"></div></div></div>
    <div id="inspector"><pre id="json"></pre></div>
  </div>
</div>
<div id="status"></div>
<script>window.__JSONUI_PREVIEW__ = ${boot};</script>
<script type="module" src="/client.js"></script>
</body>
</html>`;
}

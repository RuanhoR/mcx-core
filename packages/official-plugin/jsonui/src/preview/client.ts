import { layoutDocument, flattenLayout } from './layout.js';
import type { LayoutBox } from './layout.js';
import type { JsonUIValue } from '../types.js';

interface ScreenMeta {
  id: string;
  relative: string;
  name: string;
  namespace: string;
  rootId: string;
  type: string;
  availability: string;
  target: string | null;
  warnings: number;
}

interface ScreenWarning {
  screen: string;
  control: string;
  attribute: string;
  value: string;
  message: string;
}

interface ScreenDocument extends ScreenMeta {
  document: Record<string, JsonUIValue>;
}

type DirNode = { kind: 'dir'; name: string; path: string; children: TreeNode[] };

type TreeNode =
  | DirNode
  | { kind: 'file'; name: string; path: string; id: string };

interface ScreensPayload {
  root: string;
  canvas: { width: number; height: number };
  screens: ScreenMeta[];
  tree: DirNode;
  problems: { relative: string; message: string }[];
  warnings: ScreenWarning[];
  textures: string[];
  watching: boolean;
}

interface BootPayload {
  width: number;
  height: number;
  root: string;
}

declare global {
  interface Window {
    __JSONUI_PREVIEW__?: BootPayload;
  }
}

const boot = window.__JSONUI_PREVIEW__ ?? {
  width: 960,
  height: 540,
  root: '',
};

const state = {
  payload: undefined as ScreensPayload | undefined,
  activeId: undefined as string | undefined,
  active: undefined as ScreenDocument | undefined,
  canvasW: boot.width,
  canvasH: boot.height,
  zoom: 'fit' as 'fit' | '1' | '2',
  collapsed: new Set<string>(),
};

const els = {
  rootPath: document.getElementById('root-path') as HTMLElement,
  count: document.getElementById('count') as HTMLElement,
  tree: document.getElementById('tree') as HTMLElement,
  stage: document.getElementById('stage') as HTMLElement,
  canvas: document.getElementById('canvas') as HTMLElement,
  json: document.getElementById('json') as HTMLElement,
  inspector: document.getElementById('inspector') as HTMLElement,
  status: document.getElementById('status') as HTMLElement,
  canvasSize: document.getElementById('canvas-size') as HTMLSelectElement,
  zoom: document.getElementById('zoom') as HTMLSelectElement,
  reload: document.getElementById('reload') as HTMLButtonElement,
  toggleJson: document.getElementById('toggle-json') as HTMLButtonElement,
};

let toastTimer: number | undefined;

function toast(message: string): void {
  els.status.textContent = message;
  els.status.classList.add('show');
  if (toastTimer) window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => els.status.classList.remove('show'), 1400);
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url, { cache: 'no-store' });
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
  return (await response.json()) as T;
}

function renderTree(node: DirNode, container: HTMLElement, depth = 0): void {
  for (const child of node.children) {
    if (child.kind === 'dir') {
      const row = document.createElement('div');
      row.className = 'node dir';
      row.style.paddingLeft = `${6 + depth * 4}px`;
      const collapsed = state.collapsed.has(child.path);
      row.innerHTML = `<span class="caret">${collapsed ? '▸' : '▾'}</span><span class="label"></span>`;
      (row.querySelector('.label') as HTMLElement).textContent = child.name;
      row.addEventListener('click', () => {
        if (state.collapsed.has(child.path)) state.collapsed.delete(child.path);
        else state.collapsed.add(child.path);
        render();
      });
      container.appendChild(row);
      if (!collapsed) {
        const box = document.createElement('div');
        box.className = 'children';
        renderTree(child, box, depth + 1);
        container.appendChild(box);
      }
      continue;
    }
    const row = document.createElement('div');
    row.className = 'node file';
    row.style.paddingLeft = `${6 + depth * 4}px`;
    if (state.activeId === child.id) row.classList.add('active');
    row.innerHTML = `<span class="caret"></span><span class="label"></span><span class="badge"></span>`;
    (row.querySelector('.label') as HTMLElement).textContent = child.name;
    const meta = state.payload?.screens.find(item => item.id === child.id);
    const badge = row.querySelector('.badge') as HTMLElement;
    badge.textContent = meta?.availability ?? '';
    if (meta && meta.warnings > 0) {
      badge.classList.add('warn');
      badge.textContent = `⚠ ${meta.warnings}`;
      row.title = meta.warnings + ' attribute warning(s)';
    }
    row.addEventListener('click', () => {
      void select(child.id);
    });
    container.appendChild(row);
  }
}

function render(): void {
  const payload = state.payload;
  if (!payload) return;
  els.tree.textContent = '';
  if (payload.screens.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'empty';
    empty.innerHTML =
      'No <code>&lt;Ui type="jsonui"&gt;</code> files found.<br />Add one and it shows up here instantly.';
    els.tree.appendChild(empty);
  } else {
    renderTree(payload.tree, els.tree);
  }
  for (const problem of payload.problems) {
    const item = document.createElement('div');
    item.className = 'problem';
    item.textContent = `${problem.relative}: ${problem.message}`;
    els.tree.appendChild(item);
  }
  if (payload.warnings.length > 0) {
    const head = document.createElement('div');
    head.className = 'warn-head';
    head.textContent = `attribute warnings (${payload.warnings.length})`;
    els.tree.appendChild(head);
    for (const warning of payload.warnings.slice(0, 30)) {
      const row = document.createElement('div');
      row.className = 'warn-row';
      row.textContent = `${warning.screen} · ${warning.control}.${warning.attribute}`;
      row.title = `${warning.value} — ${warning.message}`;
      row.addEventListener('click', () => {
        void select(warning.screen);
      });
      els.tree.appendChild(row);
    }
  }
  els.count.textContent = `${payload.screens.length}`;
  els.rootPath.textContent = payload.root;
  els.rootPath.title = payload.root;
}

function styledText(el: HTMLElement, box: LayoutBox): void {
  const text = box.text;
  if (!text) return;
  el.textContent = text.text;
  el.style.fontSize = `${text.fontSize}px`;
  el.style.color = text.color;
  el.style.opacity = text.dynamic ? '0.85' : '1';
  el.style.justifyContent =
    text.align === 'left' ? 'flex-start' : text.align === 'right' ? 'flex-end' : 'center';
  el.style.textAlign = text.align;
  if (text.shadow) el.style.textShadow = '1px 1px 0 #3f3f3f';
}

function paintBox(box: LayoutBox, parent: HTMLElement, isRoot: boolean): void {
  const el = document.createElement('div');
  el.className = `ctl ctl-${box.kind} ctl-type-${box.type.replace(/[^\w-]/g, '_')}`;
  el.style.left = `${isRoot ? 0 : box.x}px`;
  el.style.top = `${isRoot ? 0 : box.y}px`;
  el.style.width = `${isRoot ? state.canvasW : box.w}px`;
  el.style.height = `${isRoot ? state.canvasH : box.h}px`;
  el.style.opacity = String(box.alpha);
  el.style.zIndex = String(1 + box.layer * 10 + box.depth);
  el.dataset.controlId = box.id;
  el.dataset.kind = box.kind;
  el.title = `${box.id} · ${box.type} · ${Math.round(box.w)}×${Math.round(box.h)} @ ${Math.round(
    box.x,
  )},${Math.round(box.y)}`;
  if (box.clip) el.style.overflow = 'hidden';
  if (box.rotate) el.style.transform = `rotate(${box.rotate}deg)`;

  if (box.kind === 'image') {
    const texture = box.texture;
    if (texture && !texture.dynamic) {
      const url = `/texture/${texture.path.replace(/^\/+/, '')}`;
      el.style.backgroundImage = `url("${url}")`;
      if (box.tiled) {
        el.style.backgroundRepeat = 'repeat';
        el.style.backgroundSize = 'auto';
      }
      const probe = new Image();
      probe.onerror = () => {
        el.style.backgroundImage = '';
        el.classList.add('missing');
        el.textContent = texture.path;
      };
      probe.src = url;
    } else {
      el.classList.add('missing');
      el.textContent = texture?.path ?? 'image';
    }
  } else if (box.kind === 'custom' || box.kind === 'input' || box.kind === 'scroll_view') {
    styledText(el, box);
    if (box.type && box.type !== 'custom') {
      const chip = document.createElement('span');
      chip.className = 'type-chip';
      chip.textContent = box.type;
      el.appendChild(chip);
    }
  } else {
    styledText(el, box);
  }

  parent.appendChild(el);
  for (const child of box.children) paintBox(child, el, false);
}

function applyZoom(): void {
  const wrap = els.canvas.parentElement as HTMLElement;
  const availableW = els.stage.clientWidth - 52;
  const availableH = els.stage.clientHeight - 52;
  let scale = 1;
  if (state.zoom === 'fit') {
    scale = Math.min(
      1,
      availableW / state.canvasW,
      availableH / state.canvasH,
    );
    scale = Math.max(0.2, Number.isFinite(scale) ? scale : 1);
  } else {
    scale = Number.parseFloat(state.zoom);
  }
  els.canvas.style.transform = `scale(${scale})`;
  els.canvas.style.width = `${state.canvasW}px`;
  els.canvas.style.height = `${state.canvasH}px`;
  wrap.style.width = `${state.canvasW * scale}px`;
  wrap.style.height = `${state.canvasH * scale}px`;
}

function paint(): void {
  const screen = state.active;
  els.canvas.textContent = '';
  if (!screen) return;
  const result = layoutDocument(screen.document, screen.rootId, {
    width: state.canvasW,
    height: state.canvasH,
  });
  paintBox(result.root, els.canvas, true);
  applyZoom();
  els.json.textContent = JSON.stringify(screen.document, null, 2);
  const flat = flattenLayout(result.root);
  toast(`${flat.length - 1} controls · ${screen.availability}`);
}

async function select(id: string): Promise<void> {
  state.activeId = id;
  if (location.hash !== `#/${id}`) {
    history.replaceState(null, '', `#/${id}`);
  }
  const screen = await fetchJson<ScreenDocument>(
    `/api/screen?id=${encodeURIComponent(id)}`,
  );
  state.active = screen;
  render();
  paint();
}

async function loadScreens(keepSelection: boolean): Promise<void> {
  const first = state.payload === undefined;
  const payload = await fetchJson<ScreensPayload>('/api/screens');
  state.payload = payload;
  if (first) {
    if (payload.canvas.width > 0) state.canvasW = payload.canvas.width;
    if (payload.canvas.height > 0) state.canvasH = payload.canvas.height;
  }
  syncCanvasSelect();
  const fromHash = decodeURIComponent(location.hash.replace(/^#\//, ''));
  const wanted =
    (keepSelection ? state.activeId : undefined) ??
    (payload.screens.some(item => item.id === fromHash) ? fromHash : undefined) ??
    payload.screens[0]?.id;
  render();
  if (wanted) {
    await select(wanted);
  } else {
    state.active = undefined;
    els.canvas.textContent = '';
    els.json.textContent = '{}';
  }
}

function syncCanvasSelect(): void {
  const value = `${state.canvasW}x${state.canvasH}`;
  const exists = Array.from(els.canvasSize.options).some(
    option => option.value === value,
  );
  if (!exists) {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = `${state.canvasW} × ${state.canvasH}`;
    els.canvasSize.prepend(option);
  }
  els.canvasSize.value = value;
}

function wire(): void {
  syncCanvasSelect();
  els.canvasSize.addEventListener('change', () => {
    const [w, h] = els.canvasSize.value.split('x');
    state.canvasW = Number.parseInt(w ?? '960', 10);
    state.canvasH = Number.parseInt(h ?? '540', 10);
    paint();
  });
  els.zoom.addEventListener('change', () => {
    state.zoom = els.zoom.value as 'fit' | '1' | '2';
    applyZoom();
  });
  els.reload.addEventListener('click', () => {
    void loadScreens(true).then(() => toast('reloaded'));
  });
  els.toggleJson.addEventListener('click', () => {
    els.inspector.classList.toggle('open');
    els.toggleJson.classList.toggle('primary', els.inspector.classList.contains('open'));
  });
  window.addEventListener('resize', () => applyZoom());
  window.addEventListener('hashchange', () => {
    const id = decodeURIComponent(location.hash.replace(/^#\//, ''));
    if (id && id !== state.activeId) void select(id);
  });

  if (typeof EventSource !== 'undefined') {
    const source = new EventSource('/events');
    source.addEventListener('reload', () => {
      void loadScreens(true).then(() => toast('hot reload'));
    });
  }
}

void loadScreens(false).catch(error => {
  els.tree.textContent = String(error);
});
wire();

import * as fs from 'node:fs';
import * as path from 'node:path';
import { buildDocument, parseUiFromSource, stringAttr } from '../parse.js';
import type { JsonUIDocument, JsonUIValue, UiChild, UiNode } from '../types.js';

export interface PreviewScreen {
  /** stable id: posix path relative to the project root */
  id: string;
  /** absolute path of the `.mcx` file */
  file: string;
  /** posix path relative to the project root */
  relative: string;
  /** display name (file name without the extension) */
  name: string;
  namespace: string;
  rootId: string;
  /** root control type, usually `screen` */
  type: string;
  availability: string;
  target: string | undefined;
  document: JsonUIDocument;
  warnings: PreviewWarning[];
}

/**
 * An attribute that looks like JSON but does not parse. The game would ignore
 * it too, which usually shows up as a 0×0 control — worth reporting loudly.
 */
export interface PreviewWarning {
  screen: string;
  control: string;
  attribute: string;
  value: string;
  message: string;
}

export interface PreviewProblem {
  id: string;
  file: string;
  relative: string;
  message: string;
}

export interface PreviewTreeDir {
  kind: 'dir';
  name: string;
  path: string;
  children: PreviewTreeNode[];
}

export interface PreviewTreeFile {
  kind: 'file';
  name: string;
  path: string;
  id: string;
}

export type PreviewTreeNode = PreviewTreeDir | PreviewTreeFile;

export interface PreviewTextureRoot {
  dir: string;
  name: string;
}

export interface PreviewCollection {
  root: string;
  screens: PreviewScreen[];
  problems: PreviewProblem[];
  tree: PreviewTreeDir;
  textureRoots: PreviewTextureRoot[];
}

const SKIP_DIRS = new Set([
  'node_modules',
  '.git',
  '.svn',
  '.hg',
  'dist',
  'build',
  'coverage',
  '.next',
  '.turbo',
  '.cache',
  '.output',
]);
const MAX_DEPTH = 12;
const MAX_FILE_BYTES = 8 * 1024 * 1024;

function toPosix(value: string): string {
  return value.split(path.sep).join('/');
}

function isJsonUiSource(source: string): boolean {
  return (
    /<\s*Ui\b[^>]*\btype\s*=\s*["']jsonui["']/i.test(source) ||
    /<\s*JsonUi\b/i.test(source)
  );
}

const JSON_LIKE = /^[[{]/;

/** Flag attribute values that were meant to be JSON but failed to parse. */
function scanWarnings(
  node: UiNode,
  screen: string,
  out: PreviewWarning[],
): void {
  for (const [attribute, value] of Object.entries(node.arr)) {
    if (typeof value !== 'string') continue;
    const text = value.trim();
    if (!JSON_LIKE.test(text)) continue;
    try {
      JSON.parse(text);
      continue;
    } catch {
      /* fall through and report it */
    }
    out.push({
      screen,
      control: stringAttr(node.arr, 'id', 'name') ?? node.name,
      attribute,
      value: text,
      message: `${attribute} is not valid JSON — quote units, e.g. size='["100%","100%"]'`,
    });
  }
  for (const child of node.content as UiChild[]) {
    if ('name' in child) scanWarnings(child, screen, out);
  }
}

function walk(dir: string, depth: number, out: string[]): void {
  if (depth > MAX_DEPTH) return;
  let entries: fs.Dirent[];
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const entry of entries) {
    if (entry.isSymbolicLink()) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name) || entry.name.startsWith('.')) continue;
      walk(full, depth + 1, out);
      continue;
    }
    if (!entry.isFile()) continue;
    if (!/\.mcx$/i.test(entry.name)) continue;
    out.push(full);
  }
}

function findTextureRoots(root: string): PreviewTextureRoot[] {
  const found: PreviewTextureRoot[] = [];
  const visit = (dir: string, depth: number): void => {
    if (depth > 4 || found.length >= 8) return;
    let entries: fs.Dirent[];
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    const manifest = entries.find(
      entry => entry.isFile() && entry.name === 'manifest.json',
    );
    if (manifest) {
      try {
        const raw = JSON.parse(
          fs.readFileSync(path.join(dir, 'manifest.json'), 'utf-8'),
        ) as { modules?: unknown; header?: { name?: unknown } };
        const modules = Array.isArray(raw.modules) ? raw.modules : [];
        const isResource = modules.some(
          module =>
            module &&
            typeof module === 'object' &&
            (module as { type?: unknown }).type === 'resources',
        );
        if (isResource) {
          found.push({
            dir,
            name:
              typeof raw.header?.name === 'string'
                ? raw.header.name
                : path.basename(dir),
          });
        }
      } catch {
        /* ignore malformed manifests */
      }
    }
    for (const entry of entries) {
      if (!entry.isDirectory() || entry.isSymbolicLink()) continue;
      if (SKIP_DIRS.has(entry.name) || entry.name.startsWith('.')) continue;
      visit(path.join(dir, entry.name), depth + 1);
    }
  };
  visit(root, 0);
  return found;
}

function buildTree(screens: PreviewScreen[]): PreviewTreeDir {
  const tree: PreviewTreeDir = { kind: 'dir', name: '', path: '', children: [] };
  const dirs = new Map<string, PreviewTreeDir>([['', tree]]);

  const ensureDir = (relative: string): PreviewTreeDir => {
    const existing = dirs.get(relative);
    if (existing) return existing;
    const parentPath = relative.includes('/')
      ? relative.slice(0, relative.lastIndexOf('/'))
      : '';
    const parent = ensureDir(parentPath);
    const created: PreviewTreeDir = {
      kind: 'dir',
      name: relative.slice(relative.lastIndexOf('/') + 1),
      path: relative,
      children: [],
    };
    parent.children.push(created);
    dirs.set(relative, created);
    return created;
  };

  for (const screen of screens) {
    const dir = screen.relative.includes('/')
      ? screen.relative.slice(0, screen.relative.lastIndexOf('/'))
      : '';
    const parent = ensureDir(dir);
    parent.children.push({
      kind: 'file',
      name: screen.name,
      path: screen.relative,
      id: screen.id,
    });
  }

  const sortTree = (dir: PreviewTreeDir): void => {
    dir.children.sort((a, b) => {
      if (a.kind !== b.kind) return a.kind === 'dir' ? -1 : 1;
      return a.name.localeCompare(b.name, 'en');
    });
    for (const child of dir.children) {
      if (child.kind === 'dir') sortTree(child);
    }
  };
  sortTree(tree);
  return tree;
}

export interface CollectOptions {
  /** only keep this absolute file (single file preview) */
  only?: string;
}

/**
 * Scan a project for `<Ui type="jsonui">` files and compile each of them into a
 * JSON UI document, without running the MCX compiler or touching the output
 * resource pack. That keeps the preview instant and side effect free.
 */
export function collectScreens(
  root: string,
  options: CollectOptions = {},
): PreviewCollection {
  const absoluteRoot = path.resolve(root);
  const files: string[] = [];
  if (fs.existsSync(absoluteRoot) && fs.statSync(absoluteRoot).isFile()) {
    files.push(absoluteRoot);
  } else {
    walk(absoluteRoot, 0, files);
  }

  const screens: PreviewScreen[] = [];
  const problems: PreviewProblem[] = [];

  for (const file of files) {
    if (options.only && path.resolve(file) !== path.resolve(options.only)) {
      continue;
    }
    let source: string;
    try {
      const stat = fs.statSync(file);
      if (stat.size > MAX_FILE_BYTES) continue;
      source = fs.readFileSync(file, 'utf-8');
    } catch {
      continue;
    }
    if (!isJsonUiSource(source)) continue;
    const relative = toPosix(path.relative(absoluteRoot, file)) || path.basename(file);
    try {
      const node = parseUiFromSource(source);
      if (!node) {
        problems.push({
          id: relative,
          file,
          relative,
          message: 'found a jsonui tag but could not find the <Ui type="jsonui"> root',
        });
        continue;
      }
      const parts = buildDocument(node, { hookId: relative });
      const warnings: PreviewWarning[] = [];
      scanWarnings(node, relative, warnings);
      const availability =
        stringAttr(parts.attrs, 'availability', 'avail', 'use') ?? 'file';
      const target = stringAttr(parts.attrs, 'target');
      const rootControl = parts.document[parts.rootId];
      const rootType =
        rootControl && typeof rootControl === 'object' && !Array.isArray(rootControl)
          ? String(
              (rootControl as Record<string, JsonUIValue>)['type'] ?? 'screen',
            )
          : 'screen';
      screens.push({
        id: relative,
        file,
        relative,
        name: path.basename(file).replace(/\.mcx$/i, ''),
        namespace: parts.namespace,
        rootId: parts.rootId,
        type: rootType,
        availability,
        target,
        document: parts.document,
        warnings,
      });
    } catch (error) {
      problems.push({
        id: relative,
        file,
        relative,
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }

  screens.sort((a, b) => a.relative.localeCompare(b.relative, 'en'));

  return {
    root: absoluteRoot,
    screens,
    problems,
    tree: buildTree(screens),
    textureRoots: findTextureRoots(absoluteRoot),
  };
}

/** Find a texture file inside the project's resource packs. */
export function resolveTextureFile(
  roots: PreviewTextureRoot[],
  texturePath: string,
): string | undefined {
  const cleaned = texturePath.replace(/\\/g, '/').replace(/^\/+/, '').trim();
  if (!cleaned || cleaned.includes('..')) return undefined;
  const candidates = [cleaned];
  if (!/\.[a-z0-9]{2,4}$/i.test(cleaned)) {
    candidates.push(`${cleaned}.png`, `${cleaned}.jpg`, `${cleaned}.jpeg`);
  }
  for (const root of roots) {
    for (const candidate of candidates) {
      const full = path.join(root.dir, candidate);
      if (!full.startsWith(root.dir)) continue;
      try {
        if (fs.statSync(full).isFile()) return full;
      } catch {
        /* keep looking */
      }
    }
  }
  return undefined;
}

export function documentVariables(
  document: JsonUIDocument,
): Record<string, JsonUIValue> {
  const variables = document['variables'];
  return variables && typeof variables === 'object' && !Array.isArray(variables)
    ? (variables as Record<string, JsonUIValue>)
    : {};
}

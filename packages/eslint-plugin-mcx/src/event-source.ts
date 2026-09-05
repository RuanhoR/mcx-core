import * as fs from 'node:fs';
import * as path from 'node:path';
import { createRequire } from 'node:module';
import { WORLD_AFTER_EVENTS, WORLD_BEFORE_EVENTS } from './generated-events';

export interface EventLists {
  after: readonly string[];
  before: readonly string[];
  /** where the lists came from: the resolved @minecraft/server version,
   * "cache" for a cache hit, or "bundled" for the fallback lists */
  source: string;
}

const cacheByCwd = new Map<string, EventLists>();

/**
 * Event names for the @minecraft/server version installed in the user's
 * project: extracted from its index.d.ts and cached under
 * `<project>/node_modules/.tmp/eslint-plugin-mcx/events-<version>.json`.
 * Falls back to the lists bundled with this plugin when @minecraft/server
 * cannot be resolved.
 */
export function loadEventLists(cwd: string): EventLists {
  const cached = cacheByCwd.get(cwd);
  if (cached) return cached;
  const lists = resolveEventLists(cwd);
  cacheByCwd.set(cwd, lists);
  return lists;
}

function resolveEventLists(cwd: string): EventLists {
  try {
    const pkgDir = resolveServerDir(cwd);
    const pkgJson = JSON.parse(
      fs.readFileSync(path.join(pkgDir, 'package.json'), 'utf-8'),
    );
    const version: string = pkgJson.version;
    const cacheDir = path.join(
      cwd,
      'node_modules',
      '.tmp',
      'eslint-plugin-mcx',
    );
    const cacheFile = path.join(cacheDir, `events-${version}.json`);
    const hit = readCache(cacheFile);
    if (hit) {
      return { after: hit.after, before: hit.before, source: `cache:${version}` };
    }
    const lists = extractFromDts(
      path.join(pkgDir, 'index.d.ts'),
    );
    try {
      fs.mkdirSync(cacheDir, { recursive: true });
      fs.writeFileSync(
        cacheFile,
        JSON.stringify({ version, after: lists.after, before: lists.before }, null, 2),
      );
    } catch {
      // read-only filesystem: run without cache
    }
    return { after: lists.after, before: lists.before, source: version };
  } catch {
    return {
      after: WORLD_AFTER_EVENTS,
      before: WORLD_BEFORE_EVENTS,
      source: 'bundled',
    };
  }
}

function resolveServerDir(cwd: string): string {
  const req = createRequire(path.join(cwd, 'package.json'));
  try {
    return path.dirname(req.resolve('@minecraft/server/package.json'));
  } catch {
    // exports map may not expose ./package.json: resolve the entry instead
    // and walk up to the package root
    const entry = req.resolve('@minecraft/server');
    let dir = path.dirname(entry);
    while (dir !== path.dirname(dir)) {
      if (fs.existsSync(path.join(dir, 'package.json'))) {
        const pkg = JSON.parse(fs.readFileSync(path.join(dir, 'package.json'), 'utf-8'));
        if (pkg.name === '@minecraft/server') return dir;
      }
      dir = path.dirname(dir);
    }
    throw new Error('@minecraft/server package.json not found');
  }
}

function readCache(cacheFile: string):
  | { after: string[]; before: string[] }
  | null {
  try {
    const parsed = JSON.parse(fs.readFileSync(cacheFile, 'utf-8'));
    if (Array.isArray(parsed.after) && Array.isArray(parsed.before)) {
      return { after: parsed.after, before: parsed.before };
    }
  } catch {
    // missing or corrupt cache: regenerate
  }
  return null;
}

/** Extract `readonly <name>:` property names from the two world event classes. */
function extractFromDts(dtsPath: string): {
  after: string[];
  before: string[];
} {
  const text = fs.readFileSync(dtsPath, 'utf-8');
  return {
    after: extractClassProps(text, 'WorldAfterEvents'),
    before: extractClassProps(text, 'WorldBeforeEvents'),
  };
}

function extractClassProps(text: string, className: string): string[] {
  const open = new RegExp(`export\\s+class\\s+${className}\\s*\\{`).exec(text);
  if (!open) throw new Error(`${className} not found in index.d.ts`);
  let depth = 1;
  let i = open.index + open[0].length;
  const bodyStart = i;
  while (depth > 0 && i < text.length) {
    const ch = text[i];
    if (ch === '{') depth++;
    else if (ch === '}') depth--;
    i++;
  }
  if (depth !== 0) throw new Error(`unbalanced braces in ${className}`);
  const body = text.slice(bodyStart, i - 1);
  const names: string[] = [];
  const propRe = /readonly\s+([A-Za-z_$][\w$]*)\s*:/g;
  let m: RegExpExecArray | null;
  while ((m = propRe.exec(body)) !== null) names.push(m[1] as string);
  return names.sort();
}

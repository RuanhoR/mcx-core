/**
 * File name validation for `<Component>` ids.
 *
 * A component `id` becomes a path inside the output pack, so it has to be a
 * legal Bedrock definition file name — and it must not be able to escape the
 * pack root. Both are checked here, at parse time, so the error can point at
 * the offending tag.
 */

import { _MCXstructureLocComponentTypes } from './types';

/**
 * The extension a group gets when the id omits one. Client entities are
 * special: Bedrock only loads `entities/*.client.json` from the resource pack.
 */
export const _MCXComponentGroupDefaultExt = {
  client_entities: '.client.json',
} as const;

const DEFAULT_EXT = '.json';

/** Windows device names are reserved and would produce unwritable paths. */
const RESERVED_NAMES = new Set([
  'con',
  'prn',
  'aux',
  'nul',
  ...Array.from({ length: 9 }, (_, i) => `com${i + 1}`),
  ...Array.from({ length: 9 }, (_, i) => `lpt${i + 1}`),
]);

/** Control characters are not representable in a file name. */
const hasControlChar = (value: string): boolean => {
  for (const char of value) {
    const code = char.codePointAt(0) ?? 0;
    if (code < 0x20 || code === 0x7f) return true;
  }
  return false;
};

/** Legal inside a Bedrock definition file or folder name. */
const SEGMENT_RE = /^[A-Za-z0-9_][A-Za-z0-9_.-]*$/;

const assertSegment = (segment: string, id: string): void => {
  if (segment === '.' || segment === '..') {
    throw new Error(
      `[compile error]: component id "${id}" must not contain "." or ".." path segments`,
    );
  }
  if (!SEGMENT_RE.test(segment)) {
    throw new Error(
      `[compile error]: component id "${id}" has an invalid name segment "${segment}": ` +
        'use letters, digits, "_", "-" and "."; it must start with a letter, digit or "_"',
    );
  }
  if (segment.endsWith('.')) {
    throw new Error(
      `[compile error]: component id "${id}" must not end a name segment with "."`,
    );
  }
  const stem = segment.split('.')[0]?.toLowerCase() ?? '';
  if (RESERVED_NAMES.has(stem)) {
    throw new Error(
      `[compile error]: component id "${id}" uses the reserved file name "${segment}"`,
    );
  }
};

/**
 * Validates a `<Component>` id and returns it with the group's default
 * extension appended when it has none.
 *
 * `id="mob"` and `id="mob.json"` both resolve to `mob.json`; for
 * `client_entities` both `id="mob"` and `id="mob.client.json"` resolve to
 * `mob.client.json`.
 */
export const normalizeComponentFileId = (
  groupKey: string,
  rawId: string,
): string => {
  if (typeof rawId !== 'string' || !rawId.trim()) {
    throw new Error(`[compile error]: component id must be a non-empty string`);
  }
  const id = rawId.trim();

  if (id.startsWith('/') || id.startsWith('\\') || /^[A-Za-z]:[\\/]/.test(id)) {
    throw new Error(
      `[compile error]: component id "${id}" must be relative to the pack root`,
    );
  }
  if (/[\\]/.test(id)) {
    throw new Error(
      `[compile error]: component id "${id}" must use "/" as the path separator`,
    );
  }
  if (/[<>:"|?*]/.test(id) || hasControlChar(id)) {
    throw new Error(
      `[compile error]: component id "${id}" contains characters that are illegal in a file name`,
    );
  }

  const segments = id.split('/');
  for (const segment of segments) {
    if (!segment) {
      throw new Error(
        `[compile error]: component id "${id}" must not contain an empty path segment`,
      );
    }
    assertSegment(segment, id);
  }

  const ext = (
    _MCXComponentGroupDefaultExt as Record<string, string>
  )[groupKey] ?? DEFAULT_EXT;
  const last = segments[segments.length - 1] as string;
  // folder names never get an extension
  if (last.endsWith('.json')) return id;
  return `${id}${ext}`;
};

export const isKnownComponentGroup = (name: string): boolean =>
  Object.keys(_MCXstructureLocComponentTypes).includes(name);

/**
 * Helpers shared by every Bedrock component runtime class.
 *
 * `format_version` is written by all of them but the rules differ per file
 * type: `minecraft:item` / `minecraft:entity` / `minecraft:block` and recipes
 * require one, loot/trade tables make it optional (vanilla omits it), and the
 * worldgen files fall back to a per-component default. The components also
 * gate individual features behind a minimum version, which used to be an
 * inlined `format.split('.')` + `isVersionGE` block repeated a dozen times in
 * item.ts. Keeping validation, normalisation and comparison in one place stops
 * the files from drifting apart — they already disagreed on whether a two part
 * version like `1.20` is legal.
 */

import compareVar from './utils';

/**
 * `1`, `1.20` and `1.20.80` are all accepted by default — recipes, loot tables
 * and trade tables are documented with two part versions. Pass `parts: 3` for
 * `minecraft:item` / `minecraft:entity` / `minecraft:block`, which are always
 * documented as `major.minor.patch`.
 */
const formatVersionRe = (parts?: number): RegExp =>
  parts ? new RegExp(`^\\d+(?:\\.\\d+){${parts - 1}}$`) : /^\d+(?:\.\d+){0,2}$/;

export const isFormatVersion = (
  value: unknown,
  parts?: number,
): value is string =>
  typeof value === 'string' && formatVersionRe(parts).test(value.trim());

/** Splits a version into `[major, minor, patch]`, missing parts become 0. */
export const parseFormatVersion = (
  format: string,
): [number, number, number] => {
  const parts = format.trim().split('.');
  return [Number(parts[0]) || 0, Number(parts[1]) || 0, Number(parts[2]) || 0];
};

/** Semantic-ish comparison of two version strings: `1.21.0` > `1.20.80`. */
export const compareFormatVersion = (a: string, b: string): number =>
  compareVar(a, b);

export const isFormatAtLeast = (
  format: string,
  major: number,
  minor = 0,
  patch = 0,
): boolean => compareFormatVersion(format, `${major}.${minor}.${patch}`) >= 0;

export interface FormatVersionSpec {
  /** component label used in error messages, e.g. `"loot table"` */
  component: string;
  /** raw `format` value taken from the component options */
  format?: unknown;
  /** version used when `format` is missing or blank */
  fallback?: string | undefined;
  /** throw instead of omitting the key when nothing can be resolved */
  required?: boolean | undefined;
  /** exact number of dot separated parts required, e.g. `3` for items */
  parts?: number | undefined;
}

const isBlank = (value: unknown): boolean =>
  value === undefined ||
  value === null ||
  (typeof value === 'string' && !value.trim());

/**
 * Validates the caller supplied `format` and returns the version to write, or
 * `undefined` when the key should be omitted entirely.
 *
 * @throws when the value is present but not a version, or when nothing can be
 * resolved and `required` is set.
 */
export const resolveFormatVersion = (
  spec: FormatVersionSpec,
): string | undefined => {
  const { component, format, fallback, required, parts } = spec;
  if (isFormatVersion(format, parts)) return (format as string).trim();
  if (!isBlank(format)) {
    throw new Error(
      `[compile component]: invalid ${component} format: ${String(format)}`,
    );
  }
  if (fallback) return fallback;
  if (required) throw new Error('[compile component]: no format');
  return undefined;
};

/**
 * Same as {@link resolveFormatVersion} but writes straight onto the emitted
 * JSON object, leaving `format_version` absent when there is nothing to write.
 */
export const applyFormatVersion = (
  target: Record<string, unknown>,
  spec: FormatVersionSpec,
): string | undefined => {
  const version = resolveFormatVersion(spec);
  if (version === undefined) delete target.format_version;
  else target.format_version = version;
  return version;
};

/**
 * Gate for features that only exist from a given version onwards, replacing the
 * per-component `isVersionGE` copies.
 *
 * @param label feature name used in the error message, e.g. `"block_placer"`
 * @param version minimum version, e.g. `"1.21.50"`
 * @param scope `set` for setter-time validation, `compile` for `toJSON`
 */
export const requireFormatAtLeast = (
  format: string,
  label: string,
  version: string,
  scope: 'compile' | 'set' = 'compile',
): void => {
  const [major = 0, minor = 0, patch = 0] = parseFormatVersion(version);
  if (isFormatAtLeast(format, major, minor, patch)) return;
  const prefix = scope === 'set' ? '[set error]' : '[compile component]';
  throw new Error(
    `${prefix}: ${label} component requires format version ${version} or higher`,
  );
};

const isEmptyValue = (value: unknown): boolean => {
  if (value === undefined || value === null) return true;
  if (typeof value === 'string') return !value.trim();
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
};

/**
 * Throws unless `value` carries something. Accepts the shapes the docs allow
 * for recipe fields — a bare id, an item object, or an array of results.
 */
export const requirePresent = <T>(
  value: T,
  component: string,
  field: string,
): T => {
  if (!isEmptyValue(value)) return value;
  throw new Error(`[compile component]: ${component}: ${field} is required`);
};

/** Throws unless `value` is a non-empty string, e.g. a required recipe field. */
export const requireField = (
  value: unknown,
  component: string,
  field: string,
): string => {
  if (typeof value === 'string' && value.trim()) return value;
  throw new Error(`[compile component]: ${component}: ${field} is required`);
};

/** Throws unless `value` is a namespaced `namespace:path` identifier. */
export const requireIdentifier = (
  value: unknown,
  component: string,
): string => {
  if (
    typeof value === 'string' &&
    /^[a-zA-Z0-9_\/\.-]+:[a-zA-Z0-9_\/\.-]+$/.test(value)
  ) {
    return value;
  }
  throw new Error(`[compile component]: ${component}: no id`);
};

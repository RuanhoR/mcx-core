type CachedBindData = string[] | [string, string][];

/** Accumulated bind data (e.g. item_texture entries) across all components in a build. */
let cachedOption: Record<string, CachedBindData | undefined> = {};

/** Clear all cached bind options (called between builds). */
export function clearCachedOptions() {
  cachedOption = {};
}

export function getCachedOption(): Record<string, CachedBindData | undefined> {
  return cachedOption;
}

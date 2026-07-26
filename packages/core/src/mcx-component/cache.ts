/** Accumulated bind data (e.g. item_texture entries) across all components in a build. */
let cachedOption: Record<string, string[] | [string, string][]> = {};

/** Clear all cached bind options (called between builds). */
export function clearCachedOptions() {
  cachedOption = {};
}

export function getCachedOption(): Record<string, string[] | [string, string][]> {
  return cachedOption;
}

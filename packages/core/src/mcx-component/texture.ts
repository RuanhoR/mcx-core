import { mkdir, writeFile } from 'node:fs/promises';
import { readFileSync } from 'node:fs';
import * as path from 'node:path';
import { getCachedOption } from './cache';

/**
 * Generate the final textures/item_texture.json from accumulated bind data.
 * Call this in the plugin's buildEnd / onEnd hook.
 * Merges with any existing item_texture.json in the output directory.
 */
export async function generateItemTextureJson(output: {
  resources: string;
}): Promise<void> {
  const entries = getCachedOption()['item_texture'] as
    | [string, string][]
    | undefined;
  if (!entries || entries.length === 0) return;

  const dir = path.join(output.resources, 'textures');
  const filePath = path.join(dir, 'item_texture.json');

  const data: {
    resource_pack_name: string;
    texture_name: string;
    texture_data: Record<string, { textures: string }>;
  } = {
    resource_pack_name: 'mcx.pack.v.resources',
    texture_name: 'atlas.items',
    texture_data: {},
  };

  try {
    const existing = JSON.parse(readFileSync(filePath, 'utf-8'));
    if (existing.texture_data) {
      data.texture_data = existing.texture_data;
    }
  } catch {
    // File doesn't exist yet, use default empty data.
  }

  for (const [key, textures] of entries) {
    data.texture_data[key] = { textures };
  }

  await mkdir(dir, { recursive: true });
  await writeFile(filePath, JSON.stringify(data, null, 2));
}

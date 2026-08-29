import * as path from 'node:path';
import { getCachedOption } from './cache';
import { getFs } from '../state';

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
    const existing = JSON.parse(await getFs().promises.readFile(filePath, 'utf-8'));
    if (existing.texture_data) {
      data.texture_data = existing.texture_data;
    }
  } catch {
    // File doesn't exist yet, use default empty data.
  }

  for (const [key, textures] of entries) {
    data.texture_data[key] = { textures };
  }

  await getFs().promises.mkdir(dir, { recursive: true });
  await getFs().promises.writeFile(filePath, JSON.stringify(data, null, 2));
}

/**
 * Generate the final textures/terrain_texture.json from accumulated bind data.
 * Call this in the plugin's buildEnd / onEnd hook.
 * Merges with any existing terrain_texture.json in the output directory.
 */
export async function generateTerrainTextureJson(output: {
  resources: string;
}): Promise<void> {
  const entries = getCachedOption()['terrain_texture'] as
    | [string, string][]
    | undefined;
  if (!entries || entries.length === 0) return;

  const dir = path.join(output.resources, 'textures');
  const filePath = path.join(dir, 'terrain_texture.json');

  const data: {
    resource_pack_name: string;
    padding: number;
    num_mip_levels: number;
    texture_data: Record<string, { textures: string }>;
  } = {
    resource_pack_name: 'mcx.pack.v.resources',
    padding: 8,
    num_mip_levels: 4,
    texture_data: {},
  };

  try {
    const existing = JSON.parse(await getFs().promises.readFile(filePath, 'utf-8'));
    if (existing.texture_data) {
      data.texture_data = existing.texture_data;
    }
  } catch {
    // File doesn't exist yet, use default empty data.
  }

  for (const [key, textures] of entries) {
    data.texture_data[key] = { textures };
  }

  await getFs().promises.mkdir(dir, { recursive: true });
  await getFs().promises.writeFile(filePath, JSON.stringify(data, null, 2));
}

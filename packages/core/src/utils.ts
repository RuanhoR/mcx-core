import { getFs } from './state';

export async function fileExists(path: string): Promise<boolean> {
  try {
    await getFs().promises.access(path);
    return true;
  } catch {
    return false;
  }
}

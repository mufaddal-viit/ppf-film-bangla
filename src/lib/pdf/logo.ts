import 'server-only';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

let cached: Uint8Array | null = null;

/** Read the business logo PNG from public/brand/. Cached after the first call. */
export async function getLogoBytes(): Promise<Uint8Array | undefined> {
  if (cached) return cached;
  try {
    const buf = await readFile(join(process.cwd(), 'public/brand/logo-phantom.png'));
    cached = new Uint8Array(buf);
    return cached;
  } catch {
    return undefined;
  }
}

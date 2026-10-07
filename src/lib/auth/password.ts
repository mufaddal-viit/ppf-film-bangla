import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto';

/**
 * Password hashing with scrypt from node:crypto (no native dependency).
 * Stored format: scrypt$<log2 N>$<r>$<p>$<salt>$<hash>, so the cost can be raised later
 * without invalidating existing hashes.
 */
const COST = { logN: 15, r: 8, p: 1 };
const KEY_LENGTH = 64;
const MAX_MEMORY = 64 * 1024 * 1024;

function derive(password: string, salt: Buffer, logN: number, r: number, p: number): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(password.normalize('NFKC'), salt, KEY_LENGTH, { N: 2 ** logN, r, p, maxmem: MAX_MEMORY }, (error, key) =>
      error ? reject(error) : resolve(key),
    );
  });
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const key = await derive(password, salt, COST.logN, COST.r, COST.p);
  return ['scrypt', COST.logN, COST.r, COST.p, salt.toString('base64url'), key.toString('base64url')].join('$');
}

/** Constant-time comparison. Returns false for a malformed stored hash instead of throwing. */
export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [scheme, logN, r, p, salt, hash] = stored.split('$');
  if (scheme !== 'scrypt' || !logN || !r || !p || !salt || !hash) return false;
  const cost = [Number(logN), Number(r), Number(p)] as const;
  if (cost.some((n) => !Number.isInteger(n) || n < 1) || cost[0] > 20) return false;
  try {
    const expected = Buffer.from(hash, 'base64url');
    const actual = await derive(password, Buffer.from(salt, 'base64url'), ...cost);
    return expected.length === actual.length && timingSafeEqual(expected, actual);
  } catch {
    return false;
  }
}

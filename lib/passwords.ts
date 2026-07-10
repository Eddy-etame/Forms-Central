import crypto from 'crypto';
import { decryptPassword } from './crypto';

/**
 * One-way password hashing (scrypt, Node built-in — no extra deps).
 * Stored format: "scrypt:N:saltHex:hashHex".
 *
 * Legacy support: rows written before this module used reversible
 * AES-256-CTR ("ivHex:cipherHex"). verifyPassword() detects the format,
 * and login re-hashes legacy rows transparently on first success
 * (see needsRehash), so the DB migrates itself as users sign in.
 */

const SCRYPT_N = 16384; // cost (2^14) — interactive-login grade
const KEYLEN = 64;

export function hashPassword(plain: string): string {
  const salt = crypto.randomBytes(16);
  const hash = crypto.scryptSync(plain, salt, KEYLEN, { N: SCRYPT_N });
  return `scrypt:${SCRYPT_N}:${salt.toString('hex')}:${hash.toString('hex')}`;
}

export function isScryptHash(stored: string): boolean {
  return typeof stored === 'string' && stored.startsWith('scrypt:');
}

export function needsRehash(stored: string): boolean {
  return !isScryptHash(stored);
}

export function verifyPassword(plain: string, stored: string): boolean {
  if (!plain || !stored) return false;

  if (isScryptHash(stored)) {
    const [, nStr, saltHex, hashHex] = stored.split(':');
    const N = parseInt(nStr, 10);
    if (!N || !saltHex || !hashHex) return false;
    const expected = Buffer.from(hashHex, 'hex');
    const actual = crypto.scryptSync(plain, Buffer.from(saltHex, 'hex'), expected.length, { N });
    return actual.length === expected.length && crypto.timingSafeEqual(actual, expected);
  }

  // Legacy reversible format.
  try {
    const decrypted = decryptPassword(stored);
    if (!decrypted) return false;
    const a = Buffer.from(decrypted);
    const b = Buffer.from(plain);
    return a.length === b.length && crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

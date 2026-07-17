import crypto from 'crypto';

/**
 * Secret encryption for stored credentials.
 *
 * v2 (current): AES-256-GCM — authenticated, so tampered ciphertext is
 *   DETECTED and rejected instead of silently decrypting to garbage. Key is
 *   derived with SHA-256, so any-length secrets get full 32-byte entropy
 *   (the old scheme padded with '0's or truncated, weakening short keys).
 *   Format: "v2:<iv>:<authTag>:<ciphertext>" (hex).
 *
 * legacy: AES-256-CTR ("<iv>:<ciphertext>") — still decryptable so existing
 *   rows keep working; anything newly encrypted is always v2.
 */

const FALLBACK_KEY = 'default_fallback_key_that_is_32_b'; // dev-only; production refuses to boot on it (lib/securityConfig)

function secret(): string {
  return process.env.CLIENT_ENCRYPTION_KEY || FALLBACK_KEY;
}

/** v2 key: full-entropy 32 bytes regardless of secret length. */
function gcmKey(): Buffer {
  return crypto.createHash('sha256').update(secret()).digest();
}

/** Legacy key derivation (pad/truncate) — kept ONLY to decrypt old rows. */
function legacyKey(): Buffer {
  let key = secret();
  if (key.length > 32) key = key.substring(0, 32);
  else if (key.length < 32) key = key.padEnd(32, '0');
  return Buffer.from(key);
}

/** Encrypts a plain text string with AES-256-GCM (authenticated). */
export function encryptPassword(text: string): string {
  const iv = crypto.randomBytes(12); // 96-bit nonce, GCM standard
  const cipher = crypto.createCipheriv('aes-256-gcm', gcmKey(), iv);
  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `v2:${iv.toString('hex')}:${tag.toString('hex')}:${encrypted.toString('hex')}`;
}

/**
 * Decrypts either format. Returns '' (never garbage) when the input is
 * malformed or a v2 ciphertext fails authentication (tampering).
 */
export function decryptPassword(hash: string): string {
  if (!hash) return '';
  try {
    if (hash.startsWith('v2:')) {
      const [, ivHex, tagHex, dataHex] = hash.split(':');
      if (!ivHex || !tagHex || !dataHex) return '';
      const decipher = crypto.createDecipheriv('aes-256-gcm', gcmKey(), Buffer.from(ivHex, 'hex'));
      decipher.setAuthTag(Buffer.from(tagHex, 'hex'));
      return Buffer.concat([decipher.update(Buffer.from(dataHex, 'hex')), decipher.final()]).toString('utf8');
    }

    // Legacy CTR rows ("<iv>:<ciphertext>")
    if (!hash.includes(':')) return '';
    const parts = hash.split(':');
    const iv = Buffer.from(parts.shift()!, 'hex');
    const encryptedText = Buffer.from(parts.join(':'), 'hex');
    const decipher = crypto.createDecipheriv('aes-256-ctr', legacyKey(), iv);
    return Buffer.concat([decipher.update(encryptedText), decipher.final()]).toString();
  } catch {
    // Auth-tag mismatch (tampering) or corrupt data — refuse, don't guess.
    return '';
  }
}

/**
 * Generates a random secure password of a given length.
 */
export function generateRandomPassword(length: number = 10): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  const randomBytes = crypto.randomBytes(length);
  for (let i = 0; i < length; i++) {
    password += chars[randomBytes[i] % chars.length];
  }
  return password;
}

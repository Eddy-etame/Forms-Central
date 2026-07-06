import crypto from 'crypto';

const ALGORITHM = 'aes-256-ctr';
// 32-byte key from .env.local
const ENCRYPTION_KEY = process.env.CLIENT_ENCRYPTION_KEY || 'default_fallback_key_that_is_32_b';

/**
 * Encrypts a plain text string using AES-256-CTR.
 * Returns a string containing the Initialization Vector (IV) and the encrypted content, separated by a colon.
 */
export function encryptPassword(text: string): string {
  // Ensure the key is exactly 32 bytes
  let key = ENCRYPTION_KEY;
  if (key.length !== 32) {
    if (key.length > 32) key = key.substring(0, 32);
    else key = key.padEnd(32, '0');
  }

  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(key), iv);
  const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);

  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

/**
 * Decrypts a previously encrypted string.
 */
export function decryptPassword(hash: string): string {
  if (!hash || !hash.includes(':')) return '';

  let key = ENCRYPTION_KEY;
  if (key.length !== 32) {
    if (key.length > 32) key = key.substring(0, 32);
    else key = key.padEnd(32, '0');
  }

  const parts = hash.split(':');
  const iv = Buffer.from(parts.shift()!, 'hex');
  const encryptedText = Buffer.from(parts.join(':'), 'hex');
  
  const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(key), iv);
  const decrypted = Buffer.concat([decipher.update(encryptedText), decipher.final()]);
  
  return decrypted.toString();
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

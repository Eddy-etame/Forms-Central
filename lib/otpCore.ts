import crypto from 'crypto';

/**
 * Pure OTP primitives (no DB/deps) so they can be unit-tested in isolation.
 * Used by lib/otp.ts. Codes are 6-digit; hashing is peppered sha256.
 */

export const OTP_TTL_MS = 10 * 60 * 1000;
export const OTP_MAX_ATTEMPTS = 5;

/** Cryptographically-random 6-digit code, zero-padded. */
export function generateOtpCode(): string {
  return crypto.randomInt(0, 1_000_000).toString().padStart(6, '0');
}

/**
 * Deterministic, peppered hash of a code. A short-lived, attempt-capped
 * 6-digit code doesn't need scrypt — sha256 with a per-subject salt + secret
 * pepper is sufficient and constant-work.
 */
export function hashOtp(code: string, salt: string, pepper: string = process.env.JWT_SECRET || ''): string {
  return crypto.createHash('sha256').update(`${salt}:${code}:${pepper}`).digest('hex');
}

/** Constant-time compare of two equal-length hex hashes. */
export function safeEqualHex(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

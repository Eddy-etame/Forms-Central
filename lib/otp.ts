import { supabase } from './supabase';
import { generateOtpCode, hashOtp, safeEqualHex, OTP_TTL_MS, OTP_MAX_ATTEMPTS } from './otpCore';

/**
 * Email one-time-passcode DB layer for 2FA (migrations/migration_v14).
 * Codes are 6-digit, single-use, expire in 10 min, and lock after 5 wrong
 * attempts. Pure primitives live in ./otpCore (unit-tested); the DB ops here.
 */

export type OtpSubjectType = 'admin' | 'client';

export { generateOtpCode, hashOtp, safeEqualHex, OTP_TTL_MS, OTP_MAX_ATTEMPTS };

/** Create + persist a challenge; returns its id and the plaintext code (to email). */
export async function createOtpChallenge(
  subjectType: OtpSubjectType,
  subjectId: string,
  purpose: string = 'login_2fa'
): Promise<{ challengeId: string; code: string }> {
  const code = generateOtpCode();
  const codeHash = hashOtp(code, subjectId);
  const expiresAt = new Date(Date.now() + OTP_TTL_MS).toISOString();

  const { data, error } = await supabase
    .from('email_otps')
    .insert([{ subject_type: subjectType, subject_id: subjectId, purpose, code_hash: codeHash, expires_at: expiresAt }])
    .select('id')
    .single();

  if (error || !data) throw error || new Error('Failed to create OTP challenge');

  // Opportunistic cleanup so the table never balloons (~5% of calls).
  if (Math.random() < 0.05) {
    const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    await supabase.from('email_otps').delete().lt('created_at', dayAgo);
  }

  return { challengeId: data.id as string, code };
}

export type OtpVerifyResult =
  | { ok: true; subjectType: OtpSubjectType; subjectId: string }
  | { ok: false; reason: 'not_found' | 'used' | 'expired' | 'locked' | 'mismatch' };

/** Verify a code against a challenge. Consumes on success; counts attempts. */
export async function verifyOtpChallenge(challengeId: string, code: string): Promise<OtpVerifyResult> {
  const { data: row } = await supabase
    .from('email_otps')
    .select('id, subject_type, subject_id, code_hash, expires_at, consumed, attempts')
    .eq('id', challengeId)
    .maybeSingle();

  if (!row) return { ok: false, reason: 'not_found' };
  if (row.consumed) return { ok: false, reason: 'used' };
  if (new Date(row.expires_at).getTime() < Date.now()) return { ok: false, reason: 'expired' };
  if (row.attempts >= OTP_MAX_ATTEMPTS) return { ok: false, reason: 'locked' };

  const expected = hashOtp(code, row.subject_id);
  if (!safeEqualHex(expected, row.code_hash)) {
    await supabase.from('email_otps').update({ attempts: row.attempts + 1 }).eq('id', challengeId);
    return { ok: false, reason: 'mismatch' };
  }

  await supabase.from('email_otps').update({ consumed: true }).eq('id', challengeId);
  return { ok: true, subjectType: row.subject_type as OtpSubjectType, subjectId: row.subject_id };
}

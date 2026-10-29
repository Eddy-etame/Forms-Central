import { supabase } from './supabase';

/**
 * Blacklist (IPs, browser fingerprints, reverse-DNS hosts).
 *
 * Entries can expire (migration v22, `expires_at`). The rule since court order
 * A2: an automatic ban is ALWAYS temporary — a burst of real submissions from
 * one office, school or mobile carrier IP must never lock a client out forever.
 * Only an operator adding a target by hand creates a permanent entry.
 */

export const AUTO_BAN_TTL_MS = 24 * 60 * 60 * 1000;

/** Checks if a target is blacklisted right now (expired entries don't count). */
export async function isBlacklisted(target: string): Promise<boolean> {
  if (!target) return false;
  const nowIso = new Date().toISOString();
  const { data, error } = await supabase
    .from('blacklist')
    .select('id')
    .eq('target', target)
    .or(`expires_at.is.null,expires_at.gt.${nowIso}`)
    .limit(1);

  if (error) {
    // Pre-v22 schema (no expires_at column) — fall back to the plain lookup.
    const fb = await supabase.from('blacklist').select('id').eq('target', target).limit(1);
    if (fb.error) {
      console.error('Error checking blacklist:', fb.error);
      return false;
    }
    return !!fb.data && fb.data.length > 0;
  }
  return !!data && data.length > 0;
}

/**
 * Bans a target. `ttlMs` makes the ban temporary (automatic bans must pass
 * AUTO_BAN_TTL_MS); omit it only for operator-made permanent bans. A target
 * that already exists gets its expiry refreshed.
 */
export async function blacklistTarget(
  target: string,
  type: 'ip' | 'fingerprint' | 'host',
  reason: string,
  ttlMs?: number
): Promise<void> {
  if (!target) return;
  const expires_at = ttlMs ? new Date(Date.now() + ttlMs).toISOString() : null;

  const { error } = await supabase
    .from('blacklist')
    .upsert([{ target, type, reason, expires_at }], { onConflict: 'target' });

  if (error) {
    // Pre-v22 schema: no expires_at column. Insert without it (duplicates are fine).
    const fb = await supabase.from('blacklist').insert([{ target, type, reason }]);
    if (fb.error && fb.error.code !== '23505') {
      console.error(`Failed to blacklist ${type} "${target}":`, fb.error);
    }
  }
}

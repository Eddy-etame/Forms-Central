import { supabase } from './supabase';
import { logSecurityEvent } from './securityEvents';

/**
 * Device/session registry (migrations/migration_v15) — anti subscription-
 * sharing. Each sign-in registers a session whose id (`sid`) rides inside the
 * JWT. A client may hold at most DEVICE_LIMIT active sessions; the oldest is
 * evicted when a new device signs in. All helpers fail-open: a session-table
 * hiccup must never lock a paying customer out.
 */

export const DEVICE_LIMIT = 3;

/** Register a new session and evict the oldest beyond the device limit. */
export async function registerClientSession(
  clientId: string,
  ip: string | null,
  userAgent: string | null
): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('client_sessions')
      .insert([{ client_id: clientId, ip, user_agent: (userAgent || '').slice(0, 300) }])
      .select('id')
      .single();
    if (error || !data) return null;

    // Enforce the cap: keep the newest DEVICE_LIMIT sessions, revoke the rest.
    const { data: active } = await supabase
      .from('client_sessions')
      .select('id')
      .eq('client_id', clientId)
      .eq('revoked', false)
      .order('created_at', { ascending: false });

    if (active && active.length > DEVICE_LIMIT) {
      const evict = active.slice(DEVICE_LIMIT).map((s) => s.id);
      await supabase.from('client_sessions').update({ revoked: true }).in('id', evict);
      logSecurityEvent({
        type: 'CLIENT_DEVICE_EVICTED',
        severity: 'warn',
        actor: clientId,
        ip,
        detail: `Device limit (${DEVICE_LIMIT}) exceeded — evicted ${evict.length} oldest session(s). Possible account sharing.`,
      });
    }

    return data.id as string;
  } catch (err) {
    console.error('[sessions] register failed:', err);
    return null; // fail-open: login proceeds without a tracked session
  }
}

/** True when the session exists and has been revoked (evicted / signed out). */
export async function isSessionRevoked(sid: string): Promise<boolean> {
  try {
    const { data } = await supabase
      .from('client_sessions')
      .select('revoked')
      .eq('id', sid)
      .maybeSingle();
    if (!data) return false; // unknown sid (or table missing) — fail-open
    // Touch last_seen opportunistically (fire-and-forget).
    if (!data.revoked) {
      supabase.from('client_sessions').update({ last_seen: new Date().toISOString() }).eq('id', sid).then(() => {}, () => {});
    }
    return !!data.revoked;
  } catch {
    return false;
  }
}

/** Revoke one session (sign-out). */
export async function revokeClientSession(sid: string): Promise<void> {
  try {
    await supabase.from('client_sessions').update({ revoked: true }).eq('id', sid);
  } catch {
    /* fail-open */
  }
}

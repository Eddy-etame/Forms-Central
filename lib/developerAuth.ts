import { cookies } from 'next/headers';
import { verifyJWT, signJWT, issuedBefore } from './jwt';
import { supabase } from './supabase';
import { getPlan, type Plan } from './plans';

/**
 * Developer sessions — the ONE place that reads, checks and issues the
 * developer cookie.
 *
 * Glossary (see lib/domain.ts): a *developer* is a row of the `clients` table
 * (historical name), identified in the JWT as { sub: 'client', clientId }.
 * The cookie and JWT subject keep their historical names so existing sessions
 * stay valid; everything above this file speaks "developer".
 *
 * A session is valid when ALL of this holds (checked on every request, for
 * pages and API alike — until 2026-11-26 the API only checked the signature,
 * so a token kept working after sign-out, a password reset or a removed
 * device):
 *   - the token is signed by us, is a developer token and has not expired;
 *   - the account still exists;
 *   - the token was issued after the account's `sessions_valid_after`
 *     (a password reset moves that instant to "now");
 *   - its device session, when it has one, still exists and was not revoked
 *     (sign-out, device limit, removal).
 */

export const DEVELOPER_COOKIE = 'client_access_token';
export const DEVELOPER_SESSION_DAYS = 7;

export interface DeveloperSession {
  developerId: string;
  sid?: string;
}

export interface DeveloperContext extends DeveloperSession {
  plan: Plan;
  name: string;
  email: string;
}

type AccountRow = { name: string; email: string; plan: string | null; sessions_valid_after?: string | null };

async function resolve(): Promise<{ session: DeveloperSession; account: AccountRow } | null> {
  const secret = process.env.JWT_SECRET;
  if (!secret) return null;
  const token = (await cookies()).get(DEVELOPER_COOKIE)?.value;
  if (!token) return null;
  const payload = await verifyJWT(token, secret);
  if (!payload || payload.sub !== 'client' || typeof payload.clientId !== 'string' || payload.token_id) return null;
  const developerId = payload.clientId;
  const sid = typeof payload.sid === 'string' ? payload.sid : undefined;

  const [account, device] = await Promise.all([
    supabase.from('clients').select('name, email, plan, sessions_valid_after').eq('id', developerId).maybeSingle(),
    sid ? supabase.from('client_sessions').select('revoked').eq('id', sid).maybeSingle() : Promise.resolve({ data: null, error: null }),
  ]);
  if (account.error) {
    // Migration v25 not applied yet: the account still has to exist; the cut-off cannot be checked.
    if (!/column|schema cache/i.test(account.error.message || '')) return null;
    const fb = await supabase.from('clients').select('name, email, plan').eq('id', developerId).maybeSingle();
    if (!fb.data) return null;
    return { session: { developerId, ...(sid ? { sid } : {}) }, account: fb.data as AccountRow };
  }
  const row = account.data as AccountRow | null;
  if (!row) return null;                                         // the account is gone
  if (issuedBefore(payload.iat, row.sessions_valid_after)) return null; // ended by a password reset
  if (sid && !device.error) {
    // The token names a device session. Revoked: signed out or evicted. Gone:
    // removed by the operator or by housekeeping — a session that no longer
    // exists opens nothing. (A read error is not an answer; it does not sign anyone out.)
    const row = device.data as { revoked?: boolean } | null;
    if (!row || row.revoked) return null;
  }
  return { session: { developerId, ...(sid ? { sid } : {}) }, account: row };
}

/** Resolve the signed-in developer from the request cookie, or null. */
export async function getDeveloperSession(): Promise<DeveloperSession | null> {
  return (await resolve())?.session ?? null;
}

/** Session + plan + identity in one round trip. Null when not signed in. */
export async function getDeveloperContext(): Promise<DeveloperContext | null> {
  const r = await resolve();
  if (!r) return null;
  return { ...r.session, plan: getPlan(r.account.plan), name: r.account.name, email: r.account.email };
}

/** Cookie options shared by every route that issues a developer session. */
export function developerCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 60 * 60 * 24 * DEVELOPER_SESSION_DAYS,
  };
}

/**
 * Sign a developer session token. Every sign-in path uses this (password,
 * second factor, sign-up, Google, the operator's own workspace), so every
 * session is registered as a device session and can be revoked.
 */
export async function issueDeveloperToken(developerId: string, ip: string | null, userAgent: string | null): Promise<string | null> {
  const secret = process.env.JWT_SECRET;
  if (!secret) return null;
  const { registerClientSession } = await import('./clientSessions');
  const sid = await registerClientSession(developerId, ip, userAgent);
  const now = Math.floor(Date.now() / 1000);
  return signJWT(
    { sub: 'client', clientId: developerId, ...(sid ? { sid } : {}), iat: now, exp: now + 60 * 60 * 24 * DEVELOPER_SESSION_DAYS },
    secret
  );
}

/** End every session of a developer account: used when the password changes or ownership is re-established. */
export async function endAllDeveloperSessions(developerId: string): Promise<void> {
  const nowIso = new Date().toISOString();
  await Promise.all([
    supabase.from('clients').update({ sessions_valid_after: nowIso }).eq('id', developerId),
    supabase.from('client_sessions').update({ revoked: true }).eq('client_id', developerId).eq('revoked', false),
  ]);
}

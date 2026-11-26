import { cookies } from 'next/headers';
import { verifyJWT, signJWT, issuedBefore } from './jwt';
import { supabase } from './supabase';

/**
 * Client (portal) sessions — separate from developer sessions.
 * Cookie: portal_access_token, JWT sub 'portal'.
 *
 * Checked on every request: the token is ours and not expired, the client
 * still exists under that developer, and the token was issued after the
 * client's `sessions_valid_after` (choosing a new password moves it to "now",
 * which ends every earlier session).
 */

export const PORTAL_COOKIE = 'portal_access_token';

export interface PortalSession {
  portalUserId: string;
  parentClientId: string;
}

export async function signPortalToken(session: PortalSession): Promise<string> {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET missing');
  return signJWT(
    {
      sub: 'portal',
      portalUserId: session.portalUserId,
      parentClientId: session.parentClientId,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7, // 7 days
    },
    secret
  );
}

/** Resolve the current portal session from the request cookie, or null. */
export async function getPortalSession(): Promise<PortalSession | null> {
  const secret = process.env.JWT_SECRET;
  if (!secret) return null;
  const jar = await cookies();
  const token = jar.get(PORTAL_COOKIE)?.value;
  if (!token) return null;
  const payload = await verifyJWT(token, secret);
  if (!payload || payload.sub !== 'portal' || typeof payload.portalUserId !== 'string' || typeof payload.parentClientId !== 'string') return null;

  const { data, error } = await supabase
    .from('portal_users')
    .select('id, parent_client_id, sessions_valid_after')
    .eq('id', payload.portalUserId)
    .maybeSingle();
  if (error) {
    // Migration v25 not applied yet: the client still has to exist.
    if (!/column|schema cache/i.test(error.message || '')) return null;
    const fb = await supabase.from('portal_users').select('id, parent_client_id').eq('id', payload.portalUserId).maybeSingle();
    if (!fb.data || fb.data.parent_client_id !== payload.parentClientId) return null;
    return { portalUserId: payload.portalUserId, parentClientId: payload.parentClientId };
  }
  if (!data || data.parent_client_id !== payload.parentClientId) return null;   // removed, or moved to another developer
  if (issuedBefore(payload.iat, data.sessions_valid_after as string | null)) return null;
  return { portalUserId: payload.portalUserId, parentClientId: payload.parentClientId };
}

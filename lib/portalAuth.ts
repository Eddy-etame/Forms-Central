import { cookies } from 'next/headers';
import { verifyJWT, signJWT } from './jwt';

/**
 * End-client (portal) sessions — separate from developer client sessions.
 * Cookie: portal_access_token, JWT sub 'portal'.
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
  if (!payload || payload.sub !== 'portal' || !payload.portalUserId || !payload.parentClientId) return null;
  return {
    portalUserId: payload.portalUserId as string,
    parentClientId: payload.parentClientId as string,
  };
}

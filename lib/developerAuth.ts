import { cookies } from 'next/headers';
import { verifyJWT } from './jwt';
import { supabase } from './supabase';
import { getPlan, type Plan } from './plans';

/**
 * Developer sessions — the ONE place that reads the developer cookie.
 *
 * Glossary (see lib/domain.ts): a *developer* is a row of the `clients` table
 * (historical name), identified in the JWT as { sub: 'client', clientId }.
 * The cookie and JWT subject keep their historical names so existing sessions
 * stay valid; everything above this file speaks "developer".
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

/** Resolve the signed-in developer from the request cookie, or null. */
export async function getDeveloperSession(): Promise<DeveloperSession | null> {
  const secret = process.env.JWT_SECRET;
  if (!secret) return null;
  const jar = await cookies();
  const token = jar.get(DEVELOPER_COOKIE)?.value;
  if (!token) return null;
  const payload = await verifyJWT(token, secret);
  if (!payload || payload.sub !== 'client' || !payload.clientId) return null;
  return {
    developerId: payload.clientId as string,
    ...(payload.sid ? { sid: payload.sid as string } : {}),
  };
}

/** Session + plan + identity in one round trip. Null when not signed in. */
export async function getDeveloperContext(): Promise<DeveloperContext | null> {
  const session = await getDeveloperSession();
  if (!session) return null;
  const { data } = await supabase
    .from('clients')
    .select('name, email, plan')
    .eq('id', session.developerId)
    .maybeSingle();
  if (!data) return null;
  return { ...session, plan: getPlan(data.plan), name: data.name, email: data.email };
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

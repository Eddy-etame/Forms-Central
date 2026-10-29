import crypto from 'crypto';
import { supabase } from './supabase';
import { SITE_URL } from './seo';

/**
 * Set-password links — the only way a password ever travels.
 *
 * Nobody receives a password by e-mail (court order A9). A client (portal
 * user) or a developer gets a single-use link, chooses a password on the site,
 * and is signed in. The database stores only the SHA-256 of the token.
 *
 *   portal_users.invite_token_hash / invite_expires   → /portal/set-password
 *   clients.reset_token / reset_token_expires         → /developer/reset-password
 */

export const INVITE_TTL_MS = 7 * 24 * 60 * 60 * 1000;   // a client may open it days later
export const RESET_TTL_MS = 60 * 60 * 1000;             // password resets stay short-lived

function newToken(): { raw: string; hash: string } {
  const raw = crypto.randomBytes(32).toString('base64url');
  return { raw, hash: hashToken(raw) };
}

export function hashToken(raw: string): string {
  return crypto.createHash('sha256').update(raw).digest('hex');
}

function appOrigin(explicit?: string | null): string {
  return (explicit || process.env.NEXT_PUBLIC_APP_URL || SITE_URL).replace(/\/+$/, '');
}

/** Issue a portal set-password link for a client. Returns the URL to e-mail. */
export async function issueClientInvite(
  portalUserId: string,
  opts: { ttlMs?: number; origin?: string | null } = {}
): Promise<string | null> {
  const { raw, hash } = newToken();
  const expires = new Date(Date.now() + (opts.ttlMs ?? INVITE_TTL_MS)).toISOString();
  const { error } = await supabase
    .from('portal_users')
    .update({ invite_token_hash: hash, invite_expires: expires })
    .eq('id', portalUserId);
  if (error) {
    console.error('issueClientInvite:', error);
    return null;
  }
  return `${appOrigin(opts.origin)}/portal/set-password?token=${raw}`;
}

/** Issue a developer set-password link (welcome from the operator, or a reset). */
export async function issueDeveloperReset(
  developerId: string,
  opts: { ttlMs?: number; origin?: string | null } = {}
): Promise<string | null> {
  const { raw, hash } = newToken();
  const expires = new Date(Date.now() + (opts.ttlMs ?? RESET_TTL_MS)).toISOString();
  const { error } = await supabase
    .from('clients')
    .update({ reset_token: hash, reset_token_expires: expires })
    .eq('id', developerId);
  if (error) {
    console.error('issueDeveloperReset:', error);
    return null;
  }
  return `${appOrigin(opts.origin)}/developer/reset-password?token=${raw}`;
}

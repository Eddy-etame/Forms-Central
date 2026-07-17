/**
 * Minimal Google OAuth 2.0 (authorization-code) helper — no external deps,
 * just fetch against Google's endpoints. Dormant until GOOGLE_CLIENT_ID and
 * GOOGLE_CLIENT_SECRET are set (see docs/google-oauth setup).
 */

const AUTH_ENDPOINT = 'https://accounts.google.com/o/oauth2/v2/auth';
const TOKEN_ENDPOINT = 'https://oauth2.googleapis.com/token';
const USERINFO_ENDPOINT = 'https://openidconnect.googleapis.com/v1/userinfo';

export function isGoogleConfigured(): boolean {
  return !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
}

/**
 * The redirect URI Google will call back. Must EXACTLY match one registered in
 * the Google Cloud console. Prefer an explicit env; otherwise derive from the
 * forwarded host (works on Vercel prod + previews).
 */
export function resolveRedirectUri(req: Request): string {
  if (process.env.GOOGLE_REDIRECT_URI) return process.env.GOOGLE_REDIRECT_URI;
  const h = req.headers;
  const proto = h.get('x-forwarded-proto') || 'https';
  const host = h.get('x-forwarded-host') || h.get('host') || 'localhost:3000';
  return `${proto}://${host}/api/auth/google/callback`;
}

/** Build the consent-screen URL. `state` is our CSRF token. */
export function getGoogleAuthUrl(redirectUri: string, state: string): string {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID as string,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    state,
    access_type: 'online',
    prompt: 'select_account',
  });
  return `${AUTH_ENDPOINT}?${params.toString()}`;
}

/** Exchange an authorization code for an access token. */
export async function exchangeGoogleCode(code: string, redirectUri: string): Promise<string | null> {
  const res = await fetch(TOKEN_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID as string,
      client_secret: process.env.GOOGLE_CLIENT_SECRET as string,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  });
  if (!res.ok) {
    console.error('[google] token exchange failed:', res.status, await res.text().catch(() => ''));
    return null;
  }
  const json = (await res.json()) as { access_token?: string };
  return json.access_token || null;
}

export interface GoogleUser {
  sub: string;
  email: string;
  emailVerified: boolean;
  name?: string;
}

/** Fetch the profile for an access token. */
export async function fetchGoogleUser(accessToken: string): Promise<GoogleUser | null> {
  const res = await fetch(USERINFO_ENDPOINT, { headers: { Authorization: `Bearer ${accessToken}` } });
  if (!res.ok) {
    console.error('[google] userinfo failed:', res.status);
    return null;
  }
  const j = (await res.json()) as { sub: string; email?: string; email_verified?: boolean; name?: string };
  if (!j.email) return null;
  return { sub: j.sub, email: j.email.toLowerCase(), emailVerified: !!j.email_verified, name: j.name };
}

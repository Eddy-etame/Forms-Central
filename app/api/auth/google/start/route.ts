import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { isGoogleConfigured, resolveRedirectUri, getGoogleAuthUrl } from '@/lib/googleOAuth';

/**
 * Kicks off Google sign-in: sets a CSRF `state` cookie and redirects the
 * browser to Google's consent screen. 404s cleanly if Google isn't configured.
 */
export async function GET(req: Request) {
  if (!isGoogleConfigured()) {
    return NextResponse.json({ error: 'Google sign-in is not configured.' }, { status: 404 });
  }

  const state = crypto.randomUUID();
  const redirectUri = resolveRedirectUri(req);
  const url = getGoogleAuthUrl(redirectUri, state);

  const res = NextResponse.redirect(url);
  // Short-lived, httpOnly state cookie — the callback must echo this back.
  res.cookies.set('g_oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 10 * 60,
  });
  return res;
}

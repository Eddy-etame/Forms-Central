import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { signJWT } from '@/lib/jwt';
import { hashPassword } from '@/lib/passwords';
import { generateRandomPassword } from '@/lib/crypto';
import { clientIp } from '@/lib/rateLimit';
import { logSecurityEvent, SEC } from '@/lib/securityEvents';
import { isGoogleConfigured, resolveRedirectUri, exchangeGoogleCode, fetchGoogleUser } from '@/lib/googleOAuth';

/**
 * Google sign-in callback. Verifies the CSRF state, exchanges the code, and
 * (for a verified email) finds-or-creates the client, then issues the session.
 * A Google account with no matching client is onboarded automatically — the
 * IdP is the second factor, so app-level 2FA is skipped for this path.
 */
export async function GET(req: Request) {
  const redirectUri = resolveRedirectUri(req);
  const origin = new URL(redirectUri).origin;
  const fail = (reason: string) => {
    logSecurityEvent({ type: SEC.CLIENT_LOGIN_FAILED, severity: 'warn', ip: clientIp(req.headers), detail: `google: ${reason}` });
    return NextResponse.redirect(new URL('/client/login?error=google', origin));
  };

  if (!isGoogleConfigured()) return NextResponse.redirect(new URL('/client/login', origin));

  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const cookieState = req.headers.get('cookie')?.match(/(?:^|;\s*)g_oauth_state=([^;]+)/)?.[1];

  if (!code || !state || !cookieState || state !== cookieState) return fail('bad state/code');

  const accessToken = await exchangeGoogleCode(code, redirectUri);
  if (!accessToken) return fail('token exchange');

  const user = await fetchGoogleUser(accessToken);
  if (!user) return fail('userinfo');
  if (!user.emailVerified) return fail('email not verified');

  const JWT_SECRET = process.env.JWT_SECRET;
  if (!JWT_SECRET) return fail('server config');

  // Find or create the client by email.
  let clientId: string;
  const { data: existing } = await supabase.from('clients').select('id').eq('email', user.email).maybeSingle();

  if (existing) {
    clientId = existing.id;
  } else {
    // New Google user — create a client with a random password so the account
    // is recoverable later via forgot-password, and never has a blank secret.
    const encrypted = hashPassword(generateRandomPassword(24));
    const { data: created, error } = await supabase
      .from('clients')
      .insert([{ name: user.name || user.email.split('@')[0], email: user.email, encrypted_password: encrypted }])
      .select('id')
      .single();
    if (error || !created) return fail('create');
    clientId = created.id;
  }

  const token = await signJWT(
    { sub: 'client', clientId, iat: Math.floor(Date.now() / 1000), exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7 },
    JWT_SECRET
  );

  logSecurityEvent({ type: SEC.CLIENT_LOGIN_OK, severity: 'info', actor: user.email, ip: clientIp(req.headers), meta: { clientId, via: 'google' } });

  const res = NextResponse.redirect(new URL('/client/dashboard', origin));
  res.cookies.set('client_access_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });
  res.cookies.set('g_oauth_state', '', { path: '/', maxAge: 0 }); // clear CSRF cookie
  return res;
}

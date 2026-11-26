import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { issueDeveloperToken, endAllDeveloperSessions, developerCookieOptions, DEVELOPER_COOKIE } from '@/lib/developerAuth';
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
    return NextResponse.redirect(new URL('/developer/login?error=google', origin));
  };

  if (!isGoogleConfigured()) return NextResponse.redirect(new URL('/developer/login', origin));

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

  if (!process.env.JWT_SECRET) return fail('server config');

  // Find or create the client by email.
  let clientId: string;
  let justCreated = false;
  const { data: existing } = await supabase.from('clients').select('id, email_verified_at').eq('email', user.email).maybeSingle();

  if (existing) {
    clientId = existing.id;
    if (!(existing as { email_verified_at?: string | null }).email_verified_at) {
      // The account was created with a password by someone who never proved
      // they own this address. Google has just proven who does: whatever
      // password and sessions existed before are not theirs to keep.
      await supabase
        .from('clients')
        .update({ encrypted_password: hashPassword(generateRandomPassword(24)), reset_token: null, reset_token_expires: null, email_verified_at: new Date().toISOString() })
        .eq('id', clientId);
      await endAllDeveloperSessions(clientId);
      logSecurityEvent({ type: SEC.CLIENT_LOGIN_OK, severity: 'warn', actor: user.email, ip: clientIp(req.headers), detail: 'First proof of ownership (Google): earlier password and sessions of this unverified account were ended', meta: { clientId } });
    }
  } else {
    justCreated = true;
    // New Google user — create a client with a random password so the account
    // is recoverable later via forgot-password, and never has a blank secret.
    const encrypted = hashPassword(generateRandomPassword(24));
    const { data: created, error } = await supabase
      .from('clients')
      .insert([{ name: user.name || user.email.split('@')[0], email: user.email, encrypted_password: encrypted, email_verified_at: new Date().toISOString() }])
      .select('id')
      .single();
    if (error || !created) return fail('create');
    clientId = created.id;
  }

  const token = await issueDeveloperToken(clientId, clientIp(req.headers), req.headers.get('user-agent'));
  if (!token) return fail('server config');

  logSecurityEvent({ type: SEC.CLIENT_LOGIN_OK, severity: 'info', actor: user.email, ip: clientIp(req.headers), meta: { clientId, via: 'google' } });

  const res = NextResponse.redirect(new URL(justCreated ? '/developer/choose-plan' : '/developer/dashboard', origin));
  res.cookies.set(DEVELOPER_COOKIE, token, developerCookieOptions());
  res.cookies.set('g_oauth_state', '', { path: '/', maxAge: 0 }); // clear CSRF cookie
  return res;
}

import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { signJWT } from './jwt';
import { supabase } from './supabase';

/**
 * Issues the super-admin session (access + refresh cookies, refresh hash
 * stored server-side). Shared by the password login route and the 2FA
 * verification route so token discipline can never drift between them.
 */
export async function issueAdminSession(): Promise<NextResponse> {
  const JWT_SECRET = process.env.JWT_SECRET;
  if (!JWT_SECRET) {
    return NextResponse.json({ error: 'Auth not configured' }, { status: 500 });
  }

  // Access token — 15 minutes
  const accessExp = Math.floor(Date.now() / 1000) + 15 * 60;
  const accessToken = await signJWT(
    { sub: 'admin', iat: Math.floor(Date.now() / 1000), exp: accessExp },
    JWT_SECRET
  );

  // Refresh token — 7 days, hash stored for revocation
  const refreshExp = Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60;
  const rawRefreshToken = crypto.randomUUID();
  const refreshTokenHash = crypto.createHash('sha256').update(rawRefreshToken).digest('hex');

  const refreshToken = await signJWT(
    { sub: 'admin', token_id: rawRefreshToken, iat: Math.floor(Date.now() / 1000), exp: refreshExp },
    JWT_SECRET
  );

  const { error: dbError } = await supabase
    .from('refresh_tokens')
    .insert([{ token_hash: refreshTokenHash, expires_at: new Date(refreshExp * 1000).toISOString() }]);

  if (dbError) {
    console.error('Failed to store refresh token hash:', dbError);
    return NextResponse.json({ error: 'Database session error' }, { status: 500 });
  }

  const response = NextResponse.json({ success: true });

  // httpOnly: the token is only ever read server-side — keep it away from XSS.
  response.cookies.set('access_token', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 15 * 60,
    path: '/',
  });

  response.cookies.set('refresh_token', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60,
    path: '/',
  });

  return response;
}

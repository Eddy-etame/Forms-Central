import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabase } from '@/lib/supabase';
import { verifyJWT, signJWT } from '@/lib/jwt';
import { hashPassword } from '@/lib/passwords';

/**
 * "My Atelier" — one click from the admin panel into the OWNER'S OWN
 * subscriber workspace, no second login.
 *
 * The owner is already authenticated at the highest privilege (admin). This
 * endpoint verifies that admin session, resolves the owner's client account
 * (ATELIER_EMAIL, falling back to ADMIN_2FA_EMAIL — creating it once if it
 * doesn't exist yet), mints a normal client session, and drops the operator
 * on /client/dashboard. Previously "My Atelier" just linked to
 * /client/dashboard, which requires a CLIENT cookie the admin doesn't have —
 * so it bounced to /client/login. That's the bug this closes.
 */
export async function GET(req: Request) {
  const JWT_SECRET = process.env.JWT_SECRET;
  if (!JWT_SECRET) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // 1. Require a valid ADMIN session (this route is not under the /admin proxy).
  const jar = await cookies();
  const adminToken = jar.get('access_token')?.value;
  const adminPayload = adminToken ? await verifyJWT(adminToken, JWT_SECRET) : null;
  if (!adminPayload || adminPayload.sub !== 'admin') {
    // Not an admin — behave like any missing route (hidden), send to admin login.
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // 2. Resolve the owner's atelier client account.
  const atelierEmail = (process.env.ATELIER_EMAIL || process.env.ADMIN_2FA_EMAIL || '').trim().toLowerCase();
  if (!atelierEmail) {
    // No atelier identity configured — tell the operator how to set it.
    return NextResponse.redirect(new URL('/admin?atelier=unconfigured', req.url));
  }

  let { data: client } = await supabase
    .from('clients')
    .select('id')
    .eq('email', atelierEmail)
    .maybeSingle();

  // Create the atelier account once if it doesn't exist (random unusable
  // password — the owner enters via admin, never via /client/login here).
  if (!client) {
    const { data: created, error: insErr } = await supabase
      .from('clients')
      .insert({
        name: 'My Atelier',
        email: atelierEmail,
        encrypted_password: hashPassword(crypto.randomUUID()),
        plan: 'max',
      })
      .select('id')
      .single();
    if (insErr || !created) {
      console.error('Atelier provisioning failed:', insErr);
      return NextResponse.redirect(new URL('/admin?atelier=error', req.url));
    }
    client = created;
  }

  // 3. Mint a normal client session for that account.
  const payload = {
    sub: 'client',
    clientId: client.id,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7, // 7 days
  };
  const token = await signJWT(payload, JWT_SECRET);

  const res = NextResponse.redirect(new URL('/client/dashboard', req.url));
  res.cookies.set('client_access_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}

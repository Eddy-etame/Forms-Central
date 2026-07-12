import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabase } from '@/lib/supabase';
import { hashPassword } from '@/lib/passwords';
import { checkRateLimit, clientIp } from '@/lib/rateLimit';

/**
 * Complete a password reset. Verifies the single-use token (by hash) and its
 * expiry, sets the new scrypt-hashed password, and clears the token.
 */
export async function POST(req: Request) {
  const ip = clientIp(req.headers);
  if (!(await checkRateLimit(`reset:${ip}`, 10, 60_000))) {
    return NextResponse.json({ success: false, error: 'Too many attempts. Try again in a minute.' }, { status: 429 });
  }

  const { token, password } = await req.json().catch(() => ({}));
  const rawToken = String(token ?? '');
  const newPassword = String(password ?? '');
  if (!rawToken) return NextResponse.json({ success: false, error: 'Missing reset token.' }, { status: 400 });
  if (newPassword.length < 8) {
    return NextResponse.json({ success: false, error: 'Password must be at least 8 characters.' }, { status: 400 });
  }

  const hash = crypto.createHash('sha256').update(rawToken).digest('hex');
  const { data: client } = await supabase
    .from('clients')
    .select('id, reset_token_expires')
    .eq('reset_token', hash)
    .maybeSingle();

  if (!client) {
    return NextResponse.json({ success: false, error: 'This reset link is invalid or has already been used.' }, { status: 400 });
  }
  if (!client.reset_token_expires || new Date(client.reset_token_expires) < new Date()) {
    return NextResponse.json({ success: false, error: 'This reset link has expired. Request a new one.' }, { status: 400 });
  }

  const { error } = await supabase
    .from('clients')
    .update({ encrypted_password: hashPassword(newPassword), reset_token: null, reset_token_expires: null })
    .eq('id', client.id);

  if (error) {
    console.error('reset-password update error:', error);
    return NextResponse.json({ success: false, error: 'Could not update your password. Try again.' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

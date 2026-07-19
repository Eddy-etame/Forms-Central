import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { signJWT } from '@/lib/jwt';
import { hashPassword } from '@/lib/passwords';
import { checkRateLimit, clientIp } from '@/lib/rateLimit';
import { cookies } from 'next/headers';

/**
 * Self-serve signup. Creates a client (tenant) account and signs them in
 * immediately (same JWT cookie as client-login). New accounts start on the
 * free plan; upgrading flips clients.plan to 'pro'.
 */
export async function POST(req: Request) {
  try {
    // Abuse guard: 3 account creations / 10 min per IP.
    const ip = clientIp(req.headers);
    if (!(await checkRateLimit(`signup:${ip}`, 3, 10 * 60_000))) {
      return NextResponse.json(
        { success: false, error: 'Too many signups from this connection. Try again later.' },
        { status: 429 }
      );
    }

    const { name, email, password } = await req.json();

    const cleanName = String(name ?? '').trim();
    const cleanEmail = String(email ?? '').trim().toLowerCase();
    const cleanPassword = String(password ?? '');

    if (cleanName.length < 2) {
      return NextResponse.json(
        { success: false, error: 'Please enter your name or company name.' },
        { status: 400 }
      );
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email address.' },
        { status: 400 }
      );
    }
    if (cleanPassword.length < 8) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 8 characters.' },
        { status: 400 }
      );
    }

    // Create through the SECURITY DEFINER function (migration_v19): uniqueness
    // is enforced IN THE DATABASE (unique index on lower(email)), so a
    // duplicate is impossible even under a race — it raises 'client_email_exists'.
    // Falls back to a check-then-insert until v19 is applied.
    const hashed = hashPassword(cleanPassword);
    let client: { id: string } | null = null;
    const createRpc = await supabase.rpc('create_client_secure', {
      p_name: cleanName, p_email: cleanEmail, p_password: hashed, p_plan: 'free',
    });
    if (!createRpc.error && createRpc.data) {
      client = { id: createRpc.data as string };
    } else if (createRpc.error && (createRpc.error.code === '23505' || String(createRpc.error.message).includes('client_email_exists'))) {
      return NextResponse.json(
        { success: false, error: 'An account already exists with this email. Please sign in.' },
        { status: 409 }
      );
    } else {
      // Fallback path (function absent pre-v19).
      const { data: existing } = await supabase.from('clients').select('id').eq('email', cleanEmail).maybeSingle();
      if (existing) {
        return NextResponse.json(
          { success: false, error: 'An account already exists with this email. Please sign in.' },
          { status: 409 }
        );
      }
      const ins = await supabase.from('clients').insert({ name: cleanName, email: cleanEmail, encrypted_password: hashed, plan: 'free' }).select('id').single();
      if (ins.error || !ins.data) {
        console.error('Signup insert error:', ins.error);
        return NextResponse.json({ success: false, error: 'Could not create the account. Please try again.' }, { status: 500 });
      }
      client = ins.data;
    }

    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) {
      console.error('Missing JWT_SECRET in env variables');
      return NextResponse.json(
        { success: false, error: 'Server configuration error.' },
        { status: 500 }
      );
    }

    const token = await signJWT(
      {
        sub: 'client',
        clientId: client.id,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7, // 7 days
      },
      JWT_SECRET
    );

    const cookieStore = await cookies();
    cookieStore.set('client_access_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Client signup error:', err);
    return NextResponse.json(
      { success: false, error: 'Internal server error.' },
      { status: 500 }
    );
  }
}

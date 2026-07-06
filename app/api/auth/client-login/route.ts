import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { signJWT } from '@/lib/jwt';
import { decryptPassword } from '@/lib/crypto';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email et mot de passe requis.' },
        { status: 400 }
      );
    }

    // Lookup client by email
    const { data: client, error } = await supabase
      .from('clients')
      .select('id, encrypted_password')
      .eq('email', email.trim().toLowerCase())
      .single();

    if (error || !client || !client.encrypted_password) {
      return NextResponse.json(
        { success: false, error: 'Identifiants incorrects.' },
        { status: 401 }
      );
    }

    // Decrypt and compare passwords
    const decryptedPassword = decryptPassword(client.encrypted_password);
    if (password !== decryptedPassword) {
      return NextResponse.json(
        { success: false, error: 'Identifiants incorrects.' },
        { status: 401 }
      );
    }

    // Passwords match -> Generate JWT
    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) {
      console.error('Missing JWT_SECRET in env variables');
      return NextResponse.json(
        { success: false, error: 'Erreur de configuration serveur.' },
        { status: 500 }
      );
    }

    const payload = {
      sub: 'client',
      clientId: client.id,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7, // 7 days expiration
    };

    const token = await signJWT(payload, JWT_SECRET);

    // Set HTTP-only cookie
    const cookieStore = await cookies();
    cookieStore.set('client_access_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Client login error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur interne du serveur.' },
      { status: 500 }
    );
  }
}

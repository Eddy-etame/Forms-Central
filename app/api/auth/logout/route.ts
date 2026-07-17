import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { verifyJWT } from '@/lib/jwt';
import { supabase } from '@/lib/supabase';

const JWT_SECRET = process.env.JWT_SECRET;

export async function POST(request: NextRequest) {
  const refreshTokenCookie = request.cookies.get('refresh_token')?.value;
  
  if (refreshTokenCookie && JWT_SECRET) {
    try {
      const payload = await verifyJWT(refreshTokenCookie, JWT_SECRET);
      if (payload && payload.token_id) {
        const rawTokenId = payload.token_id as string;
        const tokenHash = crypto.createHash('sha256').update(rawTokenId).digest('hex');
        
        // Revoke token in DB
        await supabase
          .from('refresh_tokens')
          .update({ revoked: true })
          .eq('token_hash', tokenHash);
      }
    } catch (err) {
      console.error('Logout revocation error:', err);
    }
  }

  // Revoke the client device session so the sid can't be replayed.
  const clientToken = request.cookies.get('client_access_token')?.value;
  if (clientToken && JWT_SECRET) {
    try {
      const payload = await verifyJWT(clientToken, JWT_SECRET);
      if (payload?.sid) {
        const { revokeClientSession } = await import('@/lib/clientSessions');
        await revokeClientSession(payload.sid as string);
      }
    } catch (err) {
      console.error('Client session revocation error:', err);
    }
  }

  const response = NextResponse.json({ success: true });
  response.cookies.delete('access_token');
  response.cookies.delete('refresh_token');
  // Client (tenant) session — without this, client sign-out never actually signed out.
  response.cookies.delete('client_access_token');
  // End-client portal session.
  response.cookies.delete('portal_access_token');
  return response;
}

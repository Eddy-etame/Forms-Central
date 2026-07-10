import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabase } from '@/lib/supabase';
import { verifyJWT } from '@/lib/jwt';
import { generateApiKey } from '@/lib/apiKeys';
import { getPlan } from '@/lib/plans';
import { checkRateLimit, clientIp } from '@/lib/rateLimit';

/** API key management for signed-in clients. Paid plans only (plan.apiAccess). */

const MAX_KEYS = 5;

async function authed(): Promise<{ clientId: string; plan: ReturnType<typeof getPlan> } | null> {
  const jar = await cookies();
  const token = jar.get('client_access_token')?.value;
  const secret = process.env.JWT_SECRET;
  if (!token || !secret) return null;
  const payload = await verifyJWT(token, secret);
  if (!payload || payload.sub !== 'client' || !payload.clientId) return null;
  const { data } = await supabase.from('clients').select('plan').eq('id', payload.clientId as string).maybeSingle();
  return { clientId: payload.clientId as string, plan: getPlan(data?.plan) };
}

export async function GET() {
  const auth = await authed();
  if (!auth) return NextResponse.json({ success: false, error: 'Not signed in.' }, { status: 401 });

  const { data } = await supabase
    .from('api_keys')
    .select('id, name, key_prefix, revoked, last_used_at, created_at')
    .eq('client_id', auth.clientId)
    .order('created_at', { ascending: false });

  return NextResponse.json({ success: true, apiAccess: auth.plan.apiAccess, keys: data ?? [] });
}

export async function POST(req: Request) {
  const auth = await authed();
  if (!auth) return NextResponse.json({ success: false, error: 'Not signed in.' }, { status: 401 });

  if (!auth.plan.apiAccess) {
    return NextResponse.json(
      {
        success: false,
        error: `API & MCP access is included from the Solo plan up. You are on ${auth.plan.name}.`,
        paywall: true,
        upgradeUrl: '/pricing',
      },
      { status: 402 }
    );
  }

  if (!(await checkRateLimit(`apikey:${clientIp(req.headers)}`, 10, 60_000))) {
    return NextResponse.json({ success: false, error: 'Slow down a moment.' }, { status: 429 });
  }

  const body = await req.json().catch(() => ({}));
  const name = String(body.name ?? 'default').trim().slice(0, 40) || 'default';

  const { count } = await supabase
    .from('api_keys')
    .select('id', { count: 'exact', head: true })
    .eq('client_id', auth.clientId)
    .eq('revoked', false);
  if ((count ?? 0) >= MAX_KEYS) {
    return NextResponse.json(
      { success: false, error: `Maximum ${MAX_KEYS} active keys. Revoke one first.` },
      { status: 400 }
    );
  }

  const { raw, hash, prefix } = generateApiKey();
  const { data: created, error } = await supabase
    .from('api_keys')
    .insert({ client_id: auth.clientId, name, key_hash: hash, key_prefix: prefix })
    .select('id, name, key_prefix, created_at')
    .single();

  if (error || !created) {
    console.error('API key creation error:', error);
    return NextResponse.json({ success: false, error: 'Could not create the key.' }, { status: 500 });
  }

  // The raw key is returned exactly once.
  return NextResponse.json({ success: true, key: { ...created, raw } });
}

export async function DELETE(req: Request) {
  const auth = await authed();
  if (!auth) return NextResponse.json({ success: false, error: 'Not signed in.' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const keyId = String(body.id ?? '');
  if (!keyId) return NextResponse.json({ success: false, error: 'Key id required.' }, { status: 400 });

  const { error } = await supabase
    .from('api_keys')
    .update({ revoked: true })
    .eq('id', keyId)
    .eq('client_id', auth.clientId); // scope: never revoke another tenant's key

  if (error) return NextResponse.json({ success: false, error: 'Could not revoke the key.' }, { status: 500 });
  return NextResponse.json({ success: true });
}

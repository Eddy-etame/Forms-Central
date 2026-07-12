import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabase } from '@/lib/supabase';
import { verifyJWT } from '@/lib/jwt';

/** Assign/unassign a form to an end-client. Developer-authed, tenant-scoped. */

async function clientId(): Promise<string | null> {
  const jar = await cookies();
  const token = jar.get('client_access_token')?.value;
  const secret = process.env.JWT_SECRET;
  if (!token || !secret) return null;
  const payload = await verifyJWT(token, secret);
  if (!payload || payload.sub !== 'client' || !payload.clientId) return null;
  return payload.clientId as string;
}

export async function POST(req: Request) {
  const cid = await clientId();
  if (!cid) return NextResponse.json({ success: false, error: 'Not signed in.' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const formId = String(body.formId ?? '');
  const portalUserId = body.portalUserId ? String(body.portalUserId) : null;
  const assign = body.assign !== false; // default true
  if (!formId) return NextResponse.json({ success: false, error: 'formId required.' }, { status: 400 });

  // The form must belong to this developer.
  const { data: form } = await supabase.from('forms').select('id').eq('id', formId).eq('client_id', cid).maybeSingle();
  if (!form) return NextResponse.json({ success: false, error: 'Form not found.' }, { status: 404 });

  let target: string | null = null;
  if (assign) {
    if (!portalUserId) return NextResponse.json({ success: false, error: 'portalUserId required to assign.' }, { status: 400 });
    // The end-client must belong to this developer too.
    const { data: pu } = await supabase
      .from('portal_users')
      .select('id')
      .eq('id', portalUserId)
      .eq('parent_client_id', cid)
      .maybeSingle();
    if (!pu) return NextResponse.json({ success: false, error: 'End-client not found.' }, { status: 404 });
    target = portalUserId;
  }

  const { error } = await supabase.from('forms').update({ portal_user_id: target }).eq('id', formId).eq('client_id', cid);
  if (error) return NextResponse.json({ success: false, error: 'Could not update assignment.' }, { status: 500 });
  return NextResponse.json({ success: true });
}

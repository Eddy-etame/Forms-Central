import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getDeveloperSession } from '@/lib/developerAuth';

/**
 * Move a form to another client. Every form belongs to exactly one client
 * (migration v22), so "unassign" no longer exists — only reassignment.
 */
export async function POST(req: Request) {
  const session = await getDeveloperSession();
  if (!session) return NextResponse.json({ success: false, error: 'Not signed in.' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const formId = String(body.formId ?? '');
  const clientId = String(body.clientId ?? body.portalUserId ?? '');
  if (!formId || !clientId) return NextResponse.json({ success: false, error: 'formId and clientId required.' }, { status: 400 });

  const [{ data: form }, { data: client }] = await Promise.all([
    supabase.from('forms').select('id').eq('id', formId).eq('client_id', session.developerId).maybeSingle(),
    supabase.from('portal_users').select('id').eq('id', clientId).eq('parent_client_id', session.developerId).maybeSingle(),
  ]);
  if (!form) return NextResponse.json({ success: false, error: 'Form not found.' }, { status: 404 });
  if (!client) return NextResponse.json({ success: false, error: 'Client not found.' }, { status: 404 });

  const { error } = await supabase
    .from('forms')
    .update({ portal_user_id: clientId })
    .eq('id', formId)
    .eq('client_id', session.developerId);
  if (error) return NextResponse.json({ success: false, error: 'Could not move the form.' }, { status: 500 });
  return NextResponse.json({ success: true });
}

import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getDeveloperContext } from '@/lib/developerAuth';
import { normalizeOrigins } from '@/lib/snippets';
import { FORM_SELECT } from '@/lib/forms';

/**
 * One form: read, change its settings, delete it. Developer-scoped.
 * Everything the operator could configure for a form is now in the
 * developer's own hands: origins, auto-reply, success URL, webhook, the
 * client it belongs to, the developer copy, on/off.
 */

async function ownedForm(developerId: string, formId: string) {
  const { data } = await supabase.from('forms').select(FORM_SELECT).eq('id', formId).eq('client_id', developerId).maybeSingle();
  return data;
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const dev = await getDeveloperContext();
  if (!dev) return NextResponse.json({ success: false, error: 'Not signed in.' }, { status: 401 });
  const { id } = await params;
  const form = await ownedForm(dev.developerId, id);
  if (!form) return NextResponse.json({ success: false, error: 'Form not found.' }, { status: 404 });

  const [{ count: total }, { data: last }] = await Promise.all([
    supabase.from('submissions').select('id', { count: 'exact', head: true }).eq('form_id', id),
    supabase.from('submissions').select('created_at').eq('form_id', id).order('created_at', { ascending: false }).limit(1),
  ]);
  return NextResponse.json({ success: true, form, stats: { total: total ?? 0, lastLeadAt: last?.[0]?.created_at ?? null } });
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const dev = await getDeveloperContext();
  if (!dev) return NextResponse.json({ success: false, error: 'Not signed in.' }, { status: 401 });
  const { id } = await params;
  const form = await ownedForm(dev.developerId, id);
  if (!form) return NextResponse.json({ success: false, error: 'Form not found.' }, { status: 404 });

  const body = await req.json().catch(() => ({}));
  const patch: Record<string, unknown> = {};

  if (body.name !== undefined) {
    const name = String(body.name).trim();
    if (name.length < 2 || name.length > 60) return NextResponse.json({ success: false, error: 'Form name must be 2–60 characters.' }, { status: 400 });
    patch.name = name;
  }
  if (body.origins !== undefined) {
    const origins = normalizeOrigins(body.origins);
    if (origins === null) return NextResponse.json({ success: false, error: 'One of the origins is not a valid URL.' }, { status: 400 });
    patch.allowed_origins = origins.length ? origins : ['*'];
  }
  if (body.isActive !== undefined) patch.is_active = !!body.isActive;
  if (body.notifyDeveloper !== undefined) patch.notify_email = !!body.notifyDeveloper;
  if (body.autoReply !== undefined && body.autoReply && typeof body.autoReply === 'object') {
    const ar = body.autoReply as { enabled?: unknown; subject?: unknown; message?: unknown };
    if (ar.enabled !== undefined) patch.auto_reply_enabled = !!ar.enabled;
    if (ar.subject !== undefined) patch.auto_reply_subject = String(ar.subject).trim().slice(0, 150);
    if (ar.message !== undefined) patch.auto_reply_message = String(ar.message).trim().slice(0, 4000);
  }
  if (body.successUrl !== undefined) {
    const s = String(body.successUrl).trim();
    if (s && !/^https?:\/\/.+/i.test(s)) return NextResponse.json({ success: false, error: 'Success URL must be a full http(s) address.' }, { status: 400 });
    patch.success_url = s || null;
  }
  if (body.webhookUrl !== undefined) {
    const w = String(body.webhookUrl).trim();
    if (w && !/^https:\/\/.+/i.test(w)) return NextResponse.json({ success: false, error: 'Webhook URL must start with https://' }, { status: 400 });
    patch.webhook_url = w || null;
  }
  if (body.clientId !== undefined) {
    const clientId = String(body.clientId);
    const { data: client } = await supabase.from('portal_users').select('id').eq('id', clientId).eq('parent_client_id', dev.developerId).maybeSingle();
    if (!client) return NextResponse.json({ success: false, error: 'Client not found.' }, { status: 404 });
    patch.portal_user_id = clientId;
  }
  if (Object.keys(patch).length === 0) return NextResponse.json({ success: false, error: 'Nothing to update.' }, { status: 400 });

  const { data, error } = await supabase.from('forms').update(patch).eq('id', id).eq('client_id', dev.developerId).select(FORM_SELECT).maybeSingle();
  if (error || !data) {
    console.error('developer/forms PATCH error:', error);
    return NextResponse.json({ success: false, error: 'Could not save the settings.' }, { status: 500 });
  }
  return NextResponse.json({ success: true, form: data });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const dev = await getDeveloperContext();
  if (!dev) return NextResponse.json({ success: false, error: 'Not signed in.' }, { status: 401 });
  const { id } = await params;
  const form = await ownedForm(dev.developerId, id);
  if (!form) return NextResponse.json({ success: false, error: 'Form not found.' }, { status: 404 });

  const { error } = await supabase.from('forms').delete().eq('id', id).eq('client_id', dev.developerId);
  if (error) return NextResponse.json({ success: false, error: 'Could not delete the form.' }, { status: 500 });
  return NextResponse.json({ success: true });
}

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabase } from '@/lib/supabase';
import { verifyJWT } from '@/lib/jwt';
import { checkRateLimit, clientIp } from '@/lib/rateLimit';
import { getPlan } from '@/lib/plans';

/**
 * Self-serve form creation for signed-in clients (tenants).
 * Form limits come from lib/plans (single source of truth with /pricing).
 */

async function authedClientId(): Promise<string | null> {
  const jar = await cookies();
  const token = jar.get('client_access_token')?.value;
  const secret = process.env.JWT_SECRET;
  if (!token || !secret) return null;
  const payload = await verifyJWT(token, secret);
  if (!payload || payload.sub !== 'client' || !payload.clientId) return null;
  return payload.clientId as string;
}

/** List the client's forms (id, name, webhook_url) for self-serve config. */
export async function GET() {
  try {
    const clientId = await authedClientId();
    if (!clientId) {
      return NextResponse.json({ success: false, error: 'Not signed in.' }, { status: 401 });
    }
    const { data, error } = await supabase
      .from('forms')
      .select('id, name, webhook_url')
      .eq('client_id', clientId)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return NextResponse.json({ success: true, forms: data || [] });
  } catch (err) {
    console.error('client/forms GET error:', err);
    return NextResponse.json({ success: false, error: 'Internal server error.' }, { status: 500 });
  }
}

/** Self-serve webhook config: set/clear a form's webhook URL (https only). */
export async function PATCH(req: Request) {
  try {
    const clientId = await authedClientId();
    if (!clientId) {
      return NextResponse.json({ success: false, error: 'Not signed in.' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const formId = String(body.formId ?? '');
    const webhookUrl = String(body.webhookUrl ?? '').trim();

    if (!formId) {
      return NextResponse.json({ success: false, error: 'formId required.' }, { status: 400 });
    }
    if (webhookUrl && !/^https:\/\/.+/i.test(webhookUrl)) {
      return NextResponse.json({ success: false, error: 'Webhook URL must start with https://' }, { status: 400 });
    }

    // Ownership check — a client can only configure their own forms.
    const { data: form } = await supabase
      .from('forms')
      .select('id')
      .eq('id', formId)
      .eq('client_id', clientId)
      .maybeSingle();
    if (!form) {
      return NextResponse.json({ success: false, error: 'Form not found.' }, { status: 404 });
    }

    const { error } = await supabase
      .from('forms')
      .update({ webhook_url: webhookUrl || null })
      .eq('id', formId);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('client/forms PATCH error:', err);
    return NextResponse.json({ success: false, error: 'Internal server error.' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const clientId = await authedClientId();
    if (!clientId) {
      return NextResponse.json({ success: false, error: 'Not signed in.' }, { status: 401 });
    }

    if (!(await checkRateLimit(`newform:${clientIp(req.headers)}`, 10, 60_000))) {
      return NextResponse.json({ success: false, error: 'Slow down a moment.' }, { status: 429 });
    }

    const body = await req.json().catch(() => ({}));
    const name = String(body.name ?? '').trim();
    if (name.length < 2 || name.length > 60) {
      return NextResponse.json(
        { success: false, error: 'Form name must be 2–60 characters.' },
        { status: 400 }
      );
    }

    // Plan-aware limit (values shared with /pricing via lib/plans).
    const [{ data: client }, { count }] = await Promise.all([
      supabase.from('clients').select('plan').eq('id', clientId).maybeSingle(),
      supabase.from('forms').select('id', { count: 'exact', head: true }).eq('client_id', clientId),
    ]);
    const plan = getPlan(client?.plan);
    if (plan.formLimit !== null && (count ?? 0) >= plan.formLimit) {
      return NextResponse.json(
        {
          success: false,
          error: `The ${plan.name} plan includes ${plan.formLimit} forms. Upgrade for more.`,
          paywall: true,
          upgradeUrl: '/pricing',
        },
        { status: 402 }
      );
    }

    const { data: form, error } = await supabase
      .from('forms')
      .insert({
        name,
        client_id: clientId,
        is_active: true,
        notify_email: true,
        auto_reply_enabled: true,
        auto_reply_subject: 'Thanks — we received your message',
        auto_reply_message: '',
      })
      .select('id, name')
      .single();

    if (error || !form) {
      console.error('Self-serve form creation error:', error);
      return NextResponse.json(
        { success: false, error: 'Could not create the form. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, form });
  } catch (err) {
    console.error('client/forms POST error:', err);
    return NextResponse.json({ success: false, error: 'Internal server error.' }, { status: 500 });
  }
}

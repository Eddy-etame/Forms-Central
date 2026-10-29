import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getDeveloperContext } from '@/lib/developerAuth';
import { checkRateLimit, clientIp } from '@/lib/rateLimit';
import { normalizeLang } from '@/lib/domain';
import { FORM_SELECT, createFormForDeveloper, isServiceError } from '@/lib/forms';

/**
 * Forms, self-serve.
 *
 *   GET  → every form of the signed-in developer, with its client and settings
 *   POST → create a form. A form ALWAYS belongs to a client (migration v22) and
 *          gets its browser origins from the site URL, so the first real
 *          submission works instead of failing CORS.
 *   PATCH → kept for the webhook field used by the Developer page
 *           (full settings live on /api/developer/forms/[id]).
 */

export async function GET() {
  const dev = await getDeveloperContext();
  if (!dev) return NextResponse.json({ success: false, error: 'Not signed in.' }, { status: 401 });

  const { data, error } = await supabase
    .from('forms')
    .select(FORM_SELECT)
    .eq('client_id', dev.developerId)
    .order('created_at', { ascending: true });
  if (error) {
    console.error('developer/forms GET error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error.' }, { status: 500 });
  }
  return NextResponse.json({ success: true, formLimit: dev.plan.formLimit, forms: data ?? [] });
}

export async function POST(req: Request) {
  const dev = await getDeveloperContext();
  if (!dev) return NextResponse.json({ success: false, error: 'Not signed in.' }, { status: 401 });
  if (!(await checkRateLimit(`newform:${clientIp(req.headers)}`, 10, 60_000))) {
    return NextResponse.json({ success: false, error: 'Slow down a moment.' }, { status: 429 });
  }

  const body = await req.json().catch(() => ({}));
  const name = String(body.name ?? '').trim();
  const clientId = String(body.clientId ?? '');
  const siteUrl = String(body.siteUrl ?? '').trim();
  const lang = normalizeLang(body.lang, 'fr');
  const notifyDeveloper = body.notifyDeveloper === undefined ? true : !!body.notifyDeveloper;

  const result = await createFormForDeveloper({
    developerId: dev.developerId,
    plan: dev.plan,
    name,
    clientId,
    siteUrl,
    origins: Array.isArray(body.origins) ? (body.origins as string[]) : null,
    lang,
    notifyDeveloper,
  });
  if (isServiceError(result)) {
    return NextResponse.json(
      { success: false, error: result.error, ...(result.code ? { code: result.code } : {}), ...(result.paywall ? { paywall: true, upgradeUrl: '/pricing' } : {}) },
      { status: result.status }
    );
  }
  return NextResponse.json({ success: true, form: result.form, originsOpen: result.originsOpen, lang });
}

/** Legacy: the Developer page saves webhook URLs here. */
export async function PATCH(req: Request) {
  const dev = await getDeveloperContext();
  if (!dev) return NextResponse.json({ success: false, error: 'Not signed in.' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const formId = String(body.formId ?? '');
  const webhookUrl = String(body.webhookUrl ?? '').trim();
  if (!formId) return NextResponse.json({ success: false, error: 'formId required.' }, { status: 400 });
  if (webhookUrl && !/^https:\/\/.+/i.test(webhookUrl)) {
    return NextResponse.json({ success: false, error: 'Webhook URL must start with https://' }, { status: 400 });
  }

  const { data: form } = await supabase.from('forms').select('id').eq('id', formId).eq('client_id', dev.developerId).maybeSingle();
  if (!form) return NextResponse.json({ success: false, error: 'Form not found.' }, { status: 404 });

  const { error } = await supabase.from('forms').update({ webhook_url: webhookUrl || null }).eq('id', formId);
  if (error) return NextResponse.json({ success: false, error: 'Could not save.' }, { status: 500 });
  return NextResponse.json({ success: true });
}

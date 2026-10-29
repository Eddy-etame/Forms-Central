import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getDeveloperContext } from '@/lib/developerAuth';
import { checkRateLimit, clientIp } from '@/lib/rateLimit';
import { isPaidPlanId } from '@/lib/plans';
import { sendPlanRequestEmail } from '@/lib/email';

/**
 * Plan requests. Self-serve checkout opens with the company's invoicing; until
 * then a paid plan is requested here, recorded in `plan_requests`, and the
 * operator activates it from the admin. Replaces the old mailto: link.
 */

export async function GET() {
  const dev = await getDeveloperContext();
  if (!dev) return NextResponse.json({ success: false, error: 'Not signed in.' }, { status: 401 });
  const { data } = await supabase
    .from('plan_requests')
    .select('id, plan, status, created_at')
    .eq('client_id', dev.developerId)
    .order('created_at', { ascending: false })
    .limit(1);
  return NextResponse.json({ success: true, currentPlan: dev.plan.id, request: data?.[0] ?? null });
}

export async function POST(req: Request) {
  const dev = await getDeveloperContext();
  if (!dev) return NextResponse.json({ success: false, error: 'Not signed in.' }, { status: 401 });
  if (!(await checkRateLimit(`plan-request:${clientIp(req.headers)}`, 5, 60 * 60_000))) {
    return NextResponse.json({ success: false, error: 'You already sent a request recently. We will get back to you by e-mail.' }, { status: 429 });
  }

  const body = await req.json().catch(() => ({}));
  const plan = String(body.plan ?? '').toLowerCase();
  const message = String(body.message ?? '').trim().slice(0, 2000) || null;
  if (!isPaidPlanId(plan)) return NextResponse.json({ success: false, error: 'Unknown plan.' }, { status: 400 });
  if (dev.plan.id === plan) return NextResponse.json({ success: false, error: `You are already on ${dev.plan.name}.` }, { status: 400 });

  const { data: created, error } = await supabase
    .from('plan_requests')
    .insert({ client_id: dev.developerId, plan, message })
    .select('id, plan, status, created_at')
    .single();
  if (error || !created) {
    console.error('plan request insert error:', error);
    return NextResponse.json({ success: false, error: 'Could not record your request. Please try again.' }, { status: 500 });
  }

  const operator = (process.env.OPERATOR_EMAIL || process.env.ADMIN_2FA_EMAIL || '').trim();
  if (operator) {
    sendPlanRequestEmail(operator, { developerName: dev.name, developerEmail: dev.email, plan, message }).catch((e) =>
      console.error('plan request email error:', e)
    );
  }

  return NextResponse.json({ success: true, request: created });
}

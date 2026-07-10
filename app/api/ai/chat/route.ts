import { NextResponse } from 'next/server';
import { cookies, headers } from 'next/headers';
import { supabase } from '@/lib/supabase';
import { verifyJWT } from '@/lib/jwt';
import { askAI, type ChatMessage } from '@/lib/ai';
import { getPlan, type Plan } from '@/lib/plans';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const ANON_LIMIT = 1;            // anonymous visitors: lifetime trial messages
const BURST_LIMIT = 30;          // unlimited tiers: max messages per rolling minute
const MAX_MESSAGES = 20;         // conversation history cap accepted per request
const MAX_CHARS = 8000;          // total payload cap

type Caller =
  | { kind: 'client'; clientId: string; plan: Plan }
  | { kind: 'anon'; anonId: string; fresh: boolean };

async function identify(): Promise<Caller> {
  const jar = await cookies();
  const token = jar.get('client_access_token')?.value;

  if (token && process.env.JWT_SECRET) {
    const payload = await verifyJWT(token, process.env.JWT_SECRET);
    const clientId = payload?.clientId as string | undefined;
    if (clientId) {
      const { data } = await supabase.from('clients').select('plan').eq('id', clientId).maybeSingle();
      return { kind: 'client', clientId, plan: getPlan(data?.plan) };
    }
  }

  // Anonymous visitor — stable id in an httpOnly cookie.
  let anonId = jar.get('ke_anon')?.value;
  const fresh = !anonId;
  if (!anonId) anonId = crypto.randomUUID();
  return { kind: 'anon', anonId, fresh };
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const raw = Array.isArray(body?.messages) ? body.messages : [];

    // Sanitize inbound history.
    const messages: ChatMessage[] = raw
      .filter((m: unknown): m is ChatMessage => {
        const mm = m as ChatMessage;
        return mm && (mm.role === 'user' || mm.role === 'assistant') && typeof mm.content === 'string';
      })
      .slice(-MAX_MESSAGES)
      .map((m: ChatMessage) => ({ role: m.role, content: m.content.slice(0, 4000) }));

    if (!messages.length || messages[messages.length - 1].role !== 'user') {
      return NextResponse.json({ error: 'A user message is required.' }, { status: 400 });
    }
    if (messages.reduce((n, m) => n + m.content.length, 0) > MAX_CHARS) {
      return NextResponse.json({ error: 'Message too long.' }, { status: 413 });
    }

    const caller = await identify();
    const hdrs = await headers();
    const ip = (hdrs.get('x-forwarded-for') || '').split(',')[0].trim() || null;

    // ---- Quota / paywall (server-enforced, plan-aware via lib/plans) ----
    if (caller.kind === 'anon') {
      const { count } = await supabase
        .from('ai_messages')
        .select('id', { count: 'exact', head: true })
        .eq('ok', true)
        .eq('anon_id', caller.anonId);
      if ((count ?? 0) >= ANON_LIMIT) {
        return NextResponse.json(
          {
            error: 'You have used your free message. Create an account or upgrade for more AI assistance.',
            paywall: true,
            upgradeUrl: '/pricing',
          },
          { status: 402 }
        );
      }
    } else if (caller.plan.aiMessages === null) {
      // Unlimited tier — burst guard only.
      const since = new Date(Date.now() - 60_000).toISOString();
      const { count } = await supabase
        .from('ai_messages')
        .select('id', { count: 'exact', head: true })
        .eq('client_id', caller.clientId)
        .gte('created_at', since);
      if ((count ?? 0) >= BURST_LIMIT) {
        return NextResponse.json({ error: 'Rate limit — slow down a moment.' }, { status: 429 });
      }
    } else {
      // Metered tier: free = lifetime allowance, paid tiers = per calendar month.
      const q = supabase
        .from('ai_messages')
        .select('id', { count: 'exact', head: true })
        .eq('ok', true)
        .eq('client_id', caller.clientId);
      const monthStart = new Date();
      monthStart.setUTCDate(1);
      monthStart.setUTCHours(0, 0, 0, 0);
      const { count } =
        caller.plan.id === 'free' ? await q : await q.gte('created_at', monthStart.toISOString());
      if ((count ?? 0) >= caller.plan.aiMessages) {
        const scope = caller.plan.id === 'free' ? 'free message' : `${caller.plan.aiMessages} monthly messages`;
        return NextResponse.json(
          {
            error: `You have used your ${scope}. Upgrade for unlimited AI assistance.`,
            paywall: true,
            upgradeUrl: '/pricing',
          },
          { status: 402 }
        );
      }
    }

    // ---- Answer ----
    const started = Date.now();
    let result;
    try {
      result = await askAI(messages);
    } catch {
      return NextResponse.json(
        { error: 'The assistant is temporarily unavailable. Please try again shortly.' },
        { status: 503 }
      );
    }
    const latency = Date.now() - started;

    // ---- Log usage (also what the free quota counts against) ----
    await supabase.from('ai_messages').insert({
      client_id: caller.kind === 'anon' ? null : caller.clientId,
      anon_id: caller.kind === 'anon' ? caller.anonId : null,
      ip,
      provider: result.provider,
      ok: true,
      latency_ms: latency,
    });

    const res = NextResponse.json({ text: result.text, provider: result.provider });

    // Persist the anon id so the free trial is tracked across requests.
    if (caller.kind === 'anon' && caller.fresh) {
      res.cookies.set('ke_anon', caller.anonId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 365,
      });
    }
    return res;
  } catch (err) {
    console.error('AI chat route error:', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}

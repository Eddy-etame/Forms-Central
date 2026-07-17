import crypto from 'crypto';
import { supabase } from './supabase';

/**
 * Outbound webhooks (migrations/migration_v17). Signed Stripe-style:
 *
 *   X-Inlet-Event:     submission.created
 *   X-Inlet-Signature: t=<unix seconds>,v1=<hex hmac-sha256 of "<t>.<rawBody>">
 *
 * Receiver verification (Node):
 *   const [t, v1] = sig.split(',').map(p => p.split('=')[1]);
 *   const expect = crypto.createHmac('sha256', SECRET).update(`${t}.${rawBody}`).digest('hex');
 *   ok = crypto.timingSafeEqual(Buffer.from(v1), Buffer.from(expect)) && Date.now()/1000 - t < 300;
 *
 * Fire-and-forget with ONE retry; failures are logged to failures_log so
 * they surface on /admin/logs. A webhook can never block or lose a lead.
 */

const TIMEOUT_MS = 5000;

/** Compute the v1 signature (exported for tests + docs parity). */
export function signWebhook(secret: string, timestamp: number, rawBody: string): string {
  return crypto.createHmac('sha256', secret).update(`${timestamp}.${rawBody}`).digest('hex');
}

/** Get the client's signing secret, generating + persisting one on first use. */
async function getOrCreateSecret(clientId: string): Promise<string | null> {
  try {
    const { data } = await supabase.from('clients').select('webhook_secret').eq('id', clientId).maybeSingle();
    if (data?.webhook_secret) return data.webhook_secret;
    const secret = 'whsec_' + crypto.randomBytes(24).toString('hex');
    const { error } = await supabase.from('clients').update({ webhook_secret: secret }).eq('id', clientId);
    return error ? null : secret;
  } catch {
    return null;
  }
}

async function postOnce(url: string, body: string, headers: Record<string, string>): Promise<Response> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    return await fetch(url, { method: 'POST', headers, body, signal: ctrl.signal });
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Deliver a submission.created event. Never throws (fire-and-forget caller).
 */
export async function dispatchLeadWebhook(args: {
  webhookUrl: string;
  clientId: string;
  formId: string;
  formName: string;
  submissionId: string | null;
  payload: Record<string, unknown>;
}): Promise<void> {
  const { webhookUrl, clientId, formId, formName, submissionId, payload } = args;
  try {
    // Only https endpoints (no plaintext, no internal schemes).
    if (!/^https:\/\//i.test(webhookUrl)) return;

    const secret = await getOrCreateSecret(clientId);
    if (!secret) return;

    const timestamp = Math.floor(Date.now() / 1000);
    const body = JSON.stringify({
      event: 'submission.created',
      form: { id: formId, name: formName },
      submission: { id: submissionId, payload, created_at: new Date().toISOString() },
    });
    const headers = {
      'Content-Type': 'application/json',
      'User-Agent': 'Inlet-Webhooks/1.0',
      'X-Inlet-Event': 'submission.created',
      'X-Inlet-Signature': `t=${timestamp},v1=${signWebhook(secret, timestamp, body)}`,
    };

    let lastErr = '';
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const res = await postOnce(webhookUrl, body, headers);
        if (res.ok) return;
        lastErr = `HTTP ${res.status}`;
      } catch (err) {
        lastErr = (err as Error)?.message || 'network error';
      }
      if (attempt === 1) await new Promise((r) => setTimeout(r, 1500));
    }

    // Both attempts failed — signal it on /admin/logs.
    supabase
      .from('failures_log')
      .insert([{ form_id: formId, error_type: 'WEBHOOK_FAILED', error_message: `${webhookUrl}: ${lastErr}`.slice(0, 500), payload: {} }])
      .then(() => {}, () => {});
  } catch (err) {
    console.warn('[webhook] dispatch skipped:', (err as Error)?.message);
  }
}

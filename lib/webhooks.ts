import crypto from 'crypto';
import dns from 'dns';
import { isPublicHttpsUrl, isPublicIp, isIpLiteral } from './netGuard';
import { withSignedAttachments } from './storage';
import { supabase } from './supabase';
import { encryptPassword, decryptPassword } from './crypto';

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
 *
 * Where the server will not go (2026-11-26):
 *  - a name that resolves to a private, loopback or link-local address;
 *  - a redirect: the first answer is the answer. A public https endpoint
 *    could otherwise send this server on to any internal address.
 * The signing secret is stored encrypted; a copy of the database (a backup)
 * does not let anyone forge an event.
 */

const TIMEOUT_MS = 5000;

/** Compute the v1 signature (exported for tests + docs parity). */
export function signWebhook(secret: string, timestamp: number, rawBody: string): string {
  return crypto.createHmac('sha256', secret).update(`${timestamp}.${rawBody}`).digest('hex');
}

/** Get the developer's signing secret, generating + persisting one on first use. */
export async function getOrCreateSecret(clientId: string): Promise<string | null> {
  try {
    const { data } = await supabase.from('clients').select('webhook_secret').eq('id', clientId).maybeSingle();
    const stored = data?.webhook_secret as string | null | undefined;
    if (stored) {
      if (stored.startsWith('whsec_')) {
        // Written before secrets were encrypted at rest: same secret, now stored encrypted.
        await supabase.from('clients').update({ webhook_secret: encryptPassword(stored) }).eq('id', clientId);
        return stored;
      }
      const plain = decryptPassword(stored);
      if (plain) return plain;
      // Unreadable (the encryption key changed): fall through to a new secret rather than sign with garbage.
    }
    const secret = 'whsec_' + crypto.randomBytes(24).toString('hex');
    const { error } = await supabase.from('clients').update({ webhook_secret: encryptPassword(secret) }).eq('id', clientId);
    return error ? null : secret;
  } catch {
    return null;
  }
}

/** Every address the name resolves to must be public; an IP literal is judged as it is. */
async function resolvesToPublic(hostname: string): Promise<boolean> {
  const host = hostname.replace(/^\[|\]$/g, '');
  if (isIpLiteral(host)) return isPublicIp(host);
  try {
    const found = await dns.promises.lookup(host, { all: true, verbatim: true });
    return found.length > 0 && found.every((a) => isPublicIp(a.address));
  } catch {
    return false;
  }
}

async function postOnce(url: string, body: string, headers: Record<string, string>): Promise<Response> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    // redirect: 'manual' — a 3xx is reported as a failure, never followed.
    return await fetch(url, { method: 'POST', headers, body, signal: ctrl.signal, redirect: 'manual' });
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
    // Only public https endpoints: no plaintext, no loopback or private hosts —
    // by what the URL says, then by what its name actually resolves to.
    if (!isPublicHttpsUrl(webhookUrl)) return;
    if (!(await resolvesToPublic(new URL(webhookUrl).hostname))) {
      await supabase
        .from('failures_log')
        .insert([{ form_id: formId, error_type: 'WEBHOOK_FAILED', error_message: `${new URL(webhookUrl).host}: does not resolve to a public address`, payload: {} }])
        .then(() => {}, () => {});
      return;
    }

    const secret = await getOrCreateSecret(clientId);
    if (!secret) return;

    const timestamp = Math.floor(Date.now() / 1000);
    const body = JSON.stringify({
      event: 'submission.created',
      form: { id: formId, name: formName },
      submission: { id: submissionId, payload: await withSignedAttachments(payload), created_at: new Date().toISOString() },
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
        lastErr = res.status >= 300 && res.status < 400 ? `HTTP ${res.status} (redirects are not followed)` : `HTTP ${res.status}`;
      } catch (err) {
        lastErr = (err as Error)?.message || 'network error';
      }
      if (attempt === 1) await new Promise((r) => setTimeout(r, 1500));
    }

    // Both attempts failed — signal it on /admin/logs (awaited: the caller tracks this whole dispatch).
    await supabase
      .from('failures_log')
      .insert([{ form_id: formId, error_type: 'WEBHOOK_FAILED', error_message: `${new URL(webhookUrl).host}: ${lastErr}`.slice(0, 500), payload: {} }])
      .then(() => {}, () => {});
  } catch (err) {
    console.warn('[webhook] dispatch skipped:', (err as Error)?.message);
  }
}

/** Replace the developer's signing secret (every form signs with it). */
export async function rotateWebhookSecret(clientId: string): Promise<string | null> {
  const secret = 'whsec_' + crypto.randomBytes(24).toString('hex');
  const { error } = await supabase.from('clients').update({ webhook_secret: encryptPassword(secret) }).eq('id', clientId);
  return error ? null : secret;
}

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabase } from '@/lib/supabase';
import { isBlacklisted, blacklistTarget, AUTO_BAN_TTL_MS } from '@/lib/blacklist';
import { handleHoneypotTrigger, resolveHostDomain } from '@/lib/dnsLookup';
import { attachmentUrl, UPLOADS_BUCKET } from '@/lib/storage';
import { stripStorageLinks, sniffUpload, UPLOAD_CONTENT_TYPE } from '@/lib/attachments';
import { verifyChallenge } from '@/lib/pow';
import { sendLeadEmail, sendAutoReplyEmail } from '@/lib/email';
import { getQuotaState, logEmailSend } from '@/lib/quota';
import { getPlan } from '@/lib/plans';
import { checkRateLimit as dbCheckRateLimit } from '@/lib/rateLimit';
import { verifyApiKey } from '@/lib/apiKeys';
import { isSyntheticEmail, normalizeLang, safePersonName } from '@/lib/domain';
import { background } from '@/lib/background';
import { leadRecipients, markNotified, redeliverPending } from '@/lib/delivery';

export const maxDuration = 30; // attachments + e-mail + webhook can take a while

/**
 * POST /api/submit/{formId} — the public lead endpoint.
 *
 * Invariants (court orders A1, A2, A7, A8):
 *  • A lead that passes the gates is ALWAYS stored before anything else is
 *    attempted. A keyword hit does not drop it: it is stored as `suspect`.
 *  • Automatic bans are temporary (24 h). Nothing bans a visitor forever.
 *  • A request authenticated with the developer's API key is a server-to-server
 *    submit: CORS and proof-of-work are waived, and the forwarded visitor IP is
 *    what rate limits and spam gates look at — never the relay's own IP.
 *  • E-mails are "sent" only when the provider accepted them; a failed send is
 *    logged as SMTP_FAILED and the daily budget is charged only on success.
 *  • The client (the business) receives the lead; the developer gets a copy
 *    only if the form says so. Reply-To is the visitor.
 */

// In-memory guards (per instance): anti-replay cache for PoW challenges and a
// burst limiter. The DB-backed limiter below is the authoritative one.
const challengeReplayCache = new Set<string>();
const rateLimitMap = new Map<string, { count: number; timestamp: number }>();
const autoReplyRateLimitMap = new Map<string, number[]>();

function checkBurst(key: string, limit = 12): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(key);
  if (!entry || now - entry.timestamp > 60 * 1000) {
    rateLimitMap.set(key, { count: 1, timestamp: now });
    return true;
  }
  entry.count++;
  return entry.count <= limit;
}

function checkAutoReplyRateLimit(email: string, limit = 3, timeframeMs = 10 * 60 * 1000): boolean {
  const now = Date.now();
  const key = email.toLowerCase().trim();
  const recent = (autoReplyRateLimitMap.get(key) || []).filter((t) => now - t < timeframeMs);
  if (recent.length >= limit) return false;
  recent.push(now);
  autoReplyRateLimitMap.set(key, recent);
  return true;
}

function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[m] as string));
}

const MAX_BODY_BYTES = 6 * 1024 * 1024; // 6 MB — leaves room for a few base64 photos
const MAX_FIELDS = 100;

// Keyword hits never drop a lead (court order A1): the lead is stored as
// "suspect", the client is told, and the auto-reply is withheld.
// "seo" and "investment" left the list on 2026-11-25: they are everyday words
// in a real enquiry to a web studio or an estate agent, and a label on those
// leads costs the visitor their confirmation e-mail. What remains is rarely
// written by a genuine prospect.
const SPAM_KEYWORDS = ['crypto', 'viagra', 'enlarge', 'casino', 'bitcoin', 'backlink', 'backlinks', 'guest post'];
const SPAM_RE = new RegExp(`\\b(${SPAM_KEYWORDS.map((k) => k.replace(/\s+/g, '\\s+')).join('|')})\\b`, 'i');

const IP_RE = /^(?:(?:\d{1,3}\.){3}\d{1,3}|[0-9a-f:]{2,45})$/i;

/**
 * Prevent open redirects: after a native form submit we send the browser
 * somewhere, and the target can come from attacker-controlled input. Allow only
 * the owner's success_url, an allowed origin, this app, or the referring page.
 */
function safeRedirect(candidate: string, appOrigin: string, allowedOrigins: string[], successUrl?: string | null, referer?: string | null): string {
  const fallback = (successUrl && successUrl.trim()) || `${appOrigin}/`;
  if (!candidate) return fallback;
  if (successUrl && candidate === successUrl) return candidate;
  try {
    const target = new URL(candidate, appOrigin);
    if (target.protocol !== 'https:' && target.protocol !== 'http:') return fallback;
    const allowed = new Set<string>([appOrigin]);
    for (const o of allowedOrigins || []) {
      if (o && o !== '*') { try { allowed.add(new URL(o).origin); } catch {} }
    }
    if (successUrl) { try { allowed.add(new URL(successUrl).origin); } catch {} }
    if (referer) { try { allowed.add(new URL(referer).origin); } catch {} }
    return allowed.has(target.origin) ? target.toString() : fallback;
  } catch {
    return fallback;
  }
}

/** failures_log never receives lead content (only field names). */
async function logFailure(formId: string | null, errorType: string, errorMessage: string, payloadKeys: string[] = []) {
  try {
    await supabase.from('failures_log').insert([{
      form_id: formId || null,
      error_type: errorType,
      error_message: errorMessage.slice(0, 500),
      payload: payloadKeys.length ? { fields: payloadKeys.slice(0, 50) } : {},
    }]);
  } catch (e) {
    console.error('[LOG FAILURE ERROR]', e);
  }
}

/*
 * The two plain-HTML answers below are what a visitor sees when a form is
 * posted without JavaScript and no redirect applies. They carry no inline
 * script: the "back" link is wired by public/form-back.js, the one script the
 * policy of this endpoint allows (FORM_ANSWER_CSP in lib/csp.ts). Until
 * 2026-11-26 it was a `javascript:` link, which forced every API answer to
 * allow inline script.
 */
function successPage(): NextResponse {
  return new NextResponse(
    `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Message envoyé / Message sent</title>
<style>body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;background:#F9FAFB;color:#0F172A}.card{background:#fff;padding:2.5rem;border-radius:1.5rem;border:1px solid #F1F5F9;box-shadow:0 10px 15px -3px rgba(0,0,0,.05);text-align:center;max-width:400px}.icon{font-size:3rem;margin-bottom:1rem}h1{font-size:1.25rem;font-weight:700;margin:0 0 .5rem}p{font-size:.875rem;color:#64748B;line-height:1.6;margin:0}.back{display:inline-block;margin-top:1.5rem;padding:.625rem 1.25rem;background:#0F172A;color:#fff;text-decoration:none;border-radius:.75rem;font-size:.875rem;font-weight:600}</style></head>
<body><div class="card"><div class="icon">✓</div><h1>Message envoyé !</h1><p>Votre message a bien été enregistré. Le destinataire a été notifié.</p><a href="#" data-back class="back">Retour / Back</a></div><script src="/form-back.js" defer></script></body></html>`,
    { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
  );
}

function createErrorResponse(status: number, code: string, message: string, remedy: string | null, origin: string | null, isJson: boolean): NextResponse {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (origin) {
    headers['Access-Control-Allow-Origin'] = origin;
    headers['Access-Control-Allow-Methods'] = 'POST, OPTIONS';
    headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, X-Inlet-Visitor-IP, x-client-fingerprint';
  }
  if (isJson || origin) {
    return new NextResponse(JSON.stringify({ success: false, code, error: message, ...(remedy ? { remedy } : {}) }), { status, headers });
  }
  return new NextResponse(
    `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Erreur de soumission / Submission error</title>
<style>body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;background:#FFF5F5;color:#9B2C2C}.card{background:#fff;padding:2.5rem;border-radius:1.5rem;border:1px solid #FED7D7;box-shadow:0 10px 15px -3px rgba(0,0,0,.05);text-align:center;max-width:450px}.icon{font-size:3rem;margin-bottom:1rem;color:#E53E3E}h1{font-size:1.25rem;font-weight:700;margin:0 0 .5rem}p{font-size:.875rem;color:#C53030;line-height:1.6;margin:0}.code{font-family:monospace;background:#FEEBC8;color:#C05621;padding:.2rem .4rem;border-radius:.25rem;font-size:.75rem;display:inline-block;margin-top:.5rem}.remedy{margin-top:1rem;font-size:.875rem;color:#742A2A;background:#FED7D7;padding:.75rem;border-radius:.5rem;border:1px solid #FC8181}.back{display:inline-block;margin-top:1.5rem;padding:.625rem 1.25rem;background:#E53E3E;color:#fff;text-decoration:none;border-radius:.75rem;font-size:.875rem;font-weight:600}</style></head>
<body><div class="card"><div class="icon">⚠</div><h1>Erreur de soumission</h1><p>${escapeHtml(message)}</p>${remedy ? `<div class="remedy"><strong>Solution :</strong> ${escapeHtml(remedy)}</div>` : ''}<div class="code">Code: ${escapeHtml(code)}</div><br /><a href="#" data-back class="back">Retour / Back</a></div><script src="/form-back.js" defer></script></body></html>`,
    { status, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
  );
}

export async function OPTIONS(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: formId } = await params;
  const origin = request.headers.get('origin');
  if (!origin) {
    return new NextResponse(JSON.stringify({ success: false, error: 'Missing Origin header', code: 'MISSING_ORIGIN' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }
  const { data: form } = await supabase.from('forms').select('allowed_origins, is_active').eq('id', formId).maybeSingle();
  const json = (status: number, body: unknown) =>
    new NextResponse(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': origin } });
  if (!form) return json(404, { success: false, error: 'Form not found', code: 'FORM_NOT_FOUND' });
  if (!form.is_active) return json(403, { success: false, error: 'Form is deactivated', code: 'FORM_INACTIVE' });
  if (!form.allowed_origins.includes(origin) && !form.allowed_origins.includes('*')) {
    return json(403, { success: false, error: `Origin '${origin}' is not authorized`, code: 'CORS_NOT_ALLOWED' });
  }
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Inlet-Visitor-IP, x-client-fingerprint',
      'Access-Control-Max-Age': '86400',
    },
  });
}

type FormJoin = {
  name: string;
  is_active: boolean;
  allowed_origins: string[];
  notify_email: boolean;
  auto_reply_enabled: boolean;
  auto_reply_subject: string | null;
  auto_reply_message: string | null;
  success_url: string | null;
  webhook_url: string | null;
  client_id: string;
  portal_user_id: string | null;
  clients: { name: string; email: string; logo_url?: string | null; primary_color?: string | null; font_family?: string | null; plan?: string | null; sender_name?: string | null; reply_to_email?: string | null } | null;
  portal_users: { id: string; name: string; email: string; lang: string | null; notify_leads: boolean | null } | null;
};

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: formId } = await params;
  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');
  const contentType = request.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');

  const declaredLen = parseInt(request.headers.get('content-length') || '0', 10);
  if (declaredLen > MAX_BODY_BYTES) {
    return createErrorResponse(413, 'PAYLOAD_TOO_LARGE', 'Submission body is too large.', 'Reduce the size of your submission or file attachments.', origin, isJson);
  }

  // ── Form + server-to-server auth ────────────────────────────────────────
  const FORM_COLUMNS = 'name, is_active, allowed_origins, notify_email, auto_reply_enabled, auto_reply_subject, auto_reply_message, success_url, webhook_url, client_id, portal_user_id, clients(name, email, logo_url, primary_color, font_family, plan, sender_name, reply_to_email)';
  let { data: form, error: formError } = await supabase
    .from('forms')
    .select(`${FORM_COLUMNS}, portal_users(id, name, email, lang, notify_leads)`)
    .eq('id', formId)
    .maybeSingle<FormJoin>();

  // Deployed before migration v22 (no lang / notify_leads on portal_users)?
  // A visitor's lead must never die on an operator's migration order: retry
  // without the new columns and fall back to the defaults.
  if (formError && /column|schema cache/i.test(formError.message || '')) {
    console.error('[SUBMIT] migration v22 missing — degraded form lookup:', formError.message);
    const retry = await supabase
      .from('forms')
      .select(`${FORM_COLUMNS}, portal_users(id, name, email)`)
      .eq('id', formId)
      .maybeSingle<FormJoin>();
    form = retry.data;
    formError = retry.error;
  }

  if (formError) {
    console.error('[SUBMIT] Database query error:', formError);
    return createErrorResponse(500, 'DATABASE_QUERY_ERROR', 'A database error occurred while fetching the form.', 'Check that every migration in migrations/README.md has been applied.', origin, isJson);
  }
  if (!form) {
    return createErrorResponse(404, 'FORM_NOT_FOUND', `The form id '${formId}' does not exist.`, 'Copy the form id again from your Inlet dashboard (Forms → your form).', origin, isJson);
  }
  if (!form.is_active) {
    return createErrorResponse(403, 'FORM_INACTIVE', 'This form is paused.', 'Open the form in your Inlet dashboard and switch it back on.', origin, isJson);
  }

  const bearer = (request.headers.get('authorization') || '').replace(/^Bearer\s+/i, '').trim();
  let trusted = false;
  if (bearer) {
    const auth = bearer.startsWith('kef_') ? await verifyApiKey(bearer) : null;
    if (!auth || auth.clientId !== form.client_id) {
      return createErrorResponse(401, 'INVALID_API_KEY', 'The API key is invalid, revoked, or does not own this form.', 'Create a key in Inlet → Developer and store it as INLET_API_KEY on your server.', origin, isJson);
    }
    trusted = true;
  }

  // The visitor: for a relay, the forwarded address; otherwise the request IP.
  const forwardedFor = request.headers.get('x-forwarded-for');
  const requestIp = forwardedFor ? forwardedFor.split(',')[0].trim() : '127.0.0.1';
  const forwardedVisitor = (request.headers.get('x-inlet-visitor-ip') || '').trim();
  const ipAddress = trusted && IP_RE.test(forwardedVisitor) ? forwardedVisitor : requestIp;
  const fingerprint = request.headers.get('x-client-fingerprint') || 'no_fingerprint';

  // ── Blacklist (on the visitor, never on the relay) ──────────────────────
  if (await isBlacklisted(ipAddress) || (fingerprint !== 'no_fingerprint' && await isBlacklisted(fingerprint))) {
    await logFailure(formId, 'BLACKLIST_TRIGGER', `Blocked IP/Fingerprint: ${ipAddress}`);
    return createErrorResponse(403, 'SENDER_BLACKLISTED', 'Your address has been blocked for 24 hours because of suspicious activity.', 'Try again later, without a VPN or automated tool.', origin, isJson);
  }
  const resolvedHost = await resolveHostDomain(ipAddress);
  if (resolvedHost && await isBlacklisted(resolvedHost)) {
    return createErrorResponse(403, 'HOST_BLACKLISTED', 'This submission was blocked by security filters (hosting/VPN block).', 'Please disable your VPN or proxy to submit this form.', origin, isJson);
  }

  // ── CORS (waived for authenticated server submits) ──────────────────────
  if (origin && !trusted) {
    if (!form.allowed_origins.includes(origin) && !form.allowed_origins.includes('*')) {
      return createErrorResponse(
        403, 'CORS_NOT_ALLOWED',
        `Origin '${origin}' is not authorized to submit to this form.`,
        `In your Inlet dashboard, open this form's settings and add "${origin}" to its allowed sites.`,
        origin, isJson
      );
    }
  }

  // ── Rate limits: burst (per instance) + authoritative (DB, cross-instance) ─
  // The per-instance counter only answers 429. A ban is decided by the
  // authoritative, database-backed limit below — never by a counter that
  // differs from one server instance to the next.
  if (!checkBurst(`${ipAddress}:${fingerprint}`)) {
    return createErrorResponse(429, 'RATE_LIMIT_EXCEEDED', 'Too many submissions. Please wait a minute.', 'Stop submitting forms rapidly. Try again in a few minutes.', origin, isJson);
  }
  if (!(await dbCheckRateLimit(`submit:${ipAddress}`, 12, 60_000))) {
    await logFailure(formId, 'RATE_LIMIT_GLOBAL', `IP ${ipAddress} exceeded 12 submissions/min`);
    // A relay names the visitor's address itself (X-Inlet-Visitor-IP). The ban
    // list is shared by every form of every developer, so an address a relay
    // merely claims is never put on it: one account could otherwise have any
    // address refused everywhere.
    if (!trusted) await blacklistTarget(ipAddress, 'ip', 'Rate limit exceeded (global)', AUTO_BAN_TTL_MS);
    return createErrorResponse(429, 'RATE_LIMIT_EXCEEDED', 'Too many submissions. Please wait a minute.', 'Stop submitting forms rapidly. Try again in a few minutes.', origin, isJson);
  }

  // ── Body ────────────────────────────────────────────────────────────────
  let payload: Record<string, string> = {};
  let redirectUrl = referer || '/';
  if (form.success_url && form.success_url.trim()) redirectUrl = form.success_url;
  try {
    if (isJson) {
      const rawBody = await request.text();
      if (rawBody.length > MAX_BODY_BYTES) throw new Error('BODY_TOO_LARGE');
      payload = JSON.parse(rawBody);
    } else if (contentType.includes('application/x-www-form-urlencoded')) {
      const rawBody = await request.text();
      if (rawBody.length > MAX_BODY_BYTES) throw new Error('BODY_TOO_LARGE');
      new URLSearchParams(rawBody).forEach((value, key) => { payload[key] = value; });
    } else {
      const formData = await request.formData();
      formData.forEach((value, key) => { payload[key] = value.toString(); });
    }
    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) throw new Error('INVALID_SHAPE');
    if (Object.keys(payload).length > MAX_FIELDS) throw new Error('TOO_MANY_FIELDS');
    if (payload.redirect_url) redirectUrl = payload.redirect_url;
    redirectUrl = safeRedirect(redirectUrl, request.nextUrl.origin, form.allowed_origins || [], form.success_url, referer);
  } catch (err) {
    const tooLarge = err instanceof Error && err.message === 'BODY_TOO_LARGE';
    return createErrorResponse(
      tooLarge ? 413 : 400,
      tooLarge ? 'PAYLOAD_TOO_LARGE' : 'INVALID_REQUEST_BODY',
      tooLarge ? 'Submission body is too large.' : 'Could not parse the submission body.',
      tooLarge ? 'Reduce the size of your submission or file attachments.' : 'Send JSON with a Content-Type: application/json header, or a standard form post.',
      origin, isJson
    );
  }

  const respondSuccess = () => {
    if (isJson || origin) {
      return NextResponse.json({ success: true, message: 'Submission logged successfully' }, { headers: origin ? { 'Access-Control-Allow-Origin': origin } : {} });
    }
    if (redirectUrl.startsWith('file://') || redirectUrl.startsWith('chrome-error://')) return successPage();
    const url = new URL(redirectUrl, request.url);
    url.searchParams.set('submitted', 'true');
    return NextResponse.redirect(url, 303);
  };

  // ── Honeypot: silent fake success, temporary ban ────────────────────────
  if (payload._gotcha !== undefined && payload._gotcha !== '') {
    await logFailure(formId, 'HONEYPOT_TRIGGER', 'Honeypot field was filled out', Object.keys(payload));
    // Same rule as above: no shared ban on an address a relay only claims.
    if (!trusted) await handleHoneypotTrigger(ipAddress, fingerprint);
    return respondSuccess();
  }

  // ── Clean the payload ───────────────────────────────────────────────────
  // A reference into object storage may only exist because this server wrote
  // it after storing a file (below). One typed by a visitor is removed first.
  const cleanPayload: Record<string, string> = stripStorageLinks({ ...payload });
  for (const k of ['_gotcha', 'redirect_url', 'pow_challenge', 'pow_timestamp', 'pow_nonce']) delete cleanPayload[k];
  const client = form.portal_users;
  const developer = form.clients;
  const lang = normalizeLang(payload._lang || payload.lang, normalizeLang(client?.lang, 'fr'));
  delete cleanPayload._lang;
  delete cleanPayload.lang;

  // ── Keyword filter: label, never drop (A1) ──────────────────────────────
  let suspectReason: string | null = null;
  for (const [key, value] of Object.entries(cleanPayload)) {
    if (typeof value !== 'string' || value.startsWith('data:') || value.length >= 5000) continue;
    const m = SPAM_RE.exec(value);
    if (m) { suspectReason = `keyword "${m[1].toLowerCase()}" in ${key}`; break; }
  }

  // ── Attachments: base64 data URIs → storage objects with random names ───
  for (const [key, value] of Object.entries(cleanPayload)) {
    if (typeof value !== 'string' || !value.startsWith('data:')) continue;
    const match = value.match(/^data:(.*?);base64,(.*)$/);
    if (!match) continue;
    // The declared type (match[1]) is the sender's word: the bytes decide.
    const bytes = Buffer.from(match[2], 'base64');
    const ext = sniffUpload(bytes);
    const filename = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}.${ext}`;
    try {
      const { data, error } = await supabase.storage.from(UPLOADS_BUCKET).upload(filename, bytes, { contentType: UPLOAD_CONTENT_TYPE[ext], upsert: false });
      if (!error && data) {
        // The bucket is private: the payload keeps the object's reference, readers go through /api/download.
        cleanPayload[key] = attachmentUrl(filename);
      } else {
        console.error('[SUBMIT] Storage upload error:', error);
        cleanPayload[key] = '[attachment could not be stored]';
      }
    } catch (uploadErr) {
      console.error('[SUBMIT] Upload exception:', uploadErr);
      cleanPayload[key] = '[attachment could not be stored]';
    }
  }

  // ── Proof-of-work for browser JSON submits (waived for server submits) ──
  if (isJson && !trusted) {
    const powChallenge = payload.pow_challenge;
    const powTimestamp = parseInt(payload.pow_timestamp || '0', 10);
    const powNonce = payload.pow_nonce;
    if (!powChallenge || !powTimestamp || !powNonce) {
      return createErrorResponse(400, 'POW_PARAMETERS_MISSING', 'Missing proof-of-work parameters.', 'Fetch GET /api/challenge, solve it, and send pow_challenge, pow_timestamp and pow_nonce — or submit from your server with an API key.', origin, isJson);
    }
    if (typeof powChallenge !== 'string' || !/^[0-9a-f]{64}$/.test(powChallenge) || challengeReplayCache.has(powChallenge)) {
      return createErrorResponse(400, typeof powChallenge === 'string' && challengeReplayCache.has(powChallenge) ? 'POW_REPLAY_DETECTED' : 'POW_SOLUTION_INVALID', 'This proof-of-work challenge was already used or is malformed.', 'Fetch a new challenge before each submission. Never cache one.', origin, isJson);
    }
    if (!(await verifyChallenge(powChallenge, powTimestamp, String(powNonce), requestIp))) {
      return createErrorResponse(400, 'POW_SOLUTION_INVALID', 'Proof-of-work verification failed (wrong solution or expired challenge).', 'Solve the challenge for the required difficulty and submit within 5 minutes.', origin, isJson);
    }
    // "Works once" has to hold on every server instance, not only this one:
    // the first use is recorded in the database for the challenge's lifetime.
    if (!(await dbCheckRateLimit(`pow:${powChallenge}`, 1, 5 * 60_000))) {
      return createErrorResponse(400, 'POW_REPLAY_DETECTED', 'This proof-of-work challenge was already used.', 'Fetch a new challenge before each submission. Never cache one.', origin, isJson);
    }
    challengeReplayCache.add(powChallenge);
    setTimeout(() => challengeReplayCache.delete(powChallenge), 5 * 60 * 1000);
  }

  // ── Store the lead — before anything else can fail ──────────────────────
  const { data: inserted, error: insertError } = await supabase
    .from('submissions')
    .insert([{
      form_id: formId,
      payload: cleanPayload,
      ip_address: ipAddress,
      fingerprint,
      ...(suspectReason ? { spam_status: 'suspect', spam_reason: suspectReason } : {}),
    }])
    .select('id')
    .single();

  if (insertError || !inserted) {
    console.error('Error inserting submission:', insertError);
    return createErrorResponse(500, 'DATABASE_INSERT_FAILED', 'The submission could not be stored.', 'Try again in a moment. If it persists, the service owner has been alerted through the logs.', origin, isJson);
  }
  if (suspectReason) await logFailure(formId, 'SPAM_KEYWORD', `Stored as suspect: ${suspectReason}`, Object.keys(cleanPayload));

  // From here on nothing delays the visitor's answer, yet everything must finish:
  // each task below is handed to background(), which keeps the invocation alive
  // until it settles. A bare promise is dropped when the function is suspended.

  // AI label (only when the operator enabled a paid provider — A4) and webhook.
  background(import('@/lib/spamClassifier').then(({ classifySubmission }) => classifySubmission(inserted.id as string, cleanPayload)).catch(() => {}));
  if (form.webhook_url) {
    background(
      import('@/lib/webhooks')
        .then(({ dispatchLeadWebhook }) => dispatchLeadWebhook({
          webhookUrl: form.webhook_url as string,
          clientId: form.client_id,
          formId,
          formName: form.name,
          submissionId: inserted.id as string,
          payload: cleanPayload,
        }))
        .catch(() => {})
    );
  }

  // ── Notifications ───────────────────────────────────────────────────────
  const quota = await getQuotaState(form.client_id, developer?.plan);
  let emailBudget = quota.emailBudgetLeft;
  const emailsPaused = quota.submissionsExhausted || emailBudget <= 0;
  if (emailsPaused) {
    background(logFailure(formId, 'QUOTA_EMAIL_PAUSED', `Emails paused for plan '${quota.plan.id}': ${quota.submissionsThisMonth} submissions this month (cap ${quota.plan.submissionsPerMonth}), ${quota.emailsToday} emails today (cap ${quota.plan.emailsPerDay}). Lead stored.`));
  }

  const plan = getPlan(developer?.plan);
  const branding = {
    logo_url: developer?.logo_url,
    primary_color: developer?.primary_color,
    font_family: developer?.font_family,
    whiteLabel: plan.whiteLabel,
  };
  const businessName = client?.name || developer?.name || 'Client';
  const senderEmailKey = Object.keys(cleanPayload).find((k) => k.toLowerCase() === 'email');
  const visitorEmail = senderEmailKey ? String(cleanPayload[senderEmailKey]).trim() : '';
  const validVisitorEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(visitorEmail) ? visitorEmail : null;

  const recipients = leadRecipients(formId, form.notify_email, developer, client);

  if (!emailsPaused) {
    for (const [i, r] of recipients.entries()) {
      if (emailBudget <= 0) break;
      emailBudget -= 1;
      background(
        sendLeadEmail({
          to: r.to,
          formName: form.name,
          payload: cleanPayload,
          ipAddress,
          clientName: businessName,
          branding,
          lang,
          suspect: suspectReason,
          openUrl: r.openUrl,
          developerCopy: r.developerCopy,
          replyTo: validVisitorEmail,
        })
          // the log row is part of the task: returned, so it is awaited too
          // The first recipient is the one the lead is owed to: its delivery is the lead's delivery state.
          .then(async (res) => {
            if (!res.success) return logFailure(formId, 'SMTP_FAILED', `Lead e-mail to the ${r.developerCopy ? 'developer' : 'client'} was not sent`);
            await logEmailSend(form.client_id, formId, 'lead');
            if (i === 0) await markNotified(inserted.id as string);
          })
          .catch((err) => logFailure(formId, 'SMTP_FAILED', `Lead e-mail to the ${r.developerCopy ? 'developer' : 'client'}: ${err?.message || err}`))
      );
    }
  }

  // ── Auto-reply to the visitor (withheld for suspect leads) ─────────────
  if (form.auto_reply_enabled && !emailsPaused && emailBudget > 0 && !suspectReason && validVisitorEmail) {
    const canCustomSender = plan.customSender;
    const customSenderName = canCustomSender ? developer?.sender_name?.trim() || undefined : undefined;
    const customReplyTo = canCustomSender ? developer?.reply_to_email?.trim() || undefined : undefined;
    const senderNameKey = Object.keys(cleanPayload).find((k) => k.toLowerCase() === 'nom' || k.toLowerCase() === 'name');
    const senderName = senderNameKey ? safePersonName(cleanPayload[senderNameKey]) : undefined;

    // An auto-reply goes to whatever address the visitor typed — possibly
    // somebody else's. Three per address per ten minutes, counted in the
    // database (the in-memory counter alone resets with every instance).
    const recipientKey = crypto.createHash('sha256').update(validVisitorEmail.toLowerCase()).digest('hex').slice(0, 32);
    if (checkAutoReplyRateLimit(validVisitorEmail) && (await dbCheckRateLimit(`autoreply:${recipientKey}`, 3, 10 * 60_000))) {
      emailBudget -= 1;
      background(
        sendAutoReplyEmail(
          validVisitorEmail,
          form.name,
          businessName,
          form.auto_reply_subject || undefined,
          form.auto_reply_message || undefined,
          lang,
          branding,
          senderName,
          customSenderName,
          customReplyTo || (client?.email && !isSyntheticEmail(client.email) ? client.email : undefined)
        )
          .then((ok) => (ok
            ? logEmailSend(form.client_id, formId, 'auto_reply')
            : logFailure(formId, 'SMTP_AUTOREPLY_FAILED', 'Auto-reply was not sent')))
          .catch((err) => logFailure(formId, 'SMTP_AUTOREPLY_FAILED', `Auto-reply: ${err?.message || err}`))
      );
    }
  }

  // Self-healing: a new lead is the moment to send what this developer's earlier
  // leads are still owed (quota pause lifted, mail server back, a crashed send).
  background(redeliverPending({ developerId: form.client_id, limit: 3 }));

  return respondSuccess();
}

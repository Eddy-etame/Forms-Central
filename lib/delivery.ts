import { supabase } from './supabase';
import { getPlan } from './plans';
import { getQuotaState, logEmailSend } from './quota';
import { sendLeadEmail } from './email';
import { EMAIL_RE, isSyntheticEmail, normalizeLang } from './domain';
import { SITE_URL } from './seo';

/**
 * Delivery state of a lead's notification (migration v23).
 *
 * `submissions.notified_at` is set when the client's notification was accepted
 * by the mail server. A lead that stays NULL is not a lost lead — it is stored
 * and visible — but nobody was told about it. Such leads are:
 *   • flagged in the developer's dashboard, with a "send now" button;
 *   • retried after each new lead of the same developer;
 *   • retried once a day by /api/cron/redeliver.
 * A retried notification is marked as delayed and carries the lead's real date.
 */

export const REDELIVERY_WINDOW_DAYS = 30; // older leads are left alone
const MAX_ATTEMPTS = 5;
const SETTLE_MS = 3 * 60_000; // a fresh lead's own notification may still be on its way

export type LeadRecipient = { to: string; developerCopy: boolean; openUrl: string };
type DeveloperParty = { name?: string | null; email?: string | null } | null | undefined;
type ClientParty = { name?: string | null; email?: string | null; notify_leads?: boolean | null } | null | undefined;

/** Who hears about a lead: the client (unless switched off), then the developer's copy when it is another mailbox. */
export function leadRecipients(formId: string, notifyDeveloper: boolean | null | undefined, developer: DeveloperParty, client: ClientParty): LeadRecipient[] {
  const out: LeadRecipient[] = [];
  if (client && client.notify_leads !== false && client.email && !isSyntheticEmail(client.email)) {
    out.push({ to: client.email, developerCopy: false, openUrl: `${SITE_URL}/portal` });
  }
  if (notifyDeveloper && developer?.email && developer.email.toLowerCase() !== (client?.email || '').toLowerCase()) {
    out.push({ to: developer.email, developerCopy: true, openUrl: `${SITE_URL}/developer/dashboard/forms/${formId}` });
  }
  return out;
}

/** The notification reached the mail server. A no-op before migration v23. */
export async function markNotified(submissionId: string): Promise<void> {
  try {
    await supabase.from('submissions').update({ notified_at: new Date().toISOString() }).eq('id', submissionId).is('notified_at', null);
  } catch {
    /* delivery state is best-effort; the e-mail itself went out */
  }
}

/** Dashboard flag: stored, somebody should have been told, nobody was. */
export function isNotificationPending(lead: { notified_at?: string | null; created_at: string }, formExpectsNotification: boolean, now = Date.now()): boolean {
  if (!formExpectsNotification || lead.notified_at) return false;
  const age = now - new Date(lead.created_at).getTime();
  return age >= SETTLE_MS && age <= REDELIVERY_WINDOW_DAYS * 86_400_000;
}

/** Ids of the developer's forms whose leads notify somebody (with today's settings). */
export async function formsExpectingNotification(developerId: string): Promise<Set<string>> {
  const { data } = await supabase
    .from('forms')
    .select('id, notify_email, clients(email), portal_users(email, notify_leads)')
    .eq('client_id', developerId);
  const out = new Set<string>();
  for (const f of (data ?? []) as unknown as { id: string; notify_email: boolean | null; clients: DeveloperParty; portal_users: ClientParty }[]) {
    if (leadRecipients(f.id, f.notify_email, f.clients, f.portal_users).length > 0) out.add(f.id);
  }
  return out;
}

/** Dashboards: ids of the leads (of these forms) that still owe a notification. Empty before migration v23. */
export async function pendingNotificationIds(developerId: string, formIds: string[]): Promise<Set<string>> {
  const out = new Set<string>();
  if (formIds.length === 0) return out;
  const { data, error } = await supabase
    .from('submissions')
    .select('id, form_id, created_at, notified_at')
    .in('form_id', formIds)
    .is('notified_at', null)
    .gt('created_at', new Date(Date.now() - REDELIVERY_WINDOW_DAYS * 86_400_000).toISOString())
    .limit(500);
  if (error || !data || data.length === 0) return out;
  const expecting = await formsExpectingNotification(developerId);
  const now = Date.now();
  for (const l of data as { id: string; form_id: string; created_at: string; notified_at: string | null }[]) {
    if (isNotificationPending(l, expecting.has(l.form_id), now)) out.add(l.id);
  }
  return out;
}

type PendingRow = {
  id: string;
  form_id: string;
  payload: Record<string, unknown> | null;
  ip_address: string | null;
  created_at: string;
  spam_status: string | null;
  spam_reason: string | null;
  notify_attempts: number | null;
  forms: {
    id: string;
    name: string;
    notify_email: boolean | null;
    client_id: string;
    clients: { name: string; email: string; logo_url?: string | null; primary_color?: string | null; font_family?: string | null; plan?: string | null } | null;
    portal_users: { id: string; name: string; email: string; lang: string | null; notify_leads: boolean | null } | null;
  } | null;
};

const PENDING_SELECT =
  'id, form_id, payload, ip_address, created_at, spam_status, spam_reason, notify_attempts, forms!inner(id, name, notify_email, client_id, clients(name, email, logo_url, primary_color, font_family, plan), portal_users(id, name, email, lang, notify_leads))';

export interface RedeliveryResult {
  pending: number; // leads that owed a notification
  sent: number;
  failed: number;
  paused: number;  // held back by the plan's e-mail quota
}

/**
 * Send the notifications that never left. Oldest first, bounded, safe to run
 * concurrently (each attempt is claimed with an optimistic lock) and capped at
 * MAX_ATTEMPTS per lead. Never throws.
 */
export async function redeliverPending(opts: { developerId?: string; submissionIds?: string[]; limit?: number; minAgeMs?: number } = {}): Promise<RedeliveryResult> {
  const result: RedeliveryResult = { pending: 0, sent: 0, failed: 0, paused: 0 };
  try {
    const limit = Math.min(Math.max(opts.limit ?? 5, 1), 25);
    const now = Date.now();
    let q = supabase
      .from('submissions')
      .select(PENDING_SELECT)
      .is('notified_at', null)
      .lt('notify_attempts', MAX_ATTEMPTS)
      .lt('created_at', new Date(now - (opts.minAgeMs ?? SETTLE_MS)).toISOString())
      .gt('created_at', new Date(now - REDELIVERY_WINDOW_DAYS * 86_400_000).toISOString())
      .order('created_at', { ascending: true })
      .limit(limit * 4);
    if (opts.developerId) q = q.eq('forms.client_id', opts.developerId);
    if (opts.submissionIds?.length) q = q.in('id', opts.submissionIds.slice(0, 50));

    const { data, error } = await q;
    if (error || !data) return result; // migration v23 not applied, or nothing to do

    const quotas = new Map<string, { budget: number; paused: boolean }>();

    for (const row of data as unknown as PendingRow[]) {
      if (result.sent + result.failed >= limit) break;
      const form = row.forms;
      if (!form) continue;
      const developer = form.clients;
      const client = form.portal_users;
      const recipients = leadRecipients(form.id, form.notify_email, developer, client);
      if (recipients.length === 0) continue; // notifications are switched off for this form: nothing is owed
      result.pending++;

      let quota = quotas.get(form.client_id);
      if (!quota) {
        const st = await getQuotaState(form.client_id, developer?.plan);
        quota = { budget: st.emailBudgetLeft, paused: st.submissionsExhausted };
        quotas.set(form.client_id, quota);
      }
      if (quota.paused || quota.budget < recipients.length) { result.paused++; continue; }

      // Claim this attempt: two sweeps running at once must not both send.
      const attempts = row.notify_attempts ?? 0;
      const { data: claimed } = await supabase
        .from('submissions')
        .update({ notify_attempts: attempts + 1 })
        .eq('id', row.id)
        .is('notified_at', null)
        .eq('notify_attempts', attempts)
        .select('id');
      if (!claimed || claimed.length === 0) { result.pending--; continue; }

      const plan = getPlan(developer?.plan);
      const payload = row.payload || {};
      const emailKey = Object.keys(payload).find((k) => k.toLowerCase() === 'email');
      const visitor = emailKey ? String(payload[emailKey]).trim() : '';
      let primaryDelivered = false;

      for (const [i, r] of recipients.entries()) {
        quota.budget -= 1;
        const res = await sendLeadEmail({
          to: r.to,
          formName: form.name,
          payload,
          ipAddress: row.ip_address || '',
          clientName: client?.name || developer?.name || 'Client',
          branding: { logo_url: developer?.logo_url, primary_color: developer?.primary_color, font_family: developer?.font_family, whiteLabel: plan.whiteLabel },
          lang: normalizeLang(client?.lang, 'fr'),
          suspect: row.spam_status === 'suspect' ? row.spam_reason || 'flagged' : null,
          openUrl: r.openUrl,
          developerCopy: r.developerCopy,
          replyTo: EMAIL_RE.test(visitor) ? visitor : null,
          delayedSince: row.created_at,
        }).catch(() => ({ success: false }));
        if (res.success) {
          await logEmailSend(form.client_id, form.id, 'lead');
          if (i === 0) primaryDelivered = true;
        }
      }

      if (primaryDelivered) {
        await markNotified(row.id);
        result.sent++;
      } else {
        result.failed++;
        await supabase.from('failures_log').insert([{
          form_id: form.id,
          error_type: 'SMTP_FAILED',
          error_message: `Delayed notification for the lead of ${row.created_at.slice(0, 16).replace('T', ' ')} UTC was not sent (attempt ${attempts + 1}/${MAX_ATTEMPTS})`,
          payload: {},
        }]);
      }
    }
  } catch (err) {
    console.error('[redeliver]', (err as Error)?.message || err);
  }
  return result;
}

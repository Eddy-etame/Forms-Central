import { supabase } from './supabase';
import { getPlan } from './plans';
import { SITE_URL } from './seo';
import { attachmentPath, removeAttachments } from './storage';
import { sendRetentionNoticeEmail, sendRetentionReminderEmail } from './email';
import { planForDeveloper, NOTICE_DAYS, DAY_MS } from './retentionCore';
import type { LeadStub, NoticeRow, RetentionDeps, RetentionDeveloper, DeveloperPlan } from './retentionCore';

/**
 * Retention, wired to the real database and mail server. The rules live in
 * lib/retentionCore.ts (and are tested there); this file only fetches, sends
 * and deletes what those rules decide.
 */

const PAGE = 1000;       // the database returns at most this many rows per request
const MAX_LEADS = 50_000; // per developer and run; beyond it the run reports instead of guessing
const CHUNK = 100;       // ids per delete request (keeps the request line short)

/** `RETENTION_ENABLED=true` turns the job on; `RETENTION_APPLY=true` lets it notify and delete. */
export function retentionMode(env: NodeJS.ProcessEnv = process.env): 'off' | 'report' | 'apply' {
  if (env.RETENTION_ENABLED !== 'true') return 'off';
  return env.RETENTION_APPLY === 'true' ? 'apply' : 'report';
}

/**
 * The stored files a lead carries: top-level fields only, because that is the
 * only place the server writes a reference. Text a visitor typed deeper in the
 * payload is never treated as a file to delete.
 */
function attachmentPaths(payload: unknown): string[] {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return [];
  return Object.values(payload as Record<string, unknown>).map(attachmentPath).filter((p): p is string => p !== null);
}

async function listLeads(formIds: string[]): Promise<LeadStub[]> {
  const out: LeadStub[] = [];
  if (formIds.length === 0) return out;
  for (let from = 0; from < MAX_LEADS; from += PAGE) {
    const { data, error } = await supabase
      .from('submissions')
      .select('id, form_id, created_at')
      .in('form_id', formIds)
      .order('created_at', { ascending: true })
      .order('id', { ascending: true })
      .range(from, from + PAGE - 1);
    if (error) throw new Error(`leads: ${error.message}`);
    out.push(...((data ?? []) as LeadStub[]));
    if (!data || data.length < PAGE) return out;
  }
  throw new Error(`more than ${MAX_LEADS} leads: retention does not run on a partial view`);
}

async function listNotices(developerId: string): Promise<NoticeRow[]> {
  const { data, error } = await supabase
    .from('retention_notices')
    .select('*')
    .eq('developer_id', developerId)
    .order('covers_before', { ascending: false })
    .limit(50);
  if (error) throw new Error(`notices: ${error.message}`);
  return (data ?? []) as NoticeRow[];
}

/** The language a scheduled e-mail is written in: the developer's last sign-in, else their clients', else French. */
async function developerLanguages(ids: string[]): Promise<Map<string, 'fr' | 'en'>> {
  const out = new Map<string, 'fr' | 'en'>();
  if (ids.length === 0) return out;
  const { data } = await supabase.from('portal_users').select('parent_client_id, lang').in('parent_client_id', ids);
  const tally = new Map<string, { fr: number; en: number }>();
  for (const row of (data ?? []) as { parent_client_id: string; lang: string | null }[]) {
    const t = tally.get(row.parent_client_id) ?? { fr: 0, en: 0 };
    if (row.lang === 'en') t.en++; else if (row.lang === 'fr') t.fr++;
    tally.set(row.parent_client_id, t);
  }
  for (const [id, t] of tally) out.set(id, t.en > t.fr ? 'en' : 'fr');
  return out;
}

export function retentionDeps(): RetentionDeps {
  return {
    windowDays: (plan) => getPlan(plan).retentionDays,

    async listDevelopers() {
      const { data, error } = await supabase.from('clients').select('id, name, email, plan, plan_updated_at, lang').order('created_at', { ascending: true });
      if (error) throw new Error(`developers: ${error.message}`);
      const rows = (data ?? []) as { id: string; name: string; email: string; plan: string | null; plan_updated_at: string | null; lang: string | null }[];
      const [inferred, open] = await Promise.all([
        developerLanguages(rows.filter((r) => r.lang !== 'fr' && r.lang !== 'en').map((r) => r.id)),
        supabase.from('plan_requests').select('client_id').eq('status', 'open'),
      ]);
      const asking = new Set(((open.data ?? []) as { client_id: string }[]).map((r) => r.client_id));
      return rows.map((r) => ({
        id: r.id,
        name: r.name,
        email: r.email,
        plan: r.plan,
        planChangedAt: r.plan_updated_at,
        lang: r.lang === 'en' || r.lang === 'fr' ? r.lang : inferred.get(r.id) ?? 'fr',
        hold: asking.has(r.id) ? 'an upgrade request is open' : null,
      }));
    },

    async listForms(developerId) {
      const { data, error } = await supabase.from('forms').select('id, name').eq('client_id', developerId);
      if (error) throw new Error(`forms: ${error.message}`);
      return (data ?? []) as { id: string; name: string }[];
    },

    listLeads,
    listNotices,

    async deleteLeads(ids) {
      const res = { deleted: 0, files: 0, errors: [] as string[] };
      for (let i = 0; i < ids.length; i += CHUNK) {
        const chunk = ids.slice(i, i + CHUNK);
        const { data: rows, error: readErr } = await supabase.from('submissions').select('id, payload').in('id', chunk);
        if (readErr) { res.errors.push(`read: ${readErr.message}`); break; }
        const { data: gone, error: delErr } = await supabase.from('submissions').delete().in('id', chunk).select('id');
        if (delErr) { res.errors.push(`delete: ${delErr.message}`); break; }
        const goneIds = new Set(((gone ?? []) as { id: string }[]).map((g) => g.id));
        res.deleted += goneIds.size;
        // Only the files of rows that are really gone.
        const files = ((rows ?? []) as { id: string; payload: unknown }[]).filter((r) => goneIds.has(r.id)).flatMap((r) => attachmentPaths(r.payload));
        for (let f = 0; f < files.length; f += 100) {
          const done = await removeAttachments(files.slice(f, f + 100));
          if (done.error) res.errors.push(`storage: ${done.error}`);
          else res.files += done.removed;
        }
      }
      return res;
    },

    async addDeleted(noticeId, count) {
      const { data } = await supabase.from('retention_notices').select('deleted_count').eq('id', noticeId).maybeSingle();
      await supabase.from('retention_notices').update({ deleted_count: ((data?.deleted_count as number) ?? 0) + count }).eq('id', noticeId);
    },

    async sendNotice(dev, draft, forms) {
      const names = new Map(forms.map((f) => [f.id, f.name]));
      return sendRetentionNoticeEmail({
        to: dev.email,
        developerName: dev.name,
        planName: getPlan(dev.plan).name,
        windowDays: draft.windowDays,
        leadCount: draft.leadCount,
        calendar: draft.calendar,
        byForm: draft.byForm.map((f) => ({ name: names.get(f.formId) ?? '—', count: f.count })),
        dashboardUrl: `${SITE_URL}/developer/dashboard`,
        plansUrl: `${SITE_URL}/pricing`,
        lang: dev.lang,
      });
    },

    async saveNotice(dev, draft, sentAt) {
      // The notice period is counted from the moment the e-mail was handed over.
      const earliest = Math.ceil((sentAt.getTime() + NOTICE_DAYS * DAY_MS) / DAY_MS) * DAY_MS;
      const deleteAfter = Math.max(new Date(draft.deleteAfter).getTime(), earliest);
      const { error } = await supabase.from('retention_notices').insert({
        developer_id: dev.id,
        window_days: draft.windowDays,
        covers_before: draft.coversBefore,
        delete_after: new Date(deleteAfter).toISOString(),
        lead_count: draft.leadCount,
        overdue_count: draft.overdueCount,
        first_deletion_at: draft.firstDeletionAt,
        last_deletion_at: draft.lastDeletionAt,
        sent_at: sentAt.toISOString(),
      });
      if (error) console.error('[RETENTION] notice not recorded:', error.message);
      return !error;
    },

    async sendReminder(dev: RetentionDeveloper, notice, count) {
      return sendRetentionReminderEmail({
        to: dev.email,
        developerName: dev.name,
        planName: getPlan(dev.plan).name,
        windowDays: notice.window_days,
        count,
        deleteAfter: notice.delete_after,
        noticeSentAt: notice.sent_at,
        dashboardUrl: `${SITE_URL}/developer/dashboard`,
        plansUrl: `${SITE_URL}/pricing`,
        lang: dev.lang,
      });
    },

    async markReminded(noticeId, at) {
      await supabase.from('retention_notices').update({ reminded_at: at.toISOString() }).eq('id', noticeId);
    },
  };
}

/**
 * What one developer should see in the dashboard: the deletions already
 * announced and still ahead. Null when the job is not deleting anything
 * (off or report mode), on an unlimited plan, or when nothing is announced.
 */
export interface UpcomingDeletions {
  windowDays: number;
  planName: string;
  /** leads on the announced calendar, including those that go today */
  total: number;
  /** ISO instant of the next deletion (now, when some go today) */
  firstAt: string;
  firstCount: number;
  today: boolean;
}

export async function upcomingDeletions(developerId: string): Promise<UpcomingDeletions | null> {
  if (retentionMode() !== 'apply') return null;
  try {
    const { data: dev } = await supabase.from('clients').select('plan, plan_updated_at').eq('id', developerId).maybeSingle();
    if (!dev) return null;
    const plan = getPlan(dev.plan as string | null);
    if (plan.retentionDays === null) return null;
    const notices = await listNotices(developerId);
    if (notices.length === 0) return null;
    const { data: forms } = await supabase.from('forms').select('id').eq('client_id', developerId);
    const leads = await listLeads(((forms ?? []) as { id: string }[]).map((f) => f.id));
    const p: DeveloperPlan = planForDeveloper({
      now: new Date(), windowDays: plan.retentionDays, leads, notices, planChangedAt: dev.plan_updated_at as string | null,
    });
    // What goes today is still "ahead" until the job has run.
    const total = p.upcoming.total + p.deletable.length;
    if (total === 0) return null;
    const today = p.deletable.length > 0;
    const firstAt = today ? new Date().toISOString() : p.upcoming.firstAt;
    if (!firstAt) return null;
    return {
      windowDays: plan.retentionDays,
      planName: plan.name,
      total,
      firstAt,
      firstCount: today ? p.deletable.length : p.upcoming.firstCount,
      today,
    };
  } catch (err) {
    console.error('[RETENTION] upcoming:', (err as Error)?.message || err);
    return null;
  }
}

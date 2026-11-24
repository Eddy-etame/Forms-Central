/**
 * Retention — the rules, with no database and no mail server in sight, so they
 * can be tested by simulating days passing (scripts/test-retention.ts).
 *
 * The one rule everything else serves:
 *
 *   A lead is deleted for age only when (1) it has outlived the window of the
 *   developer's CURRENT plan, and (2) a notice that covers it was handed to
 *   the mail server at least NOTICE_DAYS earlier, for that same window.
 *
 * A notice sent at T covers every lead the developer holds at T and tells them
 * the calendar: each lead goes on the day it turns `window` days old, never
 * before the notice has matured. In a steady flow that means one e-mail every
 * (window − notice) days and each lead deleted on its due date. After a plan
 * change, a long outage of the job or a first arming, it means: notice first,
 * a week of nothing, a last call two days before, then the deletion.
 *
 * All instants that matter are rounded UP to a UTC midnight. The job runs once
 * a day at a time the host does not guarantee to the minute; with whole days,
 * the date written in the e-mail is the date it happens.
 */

export const NOTICE_DAYS = 7;
/** A last call goes out this long before a backlog is deleted. */
export const REMINDER_HOURS = 48;
/** A notice whose calendar ended this long ago no longer authorises anything. */
export const STALE_DAYS = 14;
export const DAY_MS = 86_400_000;
const HOUR_MS = 3_600_000;

export interface LeadStub {
  id: string;
  form_id: string;
  created_at: string;
}

export interface NoticeRow {
  id: string;
  developer_id: string;
  window_days: number;
  covers_before: string;
  delete_after: string;
  lead_count: number;
  overdue_count: number;
  first_deletion_at: string | null;
  last_deletion_at: string | null;
  sent_at: string;
  reminded_at: string | null;
  deleted_count: number;
}

export interface CalendarDay {
  /** UTC date, YYYY-MM-DD */
  date: string;
  count: number;
}

export interface NoticeDraft {
  windowDays: number;
  /** every lead received before this instant is covered */
  coversBefore: string;
  /** nothing newly announced goes before this instant */
  deleteAfter: string;
  leadCount: number;
  /** leads already past the window that no valid notice covered: they all go on deleteAfter */
  overdueCount: number;
  firstDeletionAt: string;
  lastDeletionAt: string;
  calendar: CalendarDay[];
  byForm: { formId: string; count: number }[];
}

export interface DeveloperPlan {
  windowDays: number;
  /** the matured, still valid notice that authorises deletions today */
  authority: NoticeRow | null;
  /** leads that may be deleted now */
  deletable: LeadStub[];
  /** a notice to send today, or null */
  notice: NoticeDraft | null;
  /** a pending notice whose last call is due today, or null */
  reminder: NoticeRow | null;
  /** how many leads that last call is about */
  reminderCount: number;
  /** what the developer should see: the announced deletions still ahead */
  upcoming: { total: number; firstAt: string | null; firstCount: number; calendar: CalendarDay[] };
}

const ms = (iso: string) => new Date(iso).getTime();

/** Round an instant up to the next UTC midnight (an exact midnight stays put). */
export function ceilDay(t: number): number {
  return Math.ceil(t / DAY_MS) * DAY_MS;
}

const dayKey = (t: number) => new Date(t).toISOString().slice(0, 10);

/** The first instant a lead may be deleted for age, were it announced in time. */
export function dueAt(lead: LeadStub, windowDays: number): number {
  return ceilDay(ms(lead.created_at) + windowDays * DAY_MS);
}

/** When a notice sent now lets its newly announced leads go. */
export function deleteAfterFor(now: number): number {
  return ceilDay(now + NOTICE_DAYS * DAY_MS);
}

/** A notice stops authorising anything once its own calendar is long over. */
export function isStale(n: NoticeRow, now: number): boolean {
  const end = n.last_deletion_at ? ms(n.last_deletion_at) : ms(n.delete_after) + n.window_days * DAY_MS;
  return now > end + STALE_DAYS * DAY_MS;
}

function calendarOf(days: number[]): CalendarDay[] {
  const counts = new Map<string, number>();
  for (const d of days) counts.set(dayKey(d), (counts.get(dayKey(d)) ?? 0) + 1);
  return [...counts.entries()].sort(([a], [b]) => (a < b ? -1 : 1)).map(([date, count]) => ({ date, count }));
}

export function planForDeveloper(i: {
  now: Date;
  windowDays: number;
  leads: LeadStub[];
  notices: NoticeRow[];
  /** when the developer's plan last changed: notices sent before it are void */
  planChangedAt?: string | null;
}): DeveloperPlan {
  const now = i.now.getTime();
  const W = i.windowDays;
  // A lead that arrived while this run was loading belongs to the next run.
  const leads = i.leads.filter((l) => ms(l.created_at) < now);
  const planChanged = i.planChangedAt ? ms(i.planChangedAt) : null;

  // Only notices for the current window count, sent since the plan last
  // changed, and only while their calendar is alive.
  const valid = i.notices.filter(
    (n) => n.window_days === W && !isStale(n, now) && (planChanged === null || ms(n.sent_at) > planChanged)
  );
  const mature = valid.filter((n) => ms(n.delete_after) <= now);
  const pending = valid.filter((n) => ms(n.delete_after) > now);
  const authority = mature.reduce<NoticeRow | null>((best, n) => (!best || ms(n.covers_before) > ms(best.covers_before) ? n : best), null);

  /** Earliest instant an existing valid notice lets this lead go; null = never announced. */
  const allowed = new Map<string, number | null>();
  for (const lead of leads) {
    const created = ms(lead.created_at);
    let best: number | null = null;
    for (const n of valid) {
      if (created < ms(n.covers_before)) {
        const a = ms(n.delete_after);
        if (best === null || a < best) best = a;
      }
    }
    allowed.set(lead.id, best);
  }
  const allowedAt = (lead: LeadStub): number | null => allowed.get(lead.id) ?? null;

  // 1. What may go today.
  const deletable = leads.filter((l) => {
    const a = allowedAt(l);
    return a !== null && a <= now && dueAt(l, W) <= now;
  });
  const gone = new Set(deletable.map((l) => l.id));
  const remaining = leads.filter((l) => !gone.has(l.id));

  // 2. Is a new notice due? Only when something nobody was told about would
  //    otherwise be held back past its due date — and never while a notice is
  //    still maturing (one conversation at a time).
  const wouldDeleteAfter = deleteAfterFor(now);
  const unannounced = remaining.filter((l) => allowedAt(l) === null);
  const trigger = unannounced.some((l) => dueAt(l, W) <= wouldDeleteAfter);

  let notice: NoticeDraft | null = null;
  if (trigger && pending.length === 0) {
    const when = remaining.map((l) => Math.max(dueAt(l, W), allowedAt(l) ?? wouldDeleteAfter));
    const forms = new Map<string, number>();
    for (const l of remaining) forms.set(l.form_id, (forms.get(l.form_id) ?? 0) + 1);
    notice = {
      windowDays: W,
      coversBefore: new Date(now).toISOString(),
      deleteAfter: new Date(wouldDeleteAfter).toISOString(),
      leadCount: remaining.length,
      overdueCount: unannounced.filter((l) => dueAt(l, W) <= now).length,
      firstDeletionAt: new Date(when.reduce((a, b) => (b < a ? b : a))).toISOString(),
      lastDeletionAt: new Date(when.reduce((a, b) => (b > a ? b : a))).toISOString(),
      calendar: calendarOf(when),
      byForm: [...forms.entries()].sort((a, b) => b[1] - a[1]).map(([formId, count]) => ({ formId, count })),
    };
  }

  // 3. Last call for a backlog about to go: the leads still here that all leave on the notice's date.
  const reminder =
    pending.find((n) => n.overdue_count > 0 && !n.reminded_at && ms(n.delete_after) - now <= REMINDER_HOURS * HOUR_MS) ?? null;
  const reminderCount = reminder
    ? remaining.filter((l) => ms(l.created_at) < ms(reminder.covers_before) && dueAt(l, W) <= ms(reminder.delete_after)).length
    : 0;

  // 4. What is announced and still ahead (the dashboard shows exactly this).
  const ahead = remaining
    .map((l) => {
      const a = allowedAt(l);
      return a === null ? null : Math.max(dueAt(l, W), a);
    })
    .filter((t): t is number => t !== null);
  const calendar = calendarOf(ahead);

  return {
    windowDays: W,
    authority,
    deletable,
    notice,
    reminder: reminder && reminderCount > 0 ? reminder : null,
    reminderCount,
    upcoming: {
      total: ahead.length,
      firstAt: calendar.length ? new Date(`${calendar[0].date}T00:00:00Z`).toISOString() : null,
      firstCount: calendar.length ? calendar[0].count : 0,
      calendar,
    },
  };
}

/* ─────────────────────────── the run ─────────────────────────── */

export interface RetentionDeveloper {
  id: string;
  name: string;
  email: string;
  plan: string | null;
  planChangedAt: string | null;
  lang: 'fr' | 'en';
  /** set while something asks us to wait (an open upgrade request): notices still go, nothing is deleted */
  hold?: string | null;
}

export interface FormRef {
  id: string;
  name: string;
}

/** Everything the run touches. The real ones are in lib/retention.ts; tests pass fakes. */
export interface RetentionDeps {
  windowDays(plan: string | null): number | null;
  listDevelopers(): Promise<RetentionDeveloper[]>;
  listForms(developerId: string): Promise<FormRef[]>;
  listLeads(formIds: string[]): Promise<LeadStub[]>;
  listNotices(developerId: string): Promise<NoticeRow[]>;
  /** Deletes exactly these leads and the files they carried. */
  deleteLeads(ids: string[]): Promise<{ deleted: number; files: number; errors: string[] }>;
  addDeleted(noticeId: string, count: number): Promise<void>;
  sendNotice(dev: RetentionDeveloper, draft: NoticeDraft, forms: FormRef[]): Promise<boolean>;
  saveNotice(dev: RetentionDeveloper, draft: NoticeDraft, sentAt: Date): Promise<boolean>;
  sendReminder(dev: RetentionDeveloper, notice: NoticeRow, count: number): Promise<boolean>;
  markReminded(noticeId: string, at: Date): Promise<void>;
}

export interface DeveloperOutcome {
  id: string;
  name: string;
  plan: string;
  windowDays: number;
  leads: number;
  /** report: would be deleted today · apply: asked to delete today */
  deletable: number;
  deleted: number;
  files: number;
  /** why today's deletions were held back, if they were */
  held: string | null;
  notice: null | { leadCount: number; overdueCount: number; firstDeletionAt: string; deleteAfter: string; sent: boolean };
  reminder: null | { count: number; deleteAfter: string; sent: boolean };
  errors: string[];
}

export interface RetentionSummary {
  mode: 'report' | 'apply';
  ranAt: string;
  developersChecked: number;
  developers: DeveloperOutcome[];
  totals: { noticesSent: number; remindersSent: number; leadsDeleted: number; filesDeleted: number; wouldNotify: number; wouldDelete: number; errors: number };
  /** true when the run stopped early (time budget or the per-run cap) */
  partial: boolean;
}

/** Hard ceiling on what one run may delete, whatever the notices say. */
export const MAX_DELETE_PER_RUN = 5000;

export async function runRetention(
  deps: RetentionDeps,
  opts: { now: Date; apply: boolean; budgetMs?: number; clock?: () => number }
): Promise<RetentionSummary> {
  const clock = opts.clock ?? Date.now;
  const started = clock();
  const budget = opts.budgetMs ?? 45_000;
  const summary: RetentionSummary = {
    mode: opts.apply ? 'apply' : 'report',
    ranAt: opts.now.toISOString(),
    developersChecked: 0,
    developers: [],
    totals: { noticesSent: 0, remindersSent: 0, leadsDeleted: 0, filesDeleted: 0, wouldNotify: 0, wouldDelete: 0, errors: 0 },
    partial: false,
  };

  for (const dev of await deps.listDevelopers()) {
    const windowDays = deps.windowDays(dev.plan);
    if (windowDays === null) continue; // unlimited retention: never looked at
    if (clock() - started > budget || summary.totals.leadsDeleted >= MAX_DELETE_PER_RUN) {
      summary.partial = true;
      break;
    }

    const out: DeveloperOutcome = {
      id: dev.id, name: dev.name, plan: dev.plan || 'free', windowDays,
      leads: 0, deletable: 0, deleted: 0, files: 0, held: null, notice: null, reminder: null, errors: [],
    };
    try {
      const forms = await deps.listForms(dev.id);
      if (forms.length === 0) continue;
      summary.developersChecked++;

      const leads = await deps.listLeads(forms.map((f) => f.id));
      const notices = await deps.listNotices(dev.id);
      const plan = planForDeveloper({ now: opts.now, windowDays, leads, notices, planChangedAt: dev.planChangedAt });
      out.leads = leads.length;
      out.deletable = plan.deletable.length;

      // ── delete what a matured notice announced ──
      if (plan.deletable.length > 0) {
        if (dev.hold) {
          out.held = dev.hold;
        } else if (!opts.apply) {
          summary.totals.wouldDelete += plan.deletable.length;
        } else if (!plan.authority) {
          out.errors.push('deletable leads without an authorising notice — nothing deleted');
        } else {
          // A notice can never delete more than the developer held when it was sent.
          const allowance = plan.authority.lead_count - plan.authority.deleted_count;
          const room = MAX_DELETE_PER_RUN - summary.totals.leadsDeleted;
          if (plan.deletable.length > allowance) {
            out.errors.push(`would delete ${plan.deletable.length} leads but the notice announced ${allowance} — nothing deleted`);
          } else {
            const ids = plan.deletable.slice(0, room).map((l) => l.id);
            if (ids.length < plan.deletable.length) summary.partial = true;
            const res = await deps.deleteLeads(ids);
            out.deleted = res.deleted;
            out.files = res.files;
            out.errors.push(...res.errors);
            summary.totals.leadsDeleted += res.deleted;
            summary.totals.filesDeleted += res.files;
            if (res.deleted > 0) await deps.addDeleted(plan.authority.id, res.deleted);
          }
        }
      }

      // ── last call before a backlog goes ──
      if (plan.reminder) {
        let sent = false;
        if (opts.apply) {
          sent = await deps.sendReminder(dev, plan.reminder, plan.reminderCount);
          if (sent) {
            await deps.markReminded(plan.reminder.id, opts.now);
            summary.totals.remindersSent++;
          } else out.errors.push('last-call e-mail was not sent (the deletion keeps its date)');
        }
        out.reminder = { count: plan.reminderCount, deleteAfter: plan.reminder.delete_after, sent };
      }

      // ── announce what comes next ──
      if (plan.notice) {
        let sent = false;
        if (!opts.apply) {
          summary.totals.wouldNotify++;
        } else {
          sent = await deps.sendNotice(dev, plan.notice, forms);
          if (sent) {
            const saved = await deps.saveNotice(dev, plan.notice, opts.now);
            if (saved) summary.totals.noticesSent++;
            else {
              sent = false;
              out.errors.push('notice was sent but could not be recorded — it will be sent again, nothing is deleted meanwhile');
            }
          } else out.errors.push('notice e-mail was not sent — nothing will be deleted until one is');
        }
        out.notice = {
          leadCount: plan.notice.leadCount,
          overdueCount: plan.notice.overdueCount,
          firstDeletionAt: plan.notice.firstDeletionAt,
          deleteAfter: plan.notice.deleteAfter,
          sent,
        };
      }
    } catch (err) {
      out.errors.push((err as Error)?.message || String(err));
    }

    summary.totals.errors += out.errors.length;
    if (out.deletable || out.notice || out.reminder || out.errors.length) summary.developers.push(out);
  }

  return summary;
}

/** Fingerprint of a report, so an unchanged report is not e-mailed every morning. */
export function reportDigest(s: RetentionSummary): string {
  return s.developers
    .map((d) => `${d.id}:${d.deletable}:${d.notice ? `${d.notice.leadCount}/${d.notice.overdueCount}` : '-'}:${d.errors.length}`)
    .sort()
    .join('|');
}

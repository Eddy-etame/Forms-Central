/**
 * Unit test for the retention rules: a small world where days pass.
 * Run: node --experimental-strip-types scripts/test-retention.ts
 *
 * The fake database below checks the one rule on EVERY deletion it is asked
 * for, in every scenario: the lead has outlived the developer's current
 * window, and a notice covering it, for that window, sent since the last plan
 * change, was handed over at least seven days earlier.
 */
import {
  runRetention, planForDeveloper, ceilDay, dueAt, reportDigest,
  DAY_MS, NOTICE_DAYS, MAX_DELETE_PER_RUN,
} from '../lib/retentionCore.ts';
import type { LeadStub, NoticeRow, RetentionDeps, RetentionDeveloper, NoticeDraft, RetentionSummary } from '../lib/retentionCore.ts';

let pass = 0, fail = 0;
const failures: string[] = [];
const ok = (name: string, cond: boolean, detail = '') =>
  cond ? (pass++, console.log('  PASS  ' + name)) : (fail++, failures.push(name), console.log(`  FAIL  ${name}${detail ? '\n        ' + detail : ''}`));
const eq = (name: string, got: unknown, want: unknown) => ok(name, got === want, `got ${JSON.stringify(got)}, want ${JSON.stringify(want)}`);

const BASE = Date.parse('2026-12-01T05:41:00Z'); // the job's morning run
const WINDOWS: Record<string, number | null> = { free: 30, solo: 365, pro: null, max: null };
const iso = (t: number) => new Date(t).toISOString();

class World {
  now = BASE;
  devs: RetentionDeveloper[] = [];
  forms = new Map<string, { id: string; name: string }[]>();
  leads: LeadStub[] = [];
  notices: NoticeRow[] = [];
  mail: { kind: 'notice' | 'reminder'; dev: string; at: number; draft?: NoticeDraft; count?: number }[] = [];
  deletions: { id: string; dev: string; at: number; age: number }[] = [];
  violations: string[] = [];
  mailWorks = true;
  saveWorks = true;
  private current: RetentionDeveloper | null = null;
  private seq = 0;

  dev(id: string, plan: string): RetentionDeveloper {
    const d: RetentionDeveloper = { id, name: id.toUpperCase(), email: `${id}@test.invalid`, plan, planChangedAt: null, lang: 'en' };
    this.devs.push(d);
    this.forms.set(id, [{ id: `${id}-form`, name: `${id} contact` }]);
    return d;
  }
  /** a lead for a developer, `ageDays` old at the current instant (may be fractional) */
  lead(devId: string, ageDays: number): LeadStub {
    const l: LeadStub = { id: `lead-${++this.seq}`, form_id: `${devId}-form`, created_at: iso(this.now - ageDays * DAY_MS) };
    this.leads.push(l);
    return l;
  }
  setPlan(devId: string, plan: string) {
    const d = this.devs.find((x) => x.id === devId)!;
    d.plan = plan;
    d.planChangedAt = iso(this.now - 60_000); // changed a minute before the run
  }
  has(id: string) { return this.leads.some((l) => l.id === id); }
  days(n: number) { this.now += n * DAY_MS; }

  deps(): RetentionDeps {
    return {
      windowDays: (plan) => WINDOWS[plan || 'free'] ?? null,
      listDevelopers: async () => this.devs.map((d) => ({ ...d })),
      listForms: async (developerId) => {
        this.current = this.devs.find((d) => d.id === developerId)!;
        return this.forms.get(developerId) ?? [];
      },
      listLeads: async (formIds) => this.leads.filter((l) => formIds.includes(l.form_id)).map((l) => ({ ...l })),
      listNotices: async (developerId) => this.notices.filter((n) => n.developer_id === developerId).map((n) => ({ ...n })),
      deleteLeads: async (ids) => {
        const dev = this.current!;
        const W = WINDOWS[dev.plan || 'free'];
        for (const id of ids) {
          const lead = this.leads.find((l) => l.id === id);
          if (!lead) { this.violations.push(`${id}: asked to delete a lead that does not exist`); continue; }
          if (!lead.form_id.startsWith(dev.id)) this.violations.push(`${id}: belongs to another developer than ${dev.id}`);
          const created = Date.parse(lead.created_at);
          const age = this.now - created;
          if (W === null) this.violations.push(`${id}: deleted on an unlimited plan`);
          else if (age < W * DAY_MS) this.violations.push(`${id}: deleted at ${(age / DAY_MS).toFixed(2)} days, window ${W}`);
          const told = this.notices.some((n) =>
            n.developer_id === dev.id && n.window_days === W &&
            Date.parse(n.covers_before) > created &&
            Date.parse(n.sent_at) <= this.now - NOTICE_DAYS * DAY_MS &&
            (!dev.planChangedAt || Date.parse(n.sent_at) > Date.parse(dev.planChangedAt)));
          if (!told) this.violations.push(`${id}: deleted without a notice at least ${NOTICE_DAYS} days old that covers it`);
          this.deletions.push({ id, dev: dev.id, at: this.now, age: age / DAY_MS });
        }
        this.leads = this.leads.filter((l) => !ids.includes(l.id));
        return { deleted: ids.length, files: 0, errors: [] };
      },
      addDeleted: async (noticeId, count) => { const n = this.notices.find((x) => x.id === noticeId); if (n) n.deleted_count += count; },
      sendNotice: async (dev, draft) => { if (!this.mailWorks) return false; this.mail.push({ kind: 'notice', dev: dev.id, at: this.now, draft }); return true; },
      saveNotice: async (dev, draft, sentAt) => {
        if (!this.saveWorks) return false;
        this.notices.push({
          id: `notice-${++this.seq}`, developer_id: dev.id, window_days: draft.windowDays,
          covers_before: draft.coversBefore, delete_after: draft.deleteAfter,
          lead_count: draft.leadCount, overdue_count: draft.overdueCount,
          first_deletion_at: draft.firstDeletionAt, last_deletion_at: draft.lastDeletionAt,
          sent_at: sentAt.toISOString(), reminded_at: null, deleted_count: 0,
        });
        return true;
      },
      sendReminder: async (dev, _notice, count) => { if (!this.mailWorks) return false; this.mail.push({ kind: 'reminder', dev: dev.id, at: this.now, count }); return true; },
      markReminded: async (noticeId, at) => { const n = this.notices.find((x) => x.id === noticeId); if (n) n.reminded_at = at.toISOString(); },
    };
  }
  run(apply = true): Promise<RetentionSummary> {
    return runRetention(this.deps(), { now: new Date(this.now), apply });
  }
  mails(kind: 'notice' | 'reminder', dev?: string) { return this.mail.filter((m) => m.kind === kind && (!dev || m.dev === dev)); }
}

const day = (t: number) => new Date(t).toISOString().slice(0, 10);

/* ── helpers ─────────────────────────────────────────────────────────────── */
console.log('\n== Whole days ==');
eq('an exact midnight stays put', ceilDay(Date.parse('2026-12-02T00:00:00Z')), Date.parse('2026-12-02T00:00:00Z'));
eq('one millisecond later rounds up to the next midnight', ceilDay(Date.parse('2026-12-02T00:00:00.001Z')), Date.parse('2026-12-03T00:00:00Z'));
eq('a lead is due on the midnight after its 30 days', dueAt({ id: 'x', form_id: 'f', created_at: '2026-11-01T10:00:00Z' }, 30), Date.parse('2026-12-02T00:00:00Z'));

/* ── 1. first arming, with a backlog ─────────────────────────────────────── */
console.log('\n== First arming with leads already past the window ==');
{
  const w = new World();
  w.dev('acme', 'free');
  const a45 = w.lead('acme', 45), a31 = w.lead('acme', 31), a25 = w.lead('acme', 25), a10 = w.lead('acme', 10), a1 = w.lead('acme', 1);

  let s = await w.run();
  eq('day 0: nothing is deleted', w.deletions.length, 0);
  eq('day 0: one notice goes out', w.mails('notice').length, 1);
  const d = w.mails('notice')[0].draft!;
  eq('the notice counts every lead the developer holds', d.leadCount, 5);
  eq('two of them are already past 30 days', d.overdueCount, 2);
  eq('nothing goes before the midnight 7 full days ahead', d.deleteAfter, '2026-12-09T00:00:00.000Z');
  eq('the calendar starts on that date', d.calendar[0].date, '2026-12-09');
  eq('three leads go that day (45, 31 and the 25-day-old that turns 30 meanwhile)', d.calendar[0].count, 3);
  eq('the calendar accounts for all five', d.calendar.reduce((n, c) => n + c.count, 0), 5);
  eq('the run reports one notice sent', s.totals.noticesSent, 1);

  for (let i = 1; i <= 5; i++) { w.days(1); await w.run(); }
  eq('days 1–5: still nothing deleted', w.deletions.length, 0);
  eq('days 1–5: no second notice', w.mails('notice').length, 1);
  eq('days 1–5: no last call yet', w.mails('reminder').length, 0);

  w.days(1); s = await w.run(); // day 6: 42 h before
  eq('day 6: the last call goes out', w.mails('reminder').length, 1);
  eq('the last call is about the three leads that go together', w.mails('reminder')[0]?.count, 3);
  w.days(1); await w.run(); // day 7
  eq('day 7: the last call is not repeated', w.mails('reminder').length, 1);
  eq('day 7: nothing deleted yet (the notice matures at midnight)', w.deletions.length, 0);

  w.days(1); s = await w.run(); // day 8 = 2026-12-09
  eq('day 8: the three announced leads are deleted', s.totals.leadsDeleted, 3);
  ok('…exactly those three', !w.has(a45.id) && !w.has(a31.id) && !w.has(a25.id) && w.has(a10.id) && w.has(a1.id));
  eq('the notice records what it deleted', w.notices[0]?.deleted_count, 3);

  // the two younger leads go on their own due dates, under the same notice
  let goneA10 = '', goneA1 = '';
  for (let i = 0; i < 30; i++) {
    w.days(1); await w.run();
    if (!goneA10 && !w.has(a10.id)) goneA10 = day(w.now);
    if (!goneA1 && !w.has(a1.id)) goneA1 = day(w.now);
  }
  eq('the 10-day-old lead goes the day the calendar said', goneA10, day(dueAt(a10, 30)));
  eq('the 1-day-old lead goes the day the calendar said', goneA1, day(dueAt(a1, 30)));
  ok('both dates were in the notice', d.calendar.some((c) => c.date === goneA10) && d.calendar.some((c) => c.date === goneA1));
  eq('no further notice was needed for them', w.mails('notice').length, 1);
  eq('no rule was broken', w.violations.length, 0);
}

/* ── 2. report mode ──────────────────────────────────────────────────────── */
console.log('\n== Report mode touches nothing ==');
{
  const w = new World();
  w.dev('acme', 'free');
  w.lead('acme', 90); w.lead('acme', 40); w.lead('acme', 3);
  let last: RetentionSummary | null = null;
  for (let i = 0; i < 40; i++) { last = await w.run(false); w.days(1); }
  eq('40 days of reports: no e-mail to any developer', w.mail.length, 0);
  eq('…no notice recorded', w.notices.length, 0);
  eq('…no lead deleted', w.leads.length, 3);
  eq('each report says who would be notified', last!.totals.wouldNotify, 1);
  eq('…and is labelled a report', last!.mode, 'report');
  eq('nothing would be deleted that day (no notice exists)', last!.totals.wouldDelete, 0);
  ok('an unchanged report has the same fingerprint', reportDigest(last!) === reportDigest(await w.run(false)));
}

/* ── 3. the mail server is down ──────────────────────────────────────────── */
console.log('\n== No notice, no deletion ==');
{
  const w = new World();
  w.dev('acme', 'free');
  w.lead('acme', 200); w.lead('acme', 100);
  w.mailWorks = false;
  let s: RetentionSummary | null = null;
  for (let i = 0; i < 20; i++) { s = await w.run(); w.days(1); }
  eq('20 days with a dead mail server: nothing deleted', w.leads.length, 2);
  eq('…no notice on record', w.notices.length, 0);
  ok('…and the run says so', s!.developers[0].errors.some((e) => e.includes('not sent')));
  w.mailWorks = true;
  await w.run();
  eq('mail back: the notice goes out', w.mails('notice').length, 1);
  for (let i = 0; i < 7; i++) { w.days(1); await w.run(); }
  eq('seven days later: still there', w.leads.length, 2);
  w.days(1); await w.run();
  eq('on the announced date: deleted', w.leads.length, 0);
  eq('no rule was broken', w.violations.length, 0);
}

console.log('\n== A notice that could not be recorded authorises nothing ==');
{
  const w = new World();
  w.dev('acme', 'free');
  w.lead('acme', 60);
  w.saveWorks = false;
  for (let i = 0; i < 12; i++) { await w.run(); w.days(1); }
  eq('12 days: the lead is still there', w.leads.length, 1);
  ok('the e-mail was attempted each day (the developer is told, nothing is lost)', w.mails('notice').length === 12);
  w.saveWorks = true;
  await w.run();
  for (let i = 0; i < 8; i++) { w.days(1); await w.run(); }
  eq('recorded at last, then deleted on its date', w.leads.length, 0);
  eq('no rule was broken', w.violations.length, 0);
}

/* ── 4. plan changes ─────────────────────────────────────────────────────── */
console.log('\n== A plan change voids what was announced ==');
{
  const w = new World();
  w.dev('acme', 'free');
  const old = w.lead('acme', 50);
  await w.run();                       // notice for the 30-day window
  w.days(3); w.setPlan('acme', 'solo'); // upgrade before it matures
  for (let i = 0; i < 10; i++) { await w.run(); w.days(1); }
  ok('upgraded to a one-year window: the lead stays', w.has(old.id));
  eq('…and no new notice is needed (nothing is near one year)', w.mails('notice').length, 1);

  w.setPlan('acme', 'free');           // back to 30 days while the first notice is matured and still alive
  await w.run();
  ok('downgraded again: the old notice does not authorise an immediate deletion', w.has(old.id));
  eq('a fresh notice goes out instead', w.mails('notice').length, 2);
  for (let i = 0; i < 7; i++) { w.days(1); await w.run(); }
  ok('seven days later: still there', w.has(old.id));
  w.days(1); await w.run();
  ok('on the new date: deleted', !w.has(old.id));
  eq('no rule was broken', w.violations.length, 0);
}
{
  const w = new World();
  w.dev('acme', 'solo');
  const y = w.lead('acme', 400), m = w.lead('acme', 100);
  await w.run();
  eq('one-year plan: the 400-day-old lead is announced', w.mails('notice')[0].draft!.overdueCount, 1);
  w.days(2); w.setPlan('acme', 'free');
  await w.run();
  eq('downgrade to 30 days: a new notice for the new window', w.mails('notice').length, 2);
  eq('…it now counts both leads as overdue', w.mails('notice')[1].draft!.overdueCount, 2);
  for (let i = 0; i < 7; i++) { w.days(1); await w.run(); }
  ok('the one-year notice maturing does not delete under the 30-day window', w.has(y.id) && w.has(m.id));
  w.days(1); await w.run();
  ok('the 30-day notice matures: both go', !w.has(y.id) && !w.has(m.id));
  eq('no rule was broken', w.violations.length, 0);
}

{
  const w = new World();
  w.dev('acme', 'free');
  const ancient = w.lead('acme', 400);
  await w.run();                                   // 30-day notice
  w.days(2);
  w.devs[0].plan = 'solo';                         // changed straight in the database: no change date
  for (let i = 0; i < 8; i++) { w.days(1); await w.run(); }
  ok('a plan changed behind our back: the 30-day notice does not delete under the one-year window', w.has(ancient.id));
  eq('…a one-year notice is sent first', w.mails('notice').length, 2);
  for (let i = 0; i < 8; i++) { w.days(1); await w.run(); }
  ok('…and only that one lets the 400-day-old lead go', !w.has(ancient.id));
  eq('no rule was broken', w.violations.length, 0);
}

console.log('\n== An open upgrade request pauses deletion ==');
{
  const w = new World();
  w.dev('acme', 'free');
  const old = w.lead('acme', 70);
  await w.run();
  w.days(5); w.devs[0].hold = 'upgrade requested';
  let s: RetentionSummary | null = null;
  for (let i = 0; i < 10; i++) { w.days(1); s = await w.run(); }
  ok('the notice has matured, the request is open: the lead stays', w.has(old.id));
  eq('…and the run says why', s!.developers[0]?.held, 'upgrade requested');
  w.devs[0].hold = null;               // request declined
  await w.run();
  ok('request closed without a plan change: the announced deletion happens', !w.has(old.id));
  eq('no rule was broken', w.violations.length, 0);
}

/* ── 5. unlimited plans and isolation ────────────────────────────────────── */
console.log('\n== Unlimited plans are never looked at; developers never mix ==');
{
  const w = new World();
  w.dev('acme', 'free'); w.dev('bigco', 'pro'); w.dev('other', 'free');
  w.lead('acme', 80); w.lead('bigco', 900); w.lead('bigco', 400); w.lead('other', 2);
  for (let i = 0; i < 45; i++) { await w.run(); w.days(1); }
  eq('the unlimited account keeps everything', w.leads.filter((l) => l.form_id.startsWith('bigco')).length, 2);
  eq('…and never receives a notice', w.mails('notice', 'bigco').length, 0);
  eq('the free account with an old lead lost it, after notice', w.leads.filter((l) => l.form_id.startsWith('acme')).length, 0);
  eq('the other free account lost its lead only once it turned 30 days old', w.deletions.filter((d) => d.dev === 'other').length, 1);
  ok('…at 30 days or more', w.deletions.filter((d) => d.dev === 'other').every((d) => d.age >= 30));
  eq('no rule was broken', w.violations.length, 0);
}

/* ── 6. steady flow ──────────────────────────────────────────────────────── */
console.log('\n== A steady flow: each lead goes on its due date, one e-mail every 23 days ==');
{
  const w = new World();
  w.dev('acme', 'free');
  for (let i = 0; i < 150; i++) {
    w.lead('acme', 0.3);              // one lead a day, a few hours before the run
    if (i % 7 === 0) w.lead('acme', 0.6);
    await w.run();
    w.days(1);
  }
  const ages = w.deletions.map((d) => d.age);
  ok('leads were deleted', ages.length > 100, `${ages.length} deletions`);
  ok('never before 30 days', Math.min(...ages) >= 30, `youngest ${Math.min(...ages).toFixed(2)}`);
  ok('never later than the day after 30 days', Math.max(...ages) < 32, `oldest ${Math.max(...ages).toFixed(2)}`);
  const n = w.mails('notice').length;
  ok('about one notice every 23 days (5 to 7 in 150 days)', n >= 5 && n <= 7, `${n} notices`);
  eq('no last call in a steady flow (nothing is ever overdue)', w.mails('reminder').length, 0);
  const gaps = w.mails('notice').slice(1).map((m, i) => (m.at - w.mails('notice')[i].at) / DAY_MS);
  ok('never two notices less than three weeks apart', gaps.every((g) => g >= 21), gaps.join(', '));
  eq('no rule was broken', w.violations.length, 0, );
}

/* ── 7. the job stops for two months ─────────────────────────────────────── */
console.log('\n== After a long outage the old notices are void ==');
{
  const w = new World();
  w.dev('acme', 'free');
  for (let i = 0; i < 60; i++) { w.lead('acme', 0.3); await w.run(); w.days(1); }
  const before = w.leads.length;
  for (let i = 0; i < 60; i++) { w.lead('acme', 0.3); w.days(1); } // leads keep coming, the job does not run
  const piled = w.leads.length;
  ok('leads piled up during the outage', piled > before + 50);
  const notices = w.mails('notice').length;
  await w.run();
  eq('first run back: nothing is deleted', w.leads.length, piled);
  eq('…a fresh notice goes out', w.mails('notice').length, notices + 1);
  ok('…that says how many are overdue', w.mails('notice').at(-1)!.draft!.overdueCount > 50);
  const reminders = w.mails('reminder').length;
  for (let i = 0; i < 7; i++) { w.days(1); await w.run(); }
  eq('seven days later: still nothing deleted', w.leads.length, piled);
  eq('a last call was sent in between', w.mails('reminder').length, reminders + 1);
  w.days(1); await w.run();
  ok('on the announced date the backlog goes', w.leads.length < 40, `${w.leads.length} left`);
  eq('no rule was broken', w.violations.length, 0);
}

/* ── 8. guards ───────────────────────────────────────────────────────────── */
console.log('\n== Guards ==');
{
  const w = new World();
  w.dev('acme', 'free');
  w.lead('acme', 50); w.lead('acme', 49); w.lead('acme', 48);
  await w.run();
  w.notices[0].lead_count = 2;         // a notice that announced fewer leads than are about to go
  for (let i = 0; i < 8; i++) { w.days(1); await w.run(); }
  const s = await w.run();
  eq('more to delete than the notice announced: nothing is deleted', w.leads.length, 3);
  ok('…and the run reports why', s.developers[0].errors.some((e) => e.includes('announced')));
}
{
  const w = new World();
  w.dev('acme', 'free');
  w.lead('acme', 40);
  const future: LeadStub = { id: 'late', form_id: 'acme-form', created_at: iso(w.now + 5_000) };
  w.leads.push(future);
  await w.run();
  eq('a lead that arrives during the run is not counted in the notice', w.mails('notice')[0].draft!.leadCount, 1);
}
{
  const w = new World();
  for (let i = 0; i < 5; i++) { w.dev(`dev${i}`, 'free'); w.lead(`dev${i}`, 40); }
  let t = 0;
  const s = await runRetention(w.deps(), { now: new Date(w.now), apply: true, budgetMs: 100, clock: () => (t += 60) });
  ok('out of time: the run stops and says it is partial', s.partial && w.mails('notice').length < 5, `${w.mails('notice').length} notices`);
  ok('the per-run ceiling exists and is finite', Number.isFinite(MAX_DELETE_PER_RUN) && MAX_DELETE_PER_RUN > 0);
}
{
  const now = new Date(BASE);
  const lead: LeadStub = { id: 'a', form_id: 'f', created_at: iso(BASE - 40 * DAY_MS) };
  const stale: NoticeRow = {
    id: 'n', developer_id: 'd', window_days: 30, covers_before: iso(BASE - 100 * DAY_MS + 61 * DAY_MS), delete_after: iso(BASE - 92 * DAY_MS),
    lead_count: 5, overdue_count: 0, first_deletion_at: null, last_deletion_at: iso(BASE - 60 * DAY_MS), sent_at: iso(BASE - 100 * DAY_MS), reminded_at: null, deleted_count: 0,
  };
  const p = planForDeveloper({ now, windowDays: 30, leads: [lead], notices: [stale] });
  eq('a notice whose calendar ended long ago authorises nothing', p.deletable.length, 0);
  ok('…a new one is drafted instead', p.notice !== null);
  const fresh: NoticeRow = { ...stale, sent_at: iso(BASE - 9 * DAY_MS), covers_before: iso(BASE - 9 * DAY_MS), delete_after: iso(ceilDay(BASE - 2 * DAY_MS)), last_deletion_at: iso(BASE + 5 * DAY_MS) };
  const q = planForDeveloper({ now, windowDays: 30, leads: [lead], notices: [fresh] });
  eq('a matured notice of the right window authorises the deletion', q.deletable.length, 1);
  const ancient: LeadStub = { id: 'old', form_id: 'f', created_at: iso(BASE - 400 * DAY_MS) };
  eq('…but not for another window, even for a lead past both', planForDeveloper({ now, windowDays: 365, leads: [ancient], notices: [fresh] }).deletable.length, 0);
  eq('…nor when the plan changed after it was sent', planForDeveloper({ now, windowDays: 30, leads: [lead], notices: [fresh], planChangedAt: iso(BASE - DAY_MS) }).deletable.length, 0);
  const young: LeadStub = { id: 'b', form_id: 'f', created_at: iso(BASE - 12 * DAY_MS) };
  const r = planForDeveloper({ now, windowDays: 30, leads: [young], notices: [fresh] });
  eq('what the dashboard shows: one announced deletion ahead', r.upcoming.total, 1);
  eq('…on the lead’s due date', r.upcoming.calendar[0].date, day(dueAt(young, 30)));
}

console.log(`\n== RESULT: ${pass} passed, ${fail} failed ==`);
if (fail) { console.log('Failures:', failures); process.exit(1); }

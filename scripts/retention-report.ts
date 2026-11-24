/**
 * What the retention job would do today, read straight from the database.
 * Read-only: no e-mail is sent, nothing is deleted, nothing is written.
 * Run: node --experimental-strip-types scripts/retention-report.ts
 * (uses NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY from the environment or .env.local)
 */
import { readFileSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';
import { runRetention } from '../lib/retentionCore.ts';
import { getPlan } from '../lib/plans.ts';
import type { LeadStub, NoticeRow, RetentionDeps } from '../lib/retentionCore.ts';

const env: Record<string, string | undefined> = (() => {
  let fromFile: Record<string, string> = {};
  try {
    fromFile = Object.fromEntries(
      readFileSync(new URL('../.env.local', import.meta.url), 'utf8')
        .split(/\r?\n/).filter((l) => l && !l.trimStart().startsWith('#') && l.includes('='))
        .map((l) => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; })
    );
  } catch { /* no file: the environment has them */ }
  return { ...fromFile, ...process.env };
})();
const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL!, env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } });

const refuse = async (): Promise<never> => { throw new Error('this script is read-only'); };

const deps: RetentionDeps = {
  windowDays: (plan) => getPlan(plan).retentionDays,
  async listDevelopers() {
    const { data, error } = await sb.from('clients').select('id, name, email, plan, plan_updated_at, lang').order('created_at');
    if (error) throw new Error(error.message);
    const { data: open } = await sb.from('plan_requests').select('client_id').eq('status', 'open');
    const asking = new Set((open ?? []).map((r) => r.client_id as string));
    return (data ?? []).map((r) => ({
      id: r.id as string, name: r.name as string, email: r.email as string, plan: r.plan as string | null,
      planChangedAt: r.plan_updated_at as string | null, lang: r.lang === 'en' ? 'en' as const : 'fr' as const,
      hold: asking.has(r.id as string) ? 'an upgrade request is open' : null,
    }));
  },
  async listForms(developerId) {
    const { data } = await sb.from('forms').select('id, name').eq('client_id', developerId);
    return (data ?? []) as { id: string; name: string }[];
  },
  async listLeads(formIds) {
    const out: LeadStub[] = [];
    for (let from = 0; ; from += 1000) {
      const { data, error } = await sb.from('submissions').select('id, form_id, created_at').in('form_id', formIds).order('created_at').order('id').range(from, from + 999);
      if (error) throw new Error(error.message);
      out.push(...((data ?? []) as LeadStub[]));
      if (!data || data.length < 1000) return out;
    }
  },
  async listNotices(developerId) {
    const { data } = await sb.from('retention_notices').select('*').eq('developer_id', developerId);
    return (data ?? []) as NoticeRow[];
  },
  deleteLeads: refuse, addDeleted: refuse, sendNotice: refuse, saveNotice: refuse, sendReminder: refuse, markReminded: refuse,
};

const s = await runRetention(deps, { now: new Date(), apply: false });
console.log(`Retention report, ${s.ranAt.slice(0, 16).replace('T', ' ')} UTC — read-only`);
console.log(`Accounts with a retention window and at least one form: ${s.developersChecked}`);
if (s.developers.length === 0) console.log('Arming today would notify nobody and delete nothing.');
for (const d of s.developers) {
  console.log(`\n${d.name} — ${d.plan}, ${d.windowDays} days — ${d.leads} lead(s)`);
  if (d.notice) console.log(`  would be notified: ${d.notice.leadCount} on the calendar, ${d.notice.overdueCount} already past the window, first deletion ${d.notice.firstDeletionAt.slice(0, 10)}`);
  if (d.deletable) console.log(`  would be deleted today (announced earlier): ${d.deletable}`);
  if (d.held) console.log(`  held: ${d.held}`);
  for (const e of d.errors) console.log(`  ! ${e}`);
}
console.log(`\nTotals: would notify ${s.totals.wouldNotify} account(s), would delete today ${s.totals.wouldDelete}, errors ${s.totals.errors}`);

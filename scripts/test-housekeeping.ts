/**
 * Unit test for the daily housekeeping: what it lets go of, by which rule,
 * and what it must never touch.
 * Run: node --experimental-strip-types scripts/test-housekeeping.ts
 */
import { runHousekeeping, previewHousekeeping, KEEP_DAYS, cutoff } from '../lib/housekeeping.ts';
import type { HousekeepingDb, HousekeepingQuery } from '../lib/housekeeping.ts';

let pass = 0, fail = 0;
const failures: string[] = [];
const ok = (name: string, cond: boolean, detail = '') =>
  cond ? (pass++, console.log('  PASS  ' + name)) : (fail++, failures.push(name), console.log(`  FAIL  ${name}${detail ? '\n        ' + detail : ''}`));

type Call = { table: string; op: 'delete' | 'update' | 'select'; values?: Record<string, unknown>; filters: string[] };
type Canned = { count?: number; error?: string; throws?: boolean };

/** A stand-in database: records what it is asked, answers what the test decides. */
function fake(answers: Record<string, Canned> = {}) {
  const calls: Call[] = [];
  const db: HousekeepingDb = {
    from(table) {
      const start = (op: 'delete' | 'update' | 'select', values?: Record<string, unknown>): HousekeepingQuery => {
        const call: Call = { table, op, values, filters: [] };
        calls.push(call);
        const q: HousekeepingQuery = {
          lt(column, value) { call.filters.push(`${column} < ${value}`); return q; },
          is(column, value) { call.filters.push(`${column} is ${value}`); return q; },
          not(column, operator, value) { call.filters.push(`${column} not ${operator} ${value}`); return q; },
          then(resolve, reject) {
            // Canned answers are keyed by table, or by table and the start of the first condition ("client_sessions:last_seen <").
            const canned = answers[`${table}:${(call.filters[0] ?? '').split(' ').slice(0, 2).join(' ')}`] ?? answers[table] ?? {};
            const answer = canned.throws
              ? Promise.reject(new Error('connection lost'))
              : Promise.resolve({ count: canned.count ?? 0, error: canned.error ? { message: canned.error } : null });
            return answer.then(resolve, reject);
          },
        };
        return q;
      };
      return { select: () => start('select'), delete: () => start('delete'), update: (values) => start('update', values) };
    },
  };
  return { db, calls };
}

const NOW = new Date('2026-11-26T04:17:00.000Z');
const at = (days: number) => cutoff(NOW, days);

console.log('\n== What it lets go of ==');
{
  const { db, calls } = fake();
  const result = await runHousekeeping(db, NOW);
  const rule = (table: string, first: string) => calls.find((c) => c.table === table && c.filters[0]?.startsWith(first));

  ok('a quiet day reports nothing removed and no error', Object.keys(result.removed).length === 0 && result.errors.length === 0);
  ok('visits older than 13 months', rule('pageviews', 'created_at')?.filters[0] === `created_at < ${at(396)}`);
  ok('security events older than a year', rule('security_events', 'created_at')?.filters[0] === `created_at < ${at(365)}`);
  ok('refused and failed attempts older than a year', rule('failures_log', 'created_at')?.filters[0] === `created_at < ${at(365)}`);
  ok('e-mail log lines older than 13 months', rule('email_log', 'created_at')?.filters[0] === `created_at < ${at(396)}`);
  ok('one-time codes older than a day', rule('email_otps', 'created_at')?.filters[0] === `created_at < ${at(1)}`);
  ok('rate-limit counters older than a day', rule('auth_attempts', 'created_at')?.filters[0] === `created_at < ${at(1)}`);
  ok('a day is exactly 24 hours before the run', at(1) === '2026-11-25T04:17:00.000Z');

  console.log('\n== Bans ==');
  const bans = calls.filter((c) => c.table === 'blacklist');
  ok('one rule, on the expiry date — 30 days after the ban stopped applying', bans.length === 1 && bans[0].filters.length === 1 && bans[0].filters[0] === `expires_at < ${at(30)}`);
  ok('never by creation date: a ban added by hand has no expiry and is never matched', !bans.some((c) => c.filters.some((f) => f.startsWith('created_at'))));

  console.log('\n== Device sessions ==');
  const sessions = calls.filter((c) => c.table === 'client_sessions');
  ok('a session unused for 90 days', sessions.some((c) => c.filters.length === 1 && c.filters[0] === `last_seen < ${at(90)}`));
  ok('a session never used, created 90 days ago', sessions.some((c) => c.filters.join(' & ') === `last_seen is null & created_at < ${at(90)}`));
  ok('90 days is far beyond the life of the token that names a session (7 days)', KEEP_DAYS.deviceSessions >= 30);

  console.log('\n== The assistant ==');
  const ai = calls.filter((c) => c.table === 'ai_messages');
  ok('usage lines are never deleted: the quota counts them', ai.length === 1 && ai[0].op === 'update');
  ok('only the address is blanked, after 30 days', JSON.stringify(ai[0].values) === '{"ip":null}' && ai[0].filters[0] === `created_at < ${at(30)}`);
  ok('lines already blank are left alone', ai[0].filters.includes('ip not is null'));

  console.log('\n== What it never touches ==');
  const touched = new Set(calls.map((c) => c.table));
  for (const table of ['submissions', 'clients', 'portal_users', 'forms', 'api_keys', 'plan_requests', 'retention_notices', 'job_runs']) {
    ok(`${table} is out of reach`, !touched.has(table));
  }
  ok('no delete without an age condition', calls.filter((c) => c.op === 'delete').every((c) => c.filters.some((f) => / < 20\d\d-/.test(f))));
  ok('every update is bounded by age too', calls.filter((c) => c.op === 'update').every((c) => c.filters.some((f) => / < 20\d\d-/.test(f))));
  ok('exactly the ten rules, no more', calls.length === 10, `calls: ${calls.length}`);
}

console.log('\n== Counting and failing ==');
{
  const { db, calls } = fake({ pageviews: { count: 12 }, 'client_sessions:last_seen <': { count: 2 }, ai_messages: { count: 3 } });
  const result = await runHousekeeping(db, NOW);
  ok('what was removed is counted per rule', result.removed.visits === 12 && result.removed.deviceSessions === 2 && result.removed.assistantAddress === 3);
  ok('rules that removed nothing are not listed', !('failures' in result.removed) && !('deviceSessionsNeverSeen' in result.removed));
  ok('all ten rules ran', calls.length === 10);
}
{
  const { db, calls } = fake({ security_events: { error: 'relation "security_events" does not exist' }, email_log: { throws: true }, blacklist: { count: 4 } });
  const result = await runHousekeeping(db, NOW);
  ok('a table that answers with an error is reported', result.errors.some((e) => e.startsWith('securityEvents: relation')));
  ok('a rule that throws is reported, not fatal', result.errors.some((e) => e.startsWith('emailLog: connection lost')));
  ok('the rules after a failure still run', calls.length === 10 && result.removed.expiredBans === 4);
}
{
  const before = new Date();
  const { db, calls } = fake();
  await runHousekeeping(db);
  const used = calls.find((c) => c.table === 'email_otps')!.filters[0].replace('created_at < ', '');
  const expected = before.getTime() - 86_400_000;
  ok('without a date it works from now', Math.abs(new Date(used).getTime() - expected) < 5000);
}

console.log('\n== Looking without touching ==');
{
  const applied = fake();
  await runHousekeeping(applied.db, NOW);
  const { db, calls } = fake({ pageviews: { count: 7 }, ai_messages: { count: 3 } });
  const preview = await previewHousekeeping(db, NOW);
  ok('a preview only reads: no delete, no update', calls.length === 10 && calls.every((c) => c.op === 'select'));
  ok('it asks about exactly the rows a run would touch', JSON.stringify(calls.map((c) => [c.table, c.filters])) === JSON.stringify(applied.calls.map((c) => [c.table, c.filters])));
  ok('and reports the same way', preview.removed.visits === 7 && preview.removed.assistantAddress === 3 && preview.errors.length === 0);
}

console.log(`\n${pass} passed, ${fail} failed`);
if (fail) { console.log('Failed:\n  ' + failures.join('\n  ')); process.exit(1); }

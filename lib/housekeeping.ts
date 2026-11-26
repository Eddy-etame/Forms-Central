import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * What the service stops holding, and when.
 *
 * The privacy policy gives these durations; this is the code that makes them
 * true (until 2026-11-26 the policy said logs "expire on their own" and
 * nothing deleted them). It runs once a day with the backup job.
 *
 * Every rule is a plain delete by age — or, for the assistant's usage lines,
 * one blanking: the line is what the quota counts, the address on it is not.
 * A rule that fails is reported and never stops the others. The rules are
 * written once and read two ways: applied (the daily job) or only counted
 * (`npm run housekeeping`, which changes nothing). Nothing here
 * touches accounts, clients, forms or leads: leads have their own rule, the
 * one that warns first (lib/retentionCore.ts).
 *
 * The client is passed in, so the rules can be tested without a database.
 */

export const KEEP_DAYS = {
  visits: 396,           // visits to the public pages: 13 months
  securityEvents: 365,   // sign-in events and alerts
  failures: 365,         // refused and failed attempts
  emailLog: 396,         // one line per e-mail sent — no address, no content
  deviceSessions: 90,    // a session nobody used for 90 days (a token lives 7)
  expiredBans: 30,       // an automatic ban, 30 days after it stopped applying
  assistantAddress: 30,  // the IP address on an assistant usage line
  oneTimeCodes: 1,       // sign-in codes (valid for minutes)
  rateLimitRows: 1,      // counters behind the rate limits
} as const;

export interface HousekeepingResult {
  removed: Record<string, number>;
  errors: string[];
}

/** The few calls this module makes, spelled out — and what a test double has to provide. */
type Answer = { count: number | null; error: { message: string } | null };
export interface HousekeepingQuery extends PromiseLike<Answer> {
  lt(column: string, value: string): HousekeepingQuery;
  is(column: string, value: null): HousekeepingQuery;
  not(column: string, operator: string, value: null): HousekeepingQuery;
}
export interface HousekeepingDb {
  from(table: string): {
    select(columns: string, options: { count: 'exact'; head: true }): HousekeepingQuery;
    delete(options: { count: 'exact' }): HousekeepingQuery;
    update(values: Record<string, unknown>, options: { count: 'exact' }): HousekeepingQuery;
  };
}

const DAY_MS = 86_400_000;

/** The instant before which a rule applies. */
export function cutoff(now: Date, days: number): string {
  return new Date(now.getTime() - days * DAY_MS).toISOString();
}

/** One rule: which rows, and whether they go or only lose a column. */
interface Rule {
  name: string;
  table: string;
  /** Columns to empty instead of deleting the row. */
  blank?: Record<string, null>;
  where: (q: HousekeepingQuery) => HousekeepingQuery;
}

function rules(now: Date): Rule[] {
  const before = (days: number) => cutoff(now, days);
  const olderThan = (column: string, days: number) => (q: HousekeepingQuery) => q.lt(column, before(days));
  return [
    { name: 'visits', table: 'pageviews', where: olderThan('created_at', KEEP_DAYS.visits) },
    { name: 'securityEvents', table: 'security_events', where: olderThan('created_at', KEEP_DAYS.securityEvents) },
    { name: 'failures', table: 'failures_log', where: olderThan('created_at', KEEP_DAYS.failures) },
    { name: 'emailLog', table: 'email_log', where: olderThan('created_at', KEEP_DAYS.emailLog) },
    { name: 'oneTimeCodes', table: 'email_otps', where: olderThan('created_at', KEEP_DAYS.oneTimeCodes) },
    { name: 'rateLimitRows', table: 'auth_attempts', where: olderThan('created_at', KEEP_DAYS.rateLimitRows) },
    // A permanent entry (added by hand) has no expiry date and is never matched.
    { name: 'expiredBans', table: 'blacklist', where: olderThan('expires_at', KEEP_DAYS.expiredBans) },
    // A session is dead long before this: the token that names it lives 7 days.
    { name: 'deviceSessions', table: 'client_sessions', where: olderThan('last_seen', KEEP_DAYS.deviceSessions) },
    { name: 'deviceSessionsNeverSeen', table: 'client_sessions', where: (q) => q.is('last_seen', null).lt('created_at', before(KEEP_DAYS.deviceSessions)) },
    // The line stays (the quota counts it); the address on it goes.
    { name: 'assistantAddress', table: 'ai_messages', blank: { ip: null }, where: (q) => q.lt('created_at', before(KEEP_DAYS.assistantAddress)).not('ip', 'is', null) },
  ];
}

async function each(now: Date, ask: (rule: Rule) => HousekeepingQuery): Promise<HousekeepingResult> {
  const result: HousekeepingResult = { removed: {}, errors: [] };
  for (const rule of rules(now)) {
    try {
      const { count, error } = await ask(rule);
      if (error) result.errors.push(`${rule.name}: ${error.message}`);
      else if (count) result.removed[rule.name] = count;
    } catch (err) {
      result.errors.push(`${rule.name}: ${(err as Error)?.message || String(err)}`);
    }
  }
  return result;
}

/** Apply every rule. `removed` counts the rows each one deleted (or blanked). */
export async function runHousekeeping(sb: SupabaseClient | HousekeepingDb, now: Date = new Date()): Promise<HousekeepingResult> {
  const db = sb as unknown as HousekeepingDb;
  return each(now, (rule) =>
    rule.where(rule.blank ? db.from(rule.table).update(rule.blank, { count: 'exact' }) : db.from(rule.table).delete({ count: 'exact' }))
  );
}

/** The same rules, read-only: `removed` counts what a run would touch. Changes nothing. */
export async function previewHousekeeping(sb: SupabaseClient | HousekeepingDb, now: Date = new Date()): Promise<HousekeepingResult> {
  const db = sb as unknown as HousekeepingDb;
  return each(now, (rule) => rule.where(db.from(rule.table).select('id', { count: 'exact', head: true })));
}

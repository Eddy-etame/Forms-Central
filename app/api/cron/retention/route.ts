import { NextResponse } from 'next/server';
import { isScheduledCall } from '@/lib/cronAuth';
import { runRetention, reportDigest, NOTICE_DAYS } from '@/lib/retentionCore';
import type { RetentionSummary } from '@/lib/retentionCore';
import { retentionDeps, retentionMode } from '@/lib/retention';
import { lastJobRuns, recordJobRun } from '@/lib/jobRuns';
import { sendOperatorReportEmail } from '@/lib/email';
import { BACKUP_FRESH_MS } from '@/lib/backupCore';

/**
 * Data retention — makes the pricing table true, without ever surprising anyone.
 *
 * Each plan promises a retention window (lib/plans.ts: Free 30 days, Solo a
 * year, Pro/Max unlimited). This route runs once a day (vercel.json `crons`,
 * `Authorization: Bearer <CRON_SECRET>`). What it may do is decided by rules
 * that are tested on their own (lib/retentionCore.ts):
 *
 *   - a lead is deleted for age only after a notice covering it was e-mailed
 *     to the developer at least seven days earlier, for the same plan window;
 *   - a plan change, a long outage of this job or an open upgrade request
 *     voids or pauses what was announced;
 *   - nothing is deleted unless the daily backup succeeded in the last 26 hours;
 *   - the operator receives what happened (or, in report mode, what would).
 *
 * Three switches, on purpose (2026-10-30: the first scheduled run purged old
 * leads before anybody had decided anything):
 *
 *   CRON_SECRET             without it the route answers 401
 *   RETENTION_ENABLED=true  otherwise the run is skipped
 *   RETENTION_APPLY=true    otherwise it only reports: no developer is
 *                           e-mailed, nothing is deleted
 */

export const runtime = 'nodejs';
export const maxDuration = 60;

const day = (iso: string) => iso.slice(0, 10);

function reportLines(s: RetentionSummary): string[] {
  const lines: string[] = [];
  lines.push(
    s.mode === 'apply'
      ? 'Mode: APPLY — developers are notified first; a lead is deleted only on the date its notice gave.'
      : 'Mode: REPORT — no developer was e-mailed, nothing was deleted. This is what arming would do.'
  );
  lines.push(`Run: ${s.ranAt.replace('T', ' ').slice(0, 16)} UTC · accounts with a retention window: ${s.developersChecked}${s.partial ? ' · PARTIAL RUN (time or volume ceiling reached; the rest follows tomorrow)' : ''}`);
  lines.push('');
  if (s.developers.length === 0) lines.push('Nothing to announce, nothing to delete.');
  for (const d of s.developers) {
    lines.push(`${d.name} — ${d.plan}, ${d.windowDays} days — ${d.leads} lead${d.leads === 1 ? '' : 's'}`);
    if (d.notice) {
      const what = `${d.notice.leadCount} lead${d.notice.leadCount === 1 ? '' : 's'} on the calendar, ${d.notice.overdueCount} already past the window, first deletion ${day(d.notice.firstDeletionAt)}`;
      lines.push(s.mode === 'apply' ? `  notice ${d.notice.sent ? 'sent' : 'NOT SENT'}: ${what}` : `  would be notified: ${what}`);
    }
    if (d.reminder) lines.push(`  last call ${s.mode === 'apply' ? (d.reminder.sent ? 'sent' : 'NOT SENT') : 'would be sent'}: ${d.reminder.count} lead${d.reminder.count === 1 ? '' : 's'} go on ${day(d.reminder.deleteAfter)}`);
    if (d.held) lines.push(`  held back today (${d.held}): ${d.deletable} lead${d.deletable === 1 ? '' : 's'} due`);
    else if (s.mode === 'apply' && (d.deleted || d.deletable)) lines.push(`  deleted today: ${d.deleted} of ${d.deletable} due, ${d.files} file${d.files === 1 ? '' : 's'}`);
    else if (d.deletable) lines.push(`  would be deleted today (announced earlier): ${d.deletable}`);
    for (const e of d.errors) lines.push(`  ! ${e}`);
    lines.push('');
  }
  if (s.mode === 'report') {
    lines.push(`To arm: set RETENTION_APPLY=true in the production environment and redeploy. Developers are e-mailed first; nothing is deleted before the date in their notice, at least ${NOTICE_DAYS} days later.`);
    lines.push('To keep an account out of it for good: give it a plan without a retention limit from the operator dashboard before arming.');
  }
  return lines;
}

function reportSubject(s: RetentionSummary): string {
  const t = s.totals;
  if (s.mode === 'report') {
    return `Retention report — arming would notify ${t.wouldNotify} account${t.wouldNotify === 1 ? '' : 's'}${t.errors ? `, ${t.errors} error${t.errors === 1 ? '' : 's'}` : ''}`;
  }
  const parts = [
    t.leadsDeleted ? `${t.leadsDeleted} lead${t.leadsDeleted === 1 ? '' : 's'} deleted` : '',
    t.noticesSent ? `${t.noticesSent} notice${t.noticesSent === 1 ? '' : 's'} sent` : '',
    t.remindersSent ? `${t.remindersSent} last call${t.remindersSent === 1 ? '' : 's'}` : '',
    t.errors ? `${t.errors} error${t.errors === 1 ? '' : 's'}` : '',
  ].filter(Boolean);
  return `Retention — ${parts.join(', ') || 'nothing to do'}`;
}

export async function GET(req: Request) {
  if (!isScheduledCall(req)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  const startedAt = new Date();
  const mode = retentionMode();
  if (mode === 'off') {
    await recordJobRun('retention', { mode: 'off', ok: true, summary: { skipped: 'RETENTION_ENABLED is not true' }, startedAt });
    return NextResponse.json({ success: true, skipped: 'RETENTION_ENABLED is not true' });
  }

  // Nothing is deleted unless a backup was taken, read back and found complete in the last day.
  const lastBackup = (await lastJobRuns('backup', 3)).find((r) => r.ok);
  const backupFresh = !!lastBackup && startedAt.getTime() - new Date(lastBackup.finished_at || lastBackup.started_at).getTime() < BACKUP_FRESH_MS;

  let summary: RetentionSummary;
  try {
    summary = await runRetention(retentionDeps(), {
      now: startedAt,
      apply: mode === 'apply',
      holdAll: backupFresh ? null : 'no verified backup in the last 26 hours',
    });
  } catch (err) {
    const message = (err as Error)?.message || String(err);
    console.error('[RETENTION] run failed:', message);
    await recordJobRun('retention', { mode, ok: false, summary: { error: message }, startedAt });
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }

  // Tell the operator. In apply mode: whenever something happened. In report
  // mode: when the report changed, and once a week otherwise — not every morning.
  const t = summary.totals;
  const digest = reportDigest(summary);
  const eventful = summary.mode === 'apply'
    ? t.noticesSent + t.remindersSent + t.leadsDeleted + t.errors > 0 || summary.developers.some((d) => d.held)
    : t.wouldNotify + t.wouldDelete + t.errors > 0;
  let emailed = false;
  const operator = (process.env.OPERATOR_EMAIL || process.env.ADMIN_2FA_EMAIL || '').trim();
  if (eventful && operator) {
    let due = true;
    if (summary.mode === 'report') {
      const previous = (await lastJobRuns('retention', 14)).find((r) => r.mode === 'report' && r.summary?.emailedAt);
      const lastMailed = previous ? new Date(String(previous.summary.emailedAt)).getTime() : 0;
      due = !previous || previous.summary.digest !== digest || startedAt.getTime() - lastMailed > 6.5 * 86_400_000;
    }
    if (due) emailed = await sendOperatorReportEmail(operator, reportSubject(summary), reportLines(summary));
  }

  await recordJobRun('retention', {
    mode,
    ok: t.errors === 0,
    summary: { ...t, developersChecked: summary.developersChecked, partial: summary.partial, developers: summary.developers, digest, ...(emailed ? { emailedAt: startedAt.toISOString() } : {}) },
    startedAt,
  });
  console.log('[RETENTION]', mode, JSON.stringify(t));
  return NextResponse.json({ success: true, mode, ...t, developersChecked: summary.developersChecked, partial: summary.partial, developers: summary.developers, reported: emailed });
}

import { supabase } from './supabase';

/**
 * Proof of life for scheduled jobs (migration v24, table `job_runs`): each run
 * leaves one row saying when it ran, in which mode, and what it touched. The
 * operator reads it in the dashboard instead of the host's logs, and a job can
 * read its own previous run (retention uses that to avoid e-mailing the same
 * report every morning).
 *
 * Never throws: a job must not fail because its diary could not be written.
 */

export type JobName = 'redeliver' | 'retention' | 'backup';

export interface JobRun {
  id: number;
  job: string;
  mode: string | null;
  ok: boolean;
  summary: Record<string, unknown>;
  started_at: string;
  finished_at: string | null;
}

export async function recordJobRun(job: JobName, r: { mode?: string | null; ok: boolean; summary: Record<string, unknown>; startedAt: Date }): Promise<void> {
  try {
    await supabase.from('job_runs').insert({
      job,
      mode: r.mode ?? null,
      ok: r.ok,
      summary: r.summary,
      started_at: r.startedAt.toISOString(),
      finished_at: new Date().toISOString(),
    });
    // Keep the diary short: six months is more than anyone reads back.
    await supabase.from('job_runs').delete().lt('started_at', new Date(Date.now() - 180 * 86_400_000).toISOString());
  } catch (err) {
    console.error('[job_runs]', (err as Error)?.message || err);
  }
}

export async function lastJobRuns(job: JobName, limit = 1): Promise<JobRun[]> {
  try {
    const { data } = await supabase.from('job_runs').select('*').eq('job', job).order('started_at', { ascending: false }).limit(limit);
    return (data ?? []) as JobRun[];
  } catch {
    return [];
  }
}

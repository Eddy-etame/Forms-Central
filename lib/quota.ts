import { supabase } from './supabase';
import { getPlan, type Plan } from './plans';

/**
 * Plan-quota accounting for the submit pipeline.
 *
 * Philosophy (also promised on /pricing): a lead is NEVER dropped over a
 * quota. Submissions are always stored; only outgoing email pauses when the
 * plan's budget is exhausted. Fail-open on DB errors — email delivery must
 * not break because accounting did.
 */

export interface QuotaState {
  plan: Plan;
  submissionsThisMonth: number;
  emailsToday: number;
  submissionsExhausted: boolean;
  emailBudgetLeft: number;
}

function monthStartIso(): string {
  const d = new Date();
  d.setUTCDate(1);
  d.setUTCHours(0, 0, 0, 0);
  return d.toISOString();
}

function dayStartIso(): string {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  return d.toISOString();
}

export async function getQuotaState(clientId: string, planId: string | null | undefined): Promise<QuotaState> {
  const plan = getPlan(planId);
  let submissionsThisMonth = 0;
  let emailsToday = 0;

  try {
    const [subs, mails] = await Promise.all([
      supabase
        .from('submissions')
        .select('id, forms!inner(client_id)', { count: 'exact', head: true })
        .eq('forms.client_id', clientId)
        .gte('created_at', monthStartIso()),
      supabase
        .from('email_log')
        .select('id', { count: 'exact', head: true })
        .eq('client_id', clientId)
        .gte('created_at', dayStartIso()),
    ]);
    // Fail-open: a missing table / query error counts as zero usage.
    submissionsThisMonth = subs.error ? 0 : subs.count ?? 0;
    emailsToday = mails.error ? 0 : mails.count ?? 0;
  } catch {
    /* fail-open */
  }

  return {
    plan,
    submissionsThisMonth,
    emailsToday,
    submissionsExhausted: submissionsThisMonth > plan.submissionsPerMonth,
    emailBudgetLeft: Math.max(0, plan.emailsPerDay - emailsToday),
  };
}

/** Record an outgoing email (best-effort; enforcement reads these counts). */
export async function logEmailSend(clientId: string, formId: string, kind: 'lead' | 'auto_reply'): Promise<void> {
  try {
    await supabase.from('email_log').insert({ client_id: clientId, form_id: formId, kind });
  } catch {
    /* telemetry only — never block delivery */
  }
}

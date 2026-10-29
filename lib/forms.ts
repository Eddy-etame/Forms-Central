import { supabase } from './supabase';
import type { Plan } from './plans';
import { deriveOrigins, normalizeOrigins } from './snippets';
import type { Lang } from './domain';

/**
 * Form service — the one implementation behind the REST route, the MCP tool
 * and the operator action, so a form created anywhere obeys the same rules:
 * it belongs to a client, it has browser origins, it respects the plan.
 */

export const FORM_SELECT =
  'id, name, is_active, allowed_origins, notify_email, auto_reply_enabled, auto_reply_subject, auto_reply_message, success_url, webhook_url, portal_user_id, client_id, created_at, portal_users(id, name, email, lang)';

export function defaultAutoReply(lang: Lang) {
  return lang === 'en'
    ? { subject: 'Thanks — we received your message', message: '' }
    : { subject: 'Nous avons bien reçu votre message', message: '' };
}

export type ServiceError = { error: string; status: number; code?: string; paywall?: boolean };
export type FormRecord = Record<string, unknown> & { id: string; name: string; allowed_origins: string[] };

export interface CreateFormInput {
  developerId: string;
  plan: Plan;
  name: string;
  clientId: string;
  siteUrl?: string | null;
  origins?: string[] | null;
  lang?: Lang;
  notifyDeveloper?: boolean;
}

export async function createFormForDeveloper(
  i: CreateFormInput
): Promise<{ form: FormRecord; originsOpen: boolean } | ServiceError> {
  const name = i.name.trim();
  if (name.length < 2 || name.length > 60) return { error: 'Form name must be 2–60 characters.', status: 400 };
  if (!i.clientId) return { error: 'Every form belongs to a client. Pick one or create it first.', status: 400, code: 'CLIENT_REQUIRED' };

  const { data: client } = await supabase
    .from('portal_users')
    .select('id, website')
    .eq('id', i.clientId)
    .eq('parent_client_id', i.developerId)
    .maybeSingle();
  if (!client) return { error: 'Client not found.', status: 404 };

  let origins: string[] | null = null;
  if (i.origins && i.origins.length) origins = normalizeOrigins(i.origins);
  else if (i.siteUrl && i.siteUrl.trim()) origins = deriveOrigins(i.siteUrl);
  else if (client.website) origins = deriveOrigins(client.website);
  if (origins === null) return { error: 'One of the origins is not a valid URL.', status: 400 };
  const originsOpen = origins.length === 0;
  if (originsOpen) origins = ['*'];

  const { count } = await supabase.from('forms').select('id', { count: 'exact', head: true }).eq('client_id', i.developerId);
  if (i.plan.formLimit !== null && (count ?? 0) >= i.plan.formLimit) {
    return { error: `The ${i.plan.name} plan includes ${i.plan.formLimit} forms. Upgrade for more.`, status: 402, paywall: true };
  }

  const ar = defaultAutoReply(i.lang ?? 'fr');
  const { data: form, error } = await supabase
    .from('forms')
    .insert({
      name,
      client_id: i.developerId,
      portal_user_id: client.id,
      allowed_origins: origins,
      is_active: true,
      notify_email: i.notifyDeveloper ?? true,
      auto_reply_enabled: true,
      auto_reply_subject: ar.subject,
      auto_reply_message: ar.message,
    })
    .select(FORM_SELECT)
    .single();
  if (error || !form) {
    console.error('createFormForDeveloper:', error);
    return { error: 'Could not create the form. Please try again.', status: 500 };
  }
  return { form: form as unknown as FormRecord, originsOpen };
}

/** Find a developer's form by exact name under a client (idempotent setup). */
export async function findFormByName(developerId: string, clientId: string, name: string): Promise<FormRecord | null> {
  const { data } = await supabase
    .from('forms')
    .select(FORM_SELECT)
    .eq('client_id', developerId)
    .eq('portal_user_id', clientId)
    .ilike('name', name.trim())
    .limit(1);
  return (data?.[0] as unknown as FormRecord) ?? null;
}

export function isServiceError(v: unknown): v is ServiceError {
  return !!v && typeof v === 'object' && 'error' in (v as Record<string, unknown>) && 'status' in (v as Record<string, unknown>);
}

import { supabase } from './supabase';
import type { Plan } from './plans';
import { EMAIL_RE, isSyntheticEmail, type Lang } from './domain';
import { issueClientInvite } from './invites';
import { sendClientInviteEmail } from './email';
import type { ServiceError } from './forms';

/**
 * Client service (table: portal_users) — shared by the REST route, the MCP
 * tool and the operator action.
 */

export const CLIENT_SELECT = 'id, name, email, website, lang, notify_leads, encrypted_password, last_login_at, created_at';

export interface ClientRecord {
  id: string;
  name: string;
  email: string;
  website: string | null;
  lang: Lang;
  notify_leads: boolean;
  has_access: boolean;
  last_login_at: string | null;
  created_at: string;
}

export function shapeClient(row: Record<string, unknown>): ClientRecord {
  const { encrypted_password, ...rest } = row;
  return { ...(rest as Omit<ClientRecord, 'has_access'>), has_access: !!encrypted_password };
}

export interface CreateClientInput {
  developerId: string;
  developerName: string;
  plan: Plan;
  name: string;
  email: string;
  website?: string | null;
  lang?: Lang;
  notifyLeads?: boolean;
  invite?: boolean;
  origin?: string | null;   // app origin for the invite link
  locale?: Lang;
}

export async function createClientForDeveloper(
  i: CreateClientInput
): Promise<{ client: ClientRecord; invited: boolean; existing: boolean } | ServiceError> {
  const name = i.name.trim();
  const email = i.email.trim().toLowerCase();
  if (name.length < 2 || name.length > 80) return { error: 'Client name must be 2–80 characters.', status: 400 };
  if (!EMAIL_RE.test(email)) return { error: 'Invalid e-mail.', status: 400 };

  // Idempotent on e-mail inside this developer's account.
  const { data: existing } = await supabase
    .from('portal_users')
    .select(CLIENT_SELECT)
    .eq('parent_client_id', i.developerId)
    .eq('email', email)
    .maybeSingle();
  if (existing) return { client: shapeClient(existing as Record<string, unknown>), invited: false, existing: true };

  if (i.plan.clientLimit !== null) {
    const { count } = await supabase.from('portal_users').select('id', { count: 'exact', head: true }).eq('parent_client_id', i.developerId);
    if ((count ?? 0) >= i.plan.clientLimit) {
      return { error: `The ${i.plan.name} plan includes ${i.plan.clientLimit} clients. Upgrade for more.`, status: 402, paywall: true };
    }
  }

  const { data: created, error } = await supabase
    .from('portal_users')
    .insert({
      parent_client_id: i.developerId,
      name,
      email,
      website: i.website?.trim().slice(0, 200) || null,
      lang: i.lang ?? 'fr',
      notify_leads: i.notifyLeads ?? true,
      encrypted_password: null,
    })
    .select(CLIENT_SELECT)
    .single();
  if (error || !created) {
    if ((error as { code?: string } | null)?.code === '23505') {
      return { error: 'This e-mail already belongs to a client of another account. Each client e-mail is unique across Inlet.', status: 409 };
    }
    console.error('createClientForDeveloper:', error);
    return { error: 'Could not create the client.', status: 500 };
  }

  let invited = false;
  if (i.invite !== false && !isSyntheticEmail(email)) {
    invited = await inviteClient({ developerId: i.developerId, developerName: i.developerName, clientId: created.id, origin: i.origin, locale: i.locale });
  }
  return { client: shapeClient(created as Record<string, unknown>), invited, existing: false };
}

/** (Re)send the set-password link. Returns true when the e-mail went out. */
export async function inviteClient(i: { developerId: string; developerName: string; clientId: string; origin?: string | null; locale?: Lang }): Promise<boolean> {
  const { data: client } = await supabase
    .from('portal_users')
    .select('id, name, email, lang, encrypted_password')
    .eq('id', i.clientId)
    .eq('parent_client_id', i.developerId)
    .maybeSingle();
  if (!client || isSyntheticEmail(client.email)) return false;

  const url = await issueClientInvite(client.id, { origin: i.origin });
  if (!url) return false;

  const { data: brand } = await supabase
    .from('clients')
    .select('name, logo_url, primary_color, font_family')
    .eq('id', i.developerId)
    .maybeSingle();
  return sendClientInviteEmail(client.email, client.name, brand?.name || i.developerName, url, !!client.encrypted_password, brand, client.lang || i.locale || 'fr').catch(() => false);
}

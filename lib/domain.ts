/**
 * Domain glossary — read this before touching a query.
 *
 *   Concept (UI, docs, MCP)   Table            Session / cookie
 *   ───────────────────────   ──────────────   ───────────────────────────────
 *   Developer                 clients          client_access_token, sub 'client'
 *   Client                    portal_users     portal_access_token, sub 'portal'
 *   Form                      forms            —
 *   Lead                      submissions      —
 *   Operator (super-admin)    —                access_token, sub 'admin'
 *
 * A developer signs up, creates clients (the businesses whose sites they
 * build), and creates forms. Every form belongs to exactly one client
 * (forms.portal_user_id NOT NULL since migration v22). Leads are stored
 * first, then e-mailed to the client (and optionally copied to the developer).
 *
 * The table names are historical: the product started as a single-tenant
 * agency tool where "client" meant the agency's customer. Renaming the tables
 * would rewrite every query and the SECURITY DEFINER functions of v19–v21 for
 * no user-visible gain, so the code keeps the names and this file keeps the
 * mapping honest.
 */

export interface DeveloperRow {
  id: string;
  name: string;
  email: string;
  plan: string | null;
  logo_url?: string | null;
  primary_color?: string | null;
  font_family?: string | null;
  sender_name?: string | null;
  reply_to_email?: string | null;
}

export interface ClientRow {
  id: string;
  parent_client_id: string; // the developer
  name: string;
  email: string;
  website?: string | null;
  lang: 'fr' | 'en';
  notify_leads: boolean;
  encrypted_password?: string | null; // null = no portal access yet (invite pending)
  last_login_at?: string | null;
  created_at: string;
}

export interface FormRow {
  id: string;
  name: string;
  client_id: string; // the developer
  portal_user_id: string; // the client
  allowed_origins: string[];
  is_active: boolean;
  notify_email: boolean; // developer receives a copy of each lead
  auto_reply_enabled: boolean;
  auto_reply_subject: string | null;
  auto_reply_message: string | null;
  success_url?: string | null;
  webhook_url?: string | null;
  created_at: string;
}

export type SpamStatus = 'clean' | 'suspect' | 'spam' | null;

export interface LeadRow {
  id: string;
  form_id: string;
  payload: Record<string, unknown>;
  ip_address: string;
  fingerprint: string;
  spam_status?: SpamStatus;
  spam_reason?: string | null;
  created_at: string;
}

export const LANGS = ['fr', 'en'] as const;
export type Lang = (typeof LANGS)[number];

export function normalizeLang(v: unknown, fallback: Lang = 'fr'): Lang {
  return v === 'en' || v === 'fr' ? v : fallback;
}

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Addresses that must never be e-mailed (synthetic rows from the v22 backfill). */
export function isSyntheticEmail(email: string | null | undefined): boolean {
  return !email || /@clients\.invalid$/i.test(email);
}

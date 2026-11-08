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

/** Passwords are hashed with scrypt; a megabyte of input is a CPU bill, not a password. */
export const MAX_PASSWORD_LENGTH = 128;

/**
 * A public https URL the server may POST to (webhooks): no credentials in the
 * URL, no loopback / private / link-local / carrier-grade NAT hosts. Hostnames
 * are judged literally (no DNS lookup), which keeps the check synchronous.
 */
export function isPublicHttpsUrl(v: string): boolean {
  let u: URL;
  try { u = new URL(v); } catch { return false; }
  if (u.protocol !== 'https:' || u.username || u.password) return false;
  const h = u.hostname.toLowerCase().replace(/^\[|\]$/g, '');
  if (!h || h === 'localhost' || h.endsWith('.localhost') || h.endsWith('.local') || h.endsWith('.internal') || h === '0.0.0.0') return false;
  if (/^(\d{1,3}\.){3}\d{1,3}$/.test(h)) {
    const [a, b] = h.split('.').map(Number);
    if (a === 0 || a === 10 || a === 127 || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || (a === 100 && b >= 64 && b <= 127)) return false;
  }
  if (h === '::1' || h.startsWith('fc') || h.startsWith('fd') || h.startsWith('fe80') || h.startsWith('::ffff:')) return false;
  return true;
}

/**
 * A client's website, normalised to its origin ("acme.com" → "https://acme.com").
 * Returns '' for an empty input and null when it is not a usable address.
 */
export function normalizeWebsite(v: unknown): string | null {
  const raw = String(v ?? '').trim();
  if (!raw) return '';
  try {
    const u = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return null;
    if (!u.hostname.includes('.') && u.hostname !== 'localhost') return null;
    return u.origin;
  } catch {
    return null;
  }
}

/** Addresses that must never be e-mailed (synthetic rows from the v22 backfill). */
export function isSyntheticEmail(email: string | null | undefined): boolean {
  return !email || /@clients\.invalid$/i.test(email);
}

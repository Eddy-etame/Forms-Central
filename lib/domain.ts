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

/** Default auto-reply subject of a new form, by language. */
export const AUTO_REPLY_SUBJECTS: Record<Lang, string> = {
  fr: 'Nous avons bien reçu votre message',
  en: 'Thanks — we received your message',
};

// Every default subject the product ever stored on a form (dashboard, operator
// area, service), paired with its counterpart in the other language.
const DEFAULT_SUBJECT_FAMILIES: { fr: string; en: string[] }[] = [
  { fr: 'Nous avons bien reçu votre message', en: ['Thanks — we received your message', 'We received your message'] },
  { fr: 'Confirmation de réception', en: ['Confirmation of receipt'] },
];

/**
 * The subject a visitor receives for an auto-reply.
 *
 * A subject the developer wrote is never touched. A stored *default* is in one
 * language only, so a French visitor of a form created from the English UI got
 * an English subject over a French body (and an English visitor of a French
 * form the reverse). A default is therefore answered in the visitor's language
 * — and left exactly as stored when the languages already match, so nothing
 * changes for the sites that were already consistent.
 */
export function localizeAutoReplySubject(stored: string | null | undefined, lang: Lang): string {
  const s = (stored ?? '').trim();
  if (!s) return AUTO_REPLY_SUBJECTS[lang];
  const key = s.toLowerCase();
  for (const f of DEFAULT_SUBJECT_FAMILIES) {
    if (f.fr.toLowerCase() === key) return lang === 'fr' ? s : f.en[0];
    if (f.en.some((e) => e.toLowerCase() === key)) return lang === 'en' ? s : f.fr;
  }
  return s;
}

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Passwords are hashed with scrypt; a megabyte of input is a CPU bill, not a password. */
export const MAX_PASSWORD_LENGTH = 128;


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

/**
 * Reserved names that can never receive mail (RFC 2606 / RFC 6761): `.invalid`,
 * `.test`, `.example`, `.localhost`, `example.com|net|org`. The mail layer never
 * sends to them — it verifies the sending account's login instead — so the test
 * suites exercise the real notification path without e-mailing anyone.
 */
export function isUndeliverableEmail(email: string | null | undefined): boolean {
  const domain = String(email ?? '').trim().toLowerCase().split('@').pop() || '';
  return !domain || /(^|\.)(invalid|test|example|localhost)$/.test(domain) || /^example\.(com|net|org)$/.test(domain);
}

/** Addresses that must never be e-mailed (synthetic rows from the v22 backfill). */
export function isSyntheticEmail(email: string | null | undefined): boolean {
  return !email || /@clients\.invalid$/i.test(email);
}

/**
 * A visitor's name, as it may appear in an e-mail sent in a business's name.
 *
 * The auto-reply greets the visitor by the name they typed and goes to the
 * address they typed — which can be anyone's. Left as it came, that name is a
 * free text slot in a branded e-mail to a stranger: "Jean — your account is
 * locked, sign in at http://…". What survives here can only read as a name:
 * one line, no links, no markup, sixty characters.
 */
export function safePersonName(v: unknown): string | undefined {
  if (typeof v !== 'string') return undefined;
  const cleaned = v
    .replace(/[\u0000-\u001f\u007f]+/g, ' ')
    .replace(/(?:https?:\/\/|www\.)\S+/gi, ' ')
    .replace(/\S+\.(?:com|net|org|io|fr|co|ru|cn|xyz|top|info|biz|app|dev|link|click)\b\S*/gi, ' ')
    .replace(/[<>{}\[\]|\\^`"@:/]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 60)
    .trim();
  return cleaned.length >= 1 ? cleaned : undefined;
}

/**
 * Does this submission expect JSON back, or is a browser waiting to be sent
 * somewhere?
 *
 * Until 2026-11-26 the rule was "JSON body, or an Origin header". But every
 * browser puts an Origin header on a POST — including the plainest HTML form.
 * So a visitor who submitted a form without JavaScript was never redirected:
 * they were left on this service's address, reading
 * `{"success":true,"message":"Submission logged successfully"}`. Only tools
 * that send no Origin (curl, the test suites) ever saw the documented 303.
 *
 * A form posted the plain way is a navigation, and browsers say so: fetch
 * metadata (`Sec-Fetch-Mode: navigate`) where they send it, otherwise the
 * Accept header of a navigation (it asks for text/html; a script's fetch asks
 * for anything). A JSON body is always a script. No Origin at all is a
 * server or a tool, which gets the redirect it always got.
 */
export function answersJson(h: { contentType?: string | null; origin?: string | null; secFetchMode?: string | null; accept?: string | null }): boolean {
  if ((h.contentType || '').includes('application/json')) return true;
  if (!h.origin) return false;
  const navigation = h.secFetchMode ? h.secFetchMode === 'navigate' : (h.accept || '').includes('text/html');
  return !navigation;
}

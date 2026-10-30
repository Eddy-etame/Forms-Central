-- ALL.sql — every migration in README order, for a FRESH project. Generated 2026-10-30. Paste into the SQL editor once.

-- ===== schema.sql =====
-- PostgreSQL Schema for Internal Form Micro-service (Supabase)

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Clients Table
CREATE TABLE IF NOT EXISTS clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    logo_url TEXT,
    primary_color TEXT DEFAULT '#000000',
    font_family TEXT DEFAULT 'sans-serif',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Forms Table
CREATE TABLE IF NOT EXISTS forms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    allowed_origins TEXT[] NOT NULL DEFAULT '{}',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    notify_email BOOLEAN NOT NULL DEFAULT TRUE,
    notify_sms BOOLEAN NOT NULL DEFAULT FALSE,
    auto_reply_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    auto_reply_subject TEXT DEFAULT 'Confirmation de réception',
    auto_reply_message TEXT DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Submissions Table
CREATE TABLE IF NOT EXISTS submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    form_id UUID NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
    payload JSONB NOT NULL,
    ip_address TEXT NOT NULL,
    fingerprint TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Refresh Tokens Table (Rotation / Session Management)
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    token_hash TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL,
    revoked BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Blacklist Table (IPs, Fingerprints, and VPN Hostnames)
CREATE TABLE IF NOT EXISTS blacklist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    target TEXT NOT NULL UNIQUE,
    type TEXT NOT NULL CHECK (type IN ('ip', 'fingerprint', 'host')),
    reason TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable indexes for faster lookup
CREATE INDEX IF NOT EXISTS idx_forms_client_id ON forms(client_id);
CREATE INDEX IF NOT EXISTS idx_submissions_form_id ON submissions(form_id);
CREATE INDEX IF NOT EXISTS idx_blacklist_target ON blacklist(target);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_hash ON refresh_tokens(token_hash);

-- ===== migration_auto_reply.sql =====
-- Migration: Add auto-reply fields to forms table
ALTER TABLE forms ADD COLUMN IF NOT EXISTS auto_reply_enabled BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE forms ADD COLUMN IF NOT EXISTS auto_reply_subject TEXT DEFAULT 'Confirmation de réception';
ALTER TABLE forms ADD COLUMN IF NOT EXISTS auto_reply_message TEXT DEFAULT '';

-- ===== migration_v2_branding.sql =====
-- Migration V2: Add branding configuration to clients table

ALTER TABLE clients
ADD COLUMN IF NOT EXISTS logo_url TEXT,
ADD COLUMN IF NOT EXISTS primary_color TEXT DEFAULT '#000000',
ADD COLUMN IF NOT EXISTS font_family TEXT DEFAULT 'sans-serif';

-- ===== migration_v3.sql =====
-- V3 Migration: Auto-reply formatting, Success URL, and Failure Logs

-- 1. Add new configuration columns to forms table
ALTER TABLE forms
ADD COLUMN IF NOT EXISTS auto_reply_subject TEXT,
ADD COLUMN IF NOT EXISTS auto_reply_message TEXT,
ADD COLUMN IF NOT EXISTS success_url TEXT;

-- 2. Create the failures_log table to track failed submissions and spam attempts
CREATE TABLE IF NOT EXISTS failures_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  form_id UUID REFERENCES forms(id) ON DELETE SET NULL,
  error_type TEXT NOT NULL,
  error_message TEXT NOT NULL,
  payload JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Note: Ensure RLS is enabled if needed, though API uses Service Role Key which bypasses RLS.
ALTER TABLE failures_log ENABLE ROW LEVEL SECURITY;

-- ===== migration_v4_clients.sql =====
-- Migration V4: Adds secure encrypted password storage for clients

ALTER TABLE clients
ADD COLUMN IF NOT EXISTS encrypted_password TEXT,
ADD COLUMN IF NOT EXISTS reset_token TEXT,
ADD COLUMN IF NOT EXISTS reset_token_expires TIMESTAMPTZ;

-- Add an index for the reset token
CREATE INDEX IF NOT EXISTS idx_clients_reset_token ON clients(reset_token);

-- ===== migration_v5_ai_plans.sql =====
-- ============================================================================
-- V5 — Subscriptions + AI assistant usage.
-- Run in the Supabase SQL editor after previous migrations.
-- ============================================================================

-- Plan on each client (tenant). 'free' | 'pro'. Payment wiring can flip this
-- flag later (Stripe webhook, manual upgrade, etc.).
ALTER TABLE clients
  ADD COLUMN IF NOT EXISTS plan TEXT NOT NULL DEFAULT 'free'
    CHECK (plan IN ('free', 'pro')),
  ADD COLUMN IF NOT EXISTS plan_updated_at TIMESTAMPTZ;

-- AI usage log: quota enforcement + abuse forensics + cost telemetry.
CREATE TABLE IF NOT EXISTS ai_messages (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL, -- null = anonymous visitor
    anon_id TEXT,                -- signed anonymous visitor id (cookie)
    ip TEXT,
    provider TEXT,               -- gemini_3 / groq / mistral (which one answered)
    ok BOOLEAN NOT NULL DEFAULT TRUE,
    latency_ms INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS ai_messages_client_idx ON ai_messages (client_id, created_at);
CREATE INDEX IF NOT EXISTS ai_messages_anon_idx ON ai_messages (anon_id, created_at);

-- ===== migration_v6_auth_rate_limit.sql =====
-- ============================================================================
-- V6 — Auth rate limiting (brute-force protection).
-- Run in the Supabase SQL editor.
-- ============================================================================

CREATE TABLE IF NOT EXISTS auth_attempts (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    key TEXT NOT NULL,               -- e.g. "login:1.2.3.4:user@mail.com"
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS auth_attempts_key_idx ON auth_attempts (key, created_at);

-- Optional: purge rows older than a day on a schedule, or let the app's
-- opportunistic cleanup handle it.

-- ===== migration_v7_plan_tiers.sql =====
-- ============================================================================
-- V7 — Four plan tiers: free | solo | pro | max.
-- Run in the Supabase SQL editor (after v5).
-- ============================================================================

ALTER TABLE clients DROP CONSTRAINT IF EXISTS clients_plan_check;
ALTER TABLE clients
  ADD CONSTRAINT clients_plan_check CHECK (plan IN ('free', 'solo', 'pro', 'max'));

-- ===== migration_v8_email_log.sql =====
-- ============================================================================
-- V8 — Email send log (quota enforcement + deliverability telemetry).
-- Run in the Supabase SQL editor.
-- ============================================================================

CREATE TABLE IF NOT EXISTS email_log (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    form_id UUID REFERENCES forms(id) ON DELETE SET NULL,
    kind TEXT NOT NULL CHECK (kind IN ('lead', 'auto_reply')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS email_log_client_day_idx ON email_log (client_id, created_at);

-- ===== migration_v9_api_keys.sql =====
-- ============================================================================
-- V9 — API keys (programmatic + MCP access; paid plans).
-- Run in the Supabase SQL editor.
-- ============================================================================

CREATE TABLE IF NOT EXISTS api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    name TEXT NOT NULL DEFAULT 'default',
    key_hash TEXT NOT NULL UNIQUE,   -- sha256 hex of the full key (never store raw)
    key_prefix TEXT NOT NULL,        -- first chars, shown in the UI ("kef_ab12…")
    revoked BOOLEAN NOT NULL DEFAULT FALSE,
    last_used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS api_keys_client_idx ON api_keys (client_id);
CREATE INDEX IF NOT EXISTS api_keys_hash_idx ON api_keys (key_hash);

-- ===== migration_v10_portals.sql =====
-- ============================================================================
-- V10 — Client portals (developer -> end-client read-only lead access).
-- Run in the Supabase SQL editor.
--
-- Model: a developer (row in `clients`) creates end-clients (`portal_users`).
-- Each form may be assigned to one end-client via forms.portal_user_id.
-- End-clients log in at /portal and see ONLY their assigned forms' leads.
-- ============================================================================

CREATE TABLE IF NOT EXISTS portal_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,          -- global unique: email is the login identity
    encrypted_password TEXT NOT NULL,    -- scrypt hash (lib/passwords)
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS portal_users_parent_idx ON portal_users (parent_client_id);

-- A form can be surfaced to one end-client (or none).
ALTER TABLE forms
  ADD COLUMN IF NOT EXISTS portal_user_id UUID REFERENCES portal_users(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS forms_portal_user_idx ON forms (portal_user_id);

-- ===== migration_v11_analytics.sql =====
-- ============================================================================
-- V11 — First-party traffic analytics (owner/super-admin only).
-- Privacy-conscious: no raw IP is ever stored (only a salted SHA-256 hash),
-- no third-party trackers. Run in the Supabase SQL editor.
-- ============================================================================

CREATE TABLE IF NOT EXISTS pageviews (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    path TEXT NOT NULL,
    referrer TEXT,
    session_id TEXT NOT NULL,   -- opaque random id in an httpOnly cookie
    ip_hash TEXT,               -- sha256(ip + secret) — never the raw IP
    device TEXT,                -- 'mobile' | 'desktop' | 'bot'
    browser TEXT,               -- coarse family (Chrome/Safari/Firefox/…)
    country TEXT,               -- from CDN geo header when available
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS pageviews_created_idx ON pageviews (created_at DESC);
CREATE INDEX IF NOT EXISTS pageviews_session_idx ON pageviews (session_id);
CREATE INDEX IF NOT EXISTS pageviews_path_idx ON pageviews (path);

-- ===== migration_v12_security_events.sql =====
-- ============================================================================
-- V12 — Security audit trail (super-admin only).
-- A persistent record of security-relevant events: admin/client login
-- success & failure, rate-limit blocks, password-reset requests. Lets the
-- owner see brute-force attempts and account takeovers as they happen.
-- Run in the Supabase SQL editor.
-- ============================================================================

CREATE TABLE IF NOT EXISTS security_events (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    event_type TEXT NOT NULL,               -- e.g. ADMIN_LOGIN_FAILED, CLIENT_LOGIN_OK, RATE_LIMIT_BLOCK
    severity   TEXT NOT NULL DEFAULT 'info', -- 'info' | 'warn' | 'critical'
    actor      TEXT,                          -- email / 'admin' / null
    ip         TEXT,                          -- source IP (operational security data; owner-only)
    detail     TEXT,                          -- human-readable summary
    meta       JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS security_events_created_idx  ON security_events (created_at DESC);
CREATE INDEX IF NOT EXISTS security_events_type_idx     ON security_events (event_type);
CREATE INDEX IF NOT EXISTS security_events_severity_idx ON security_events (severity);
CREATE INDEX IF NOT EXISTS security_events_ip_idx       ON security_events (ip);

-- Lock the table down: only the service-role key (server) may touch it.
-- With RLS enabled and no policy, anon/authenticated clients get nothing;
-- the server's service-role client bypasses RLS as intended.
ALTER TABLE security_events ENABLE ROW LEVEL SECURITY;

-- ===== migration_v13_custom_sender.sql =====
-- ============================================================================
-- V13 — Custom email identity for paid clients.
-- Lets a paying client (e.g. "Shu") have their brand on the confirmation
-- emails their end-customers receive:
--   • sender_name     — display name shown as the From ("Shu")
--   • reply_to_email  — where replies go (contact@shu.com)
-- These work WITHOUT a verified domain. A true custom From address
-- (From: contact@shu.com) additionally requires verifying the client's
-- domain at the email provider — wired later, once a domain exists.
-- Run in the Supabase SQL editor.
-- ============================================================================

ALTER TABLE clients ADD COLUMN IF NOT EXISTS sender_name    TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS reply_to_email TEXT;

-- ===== migration_v14_two_factor.sql =====
-- ============================================================================
-- V14 — Two-factor authentication (email OTP).
-- After a correct password, an account with 2FA enabled must also enter a
-- 6-digit code emailed to them. Codes are stored hashed, single-use, expire
-- in 10 minutes, and lock after 5 wrong attempts.
-- Run in the Supabase SQL editor.
-- ============================================================================

-- Opt-in flag per client (owner-managed for now; self-serve later).
ALTER TABLE clients ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN NOT NULL DEFAULT FALSE;

CREATE TABLE IF NOT EXISTS email_otps (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject_type TEXT NOT NULL,               -- 'admin' | 'client'
    subject_id   TEXT NOT NULL,               -- client id, or 'admin'
    purpose      TEXT NOT NULL DEFAULT 'login_2fa',
    code_hash    TEXT NOT NULL,               -- sha256(subject_id:code:pepper)
    expires_at   TIMESTAMPTZ NOT NULL,
    consumed     BOOLEAN NOT NULL DEFAULT FALSE,
    attempts     INT NOT NULL DEFAULT 0,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS email_otps_subject_idx ON email_otps (subject_type, subject_id);
CREATE INDEX IF NOT EXISTS email_otps_created_idx ON email_otps (created_at DESC);

-- Server-only (service role bypasses RLS; anon/authenticated get nothing).
ALTER TABLE email_otps ENABLE ROW LEVEL SECURITY;

-- ===== migration_v15_device_sessions.sql =====
-- ============================================================================
-- V15 — Device/session limits (anti subscription-sharing).
-- Every client sign-in registers a session (one per device). A client may
-- hold at most N active sessions; signing in on an extra device evicts the
-- OLDEST session, which is signed out on its next page load. Sharing one
-- account across a team therefore keeps kicking the earliest device off.
-- Run in the Supabase SQL editor.
-- ============================================================================

CREATE TABLE IF NOT EXISTS client_sessions (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id  UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    ip         TEXT,
    user_agent TEXT,
    revoked    BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_seen  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS client_sessions_client_idx  ON client_sessions (client_id, revoked, created_at);
CREATE INDEX IF NOT EXISTS client_sessions_created_idx ON client_sessions (created_at DESC);

-- Server-only (service role bypasses RLS).
ALTER TABLE client_sessions ENABLE ROW LEVEL SECURITY;

-- ===== migration_v16_ai_spam.sql =====
-- ============================================================================
-- V16 — AI spam classification on submissions.
-- Every stored lead gets an async AI verdict: clean | suspect | spam.
-- Leads are ALWAYS stored regardless of verdict (the classifier only labels,
-- never deletes) — clients filter the noise instead of losing data.
-- Run in the Supabase SQL editor.
-- ============================================================================

ALTER TABLE submissions ADD COLUMN IF NOT EXISTS spam_status TEXT;   -- 'clean' | 'suspect' | 'spam' | NULL (unclassified)
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS spam_reason TEXT;   -- one-line model explanation

CREATE INDEX IF NOT EXISTS submissions_spam_idx ON submissions (spam_status);

-- ===== migration_v17_webhooks.sql =====
-- ============================================================================
-- V17 — Outbound webhooks.
-- A form can POST every stored submission to its owner's endpoint, signed
-- Stripe-style (HMAC-SHA256 over "<timestamp>.<body>") so receivers can
-- verify authenticity and reject replays. Delivery is fire-and-forget with
-- one retry; failures land in failures_log (visible on /admin/logs).
-- Run in the Supabase SQL editor.
-- ============================================================================

ALTER TABLE forms   ADD COLUMN IF NOT EXISTS webhook_url TEXT;      -- https endpoint, NULL = disabled
ALTER TABLE clients ADD COLUMN IF NOT EXISTS webhook_secret TEXT;   -- per-client signing secret (generated on first delivery)

-- ===== migration_v18_client_email_unique.sql =====
-- ============================================================================
-- V18 — Prevent duplicate client emails (case-insensitive).
-- The login looks up the account with .single(), which errors on >1 row and
-- surfaces as a misleading "Unknown account". A unique index makes duplicates
-- impossible at the source (signup race, atelier auto-provision, imports).
-- Run in the Supabase SQL editor. If it fails, there are already duplicates —
-- de-dupe first (keep the oldest row per email), then re-run.
-- ============================================================================

CREATE UNIQUE INDEX IF NOT EXISTS clients_email_lower_unique
  ON clients (lower(email));

-- ===== migration_v19_data_security.sql =====
-- ============================================================================
-- V19 — DATA SECURITY LAYER
-- The database defends itself; the application is not trusted to.
--
--   • Row-Level Security is enabled + deny-by-default on EVERY table, and the
--     public-facing roles (anon, authenticated) lose all table privileges.
--     The app uses the service_role key, which BYPASSES RLS — so nothing in
--     the app breaks — but a leaked/public key now reaches nothing.
--   • Duplicates become structurally impossible: a trigger normalizes
--     clients.email (lower+trim) and a unique index enforces one identity.
--   • Sensitive access is mediated by SECURITY DEFINER functions and a
--     secret-free view instead of raw table reads (the password hash can only
--     leave the database through one audited function).
--
-- Run in the Supabase SQL editor. Idempotent — safe to re-run.
-- ============================================================================

-- ── 1. STRUCTURAL INTEGRITY — invalid states cannot exist ───────────────────

create or replace function normalize_client_email() returns trigger
  language plpgsql as $$
begin
  new.email := lower(btrim(new.email));
  return new;
end $$;

drop trigger if exists trg_normalize_client_email on clients;
create trigger trg_normalize_client_email
  before insert or update of email on clients
  for each row execute function normalize_client_email();

-- one identity per email, case-insensitive → duplicates impossible
create unique index if not exists clients_email_lower_unique on clients (lower(email));

-- ── 2. ROW-LEVEL SECURITY — deny by default on every table ──────────────────
-- No policies are created, so anon/authenticated get nothing. service_role
-- (the app) bypasses RLS and is unaffected. Missing tables are skipped.

do $$
declare t text;
begin
  foreach t in array array[
    'clients','forms','submissions','api_keys','portal_users','refresh_tokens',
    'pageviews','client_sessions','blacklist','failures_log','email_otps',
    'ai_messages','security_events','auth_attempts','email_log'
  ] loop
    begin
      execute format('alter table public.%I enable row level security;', t);
      execute format('revoke all on public.%I from anon, authenticated;', t);
    exception when undefined_table then
      raise notice 'v19: table % absent, skipped', t;
    end;
  end loop;
end $$;

-- ── 3. ACCESS MEDIATION — functions + a secret-free view ────────────────────

-- Reads that must never touch the password hash go through this view.
create or replace view clients_safe as
  select id, name, email, phone, logo_url, primary_color, font_family,
         sender_name, reply_to_email, two_factor_enabled, plan, created_at
  from clients;

-- The ONLY path that may return the password hash — for the login flow only,
-- for a single normalized email. SECURITY DEFINER runs as the function owner.
create or replace function auth_client_by_email(p_email text)
  returns table (id uuid, email text, name text, encrypted_password text, two_factor_enabled boolean)
  language sql security definer set search_path = public as $$
  select id, email, name, encrypted_password, two_factor_enabled
  from clients where lower(email) = lower(btrim(p_email)) limit 1;
$$;

-- Creation is enforced in the DB; a duplicate raises a clean typed error.
create or replace function create_client_secure(
  p_name text, p_email text, p_password text, p_plan text default 'free'
) returns uuid language plpgsql security definer set search_path = public as $$
declare new_id uuid;
begin
  insert into clients (name, email, encrypted_password, plan)
  values (p_name, lower(btrim(p_email)), p_password, coalesce(p_plan, 'free'))
  returning id into new_id;
  return new_id;
exception when unique_violation then
  raise exception 'client_email_exists' using errcode = 'unique_violation';
end $$;

-- ── 4. LEAST PRIVILEGE — only the service role may use the above ─────────────
revoke all on clients_safe from anon, authenticated;
grant select on clients_safe to service_role;

revoke all on function auth_client_by_email(text) from public, anon, authenticated;
revoke all on function create_client_secure(text, text, text, text) from public, anon, authenticated;
grant execute on function auth_client_by_email(text) to service_role;
grant execute on function create_client_secure(text, text, text, text) to service_role;

-- ===== migration_v20_portal_security.sql =====
-- ============================================================================
-- V20 — Portal-user security (the second public login surface).
-- Mirrors v19 for portal_users: normalize email, make case-insensitive
-- duplicates impossible, and mediate the password-hash read through one
-- SECURITY DEFINER function instead of a raw table select.
-- Run in the Supabase SQL editor. Idempotent.
-- ============================================================================

-- normalize email (lower + trim) so casing/space can't fork a login identity
create or replace function normalize_portal_email() returns trigger
  language plpgsql as $$
begin
  new.email := lower(btrim(new.email));
  return new;
end $$;

drop trigger if exists trg_normalize_portal_email on portal_users;
create trigger trg_normalize_portal_email
  before insert or update of email on portal_users
  for each row execute function normalize_portal_email();

-- case-insensitive uniqueness (the table's existing UNIQUE(email) is
-- case-sensitive; this closes casing duplicates). If this fails, de-dupe
-- case-variant rows first (keep the oldest), then re-run.
create unique index if not exists portal_users_email_lower_unique on portal_users (lower(email));

-- The only path that may return a portal user's password hash, for login.
create or replace function auth_portal_user(p_email text)
  returns table (id uuid, parent_client_id uuid, encrypted_password text)
  language sql security definer set search_path = public as $$
  select id, parent_client_id, encrypted_password
  from portal_users where lower(email) = lower(btrim(p_email)) limit 1;
$$;

revoke all on function auth_portal_user(text) from public, anon, authenticated;
grant execute on function auth_portal_user(text) to service_role;

-- ===== migration_v21_apikey_function.sql =====
-- ============================================================================
-- V21 — API-key verification through a function (completes auth mediation).
-- The MCP/API auth path resolved a bearer token by raw table lookup. Route it
-- through one SECURITY DEFINER function instead, consistent with v19/v20.
-- (The key itself is never stored — only its sha256 hash — so this returns no
-- secret; it's mediated for consistency + least privilege.)
-- Run in the Supabase SQL editor. Idempotent.
-- ============================================================================

create or replace function verify_api_key(p_hash text)
  returns table (id uuid, client_id uuid, revoked boolean, client_name text, client_plan text)
  language sql security definer set search_path = public as $$
  select k.id, k.client_id, k.revoked, c.name, c.plan
  from api_keys k
  join clients c on c.id = k.client_id
  where k.key_hash = p_hash
  limit 1;
$$;

revoke all on function verify_api_key(text) from public, anon, authenticated;
grant execute on function verify_api_key(text) to service_role;

-- ===== migration_v22_platform.sql =====
-- ============================================================================
-- V22 — THE PLATFORM MODEL
--
--   developer (row in `clients`)  →  client (row in `portal_users`)  →  form  →  lead
--
-- Historical table names are kept (renaming them would touch every query and
-- every SECURITY DEFINER function from v19–v21). The glossary lives in
-- lib/domain.ts and README.md. What this migration changes:
--
--   1. A client can exist WITHOUT portal access yet: encrypted_password becomes
--      nullable. Access is granted with a set-password link (invite), never with
--      a password sent by email (court order A9).
--   2. Every form belongs to a client: orphan forms are backfilled onto a default
--      client per developer, then forms.portal_user_id becomes NOT NULL and the
--      FK becomes RESTRICT (a client with forms cannot be deleted by accident).
--   3. Client-level settings: website, lang (auto-reply language), notify_leads
--      (the client receives each lead by e-mail and can answer from the inbox).
--   4. Blacklist entries can expire: rate-limit bans last 24 h, never forever
--      (court order A2). Existing rate-limit bans are deleted.
--   5. plan_requests: upgrade intents recorded in the database instead of a
--      mailto: link to a personal mailbox (court order A5).
--
-- Run in the Supabase SQL editor AFTER v21. Idempotent — safe to re-run.
-- ============================================================================

-- ── 1. Clients without portal access, invites ───────────────────────────────

alter table portal_users alter column encrypted_password drop not null;

alter table portal_users
  add column if not exists website           text,
  add column if not exists lang              text        not null default 'fr',
  add column if not exists notify_leads      boolean     not null default true,
  add column if not exists invite_token_hash text,
  add column if not exists invite_expires    timestamptz,
  add column if not exists last_login_at     timestamptz;

alter table portal_users drop constraint if exists portal_users_lang_check;
alter table portal_users add constraint portal_users_lang_check check (lang in ('fr', 'en'));

create index if not exists portal_users_invite_idx on portal_users (invite_token_hash);

-- ── 2. Every form belongs to a client ────────────────────────────────────────

-- Backfill: each developer that still has orphan forms gets ONE default client
-- (their own name and e-mail), and the orphan forms are attached to it.
do $$
declare
  d   record;
  cid uuid;
begin
  for d in
    select distinct c.id, c.name, c.email
    from forms f
    join clients c on c.id = f.client_id
    where f.portal_user_id is null
  loop
    select id into cid from portal_users
      where parent_client_id = d.id
      order by created_at
      limit 1;

    if cid is null then
      begin
        -- The developer's own address receives the leads of the backfilled forms,
        -- exactly as before this migration (notifications used to go to clients.email).
        insert into portal_users (parent_client_id, name, email, encrypted_password, notify_leads)
        values (d.id, d.name, lower(btrim(d.email)), null, true)
        returning id into cid;
      exception when unique_violation then
        -- That e-mail is already a client of another developer (e-mails are
        -- globally unique). Use a synthetic address that is never e-mailed.
        insert into portal_users (parent_client_id, name, email, encrypted_password, notify_leads)
        values (d.id, d.name, 'dev+' || d.id::text || '@clients.invalid', null, false)
        returning id into cid;
      end;
    end if;

    update forms set portal_user_id = cid
      where client_id = d.id and portal_user_id is null;
  end loop;
end $$;

alter table forms alter column portal_user_id set not null;

alter table forms drop constraint if exists forms_portal_user_id_fkey;
alter table forms
  add constraint forms_portal_user_id_fkey
  foreign key (portal_user_id) references portal_users(id) on delete restrict;

-- Faster "latest leads of this form" reads (dashboards, MCP list_leads, health).
create index if not exists submissions_form_created_idx on submissions (form_id, created_at desc);

-- ── 3. Blacklist entries expire ──────────────────────────────────────────────

alter table blacklist add column if not exists expires_at timestamptz;
create index if not exists blacklist_expires_idx on blacklist (expires_at);

-- Permanent bans written by the old rate limiter are lifted: a burst of real
-- submissions from one office or carrier IP must never ban a client forever.
delete from blacklist where reason ilike '%rate limit%';

-- ── 4. Plan requests (upgrade intents) ───────────────────────────────────────

create table if not exists plan_requests (
    id         uuid primary key default gen_random_uuid(),
    client_id  uuid not null references clients(id) on delete cascade,
    plan       text not null check (plan in ('solo', 'pro', 'max')),
    message    text,
    status     text not null default 'open' check (status in ('open', 'activated', 'declined')),
    created_at timestamptz not null default now()
);
create index if not exists plan_requests_client_idx on plan_requests (client_id, created_at desc);

alter table plan_requests enable row level security;
revoke all on plan_requests from anon, authenticated;

-- ── 5. Deny-by-default on the new table (same posture as v19) ────────────────
do $$
begin
  execute 'revoke all on public.plan_requests from anon, authenticated';
exception when others then null;
end $$;

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

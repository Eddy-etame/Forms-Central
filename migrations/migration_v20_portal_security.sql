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

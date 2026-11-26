-- ============================================================================
-- v25 — sessions that can be ended, e-mail ownership that is known  (2026-11-26)
--
-- Why (security review of 2026-11-26):
--
--   sessions_valid_after   A session token is a signed statement that lives
--                          seven days. Until now nothing could end one early
--                          on the API: signing out, a password reset or a
--                          removed device left the old token working. Every
--                          session check now compares the token's issue time
--                          with this instant; a password reset moves it to
--                          "now", which ends every earlier session at once.
--                          (clients = developers, portal_users = their clients)
--
--   email_verified_at      Sign-up asks for no proof that the address belongs
--                          to the person typing it. Someone could register a
--                          victim's address first, wait for the victim to
--                          arrive through "Sign in with Google" or "Forgot
--                          password", and keep their own password or session.
--                          The first time ownership is proven (Google, or a
--                          reset link opened from the mailbox) an unverified
--                          account now loses its earlier password and
--                          sessions. Accounts that exist today have been used
--                          by their owners and are marked verified.
--
-- Additive and idempotent. Safe to run twice.
-- ============================================================================

alter table public.clients
  add column if not exists sessions_valid_after timestamptz,
  add column if not exists email_verified_at    timestamptz;

alter table public.portal_users
  add column if not exists sessions_valid_after timestamptz;

comment on column public.clients.sessions_valid_after      is 'Session tokens issued before this instant are refused (moved to now() by a password reset).';
comment on column public.clients.email_verified_at         is 'When ownership of the e-mail address was first proven (Google sign-in or a reset link). NULL = never.';
comment on column public.portal_users.sessions_valid_after is 'Session tokens issued before this instant are refused (moved to now() when the client sets a password).';

update public.clients set email_verified_at = created_at where email_verified_at is null;

-- Trigger functions need no caller: nobody but the table owner runs them.
revoke execute on function public.normalize_client_email() from anon, authenticated, public;
revoke execute on function public.normalize_portal_email() from anon, authenticated, public;

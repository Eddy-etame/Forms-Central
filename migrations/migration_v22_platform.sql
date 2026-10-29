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

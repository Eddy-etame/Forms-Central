-- ============================================================================
-- v24 — retention notices, job runs, developer language          (2026-11-24)
--
-- Why: retention is the one job that deletes. Its first scheduled run
-- (2026-10-30) purged old leads before anybody had been told. From now on a
-- lead can only be deleted for age when a notice that covers it was e-mailed
-- to the developer at least seven days earlier — and that rule is data, not a
-- promise in a comment:
--
--   retention_notices   one row per notice actually handed to the mail server.
--                       covers_before = every lead received before that
--                       instant is announced; delete_after = nothing it
--                       announces goes before that instant; window_days = the
--                       plan window it announced (a plan change voids it).
--   job_runs            what each scheduled job did on its last runs, so the
--                       operator can see that a job is alive and what it
--                       touched without reading host logs.
--   clients.lang        the language the developer last signed in with, so a
--                       scheduled e-mail (no request, no cookie) is written in
--                       the right one.
--
-- Additive and idempotent. Safe to run twice.
-- ============================================================================

create table if not exists public.retention_notices (
  id                uuid primary key default gen_random_uuid(),
  developer_id      uuid not null references public.clients(id) on delete cascade,
  window_days       integer not null check (window_days > 0),
  covers_before     timestamptz not null,
  delete_after      timestamptz not null,
  lead_count        integer not null default 0,
  overdue_count     integer not null default 0,
  first_deletion_at timestamptz,
  last_deletion_at  timestamptz,
  sent_at           timestamptz not null default now(),
  reminded_at       timestamptz,
  deleted_count     integer not null default 0,
  created_at        timestamptz not null default now(),
  check (delete_after > sent_at)
);

comment on table  public.retention_notices                is 'Deletion notices e-mailed to developers. A lead is deleted for age only under a matured notice that covers it.';
comment on column public.retention_notices.window_days    is 'Plan retention window announced by this notice. Deletion requires it to equal the current plan window.';
comment on column public.retention_notices.covers_before  is 'Every lead received before this instant was announced by this notice.';
comment on column public.retention_notices.delete_after   is 'Nothing announced by this notice is deleted before this instant (sent_at + notice period).';
comment on column public.retention_notices.lead_count     is 'Leads the developer held when the notice was sent: an upper bound for what it may delete.';
comment on column public.retention_notices.overdue_count  is 'Of which already past the window when the notice was sent (deleted together on delete_after).';
comment on column public.retention_notices.reminded_at    is 'When the last-call reminder was sent (only for notices with overdue leads).';
comment on column public.retention_notices.deleted_count  is 'Leads deleted so far under this notice.';

create index if not exists retention_notices_developer_idx
  on public.retention_notices (developer_id, covers_before desc);

alter table public.retention_notices enable row level security;
revoke all on public.retention_notices from anon, authenticated;

create table if not exists public.job_runs (
  id          bigint generated always as identity primary key,
  job         text not null,
  mode        text,
  ok          boolean not null default true,
  summary     jsonb not null default '{}'::jsonb,
  started_at  timestamptz not null default now(),
  finished_at timestamptz
);

comment on table  public.job_runs      is 'One row per run of a scheduled job (redeliver, retention, backup): proof of life and what it touched.';
comment on column public.job_runs.mode is 'retention: report (nothing sent, nothing deleted) or apply.';

create index if not exists job_runs_job_idx on public.job_runs (job, started_at desc);

alter table public.job_runs enable row level security;
revoke all on public.job_runs from anon, authenticated;

alter table public.clients
  add column if not exists lang text check (lang in ('fr', 'en'));

comment on column public.clients.lang is 'Language of the developer''s last sign-in; used for e-mails sent by scheduled jobs.';

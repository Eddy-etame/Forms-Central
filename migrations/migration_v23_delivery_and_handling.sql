-- ============================================================================
-- v23 — delivery state and handled state of a lead            (2026-11-24)
--
-- Why: between 2026-11-07 and 2026-11-24 every lead notification was dropped
-- without a trace (see docs/v3/README.md, incident of 2026-11-24). The e-mail
-- log could not say WHICH lead had been notified, so nothing flagged the gap.
-- From now on each lead carries its own delivery state:
--
--   notified_at      when the client's notification was handed to the mail
--                    server (NULL = not delivered yet → shown in the dashboard
--                    and retried)
--   notify_attempts  how many deliveries were tried (caps the retries)
--   handled_at/by    set when the client or the developer marks the lead as
--                    dealt with in the inbox
--
-- Additive and idempotent. Safe to run twice.
-- ============================================================================

alter table public.submissions
  add column if not exists notified_at     timestamptz,
  add column if not exists notify_attempts smallint not null default 0,
  add column if not exists handled_at      timestamptz,
  add column if not exists handled_by      text;

comment on column public.submissions.notified_at     is 'When the client notification was accepted by the mail server; NULL = not delivered.';
comment on column public.submissions.notify_attempts is 'Delivery attempts for the client notification.';
comment on column public.submissions.handled_at      is 'When the lead was marked as handled in the inbox.';
comment on column public.submissions.handled_by      is 'Who marked it: client or developer.';

-- Backfill: before this migration the only trace of a delivery is a row of
-- kind ''lead'' in email_log for the same form within two minutes of the lead.
update public.submissions s
   set notified_at = m.sent_at, notify_attempts = 1
  from (
    select distinct on (s2.id) s2.id as sid, e.created_at as sent_at
      from public.submissions s2
      join public.email_log e
        on e.form_id = s2.form_id
       and e.kind = 'lead'
       and e.created_at >= s2.created_at
       and e.created_at <  s2.created_at + interval '2 minutes'
     order by s2.id, e.created_at
  ) m
 where s.id = m.sid
   and s.notified_at is null;

-- The retry sweep and the dashboard both ask for "not delivered yet, recent".
create index if not exists submissions_pending_notify_idx
  on public.submissions (created_at)
  where notified_at is null;

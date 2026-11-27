# Inlet v3 — the platform decision

**Date:** 2026-10-29 · **Decided by:** the author · **Written by:** the second brain

This file is the plan of record. The tribunal (`docs/tribunal/`), the rebuild
plan (`docs/rebuild/`) and the niche round (`docs/rebuild/niche/`) are
history: research, verdicts and options. What is below is what we build.

---

## 1. Decisions ledger

| # | Decision (2026-10-29) | Reason | Status |
|---|-----------------------|--------|--------|
| D1 | **Inlet is a platform, not a niche tool.** Developers hold *clients*; every form belongs to a client; AI agents integrate through MCP. | The author's own market: they build sites for clients and want the client model, not a vertical. The niche round is superseded. | shipped |
| D2 | **Only developers sign up.** Clients never register; a developer creates them and sends a set-password link. | The "registered as a client, not a developer" bug came from calling developers "clients" in the UI and gating client portals behind paid plans. | shipped |
| D3 | **No form without a client.** `forms.portal_user_id NOT NULL` (migration v22); orphan forms were backfilled onto a default client per developer. | A lead must always have a business it belongs to. | shipped |
| D4 | **The code never contains an e-mail address.** Snippets carry the form id only; the recipient is resolved server-side on the form's client. | Security (scrapers, spam) and correctness (the client, not the developer, receives the lead). | shipped |
| D5 | **Integration must be trivial, docs exhaustive.** One generator (`lib/snippets.ts`) feeds the dashboard, the docs and MCP; `/docs` covers concepts → code per stack → relay → clients → security → MCP → webhooks → errors → limits → FAQ, in EN and FR. | "Very simple, even simpler to integrate, docs very exhaustive with pieces of code." | shipped |
| D6 | **MCP v2 is a first-class surface.** 14 tools; `setup_site` from zero to a live form in one call; compact, minified outputs; lead text marked untrusted. | AI agents are the fastest route to the first paying developers. | shipped |
| D7 | **Every plan includes API + MCP and clients.** Free: 3 forms, 2 clients. Paid plans buy room and brand. | Free must prove the model on a real site, or nobody reaches the paid tiers. | shipped |
| D8 | **Paid plans are requested, then activated by hand** (`plan_requests`, operator e-mail) until the company exists and card checkout opens. | No `mailto:` to a personal mailbox (court order A5); no fake checkout. | shipped |
| D9 | **The product moves to the author's own accounts**: Vercel project `inlet` under the Gmail account (done 2026-10-30, deployed from the CLI, secrets transferred), GitHub mirror `EddyEtame/inlet` (done 2026-10-30: full history, `main` + the v3 branch; `origin` pushes to both accounts), Supabase: the existing project stays until its ownership is confirmed. | The school account is lost; its Google SSO carries the old Vercel access. | Vercel done · GitHub done · Supabase: account found, no move needed |
| D10 | **A company carries the product within a month.** Prices stay in USD on the site; the EUR price book mirrors them 1:1 when invoicing opens. | Required for invoicing and for the first €1k. | pending |

### Court orders from the tribunal — status

| Order | Meaning | Status |
|-------|---------|--------|
| A1 | keyword hits → stored as `suspect`, never dropped | done (`app/api/submit/[id]/route.ts`) |
| A2 | bans are temporary; API-key server submit with forwarded visitor IP | done (`lib/blacklist.ts`, submit route) |
| A3 | attachments served by lead id + ownership, never by URL | done (`app/api/download/route.ts`) |
| A4 | AI classifier off unless `AI_CLASSIFIER_ENABLED=true`; labels only unlabeled leads | done (`lib/spamClassifier.ts`) |
| A5 | no `mailto:` upgrade path, no personal mailbox | done (`plan_requests`, `UpgradeButton`) |
| A6 | truth pass on every claim (landing, pricing, llms.txt, AI knowledge, docs) | done — no self-hosting, no unlimited AI, no DKIM, no SMTP rotation, no compare pages, no fake testimonials |
| A7 | a failed send is logged as a failure, never a false "delivered"; the account pool keeps rotating with a cooldown (author's decision 2026-10-29: keep rotation) | done (`lib/email.ts`, `lib/mailAccounts.ts`) |
| A8 | daily e-mail budget charged after a successful send | done |
| A9 | set-password links instead of e-mailed passwords (clients, developers, admin) | done (`lib/invites.ts`, portal set-password / forgot-password) |

---

### 2026-11-07 — EAM infusion and the move of the client sites

- Production renamed **`eam-inlet.vercel.app`** (project `eam-inlet`;
  `inlet-eta` 308-redirects). 13 client-site repositories now post there
  (pushed to `main`); the only one left is `angoularaphael/boxing-center-portet`
  (two lines in `src/pages.ts`) because the Claude GitHub App is not installed
  on that account. External developers' sites keep the old deployment.
- EAM identity, light touch: Fraunces for the serif accents, EAM navy + gold
  on the dark surfaces (hero, featured pricing card, auth panel), "Inlet · by
  EAM" lockups (nav, footer, auth, e-mails, OG image), truthful root metadata
  (no more "self-hosted alternative" in `<meta description>`). Blue stays the
  interactive colour; the dashboard is untouched.

### 2026-11-07 (evening) — the UI proven end to end, and two classes of bug closed

- **`scripts/test-ui.js`** (Playwright) now drives the real pages on
  production: signup → client + form in the modal → settings → a native lead
  → dashboard and lead modal → the client's inbox through an invite link →
  API & MCP page → phone widths. 24 checks, 0 browser errors, every row
  cleaned up, no e-mail sent. `npm run test:ui`.
- **Hydration mismatches, as a class.** Five dashboard components rendered
  `window.location.origin` during render (React #418 on the clients page);
  `useOrigin()` (useSyncExternalStore) now serves the configured site URL on
  the server and the browser origin right after. `useLocale()` read the
  cookie in a `useState` initializer, so the server said French and the
  browser said English for every EN visitor on the auth and portal pages;
  the root layout now provides the locale it resolves (`LocaleProvider`) and
  the client portal nests the portal user's language — the inbox no longer
  mixes "Vos leads" with "Sign out".
- Small truths from the run: the auto-reply language of a new form defaults
  to the developer's UI language (it was always French); the lead modals have
  a dark footer, a translated Close and a dated header; ThemeToggle and the
  mobile drawer no longer set state inside effects.
- **Retention, dry run only (read-only SQL):** 3 free-plan leads are past the
  30-day window today. The route stays disabled (`RETENTION_ENABLED` unset,
  no schedule) until the author says so — a dry run first, then apply.
- Still open: `angoularaphael/boxing-center-portet` (two lines, needs the
  Claude GitHub App on that account or a manual edit); the notice to the five
  external developers is drafted in `notice-external-developers.md`, not
  sent; one synthetic developer from a July test run remains in the database
  (`mcptest+…@test.dev`, solo plan, one empty form and its default client) — a one-row cleanup for the
  author to approve; lint debt in the admin pages (47 `any`/legacy errors,
  none in the developer surface).

### 2026-11-08 — API hardening, metadata that follows the URL, legal pages

- **Authorization audit** of every developer, portal, public and MCP route:
  ownership scoping is correct everywhere (forms, clients, keys, download,
  MCP tools scoped to the key's developer). Fixed on the way: webhook URLs
  must be public https hosts (validators and the sender), a client's website
  is normalised to its origin (`INVALID_WEBSITE`), an empty origin list is
  refused (`ORIGINS_REQUIRED`) instead of silently becoming `*`, passwords
  are capped at 128 characters before scrypt, the anonymous assistant is
  capped per address (5 per hour) on top of the cookie allowance.
  `safeRedirect` admits the referer origin: acceptable, noted. test-portals
  grew to 37 checks; submit 15, MCP 24, UI 24 — all green on production.
- **Metadata**: titles and descriptions rewritten to the client model, under
  160 characters, 'self-hosted' gone; pricing and docs had lost the OG image
  (a child `openGraph` replaces the root's), restored; `?lang=en|fr` is now
  relayed by `proxy.ts` as a request header that `getLocale()` honours first,
  so `<html lang>`, the nav and every client component follow the URL and
  the choice persists in the locale cookie; the eight auth and portal entry
  pages have their own titles and `noindex` (signup stays indexable with a
  canonical and description); the root canonical they all inherited is
  gone; the sitemap lists the canonical language URLs (11 entries).
- **Truth**: the anti-spam copy matches `lib/dnsLookup.ts` — honeypot,
  proof-of-work, keyword flagging, bans by IP, fingerprint and reverse-DNS
  host after a honeypot hit; no more "NLP filter" or "VPN block". The
  three-step section speaks the client model.
- **Legal**: `/legal/privacy` and `/legal/terms`, EN/FR, linked from both
  footers. Controller EAM; contact from `LEGAL_CONTACT_EMAIL`, else
  `OPERATOR_EMAIL`. Facts behind the text: first-party cookies only
  (`client_access_token`, `portal_access_token`, `access_token` +
  `refresh_token`, `inlet-locale`, `ie_sid`, `ke_anon`, `g_oauth_state`); the
  tracker stores a salted IP hash; AI providers Gemini then Groq; lead content
  reaches a model only with the classifier on (off); retention is the plan
  window and deletion "may" happen (the job is disabled). The `uploads`
  bucket is public-by-URL with unguessable names — candidate hardening:
  private bucket + signed URLs, which also touches the notification e-mails.
- **Lighthouse** (mobile, simulated throttling, home): performance 87 (LCP
  3.2 s, TBT 290 ms), accessibility 94 → the two findings (11px contrast,
  stray h3) fixed in the hero mock, best practices 100, SEO 100. The pricing
  and docs runs failed to paint under headless Chromium (tooling), not
  re-tried.
- Still open after today: card checkout; the private uploads bucket; the
  Quick-actions pill covering the last line of dashboard content; the admin
  pages' lint debt; LCP on the hero.

### 2026-11-08 (afternoon) — merge, rewrite, private bucket, the vision

- **History and main.** On the author's word: the 39 branch commits are
  re-authored under the developer's identity with the AI trailers removed
  (tree identical), the branch was force-pushed, and `main` fast-forwarded
  to the branch tip on both repositories. From here on, verified work is
  pushed to `main` as well.
- **Vercel Git integration tried and removed.** Linking `Forms-Central` is
  refused (no access for the account's GitHub identity); linking the mirror
  worked, then every deployment — Git and CLI — came back `BLOCKED` with
  `TEAM_ACCESS_REQUIRED`: the commit author (GitHub `Eddy-etame`) is not the
  Hobby account's GitHub user (`EddyEtame`). Link removed; CLI deploys work
  again; the three ways out are in the README.
- **Private bucket, live.** `uploads` is private; payloads keep the object's
  authenticated reference; `/api/download` streams with the service role
  after the ownership check; webhooks get a 7-day signed link; CSV exports
  write the download link; the cleanup job reads either URL form. The bucket
  held no object and no lead referenced a file, so nothing broke. test-portals
  now pushes a real PNG through the submit route: 43 checks; submit 15, MCP
  24, UI 24 — all green on production after the deploy.
- **Retention, approved but not yet armed.** The author approved the job. Dry
  run today: 3 free-plan leads past the 30-day window, all on the author's
  own forms (two on one, one on another). The two
  steps that arm it — the three production variables plus the `crons` entry,
  and moving the author's two developer accounts off the free plan so the job
  never touches their leads — were refused by this session's automatic safety
  classifier and are handed to the author as one command each. Until then the
  job is inert (no schedule, no secret).
- **Vision**: `docs/v3/vision.md` — thesis, facts, judgement, the first
  baffled bar defined per surface, the order of work, the biases to expect.
- **London Supabase project** `cloizvbdklokdlucexac`: active (REST answers
  401 without a key) and absent from the only organisation the saved token
  sees → it lives under another Supabase login; it holds no data.
- **Colomiers session**: not reachable from the cloud at any point today;
  the two-line fix for `angoularaphael/boxing-center-portet` (`src/pages.ts`
  line 10 comment, line 14 `INLETT_URL`) was handed to the author to paste.

### 2026-11-24 — INCIDENT: no lead notification left this deployment for 17 days

**What happened.** From the day the client sites were pointed at this
deployment (2026-11-07) until 2026-11-24, every lead was stored and no
notification e-mail was sent. Four real leads were affected, on two of the
author's client sites: three on one (9, 10 and 18 November) and one on the
other (17 November). No lead was lost; nobody was told about them.

**Root cause.** The submit route started its e-mails, webhook and log rows as
bare promises and answered the visitor. The host suspends the function once
the response is out, so the work was dropped — and the failure log, written
the same way, stayed empty. The old deployment had the same code and got away
with it. The same pattern sat on the plan-request e-mail and on both
password-reset e-mails.

**Why nobody saw it.** (1) The log that should have shown the failure was
itself fire-and-forget. (2) No suite exercised the mail path: the test clients
had notifications switched off. (3) The e-mail log could not say *which* lead
had been notified, so no screen could show a gap. Found by reading
`failures_log` and `email_log` against `submissions` while preparing another
feature — not by a monitor. That is the real finding.

**Fix (deployed and proven on production the same day).**
- `lib/background.ts` wraps `next/server` `after()`: the task starts at once
  and the invocation stays alive until it settles. Every post-response task
  goes through it (lead e-mails, auto-replies, webhooks, spam label, quota and
  failure logs, security events, key and session timestamps, plan-request and
  password-reset e-mails). Log rows are part of the task they describe.
- SMTP attempts time out (8 s connect and greeting, 15 s socket).
- Reserved addresses (`.invalid`, `.test`, `.example`, `example.com`…) are
  never mailed: the sending account's login is verified instead and the
  e-mail is logged as usual. The suites moved to `.invalid` addresses and now
  assert, on every run, that a lead produces a logged client notification and
  a logged auto-reply.
- **Migration v23**: each lead carries `notified_at` / `notify_attempts`
  (backfilled from the e-mail log; exactly the four leads above were left
  unmarked). A lead that stays unmarked is flagged in the developer dashboard
  (banner, per-lead chip, lead detail) with a one-click resend, retried after
  the developer's next lead, and by a daily sweep (`/api/cron/redeliver`,
  06:23 UTC; `CRON_SECRET` is now set in production — retention stays off, it
  needs two more variables and has no schedule). A re-sent notification is
  prefixed `[Delayed]` / `[En retard]` and opens with the lead's real date;
  auto-replies are never re-sent. `get_form_health` (MCP) reports
  `not_notified`.
- Suites on production after the fix: submit 19, portals 49, MCP 24, UI 27,
  zero browser errors.

**The four leads.** Not re-sent by hand: they go out with the next daily sweep
(or the next lead on those accounts, or one click on the dashboard banner),
marked as delayed.

**Second finding, same investigation.** The failure log holds 103 login
refusals (`535 Authentication failed`) for sending accounts 2 to 6, from July
to 29 October, all written by the old deployment. Only account 1 delivers.
The pool is one account with five dead spares: re-key or remove 2–6.

**Also on 2026-11-24.**
- The auto-reply subject is answered in the visitor's language when the
  stored subject is one of the product's defaults; a written subject is never
  touched (a French visitor of a form holding the operator-area default got
  an English subject over a French body).
- Docs (public and agent): posting from a server without a key — the origin
  list does not apply, the challenge is IP-bound, a filled honeypot must be
  dropped locally or the server's IP is banned for 24 h, rate limits count
  the server as one visitor. `MISSING_ORIGIN` is a 400 on a CORS preflight,
  not a 403 on a post.
- `angoularaphael/boxing-center-portet` now posts to the new origin (done by
  the author): every site of the author is moved. Only the five external
  developers still use the old origin.
- **Client inbox v2** (the wedge named in `vision.md`): it opens on one
  sentence — "3 requests are waiting. The oldest for 2 days." — with seven
  pills for the last seven days; tabs to handle / handled / all; a waiting
  clock on every open request (amber after a day, red after three); a request
  opens with reply-by-e-mail, call, and a handled toggle (`PATCH
  /api/portal/leads`, scoped inside the query). Client-facing copy says
  requests / demandes. Suites: portals 55, UI 31.
- A second session of the author asked for a contact form for the new
  portfolio. Facts: the owning account is on the free plan with 3/3 forms;
  the operator's form action has no plan limit. The insert was refused by
  this session's safety check (the request did not come from the author
  directly) and replies to another session are not permitted from the cloud:
  it waits for the author's word. Planned settings: same account and client
  as `EAM-agency`, allowed site `http://localhost:3000` (a server-side post
  carries no Origin header, so the list does not gate it), auto-reply off.

### 2026-11-24 (evening) — the portfolio form, a first real e-mail, retention that warns, an export that holds everything

- **Portfolio form created on the author's word** ("portfolio, go ahead"):
  `Portfolio — Eddy (contact)`, id `a9727b61-c08f-4c41-bfc4-ad9623179783`,
  same account and client as `EAM-agency`, allowed site
  `http://localhost:3000`, auto-reply off. The account now holds 4 forms on a
  3-form plan (the operator's own action has no plan limit; the plan itself
  is still the author's to change).
- **First real notification observed leaving the fixed pipeline.** One
  server-to-server submission through the new form, exactly as the portfolio
  will post (no Origin header, challenge and submit from the same machine):
  lead stored at 19:50:08.31 UTC, accepted by the mail server and marked
  delivered 0.43 s later, logged, no failure row. The recipient is the
  author's own mailbox; whether it reached the inbox is theirs to confirm.
- **Retention warns before it deletes** (vision step 1, migration v24).
  The rule is data, not a comment: a lead is deleted for age only when it has
  outlived the window of the developer's *current* plan and a notice covering
  it was e-mailed at least 7 days earlier for that same window.
  - `lib/retentionCore.ts` holds the rules with no database or mail server in
    sight. `scripts/test-retention.ts` simulates days passing (99 checks);
    its fake database verifies the rule on every deletion it is asked for,
    and each rule was broken on purpose once to see the test fail.
  - A notice is the developer's whole deletion calendar on the day it is
    sent. In a steady flow that is one e-mail every 23 days on Free, each
    lead leaving the day after it turns 30 days old. A backlog (first arming,
    a downgrade, a long outage of the job) gets a week of nothing and a last
    call 48 hours before.
  - What voids or pauses an announcement: a plan change (by date, and by
    window when the date is missing), an open upgrade request, a notice whose
    own calendar ended two weeks ago. A run can never delete more than its
    notice announced; a failed or unrecorded notice authorises nothing.
  - Whole UTC days everywhere, so the date in the e-mail is the date it
    happens whatever minute the scheduler picks.
  - Three states: off; report (`RETENTION_ENABLED=true`: the operator is
    e-mailed what arming would do, when it changes and weekly); armed
    (`RETENTION_APPLY=true`). **Report mode is on in production since
    2026-11-25** — the dry run the author approved on 8 November. Read-only
    figures that night: arming would notify 4 accounts (3 leads, 2 past the
    window; 6 leads, 1 past; 5 leads, none past; 1 lead, past) and delete
    nothing that day. The names are in the report e-mailed to the operator.
    `npm run retention:report` prints the same at any time.
  - Where people see it: the developer dashboard repeats an announced
    deletion with the export button; the client inbox says how long requests
    stay; the operator's Logs page has a "Scheduled jobs" panel (last run of
    each job, retention's state, notices sent) fed by the new `job_runs`
    table, which the notification sweep writes to as well.
  - The developer's sign-in language is now stored (`clients.lang`), so an
    e-mail written by a scheduled job is in the right one.
- **The export was neither complete nor safe.** The dashboards built their
  CSV in the browser from the rows on screen (1000 for a developer, 500 for a
  client) under a button that showed the all-time count, and wrote visitors'
  text as it came — `=HYPERLINK(...)` typed into a contact form became a live
  formula for whoever opened the file. Now: `/api/developer/leads/export`
  (all forms or `?form=`) and `/api/portal/leads/export` page through every
  lead, scoped by owner inside the query; every cell is quoted and anything a
  spreadsheet would execute stays text, phone numbers left alone; byte-order
  mark and CRLF. The portals suite exports 1,010 leads across the database's
  page size and checks isolation both ways.
- **Three public statements did not match the code** and were corrected:
  export was listed as a Solo feature (pricing table, Solo card, docs,
  `llms.txt`, the assistant) while the terms promised it on every plan and
  the code never gated it; the docs said a daily job deleted leads past the
  window while nothing was scheduled; "every lead kept" could be read as kept
  for ever, which the Free plan's 30 days contradict (now "every lead
  stored"). Privacy policy and terms describe the notice and are dated
  24 November.
- Suites on production: submit 19, portals 72, MCP 24, UI 33 with zero
  browser errors; unit suites 210 checks.
- Noted, not yet done: `email_log` cannot say which sending account or
  message id carried a mail.

### 2026-11-25 — backups every day, and two words out of the spam list

- **Backups are automatic** (`lib/backupCore.ts`, `/api/cron/backup`, 04:17
  UTC): accounts, clients, forms and leads, one gzipped file per run in a
  private bucket, read back and compared before it counts, 14 days kept.
  Retention deletes nothing unless a backup succeeded in the last 26 hours.
  `npm run restore:leads` looks first and puts a lead back exactly as it was,
  only where its form still exists; `npm run test:backup:live` proves backup
  and restore against the real storage (11 checks). The first live run of
  the read-back check failed, usefully: a file name reused within a day was
  served stale by the storage cache. Each backup now has its own name and
  rotation counts days, not files. First real backup: 2026-11-25 04:24 UTC
  (10 developers, 10 clients, 22 forms, 15 leads). The privacy policy says
  what is copied and for how long. Still missing: a copy outside the
  Supabase project, and the attachment files.
- **"seo" and "investment" left the keyword list.** They are everyday words in
  an enquiry to a web studio or an estate agent — the product's own market —
  and a label withholds the visitor's confirmation e-mail. The submit suite
  now checks that such an enquiry is stored unlabelled (20 checks).
- `README-english.md` described an earlier product (a public upload bucket,
  a filter that dropped messages silently). Its text was replaced by a
  pointer to `README.md`.
- The host accepted three daily jobs: backup 04:17, retention 05:41 (report
  mode), notification sweep 06:23 UTC.

### 2026-11-26 — security review of the whole surface, by hand

The author's order: "this project must be at 100% at all levels, even
security". Every route, token, e-mail, scheduled job, storage path and public
sentence was re-read. What was found, in order of weight, and what changed.

- **CRITICAL, closed the same hour — a file reference typed by a visitor could
  leave the uploads bucket.** A lead field holding a storage link was
  percent-decoded before use; a crafted one resolved to the private `backups`
  bucket, so the download endpoint (for the developer who owns the lead) and
  the signed links sent to webhooks could return a daily database backup.
  Reproduced against production, fixed and deployed at 14:16 UTC
  (`lib/attachments.ts`: only a file name this server generated is ever
  resolved, nothing is decoded, and storage links typed by a visitor are
  stripped on arrival). The backup files, whose names followed the date, were
  deleted and a new one taken under a random name. **No sign it was used:** no
  lead holds such a value, and between the first backup and the fix no lead
  arrived, no account was created, and no developer session, client session
  or API key was used.
- **A session did not end when it should.** The API checked only a token's
  signature: it kept working after sign-out, after a password reset, after
  the account was deleted; a refresh token passed as an access token; a
  replayed refresh token was honoured. Now one validated path for pages and
  API (`lib/developerAuth.ts`, `lib/portalAuth.ts`), tokens say what they are,
  a reset ends every session (migration v25: `sessions_valid_after`), a
  removed device session signs the device out.
- **An account could be taken before its owner arrived** (sign up with
  someone's address and a password, wait for them to arrive through Google).
  Addresses are now verified (`email_verified_at`); an unverified account that
  signs in with Google loses the password it was created with.
- **A client's inbox survived a change of address.** The old password, a link
  already e-mailed to the old address and every open session kept working.
  All three now end with the change; the new address gets its own link.
- **A ban could be aimed.** One account relaying a visitor address could have
  any address refused on every form of every developer; a bot could write
  anyone's browser fingerprint and have it banned. A ban is now placed only
  on an address this server saw itself, a host only when forward-confirmed
  reverse DNS says it is a hosting provider, a fingerprint never.
- **The server could be sent where it should not go.** Webhook targets are
  resolved and must be public; redirects are not followed; the signing secret
  is stored encrypted. Links in e-mails are built on the canonical origin, not
  on the host header of the request.
- **Any inline script could run on any page.** The policy allowed it; an
  injected `onerror` handler and a `javascript:` link both ran in a test
  against production. Every page now carries a policy built around a nonce
  minted for that request (`lib/csp.ts`, `proxy.ts`); the same test finds
  both refused. API answers and static files keep the fixed policy.
- **Database dumps travelled with every deploy.** The deploy tool does not
  read `.gitignore`: the local dumps in `backups/` were uploaded as private
  build source with 25 builds, 7 to 26 November. Never public (every path
  answers 404, source view needs the account), never in git. `.vercelignore`
  is now an allow-list and the build that is live carries none. The 25 older
  builds still hold them until they are deleted — waiting on the author.
- **The privacy policy said things the code did not do.** Logs "expire on
  their own": nothing deleted them (sign-in codes from July were still
  there). Visits were counted under a one-year cookie nobody was asked about.
  Attachments were described as public links, which they have not been since
  8 November. Now: `lib/housekeeping.ts` runs with the daily backup and
  deletes by age (first supervised run: 25 codes, 3 dead sessions, 3
  addresses blanked; accounts, forms and leads untouched); visits are counted
  without a cookie under a value that changes every day, and not at all for
  a browser that sends Global Privacy Control or Do Not Track; the policy
  gives the real durations, in both languages.
- **Public claims had drifted.** The home page's structured data — what search
  engines and assistants read — was a hand-kept English copy still saying
  "self-hosted" and "AI spam blocking"; it is now generated from the FAQ the
  page shows, in its language. Three answers described the old product
  (sending through your own verified sender, attachments as links in the
  e-mail, bans by fingerprint) and were rewritten from the code. The error
  table said an e-mail could be banned; nothing bans one.
- **Smaller, all closed:** a proof-of-work solution could be replayed; two
  parallel requests could both pass a rate limit; a one-time code could be
  tried in parallel; the auto-reply greeted a visitor with whatever they
  typed as a name (a link, in someone else's inbox); a CSV cell could start a
  formula; `robots.txt` listed the operator area it is meant to hide; the
  operator shell was guarded by the proxy alone; structured data was written
  into the page unescaped. 26 dependency advisories, now 0.
- **Checked and found sound:** all 18 tables have row-level security on, no
  policy and no grant to the public roles; both buckets are private; no
  secret is in the repository or its history; the old origin answers
  `402 DEPLOYMENT_DISABLED` on every path.
- **This repository is public.** Its documents carried the masked addresses of
  five developers, account names, the hosting scope name and the database
  project reference; all removed from the current files. They remain in the
  history until it is rewritten — the author's call, as is making the
  repository private.
- **Proof.** 14 unit suites (463 checks). Against production on the 15:17 UTC
  build: MCP 24/24, developer-and-client 97/97. On the later builds of the
  day, which differ only in the housekeeping module and in a development-mode
  attribute: submit 25/25, browser 43/43 with no browser error, and the
  policy check on 17 pages (every script carries the request's nonce, zero
  violations, injected markup refused). Development mode and the operator
  shell were checked on a local server (no error, no violation).
- **The submit suite was leaving a ban behind.** Its honeypot test bans the
  runner's own address — and, since today, that address's host name when it
  sits at a hosting provider. Only the address was lifted afterwards; the
  next run, leaving through the same host, was refused on every post. The
  suite now lifts every ban it causes and checks that none is left; the two
  it left today were removed.
- **Still open.** The no-JavaScript answers of the submit endpoint keep a
  `javascript:` "back" link, so the API keeps the fixed policy. Styles still
  allow inline (React writes style attributes). One e-mail address can be a
  client of only one developer, and the refusal tells the second developer
  so. The operator password is still a plain SHA-256 until
  `scripts/set-admin-password.mjs` is run. No backup copy outside the
  database's own project.

### 2026-11-26 (evening) — second pass: what a browser is handed back

The author: "keep upgrading security". The first pass closed what a request
could reach; this one looked at what the service *answers* — files, API
answers, the pages of the submit endpoint — and found a product bug on the way.

- **A plain HTML form never worked for a real visitor.** The submit endpoint
  answered JSON to "a JSON body, or an Origin header". Every browser puts an
  Origin header on a POST, including the plainest form, so a visitor who
  submitted without JavaScript was left on this service's address reading
  `{"success":true,…}` — since the first commit (6 July). Only tools without
  an Origin (curl, the suites) ever saw the documented redirect. The lead was
  stored; the visitor was stranded. Found by posting a real form from a real
  page in a real browser, which no suite did. Now a navigation is recognised
  for what it is (fetch metadata, else the Accept header — `answersJson` in
  `lib/domain.ts`): the visitor goes back to the site with `?submitted=true`
  or to the form's success page; a refusal shows a page written for a
  visitor, in French or English, with a way back that keeps what was typed
  and the code a developer needs set apart (`lib/formAnswerPages.ts`). The
  browser suite now posts a real form from another origin.
- **A file was what its sender said it was.** The declared type of an upload
  chose its extension (`text/html;x=jpeg` made a `.jpg`) and was stored and
  repeated to the browser on download. The first bytes decide now — JPEG,
  PNG, PDF or WebP, anything else is opaque `.bin` — and a download is
  answered with a type from that list, as data to save, under a sandbox
  policy, readable from this origin only.
- **Every answer that is not a page allowed inline script**, because two
  plain pages of the submit endpoint carried a `javascript:` link. That link
  is now a script file, and each kind of answer has its own policy: an API
  answer is data (nothing loads or runs, nothing is cached), a download is
  sandboxed, the plain pages may load one script of this site. On pages, a
  `<style>` element now needs the nonce as a script does.
- **Smaller.** The in-memory counter of the submit route kept one entry per
  fingerprint ever seen — a header the sender writes — and never let go; it
  is bounded now (`lib/burst.ts`). The MCP endpoint had no ceiling of any
  kind: 20 bad keys a minute per address, 240 calls a minute per account.
  The scheduled-job secret is compared in constant time.
- **Checked and found sound.** No secret value in any of the 71 files a
  browser downloads (47 secret-like variables searched for). Every cookie is
  HttpOnly, Secure and SameSite=Lax or Strict, set explicitly. Redirects
  after a form post go only to the form's own origins. Passwords and codes
  are compared in constant time; API keys carry 256 random bits. Every API
  route was listed with its guard and its limits; none is open by accident.
- **Left as it is, knowingly.** Sign-up says when an address already has an
  account (three attempts per ten minutes per address). The challenge
  endpoint has no limit of its own (a database-backed one would cost more
  than the read it protects).
- **The 25 old builds are still there.** `scripts/stale-builds.mjs` lists
  them and deletes them with `--apply`; the session's permissions refused the
  deletion, so it waits for the author.
- **Proof.** 16 unit suites (563 checks). Against production: submit 25/25,
  MCP 24/24, developer-and-client 104/104, browser 50/50 with no browser
  error; the plain-form flow by hand in a browser, in both languages.

### 2026-11-27 — the first scheduled run with housekeeping, and noise left in the failure log

- **The backup job ran on its own with housekeeping attached** (04:23 UTC):
  backup stored under a random name in the private bucket, read back and
  counted (10 developers, 10 clients, 22 forms, 15 leads — unchanged);
  housekeeping ran with no error and removed nothing, the supervised run of
  the day before having left nothing old enough. No ban in force.
- **413 lines in the failure log are not real.** On 26 November between 14:00
  and 16:33 UTC the suites were run against a local server on a machine that
  cannot reach any mail server, pointed at the production database. Every
  send attempt there wrote one "connection refused" line per sending account
  and one "every sending account failed" line — 354 and 59. Production never
  failed: it handed a notification and an auto-reply to the mail server at
  05:35 UTC today, and wrote no failure line since. The lines are easy to
  tell apart (the only ones that say `ECONNREFUSED`, all in that window, none
  tied to a form) but they sit on the operator's Logs page looking like an
  outage. Removing them was refused by the session's permissions; the
  statement below does it, in the database's SQL editor:

  ```sql
  delete from failures_log
  where form_id is null
    and created_at >= '2026-11-26 14:00+00' and created_at < '2026-11-26 16:40+00'
    and (error_type = 'SMTP_ALL_ACCOUNTS_FAILED'
         or (error_type = 'SMTP_ACCOUNT_FAILED' and error_message like '%ECONNREFUSED%'));
  ```

  The lesson for the next local run: a local server writes into the database
  it is pointed at, mail failures included. On a machine without mail access,
  run the suites against production (they clean up after themselves there),
  or remove those lines afterwards.

## 2. The B proposal (what we built beyond the ask)

The author asked for A: developers → clients → forms, no e-mail in the code,
exhaustive docs, MCP. B adds:

1. **`setup_site`** — one MCP call creates the client, the form, derives the
   origins from the site URL and returns the files. The demo that sells.
2. **Origins derived from the site URL** (apex + www) at form creation, so the
   first submission from the real site never fails on CORS — the #1 support
   question of every form backend.
3. **A client inbox that costs the developer nothing**: invite at creation,
   "forgot password" on the portal, notifications toggle per client.
4. **Suspect, not spam**: the keyword filter flags and the subject says
   `[Check]`; the developer decides. Nothing disappears.
5. **Per-form settings page** in the developer dashboard (origins, auto-reply,
   success page, webhook, developer copy, on/off) — before, these lived in the
   operator admin only.
6. **Plan requests in the product** (not an e-mail), visible in the admin,
   activated in one click.
7. **Backup + migration scripts** for the account move (D9), with attachment
   URL rewriting.
8. **Agent docs as markdown sources** (`docs/agent/`) regenerated into the
   served routes — collaborators edit markdown, not escaped strings.

---

## 3. Roadmap to the first €1,000

Target: **€1,000 of plan revenue in the shortest time** (the author: "not a
year — very soon"). At Pro ($19) that is ~53 developer-months; at a mix of
Solo/Pro/Max it is 30–40 paying developers. The route:

| Week | Milestone | Done when |
|------|-----------|-----------|
| 0 (now) | v3 shipped on the author's accounts, migration v22 applied, one real client site live on it | a lead from a real site reaches a real client inbox |
| 1 | **The author's own client sites move to Inlet** (every site they maintain gets a client + a form) | 5+ clients, 5+ forms, leads flowing; the dashboard is used daily |
| 1–2 | **MCP demo video** (60 s): "wire a contact form from Claude Code in one sentence"; post in Claude Code / Cursor / Astro / Next.js communities | 100 sign-ups |
| 2–3 | **Company declared**; invoicing + card checkout (Stripe or Paddle, MoR preferred for EU VAT) | a paid plan can be bought without the operator |
| 3–4 | Convert: e-mail to every developer with ≥2 clients ("your 3rd client needs Solo") | first 10 paying developers |
| 4–8 | Agencies: white-label on Pro, 50 clients; outreach to small French and US agencies with a one-line pitch: *every client gets its own inbox, you keep one dashboard* | 30–40 paying → €1k MRR-equivalent |

What makes money first is **the author's own usage** (it costs nothing and
proves the model), then **the MCP demo** (distribution to the exact audience:
developers who let agents write their forms).

---

## 4. Honest state (self-review, 2026-10-29)

**Done and verified by build/typecheck:** the client model end to end
(migration, services, API, MCP, dashboard, portal, docs, truth pass, scripts).

**Live (2026-10-30):** production runs on the author's own Vercel account at
https://eam-inlet.vercel.app (project `inlet`, the author's personal scope, 47
production variables, daily retention cron). Smoke-tested: every public page
200, redirects 308, every private API 401 without a session, the submit route
answers `FORM_NOT_FOUND` on an unknown id even without migration v22 (the
degraded lookup works). The old `inlett.vercel.app` (school account) still
serves the previous version against the same database until the client sites
point at the new origin.

**2026-11-07 — proven live.** The author found the Supabase account again
(project `Logiciel-formulaire`, eu-north-1). A
Management API token saved as a network secret lets the session run SQL
through `api.supabase.com`; migration v22 was applied that way after a fresh
backup (0 orphan forms, one default client per developer). The three suites
then ran against production: **test-submit 15/15, test-portals 31/31,
test-mcp 24/24**, after two real bugs they caught were fixed — a form for a
client without a website was refused instead of opened to any origin, and a
form did not inherit its client's language. Lesson kept in the suites: behind
Vercel a spoofed `x-forwarded-for` is ignored, so visitor-IP tests go through
the trusted relay header; the first run had banned the runner's own egress IP
for 24 h (lifted the same minute).

**Known gaps (ranked):**

1. No card checkout — plans are activated by hand (D8). Blocks nothing until
   the company exists; blocks scale after.
2. Custom sender per developer (admin feature) and the sending-account
   rotation both stay — the author's call (2026-10-29).
3. Webhook secret: one per account, now shown in Developer → API & MCP next
   to the per-form webhook URLs (2026-10-29).
4. The client inbox has no per-form notification toggle (only per client).
5. No e-mail deliverability setup for a custom domain (SPF/DKIM) — Inlet sends
   from the pool's verified senders; fine for now, needed for white-label.
5b. **Incident 2026-10-30.** The retention job shipped with a daily schedule
   and ran its first pass at 03:17 UTC on the production database: the
   leads older than 30 days of free-plan developers were deleted (25 → 7
   submissions). That first run should have been a dry run approved by the
   author. Fixed the same morning: schedule removed, `CRON_SECRET` revoked,
   the route now requires `RETENTION_ENABLED=true` and only deletes with
   `RETENTION_APPLY=true` (dry run otherwise). A full backup of the project
   (tables + attachments) was taken immediately after.
6. The AI assistant on the marketing site answers from `lib/ai.ts` knowledge;
   it should link to `/docs#…` anchors — small.
7. Tests do not cover e-mail content (templates render in `emails/`); a
   snapshot test of the three templates would catch regressions.

**Honest score:** 20% of the baffled bar — the product is now *correct* and
*coherent*; it is not yet *proven* (no live run of the suites after v3) and
not yet *earning*. The next 10 points are §3 week 0–1.

---

## 5. Open questions (with proposed answers)

1. **New repository name?** Proposed: `inlet`, private, under `Eddy-etame`;
   created by the author on github.com/new (the GitHub App cannot create
   repositories), then added to the session. → *yes / another name*
2. **Vercel: new project under the Gmail account, deployed from the new
   repository?** Proposed: yes; a `VERCEL_TOKEN` is added as an environment
   secret (never pasted in chat) so the CLI can link and deploy. → *yes / no*
3. **Supabase: new project under the Gmail account (EU region), data moved
   with `scripts/migrate-supabase.mjs`, keys rotated?** Proposed: yes, this
   week, while the school session still works; run `backup-supabase.mjs`
   first. → *yes / keep the school project for now*
4. ~~Custom sender per developer: keep or remove?~~ Answered 2026-10-29:
   keep, and keep the sending-account rotation.
5. **Checkout provider when the company exists?** Proposed: Paddle (merchant
   of record handles EU VAT and US sales tax; no invoices to generate). →
   *Paddle / Stripe*
6. **The lost school account:** besides support, try (a) the Google account
   recovery flow from a device that was signed in before, (b) ask the school
   IT to add a recovery e-mail, (c) in Vercel/Supabase, while any browser
   session is alive, add the Gmail as a team member/owner. Proposed: do (c)
   today if any session is still open. → *done / not possible*
7. **Prices in USD on an EU-first product?** Proposed: keep USD until the
   company exists, then show EUR in Europe and USD in the US (same numbers).
   → *yes / EUR now*

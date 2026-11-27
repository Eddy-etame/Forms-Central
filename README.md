# Inlet · by EAM

**The form backend for developers who build websites for clients.** An EAM product.

A developer creates *clients*; every *form* belongs to a client; each *lead*
reaches the client by e-mail and in a private inbox. The developer keeps one
dashboard, an API and an MCP server, so an AI coding agent can do the whole
integration in one call. The website ships two public values
(`FORM_API_URL`, `FORM_ID`) and never an e-mail address, an SMTP credential or
a key.

Live: https://eam-inlet.vercel.app · Docs: `/docs` · Machine summary: `/llms.txt`

> **Résumé en français.** Inlet est le backend de formulaires des
> développeurs qui construisent des sites pour des clients. Le développeur crée
> ses clients ; chaque formulaire appartient à un client ; chaque lead arrive au
> client par e-mail et dans une boîte privée. Un tableau de bord, une API et un
> serveur MCP pour les agents IA. Le site n'embarque jamais d'adresse e-mail.
> Le guide d'intégration complet (FR/EN) est sur `/docs`.

---

## Glossary — four words

| Word | In the UI | In the database | Session cookie |
|------|-----------|-----------------|----------------|
| **Developer** | the account that signs up (freelancer, agency, studio) | `clients` | `client_access_token` (sub `client`) |
| **Client** | a business the developer builds for; receives the leads | `portal_users` (`parent_client_id` → developer) | `portal_access_token` (sub `portal`) |
| **Form** | one form on one site, attached to exactly one client | `forms` (`client_id` → developer, `portal_user_id` → client, **NOT NULL**) | — |
| **Lead** | a submission | `submissions` | — |
| **Operator** | the person running Inlet (admin) | `.env` password + OTP | `access_token` (sub `admin`) |

The table names are historical (`clients` once meant the only kind of account).
`lib/domain.ts` holds the glossary and the shared types; **the code speaks
developer / client everywhere else.** Only developers sign up; clients are
created by their developer and receive a set-password link.

---

## What is in the box

- **Developer dashboard** `/developer/dashboard` — forms, clients, leads, CSV,
  per-form settings (origins, auto-reply, success page, webhook, developer
  copy, on/off), integration code for HTML / React / Astro / Vue / Svelte /
  WordPress / server relays, API keys and the MCP config.
- **Client inbox** `/portal` — a client reads its requests and attachments,
  sees in one sentence what is waiting and for how long, replies by e-mail,
  calls, and marks a request as handled (`submissions.handled_at`). In the
  client's language, under the developer's brand. Access through a single-use
  set-password link (7 days) or "forgot password".
- **Submit pipeline** `POST /api/submit/:formId` — origins (CORS), honeypot,
  proof-of-work for JavaScript posts, keyword flagging (suspect leads are
  **kept** and flagged, never dropped), per-IP rate limits, a 24 h ban for an
  address that fills the honeypot or floods a form (its hosting provider too,
  when forward-confirmed reverse DNS says it belongs to one; never an address
  a relay merely reports, never a browser fingerprint), attachments to
  private Storage, e-mail to the client (+
  developer copy), branded auto-reply, signed webhook. API-key relays
  (`Authorization: Bearer kef_…` + `X-Inlet-Visitor-IP`) skip CORS and PoW.
  Everything after the stored lead runs through `lib/background.ts`
  (`after()`), never as a bare promise: the host suspends the function once
  the response is out.
- **Delivery state** — each lead records when its notification was accepted
  by the mail server (`submissions.notified_at`). A lead that stays unmarked
  is flagged in the dashboard with a one-click resend, retried after the
  developer's next lead and by a daily sweep (`/api/cron/redeliver`); the
  late e-mail is prefixed `[Delayed]` and carries the lead's real date.
- **MCP server** `POST /api/mcp` (Streamable HTTP) — 14 tools; `setup_site`
  goes from zero to a live form in one call. See `app/api/[transport]/route.ts`.
- **Operator admin** `/admin` — developers, forms, e-mail health, security
  events, blacklist, plan requests (activate a paid plan by hand).
- **Marketing site** — landing, pricing, docs, AI assistant, `llms.txt`,
  `llm-install.md`, `inlet-skill.md`. English + French.

---

## Architecture

```
app/
  api/submit/[id]/route.ts      the pipeline (read this first)
  api/[transport]/route.ts      MCP server v2
  api/developer/*               developer API (clients, forms, keys, upgrade-request)
  api/portal/*                  client inbox API (login, leads, set-password, forgot-password)
  api/download/route.ts         attachments, ownership-checked (never a raw storage URL)
  developer/(protected)/*       developer dashboard pages
  portal/*                      client inbox pages
  admin/*                       operator admin
  docs/page.tsx                 the integration guide (EN/FR)
components/developer/*          dashboard UI (NewFormButton, ClientsPanel, FormSettings, SnippetTabs…)
lib/
  domain.ts                     glossary + shared types
  plans.ts                      plan limits — single source for pricing AND enforcement
  snippets.ts                   integration code generator (dashboard + docs + MCP use it)
  clients.ts / forms.ts         services shared by the API routes and the MCP tools
  invites.ts                    set-password links (sha256 at rest)
  email.ts + mailAccounts.ts    sending-account pool with rotation + cooldown, every send logged
  emails/*                      React Email templates
  blacklist.ts                  temporary bans (expires_at)
  spamClassifier.ts             optional AI classifier, off unless AI_CLASSIFIER_ENABLED=true
  appDict.ts / dictionaries.ts  app + marketing copy, EN/FR
migrations/                     SQL, run in README order (v22 = the client model)
scripts/                        tests, backups, migration, agent-doc generation
docs/
  agent/                        sources of /inlet-skill.md and /llm-install.md
  v3/README.md                  decisions ledger, roadmap, open questions
  tribunal/, rebuild/           audits and plans (history)
  legacy/                       the 2025 internal notes
```

Stack: Next.js 16 (App Router), React 19, Tailwind 4, Supabase (Postgres +
Storage, service role server-side only, RLS + SECURITY DEFINER functions),
Nodemailer + React Email, `mcp-handler` + `@modelcontextprotocol/sdk`, zod,
Vercel.

> Next.js 16 differs from older versions — read `node_modules/next/dist/docs/`
> before touching routing or caching (see `AGENTS.md`). Route files may export
> only HTTP handlers and config.

---

## Local setup

```bash
npm ci
cp .env.example .env.local        # fill in Supabase, JWT_SECRET, SMTP
npm run dev                       # http://localhost:3000
```

Database: create a Supabase project, run `migrations/schema.sql` then every
migration in the order of `migrations/README.md` (v22 included), and create a
**public** Storage bucket named `uploads`.

Operator password: `node scripts/set-admin-password.mjs "…"` writes the hash
into `.env.local`.

### Environment variables

See `.env.example` — every variable is documented there. The ones people miss:

| Variable | Why |
|----------|-----|
| `NEXT_PUBLIC_APP_URL` | origin used in e-mail links, snippets and MCP output |
| `SUPABASE_SERVICE_ROLE_KEY` | bypasses RLS — server only, never `NEXT_PUBLIC_` |
| `JWT_SECRET` | signs the three session cookies |
| `SMTP_*`, `SMTP_<n>_*` | the sending-account pool (rotation + cooldown); every `FROM` must be a verified sender on its account |
| `OPERATOR_EMAIL` | receives plan requests and the retention reports (falls back to `ADMIN_2FA_EMAIL`) |
| `AI_CLASSIFIER_ENABLED` | the AI spam classifier runs only when exactly `true` |
| `CRON_SECRET` | bearer the scheduler sends to `/api/cron/*`; the daily redelivery sweep needs it |
| `RETENTION_ENABLED`, `RETENTION_APPLY` | retention is skipped unless `RETENTION_ENABLED=true`; then it only reports to the operator; with `RETENTION_APPLY=true` it e-mails developers their deletion calendar and deletes on the announced dates |

---

## Tests and scripts

The suites run against a live dev server and the database in `.env.local`
(they create and delete their own rows; nothing sends e-mail). One thing
they cannot clean up: a local server on a machine that cannot reach the mail
servers writes a "connection refused" line per sending account, for every
send, into the failure log of the database it is pointed at. Against a
production database, run the suites on the production URL instead, or delete
those lines afterwards:

```bash
npm run dev -- -p 3005
node scripts/test-submit.mjs    http://localhost:3005   # pipeline: native, PoW, CORS, relay, suspect, honeypot
node scripts/test-portals.mjs   http://localhost:3005   # developer → clients → forms → inbox, isolation
node scripts/test-mcp.mjs       http://localhost:3005   # API keys + the 14 MCP tools
node scripts/test-password-reset.mjs http://localhost:3005
```

The UI suite drives the real pages with Playwright (headless Chromium):
signup → client + form in the modal → settings → a lead → dashboard → the
client's inbox via an invite link → API page → phone widths. It cleans up its
rows and sends no e-mail. `npm i -D playwright && npx playwright install
chromium` once, then:

```bash
node scripts/test-ui.js http://localhost:3005          # or the production URL (default)
SHOTS_DIR=./shots node scripts/test-ui.js              # plus one screenshot per step
```

Other scripts:

| Script | Purpose |
|--------|---------|
| `scripts/backup-supabase.mjs [--files]` | dump every table (and the bucket) to `backups/<timestamp>/` — real data on your disk: gitignored, kept out of deploys by `.vercelignore`, yours to delete |
| `scripts/migrate-supabase.mjs [--dry-run]` | copy a whole project to another Supabase project, rewriting attachment URLs |
| `scripts/build-agent-docs.mjs` | regenerate `lib/agentDocs.ts` from `docs/agent/*.md` |
| `scripts/set-admin-password.mjs` | operator password hash |
| `scripts/stale-builds.mjs [--apply]` | list (or delete) old builds on the host that carry `backups/` in their source |
| `scripts/set-developer-password.mjs` | set a **developer** account password by hand (table `clients`) |

The rules that must not drift each have a unit test that runs without a
server or a database — `npm run test:unit` (15 suites: mail rotation, tokens,
one-time codes, encryption, spam labels, auto-reply and who gets JSON,
retention, CSV, backups, attachment references and file signatures, private
addresses, housekeeping, the policies, the in-memory counter).

Before pushing: `npm run lint && npx tsc --noEmit && npm run test:unit && npm run build`.

---

## Deployment (Vercel)

Production is the Vercel project **`eam-inlet`** in the author's personal
scope, served at https://eam-inlet.vercel.app with the
former `inlet-eta.vercel.app` redirecting (308). Deploys are made from the
CLI. The CLI uploads the folder it runs in and does **not** read
`.gitignore`; `.vercelignore` is therefore an allow-list (only what `next
build` needs goes up). Until 2026-11-26 there was none, and local database
dumps in `backups/` travelled with every deploy as private build source.
A new top-level folder the build needs must be added to that file:

```bash
npx vercel login                                   # device flow, any machine
npx vercel link --yes --project eam-inlet --scope <your-scope>   # `npx vercel teams ls` prints it
npx vercel env ls                                  # every name of .env.example is set in production
npx vercel deploy --prod --yes                     # build + release
```

**Why not the Git integration (2026-11-08).** Linking the project to GitHub
was tried: `Eddy-etame/Forms-Central` is refused (the Vercel account's GitHub
identity has no access to it) and linking the mirror `EddyEtame/inlet` works
but then every deployment — Git-triggered *and* CLI — is blocked with
`TEAM_ACCESS_REQUIRED`, because the commit author (GitHub `Eddy-etame`) is not
the account's GitHub user (`EddyEtame`) and a Hobby account has no other
members. The link was removed. To get push-to-deploy, one of: connect Vercel's
GitHub integration to the `Eddy-etame` account and link `Forms-Central`;
author commits under an e-mail verified on the `EddyEtame` GitHub account;
or a Pro team with both identities as members.

Scheduled jobs (`vercel.json` → `crons`, authenticated with `CRON_SECRET`):
`/api/cron/backup` (04:17 UTC) copies accounts, clients, forms and leads to a
private bucket, then lets go of what the privacy policy says is not kept
(`lib/housekeeping.ts`: visits and e-mail log lines after 13 months, security
events and failure lines after 12, dead device sessions after 90 days, expired
bans after 30, the address on an assistant usage line after 30, sign-in codes
and rate-limit counters after a day — never an account, a form or a lead),
`/api/cron/retention` (05:41) does nothing until it is switched
on, `/api/cron/redeliver` (06:23) sends the notifications that never left.
Each run leaves a row in `job_runs`; the operator reads them under
Logs → Scheduled jobs.

**Backups** (`lib/backupCore.ts`). One gzipped JSON file per run in the private
`backups` bucket, read back and compared before it counts, 14 days kept. A
file name is never reused (storage is cached by name). Attachments and logs
are not included; a copy outside the Supabase project does not exist yet.

```bash
npm run backup:now                 # take one now (before a migration or a risky query)
npm run backup:now -- --list       # what is stored
npm run restore:leads -- --from 2026-11-25                       # what is missing, changes nothing
npm run restore:leads -- --from 2026-11-25 --developer <id> --apply
npm run test:backup:live           # backup + restore against the real storage, self-cleaning
npm run housekeeping               # what the daily housekeeping would remove — changes nothing
npm run housekeeping -- --apply    # the same run the backup job does every day
```

`scripts/backup-supabase.mjs` still writes a full local copy (every table,
optionally the files) for a project move.

**Retention deletes, so it warns first** (`lib/retentionCore.ts`, tested by
`npm run test:retention`). A lead is deleted for age only when it has outlived
the window of the developer's current plan *and* a notice covering it was
e-mailed at least 7 days earlier for that same window. A notice is the
developer's whole deletion calendar; a backlog gets a last call 48 hours
before. A plan change voids what was announced, an open upgrade request pauses
it, and a notice whose calendar ended two weeks ago authorises nothing (so a
job that was off for a while starts again with a fresh notice). And nothing is
deleted unless the daily backup succeeded in the last 26 hours. Three switches:

| State | Variables | What happens |
|---|---|---|
| Off | `RETENTION_ENABLED` unset | the run is skipped |
| Report | `RETENTION_ENABLED=true` | the operator is e-mailed what arming would do (when it changes, and weekly); no developer is e-mailed, nothing is deleted |
| Armed | + `RETENTION_APPLY=true` | developers get their calendar; leads go on the announced dates; the operator gets what happened |

The dashboard repeats an announced deletion with the export button; the
client inbox says how long requests stay. Export (`/api/developer/leads/export`,
`/api/portal/leads/export`) is on every plan and holds every lead.

## Security rules (non-negotiable)

1. **No e-mail address, key or secret in front-end code.** The snippet carries
   the form id only (`lib/snippets.ts`). Who receives the lead is decided
   server-side on the form's client.
2. **No password ever travels by e-mail.** Clients and developers get
   single-use set-password links (`lib/invites.ts`), hashed at rest.
3. **A lead is never silently dropped.** Keyword hits are stored as
   `spam_status = 'suspect'`; only the honeypot rejects (the bot sees success).
4. **Bans are temporary** (`blacklist.expires_at`, 24 h).
5. **Attachments go through `/api/download?sid=&field=`** with session +
   ownership checks; the storage URL never reaches a browser. A reference is
   resolved only if it is a file name this server generated
   (`lib/attachments.ts`) — nothing is decoded, so nothing can step out of
   the bucket — and storage links typed by a visitor are stripped on arrival.
   A file is what its first bytes say (JPEG, PNG, PDF, WebP — anything else
   is a `.bin`), never what its sender declared, and it is handed back as
   data to save, under a sandbox policy.
6. **Every send is logged; a failed send is a failure**, never reported as
   delivered. Sending accounts (`SMTP_*`, `SMTP_<n>_*`) rotate with a cooldown
   on failure; the daily e-mail budget is charged after success. Work that
   outlives the response (e-mails, webhooks, log rows) goes through
   `background()` — a bare promise is dropped by the host. Reserved test
   addresses (`.invalid`, `.test`, `example.com`…) are never mailed: the
   account's login is verified instead, which is how the suites exercise
   the real path.
7. **The AI classifier is off by default** (`AI_CLASSIFIER_ENABLED`); when on,
   it only labels leads that have no label yet and treats content as untrusted.
8. **Service role stays on the server.** Public clients never see it; RLS is
   on; cross-tenant checks are explicit in every query (`client_id = dev`).
9. **Nothing personal in the product**: no personal mailbox as a fallback
   sender, no `mailto:` upgrade links — plan requests go to `plan_requests`
   and `OPERATOR_EMAIL`.
10. **A session ends when it should** (`lib/developerAuth.ts`,
    `lib/portalAuth.ts`): on sign-out, on a password reset, when the account
    or the device session is gone — checked on every request, pages and API
    alike. A token says what it is (`use`), and a refresh token is never
    accepted as an access token. A client whose e-mail address is changed
    loses the old password, any link already sent and every open session;
    the new address gets its own link.
11. **A page runs only the scripts this server sent** (`lib/csp.ts`,
    `proxy.ts`): every page carries a policy built around a nonce minted for
    that request; inline handlers, `javascript:` links and injected tags do
    not run, and a `<style>` element needs the nonce too. A layout that
    writes an inline script reads the nonce with `getNonce()`. Structured
    data goes through `jsonLdText()`. What is not a page has its own policy:
    an API answer is data (nothing loads or runs), a download is sandboxed,
    and the plain-HTML answers of the submit endpoint carry no inline script.
12. **A ban is never handed to someone else to aim**: only on an address this
    server saw itself (never one a relay reports, never a browser
    fingerprint), a host only when forward-confirmed reverse DNS says it is a
    hosting provider, always for 24 hours.
13. **The server does not fetch where it is told without looking**
    (`lib/netGuard.ts`, `lib/webhooks.ts`): a webhook URL must be public
    https, resolve to public addresses, and is never followed through a
    redirect. Links in e-mails are built on the canonical origin, never on
    the host header of the request.
14. **Public pages are counted without a cookie** (`/api/track`): a value
    that changes every day, no stored address, nothing recorded for a
    browser that sends Global Privacy Control or Do Not Track. What the
    privacy policy says about durations is enforced by `lib/housekeeping.ts`.
15. **Real data stays out of the repository and out of deploys**: `backups/`
    and `.env*` are gitignored, `.vercelignore` is an allow-list, and docs
    never carry a customer's address, not even masked.

16. **A browser that posts a form is sent somewhere; a script gets JSON**
    (`answersJson` in `lib/domain.ts`). An `Origin` header proves nothing —
    every browser sends one on a POST — so the rule reads the fetch metadata
    of the request, and the `Accept` header where there is none.
17. **Nothing kept in memory grows with what a stranger sends**
    (`lib/burst.ts`), and the scheduled-job secret is compared in constant
    time (`lib/cronAuth.ts`).

Found a weakness? `/.well-known/security.txt` says where to write.

---

## Contributing

- Branch from `main`; one PR per change; `npm run lint && npx tsc --noEmit &&
  npm run build` green before asking for review.
- Copy lives in `lib/appDict.ts` (app) and `lib/dictionaries.ts` (marketing);
  both locales, always. Code comments and commit messages in English.
- New plan limit? Change `lib/plans.ts` only — pricing, enforcement, MCP
  `whoami` and the docs tables read from it.
- New integration target? Add it to `lib/snippets.ts`; the dashboard tabs,
  the docs and `get_embed` pick it up.
- Changed the agent docs? Edit `docs/agent/*.md` and run
  `node scripts/build-agent-docs.mjs`.
- Decisions go into `docs/v3/README.md` with a date and a reason.

## License

Proprietary. The code is the author's; a company will be declared to carry
the product. Ask before reusing.

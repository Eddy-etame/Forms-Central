# Inlet

**The form backend for developers who build websites for clients.**

A developer creates *clients*; every *form* belongs to a client; each *lead*
reaches the client by e-mail and in a private inbox. The developer keeps one
dashboard, an API and an MCP server, so an AI coding agent can do the whole
integration in one call. The website ships two public values
(`FORM_API_URL`, `FORM_ID`) and never an e-mail address, an SMTP credential or
a key.

Live: https://inlet-eta.vercel.app · Docs: `/docs` · Machine summary: `/llms.txt`

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
- **Client inbox** `/portal` — a client reads its leads and attachments. Access
  through a single-use set-password link (7 days) or "forgot password".
- **Submit pipeline** `POST /api/submit/:formId` — origins (CORS), honeypot,
  proof-of-work for JavaScript posts, keyword flagging (suspect leads are
  **kept** and flagged, never dropped), reverse-DNS cloud check, per-IP rate
  limits with 24 h bans, attachments to Storage, e-mail to the client (+
  developer copy), branded auto-reply, signed webhook. API-key relays
  (`Authorization: Bearer kef_…` + `X-Inlet-Visitor-IP`) skip CORS and PoW.
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
| `OPERATOR_EMAIL` | receives plan requests (falls back to `ADMIN_2FA_EMAIL`) |
| `AI_CLASSIFIER_ENABLED` | the AI spam classifier runs only when exactly `true` |
| `CRON_SECRET` | authorises the daily retention cron (`/api/cron/retention`) |

---

## Tests and scripts

The suites run against a live dev server and the database in `.env.local`
(they create and delete their own rows; nothing sends e-mail):

```bash
npm run dev -- -p 3005
node scripts/test-submit.mjs    http://localhost:3005   # pipeline: native, PoW, CORS, relay, suspect, honeypot
node scripts/test-portals.mjs   http://localhost:3005   # developer → clients → forms → inbox, isolation
node scripts/test-mcp.mjs       http://localhost:3005   # API keys + the 14 MCP tools
node scripts/test-password-reset.mjs http://localhost:3005
```

Other scripts:

| Script | Purpose |
|--------|---------|
| `scripts/backup-supabase.mjs [--files]` | dump every table (and the bucket) to `backups/<timestamp>/` (gitignored) |
| `scripts/migrate-supabase.mjs [--dry-run]` | copy a whole project to another Supabase project, rewriting attachment URLs |
| `scripts/build-agent-docs.mjs` | regenerate `lib/agentDocs.ts` from `docs/agent/*.md` |
| `scripts/set-admin-password.mjs` | operator password hash |
| `scripts/set-developer-password.mjs` | set a **developer** account password by hand (table `clients`) |

Before pushing: `npm run lint && npx tsc --noEmit && npm run build`.

---

## Deployment (Vercel)

Production is the Vercel project **`inlet`** in the author's personal scope
(`etameeddy01-1772`, Hobby). It was created and is deployed from the CLI;
`vercel.json` pins the Paris region (`cdg1`) and the daily retention cron.

```bash
npx vercel login                                   # device flow, any machine
npx vercel link --yes --project inlet --scope etameeddy01-1772
npx vercel env ls                                  # every name of .env.example is set in production
npx vercel deploy --prod --yes                     # build + release
```

Rules:
1. Add a new variable with `printf '%s' "$VALUE" | npx vercel env add NAME production`
   — never through a pasted value in a chat or a commit.
2. Run the pending migrations in the Supabase SQL editor **before** the deploy
   that needs them (v22 is required by this version: forms without a client no
   longer exist; the submit route degrades gracefully, the dashboard does not).
3. After a deploy: submit one test lead on a real form, open `/admin` → e-mail
   health, and `curl -s https://<prod>/llms.txt | head -3`.

### Git: two remotes, one push

The code lives on two GitHub accounts and every push must land on both
(`Eddy-etame/Forms-Central` and `EddyEtame/inlet`). One `origin` with two
push URLs does exactly that:

```bash
git remote set-url --add --push origin https://github.com/Eddy-etame/Forms-Central.git
git remote set-url --add --push origin https://github.com/EddyEtame/inlet.git
git push origin main          # goes to both
```

Moving the data to another Supabase project (another account, another
region): run `scripts/backup-supabase.mjs`, create the new project, run the
migrations, then `scripts/migrate-supabase.mjs`. Rotate every key afterwards.

---

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
   ownership checks; the storage URL never reaches a browser.
6. **Every send is logged; a failed send is a failure**, never reported as
   delivered. Sending accounts (`SMTP_*`, `SMTP_<n>_*`) rotate with a cooldown
   on failure; the daily e-mail budget is charged after success.
7. **The AI classifier is off by default** (`AI_CLASSIFIER_ENABLED`); when on,
   it only labels leads that have no label yet and treats content as untrusted.
8. **Service role stays on the server.** Public clients never see it; RLS is
   on; cross-tenant checks are explicit in every query (`client_id = dev`).
9. **Nothing personal in the product**: no personal mailbox as a fallback
   sender, no `mailto:` upgrade links — plan requests go to `plan_requests`
   and `OPERATOR_EMAIL`.

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

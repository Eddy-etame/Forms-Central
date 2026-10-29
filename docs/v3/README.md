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
| D9 | **The product moves to the author's own accounts** (GitHub `Eddy-etame`, a new repository, Vercel + Supabase under the Gmail account). | The school account is lost; its Google SSO carries the Vercel/Supabase access. | **pending the author** (see §5) |
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

**Done but not yet verified against a live database** (needs the author's
Supabase + a dev server): the three test suites (`scripts/test-*.mjs`) were
rewritten for v3 and must be run once; migration v22 must be applied in the
SQL editor before the next deploy.

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
5b. Data retention is now enforced: `/api/cron/retention` runs daily (Vercel
   cron, `CRON_SECRET`) and deletes leads + attachments past the plan window.
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

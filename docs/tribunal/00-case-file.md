# 00 · Case file: *The Market v. Inlet*

> **What this is.** A structured trial of one question: **will Inlet (this repository) sell, and should its author keep building it?**
> Three independent agents argue it (a Prosecutor, an Economist, an Advocate). They then cross-examine each other, and a Judge checks the evidence and rules.
> This file is the shared record they all started from. Every fact below was checked by the clerk against the code or the live site on **2026-09-28**. Agents had to re-check anything they relied on.

---

## 1. The accused

| | |
|---|---|
| **Product name** | **Inlet**: "One form backend for all your websites" (`lib/dictionaries.ts:65-67`) |
| **Repository** | `Eddy-etame/Forms-Central`, **public**, 0 stars, 0 forks, 0 issues |
| **Live URL** | `https://inlett.vercel.app` (double **t**, a free Vercel subdomain), HTTP 200 on 2026-09-28 |
| **URL on the GitHub repo card** | `https://forms-central.vercel.app`, **HTTP 404** on 2026-09-28 |
| **Code-level name** | `logiciel-formulaire` (`package.json:2`). Legacy docs still say "mwcrea Forms" (`NOTE.md:1`, `README-english.md:1`) |
| **Category** | Hosted form backend / "form endpoint" (the Formspree, Basin, Getform and Web3Forms category) |
| **Author** | One developer (all 109 commits are by `Eddy-etame`) |

### Origin story (matters for the verdict)
The project started as an **internal tool for a web agency**. The spec (`cahier_des_charges.md`) asks for an internal microservice that replaces Jotform/EmailJS on the agency's showcase sites, with an admin UI, env-only credentials and a documentation notebook. It explicitly excludes a drag-and-drop builder and complex end-user auth.
The code then grew past that spec into a public multi-tenant SaaS with sign-up, plans, client portals, API keys, an MCP server, an AI chat, webhooks, 2FA, Google OAuth, analytics, SEO comparison pages and a "Powered by Inlet" loop.

### Timeline (from `git log --all`)
| Date | Commits |
|---|---|
| 2026-07-06 → 2026-07-24 | 107 commits in 19 days (peak: 20 on 2026-07-17) |
| 2026-08-08 | 2 commits (SEO comparison pages, "Powered by Inlet" viral loop) |
| 2026-08-08 → 2026-09-28 | **0 commits in 51 days** |

### Size
- ~18.8k lines of TS/TSX across `app/`, `components/`, `lib/`, `emails/`
- 36 modules in `lib/`, 23 SQL migrations in `migrations/`
- 54 page and route files under `app/` (admin panel, client dashboard, end-client portal, 24 API routes, marketing, docs, compare, agent docs)
- Tests: hand-written node scripts (`package.json:11-21`). No test runner, no CI config in the repo.

---

## 2. Facts entered into evidence (clerk-verified)

| # | Fact | Evidence |
|---|---|---|
| E1 | Pricing: **Free $0 · Solo $9 · Pro $19 · Max $49** per month (USD) | `lib/plans.ts:38-111` |
| E2 | Free = 3 forms, 50 submissions/mo, 20 emails/day, 30-day retention. Pro = unlimited forms, 2,500 subs/mo, 300 emails/day. Max = 10,000 subs/mo, 1,000 emails/day | `lib/plans.ts:39-110` |
| E3 | **There is no payment system.** "Self-serve checkout isn't live yet". A paid CTA opens a `mailto:` to the author's personal Gmail | `lib/upgrade.ts:1-15` |
| E4 | Email delivery "currently rides **Brevo's free tier (300 emails/day aggregate)**". That pool is shared by all tenants | `lib/plans.ts:12-14` |
| E5 | Yet **one Pro tenant is promised 300 emails/day** (the whole pool) and **one Max tenant 1,000/day** (3.3× the pool) | `lib/plans.ts:81, 99` |
| E6 | Capacity is stretched by **rotating several separate Brevo accounts**: "N Brevo accounts give roughly N× the daily send capacity" | `lib/mailAccounts.ts:75-88` |
| E7 | The AI (spam classifier + sales chat) **rotates a pool of free Gemini keys**, then falls back to Groq, then Mistral. Pro and Max are sold "unlimited" AI | `lib/ai.ts:4-5`, `lib/plans.ts:82, 100` |
| E8 | The marketing claims **"Self-hosted form backend · you own the data"** and "Every plan is self-hosted on your own infrastructure — your data never belongs to us". But the product is a hosted multi-tenant SaaS: sign-ups at `inlett.vercel.app` store data in the operator's Supabase | `lib/dictionaries.ts:64, 100, 145-147, 168, 203, 212` |
| E9 | JSON-LD calls it a "Self-hosted form backend" with USD offers | `app/pricing/page.tsx:51-63` |
| E10 | Testimonials are labelled "Early user" (no name, no company), and the third one is from the creator themselves | `lib/dictionaries.ts:150-158` |
| E11 | Five SEO comparison pages: Formspree, Jotform, Basin, Getform, Web3Forms | `app/compare/[slug]/page.tsx:18-24` |
| E12 | A "Powered by Inlet" footer on free/solo emails and the portal | `emails/AutoReply.tsx:88`, `emails/LeadNotification.tsx:174`, `lib/appDict.ts:543` |
| E13 | Anti-spam stack: honeypot + proof-of-work + keyword/AI classifier + reverse-DNS VPN block + blacklist | `lib/pow.ts`, `lib/spamCore.ts`, `lib/spamClassifier.ts`, `lib/dnsLookup.ts`, `lib/blacklist.ts` |
| E14 | Differentiating surfaces: white-label end-client **portals**, **MCP server** (`app/api/[transport]/route.ts`), agent-readable docs (`/llms.txt`, `/llm-install.md`, `/inlet-skill.md`), FR/EN i18n everywhere | route tree |
| E15 | The upgrade `mailto:` hard-codes a personal Gmail address in public source | `lib/upgrade.ts:6` |

---

## 3. The roles

| Seat | Agent | Mandate | Output |
|---|---|---|---|
| ⚔️ **Prosecutor** | "The Hater" | Tear it apart. Every reason it won't sell, won't be trusted, won't be found, won't scale, won't survive. No mercy, but no invented charges either: every count needs evidence. | `01-prosecution.md` |
| 💰 **Expert witness** | "The Economist" | Neutral. Who would actually pay, how much, through which channel, at what cost? Unit economics, market size, willingness to pay, and whether anyone will *use* it even for free. | `02-economist.md` |
| 🛡️ **Advocate** | "The Believer" | The strongest honest case *for* the idea, plus concrete moves that make it better. No cheerleading without evidence. | `03-defense.md` |
| 🔁 **Cross-examination** | Prosecutor ⇄ Advocate | Each side attacks the other's weakest claims and concedes what it must. | `04-cross-examination.md` |
| ⚖️ **Judge** | "The Bench" | Re-checks the evidence, throws out unsupported claims, scores every party and the idea, and rules. | `05-verdict.md` |

**Why this order.** The three opening briefs were written **in parallel and blind** (no agent saw another's draft), so none could anchor on the others. Cross-examination comes before the ruling so the Judge rules on arguments that have already been tested, not on raw ones.

---

## 4. Rules of evidence (binding on every agent)

1. **Every claim cites a source**: `file:line` for code, a URL with its access date for market facts. A claim without a source is marked **[UNVERIFIED]** and the Judge gives it no weight.
2. **No invented numbers.** An estimate must show its arithmetic and its assumptions. "Probably" without a range is inadmissible.
3. **Competitor facts must be current**: checked live on the web (2026) wherever the network allows. A remembered competitor price is marked **[FROM MEMORY]**.
4. **Read-only on production.** Agents may GET public pages of `inlett.vercel.app`. They must not sign up, submit forms, or trigger emails on the live service.
5. **No secrets.** Never copy an env value, key or password into this dossier.
6. **The house calibration.** A score someone believes is 100% counts as 20%, or 15% with full rigor. "I found no flaw" means the review failed, not that the work is clean. For every flaw found, look for the two hidden behind it.

---

## 5. Scope of the question

The trial judges **the business**, not the code as an exam. Code quality only matters where it changes the answer to one of these:
1. **Will anyone use it?** (demand, discovery, trust, switching cost)
2. **Will anyone pay?** (willingness to pay, price, checkout, retention)
3. **Can it deliver what it sells?** (email capacity, AI quotas, reliability, legal)
4. **Can one person win here?** (distribution, focus, defensibility, time)
5. **What is the best version of this idea?** (narrow, pivot, reposition, or kill)

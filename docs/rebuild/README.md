# Rebuild plan: how Inlet makes money

**Why this plan exists.** The trial (`docs/tribunal/`) judged Inlet *as it stands* and ruled PIVOT. The author disagrees: Inlet must be rebuilt into a product that earns. This folder answers **how**.

**How it was made (2026-09-28).** Five research agents each bombarded one lens:

| Lens | File |
|---|---|
| The teacher's three ideas | `01` |
| Product | `02` |
| Money | `03` |
| Distribution | `04` |
| Moonshots | `05` |

About 175 ideas came out, each citing a competitor page, a study or a `file:line`. They were merged into a first draft of this plan. An independent hater then attacked that draft ([`06-hater-review.md`](06-hater-review.md)). It found 28 flaws and scored the draft **38/100** as an executable plan. **This version applies every finding.** The mapping from finding to change is at the end of `06`.

---

## 1. The answer in 30 seconds

**Stop selling "a form backend". Sell "every lead captured, answered and proven", per client site, through the people who build sites.**

**Sequence.** Capture and prove first. Answer next, in stages, and only as fast as owners show they use it.

| | |
|---|---|
| **The product** | **Capture:** forms checked daily, broken forms alerted, nothing silently dropped, files private.<br>**Prove:** a monthly report per client, under the agency's brand: leads, first-answer time, estimated value.<br>**Answer:** one-tap "Called / Quote sent / Won" buttons in the lead email, then replies captured from the owner's own Gmail. A portal inbox with AI drafts comes only when owners prove they use it (§5). |
| **Who pays, in order** | **1. The author's own client sites.** A "lead line" on the maintenance invoice, invoiced directly.<br>**2. Founding agencies and freelancers** who build client sites, invoiced directly.<br>**3. Self-serve.** Reopens in 2027 behind Gate D. |
| **The price unit** | **Per client, not per submission.** Studio €39 with 10 clients, then +€3 per client. Founding price €29 for the first 10 agencies, locked for 24 months. |
| **The pitch to an agency** | "Pay €54 a month for 15 clients. Bill them €12–15 each inside your retainer (€180–225). The margin (€126–171) covers about 3 hours of your time a month." |
| **Where the edge really is** | Owners can already answer leads elsewhere: **LeadDuo** ($10–20), **Postbox**, **Jotform Inbox** and **HubSpot's free inbox** all do it (sources in `06` finding 5). Inlet's edge is narrower and real: **per-client packaging for agencies, plus daily delivery monitoring, plus a monthly proof report**, in EN and FR. The free form endpoints (Formspree, Web3Forms, splitforms) do none of the three. |

**One line, in both languages:**
- EN: *Every lead captured, answered and proven — for every site you build.*
- FR: *Chaque demande reçue, traitée et prouvée — pour chaque site que vous livrez.*

---

## 2. What "over 90%" can honestly mean

**What no plan can promise:** a 90% chance that strangers will pay. The base rate for this category is **8–10% reaching $1k/month within 12 months** (Economist and court re-computation: `docs/tribunal/02-economist.md` §4, `05-verdict.md` row 44). The earlier "1 in 6" figure came from a survivorship-biased sample and is withdrawn.

The two estimates in this folder put the court's 27 Dec gate (≥3 paying agencies) at **20–50%**: the distribution lens says ~50% with ~137 h of work, the hater 20–30% on an earlier date.

**What this plan pushes past 90%, and how it is measured:**

| Target | Measured by |
|---|---|
| ≥ 99% of daily **canary** submissions stored and notified, with front-end errors beaconed | Daily synthetic submission per form, alerts when a form breaks (#7) |
| Every court injunction shipped **before** anything is charged | Phase 0 carries A1–A9 in the court's own order |
| First revenue from the **most likely buyer** first | The author's own clients sign the lead line before anything is built for strangers (#1) |
| Nothing expensive built **without evidence that owners will use it** | 14-day "I've answered" baseline (Phase 0). The inbox is built only if ≥ 30% of leads get tapped (Gate B) |

**The money test the court used still applies: earnings per hour.**
- If every forecast below lands, gross revenue from Oct 2026 to Dec 2027 is about €14k. That is **about €11/h at 20 h/week** (about 1,300 h), below the €38–43/h outside rate for French web freelancers (`05-verdict.md` §4).
- **Break-even against client work** comes at about **€3k MRR on ≤ 10 h/week**, which is Q4 2027 at the earliest.
- Continuing is therefore a bet on 2027–2028, and the gates in §5 cap what it costs.

---

## 3. The teacher's three ideas, placed in the product

The full engineering is in [`01-teacher-ideas.md`](01-teacher-ideas.md): tool contracts, token budgets, the threat table and the inbox design.

**Correction to the first draft.** Only the teacher lens ranked the reply inbox #1. The product and moonshot lenses prefer capturing replies where owners already answer: their own Gmail (P4) and their own WhatsApp (X2). So idea 3 is **kept and staged**, not dropped.

| Teacher's idea | What it becomes | When |
|---|---|---|
| **1. Full MCP**: every action from an AI agent, without wasting tokens | **13 tools.**<br>• One idempotent `setup_site` call creates the end-client, the form (with allowed origins taken from the site URL), the assignment and the auto-replies, and returns the files to write.<br>• **Zero to live form:** 2 calls and ~700 tokens, against 3+ calls, ~2,500 tokens and 3 manual steps today.<br>• **Compact lead reads:** about 65% fewer tokens.<br>• **Replies:** the agent drafts, the owner approves.<br>• **Pricing:** MCP is free on every plan (competitors give it away); the second client hits the paywall. | **2027 Q1:** `setup_site` + compact reads as the author's *own* onboarding tool (it saves about 1 h per client site).<br>**2027 Q2:** OAuth + Claude/ChatGPT directories + MCP registry, which all require a domain, legal pages and OAuth. |
| **2. Lead data protection** (the "hacker-proof" wish, stated honestly) | **Only true end-to-end encryption defeats an attacker inside the running server,** and only if the encrypting script is self-hosted on the client's site with subresource integrity (SRI). Everything else protects dumps, backups and leaked keys.<br>• **Phase 0:** private attachments (ID photos and PDFs are public today).<br>• **Before the first invoice:** retention and deletion (court B3).<br>• **2027 Q1, before the inbox:** no plaintext lead copies in logs, webhooks or alerts, then per-tenant envelope encryption at rest.<br>• **"Vault forms"** (end-to-end, key held by the owner's passkey): presell only. Jotform gives encrypted forms away free, so Vault must be sold on the agency packaging, not on the encryption. Health and therapy practices are **excluded**: encryption does not exempt a host from health-data law. | Phase 0 → first invoice → 2027 Q1; Vault by presell |
| **3. Reply from the client dashboard, with AI** | **Staged answer layer:**<br>• **Stage 1 (Phase 1):** one-tap "Called ✓ / Quote sent / Won" buttons in the lead email. Phone answers count.<br>• **Stage 2 (2027 Q1):** replies from the owner's own Gmail, captured through a per-lead Reply-To address. AI triage and drafts on a paid provider, marked as AI-generated in machine-readable form (AI Act Art. 50). A tap-to-WhatsApp reply, shown only when the lead ticked "reply to me on WhatsApp" (WhatsApp requires the lead's opt-in).<br>• **Stage 3:** the portal inbox with threads. It is built **only if** ≥ 30% of leads are tapped in the baseline **and** ≥ 3 paying agencies name replying as a reason they pay.<br>• **Roles:** the developer creates clients and forms, the end-client answers, and a human always sends. | Phase 1 → 2027 |

**Dependency rules:**
- Envelope encryption lands before the inbox, so message bodies are born encrypted.
- Vault turns server-side AI off, so it must stay opt-in.
- Inbound replies need an email provider with inbound parsing in the EU, chosen in Phase 0 under order A7.
- No end-client thread goes live before the data processing agreement (DPA) exists.

---

## 4. The ranked list

**Scoring rule:** Score = Money × Proof × Edge ÷ (Days × Risk).
- **Money, Proof and Edge** are each rated 1–5. Money is revenue within 12 months. Proof is evidence that buyers pay for this. Edge is how hard it is for free competitors to match.
- **Days** is developer-days at the lenses' estimates (1.0×), with a floor of 1.
- **Risk** is 1–3, operational plus legal burden: 1 is low; 3 means security-critical, relays email, or has AI Act, WhatsApp or GDPR exposure.
- **Proof and Edge were corrected** after the hater (`06` finding 13): tap-to-reply is copyable in two days, monitoring's paid rivals are still "coming soon", and reports exist elsewhere.
- **The formula still rewards cheap items.** The build order in §5 follows dependencies and money gates, not this rank.

### Foundations: nothing is charged before these

| # | Foundation | Source | Days |
|---|---|---|---|
| F0 | **Chain of title in writing.** Written confirmation that the author owns the code, from the organisation behind the commit email domain and the agency the spec was written for. If it is refused, rebuild clean-room or stop | court B1; `06` finding 1 | 0.25 + correspondence |
| F1 | **The court's 9 immediate orders, in the court's order.** A1 + A3 by 2 Oct; A2, A4 and A5 by 5 Oct; A6–A8 by 12 Oct; A9 by 19 Oct. **A7** = one paid email provider with inbound parsing and an EU region, a per-tenant sending subdomain, and a backup provider | court §5(a) | 3.5 |
| F2 | **A stranger's form works, and agencies are isolated.** Origins set at creation, tenant settings, native redirect, dead links fixed. Portal identity per agency, so no business is visible across agencies (N18) | court B4 + N18 | 2.5 |
| F3 | **Legal.** A registered business; legal pages; a DPA naming the chain (end-client = controller, agency = processor, Inlet = sub-processor, plus the listed sub-processors); commercial hosting; EU region | court B2 | 2.5 + calendar time |
| F4 | **Data lifecycle.** A retention job, private attachments, per-tenant deletion and erase-by-email | court B3; T2.2, T4.8 | 2 |
| F5 | **Attribution, lite.** Keep UTM and `ref` tags, record the signup source (the full per-channel view is #8) | D14 | 0.25 |
| F6 | **The repository.** Make it private, or move `docs/tribunal` and `docs/rebuild` to a private repo. **This is the author's action**, on GitHub | `06` finding 11 | 0.1 |

**Foundations total: about 11 developer-days** (the correspondence and entity paperwork take calendar time on top). Removing plaintext lead copies from logs, webhooks and alerts (T2.3), and envelope encryption at rest (T2.1), come in 2027 Q1, before the inbox.

### Ranked clusters (re-scored)

| Rank | Cluster | IDs | M | P | E | Days | Risk | **Score** | When |
|---|---|---|---|---|---|---|---|---|---|
| 1 | **Lead line for the author's own clients** (€12–15 per site on the maintenance invoice) | M7, D26 | 3 | 5 | 2 | 1 | 1 | **30** | Phase 0 sell |
| 2 | **One-tap status buttons in the lead email** ("Called ✓ / Quote sent / Won / Not relevant") + a status column | P3, P1-lite | 4 | 4 | 3 | 2 | 1 | **24** | Phase 1 |
| 3 | **Scanner-lite + audit-led outreach** ("is your client's form really sending?"), sent from the author's warm studio domain | D20-lite, D25 | 4 | 3 | 4 | 1 | 2 | **24** | Phase 1 |
| 4 | **Per-client price sheet + founding €29 offer + resale kit** (as sales documents first) | M1, M2, M5, M16 | 5 | 4 | 3 | 3 | 1 | **20** | Phase 0–1 |
| 5 | **GEO: get cited where AI assistants look.** A weekly log of 20 prompts, third-party tables, honest answers on Reddit | D7 | 3 | 3 | 2 | 1 | 1 | **18** | Phase 0 → ongoing |
| 6 | **Visible spam quarantine** with a "not spam" button that teaches | P10, T4.4 | 2 | 3 | 3 | 1 | 1 | **18** | 2027 Q1 |
| 7 | **Daily canaries + drought alerts + delivery receipts** (monitored daily; no "guarantee") | P20, P21, P19, T1.5 | 4 | 4 | 4 | 4 | 1 | **16** | Lite in Phase 1; full in 2027 Q1 |
| 8 | **Lead-source attribution** in the portal and report | P32 | 3 | 3 | 3 | 2 | 1 | **13.5** | 2027 Q1 (lite tags from Phase 0) |
| 9 | **Monthly report per client** (sent by hand first, then automated) + per-client branding (B5) | P22, X9, T4.5, B5 | 5 | 4 | 3 | 5 | 1 | **12** | By hand in Phase 1; automated in Phase 2 |
| 10 | **MCP `setup_site` + compact reads** (the author's own onboarding tool first) | T1.1, T1.3 | 3 | 3 | 4 | 5 | 1 | **7.2** | 2027 Q1 |
| 11 | **WordPress bridge plugin** (CF7, WPForms, Elementor → inbox) | D8, P39 | 4 | 4 | 4 | 5 | 2 | **6.4** | 2027 Q1–Q2 (earlier if the studio pool < 1,000) |
| 12 | **Vercel Marketplace integration + installable skill** | D9, D5 | 3 | 3 | 4 | 3 | 2 | **6** | 2027 Q2 |
| 13 | **Reply capture from the owner's Gmail** (per-lead Reply-To relay; reply cap per tenant; replies only to recent submitters) | P4 | 4 | 3 | 3 | 3.5 | 2 | **5.1** | 2027 Q1 |
| 14 | **AI triage + drafts** (paid, metered, Art. 50 marking) | P9, T3.2, T3.3, T3.8, M14 | 4 | 4 | 2 | 4.5 | 2 | **3.6** | 2027 Q1 |
| 15 | **Lead Mirror** (BCC capture for WordPress, Wix and Webflow native forms) | M13 | 3 | 3 | 4 | 5 | 2 | **3.6** | 2027 Q1, or Phase 2 if the pool is small |
| 16 | **Opt-in, disclosed AI acknowledgment** (an answer within a minute, which the owner takes over) | T4.9 | 3 | 3 | 2 | 2 | 3 | **3** | 2027, after #14 |
| 17 | **Tap-to-reply on WhatsApp/SMS** (only with the lead's opt-in) + reminders | X2, T4.13, P5 | 3 | 3 | 1 | 5 | 2 | **0.9** | 2027 |
| 18 | **Portal reply inbox with threads** | T3.1, T4.1 | 5 | 3 | 2 | 8 | 3 | **1.3** | Only past its adoption gate |
| 19 | **OAuth + directory listings + MCP registry** | T1.6, T1.8, D3, D4 | 3 | 4 | 2 | 6.5 | 3 | **1.2** | 2027 Q2, after the rename |
| 20 | **Claimable agent forms** | T1.7, D1 | 2 | 3 | 3 | 3 | 3 | **2** | 2027 Q2 |

**Presell only.** Each of these needs 3 prepaid commitments before a day of code:
- the Agency tier (€99);
- the portal on the agency's own domain (€19);
- client sending domains (€5);
- WhatsApp API alerts (€5);
- Vault (score 0.4).

**Parked, scored with the same formula:**

| Idea | IDs | Score |
|---|---|---|
| Response-time benchmark report (needs data first) | X19 | 3.2 |
| Booking hand-off | P35 | 2.7 |
| Seats | P7 | 2.4 |
| Multi-step SDK | P34 | 2.3 |
| Vertical packs | X4, P23 | 2 |
| Framer / Webflow / Netlify / Astro integrations | D10–D13 | ~2 each |
| White-label SaaS mode | X8 | 1.8 |
| Consent ledger | X13, P37 | 1.8 |
| Hosted lead page | P38 | 1.6 |
| Ads conversion feedback | X6 | 1.5 |
| AI auto-answer desk | X1 | 0.9 |
| Sheets / webhook log / HubSpot | P29–P31 | 0.9 |
| Deposit request | P36 | 0.8 |
| Franchise router | X10 | 0.75 |
| EU-sovereign stack | X12 | 0.75 |
| Owner MCP App | T4.10, X17 | 0.7 |
| Whistleblowing channel | X15 | 0.6 |

Blocked:
- **Open-source core:** blocked by F0.
- **Buying a competitor:** needs capital.

---

## 5. Build and sell: phases, hours and money gates

**Hours, stated honestly (`06` finding 2):**
- **Estimates are at 1.0× the lenses' days.** AI assistance is not assumed to halve them: a 2025 randomised trial found experienced developers 19% *slower* with AI tools, and its 2026 update shows no reliable 50% gain. If the author's pace beats the estimates, the **timesheet** will show it and the dates move earlier.
- **Budget: 20 h/week.** Phase 0 is 14 h build + 6 h selling; after that 10 h build + 10 h selling.
- **Any week under 15 h pushes every gate back.** Three such weeks in a row trigger a re-plan.
- **This plan overrides the court's 110 h cap and its freeze** on pricing v2, MCP and custom-domain work (`05-verdict.md` §5c–d). It replaces them with **a 250 h budget to 27 Dec, logged**. **The court's gate criteria are kept word for word** (Gates A and C).

**The rule: sell before you build.** Each phase starts only when the gate before it passes. A failed gate stops the build, not the business: whatever already earns keeps earning.

### Phase 0 · Legal, honest, safe (29 Sep → 19 Oct; ~60 h)

**Build (~42 h):**
- **F1 in the court's order (28 h):** A1 + A3 by 2 Oct, A2/A4/A5 by 5 Oct, A6–A8 by 12 Oct, A9 by 19 Oct.
- **Private attachments (8 h):** the first part of F4.
- **The adoption baseline (4 h):** a one-tap "I've answered" link on the lead emails of the author's existing client sites, running for 14 days.
- **F5 attribution-lite (2 h).**

**Sell and admin (~18 h):**
- **F0:** send the chain-of-title request.
- **F6:** make the repo private (author).
- **The lead line:** offered to the author's existing client businesses (#1).
- **Trademark search** (EUIPO TMview and USPTO) before any rename.
- **Studio list:** start naming at least 1,000 hand-coding studios in FR and US, from agency directories and the Webflow/Framer expert lists.
- **GEO:** a baseline log of 20 buyer prompts (#5).
- **Business entity:** confirm what exists.

**Gate A (19 Oct):**
- 9 of 9 A-orders live *(court)*.
- Ownership confirmed in writing, or confirmed as under way. **No invoice goes out before it arrives.**
- At least 2 client businesses agree in writing to the lead line.
- The baseline is running.
- At least 500 studios named.

### Phase 1 · Prove (20 Oct → 27 Nov; ~110 h)

**Build (~56 h):**
- **F2 (20 h):** the stranger path, plus per-agency identity.
- **The rest of F4 (8 h):** retention job, tenant deletion and erase-by-email, all due before the first invoice.
- **#2 (8 h):** one-tap status buttons, with "Called ✓", plus a status column.
- **#7 lite (12 h):** a daily canary and drought alert, sent as one digest a day.
- **#3 (8 h):** the scanner-lite script.
- **#9 by hand:** the first monthly report is sent from one query, with no build.

**Sell and admin (~53 h):**
- **F3 (~20 h):** legal pages and the DPA.
- **Outreach (~15 h):** 25 audits a week from the author's warm studio domain (#3).
- **One French workshop,** only if the hours allow.
- **Founding-agency calls**, using a demo made of a scan of the agency's own client forms plus the own-client report.
- **Invoicing:** invoice the own-client lead line once F0 and F3 are done, then send founding-agency invoices directly (SEPA or Stripe Invoicing, so no Paddle approval is needed).
- **GEO:** weekly.

**Gate B (27 Nov, the court's date):**
- At least 3 founding agencies have signed and been invoiced at €29 or more.
- At least 2 client businesses have been invoiced.
- Legal pages and DPA are live.
- The stranger-path browser test is green.
- **Baseline result:** at least 30% of leads were tapped "I've answered". Otherwise the answer layer stays at buttons plus the report.
- **Studio pool:** at least 1,000 named. Otherwise Lead Mirror or the WordPress bridge moves forward.

### Phase 2 · Charge and retain (28 Nov → 27 Dec; ~80 h)

**Build (~40 h):**
- **#9 automated:** the monthly report plus per-client branding (B5). This is the court's named pivot trigger ("if pilots pay for the report"), and it is the only build in Phase 2.

**Sell (~40 h):**
- Concierge onboarding of the founding agencies (admin-created forms).
- First reports sent, first payments collected.
- A named case study, with written consent.
- Outreach continues.

**Gate C (27 Dec), the court's criteria word for word:**
- At least 3 external agencies have **paid** €29/month or more.
- No lead-loss incident on a paying account stayed unresolved for more than 48 h.
- **Studio line:** at least 2 distinct client businesses pay, at least one of them outside the existing multi-site client, and December upkeep is 4 h or less.

### 2027 (only past Gate C)

**Q1 · Answer, stage 2:**
- **Data protection, stage 2:** no plaintext lead copies in logs, webhooks or alerts (T2.3), and per-tenant envelope encryption at rest (T2.1).
- **Monitoring and hygiene:** full monitoring with delivery receipts (#7), attribution in the report (#8), the spam quarantine (#6).
- **Reply capture from the owner's Gmail (#13)**, after data protection stage 2.
- **AI triage and drafts (#14).**
- **The MCP onboarding tool (#10)**, for the author's own use.
- **Lead Mirror and the WordPress bridge (#15, #11):** these come *first* if the studio pool is under 1,000.
- **Paddle checkout** prepared for self-serve.
- **The portal inbox (#18)**, only if its adoption gate passes.

**Q2 · Distribute:**
- **Rename executed** before the first public listing.
- **Listings:** the Vercel Marketplace and the skill (#12); OAuth, the directories and the MCP registry (#19); claimable forms (#20).
- **Gate D:** at least 8 paying agencies and €500/month or more. That reopens self-serve and the Product Hunt / Show HN launches.

### Money forecast (restated after the hater)

The ARPA inputs are from `03-money.md` without add-ons: founding €41 (€29 plus 4 extra clients), list €54.

| Date | Own clients | Agencies | Self-serve | Monthly revenue |
|---|---|---|---|---|
| **27 Dec 2026** | €72–120 (6–8 sites at €12–15) | 3–4 founding (€87–164) | closed | **≈ €160–280** |
| mid-2027 | ~€150 | ~18 agencies | small | **≈ €1,000** |
| Q4 2027 | ~€300 | ~35 agencies | ~16 × €22 | **≈ €2,400** |
| €10k | €450 | ~100+ agencies | ~90 × €22 | **needs the WordPress plugin, referrals or a marketplace, not outreach alone** |

- **Optional cash lever:** paid audits (€149) and done-for-you setups (€249), invoiced directly. They compete with build hours, so they are taken only when a phase is ahead of plan.
- **The buyer pool is the hidden constraint.** Outreach closes about 2 in 50. So €1k MRR needs about 450 named studios contacted, and €10k about 2,500. That is why the pool is counted at Gate B.

---

## 6. The price sheet, condensed

The full version is in `03-money.md`. Prices exclude VAT. USD prices use the same numbers as EUR for simplicity, which gives US buyers about 12% off; adjust after the first 10 US sales.

| | Solo | **Studio ★** | Agency *(presell only)* |
|---|---|---|---|
| Monthly | €12 | **€39** (founding €29: first 10 agencies, locked 24 months) | €99 |
| Annual (2 months free) | €120 | €390 | €990 |
| Clients included | 3, then +€4 each | 10, then +€3 each | 40, then +€2 each |
| Client portal | View + one-tap status | Branded per client | + on the agency's own domain |
| Monthly report | €3 per client | Included | Agency-branded PDF |
| Monitoring | **Daily canary** + drought alert | **Daily canary** + hourly storage-only probes (no email) + one daily digest | Same as Studio |
| AI drafts per month (2027) | 50 | 300 | 1,500 |
| Support | Email, 2 business days | Next business day | Next business day |

- **No "lead guarantee" in 2026.** The promise is "monitored daily, an incident report within 1 business day, a month's credit on request". One person cannot carry an SLA, and no one answers at 2 a.m.
- **Add-ons, all presell only:** WhatsApp alerts €5 per client, client sending domain €5, portal on the agency's own domain €19, Vault (price to be set against Jotform's free encrypted forms).

---

## 7. What we are deliberately not doing

| Not doing | Why |
|---|---|
| Paid search | Break-even is $0.23 per click; developer-tool clicks cost more |
| A lifetime deal | 16–17% refunds, 30–40% more tickets, costs that never stop |
| More `llms.txt` files | 97% get zero traffic. Being cited on other pages is what counts (GEO, #5) |
| French SEO for "backend de formulaire" | Nobody searches it. They search "formulaire WordPress ne fonctionne pas" |
| Charging per form, or per submission as the main price | It punishes success and invites spam disputes. Overage only |
| Charging for MCP access | Every competitor gives MCP away |
| A voice AI receptionist | Inlet has no position on the phone line |
| Health or therapy verticals, and Vault for them | HDS and HIPAA duties apply regardless of encryption |
| SMS as the main alert channel | $0.08 per message to France, plus US registration |
| A form builder or a native app | Tally is free and better; a PWA with push works on iOS |
| AI replies that send themselves by default | Liability and AI Act Art. 50. Opt-in and disclosed only (#16) |
| A "lead guarantee" or an SLA in 2026 | One person cannot carry the on-call |
| "Verified response time" badges | The data is a log of taps, not proof, and slow businesses hide the badge |

---

## 8. Operations for one person

- **Incident rule.** A lead-loss incident on a paying account is fixed or disclosed within 48 h, the court's criterion. The author's holidays are announced to agencies in advance, and monitoring alerts go to a second address.
- **Email provider.** One paid provider with a per-tenant sending subdomain, so one tenant's complaints don't burn everyone. A backup provider is configured but not used day to day.
- **Relay abuse.** Replies are capped per tenant, and are allowed only to addresses that submitted within the last 30 days. Signup requires email verification.
- **Sell to competitors only with isolation.** Selling to studios that compete with the author's own happens only after F2's per-agency identity, with a written no-poaching line for 12 months (no handover capture, no directory).

---

## 9. Decisions needed from the author

Answer by number; each question has a proposed answer.

1. **Who owns the code?** Is there anything in writing from the organisation behind the commit email domain, or from the agency the spec was written for? *Proposed: request a signed confirmation this week. No invoice goes out before it. If refused, rebuild clean-room or stop.*
2. **Make the repo private today?** It publishes the vulnerabilities, the trial and this plan. *Proposed: yes, and ship A3 (the SSRF) first.*
3. **Hours.** Are 20 h/week (10 build + 10 selling after Phase 0) real, logged in a timesheet? *Proposed: yes, with re-dating whenever a week drops under 15 h.*
4. **Is this rebuild also graded by your teacher? When?** *Proposed: if yes, separate the graded scope (for example an MCP demo and an encryption write-up) from the revenue path, so a grading deadline cannot reorder the phases.*
5. **Your business entity.** Do you already invoice web clients through a registered business, and will it be registered in the EU or the US? Only that matters here, because it decides Stripe versus Paddle. *Proposed: use it now for the own-client line and the founding pilots, with direct invoices; Paddle in 2027 for self-serve.*
6. **How do your clients answer leads today (phone, WhatsApp or Gmail), and does any of them open the portal?** *Proposed: measure it with the 14-day "I've answered" baseline before any inbox code.*
7. **The name.** "Inlet" collides with a YC company and with the .com, .io, .dev, .app and .fr domains and the npm package. "Formcove" is already a trademarked coating product. The remaining candidates are Crique, Calanque, Relais and Amarre. *Proposed: run TMview and USPTO this week; budget about €850 for one EU class plus USPTO; rename before the first public listing, not before the outreach (which goes out from your studio domain).*
8. **Local documents.** Share the payments plan and the other git-ignored notes, by pasting them here or through a private repo. *Proposed: before Phase 1.*
9. **The court's cap.** Do you accept that this plan replaces the court's 110 h cap with 250 h to 27 Dec, and keeps its gate criteria word for word? *Proposed: yes.*
10. **Selling to studios that compete with yours.** *Proposed: only after per-agency isolation (F2), with a 12-month no-poaching line.*
11. **The four queued fix tasks** (lead loss, SSRF, stranger path, truth pass) are F1 and F2. *Proposed: start now, SSRF first.*

---

## Files in this folder

| File | What |
|---|---|
| [`01-teacher-ideas.md`](01-teacher-ideas.md) | The teacher's ideas, engineered: a 13-tool MCP contract with a token budget, the threat table and encryption tiers, the inbox design, and 13 neighbouring ideas |
| [`02-product.md`](02-product.md) | 39 product ideas |
| [`03-money.md`](03-money.md) | 33 money ideas, the full price sheet, and the path to €1k / €3k / €10k |
| [`04-distribution.md`](04-distribution.md) | 38 channel ideas, the rename study, and a 90-day channel plan |
| [`05-moonshots.md`](05-moonshots.md) | 21 bold moves and moats |
| [`06-hater-review.md`](06-hater-review.md) | The independent attack on the first draft (28 findings), and what changed because of it |

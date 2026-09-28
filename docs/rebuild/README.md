# Rebuild plan: how Inlet makes money

**Question:** the trial (`docs/tribunal/`) judged Inlet *as it stands* and ruled PIVOT. The author disagrees: Inlet must be rebuilt into a product that earns. This folder answers **how**.

**How this plan was built (2026-09-28):**
- **Idea generation.** Five research agents each bombarded one lens:
  - the teacher's three ideas, engineered;
  - money;
  - product;
  - distribution;
  - moonshots.
- **Evidence.** Every idea cites a competitor page, a study or a `file:line`.
- **Scale.** About 175 ideas were then merged into 40 clusters, scored, sequenced, and attacked by an independent hater (see `06-hater-review.md`).

---

## 1. The answer in 30 seconds

**Stop selling "a form backend". Sell "every lead captured, answered and proven", per client site, through the people who build sites.**

| | |
|---|---|
| **The product** | **Capture.** No lead is ever lost: forms monitored daily, leads encrypted, nothing silently dropped.<br>**Answer.** The business owner replies from their own inbox, with AI drafts, one-tap WhatsApp or email, and reminders.<br>**Prove.** A monthly report under the agency's brand: leads, response time, € won. |
| **Who pays** | **1.** The author's own client sites (the "lead line" on the maintenance invoice).<br>**2.** Agencies and freelancers who build client sites, who resell it at a margin.<br>**3.** Self-serve, later. |
| **The price unit** | **Per client, not per submission.** Studio €39/$39 with 10 clients, then €3 per client. A founding price of €29 for the first 10 agencies. |
| **The pitch to an agency** | "Pay about €54 a month for 15 clients, bill them €15–25 each inside your retainer: €171–321 a month of margin." (`03-money.md` M16) |
| **Why this can win** | Free form endpoints (Formspree, Web3Forms, splitforms, Netlify) only *receive*. Nobody in that category lets the business owner *answer* or proves what the website earned. The tools that do (WhatConverts, AgencyAnalytics, HighLevel) cost $20–500 a month and are not form-native. |

**One line, in both languages:**
- EN: *Every lead captured, answered and proven — for every site you build.*
- FR: *Chaque demande reçue, traitée et prouvée — pour chaque site que vous livrez.*

---

## 2. What "over 90%" can honestly mean

Nobody can promise a 90% chance that strangers will pay: in this category only about 1 product in 6 reaches $1k/month (`docs/tribunal/02-economist.md` §4). What this plan does push past 90%:

| Target | How |
|---|---|
| **≥ 99% of leads captured and delivered**, proven monthly | Daily canary submissions on every form, alerts when a form breaks, no silent drops (#4 below) |
| **Every finding from the trial fixed** before a stranger is charged | Phase 0 carries every injunction from the verdict |
| **First revenue from the most likely buyer first** | The author's existing client sites pay a lead line before anything is built for strangers (#1) |
| **Every build step paid for in advance** | "Sell before you build": each phase starts only after its money gate passes (§5) |

The distribution lens estimates about a **50% chance** of the court's "3 paying agencies by 27 Dec" gate with 10–13 h/week of direct outreach (`04-distribution.md`). Its estimate for the author's own clients is **2 of 3 offered businesses sign**, about €72–96 a month.

---

## 3. The teacher's three ideas, placed in the product

The full engineering is in [`01-teacher-ideas.md`](01-teacher-ideas.md): tool contracts, token budgets, a threat table and the inbox design.

| Teacher's idea | What it becomes | Where it sits |
|---|---|---|
| **1. Full MCP**: every action from an AI agent, without wasting tokens | **13 tools.** One idempotent `setup_site` call creates the end-client, the form (with allowed origins from the site URL), the assignment and the auto-replies, and returns the files to write.<br>**From zero to a live form:** 2 calls and ~700 tokens, against 3+ calls, ~2,500 tokens and 3 manual steps today.<br>**Compact reads:** lead lists cost ~65% fewer tokens.<br>**Replies:** drafted by the agent, sent only after the owner approves.<br>**Pricing:** free on every plan (competitors give MCP away); the second client hits the paywall. | Phase 3 (distribution), after OAuth, the domain and the legal pages, which every directory requires |
| **2. Hacker-proof lead data** | **Honest boundary:** only true end-to-end encryption defeats an attacker *inside the running server*.<br>**Default tier:** per-tenant envelope encryption at rest, private attachments and no plaintext copies in logs or webhooks. It protects dumps, backups and leaked keys, and keeps AI working.<br>**"Vault forms":** true end-to-end, sealed in the visitor's browser, with the key held by the owner's passkey. It is sold as an add-on to lawyers, accountants and therapists. | **Default tier:** Phase 0.<br>**Vault:** 2027 add-on |
| **3. Reply from the client dashboard, with AI** | **Threaded inbox in the end-client portal.** Replies go out under the business's name, and the lead's answers come back into the same thread.<br>**Around the inbox:** AI triage (intent, urgency, language, summary) and AI drafts in the business's voice, which a human always sends.<br>**Status and alerts:** one-tap status buttons, reminders for unanswered leads, and "reply on WhatsApp" at zero API cost.<br>**Roles:** the developer creates clients and forms; the end-client answers. | **Phase 1: the core of the product.** Every lens ranked it #1 or close. |

**Dependency order** (why ideas 2 and 3 are coupled):
1. Encryption at rest before the inbox, so message bodies are born encrypted.
2. Vault forms turn server-side AI off, so they must stay opt-in.

---

## 4. The ranked list

**Scoring rule**, so you can argue with it:
- **Score** = Money × Proof × Edge ÷ developer-days, each of Money, Proof and Edge rated 1–5.
- **Money:** revenue within 12 months. **Proof:** evidence that buyers pay for this. **Edge:** how hard it is for free competitors to match.
- **Effort** is floored at 1 day.

The IDs refer to the lens files.

### Foundations: not ranked, because nothing sells without them

| # | Foundation | IDs | Dev-days |
|---|---|---|---|
| F1 | The court's 9 immediate orders: no lead drops, no permanent bans, SSRF closed, paid AI, honest copy, one paid email provider, visible failures, password hygiene | verdict §5(a) | 3.5 |
| F2 | A stranger's form works: origins set at creation, tenant settings, native redirect, dead invite links fixed | verdict B4, Count 2 | 1.5 |
| F3 | A legal entity, legal pages, a DPA, commercial hosting, EU region | B2, D36, T2.7 | 2.5 + calendar time |
| F4 | A real domain, and a name decision ("Inlet" is taken, see question 3) | D35 | 1.5 |
| F5 | Attribution: keep UTM tags, record signup source | D14, P32 (part) | 1 |
| F6 | Checkout: Paddle for software, direct invoice for services | M29, M24, B6 | 1.5 + approval |
| F7 | Lead data encrypted at rest, private files, no plaintext copies | T2.1–T2.3 | 6 |

**Foundations total: about 17.5 developer-days.**

### Ranked clusters

| Rank | Cluster | Members | Money | Proof | Edge | Days | **Score** | Engine |
|---|---|---|---|---|---|---|---|---|
| 1 | **Lead line for the author's own clients** (retainer ladder €79 / €99 / €179, or €12–15 per site) | M7, D26 | 3 | 5 | 2 | 1 | **30** | 1 |
| 2 | **Per-client price sheet**, founding €29 offer, resale kit with margin calculator | M1, M2, M4, M5, M16 | 5 | 4 | 3 | 3 | **20** | 2, 3 |
| 3 | **Monthly proof-of-value report** under the agency brand, per-end-client branding | P22, X9, T4.5, M11, D16, B5 | 5 | 5 | 4 | 5 | **20** | 1, 2 |
| 4 | **Form monitoring + lead guarantee** (daily canaries, "form broke" alerts, delivery receipts) | P20, P21, T1.5, X14, M12, P19 | 4 | 5 | 4 | 4 | **20** | 1, 2 |
| 5 | **Lead-source attribution** in the portal and report | P32 | 3 | 3 | 4 | 2 | **18** | 2 |
| 6 | **Visible spam quarantine** with "not spam" that teaches (retention, not revenue) | P10, T4.4 | 2 | 3 | 3 | 1 | **18** | all |
| 7 | **Pipeline + one-tap status + € won** | P1, P2, P3, T3.4 | 4 | 4 | 4 | 4.5 | **14** | 1, 2 |
| 8 | **WordPress bridge plugin** (CF7, WPForms, Elementor → Inlet inbox) | D8, P39, M13 | 4 | 4 | 4 | 5 | **12.8** | 2 |
| 9 | **Threaded reply inbox** in the portal, passwordless login | T3.1, T4.1, P4 | 5 | 4 | 5 | 8 | **12.5** | 1, 2 |
| 10 | **Tap-to-reply** (WhatsApp, SMS, email from the owner's phone) **+ verified response time** + reminders | X2, X3, T4.13, P5, T3.5 | 4 | 3 | 5 | 5 | **12** | 1, 2 |
| 11 | **Audit-led outreach**: a free "is my form really sending?" scan, then personal email to studios | D20, D25, M20 | 4 | 3 | 4 | 4 | **12** | 2 |
| 12 | **Vercel Marketplace integration + installable skill** | D9, D5 | 3 | 3 | 4 | 3 | **12** | 3, 2 |
| 13 | **AI triage + drafts** (paid provider, metered credits) | P9, T3.2, T3.3, T3.8, M14 | 4 | 4 | 3 | 4.5 | **10.7** | 1, 2 |
| 14 | **MCP v2: `setup_site` + compact reads** | T1.1, T1.3, D2 | 3 | 3 | 4 | 5 | **7.2** | 2, 3 |
| 15 | **Agency white-label**: portal on the agency's domain, client sending domains | P24, M10, M9, T3.7 | 4 | 3 | 3 | 5 | **7.2** | 2 |
| 16 | **WhatsApp API alerts** with buttons | P15, M8 | 3 | 3 | 3 | 4 | **6.8** | 1, 2 |
| 17 | **Claimable agent forms** (live before signup, claim by email) | T1.7, D1 | 2 | 3 | 3 | 3 | **6** | 3 |
| 18 | **French workshops + named case studies** | D29, D30 | 2 | 2 | 3 | 2 | **6** | 2 |
| 19 | **OAuth + Claude/ChatGPT directory listings + MCP registry** | T1.6, T1.8, D3, D4 | 3 | 4 | 2 | 6.5 | **3.7** | 3 |
| 20 | **Vault forms (end-to-end)** | T2.4, T2.5, X11, M15 | 2 | 3 | 4 | 10.5 | **2.3** | 2 |

**The formula rewards cheap items.** That is why the reply inbox, the product's core, ranks 9th: it is the most expensive item on the list. **The build order in §5 follows dependencies and the money gates, not this rank.** Rank tells you what pays back fastest per day; §5 tells you what has to exist first.

**Parked for 2027** (good, but not before money flows), with the lens where each idea is argued:

| Idea | Lens | IDs |
|---|---|---|
| AI Lead Desk that answers automatically | X | X1, T4.9 |
| Full agency white-label SaaS mode | X | X8 |
| Ads conversion feedback to Google and Meta | X | X6 |
| Franchise router | X | X10 |
| Vertical packs | X, P | X4, P23 |
| Framer, Webflow, Netlify and Astro integrations | D | D10–D13 |
| Owner-facing MCP App in ChatGPT and Claude | T, X | T4.10, X17 |
| Whistleblowing channel | X, T | X15, T4.12 |
| Consent ledger | X, P | X13, P37 |
| Response-time benchmark report | X | X19 |
| Buying a small competitor for its users | X | X20 |
| Open-source core | X | X21 |
| EU-sovereign stack | X | X12 |
| Seats | P, T | P7, T4.3 |
| Integrations (Sheets, webhook log, HubSpot) | P | P29–P31 |
| Hosted lead page | P, D | P38, D17 |
| Booking hand-off | P | P35 |
| Deposit request from a lead | P | P36 |
| Multi-step SDK | P | P34 |

---

## 5. Build and sell: phases, dates and money gates

**The rule: sell before you build.** Each phase starts only when the gate before it has passed. A failed gate stops the build, not the business: the parts already built keep earning.

**Hours assumption.** The foundations plus Phases 1–3 come to **about 76 developer-days (~600 h)** as estimated by the lenses, for one person without AI help. The author builds with AI assistance (92 of 109 commits are co-authored), which realistically halves that. The dates below assume **~20 h/week with AI assistance**. **At 10 h/week, every date doubles.** Question 6 settles this.

| Phase | Dates | Build | Sell (in parallel) | Money gate at the end |
|---|---|---|---|---|
| **0 · Legal, honest, safe** | 29 Sep → 19 Oct 2026 | F1, F2, F5, F7; start F3 and F4 | Offer the lead line to the author's existing clients (#1). Start 10 discovery conversations with studios. List 250 hand-coding studios | **Gate A (19 Oct):** ≥ 2 client businesses have agreed in writing to the lead line. 10 conversations logged |
| **1 · Answer** | 20 Oct → 16 Nov | Reply inbox (#9), pipeline + one-tap (#7), AI triage and drafts (#13), tap-to-reply + reminders (#10), spam quarantine (#6). Finish F3 | First invoices to own clients. Audit-led outreach, 25 studios a week (#11). One French workshop. The price sheet exists as a sales document | **Gate B (16 Nov):** first client invoice paid. ≥ 3 agencies signed a founding pilot at €29 (prepay or written commitment) |
| **2 · Prove and charge** | 17 Nov → 14 Dec | Monitoring + guarantee (#4), monthly report + per-client branding (#3), attribution (#5), checkout (F6), price sheet live (#2) | Onboard the founding agencies. First monthly reports sent. Named case study with written consent | **Gate C (27 Dec, the court's gate):** ≥ 3 agencies have **paid** ≥ €29. Own-client lead line ≥ €100 a month |
| **3 · Distribute** | Jan → Mar 2027 | WordPress plugin (#8), Vercel Marketplace + skill (#12), MCP v2 (#14), OAuth + directory listings (#19), claimable forms (#17) | Plugin on WordPress.org. Marketplace listing. Directory submissions. Outreach continues | **Gate D (end of Mar 2027):** ≥ 8 paying agencies and ≥ €500 a month → reopen self-serve, launch on Product Hunt and Show HN |

**Money forecast** (from the money and distribution lenses; arithmetic in those files):

| Date | Own clients (E1) | Agencies (E2) | Self-serve (E3) | Monthly revenue |
|---|---|---|---|---|
| 27 Dec 2026 | €72–96 | 3–4 × €29–39 | closed | **≈ €190–290** |
| Q2 2027 | ~€150 | 15 agencies | small | **≈ €1,000** |
| Q4 2027 | ~€300 | 35 agencies | 16 × €22 | **≈ €3,000** |
| €10k | €450 | 100 agencies | 90 × €22 | **≈ €10,000**. Needs the plugin, referrals or a marketplace to work, not outreach alone |

**Optional cash lever:** paid audits (€149) and done-for-you setups (€249) bring roughly €600–1,300 a month from month 2. They cost the author's hours, so they compete with building. They are invoiced directly, never through Paddle (M20, M21, M24).

---

## 6. The price sheet, condensed

Full version in `03-money.md`. Prices exclude VAT, and USD prices use the same numbers as EUR.

| | Solo | **Studio ★** | Agency |
|---|---|---|---|
| Monthly | €12 | **€39** (founding €29: first 10 agencies, locked 24 months) | €99 |
| Annual (2 months free) | €120 | €390 | €990 |
| Clients included | 3 | 10, then +€3 each | 40, then +€2 each |
| Client portal | Reply, Inlet-branded | Reply, branded per client | + on the agency's own domain |
| Monthly report | €3 per client | Included | Agency-branded PDF |
| Monitoring | Silence alert | Hourly canary | Every 15 min |
| AI drafts per month | 50 | 300 | 1,500 |

**Add-ons:**
- WhatsApp alerts: €5 per client.
- Client sending domain: €5.
- Portal on the agency's own domain: €19.
- AI pack: €9 per 1,000 drafts.
- Vault (end-to-end encrypted forms): €8 per site.

**Free:** 1 client, 100 leads a month, a view-only portal carrying the badge. It reopens only after Gate D.

---

## 7. What we are deliberately not doing

The reasons are in each lens's "rejected" section.

| Not doing | Why |
|---|---|
| Paid search | Break-even cost per click is $0.23; developer-tool clicks cost more |
| A lifetime deal (AppSumo) | 16–17% refunds, 30–40% more support tickets, and email and AI costs that never stop |
| More `llms.txt` work | 97% of `llms.txt` files get zero traffic (Ahrefs). What counts is being cited on other pages |
| French SEO for "backend de formulaire" | Nobody searches for it. They search "formulaire WordPress ne fonctionne pas" |
| Charging per form, or per submission as the main price | It punishes success and triggers "that was spam" disputes. Overage only |
| Charging for MCP access | Every competitor gives MCP away. Charge for clients, replies and Vault |
| A voice AI receptionist | Inlet has no position on the phone line |
| A health or clinic vertical | French health-data hosting certification (HDS) and HIPAA are out of reach for a solo seller |
| SMS as the main alert channel | $0.08 per message to France plus US registration fees; WhatsApp and push are near free |
| A drag-and-drop form builder | Tally is free and better at it |
| AI replies that send themselves by default | Liability, and the EU AI Act disclosure duty. Opt-in and disclosed only |
| A native mobile app | A PWA with push works on iOS since 16.4 |

---

## 8. Decisions needed from the author

Each question has a proposed answer. Reply by number.

1. **Hours.** How many hours a week go to this rebuild? *Proposed: 20 h/week for 12 weeks. At 10 h/week, all dates double.*
2. **Local documents.** Share the payments plan and the other git-ignored notes. Paste them here or attach a private repo, not this public one. *Proposed: yes, before Phase 2.*
3. **Name.** "Inlet" is taken (a YC company; inlet.com, .io, .dev, .app, .fr; the npm package). Candidates with free domains:
   - **Crique** (crique.dev, crique.app, crique.fr, getcrique.com);
   - **Formcove** (formcove.dev, .io, .app, .fr);
   - **Calanque**, **Relais**, **Amarre**.
   
   No trademark search has been done. *Proposed: rename now to Crique or Formcove, before any listing, cold email or case study carries the old name.*
4. **Legal entity.** Is one registered, or can it be by November? *Proposed: yes. Paddle, the Claude and ChatGPT directories, Vercel and WordPress.org all require a named legal person.*
5. **Payments.** *Proposed: Paddle for subscriptions, since it handles EU VAT and US sales tax. Direct invoices (Stripe Invoicing or bank transfer) for services and for the own-client lead line.*
6. **Own clients first.** Will you offer the lead line to your existing client businesses this month? *Proposed: yes, at €12–15 per site, inside the maintenance invoice.*
7. **Founding agencies.** Sell the €29 founding price (first 10 agencies, locked 24 months) before building Phase 2? *Proposed: yes. It is the court's gate and it funds the build.*
8. **The teacher's order.** Reply inbox first (Phase 1), encryption at rest before it (Phase 0), MCP v2 in Phase 3, Vault in 2027. *Proposed: yes.*
9. **Queued fix tasks.** The four task cards (lead loss, SSRF, stranger path, truth pass) are Phase 0. *Proposed: start them now.*

---

## Files in this folder

| File | What |
|---|---|
| [`01-teacher-ideas.md`](01-teacher-ideas.md) | The teacher's three ideas, engineered: 13-tool MCP contract and token budget, threat table and encryption tiers, inbox design, plus 13 neighbouring ideas |
| [`02-product.md`](02-product.md) | 39 product ideas: pipeline, AI, alerts, reliability, agency features, integrations, form capabilities |
| [`03-money.md`](03-money.md) | 33 money ideas: value metric, price sheet, add-ons, reseller economics, services, payment rails, the path to €1k / €3k / €10k |
| [`04-distribution.md`](04-distribution.md) | 38 distribution ideas, the rename study, and a 90-day plan with hours and expected signups per channel |
| [`05-moonshots.md`](05-moonshots.md) | 21 bold moves and moats, and the bold bet "every lead answered, and proven" |
| [`06-hater-review.md`](06-hater-review.md) | An independent attack on this plan, and what changed because of it |

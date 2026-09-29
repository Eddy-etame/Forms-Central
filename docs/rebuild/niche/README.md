# Round 2: go niche, take out the odds

**The brief (the author, 2026-09-29):**
- Make Inlet a real business that earns.
- 20 h/week.
- Not graded.
- Niche allowed.
- "Take out the odds", and push the plan's score toward 100%.

**How this was built.** Five research agents each took one lens:

| Lens | File |
|---|---|
| Vertical niches | [`01-verticals.md`](01-verticals.md) |
| Buyer niches | [`02-buyers.md`](02-buyers.md) |
| Risk register | [`03-risk-register.md`](03-risk-register.md) |
| 14-day pre-sale sprint | [`04-presale-sprint.md`](04-presale-sprint.md) |
| Offer design | [`05-offer.md`](05-offer.md) |

This page merges them. An independent hater then attacked it ([`06-hater-review.md`](06-hater-review.md)).

**What this page supersedes in plan v2** (`docs/rebuild/README.md`):
- the positioning (§1);
- the prices (§6);
- the selling part of Phases 0–1 (§5).

Everything else in v2 stays in force: the foundations F0–F6, the court's orders, the gates and the hour budget.

**Not legal or tax advice.**

---

## 1. The answer in 30 seconds

**Don't guess the niche: make buyers pay to choose it.**

From **Thu 1 Oct to Wed 14 Oct 2026**, run a **two-track pre-sale**. Both tracks sell the same paid, refundable **Founding Pass**, and both run on today's code plus about 30–50 h of build *after* the decision. **On Thu 15 Oct, build only for the track that paid.**

| | **Track B · Clubs (the lean)** | **Track A · Studios (the scale channel)** |
|---|---|---|
| **Buyer** | Private combat-sports, martial-arts and fitness clubs (1–5 locations) with a trial form and **no all-in-one gym CRM**. French-speaking Europe first, US second | **Local lead-gen studios:** small studios and freelancers who build *and keep* local-business sites on a retainer (maintenance, local SEO). French-speaking markets outside the author's trading area, plus an English twin (CallRail-directory agencies listing Web Design + SEO) |
| **Offer** | **"Zero Missed Trial Requests" / « Zéro demande d'essai perdue »:**<br>• every trial request gets an instant reply (schedule + booking link, FR/EN);<br>• one-tap "Called ✓ / Trial booked / Joined" for coaches;<br>• the form tested daily;<br>• a 14-day proof report, then monthly | **"Lead Line" / « Ligne demandes »:**<br>• every client form checked daily;<br>• every lead stored first;<br>• one monthly proof report per client, under the studio's brand |
| **Price (excl. VAT)** | **€39 per location per month, founding** (first 10 clubs, locked 12 months). List €49. US $45 / $59 | **€39 per month for 10 client sites, founding** (first 10 studios, locked 12 months), +€4 per extra site. List €59 |
| **Founding Pass** | **€117** = the first 3 months prepaid, credited. It also buys a trial-path audit delivered within 5 business days | **€117**, same terms. It also buys a lead-leak audit of up to 10 client sites |
| **Risk reversal** | • Full refund until 30 days after the first report.<br>• Automatic refund if go-live hasn't started by 18 Dec.<br>• A request lost because of us makes that month free, credited automatically. | Same |
| **Why it can win** | • **The author's head start:** he builds and runs the sites of a multi-location combat-sports club whose leads already flow through Inlet.<br>• **The shortest path to money:** clubs are operator-managed end-clients, so they don't need the stranger path or per-agency isolation first (about 20 h less build).<br>• **One extra member a year pays for the whole year.** | • **The only buyer that scales past one person's calls:** one studio brings 10+ sites.<br>• **Listable:** 25k Codeur developer profiles, 803 La Fabrique du Net agencies, ~2,010 Webflow partners, the CallRail agency directory.<br>• **Sold as churn insurance** for the studio's own retainers. |
| **Main risk** | • **Gym software already bundles lead capture** (Gymdesk, Kicksite, Spark, PushPress, Deciplus, Kimono), and Fitness Vendor sells AI replies at €99.99. So Inlet must be the **companion, not the rival**: clubs on those tools are disqualified on the call.<br>• **Many gym leads come by Instagram and WhatsApp.** | • **Competitor objection:** the author is a competing studio.<br>• **WordPress:** 65% of .fr sites with a known CMS run it, and Inlet can't take those forms without a snippet.<br>• **Slower:** 10 paying agencies by 27 Dec is ~12% likely. |

**The honest numbers** (each lens's own estimate):

| Estimate | Probability | Lens |
|---|---|---|
| Track B: ≥ 3 paying clubs by 27 Dec | ~45% | Offer |
| Track B: ≥ 5 paying by 27 Dec | ~55–60% | Vertical |
| Track B: ≥ 10 paying by 27 Dec | ~30% | Vertical |
| Track A: ≥ 3 paying agencies by 27 Dec | ~45% | Buyer |
| Track A: 10 signed letters of intent or deposits | ~35–40% | Buyer |
| The sprint gives a decisive BUILD or KILL reading in at least one track by 15 Oct | ~60% | Sprint |

---

## 2. Before day 1: the two hard blockers (≈ 5 h, €0–190)

The risk lens is blunt: **today the plan's own rules allow no revenue at all.**
1. **No legal person can invoice.** Stripe and Paddle both accept sole traders.
2. **Chain of title is open.** The plan forbids any invoice before it is settled.

Both are cheap to remove:

| Blocker | What to do | Where |
|---|---|---|
| **Who owns the code (F0)** | The first commit (6 Jul 2026) imported **17,388 lines at once**, and about **32% of today's code** still comes from it. The spec describes an agency's internal tool, and every commit uses one organisation's email domain. If any of that code was written for the agency or organisation, send each party a **one-paragraph confirmation** to sign. A ready-to-use FR/EN template is in `03-risk-register.md` §2c. Fallback: a licence-back. Last resort: rewrite the imported parts | `03` §1a #1, §2b–2c |
| **A legal person to invoice from** | Register as a sole trader where the author is tax-resident. `03` §2a gives a menu (France micro-entreprise, Belgium, UK sole trader or Ltd, US) with time and cost for each, and assumes nothing about where the author lives | `03` §2a |
| Hygiene, 0.5 h | Switch `git config user.email` to a personal address. Add a personal recovery email and 2FA recovery codes to GitHub, Vercel, Supabase, the email provider and the domain registrar | `03` #28 |

**Until both blockers clear:**
- **Deposits** are collected either as a paid audit delivered now (credited later), or as a card saved with a written mandate, "first charge on go-live day".
- **With no entity at all:** signed order forms only.
- `04-presale-sprint.md` §3 has the full decision table.

---

## 3. The 14 days (1–14 Oct): 20.5 h of selling, 10 h/week of building protected

**The build track does not move.** The court's orders ship on schedule, and the sprint never takes build hours:
- **2 Oct:** A1 (no dropped leads) and A3 (download-link security hole).
- **5 Oct:** A2, A4, A5.
- **12 Oct:** A6–A8.
- **19 Oct:** A9.

A lost lead on the live client chain is a kill criterion; a pre-sale isn't worth that risk.

| Days | Selling work (both tracks) | Targets by day 14 |
|---|---|---|
| 1 (Thu 1 Oct) | Blocker check. Two landing pages on the author's **studio domain**, sold under the studio's brand, not "Inlet" (the name collides). Payment link or order form. Scoreboard **with the decision rules written in before any result** | Pages live |
| 2–4 | **Warm names first:** the club client's introductions (ask for 3–5), plus the author's own studio and freelancer network. **Lists:** 100 studios, 60 FR + 40 EN; 80 clubs screened down to ≥ 50 qualified. **Pool size by sampling** 50 random directory entries per list | Warm ≥ 10 per track |
| 5–9 | **Cold outreach:**<br>• personal emails, ≤ 25 a day, each with one real finding from the prospect's own site;<br>• LinkedIn by hand, no automation;<br>• Instagram DMs by hand to clubs;<br>• 4–6 walk-ins at quiet hours with a printed audit. | Cold ≥ 60 (A) and ≥ 40 + 25 DMs (B) |
| 8–14 | **Calls:** the 10-question scripts are in `04` §4–5. They ask about past behaviour and money, never "would you buy". The price is said out loud on every call | ≥ 6 **offers made** per track |
| 14 (Wed 14 Oct) | A truthful "founding window closes tonight" email to positive repliers. A one-page decision memo | **Decision on Thu 15 Oct** |

**Outreach rules:**
- FR B2B email: allowed with an opt-out and the source named.
- US: CAN-SPAM applies (postal address, opt-out).
- **No cold email to Germany**, or to UK sole traders.
- **Never** submit a test to a stranger's form without the owner's consent. The owner-approved test lives inside the paid audit.
- Full rules in `04` §1.5.

**The demo, before the product is built:**
- a real audit of the prospect's own form or trial path;
- a sample monthly report built from the author's club client, anonymised and with written consent, or else marked SAMPLE;
- a 90-second recording of the real lead email.

---

## 4. The decision on 15 Oct (pre-registered, per track)

`04` §7 has the full statistics behind these rules. "D" is the deposit-equivalent: paid Pass = 1.0, card saved with mandate = 0.75, signed order form = 0.5, letter of intent = 0.25. "O" is offers made.

| Result | Rule | Then |
|---|---|---|
| **BUILD+** | D ≥ 5 | Build for this track. Raise the next cohort's price 10–20% |
| **BUILD** | D = 3–4 **and** D/O ≥ 30% | Build for this track |
| **ITERATE** | D = 1–2 | 7 more days (to 21 Oct). Change **one** thing (the hook, the deposit size or the channel), never the product |
| **KILL the track** | D = 0 with O ≥ 6 | Stop. Honour every deposit |
| **GREY** | O < 6 | Reach failed, not demand. Warm channels only for 7 days. Still O < 6 on 21 Oct: the track fails on distribution |

- **If both pass:** pick one on cold-channel deposits, then € per selling hour, then pool size, then build hours (Track B is ~20 h shorter). Build that track and honour the deposits in the other.
- **If both are killed:** the court's PIVOT (the studio's own lead line only) becomes the plan. About 96 build hours are saved, roughly €3.6–4.1k of the author's time. Under "take out the odds", that is a good outcome, not a failure.

---

## 5. What gets built after 15 Oct (and what stays manual)

**If Track B wins** (~33 h of offer-specific build, `05` §7):
- **Built:**
  - daily canary + drought alert (one digest a day);
  - signed one-tap links in the lead email (Called ✓ / Trial booked / Joined);
  - WordPress intake through Elementor's webhook action and CF7-to-webhook, on the court's authenticated server submit (A2);
  - a report-generator script;
  - the CSV-injection fix.
- **Hosted "Book a trial" page + WhatsApp opt-in:** Instagram-bio and Google-profile leads can't be reached otherwise (`01` §3.1). Copied by hand per club at first.
- **Faked for the first 10 clubs:**
  - one tenant per club, so no per-client branding build (B5);
  - booking by the club's own link;
  - incident log in a spreadsheet;
  - invoices by SEPA or Stripe invoice.
- **Go-live** from ~23 Nov, after the DPA (F3) and data lifecycle (F4).

**If Track A wins:**
- **Built:**
  - the stranger path + per-agency isolation (F2, ~20 h);
  - a **WordPress server-to-server snippet** (~1 day after A2);
  - lead-source attribution (P32, 2 days);
  - daily canary;
  - the report.
- **Go-live** 30 Nov–18 Dec.

**In both cases:**
- No inbox, no AI replies, no MCP work and no public launch before the court's Gate C (27 Dec).
- The teacher's ideas stay staged exactly as in plan v2 §3.

---

## 6. The guarantees one person can honour (`05` §3)

| Promise | Why it is safe |
|---|---|
| Nothing to lose: the Pass is refundable until 30 days after the first report | Bounded, with cash set aside: at most €2,340 for 20 Passes, left unspent until the refund windows close |
| **A request lost because of us makes that month free**, credited automatically | Capped at one month's fee, no on-call duty. "Lost" is measurable: not stored, not auto-answered, not sent |
| A broken form (one we installed) is reported within 1 business day, with the fix | Promises detection, not uptime |
| Leave any month with a full export; your previous form is put back | CSV export exists (fix the CSV injection first) |

**Refused:**
- any uptime SLA, or "no lead ever lost";
- "X new members or your money back";
- paying out the value of a lost lead;
- an answer guarantee that depends on the owner's own behaviour.

---

## 7. The odds, and how the score really rises

**The risk lens's model** (`03` §4). The inputs are judgement and are published so they can be attacked. D is the demand ceiling with perfect execution; each risk group left in place multiplies the odds down.

| Step | €100 MRR by Jan 2027 | €1k MRR by Sep 2027 | €3k MRR by Sep 2028 |
|---|---|---|---|
| Today (no entity, title open) | **0%** | **0%** | **0%** |
| + entity + title letters (~5 h) | 30% | 3% | 1% |
| + every removal move in `03` (~75–95 h, ~€60/mo) | 62% | 16% | 7% |
| + 2 businesses sign the lead line (1 outside the club client) | 75% | 16% | 7% |
| + 3 agencies or clubs **paid** by 27 Dec (Gate C) | 75% | 28% | 11% |
| + ≥ 8 paying and ≥ €500 MRR by 27 Mar 2027 (Gate D) | 75% | **47%** | **18%** |

**What these numbers mean for "100%":**
- **Writing cannot raise these numbers.** Only removals and evidence can, and the sprint is the cheapest source of evidence (20.5 h, €0 spend).
- **What removal can take to near zero:**
  - lead loss;
  - provider-terms breaches;
  - the security holes;
  - legal pages, hosting terms and chargebacks;
  - WhatsApp and AI Act exposure (by not building those features);
  - the trademark (by selling under the studio's brand).
- **What nothing removes:**
  - demand at the price;
  - competition;
  - small-business churn (3–7% a month);
  - one-person distribution;
  - €/hour below client work until ~€3k MRR.
- **So "100%" is reachable for the *structure*** (every euro at risk is refundable, and nothing is built before buyers pay). It is **not** reachable for the *outcome*.

**What each sprint result does to the plan's score** (sprint lens, judgement):

| Sprint result | Plan score |
|---|---|
| Both tracks BUILD | ~74 |
| Track A BUILD with a cold-channel deposit | ~72 |
| Track B only | ~68 |
| ITERATE | ~63 |
| GREY | ~57 |
| Both KILLED | The external plan drops to ≤ 40, and the court's PIVOT takes over, which saves the build hours |

---

## 8. What changed from plan v2, and why

| v2 said | Round 2 says | Because |
|---|---|---|
| Buyer: "hand-coding studios" | Clubs (B) or **local lead-gen studios** (A), chosen by deposits | Astro's agency directory lists **4** agencies, so "hand-coding studios" cannot be listed; a buyer must be defined by job (`02` C1). Clubs carry the author's head start (`01`) |
| Founding €29 for 10 clients, locked 24 months | €39 founding, locked 12 months; €49–59 list | At €29, the founder's own hours make each customer loss-making until reports are automated (`05` §0, §4) |
| "Sell before you build" as a principle | A **paid, refundable Founding Pass** with pre-registered decision rules | Money is the only evidence that moves the odds; letters of intent weigh 0.25 (`04` §1.1) |
| Gate A: "≥ 2 client businesses agree" | Same, plus both blockers (entity, title) and the sprint decision on 15 Oct | Without the blockers, revenue is 0% by the plan's own rules (`03`) |
| WordPress bridge in 2027 | A WordPress intake is part of either build (webhook actions or snippet) | 65% of .fr sites with a known CMS run WordPress; without it most portfolios are unreachable (`02` C2) |
| Portal as a selling point | **The report** is the selling point | Clients prefer reports (35%) and meetings (35%) to dashboards (27%) (`02` C3) |
| "Inlet" brand in outreach | Sell under the studio's brand until a trademark check | The name collides (a YC company, most domains) |

---

## 9. Not doing (from all five lenses)

| Not doing | Why |
|---|---|
| **US gyms and martial-arts schools, direct, now** | Gymdesk, Kicksite, PushPress, Spark and GoHighLevel agencies already sell this job (`01` F2) |
| **Gym-marketing agencies as buyers** | They run on GoHighLevel, which has forms, funnels and reporting (`02` §5) |
| Associations and amateur clubs | Free tools (Kalisport), budgets voted by volunteers, September-only intake |
| Real estate for strangers before 2027 | Incumbents bundle sites, CRM and AI. Test it only on the author's own real-estate clients (`01` §3.2, `05` V3) |
| Ads-only agencies; "replace CallRail" | They don't control the form, and CallRail is entrenched. Be the **form-first complement** (`02` §4) |
| Waitlists; letters of intent as the main metric | They measure curiosity, not money (`04` §1.1) |
| A free pilot | Unpaid pilots fail about 95% of the time (SaaStr, `05` §1) |
| Lifetime deals | 16–17% refunds, costs that never stop |
| Outcome guarantees, uptime SLAs | Unbounded exposure for one person (`05` §3) |
| A US LLC by default | Form 5472 carries a $25k penalty trap for foreign owners; a sole trader is faster (`03` #25) |
| Filing trademarks now (~€1,157) | Money spent before any demand evidence |
| Rewriting git history to hide the docs | The public fork and caches keep everything (`03` §3) |
| Health questions or medical certificates in any club form | Health-data law. Collect the parent's contact details only |

---

## 10. Decisions needed from the author

Answer by number; each question has a proposed answer.

1. **The imported code.** On 6 Jul 2026, the first commit brought in 17,388 lines at once. Was that code written by you, on your own time? Answer **a** (yes, mine, my own time) or **b** (written for the agency or the organisation, as a job, internship or contract). *Proposed: if b, or if unsure, send the one-paragraph letter from `03` §2c this week. No invoice goes out before it is signed.*
2. **Can you invoice today through a registered business?** Yes or no. The country isn't needed. *Proposed: if no, register as a sole trader this week from the menu in `03` §2a.*
3. **Start the sprint on Thu 1 Oct?** *Proposed: yes. 20.5 selling hours over 14 days, with the build hours protected.*
4. **Your club client.** Will they give 3–5 introductions to other club owners, let you use their anonymised request numbers as the demo report (in writing), and keep a 14-day log of where trial requests come from (form, Instagram, WhatsApp, phone)? *Proposed: ask this week; it is the strongest single lever on Track B.*
5. **The prices:**
   - clubs: €39 founding (12 months) / €49 list, per location;
   - studios: €39 founding / €59 list, for 10 sites;
   - Founding Pass: €117.
   
   *Proposed: yes.*
6. **Sell under your studio's brand, not "Inlet", until a trademark check.** *Proposed: yes.*
7. **Account hygiene today:** a personal git email, plus a recovery email and 2FA on GitHub, Vercel, Supabase and your email provider. *Proposed: yes, 0.5 h.*
8. **The four queued fix tasks** (lead loss, download-link hole, stranger path, truth pass) are the court's orders, due from 2 Oct. *Proposed: start now, download-link hole first.*
9. **This folder is public too.** Competitors can read the offer and the prices. *Proposed: accept it for now, since execution speed is the moat. Keep future pricing experiments and prospect lists in local files, not in the repo.*

---

## Files in this folder

| File | What |
|---|---|
| [`01-verticals.md`](01-verticals.md) | 25 verticals scored; deep dives on fight & fitness, real estate, home improvement |
| [`02-buyers.md`](02-buyers.md) | 19 buyer niches scored; local lead-gen studios FR/EN; lead proof vs CallRail and WhatConverts |
| [`03-risk-register.md`](03-risk-register.md) | 50 risks with removal moves; legal set-up menu; chain of title in plain words; the ownership letter template; the odds model |
| [`04-presale-sprint.md`](04-presale-sprint.md) | Landing pages EN/FR, outreach templates, call scripts, day-by-day schedule, decision rules |
| [`05-offer.md`](05-offer.md) | Five offers, guarantees, value math, the one-page offer sheet EN/FR, build vs manual |
| [`06-hater-review.md`](06-hater-review.md) | The independent attack on this page, and what changed |

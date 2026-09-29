# Round 2: go niche, take out the odds

**The brief (the author, 2026-09-29):**
- Make Inlet a real business that earns.
- 20 h/week.
- Not graded.
- Niche allowed.
- "Take out the odds", and push the plan's score toward 100%.
- Markets: Europe and the US, in English and French.
- The repository stays public.

**How this was built.**
1. Five research agents each took one lens:

   | Lens | File |
   |---|---|
   | Vertical niches | [`01-verticals.md`](01-verticals.md) |
   | Buyer niches | [`02-buyers.md`](02-buyers.md) |
   | Risk register | [`03-risk-register.md`](03-risk-register.md) |
   | 14-day pre-sale sprint | [`04-presale-sprint.md`](04-presale-sprint.md) |
   | Offer design | [`05-offer.md`](05-offer.md) |

2. They were merged into a first draft (commit `e021fe9`): a two-track pre-sale with a €117 refundable "Founding Pass".
3. An independent hater attacked that draft ([`06-hater-review.md`](06-hater-review.md)). It found 27 flaws, 3 of them fatal, and scored it **36/100** as an executable plan.
4. **This version applies all 27 findings.** The mapping from finding to change is at the end of `06`.

**What changed, in three lines** (the hater's top three changes):
1. **One niche, not two:** clubs. Studios get unpaid discovery conversations only.
2. **Lawful money only:** no prepaid pass. Existing clients sign order forms that are invoiced once the court's B1–B3 are live. Strangers can buy a separate paid studio audit.
3. **The author's own data first:** one database query tonight can kill the niche before any selling hour is spent.

**What this page supersedes in plan v2** (`docs/rebuild/README.md`):
- the positioning (§1);
- the prices (§6);
- the selling part of Phases 0–1 (§5).

Every other part of v2 stays in force unless §8 names an override with its reason.

**Not legal or tax advice.**

---

## 1. The answer in 30 seconds

**One niche: private combat-sports, martial-arts and fitness clubs.**
- **Size:** 1–5 locations.
- **Market:** French-speaking Europe. France first, then French-speaking Belgium.
- **What they must have:** a trial form.
- **What rules them out:** already running an all-in-one gym CRM.

**One offer: « Ligne Essais » / "Trial Request Line".**
- Every trial request is stored first and gets an instant reply (schedule and booking link).
- Coaches get one-tap buttons: "Called ✓", "Trial booked", "Joined".
- The form is tested daily.
- A proof report every month.
- **It works next to the club's gym software; it doesn't replace it.**

**Money comes in three honest steps, and nothing is charged before the court's B1–B3 are live:**

| Step | Who | Instrument | When money moves |
|---|---|---|---|
| **1. Own clients, Days 1–7** | The anchor club (all its locations) and at least 2 other existing clients | A signed lead-line **order form**, at v2's price (€12–15 per site on the maintenance invoice) | **Invoiced the day B1–B3 go live** (target 13 Nov). The anchor alone is ~€96–120 MRR, which clears the €100 MRR goal |
| **2. Strangers: demand** | Qualified clubs outside the anchor's area | A signed **order form** with price and start date | On the start date, after B1–B3. **Reported, but never triggers BUILD** |
| **3. Strangers: cash** | The same clubs | An optional **€149 trial-path audit**. It is a web-studio service, invoiced by the author's registered business. **It is not refundable, and it is not credited** against the subscription | On the audit invoice. **Only this cash counts toward BUILD** (§4) |

**The audit is the author's core trade, not a trick.**
- Every broken trial path it finds can become a paid fix or site rebuild (`01`:261, **[H]**).
- Its 1.5 h of delivery earns about €99/h, against €38–43/h for outside client work.

**Why clubs:**
- **Head start.** The author builds and runs the 8 sites of a multi-location combat-sports club whose leads already flow through Inlet (V:317, V:338).
- **Shortest path to money.** Clubs are onboarded by the operator, so they don't need the stranger path or per-agency isolation (F2, ~20 h) first.
- **Value.** One extra member a year pays for the whole year (`05` §4).

**Why this could still fail** (every point is tested below, none is waved away):
1. **Competition.** Kimono Pro costs €39/month for unlimited members and several clubs, and already includes trial classes and a public page (https://join-kimono.com/fr). The qualified target (clubs with no software) is also Kimono's next customer.
2. **Channels.** Many trial requests arrive by Instagram, WhatsApp or phone, not the form.
3. **Timing.** The sprint runs just after the September intake peak.
4. **One person.** Distribution stays one person's calls.

---

## 2. Day 0 (tonight): the author's own data, and the blockers

### 2a. The query that can kill the niche before any selling hour

Run this in the Supabase SQL editor. It only reads data. Replace `<ANCHOR_CLIENT_ID>` with the anchor club's `clients.id`, then map each form to its location by hand.

```sql
-- Anchor club: non-spam requests, lead e-mails and auto-replies per form per month, Jul–Sep 2026 (read-only)
with f as (
  select id, name, auto_reply_enabled
  from forms
  where client_id = '<ANCHOR_CLIENT_ID>'
),
m as (
  select generate_series('2026-07-01'::timestamptz, '2026-09-01'::timestamptz, interval '1 month') as month
),
s as (
  select form_id, date_trunc('month', created_at) as month, count(*) as requests
  from submissions
  where form_id in (select id from f)
    and created_at >= '2026-07-01' and created_at < '2026-10-01'
    and coalesce(spam_status, 'clean') <> 'spam'
  group by 1, 2
),
e as (
  select form_id, date_trunc('month', created_at) as month,
         count(*) filter (where kind = 'lead')       as lead_emails,
         count(*) filter (where kind = 'auto_reply') as auto_replies
  from email_log
  where form_id in (select id from f)
    and created_at >= '2026-07-01' and created_at < '2026-10-01'
  group by 1, 2
)
select f.name as form, f.auto_reply_enabled, m.month::date as month,
       coalesce(s.requests, 0)     as requests,
       coalesce(e.lead_emails, 0)  as lead_emails,
       coalesce(e.auto_replies, 0) as auto_replies
from f
cross join m
left join s on s.form_id = f.id and s.month = m.month
left join e on e.form_id = f.id and e.month = m.month
order by f.name, m.month;
```

**How to read the result:**
- **It is a floor.** Before A1, keyword hits were dropped without being stored (V:263), so real demand was higher.
- **Subtract your own test submissions** by reading the payloads.
- **First-answer time is not in the database.** It comes from the 14-day log in 2b.
- `lead_emails` lower than `requests` means notifications failed or were paused (A7, A8).

**Pre-registered kill rule, written before the result is seen:**
- If the mean across Jul–Sep is **under 4 non-spam form requests per location per month**, the clubs niche is killed before it starts. Below 4, the monthly report is too thin to sell (`05`, "Your honest confidence").
- The sprint's selling hours then go to the fallback in §4c.

### 2b. The anchor club, before any other club is contacted (≈ 1.5 h, one meeting)

The anchor is the only live client. The plan must not work against it (`06` finding 5).

1. **Sign the lead-line order form** for all its locations (step 1 above). The anchor never pays more than a stranger for the same line: it gets the better of v2's per-site price and the club price in §3.
2. **Sign the DPA** (Art. 28) as soon as it exists (B2). Until then, its data is used only to run its own service.
3. **Agree a written exclusivity radius.** No club inside its cities is contacted, visited or sold to, for 12 months.
4. **Get consent first, then ask for introductions.** Ask whether it agrees to the author selling to clubs outside the radius. Only if it says yes, ask for 3–5 introductions to owners elsewhere.
5. **Keep a 14-day channel log** at the front desk, from Day 1. Every trial request is marked form, Instagram, WhatsApp, phone or walk-in.
6. **Demo data:** demos never use the anchor's numbers. They use a **canary** lead and synthetic figures marked SAMPLE.

**Second pre-registered kill rule:** if the 14-day log shows the **form plus the club's own trial page under 40% of trial requests**, the clubs niche is killed, whatever cash has come in (`01`:270). The court's own trigger then applies: if WhatsApp carries the majority, the paid line would have to be WhatsApp alerts, not email (V:400).

### 2c. Blockers and set-up (≈ 4.5 h this week)

| Item | What to do | Time |
|---|---|---|
| **Employment and IP (answer first)** | Are you employed by, apprenticed to or interning at the agency, or at the organisation behind the commit email? Does your contract have an exclusivity or IP clause? If yes to any, nothing is sold and no letter is sent until the contract is read (`06` Q1) | 0.25 h |
| **Who owns the code (F0 / B1)** | The first commit (6 Jul 2026) imported **17,388 lines**, and ~32% of today's code still traces to it (`03` §2b). If that code was not written by you on your own time, send the corrected one-paragraph letter in `03` §2c: free of charge, with a licence back, and no confidentiality clause. **Before sending it, remove `NOTE.md` from HEAD:** it describes the code as an agency's internal service and names its SMTP account | 0.5 h |
| **A registered business to invoice from** | If you have none, register as a sole trader where you are tax-resident (`03` §2a). Until the number is issued, **everything counts as an order form, and no payment link is published** | 1.5 h |
| **French e-invoicing and EU VAT** | Since 1 Sep 2026, every French VAT-liable business must be able to *receive* e-invoices through an approved platform (https://www.economie.gouv.fr/tout-savoir-sur-la-facturation-electronique-pour-les-entreprises). Selling to Belgian clubs needs an intra-EU VAT number and a reverse-charge mention on the invoice | 1 h |
| **Account hygiene** | Switch `git config user.email` to a personal address. Add a personal recovery email and 2FA recovery codes to GitHub, Vercel, Supabase, the email provider and the domain registrar | 0.5 h |
| **Two other existing clients** | Offer them the lead-line order form (step 1). The court asks for offers to at least 3 distinct existing clients by 28 Oct (V:321) | 1 h |

**Set aside social contributions on every euro received.** A French micro-entrepreneur pays 21.2% (commercial services) or 25.6% (liberal professions) of turnover (`03` §2a). Check your own regime.

---

## 3. The offer (a hypothesis to test, not a result)

| | « Ligne Essais » / Trial Request Line |
|---|---|
| **Buyer** | Private combat-sports, martial-arts and fitness clubs, 1–5 locations, with a web trial form and no all-in-one gym CRM. France first, then French-speaking Belgium |
| **Promise** | • Every trial request that reaches the form is stored first and gets an instant reply (schedule plus booking link).<br>• One-tap "Called ✓ / Trial booked / Joined" buttons for coaches.<br>• The form is tested daily.<br>• A monthly proof report.<br>No promise about requests that never reach the form |
| **Price (excl. VAT)** | **Per club, up to 3 locations:**<br>• founding **€39/month** for the first 10 clubs, locked for 12 months;<br>• list **€49**;<br>• +€15 per location beyond 3.<br>**This is a hypothesis.** The order forms test it |
| **Term** | The first period runs to **31 Jan 2027**, then month to month. Clubs judge it on the January intake, not on December, the weakest month. Where the club kept logs, each report compares the same weeks of last year |
| **Go-live** | From ~23 Nov, after B1–B3. **At most 5 clubs go live in 2026**; later orders start in January |
| **Position** | "Works next to your gym software." Inlet already has outgoing webhooks. Whether Kimono or Deciplus accept leads by API is unverified **[H]**, so no integration is promised before a club asks for one |
| **Trial page** | For requests that come through the Instagram bio or the Google profile, the studio builds a "Book a trial" page **on the club's own site**, with a plain `wa.me` link. It is a paid studio job, not a new Inlet feature. **Inlet sends nothing on WhatsApp** |
| **The €149 audit** | **The test:** a test request through the club's own trial path, with the owner's written consent.<br>**Staff first:** before the test, the owner gives staff the staff notice from the audit kit. French law requires employees to be told in advance how they are evaluated (L1222-3; Cass. soc. 6 Sept 2023, n° 22-13.783).<br>**Delivered:** a timed report and a fix list, within 5 business days.<br>**Terms:** non-refundable, not credited. |
| **Guarantees** (`05` §3) | • **A request lost because of us** makes that month free, credited automatically, capped at one month's fee.<br>• **A broken form we installed** is reported within 1 business day, with the fix.<br>• **Leaving:** any month, with a full export.<br>**Refused:** uptime SLAs, "no lead ever lost", "X new members or your money back", paying out the value of a lost lead |
| **Forms** | Every club form carries the notice "No health information, please" / « Merci de n'indiquer aucune information de santé ». Retention is short (B3). No medical questions or certificates |

**Before Day 1, regenerate the scripts.** The sprint lens (`04` §4–5) and the offer sheet (`05` §6) still carry older price sheets (`06` finding 17). Copy prices only from this table.

---

## 4. The sprint: 3 weeks, one track, cash-only decision

### 4a. When it starts, and the hours (rebuilt from unit costs)

**The sprint starts the day after A1 and A3 are live in production.**
- If both ship by Fri 2 Oct, the sprint runs **Mon 5 Oct → Sun 25 Oct**, with the decision on **Mon 26 Oct**. That is two days before the court's 28 Oct gate.
- If they ship later, every date moves by the same amount.
- **Why 3 weeks instead of 14 days:** at honest unit costs, the draft's 14-day volume needed 50–60 h, not 20.5 h (`06` finding 2).

**The build never moves.**
- The court's A1–A8 need 19–27 h by 12 Oct (V:296), so build keeps **14 h/week until 12 Oct**.
- After that it drops to ~5 h/week to 25 Oct: A9 by 19 Oct, B1, and the 14-day "I've answered" baseline (v2 Phase 0).
- **Slipped to Phase 1, stated:** private attachments (8 h, part of B3, which is still due 13 Nov) and F5 attribution-lite (2 h).
- **Selling never borrows build hours.** If the build overruns, selling volume drops. The A-orders never slip.

**Unit costs:**

| Work | Cost |
|---|---|
| A cold email with one real finding from the club's own site | 5 min |
| A free scan, on request only | 15 min |
| Screening one directory entry | 2 min |
| A call, including preparation | 45 min |
| A walk-in, including travel **[H]** | 1 h |
| A paid audit | 1.5 h: billable studio work, logged **outside** the 20 h Inlet budget |

**Selling budget, 29 Sep → 25 Oct: ~42 h.**

| Week | Hours (build + selling) | Selling work | Cost |
|---|---|---|---|
| **29 Sep – 4 Oct** | 14 + 6 | Day 0 query, anchor meeting, 2 other existing clients, blockers (§2) | 6 h |
| **5 – 11 Oct** | 14 + 6 | **Set-up:** one French page on the studio domain (its own form posts through the studio's server relay on A2's authenticated submit, so no Inlet host shows), the order form, audit terms with withdrawal information, the staff-notice template, a recorded canary demo, and the scoreboard with the rules below written in (3 h).<br>**Measure the pool:** screen 25 Google Maps entries and record the qualification rate (1 h). Then screen to a target of `50 ÷ rate`, capped by hours; if the rate is under 20%, the target becomes 25 qualified (1 h).<br>**12 finding emails** (1 h) | 6 h |
| **12 – 25 Oct** | ~5 + 15 per week | **Warm first:** anchor introductions, if the anchor consented.<br>**Screening:** 1 h.<br>**36 finding emails:** 3 h.<br>**6 walk-ins outside the anchor's radius:** 6 h.<br>**10 calls:** 7.5 h.<br>**8 scans on request:** 2 h.<br>**10 unpaid studio discovery conversations** (§4d): 9 h.<br>**Decision memo:** 1 h | 29.5 h |

**What that volume buys, honestly:**
- The cold benchmark is 1.0–2.5 meetings per 100 emails (`04` §1.3), so 48 emails bring about 1 call.
- **Most offers must come from warm introductions and walk-ins.**
- Target: **at least 10 offers** (O). An offer means a qualified owner has heard the price in a conversation.

### 4b. Outreach rules

- **Cold email:** from a **separate subdomain and mailbox**, never the domain or provider that sends lead notifications. Spam complaints must never reach the court's kill metric (A7 at V:269; V:323).
  - Each email names its source and carries an opt-out.
  - **No cold email to Germany**, or to UK sole traders (`04` §1.5).
- **Instagram:** DMs only to clubs that have already interacted with the studio, **at most 5 a day**. Instagram's guidelines ban repeated commercial contact without consent.
- **Walk-ins:**
  - **Never inside the anchor's exclusivity radius.**
  - **Nothing is signed and nothing is paid at a walk-in.** The order form follows by email.
  - Treat any sale that follows a walk-in as an off-premises contract (L221-3). For clubs with ≤ 5 employees, give 14-day withdrawal information (L221-18) and take no payment in the first 7 days (L221-10).
- **No false scarcity.** No "window closes tonight".
  - Use a true, dated cap: "10 founding places, N left".
  - A closed price is never reopened (L121-4 7°, extended to professionals by L121-5).
- **Never** submit a test to a stranger's form without the owner's written consent. The test lives inside the paid audit.
- **The demo** is the recorded canary lead plus a SAMPLE report. Never the anchor's data, and never a real prospect's.

### 4c. The decision on Mon 26 Oct (pre-registered, cash only)

**Definitions:**
- **O** = offers made.
- **P** = paid audits, as cash received.
- Order forms are reported next to P, but **they never trigger BUILD**.
- **The first rule that matches wins.** So every case has exactly one outcome.

| # | Rule | Result | Then |
|---|---|---|---|
| 0 | The Day 0 query or the 14-day channel log hit a kill rule (§2) | **KILL** | Stop the clubs niche and go to the fallback below |
| 1 | P ≥ 3 **and** P/O ≥ 25% | **BUILD** | Build the clubs line (§5) |
| 2 | O < 8 | **GREY** | Reach failed, not demand. Warm channels only for 7 more days. If O is still under 8 on 1 Nov, the niche fails on distribution |
| 3 | P = 0 **and** O ≥ 10 | **KILL** | Stop the clubs niche and go to the fallback below |
| 4 | Anything else (P = 1–2; P = 0 with O = 8–9; P ≥ 3 with P/O < 25%) | **ITERATE** | 7 more days, to Sun 1 Nov. Change **one** thing (the hook, the audit price or the channel), never the product. Then apply rules 1–3 again. Anything but BUILD on 2 Nov counts as KILL |

**If there is no registered business by 26 Oct:** audits are ordered on a signed quote and paid when the invoice can be issued. The decision waits up to 14 days for the cash. The rule never changes.

**How strong each rule is.** The model is binomial, with a true close rate *p* on each offer:

| True close rate *p* | P(BUILD) at O = 8 | at O = 10 | at O = 12 | P(false KILL) at O = 10 | at O = 12 |
|---|---|---|---|---|---|
| 10% | 3.8% | 7.0% | 11.1% | 34.9% | 28.2% |
| 15% | 10.5% | 18.0% | 26.4% | 19.7% | 14.2% |
| 20% | 20.3% | 32.2% | 44.2% | 10.7% | 6.9% |
| 30% | 44.8% | 61.7% | 74.7% | 2.8% | 1.4% |
| 40% | 68.5% | 83.3% | 91.7% | 0.6% | 0.2% |

**How to read it:**
- A good niche (*p* = 30%) reaches BUILD at 10 offers about 6 times in 10.
- A weak one (*p* = 15%) is wrongly killed about 1 time in 5.
- **The sprint can't prove demand. It can only make a wrong turn cheaper.**

**The fallback, if clubs are killed:**
- The court's PIVOT becomes the plan: the lead line for the author's own clients (step 1).
- Plus the 10 studio discovery conversations, which keep the external option open past 28 Oct.
- The niche question reopens on 2 Nov, with that evidence in hand.
- About 33 h of club build are saved.

### 4d. Studios: discovery only, and why

- **Local lead-gen studios stay the only buyer that scales past one person's calls** (`02` §3.1). But selling to them now breaks three things:
  - v2 forbids selling to competing studios before F2's per-agency isolation (R:320);
  - the draft's €39 founding price is still loss-making on founder hours before the report is automated (`05` §4);
  - their technical buyers will find the Inlet host, where A5 and A6 are still undone (`06` finding 9).
- **So in October there are 10 unpaid discovery conversations** with studios and freelancers who build and keep local-business sites. That meets the court's 28 Oct requirement (V:320).
  - **Excluded:** the agency the spec was written for, and the author's own clients.
  - One of the 10 is **a sport-club web agency**, asked about reselling (`01`:292). A reseller pilot comes only after F2.
- **Not before A5 and A6 are live:** no pitch email and no price.
  - The "I looked at 3 sites in your portfolio" hook is dropped.
  - Scans are done only on request.
- **English and the US come later, through this channel.** Once F2, lead-source attribution (P32) and the automated report exist, the same offer goes to English-speaking studios. That is how the author's EN/US launch goal is served without fighting the US gym software head-on (§9).

### 4e. The scoreboard (the first row comes first)

| Row | Target | Date |
|---|---|---|
| **Existing clients: signed lead-line order forms** | Anchor (all locations) + ≥ 1 other business signed; offers to ≥ 3 distinct clients | 28 Oct |
| Anchor channel log (form + trial page share) | Recorded; kill below 40% | ~15 Oct |
| Club offers (O), by channel (warm, walk-in, cold) | ≥ 10 | 25 Oct |
| **Paid audits (P), cash** | ≥ 3 and P/O ≥ 25% | 26 Oct (or +14 days for cash) |
| Club order forms signed (reported, never decisive) | — | 25 Oct |
| Studio discovery conversations | 10 | 28 Oct |
| Hours: build / selling / billable audit (timesheet) | 14 + 6 per week to 12 Oct, then ~5 + 15 | Weekly |

---

## 5. After a BUILD (and what stays manual)

**Built, ~33 h, 27 Oct → 27 Nov** (`05` §7):
- the daily canary plus a drought alert (one digest a day);
- signed one-tap links in the lead email (Called ✓ / Trial booked / Joined);
- WordPress intake through Elementor's webhook action and CF7-to-webhook, on the court's authenticated server submit (A2);
- the report-generator script;
- the CSV-injection fix.

**Also in Phase 1:** B2 and B3 (legal pages, DPA, retention, and the slipped private attachments).
- Together that is about **49 h of build against ~45 h available**.
- **If it overruns,** the report script moves to Phase 2 and the first reports are sent by hand.

**Faked for the first 5 clubs:**
- one tenant per club, created by the operator with exact origins (no `'*'`);
- booking through the club's own link;
- an incident log in a spreadsheet;
- invoices by SEPA or a Stripe invoice.

**Not before Gate C (27 Dec), in any case:** no inbox, no AI replies, no MCP work, no public launch. The teacher's ideas stay staged exactly as in v2 §3.

**Money forecast to 27 Dec** (restated, `06` finding 17; every range is **[H]**):

| Line | 27 Dec 2026 |
|---|---|
| Own clients: lead line | €72–120 MRR (6–8 sites at €12–15; the anchor at the better price) |
| Clubs: « Ligne Essais » | €0–195 MRR (0–5 go-lives at €39) |
| Studios | €0 (discovery only) |
| **Total recurring** | **≈ €72–315 MRR** |
| Audits (one-off studio revenue, not MRR) | €0–1,490 (0–10 × €149) |

---

## 6. The odds, honestly

**No lens estimated this exact plan.** The draft's probability table mixed figures from other plans, and two of its rows contradicted each other (`06` finding 6).
- **The nearest figure:** the sprint lens gave clubs 30–40% for ≥ 3 deposits in 14 days (`04`, "Your honest confidence"). That was with a *refundable* €117 pass. A non-refundable €149 audit is a harder sell **[H]**, so that figure is **not comparable**.
- **The honest number for the sprint** is the power table in §4c. For example, if clubs truly close at 30%, BUILD comes up 62% of the time at 10 offers.

**The risk lens's model, corrected** (`03` §4, re-run after `06` finding 15):
- Each ownership letter is weighted by its chance of being signed in time (about 0.55 for the €100 target).
- The "distribution" removal is dropped, because it cannot be removed.
- Pre-evidence odds of €1k MRR are capped at the category base rate (10%).
- **Rows marked IF are conditions, not moves you can make.**

| Row | €100 MRR by Jan 2027 | €1k MRR by Sep 2027 | €3k MRR by Sep 2028 |
|---|---|---|---|
| Today (no business, ownership open) | **0%** | **0%** | **0%** |
| A registered business + ownership letters sent | 16.8% | 2.2% | 0.5% |
| + every removal move in `03` (G1–G6, ~75–95 h, ~€60/month) | 34.0% | 10.0% (capped) | 3.9% |
| **IF the code is yours, written on your own time (no letter needed)**, + every removal | **61.8%** | 10.0% (capped) | 4.6% |
| IF 2 businesses sign the lead line | 41.2% | 10.4% | 3.9% |
| IF ≥ 3 clubs have paid for a month in service by 27 Dec | ≈ 100% (3 × €39 = €117) | 17.9% | 6.2% |
| IF Gate D: ≥ 8 paying and ≥ €500 MRR by 27 Mar 2027 | ≈ 100% | 26.0% | 8.6% |

**What this means for "100%":**
- **Only two things move these numbers: your answers and cash.** Writing doesn't.
  - Your answer on the imported code alone moves the first column from 34% to 62%.
  - The anchor's signature and the Day 0 query come next.
- **Removal can take these to near zero:**
  - lead loss;
  - provider-terms breaches;
  - the security holes;
  - legal pages, hosting terms and chargebacks;
  - WhatsApp and AI Act exposure (by not building those features);
  - the trademark (by selling under the studio's brand).
- **Nothing removes these:**
  - demand at the price;
  - competition;
  - small-business churn (3–7% a month);
  - one-person distribution;
  - €/h below client work until ~€3k MRR.
- **So "100%" is reachable for the structure, not the outcome.** The structure is now:
  - no money is taken before the product is lawful to charge for;
  - no build before cash;
  - the only paid thing sold to strangers is worth its price on its own;
  - a pre-registered kill ends the niche on the author's own data.

**This page carries no self-graded score.** The last independent score is 36/100, for the draft (`06`). Only a new independent review can give the next one.

---

## 7. Operations for one person

- **Incidents:** a lead-loss incident on a paying account is fixed or disclosed within 48 h (the court's criterion). Monitoring alerts go to a second address.
- **Onboarding:** ~3 h per club. That is why at most 5 clubs go live in 2026.
- **If the niche dies:** unpaid order forms are cancelled in writing, and there is nothing to refund. Audits already sold are delivered, since they stand on their own.
- **Public repository:** prospect lists, prices under test and client data live in local files, never in the repo.

---

## 8. Overrides of the court and of plan v2, stated

| Rule | Source | Round 2 | Why |
|---|---|---|---|
| "Stop selling to strangers, paid CTAs" in days 1–30 | V:314 | **Overridden for clubs only**, from the sprint's Day 1: studio audits and Inlet order forms, with **no Inlet payment** | Cash is the only evidence that moves the odds. The court's aims are kept: the sprint starts only after A1 + A3 are live, nothing Inlet is charged before B1–B3, and the audit is a studio service invoiced by a registered business |
| No charging anyone before B1–B3 | V:277 | **Complied with.** Order forms are invoiced when B1–B3 go live | — |
| No invoice before F0 | R:195 | **Complied with for Inlet.** The audit licenses no Inlet code, so F0 doesn't block it; the employment question (§2c) does | — |
| No selling to competing studios before F2 | R:320 | **Complied with.** Studios get discovery only | — |
| Gate A: "≥ 500 studios named" by 19 Oct | R:198 | **Dropped.** Gate A moves to the court's 28 Oct and keeps its other criteria: 9 of 9 A-orders, ownership confirmed or under way, ≥ 2 client businesses signed, baseline running | The buyer is now clubs, and the club pool is measured by sampling (§4a) |
| Gate C "word for word": ≥ 3 external **agencies** paid | R:237 | **Clubs count as the external buyer**: ≥ 3 clubs have paid for a month of live service (cash, not a deposit) by 27 Dec. The studio line criteria stay word for word | The external buyer changed. The court's intent (strangers paying real money for a service in use) is kept |
| The court's external track (hand-coding agencies) | V:320 | **Kept alive** by the 10 discovery conversations by 28 Oct | So a clubs KILL still leaves a scale option |
| The freeze on new surfaces and WhatsApp | V:366 | **Complied with.** The trial page lives on the club's own site, as a studio job. The `wa.me` link is plain HTML, and Inlet sends nothing on WhatsApp | — |
| F6: make the repo private | R:102 | **Reversed by the author's decision** (29 Sep): the repo stays public | The author's call. Its consequence is accepted: competitors can read this page |
| Phase 0 split: 14 h build + 6 h selling | R:170 | Kept to 12 Oct. Then ~5 h build + 15 h selling to 25 Oct. Private attachments and F5 slip to Phase 1 | The A-orders are done by 12 Oct. B3 is still due 13 Nov |

**If the repo's visibility ever changes:**
- A public repo's fork can't be made private.
- But both accounts are the author's, so deleting the fork and then making the original private would work.
- GitHub forks copy only the default branch by default, so check what the fork actually holds before deciding.

---

## 9. Not doing

| Not doing | Why |
|---|---|
| **The US and English clubs, direct, now** | Gymdesk, Kicksite, PushPress, Spark and GoHighLevel agencies already sell this job (`01` §0). **The EN/US goal is kept:** it goes through studios after F2 and P32 (§4d) |
| **A prepaid or refundable "Founding Pass"** | Charging before B1–B3 breaks the court's order. Full crediting makes the "audit" free, and the money becomes a prepayment that needs a French *facture d'acompte* (`06` finding 1) |
| **Paddle for the audit** | Paddle bars human services not tied to software (https://www.paddle.com/help/start/intro-to-paddle/what-am-i-not-allowed-to-sell-on-paddle). Audits are invoiced directly |
| **Two tracks at once** | Two tracks halve the signal, so one reads GREY by construction (`06` finding 3) |
| Gym-marketing agencies as buyers | They run on GoHighLevel, which has forms, funnels and reporting (`02` §5) |
| Associations and amateur clubs | Free tools (Kalisport), budgets voted by volunteers, September-only intake |
| Real estate for strangers before 2027 | Incumbents bundle sites, CRM and AI. Test it only on the author's own real-estate clients (`01` §3.2) |
| Letters of intent or waitlists as a metric | They measure curiosity, not money (`04` §1.1) |
| Free pilots, lifetime deals | Unpaid pilots fail about 95% of the time (`05` §1); lifetime deals bring 16–17% refunds |
| Outcome guarantees, uptime SLAs | Unbounded exposure for one person (`05` §3) |
| A US LLC by default | Form 5472 carries a $25k penalty trap for foreign owners (`03` #25) |
| Filing trademarks now (~€1,157) | Money spent before any demand evidence. Sell under the studio's brand |
| Rewriting git history to hide the docs | The fork and caches keep everything (`03` §3) |

---

## 10. Decisions needed from the author

Answer by number; each question has a proposed answer. **Questions 1–4 decide whether anything below them happens.**

1. **The imported code.** On 6 Jul 2026, the first commit brought in 17,388 lines at once. Was that code written by you, on your own time?
   - Answer **a**: yes, mine, on my own time.
   - Answer **b**: written for the agency or the organisation, as a job, internship or contract.
   
   *Proposed:* if **b** or unsure, remove `NOTE.md` from HEAD, then send the corrected letter from `03` §2c this week. **An answer of a alone moves the €100 odds from 34% to 62% (§6).**
2. **Today, are you employed by, apprenticed to or interning at the agency, or at the organisation behind the commit email? Is there an exclusivity or IP clause?** *Proposed:* if yes to any, no selling and no letter until the contract is read.
3. **Who invoices the anchor club today:** you through a registered business, the agency, or nobody? And can you invoice today? (The country isn't needed.) *Proposed:*
   - if the agency invoices it, ask the agency before asking the club for anything;
   - if you have no business, register this week (`03` §2a).
4. **Run the Day 0 query tonight** and write down the mean requests per location per month. *Proposed:* yes. Under 4 kills the clubs niche before any selling hour.
5. **Ship A1 and A3 by Fri 2 Oct?** *Proposed:* yes, download-link hole first. The sprint starts the day after both are live.
6. **The anchor meeting this week:** order form, exclusivity radius, consent before introductions, and the 14-day channel log. *Proposed:* yes. If it refuses the radius or the consent, drop local walk-ins and the introductions.
7. **One track (clubs), plus 10 unpaid studio conversations?** *Proposed:* yes.
8. **The instruments:** order forms, plus the €149 non-refundable, non-credited audit, and the override of V:314 for clubs only (§8). *Proposed:* yes. The alternative is to sell nothing to strangers before 29 Oct.
9. **The prices:** « Ligne Essais » at €39 founding / €49 list per club (up to 3 locations), and own clients at €12–15 per site, with the anchor never paying more than a stranger. *Proposed:* yes, as a hypothesis the order forms test.
10. **Pitch the gym software as a partner?** *Proposed:* yes. Say "works next to Kimono or Deciplus" and ask Kimono whether it accepts leads by API. Build no integration before a club asks.
11. **Sell under the studio's brand, not "Inlet", until a trademark check.** *Proposed:* yes.
12. **Account hygiene today** (personal git email, recovery email, 2FA). *Proposed:* yes, 0.5 h.

---

## Files in this folder

| File | What |
|---|---|
| [`01-verticals.md`](01-verticals.md) | 25 verticals scored; deep dives on fight & fitness, real estate, home improvement |
| [`02-buyers.md`](02-buyers.md) | 19 buyer niches scored; local lead-gen studios FR/EN; lead proof vs CallRail and WhatConverts |
| [`03-risk-register.md`](03-risk-register.md) | 50 risks with removal moves; legal set-up menu; chain of title in plain words; the ownership letter (corrected); the odds model |
| [`04-presale-sprint.md`](04-presale-sprint.md) | Benchmarks, outreach rules, templates and call scripts. **Its instrument, schedule and prices are superseded by this page** |
| [`05-offer.md`](05-offer.md) | Five offers, guarantees, value math, the offer sheet EN/FR, build vs manual. **Its prices and pass are superseded by this page** |
| [`06-hater-review.md`](06-hater-review.md) | The independent attack on the draft of this page (36/100), and what changed because of it |

# 02 · Buyer niches: who exactly pays

> Lens C. 19 buyer niches scored; local lead-gen studios in FR and EN; the "lead proof for ads/SEO agencies" test against CallRail and WhatConverts.
> One of five research lenses behind the round-2 decision ([`README.md`](README.md)), written on 2026-09-29 by an independent research agent with live web research; every URL was accessed that day. **[HYPOTHESIS]** / **[H]** marks an unverified input. References: "V" or `05-verdict.md` = `docs/tribunal/05-verdict.md`; "R" or `README.md` in citations = `docs/rebuild/README.md` (plan v2); "H" = `docs/rebuild/06-hater-review.md`.
> **Not legal or tax advice.**

---

Research done on 2026-09-29. Every URL was accessed that day. Code references point at `/home/user/Forms-Central`. **[HYPOTHESIS]** marks anything I could not verify. "Secondary" marks a third-party page, or a figure that came from a search-result summary because the page itself blocked fetching.

**Limits of this run.**
- The shared web-search budget (200 calls) ran out partway through. After that I used direct page fetches only.
- Clutch, Sortlist, La Fabrique du Net, Reddit, WP Remote and the CallRail support centre block automated reads, so their counts come from search snippets where marked.
- No repository file was changed. Scratch files are in the scratchpad only.

---

## 0. Bottom line

1. **"Hand-coding studios" is a stack, not a buyer you can list.** Astro's official agency directory lists **4 agencies** (https://astro.build/agencies/).
   - The pools you *can* list are defined by **job**: studios that **build and then keep** local-business sites on a monthly retainer (maintenance, local SEO, Google Business Profile) whose renewal depends on leads.
   - I call them **local lead-gen studios**. They control the form, and they have to prove results every month.
2. **Winner:** local lead-gen studios in French-speaking markets, outside the author's own trading area. Score **75/100**.
   - Their English-speaking twin (US/UK local-SEO agencies that also build the sites) is effectively tied at **73**.
   - Run **both lists in parallel for 14 days** and keep the one that returns more signed letters of intent. That settles the tie with evidence instead of judgement.
3. **"Lead proof for ads/SEO agencies" is a real purchase trigger, but only form-first, and only for agencies that own the site.**
   - It is **not** a CallRail replacement. CallRail serves 7,000+ agencies and only tracks forms on its $95 plans.
   - Inlet today captures **no attribution**: the payload is stored as-is (`app/api/submit/[id]/route.ts:686-695`), and the referrer is used only for redirects (`route.ts:278-298`).
   - Two things have to exist before the pitch: attribution (P32, about 2 days) and one hand-made report.
4. **Do not filter the buyer list by vertical.** Gym-marketing agencies already run on GoHighLevel, which includes forms, funnels, pipelines and reporting.
   - Use the author's multi-location gym client as the **demo**, and a gym or sports portfolio as a **sort key** in the list, not as a filter.
5. **Probability of 10 *paying* agencies by 28 Dec: about 12%.** The legal steps (F0 and F3) push the first invoices to late November.
   - The 90-day target that is actually reachable is **10 signed letters of intent or deposits**, at roughly 35–40% **[judgement]**.

---

## 1. What this lens adds to plan v2

| # | Finding | Evidence | Consequence for the plan |
|---|---|---|---|
| C1 | The planned buyer, the hand-coding studio, cannot be listed at scale | Astro directory: 4 agencies (https://astro.build/agencies/). The plan's list task names "hand-coding studios" (`docs/rebuild/README.md:187`) | Redefine the buyer by job (build + retain + prove). Size the pool on directories that exist (§3) |
| C2 | Most sites in the listable pools run WordPress or a site builder | 65.2% of known-CMS .fr sites are WordPress (`docs/tribunal/05-verdict.md:132`). The Admin Bar community alone has 12,000+ WordPress agency owners and freelancers (https://theadminbar.com/the-best-wordpress-form-plugin-for-web-agencies/) | A WordPress intake must land in Phase 1, not 2027. The cheapest version is a **server-to-server snippet** that hooks CF7, WPForms or Gravity Forms into the A2 authenticated submit (about 1 day **[HYPOTHESIS on effort]**), with Lead Mirror (M13, 5 days) after it |
| C3 | Owners prefer reports, not a portal | Client preferences: 35% static reports, 35% meetings, 27% live dashboards. 69% of agencies report monthly (https://agencyanalytics.com/agency-benchmarks-2026, n = 494) | Lead the pitch with the monthly proof report. The portal comes second |
| C4 | Selling to French studios means selling to the author's competitors, on a platform whose operator can see every tenant | Portal logins are unique across the platform and leak membership (N18, `05-verdict.md:129`). The plan's no-poaching rule is at `README.md:318` | Prospect **outside the author's own trading area** first, plus Belgium, Switzerland and Québec. Put the F2 isolation and a written no-solicit clause in the offer |
| C5 | Two major builders cannot post to Inlet today | Framer delivers forms as a JSON webhook (https://www.framer.com/help/articles/framer-form-webhook-setup/), and a JSON post without proof-of-work gets a 400 (`route.ts:637-652`). Urlencoded posts skip proof-of-work (`route.ts:635-636`), but self-serve forms have no allowed origins and get a 403 (`app/api/client/forms/route.ts:124-134`) | Framer needs A2 plus a webhook adapter. Webflow works through a native form post only once F2 ships |
| C6 | Lead-proof incumbents are expensive per client and calls-first | CallRail forms only on "Complete" at $95 vs $50. WhatConverts $60 per account, or $500+ for agencies. AgencyAnalytics $20 per client, reporting only (§4) | A clear gap exists: form-first proof plus delivery monitoring at about €3–4 per client, in EU/FR |

---

## 2. The scan: 19 buyer niches

### 2a. Evidence per niche

| # | Buyer niche | Size (source) | Lead pain | Current tools and spend | Reachability | Competition specific to this buyer | Inlet fit today (code) |
|---|---|---|---|---|---|---|---|
| 1 | **FR local lead-gen studios** (1–10 people; build + maintenance and/or local SEO for SMBs) | Within 25,000 web developers on Codeur (https://www.codeur.com/developpeur/web), 18k Malt front-end freelancers and 803 La Fabrique du Net agencies (`docs/rebuild/04-distribution.md:75`). Share that fits the job: 10–20% **[HYPOTHESIS]**, so about 2.5–5k | FR monthly reports come down to "combien dépensé, combien de leads, quel CPL" (https://karmamakers.com/blog/cout-agence-marketing-digital-pme.html). "Contact form 7 ne fonctionne pas" is a live Google suggestion (`04:22`) | Maintenance €60–100 HT/month (`03-money.md:21`); local SEO €100–400/month (karmamakers); Magnetis call tracking from €10/month (https://www.magnetis.fr/offres-tarifs-call-tracking) | High: FR language; Codeur and Malt profiles are public; FB group "Indépendants et Freelances du Web" has 47.9k members (`04:79`) | No FR-native, form-first lead-proof tool found **[HYPOTHESIS]**. Free: Flamingo/CFDB7, GA4 | Code sites work after F2. WordPress needs the snippet or M13. Branding is per tenant (N4) |
| 2 | **EN local-SEO + web agencies** (US/UK; they build *and* rank the site) | 21,808 US SEO firms on Clutch (https://clutch.co/us/seo-firms). BrightLocal "trusted by 6,000+ SEO agencies" (https://www.brightlocal.com/agencies/, page title) | 55% of clients ask "connect marketing to revenue"; 32% of churn is "lack of perceived value"; conversions are the #1 metric at 44% (AgencyAnalytics benchmarks) | CallRail $50–195; WhatConverts $60 per account; AgencyAnalytics $20 per client (§4) | High: CallRail agency directory filters by Web Design + SEO (§3) | High: CallRail (7,000+ agencies, https://www.callrail.com/agencies), WhatConverts, AgencyAnalytics | Same as #1, plus attribution needed (P32) |
| 3 | Local-SEO-only agencies (do not build the site) | Same directories | High | Same | High | Same | Low: the form is not theirs to change. Only M13 would work |
| 4 | Google/Meta Ads-only agencies | 73% of agencies sell PPC (AgencyAnalytics) | Spam "conversions" whose leads "don't remember filling in your form" (https://pete-bowen.com/getting-a-lot-of-junk-leads-from-google-ads, secondary) | GA4 and Ads conversions at $0; CallRail; WhatConverts | High | Very high: GA4, CallRail, GoHighLevel, landing-page builders | Low: they don't own the form, and Inlet has no attribution (`route.ts:686-695`) |
| 5 | **Webflow Certified Partners** | About **2,010** listings: the directory paginates "1 / 201" at 10 per page (https://webflow.com/certified-partners/browse, curl 2026-09-29) | Medium: many build B2B sites **[HYPOTHESIS]** | Native Webflow forms, HubSpot free forms | Very high: public list with a country filter | Medium: native forms, HubSpot, Basin | Medium: a native form post with a custom action URL **[HYPOTHESIS on Webflow UI]**, after F2 |
| 6 | Framer Experts | No count shown; 50 profiles on page 1 (https://www.framer.com/experts/) | Low–medium | Framer webhooks | High | Medium | Low: JSON webhook refused without proof-of-work (`route.ts:642-652`) |
| 7 | Astro/Next.js hand-coding studios | 4 agencies in Astro's directory | Medium | Formspree, Web3Forms, or DIY Resend (the author's own choice, N1 at `05-verdict.md:112`) | Very low | Free endpoints | Highest |
| 8 | WordPress freelancers and maintenance agencies (general) | Admin Bar 12,000+ members. WP Umbrella 5,000+ agencies (wp-umbrella.com, snippet). GoWP 1,500+ agencies (https://gowp.com/agencies/, snippet) | High: WP mail failures. CF7 10M+ installs, WP Mail SMTP 4M+ (`04:22`) | WP Umbrella **€1.99/site** with white-label reports and no form monitoring (https://wp-umbrella.com/pricing/) | High | WP Remote "Form Testing" checks forms every 24 h (https://wpremote.com/form-testing/, snippet); Flamingo/CFDB7 free | Low until the snippet or M13 exists |
| 9 | Care-plan / maintenance-subscription businesses (any CMS) | 80% of web professionals offer maintenance; plans mostly $100–150/month (The Admin Bar 2026 via https://wp-umbrella.com/blog/wordpress-maintenance/, secondary; survey n = 622 across 51 countries, https://theadminbar.com/2026-survey/) | "Is my site working?" is the product they sell | WP Umbrella, ManageWP, GoWP ($39/site) | Medium: no single list | WordPress-only tools | Medium |
| 10 | Vibe-coders building client sites (Lovable/Bolt/v0) | "800,000+ individuals and agencies use Lovable for client work" (https://lovable.dev/partners) | High, but the lead loss is felt by the client, not by them | splitforms $1; Lovable Cloud's built-in database | Low: directory count not shown | splitforms, Lovable Cloud | High technically |
| 11 | Squarespace/Wix designers | Squarespace Circle 100,000+ (https://www.squarespace.com/circle, snippet). Wix Partners revenue $171.6M in Q1 2025 (https://investors.wix.com/parters, snippet) | Low | Native forms and inbox | Medium | Native | Very low (M13 only) |
| 12 | Franchise networks' web vendors | FR 2,035 networks and 93,395 outlets; US about 845k outlets (`05-moonshots.md:40`) | High | Birdeye $299–449, Podium $399+ (`05:40`) | Low | Very high | Medium, but an enterprise sales cycle |
| 13 | Gym-marketing agencies | Small **[HYPOTHESIS]** | High | GoHighLevel $97/$297 with forms, funnels and reporting (https://www.gohighlevel.com/); gym "snapshots" with pipelines and booking (https://hlgrowthpartner.com/post/gohighlevel-for-gyms-fitness-studios-snapshot) | Medium | GoHighLevel owns it | Very low |
| 14 | Real-estate marketing agencies and site vendors | Medium **[HYPOTHESIS]** | Medium | Bundled CRMs **[HYPOTHESIS]** | Medium | Bundled | Low |
| 15 | Home-services (trades) agencies, US | Large; filterable in CallRail's directory under "Home Services" | Very high | CallRail | High | CallRail | Low: phone-first. 64% of contractors say calls are their main channel (https://www.plumbermag.com/online_exclusives/2025/01/callrail-releases-report-analyzing-which-marketing-efforts-best-convert-leads-into-business, secondary) |
| 16 | Webflow/Framer/Astro template sellers | Small | None | — | High | — | A channel, not a buyer |
| 17 | No-code agencies (Bubble/Softr) | Small | They build apps, not lead sites | — | Medium | — | Very low |
| 18 | FR agences web and Malt/Codeur freelancers (unfiltered) | Same as #1 | Medium: many are project-only | Low | Very high | Low | Low–medium (WordPress) |
| 19 | US Clutch/UpCity web designers (unfiltered) | Very large | Medium | Varies | Medium (cold) | Medium | Low–medium |

### 2b. Weighted scores

**Scoring method.**
- Each factor is scored 1–5; 5 is best, so 5 on Competition means weak competition.
- Weights: Fit 30%, Pain 20%, Reach 15%, Competition 15%, Spend/price tolerance 10%, Size 10%. The total is scaled to 100.
- Fit is weighted highest because of the 90-day, 20 h/week constraint.
- The computation is `scratchpad/score.py`.

| Rank | Niche | Size | Pain | Spend | Reach | Comp. | Fit | **Score** |
|---|---|---|---|---|---|---|---|---|
| 1 | **FR local lead-gen studios** | 4 | 4 | 3 | 5 | 4 | 3 | **75** |
| 2 | **EN local-SEO + web agencies** | 5 | 5 | 5 | 4 | 1 | 3 | **73** |
| 3 | Care-plan businesses (any CMS) | 4 | 4 | 3 | 3 | 3 | 3 | 66 |
| 4 | **Webflow Certified Partners** | 3 | 2 | 4 | 5 | 3 | 3 | 64 |
| 5 | FR agences/freelancers (unfiltered) | 4 | 3 | 2 | 5 | 4 | 2 | 63 |
| 6 | Local-SEO-only agencies | 5 | 5 | 5 | 4 | 1 | 1 | 61 |
| 7 | WordPress freelancers and maintenance | 5 | 4 | 2 | 4 | 2 | 2 | 60 |
| 7 | Vibe-coders for clients | 5 | 3 | 1 | 2 | 2 | 4 | 60 |
| 9 | Home-services agencies (US) | 4 | 5 | 5 | 4 | 1 | 1 | 59 |
| 10 | US Clutch/UpCity (unfiltered) | 5 | 3 | 4 | 3 | 2 | 2 | 57 |
| 10 | Google/Meta Ads-only agencies | 5 | 4 | 5 | 4 | 1 | 1 | 57 |
| 10 | Astro/Next hand-coders | 1 | 3 | 2 | 1 | 2 | 5 | 57 |
| 13 | Franchise web vendors | 3 | 4 | 5 | 2 | 1 | 2 | 53 |
| 14 | Real-estate agencies and site vendors | 3 | 3 | 4 | 3 | 1 | 2 | 50 |
| 15 | Template sellers | 2 | 1 | 1 | 4 | 3 | 3 | 49 |
| 16 | Framer Experts | 3 | 2 | 3 | 4 | 3 | 1 | 47 |
| 17 | Gym-marketing agencies | 2 | 4 | 4 | 3 | 1 | 1 | 46 |
| 18 | Squarespace/Wix designers | 5 | 2 | 2 | 3 | 2 | 1 | 43 |
| 19 | No-code agencies | 2 | 1 | 3 | 3 | 3 | 1 | 38 |

**Sensitivity.** Ranks 1 and 2 are within two points of each other.
- Cut FR Reach from 5 to 4 (the competitor objection, C4) and ranks 1 and 2 swap.
- Raise Fit to 40% and the hand-coders climb to about 65, but their Reach of 1 still leaves them unlistable.
- Care-plan businesses (#3) are mostly the *same people* as #1 and #8, so I fold them into #1's list rather than running a separate campaign.

---

## 3. Deep-dives on the top 3

### 3.1 FR local lead-gen studios (75)

**Trigger moments, in order of how often they recur.**
1. **Reporting day.** The client asks "combien de demandes ce mois-ci ?", and the studio has only a GA4 count. In France, GA4 misses the visitors who refuse cookies: 39% refusal in the CNIL 2022 study, and about 54% EU-wide rejection in 2026 (https://secureprivacy.ai/blog/consent-mode-conversion-data-loss and https://seresa.io/blog/consent-rates-data-impact/60-70-of-eu-visitors-reject-your-cookies, both secondary). A server-stored lead list needs no cookie.
2. **"Je ne reçois plus rien."** A WordPress mail or form failure, discovered weeks late.
3. **Launching a new client site.** The easiest moment to install, because the studio is already in the code.
4. **Renewal or a price increase on the retainer.**

**The objections they will raise.**

| Objection | Answer that is true today or by Phase 1 |
|---|---|
| "You're a competing studio; you'd see my clients" (C4) | Prospect outside the author's trading area first. F2 per-agency isolation before any external tenant (`README.md:318`). A written no-solicit clause for 12 months. Operator access logged (T2.6). Honest line: "the operator can technically read data; the DPA and the log bind him" |
| "My sites are on WordPress / CF7" | Server-to-server snippet (about 1 day after A2) or Lead Mirror (M13). **Without one of them, this niche fails** |
| "My clients won't pay another line" | Put it inside the existing retainer (see margin below) |
| "RGPD? Where is it hosted?" | EU region, DPA and legal pages (F3). They must exist before the first invoice |
| "One person: what if you vanish?" | CSV export; no lock-in on the form markup |
| "GA4 already does this" | GA4 counts modelled events, including spam. Inlet stores each lead with its spam label |

**Tools they will compare.** GA4 + Looker Studio (free); Flamingo/CFDB7 (free); WP Umbrella reports (€1.99/site); Magnetis (calls, from €10); AgencyAnalytics ($20/client); Agency Label (free portal, `06-hater-review.md:49`); LeadDuo ($10–20, `06:49`).

**List-building method (target: 500 named in about 15–18 h).**

| Source | Size | Filter | Target |
|---|---|---|---|
| Codeur.com developer profiles (public, city and skills) | 25,000 web developers (https://www.codeur.com/developpeur/web) | Skills "référencement local" / "maintenance" / "site vitrine"; outside the author's area | 250 |
| Malt | 18k front-end freelancers (`04:75`) | Same keywords | 100 |
| La Fabrique du Net | 803 agencies (`04:75`) | 1–10 staff, SMB portfolio | 100 |
| Belgium, Switzerland, Québec studios | **[HYPOTHESIS]** size | French-speaking, local SMB portfolio | 50+ |
| Inbound: FB "Indépendants et Freelances du Web" | 47.9k members (`04:79`) | One value post plus one workshop (D29) | — |

- **Qualify** each studio on three counts: at least 5 local-SMB client sites in the portfolio, a maintenance or local-SEO offer on its own site, and not in the author's trading area.
- **Enrich** each name with a form-stack census of 5 portfolio sites, by viewing the page source: CF7, WPForms, Formspree, Webflow, or custom. That census is itself **evidence**: it measures the WordPress share of the pool and so decides whether the snippet or M13 must lead.
- Do not scrape Google Maps (it breaches Google's terms); collect Maps entries by hand if needed.

**Resale margin, stated honestly.**
- The line item: a studio with 12 clients pays €29 + 2 × €3 = **€35/month** at the founding price. Billing "Suivi et preuve des demandes" at €10/client inside a €60–100 maintenance retainer brings €120, so **€85/month before labour**. At 20 min per client per month, that labour is worth €150–170 (`06:63`), so the line item alone is **not** the argument.
- **The real case is retention.** Keeping one €149/month local-SEO client (karmamakers) for 3 more months is worth €447, more than Inlet's yearly cost of €420. Sell it as churn insurance, as the plan's pitch already implies (`README.md:30`).

### 3.2 EN local-SEO + web agencies, US/UK (73)

**Trigger moments.**
1. The monthly report (69% of agencies report monthly).
2. A churn scare (32% of churn is "lack of perceived value"; 55% of clients ask to connect marketing to revenue; AgencyAnalytics benchmarks).
3. **The CallRail bill review.** On Lead Tracking ($50) forms are not tracked; adding them means Lead Tracking Complete at $95 or $0.02 per submission (https://www.callrail.com/pricing).
4. A spam-lead complaint.

**The objections they will raise.**
- "We already have CallRail." Position Inlet as the **complement for forms**, not the replacement.
- "Calls are most of our leads." True for trades, so steer away from them (row 15). Aim at agencies whose clients take most leads by form **[HYPOTHESIS]**: B2B services, real estate enquiries, gyms' trial requests.
- "SOC 2? US hosting?" There is none. Say so, and target agencies of 1–10 staff (49% of agencies, AgencyAnalytics), which rarely ask.
- "Who are you?" Answer with a named case study (D30) and the canary proof.

**Tools they will compare.** CallRail Complete $95; WhatConverts Plus $60 or Agency $500+ (https://www.whatconverts.com/pricing/); AgencyAnalytics $20/client; Attributer $199 for 10 sites (https://attributer.io/partners/agencies/plans); GoHighLevel $97/$297.

**List-building method (500+ in about 12 h).**
- **CallRail agency directory** (https://www.callrail.com/agency-directory): filter by service (SEO, PPC/SEM, **Web Design**), industry (Legal, Real Estate, Home Services…), country (US, CA, UK, AU) and **language, including French**. At least 10 pages are visible; the total count is not shown. **These are agencies already paying for lead proof.**
  - The French-language filter gives a **Québec bridge sub-list**: French copy, North-American reporting culture, and no competitor objection **[HYPOTHESIS on size]**.
- **Clutch US SEO firms, 21,808** (https://clutch.co/us/seo-firms): filter to small-business focus and 2–10 staff.
- Google Partners directory (https://partnersdirectory.withgoogle.com/), filtered by city.
- BrightLocal's 6,000+ agencies have no public list, so reach them through content only.

**Resale margin.**
- An agency with 20 clients pays €39 + 10 × €3 = €69, about $79.
- Billing "form lead tracking & monitoring" at $25/client brings $500, so about **$420/month**.
- Anchor: CallRail's form upgrade costs +$45 per account and WhatConverts $60 per account. **[HYPOTHESIS]** that agencies are billed per client account on CallRail; if so, upgrading 20 clients costs $900/month against Inlet's $79.

### 3.3 Webflow Certified Partners (64)

**Trigger moments.** A client wants leads outside the Webflow editor; spam; the site handover; an SMB client asks for monthly numbers.

**The objections they will raise.** "Webflow forms plus HubSpot free is enough." And "we're project-based, so there is no retainer to bill it in." Many partners hand off sites **[HYPOTHESIS]**.

**Tools they will compare.** Webflow native forms, HubSpot free forms, Basin, Formspark, Agency Label.

**List-building method.** The directory holds about 2,010 partners at 10 per page (https://webflow.com/certified-partners/browse). Filter by country (US, UK, FR, BE, CH, CA), then keep those with local-SMB work in their portfolios. Expected yield: 20–30% **[HYPOTHESIS]**, so 400–600 names.

**Resale margin.** €3 per client inside a $50–150 hosting-and-care line **[HYPOTHESIS]**. The margin is small, and the value is the monthly report.

**Why third and not first.** Low pain on B2B sites. The code path is fine (a urlencoded post needs no proof-of-work, `route.ts:635-636`), but only once F2 sets origins.

---

## 4. "Lead proof for ads/SEO agencies": the specific evaluation

### What the incumbents charge, and what they miss

The "15 clients" column is my own calculation from the list prices.

| Tool | Price | Cost for 15 clients | What it does for forms | Gap Inlet can use |
|---|---|---|---|---|
| **CallRail** (https://www.callrail.com/pricing) | Lead Tracking $50 (calls and texts only); **Lead Tracking Complete $95** ("1,000 form submissions", "Form tracking & attribution", custom form builder); Conversion Complete $195; extra submissions $0.02 | $1,425 on Complete, if billed per client account **[HYPOTHESIS]** | Tracks forms and attribution; calls-first | Forms cost +$45 per account. No synthetic delivery test on the pricing page. No EU/FR positioning found |
| **WhatConverts** (https://www.whatconverts.com/pricing/) | Plus $60 (300 forms/chats), Pro $100, Elite $160 per account; Agency $500/$800/$1,250 for unlimited accounts; **white label +$50**; forms 10¢ over quota | $900 on Plus, or $550 on Agency Plus with white label | Form, call and chat leads plus revenue tagging | Manual tagging and value assignment in the lead inbox (https://rivetline.ai/post/callrail-vs-whatconverts). No delivery monitoring |
| **AgencyAnalytics** (https://agencyanalytics.com/pricing) | $20 per client per month, billed annually; white label included | $300 | **None natively.** It reads CallRail and WhatConverts (https://agencyanalytics.com/integrations/callrail, https://agencyanalytics.com/integrations/what-converts) | Reporting only; the lead data has to come from somewhere else |
| **Attributer** (https://attributer.io/partners/agencies/plans) | $199 for 10 sites, $299 for 25, $399 for 50 | $299 | Writes UTM and referrer into hidden fields of existing forms | No storage, report, spam handling or monitoring |
| GA4 + Google Ads | $0 | $0 | Counts conversion events | Counts spam as conversions. Loses consent refusers (39–54%, secondary) and relies on modelling |
| Delivery monitors | FormTracker free for 1 form, paid plans "coming soon", no agency features (https://www.formtracker.io/); WP Remote Form Testing every 24 h, WordPress only (snippet) | — | Test that a form works | No lead proof, no report |
| **Inlet** (plan price) | €39 for 10 clients, then +€3 each (`README.md:28-30`) | **€54 (about $62)** | Stores the lead plus a spam label (A1); read-only portal | **Not built yet:** attribution capture, canary monitoring, the report, per-client branding (N4). **No calls, ever** |

### Verdict

- **The pain is real, the budget exists, and the reporting cadence is monthly.** That makes the monthly report a genuine purchase trigger: 69% of agencies report monthly, and 55% of clients ask to connect marketing to revenue.
- **The wedge that survives:** *"Form leads counted, spam removed, delivery tested every day, and one branded monthly proof email per client, for about €4 per client instead of $45–95."* It sells to agencies that **own the site**, as the **complement** to their call tracking.

**What must exist before the pitch** (all small and already in the plan):
1. **P32 attribution (2 days).** Read `utm_*`, `gclid`, `fbclid` and the landing page **at submit time from the URL**, and store them in dedicated columns, not in `payload`.
   - Persisting them across pages needs browser storage, which needs consent in the EU under ePrivacy Art. 5(3) **[HYPOTHESIS on the legal reading]**. Ship submit-time capture only.
2. **A daily canary** (#7-lite, Phase 1).
3. **One hand-made report** from the author's own client (the gym club, anonymised), used as the demo.

**What to avoid.**
- Selling "replace CallRail".
- Chasing Ads-only agencies (they do not control the form).
- Chasing X6 (sending conversions back to Google Ads) before 2027. Google moved offline conversion import to the Data Manager API on 2026-06-15 (https://developers.google.com/google-ads/api/docs/conversions/upload-offline), and access review for a one-person vendor is its own project.

---

## 5. Direct answers

### Which buyer niche has the highest probability of 10 paying accounts within 90 days?

**Local lead-gen studios**: small studios that build *and* retain local-business sites on lead-dependent retainers. Start in **French-speaking markets outside the author's own trading area**, and run the **EN twin** (CallRail-directory agencies that list Web Design + SEO) as a parallel list.

**90-day funnel for the French list (from 20 Oct, 25 emails a week from the warm studio domain, following `04:141`):**

| Channel | Arithmetic | Signed | Paying by 28 Dec (about 60%) |
|---|---|---|---|
| Warm peers | 15 contacts → 5 calls → 2 **[HYPOTHESIS]** | 2 | 1–2 |
| Audit outreach | 225 emails × 8% reply = 18 calls × 20% | 3.6 | 2 |
| One FB workshop | 20 attendees × 10% × 30% (`04:79`) | 0.6 | 0–1 |
| Codeur "formulaire ne fonctionne pas" gigs (D27) | 2 gigs a month; about 1 studio converts | 0–1 | 0–1 |
| **Total** | | **about 6–8** | **about 4–5** |

**Reaching 10 paying needs about double the volume.** That means 50 emails a week across two warmed inboxes (FR and EN), each at or under 25 a week, **or** a higher close rate from a deposit-backed founding offer.

**Probabilities [judgement]:**
- 10 paying external agencies by 28 Dec: **about 12%**. Invoices cannot go out before F0 and F3 (`README.md:195, 217`).
- 10 paying *accounts*, counting the author's own client businesses and annual prepayments: **about 20%**.
- 10 **signed letters of intent or deposits** by 28 Dec: **about 35–40%**.
- At least 3 paying agencies (Gate C): **about 45%**. This is at or slightly under the distribution lens's "about 50%" (`04:150`), because this lens adds the competitor objection.

### Should it be combined with a vertical?

**Not as a filter on the buyer list. Yes as proof, and as a sort key.**
- **Gym-marketing agencies are already on GoHighLevel.** It includes "Forms, Surveys & Quizzes", funnels and reporting at $97/$297 (https://www.gohighlevel.com/), and gym snapshots ship pipelines, booking and an AI bot (hlgrowthpartner, above). Fit scores 1.
- **Real-estate agencies:** FR sites mostly come bundled with sector software **[HYPOTHESIS]**. Avoid for now.
- **A vertical filter shrinks a French list below 500** **[HYPOTHESIS]** before any evidence exists.
- **Do instead:**
  - The author's multi-location gym client becomes the demo report (anonymised until written consent is given, `05-verdict.md:368`).
  - Studios with gym, combat-sports or fitness portfolios go to the **top** of the send order.
  - After 100 emails, **compare reply rates** between the gym-portfolio subset and the rest. Only if that subset replies at least twice as often do you narrow to "studios that serve sports and fitness clubs".
  - The code already has a vertical-pack idea (P23, `02-product.md:73`). Build it only after that signal.

---

## 6. The 14-day plan to replace assumptions with evidence

| Days | Action | Hours | Evidence produced | Decision rule |
|---|---|---|---|---|
| 1–4 | Name 150 French studios (Codeur, Malt, La Fabrique du Net, BE/CH/QC) and 100 EN agencies (CallRail directory with Web Design + SEO; Clutch) | 8 | **Reachable pool of known size.** It also feeds Gate A's 500 (`README.md:199`) | — |
| 3–6 | Form-stack census of 5 portfolio sites each (view source: CF7, WPForms, Webflow, Formspree, custom) | 5 | The **WordPress share** of the real pool | If WordPress is over 50%, the server-to-server snippet (or M13) moves into Phase 1 ahead of the scanner |
| 5–14 | 25 FR + 25 EN personal emails: census finding + "founding-10" offer at €29 locked 24 months + a **one-page letter of intent** (intent to pay from a stated date, if daily canary + monthly report are delivered). No money before F0 and F3 | 6 | **Signed letters of intent** and the reply rate per language | Keep the language with at least 3 letters of intent out of 25. Under 1 letter of intent out of 50 in total: move to Webflow partners (#3) |
| 7 | One FR value post in the FB group: "12 formulaires audités : ce qu'on a trouvé" | 1 | Inbound reply count | — |

---

## Top recommendations (ranked)

1. **Redefine the buyer as local lead-gen studios (build + retain + prove), not "hand-coding studios".** It is the only definition that is both listable (25k Codeur, 21.8k Clutch, CallRail directory) and able to install Inlet.
2. **Run the French and English lists in parallel for 14 days, with letters of intent as the metric.** The top two niches are within two points; a €0 test settles the tie with evidence.
3. **Ship a WordPress server-to-server snippet right after A2** (M13 as the fallback). Without it, most portfolio sites in every listable niche are out of reach (65.2% of .fr sites run WordPress).
4. **Sell "form-first lead proof", not a portal.** Owners prefer reports (35%) over dashboards (27%), and the monthly report is the trigger.
5. **Build P32 attribution (2 days) before any ads/SEO pitch, and pitch it as CallRail's complement.** It is €54 for 15 clients against $45–95 per account for forms at CallRail or WhatConverts.
6. **Prospect outside the author's trading area first, with the F2 isolation and a written no-solicit clause.** This defuses the strongest French objection (C4, N18).
7. **Use the gym client as the demo and gym portfolios as a sort key; do not filter by vertical.** GoHighLevel owns the gym-agency segment.
8. **Keep Webflow Certified Partners (about 2,010, public) as the fallback list.** It is the cleanest directory, and the fallback if both language tests miss.

## Rejected and why

1. **Gym and fitness marketing agencies as the buyer.** They run on GoHighLevel ($97/$297, with forms, funnels and reporting). Fit 1/5, score 46.
2. **Google/Meta Ads-only agencies.** They don't control the form, GA4 and Ads conversion tracking are free, and CallRail and WhatConverts are entrenched. Score 57.
3. **Squarespace/Wix designers.** Closed form systems, reachable only by BCC capture; low pain. Score 43.
4. **Vibe-coders on Lovable/Bolt/v0.** Lowest price tolerance, no countable directory, and Lovable Cloud stores submissions itself. Score 60, but with Spend 1/5.
5. **Franchise web vendors.** Enterprise sales cycle and security questionnaires, against Birdeye and Podium. It cannot close inside 90 days.
6. **US home-services agencies.** Phone-first and CallRail-owned. A forms-only product is the wrong half of their leads.
7. **Template sellers and no-code agencies.** A channel at best (templates) or no lead pain (apps). No near-term revenue.

## Your honest confidence

- **About 55%** that local lead-gen studios (French-speaking first, with the EN twin) are the best buyer among the 19 scanned.
- **About 12%** that they yield 10 *paying* agencies by 28 Dec.
- **About 35–40%** that they yield 10 signed letters of intent or deposits.

**What would raise it:**
- At least 3 letters of intent from the first 25 emails in one language. That would raise the pick to about 70% and 10 paying by 28 Dec to about 20%.
- The form-stack census showing at least 30% non-WordPress portfolio sites, or the WordPress snippet working on one real CF7 site.
- The legal entity and DPA confirmed before 15 Nov, so invoices can go out four weeks earlier.
- One named case study with written consent.
- Verification of two figures I could not confirm: whether CallRail bills per client account, and how many French-language agencies CallRail's directory lists (the Québec sub-list).

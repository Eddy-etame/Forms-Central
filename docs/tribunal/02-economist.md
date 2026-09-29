# 02 · Expert testimony: the Economist

> Neutral witness. Every market fact was checked live on **2026-09-28** unless marked. Code facts cite `file:line`. Estimates show their arithmetic. **[UNVERIFIED]** = I could not confirm from a primary source. **[FROM MEMORY]** = not re-checked live. Currency: ECB reference rate 25 Sep 2026, **€1 = $1.1403** (S29). All Inlet prices are USD (`lib/plans.ts:22`).

## Executive answer

1. **Will it make money?** Not as a self-serve SaaS on its current path. Probability-weighted MRR is **≈ $215 (≈ €188) at month 12** and **≈ $634 (≈ €556) at month 24**. There is a **60% chance it stays near $0**.
2. **How much, realistically?** In the base case (30%), the author resumes work, ships checkout, a custom domain and legitimate email within about 60 days, then keeps up distribution. That gives **≈ $250 MRR at 12 months and ≈ $780 at 24**, which is roughly break-even against the **≈ $66/month** that a legitimate stack costs. The bull case (10%) gives ≈ $1.3k and ≈ $3.9k.
3. **Is cost the problem?** No. If every tenant maxes its quota on *paid* infrastructure, every paid plan still has a positive gross margin: **37–88% before labour**. Making the E5 email promise honest costs **$20–69/month**. The real problems are distribution and trust. This category is saturated with free tiers, and its best indie outcome (Web3Forms, **$40.5k MRR, verified by Paddle**) reportedly took **~20 months to get its first 20 paying customers**.
4. **Will it be used?** There is no public evidence of any external user today. The only certain user is the author's own agency. Because incumbents charge per account rather than per site, the fees that agency avoids come to only about **$150–1,080 a year**.
5. **Where the money is:** Inlet is worth more as a *delivery tool inside paid services* than as a $9–49 self-serve SaaS. That means white-label lead capture sold per client site to agencies and local businesses in France and Francophone Africa, billed through a merchant of record or mobile money. **Decide at day 60 by the number of paying external accounts: 5 or more means continue, 0–1 means stop the SaaS.**

---

## 1. Who pays?

### 1.1 The price map Inlet walks into (checked 2026-09-28)

| Product | Free tier | Comparable paid tier | $ per 1,000 subs | Auto-reply from | Source |
|---|---|---|---|---|---|
| **Inlet** | 3 forms, 50 subs/mo | Solo $9 / 500 · **Pro $19 / 2,500** · Max $49 / 10,000 | 18.00 · **7.60** · 4.90 | **Free** (with "Powered by" footer) | `lib/plans.ts:38-111` |
| Formspree | 50 subs/mo | Professional $30/mo ($20 annual) / 2,000 | 15.00 | Professional | S1 |
| Basin | 1 form, 50 subs | Growth $24.17 / 1,000 · Pro $30.62 / 5,000 | 24.17 · 6.12 | Growth | S2 (these look like annual-billing equivalents) |
| Forminit (Getform, renamed Jan 2026) | 1 form, 100 | Pro $19 / 5,000 · Business $49 / 10,000 | 3.80 · 4.90 | Business ($49) | S3 |
| Web3Forms | 250/mo | Pro $12/mo or $149/yr / 10,000 | 1.20 | Pro | S4 (secondary; web3forms.com returned 403) |
| Static Forms | 500/mo | Pro $9/mo / 25,000 | 0.36 | Pro | S5 (secondary) **[UNVERIFIED]** |
| Formcarry | 50/mo (MCP included) | Basic $19/mo / 2,000 | 9.50 | n/a | S6 |
| Formspark | 250 lifetime | **$25 one-time** / 50,000 | 0.50 (one-off) | n/a | S7 |
| EmailJS | 200 requests | Personal $9 / 2,000 | 4.50 | template-based | S8 |
| Jotform | 5 forms, 100 | Silver $49 / 2,500 | 19.60 | yes | S9 |
| Tally | unlimited (fair use) | Pro $24 | — | — | S10 |
| Netlify Forms | "free and unlimited" on credit plans | — | 0 | — | S11 |
| FormSubmit | free core, credits $10/100 | — | — | — | S12 |

**Reading.** On price per submission, Inlet is mid-market. Web3Forms Pro gives 4× Inlet Pro's volume for 63% of the price ($12 ÷ $19). Static Forms Pro, if its secondary figures are right, gives 10× the volume for 47% of the price. Inlet's **free tier is tied for the least generous** at 50 submissions, level with Formspree, Basin and Formcarry. Its one real price advantage is the *bundle*: branded auto-replies on Free, and white-label sending plus client portals on Pro for $19. Incumbents gate comparable features higher: auto-responses at Formspree Professional ($20–30), custom templates and domains at Formspree Business ($60–90), and white-label email at Forminit Business ($49).

### 1.2 Segments

| Segment | Size proxy | Pain | Current alternative | Willingness to pay (anchor) | Inlet fit | Does the pricing metric fit? |
|---|---|---|---|---|---|---|
| **Freelance devs, 1–10 client sites** | 47.2M developers worldwide (S13). France: ~18k front-end, 21k back-end and 9.6k full-stack freelance profiles on Malt, overlapping (S14, secondary) | **Low.** One site's form is a solved problem | Free tiers above; or an AI agent writes a 15–20-line Resend route (S15) on Resend's free 3,000/mo plan (S16) | **$0–12/mo** (Web3Forms Pro $12, EmailJS $9, Formcarry Starter $6) | Free → Solo $9 | Partly. They think in client sites and auto-replies, not "emails/day" |
| **Small agencies, 5–50 coded client sites** | France: 15,000–35,000 agencies/studios (S17, secondary, definitions vary). Only part is addressable: 40.2% of all sites run WordPress, which has native form plugins; only 31.5% use no CMS (S18) | **Moderate.** Clients want to see their own leads; branded replies; one inbox across all sites | Formspree Business $60–90, Basin Agency $81.25, Forminit Business $49, WordPress plugins | **$19–90/mo** | Pro $19 / Max $49 | **Poor.** The value unit is the client site. Pro allows 25 end-clients (`lib/plans.ts:91`), i.e. $0.76 per client per month |
| Indie hackers | — | Low | Free tiers | $0–9 | Free | n/a |
| Local businesses (the agencies' clients) | — | High (missed leads) but they cannot integrate an API | Their agency, or Wix/WordPress forms | Paid inside maintenance contracts | Only via the white-label portal | n/a |
| **The author's own agency** ("mwcrea", `NOTE.md:1`) | 1 buyer; number of client sites unknown | This was the original goal: "remplacer … Jotform, EmailJS … sur nos sites vitrines" (`cahier_des_charges.md:53-59`) | EmailJS $9–15, Web3Forms Pro $149/yr | = cost avoided (§5) | Internal | n/a |
| **Francophone Africa devs/agencies** | Cameroon GDP per capita $1,762 (S19). A showcase site sells for 50k–200k FCFA ≈ **€76–305** (S20; 655.957 XAF/€ peg **[FROM MEMORY]**) | Moderate. **USD card billing is a real barrier** | Free tiers; card-only paid plans | $19 ≈ 10,930 XAF ≈ **13% of monthly GDP per head** ($19 ÷ ($1,762 ÷ 12)) | Would need a localized Solo tier | Poor in USD |

Other points:
- **Pricing metric.** The email-per-day caps are a *supplier* constraint, not a value metric. The code says so: "Email/day caps exist because delivery currently rides Brevo's free tier" (`lib/plans.ts:12-14`). Customers perceive value per client site, per branded portal, and per lead not lost. A per-end-client price such as $3 per client per month would take 25 clients from $19 to $75. That is still below Formspree Business, but it is an **[UNVERIFIED]** willingness-to-pay assumption that needs testing.
- **Currency.** The product declares "French is the default market" (`lib/dictionaries.ts:56`) but prices only in USD (`app/pricing/page.tsx:51-63`).
- **Who realistically pays first:** small agencies that code custom sites, reached by direct sales. Self-serve freelancers are the least likely payers because a free tier or a coding agent covers them.

---

## 2. Unit economics

### 2.1 Cost inputs, assuming free tiers are replaced by paid services

| Input | Price used | Source |
|---|---|---|
| Email, high | Resend Pro $20 for 50k; **overage $0.90/1k** | S16 |
| Email, low | Amazon SES **$0.10/1k** | S21 |
| Email, alternatives | Brevo Starter $9 (5k), $29 (20k), $69 (100k), no daily cap (S22, secondary). Postmark $16.50 for 10k, then $1.30/1k (S23) | |
| AI classifier (runs on **every** stored submission, `app/api/submit/[id]/route.ts:699-705`) | High: Gemini 2.5 Flash at $0.30 in / $2.50 out per 1M tokens, 1,175 in + 200 out (input capped at 4,000 chars ≈ 1,000 tokens plus a ~175-token prompt, `lib/spamCore.ts:23-32`; output capped at 200 tokens, `lib/spamClassifier.ts:32`) → **$0.00085**. Low: Flash-Lite at $0.10 / $0.40, 400 in + 50 out → **$0.00006** | S24 |
| AI chat message (support bot, `lib/ai.ts:72-84`, max 800 tokens `:220`) | High: 1,500 in + 800 out on Flash → **$0.00245**. Low: Flash-Lite 1,500 + 400 → **$0.00031** | S24 |
| Fallback AI | Mistral Small 4 at $0.15 / $0.60 (S25). Groq Llama 3.3 70B at $0.59 / $0.79, reportedly moved to enterprise-only on 2026-08-26 (S26, secondary) **[UNVERIFIED]** | |
| Compute per submission | Vercel Pro: $0.60 per 1M invocations and $0.128 per active-CPU hour (S27). 3 invocations + 0.3 s CPU, ×3 safety factor → **$0.000037** (the safety factor is an **assumption**) | S27 |
| Payment | Paddle, merchant of record: **5% + $0.50** (S30) | S30 |
| Fixed, legitimate stack | Vercel Pro $20 (Hobby is "personal, non-commercial use", S27) + Supabase Pro $25 (free projects pause after 1 week of inactivity, S28) + Resend Pro $20 + domain ≈ $1 (**[FROM MEMORY]** ~$12/yr) = **≈ $66/month** | S16, S27, S28 |

Token counts are estimated at about 4 characters per token (the prompt in `lib/ai.ts:18-84` is 4,424 characters). This is an **assumption**.

### 2.2 Cost to serve one tenant at full quota

Emails pause once monthly submissions exceed the cap (`lib/quota.ts:63-64`; `route.ts:737-750`), so the maximum monthly email volume is min(2 × submission cap, 30 × daily cap):
- Free: min(100, 600) = **100**
- Solo: min(1,000, 3,000) = **1,000**
- Pro: min(5,000, 9,000) = **5,000**
- Max: min(20,000, 30,000) = **20,000**

Chat volume assumed at full use: Solo 100 (its cap); Pro and Max 500 (**assumption**, since both are "unlimited").

| Plan (price) | Email | AI classifier | AI chat | Compute | Payment | **Total, high** | **Gross margin, high** | Total, low | Gross margin, low |
|---|---|---|---|---|---|---|---|---|---|
| Free ($0) | $0.09 | $0.04 | $0 | $0.00 | $0 | **$0.13** | n/a (loss of $0.13) | $0.01 | n/a |
| Solo ($9) | $0.90 | $0.43 | $0.24 | $0.02 | $0.95 | **$2.54** | **71.8%** | $1.13 | 87.4% |
| Pro ($19) | $4.50 | $2.13 | $1.22 | $0.09 | $1.45 | **$9.40** | **50.5%** | $2.35 | 87.6% |
| Max ($49) | $18.00 | $8.53 | $1.22 | $0.37 | $2.95 | **$31.07** | **36.6%** | $6.08 | 87.6% |

Max also promises "priority support" and "dedicated sending-domain setup (DKIM/SPF)" (`lib/dictionaries.ts:96`). Pricing that at an **assumed** $20/hour for 0.5 h/month of support, Max's high-case margin falls to (49 − 41.07) ÷ 49 = **16%**.

**Findings**
- **No paid plan loses money at full use**, even with the most expensive inputs. Email and payment fees dominate. The AI classifier matters only on Max.
- **Three cost leaks are not bounded by price:**
  1. **Over-quota submissions are still stored and still AI-classified.** Classification runs at `route.ts:699-705`, *before* the quota check at `:737`, and the product promises "a lead is NEVER dropped" (`lib/quota.ts:7-10`). A Free tenant receiving 10,000 submissions a month costs about 10,000 × $0.00085 = **$8.50/month** in AI plus storage, and pays $0.
  2. **"Unlimited" AI has only a 30-per-minute burst guard** (`app/api/ai/chat/route.ts:12, 82-91`). In theory that is 30 × 60 × 24 × 30 = 1,296,000 messages a month, or **$3,175/month per tenant** at the high rate. Unlikely, but a monthly cap removes the risk.
  3. **Fixed costs.** $66/month ÷ contribution per Pro ($19 − $9.40 = $9.60) = **7 Pro customers to break even** in the high case, or 4 in the low case ($66 ÷ $16.65).
- **The current $0 cost basis is not a legitimate basis.**
  - Brevo's terms, §3.1: "You are only allowed to create and use one account" (S31). The rotation design says "N Brevo accounts give roughly N× the daily send capacity" (`lib/mailAccounts.ts:86-87`).
  - Google APIs Terms §2.d: "will not attempt to circumvent such limitations" (S32). The code rotates up to 20 free keys (`lib/ai.ts:87-93`).
  - The Gemini API terms say: "**Do not submit sensitive, confidential, or personal information to the Unpaid Services**", and warn that human reviewers may read inputs (S33). Every lead, including names, emails and phone numbers, is sent to the free tier (`lib/spamClassifier.ts:32`).
  - A buyer's legal team would reject this setup. Moving to paid AI costs cents per tenant (table above).

### 2.3 E5 in money terms: 300/day for Pro, 1,000/day for Max

- **On today's single legitimate free account** (300 emails/day aggregate, `lib/plans.ts:12-14`; confirmed by S22):
  - A Pro tenant at full use averages 5,000 ÷ 30 = 167 emails/day, so the pool carries 300 ÷ 167 = **1.8 Pro tenants**.
  - A Max tenant averages 667/day, so the pool carries **0.45 Max tenants**.
  - A Free tenant averages 3.3/day, so the pool carries **90 Free tenants**, shared across everyone.
  - A single Max sale oversells the whole pool by 3.3× on its burst day. The quota logic ties email to the monthly submission cap, so "300/day" and "1,000/day" are only burst allowances. The real monthly exposure is 5,000 emails for Pro and 20,000 for Max.
- **Cost of making the promise honest:**

| Provider plan | Monthly cost | Pro tenants at full use | Max tenants at full use |
|---|---|---|---|
| Resend Pro, 50k | $20 | 10 | 2.5 |
| Brevo Starter, 20k | $29 | 4 | 1 |
| Brevo Starter, 100k | $69 | 20 | 5 |
| SES | ~$0.50 per Pro tenant, ~$2 per Max tenant | — | — |

  **E5 therefore costs one to four Pro subscriptions a month to fix.** It is a sequencing problem, selling capacity before owning it, not an economic one.
- **Hidden prerequisite.** The README itself warns that a `.vercel.app` domain cannot be a verified sender (`README-english.md:81`). The default sender is the agency's Outlook address (`lib/email.ts:16`). A custom sending domain is a precondition for "priority deliverability" and DKIM on Max.

---

## 3. Funnel math

### 3.1 Benchmarks

| Step | Benchmark | Source | Rate used in base case |
|---|---|---|---|
| Visitor → free signup | 13.3% for freemium SaaS, organic traffic (established companies, 86 firms) | S34 | **5%**: a new `vercel.app` brand with anonymous testimonials (`lib/dictionaries.ts:151-157`) and a self-hosting claim that contradicts the hosted signup (E8) |
| Signup → activated (first real submission) | Average SaaS activation 37.5% | S35 (search summary; source page returned 404) **[UNVERIFIED]** | **35%** |
| Signup → paid, freemium | 2.6% organic (S34). "Good" is 3–5% (S36). Developer-focused companies convert at about half the rate of others (S36) | S34, S36 | **2%** (1% while checkout is still a `mailto:`, `lib/upgrade.ts:1-13`) |
| **Visitor → paid** | derived | 5% × 2% | **0.10%** |
| Cross-check | Web3Forms has ~126k visits/month (378.1k over 3 months, S37) and 2,939 subscriptions (S38). At 5% churn it needs 147 new subscriptions a month, so 147 ÷ 126k = **0.12%** | S37, S38 | consistent |
| ARPU | Web3Forms: $40,549 ÷ 2,939 = **$13.80**. Inlet mix assumed at 50% Solo / 40% Pro / 10% Max = $17.00 | S38 | **$15** |
| Monthly churn | Recurly: 4.29% for the $10–25 ARPC band (the page is ambiguous about the period, S39). ChartMogul: under $25 ARPA, monthly plans keep 41% of customers after a year, i.e. 1 − 0.41^(1/12) = **7.2%/month** (S40, secondary) | S39, S40 | **5%** (bear 7%, bull 4%) |

Per 10,000 visitors in the base case: 500 signups, 175 activated, **10 paying**, $150 MRR. LTV = $15 × 75% gross margin ÷ 5% = **$225**, so a visitor is worth **$0.225**.

### 3.2 Traffic needed

Customers N = MRR ÷ $15. With 5% churn, customers held at month 12 = monthly acquisition × (1 − 0.95¹²) ÷ 0.05 = **acquisition × 9.19**.

| Target MRR | USD | Paying customers | New paid per month to reach it in 12 months | **Visitors/month at 0.10%** | Steady-state visitors to hold it |
|---|---|---|---|---|---|
| €500 | $570 | 38 | 4.1 | **4,100** | 1,900 |
| €1,000 | $1,140 | 76 | 8.3 | **8,300** | 3,800 |
| €5,000 | $5,702 | 380 | 41.3 | **41,300** | 19,000 |
| €10,000 | $11,403 | 760 | 82.7 | **82,700** | 38,000 |

Sanity check against mature players:
- Web3Forms makes $40.5k MRR on 126k visits/month, i.e. **$0.32 of MRR per monthly visit**. At that efficiency, €10k MRR needs about 35,600 visits/month.
- Formspree gets about 400k visits/month (1.2M over 3 months, S41) against an *estimated* $770k ARR (S42, GetLatka estimate), i.e. **$0.16 per visit**.
- So even at mature efficiency, **€1k MRR needs about 3,600–7,000 targeted visits/month**, and a young site needs more.

### 3.3 Channels and customer acquisition cost (CAC)

**Break-even cost per paid click** = LTV × visitor→paid = $225 × 0.001 = **$0.23**. Any ad click that costs more than 23 cents loses money. Developer-tool CPCs are usually well above $1 **[UNVERIFIED]**.

| Channel | Mechanism and evidence | Estimated yield | CAC estimate |
|---|---|---|---|
| **Direct outreach to agencies** in the target markets, via the author's network | Sells the one differentiated feature: portals and per-client branding (E14) | **Assumption:** 50 contacts → 10 calls → 2 paying at $49 | 15 h × $15/h opportunity cost (**assumption**) ÷ 2 = **~$112**. Agency LTV = $49 × 75% ÷ 3% churn (**assumption**) = $1,225, so **LTV/CAC ≈ 11** |
| Author's own client sites | Captive users | These are the agency's own clients, not buyers of Inlet | $0; the value is internal (§5) |
| Communities (Show HN, Reddit, Indie Hackers, dev.to, French/Cameroonian developer groups) | Web3Forms' founder on Twitter and Reddit: "not many conversions … the audience did not match" (S43) | One-off spikes; spike size **[UNVERIFIED]** | Time only; low yield |
| **SEO** (5 compare pages, E11; docs) | Web3Forms: "Google is currently the #1 acquisition channel" (S43). But at least 7 rivals publish "alternatives"/"vs" pages (formbackend, formgrid, splitforms, staticforms, forminit, pagetools, web3forms; seen in S4/S5 search results). Inlet sits on a shared `vercel.app` subdomain and its GitHub card links to a homepage that returns 404 (case file §1) | Slow: 6–12+ months to rank **[UNVERIFIED]** | Time-heavy; payback over 12 months |
| **"Powered by Inlet" footer** (E12; `emails/AutoReply.tsx:42`) | Scales with free-tier email volume | 100 active free tenants × 50 emails × 0.5% click-through (**assumption**) = 25 visits/month, i.e. **0.025 paid/month** | ≈ 0 cost, ≈ 0 yield until thousands of tenants |
| **AI agents** (`/llms.txt`, MCP, skill file, E14) | An agent recommends what it already knows unless pointed at Inlet. MCP is **not unique**: Formcarry includes an MCP server on its free plan (S6) | Unmeasured. Measurable via `pageviews.referrer` (`migrations/migration_v11_analytics.sql`) | ≈ 0 marginal cost |
| Paid search | Break-even CPC $0.23 | — | **Negative ROI** |

---

## 4. Revenue scenarios

Parameters: ARPU $15, and the §3.1 rates. Simulated month by month with churn applied each month (script arithmetic is summarised below each assumption).

| | **Bear** | **Base** | **Bull** |
|---|---|---|---|
| **Probability** | **60%** | **30%** | **10%** |
| What must be true | The author does not resume in a sustained way (evidence: **0 commits in 51 days**, case file). Checkout stays a `mailto:`. No custom domain | Author resumes within 60 days: Paddle checkout, custom domain, honest positioning (drop the false "self-hosted" claim, E8), paid email and AI. About 10 h/week on distribution | Base, plus one channel works (agency direct sales and/or AI-agent or SEO discovery) |
| Traffic | 200 visits/month, flat | 300/month in months 1–2, rising linearly 500 → 3,000 by month 12, then 3,000 → 6,000 by month 24 | 500 in months 1–2, rising 1,000 → 8,000 by month 12, then → 15,000 by month 24 |
| Visitor → paid, churn | 0.03%, 7% | 0.10%, 5%; plus 2 network Pro customers in month 3 | 0.15%, 4%; plus 1 agency at $49 per month from month 3 (3% churn) |
| Customers at month 12 | 0.5 | 15.3 self-serve + 1.3 network | 60.8 self-serve + 8.8 agencies |
| **MRR at month 12** | **$7 (€6)** | **$254 (€223)** | **$1,341 (€1,176)** |
| MRR at month 24 | $11 | **$781 (€685)** | **$3,929 (€3,446)** |
| Revenue in the first 12 months | $55 | $1,365 | $6,446 |
| Net of ≈ $66/month fixed from month 3 | ≈ $55 if it stays on free tiers (terms-of-service exposure) | $1,365 − $660 = **$705** | $5,786 |
| Implied hourly return, year 1 (10 h/week × 52 = 520 h, **assumption**) | — | **$1.36/h** | **$11/h** |

Probability-weighted results:
- **Month 12:** 0.6 × 7 + 0.3 × 254 + 0.1 × 1,341 = **$215 MRR (€188)**
- **Month 24:** 0.6 × 11 + 0.3 × 781 + 0.1 × 3,929 = **$634 MRR (€556)**

**Base rates**
- **Category, from TrustMRR (verified revenue).** Of 6 form-backend listings found, **1** (Web3Forms, $40,549 MRR) is above $1k MRR (S38).
  - FormSubmit, which claims "6 million submissions from more than 400,000 registered websites" (S12), shows **no active subscriptions** (S44).
  - nForms (a German proof-of-work form backend, Feb 2026) and FormsFort (May 2026) show **none** (S45, S46).
  - Form0.app has made **$45 all-time** (S47) and FormsReach **$2** (S48).
  - TrustMRR is opt-in, so this is a biased sample, but it is the only verified one.
- **The category winner's own ramp:** "20 paying customers in 20 months" (S43b, secondary). Then ~$1,600 MRR and "100+ paying customers" by Nov 2024, about 4 years after its Dec 2020 founding (S49, secondary) **[UNVERIFIED]**. Then $40.5k verified in 2026.
- **Micro-SaaS overall:** about 70% earn under $1k MRR, and only 18% are in the $1k–5k band (S50, citing a 1,000-product analysis whose method is unclear). This is survivorship-biased upward, because products that made $0 rarely get counted.
- **Consistency check.** My scenarios imply P(MRR ≥ $1k at month 12) ≈ 8% and at month 24 ≈ 12–15% (the bull case plus the top of the base range). That is in line with these base rates.

---

## 5. Will it be used at all?

**Evidence of current external usage: none found.**

| Signal | Observation |
|---|---|
| GitHub | 0 stars, 0 forks, 0 issues (GitHub API, 2026-09-28). The repo's homepage link `forms-central.vercel.app` returns 404 |
| Social proof | Two anonymous "Early user" quotes plus one from the creator (`lib/dictionaries.ts:151-157`). The copy itself says "Inlet is new" |
| Landing-page numbers | "1,248 total leads", "7 active forms across 5 sites" is a **mock dashboard** with sample data ("Ada Lovelace"), not usage |
| Payment path | None. Upgrades go by email (`lib/upgrade.ts:1-13`), so there can be no self-serve paying user |
| Activity | Every sitemap `lastmod` is 2026-08-08; no commits since |
| What the author *can* see and we cannot | Signups, MRR and conversion (`app/admin/revenue/page.tsx:9-19`, `lib/actions.ts:896`); pageviews with referrer (`migration_v11_analytics.sql`); `email_log` (`migration_v8`); `ai_messages` with provider (`migration_v5`) |

**The captive case: the author's agency.** The number of client sites N is unknown; I assume 10–30 (**assumption**).
- **Fees avoided.** Incumbents price *per account*, not per site. One Web3Forms Pro account ($149/yr, 10k submissions/month) or one EmailJS Professional account ($15/month) can serve every site. So the counterfactual is **$0/yr** (most showcase sites fit free tiers) to **$150–180/yr** (one Web3Forms Pro or EmailJS account), and up to **$720–1,080/yr** only if the agency needed Formspree Business-grade custom templates and domains (S1).
- **Hours saved.** Integration is "two values" (`README-english.md:171-180`). Assume about 0.5 h saved per new site (**assumption**) × 5–15 new sites/yr = **2.5–7.5 h/yr**, plus unquantified time no longer spent forwarding leads (the anonymous testimonial claims hours, `lib/dictionaries.ts:156`, **[UNVERIFIED]**).
- **Cost of running it legitimately for commercial agency use:** Vercel Pro $20 plus, if needed, Supabase Pro $25 = **$20–45/month = $240–540/yr**.
- **Net captive value: roughly −$540 to +$1,080 a year.** The captive case alone does not pay for the 19-day build (107 commits, case file). The captive upside is *resale*: bundling "lead inbox + branded auto-reply + client portal" into the agency's maintenance contracts (§6 b/c).

**The substitute threat**
- Resend's official Next.js guide is three steps, with a route handler of about 15–20 lines (S15), running on a free plan of 3,000 emails a month (S16).
- A coding agent produces this in minutes (my assessment). For a **single site**, the substitute costs $0 and removes the need for any form backend, which erodes the freelancer and indie segments.
- What a one-off route does *not* give you is a cross-site dashboard, per-client portals, spam triage and retention. **The substitute kills the one-site use case but not the many-client-sites use case.** That second case is the only one where Inlet's differentiation (E14) matters.

---

## 6. Alternative business models, ranked by expected value for a solo developer

12-month expected value (EV) = Σ(probability × cumulative 12-month cash). Every probability and volume below is an **assumption** stated inline.

| Rank | Model | 12-month revenue potential | Time to first € | Effort | Main risk | **12-month EV (arithmetic)** |
|---|---|---|---|---|---|---|
| **1** | **(c) Done-for-you lead capture for local businesses**, sold by the agency with Inlet as the engine. France: €200–400 setup + €10–20/mo (**[UNVERIFIED]** pricing). Cameroon: 30k–60k FCFA (€46–91) + 3k–5k FCFA/mo | €1–3k | **2–4 weeks** | About 3 h per client; uses the existing sales motion | It is a service and does not scale | 50% × (8 clients × ~€200 each over the year) + 50% × €200 = **≈ €900 ($1,030)** |
| **2** | **(d) White-label resale to agencies, priced per client site** (e.g. $3/site/month, $29 minimum; **assumption**), sold directly in France and Cameroon | $0.5–5k | 1–3 months (needs checkout, a data-processing agreement, a domain) | Medium | Trust in a one-person vendor; GDPR processor duties; many agencies are WordPress shops (S18) | 35% × (10 agencies × $49 × ~5.5 avg months = $2,695) + 65% × $150 = **≈ $1,040**. Highest LTV/CAC (§3.3) |
| 3 | **(a) The SaaS as priced now** | $0–6.4k | Only after checkout ships | High (distribution into a saturated SERP) | 60% bear case | From §4: 0.6 × 55 + 0.3 × 1,365 + 0.1 × 6,446 = $1,087 gross, minus fixed costs 0.4 × $660 = **≈ $823 net**. Fattest 24-month tail ($3.9k MRR bull) |
| 4 | **(e) One-time licence / self-host kit**, which would make the "self-hosted" claim (E8) true | $0.1–2k | 2–4 weeks | Medium: installer, docs, support | Support burden; open-source substitutes | 40% × (10 × $99) + 60% × $99 = **≈ $455** |
| 5 | **(f) Region-first play: Francophone Africa with mobile money** (Notch Pay 2% per payment and 1% per transfer, S51; CinetPay MTN 2% / Orange 2.2% / cards 3.5%, S52; CamPay 2% / 1%, S52) | €0.1–1k | 1–2 months | Medium | Low willingness to pay; small market; leads are WhatsApp-first (FormsReach, form → WhatsApp, has made **$2 all-time**, S48) | 30% × (20 × €7.6 × 5.5) + 70% × €40 = **≈ €280 ($320)**. Its value is as a *moat* for (c) and (d): card-less billing that US incumbents do not offer |
| 6 | **(b) Agency-internal tool only** | Cost avoided | Immediate | Low | Capped value | Midpoint of −$540 … +$1,080 = **≈ +$270/yr** |
| — | **(g) Portfolio / credibility asset** | One freelance engagement won on the strength of this codebase (18.8k lines, i18n, MCP, 2FA) | — | — | Not a product business | 10 days at an assumed €300–450/day (**[UNVERIFIED]**) = €3–4.5k, **more than any Inlet model's 12-month EV** |

**Payment rails** determine what is feasible, and which ones open depends on where the seller's legal entity is registered. The table covers two cases: a seller based in a target market that Stripe does not serve (Cameroon, named in `lib/i18n.ts`), and a seller with an EU entity.

| Rail | Seller in Cameroon? | Seller with an EU entity? | Fee |
|---|---|---|---|
| Stripe | **No**: Cameroon is not listed; Côte d'Ivoire, Ghana, Kenya, Nigeria and South Africa are (S53) | Yes (France listed) | — |
| **Paddle** (merchant of record) | **Yes**: "works with software businesses anywhere … with the exception of" a list that excludes Cameroon (S54) | Yes | 5% + $0.50 (S30) |
| Lemon Squeezy | Cameroon not on the bank-payout list; PayPal payouts in 200+ countries (S55) | Yes | 5% + 50¢ **[FROM MEMORY]** |
| Polar | **No**: Cameroon not listed; Senegal, Côte d'Ivoire, Gabon, Benin and Niger are (S56) | Yes | 5% + 50¢, +1.5% international (S57, secondary) |
| Notch Pay / CinetPay / CamPay | Yes, mobile money | — | 2–2.2% mobile money; 3.5% cards (CinetPay) |

On Paddle, a $19 Pro sale nets $19 − $1.45 = $17.55 (7.6% fee). A $9 Solo sale nets $8.05 (10.6% fee).

---

## 7. The number that decides it

**Metric:** the number of **paying external accounts at day 60**. "Paying" means money actually received through a real checkout (Paddle or a mobile-money link) at list price, not a promise. "External" means neither the author's agency nor accounts the author set up personally.

- **Why this metric.** In this category, usage does not predict revenue: FormSubmit has 400k sites and no subscriptions listed (S12, S44). The trial's open question is willingness to pay, not whether a form can be delivered. It also forces the two prerequisites everything else depends on: a checkout, and one real distribution action.
- **Base-case forecast for day 60:** about 0.6 self-serve customers (2 months × 300 visitors × 0.10%, from the §4 simulation) plus 1–3 from direct agency outreach, so **about 2–4**.

| Result at day 60 | Meaning | Action |
|---|---|---|
| **5 or more** | Beats the base case | **Continue.** Double down on whichever channel produced them |
| **2–4** | Matches the base case | Continue **only** through the channel that produced them (probably agency direct sales, model d). Re-test at day 120 with a target of 10 or more |
| **0–1** | Matches the bear case | **Stop investing in the self-serve SaaS.** Keep Inlet as the agency's internal engine (b) and as a delivery tool for services (c) |

Diagnostic, not a decision metric: activated external tenants (10 or more clean submissions in 30 days). Many activated tenants but no payers means a willingness-to-pay problem. Five or fewer activated tenants means a distribution problem.

---

## Sensitivity: the three assumptions that would flip the conclusion

1. **Visitor→paid conversion and reachable traffic (0.10% at a few thousand visits a month).** €1k MRR in 12 months needs about 8,300 visitors a month at 0.10%. If traffic is agency-targeted and converts at **0.3%** (3×), the requirement falls to about 2,800 a month, which is inside the base traffic range, and the base case becomes about €700–1,000 MRR. If AI-agent discovery through MCP or `llms.txt` turns out to deliver thousands of qualified visits, the verdict moves toward "continue the SaaS".
2. **Agencies' willingness to pay per client site, and their churn.** If small agencies pay about $49 a month and churn 3% or less, **20 agencies = $980 MRR through direct sales alone**, with no SEO needed, and model (d) becomes a real business. If they will not pay more than $19, or if WordPress plugins and Formspree already capture that value (40.2% of sites run WordPress, S18), model (d) collapses into model (a).
3. **Author continuity.** Every non-bear scenario assumes sustained work of about 8–10 hours a week for 6 or more months. The only evidence available points the other way (0 commits in 51 days). Without that commitment, the bear probability rises from 60% to about 90%, and the probability-weighted MRR falls below $50.

Costs are **not** on this list. Even the worst-case Max margin stays positive (37%, or 16% with labour). The only cost risk that could flip anything is the uncapped "unlimited AI", and a monthly cap removes it.

---

## What the Economist cannot know, and how to measure it in a week

| Unknown | Why it matters | One-week measurement |
|---|---|---|
| Current traffic, and how much comes from search or AI agents | Sets the funnel scale (§3) | `SELECT date_trunc('week',created_at), count(DISTINCT session_id), referrer FROM pageviews GROUP BY 1,3` (`migration_v11`). Look for chatgpt.com, perplexity.ai and claude.ai referrers |
| Signups, activation, plan mix, upgrade emails received | Tells whether anyone outside the author uses it | `/admin/revenue` (`app/admin/revenue/page.tsx`); count clients with at least 1 submission from an origin the author does not own; check the upgrade inbox (`lib/upgrade.ts:6`) |
| Captive N: agency sites wired and their monthly submissions | Sets the captive value (§5) | `submissions` joined to `forms` and `clients`, grouped by client, last 90 days |
| Real email volumes and SMTP failure rate | E5 exposure; account-suspension risk | `email_log` by day; `failures_log` where `error_type LIKE 'SMTP_%'` |
| How often the free Gemini pool fails over | AI reliability and cost | `ai_messages.provider` distribution (`migration_v5`) |
| Inbox placement of the shared sender | Whether "priority deliverability" is real | Send to seed inboxes (Gmail, Outlook, Yahoo) plus a mail-tester score, on the author's own test form |
| Agency willingness to pay per client site | Sensitivity #2 | 10 structured calls with agencies in France and Cameroon, each ending in an offer to **prepay** one month through a Paddle or mobile-money link |
| Payout feasibility from the author's jurisdiction and legal entity | Whether money can be collected at all (§6 rails) | Open a Paddle seller account (KYC); run a 100 FCFA Notch Pay test transaction |
| Author's available hours per week | Sensitivity #3 | A calendar commitment for the next 60 days, written down before starting |
| Actual token usage per AI call | Refines §2.1 (my estimate is about 4 characters per token) | Log `usageMetadata` from the Gemini responses for one day |

---

## Sources (all accessed 2026-09-28)

- S1 Formspree plans: https://formspree.io/plans
- S2 Basin pricing: https://usebasin.com/pricing
- S3 Forminit (ex-Getform) pricing and rename note: https://forminit.com/pricing/ (redirect from getform.io/pricing)
- S4 Web3Forms pricing (secondary): https://splitforms.com/web3forms-pricing (page dated 2026-09-27); the primary https://web3forms.com/pricing returned 403
- S5 Static Forms pricing (search summary of https://www.staticforms.dev/pricing, which returned 429, plus https://freetier.co/directory/products/static-forms) **[UNVERIFIED]**
- S6 Formcarry pricing: https://formcarry.com/pricing
- S7 Formspark pricing: https://formspark.io/pricing/
- S8 EmailJS pricing: https://www.emailjs.com/pricing/
- S9 Jotform pricing: https://www.jotform.com/pricing/
- S10 Tally pricing: https://tally.so/pricing
- S11 Netlify Forms billing: https://docs.netlify.com/manage/forms/usage-and-billing/
- S12 FormSubmit: https://formsubmit.co/ ; pricing description via S44
- S13 SlashData developer population 2025: https://www.slashdata.co/post/global-developer-population-trends-2025-how-many-developers-are-there
- S14 Malt tariff barometer pages (search summary): https://www.malt.fr/t/barometre-tarifs **[UNVERIFIED counts]**
- S15 Resend "Send with Next.js": https://resend.com/docs/send-with-nextjs
- S16 Resend pricing: https://resend.com/pricing
- S17 France agency counts (secondary, conflicting): https://modelesdebusinessplan.com/blogs/infos/marche-agences-web-chiffres ; https://www.channelnews.fr/agences-digitales-un-marche-de-15-milliard-en-croissance-de-pres-de-10-55431
- S18 W3Techs CMS usage (28 Sep 2026): https://w3techs.com/technologies/overview/content_management
- S19 World Bank, Cameroon GDP per capita (2024): https://data.worldbank.org/indicator/NY.GDP.PCAP.CD?locations=CM
- S20 Showcase-site prices in Cameroon: https://digitalrestitution.com/quel-est-le-prix-dun-site-web-au-cameroun/ ; https://elimboo.com/prix-site-web-afrique-francophone/
- S21 Amazon SES pricing: https://aws.amazon.com/ses/pricing/
- S22 Brevo pricing (secondary; brevo.com did not render): https://www.emailtooltester.com/en/reviews/brevo/pricing/ (updated 2026-08-05); no daily cap on paid plans: https://www.emailvendorselection.com/brevo-pricing/
- S23 Postmark pricing: https://postmarkapp.com/pricing
- S24 Gemini API pricing: https://ai.google.dev/gemini-api/docs/pricing
- S25 Mistral API pricing: https://mistral.ai/pricing/api
- S26 Groq pricing (secondary): https://www.cloudzero.com/blog/groq-pricing/ ; https://www.aipricing.guru/groq-pricing/ **[UNVERIFIED]**
- S27 Vercel pricing: https://vercel.com/pricing
- S28 Supabase pricing: https://supabase.com/pricing
- S29 ECB reference rate 25 Sep 2026 (via search): https://www.ecb.europa.eu/stats/policy_and_exchange_rates/euro_reference_exchange_rates/html/index.en.html
- S30 Paddle pricing: https://www.paddle.com/pricing
- S31 Brevo Terms of Service §3.1: https://www.brevo.com/legal/termsofuse/
- S32 Google APIs Terms of Service §2.d: https://developers.google.com/terms
- S33 Gemini API Additional Terms: https://ai.google.dev/gemini-api/terms
- S34 First Page Sage conversion benchmarks (updated 2025-09-05): https://firstpagesage.com/seo-blog/saas-free-trial-conversion-rate-benchmarks/
- S35 Userpilot activation benchmark (search summary; page 404): https://userpilot.com/blog/user-activation-rate-benchmark-report-2024/
- S36 Lenny's Newsletter, free-to-paid conversion: https://www.lennysnewsletter.com/p/what-is-a-good-free-to-paid-conversion
- S37 Similarweb, web3forms.com (Aug 2026): https://www.similarweb.com/website/web3forms.com/
- S38 TrustMRR, Web3Forms (verified via Paddle, updated 2026-09-28): https://trustmrr.com/startup/web3forms
- S39 Recurly churn benchmarks: https://recurly.com/research/churn-rate-benchmarks/
- S40 ChartMogul figures via SubJolt (secondary): https://www.subjolt.com/guides/churn-rate-benchmarks/
- S41 Similarweb, formspree.io (Aug 2026): https://www.similarweb.com/website/formspree.io/
- S42 GetLatka, Formspree estimate: https://getlatka.com/companies/formspree.io
- S43 IndieHustle interview with Web3Forms' founder (2025-02-06): https://www.indiehustle.co/p/a-simple-contact-form-is-making-10000 ; S43b Starter Story: https://www.starterstory.com/web3forms-breakdown
- S44 TrustMRR, FormSubmit: https://trustmrr.com/startup/formsubmit
- S45 TrustMRR, nForms: https://trustmrr.com/startup/nforms
- S46 TrustMRR, FormsFort: https://trustmrr.com/startup/formsfort
- S47 TrustMRR, Form0.app: https://trustmrr.com/startup/form0-app
- S48 TrustMRR, FormsReach: https://trustmrr.com/startup/formsreach
- S49 Gaps.com, Web3Forms milestones (secondary): https://gaps.com/web-development/
- S50 Micro-SaaS revenue distribution: https://www.rockingweb.com.au/micro-saas-revenue-analysis-2025/ ; https://freemius.com/blog/state-of-micro-saas-2025/
- S51 Notch Pay pricing: https://notchpay.co/pricing
- S52 Cameroon payment platforms (CinetPay, CamPay; secondary): https://vadevise.com/fr/guides/plateformes-paiement-cameroun/
- S53 Stripe global availability: https://stripe.com/global
- S54 Paddle supported countries: https://www.paddle.com/help/start/intro-to-paddle/which-countries-are-supported-by-paddle
- S55 Lemon Squeezy supported countries: https://docs.lemonsqueezy.com/help/getting-started/supported-countries
- S56 Polar supported countries: https://polar.sh/docs/merchant-of-record/supported-countries
- S57 Polar fees (secondary): https://dodopayments.com/blogs/polar-sh-review

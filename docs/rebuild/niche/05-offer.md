# 05 · The irresistible offer

> Lens O. Five offer variants on today's code; guarantees one person can honour; value math; the one-page offer sheet (EN/FR); build vs manual for the first 10 customers.
> One of five research lenses behind the round-2 decision ([`README.md`](README.md)), written on 2026-09-29 by an independent research agent with live web research; every URL was accessed that day. **[HYPOTHESIS]** / **[H]** marks an unverified input. References: "V" or `05-verdict.md` = `docs/tribunal/05-verdict.md`; "R" or `README.md` in citations = `docs/rebuild/README.md` (plan v2); "H" = `docs/rebuild/06-hater-review.md`.
> **Not legal or tax advice.**

---

The research ran on 2026-09-29, and every URL below was accessed that day. `file:line` refers to `/home/user/Forms-Central`. **[H]** marks an unverified assumption. The founder's hour is costed at **€40** (the Codeur €38–43/h average, `docs/tribunal/05-verdict.md` N6). No repo file was written and nothing was submitted to any live site. The web-search budget ran out near the end, so the January seasonality claim is marked [H].

---

## 0. Answer in 30 seconds

**The one offer to put in front of buyers first:**
- **EN name:** "Zero Missed Trial Requests". **FR name:** « Zéro demande d'essai perdue ».
- **What it is:** a done-for-you lead line for **private combat-sports and martial-arts clubs** (MMA, BJJ, boxing, muay thai, kickboxing), sold **per location** by the author's studio.
- **What the club gets:**
  - its trial-class form installed or repaired;
  - an automatic answer to every request, in FR or EN: the schedule plus a booking link;
  - a daily check of the form;
  - a **14-day proof report**, then a monthly report.
- **Price:** €49 per location per month, excl. VAT. Founding price €39, locked for 12 months, for the first 10 clubs. Setup €190, waived for founding clubs. US: $59, founding $45, setup $190.
- **Risk reversal:**
  - nothing is paid before the 14-day report;
  - a request lost because of us makes that month free, credited automatically.

**Why this offer first and not the studio offer:**
1. **Least to build before the first invoice.**
   - It runs on the admin path, which already carries the author's live client leads (`05-verdict.md` N1, :112). The admin form defaults work (`lib/actions.ts:312`).
   - The court requires the stranger path and B4 only before charging an *external agency* (`05-verdict.md:289, 342`). The studio offer therefore needs about 20 h more (F2/B4) first.
2. **Each club signed passes the court's studio gate.** That gate needs ≥2 distinct paying businesses, ≥1 outside the existing multi-site client (`05-verdict.md:354`).
3. **It uses the author's unfair advantage:** a multi-location combat-sports client, bilingual work, and site building.
4. **The buyer list has a known size.** In France, the kickboxing/muay thai federation (FFKMDA) lists 1,373 clubs ([Wikipedia](https://fr.wikipedia.org/wiki/F%C3%A9d%C3%A9ration_fran%C3%A7aise_de_kick_boxing,_muay_tha%C3%AF_et_disciplines_associ%C3%A9es)), karate 4,900 ([FFK](https://www.ffkarate.fr/ffk/)) and judo 5,000 ([France Judo](https://www.ffjudo.com/qui-sommes-nous)). The US has **76,364** martial-arts studios ([IBISWorld via Gymdesk](https://gymdesk.com/blog/martial-arts-industry-statistics)).
5. **It has the best margin after the founder's hours** (§4).

**Same fulfilment, second offer.** The same service is sold wholesale to web studios (V1) from week 2, so the court's external-agency gate stays alive.

**Finding the plan missed.** Plan v2's **€29 for 10 clients** (`docs/rebuild/README.md:29`) **loses money on founder time** until the reports and canaries are automated:
- about 1.1 h/month × €40 = €44 of work for €29 of revenue;
- the fix is €39 founding / €59 list, plus automation (§4, §7).

---

## 1. What makes small-business B2B offers convert (2025–26)

| Principle | Evidence | What it means for Inlet |
|---|---|---|
| **Productize: fixed scope, fixed price, fixed process** | "A service sold at a fixed price with a clearly defined scope and a repeatable delivery process" ([ManyRequests](https://www.manyrequests.com/blog/productized-service-guide)). Designjoy: **one person, $1.7M ARR**, $4,995–5,995/mo, strictly one request at a time, no calls ([Starter Story](https://www.starterstory.com/stories/design-joy-breakdown)) | One deliverable per location, the same every month. No custom work, no calls after onboarding. Cap the capacity |
| **Service-as-software: sell the outcome, show it before the contract** | "The customer now expects to experience functionality, integration, and outcome before a contract is signed"; "Buyers don't purchase software; they purchase the outcomes" ([Foundation Capital](https://foundationcapital.com/the-4-6t-service-as-software-opportunity-lessons-from-year-one/)) | The live Leak Check is the "experience before contract" step. The 14-day proof report comes before the first invoice |
| **Paid pilot, not a free trial** | Paid pilots convert "70%+", 60 to over 90%. Unpaid pilots "are a waste of time … 95% of the time" ([SaaStr](https://www.saastr.com/what-is-the-typical-conversion-from-paid-pilot-to-annual-contract-in-b2b-saas-2)) | Use a **deferred-payment paid pilot**: a signed order with a price, and the invoice on proof. No free tier |
| **Risk reversal by type** | Unconditional, conditional, performance/implied and anti-guarantees ([Hormozi wiki](https://alexhormozi.wiki/frameworks/guarantee-types-and-examples), secondary) | Choose a **bounded implied guarantee** (a credit when *we* fail). Never guarantee the club's sales outcome (§3) |
| **Price against value: the 10× rule** | "We charge this much because our customers get at least 10x that much value" ([Sixteen Ventures](https://www.sixteenventures.com/saas-pricing-strategy/)) | Price at 10% or less of the value of the leads recovered (§4, §8) |
| **Founding scarcity, capped** | Capped prepay beats a lifetime deal: LTDs bring 16–17% refunds and 30–40% more support tickets (`docs/rebuild/03-money.md:59-60`) | First 10 only, locked for **12** months (not 24), so the low anchor doesn't last |
| **Reports sell retention, dashboards don't** | Only 27% of agency clients prefer live dashboards (`06-hater-review.md:50`). 32% of agencies cite lack of perceived value as a churn cause (`05-moonshots.md:39`) | Sell the **report**, not the portal |

---

## 2. The hook: what missed-lead audits reveal

| Study (who, sample) | Finding | Source |
|---|---|---|
| Leadferno 2024 (vendor). 225 small-business forms in home, professional and medical services, all top-10 on Google Maps, tracked for 3 weeks | **4.8%** of forms broken. **42.6%** of leads got no response at all. Only **15.6%** sent an auto-reply. First reply after 17 h 49 on average. **3.1%** replied within 5 min | [leadferno.com](https://leadferno.com/blog/research-website-contact-forms-and-lead-management-uncovering-costly-mistakes) |
| DelPrete 2024 (independent). 100+ secret shops across 25+ brokerages | **47%** of online property inquiries ignored. Average 8 h 17, median 39 min | [mikedp.com](https://www.mikedp.com/articles/2024/8/13/secret-shopping-47-of-online-property-inquiries-are-ignored) |
| WAV Group. 100 real-estate offices | 32% never replied. The later study: nearly half never replied | [Inman PDF](https://webassets.inman.com/files/stories/BrokerResponsiveness_v3.pdf) |
| Replify 2025 (vendor). 105 US fitness facilities, by phone | **39%** of callers could not reach anyone. **12%** got any follow-up within 72 h | [replify.ai](https://www.replify.ai/ai-sales-service-blog/fitness-industry-secret-shop-report) |
| RevenueHero 2024 (vendor). 1,000 B2B SaaS demo forms | **63.5%** never responded. Average 1 day 5 h | [revenuehero.io](https://www.revenuehero.io/blog/b2b-lead-response-times) |
| UPCEA 2025. 1,000 higher-education inquiries | 44% unanswered. Request-for-information forms: 37% non-response | [upcea.edu](https://upcea.edu/secret-shopper-2025/) |
| HBR 2011. 2,241 US firms | 23% never answered. 42 h on average. Answering within 1 h made qualification about 7× likelier | `docs/rebuild/02-product.md:33` |
| Red Sift, Dec 2025. 73.3M domains | Only **14.9%** have any DMARC record | [technologychecker.io](https://technologychecker.io/blog/dmarc-adoption-statistics) |

**How to use it as the hook: the "Leak Check" (FR: « Test express des demandes »), 15 minutes.**

1. **Before any contact, send nothing to the prospect's form.**
   - Check that the form exists and where it posts, whether there is a success message and a CAPTCHA, and the domain's SPF/DMARC (`dig`).
   - This is the non-submitting scan from `04-distribution.md:65`, done by hand.
2. **Opening line:** "225 local businesses were mystery-shopped through their website forms: 42.6% never replied, and only 15.6% even sent a confirmation. Can we send one test trial request through your site, together, right now?"
3. **With the owner's consent**, submit one request marked "TEST – Leak Check" and start a timer. Record:
   - confirmation page yes/no;
   - auto-reply yes/no (the base rate predicts about 84% have none);
   - owner alert received, and in which folder;
   - minutes elapsed.
4. **Show the three results, then show the offer.**

**Consent rule:** never submit to a stranger's form without consent.
- It wastes their time and poisons the relationship.
- `05-moonshots.md` (X19) already calls this "ethically grey".
- For studios, test only the client sites they maintain, and mark every test clearly.

---

## 3. Guarantees one person can honour, and ones that would sink him

| Guarantee | Verdict | Why |
|---|---|---|
| **"If a request is lost because of us, that month is free for that location, credited automatically"** | **SAFE** | Exposure is capped at one month's fee, with no on-call duty. "Lost" is measurable: not stored, auto-reply not sent (`email_log.kind='auto_reply'`, `migrations/migration_v8_email_log.sql:10`), or alert not sent. At [H] a 2–5% incident rate, it costs about €1–2.50 per location per month |
| **"A broken form is reported to you within 1 business day, with the fix"** | **SAFE** once the daily canary exists | It promises *detection*, not uptime. That fits "no SLA in 2026" (`README.md:288, 308`) |
| **"Nothing to pay until your 14-day proof report"** | **SAFE** | A deferred paid pilot. It also means no charge before the court's B1–B3 orders are live |
| **"Leave any month: full export, and your old form put back"** | **SAFE** | CSV export exists. Fix the CSV formula injection first (N23) |
| "Paid Leak Audit: we find ≥1 leak or it's free" (studios, portfolios of ≥10 sites) | **SAFE** | Across 10 sites, with 84% lacking an auto-reply and 85% of domains lacking DMARC, finding nothing is near impossible |
| "99.9% uptime", or "no lead ever lost" | **DANGEROUS** | Unbounded, and needs 2 a.m. cover. Front-end failures are invisible to the server (`06-hater-review.md:51`) |
| "X new members, or your money back" | **DANGEROUS** | Depends on the club's own selling, which Inlet does not control |
| "Every lead answered within 5 minutes by a human" | **DANGEROUS** | Depends on the owner's behaviour |
| Paying out the lost lead's value, or wasted ad spend | **DANGEROUS** | Consequential damages. The terms must say "credit only, capped at that month's fee" |

---

## 4. Five offer variants (all built on today's code)

**What exists today:**
- storage and the lead email (`lib/email.ts:125-136`);
- the auto-reply with editable text (`migrations/schema.sql:27-29`, `lib/email.ts:195-215`);
- the read-only portal (`app/api/portal/leads/route.ts:13-35`);
- spam labels (`migrations/migration_v16_ai_spam.sql:9`);
- webhooks (`lib/webhooks.ts`).

**Planned:** the daily canary (`02-product.md:65`) and the report (`02-product.md:72`).

### The promises

| # | Buyer | EN promise | FR promise |
|---|---|---|---|
| **V1 Lead Line Wholesale** | Web studios and freelancers | "Every contact form you've shipped, checked daily; every lead stored and confirmed; a monthly proof report per client under your name. A lead lost because of us makes that client's month free." | « Chaque formulaire que vous avez livré, vérifié chaque jour ; chaque demande enregistrée et confirmée ; un rapport mensuel par client, à votre nom. Une demande perdue par notre faute, et le mois de ce client est offert. » |
| **V2 Zero Missed Trial Requests** ★ | Private combat-sports and martial-arts clubs, sold directly | "Every trial-class request on your website gets an answer within a minute (your schedule and a booking link), day or night; checked daily; proven monthly. Lose one because of us and that month is free." | « Chaque demande de cours d'essai sur votre site reçoit une réponse en moins d'une minute (vos horaires et un lien de réservation), jour et nuit ; vérifiée chaque jour ; prouvée chaque mois. Une demande perdue par notre faute : le mois est offert. » |
| **V3 Valuation-Request Desk** | Real-estate agencies | "Every valuation or viewing request from your website answered within a minute with a booking link, sent to the right agent, checked daily, and valued in a monthly report." | « Chaque demande d'estimation ou de visite reçue sur votre site obtient une réponse en moins d'une minute avec un lien de rendez-vous, est transmise au bon agent, vérifiée chaque jour et valorisée dans un rapport mensuel. » |
| **V4 Proof-of-Leads** | Ads and local-SEO agencies | "For every client you run ads for: each form lead logged with its source, spam set aside, the form checked daily so your budget never feeds a dead form, and a branded monthly lead report." | « Pour chaque client dont vous gérez les annonces : chaque demande tracée avec sa source, le spam écarté, le formulaire vérifié chaque jour pour que le budget n'alimente jamais un formulaire mort, et un rapport mensuel à votre marque. » |
| **V5 Suivi des demandes** | The author's own clients (Engine 1) | "Your site's requests, checked daily and reported monthly, on your maintenance invoice. A lost request because of us makes the month free." | « Vos demandes vérifiées chaque jour et présentées chaque mois, sur votre facture de maintenance ; une demande perdue par notre faute, et le mois est offert. » |

### Automated and concierge work, per variant

| | Automated (code) | Done by hand by the founder, first 10 customers |
|---|---|---|
| V1 | Storage, alert, auto-reply, portal, canary, drought alert, report generation | Portfolio Leak Check. Wiring the first 10 sites (endpoint swap, or WordPress webhook). Auto-reply texts. Report review. Incident emails. The studio's multi-client view is the founder's `/admin`, with a digest to the studio |
| V2 | Same | Leak Check. Install or repair the form, or a copied "Book a trial" page for Wix, Squarespace or Instagram-bio clubs. FR/EN answer text with the owner. Report review |
| V3 | Same, plus a routing rule per agent [build] | Agent routing and valuation-form copy. CRM forwarding by email |
| V4 | Needs UTM and gclid capture (`app/api/track/route.ts:36-37` strips it; P32 is 2 d) | Source tagging by hand per form |
| V5 | Same as V2 | Already wired (N1). Only the report and the invoice line |

### The numbers

Founder time is costed at €40/h. Infrastructure is about €0.2 per site per month; the canary emails go to the operator at $0.46–0.90 per 1k (`06-hater-review.md:53`).

| | V1 studio (10 sites) | **V2 club (1 location)** | V3 agency (≤3 forms) | V4 ads agency (10 accounts) | V5 own client (per site) |
|---|---|---|---|---|---|
| **Setup** | Founding: free migration of 10 sites. List: €149 | **€190** (waived for founding) | €290 | €0 | €0 |
| **Monthly** | Founding €39, then €4/site. List €59, then €5/site | **€49/location** (founding €39); US $59/$45 | €99 (founding €79); US $119 | €79, then €6/account (founding €59) | €15–19/site |
| **Onboarding hours** | ~5 h | **~3 h** | ~4 h | ~5 h, plus a 16 h attribution build | 0.5 h |
| **Hours/month, before → after automation** | 1.1 → 0.4 | **0.33 → 0.13** | 0.5 → 0.2 | 1.2 → 0.4 | 0.1 → 0.03 |
| **Gross margin incl. hours, before automation** | Founding **−€5.5 (negative)**. List €14.5 (25%) | **€35.5 (72%)**; founding €25.5 (65%) | €78.5 (79%) | €30.5 (39%) | €11 (73%) |
| **Gross margin, after automation** | Founding €22.5 (58%). List €42.5 (72%) | **€43.5 (89%)** | €90.5 (91%) | €62.5 (79%) | ~€14 (93%) |
| **Value math the buyer sees** | Resells at €15/site (`README.md:30`), so 10 × €15 = €150 against €39: **+€111/mo**. One retainer saved (€60–350/mo, `03-money.md:21`) pays for years | See the club value math below | See the real-estate value math below | CPL **$66.69** on average ([LocalIQ 2026](https://localiq.com/blog/search-advertising-benchmarks/)). A form dead for 7 days at 20 leads/mo loses about 4.6 leads, about **$310** of ad spend. Our cost is €7.9 per account | The report justifies the line on the invoice |
| **At 30 customers** | ≈ €2,050 MRR (10 founding × €47 + 20 × €79). 12 h/mo of ops. 150 h of onboarding | ≈ **€1,370 MRR + €3,800 setup cash**. 4 h/mo of ops. 90 h of onboarding | ≈ €2,770. 6 h/mo | ≈ €3,000. 12 h/mo | Capped by the studio's own clients |
| **At 100 customers** | ≈ €7,580. 40 h/mo. Needs `setup_site` (`README.md:117`) and a helper | ≈ **€4,800 + €17k setup cash**. 13 h/mo of ops. Onboarding at ~25 h/mo becomes the bottleneck, so resell through martial-arts web agencies (V1 aimed at that vertical) | ≈ €9,700. Wiring feasibility is the limit | ≈ €10k. Missing call tracking caps it | — |

**Club value math (V2).**
- **A member is worth:**
  - FR: **€600/yr** (a Marseille MMA club: 600 €/an, [site](https://www.jksantebeaute.fr/fight-club-mma-marseille-13013)) to **€800–1,200/yr** (Paris, [groupe-reussite](https://groupe-reussite.fr/ressources/cp-sport-meilleurs-clubs-mma-paris/));
  - US: **$100/mo** on average, and **73%** of real free trials convert ([Gymdesk benchmark](https://gymdesk.com/blog/martial-arts-industry-statistics), vendor).
- **Lead value = 0.5 [H, lead → trial] × 0.73 × €600 = €219** in the first year (US: about **$438** at [H] 12 months of tenure).
- **Leads recovered:** at [H] 10 requests a month, with half of Leadferno's no-reply rate, about 2 go unanswered. Answering them instantly books [H] half of them: about 0.73 members a month, about €438 a month, **roughly 9× the fee**. At a quarter of that effect it is still 2×.
- **Break-even: one extra member a year.**

**Real-estate value math (V3).**
- French commissions average 5.78% incl. VAT ([Autorité de la concurrence](https://www.autoritedelaconcurrence.fr/en/press-release/autorite-de-la-concurrence-issues-its-opinion-competitive-situation-property)). On a [H] €250k sale that is about €12k excl. VAT.
- × [H] 15% valuation → mandate × [H] 60% mandate → sale = **about €1,080 per valuation request**.
- US: $10,186 per side ([Clever via PR Newswire](https://www.prnewswire.com/news-releases/agent-commissions-edge-higher-in-2025-one-year-after-landmark-nar-settlement-302483289.html)).

**What this table shows:**
- V1 at the plan's €29–39 founding price only works after automation.
- V2 is profitable on the founder's hours from customer #1.
- V3 is the richest on paper but has a wiring risk: many agency sites are run by CRM vendors [H]. Test it first on the author's own real-estate client sites through V5.
- V4 needs call tracking and attribution that don't exist, against CallRail and WhatConverts.

---

## 5. Choosing the one

| Criterion | V1 studio | **V2 clubs** | V3 real estate | V4 ads agencies |
|---|---|---|---|---|
| Build before first invoice (on top of A-orders + B1–B3) | ~53 h (adds F2/B4 at ~20 h) | **~33 h** | ~40 h | ~50 h |
| Chance of a yes on the first call [H] | 15–20% (trust: "you're a competing studio", `06-hater-review.md:60`) | **25–35%** (the live test shows the leak in their own inbox) | 15–25% | 10–15% |
| Buyer list of known size | Must be built (target of 1,000 at Gate B) | **Federation club finders plus the 76,364 IBISWorld count** | Directories | Directories |
| Margin incl. hours, customer #1 | Negative to 25% | **65–72%** | 79% | 39% |
| Court gate it feeds | External (3 agencies) | **Studio (≥2 businesses, one outside the multi-site client)** | Studio | External |
| Unfair advantage | Peer studio | **Live multi-location combat-sports client** | Own real-estate sites | None |
| Competitors | FormWatch $9–25, Formspree, Agency Label | Gym software with lead modules. Our angle: no software switch, done for you | CRMs | CallRail, WhatConverts, HighLevel |

**Pick: V2 first.** Keep V1 alive at about 4 h/week from week 2, because the court's external track needs 10 studio conversations by 28 Oct and ≥3 signed pilots by 27 Nov (`05-verdict.md:305-306, 320`).

**Target club:** private, paid membership of **€40/month or more**, with a website or Instagram link-in-bio. Not volunteer-run judo associations at about €200/yr: the lead value is too low and decisions go through a committee.

---

## 6. The one-page offer sheet

### EN: Zero Missed Trial Requests
*A done-for-you service for combat-sports and martial-arts clubs.*

**Promise.** Every trial-class request from your website gets an answer within a minute, with your schedule and a booking link, day or night. We check your form every day and prove it in a monthly report. **Lose one request because of us and that month is free.**

**What you get, per location:**
1. **Your form, fixed.** Your trial-class form installed or repaired on your current site. No new software, and your booking or membership system stays as it is. No form? A "Book a trial class" page for your Instagram bio.
2. **An instant answer to every request,** in French or English: your schedule, what to bring, your booking link and phone number. Your words, written with you once.
3. **An alert for every request,** with one-tap buttons: *Called ✓ · Trial booked · Not relevant.*
4. **A daily test of your form.** If it breaks, we tell you within one business day, with the fix.
5. **A proof report after 14 days, then on the 1st of every month:** requests received, requests answered, requests that arrived while you were closed, trials booked, estimated value.
6. **A private archive** of every request, exportable at any time.

**Timeline:**
- **Day 0:** a 15-minute Leak Check with you (one marked test request, with your permission).
- **Days 1–5:** we install.
- **Day 5:** live.
- **Day 19:** your 14-day proof report, and your first invoice.
- **Then:** monthly.

**Price (excl. VAT):**
- **Setup:** €190, **waived for the first 10 founding clubs.**
- **Monthly:** **€49 per location.** **Founding clubs pay €39, locked for 12 months.**
- **Commitment:** none. Cancel any month.
- **US:** $190 setup · $59/month · founding $45.

**Our promise:**
- **Nothing to pay before your 14-day proof report.**
- **If a request is lost because of us, that month is free for that location.** "Lost" means not stored, not answered automatically, not sent to you, or a form we installed breaking without us telling you within one business day. We credit it automatically; you don't need to ask.
- **Leave any month.** You keep every request (full export), and we put your previous form back.
- **Not covered:**
  - your website host being down;
  - your own inbox;
  - Instagram and WhatsApp messages;
  - forms we did not install.
- **Credits are the only remedy,** capped at that month's fee.

**What we need from you:**
- 15 minutes for the Leak Check;
- access to your website editor, or 20 minutes of your web person's time;
- your schedule, your trial rules and your booking link;
- the email that should receive requests, and one person who taps "Called ✓";
- your signature on the order form and the data-processing agreement.

**FAQ:**
- **Is a robot writing to my prospects?** No AI writes to them. The answer is your own text, sent automatically, and your team follows up.
- **I already use gym software.** If its form already answers instantly, you don't need us. The Leak Check will show it, and we'll tell you.
- **Instagram DMs and WhatsApp?** Not covered. We handle website and link-in-bio requests.
- **Kids' classes and health questions?** We collect the parent's contact details only, never medical information. The medical certificate stays at registration.
- **Where is the data?** In an EU region. It is yours, and we process it for you under a written agreement.
- **Why so cheap?** One extra member a year pays for a year of service, and the report shows whether you got it.

### FR : Zéro demande d'essai perdue
*Un service clés en main pour les clubs de sports de combat et d'arts martiaux.*

**La promesse.** Chaque demande de cours d'essai reçue sur votre site obtient une réponse en moins d'une minute, jour et nuit : vos horaires et un lien de réservation. Nous vérifions votre formulaire chaque jour et le prouvons dans un rapport mensuel. **Si une demande se perd par notre faute, le mois est offert.**

**Ce que vous recevez, par salle :**
1. **Votre formulaire, réparé.** Votre formulaire d'essai installé ou réparé sur votre site actuel, sans nouveau logiciel ; vos outils de réservation et d'adhésion ne changent pas. Pas de formulaire ? Une page « Réserver un cours d'essai » pour le lien de votre bio Instagram.
2. **Une réponse immédiate à chaque demande,** en français ou en anglais : horaires, tenue, lien de réservation, téléphone. Vos mots, rédigés une fois avec vous.
3. **Une alerte à chaque demande,** avec des boutons en un geste : *Rappelé ✓ · Essai réservé · Hors sujet.*
4. **Un test quotidien de votre formulaire.** En cas de panne, vous êtes prévenu sous un jour ouvré, avec la correction.
5. **Un rapport de preuve à 14 jours, puis le 1er de chaque mois :** demandes reçues, demandes traitées, demandes arrivées club fermé, essais réservés, valeur estimée.
6. **Une archive privée** de toutes les demandes, exportable à tout moment.

**Calendrier :**
- **J0 :** test express de 15 minutes avec vous (une demande test signalée, avec votre accord).
- **J1–J5 :** installation.
- **J5 :** mise en service.
- **J19 :** rapport à 14 jours et première facture.
- **Ensuite :** chaque mois.

**Tarifs (HT) :**
- **Mise en place :** 190 €, **offerte aux 10 premiers clubs fondateurs.**
- **Mensuel :** **49 € par salle.** **Clubs fondateurs : 39 €, prix garanti 12 mois.**
- **Engagement :** aucun. Résiliable chaque mois.

**Notre engagement :**
- **Rien à payer avant votre rapport à 14 jours.**
- **Une demande perdue par notre faute, et le mois est offert pour cette salle.** « Perdue » signifie : non enregistrée, sans réponse automatique, non transmise, ou panne d'un formulaire que nous avons installé non signalée sous un jour ouvré. L'avoir est automatique, vous n'avez rien à demander.
- **Vous partez quand vous voulez.** Vous gardez toutes vos demandes (export complet) et nous remettons votre ancien formulaire.
- **Non couvert :**
  - la panne de votre hébergeur ;
  - votre propre messagerie ;
  - les messages Instagram et WhatsApp ;
  - les formulaires que nous n'avons pas installés.
- **Seul recours :** l'avoir, plafonné au mois concerné.

**Ce dont nous avons besoin :**
- 15 minutes pour le test express ;
- un accès à l'éditeur du site, ou 20 minutes de votre prestataire web ;
- vos horaires, vos règles d'essai et votre lien de réservation ;
- l'adresse qui reçoit les demandes, et une personne qui touche « Rappelé ✓ » ;
- la signature du bon de commande et de l'accord de sous-traitance.

**FAQ :**
- **Un robot écrit-il à mes prospects ?** Aucune IA ne leur écrit. C'est votre texte, envoyé automatiquement, et votre équipe rappelle.
- **J'ai déjà un logiciel de gestion.** Si son formulaire répond déjà immédiatement, vous n'avez pas besoin de nous. Le test le montrera, et nous vous le dirons.
- **Instagram et WhatsApp ?** Non couverts. Nous traitons les demandes du site et du lien en bio.
- **Cours enfants et santé ?** Nous recueillons seulement les coordonnées du parent, jamais d'information médicale. Le certificat médical reste à l'inscription.
- **Où sont les données ?** Dans une région UE. Elles vous appartiennent, et nous les traitons pour vous sous contrat.
- **Pourquoi si peu cher ?** Un adhérent de plus par an paie l'année, et le rapport montre si vous l'avez eu.

---

## 7. Built vs faked or manual for the first 10 customers

Prerequisites already in the plan: the court's A-orders, about 28 h (`05-verdict.md:264-271`), and B1–B3, about 20.5 h. B2 (legal pages and DPA) is due by 13 Nov. **No go-live before the DPA; no invoice before B1–B3.**

| Item | Build or fake | Hours | Why |
|---|---|---|---|
| Daily canary and drought alert, one digest to the operator (#7 lite) | **Build** | 12 | The detection promise depends on it. By hand it would be about 300 checks a month at 10 clubs |
| Signed one-tap links in the lead email: "Called ✓ / Booked / Not relevant" | **Build** | 4–8 | Feeds the "answered" figure and counts phone answers (`02-product.md:33`) |
| Server-to-server ingest from WordPress: Elementor Pro "Webhook" action ([Elementor](https://elementor.com/help/actions-after-submit/)) and [CF7 to Webhook](https://wordpress.org/plugins/cf7-to-zapier/), key in the URL, field mapping | **Build** on top of A2 | 3 | WordPress runs 65.2% of .fr CMS sites (`05-verdict.md:132`) |
| Report generator: SQL → HTML email per location, FR/EN; the founder reviews and sends | **Build** (a script, not the 40 h product) | 6 | By hand: 10 × 10 min. With the script: 10 × 1 min |
| CSV formula-injection fix | **Build** | 1 | The export promise depends on it (N23) |
| Offer page EN/FR, order form, DPA annex | **Write** | 5 | Signed order forms are the LOI-grade evidence |
| Per-club branding | **Fake:** one `clients` tenant per club, since branding lives on `clients` (`schema.sql:7-16`) | 0 | Avoids B5 (8–12 h) |
| "Book a trial" page for Wix, Squarespace and Instagram clubs | **Fake:** copy a static template per club | 1 per club | Avoids building the hosted page (P38) |
| Answer text, schedule, booking link | **Manual**, in the existing `auto_reply_message` | 0.5 per club | — |
| Booking | **Fake:** link to the club's own tool or a free scheduling link | 0 | Booking hand-off is parked (P35) |
| Leak Check | **Manual** checklist plus `dig` | 0.25 per prospect | The D20 scanner (8 h) only when studios arrive in volume |
| Incident log and credits | **Manual** spreadsheet | 0 | — |
| Invoicing | **Manual:** recurring SEPA or Stripe invoice | 0.1 per month | Paddle bars IT services (N7) |
| Studio multi-client view (V1) | **Fake:** the founder operates it; the studio gets digests | 0 | F2 is built only once V1 pilots sign |

**Totals:**
- about **33 h of offer-specific build**;
- about **30 h of concierge onboarding** for 10 clubs;
- about **3.3 h/month of operations** before automation.

---

## 8. Pricing sanity check

| Niche | Incumbent prices | One lead is worth | Our price | Price as a share of lead value |
|---|---|---|---|---|
| **Studios** | [FormWatch](https://formwatch.app/): $9 for 5 forms, $25 for 100 (email monitoring only). AgencyAnalytics: $20/client (`03-money.md:15`). WhatConverts white label: +$50 ([pricing](https://www.whatconverts.com/pricing/)). [GoWP](https://www.gowp.com/pricing/): $39/site for WordPress care | Retainer €60–350/mo (`03-money.md:21`) | €3.9–5.9 per site | About 1/15 of one retainer month |
| **Combat clubs** | [Gymdesk](https://gymdesk.com/pricing): $75–200, lead tools and a website included. [Kicksite](https://www.kicksite.com/pricing): $49–199. [PushPress Grow](https://www.pushpress.com/pricing): $329. [Deciplus](https://www.deciplus.fr/tarifs-logiciel-salle-de-sport/): €79–299 excl. VAT, prospect CRM included | €219 (FR) to $438 (US) in year 1 | €49 / $59 | About 0.2 of a lead a month |
| **Real estate** | [Follow Up Boss](https://www.followupboss.com/pricing): $69 per user per month | About €1,080 (FR, [H]) per valuation request | €99 | About 0.1 of a lead |
| **Ads / local SEO** | [CallRail](https://www.callrail.com/pricing): $95–195, form tracking in the "Complete" tiers. WhatConverts: $60–160 per account, $500–1,250 for agencies. [HighLevel](https://www.gohighlevel.com/pricing): $97–497 | CPL $66.69 overall; fitness $67.36; real estate $102.51 ([LocalIQ](https://localiq.com/blog/search-advertising-benchmarks/)) | €7.9 per account | About 0.12 of a lead |

**Verdict.** Every price passes the 10× rule. The risk is not "too expensive" but "too cheap to fund the founder's hours". That is why V2 costs €49, not the plan's €12–15 per site, and why V1 moves up to €39/€59.

**Positioning against gym software.** V2 says openly that it is not a gym system: clubs whose software already answers instantly are **disqualified on the call**.

---

## 9. Dated evidence plan

| Date | Evidence |
|---|---|
| 12 Oct | Offer sheet and order form done. **150 clubs named** (FR and US) from the federation finders ([FFK](https://www.ffkarate.fr/espace-licencies/recherche-clubs-2/), [France Judo](https://www.ffjudo.com/les-clubs)) and Maps. Written consent from the existing club to act as a reference, with its request counts |
| 26 Oct | 20 Leak Checks done. **≥5 signed order forms** with a price and a start date. 10 studio Portfolio Leak Check conversations (the court's external track) |
| 13 Nov | B2 and B3 live. Canary, one-tap links and WordPress ingest live |
| 14–28 Nov | 5 clubs live, timed before the [H] January sign-up peak |
| 28 Nov–12 Dec | 14-day reports sent, invoices out |
| 27 Dec | **≥3 clubs paid**. Zero unresolved incidents. Share of requests tapped as answered (the adoption measure) |

---

## Top recommendations (ranked)

1. **Put V2, "Zero Missed Trial Requests", in front of private combat-sports clubs first.** It has the least build before the first invoice, a known list, positive margin after hours from customer #1, and it feeds the court's studio gate.
2. **Adopt the bounded guarantee set:** pay on the 14-day proof, an automatic month's credit per lost request, detection within 1 business day, and leave with an export. It replaces "credit on request" (`README.md:288`) with stronger risk reversal and still involves no SLA and no on-call.
3. **Use the consented live Leak Check as the only hook,** with the Leadferno 42.6% and 15.6% figures as the opening line. It turns an abstract claim into the prospect's own empty inbox.
4. **Reprice V1 to €39 founding / €59 list for 10 sites, locked 12 months (not 24).** The plan's €29 is negative on founder time before automation.
5. **Build only the ~33 offer-specific hours in §7 and fake the rest.** One tenant per club avoids B5; copied pages avoid P38.
6. **Run V1 at about 4 h/week from week 2 on the same fulfilment.** It keeps the court's external gate alive, and the club reports become its demo in December.
7. **Test V3 on the author's own real-estate client sites through V5 before selling it to strangers.** It has the highest value per lead, but wiring feasibility is unproven.

## Rejected and why

1. **Outcome guarantees ("X members or your money back").** The outcome depends on the club's own selling, and the refund exposure has no ceiling.
2. **Uptime SLAs or "no lead ever lost".** One person cannot cover them, and front-end failures are invisible to the server (`06-hater-review.md:51`).
3. **A free trial or free pilot.** Unpaid pilots "are a waste of time … 95% of the time" ([SaaStr](https://www.saastr.com/what-is-the-typical-conversion-from-paid-pilot-to-annual-contract-in-b2b-saas-2)), and they produce no payment evidence.
4. **Pay per recovered lead.** It invites "that was spam" disputes, phone answers are invisible, and per-lead pricing is already rejected (`03-money.md:140`).
5. **Test submissions to prospects' forms without consent.** Ethically grey, and it burns the relationship.
6. **V4 first.** It needs attribution and call tracking that don't exist, against entrenched CallRail and WhatConverts.
7. **Founding prices locked 24 months at €29.** That anchors low on a line that loses money on founder time.

## Your honest confidence

**About 45%** that V2 produces ≥3 paying clubs by 27 Dec, and **about 55%** that it produces ≥5 signed order forms by 26 Oct.

**What would raise it:**
- the existing club agreeing in writing to be a reference and sharing its monthly request counts;
- the first 10 Leak Checks showing ≥50% of clubs with no auto-reply;
- target clubs averaging ≥8 website requests a month (below 4, the report is thin);
- confirming that the author's business entity can invoice now;
- B2 and B3 landing by 13 Nov, so the proof reports land before Christmas.

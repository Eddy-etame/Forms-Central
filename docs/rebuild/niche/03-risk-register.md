# 03 · Risk register: the move that removes each risk

> Lens R. 50 risks, each with the cheapest removal move; quick legal set-ups by region; chain of title in plain words; the public repo; an odds model.
> One of five research lenses behind the round-2 decision ([`README.md`](README.md)), written on 2026-09-29 by an independent research agent with live web research; every URL was accessed that day. **[HYPOTHESIS]** / **[H]** marks an unverified input. References: "V" or `05-verdict.md` = `docs/tribunal/05-verdict.md`; "R" or `README.md` in citations = `docs/rebuild/README.md` (plan v2); "H" = `docs/rebuild/06-hater-review.md`.
> **Not legal or tax advice.**

---

**Bottom line**
- **Today the plan's odds of any revenue are 0%, by its own rules.** Two hard blockers stand in the way:
  - no legal person can invoice (`docs/tribunal/05-verdict.md:118`, N7);
  - the plan forbids any invoice until chain of title is settled (`docs/rebuild/README.md:193`).
  About 5 h of paperwork and €0–190 remove both.
- **Nothing ordered by the court has shipped.** The last code commit is 2026-08-08 (`git log`). GET requests on 2026-09-29 showed:
  - `/privacy`, `/terms` and `/mentions-legales` return 404;
  - `/client/signup` returns 200;
  - `/pricing` still has 3 `mailto:` links.

  So the public vulnerability map in `05-verdict.md` still describes live code.
- **What removal costs.** About 75–95 h and about €60 a month remove, or bring near zero, 41 of the 50 risks below.
- **Nine risks cannot be removed.** They can only be measured and narrowed: demand, competition, churn, the size of the buyer pool, distribution capacity, the founder's attention, €/hour, the bus factor, and the weak copyright on AI-generated code.
- **Modelled odds** with every removal done but no demand evidence yet [HYPOTHESIS model, §4]:

  | Target | Deadline | Odds |
  |---|---|---|
  | €100 MRR | 31 Jan 2027 | **62%** |
  | €1k MRR | 30 Sep 2027 | **16%** |
  | €3k MRR | 30 Sep 2028 | **7%** |

  Past that point, only evidence moves them: about 75% / 47% / 18% at the court's Gate D.

L = likelihood and I = impact, each 1–5. Costs are at 1.0× the court's estimates. €1 = $1.1403 (`docs/rebuild/03-money.md:9`). V = `docs/tribunal/05-verdict.md`, H = `docs/rebuild/06-hater-review.md`, R = `docs/rebuild/README.md`. **This is not legal or tax advice.**

---

## 1. Risk register

### 1a. Hard blockers: each one is fatal until it is removed

| # | Risk (source) | L | I | Move that removes it | Evidence it works | Cost | Residual |
|---|---|---|---|---|---|---|---|
| 1 | **Chain of title is open.** Evidence:<br>• the spec is an agency's "outil interne" (`cahier_des_charges.md:1,53-59`);<br>• `NOTE.md:1,3,9,114,123` is the agency's admin guide ("le mot de passe de l'agence");<br>• 109 of 109 human commits use one organisational email domain, which is not the agency's name, so two parties are involved (`git log %ae`);<br>• the first commit, ccb761a (2026-07-06), imported 81 files and 17,388 lines with no prior history.<br>Sources: V:281, V:388, H#1, R:94, R:326 | 3 | 5 | Two signed one-paragraph confirmations or assignments (§2c): one from the agency, one from the organisation behind the domain. Fallback 1: a licence-back. Fallback 2: re-implement the imported code | A signed writing is exactly what the law requires: [CDPA s.90(3)](https://www.legislation.gov.uk/ukpga/1988/48/section/90); [17 USC §204(a)](https://www.acc.com/resource-library/quick-counsel-software-work-hire-united-states); FR [L131-3](https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000006278958) | Letter: 2 h, €0. Rewrite: 60–90 h [HYPOTHESIS] | ~1% if signed. 3–10% after a rewrite by the same author |
| 2 | **No legal person able to invoice** (V:118 N7, V:282 B2, R:330) | 5 | 5 | Register as a sole trader where the author is tax-resident (§2a) | Paddle: "Business verification is not required for individuals or sole traders" ([Paddle help](https://www.paddle.com/help/start/account-verification/what-is-business-verification)). Stripe supports sole proprietors ([Stripe](https://support.stripe.com/questions/selling-on-stripe-without-a-separate-business-entity)) | 1–3 h, €0–190 | 0 |

### 1b. Product: the live lead chain and the path for strangers

| # | Risk | L | I | Move | Evidence | Cost | Residual |
|---|---|---|---|---|---|---|---|
| 3 | Keyword filter drops leads with a fake "success" (V:59, A1) | 5 | 5 | A1: label the lead suspect and store it anyway | This removes the only drop path (V:263) | 1–2 h | ~0 |
| 4 | The relay's IP is banned permanently on the 6th post, and the relay keeps no copy (N2, V:113) | 4 | 5 | A2: 24 h expiry on bans, a server-to-server key, and a relay that stores the lead on any non-2xx | V:264 | 4–5 h | Low |
| 5 | Send failures are silent (N8) | 4 | 4 | A7: treat `{success:false}` as a failure and write a row per lead | V:269 | 5–7 h, €17.5/mo | Low |
| 6 | Spam can mute a tenant for a month; the FAQ says one day (N3) | 3 | 4 | A8: exclude spam and canaries from the quota, and notify on pause | V:270 | 3–4 h | Low |
| 7 | Branding is per tenant, not per end-client (N4) | 5 | 3 | B5, only after the agency gate. Not needed for the own-client line | V:290 | 8–12 h | 0 for the own-client line |
| 8 | Strangers get a 403. There is no tenant self-service, no Reply-To, and the webhook secret is hidden (V:45, N12, N16, N17) | 5 | 4 | B4 + a Playwright stranger-path test | V:289 | 10–12 h | Low |
| 9 | Global portal logins reveal which agency serves which business (N18, H#16) | 3 | 4 | F2 per-agency identity. Sell to no competing studio before it (R:318) | R:96 | 8 h | Low |
| 10 | "Proven" claims can't be verified (H#7) | 3 | 3 | Daily canary through the real relay, a front-end error beacon, and "first answer attempt" wording | R:49 | 12 h | Medium: a canary is not a real lead |
| 11 | 4.5 MB platform cap against a 6 MB claim, CSV injection, failure log capped at 100 rows (N19, N23) | 3 | 2 | Client-side 3 MB cap, prefix CSV cells, raise the log cap | [Vercel limits](https://vercel.com/docs/functions/limitations) | 3 h | Low |
| 12 | Owners never tap or log in (H#6) | 4 | 3 | **Bypass:** sell passive value (capture, monitoring, report) and build no inbox before Gate B | [27% of clients prefer dashboards](https://agencyanalytics.com/agency-benchmarks-2026) | 4 h (baseline) | Accepted: the answer layer may never earn |

### 1c. Legal and compliance

| # | Risk | L | I | Move | Evidence | Cost | Residual |
|---|---|---|---|---|---|---|---|
| 13 | Brevo multi-account breach (V:54) | 4 | 4 | A7: one paid provider | [Brevo §3.1](https://www.brevo.com/legal/termsofuse/) | in #5 | ~0 |
| 14 | Lead text sent to free Gemini keys; anonymous chat unlimited (V:55, N13) | 4 | 4 | A4: a paid key or the classifier off; chat off | [Gemini terms](https://ai.google.dev/gemini-api/terms) | 1–2 h, ~€1/10k calls | ~0 |
| 15 | No legal pages or DPA; the trader cannot be identified (V:61, N20) | 5 | 4 | B2. The DPA is the EU's free Art. 28 clauses, plus the sub-processors' own DPAs | [EU SCC 2021/915](https://eur-lex.europa.eu/eli/dec_impl/2021/915/oj/eng); [Supabase](https://supabase.com/legal/dpa), [Vercel](https://vercel.com/legal/dpa), [Resend](https://resend.com/legal/dpa) | 10–14 h, €0 | Low |
| 16 | No retention; attachments are public (B3, R:98) | 5 | 3 | B3 + a private bucket with signed URLs | V:283 | 6–8 h | Low |
| 17 | False marketing claims still live (V:60) | 5 | 3 | A6 truth pass | V:268 | 3–4 h | ~0 |
| 18 | **Missed by the record.** Vercel Hobby is "restricted to non-commercial personal use only" [HYPOTHESIS: the plan in use is not visible from outside] | 3 | 4 | Vercel Pro | [Vercel fair use](https://vercel.com/docs/limits/fair-use-guidelines) | 0.5 h, €17.5/mo | ~0 |
| 19 | **Missed.** Supabase Free has no automatic backups and pauses after 1 week of inactivity | 3 | 5 | Supabase Pro | [Supabase pricing](https://supabase.com/pricing) | 0.5 h, €22/mo | Low |
| 20 | AI Act Art. 50. Disclosure (50(1)) applies since 2 Aug 2026; machine marking (50(2)) has a grace period to 2 Dec 2026 for systems already on the market | 2 | 3 | **Bypass:** no AI-written outbound text in 2026. Later: human-sent drafts plus a machine-readable marker | [Jones Walker](https://www.joneswalker.com/en/insights/blogs/ai-law-blog/yes-august-2-still-matters-the-eu-approved-a-high-risk-ai-delay-but-most-trans.html?id=102nbon) | 0 h | ~0 |
| 21 | WhatsApp needs the lead's opt-in (H#22). **Missed:** general-purpose AI chatbots are banned on the Business Platform since 15 Jan 2026 | 2 | 3 | **Bypass:** a `wa.me` click-to-chat link opened in the owner's own app, shown only when the lead ticked the box. No API, no bot | [policy](https://whatsappbusiness.com/policy/); [respond.io](https://respond.io/blog/whatsapp-general-purpose-chatbots-ban) | 0–2 h | ~0 |
| 22 | The name "Inlet" collides with a YC company and the main domains (R:332, H#25) | 3 | 3 | **Bypass:** sell under the studio's brand; no public use of the mark until Gate D. Free TMview/USPTO search now; file later | EUIPO [€850 for 1 class](https://www.euipo.europa.eu/en/trade-marks/before-applying/fees-payments); USPTO [$350/class](https://www.reedsmith.com/articles/uspto-announces-trademark-fee-increases-effective/) | 1 h now. €1,157 only after Gate D | ~0 until launch |
| 23 | GDPR or UK GDPR complaint | 2 | 3 | #15 + #16 + erase-by-email. If UK: the ICO fee and a complaints process | [ICO £52](https://ico.org.uk/for-organisations/data-protection-fee/data-protection-fee/) | in B3 | Low |
| 24 | **Missed.** 92 of 109 commits are AI co-authored (V:186). Purely AI-generated material is not protected by US copyright | 3 | 2 | **Accept.** Do not rely on the licence; the moat is relationships, data and reports | [USCO Part 2](https://www.copyright.gov/ai/Copyright-and-Artificial-Intelligence-Part-2-Copyrightability-Report.pdf) | 0 | Stays |
| 25 | **Missed.** A US LLC owned by a non-US person must file Form 5472 every year, with a $25,000 penalty for failure | 2 | 4 | **Bypass:** no US LLC unless US-resident or advised. US buyers pay through Paddle as merchant of record | [IRS i5472](https://www.irs.gov/instructions/i5472) | 0 | 0 |
| 26 | **Missed.** Unlimited liability for lost leads | 2 | 4 | B2B terms cap liability at 12 months' fees and exclude lost profit. Optional professional liability insurance [HYPOTHESIS €150–400/yr] | [HYPOTHESIS] enforceability varies by country | 1 h | Low |

### 1d. Operations

| # | Risk | L | I | Move | Evidence | Cost | Residual |
|---|---|---|---|---|---|---|---|
| 27 | One developer, and the 48 h incident rule (V:351, R:315, H#24) | 3 | 4 | Runbook, a second alert address, a free external uptime check, holidays announced. The A2 relay fallback keeps leads safe while Inlet is down | V:264 | 3 h | Medium-low |
| 28 | **Missed.** GitHub, and possibly the hosting accounts, depend on an organisational email [HYPOTHESIS for hosting]. Losing that inbox means losing account recovery | 2 | 5 | Add a personal verified email and 2FA recovery codes to GitHub, Vercel, Supabase, the email provider and the registrar | `git log %ae` | 0.5 h | ~0 |
| 29 | **Missed.** Deliverability. Gmail rejects non-compliant mail with 550 errors since Nov 2025. The sender is a free-mail address relayed by Brevo (commit 488f4a4 message), which cannot pass DMARC | 4 | 4 | Own domain; SPF/DKIM/DMARC aligned; a sending subdomain per tenant (R:316) | [Google](https://support.google.com/a/answer/14229414?hl=en) | 3 h, €12/yr [HYPOTHESIS] | Low |
| 30 | **Missed.** Abuse of the free tier: phishing kits exfiltrate stolen credentials through form backends. Relay risk too (V:65). Signup is still open (200 on 2026-09-29) | 3 | 4 | A5: invite-only now. Later: domain-verified tenants, and replies only to recent submitters | [phish.report: Formspree](https://phish.report/IOK/indicators/formspree-io), [Getform](https://phish.report/IOK/indicators/getform-io) | 1–2 h | ~0 while closed |
| 31 | Support load (N16) | 3 | 3 | Tenant self-service (B4), next-business-day support, per-client price | R:286 | in B4 | Medium past 20 agencies |
| 32 | **Missed.** Vercel or Supabase change their prices | 2 | 2 | Margins of 37–88% on paid infrastructure (V:73). Portable stack: Postgres + Next.js | V:73 | 0 | Low |
| 33 | Public repo (H#11, R:101). Details in §3 | 5 | 3 | Ship the fixes, move future strategy elsewhere, keep no licence | §3 | in A-orders | Low |

### 1e. Financial

| # | Risk | L | I | Move | Evidence | Cost | Residual |
|---|---|---|---|---|---|---|---|
| 34 | Pricing mistakes: equal USD numbers give a 12% discount; the Solo tier has a cliff (H#28, R:275) | 3 | 2 | USD = EUR × 1.14, rounded (Studio $45) [HYPOTHESIS]; Solo +€4 per client | R:281 | 1 h | ~0 |
| 35 | The agency margin prices labour at zero (H#19) | 3 | 3 | The pitch now counts 3 h of labour (R:30) | V:182: retainers absorbing the fee is untested | 0 | Medium |
| 36 | **Missed.** Chargebacks cost €20 per dispute in the EEA | 1 | 2 | **Bypass:** annual invoices paid by SEPA or bank transfer. Cards only through Paddle, which handles disputes as merchant of record | [Stripe](https://support.stripe.com/questions/dispute-fees-faq) | 0 | ~0 |
| 37 | The price sheet sells features no phase builds (H#20) | 2 | 3 | Presell only (R:129-134) | — | 0 | ~0 |
| 38 | **Customer concentration.** The live relays all belong to one multi-location client (V:338) | 4 | 4 | A 12-month lead-line term, and at least one business outside that client (the court's rule, V:354) | V:354 | 2 h | Medium |
| 39 | **Missed.** SMB churn runs 3–7% a month | 4 | 3 | Annual prepay with 2 months free (R:280); the monthly report as the reason to stay | [Vena](https://www.venasolutions.com/blog/saas-churn-rate) | 0 | Medium |
| 40 | Canary email costs (H#9) | 2 | 2 | Daily canaries only (R:284) | H#9 | 0 | ~0 |

### 1f. Distribution

| # | Risk | L | I | Move | Evidence | Cost | Residual |
|---|---|---|---|---|---|---|---|
| 41 | The buyer pool has never been sized (H#15, R:269) | 4 | 5 | Count before building: at least 500 named studios by Gate A. If it stays under 500, move Lead Mirror or the WordPress bridge forward | R:196, 248 | 10–15 h [HYPOTHESIS] | Medium |
| 42 | Target markets run on WordPress: 65.2% of .fr sites with a known CMS (N21) | 5 | 4 | The WordPress bridge, only after the list shows demand | [W3Techs](https://w3techs.com/technologies/segmentation/tld-fr-/content_management) | 5 d when gated | Medium |
| 43 | One person selling; about 2 closes per 50 contacts (R:269) | 4 | 4 | Warm contacts first (own clients, then the studio network); outreach from the warm domain; no new domain | H#17 | in the plan | **High: cannot be removed** |
| 44 | Attribution is discarded (N14) | 5 | 2 | F5 | R:99 | 2 h | ~0 |

### 1g. Demand

| # | Risk | L | I | Move | Evidence | Cost | Residual |
|---|---|---|---|---|---|---|---|
| 45 | **Demand never tested.** The author himself used direct Resend for one site (N1, N5, V:324) | 4 | 5 | Cannot be removed. **Convert it to evidence:** signed lead lines within 14 days, then prepaid founding deposits | — | 6 h selling | This is the ceiling |
| 46 | Crowded category: LeadDuo, Postbox, HubSpot free, Jotform, Formspree, Web3Forms (H#5) | 5 | 4 | Narrow the edge to per-client packaging + monitoring + proof report | H#5 | 0 | Stays |
| 47 | **Missed.** Vertical incumbents already include lead capture:<br>• martial arts: Spark ($249/mo, landing pages and leads), Kicksite, Zen Planner (Engage CRM $249);<br>• French real estate: Apimo ("remontée des leads", from €89), Hektor, Netty (site included) | 4 | 4 | **Bypass:** sell only to businesses on custom-built sites, through their studio. Push leads by webhook into their CRM; don't fight it | [Spark/Kicksite/Zen Planner](https://www.wodify.com/blog/pricing-guide-martial-arts-software); [Diffuze](https://www.diffuze.fr/blog/logiciel-immobilier-comparatif-2026) | 0 | Stays |

### 1h. Founder

| # | Risk | L | I | Move | Evidence | Cost | Residual |
|---|---|---|---|---|---|---|---|
| 48 | About €11/h against €38–43/h for client work (R:55, V:117) | 5 | 4 | **Bypass:** the own-client line is sold inside the author's own maintenance retainers, so those hours are partly billable. Paid setups at €249 (R:268) | R:56 | 0 | High until €3k MRR |
| 49 | Attention goes to other projects: 18 new repositories in 51 days (V:68) | 4 | 5 | Timesheet; no new side repository before Gate C; prepaid customer commitments that create obligations | [HYPOTHESIS] a prepayment disciplines better than a document | 0.5 h/wk | Medium: no document removes it |
| 50 | The calendar cannot hold (H#2); grading interference (R:329) | 3 | 3 | The 250 h budget with re-dating rules. Grading is **removed**: the author says Inlet is not graded | brief | 0 | Low |

**Removal cost**, rows 1–44 with the letter route: about 75–95 h and about €60/month. That fits inside the plan's 250 h to 27 Dec (R:170).

---

## 2. Legal quick paths (a menu, not a guess about where the author lives)

### 2a. Getting able to invoice, and to use Stripe or Paddle

| Path | Time to a lawful invoice | Setup cost | Running cost / VAT | Stripe / Paddle | Trap |
|---|---|---|---|---|---|
| **France, micro-entreprise** | Online filing at the guichet unique. SIRET in 1–3 working days if the file is complete, typically 8–15, up to 30 ([portail](https://www.portail-autoentrepreneur.fr/academie/creation-auto-entreprise/comment-obtenir-numero-siret)) | €0 | Contributions of 21.2% (BIC services) or 25.6% (BNC) of turnover ([lecoindesentrepreneurs](https://www.lecoindesentrepreneurs.fr/taux-cotisations-sociales-2026-micro-entrepreneur/)). VAT franchise up to €37,500 in 2026 ([Bpifrance](https://bpifrance-creation.fr/entrepreneur/actualites/plf-2026-franchise-base-tva-annoncee-a-37-500-eu)) | Stripe as EI ([Stripe FR](https://stripe.com/resources/more/how-to-create-a-sole-proprietorship-france)); Paddle as an individual | Ask URSSAF whether SaaS fees count as BIC or BNC. Cross-border B2B VAT: [HYPOTHESIS] an intra-EU VAT number is needed even under the franchise |
| **Belgium, independent** (also possible alongside a job) | Registration at a guichet d'entreprises; days [HYPOTHESIS] | €111.50 BCE registration + €78.65 VAT activation ([Mon Secrétariat Social](https://www.mon-secretariat-social.be/independant-complementaire-belgique/)) | VAT franchise up to €25,000; social-fund contributions | Both | Social contributions every quarter |
| **Luxembourg** | Business permit: up to 3 months; silence counts as approval ([guichet.lu](https://guichet.public.lu/en/entreprises/creation-developpement/autorisation-etablissement/autorisation-honorabilite/autorisation-etablissement.html)) | €50 | — | Both | The slowest option on this menu |
| **UK, sole trader** | Day 0. Register with HMRC by 5 Oct after the tax year; UTR in about 10 working days ([guide](https://www.smallbusinessguide.co.uk/starting-up/how-to-register-as-sole-trader.html)) | £0 | VAT threshold [£90,000](https://www.gov.uk/vat-registration/when-to-register); ICO fee £52 | Both | — |
| **UK, Ltd** | Usually 1–2 days [HYPOTHESIS], plus identity verification | [£100 online since 1 Feb 2026](https://www.icaew.com/insights/viewpoints-on-the-news/2025/nov-2025/significant-hikes-to-companies-house-fees-in-2026) | Accounts and a £50 confirmation statement | Both | — |
| **US, sole proprietor** (US persons) | Day 0; EIN free | $0 | Sales tax on SaaS varies by state, so Paddle as merchant of record removes it | Both | — |
| **US LLC** (e.g. Wyoming) or **Stripe Atlas** | Wyoming $100 + $60/yr + a registered agent ([LLCU](https://www.llcuniversity.com/wyoming-llc/costs/)). Atlas: $500, then $100/yr, "within two business days", C-corp or LLC ([Atlas](https://stripe.com/atlas)) | €88–438 | Form 5472 if foreign-owned ($25k penalty) | Both | Home-country tax does not go away |

**The fastest lawful route anywhere** is a sole trader where the author is tax-resident. Invoice the own-client line directly, by transfer or SEPA. Use Paddle only for the software subscription: it needs a legal name plus Terms, Refund and Privacy pages (V:102), and it bars standalone IT services (V:74).

### 2b. Chain of title in plain words: two scenarios

**What the record shows:**
- The spec and `NOTE.md` describe an internal tool for an agency's showcase sites (`cahier_des_charges.md:53-59`, `NOTE.md:9`).
- The first commit imported 17,388 lines in one go, with no history before it.
- `git blame -w -M -C` shows **6,687 of 20,961 current code lines (32%)** still come from that import. Examples:

  | File | Lines from the import |
  |---|---|
  | `app/api/submit/[id]/route.ts` (the engine) | 724 of 877 |
  | `lib/actions.ts` | 597 of 950 |
  | `lib/email.ts` | 208 of 445 |
  | `lib/jwt.ts` | 131 of 131 |
  | `migrations/schema.sql` | 65 of 65 |

- Of the 109 human commits, 39 fall on weekdays between 08:00 and 17:59 on the commit clock, and 70 fall outside those hours. That is mixed evidence.

**Scenario A: built on the author's own time, outside any duties.**
- In general the author owns it:
  - UK: only work made "in the course of employment" goes to the employer ([s.11(2)](https://www.legislation.gov.uk/ukpga/1988/48/section/11));
  - US: a contractor keeps copyright without a signed assignment, and software cannot be a contractor "work made for hire" ([ACC](https://www.acc.com/resource-library/quick-counsel-software-work-hire-united-states)).
- What could override this:
  - an IP or moonlighting clause in a contract;
  - the imported code, if it was written for the agency.

**Scenario B: built as an employee, intern or contractor for the agency, or for the organisation behind the domain.**
- **Employee.** The employer usually owns the economic rights in software: FR L113-9 ([WIPO Lex](https://www.wipo.int/wipolex/en/legislation/details/23227)), UK s.11(2).
- **Intern.** In France, since 2021 the rights pass to the host automatically *only* if the host carries out research activities *and* the intern is compensated. Otherwise the intern keeps them, unless the internship agreement says otherwise ([NatLawReview](https://natlawreview.com/article/french-reform-automatic-intellectual-property-assignment-non-employee-personnel)).
- **Contractor.** The contractor owns the code unless a written assignment exists, but the client probably holds an implied licence to use it.
- **In this scenario, selling Inlet without permission is infringement, and the court treats a claim as grounds to KILL (V:388).**

### 2c. The cheapest remedies, in order

**1. A one-paragraph letter to each party** (2 h, €0). French law wants every right named, and its scope, place and duration (L131-3), so the letter spells them out:

> *[Organisation], représentée par [nom, fonction], déclare ne détenir aucun droit sur le logiciel « logiciel-formulaire » / « Inlet » ([URL du dépôt]), toutes versions, code, documentation et œuvres dérivées comprises. Pour autant qu'elle en détiendrait, elle cède à [nom légal de l'auteur], à titre irrévocable, pour le monde entier et pour toute la durée légale des droits, les droits de reproduction, de représentation, d'adaptation, de traduction et de distribution, pour tous usages, y compris commerciaux, contre 1 €. Elle conserve une licence gratuite, perpétuelle, non exclusive et non cessible d'usage interne de son déploiement existant. Elle confirme que le dépôt ne contient aucune de ses informations confidentielles. Fait à [lieu], le [date], signature.*

The English version has the same content. The free internal licence lowers the other party's cost of saying yes.

**2. If a party refuses or stays silent for 14 days:** ask for a paid **licence-back** (non-exclusive, commercial) before rebuilding anything.

**3. Last resort: re-implement the 6,687 imported lines** from a behaviour spec, never from the old code.
- Ideas and principles are not protected ([Directive 2009/24 Art. 1(2)](https://eur-lex.europa.eu/eli/dir/2009/24/oj/eng)).
- A-orders A1, A2, A7, A8 and A9 already rewrite parts of `route.ts`, `email.ts` and `actions.ts`, so the extra work is about 45–75 h.
- **Limit:** a rewrite by the same author is not a true clean room. It also does not cover Scenario B-employee for commits made after July. Only the letter covers everything.

**4. Today, in 0.1 h:** switch `git config user.email` to a personal address, so no further evidence accumulates.

**Also:** remove `NOTE.md` from HEAD. It names the agency and shows an address presented as the agency's SMTP login (`NOTE.md:114`). Irritating the party whose signature you need is a cost.

---

## 3. The public repository (it stays public)

**What is exposed** (repository `private:false`, `license:null`, **1 fork created 2026-09-29T14:57Z**, per the [GitHub API](https://api.github.com/repos/Eddy-etame/Forms-Central)):

1. **A map of attacks that work today.**
   - The SSRF with `file:line` (V:69).
   - A recipe to silence a tenant with "51 native posts at 5 a minute" (V:114).
   - Reversible passwords (N10), live sessions after a reset (N11), unlimited anonymous AI (N13), and an `/admin` lockout (N15).
   - The code is unchanged since the ruling.
2. **The whole strategy:** prices, gates, funnel rates, dates (R §4–6).
3. **The title doubt itself** (V:100, R:94), readable by a counterparty or an acquirer.
4. **Personal identifiers:**
   - a personal address hard-coded in `lib/upgrade.ts:6`;
   - an operator alias in `app/page.tsx:77`;
   - the organisational email on every commit.
5. **No secrets were found.** A history scan for Google, Resend, OpenAI and Brevo keys and for JWTs found placeholders only (`git log -p`). [Secret scanning runs automatically for free](https://docs.github.com/en/code-security/secret-scanning/introduction/about-secret-scanning) on public repos.

**Why "make it private" was never enough:** GitHub "will detach public forks … Public forks are not made private" ([docs](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/managing-repository-settings/setting-repository-visibility)). A fork already exists.

**How to neutralise each exposure:**

| Exposure | Move | Cost | Why it works |
|---|---|---|---|
| Attack map | Ship A1, A3, A2, A9 and A4 in the court's order | ~12–17 h | Once fixed, the map is history, not a manual |
| Strategy | Future plans live off the repo: a private repo on a personal account, or local files. Existing docs stay | 0.5 h | Deleting from HEAD hides nothing: history and the fork keep them |
| Copying | **Add no licence.** Without one, "no one may reproduce, distribute, or create derivative works"; GitHub only grants view and fork ([GitHub](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/licensing-a-repository)). After title is clean, optionally add the [FSL](https://fsl.software/) (competing use barred for 2 years) | 0 h | You cannot license code you may not own. "None" is stricter than any licence |
| Identifiers | Replace the address with "on request" (A5); switch the git email | 0.2 h | — |
| The real moat | Stop treating code as the asset. The court gave defensibility 1/10 because "code is not a moat" (V:186), and AI-generated parts are weakly protected (#24) | 0 | The edge is warm relationships, canary history, per-client reports and speed |

**Residual:** a competitor can read the strategy. Execution speed and warm access are what it cannot copy.

---

## 4. The odds

**Model** [HYPOTHESIS: judgment inputs, published so they can be attacked]:
- P(target) = D × Π(1 − kᵢ).
- **D** is the demand ceiling with perfect execution: 0.80, 0.35 and 0.22 for the three targets.
- **kᵢ** is the chance that risk group *i*, left in place, kills or stalls the plan before the target. The 50 risks are merged into 7 groups to limit double counting.
- **Hard blockers** (#1–2) set P = 0 until they are removed.
- **Cross-check:** the court's category base rate for reaching $1k within 12 months is 8–10% (R:41). Its conditional model gives $684–945 MRR at month 24 (V:246-247).
- Script: `scratchpad/odds2.py`.

| Cumulative move (cheapest first) | Hours / € | €100 by Jan 27 | €1k by Sep 27 | €3k by Sep 28 |
|---|---|---|---|---|
| Today | — | **0%** | **0%** | **0%** |
| + Entity + title letter | 5 h, €0–190 | 30.5% | 2.6% | 0.6% |
| + G1 live chain (A1, A2, A7, A8, DMARC) | 16–21 h, €17.5/mo | 41.8% | 4.4% | 1.1% |
| + G2 security and abuse (A3, A4, A5, A9) | 7–11 h | 43.6% | 4.9% | 1.3% |
| + G3 sell lawfully (B2, B3, Pro hosting, domain, TM search, no WhatsApp/AI send) | 18–24 h, €40/mo | 46.4% | 7.8% | 2.5% |
| + G4 commercial hygiene (12-month term, ≥1 outside business, direct invoice, price fixes) | 3–4 h | 53.2% | 8.4% | 2.6% |
| + G5 one-person operations (runbook, second address, B4 self-service) | 13–15 h | 54.9% | 9.4% | 3.3% |
| + G6 founder hours (timesheet, prepaid obligations, no new repos) | 0.5 h/wk | 61.8% | 12.3% | 4.6% |
| + G7 distribution (counted list, annual prepay) | 10–15 h | **61.8%** | **16.4%** | **6.6%** |

**The evidence ladder.** From here, only evidence moves the ceiling D:

| Evidence | €100 | €1k | €3k |
|---|---|---|---|
| 2 businesses sign the lead line, 1 of them outside the multi-location client | 74.9% | 16.4% | 6.6% |
| + 3 agencies **paid** by 27 Dec (Gate C) | 74.9% | 28.0% | 10.6% |
| + ≥1,000 studios named and an 8% reply rate measured | 74.9% | 31.5% | 12.7% |
| + ≥8 agencies and ≥€500 MRR by 27 Mar 2027 (Gate D) | 74.9% | **46.8%** | **17.9%** |

**What goes to near zero:**
- entity and title (if signed);
- lead loss, provider terms breaches and security holes;
- legal pages, hosting terms, chargebacks and pricing errors;
- WhatsApp and the AI Act (by not building the features);
- the trademark (by not using the mark publicly).

**What cannot be removed:**
- demand at the price, and competition, which together make up D;
- baseline SMB churn;
- the buyer pool, which can only be counted, or changed by picking a niche;
- founder attention;
- one-person distribution;
- €/h below client work until about €3k MRR on ≤10 h/week (R:56).

**The ceiling, honestly:**
- **€100 MRR:** near-certain once the lead lines are invoiced. Its remaining risk is founder follow-through.
- **€1k MRR:** about 1 in 6 before any evidence; about 1 in 2 at best after Gate D.
- **€3k MRR:** stays under 20% even with strong evidence.

**Risk-lens note on the niche.** Vertical niches (martial arts or gyms, real estate) add incumbent risk (#47). The lowest-risk niche for scale is **studios that build custom sites for multi-location local businesses**:
- the author's own client is the proof case;
- the list of such studios can be counted;
- vertical CRMs sit downstream, reached by webhook, not as rivals.

---

## Top recommendations
1. **Send both title letters and switch the git email today** (2.1 h, €0). This is the only hard blocker outside the author's control, so it should start first.
2. **Register as a sole trader where tax-resident this week** (1–3 h, €0–190). The other hard blocker; it makes Stripe and Paddle possible.
3. **Ship A1 and A3 by 2 Oct, then A2, A7, A8, A4 and A5 by 12 Oct** (~22 h). This removes the largest kill risk (live lead loss) and defuses the public attack map.
4. **Get signed 12-month lead lines from ≥2 businesses within 14 days, one outside the multi-location client** (6 h). This turns €100 MRR from a guess into a fact and removes concentration risk.
5. **Pro hosting + custom domain + DMARC + DPA from the EU clauses before the first agency invoice** (~20 h, ~€40/mo). This removes the ToS, deliverability and GDPR blockers for strangers.
6. **Take founding deposits (3 months or a year prepaid), not "signatures"** (0 h). This is evidence, a churn hedge and a founder commitment in one move.
7. **Keep the repo licence-less and move strategy off it** (0.5 h). Copying stays unlawful, and nothing further leaks.
8. **Add a personal recovery email and 2FA on every account** (0.5 h). It removes a single point of failure that the record missed.

## Rejected, and why
- **Making the repo private.** It is outside the author's control, and GitHub keeps the existing fork public anyway.
- **A US LLC or Stripe Atlas by default.** It costs $500+, brings a $25k penalty trap for Form 5472, and home-country tax remains. A sole trader is faster.
- **Adding any licence now, even FSL or BSL.** A licence *grants* rights, and you cannot license code whose title is open.
- **Rewriting git history or deleting the docs to hide them.** The fork and caches keep everything; it costs hours and removes nothing.
- **Filing trademarks now (€1,157).** It is spent before any demand evidence. Sell under the studio's brand until Gate D.
- **A pre-emptive clean-room rebuild.** It takes 60–90 h and does not cover the employee scenario for post-July code. The letter goes first.
- **A real-estate or gym vertical as the scale market.** Apimo, Hektor, Spark and Zen Planner already bundle websites and lead capture.

## Your honest confidence
- **About 85%** that recommendations 1–2 (title letters + sole-trader registration) are the correct first move. They are cheap, dominate everything else, and every other gain in §4 is multiplied by them.
- **About 55%** [HYPOTHESIS] that both letters come back signed within 30 days.
- What would raise both figures:
  - the author's actual status with each organisation in Jul–Aug 2026 (employee, intern, contractor or none), and any IP clause he signed;
  - where he is tax-resident, which picks the one row of §2a that applies;
  - whether the imported July code was written for the agency.

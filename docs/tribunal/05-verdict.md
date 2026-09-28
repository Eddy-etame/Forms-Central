# 05 · The Verdict

Stop selling Inlet to strangers, and keep it. As a public self-serve SaaS it never worked for anyone but you: a stranger's form could not receive a browser submission, nobody could pay except by emailing you, and no legal person, privacy policy or data-processing agreement stands behind it. The engine does work, carrying real leads for client sites you built, through a relay you wrote, so it becomes the lead back-office of your own studio, sold as a directly invoiced line in your maintenance retainers. By the deadlines in §5(a), all of them by 19 October and whatever else happens, stop the dropped leads, the permanent IP bans, the silent email failures, the lead text sent to free Gemini keys and the multi-account Brevo rotation. You may run one test of reselling Inlet to agencies that hand-code their clients' sites: the whole 90-day sentence is capped at 110 hours, of which the resale test itself adds about 60, with numeric gates on 28 October, 27 November and 27 December 2026 and no extension. Priced at your own labour, the self-serve path returns $3–5 an hour, against the €38–43 an hour that French freelance web developers average on Codeur (an assumed outside rate for you), so the test is a cheap option you buy, not an investment you make.

## Décision en bref

La cour ordonne un pivot : cessez de vendre Inlet à des inconnus, mais gardez-le. En libre-service, il n'a jamais fonctionné pour personne d'autre que vous : les formulaires créés par un inconnu rejetaient toute soumission venant d'un navigateur, le seul moyen de payer était de vous écrire, et aucune entité juridique, politique de confidentialité ni contrat de sous-traitance ne le couvre. Le moteur, lui, tourne déjà en production pour des sites clients que vous avez livrés ; il devient le back-office de suivi des demandes (leads) de votre propre studio, facturé directement comme une ligne dédiée dans vos contrats de maintenance. Aux échéances du §5(a), toutes fixées au plus tard au 19 octobre, et quelle que soit la suite, cessez de perdre des leads, de bannir des adresses IP à vie, de laisser échouer des envois d'e-mails sans alerte, d'envoyer des données personnelles aux clés Gemini gratuites et de faire tourner plusieurs comptes Brevo en violation de leurs conditions. Un seul test de revente à des agences qui codent à la main les sites de leurs clients est autorisé. La peine entière est plafonnée à 110 heures, dont une soixantaine pour le test de revente, avec des seuils chiffrés au 28 octobre, au 27 novembre et au 27 décembre 2026, sans prolongation : si moins de trois agences extérieures ont payé au moins 29 € par mois au 27 décembre, l'offre externe s'arrête définitivement.

---

**VERDICT: PIVOT.** Inlet changes from a public self-serve form-backend SaaS ($0/9/19/49, upgrades by `mailto:`) into the lead back-office of the author's own web studio. It is billed as a paid "suivi des demandes" line inside his client retainers. Exactly one concierge resale test to agencies that hand-code their clients' sites is allowed. That test ends permanently on 2026-12-27 unless 3 external agencies have paid ≥ €29/month.

**Panel vote:**

| Label | Votes | Judges |
|---|---|---|
| PIVOT | 2 | investor, mentor |
| NARROW & CONTINUE | 1 | operator |
| KILL | 0 | — |
| GO AS IS | 0 | — |

The court sides with the majority label. It adopts the operator's sequencing: signed demand is tested before the per-end-client build and checkout.

**Record check before ruling.** Files 00–04 are present and complete: 94, 415, 362, 314 and 373 lines, each ending in its closing section. `05-verdict.md` did not exist before this ruling, and HEAD is `ea96cf4`. All six audits (code-A, code-B, market-legal, arithmetic, hunter-code-ops, hunter-market) and all three associate rulings returned with complete payloads. How this was confirmed, re-checked at revision on 2026-09-28:
- `git status` shows only `05-verdict.md` untracked, so 00–04 are unchanged since `ea96cf4`. The five line counts above were re-counted.
- No other agent session was still running when the revision began.
- The appellate reviewer reports 6 audit payloads with 41/51/44/35/16/25 claim rows, each carrying `own_findings` and `settled_tags`, and 3 rulings carrying every field. The court did not have those payloads in the revision pass and relies on that report for the row counts.

Conventions:
- `route.ts` means `app/api/submit/[id]/route.ts`.
- ★ marks a row the court re-opened itself on 2026-09-28 (25 audit rows and 17 findings; N9 is merged into row 26).
- Every URL was accessed on 2026-09-28.
- Nothing was submitted to the live service, and `/api/download` was not called.
- ◆ marks evidence taken from the author's *other* public repositories, outside this repository. It is kept, with the author's consent, only where the verdict depends on it (the author's own client sites are the only production users, and their relay can lose leads). Client names, domains, towns and repository names are withheld. Evidence from third-party repositories and a company-registry lookup was removed from the record, because the verdict did not depend on it (see `README.md`, "Evidence scope"). The author's nationality and contact details are not part of the record, at the author's request.

---

## 1. Evidence audit

### 1.1 Load-bearing claims (decisive first, then major, then minor)

| # | Party | Claim | Ruling | What was checked |
|---|---|---|---|---|
| 1 | Prosecution, Count 1 | No checkout: every paid CTA is a `mailto:`, and no code writes `plan` | **UPHELD**, decisive | ★ `lib/upgrade.ts:1-14`; ★ live `/pricing` has exactly 3 `href="mailto:`; code-A grep finds no writer of `plan` |
| 2 | Prosecution, Count 2 | Self-serve and MCP forms are born with no allowed origins, only the admin can edit them, and every browser POST gets a 403 | **UPHELD**, decisive | ★ `migrations/schema.sql:23` (`DEFAULT '{}'`); ★ `app/api/client/forms/route.ts:124-136` (no `allowed_origins`); ★ `route.ts:383-394`; `lib/actions.ts:363-365`; `app/api/[transport]/route.ts:58-70`; https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Origin |
| 3 | Cross-Defense | The admin `createForm` defaults to `['*']`, which is why only the author's setup worked | **UPHELD**, decisive | ★ `lib/actions.ts:312` |
| 4 | Defense, Exhibit 1 | "Every lead email, auto-reply and portal page carries the end-client's brand" (`03-defense.md:26`) | **STRUCK**, decisive | ★ branding columns exist only on `clients` (`schema.sql:7-16`); ★ `portal_users` has none (`migration_v10_portals.sql:10-17`); ★ both emails are branded from `form.clients` (`route.ts:752-763`) |
| 5 | Hunter-market (new) | The only verified production user is the author, through a server relay on his own client sites | **UPHELD**, decisive | ◆ ★ the relay in one of the author's client-site repositories, `src/pages/api/contact.ts:4-20, 115-135` (raw file read); ★ the four live client contact pages return 200 |
| 6 | Economist §4 | Bear/Base/Bull MRR is $7/$254/$1,341 at month 12 and $11/$781/$3,929 at month 24 | **UPHELD**, decisive | ★ the court re-simulated the Economist's parameters (`02-economist.md:177-188`, churn applied before new customers) and got $7.5/$254.0/$1,341.2 and $10.6/$780.6/$3,929.1 |
| 7 | Economist | Probability-weighted MRR is $215 at month 12 and $634 at month 24 | **Arithmetic UPHELD; the wrong input for this decision**, decisive | ★ re-simulation. It is the unconditional forecast (Disputes, row 2) |
| 8 | Cross-Prosecution E1/E2 | Weighted MRR is about $54–59 | **PARTLY UPHELD**, decisive | The arithmetic is right (`04-cross-examination.md:137-148`). But it answers "what if he stops", and the pace cap is applied to base only, leaving bull at 5.8× Web3Forms' pace |
| 9 | Cross-Defense (a) | The decision input is P(bear \| commit) ≈ 0.25–0.35 | **UPHELD as method**; the court sets the figure at 0.40 | 0.60 = c·p + (1−c)·0.90 gives c ≈ 0.5 (`04-cross-examination.md:299-301`; arithmetic auditor) |
| 10 | Economist §6(d) | White-label value per site, 12-month EV ≈ $1,040 | **PARTLY UPHELD**, corrected to about $0.9k, decisive | ★ court re-derivation: 36 months, 10%/yr discount, net of $1,125 CAC and the fixed stack, gives $362–1,448 (arithmetic auditor: $360–1,510) |
| 11 | All parties | Brevo §3.1: "only allowed to create and use one account" | **UPHELD**, decisive | ★ string present at https://www.brevo.com/legal/termsofuse/; ★ `lib/mailAccounts.ts:86-87`; ★ the author's own warning at `docs/adding-email-accounts.md:112-115` |
| 12 | Economist, Prosecution | Gemini Unpaid Services: "Do not submit … personal information" | **UPHELD as a probable breach**, decisive | https://ai.google.dev/gemini-api/terms (market-legal; re-fetched); ★ `lib/spamClassifier.ts:30-32`; ★ `lib/ai.ts:87-93` rotates up to 20 keys. Only the code shows the free-key pool (★ `lib/ai.ts:4`), and the production keys are unverified. For a seller in the EEA, Switzerland or the UK, the same page applies the Paid data-use terms to unpaid quota, so the exposure depends on where the seller's legal entity is established (§1.2) |
| 13 | Defense A1 | Paddle accepts sellers in almost every country, including France and the Francophone African markets Inlet targets, at 5% + 50¢ | **UPHELD**, decisive | https://www.paddle.com/help/start/intro-to-paddle/which-countries-are-supported-by-paddle; https://www.paddle.com/pricing. The Defense's exclusion list omits Libya |
| 14 | Economist, Defense | Web3Forms: $40,549 MRR and 2,939 subscriptions, verified via Paddle | **UPHELD**, decisive | https://trustmrr.com/startup/web3forms (three auditors) |
| 15 | Prosecution, Count 3 | The pool is 300/day, yet Pro is sold 300/day and Max 1,000/day; N accounts give about N× capacity | **UPHELD**, major | `lib/plans.ts:12-14, 81, 99`; ★ `lib/mailAccounts.ts:86-87`; commit `488f4a4` shows 6 accounts wired locally (production count unverified) |
| 16 | Prosecution, Count 4 | The keyword filter drops matching leads with a fake success | **PARTLY UPHELD**, major | ★ `route.ts:554-580` scans `textOnlyPayload`, not the whole payload. All nine examples are still dropped, except the name "Jose Ortiz", which is caught only through its email address |
| 17 | Prosecution, Count 5 | "Self-hosted · you own the data" is false, and three competitor rows are false | **UPHELD**, major | ★ `lib/dictionaries.ts:64, 100, 213, 242, 269`; ★ live JSON-LD "Self-hosted form backend"; https://formspree.io/plans; https://usebasin.com/pricing |
| 18 | Prosecution, Count 6 | There are no legal pages and nothing is ever deleted | **PARTLY UPHELD**, major | ★ `/privacy`, `/terms`, `/mentions-legales` and `/status` return 404. Admin cascade deletes do exist (`lib/actions.ts:189, 398`; `schema.sql:36`); there is no tenant delete and no retention job |
| 19 | Prosecution, Count 7 | 12 posts a minute from one IP writes a permanent ban | **PARTLY UPHELD (understated)**, major | ★ `route.ts:17-34, 402-405`: the in-memory limit of 5 bans on the 6th post; ★ no expiry column (`schema.sql:53-59`) |
| 20 | Prosecution, Count 8 | An AI agent plus Resend replaces Inlet | **PARTLY UPHELD**, major | True for a single site only (`02-economist.md:228`). ◆ ★ The author himself used direct Resend for another client site (that site's `api/contact.js:263-281`) |
| 21 | Prosecution, Count 10 | `csvExport`, `priorityDeliverability` and `retentionDays` are never read | **UPHELD**, major | code-B grep: 0 consumers outside `lib/plans.ts` |
| 22 | Prosecution, Count 10, hidden flaw 1 | Free auto-replies plus unverified signup make an open relay | **PARTLY UPHELD**, major | The subject is templated (`app/api/client/forms/route.ts:132`) and each recipient is limited to 3 per 10 minutes (`route.ts:39-53`). The pool-drain risk is real |
| 23 | Prosecution, Count 11 | Tenants cannot edit auto-reply text, success URL or origins | **UPHELD (webhooks are tenant-editable)**, major | `lib/actions.ts:328-337, 363-365`; `app/api/client/forms/route.ts:44-84` |
| 24 | Prosecution, Count 11 | Emails are fire-and-forget, with no `after()` | **UPHELD at code level; loss in production unverified**, major | ★ `route.ts:769`; https://nextjs.org/docs/app/api-reference/functions/after |
| 25 | Prosecution, Count 13 | 51 days of silence means the founder stopped | **PARTLY UPHELD**, major | 0 Forms-Central commits since 2026-08-08 (git log). ◆ The author's public GitHub profile shows 18 new repositories in that window (mostly client sites, plus a portfolio and bots). Whether that work was paid is unverified. The court could not re-count them because GitHub user search is blocked here |
| 26 | Cross-Prosecution §4.2 | `/api/download` is an open proxy | **UPHELD and aggravated: it is an SSRF**, major | ★ `app/api/download/route.ts:13, 17, 24, 31-35`: a substring test, then a server-side `fetch` of any URL (not called) |
| 27 | Defense, Exhibit 2 | Inlet is "the only one that speaks French" (`03-defense.md:10`) | **STRUCK**, major | https://www.jotform.com/fr/pricing/ serves `lang="fr"` with 198 occurrences of "formulaire" (reproduced by two auditors) |
| 28 | Defense | The agency-portal wedge is "unoccupied" (`03-defense.md:15`) | **STRUCK**, major | https://agencylabel.com/platform/clients; https://www.duda.co/client-management. Agency Label's free portal carries Agency Label branding (https://agencylabel.com/pricing) |
| 29 | Cross-Prosecution D8 | "The first customer and case studies exist" is unsupported | **PARTLY UPHELD**, major | ★ The agency-era deployment the README documents as the form `action` (`README.md:162`, `logiciel-formulaire.vercel.app`) returns 404, and nothing in this repository or on the live web shows the agency using Inlet today. But the author's own client sites are real case studies (N1) |
| 30 | Economist §2.2–2.3 | Every paid plan keeps a positive margin at full use; honest email costs $20–69/month | **UPHELD**, major | Reproduced cell by cell by the arithmetic auditor (`02-economist.md:73-120`) |
| 31 | Economist §6 | Model ranking, with done-for-you (c) first | **PARTLY UPHELD**, major | The table mixes net rows (a, b) with gross rows (c–f). ★ Paddle's acceptable-use policy bars "IT services" not related to a software offering (updated 13 April 2026): https://www.paddle.com/help/start/intro-to-paddle/what-am-i-not-allowed-to-sell-on-paddle |
| 32 | Economist §3.3 | $15/h opportunity cost; agency LTV/CAC ≈ 11 | **PARTLY UPHELD**, corrected to 3.3–3.8, major | https://www.codeur.com/pages/quel-prix-site-vitrine (€38–43/h) gives a CAC of $325–368 |
| 33 | Economist §1.2, §5 | "The only certain user is the author's own agency" | **PARTLY UPHELD**, major. "No external user" stands; "the agency is the user" is unproven | ★ The agency deployment documented in `README.md:162` returns 404, and nothing in this repository or on the live web shows the agency using Inlet. ◆ The verified user is the author, through his own client sites (N1) |
| 34 | Defense, Exhibit 6 | Passwords use scrypt | **PARTLY UPHELD**, major | ★ admin-created and admin-reset passwords use reversible AES (`lib/actions.ts:110-111, 160-168`), which the admin can decrypt (`:142-150`) and reveal (★ `app/admin/clients/page.tsx:185-190`) |
| 35 | Defense, Exhibit 6 | Webhooks are signed | **PARTLY UPHELD**, major | ★ the secret is generated and read only in `lib/webhooks.ts:29-32` and never returned to tenants, so receivers cannot verify |
| 36 | Defense, Exhibit 6 | RLS is deny-by-default on 15 tables | **PARTLY UPHELD**, major | "The app uses the service_role key, which BYPASSES RLS" (`migration_v19_data_security.sql:7`); `lib/supabase.ts:4-10` |
| 37 | Defense §5 | The 30/60/90 plan fits about 10 h/week | **STRUCK**, major | It needs 155–199 h against 128.6 h available (arithmetic auditor, on `03-defense.md:236-263`) |
| 38 | Cross-Defense (e) | Lifetime EV ≈ $4,380 | **Arithmetic right; method rejected**, major | Gross, undiscounted, no CAC or fixed stack, and $49 instead of the Defense's own €29 (`04-cross-examination.md:316-320`) |
| 39 | Cross-Defense (b) | The base case with outreach is $520–720 | **PARTLY UPHELD**, corrected to $431–634, not a weighted figure, major | It double-counts the base case's 10 h/week (`02-economist.md:180`) |
| 40 | Defense, move 9(c) | `?ref=` badge tags can be counted in analytics | **PARTLY UPHELD**, major | ★ `app/api/track/route.ts:36-37` strips every query string |
| 41 | Product copy (`app/pricing/page.tsx:25`) | Over quota, emails pause "until the next day" | **STRUCK for the monthly cap**, major | ★ `app/pricing/page.tsx:25` (live FAQ) vs ★ `lib/quota.ts:21-26, 40-45, 63`: a calendar month in UTC, counting every row, spam included. The Economist's description, that emails pause once *monthly* submissions exceed the cap (`02-economist.md:75`), is correct and UPHELD |
| 42 | Defense, move 7 | €29 "undercuts every agency plan" and sits "6–29×" above $1–5 | **STRUCK**, minor | €29 = $33.07, which is above Web3Forms Agency at $33; the multiple is 6.6–33× |
| 43 | Cross-Defense (d) | The captive floor is $290/yr (Basin Growth is cheapest) | **STRUCK**, minor | splitforms Starter at $1/month includes an auto-responder (https://splitforms.com/pricing) |
| 44 | Economist | Sensitivity #3 "below $50"; "roughly break-even"; captive +$1,080; P(≥$1k) 8% | **STRUCK** (four sentences), minor | Recomputed: $58.9; contribution 2.9× fixed cost; +$840; 10% (arithmetic auditor) |
| 45 | Prosecution, Economist | Formspree $20; Basin $30.62/$81.25; Formspark $25; the prove-promptly duty in L122-1 | **CORRECTED**, minor | Annual, coupon and promo prices; list is $30, $40.83/$108.33 yearly, $50 (https://formspree.io/plans; https://usebasin.com/pricing; https://formspark.io/pricing/). The duty is in L122-5 (https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000032227214) |

### 1.2 Tags settled

| Original tag | Claim | Now | Source |
|---|---|---|---|
| Caveat: code-level only | The production database default for origins may have been changed by hand | **Partly corroborated**: the live `/llm-install.md` matches `lib/agentDocs.ts:7`. The database itself cannot be checked | ★ live `/llm-install.md` (text/markdown, 200) |
| [UNVERIFIED] | The upgrade address is misspelled | **Still unverifiable**; confirming it would require sending mail | `lib/upgrade.ts:6` |
| [UNVERIFIED env] | `NEXT_PUBLIC_APP_URL` is unset, so attachment links fall back to the dead domain | **Corroborated in the repo** (single reference); the production value is unknown | `emails/LeadNotification.tsx:152`; ★ `logiciel-formulaire.vercel.app/portal/login` returns 404 |
| [UNVERIFIED] | Six Brevo accounts run in production | **Six were wired locally**; the production count is unknown | commit `488f4a4` |
| [FROM MEMORY] | `after()` applies to Next.js 16 | **Confirmed**; next 16.2.7 is pinned and `after()` is never used | `package.json`; https://nextjs.org/docs/app/api-reference/functions/after |
| [UNVERIFIED] | Proof-of-work timing on phones | **Still unverified.** Server CPUs give a 3.4–10.6 s mean, i.e. seconds | `lib/pow.ts:32`; `app/docs/page.tsx:30` |
| [UNVERIFIED] | Chain of title | **Sharpened, not settled.** The spec was written for an agency's management (`cahier_des_charges.md:1, 17`). All 109 commits use an organisational email domain | `cahier_des_charges.md`; git author metadata |
| [INFERENCE] | Where the seller is established | **Withdrawn from the record at the author's request.** The author's nationality and contact details are not relevant to the ruling. The author states that Inlet will launch in several regions, including Europe and the US. Payment-rail and AI-terms findings (row 12, N7) therefore stand as conditional on where the legal entity is registered. The buyers in evidence are the author's own client businesses (N1) | Author's statement to the clerk, 2026-09-28 |
| [FROM MEMORY] | Paddle needs legal pages | **Confirmed, and the legal name is also required** in the terms | https://www.paddle.com/help/start/account-verification/what-is-domain-verification |
| [UNVERIFIED third-party] | "Do not distribute requests across projects" | **Per-project limits confirmed; the quoted sentence is not on Google's page.** §2.d anti-circumvention stands | https://ai.google.dev/gemini-api/docs/rate-limits; https://developers.google.com/terms |
| [SECONDARY] / snippet | Static Forms Pro $9 or $7.50; splitforms MCP on Free | **Static Forms confirmed only as SECONDARY**: ★ its primary page https://www.staticforms.dev/pricing returns 429 (a Vercel security checkpoint). **splitforms MCP on Free is confirmed** on the primary page. But splitforms Free is 500 submissions in total, once, not 500 a month | https://www.formbackend.com/alternatives/static-forms; https://splitforms.com/mcp; https://splitforms.com/pricing |
| [UNVERIFIED] | Web3Forms sells a $9/month white-label add-on | **Still unverified** (the primary page returns 403) | https://splitforms.com/web3forms-pricing |
| Secondary (S20) | A Cameroon showcase site costs 50k–200k FCFA | **Corrected to 100k–400k FCFA**, so €29 is 4.8–19% of a site | https://elimboo.com/prix-site-web-afrique-francophone/ |

### 1.3 The bench's own findings (new to the record, or materially extended beyond what a party filed)

| # | Finding | First raised by | Evidence | Severity | Business impact |
|---|---|---|---|---|---|
| N1 | **The author is the only verified production user, and his real integration contradicts the pitch.** Each of his client sites posts through a server relay of about 150 lines that solves the proof-of-work and avoids CORS. For a similar client site he chose direct Resend instead | — (hunter-market audit; no party) | ◆ ★ the client-site relay `src/pages/api/contact.ts:4-20, 47-49, 115-135`; ◆ ★ another client site's `api/contact.js:263-281`; hunter-market (at least 8 relays) | Severe | Inlet's value is multi-site lead operations, not "no backend in 2 minutes" (`lib/dictionaries.ts:70`). The split between Inlet and DIY in the author's own work is a revealed preference |
| N2 | **The live client chain can lose leads outright (court's own finding).** The relay forwards no visitor IP and Inlet takes the first `x-forwarded-for` (`route.ts:291-292`), so the relay's server IP carries every lead into the 6th-post permanent ban (`route.ts:402-405`). Its "continue without proof" fallback (`contact.ts:111-128`) cannot work, because a JSON post without proof-of-work is refused (`route.ts:642-652`), and the challenge is IP-bound (`lib/pow.ts:27, 54`). On any rejection the relay keeps no copy (`contact.ts:136-143`) | — (court) | ◆ ★ as cited (`contact.ts` is the client-site relay). Shared egress IPs are **[INFERENCE]** | Severe | One busy minute, an Inlet outage or a ban turns every submission from the affected relay into a visitor-facing error page (◆ ★ `contact.ts:26, 137-143`), and the tenant is never told. If the relays share an egress IP **[INFERENCE]**, every client site is hit at once |
| N3 | **Spam can mute a tenant for a month.** The quota counts every stored row, spam included, and the pause runs to the next month in UTC. The tenant is not notified, while the FAQ says "until the next day". Native posts skip CORS and proof-of-work | Economist, mechanism (`02-economist.md:75`); spam-counting and the FAQ contradiction are new | ★ `lib/quota.ts:21-26, 40-45, 63`; ★ `route.ts:743-777`; ★ `app/pricing/page.tsx:25`; `route.ts:383, 637` | Severe | 51 native posts at 5 a minute from one IP, about 10 minutes, silence a Free tenant (50/month, `lib/plans.ts:44`) until the 1st of the next month |
| N4 | **Branding is per tenant, not per end-client**, and only the operator can set it | — (new; Cross-Prosecution D3 attacked portal access, not branding: `04-cross-examination.md:71-77`) | ★ `schema.sql:7-16`; ★ `migration_v10_portals.sql:10-17`; `lib/actions.ts:79-105` | Severe | The converged wedge (`04-cross-examination.md:34-37`) cannot be delivered: a bakery's customers are thanked by the agency |
| N5 | **Nothing shows the agency the spec was written for using Inlet.** Its documented deployment returns 404, and the only verified user is the author (N1) | Cross-Prosecution D8, customer #1 unproven (`04-cross-examination.md:111-116`); the dead deployment as evidence of non-use is new | ★ `README.md:162` → `logiciel-formulaire.vercel.app` returns 404; N1 | Serious | The "customer #1" in the Defense's and the Economist's plans is unproven. The real first customer is the author's own studio |
| N6 | **The labour price was too low, and the return was never set against a sourced outside rate.** The Economist priced hours at $15/h (`02-economist.md:163`) and got $1.36/h in year 1 (`:188`). Its only outside benchmark is an unverified €300–450/day for one portfolio-won engagement (`:244`). Against the €38–43/h Codeur average, and given commitment, 24 months return $3.44–5.27/h at the court's weights (§4) | Economist (`02-economist.md:163, 188`); the sourced outside rate and the conditional weights are new | ★ court re-simulation; `02-economist.md:163, 188, 244`; https://www.codeur.com/pages/quel-prix-site-vitrine | Severe | Continuing is justified only as a capped option with hard stops |
| N7 | **Every card rail is gated behind a legal identity.** Paddle requires a legal name plus Terms, Refund and Privacy pages, and bars standalone IT services | Defense A1, legal pages [FROM MEMORY] (`03-defense.md:177`); the legal-name requirement and the IT-services bar are new | https://www.paddle.com/help/start/account-verification/what-is-domain-verification; ★ Paddle acceptable-use page (above) | Severe | There is no checkout before the legal work. Services must be invoiced directly. Which rails open depends on where the legal entity is registered: an EU or US entity opens Stripe as well as Paddle (★ https://stripe.com/global), while in some target markets Paddle is the only merchant of record available (Stripe and Polar exclude them: https://stripe.com/global, https://polar.sh/docs/merchant-of-record/supported-countries) (§1.2) |
| N8 | **Silent notification loss.** `sendWithFallback` returns `{success:false}` instead of throwing, so the `.catch` never fires. The email budget is charged before the send | Prosecution Count 11, fire-and-forget (row 24); the swallowed `{success:false}` is new | ★ `lib/email.ts:44-94`; ★ `route.ts:764-772` | Serious | A dead or suspended pool (Count 3) leaves tenants unnotified while still consuming their quota |
| N9 | *Merged into row 26 (the SSRF).* | Defense (`03-defense.md:142`) and Cross-Prosecution (`04-cross-examination.md:185`), as an open proxy | row 26 | — | — |
| N10 | **Operator-readable passwords on the admin path**, which is exactly the path concierge onboarding uses | — (new); same facts as row 34, which rules on the Defense's scrypt exhibit | ★ `lib/actions.ts:110-111, 142-150, 160-168`; ★ `app/admin/clients/page.tsx:185-190` | Serious | A vendor questionnaire fails, and it contradicts the "scrypt" concession (`04-cross-examination.md:173`) |
| N11 | **A password reset leaves every session alive**, and signup tokens carry no session id | — (new) | ★ `app/api/auth/reset-password/route.ts:41` (the file has 50 lines, so hunter-code-ops' ":76-79" citation is wrong); `app/api/auth/client-signup/route.ts:91-99`; `app/client/(protected)/layout.tsx:29-33` | Serious | A pre-registered or compromised account cannot be taken back |
| N12 | **"Signed webhooks" cannot be verified**: the secret is never shown to tenants | — (new); same facts as row 35, which rules on the Defense's signed-webhooks exhibit (`03-defense.md:134`) | ★ `lib/webhooks.ts:27-37`; ★ grep: no other reader; `lib/agentDocs.ts:5` tells integrators to use it | Serious | A documented feature does not work end to end |
| N13 | **Anonymous AI chat is unlimited** if the `ke_anon` cookie is dropped, and it uses the same key pool as the spam classifier | — (new) | ★ `app/api/ai/chat/route.ts:32-37, 65-80`; `lib/spamClassifier.ts:32` | Serious | A cost and availability hole with no ceiling; spam labels fail open for everyone |
| N14 | **Attribution is discarded.** Query strings are stripped and signups record no source or locale | Query-string stripping: row 40 (Defense move 9(c)); the missing signup source and locale are new | ★ `app/api/track/route.ts:36-37`; `app/api/auth/client-signup/route.ts:55-57` | Serious | The Defense's day-90 gates (`03-defense.md:263, 278`) cannot be computed |
| N15 | **A banned IP loses `/admin` too**, including the only unban page | — (new) | ★ `proxy.ts:41, 98-100`; `app/admin/blacklist/page.tsx:86` | Serious | An operator who tests his own form six times in a minute locks himself out |
| N16 | **Tenants have no self-service controls.** They cannot delete, rename or deactivate a form, enable 2FA, delete the account or cancel, although the plan screen says "Change or cancel anytime" | Prosecution: no tenant delete (`01-prosecution.md:157-159`) and admin-only settings (`:273`, row 23); rename, deactivate, 2FA, cancel and the "Change or cancel anytime" contradiction are new | `app/api/client/forms/route.ts:24, 44, 86`; `app/pricing/page.tsx:83`; `lib/appDict.ts:318` (hunter-code-ops) | Serious | Test forms use up Free's 3-form cap; every request becomes a support ticket to one person |
| N17 | **Self-serve auto-replies set no Reply-To**, so customer replies land in the shared sending mailbox | — (new) | `lib/email.ts:209-215`; `route.ts:795-797` (hunter-code-ops) | Serious | Leads are lost, and third-party personal data ends up in the operator's inbox |
| N18 | **Portal logins are unique across the whole platform.** The 409 error leaks cross-tenant membership, and portal users have no password reset | — (new) | ★ `migration_v10_portals.sql:14`; `app/api/client/portal-users/route.ts:96-99` | Serious | An end-client cannot belong to two agencies, and competitors can probe which businesses use which agency |
| N19 | **The operator's failure log is capped** at the newest 100 rows across all tenants and all error types | Prosecution: `failures_log` readable only by the operator (`01-prosecution.md:96`); the 100-row cap is new | `lib/actions.ts:459-466` (code-A) | Serious | Dropped leads soon become unrecoverable even for the operator |
| N20 | **Consumer law: the trader is not identifiable.** L121-2 3° covers this; the only operator identity is "King_E" | Prosecution Count 6: no identified entity, only "King_E" (`01-prosecution.md:153-156, 364`); the L121-2 3° basis is new | https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000044563114; ★ `app/llms.txt/route.ts:90` | Serious | A second French-law exposure, separate from "self-hosted" |
| N21 | **The market in the target regions runs on platforms.** WordPress is 65.2% of known-CMS .fr sites and 78.7% of .cm sites. Google autocomplete returns nothing for the Defense's French keywords | Economist, WordPress at 40.2% (`02-economist.md:42`), repeated at `04-cross-examination.md:123`; the .fr/.cm shares and the autocomplete run are new | https://w3techs.com/technologies/segmentation/tld-fr-/content_management; https://w3techs.com/technologies/segmentation/tld-cm-/content_management; hunter-market autocomplete run | Serious | French SEO (`03-defense.md:244`) targets near-empty demand, and the portal only sells to agencies that hand-code |
| N22 | **Leads arrive by WhatsApp**, yet `notify_sms` exists and nothing reads it | Economist, "WhatsApp-first" (`02-economist.md:242`), repeated at `04-cross-examination.md:154`; Defense on WhatsApp alerts (`03-defense.md:249`); the unused `notify_sms` is new | ★ `schema.sql:26`; https://datareportal.com/reports/digital-2026-cameroon | Serious | The channel end-clients actually use is missing, while an unused SMS field is shown |
| N23 | **Three minor gaps.** The 6 MB body cap is unreachable under Vercel's 4.5 MB limit (about 3.4 MB of base64 files); CSV export allows formula injection; Resend Free caps at 100 emails/day and 3 domains | Prosecution, 6 MB body cap (`01-prosecution.md:272`); the Vercel 4.5 MB limit, CSV injection and the Resend Free caps are new | `route.ts:69-71`; https://vercel.com/docs/functions/limitations; `components/client/FormDashboardClient.tsx:22-45`; https://resend.com/pricing | Minor | Photo forms fail with a platform error; a security-review item; the DIY substitute is weaker for agencies |

---

## 2. Party scorecards

Scores are out of 10. The "Overall" column is the court's judgment of the whole party, not a mean of the four columns.

### Prosecution

| | Evidence | Rigor | Relevance | Honesty | **Overall** |
|---|---|---|---|---|---|
| Court | 8 | 7 | 8.5 | 8 | **7.5** |
| Panel range | 8–8.5 | 7 | 8–9 | 8 | 7.5 |

- **Best argument: Count 2** (`01-prosecution.md:45-61`). Self-serve and MCP forms are born with `'{}'` origins, and only the admin can change them. That turned "no users" into "no stranger could ever succeed", and exposed that the stranger's path was never tested. It was confirmed line by line by the clerk, two code auditors and the court.
- **Worst argument: E1/E2** (`04-cross-examination.md:137-148`). It prices "should he keep building?" using the value of stopping, and applies the Web3Forms pace cap to base only. Smaller slips: "whole payload", "12/min", "only Stripe and Lemon Squeezy are out", L122-1, splitforms "monthly", and D8, which was right about the agency but could not know of the author's own client sites (`04-cross-examination.md:111-116`).
- **Honesty.** It dropped 13 unsupported charges on its own (`01-prosecution.md:376-390`) and made six concessions: two downgrades, three narrowings and one partial withdrawal (`04-cross-examination.md:166-177`).

### Economist

| | Evidence | Rigor | Relevance | Honesty | **Overall** |
|---|---|---|---|---|---|
| Court | 8 | 6 | 9 | 9 | **7.5** |
| Panel range | 7–8 | 6–6.5 | 8–9 | 8–9 | 7–7.5 |

- **Best argument.** Inlet is worth more as a delivery tool inside paid services than as a $9–49 SaaS, and should be judged by paying external accounts (`02-economist.md:11, 260-275`). The cost-to-serve table holds cell by cell (`:73-120`). Its framing is the closest to this verdict.
- **Worst argument.** The §6 ranking mixes net and gross figures, and its top model (c) cannot be billed through Paddle. It uses a $15/h opportunity cost, about a third of market rate (`:163`), and an unconditional 60% bear case for a conditional question. Its "certain user", the author's agency, is unproven: the agency deployment documented in the README returns 404 (row 33). Five sentences failed recomputation.

### Defense

| | Evidence | Rigor | Relevance | Honesty | **Overall** |
|---|---|---|---|---|---|
| Court | 5 | 5 | 7 | 7 | **5.5** |
| Panel range | 5–6 | 4–5.5 | 6–8 | 6–7 | 5–5.5 |

- **Best argument: cross (a)** (`04-cross-examination.md:299-301`). The 60% bear case mixes "won't work" with "won't try", so the decision needs P(bear | commit). That was the trial's best point of method. Together with its concession that demand is "untested, not refuted" (`:324`) and its self-reported holes (`03-defense.md:141-145`), it framed the ruling.
- **Worst argument: the Exhibit 1 headline** (`03-defense.md:26`). The code it cites proves the opposite: all branding comes from the tenant. It is compounded by "the only one that speaks French" and "the wedge is unoccupied" (both struck), "five layers" (about 3.5), a 90-day plan at 121–155% of its hour budget, and a gross, undiscounted $4,380.

---

## 3. Idea scorecard

Scores are 0–10. Weighted total = Σ(weight × score) ÷ 10.

| Dimension | Weight | Court potential | Court today | Panel potential | Panel today | Justification |
|---|---|---|---|---|---|---|
| Pain & demand | 15 | 5 | 3 | 5–6 | 3 | The pain is real: the spec was written to replace paid form tools across an agency's sites (`cahier_des_charges.md`), and the author built relays to route his own clients' leads (N1). But the target markets run on WordPress (N21) and WhatsApp (N22). External demand is untested (`04-cross-examination.md:324`), and the only user is the author (N1) |
| Willingness to pay | 15 | 4 | 1 | 4 | 1 | Revenue is $0 and payment is a `mailto:` (★ `lib/upgrade.ts:1-14`). Endpoints sell for $1–5 (https://splitforms.com/pricing). Potential rests on €60–100 retainers absorbing €10–29 (https://ellebay-digital.com/blog/cout-maintenance-site-web-2026), which is untested |
| Differentiation vs 2026 competitors and the AI-agent substitute | 15 | 4 | 2 | 4–5 | 2 | Multi-site portals are rare among endpoints (`02-economist.md:35`). But platforms occupy the wedge (row 28), French is not unique (row 27), MCP is free elsewhere (https://formcarry.com/pricing), and branding is per tenant only (N4) |
| Distribution: can one person reach buyers | 15 | 3 | 1 | 3–4 | 1 | The site lives on a `vercel.app` subdomain (`01-prosecution.md:226-227`). The badge yields about 0.025 paid customers a month (`02-economist.md:167`). Attribution is stripped (N14), and French query demand is near zero (N21). Only the author's network and freelance groups remain (https://www.codeur.com/blog/facebook-groupe-freelance/) |
| Ability to deliver (ops, email, AI, legal) | 15 | 6 | 1.5 | 5–7 | 1–2 | Potential: margins of 37–88% and honest email at $20–69 (row 30). Today: two probable terms breaches (rows 11–12), no legal pages (row 18), an SSRF (row 26), silent failures (N8), month-long spam mutes (N3) and permanent bans (row 19) |
| Defensibility / durability | 10 | 3 | 1 | 3 | 1 | Code is not a moat (92 of 109 commits are AI co-authored; `04-cross-examination.md:250`). There is no licence and no entity, and chain of title is open. The only moat is relationships |
| Execution & founder fit | 10 | 5 | 3.5 | 5–6 | 3–4 | He ships fast (107 commits in 19 days, `00-case-file.md:28`), wrote a working relay himself (N1), and runs real security primitives (`lib/crypto.ts:35-42`). But he never tested the stranger path, shipped Brevo rotation against his own warning, and his time goes to client work |
| Timing | 5 | 4 | 3 | 4 | 3 | The category pays (row 14), but agents are commoditising endpoints (https://formspree.io/ai/; https://splitforms.com/mcp). There is no Inlet-specific window |

**Weighted totals**
- **Potential:** 15×5 + 15×4 + 15×4 + 15×3 + 15×6 + 10×3 + 10×5 + 5×4 = 75 + 60 + 60 + 45 + 90 + 30 + 50 + 20 = 430, ÷ 10 = **43.0 / 100**. The panel gave 44–50.
- **Today:** 15×3 + 15×1 + 15×2 + 15×1 + 15×1.5 + 10×1 + 10×3.5 + 5×3 = 45 + 15 + 30 + 15 + 22.5 + 10 + 35 + 15 = 187.5, ÷ 10 = **18.75 / 100**. The panel gave 17.5–20.

**The house calibration, applied to "sellable to a stranger."** The court counts ten gates a stranger must pass through. Partial credit is given only where the code already carries most of the fix.

| Gate | Status today | Credit |
|---|---|---|
| 1. A stranger's submission succeeds | Fails (row 2) | 0 |
| 2. A stranger can pay | `mailto:` only (row 1) | 0 |
| 3. A legal person, legal pages and a DPA | None (row 18, N20) | 0 |
| 4. Legitimate email capacity | Rotation breaches the terms. A single paid account is mostly configuration | 0.25 |
| 5. Lawful AI processing | Unpaid tier. The classifier fails open, so switching is configuration | 0.25 |
| 6. Truthful copy | At least 8 false claims live (row 17, row 41) | 0 |
| 7. No lead-loss paths | Storage-first design at the quota layer, but the drop, bans and mutes remain (rows 16, 19; N3) | 0.25 |
| 8. Security baseline | scrypt, GCM, hashed keys and tenant isolation are real; SSRF, reversible passwords and live sessions remain | 0.5 |
| 9. The agency wedge as sold (per-client brand) | Not built (N4) | 0 |
| 10. Commercial hosting, domain and EUR pricing | None | 0 |

The total is **1.25 of 10 gates, i.e. 12.5% of the way to "sellable to a stranger"; 87.5% of the distance remains.** In words: the engine exists and works when its operator stands behind it. Every gate a stranger has to pass through to succeed, trust, pay and be protected is still closed.

Under the house calibration (`00-case-file.md:83`), a self-assessed 90% would count as 18%, or 13.5% with rigor. The court's gate count of 12.5% sits at that level.

---

## 4. Reasoning

- **It cannot be sold to a stranger today.** There is no checkout (row 1), and a stranger's first submission is refused (row 2). The only identity is "King_E" with no legal pages (row 18, N20). Its delivery rests on two probable terms breaches (rows 11–12). The code and the `.env.local` commit show them, but the production configuration is unverified (`lib/ai.ts:4`; commit `488f4a4`). It clears 12.5% of the sellability gates (§3).
- **It is nevertheless live infrastructure.** The author's own client sites post leads to Inlet today through his relay (N1; ★ four live contact pages return 200). A KILL would cut real leads, so the rational move is to keep the engine.
- **That live use is exposed now.** Leads are dropped (row 16). The 6th post in a minute bans the relay's IP permanently, and the relay keeps no copy on rejection (N2). Spam mutes notifications for a month (N3), and send failures are silent (N8). These are the grounds for the orders that apply whatever the verdict.
- **Demand is untested, not refuted, and the revealed preferences are lukewarm.** Nothing shows the agency the spec was written for using Inlet (N5). The author himself used direct Resend for another client site (N1). In the target regions, forms come bundled with WordPress and the site platforms (N21).
- **The self-serve path does not pay for the author's time.** Given commitment, it returns $3.44–5.27/h over 24 months (§4, Disputes), against the €38–43/h that French freelance web developers and web designers average on Codeur, an assumed outside rate for the author (https://www.codeur.com/pages/quel-prix-site-vitrine).
- **The converged wedge is real, but neither built nor unoccupied.** Branding is per tenant (N4), and Agency Label, Duda and Jotform FR occupy the space (rows 27–28). It must first be proven with the one customer who uses it: the author's own studio.
- **Cost is not the constraint.** Honest infrastructure costs $20–69/month for email and about $45/month for hosting, and every paid plan keeps a 37–88% margin (row 30). So legitimacy is cheap, and it is mandatory.
- **The money path fits a pivot, not a SaaS.** Every card rail needs a legal entity first, and which rails open depends on where it is registered (N7, §1.2). Paddle requires a legal name and legal pages, and it bars standalone IT services (N7). A service line invoiced directly on the author's existing invoices needs neither Paddle nor self-serve.

### Disputes settled

| Dispute | Ruling | Why |
|---|---|---|
| **Should commitment be priced in?** (`04-cross-examination.md:40`) | **Condition on commitment, price it, and prove it by behaviour.** Use E[outcome \| he builds], charge his hours at an assumed outside rate (€38–43/h, the Codeur average for French freelance web developers and web designers, not $15/h), and test commitment at the 2026-10-28 gate | "Keep building?" is his choice, so folding it into the forecast is circular (row 9). The 51 days went to other repos, mostly client sites (row 25; whether paid is unverified), so the binding constraint is likely opportunity cost. The Prosecution's 90/7.5/2.5 split is the value of stopping |
| **Corrected expected revenue** ($215 vs $54–59 vs $520–720 vs $370) | **Method:** E[MRR \| commit] with P(bear \| commit) = **0.40** (range 0.30–0.45), the Economist's 3:1 base-to-bull ratio, the Web3Forms pace cap (×12/16.6) on base **and** bull, net of fixed costs and labour. **Figure:** about **$230–320 MRR at month 12** and **$680–950 at month 24**; year-one contribution net of fixed costs is **$0.41–1.04/h**; 24 months give **$3.44–5.27/h** | The court's re-simulation reproduces every Economist cell and the auditor's $370/$1,101/$6.36/h at p = 0.30. **Why 0.40:** the Defense's 0.30 predates three market-risk facts (N1, N5, N21). The investor's 0.45 silently changed the ratio to 4.5:1 and double-counts funnel risk that is curable inside the commit branch. The 75% margin is itself optimistic (the revenue-weighted high case is 52%, arithmetic auditor) |
| **White-label value per site** ($1,040 vs $290–420 vs $4,380) | **About $0.9k (court: $362–1,448; arithmetic auditor: about $360–1,510, row 10)**: 36 months, 10% discount, net of CAC and the fixed stack, at €29–$49, conditional on building | The court re-derived $362–1,448 (row 10). $1,040 lands in range by coincidence; the ×0.4 haircut double-counts risk; $4,380 is gross. Even $0.9k is only about 18–21 billed hours at €38–43 |
| **Kill with one 60-day test, or continue concierge-first with a 45-day deadline** | **Neither as filed.** Kill the *public self-serve SaaS* now. Keep the engine, because live client leads depend on it. Allow one concierge test gated on 2026-10-28, 2026-11-27 and 2026-12-27, with no extension and signed demand before the build. 30-day immediate orders replace the 45-day deadline | The Defense's plan does not fit its hours (row 37). The Prosecution's test would measure a Paddle checkout that cannot yet be approved (N7). About 28 of the ordered hours are owed to current clients anyway (§5a), and about 20.5 more (B1–B3) are needed before even the studio line can be charged (§5b1). So the external test adds about 60 hours (§5c) |
| **PIVOT (investor, mentor) or NARROW & CONTINUE (operator)** | **PIVOT** | The buyer (the author's own clients first), the billing unit (a service line on direct invoices) and the channel (direct only) all change. That is a new business model, not a smaller scope. The operator's substance is adopted in §5 |
| **Who is customer #1?** | **The author's own studio**, not the "mwcrea" agency and not "nobody" | N1 and N5; row 29 |
| **Is the agency-portal plus French wedge unoccupied?** | **Struck.** What survives is "a form-native, French, multi-site lead back-office for studios that hand-code sites" | Rows 27–28, N4, N21 |
| **Count 3: fatal or severe?** | **Severe on economics; the breach itself is an immediate order** | Honest capacity costs $20–69/month (row 30). But the breach is wired in code and in the author's local config (commit `488f4a4`), and the author's own doc flags it (`docs/adding-email-accounts.md:112-115`; row 11). The production count is unverified (row 15) |
| **Can the recommended models be billed through Paddle?** | **Only the software subscription.** Setup, migration and the lead line are invoiced directly | N7; row 31 |
| **Captive value of keeping Inlet internal** | **−$540 to +$840, midpoint about $150**; it is no reason to build | The Economist's upper bound omitted hosting (row 44). The splitforms floor strikes $290 (row 43) |

**Court's re-simulation of the conditional forecast** (the Economist's parameters, `02-economist.md:177-188`; fixed costs of $66/month from month 3; a 75% margin on revenue in both money columns; 520 h in year 1 and 1,040 h over 24 months):

| P(bear \| commit) | Pace cap | MRR at month 12 | MRR at month 24 | Year-1 contribution, net of fixed | $/h, year 1 | 24-month contribution after fixed | $/h, 24 months |
|---|---|---|---|---|---|---|---|
| 0.30 (Defense) | no | $370 | $1,101 | $736 | $1.42 | $6,614 | $6.36 |
| **0.40 (court)** | no | **$318** | **$945** | $542 | $1.04 | $5,479 | $5.27 |
| **0.40 (court)** | yes | **$231** | **$684** | $214 | $0.41 | $3,573 | $3.44 |
| 0.45 (investor's p, at 3:1) | yes | $212 | $628 | $144 | $0.28 | $3,164 | $3.04 |
| 0.60 (unconditional) | no | $215 | $633 | $155 | $0.30 | $3,211 | $3.09 |

The year-1 cells are 0.75 × year-1 revenue − $660. For example, at p = 0.40 without the cap: 0.75 × $1,603 − $660 = $542, and $542 ÷ 520 h = $1.04/h. The first issue of this ruling left the margin out of the year-1 column only.

**Limits of this ruling.** The court would self-assess this ruling at about 70%, which counts as 14% under the house calibration. Five things could be wrong. P(bear | commit) = 0.40 is judgment, not measurement. The production database (tenant plans, real signups, lead volumes), the production AI keys and the SMTP accounts are unseen. The court did not re-count the 18 repos. The relay's shared egress IP (N2) is inferred from code. Where the seller's legal entity will be registered is not in the record (§1.2), so payment-rail advice is conditional.

---

## 5. Orders of the court

### (a) Immediate injunctions, regardless of verdict

| # | Order | Files | Effort | Deadline |
|---|---|---|---|---|
| A1 | **Stop discarding leads.** A keyword hit sets `spam_status='suspect'` (whole-word match) and falls through to the insert. No path may answer "success" without storing the lead | `route.ts:550-580`; `migrations/migration_v16_ai_spam.sql:9` | 1–2 h | 2026-10-02 |
| A2 | **End permanent bans and protect the relays.** Remove `blacklistTarget` from both rate gates, add a 24 h `expires_at` checked in `isBlacklisted`, and delete existing rate-limit bans. Add an authenticated server-to-server submit (API-key header, trusted forwarded visitor IP, proof-of-work waived). In each relay, store or email the lead on any non-2xx response | `route.ts:402-405, 416-419, 642-652`; `lib/blacklist.ts:6-33`; new migration on `schema.sql:53-59`; `proxy.ts:41`; ◆ each client-site relay's `src/pages/api/contact.ts:111-143` | 4–5 h | 2026-10-05 |
| A3 | **Close the download SSRF.** Parse the URL, require `https` and an exact project hostname, and require a tenant session with ownership | `app/api/download/route.ts:13-35` | 1 h | 2026-10-02 |
| A4 | **No personal data to unpaid AI.** Use one paid key (≈$1 per 10k classifications) or turn the classifier off. Turn anonymous chat off | `lib/spamClassifier.ts:30-38`; `lib/ai.ts:87-93, 160-176`; `route.ts:699-705`; `app/api/ai/chat/route.ts:32-37, 65-80` | 1–2 h | 2026-10-05 |
| A5 | **Withdraw public self-serve and the paid plans.** Signup becomes invite-only, and the `mailto:` CTAs and the personal Gmail are removed from public source. Replace them with "sur devis / on request", and drop signup from the sitemap | `app/api/auth/client-signup/route.ts:13-110`; `lib/upgrade.ts:1-14`; `app/pricing/page.tsx:22-63`; `app/sitemap.ts:15` | 1–2 h | 2026-10-05 |
| A6 | **Truth pass.** Remove: "self-hosted", "Priority deliverability", "Unlimited AI", the DKIM row, 2FA-on-every-plan, "integrate in 2 minutes", "the real pipeline", the testimonials, the false competitor rows and every `/compare` page. Fix the FAQ. Update `/llms.txt` and the bot prompt | `lib/dictionaries.ts:64, 70, 91, 96, 100-101, 147, 150-158, 168, 178, 203, 212-217, 242, 245, 259, 268-269`; `app/pricing/page.tsx:25, 55, 83`; `app/llms.txt/route.ts:18, 37, 57`; `lib/ai.ts:19, 22, 38, 66`; `app/compare/[slug]/page.tsx:18-24` | 3–4 h | 2026-10-09 |
| A7 | **One legitimate email provider, with loud failures.** End the Brevo rotation and send from one paid provider on a verified domain. Treat `{success:false}` as a failure and write a per-lead `SMTP_FAILED` row. Charge the budget only after a successful send | `lib/mailAccounts.ts:75-88`; `lib/email.ts:44-94`; `route.ts:764-772, 800-819` | 5–7 h, about $20/month | 2026-10-12 |
| A8 | **Keep the live chain's notifications flowing.** Exclude spam-labelled and canary rows from the quota, tell the tenant when email pauses, and wrap sends, webhook and classifier in `after()`. Point the dead-domain links at `SITE_URL`. Check the plan and month-to-date count of every client tenant (Free = 50/month). Exclude canary rows from both the monthly submission count and the daily email budget: the email budget is charged and an `email_log` row written before every lead email and auto-reply. Send canary notifications to the operator's address with a "[CANARY]" subject prefix, never to the client's inbox | `lib/quota.ts:40-54, 63`; `route.ts:766-767, 804`; `lib/plans.ts:44`; `route.ts:699-826`; `emails/PortalUserWelcome.tsx:109`; `emails/ClientWelcome.tsx:107`; `emails/LeadNotification.tsx:152`; `README.md:162`; `lib/seo.ts:17` | 3–4 h | 2026-10-12 |
| A9 | **Credential hygiene.** Store admin-created and admin-reset passwords with scrypt only, and delete the reveal UI. Replace emailed plaintext passwords with one-time set-password links. Revoke sessions on reset, and give signup tokens a session id | `lib/actions.ts:110-111, 142-150, 160-168`; `app/admin/clients/page.tsx:185-190`; `lib/email.ts:257-261, 310-314`; `app/api/auth/reset-password/route.ts:41`; `app/api/auth/client-signup/route.ts:91-99`; `app/client/(protected)/layout.tsx:29-33` | 4–6 h | 2026-10-19 |

Total for (a): about 28 hours.

### (b) Before charging

**(b1) Before charging anyone, including the author's own clients: B1–B3.**

| # | Order | Files | Effort | Deadline |
|---|---|---|---|---|
| B1 | **Chain of title in writing.** Get a written confirmation that the author owns the code. Then either add a licence or make the repository private, deliberately | `cahier_des_charges.md:1, 17`; git author metadata; `package.json:2` | 1–2 h plus correspondence | 2026-10-28 |
| B2 | **Legal identity and legal pages.** A named legal person, mentions légales, terms of sale with a refund policy, a privacy policy, and an Art. 28 DPA with a sub-processor list (Supabase, Vercel, the email provider, the AI provider). Commercial hosting plans, a custom domain and an EU region | new `app/mentions-legales`, `app/privacy`, `app/terms`, `app/dpa`; `app/llms.txt/route.ts:90`; `app/layout.tsx:70-72`; `migration_v19_data_security.sql:7` (document the isolation) | 10–14 h, about $45/month | 2026-11-13 |
| B3 | **Data lifecycle.** A retention job that enforces `retentionDays`, a private uploads bucket with signed URLs, and tenant-scoped lead deletion | `lib/plans.ts:52, 70`; new `app/api/cron/retention/route.ts`; `route.ts:595-633`; `README.md:125` | 6–8 h | 2026-11-13 |

**(b2) Before charging an external agency: B4–B6.**

| # | Order | Files | Effort | Deadline |
|---|---|---|---|---|
| B4 | **The stranger path and tenant self-service.** Origins set at creation; a tenant editor for origins, success URL and auto-reply; a native redirect; the webhook secret shown to the tenant; an end-client lead alert and Reply-To; one Playwright stranger-path test in CI | `app/api/client/forms/route.ts:44-136`; `app/api/[transport]/route.ts:58-70`; `route.ts:144, 497, 572, 752-816, 834-876`; `lib/webhooks.ts:27-37`; `lib/email.ts:209-215`; `scripts/test-submit.mjs:62` | 10–12 h | 2026-11-27 |
| B5 | **Only if the 11-27 gate passes: per-end-client branding.** Name, logo, colour, sender and Reply-To at the form or portal-user level | new migration on `forms`/`portal_users`; `route.ts:335-337, 752-816`; `emails/AutoReply.tsx:57-75`; `app/portal/(protected)/layout.tsx:19-28` | 8–12 h | 2026-12-12 |
| B6 | **The money path.** Paddle for the software subscription only, after B2 passes domain review, with a signed webhook that sets `clients.plan`. Services are invoiced directly. Prices in EUR. Remove "end of the cycle" and hide the admin MRR. Not required for the studio line, which is invoiced directly once B1–B3 are live | `lib/upgrade.ts`; new `app/api/billing/webhook/route.ts`; `lib/plans.ts:22, 38-111`; `app/pricing/page.tsx:33`; `lib/actions.ts:901-949` | 6–10 h, plus 5% + 50¢ per transaction | 2026-12-12 |

### (c) The 30/60/90-day sentence

The whole sentence is budgeted at **about 108.5 h with a hard cap of 110 h**, and the load is front-loaded:
- A1–A8 alone need 19–27 h by 2026-10-12, about 9.5–13.5 h/week in weeks 1–2 (§5a deadlines).
- The remaining ≈ 85 h run at ≈ 8 h/week over the following 11 weeks.
- The hard cap binds before the phase caps do (48 + 40 + 30 = 118 h), so an overrun in one phase comes out of the next.
- About 28 h (the A-orders) are owed to current clients whatever happens, and about 20.5 h (B1–B3) are needed before the studio line can be charged. The external resale test adds about 60 h.

The author keeps a timesheet, and any hour above the cap goes to billable client work.

| Window | Dates | Hours (budget / cap) | Build | Measure | Kill criterion (numeric, dated) | Stop |
|---|---|---|---|---|---|---|
| Days 1–30 | 2026-09-28 → 2026-10-28 | 44.5 h / 48 h | A1–A9, B1; daily canaries from 2026-10-14 | 9 of 9 A-orders live; 120 canaries stored, ≥ 98% notified; 0 false claims; 0 keyword drops and 0 unpaid-Gemini calls; 10 external discovery conversations; lead-line offers to ≥ 3 distinct existing clients | **2026-10-28.** *Studio:* A1, A2, A7 or A8 not live, any canary missing, or ≥ 3 of 120 notifications undelivered → KILL (archive; direct Resend). *External:* < 9 of 9 A-orders live or < 10 conversations → the external track ends | Selling to strangers, paid CTAs, `/compare` and SEO, MCP and agent work, AI chat, Brevo rotation, keyword drops |
| Days 31–60 | 2026-10-29 → 2026-11-27 | 36 h / 40 h | B2, B3; B4 only if the external track survives; the monthly lead report is sent by hand | Legal pages (200) and DPA under a named person; retention job has run; stranger path green; signed pilots (≥ €29/month) out of ≥ 15 conversations; distinct client businesses with a signed lead line | **2026-11-27.** *External:* < 3 signed pilots, legal pages or DPA not live, or stranger path not green → the external track ends and B5 is not built. *Studio:* < 2 distinct client businesses signed → maintenance-only (≤ 2 h/month) | Feature work outside B2–B4, French SEO, the MCP registry, mobile money, any reopening of self-serve |
| Days 61–90 | 2026-11-28 → 2026-12-27 | 28 h / 30 h | B5 (only if the 11-27 external gate passed), B6, pilot onboarding through the stranger path, first invoices, a decision memo | Agencies with cash received at ≥ €29/month; portal logins per paying agency; lead-loss incidents on paying accounts (target 0); distinct client businesses paying; December upkeep hours | **2026-12-27.** *External:* < 3 paying agencies, or a lead-loss incident unresolved for > 48 h → the external product ends. *Studio:* < 2 distinct client businesses paying (≥ 1 outside the existing multi-site client), or upkeep > 4 h → migrate and archive | Self-serve, SEO, the agent channel; no extension |

The bullets below give the detail.

**Days 1–30: protect the live clients and prove commitment** (2026-09-28 → 2026-10-28)
- **Hours:** 44.5 h budget, 48 h cap. That covers A1–A9 (28 h), B1 (1.5 h) and discovery (15 h). The Economist's rate is 50 contacts → 10 calls in 15 h (`02-economist.md:163`), so 10 conversations take about 15 h.
- **Build:** A1–A9 and B1, nothing else. From 2026-10-14, send one marked canary submission per client site per day through its own relay. Canaries are routed and exempted as A8 sets out.
- **Stop:** selling to strangers, paid CTAs, `/compare` and SEO pages, MCP and agent work, AI chat, Brevo rotation, keyword drops.
- **Measure:**
  - A-orders live in production (target 9 of 9).
  - Canaries: 8 sites × 15 days = 120, all stored, with at least 98% notified.
  - False claims live: 0.
  - Keyword drops and unpaid-Gemini calls: 0.
  - Discovery conversations logged with external agencies or freelancers that hand-code sites (not the agency the spec was written for, not the author's clients): target 10.
  - Lead-line offers made to ≥ 3 distinct existing clients.
- **Kill criterion, 2026-10-28:**
  - *Studio:* any of A1, A2, A7 or A8 (the orders that protect live leads) not live, any canary missing from `submissions`, or 3 or more of the 120 canary notifications not delivered. The client sites then move to direct Resend (the pattern the author already uses on another client site) and Inlet is archived.
  - *External:* fewer than 9 of 9 A-orders live, or fewer than 10 logged conversations. The external track then ends permanently.

**Days 31–60: become lawful to charge, and get signed demand** (2026-10-29 → 2026-11-27)
- **Hours:** 36 h budget, 40 h cap. That covers B2 (12 h), B3 (7 h), B4 (11 h, only if the external track survives) and selling (6 h).
- **Build:** B2, B3 and B4. The monthly lead report is sent manually from one SQL query, not built.
- **Stop:** feature work outside B2–B4, French SEO pages, the MCP registry, mobile money, and any reopening of self-serve.
- **Measure:**
  - Legal pages return 200 under a named legal person, and the DPA is published.
  - The retention job has run at least once.
  - The Playwright stranger path is green.
  - Signed external pilot orders (a written prepay commitment at ≥ €29/month) out of at least 15 logged conversations.
  - Distinct client businesses (not sites) with a signed paid lead line (≥ €10/site/month, direct invoice).
- **Kill criterion, 2026-11-27:**
  - *External:* fewer than 3 signed pilot orders at ≥ €29/month, or legal pages and DPA not live under a named person, or the stranger-path test not green. The external track then ends and B5 is not built.
  - *Studio:* fewer than 2 distinct client businesses (not sites) have signed a paid lead line. The relay-wired sites belong to one client, whose form destinations the author manages from one dashboard (◆ that client's site repository). Inlet then goes to maintenance-only (≤ 2 h/month).

**Days 61–90: collect money and decide** (2026-11-28 → 2026-12-27)
- **Hours:** 28 h budget, 30 h cap. That covers B5 (10 h), B6 (8 h), concierge onboarding of the signed pilots (7 h), and measurement plus a one-page decision memo (3 h).
- **Build:** B5 and B6. Onboard the pilots through the fixed stranger path, not the admin `'*'` path. Invoice the first payments.
- **Stop:** any work toward reopening self-serve, SEO or the agent channel. There is no extension of the window.
- **Measure:**
  - External agencies with **cash received** at ≥ €29/month list price.
  - End-client portal logins per paying agency in December.
  - Lead-loss incidents on paying accounts (target 0).
  - Distinct client businesses paying the lead line.
  - December upkeep hours.
- **Kill criterion, 2026-12-27:**
  - *External:* fewer than 3 external agencies have paid at ≥ €29/month, or any lead-loss incident on a paying account stayed unresolved for more than 48 h. The external product then ends permanently: public marketing is archived and pilots are wound down with data export.
    - With 3–4 paying agencies, continue concierge-only to 2027-03-27 with a target of ≥ 8.
    - Self-serve may reopen in Q1 2027 only with ≥ 5 paying agencies **and** ≥ €300/month.
  - *Studio:* the studio line continues only if ≥ 2 distinct client businesses pay it, at least one of them other than the existing multi-site client, and December upkeep is ≤ 4 h. Otherwise migrate to direct Resend and archive.

### (d) What to stop doing immediately

- Selling the $9/19/49 plans through `mailto:` to a personal Gmail (★ `lib/upgrade.ts:1-14`; ★ 3 `mailto:` links on live `/pricing`).
- Open self-serve signup for strangers whose forms cannot receive a browser submission (★ `schema.sql:23`; ★ `app/api/client/forms/route.ts:124-136`).
- The multi-account Brevo rotation (★ `lib/mailAccounts.ts:86-87`), which breaches §3.1 (https://www.brevo.com/legal/termsofuse/).
- Sending lead text to unpaid Gemini keys (★ `lib/spamClassifier.ts:32`), and the anonymous AI chat (★ `app/api/ai/chat/route.ts:32-37`).
- Dropping leads on keyword hits (★ `route.ts:554-580`) and writing permanent bans (★ `route.ts:402-405, 416-419`).
- Serving the unauthenticated `/api/download` (★ `app/api/download/route.ts:13-17`).
- Advertising "self-hosted", "Priority deliverability", "Unlimited AI", "2 minutes", 2FA on every plan, the false competitor rows and the Getform page (★ `lib/dictionaries.ts:64, 70, 91, 213, 242, 269`; `app/pricing/page.tsx:83`; https://forminit.com/pricing/).
- Emailing plaintext passwords and storing operator-readable ones (`lib/email.ts:257-261, 310-314`; ★ `lib/actions.ts:110-111, 142-150`).
- Building new surfaces (MCP, SEO, French pages, badge analytics, seats, integrations, WhatsApp, pricing v2, custom-domain portals) before the 2026-12-27 reading.
- Treating the admin "MRR" computed from hand-edited plans as revenue (`lib/actions.ts:901-949`).
- Naming any agency as customer #1, or any client as a case study, without that client's written consent.

---

## 6. Dissent

**The Prosecution's strongest point, for a clean KILL of every external ambition.** On priced labour every continuation scenario loses: even at the Defense's own 0.30, the return is $6.36/h over 24 months (§4), against the €38–43/h Codeur average for billable site work, an assumed outside rate (https://www.codeur.com/pages/quel-prix-site-vitrine). The friendly agency never adopted Inlet (N5), and the author himself chose direct Resend for a comparable site (N1). About 60 incremental test hours are worth less than 60 billable hours, and the window may only delay the inevitable (`01-prosecution.md:396-415`). The court keeps the test for two reasons. About 28 of the ordered hours are owed anyway to the clients whose leads already flow through Inlet, and about 20.5 more (B1–B3) are needed to charge them. The remainder buys a dated, falsifiable answer about a product whose ideal customer is the author himself.

**The Defense's strongest point, against even this much closure.** Demand was never tested: no stranger could have succeeded (`04-cross-examination.md:324`). Concierge B2B sales cycles can outrun a 90-day gate, and the category winner needed about 20 months for its first 20 payers (https://www.starterstory.com/web3forms-breakdown). The court accepts that risk of a false negative, because the author's default use of his time pays better.

**Minority opinion (operator, NARROW & CONTINUE).** The operator would keep the external product as the primary frame: an operator-run agency back-office with a paid-pilot test. On that view, the author's own sites are the proving ground, not the business. The court's orders adopt the operator's substance: compliance first, signed demand before build, and three gates. It differs only on the label. The court finds the change of buyer, billing unit and channel too large to call "narrowing".

---

## 7. What would change the ruling

**Toward KILL (archive Inlet; migrate the client sites to direct Resend):**
- Any A-order still unshipped on 2026-10-28 ends the external track (§5c). If the unshipped order is A1, A2, A7 or A8, the orders that protect live leads, it is a full KILL (§5c, studio criterion).
- A canary lost after the fixes. Inlet would then be less reliable than the author's own DIY route (◆ another client site's `api/contact.js`).
- Fewer than 2 distinct client businesses signed for the lead line by 2026-11-27 sends Inlet to maintenance-only (§5c). Fewer than 2 paying by 2026-12-27, at least one of them outside the existing multi-site client, is a KILL (§5c).
- Chain of title claimed by the organisation behind the commit email domain, or by the agency (`cahier_des_charges.md:1, 17`).
- Paddle rejecting the seller, with no lawful direct-invoicing route for software fees.

**Toward NARROW & CONTINUE with self-serve reopened:**
- By 2026-12-27, ≥ 5 external agencies paying ≥ €29/month, ≥ €300/month in total, and ≥ 30% of them creating end-client portals.
- Or the admin database showing latent stranger demand: external tenants with `CORS_NOT_ALLOWED` rows in `failures_log` (`lib/actions.ts:459-466`), or ≥ 2,000 organic visits a month in `pageviews` (`migrations/migration_v11_analytics.sql`).

**Toward the Defense's 0.30, i.e. $370 at month 12 (`04-cross-examination.md:299-301`):**
- A legal entity able to use Stripe or Paddle, plus a written 8–10 h/week calendar for 6 months.
- Measured French search volume (Search Console or a keyword planner) of several hundred searches a month for form-backend queries. That would revive the SEO channel (N21).

**Toward a different product:**
- If ≥ 50% of the client sites' inbound contacts arrive through `wa.me` rather than forms, the paid lead line must be WhatsApp alerts, not email plus a portal (N22; `schema.sql:26`).
- If pilots pay for the monthly lead report rather than the portal, Inlet becomes a lead-reporting add-on (`03-defense.md:245`).

**Toward a looser hour cap:**
- Evidence that the author's paid client demand is saturated, so that his marginal hour is worth less than €38–43.

---

## Clerk's note, entered after the ruling (2026-09-28)

This note is not part of the court's reasoning. It records what the author told the clerk after the verdict was filed, and how it relates to the orders above.

**The author's statement.** Inlet is meant to launch in several regions, including Europe and the US. The author's nationality and contact details are not relevant to the case, and have been removed from every file in this dossier.

**What it changes, and what it does not.**
- **The evidence does not change.** A multi-region public launch is the self-serve SaaS that §5(a) A5 withdraws until the gates in §5(c) are passed. Under §5(c), self-serve may reopen in Q1 2027 only with at least 5 paying agencies **and** at least €300/month. The statement is a goal, and the gates are how the court says it can be earned.
- **Payment rails widen.** With a legal entity registered in the EU or the US, Stripe becomes available as well as Paddle (N7, https://stripe.com/global). B2 (a named legal person) remains the prerequisite in every case.
- **Pricing and legal pages must follow the markets.** B6's "prices in EUR" becomes EUR for Europe and USD for the US. B2's GDPR Art. 28 DPA covers EU buyers. A US launch adds US-facing terms and privacy disclosures, which this record did not examine.
- **The positioning survives.** The court's external test targets agencies and freelancers who hand-code their clients' sites (§5c), wherever they are. The French-first wedge was the Defense's proposal, and the court already struck its "unoccupied" claim (rows 27–28).

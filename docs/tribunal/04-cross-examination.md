# 04 · Cross-examination

> Round 2 of *The Market v. Inlet*. After the three opening briefs were written blind, they were unsealed. The Prosecutor and the Advocate each attacked the other side and the Economist's figures, and each had to concede what the other had proved. The Economist, as a neutral witness, did not argue; the Judge weighs the challenges to its numbers.
> Both parties re-checked every citation they used on 2026-09-28. Neither submitted anything to the live service.
> Line references: "P-*n*" is line *n* of `01-prosecution.md`, and "E-*n*" is line *n* of `02-economist.md`.

## Clerk's note entered into the record

**The Prosecution's Count 2 is confirmed from the code.** Forms created through self-serve sign-up have an empty list of allowed origins, and customers have no screen to edit it:
- `app/api/client/forms/route.ts:124-134` inserts a form without `allowed_origins`;
- the schema default is `'{}'` (`migrations/schema.sql:23`), and no later migration changes it;
- the origin check rejects any browser request whose `Origin` is not on the list (`app/api/submit/[id]/route.ts:383-392`);
- the only function that edits the list, `updateFormOrigins` (`lib/actions.ts:363`), is reachable only from the admin panel.

The production database default could not be checked.

## What moved in this round

| Point | Before | After | Moved by |
|---|---|---|---|
| Count 2: self-serve forms return 403 | Fatal, code-level | **Conceded by the Defense.** The admin path defaults to `['*']` (`lib/actions.ts:312`); self-serve and MCP never copied it. That explains why the author's own setup worked and no stranger's could | Clerk + Defense |
| Count 3: email capacity sold beyond the pool | Fatal | **Severe.** Honest capacity costs $20–69/mo and every paid plan keeps a positive margin. The terms breach stands, and the author's own doc admits it | Prosecution, on the Economist's figures |
| Count 4: keyword filter drops real leads | Severe | **Conceded in full.** The Defense's re-run also drops a French lead asking for "SEO" | Defense |
| Count 8: an AI agent + Resend replaces Inlet | Severe | **Serious.** It replaces a single-site endpoint, not a multi-client portal | Prosecution, on the Economist's §5 |
| Counts 10, 12, 13 | as filed | **Narrowed.** Portals and API are really plan-gated; the security engineering is real; a solo founder *can* win this category | Prosecution |
| Defense Exhibit 2: "the only one that speaks French" | Claimed | **Contradicted.** Jotform has a French site, and Inlet's own self-serve forms send an English subject by default | Prosecution |
| Defense Exhibit 4: "five layers" of anti-spam | Claimed | **About three and a half.** Reverse DNS is inert and proof-of-work covers JSON only | Prosecution; Defense concedes |
| Defense Exhibit 5: agent install "done properly" | Claimed | **Falls.** MCP `create_form` has the same origins gap, and agent flows are common | Defense concedes |
| "No users" | Read as weak demand | **Reclassified as a broken funnel.** No stranger could ever have succeeded, so demand is untested, not refuted | Defense (both sides accept) |
| New gap nobody filed | none | **The agency's client never receives a lead email.** Only the tenant is notified (`route.ts:752-773`); the end-client must check the portal | Defense |
| Economist: probability-weighted MRR at month 12 | $215 | **Disputed.** Prosecution: about $54–59, applying the Economist's own no-commitment sensitivity. Defense: about $520–720 in the base case, if the author commits and does agency outreach | Both |
| Economist: white-label resale per site, 12-month value | ≈ $1,040 | **Disputed.** Prosecution: $290–420 after a continuity discount and a consistent price. Defense: ≈ $4,380 on lifetime value | Both |

**Where the parties now agree:**
- The only defensible wedge is the multi-client, white-label portal for agencies, not a generic form endpoint.
- Self-serve cannot be the first channel until a stranger's submission is proven to work in a real browser.
- Checkout, truthful copy, legitimate email and AI providers, and legal pages must come before any charge.

**Where they still disagree:**
- Whether the author's continued commitment should be priced in (the Prosecution) or treated as the author's own choice (the Defense).
- Whether the sentence should be "kill, with one 60-day relaunch test" or "continue concierge-first, with a 45-day fix deadline".

---

## ⚔️ The Prosecution cross-examines

> I re-checked every `file:line`, live URL and web source below on 2026-09-28. `route.ts` means `app/api/submit/[id]/route.ts`. Rule 4 still binds: I did not call the live download proxy or submit any form.

### 1. Against the Defense

**D1. "It is also the only one that speaks French." (Opening statement, 03-defense.md:10)**
This is **contradicted**, twice over.

- **Jotform speaks French.** `https://www.jotform.com/fr/pricing/` returns 200 with `lang="fr"` and 198 occurrences of "formulaire" (curl, 2026-09-28).
  - Jotform is the very product the spec was written to replace (`cahier_des_charges.md`), and Inlet has a compare page against it (`app/compare/[slug]/page.tsx:20`).
  - The Defense's "nine competitors" left Jotform out.
- **Inlet's own default is English.** Every self-serve form and every MCP-created form gets the subject `'Thanks — we received your message'` (`app/api/client/forms/route.ts:132`; `app/api/[transport]/route.ts:66`).
  - A non-empty custom subject overrides the language-aware default (`lib/email.ts:185-187`).
  - Tenants cannot edit that subject, because `updateFormSettings` requires the admin (`lib/actions.ts:328-337`).
  - The documented helper defaults to `lang = "en"` (`app/docs/page.tsx:26`; `lib/agentDocs.ts:7`).
  - So the Defense's own nightmare, *"An English auto-reply … on a French bakery's website is a visible defect"*, is exactly what Inlet sends out of the box.

**D2. "The wedge is unoccupied … No competitor pricing page I read offers branded, per-client login portals." (:15)**
This is **overstated**, and the Defense's own exhibit contradicts it.

- **Agency Label**, which the Defense cites, offers exactly this: *"Each client gets a record, their sites, their forms, and a portal branded entirely as your agency."* It also advertises *"Every form fill from their site, in one place"*, and *"The free tier has no client cap"* (https://agencylabel.com/platform/clients).
- **Statpio's** white-label hosting advertises that *"Clients can view … review form submissions, and export leads to CSV"* (https://statpio.com/blog/static-website-hosting/top-ways-to-host-and-white-label-websites-for-agency-clients).

The niche is only "unoccupied" if you look only at form *endpoints*.

**D3. Exhibit 1: the portal is "real and already built". (:24-35)**
The engineering is real, but **no self-serve user can reach it today.**

- Free has `clientPortals: false` (`lib/plans.ts:54`), and creating a portal user returns **402** "Client portals start on the Solo plan" (`app/api/client/portal-users/route.ts:59-63`).
- Solo cannot be bought (Count 1).
- The invitation email the end-client *would* receive links to `https://logiciel-formulaire.vercel.app/portal/login` (`emails/PortalUserWelcome.tsx:109`), which returns **404**. The Defense itself admits this (A9).
- The flagship is therefore unbuyable and, once bought, un-onboardable.

**D4. Exhibit 3: "The lead is treated as sacred … Storage comes first." (:72-75)**
This is **misleading.** Three gates run *before* storage and throw leads away while reporting success or failure to the visitor:

| Gate | What happens | Where |
|---|---|---|
| Keyword filter | Lead discarded, visitor told "success" | `route.ts:554-580` |
| Honeypot | Fake success, permanent ban | `route.ts:487-535` |
| CORS default `'{}'` | Visitor gets a 403; confirmed by the clerk | `route.ts:383-392` |

Two more defects:
- A standard `<input type=file>` becomes the text `"[object File]"` (`route.ts:451-454`).
- Attachment links in lead emails fall back to the dead domain: `process.env.NEXT_PUBLIC_APP_URL || 'https://logiciel-formulaire.vercel.app'` (`emails/LeadNotification.tsx:152`). That variable is referenced nowhere else and is not documented, so it is probably unset **[UNVERIFIED env]**.

**D5. Exhibit 4: "Reverse-DNS blocking of VPN and hosting hosts" (:96).**
**Contradicted by the lines the Defense cites.**

- `HOSTING_KEYWORDS` only chooses the reason string (`lib/dnsLookup.ts:60-61`).
- A submission is blocked only when the exact PTR hostname is already on the blacklist (`route.ts:320-321`; `lib/blacklist.ts:10`).
- Proof-of-work is skipped for anything that isn't JSON (`route.ts:637`), and the agent docs admit it (`lib/agentDocs.ts:7`).

It is not five layers.

**D6. Exhibit 2: "Native-form error pages carry French-first labels" (:60).**
**These pages are unreachable in a browser.** Browsers send `Origin` on cross-origin POSTs (MDN, https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Origin). Whenever `Origin` is present, `createErrorResponse` returns JSON (`route.ts:144`). The French HTML page renders only for clients like curl.

**D7. Exhibit 6: "Row-level security, deny by default, on 15 tables". (:132)**
This is **true but irrelevant to tenant isolation.** The migration itself says *"The app uses the service_role key, which BYPASSES RLS"* (`migrations/migration_v19_data_security.sql:7`).

- Isolation between tenants rests entirely on app code.
- The operator's `getSubmissions` still reads every tenant's leads (`lib/actions.ts:409-417`).
- RLS only protects against a leaked anon key.

**D8. Exhibit 7: "The first customer (the agency) and the first case studies (its client sites) already exist." (:157)**
**Unsupported.**

- The Economist found *"no public evidence of any external user"* (02-economist.md §5).
- The agency-era deployment `logiciel-formulaire.vercel.app` is **404**. It is still the documented form `action` in `README.md:162`, so any client site wired by the README now posts into a 404 **[INFERENCE]**.
- That the author *owns* the agency is assumed. The spec speaks of an internal tool and "le stagiaire" (`cahier_des_charges.md`). Customer #1 of the Defense's plan is unproven.

**D9. The chosen positioning: "The lead back-office for French-speaking web agencies" (:202-203).**
**The code penalises the very ICP it names.** The ideal customer profile is "2–10 person agency" (:214). Five problems:

1. **No team seats.** Each account is capped at 3 devices, and the oldest session is evicted and logged as *"Possible account sharing"* (`lib/clientSessions.ts:12, 44`). A 4-person agency trips an anti-fraud rule by working normally.
2. **Tenants can't configure their own forms.** Origins, success URL and auto-reply text are admin-only (`lib/actions.ts:328-372`), and none of the Defense's moves 1–6 fixes that (its move 8 adds `add_allowed_origin` only for MCP, on day 31–60).
3. **Most showcase sites already have forms.** WordPress runs 40.2% of sites and only 31.5% use no CMS (Economist S18). Those sites already have form entries in their own admin.
4. **The Africa leg doesn't price.** The proposed "Agence €29" monthly is **10–38%** of the *whole* price of a Cameroonian showcase site (€76–305, Economist S20) *every month*: €29/€305 = 9.5%; €29/€76 = 38%.
5. **The 30-day plan doesn't fit the stated time budget.** Moves 1–6 cost 2–3 h + 2–3 h + 4–6 h + 1 day + 1–2 days + 2 days. That is 8–12 h plus 4–5 days, or **≈ 40–52 h** at 8 h/day. The budget is "about 10 focused hours a week" (:257), which is ~43 h in 30 days. The plan uses the entire time budget before one sales call, and leaves out the CORS fix, tenant settings and seats.
6. **The day-90 target is optimistic.** It is 10 paying agencies, or 3.3 per month. Web3Forms, the category's best indie, needed "20 paying customers in 20 months", with a free tier 5× larger (250 vs 50) and SEO as its channel (https://www.starterstory.com/web3forms-breakdown).

**D10. A5: "Agents tend to provision hosted services rather than rebuild them: 80% of Neon databases were created by agents."**
**This analogy fails for Inlet.**

- Neon is stateful infrastructure that an agent *finds*. Inlet is not indexed (my Count 9).
- Inlet's MCP returns *"plan does not include API/MCP access"* to Free users (`app/api/[transport]/route.ts:159-170`), and no plan can be bought.
- An agent cannot provision what it cannot find or pay for.

### 2. Against the Economist

**E1. The Base case probability (30%) is too generous by the Economist's own rule.** Its Sensitivity #3 says: *"Without that commitment, the bear probability rises from 60% to about 90%, and the probability-weighted MRR falls below $50."*

- The record contains no commitment, only **0 commits in 51 days** and **no checkout 84 days after the first commit** (2026-07-06 → 2026-09-28).
- Applying the Economist's own conditional, and keeping its 3:1 base-to-bull ratio, gives 90 / 7.5 / 2.5:
  - Month 12: 0.9 × 7 + 0.075 × 254 + 0.025 × 1,341 = 6.3 + 19.1 + 33.5 = **$59** (vs $215).
  - Month 24: 0.9 × 11 + 0.075 × 781 + 0.025 × 3,929 = 9.9 + 58.6 + 98.2 = **$167** (vs $634).

**E2. The Base case pace beats the category winner.**
- The Base case has 15.3 + 1.3 = **16.6 customers at month 12**.
- Web3Forms reached 20 in 20 months, or **≈12 by month 12** if linear **[INFERENCE]**, with 5× the free tier.
- Scaling the Base case to Web3Forms' pace: $254 × 12/16.6 = **$184**.
- Combined with E1, month 12 is 6.3 + 0.075 × 184 + 33.5 = **≈ $54 MRR**.

**E3. The Base case's "what must be true" list is incomplete.** Its visitor→paid rate of 0.10% assumes a funnel that works. The code says self-serve submissions fail CORS (clerk-confirmed), portal invitations go to a 404, and the keyword filter eats leads. These are cheap fixes, but none of them was on anyone's list except this Prosecution's.

**E4. "Done-for-you lead capture", EV ≈ €900 (ranked #1), measures the wrong thing.**
- **It is not Inlet's value.** It is the revenue of a *service* the agency could deliver on Web3Forms' free tier or Agency Label's free tier. The portion attributable to Inlet is the fees avoided, which the Economist's own §5 puts at **$0–180/yr** (Formspree Business only at the top end).
- **It prices an unproven buyer.** A Cameroonian small business paying a *monthly* fee for a web form is untested, and the Economist itself notes leads there are "WhatsApp-first" (FormsReach: **$2 all-time**).
- **Its probability is unstated.** Nothing justifies the 50%.
- **Corrected incremental EV to "keep building Inlet": ≈ $90/yr** (midpoint of $0–180). This model needs no further building, which supports the Prosecution's sentence, not the SaaS.

**E5. "White-label per site", EV ≈ $1,040, needs two corrections.**
1. **Apply the continuity haircut.** The model needs checkout, a DPA and a domain, all of which require the author to resume. That has a probability of 40% (base + bull) in the Economist's own scenarios. So 0.4 × $1,040 = **$416**.
2. **Use a consistent price.** The Economist uses $49 ARPA, above the Defense's proposed €29 (≈ $33 at €1 = $1.1403). At $33, the success branch is 10 × $33 × 5.5 = $1,815, and the EV is 0.4 × (0.35 × 1,815 + 0.65 × 150) = 0.4 × 732.8 = **≈ $293**.

Corrected range: **$290–420**, against the Economist's own "(g) portfolio asset: €3–4.5k" (also **[UNVERIFIED]**).

**E6. Where the Economist was right against me.** Its cost-to-serve table (§2.2) holds, as does "E5 costs one to four Pro subscriptions a month to fix". I accept both (see Concessions).

### 3. Concessions

| My count | Change | Why |
|---|---|---|
| **Count 3** (email capacity) | **Fatal → Severe** | The Economist shows honest capacity costs $20–69/mo, with a positive gross margin on every paid plan even at full use (02-economist.md §2.2–2.3). It is a sequencing and terms-of-service breach, not an economic impossibility. The breach itself stands, and all three parties now quote Brevo §3.1. |
| **Count 8** (AI substitute) | **Severe → Serious** | The Economist is right that *"the substitute kills the one-site use case but not the many-client-sites use case"* (§5). Web3Forms' verified $40,549 MRR (https://trustmrr.com/startup/web3forms) and Tally's growth show the category is growing as agents spread. The count stands against the *endpoint* positioning Inlet sells today, not against a portal product. |
| **Count 10** (paid tiers) | **Narrowed** | I overstated "only unlimited forms and the white-label footer". Portals (Solo 3 / Pro 25) and API/MCP are really plan-gated (`app/api/client/portal-users/route.ts:59-87`; `app/api/[transport]/route.ts:159`). The bundle price is below incumbents' comparable gating (Economist §1.1). What remains: the phantom bullets (priority deliverability, retention, DKIM), the open relay, and no seats. |
| **Count 12** (trust) | **Narrowed** | The security engineering is genuinely above side-project norms: RLS, scrypt, AES-256-GCM, hashed API keys, signed webhooks and a fail-fast secret check (Defense Exhibit 6). My charge is now limited to what a *buyer can see*. |
| **Count 13** (founder signal) | **Narrowed** | Web3Forms proves a solo late entrant can win this category. The charge is now this founder's cadence, not "one person can't". |
| **Count 9** (discovery) | **Withdrawn in part** | I withdraw "French by default" as a *sales-killer* for Francophone buyers, since it is deliberate. It still costs the English market Inlet prices for, in USD. |
| **Count 1** (no checkout) | **Stays Fatal today** | I accept it is curable in about 2 days plus Paddle approval, at 5% + 50¢ (Defense A1; Economist §6). |
| **Count 2** (CORS dead-end) | **Stands; I note it is cheap** | Clerk-confirmed. It is a one-line default plus one settings field. Its weight is what it reveals: the self-serve path was never exercised in a real browser. |

### 4. New evidence found in their briefs (re-verified)

1. **Dead agency-era domain throughout the customer surface.**
   - `emails/ClientWelcome.tsx:107`, `emails/PortalUserWelcome.tsx:109` and `README.md:162` all point to `logiciel-formulaire.vercel.app`, which returns **404** on both `/` and `/portal/login` (curl, 2026-09-28).
   - `emails/LeadNotification.tsx:152` falls back to it for every attachment link.
   - This strengthens **Counts 2 and 11**.
2. **An unauthenticated open proxy on Inlet's own domain.** `app/api/download/route.ts:13` allows any URL that merely *contains* `supabase.co/storage`, fetches it (`:17`), and serves it with `Content-Disposition: attachment` and the upstream content type (`:31-35`). Any file on the internet can be delivered as a download from `inlett.vercel.app` (code-level only; not exercised). This strengthens **Count 6**.
3. **The flagship features are sold but cannot be bought.** Portals (`lib/plans.ts:54`; `app/api/client/portal-users/route.ts:59-63`) and MCP/API (`app/api/[transport]/route.ts:159-170`; `app/api/client/keys/route.ts`, 402) sit behind plans with no checkout. This strengthens **Count 1**: the Defense's Exhibits 1 and 5 are currently usable by nobody who isn't the operator.
4. **The demo copy contradicts itself.** `lib/dictionaries.ts:178` says *"This is the real pipeline … running in your browser"*, while `:196` says *"Interactive simulation … nothing you type here is sent or stored."* I had treated the footnote as exculpatory; the Defense is right that the subtitle is false. This is added to **Count 5**.
5. **The author's README already warned against this sender setup.** `README-english.md:81` says a custom domain is needed for a verifiable sender, yet production sends from a gmail.com address (commit `488f4a4`). This strengthens **Count 3**.
6. **"Unlimited AI" is uncapped.** Its only guard is 30 messages per minute (`app/api/ai/chat/route.ts:12, 82-91`), and over-quota submissions are still AI-classified before the quota check (`route.ts:699-705` vs `:737`; Economist §2.2). This strengthens the abuse strand of **Count 10**.
7. **The Vercel Hobby commercial-use ban** is cited by all three parties. Both the Defense's and the Economist's cost tables budget Vercel Pro and Supabase Pro, which implicitly concedes the current stack is not a legitimate commercial stack. The actual plan remains **[UNVERIFIED]**.

### 5. Revised requested sentence

Cross-examination tested both briefs. The Defense built its case on a portal no self-serve user can reach. Its "French-first" claim fails against Jotform and against Inlet's own English default. Its 30-day plan consumes the whole time budget before a single sale. The Economist's upside survives only if the author resumes, which its own sensitivity analysis says is unlikely without a commitment the record does not contain; applied honestly, the probability-weighted value falls to about $54–59 MRR at month 12. I concede that cost is not the problem (Count 3 is downgraded) and that the multi-client portal is a real, defensible idea (Count 8 is downgraded).

The Prosecution therefore asks the Court to **KILL the public self-serve SaaS as currently sold**:
- withdraw the paid plans and every false claim within 7 days;
- return the code to what `cahier_des_charges.md` asked for, the agency's internal tool.

Any relaunch as an agency-portal product should be allowed only as **one 60-day test, without extension**, and only after:
- a real checkout;
- the CORS self-serve fix;
- the keyword filter no longer dropping leads;
- truthful copy;
- a privacy policy and DPA.

The pass mark is the Economist's own: **5 or more paying external accounts at day 60**. Anything less makes the kill final.

---

## 🛡️ The Defense cross-examines

> Everything below was re-checked on 2026-09-28 against the repository and by running scripts (scratchpad: `seo_test.mjs`, `pow_test.mjs`). The rules of evidence in `00-case-file.md` still bind. "P-" refers to lines of `01-prosecution.md` and "E-" to lines of `02-economist.md`.

### 1. Against the Prosecution

**Count 2: self-serve forms get a 403. Verdict: CONCEDE the facts. CONTEST only how severe the fix is.**

The facts stand. Self-serve creation inserts no origins (`app/api/client/forms/route.ts:124-134`). The default is `'{}'` (`migrations/schema.sql:23`), and no migration changes it (`grep allowed_origins migrations/` finds only that line). The CORS check rejects any origin not on the list. No client-side screen can edit the list; the only one is the admin's `updateFormOrigins` (`lib/actions.ts:363`).

I add two facts the Prosecution missed. They sharpen the count but also shrink the fix:
1. **The admin path defaults to a wildcard.** `createForm` writes `allowed_origins: allowedOrigins.length > 0 ? allowedOrigins : ['*']` (`lib/actions.ts:312`). Forms the author created as admin therefore worked. The self-serve route simply never copied that default. **That explains why the author's own dogfooding succeeded while strangers could not.**
2. **MCP `create_form` has the same gap** (`app/api/[transport]/route.ts:58-68`). My own Exhibit 5 is weaker than I argued (see §3).

The 403 part is a one-line fix: add `allowed_origins: ['*']` at `route.ts:126-134` and in the MCP insert, mirroring `lib/actions.ts:312`. The proper version (ask for the site URL at creation, plus a tenant-side origins editor) is about half a day.

The Prosecution's sub-point on plain HTML forms is also correct. Browsers send `Origin` on form POSTs, and `route.ts:834-837` answers any request carrying `Origin` with JSON, so the no-JS redirect never runs. Fix: treat `sec-fetch-mode: navigate` as a native submit and redirect it (about 15 minutes).

"FATAL" correctly describes the funnel as it has run until today. It does not describe the business, because the cure costs hours.

**Count 4: "Seo" is dropped. Verdict: CONCEDE fully. No overreach.**

I re-ran the exact filter from `route.ts:554-566`:
- Dropped: "Seo-yeon Kim", "studio based in Seoul", `ana@museodelprado.es`, `joseortiz@gmail.com`, English "investment property".
- Also dropped, and worse for my own positioning: a **French lead asking for "SEO" for a bakery website**.
- Passed: a plain French quote request, and French "investissement locatif".

The test proves exactly what it claims. Fix: record the keyword hit as a `suspect` label and keep the lead (about 1 hour).

**Count 3: sold capacity, Brevo rotation. Verdict: CONCEDE, and it is worse than I wrote, because the author's own doc admits the problem.**

The repo's own doc says multi-account rotation "violates most providers' terms (Brevo included)" (`docs/adding-email-accounts.md:112-115`). The code shipped it anyway, and the pricing page sells it as "Priority deliverability". That damages good faith, not just operations.

On severity I CONTEST "fatal". The Economist computes the honest fix at **$20–69/month, "one to four Pro subscriptions"** (E-104-120). It is a sequencing error, fixable in about a day.

**Count 8: "An AI agent plus Resend replaces the core product in one sitting" (P-201). Verdict: CONTEST for agencies, CONCEDE for single sites.**

1. **Resend itself requires domain setup.** Its docs say: "You must add and verify at least one domain to send emails with Resend" ([resend.com/docs/dashboard/domains/introduction](https://resend.com/docs/dashboard/domains/introduction)). For an agency with 20 client sites, the "one sitting" becomes DNS work per client domain (or one shared agency domain). It still has no storage, no inbox across sites, no spam triage and no client portal.
2. **The neutral witness disagrees with the Prosecution:** "The substitute kills the one-site use case but not the many-client-sites use case" (E-228).
3. **The "92 of 109 commits" argument.** The fact is **verified**: 92 of the 109 commits authored by `Eddy-etame` carry `Co-Authored-By: Claude` (`git log --author=Eddy-etame`). The inference fails. With an AI agent, the multi-tenant product still took **19 days and 107 commits**, which is the opposite of "one sitting". What the fact does prove is that **code is not a moat**. I concede that. Any moat must come from relationships, trust and presence in the French-speaking market.

The Prosecution also states that Formspree "ships a one-prompt agent setup flow" (P-208). **Verified:** formspree.io/ai offers a "claim URL" flow (a link that creates the form after the user signs in, with no password or API key). The agent install surface is common; I concede that in §3.

**Count 7: proof-of-work costs about 5.8 s (P-187). Verdict: CONCEDE the substance. The number is slightly high.**

I ran the documented browser loop in Node on the same class of CPU (2.1 GHz Xeon):

| Measure | Result |
|---|---|
| Time per hash | 58.4 µs |
| Expected mean solve | 65,536 hashes → **3.8 s** |
| Median solve | 2.65 s |
| 95th percentile | 11.5 s |
| Observed, 12 solves | 0.3 s to **18.8 s** |
| Native hashing (what a bot would use) | 2.1 µs/hash → 0.14 s |

At the Prosecution's own 71 µs per hash the expected mean is 4.65 s, so "~5.8 s" is small-sample noise on a heavy-tailed distribution. The substance stands:
- It takes seconds, not "~a blink" (`app/docs/page.tsx:30`) and not "~1–3 s" (`lib/pow.ts:32`).
- It costs a human about **28 times** more than a bot with native hashing.

Two concessions I owe from my own brief:
- The Prosecution is right that the reverse-DNS layer is inert. It bans only exact PTR strings (the IP's reverse-DNS hostname) already on the blacklist (`route.ts:320-321`; the keywords only choose a label, `lib/dnsLookup.ts:60-62`).
- Proof-of-work covers JSON submissions only (`route.ts:637`), so a bot can skip it.

My Exhibit 4 ("five layers") was overstated. Fix: start solving on the first keystroke (people take far longer than 4 s to fill a form, and the challenge stays valid for 5 minutes, `lib/pow.ts:49`), or drop to difficulty 3 (0.24 s). Add ban expiry either way.

**Count 10: price per 1,000 submissions. Verdict: CONTEST the yardstick.**

The yardstick is wrong for the only segment that matters. The Economist: "The value unit is the client site" (E-42), and the email caps are "a *supplier* constraint, not a value metric" (E-49).

I CONCEDE the hidden open-relay risk. Signup needs no email verification (`app/api/auth/client-signup/route.ts`), and auto-replies are on by default for Free. Fix: reuse the existing OTP code (`lib/otp.ts`) to verify at signup, and keep auto-replies off until verified (2 hours).

**Count 9: the "Powered by" loop reaches the wrong people. Verdict: partly CONTEST.**

Tally's badge is also shown to form *respondents* rather than buyers, and its founders call that loop "mainly product led" growth, on the way to $6M ARR (Defense Exhibit 8 source). Reaching non-buyers does not disqualify a badge loop; its yield is what matters. I accept the Economist's near-zero yield estimate at current scale (E-167).

I CONCEDE the locale bug. French is served to Germany, Brazil and elsewhere (`lib/i18n.ts:14-21`). Fix: switch to a list of French-speaking countries and honour `Accept-Language` (15 minutes).

**CONCEDE outright:**
- Count 1 (no checkout; the Prosecution's own mitigation notes Paddle accepts sellers in Cameroon).
- Count 5 (false claims, plus wrong competitor rows).
- Count 6 (legal vacuum; the Gemini "Unpaid Services" personal-data clause is the stronger AI charge, and I adopt it).
- Count 11 (`[object File]` uploads; French auto-replies by default; fire-and-forget emails without `after()`, whose Next.js 16 applicability is **[FROM MEMORY]**).
- Count 12 (plaintext temporary passwords).
- Count 13 (activity spent in the wrong places).

### 2. Against the Economist

**(a) The 60% bear case mixes two questions.** The bear case is defined by the *author* not resuming (E-180), and the Economist's own sensitivity #3 puts the bear at ~90% without commitment (E-281). Write P(commit) = c and assume a market-failure rate *given* effort of about 30%. Then 60% = c × 0.30 + (1 − c) × 0.90, so **c ≈ 0.5**.

The Court is ruling on "should he keep building?", a choice the author makes. The decision-relevant figure is **P(bear | commits) ≈ 25–35%**. The unconditional 60% is a fair forecast, but the wrong input for this ruling. (The trial itself produced commits on 2026-09-28. I give that almost no weight: reviewing is not building.)

**(b) The base case ignores the Economist's own best channel.** He prices direct agency outreach at "50 contacts → 10 calls → 2 paying at $49" with LTV/CAC ≈ 11 (E-163), yet books only "2 network Pro customers in month 3" (E-182).

Recomputed at **half** his own conversion rate, with 4 of the 10 weekly hours spent on outreach:
- 17.3 h/month ÷ 15 h × 2 × 0.5 = **1.15 agencies/month**, from month 3.
- After 10 months at 3% churn: 1.15 × (1 − 0.97¹⁰) ÷ 0.03 ≈ **10 agencies**.
- At $29–49 each, that is **$290–490 MRR**, plus his self-serve ≈ $230.

**Corrected base case at month 12: ≈ $520–720 MRR**, against his $254. It is still a side income, not a startup, but it clears the ≈ $66/month fixed cost several times over.

**(c) The 0.10% visitor-to-paid rate is fair for self-serve, and on one point too generous.** It matches Web3Forms at 0.12% (E-135). But the Economist assumed **35% activation** (E-132) without knowing Count 2: until that fix ships, self-serve activation is **0%**. The fix therefore gates every non-bear scenario, including his.

**(d) The captive value is roughly right, and I concede it.** His $0 floor is slightly too low. None of the checked free tiers includes auto-responders, which the agency uses (Formspree: Professional; Basin: Growth; Web3Forms: Pro). The cheapest plan meeting the agency's spec (auto-replies branded per client) is Basin Growth at $24.17 × 12 = **$290/yr** (Basin lists "Branded emails (logo & colors)" on Growth; whether branding can differ per form is **[UNVERIFIED]**). Corrected fees avoided: $290–1,080. After $240–540 of hosting, the net is **−$250 to +$840**, midpoint ≈ +$300 against his +$270. **The captive case is not a reason to continue**, and I do not argue that it is.

**(e) The agency segment was priced on the wrong metric.** A 12-month cumulative-cash EV structurally undervalues recurring revenue compared with a service (c) or a one-off gig (g). On a lifetime basis, using his own inputs:
- 10 agencies × ($49 × 75% ÷ 3%) = $12,250.
- EV = 0.35 × $12,250 + 0.65 × $150 ≈ **$4,380**, against his **$1,040** (E-239).

That is on par with or above the portfolio option (g), €3–4.5k (E-244). The options also stack: (c) runs on the same engine as (d), and (g) is worth more with paying users.

### 3. Concessions: what the Prosecution proved

1. **Nobody outside could have succeeded, so "no users" tells us nothing about demand.** If production matches the repo, no stranger's browser submission could ever succeed, whether through the JS helper, the plain HTML form or an MCP-created form. The absence of external users is therefore **a broken-funnel signal, not a demand signal: demand is untested, not refuted.** That cuts both ways. I cannot cite demand either.
   - It also means the testimonial "Up and running in two minutes… it just worked" (`lib/dictionaries.ts:155`) can only describe an admin-assisted setup.
   - Nobody tested the path a stranger takes end to end, which is itself evidence against the author's go-to-market discipline (P-313).
2. **My Exhibit 5 ("done properly") falls.** The agent docs are good, but the product beneath them failed the first submission (MCP `create_form`, `app/api/[transport]/route.ts:58-68`), and an agent flow is common (Formspree's claim URL, Formcarry and splitforms MCP).
3. **My Exhibit 4 falls to "three and a half layers".** The reverse-DNS layer is inert and proof-of-work is JSON-only (above).
4. **A gap neither brief raised, and it hurts my positioning.** The submit route never reads `portal_users` (`grep portal_user route.ts` is empty). Lead emails go only to the tenant's own address (`route.ts:752-773`), so **the agency's client, the business owner, gets no alert**, only a portal to check. Fix: also notify the assigned end-client (2 hours).
5. **Good faith.** The Brevo rotation shipped despite the author's own written warning (`docs/adding-email-accounts.md:112-115`).

**Does the positioning survive? Yes. All three parties converge on the same wedge:**
- The Prosecution: "The one true differentiator is buried under a false one. That differentiator is multi-client white-label portals" (P-147).
- The Economist: "The substitute kills the one-site use case but not the many-client-sites use case" (E-228), and he ranks done-for-you service (c) and per-site agency resale (d) first and second.

What does not survive is **self-serve as the first channel**.

### 4. Revised position

**Positioning:** a *concierge-first* lead back-office for French-speaking web agencies. Onboard the first 10 agencies directly through the path that works (admin-created forms default to `'*'`, `lib/actions.ts:312`), priced per client site. Self-serve reopens only when a browser test of a stranger's path passes.

**Three fixes that must ship first (≈ 50–60 hours, i.e. 4–6 weeks at 10 h/week):**

1. **Make a stranger succeed.**
   - Origins at creation: `app/api/client/forms/route.ts:126-134` and `app/api/[transport]/route.ts:58-68`.
   - A tenant PATCH for origins, auto-reply and success URL (new `app/api/client/forms/[id]/route.ts` with a `client_id` ownership check), with UI in `components/client/FormDashboardClient.tsx`.
   - Native-submit redirect: `route.ts:834-837`.
   - Label instead of drop: `route.ts:550-580`.
   - `after()` around sends: `route.ts:769, 805`.
   - Notify the end-client: `route.ts:752-773`.
   - Fix the dead links: `emails/PortalUserWelcome.tsx:109`, `emails/ClientWelcome.tsx:107`.
   - **One Playwright test**: sign up, create a form, submit from a foreign origin. This is the test that would have caught Count 2.
2. **Legitimate delivery and data.**
   - One paid email provider on a custom domain, replacing `lib/mailAccounts.ts` and `lib/email.ts:44-94`.
   - A paid Gemini key: `lib/ai.ts:87-94`.
   - Signup verification with `lib/otp.ts`.
   - Ban expiry: `lib/blacklist.ts:28`.
   - A private uploads bucket with signed URLs.
   - Cost: ≈ $20–45/month.
3. **Money and truth.**
   - Paddle checkout replacing `lib/upgrade.ts`, with `app/api/billing/webhook`.
   - Legal pages and a data-processing agreement (DPA).
   - Remove "self-hosted", "SMTP rotation", "unlimited AI" and "2 minutes" (the last until the browser test passes).

**Updated odds** (my brief said 30–45%, assuming moves 1–6 shipped within 30 days):

| Outcome | Revised estimate |
|---|---|
| ≥5 paying external agencies by day 90 after checkout, **if the author commits ~10 h/week** | **25–35%**. Lower, because the fix list roughly doubled and demand is now known to be untested |
| The same, **unconditional** (c ≈ 0.5) | **≈ 15%** |
| MRR ≥ $1k at month 12, given commitment | **15–20%**, consistent with the Economist's unconditional ≈ 8% |

My concession conditions are unchanged. One is added: **if the three fixes are not shipped within 45 days, the Defense rests and concedes.**

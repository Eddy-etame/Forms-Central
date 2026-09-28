# 03 · The Defense

> **Seat:** Advocate ("The Believer"). **Written blind**: I read only `00-case-file.md` in this folder.
> **Checked on 2026-09-28:** every `file:line` below against the working tree. Live site: GET requests only, with no sign-up, no form submission and no email sent. Web sources were fetched on 2026-09-28 unless marked otherwise. I also ran the repo's pure unit suite (`npm run test:unit`): **61 checks passed, 0 failed** (19 + 8 + 10 + 11 + 13 across mail accounts, security config, OTP, crypto and spam core).

---

## Opening statement

**Inlet deserves to exist because it is the only form backend I could find that is built for the way small web agencies actually work: many client sites, one operator, and clients who want to see their own leads. It is also the only one that speaks French.**

My thesis has three parts:

1. **The product core is real, and it has an unusual shape.** Most form backends are built for one developer with one site. Inlet's data model, emails, portal and plan limits are built for an agency with N clients. That shape costs real work to build, and it is already built (Exhibits 1 and 3).
2. **The wedge is unoccupied.** I requested nine competitor homepages in French. All nine are English-only (Exhibit 2). No competitor pricing page I read offers branded, per-client login portals that show each client only their own leads, at anything near $19.
3. **Everything the Prosecution will win on is operational, not structural.** Checkout, email capacity, false copy, domain and legal pages can each be fixed in hours or days, and the fixes are cheap. I show the fix, the cost and the arithmetic for each. Where a charge is true I concede it without hedging.

What I do **not** claim: that Inlet has traction (it has none on record), that its MCP server or `llms.txt` is a moat (it is not), or that the horizontal "form endpoint" market is open (it is crowded).

---

## 1. Exhibits of strength (strongest first)

### Exhibit 1: The agency-shaped multi-tenancy is real and already built

**Every lead email, auto-reply and portal page carries the end-client's brand, each end-client gets a login that shows only their own leads, and the developer never sees their password.**

Evidence:
- **One query carries each tenant's brand.** The submit pipeline loads the tenant's name, logo, color, font, plan, sender name and reply-to in a single query: `app/api/submit/[id]/route.ts:337`. It applies them to both emails at `:756-763` and `:784-797`.
- **The auto-reply is signed as the client.** It renders the client's logo or name and signs "L'équipe {clientName}": `emails/AutoReply.tsx:37-42`, `:57-61`, `:75`.
- **White-label portal with a hard isolation boundary.** The portal shell shows the developer's brand name, logo and accent color: `app/portal/(protected)/layout.tsx:10-28`. The Inlet byline appears only on plans without white-label: `:54-60`. The leads API returns submissions **only** for forms assigned to that portal user: `app/api/portal/leads/route.ts:9-20`.
- **Assignment is double-checked.** Assigning a form to a portal user verifies that the form and the portal user both belong to the same developer: `app/api/client/portal-users/assign/route.ts:29, 40, 46`.
- **The developer never learns the end-client's password.** A random password is generated, hashed and emailed straight to the end-client under the developer's brand: `app/api/client/portal-users/route.ts:89-119` (comment at `:105-106`).
- **Plan limits are enforced server-side.** End-client limits return HTTP 402 with an upgrade path: `app/api/client/portal-users/route.ts:59-87`. The tiers (Solo 3, Pro 25, Max unlimited) are in `lib/plans.ts:73, 91, 109`.
- **Portal login is hardened.** It is rate-limited, reads credentials through a SECURITY DEFINER function and sets an httpOnly cookie: `app/api/portal/login/route.ts:23, 31, 55`.

**Why a buyer cares.** An agency that builds showcase sites ("sites vitrines") for 20 small businesses has one recurring question from each client: *"Is my website bringing me anything?"* A branded login where the client sees their own leads answers it, without the agency forwarding emails by hand. The code's own onboarding copy states that pain: "My clients check their own leads now. I stopped losing hours forwarding every message to them." (`lib/dictionaries.ts:156`). That quote is an anonymous testimonial, so I treat it as the author's hypothesis, not as proof.

**How rare it is (checked on 2026-09-28):**

| Service | Closest analogue to per-client portals | Price for that capability |
|---|---|---|
| Formspree | "Linked emails"; white-label (custom email domains/templates) only on Business | **$60/mo** Business ([formspree.io/plans](https://formspree.io/plans)) |
| Basin | Unlimited "collaborators" (team members). No client portal on the plan comparison | Agency **$81.25/mo billed yearly** ([usebasin.com/pricing](https://usebasin.com/pricing); [docs.usebasin.com/plan-comparison](https://docs.usebasin.com/plan-comparison/)) |
| Forminit (ex-Getform, renamed Jan 2026) | "Share Form" read-only guests, under Forminit's own brand | Pro **$15.83/mo** yearly; branding removal only on Business **$40.83** ([forminit.com/pricing](https://forminit.com/pricing/)) |
| Web3Forms | "Agency & Team": 20,000 subs, "20 linked emails", team access | **$33/mo or $399/yr** ([splitforms.com/web3forms-pricing](https://splitforms.com/web3forms-pricing), third-party page "checked September 27, 2026"). White-label is reportedly a **$9/mo add-on** **[UNVERIFIED: search snippet only; web3forms.com returned 403]** |
| Formcarry | Team members (1–20). "White-label" listed on every plan. No client portal listed | Up to $80/mo ([formcarry.com/pricing](https://formcarry.com/pricing)) |
| **Inlet** | **Branded end-client login portals, 25 per Pro account, white-label included** | **$19/mo** (`lib/plans.ts:75-92`) |

Two honest qualifications. First, white-label *emails* are **not** rare: Formcarry lists "White-label" on every plan. What is rare is the **end-client portal**. Second, the need is proven by people outside the form-backend category. [Agency Label](https://agencylabel.com/platform/clients) sells agency portals that show clients "every form fill from their site, in one place". [WhatConverts](https://www.whatconverts.com/pricing/) charges agencies **$500–$1,250/mo**, plus **$50/mo for white-labelling**, to track and report leads across client accounts. Agencies already pay a lot to show clients their leads. Inlet offers the form-native slice of that for $19.

### Exhibit 2: French-first, bilingual end to end, and alone in that

**Inlet treats French as the default and English as the option, in every layer from the marketing site to the transactional emails. None of the nine competitors I checked serves a word of French.**

Evidence (code):
- **French is the default locale.** The locale policy defaults to French for every non-anglophone and unknown country, and explicitly names "France, Belgium, Québec, Cameroon, West/Central Africa": `lib/i18n.ts:7-21`. A cookie override is honored first: `:30-32`.
- **Type-checked parity between languages.** Both locales are typed as `Record<Locale, MarketingDict>` and `Record<Locale, AppDict>`, so a missing French string is a compile error: `lib/dictionaries.ts:56-61, 284`; `lib/appDict.ts:267-268, 555`.
- **Bilingual SEO.** `hreflang` alternates are set, with an `x-default`: `lib/seo.ts:67-82`.
- **French reaches the end customer.** Lead and auto-reply emails switch on `_lang` (`lib/email.ts:109, 126-128, 173-206`). Native-form error pages carry French-first labels with English fallbacks (`app/api/submit/[id]/route.ts:161, 177-182`). The auto-reply signs "Cordialement, L'équipe …" (`emails/AutoReply.tsx:74-75`).
- **Live check.** `GET /` with cookie `inlet-locale=fr` returns `<title>Inlet — Un seul backend de formulaires pour tous vos sites</title>`.
- **History.** 19 commits carry "i18n" in their message (`git log --all --grep=i18n`).

Evidence (competitors, run on 2026-09-28): I requested each homepage with `Accept-Language: fr-FR`. **Formspree, Basin, Web3Forms, Formcarry, Forminit, Static Forms, Formspark, splitforms and FormBackend** all returned `<html lang="en">`, no `hreflang`, and zero occurrences of the word "formulaire". Requesting `/fr` returned 404 on seven of them, 405 on Formspree and 429 on Static Forms. *Limit: the Web3Forms response was only 5 KB (possibly a bot wall), so its result is weaker.*

**Why a buyer cares.** A French agency sets up the tool itself, but the tool then talks to **its clients and their customers**. An English auto-reply ("Confirmation of receipt") on a French bakery's website is a visible defect that the agency has to answer for. The market is not small. The OIF's 2026 report counts **396 million French speakers; "65 % des locuteurs francophones sont en Afrique"**; French is "la 4e langue sur Internet" ([francophonie.org](https://www.francophonie.org/lancement-du-rapport-la-langue-francaise-dans-le-monde-2026-8426)). The spend pool also exists. French providers charge **€60–100 HT/month** for basic showcase-site maintenance ([ellebay-digital.com](https://ellebay-digital.com/blog/cout-maintenance-site-web-2026)). A €12–29/mo tool that makes that retainer easier to justify fits inside it.

**Honest limit.** Language alone is a thin moat: a competitor can translate a site with an AI in a weekend. Inlet's defensible version is **French plus the things English-first shops won't prioritize**: French-language SEO pages, EU hosting, French legal pages (*mentions légales*, a GDPR processing agreement), euro and mobile-money pricing, and a French-speaking founder answering support. None of that exists yet (see the upgrade plan).

### Exhibit 3: The lead is treated as sacred

**The pipeline stores the lead first. Everything after storage (quota, AI, webhook, email) can fail without losing it.**

Evidence:
- **Storage comes first.** The row is inserted at `app/api/submit/[id]/route.ts:685-697`, **before** quota accounting. When a plan cap is hit, only email pauses: "The lead above is ALWAYS stored — quotas only pause outgoing email" (`:737-750`; philosophy stated in `lib/quota.ts:7-10`). Quota reads fail open (`lib/quota.ts:52-54`).
- **The AI spam classifier only labels.** It runs after storage and "never blocks or deletes, and fails open" (`lib/spamClassifier.ts:6-10, 28`). Malformed model output returns `null` instead of a wrong verdict (`lib/spamCore.ts:9-21`, unit-tested).
- **Webhooks cannot lose a lead.** They are signed, fire-and-forget with one retry, and "can never block or lose a lead" (`lib/webhooks.ts:15-16`).
- **Email has a circuit breaker.** A failing sender is cooled down for 30 minutes and every failure is logged: `lib/email.ts:32-37, 80-86, 91`. An admin email-health page reports the status of each sender (`app/admin/email/page.tsx:16`).

**Why a buyer cares.** An agency's worst day is a client asking "why did my customer say they wrote to us twice and we never answered?" The pricing FAQ promises: "Losing a lead over a billing limit is not acceptable to us" (`lib/dictionaries.ts:104`). The code honors that at the quota layer.

**Concession, and the two flaws behind it.** The **keyword filter contradicts this promise**. Any submission whose text contains `seo`, `crypto`, `investment`, etc. is **silently discarded, never stored**, and the sender gets a fake success response (`app/api/submit/[id]/route.ts:554-580`). For a web agency, "I need a site with good SEO" is a normal lead. The two flaws behind it:
- The match is a substring test, so "Seoul" also trips it.
- The honeypot and rate-limit bans are **permanent**. `blacklistTarget` inserts rows with no expiry (`lib/blacklist.ts:28`; `route.ts:403-405, 419`). In African markets, many mobile users share one public IP behind carrier-grade NAT, so one bot can lock out many real people.

Both fixes are in upgrade move #2: roughly one hour of work.

### Exhibit 4: CAPTCHA-free anti-spam, and all of it on the free plan

**Five layers: honeypot, proof-of-work, rate limits, reverse DNS and AI labelling. It is first-party, needs no third-party script and presents no puzzle to the visitor.**

Evidence:
- **Honeypot with a fake success**, so bots don't learn they were caught: `route.ts:485-535`.
- **Proof-of-work challenge.** It is bound to the requester's IP and the server secret, with a 5-minute window (`lib/pow.ts:20-34, 45-61`). It is verified with a replay check (`route.ts:635-683`). Difficulty 4 is ~16 bits of work (`lib/pow.ts:32`).
- **Two rate-limit gates.** One in memory, one in the database so it holds across instances (`route.ts:397-429`).
- **Reverse-DNS blocking** of VPN and hosting hosts (`route.ts:319-331`; `lib/dnsLookup.ts:8-14, 46-63`).
- **AI verdicts after storage** (Exhibit 3).
- **The whole stack is on Free.** The pricing copy lists "Full anti-spam stack" for Free (`lib/dictionaries.ts:81`), and nothing in the pipeline is gated by plan.

**Why a buyer cares.** The client's site does not load a CAPTCHA script, so it stays fast and has one less third-party script to disclose. Basin keeps "Advanced spam filtering" for its **Pro** tier ([usebasin.com/pricing](https://usebasin.com/pricing)). **Rarity claim kept modest:** I did not check every competitor's spam stack in 2026.

### Exhibit 5: The agent-native install surface is done properly (but it is table stakes, not a moat)

**A coding agent can wire Inlet without inventing an endpoint. The install files are served as raw markdown to agents. The skill file follows the open Agent Skills format. The MCP server is stateless and isolates each tenant.**

Evidence:
- **Raw markdown for agents.** `/llm-install.md` and `/inlet-skill.md` return `text/markdown` to anything that does not request HTML, and a styled page to browsers (`lib/agentDocResponse.ts:3-23`). Live check: `Content-Type: text/markdown; charset=utf-8`.
- **Standard skill format.** The skill starts with `name:`/`description:` frontmatter (`lib/agentDocs.ts:5`), the format the open Agent Skills standard requires. That standard is read by Claude Code, Cursor, Codex, GitHub Copilot, Gemini CLI and dozens of other tools ([agentskills.io](https://agentskills.io/home)).
- **The install file tells the agent what not to do**: "Do NOT add SMTP, nodemailer, or any email library". It also maps each error code to an action (`lib/agentDocs.ts:7`).
- **Every error is machine-actionable.** Error responses carry `code` + `error` + `remedy` (`route.ts:126-153`).
- **MCP server.** It exposes four tools (`list_forms`, `create_form`, `get_submissions`, `get_integration_snippet`), filters every query by tenant (`app/api/[transport]/route.ts:90`), gates access by plan (`:159-171`) and runs statelessly so it is safe on serverless (`:138`).

**Why the channel is real.**
- Stack Overflow's 2025 survey: 84% of developers use or plan to use AI tools, and 23% use AI agents at least weekly ([survey.stackoverflow.co/2025/ai](https://survey.stackoverflow.co/2025/ai); [thenewstack.io](https://thenewstack.io/23-of-devs-regularly-use-ai-agents-per-stack-overflow-survey/)).
- In the adjacent forms category, Tally's founders wrote on **10 June 2025**: *"ChatGPT Perplexity co are now driving the majority of our new signups."* ([indiehackers.com, Tally milestones](https://www.indiehackers.com/product/tally-2/our-bootstrapped-form-builder-turned-2-and-we-reached-30k-mrr--NE27HegpMhe2ASm5g9d)).
- 80% of databases provisioned on Neon were created by AI agents ([techcrunch.com, 2025-05-14](https://techcrunch.com/2025/05/14/databricks-to-buy-open-source-database-startup-neon-for-1b/)).

**Honest limits.**
1. **MCP is not a differentiator.**
   - FormBackend ships an OAuth MCP server ([formbackend.com](https://www.formbackend.com/connect-formbackend-to-claude-and-cursor-with-mcp)).
   - splitforms offers twelve MCP tools "free on every plan" ([splitforms.com/mcp](https://splitforms.com/mcp)).
   - Formcarry lists "MCP Server (AI Access)" even on its free plan ([formcarry.com/pricing](https://formcarry.com/pricing)).
   - Formspree reportedly has none **[UNVERIFIED: search summary only]**.
2. **`llms.txt` is not a discovery channel.** One study found "no measurable correlation" with AI citations. Another found that of 1,227 requests for `llms.txt` files, "Zero came from a verified frontier-lab crawler" ([digitalapplied.com](https://www.digitalapplied.com/blog/llms-txt-in-practice-adoption-evidence-2026)). Inlet's agent files help an agent that is already installing Inlet. They do not bring traffic.
3. **Today the agent path is blocked twice.** The agent needs a `FORM_ID` that only a human can create in the dashboard (`lib/agentDocs.ts:7`, "Inputs you need from the user"). And MCP requires a paid plan (`route.ts:159`) that nobody can buy (E3). Upgrade move #8 fixes both.

### Exhibit 6: Security engineering well above what a solo side project usually has

**The database defends itself, secrets are hashed or use authenticated encryption, webhooks are signed Stripe-style, and production refuses to boot with placeholder secrets.**

Evidence:
- **Row-level security, deny by default,** on 15 tables, with `anon` and `authenticated` privileges revoked (`migrations/migration_v19_data_security.sql:35-54`). Password hashes can leave the database only through a SECURITY DEFINER function (`:56-71`; the portal equivalent is in `migration_v20_portal_security.sql:28-31`).
- **Passwords and secrets.** Passwords use scrypt (N=2^14) with a constant-time comparison (`lib/passwords.ts:14-41`). Stored secrets use AES-256-GCM, so tampering is detected (`lib/crypto.ts:35-42`). API keys are stored only as SHA-256 hashes (`lib/apiKeys.ts:7-8, 18-25`).
- **Signed webhooks.** They are HMAC-signed with a timestamp and sent to HTTPS endpoints only (`lib/webhooks.ts:5-16, 62, 78`).
- **Fail-fast startup check.** Production refuses to start without a strong `JWT_SECRET` (`lib/securityConfig.ts:44-50`, wired in `instrumentation.ts:12`).
- **Submit endpoint hardening.** It blocks open redirects (`route.ts:74-106`) and caps body size at 6 MB and 100 fields (`:69-72`).
- **Live security headers.** A `GET` of the homepage returns `strict-transport-security: max-age=63072000; includeSubDomains; preload`, a strict CSP, `x-frame-options`, `cross-origin-opener-policy` and a restrictive `permissions-policy`.

**Why a buyer cares.** An agency that routes its clients' customers' personal data through Inlet is responsible for that data under GDPR, and Inlet acts as its sub-processor. A vendor that already runs deny-by-default database security is easier to put in a data-processing agreement.

**Three holes I found myself**, because an unexamined claim of strength counts for nothing:
1. **The download proxy is an open proxy.** `app/api/download/route.ts:13` checks `fileUrl.includes('supabase.co/storage')`, so any URL that merely contains that string is fetched and served as an attachment from Inlet's domain.
2. **Uploaded files are public.** Attachments go to a **public** bucket, and emails link to `getPublicUrl` (`route.ts:612-622`). The README tells operators to create the bucket as public.
3. **Retention is sold but not enforced.** The 30-day Free retention is defined in `lib/plans.ts:52`, but no code reads `retentionDays` (a grep finds no consumer).

All three are fixable in under a day (move #3).

### Exhibit 7: A real agency dogfooded it, and the author ships fast

**Inlet began as an agency's internal tool, the fingerprints of a real client form are in the code, and the author has shown he can ship at high speed.**

Evidence:
- **An internal agency spec.** `cahier_des_charges.md` asks for an internal service to replace Jotform/EmailJS on "nos sites vitrines", with an admin panel and centralized leads. The README describes centralizing forms from "villas, agences, vitrines clients" (`README.md:4`).
- **Fingerprints of a real form.** The lead email has French labels for a vehicle-intake form (`marque`, `modele`, `motorisation`, `photo_1_data…photo_5_data`) at `emails/LeadNotification.tsx:17-39`. The upload handler names files from those same fields (`route.ts:585-593`). *My inference: a real client form shaped the pipeline.*
- **Velocity.** 107 commits between 2026-07-06 and 2026-07-24, peaking at 20 on 07-17, including 15 commits tagged "Security" and 19 tagged "i18n" (`git log --all`). 61 unit checks pass today.

**Why a buyer cares.** The first customer (the agency) and the first case studies (its client sites) already exist, which almost no pre-launch SaaS can say. The velocity means every concession in §2 is a matter of days, not months.

**Concession.** There have been no commits from the author for 51 days (E-timeline), there is no CI, and the integration tests need a live database. Speed without steady effort is not a business. My concession condition in §6 is built around that.

### Exhibit 8: The category pays, including solo founders who entered late

**Form backends are a proven, durable niche where one person can reach meaningful revenue.**

- **Web3Forms:** **$40,549 MRR, 2,939 active subscriptions, $299,045 all-time revenue**, verified through a Paddle API key as of 2026-09-28 ([trustmrr.com/startup/web3forms](https://trustmrr.com/startup/web3forms)). It was founded in December 2020 in India by a solo freelance web designer. It entered years after Formspree and still reached that level. It took **~20 months to reach its first 20 paying customers**, with SEO as the main channel ([starterstory.com](https://www.starterstory.com/web3forms-breakdown)). *I discard that page's "$417K monthly revenue" figure: it contradicts the verified Paddle data.*
- **Formspree:** estimated **$770K revenue in 2025 with ~7 staff**, labelled by the source as an estimate, not self-reported ([getlatka.com](https://getlatka.com/companies/formspree.io)).
- **Tally** (adjacent: a form builder, not a backend): bootstrapped from **$30K MRR (Oct 2022) to $6M ARR (Sep 2026)**. Its growth was "mainly product led (our free forms carry a 'made with Tally badge')" ([indiehackers.com](https://www.indiehackers.com/product/tally-2/our-bootstrapped-form-builder-turned-2-and-we-reached-30k-mrr--NE27HegpMhe2ASm5g9d)). Inlet already has the same kind of loop ("Powered by Inlet" in `emails/AutoReply.tsx:86-92`, `emails/LeadNotification.tsx:172-178` and the portal footer).

**Why it matters.** It answers "is there money here?" with verified revenue, and "can one person win?" with a solo founder who did. It also sets realistic expectations: the benchmark pace is roughly one paying customer a month, not a hockey stick.

---

## 2. The pre-emptive rebuttal

| # | Expected attack | Answer |
|---|---|---|
| A1 | **"There is no checkout. It cannot take money."** (E3, E15) | **Concede.** Today a buyer cannot pay without emailing the author's personal Gmail address. **Fixable in about 2 days of code plus merchant approval**, using a Merchant of Record so VAT is handled. Paddle charges **5% + 50¢** ([paddle.com/pricing](https://www.paddle.com/pricing)). It works with sellers "anywhere in the world" except a listed set; the African countries on that list are the Central African Republic, DRC, Mali, Somalia, South Sudan, Sudan and Zimbabwe ([Paddle help](https://www.paddle.com/help/start/intro-to-paddle/which-countries-are-supported-by-paddle)). France and Cameroon are both allowed. Polar's payout list includes France, Côte d'Ivoire and Senegal but **not Cameroon** ([polar.sh docs](https://polar.sh/docs/merchant-of-record/supported-countries)). Lemon Squeezy bank payouts cover Côte d'Ivoire, Senegal, Morocco and France but **not Cameroon** ([docs.lemonsqueezy.com](https://docs.lemonsqueezy.com/help/getting-started/supported-countries)). **Paddle is the safe default wherever the author is based.** Merchant-of-Record approval usually requires a live site with terms, a privacy policy and a refund policy **[FROM MEMORY]**, which is why the legal pages in move #5 come first. |
| A2 | **"The email capacity is fiction, and the rotation breaks the provider's rules."** (E4–E6) | **Concede fully, including a point the case file doesn't state.** Brevo's terms, §3.1: *"You are only allowed to create and use one account."* (fetched from [brevo.com/legal/termsofuse](https://www.brevo.com/legal/termsofuse/)). The multi-account rotation in `lib/mailAccounts.ts:75-88` breaks that rule, and the pricing page sells it as a feature: "Priority deliverability (SMTP rotation)" (`lib/dictionaries.ts:91, 101`). **Fix: one paid provider, about 1 day of work.** Worst case, each submission sends two emails (notification + auto-reply). Amazon SES à la carte costs **$0.10 per 1,000** ([sendops.dev](https://sendops.dev/amazon-ses-pricing/)), so a Max tenant at its full 10,000 submissions (≤20,000 emails) costs **≤$2.00/month** to deliver, and a Pro tenant at cap costs **≤$0.50**. Resend Pro is **$20/mo for 50,000 emails** ([resend.com/pricing](https://resend.com/pricing)), enough for ten Pro tenants at full cap. Honest capacity costs well under 10% of revenue at every tier. It is a billing line, not a structural problem. |
| A3 | **"'Self-hosted, you own the data' is false advertising."** (E8, E9) | **Concede for the hosted product.** Sign-ups store data in the operator's Supabase. Some context, though it doesn't excuse the copy: the claim was true of the original design, where each agency deploys its own instance (`README.md:3` "alternative open-source et auto-hébergée"). But the repo has **no LICENSE file**, so even "open-source" is not legally true. **Fix: about 2 hours of copy changes** in `lib/dictionaries.ts:64, 100, 147, 168, 203, 212`, `app/llms.txt/route.ts:18, 37, 57`, `lib/ai.ts:22, 38, 66` and `app/pricing/page.tsx:55`. This one is urgent: `llms.txt` and the AI chat **repeat the false claim to agents and visitors**. Replacement: "Hébergé en UE · export CSV/JSON à tout moment · DPA disponible". Optionally, make it true later by adding a license and "deploy your own" documentation. |
| A4 | **"The category is saturated. splitforms costs $1/mo and Netlify Forms is free."** | **Concede that the horizontal market is crowded.** splitforms sells Starter at **$1/mo** ([splitforms.com/mcp](https://splitforms.com/mcp)). Netlify Forms are "free and unlimited" on credit-based plans ([docs.netlify.com](https://docs.netlify.com/manage/forms/usage-and-billing/)). **Contest the conclusion.** Inlet should not fight on endpoint price, and nothing in Exhibits 1–2 depends on being cheapest. The agency-portal plus French segment has no occupant in the evidence I gathered. A crowded category also proves demand, and Web3Forms shows a late entrant with a wedge can still reach $40K MRR (Exhibit 8). |
| A5 | **"AI agents will write the contact route themselves. Form backends are obsolete."** | **Contest with evidence.** The category is growing, not shrinking, as agents spread. Web3Forms held $40.5K MRR in September 2026, Tally went from $3M to $6M ARR between June 2025 and September 2026, and Tally reports AI assistants now send it most of its new signups (Exhibit 5). Agents tend to **provision hosted services rather than rebuild them**: 80% of Neon databases were created by agents. The agency's cost was never writing one route. It is **running 20 of them**: per-site SMTP credentials, sender reputation, spam, storage and a place the client can see leads. Inlet's own install file tells the agent not to add a mailer (`lib/agentDocs.ts:7`). **Concede the trend:** the value of a *bare endpoint* is falling toward zero. That is why the positioning in §3 is the portal and operations layer, not the endpoint. |
| A6 | **"Nobody will trust `inlett.vercel.app`, a personal Gmail and anonymous testimonials."** (E10, E15) | **Concede, and I add two points.** First, Vercel's own docs say "the Hobby plan restricts users to non-commercial, personal use only" ([vercel.com/docs/plans/hobby](https://vercel.com/docs/plans/hobby)), so a paid SaaS needs Pro at **$20/mo per seat**, which includes a free first-year domain. Second, the response headers show `x-vercel-id: iad1::iad1`, which suggests the functions run in Washington, D.C. That weakens any EU-privacy pitch. **Fix in 1–2 days** (move #5): a domain, Vercel Pro, a business email address, French legal pages, the EU region, and real named testimonials from the author's own agency clients. |
| A7 | **"It's abandoned: 51 days without a commit."** | **Partly concede.** A 19-day burst followed by silence is the classic side-project pattern. The evidence (107 commits, 61 passing checks) shows the ability is there. The open question is commitment. §6 turns that into a testable condition, not a promise. |
| A8 | **"'Unlimited AI' runs on rotated free Gemini keys."** (E7) | **Concede.** Rate limits apply per Google Cloud project, and third-party guidance warns "Do not distribute requests across projects to evade a limit" **[UNVERIFIED: third-party summary; Google's own terms not quoted]**. **Fix:** remove "Unlimited AI assistant" from Pro/Max (`lib/dictionaries.ts:91`) and run the spam classifier on one paid key. The classifier sends at most 4,000 characters per lead (`lib/spamCore.ts:23-32`), roughly 1,000 tokens. At small-model prices of about $0.10 per million input tokens **[FROM MEMORY]**, 10,000 classifications cost around **$1**. The sales chatbot is not something buyers pay for, so take it out of the plan tables. |
| A9 | **"The security story is marketing. There are holes."** | **Pre-empted in Exhibit 6:** the open download proxy, public uploads and unenforced retention. They are real, found by the Defense, and fixable in under a day (move #3). I also concede a regression that damages the flagship feature. **The end-client welcome email links to a dead domain**: `https://logiciel-formulaire.vercel.app/portal/login` (`emails/PortalUserWelcome.tsx:109`), and the same for the developer welcome (`emails/ClientWelcome.tsx:107`). Both returned **HTTP 404** on 2026-09-28. The developer panel shows the correct portal URL (`components/client/EndClientsPanel.tsx:25`), but the email the end-client actually receives is broken. It is a 10-minute fix. |

---

## 3. The best version of this idea

### Candidate positionings, scored on evidence

| Positioning | Supporting evidence | Against it | Verdict |
|---|---|---|---|
| **A. "The lead hub for web agencies"** (one backend for all client sites, a branded portal per client) | Built and isolated (Ex. 1). Origin is an agency (Ex. 7). Agencies pay a lot for client lead visibility (WhatConverts $500+/mo, Basin Agency $81.25, Formspree Business $60) | Agencies are fewer than solo developers, and sales are slower | **Core of the value** |
| **B. "The form backend your coding agent installs"** | Real channel (Tally, Neon, Stack Overflow) and done properly (Ex. 5) | Commoditized: FormBackend, splitforms (free MCP), Formcarry (MCP on Free), Tally. `llms.txt` shows no citation lift | **A channel, not a position.** Use it for installation, never as the headline |
| **C. "The Francophone-first form backend"** | 0 of 9 competitors speak French (Ex. 2). 396M speakers. A French retainer economy exists | Easy to copy. Francophone Africa pays less in USD and has payment friction | **The beachhead**: the market where A has no competitor |
| D. "A cheaper Formspree" | none | splitforms $1/mo, Netlify free | **Reject** |

### The chosen positioning

> **FR:** *« Le back-office leads des agences web francophones : tous les formulaires de tous vos sites clients, une seule boîte de réception, et un portail à vos couleurs pour chaque client. »*
> **EN:** *"The lead back-office for French-speaking web agencies: every client site's forms in one inbox, and a portal in your brand for each client."*

**Why this beats the alternatives:**
- It puts the product's hardest-to-copy asset (the multi-tenant portal) in front.
- It aims at the one segment where the evidence shows no competitor.
- It sells to buyers whose unit of revenue (a client site on a retainer) matches Inlet's unit of value.

Agent installation becomes the onboarding mechanic ("paste this into Claude Code/Cursor"), not the pitch.

### The first 10 customers: who, and where to find them

**Ideal customer profile.** A French-speaking freelancer or 2–10 person agency that:
- ships **5 or more showcase sites a year**;
- sells a **maintenance retainer** (€60–100 HT/mo is the market rate, per [ellebay-digital.com](https://ellebay-digital.com/blog/cout-maintenance-site-web-2026));
- today wires forms with EmailJS, Formspree, Web3Forms, PHP `mail()` or a WordPress form plugin.

| # | Who | Where / how |
|---|---|---|
| 1 | **The author's own agency** (the spec's "nos sites vitrines") | Move every client site onto Inlet and give each owner a portal. Output: 3 named case studies with real lead counts |
| 2–4 | Agencies and freelancers already in the author's network | Direct, done-for-you migration, free for 3 months in exchange for a named testimonial and logo |
| 5–7 | French freelancers who sell "site vitrine + maintenance" | Public freelance profiles (Malt, Codeur) and French web-developer communities. Tally grew its first year partly through cold outreach (same Indie Hackers source) |
| 8–10 | Agencies in Côte d'Ivoire, Senegal and Cameroon (named as targets in `lib/i18n.ts:10-11`) | Local developer communities and meetups **[FROM MEMORY: e.g. GDG chapters]**, and end-customers who see "Propulsé par Inlet" on auto-replies |

**Expectation check.** Web3Forms needed about 20 months for its first 20 paying customers with a free-SEO strategy. With concierge onboarding and a narrow profile, 10 paying agencies in about 90 days of focused work is ambitious but not absurd. §6 sets a lower bar at which I concede.

---

## 4. The upgrade plan (ranked)

Ranking rule: **stop false claims → stop losing leads → make money possible → make it credible → grow.** Costs are monthly USD unless noted.

| # | Move | What exactly (file-level) | Effort | Cost | Metric it moves | Why it beats the alternatives |
|---|---|---|---|---|---|---|
| **1** | **Truth pass** | Remove "self-hosted" (§2 A3 file list). Remove "Priority deliverability (SMTP rotation)" and "Unlimited AI" (`lib/dictionaries.ts:91, 101`). Fix the demo subtitle "This is the real pipeline" (`:178`), which contradicts its own footnote "Interactive simulation" (`:196`). Update `/llms.txt` so agents stop repeating false claims. Rename the stale "KING E FORMS" header in `lib/ai.ts:19` | 2–3 h | $0 | False claims live: from ≥8 to 0 | Most of the case file's evidence (E8–E9, plus E5/E7 in the copy) is about claims. Removing them costs nothing and protects every later step |
| **2** | **Stop losing leads; fix the broken portal onboarding** | (a) Keyword filter: *label* the lead `spam_status='suspect'` instead of dropping it (`route.ts:550-580`), with whole-word matching. (b) Add `expires_at` (24 h default) to blacklist rows (`lib/blacklist.ts:28`, plus a migration). (c) Point welcome emails and attachment links at `SITE_URL` (`emails/PortalUserWelcome.tsx:109`, `emails/ClientWelcome.tsx:107`, `emails/LeadNotification.tsx:152`) | 2–3 h | $0 | Leads silently dropped: from >0 to 0. End-client first-login rate | The product's central promise is "no lead lost". Today a lead mentioning SEO is lost, and the portal invite leads to a 404 |
| **3** | **Close the three security holes** | Download proxy: parse the URL and require `hostname === <project>.supabase.co` (`app/api/download/route.ts:13`). Make the `uploads` bucket private and serve **signed** URLs through the proxy after checking tenant ownership. Retention: a Vercel Cron job deleting rows older than `retentionDays` (a new `app/api/cron/retention/route.ts`) | 4–6 h | $0 | Open security findings: 3 → 0 | GDPR-sensitive agencies will ask. Retention limits become a selling point ("we delete by default") |
| **4** | **Delivery capacity that matches what is sold** | Replace the multi-account rotation in `lib/mailAccounts.ts` / `lib/email.ts:44-94` with one provider (SES or Resend) and keep the health panel. For the top tier, add **per-tenant verified domains with DKIM** through the provider's API, so "custom sender" becomes a real `contact@client.fr` instead of a display name only (`lib/email.ts:167-171`) | 1 day | SES ≈ $0.10/1k; Resend $20/50k | Sold daily caps ≤ actual capacity; bounce and complaint rates | Ends the Brevo terms breach. Real DKIM sending is a feature agencies will pay for |
| **5** | **Credibility infrastructure** | A domain and a business email address. Vercel Pro (commercial use). Move function region to `cdg1` (Paris) and Supabase to Paris or Frankfurt. French legal pages: *mentions légales*, terms of sale, privacy policy, and a GDPR processing agreement (art. 28) for agencies. A public status page. Replace the anonymous testimonials (`lib/dictionaries.ts:150-158`) with named ones from move 9's case studies | 1–2 days | Vercel $20 + Supabase Pro $25 ([supabase pricing](https://makerkit.dev/blog/saas/supabase-pricing)) + domain (free year 1 with Vercel Pro) | Visit → signup conversion. Merchant-of-Record approval | Required for A1, A3 and A6. Nobody sends client data to an anonymous `*.vercel.app` |
| **6** | **Real checkout** | Replace `lib/upgrade.ts` (the mailto) with a Paddle checkout. Add `app/api/billing/webhook/route.ts` that verifies the signature and sets `clients.plan`. Offer annual billing (two months free). Price in **EUR** for France and USD elsewhere | 2 days + approval lead time | 5% + 50¢ per transaction | First paid invoice. Free → paid conversion | Paddle accepts sellers in France and Cameroon (A1). It also handles EU VAT, which a solo founder should not do by hand |
| **7** | **Pricing v2: charge per client site** | Rewrite `lib/plans.ts` around the agency's unit of revenue. **Free:** 1 site, 100 submissions/mo, Inlet badge. **Freelance €12:** 10 sites, 5 portals. **Agence €29:** 50 sites, unlimited portals, white-label, portal on a custom domain. **Studio €79:** DKIM custom domains, monthly reports (move 10), priority support. Keep submission caps as fair use, not as the headline | 0.5 day | $0 | Average revenue per account; upgrade rate | The anchors are Web3Forms Agency $33, Forminit Business $40.83, Formspree Business $60 and Basin Agency $81.25. €29 undercuts every agency plan while staying 6–29× above the $1–5 race to the bottom. **Break-even arithmetic:** fixed costs ≈ $20 + $25 + ~$20 email ≈ **$65–70/mo**. Net per Agence sale ≈ €29 − 5% − €0.5 ≈ **€27**. Break-even is **3 Agence customers** (4 on today's $19 Pro) |
| **8** | **Make the agent channel work, then list it** | (a) Open API/MCP on **Free**, as splitforms and Formcarry do (remove the gate at `app/api/[transport]/route.ts:159`, keep rate limits). (b) Add a **claimable form** flow: the agent calls `create_form` with the user's email, Inlet emails a confirmation link, and the form goes live on click. This removes the "human must copy a FORM_ID" step in `lib/agentDocs.ts:7`. (c) Publish the server to the official MCP Registry ([modelcontextprotocol.io/registry](https://modelcontextprotocol.io/registry/about)) and the skill as a public `SKILL.md` repository. (d) Add the missing tools: `update_form`, `add_allowed_origin`, `create_portal_user` | 2–3 days | $0 | Share of signups via `?ref=agent` and MCP. Time to first lead | Tally shows AI assistants can become the main signup source. Today Inlet's agent path is blocked twice (Ex. 5) |
| **9** | **Distribution: dogfood, French SEO, the badge loop** | (a) Migrate the author's agency sites and publish **3 French case studies** with real numbers (move 5 reuses them as testimonials). (b) Five French pages targeting searches such as "alternative Formspree en français", "formulaire de contact site statique", "formulaire Astro/Next.js/Webflow sans backend" (extend `app/compare/[slug]`); Web3Forms' main channel was SEO content. (c) Measure the existing badge loop: `?ref=autoreply`, `?ref=notify`, `?ref=portal` are already emitted (`emails/AutoReply.tsx:89`, `emails/LeadNotification.tsx:175`); count them in `/admin/analytics` | 3–4 days, then ongoing | $0 | Organic French signups/week. Signups attributed to the badge | Tally's badge loop and Web3Forms' SEO are the two proven growth paths in this category. Inlet already has half of the first |
| **10** | **The bold move: become the agency's retention engine** | Every month, each end-client receives a **white-label report** under the agency's brand: "Votre site vous a apporté 14 demandes en septembre (+40 %) — 3 non traitées." The portal is served on the **agency's own domain** (`leads.agence.fr`, via Vercel's custom-domain API). Build: a cron job + a React Email template + one aggregate query per portal user; the custom domain is a `domains` table plus an API call | Report 3–4 days; domain 2–3 days | ≈$0 marginal | **Agency churn** (retention). Monthly portal logins per end-client | See below |

**Why move 10 is the right bold move.** A form endpoint is a commodity; proof of value is not. The agency's real risk is losing its client, who stops paying the €60–100 retainer because "the site doesn't do anything". Inlet already knows every lead each client's site produced. Sending that proof monthly, under the agency's brand, makes Inlet **the reason the retainer gets renewed**. Agencies can then resell it inside their maintenance package rather than treat it as a cost.

WhatConverts shows agencies pay **$500–$1,250/mo, plus $50 for white-label**, for lead reporting ([whatconverts.com/pricing](https://www.whatconverts.com/pricing/)). None of the form-backend pricing pages I read (Formspree, Basin, Forminit, Formcarry, splitforms, Web3Forms via splitforms) lists client-facing periodic lead reports **[scope of the check: those pages only]**. WhatsApp lead alerts are a natural follow-up for African markets, but they are **not** unique: Jotform and Web2Phone already offer them.

**Also do:** a CI workflow running `npm run test:unit` on every push (1 hour).

---

## 5. 30 / 60 / 90-day plan

The assumption is **about 10 focused hours a week**. The 19-day burst shows the capacity is there; the plan asks for consistency, not speed.

| Window | Build | Sell | Success metrics (all measurable in `/admin/revenue`, `/admin/analytics` or the database) |
|---|---|---|---|
| **Days 1–30** | Moves 1–6 in order. Add CI | Migrate the author's agency sites (customer #1). Start 3 case studies | **0** false claims live. **0** silently dropped leads. Checkout live and first paid invoice received (even from customer #1). **≥10** end-client portals created with ≥1 login each. Domain, legal pages and EU region live |
| **Days 31–60** | Move 7 (pricing v2). Move 8 (free MCP, claimable forms, registry). First version of move 10 (monthly report) | 5 French SEO pages and 3 case studies published. **Direct outreach to 100 profile-matched French-speaking freelancers and agencies** | ≥50 signups. ≥20 *activated* (received a real, non-test lead). **≥5 paying accounts**. ≥30% of activated agencies have created ≥1 end-client portal |
| **Days 61–90** | Move 10 custom-domain portals. Prepaid 3- and 12-month passes for mobile-money markets (CinetPay charges 1.5–2%; native recurring payments exist only on Orange Money CI and MTN MoMo CI, and CinetPay's subscription module is in beta, per [kolonell.com](https://kolonell.com/fr/blog/passerelle-paiement-cote-divoire-wave-orange-mtn-2026)) | Referral offer (one free month per referred agency). Publish outcomes | **≥10 paying agencies** (the "first 10"). MRR ≥ €250 (for example 7 × €29 + 4 × €12). Month-2 paid retention ≥80%. ≥20% of new signups from the badge (`ref=`) or agent channels |

**Outreach funnel assumptions (so the targets are not wishes).** From 100 targeted contacts:
- 20–30% reply or take a call: 20–30 conversations;
- 50% start with a real site: 10–15 trials;
- 40–60% pay after 30 days: **4–9 paying accounts**.

So day 90's target of 10 requires either the upper end of every rate or a second batch of 100 contacts. I state it as a stretch target, not a forecast.

### The honest condition under which the Advocate concedes

I concede that **Inlet should not continue as a public SaaS**, and should instead return to its origin as the agency's internal tool (and optionally be open-sourced), if **any one** of these is true at **day 90 after checkout goes live**:

1. **Fewer than 5 paying accounts**, despite ≥100 targeted contacts and a working checkout. The market has answered.
2. **Fewer than 30% of activated agencies ever create an end-client portal.** The portal thesis, the core of this defense, is then false, and Inlet is just a French Formspree that loses on price.
3. **Fewer than half of organic signups come in French.** The Francophone wedge is then imaginary.
4. **Another gap of 30 or more days without a commit or a customer conversation** before the checkout is live. The binding constraint is then the author's time, and no positioning fixes that.

**My calibration.** Applying the house rule, I will not claim certainty. My estimate is that *if moves 1–6 ship within 30 days*, reaching condition-free status at day 90 is **plausible but less likely than not: roughly 30–45%**. The basis:
- the funnel arithmetic above;
- Web3Forms' slow 20-customer start as the base rate;
- an adjustment upward for concierge onboarding and an uncontested niche.

The case for continuing is not "this will certainly win". It is that **the downside is tiny** (≈$70/mo and 90 days of part-time work, with break-even at 3–4 customers), **the needed assets already exist** (Exhibits 1–7), and **the remaining gaps can be closed in days**.

---

## Sources (all accessed 2026-09-28)

- Formspree plans: https://formspree.io/plans
- Basin pricing and plan comparison: https://usebasin.com/pricing · https://docs.usebasin.com/plan-comparison/
- Forminit (ex-Getform) pricing: https://forminit.com/pricing/
- Formcarry pricing: https://formcarry.com/pricing
- Web3Forms pricing (third-party mirror): https://splitforms.com/web3forms-pricing · Web3Forms revenue: https://trustmrr.com/startup/web3forms · https://www.starterstory.com/web3forms-breakdown
- splitforms MCP and pricing: https://splitforms.com/mcp · FormBackend MCP: https://www.formbackend.com/connect-formbackend-to-claude-and-cursor-with-mcp
- Netlify Forms billing: https://docs.netlify.com/manage/forms/usage-and-billing/
- Formspree revenue estimate: https://getlatka.com/companies/formspree.io
- Tally milestones: https://www.indiehackers.com/product/tally-2/our-bootstrapped-form-builder-turned-2-and-we-reached-30k-mrr--NE27HegpMhe2ASm5g9d
- Agency Label: https://agencylabel.com/platform/clients · WhatConverts pricing: https://www.whatconverts.com/pricing/
- OIF 2026: https://www.francophonie.org/lancement-du-rapport-la-langue-francaise-dans-le-monde-2026-8426
- French maintenance pricing: https://ellebay-digital.com/blog/cout-maintenance-site-web-2026
- Stack Overflow 2025 AI: https://survey.stackoverflow.co/2025/ai · https://thenewstack.io/23-of-devs-regularly-use-ai-agents-per-stack-overflow-survey/
- Neon / Databricks: https://techcrunch.com/2025/05/14/databricks-to-buy-open-source-database-startup-neon-for-1b/
- llms.txt evidence: https://www.digitalapplied.com/blog/llms-txt-in-practice-adoption-evidence-2026
- Agent Skills: https://agentskills.io/home · MCP Registry: https://modelcontextprotocol.io/registry/about
- Brevo terms §3.1: https://www.brevo.com/legal/termsofuse/
- Amazon SES pricing: https://sendops.dev/amazon-ses-pricing/ · Resend pricing: https://resend.com/pricing
- Vercel Hobby and Pro: https://vercel.com/docs/plans/hobby · Supabase pricing: https://makerkit.dev/blog/saas/supabase-pricing
- Paddle: https://www.paddle.com/pricing · https://www.paddle.com/help/start/intro-to-paddle/which-countries-are-supported-by-paddle
- Polar payout countries: https://polar.sh/docs/merchant-of-record/supported-countries · Lemon Squeezy: https://docs.lemonsqueezy.com/help/getting-started/supported-countries
- West African payment aggregators: https://kolonell.com/fr/blog/passerelle-paiement-cote-divoire-wave-orange-mtn-2026
- WhatsApp form alerts (not unique): https://www.jotform.com/blog/announcing-sms-and-whatsapp-notifications/ · https://web2phone.co.uk/blog/best-form-backend-whatsapp-notifications/

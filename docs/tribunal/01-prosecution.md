# 01 · The Prosecution

> *The Market v. Inlet*. Brief for the Prosecution ("The Hater"). Written blind: no other party's brief was read.
> Evidence was checked against the repo at `HEAD` and the live site on **2026-09-28**. All URLs were accessed on 2026-09-28.
> Unless stated otherwise, `route.ts` means `app/api/submit/[id]/route.ts`.
> Tags: **[UNVERIFIED]** means I could not confirm it and it deserves no weight. **[FROM MEMORY]** means it comes from prior knowledge, not a live check. **[SECONDARY]** means a third-party page, because the primary page blocked automated access. **[INFERENCE]** means reasoning from cited facts.

## Opening statement

**Today, someone who wants to pay for Inlet has no way to pay. Someone who did pay would be buying email volume that Inlet does not have. And a visitor named Seo who fills in an Inlet form never reaches anyone.**

The Prosecution's case is that Inlet fails all four tests in the case file:
- **It is not a business.** There is no checkout, no billing and no legal entity.
- **It cannot deliver what it sells.** The email capacity is borrowed from free accounts, a setup the author's own documentation says breaks the provider's terms. The self-serve integration fails in a real browser. The spam filter throws away real leads.
- **Its headline claim is false.** It says "self-hosted, you own the data". It is a hosted service whose operator can read every tenant's leads.
- **It has no moat against a free substitute.** The same AI agents that co-wrote 92 of its 109 commits can write a contact-form route in one sitting.

What follows is the evidence.

---

## Counts of the indictment (ranked by severity)

### COUNT 1 · FATAL: Inlet cannot take money.
**No checkout, no billing, no plan-change tooling: "upgrading" means emailing a personal Gmail and waiting for the author to edit the database by hand.**

**Evidence**
- `lib/upgrade.ts:1-13`: "Self-serve checkout isn't live yet". Every paid CTA is a `mailto:` to a hard-coded personal Gmail. It is live on `/pricing` as three `mailto:` links (curl, 2026-09-28).
- There is no billing code at all. Grepping `app lib migrations components` for invoice, billing, subscription, stripe, paddle, lemon, paypal, cycle or renew finds nothing except comments. `lib/actions.ts` has no function that changes a client's `plan`.
- Yet `app/pricing/page.tsx:33` promises that "downgrades [apply] at the end of the cycle". No cycle exists.
- **Rails** (which ones open depends on where the seller's legal entity is registered; some markets Inlet targets in `lib/i18n.ts` are not covered):
  - Stripe lists no Cameroon (https://stripe.com/global).
  - Lemon Squeezy's bank-payout list has no Cameroon (https://docs.lemonsqueezy.com/help/getting-started/supported-countries).

**Why it kills sales.** A developer who reaches "Upgrade to Pro" at 11 pm hits a mail client, not a card form. Many webmail users have no `mailto:` handler, so the click does nothing. MRR is zero by construction.

**The two hidden behind it**
1. **Nothing is recorded.** No invoice, no VAT, no receipt, no cancellation path. An EU B2B buyer cannot book the expense, and a US buyer has no refund recourse.
2. **The address may be misspelled [UNVERIFIED].** The hard-coded address (`lib/upgrade.ts:6`) does not match the repo's author handle. If it is a typo, even the manual funnel goes to a stranger.

*Mitigation, for fairness:* Paddle's list of unsupported seller countries is short (https://www.paddle.com/help/start/intro-to-paddle/which-countries-are-supported-by-paddle). A route exists. It simply has not been taken.

---

### COUNT 2 · FATAL: The self-serve product breaks at the first real browser request.
**Self-serve forms are created with no allowed origins. Only the super-admin can add them. Browsers send `Origin` on form POSTs. So both the documented JS helper and the plain-HTML form get `403 CORS_NOT_ALLOWED`.**

**Evidence**
- **Default is empty.** `migrations/schema.sql:23` sets `allowed_origins TEXT[] NOT NULL DEFAULT '{}'`. Neither self-serve creation (`app/api/client/forms/route.ts:124-135`) nor MCP `create_form` (`app/api/[transport]/route.ts:60-68`) sets origins.
- **Only the admin can fix it.** Editing origins exists only as `updateFormOrigins` behind `verifyAdminAuth` (`lib/actions.ts:363-365`), used only by `app/admin/forms/[id]/page.tsx:132`. No origin, domain or CORS control exists in `components/client/` or `app/client/`.
- **The check fires whenever `Origin` is present.** `app/api/submit/[id]/route.ts:383-395` (hereafter `route.ts`) rejects any `Origin` not on the list. MDN: browsers add `Origin` to cross-origin requests and to POST requests (https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Origin). The JSON helper's preflight also fails (`route.ts:248-259`).
- **The error message points to a control that doesn't exist.** It says "edit this form, and add … to the Allowed Domains list" (`route.ts:389`). `lib/agentDocs.ts:7` tells AI agents the same.
- **Even a correctly configured plain-HTML form returns raw JSON.** `route.ts:834-837` returns `NextResponse.json` whenever `Origin` is present, on the stated assumption that native posts have "no origin header". MDN says they do. The advertised `redirect_url` flow therefore never runs in a modern browser.

**Caveat.** This is code-level. I did not submit to the live service (rule 4). If the production database default was changed by hand, this count weakens.

**Why it kills sales.** The home page promises "integrate in 2 minutes" (`lib/dictionaries.ts:70`). A tester's first submission gets a 403, followed by instructions for a screen that does not exist.

**The two hidden behind it**
1. **The tests cannot see it.** `scripts/test-submit.mjs:62` sets `allowed_origins` by hand, and test 1 posts "urlencoded, no origin" (`:69`), which no browser does.
2. **The testimonials describe a path that needs the operator's manual help.** "Up and running in two minutes… it just worked" (`lib/dictionaries.ts:155`) contradicts the code.

---

### COUNT 3 · FATAL: It sells email volume it does not have, from accounts its own docs say break the provider's terms.
**Pro promises one tenant the entire stated pool and Max promises 3.3× it. The gap is filled by rotating free Brevo accounts, which the author's own documentation calls a terms violation.**

**Evidence**
- **The stated pool.** `lib/plans.ts:12-14` says delivery "rides Brevo's free tier (300 emails/day aggregate)".
- **The promises.** Pro is 300/day and Max is 1,000/day (`lib/plans.ts:81, 99`).
- **The scheme.** `lib/mailAccounts.ts:86-87`: "N Brevo accounts give roughly N× the daily send capacity". Commit `488f4a4` (2026-07-16) says "6 Brevo accounts wired … all send from [one @gmail.com address], 6 distinct logins -> ~6x daily capacity."
- **The author's own warning.** `docs/adding-email-accounts.md:112-115`: "creating many free accounts on one provider to beat a daily cap violates most providers' terms (Brevo included) and wrecks deliverability once they link them."
- **Brevo's terms.** §3.1: "You are only allowed to create and use one account." §5.4: use "is strictly personal and shall not be … distributed … to any third party." Version of 2025-10-01 (https://www.brevo.com/legal/termsofuse/).
- **The arithmetic.**
  - If there is one account (per the code comment), one Pro tenant at its cap takes 100% of the pool.
  - If there are six (per the commit; production count **[UNVERIFIED]**), the pool is 6 × 300 = 1,800/day. One Max plus two Pro at their caps is 1,000 + 2 × 300 = 1,600/day, which is 89% of the pool, sold for $49 + 2 × $19 = **$87 MRR**.
- **Everything shares the pool.** Login OTP codes, password resets and portal credentials all go through the same `sendWithFallback` (`lib/email.ts:331-381, 388-445`). Exhaustion or suspension therefore also locks 2FA users out. That includes the super-admin when `ADMIN_2FA_EMAIL` is set (`app/api/auth/login/route.ts:49-55`).

**Why it kills sales.** For a form backend, email delivery *is* the product. The day a real agency hits its paid cap, either the other tenants' notifications stop, or the linked accounts get suspended together. Suspension is already planned for in the code (`lib/mailAccounts.ts:96`: "suspended by the provider").

**The two hidden behind it**
1. **All tenants share one reputation.** Every tenant's email goes out from one gmail.com sender (commit `488f4a4`). Brevo says free-mail domains cannot be authenticated and are temporarily replaced (https://help.brevo.com/hc/en-us/articles/4410613910418; **[UNVERIFIED]** directly because the page is Cloudflare-blocked, taken from the search snippet). One tenant's spam complaints hurt everyone's inbox placement.
2. **Two paid features don't exist.**
   - "Priority deliverability (SMTP rotation)", sold on Pro and Max (`lib/dictionaries.ts:91`), has **zero** code references (`priorityDeliverability` is used only in `lib/plans.ts`).
   - Max's "Dedicated sending-domain setup (DKIM/SPF)" cannot work: each message picks a random pool account and uses that account's `from` (`lib/email.ts:59-74`).

*For fairness:* a legitimate fix is cheap. Resend Pro is $20/mo for 50,000 emails (https://resend.com/pricing). Brevo Starter is $39/mo for 40,000 (https://www.emailvendorselection.com/brevo-pricing/, updated 2026-09-14). That cheapness is itself a problem: it is exactly what the do-it-yourself substitute costs (Count 8).

---

### COUNT 4 · SEVERE: It silently throws away real leads while promising "a lead is never lost".
**A 7-word substring filter over the whole JSON payload, field names included, drops matching leads, tells the visitor "success", stores nothing in the tenant's inbox and sends no email.**

**Evidence**
- **The filter.** `route.ts:554-580`: `['seo','crypto','viagra','enlarge','casino','bitcoin','investment']` matched against `JSON.stringify(payload)`. On a match it returns `success: true` and never reaches the insert at `:686`.
- **Only the operator can see the loss.** Dropped payloads go to `failures_log`, readable only through `getFailuresLogs` behind `verifyAdminAuth` (`lib/actions.ts:459-466`).
- **The promises it breaks.** "Your leads are never lost" (`lib/dictionaries.ts:104`). "Rotates across backup accounts so a lead is never lost" (`:129`). `lib/quota.ts:7`.
- **What gets dropped.** I ran the exact filter on realistic leads. These were **all dropped**:
  - a Korean surname ("Seo-yeon Kim")
  - "a studio based in Seoul"
  - an email at `museodelprado.es`
  - "Jose Ortiz" <joseortiz@…>
  - "Looking for an investment property"
  - "Can you enlarge my photo to A3?"
  - a booking at "Casino Barrière"
  - "your cryptography course"
  - any form with a field named `seo_consent`

  A plain "I'd like a quote" passed.

**Why it kills sales.** A real-estate agency (the README's own example client, ImmoPro) loses every English enquiry about "investment". The tenant never learns it happened, but its customer does. The first "I never got your reply" ends the account.

**The two hidden behind it**
1. **It punishes the English market the pricing is in.** French "investissement" passes and English "investment" fails, yet the prices are in USD.
2. **It is published.** The list is in a public repo, so a spammer writes "S.E.O." and walks through. Real users get the false positives. Spammers get none of the friction.

---

### COUNT 5 · SEVERE: The headline claim is false, and so are several claims about competitors.
**"Self-hosted form backend · you own the data" is printed on a hosted multi-tenant service whose operator reads every tenant's leads.**

**Evidence**
- **Where the claim appears.**
  - Hero: `lib/dictionaries.ts:64`.
  - "Every plan is self-hosted on your own infrastructure — your data never belongs to us": `:100`.
  - "Runs on your own Supabase + Vercel (free tiers)" on the compare pages: `:217, 245, 259`.
  - JSON-LD: `app/pricing/page.tsx:55`.
  - `/llms.txt`: `app/llms.txt/route.ts:18, 37`.
  - The sales bot's knowledge base: `lib/ai.ts:22, 38`.
- **The reality.**
  - Sign-up stores data in the operator's Supabase.
  - The super-admin's `getSubmissions` returns every tenant's leads with IP and fingerprint (`lib/actions.ts:409-417`).
  - The repo has **no license** (GitHub API: `license: null`), so a buyer cannot legally self-host even the public code.
- **Competitor claims that are false.**
  - "Formspree: Per-form accounts" (`:213`). Formspree lists **unlimited forms on every plan** (https://formspree.io/plans).
  - "Basin: White-label auto-reply ✗" (`:242`). Basin Growth includes "auto-responses … branded emails" (https://usebasin.com/pricing).
  - `/compare/getform` (added 2026-08-08; live title "Getform alternative"). "Getform was renamed Forminit in January 2026" (https://forminit.com/pricing/).
  - "Web3Forms: Email only / Not stored" (`:268-269`). A June 2026 comparison lists a 30-day submission history **[SECONDARY]** (https://merginit.com/blog/24062026-free-form-backend-services-comparison).
- **Self-contradiction.** "Every other form tool makes you wire SMTP" (`:114`), while Inlet's own tables tick "No SMTP" for every competitor (`:211, 239, 253, 267`).
- **The law.**
  - French Code de la consommation L121-2 (misleading claims about essential characteristics) applies to B2B practices via L121-5 (https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000034072564).
  - L122-1 permits comparative advertising only if it is objective and the advertiser can promptly prove it (https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000032227222).

**Why it kills sales.** The first developer who reads "self-hosted" and then sees a hosted sign-up concludes the copy is careless or dishonest, and then distrusts everything else on the page.

**The two hidden behind it**
1. **The one true differentiator is buried under a false one.** That differentiator is multi-client white-label portals.
2. **Making the claim true leads into a crowded niche.** Real self-hostable projects already exist: Formgrid (MIT, Docker; https://formgrid.dev/blog/formspree-alternatives-in-2026-open-source-cheaper-and-self-hostable) and Formbricks (https://formbricks.com/vs-formspree).

---

### COUNT 6 · SEVERE: A legal vacuum around other people's personal data.
**No privacy policy, terms, DPA, sub-processor list or identified legal entity. Meanwhile it stores third-party leads, IPs and fingerprints forever, sends lead text to a free AI tier that says "do not submit personal information", and serves attachments from a public bucket.**

**Evidence**
- **No legal pages.** `/privacy`, `/terms`, `/legal` and `/mentions-legales` all return 404 live. There are no such links on the home page, and no terms checkbox at sign-up. The only operator identity is "built and operated by King_E" (`app/llms.txt/route.ts:90`).
- **Nothing is ever deleted.**
  - `retentionDays` has zero references outside `lib/plans.ts`.
  - No code path deletes a submission.
  - Blacklist rows have no expiry (`migrations/schema.sql:53-59`).
  - IP addresses are personal data (CJEU *Breyer*, C-582/14; https://iapp.org/news/a/in-breyer-decision-today-europes-highest-court-rules-on-definition-of-personal-data).
- **Raw IPs are stored and forwarded.** They go into submissions (`route.ts:692`), AI chat logs (`app/api/ai/chat/route.ts:63, 135`), and the tenant's lead email (`lib/email.ts:120`).
- **Lead text goes to free Gemini keys.** The spam classifier sends it (`lib/spamClassifier.ts:32`, `lib/ai.ts:87-94, 163-176`). Gemini's Unpaid Services terms: content is used "to … improve, and develop Google products", "human reviewers may read" it, and "Do not submit sensitive, confidential, or personal information to the Unpaid Services" (https://ai.google.dev/gemini-api/terms). EEA-based developers get paid-tier treatment; an operator outside the EEA **[INFERENCE]** does not.
- **Attachments are world-readable.** They go to a **Public** bucket (`README.md:125`) as permanent `getPublicUrl` links (`route.ts:612-622`). The upload happens *before* proof-of-work verification (`:582-633` vs `:637`).
- **A tracking cookie runs with no notice.** `ie_sid` lasts one year (`app/api/track/route.ts:78-84`). The CNIL audience-measurement exemption still requires informing users (https://www.cnil.fr/fr/cookies-solutions-pour-les-outils-de-mesure-daudience).
- **The applicable rules.**
  - GDPR Art. 28(3) requires a processor contract, and 28(2) requires authorisation for sub-processors (https://gdpr-info.eu/art-28-gdpr/). The unlisted sub-processors are Supabase, Vercel, Brevo, Google, Groq and Mistral.
  - Cameroon Law 2024/017 had a compliance deadline of **23 June 2026** and requires prior authority approval for transfers abroad (https://lexafrica.com/2025/10/cameroon-data-protection-law-compliance/).

**Why it kills sales.** An EU agency is the controller for its clients' leads. It cannot lawfully put them on a processor with no Art. 28 contract. A Cameroonian agency now faces the same wall at home.

**The two hidden behind it**
1. **Pro and Max buyers are paying for nothing on retention.** Since nothing is ever deleted, their "Unlimited retention" is what Free already gets, and Free's "30-day retention" is a promise nobody enforces.
2. **The hosting plans may break their own terms [UNVERIFIED which plans are used].** The compare pages advertise "free tiers" (`lib/dictionaries.ts:217`). Vercel Hobby "is restricted to non-commercial personal use" (https://vercel.com/docs/limits/fair-use-guidelines). Supabase Free pauses after 7 days of inactivity (https://supabase.com/docs/guides/platform/free-project-pausing).

---

### COUNT 7 · SEVERE: The anti-spam is weaker than sold, and it bans innocent people permanently.
**Sold as four layers, it delivers roughly one and a half. Its bans are permanent, apply across all tenants, and hit whole shared IPs.**

**Evidence**
- **Proof-of-work only applies to JSON** (`route.ts:637`). A form-encoded post skips it, and the agent docs admit it ("Native HTML posts skip the proof-of-work", `lib/agentDocs.ts:7`). The CORS check only runs when `Origin` exists (`:383`), so a bot omits it.
- **The "reverse-DNS VPN/cloud blocking" is inert.** Submissions are blocked only if the exact PTR string is already on the blacklist (`route.ts:320-321`, `lib/blacklist.ts:10`). `HOSTING_KEYWORDS` only chooses the reason label (`lib/dnsLookup.ts:60-62`).
- **The honeypot name is already known to bots.** Formspree's docs say "some spammers are aware of" `_gotcha` (https://help.formspree.io/articles/building-your-form/honeypot-spam-filtering/).
- **The bans.** One honeypot hit, or 12 submissions per minute from one IP *across all tenants* (`route.ts:416-419`), writes a **permanent** ban (`schema.sql:53-59`). On mobile networks many users share one carrier IP (CGNAT). Cloudflare found that Africa has "a much higher ratio of user agents to IP addresses than other regions" and that "CGNAT IPs are subject to rate limiting three times more often" (https://blog.cloudflare.com/detecting-cgn-to-reduce-collateral-damage/).
- **Proof-of-work costs humans far more than bots.**
  - I ran the documented browser loop (`app/docs/page.tsx:26-32`) on a 2.1 GHz Xeon in Node. It measured **71 µs per hash, or ~5.8 s average** over 10 solves. The expected work is 65,536 hashes, and the 95th percentile is ln(0.05)/ln(1−2⁻¹⁶) ≈ 196k hashes, about 14 s.
  - A native loop solved it in 0.10 s.
  - The docs say it costs a human "~a blink" (`app/docs/page.tsx:30`). Low-end phone timing is **[UNVERIFIED]**.
- **The challenge is tied to one IP** (`lib/pow.ts:27, 54`). Apple warns that Private Relay IPs are shared and that apps should stop relying on client IP (https://developer.apple.com/icloud/prepare-your-network-for-icloud-private-relay/).

**Why it kills sales.** A Douala agency's clients mostly reach the web through MTN or Orange mobile data. One bot on a shared carrier IP silently locks out hundreds of real visitors from every Inlet form, forever. Only the author can undo it, from an admin panel whose 2FA runs on the same email pool.

**The two hidden behind it**
1. **"NLP filter" is a substring match** (Count 4). "AI spam-blocking" (`lib/dictionaries.ts:67`) only *labels* leads after they are stored (`lib/spamClassifier.ts:8`).
2. **Blocked visitors are told they succeeded.** Honeypot hits get a fake success (`route.ts:492-534`), so neither the visitor nor the tenant ever learns about the block.

---

### COUNT 8 · SEVERE: The substitute costs nothing, and the differentiators are already commodities.
**An AI agent plus Resend replaces the core product in one sitting, and competitors already ship the "AI-agent" edge.**

**Evidence**
- **The product itself was built this way.** 92 of 109 commits carry `Co-Authored-By: Claude …` (`git log --all`).
- **The substitute is small and free.** Resend's Next.js guide is about 15–20 lines (https://resend.com/docs/send-with-nextjs). Resend Free gives 3,000 emails/month (https://resend.com/pricing).
- **Inlet's own docs make the point.** They tell users "paste this prompt and your AI does the whole integration, correctly, on the first try" (`app/docs/page.tsx:105`). The same agent can write the backend.
- **The AI-agent edge is already taken.**
  - Formspree ships a one-prompt agent setup flow (https://formspree.io/ai/).
  - Formcarry includes an MCP server **on its free plan** (https://formcarry.com/pricing).
  - Tally ships an MCP server (https://tally.so/pricing).
  - splitforms offers MCP "on every plan, including Free" (https://splitforms.com/pricing, search snippet).
- **The repo teaches the whole architecture.** Anyone can read the pricing, the email-pool method and the spam rules.

**Why it kills sales.** Inlet's core pitch is "no email plumbing" (`lib/dictionaries.ts:113`). In 2026 that plumbing is a one-prompt job, and every serious competitor already offers the agent tooling that Inlet calls its moat.

**The two hidden behind it**
1. **The main target buyer is the one most able to build it themselves.** The Pro blurb is "For agencies" (`lib/dictionaries.ts:90`), and agencies employ the developers who drive these agents.
2. **"Two minutes to integrate" is now the baseline.** Every competitor claims it, so it no longer differentiates anyone.

---

### COUNT 9 · SERIOUS: Nobody can find it.
**A free subdomain with a double-t name, a brand shared with several other software companies, no search presence, and French served by default to most of the world.**

**Evidence**
- **No inherited authority.** `vercel.app` is on the Public Suffix List (https://publicsuffix.org/list/public_suffix_list.dat, line 16269), so `inlett.vercel.app` starts from zero.
- **No search presence.** Web searches for `site:inlett.vercel.app` and "Inlet form backend" returned nothing about the product (WebSearch, US index, which is not Google). The 2026 roundups do not list it (https://forminit.com/blog/best-form-backend-services-2026/, https://splitforms.com/blog/form-backend-alternatives-to-formspree).
- **Name collisions.** inlets.dev (a developer tunnelling tool), inletai.com (a PitchBook-profiled automation company), inlet.tech and inlet.io (search, 2026-09-28).
- **Locale policy.** It serves **French** to every country not on a 16-country list, including Canada, Germany, Brazil and the Netherlands. The country header outranks the browser's language setting (`lib/i18n.ts:14-21, 34-36`).

**Why it kills sales.** The compare pages chase "X alternative" searches that competitors' own long-running alternative pages already own. Formcarry, splitforms, Static Forms, FormGrid and Forminit all publish them (search results above).

**The two hidden behind it**
1. **Any authority it builds is lost later.** Moving to a real domain resets whatever it earned.
2. **The growth loop reaches the wrong people.** "Powered by Inlet" (`emails/AutoReply.tsx:88`) goes to *the tenant's customers*, such as a plumber's clients, who are not form-backend buyers.

---

### COUNT 10 · SERIOUS: The paid tiers are mostly features that don't exist or are given away free.
**Of Pro's six advertised bullets, only unlimited forms and the white-label footer are real differentiators. Solo's CSV and analytics are free for everyone.**

**Evidence**
- **Nothing enforces most plan flags.** `csvExport`, `priorityDeliverability` and `retentionDays` have 0 references outside `lib/plans.ts`. The client dashboards have no plan checks.
- **"Unlimited AI assistant" is a support bot.** It is a chat bot told to "Stay strictly on topic: Inlet" (`lib/ai.ts:78, 219-221`).
- **CSV export stops at 1,000 rows.** It exports only the 1,000 newest rows (`lib/actions.ts:785`) under a button labelled with the all-time count (`components/client/FormDashboardClient.tsx:92`). A Max tenant with 10,000 leads a month cannot export one month.
- **Price per 1,000 submissions (entry paid tiers).**

  | Product | Price | Submissions | Per 1,000 |
  |---|---|---|---|
  | Inlet Pro | $19 | 2,500 | **$7.60** |
  | Formspree | $20 | 2,000 | $10 |
  | Forminit | $15.83 | 5,000 | $3.17 |
  | Web3Forms **[SECONDARY]** | ~$12.4 | 10,000 | $1.24 |
  | splitforms | $5 | 5,000 | $1 |
  | Static Forms **[SECONDARY]** | $7.50 | 25,000 | $0.30 |

- **The free tier is small.** Inlet Free gives 50 submissions. Web3Forms and Formspark give 250, splitforms and Static Forms give 500, and Tally and Netlify are unlimited (see the lineup below).

**Why it kills sales.** An unknown brand priced in the middle of the market has neither the trust that justifies premium pricing nor the price of the budget options.

**The two hidden behind it**
1. **Free auto-replies make the product an open relay.** Most competitors put autoresponders on paid plans: Formspree Professional, Basin Growth, Forminit Business, Web3Forms Pro. FormSubmit is the exception. Inlet gives them to Free (`lib/dictionaries.ts:81`) and switches them on by default (`app/api/client/forms/route.ts:131`). Combine that with sign-up that needs **no email verification** (`app/api/auth/client-signup/route.ts:17-102`, which logs the user in immediately) and a sender display name set by the tenant (`lib/email.ts:209`). An abuser can then aim free accounts at arbitrary inboxes, drain the shared pool and trigger a Brevo suspension. **The first abuser, not the first customer, decides the outcome.**
2. **An agency plan with no team seats.** The plan sold "for agencies" has no team accounts and caps each account at **3 devices**, evicting the oldest session (`lib/clientSessions.ts:12`). Formspark Free already allows 5 team members (https://formspark.io/pricing).

---

### COUNT 11 · SERIOUS: The basics buyers compare on are missing.
**No integrations, no multipart file uploads, no self-serve settings, no status page, no SLA.**

**Evidence**
- **No integrations.** There are zero matches for Zapier, Slack, Sheets, Notion, Airtable, Discord or Telegram in `app lib components`. Formspree gives Slack, Discord and Telegram *on Free* (https://formspree.io/plans).
- **Standard file uploads break.** A normal `<input type=file>` arrives as the text `"[object File]"` (`route.ts:451-454`). Files only work as base64 from JavaScript, under a 6 MB body cap (`:71`).
- **Tenants cannot change their own form settings.** Auto-reply text, success URL and origins are admin-only (`lib/actions.ts:328-337, 363-365`).
- **No status page or SLA.** `/status` returns 404. Formcarry Enterprise lists a 99.9% SLA (https://formcarry.com/pricing).
- **Notification emails may not finish sending [UNVERIFIED in production].** They are "fire-and-forget" (`route.ts:769, 805`) with no `after()` or `waitUntil`, and the codebase has zero uses of either. Next.js says serverless platforms need `waitUntil` to keep work alive after the response (https://nextjs.org/docs/app/api-reference/functions/after).
- **English sites send French auto-replies.** The auto-reply defaults to **French** unless `_lang` is sent (`route.ts:546`), and the agent-install HTML snippet omits `_lang` (`lib/agentDocs.ts:7`). A US site gets an English subject (`app/api/client/forms/route.ts:132`) over a French body (`emails/AutoReply.tsx:46`).

**Why it kills sales.** A buyer runs a checklist, and Inlet fails most rows while showing off MCP and 2FA.

**The two hidden behind it**
1. **Every missing basic is a support ticket to one person** who has not committed in 51 days.
2. **The priorities are inverted.** The code has a DevTools-detecting DOM-wipe hook (`lib/useAntiScraping.ts`) and an anti-account-sharing registry, but no way to delete a lead.

---

### COUNT 12 · AGGRAVATING: Every trust signal points the wrong way.

**Evidence**
- **Three names in three weeks.** "mwcrea Forms" (`NOTE.md:1`, `README-english.md:1`), then "King E Forms" (commit `e0be175`; still `lib/ai.ts:19`), then "Inlet". The package is still named `logiciel-formulaire` (`package.json:2`).
- **Dead or empty signals.** The GitHub homepage `https://forms-central.vercel.app` returns 404. The repo has 0 stars and no license.
- **Testimonials added on day 18.** Two anonymous "Early user" quotes plus the creator's own (`lib/dictionaries.ts:155-157`), added in commit `023ccee` on 2026-07-24, 18 days after the first commit.
- **Plaintext passwords by email.** Temporary passwords are sent in the clear (`lib/email.ts:257-261, 310-314`).
- **A personal address in the code.** A personal Outlook address is the fallback sender (`lib/email.ts:16`).

**Why it kills sales.** A buyer judges a form backend, which holds their customers' data, on whether it looks like it will still exist next year. Every item above says "side project".

**The two hidden behind it**
1. **No company, no address.** There is no legal entity to invoice, sue or trust.
2. **Who owns the code? [UNVERIFIED]** The spec is an agency's *internal* tool ("Micro-service de Formulaires Interne", `cahier_des_charges.md:1`) that mentions "le stagiaire". Chain of title is an open due-diligence question for any acquirer or large client.

---

### COUNT 13 · AGGRAVATING: The founder signal is a sprint followed by silence, and the effort went into the wrong places.

**Evidence**
- **Timeline.** 107 commits in 19 days, then 2 on 2026-08-08, then **51 days of silence** (`git log --all`).
- **Size.** 54 page and route files and 23 migrations. MCP, portals, 2FA, OAuth, analytics and an AI chat were all built. Checkout, legal pages and integrations were not.

**Why it kills sales.** A form backend is infrastructure. Buyers choose infrastructure for continuity, and this history signals the opposite.

**The two hidden behind it**
1. **The strategy never went beyond copywriting.** SEO pages and a viral loop were the last commits, shipped before anyone could pay.
2. **The polish fixed the wrong things.** The UX polish passes fixed dark-mode contrast while the CORS dead-end (Count 2) went unnoticed.

---

## The competitor lineup (checked live 2026-09-28)

| Competitor | Free tier | Entry paid | What they have that Inlet lacks | Source |
|---|---|---|---|---|
| **Formspree** | 50 subs/mo, unlimited forms, Slack/Discord/Telegram | Personal $10/mo (200); Professional $20 (2,000) | Sheets/Notion/Airtable/Zapier, file uploads (1–10 GB), team members, custom email domains, SLAs, agent claim-URL flow, Vercel integration | https://formspree.io/plans · https://formspree.io/ai/ |
| **Basin** | 50/mo, 1 form, Zapier | Starter $12.50/mo yearly (250); Growth $24.17 (1,000) | 14-day trial, branded auto-responses, Sheets/Slack, custom domains, SMTP support, virus scanning | https://usebasin.com/pricing |
| **Forminit (ex-Getform)** | 100/mo, 1 form, 100 MB uploads | Pro $15.83/mo yearly (5,000) | Zapier/Sheets, retention controls, since 2015, renamed Jan 2026 | https://forminit.com/pricing/ |
| **Web3Forms** | 250/mo, 30-day history | Pro ≈$12/mo yearly (10,000) | No-account setup, Turnstile/reCAPTCHA | search snippet + https://merginit.com/blog/24062026-free-form-backend-services-comparison **[SECONDARY]** |
| **Formspark** | 250 subs, 10 forms, 5 team members | $25 **one-time** for 50,000 | Non-expiring bundles, Slack/Zapier/Sheets/Notion | https://formspark.io/pricing |
| **FormSubmit** | Free, no registration | — | Autoresponse, webhooks, "6 million submissions from 400,000 websites" | https://formsubmit.co/ |
| **Formcarry** | 1 form, 50/mo, **MCP server** | Starter $5/mo yearly (500, 3 seats, white-label) | MCP on Free, team seats, 99.9% SLA (Enterprise) | https://formcarry.com/pricing |
| **Static Forms** | 500/mo | Pro $7.50/mo yearly (25,000) | Custom email domain, dashboard | search snippet, https://www.staticforms.dev/pricing **[SECONDARY]** (page returned 429) |
| **Netlify Forms** | "free and unlimited" on credit-based plans | — | Zero-setup for Netlify sites | https://docs.netlify.com/manage/forms/usage-and-billing/ |
| **Tally** | Unlimited forms and submissions (fair use), webhooks, integrations | Pro $24/mo | Payments, logic, MCP server | https://tally.so/pricing |
| **Jotform** | 5 forms, 100 subs | Bronze $34–39/mo (1,000) | No-code builder, 35M users | https://www.jotform.com/pricing/ |
| **splitforms** (new entrant) | 500/mo, dashboard | Pro $5/mo (5,000) | MCP on every plan | https://splitforms.com/pricing (search snippet) |
| **DIY: agent + Resend** | 3,000 emails/mo | Pro $20/mo (50,000) | Your own code, no vendor | https://resend.com/pricing |
| **Inlet** | 50 subs, 3 forms | Solo $9 (500); Pro $19 (2,500) | — | `lib/plans.ts:38-111` |

---

## The buyer walk-throughs

**1. Camille, freelance developer, Paris.**
- *Arrival.* Camille lands on `/compare/formspree`. It is served in French by geo (`lib/i18n.ts:34-36`). They read "Auto-hébergé — vous possédez les données" and look for self-host instructions. The site has none. The repo has no license, and its README tells them to make the uploads bucket **Public** (`README.md:125`).
- *Legal check.* Their clients are French SMEs, so Camille needs a DPA and a sub-processor list. Neither exists, and there is not even a *mentions légales* page.
- *Trial.* Camille signs up anyway. They accept no terms, because none are shown, and get no email verification. They create a form and paste the helper into their Astro site. The preflight returns **403 CORS_NOT_ALLOWED**, and the remedy tells them to edit "Allowed Domains". They have no such field (Count 2). They try the plain HTML form and get a 403 as JSON.
- *Support.* The only contact anywhere is a Gmail `mailto:`.
- ***Bounces*** to Formspree Free (unlimited forms, working in minutes) or to Claude + Resend.

**2. Brice, 4-person web agency, Douala.**
- *Fit.* This is Inlet's best-fit buyer: French by default, many client sites, white-label portals for clients like "ImmoPro".
- *Paying.* Brice finds USD pricing and a Gmail link, with no card checkout, Mobile Money or local invoice (Count 1).
- *Team.* Brice's team of four shares one login, and the 3-device cap evicts whoever logs in fourth (`lib/clientSessions.ts:12`).
- *First incident.* Visitors to Brice's client sites are on MTN and Orange mobile data. On a property-launch day, a scraper trips `_gotcha` from a carrier IP. That IP is banned forever, across every Inlet form (Count 7), and the leads of Brice's clients stop arriving. Meanwhile, the bilingual real-estate site's English "investment" enquiries were already vanishing (Count 4). Under Law 2024/017, those clients' leads are being exported without authorisation (Count 6).
- ***Churns*** after the first incident, having never paid.

**3. Jake, indie hacker, US.**
- *First impression.* Jake gets English and sees `inlett.vercel.app` with a double t, "Self-hosted" on a hosted sign-up, anonymous testimonials, no terms and no privacy page.
- *Price.* Jake compares $19 for 2,500 submissions against splitforms at $5 for 5,000, Static Forms at $7.50 for 25,000, Formspark at $25 one-time, or Netlify Forms free.
- *Setup.* Jake asks Claude Code: "add a contact form with Resend". It is done before Inlet's pricing page has finished comparing itself to Getform. Had they used Inlet's plain-HTML snippet, their US customers would have received "Merci pour votre message" (Count 11).
- ***Bounces*** on trust and price in under a minute.

**4. Sophie, operations lead, 60-person B2B SME, Lyon (vendor questionnaire).**

| Questionnaire item | What Sophie finds |
|---|---|
| Legal entity | "King_E" |
| Contract and SLA | None; `/status` returns 404 |
| DPA and sub-processors | None published. The code reveals Supabase, Vercel, six free Brevo accounts, free Gemini keys, Groq and Mistral |
| Data residency | Unknown. The function region served to us was `iad1` (response header) |
| Erasure | Impossible for tenants: no delete path exists |
| Security | Public attachments; the operator reads all leads; plaintext temporary passwords |
| Invoice with VAT | None |

- ***Fails at line 1*** of the questionnaire.

---

## Charges dropped (investigated, not supported)

1. **Committed secrets.** A history scan for Brevo, Google, Groq and JWT key patterns found **0**. No `.env` file is tracked.
2. **Inflated social proof.** There are no fake user counts or "trusted by" logos. The testimonials section says "Inlet is new … including the team that built it" (`lib/dictionaries.ts:153`). It is weak, not fraudulent.
3. **Whole-provider reverse-DNS bans.** Refuted. Blocks match the exact PTR string (`lib/blacklist.ts:10`), and the keyword list never blocks by itself (`lib/dnsLookup.ts:60-62`). This became part of Count 7 as "inert layer".
4. **VPN users blocked by default.** Refuted for the same reason. They are hit only if their exit IP was banned before, which is the CGNAT problem in Count 7.
5. **No plain-HTML path.** Refuted. It exists (`route.ts:441-448`). It fails for a different reason (Count 2).
6. **The AI classifier deletes leads.** Refuted. It only labels them (`lib/spamClassifier.ts:8`).
7. **Open redirect.** Refuted by `safeRedirect` (`route.ts:81-106`).
8. **Cross-tenant leakage via MCP.** Refuted. `get_submissions` filters on `client_id` (`app/api/[transport]/route.ts:90`).
9. **"No payment rail is possible for a seller outside Stripe's countries."** Refuted. Paddle's unsupported list is short. Only Stripe and Lemon Squeezy have narrow country lists.
10. **"Anyone may legally clone and sell it."** Refuted. With no license, all rights are reserved. The practical substitute remains (Count 8).
11. **Gemini key pooling as a clear terms violation.** Not proven. Google limits apply "per project, not per API key" (https://ai.google.dev/gemini-api/docs/rate-limits). Google APIs Terms §2d bars circumventing limits (https://developers.google.com/terms), but I found no explicit multi-project clause. The stronger Gemini charge is the personal-data one (Count 6).
12. **Anti-DevTools DOM wiping harms customers.** Refuted. It is used only in `components/admin/AdminShell.tsx:10`.
13. **Proof-of-work makes the site unusable on phones.** Not proven. It was measured only on a server CPU, so it stays a latency cost in Count 7.

---

## Closing argument

The defense will point to the craft: bilingual everything, an MCP server, signed webhooks, white-label portals. That craft is real, and it is the problem. Nineteen days of effort went into surfaces a buyer only sees *after* paying, and none into what lets a buyer pay, trust or succeed on day one:
- a checkout (Count 1)
- a working self-serve CORS path (Count 2)
- owned email capacity (Count 3)
- a filter that doesn't eat leads (Count 4)
- a true headline (Count 5)
- a privacy policy (Count 6)

Every flaw hides two more:
- The email pool hides the shared reputation and the fictional "priority deliverability".
- The spam filter hides the permanent CGNAT bans and the fake success responses.
- "Self-hosted" hides the operator's all-tenant admin view and the missing license.

Meanwhile the market has moved:
- Getform is Forminit.
- Formcarry and splitforms give MCP away free.
- Netlify gives forms away free.
- A developer's own AI agent writes the whole thing for a few lines of code and a free Resend key.

**Requested sentence: KILL the hosted Inlet SaaS as currently sold.** It cannot take money, cannot deliver the volume it sells, silently loses leads it promises to keep, and has no moat against a one-prompt substitute. The Prosecution does not object if the Court lets the author keep the code as their own agency's internal tool, which is what `cahier_des_charges.md` asked for. But it must not be sold to strangers until Counts 1–7 are cured.

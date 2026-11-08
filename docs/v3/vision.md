# Inlet — the vision, where we are, and the road to a first "baffled bar"

Written 2026-11-08 for the author, in answer to "explain to me exactly what
your vision is, what you know, what you think, where we're heading to, and how
we can get to the first version of baffled bar". It is a thinking document, not
a coding plan. The decisions ledger stays in `README.md` of this folder; the
facts quoted here come from the code and from production as of today.

## 1. The thesis in one breath

Inlet is the lead back-office for people who build websites for other
businesses. Not "a form backend" — there are twenty of those — but the only one
whose unit of organisation is the **client**: every form belongs to a business
the developer works for, the leads reach that business by e-mail and in a
private, branded inbox, and the developer keeps one dashboard, one API and one
MCP server across all of them. The site itself ships two public values and never
an e-mail address. That sentence is the product, the pricing, the docs and the
hero. Everything that does not serve it is noise.

Why this wins where generic form backends do not: a freelancer or studio with
eight client sites does not want eight Formspree accounts, nor one account that
mixes a dentist's leads with a gym's. They want to hand each client a clean inbox
under the studio's name, keep the keys, and never touch SMTP. That is a job
nobody else sells; it is the job the author has done by hand for the Boxing
Center sites, which is why the product exists.

## 2. What I know (facts, not hopes)

- **Production** runs at eam-inlet.vercel.app on the author's own Vercel
  account, deployed from GitHub (`EddyEtame/inlet`, branch `main`; the primary
  `Eddy-etame/Forms-Central` receives the same pushes). Database: Supabase
  `Logiciel-formulaire`, EU region, migration v22 applied.
- **The model holds end to end** and is proven by four live suites on every
  deploy: submit pipeline (15 checks), developer/clients/portal (37+),
  MCP (24), real UI through Playwright (24, zero browser errors).
- **Security**: every route scopes by owner; webhooks are signed and may only
  target public https hosts; passwords are scrypt-hashed and capped; API keys
  are stored hashed; the attachment bucket is private and files are served
  only to the lead's owners; anonymous AI use is capped per cookie and per
  address; the admin area hides behind an indistinguishable 404.
- **Truth**: the public claims were audited twice against the code. What the
  pages say about anti-spam, retention, plans and e-mail is what happens.
- **Legal**: privacy policy and terms exist in both languages and describe the
  real processing. Hosting is in the EU; some providers (AI models) are not.
- **Business plumbing is manual**: paid plans are requested from the dashboard
  and activated by hand; no card checkout; the operator's own two accounts are
  on the unlimited plan so retention never touches the author's leads.
- **Users today**: ten developer accounts, twenty-one forms, a handful of
  leads — all but five accounts are the author's own client sites. Five
  external developers still post to the old origin (notice drafted, not sent).

## 3. What I think (judgement, stated as such)

1. **The product is ahead of its distribution.** Nothing in the code blocks the
   first paying customer; the absence of a card checkout and of any outbound
   channel does. The next weeks are about the first ten strangers, not the next
   ten features.
2. **The client inbox is the wedge, and it is still too thin.** It lists leads
   and exports CSV. A business owner will log in once, see a table, and go back
   to e-mail. The inbox earns its place when it does three things e-mail
   cannot: mark a lead handled, reply from the inbox with the developer's
   branding, and show the week at a glance (how many, from which page, how fast
   answered). That is the "+1" no form backend offers.
3. **The developer surface is good, not yet memorable.** The onboarding is
   three steps and works. What would make a developer talk about it: the MCP
   flow where their assistant sets a whole site up in one call — already built,
   under-shown. The docs explain it; the landing page should demonstrate it.
4. **Design sits at "clean SaaS"**, with the EAM accent on the dark surfaces.
   It is not generic any more, but the dashboard and the inbox still look like
   every Tailwind admin. Baffled is reached when the inbox looks like something
   the client's own designer made for them: the client's colours and logo
   everywhere, the developer's signature, one typographic idea carried through.
5. **The riskiest line of code is retention.** It deletes. It has already
   deleted once by surprise. It is scheduled again with three locks and an
   unlimited plan for the author's accounts; it still deserves a dry-run report
   e-mailed to the operator before each real run. That is the next safety
   feature, before any new product feature.

## 4. Where we are heading — the first baffled bar, defined

"Baffled bar v1" is not a mood. It is the state where each of these can be
checked by a stranger in ten minutes:

| Surface | Baffled when… | Today |
|---|---|---|
| Landing | A studio owner understands the client model in 5 seconds, sees the MCP setup live, and finds nothing untrue or generic. | Model clear; MCP not demonstrated; copy honest. |
| Onboarding | From signup to the first lead in the client's inbox in under 4 minutes, with no reading. | 3 steps, works; the invite e-mail is the weak step. |
| Dashboard | A developer with 12 clients finds any lead in 2 clicks; nothing mixes clients. | Done; search by client missing. |
| Client inbox | A business owner prefers it to their mailbox: handled/unhandled, reply, weekly view, their brand everywhere. | Table + CSV only. |
| E-mails | Notification and auto-reply look like the client's own, render in Gmail/Outlook/Apple Mail, never land in spam. | Branded; deliverability unproven at volume. |
| API + MCP | An AI assistant can set up a site, read leads and verify webhooks without reading docs. | 14 tools, proven; needs the showcase. |
| Security | Nothing leaks across tenants; every secret is hashed, rotated or scoped. | Audited; private bucket done. |
| Operations | Backups durable and automatic; retention reports before it deletes; health visible. | Backups manual; dry-run report missing. |
| Business | A card pays for a plan the same minute; invoices exist; the free plan converts. | Manual activation. |
| Trust | Legal pages, a status of what is and is not promised, a real contact. | Pages live; contact is a personal mailbox. |

## 5. How we get there — order, and why this order

1. **Make deleting safe** (half a day): the retention job e-mails the operator
   a dry-run summary and only applies after a 24-hour window; automatic daily
   backup to a bucket outside the database. Rationale: the one thing that can
   lose trust permanently is lost leads.
2. **Checkout** (one to two days): card payment for Solo/Pro/Max with plan
   activation on webhook, invoices from the provider, the request-by-e-mail
   path kept as fallback. Rationale: the first €1,000 is literally blocked by
   this.
3. **The inbox earns its name** (two to three days): handled/unhandled with a
   count, reply from the inbox (sent through the developer's sender, logged),
   the week view, the client's brand on every surface. Rationale: this is the
   feature a developer shows their client to justify the invoice line.
4. **Show, don't tell, on the landing** (one day): a real recording of the MCP
   setup, the inbox as the client sees it, the e-mail as the visitor receives
   it. Rationale: the claims are true; now they need to be visible.
5. **Distribution** (continuous, starts the same week): the five external
   developers moved to the new origin and asked for one sentence of feedback;
   the author's own client sites as case studies; one integration guide per
   framework published where developers search. Rationale: the product cannot
   find its first stranger by itself.
6. **Then the second hater pass** on everything above, because the first
   baffled bar is never the last: new surfaces bring new biases.

## 6. The biases I expect us to find later

- **Operator's eye**: I have tested as the operator, with the operator's data.
  Real developers will name forms badly, paste the wrong origin, invite the
  wrong e-mail. Every error message was written for someone who already knows
  the model.
- **French first, English after**: both languages exist, but the French was
  written first in most places; the English sometimes reads like a translation.
  A native read of both, surface by surface, is overdue.
- **The mock dashboard on the landing** shows numbers no free account will see
  in its first month. It sets an expectation the onboarding then has to meet.
- **Dark dashboard by default** pleases developers and may not please the
  business owner in the client inbox, which is light. Two surfaces, two moods —
  deliberate, but untested with a real client.
- **Retention windows** on the free plan are a pricing lever and a trust risk at
  once; the first developer who loses a lead will not read the pricing table.

## 7. What I do not know

Whether a studio will pay $19 a month for this rather than keep forwarding
e-mails; whether the client inbox is used at all once the novelty passes;
whether deliverability holds when ten sites send auto-replies through shared
senders; which of the five external developers are alive. Each of these is a
question for the first ten strangers, not for more code.

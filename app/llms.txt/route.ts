import { SITE_URL } from '@/lib/seo';

/**
 * /llms.txt — curated, quotable map of the product for AI engines (GEO).
 * llmstxt.org convention: an H1, a blockquote summary, then linked sections.
 * Single source of truth so the Links section always follows SITE_URL.
 *
 * Every sentence here is true of the shipped product today. Nothing is
 * promised that the code does not do (truth pass, 2026-10-29).
 */
export const dynamic = 'force-static';

export function GET() {
  const body = `# Inlet

> The form backend for developers who build websites for clients. A developer
> creates clients; every form belongs to a client; each lead reaches the client
> by e-mail and in a private inbox. The developer keeps one dashboard, an API
> and an MCP server, so an AI coding agent can do the whole integration in one
> call. No SMTP in the website, no e-mail address in the code.

## What it is
Inlet is a multi-tenant form backend. A website POSTs its form fields to a form
URL; Inlet stores the lead, e-mails the client that owns the form (and, if
wanted, a copy to the developer), and sends the visitor a branded auto-reply.
The website holds two public values — FORM_API_URL and FORM_ID — and never an
e-mail address, an SMTP credential or an API key.

## The model: developer → clients → forms → leads
- A DEVELOPER (freelancer, agency, studio) signs up. Only developers sign up.
- The developer creates CLIENTS: the businesses they build sites for. A client
  has a name, an e-mail (where leads go) and a language (fr/en).
- Every FORM belongs to exactly one client. Creating a form means choosing its
  client; the form's leads go to that client's e-mail.
- A client can open its own LEAD INBOX (a private portal) through a
  set-password link the developer sends. No password is ever e-mailed.
- The developer sees every form, every client and every lead in one dashboard,
  with CSV export and per-form settings (origins, auto-reply, success page,
  webhook, on/off).

## Integration (browser, 2 minutes)
1. Create a form in the dashboard (or let an AI agent call setup_site).
2. Copy the generated code for the stack: HTML, React, Astro, Vue, Svelte,
   WordPress. The code contains only FORM_API_URL and FORM_ID.
3. The helper (inlet.js) fetches a proof-of-work challenge from
   GET /api/challenge, solves it, and POSTs the fields to
   POST /api/submit/{FORM_ID} with a hidden empty \`_gotcha\` honeypot field and
   an optional \`_lang\` ("fr" | "en") for the auto-reply language.
Plain HTML forms can also POST directly (no JavaScript); the proof-of-work is
then skipped and the other spam gates still apply.

## Integration (server relay, for stacks with a backend)
A Next.js route or Astro endpoint can forward the fields server-to-server with
\`Authorization: Bearer <INLET_API_KEY>\` and \`X-Inlet-Visitor-IP\`. A trusted
relay skips CORS and proof-of-work; the key lives only in the server env.

## MCP server (for AI coding agents)
Endpoint: POST ${SITE_URL}/api/mcp (Streamable HTTP) with
\`Authorization: Bearer kef_…\` (an API key from the developer dashboard).
Tools: whoami, list_clients, create_client, invite_client, list_forms,
create_form, setup_site, get_embed, set_origins, set_autoreply, assign_form,
get_form_health, list_leads, get_lead. \`setup_site\` goes from zero to a live
form in one call: it finds-or-creates the client, creates the form with origins
derived from the site URL, and returns the exact files for the framework.
Lead content returned by the tools is marked as untrusted visitor text.

## Security
- Spam: hidden honeypot, proof-of-work challenge, keyword filter (suspect leads
  are kept and flagged, never silently dropped), reverse-DNS cloud/VPN check,
  rate limits per IP with temporary bans. Blocked attempts are logged.
- Origins: each form lists the sites allowed to post to it (CORS).
- Access: developers sign in with password + e-mail OTP two-factor; clients get
  single-use set-password links; attachments are served only to the owners of
  the lead; API keys are hashed at rest and revocable.
- E-mail: one SMTP provider, every send logged; a failed send is recorded as a
  failure, never reported as delivered.

## Plans (monthly, USD; EUR invoicing opens with the company)
Free $0: 3 forms, 2 clients, 50 submissions/mo, 20 e-mails/day, API + MCP.
Solo $9: 10 forms, 10 clients, 500 submissions/mo, 100 e-mails/day, CSV +
analytics, custom sender, 1-year retention. Pro $19: unlimited forms, 50
clients, 2,500 submissions/mo, 300 e-mails/day, white-label, 500 AI messages.
Max $49: unlimited clients, 10,000 submissions/mo, 1,000 e-mails/day, priority
support. Over quota, leads keep being stored — only outgoing e-mail pauses.
Paid plans are requested from the dashboard and activated the same day.

## Frequently asked
Q: Does the website need SMTP or an e-mail library? A: No. The site holds only
FORM_API_URL and FORM_ID.
Q: Does the client's e-mail appear in the page? A: Never. It is stored on the
form's client, server-side.
Q: Which frameworks? A: Any browser JavaScript or plain HTML: Astro, Next.js,
Nuxt, Vue, Svelte, WordPress, static sites; plus server relays for Next.js and
Astro.
Q: Can an AI agent do the integration? A: Yes — through the MCP server
(setup_site) or by following ${SITE_URL}/llm-install.md.

## Links
- Home: ${SITE_URL}/
- Docs (EN/FR, every stack): ${SITE_URL}/docs
- Pricing: ${SITE_URL}/pricing
- AI agent install file: ${SITE_URL}/llm-install.md
- Claude Code skill file (.claude/skills/inlet/SKILL.md): ${SITE_URL}/inlet-skill.md
- Developer sign-up: ${SITE_URL}/developer/signup
`;
  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}

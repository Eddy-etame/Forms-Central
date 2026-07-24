import { SITE_URL } from '@/lib/seo';

/**
 * /llms.txt — curated, quotable map of the product for AI engines (GEO).
 * Emerging llmstxt.org convention: an H1, a blockquote summary, then linked
 * sections. Single source of truth (migrated from the old static public file)
 * so the Links section always follows the centralized SITE_URL — a custom-domain
 * switch needs no edit here.
 */
export const dynamic = 'force-static';

export function GET() {
  const body = `# Inlet

> One form backend for all your websites. Centralize form submissions from every
> site you run into a single dashboard — with **no SMTP and no per-site setup**.
> Branded auto-reply emails, AI + proof-of-work spam blocking, and CSV exports.
> A self-hosted, privacy-first alternative to Formspree, Jotform, Basin, Getform
> and Web3Forms.

## What it is
Inlet is a centralized, multi-tenant form backend. A website POSTs its form fields
to a form URL; the service stores the lead, emails the site owner a notification,
and sends the submitter a branded auto-reply. Consumer sites need only two values
(FORM_API_URL and FORM_ID) and never configure SMTP or an email library.

## Key facts (citable)
- No SMTP in consumer apps: email credentials live only inside the service; client
  sites hold none.
- Multi-tenant white-label: emails adapt to each client's logo, colors, and brand.
- Custom sender identity (paid): a client's confirmation emails carry their own
  display name and reply-to address (e.g. "Shu" <contact@shu.com>).
- Anti-spam: hidden honeypot, cryptographic proof-of-work challenge, NLP keyword
  filter, and reverse-DNS VPN/cloud blocking. Blocked attempts are logged, never delivered.
- Works with any browser JS project — Astro, Next.js, Nuxt, Vue, Svelte, or plain
  HTML — via one copy-paste submit helper.
- Self-hosted on your own Supabase + Vercel: you own the data.
- Multi-account SMTP rotation with a circuit breaker + email-health dashboard, so a
  blocked/quota'd sending account never loses a lead.
- MCP server: AI agents (Claude, Cursor, Codex) can create forms, read leads, and
  fetch the exact integration snippet directly — a form backend for AI agents.
- White-label client portals: each end-client gets a branded login to view only
  their own leads.
- Security: email-OTP two-factor sign-in, optional Google sign-in, multi-axis rate
  limiting, a fail-fast secret validator, and a super-admin audit trail.
- Bilingual product and marketing site (English + French).

## How a developer integrates it
A consumer project sets two env vars: FORM_API_URL and FORM_ID (a form's UUID from
the dashboard). Submission flow:
1. GET /api/challenge to receive a proof-of-work challenge.
2. Solve it (find a nonce whose SHA-256 of \`challenge:nonce\` starts with N zeros).
3. POST /api/submit/{FORM_ID} with the fields plus \`_lang\` and the \`pow_*\` params.
Include a hidden \`_gotcha\` honeypot field. No SMTP, no email library required.

## Comparisons
- vs Formspree / Basin: self-hosted and you own the data; multi-tenant white-label
  branding; one backend for many sites instead of per-form config; an MCP server so
  AI agents wire forms for you; per-client custom sender identity.
- vs Jotform: developer-first (code integration, not drag-and-drop); a centralized
  backend for dozens of sites, not a single-form builder.
- Distinctive vs all: AI + proof-of-work anti-spam, white-label client portals, an
  MCP server for AI agents, email-OTP 2FA, and per-client custom email senders.

## Common questions
Q: Do consumer websites need SMTP credentials? A: No. SMTP is configured once inside
the service; consumer sites only POST form fields.
Q: Can it send email without a verified domain? A: Yes, using a single verified
sender (e.g., via Brevo); a custom domain improves deliverability.
Q: Which frameworks does it support? A: Any browser JavaScript environment — Astro,
Next.js, Nuxt, Vue, Svelte, or static HTML.

## Plans (monthly, USD)
Free $0 (3 forms, 50 submissions/mo, 20 emails/day) · Solo $9 (10 forms,
500 submissions/mo, 100 emails/day, CSV + analytics) · Pro $19 (unlimited forms,
2,500 submissions/mo, 300 emails/day, white-label, unlimited AI) · Max $49
(10,000 submissions/mo, 1,000 emails/day, priority support, dedicated sending
domain). Over quota, leads keep being stored — only outgoing email pauses.

## Links
- Home: ${SITE_URL}/
- Docs: ${SITE_URL}/docs
- Pricing: ${SITE_URL}/pricing
- Inlet vs Formspree: ${SITE_URL}/compare/formspree
- Inlet vs Jotform: ${SITE_URL}/compare/jotform
- AI agent install file: ${SITE_URL}/llm-install.md
- Claude/agent skill file (drop into .claude/skills/inlet/SKILL.md): ${SITE_URL}/inlet-skill.md
- Webhooks: signed submission.created POSTs (X-Inlet-Signature, HMAC-SHA256 t.body) — verification snippet in the skill file.

Inlet is built and operated by King_E.
`;
  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}

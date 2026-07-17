---
name: inlet-forms
description: Wire any website's forms to Inlet (form backend) — create the submit helper, add spam-safe fields, receive leads by email, and verify signed webhooks. Use when the user wants a contact/lead form without building a backend.
---

# Inlet forms — integration skill

Inlet is a form backend: the site POSTs form fields to a form URL; Inlet
stores the lead, emails the owner, sends a branded auto-reply, blocks spam
(honeypot + proof-of-work + AI classification), and can POST a signed webhook.

The user provides two values (from their Inlet dashboard):
- `FORM_API_URL` — the Inlet origin (e.g. https://forms-central-h1ee.vercel.app)
- `FORM_ID` — the form's UUID

## 1. Plain HTML form (no JavaScript)

```html
<form action="{FORM_API_URL}/api/submit/{FORM_ID}" method="POST">
  <input name="name" placeholder="Name" required />
  <input name="email" type="email" placeholder="Email" required />
  <textarea name="message" required></textarea>
  <!-- honeypot: keep hidden and EMPTY — bots that fill it are silently blocked -->
  <input name="_gotcha" style="display:none" tabindex="-1" autocomplete="off" />
  <!-- optional: where the browser is sent after success -->
  <input type="hidden" name="redirect_url" value="https://yoursite.com/thanks" />
  <button>Send</button>
</form>
```

## 2. JavaScript/AJAX submit (any framework)

AJAX submissions must solve a proof-of-work challenge (costs bots CPU):

```js
async function sha256Hex(text) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, "0")).join("");
}

export async function submitToInlet(fields) {
  const API = import.meta.env?.FORM_API_URL || process.env.FORM_API_URL;
  const ID  = import.meta.env?.FORM_ID || process.env.FORM_ID;

  // 1) fetch a challenge
  const c = await (await fetch(`${API}/api/challenge`)).json();

  // 2) solve it: find nonce where sha256("challenge:nonce") starts with N zeros
  let nonce = 0;
  while (!(await sha256Hex(`${c.challenge}:${nonce}`)).startsWith("0".repeat(c.difficulty))) nonce++;

  // 3) submit
  const res = await fetch(`${API}/api/submit/${ID}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...fields,               // name, email, message, …
      _gotcha: "",             // honeypot stays empty
      _lang: "en",             // auto-reply language: "en" | "fr"
      pow_challenge: c.challenge,
      pow_timestamp: c.timestamp,
      pow_nonce: String(nonce),
    }),
  });
  return res.json();           // { success: true } or { success:false, code, error, remedy }
}
```

Rules:
- Include an `email` field if the form should trigger the branded auto-reply.
- File uploads: send as `data:` base64 strings — Inlet stores them and swaps
  in download links.
- Error responses carry `code` + `remedy` — surface `remedy` to the developer.

## 3. Receiving webhooks (optional)

If the form has a webhook URL configured, every stored lead is POSTed:

```json
{ "event": "submission.created",
  "form": { "id": "…", "name": "Contact" },
  "submission": { "id": "…", "payload": { "name": "…", "email": "…" }, "created_at": "…" } }
```

Verify the `X-Inlet-Signature: t=<unix>,v1=<hex>` header (HMAC-SHA256 of
`"<t>.<rawBody>"` with the client's `whsec_…` secret):

```js
import crypto from "node:crypto";

export function verifyInletWebhook(rawBody, sigHeader, secret, toleranceSec = 300) {
  const parts = Object.fromEntries(sigHeader.split(",").map(p => p.split("=")));
  const expected = crypto.createHmac("sha256", secret).update(`${parts.t}.${rawBody}`).digest("hex");
  const fresh = Math.abs(Date.now() / 1000 - Number(parts.t)) < toleranceSec;
  return fresh && crypto.timingSafeEqual(Buffer.from(parts.v1), Buffer.from(expected));
}
```

Always read the RAW request body for verification (before JSON parsing).

## Notes

- Never invent endpoints: only `/api/challenge` and `/api/submit/{FORM_ID}` are public.
- CORS is enforced per form — the site's origin must be in the form's allowed list (or `*`).
- Rate limits apply (per IP); on 429, tell the user to slow down, don't retry-loop.
- Docs: {FORM_API_URL}/docs · Machine summary: {FORM_API_URL}/llms.txt

# Inlet — AI agent installation file

You are an AI coding agent. Your task: wire a form in this project to Inlet,
a form backend where every form belongs to a client. Follow this file exactly.
Do NOT add SMTP, nodemailer, or any e-mail library — Inlet does delivery.
Do NOT put any e-mail address in the page: the lead reaches the client through
the form id, server-side.

## Inputs you need from the user
1. `FORM_API_URL` — the Inlet origin (e.g. https://inlet-eta.vercel.app)
2. `FORM_ID` — the form's UUID. The user gets it in the dashboard
   ({FORM_API_URL}/developer/dashboard → New form → pick the client → copy),
   or you create it yourself through the MCP server if they give you an API key
   (`setup_site` in `{FORM_API_URL}/inlet-skill.md`).

Put both values in the project's env file with its native prefix
(`PUBLIC_` / `NEXT_PUBLIC_` / `VITE_`), or inline them — they are public.

## Step 1 — add the helper (browser JS, framework-agnostic)

```js
// inlet.js
const INLET_URL = "{FORM_API_URL}";
const INLET_FORM = "{FORM_ID}";

async function sha256(text) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function sendToInlet(fields, { lang = "fr" } = {}) {
  // 1. proof-of-work challenge (anti-spam; costs a bot CPU, a human ~a blink)
  const c = await (await fetch(`${INLET_URL}/api/challenge`)).json();
  let nonce = 0;
  const prefix = "0".repeat(c.difficulty);
  while (!(await sha256(`${c.challenge}:${nonce}`)).startsWith(prefix)) nonce++;

  // 2. submit
  const res = await fetch(`${INLET_URL}/api/submit/${INLET_FORM}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      _gotcha: "",            // honeypot — MUST be present and empty
      ...fields,
      _lang: lang,            // "fr" | "en" — auto-reply language
      pow_challenge: c.challenge,
      pow_timestamp: c.timestamp,
      pow_nonce: String(nonce),
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.success) throw new Error(data.remedy || data.error || `Inlet error ${res.status}`);
  return data;
}
```

## Step 2 — call it from the form's submit handler

```js
import { sendToInlet } from "./inlet";

await sendToInlet({
  name: values.name,        // any field names are accepted
  email: values.email,      // if present, the visitor gets the branded auto-reply
  message: values.message,
});
```

Show a success state after it resolves; show `error.message` otherwise.

## Field conventions
- `email` (any casing): triggers the auto-reply to the visitor.
- `name` / `nom`: personalises the auto-reply (`{{name}}`).
- `_lang`: `"fr"` | `"en"`.
- `_gotcha`: hidden honeypot. ALWAYS include it, ALWAYS empty. In HTML, render
  it visually hidden (off-screen), not `type="hidden"`.
- `redirect_url` (native HTML only): where the visitor lands after success.
- File fields: base64 data URIs as string values — Inlet stores them and shows
  download links to the lead's owners only.

## No-JavaScript fallback (plain HTML)
```html
<form action="{FORM_API_URL}/api/submit/{FORM_ID}" method="POST">
  <input name="name" required>
  <input name="email" type="email" required>
  <textarea name="message" required></textarea>
  <input name="_gotcha" tabindex="-1" autocomplete="off" aria-hidden="true"
         style="position:absolute;left:-9999px;width:1px;height:1px;opacity:0">
  <input type="hidden" name="_lang" value="fr">
  <button type="submit">Send</button>
</form>
```
(Native posts skip the proof-of-work; the other spam gates still apply.)

## Server relay (projects with a backend)
Keep the browser talking only to the site: a route forwards the fields with
`Authorization: Bearer <INLET_API_KEY>` (server env only) and
`X-Inlet-Visitor-IP`. Trusted relays skip CORS and proof-of-work. Full
examples for Next.js and Astro: `{FORM_API_URL}/docs#relay`.

## Error codes you may receive (JSON `code`)
- `FORM_NOT_FOUND` — wrong `FORM_ID`. Ask the user to re-copy it.
- `FORM_INACTIVE` — the form is switched off in the dashboard.
- `CORS_NOT_ALLOWED` — the site's origin is not in the form's allowed origins.
  Tell the user to add it (form settings → Allowed origins) or use `*`.
- `POW_*` — regenerate the challenge; never cache or reuse one.
- `RATE_LIMIT_EXCEEDED` — back off for 60 seconds.
- `INVALID_API_KEY` — relay key wrong, revoked or from another account.

## Verify your work
1. Submit a test with a real e-mail the user controls.
2. Expect `{ "success": true }`.
3. Confirm with the user: the lead is in the dashboard, the client received the
   notification, the test address received the auto-reply.

More: {FORM_API_URL}/docs (human guide) · {FORM_API_URL}/llms.txt (product facts)
· {FORM_API_URL}/inlet-skill.md (Claude Code skill, MCP tools)

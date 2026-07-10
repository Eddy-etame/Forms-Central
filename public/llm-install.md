# Formdock — AI Agent Installation File

You are an AI coding agent. Your task: wire a form in this project to
Formdock, a centralized form backend. Follow this file exactly.
Do NOT add SMTP, nodemailer, or any email library — the service does delivery.

## Inputs you need from the user
1. FORM_API_URL — the Formdock service origin (e.g. https://forms-central-h1ee.vercel.app)
2. FORM_ID — the form's UUID (the user copies it from their Formdock dashboard;
   if they don't have one, tell them to sign up at {FORM_API_URL}/client/signup
   and click "New form" — it takes under a minute)

Put both in the project's env file using its native convention
(PUBLIC_ / NEXT_PUBLIC_ / VITE_ prefix as the framework requires).

## Step 1 — add the helper (framework-agnostic browser JS)

```js
// form-service.js
const API_URL = /* read FORM_API_URL from env */;
const FORM_ID = /* read FORM_ID from env */;

async function sha256Hex(text) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, "0")).join("");
}

export async function submitForm(fields, { lang = "en" } = {}) {
  // 1. Proof-of-work challenge (anti-spam; costs a bot CPU, a human ~a blink)
  const c = await (await fetch(`${API_URL}/api/challenge`)).json();
  let nonce = 0;
  const prefix = "0".repeat(c.difficulty);
  while (!(await sha256Hex(`${c.challenge}:${nonce}`)).startsWith(prefix)) nonce++;

  // 2. Submit
  const res = await fetch(`${API_URL}/api/submit/${FORM_ID}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...fields,
      _lang: lang,           // "en" or "fr" — auto-reply language
      _gotcha: "",           // honeypot — MUST be present and empty
      pow_challenge: c.challenge,
      pow_timestamp: c.timestamp,
      pow_nonce: String(nonce),
    }),
  });
  if (!res.ok) throw new Error((await res.json()).error ?? "Submission failed");
  return res.json();
}
```

## Step 2 — call it from the form's submit handler

```js
import { submitForm } from "./form-service";

await submitForm({
  name: values.name,        // any field names are accepted
  email: values.email,      // if present, sender gets a branded auto-reply
  message: values.message,
});
```

## Field conventions
- `email` (any casing): triggers the branded auto-reply to the submitter.
- `name` / `nom`: used to personalize the auto-reply.
- `_lang`: "en" | "fr" — auto-reply language.
- `_gotcha`: hidden honeypot. ALWAYS include it, ALWAYS empty. If building an
  HTML form, render it as a visually hidden input, never `display:none` via
  inline style the user might remove.
- File fields: pass base64 data URIs as string values — the service uploads
  them and delivers clean download links.

## No-JavaScript fallback (plain HTML form)
```html
<form action="{FORM_API_URL}/api/submit/{FORM_ID}" method="POST">
  <input name="name" required>
  <input name="email" type="email" required>
  <textarea name="message" required></textarea>
  <input name="_gotcha" tabindex="-1" autocomplete="off"
         style="position:absolute;left:-9999px" aria-hidden="true">
  <button type="submit">Send</button>
</form>
```
(Native HTML posts skip the proof-of-work; the other spam gates still apply.)

## Error codes you may receive (JSON `code` field)
- FORM_NOT_FOUND — wrong FORM_ID. Ask the user to re-copy it.
- CORS_NOT_ALLOWED — the site's origin isn't whitelisted. Tell the user to add
  it in their Formdock dashboard (form settings, Allowed Domains).
- POW_* — regenerate the challenge; never cache or reuse one.
- RATE_LIMIT_EXCEEDED — back off for 60 seconds.

## Verify your work
1. Submit a test with a real email you control.
2. Expect `{ "success": true }`.
3. Confirm with the user: the lead appears in their dashboard, the owner
   notification arrived, and the test address received the branded auto-reply.

More: /docs (human guide) · /llms.txt (product facts)

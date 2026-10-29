/**
 * Integration snippets — one generator shared by the dashboard, the MCP server
 * and the docs, so the code a developer copies is always the code we support.
 *
 * Rules every snippet follows:
 *  • The site ships ONLY the public form id. No e-mail address, no key, no
 *    secret ever appears in front-end code: the id routes to the client's
 *    inbox server-side.
 *  • The honeypot `_gotcha` is present and empty.
 *  • `_lang` selects the auto-reply language.
 *  • Native HTML posts work without JavaScript; JavaScript posts solve the
 *    proof-of-work challenge first (it costs a bot CPU and a human a blink).
 *  • Server relays authenticate with an API key kept in the server env and
 *    forward the visitor IP, so rate limits and spam gates still see the
 *    visitor, not the relay.
 */

export type SnippetTarget =
  | 'html'
  | 'react'
  | 'astro'
  | 'vue'
  | 'svelte'
  | 'wordpress'
  | 'relay-next'
  | 'relay-astro';

export const SNIPPET_TARGETS: { id: SnippetTarget; label: string; file: string; needsHelper: boolean }[] = [
  { id: 'html', label: 'HTML', file: 'contact-form.html', needsHelper: false },
  { id: 'react', label: 'React / Next.js', file: 'ContactForm.tsx', needsHelper: true },
  { id: 'astro', label: 'Astro', file: 'ContactForm.astro', needsHelper: true },
  { id: 'vue', label: 'Vue / Nuxt', file: 'ContactForm.vue', needsHelper: true },
  { id: 'svelte', label: 'Svelte', file: 'ContactForm.svelte', needsHelper: true },
  { id: 'wordpress', label: 'WordPress · Webflow · Framer', file: 'HTML embed', needsHelper: false },
  { id: 'relay-next', label: 'Server relay · Next.js', file: 'app/api/contact/route.ts', needsHelper: false },
  { id: 'relay-astro', label: 'Server relay · Astro', file: 'src/pages/api/contact.ts', needsHelper: false },
];

export interface SnippetInput {
  apiUrl: string;        // Inlet origin, e.g. https://inlet-eta.vercel.app
  formId: string;
  lang?: 'fr' | 'en';    // auto-reply language
  successUrl?: string | null;
  clientName?: string | null;
}

const esc = (s: string) => s.replace(/`/g, '\\`').replace(/\$\{/g, '\\${');

/** Fields every example uses. Kept identical across targets on purpose. */
const FIELDS_HTML = `  <label>Name<input name="name" required></label>
  <label>Email<input name="email" type="email" required></label>
  <label>Message<textarea name="message" required></textarea></label>`;

export function helperSnippet(i: SnippetInput): string {
  const lang = i.lang ?? 'fr';
  return `// inlet.js — drop this file anywhere in your project (Astro, Next, Nuxt, Vue, Svelte, vanilla).
// It ships only a public form id. No e-mail address and no secret live in your site.
const INLET_URL = "${i.apiUrl}";
const INLET_FORM = "${i.formId}";

async function sha256(text) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

/** Send form fields to Inlet. Resolves with { success: true }, throws with a readable message. */
export async function sendToInlet(fields, { lang = "${lang}" } = {}) {
  // 1) Proof-of-work challenge: costs a bot CPU, costs a human a blink.
  const c = await (await fetch(\`\${INLET_URL}/api/challenge\`)).json();
  let nonce = 0;
  const prefix = "0".repeat(c.difficulty);
  while (!(await sha256(\`\${c.challenge}:\${nonce}\`)).startsWith(prefix)) nonce++;

  // 2) Submit. "_gotcha" is the honeypot: keep it in the form, keep it empty.
  const res = await fetch(\`\${INLET_URL}/api/submit/\${INLET_FORM}\`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      _gotcha: "",
      ...fields,
      _lang: lang,
      pow_challenge: c.challenge,
      pow_timestamp: c.timestamp,
      pow_nonce: String(nonce),
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.success) throw new Error(data.remedy || data.error || \`Inlet error \${res.status}\`);
  return data;
}`;
}

export function htmlSnippet(i: SnippetInput): string {
  const lang = i.lang ?? 'fr';
  const redirect = i.successUrl
    ? `\n  <!-- Where the visitor lands after a successful submission -->\n  <input type="hidden" name="redirect_url" value="${i.successUrl}">`
    : `\n  <!-- Optional: where the visitor lands after success (must be on your own domain) -->\n  <!-- <input type="hidden" name="redirect_url" value="https://your-site.com/thanks"> -->`;
  return `<!-- Inlet form${i.clientName ? ` · leads go to ${i.clientName}` : ''} · no e-mail address lives in this code -->
<form action="${i.apiUrl}/api/submit/${i.formId}" method="POST">
${FIELDS_HTML}

  <!-- Honeypot: keep this field in the form and keep it EMPTY. Bots fill it and are rejected. -->
  <input name="_gotcha" tabindex="-1" autocomplete="off" aria-hidden="true"
         style="position:absolute;left:-9999px;width:1px;height:1px;opacity:0">
  <!-- Auto-reply language for the visitor: "fr" or "en" -->
  <input type="hidden" name="_lang" value="${lang}">${redirect}

  <button type="submit">${lang === 'fr' ? 'Envoyer' : 'Send'}</button>
</form>`;
}

export function reactSnippet(i: SnippetInput): string {
  const lang = i.lang ?? 'fr';
  return `"use client";
// ContactForm.tsx — React / Next.js (App Router). Needs ./inlet.js from the "Helper" tab.
import { useState } from "react";
import { sendToInlet } from "./inlet";

export function ContactForm() {
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("sending");
    const fields = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
    try {
      await sendToInlet(fields, { lang: "${lang}" });
      setState("sent");
      e.currentTarget.reset();
    } catch (err) {
      setError((err as Error).message);
      setState("error");
    }
  }

  return (
    <form onSubmit={onSubmit}>
      <input name="name" placeholder="${lang === 'fr' ? 'Nom' : 'Name'}" required />
      <input name="email" type="email" placeholder="Email" required />
      <textarea name="message" placeholder="Message" required />
      {/* Honeypot — keep it, keep it empty */}
      <input name="_gotcha" tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ position: "absolute", left: -9999 }} />
      <button type="submit" disabled={state === "sending"}>
        {state === "sending" ? "…" : state === "sent" ? "${lang === 'fr' ? 'Envoyé ✓' : 'Sent ✓'}" : "${lang === 'fr' ? 'Envoyer' : 'Send'}"}
      </button>
      {state === "error" && <p role="alert">{error}</p>}
    </form>
  );
}`;
}

export function astroSnippet(i: SnippetInput): string {
  const lang = i.lang ?? 'fr';
  return `---
// src/components/ContactForm.astro — works WITHOUT JavaScript (native POST),
// and upgrades to the proof-of-work path when JS is available.
// Needs src/lib/inlet.js from the "Helper" tab.
const INLET_URL = "${i.apiUrl}";
const INLET_FORM = "${i.formId}";
---
<form id="inlet-contact" action={\`\${INLET_URL}/api/submit/\${INLET_FORM}\`} method="POST">
  <label>${lang === 'fr' ? 'Nom' : 'Name'}<input name="name" required /></label>
  <label>Email<input name="email" type="email" required /></label>
  <label>Message<textarea name="message" required></textarea></label>
  <input name="_gotcha" tabindex="-1" autocomplete="off" aria-hidden="true" style="position:absolute;left:-9999px" />
  <input type="hidden" name="_lang" value="${lang}" />
  <button type="submit">${lang === 'fr' ? 'Envoyer' : 'Send'}</button>
  <p id="inlet-status" aria-live="polite"></p>
</form>

<script>
  import { sendToInlet } from "../lib/inlet";
  const form = document.getElementById("inlet-contact") as HTMLFormElement;
  const status = document.getElementById("inlet-status")!;
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    status.textContent = "…";
    const fields = Object.fromEntries(new FormData(form)) as Record<string, string>;
    try {
      await sendToInlet(fields, { lang: "${lang}" });
      form.reset();
      status.textContent = "${lang === 'fr' ? 'Message envoyé ✓' : 'Message sent ✓'}";
    } catch (err) {
      status.textContent = (err as Error).message;
    }
  });
</script>`;
}

export function vueSnippet(i: SnippetInput): string {
  const lang = i.lang ?? 'fr';
  return `<script setup lang="ts">
// ContactForm.vue — Vue 3 / Nuxt. Needs @/lib/inlet.js from the "Helper" tab.
import { ref } from "vue";
import { sendToInlet } from "@/lib/inlet";

const state = ref<"idle" | "sending" | "sent" | "error">("idle");
const error = ref("");

async function onSubmit(e: Event) {
  const form = e.target as HTMLFormElement;
  state.value = "sending";
  const fields = Object.fromEntries(new FormData(form)) as Record<string, string>;
  try {
    await sendToInlet(fields, { lang: "${lang}" });
    state.value = "sent";
    form.reset();
  } catch (err) {
    error.value = (err as Error).message;
    state.value = "error";
  }
}
</script>

<template>
  <form @submit.prevent="onSubmit">
    <input name="name" placeholder="${lang === 'fr' ? 'Nom' : 'Name'}" required />
    <input name="email" type="email" placeholder="Email" required />
    <textarea name="message" placeholder="Message" required />
    <!-- Honeypot — keep it, keep it empty -->
    <input name="_gotcha" tabindex="-1" autocomplete="off" aria-hidden="true" style="position:absolute;left:-9999px" />
    <button type="submit" :disabled="state === 'sending'">
      {{ state === "sent" ? "${lang === 'fr' ? 'Envoyé ✓' : 'Sent ✓'}" : "${lang === 'fr' ? 'Envoyer' : 'Send'}" }}
    </button>
    <p v-if="state === 'error'" role="alert">{{ error }}</p>
  </form>
</template>`;
}

export function svelteSnippet(i: SnippetInput): string {
  const lang = i.lang ?? 'fr';
  return `<script lang="ts">
  // ContactForm.svelte — Svelte / SvelteKit. Needs $lib/inlet.js from the "Helper" tab.
  import { sendToInlet } from "$lib/inlet";

  let state: "idle" | "sending" | "sent" | "error" = "idle";
  let error = "";

  async function onSubmit(e: SubmitEvent) {
    const form = e.currentTarget as HTMLFormElement;
    state = "sending";
    const fields = Object.fromEntries(new FormData(form)) as Record<string, string>;
    try {
      await sendToInlet(fields, { lang: "${lang}" });
      state = "sent";
      form.reset();
    } catch (err) {
      error = (err as Error).message;
      state = "error";
    }
  }
</script>

<form on:submit|preventDefault={onSubmit}>
  <input name="name" placeholder="${lang === 'fr' ? 'Nom' : 'Name'}" required />
  <input name="email" type="email" placeholder="Email" required />
  <textarea name="message" placeholder="Message" required />
  <!-- Honeypot — keep it, keep it empty -->
  <input name="_gotcha" tabindex="-1" autocomplete="off" aria-hidden="true" style="position:absolute;left:-9999px" />
  <button type="submit" disabled={state === "sending"}>
    {state === "sent" ? "${lang === 'fr' ? 'Envoyé ✓' : 'Sent ✓'}" : "${lang === 'fr' ? 'Envoyer' : 'Send'}"}
  </button>
  {#if state === "error"}<p role="alert">{error}</p>{/if}
</form>`;
}

export function wordpressSnippet(i: SnippetInput): string {
  return `<!-- WordPress: paste in a "Custom HTML" block (Gutenberg) or an Elementor HTML widget.
     Webflow: Add → Embed. Framer: Insert → Embed (HTML).
     Native POST, no JavaScript needed; the visitor is redirected to redirect_url after sending. -->
${htmlSnippet({ ...i, clientName: null })}`;
}

export function relayNextSnippet(i: SnippetInput): string {
  const lang = i.lang ?? 'fr';
  return `// app/api/contact/route.ts — runs on YOUR server. The browser only ever talks to your site.
// Create an API key in Inlet → Developer, store it as INLET_API_KEY in your env (never in the client).
// The key proves the request comes from your server: proof-of-work and CORS are waived,
// and the forwarded visitor IP keeps rate limits and spam gates pointed at the visitor.
export const runtime = "nodejs";

export async function POST(req: Request) {
  const fields = await req.json().catch(() => null);
  if (!fields || typeof fields !== "object") {
    return Response.json({ success: false, error: "Invalid body" }, { status: 400 });
  }
  const visitorIp = (req.headers.get("x-forwarded-for") || "").split(",")[0].trim();

  const upstream = await fetch("${i.apiUrl}/api/submit/${i.formId}", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: \`Bearer \${process.env.INLET_API_KEY}\`,
      "X-Inlet-Visitor-IP": visitorIp,
    },
    body: JSON.stringify({ _gotcha: "", ...fields, _lang: "${lang}" }),
  });

  const data = await upstream.json().catch(() => ({ success: false, error: "Bad upstream response" }));
  return Response.json(data, { status: upstream.status });
}`;
}

export function relayAstroSnippet(i: SnippetInput): string {
  const lang = i.lang ?? 'fr';
  return `// src/pages/api/contact.ts — Astro endpoint (output: "server" or a hybrid route).
// Create an API key in Inlet → Developer and store it as INLET_API_KEY in your env.
import type { APIRoute } from "astro";

export const prerender = false;

export const POST: APIRoute = async ({ request, clientAddress }) => {
  const fields = await request.json().catch(() => null);
  if (!fields || typeof fields !== "object") {
    return new Response(JSON.stringify({ success: false, error: "Invalid body" }), { status: 400 });
  }

  const upstream = await fetch("${i.apiUrl}/api/submit/${i.formId}", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: \`Bearer \${import.meta.env.INLET_API_KEY}\`,
      "X-Inlet-Visitor-IP": clientAddress,
    },
    body: JSON.stringify({ _gotcha: "", ...fields, _lang: "${lang}" }),
  });

  return new Response(await upstream.text(), {
    status: upstream.status,
    headers: { "Content-Type": "application/json" },
  });
};`;
}

export function buildSnippet(target: SnippetTarget, i: SnippetInput): string {
  switch (target) {
    case 'html': return htmlSnippet(i);
    case 'react': return reactSnippet(i);
    case 'astro': return astroSnippet(i);
    case 'vue': return vueSnippet(i);
    case 'svelte': return svelteSnippet(i);
    case 'wordpress': return wordpressSnippet(i);
    case 'relay-next': return relayNextSnippet(i);
    case 'relay-astro': return relayAstroSnippet(i);
  }
}

export function buildAllSnippets(i: SnippetInput): Record<SnippetTarget | 'helper', string> {
  return {
    helper: helperSnippet(i),
    html: htmlSnippet(i),
    react: reactSnippet(i),
    astro: astroSnippet(i),
    vue: vueSnippet(i),
    svelte: svelteSnippet(i),
    wordpress: wordpressSnippet(i),
    'relay-next': relayNextSnippet(i),
    'relay-astro': relayAstroSnippet(i),
  };
}

/* ───────────────────────── origins ───────────────────────── */

/**
 * Turn a site URL into the browser origins that may post to the form.
 * "acme.com" → https://acme.com + https://www.acme.com (the www/apex twin is
 * added both ways because the visitor may be on either). Localhost and
 * preview hosts are added only when they are passed explicitly.
 */
export function deriveOrigins(siteUrl: string): string[] {
  const raw = siteUrl.trim();
  if (!raw) return [];
  const withScheme = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  let url: URL;
  try {
    url = new URL(withScheme);
  } catch {
    return [];
  }
  const host = url.hostname.toLowerCase();
  const port = url.port ? `:${url.port}` : '';
  const scheme = url.protocol === 'http:' ? 'http' : 'https';
  const origins = new Set<string>([`${scheme}://${host}${port}`]);
  const isLocal = host === 'localhost' || host === '127.0.0.1' || /^(\d{1,3}\.){3}\d{1,3}$/.test(host);
  if (!isLocal && !port) {
    if (host.startsWith('www.')) origins.add(`${scheme}://${host.slice(4)}`);
    else if (host.split('.').length === 2) origins.add(`${scheme}://www.${host}`);
  }
  return [...origins];
}

/** Validate a list of origins typed by a developer. Returns the clean list or null. */
export function normalizeOrigins(input: string[] | string): string[] | null {
  const parts = (Array.isArray(input) ? input : input.split(/[\s,]+/)).map((s) => s.trim()).filter(Boolean);
  const out = new Set<string>();
  for (const p of parts) {
    if (p === '*') { out.add('*'); continue; }
    try {
      const u = new URL(/^https?:\/\//i.test(p) ? p : `https://${p}`);
      if (u.protocol !== 'http:' && u.protocol !== 'https:') return null;
      out.add(u.origin);
    } catch {
      return null;
    }
  }
  return [...out];
}

export const SNIPPET_ESCAPE = esc; // exported for tests

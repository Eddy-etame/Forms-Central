import type { Metadata } from "next";
import Link from "next/link";
import { NavBar, SiteFooter } from "@/components/marketing/NavBar";
import AiChat from "@/components/AiChat";
import { Check, Terminal, ShieldCheck, ArrowRight, Webhook, Bot, Users, FileText, Inbox, KeyRound, Globe } from "lucide-react";
import CopyButton from "@/components/CopyButton";
import { Magnetic, ScrollProgress } from "@/components/marketing/Interactive";
import Reveal from "@/components/Reveal";
import SnippetTabs from "@/components/developer/SnippetTabs";
import { resolveLocale, buildMetadata, SITE_URL } from "@/lib/seo";
import { getAppDict } from "@/lib/appDict";
import { PLANS } from "@/lib/plans";
import { relayNextSnippet, relayAstroSnippet } from "@/lib/snippets";
import type { Locale } from "@/lib/i18n";

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ lang?: string }> }): Promise<Metadata> {
  const { lang } = await searchParams;
  return buildMetadata('docs', await resolveLocale(lang));
}

/**
 * The integration guide. Exhaustive on purpose: a developer (or their AI
 * agent) must be able to go from zero to a live, client-attached form without
 * asking anyone. Code blocks come from lib/snippets — the same generator the
 * dashboard and the MCP server use — so the docs can never drift from the
 * product. Prose is bilingual; code stays English (developer convention).
 */

const FORM_ID = "YOUR_FORM_ID";

const CURL_TEST = `curl -X POST ${SITE_URL}/api/submit/${FORM_ID} \\
  -d name="Test" -d email="you@example.com" -d message="Hello from curl"`;

const MCP_JSON = `{
  "mcpServers": {
    "inlet": {
      "type": "http",
      "url": "${SITE_URL}/api/mcp",
      "headers": { "Authorization": "Bearer \${INLET_API_KEY}" }
    }
  }
}`;

const MCP_PROMPTS = `# 1 — a whole site in one sentence
"Wire the contact form of https://acme.com to Inlet. The client is Acme,
 leads go to contact@acme.com, French auto-reply. Use the React snippet."

# 2 — check that a form is alive
"Is the Acme contact form receiving leads? Show me the last 5."

# 3 — change where a form may be posted from
"Allow https://staging.acme.com on the Acme contact form."`;

const LLM_PROMPT = `Read ${SITE_URL}/llm-install.md
and integrate Inlet into this project exactly as it instructs.
My values: FORM_API_URL=${SITE_URL} FORM_ID=${FORM_ID}`;

const WEBHOOK_PAYLOAD = `{
  "event": "submission.created",
  "form": { "id": "…", "name": "Contact — acme.com" },
  "submission": {
    "id": "…",
    "payload": { "name": "Ada", "email": "ada@example.com", "message": "…" },
    "created_at": "2026-10-29T10:12:00.000Z"
  }
}`;

const WEBHOOK_VERIFY = `// Verify Inlet's webhook signature (Node) — read the RAW body first.
import crypto from "node:crypto";

export function verifyInletWebhook(rawBody, sigHeader, secret, toleranceSec = 300) {
  const p = Object.fromEntries(sigHeader.split(",").map(s => s.split("=")));
  const expected = crypto.createHmac("sha256", secret).update(\`\${p.t}.\${rawBody}\`).digest("hex");
  const fresh = Math.abs(Date.now() / 1000 - Number(p.t)) < toleranceSec;
  return fresh && crypto.timingSafeEqual(Buffer.from(p.v1), Buffer.from(expected));
}`;

type Tool = { name: string; en: string; fr: string };
const TOOLS: Tool[] = [
  { name: "setup_site", en: "Zero to a live form in one call: finds-or-creates the client, creates the form with origins from the site URL, returns the files for the framework.", fr: "De zéro à un formulaire en ligne en un appel : trouve ou crée le client, crée le formulaire avec les origines du site, renvoie les fichiers pour le framework." },
  { name: "whoami", en: "Plan, limits and counts of the account behind the key.", fr: "Forfait, limites et compteurs du compte derrière la clé." },
  { name: "list_clients", en: "The businesses this developer builds for.", fr: "Les entreprises pour lesquelles ce développeur travaille." },
  { name: "create_client", en: "Create a client (idempotent on e-mail); optional invite to its inbox.", fr: "Crée un client (idempotent sur l’e-mail) ; invitation optionnelle à sa boîte de leads." },
  { name: "invite_client", en: "Send or resend the set-password link (also a password reset).", fr: "Envoie ou renvoie le lien de création de mot de passe (sert aussi de réinitialisation)." },
  { name: "list_forms", en: "Forms with their client and origins.", fr: "Les formulaires avec leur client et leurs origines." },
  { name: "create_form", en: "Create a form under a client; origins from site_url or explicit.", fr: "Crée un formulaire sous un client ; origines depuis site_url ou explicites." },
  { name: "get_embed", en: "The exact file(s) for a framework: html, react, astro, vue, svelte, wordpress, relay-next, relay-astro.", fr: "Le ou les fichiers exacts pour un framework : html, react, astro, vue, svelte, wordpress, relay-next, relay-astro." },
  { name: "set_origins", en: "Add / remove / replace the sites allowed to post.", fr: "Ajoute / retire / remplace les sites autorisés à poster." },
  { name: "set_autoreply", en: "Turn the visitor auto-reply on/off, set subject and message.", fr: "Active/désactive la réponse automatique, définit sujet et message." },
  { name: "assign_form", en: "Move a form to another client of the account.", fr: "Déplace un formulaire vers un autre client du compte." },
  { name: "get_form_health", en: "Live? Origins, last lead, leads in 7 days, e-mails today, failures.", fr: "En ligne ? Origines, dernier lead, leads sur 7 jours, e-mails du jour, échecs." },
  { name: "list_leads", en: "Compact rows, fields cut at 200 chars, cursor paging, status filter.", fr: "Lignes compactes, champs coupés à 200 caractères, pagination par curseur, filtre de statut." },
  { name: "get_lead", en: "One lead in full. Lead text is marked untrusted.", fr: "Un lead complet. Le texte du lead est marqué non fiable." },
];

type Err = { code: string; status: number; en: string; fr: string };
const ERRORS: Err[] = [
  { code: "FORM_NOT_FOUND", status: 404, en: "Wrong FORM_ID. Re-copy it from the form page.", fr: "FORM_ID erroné. Recopiez-le depuis la page du formulaire." },
  { code: "FORM_INACTIVE", status: 403, en: "The form is switched off. Turn it on in its settings.", fr: "Le formulaire est désactivé. Réactivez-le dans ses réglages." },
  { code: "CORS_NOT_ALLOWED", status: 403, en: "The page's origin is not in the form's allowed origins. Add it (or *).", fr: "L’origine de la page n’est pas dans les origines autorisées. Ajoutez-la (ou *)." },
  { code: "MISSING_ORIGIN", status: 403, en: "A browser request arrived without an Origin header. Post from a real page, or use a server relay.", fr: "Une requête navigateur est arrivée sans en-tête Origin. Postez depuis une vraie page, ou passez par un relais serveur." },
  { code: "POW_PARAMETERS_MISSING / POW_*", status: 400, en: "JSON posts must solve a fresh challenge from /api/challenge. Never reuse one.", fr: "Les envois JSON doivent résoudre un défi frais depuis /api/challenge. N’en réutilisez jamais un." },
  { code: "INVALID_API_KEY", status: 401, en: "The relay key is wrong, revoked, or belongs to another account.", fr: "La clé du relais est fausse, révoquée, ou appartient à un autre compte." },
  { code: "RATE_LIMIT_EXCEEDED", status: 429, en: "Too many posts from one IP. Back off 60 s; repeated bursts earn a temporary ban.", fr: "Trop d’envois depuis une IP. Patientez 60 s ; des rafales répétées valent un bannissement temporaire." },
  { code: "HOST_BLACKLISTED / SENDER_BLACKLISTED", status: 403, en: "The IP or e-mail is temporarily banned (24 h) after a honeypot hit or a burst. Wait, or contact the developer if a real person is caught.", fr: "L’IP ou l’e-mail est banni temporairement (24 h) après un honeypot ou une rafale. Attendez, ou contactez le développeur si une vraie personne est bloquée." },
  { code: "PAYLOAD_TOO_LARGE", status: 413, en: "The body is over the limit (attachments included). Shrink files before sending.", fr: "Le corps dépasse la limite (pièces jointes comprises). Réduisez les fichiers avant l’envoi." },
  { code: "DATABASE_*", status: 500, en: "Inlet failed to store the lead. The visitor sees an error, nothing is silently lost; retry.", fr: "Inlet n’a pas pu stocker le lead. Le visiteur voit une erreur, rien n’est perdu en silence ; réessayez." },
];

type DocDict = {
  eyebrow: string; titleLead: string; titleAccent: string; intro: string; onThisPage: string;
  nav: { id: string; label: string }[];
  concepts: { title: string; intro: string; cards: { title: string; body: string }[]; rule: string };
  quick: { title: string; intro: string; steps: { t: string; d: string }[]; curlTitle: string; curlNote: string };
  code: { title: string; intro: string; envTitle: string; envApi: string; envId: string; placeholder: string };
  fields: { title: string; intro: string; rows: [string, string][]; files: string };
  relay: { title: string; intro: string; when: string[]; keyNote: string };
  clients: { title: string; intro: string; points: string[]; portalNote: string };
  security: { title: string; intro: string; items: { t: string; d: string }[] };
  mcp: { title: string; intro: string; step1: string; step2: string; step3: string; toolsTitle: string; promptsTitle: string; untrusted: string; llmTitle: string; llmIntro: string; skillNote: string };
  webhooks: { title: string; intro: string; payloadTitle: string; verifyIntro: string; note: string };
  errors: { title: string; intro: string; colCode: string; colStatus: string; colFix: string };
  limits: { title: string; intro: string; cols: string[]; unlimited: string; note: string };
  faq: { title: string; items: { q: string; a: string }[] };
  cta: { title: string; btn: string };
};

const DOC: Record<Locale, DocDict> = {
  en: {
    eyebrow: "Documentation",
    titleLead: "Every form belongs to a client.",
    titleAccent: "Integrate in minutes.",
    intro: "You build sites for clients. Inlet gives each client its own forms and its own lead inbox, and gives you one dashboard, an API and an MCP server. Your site ships two public values and never an e-mail address.",
    onThisPage: "On this page",
    nav: [
      { id: "concepts", label: "Concepts" }, { id: "quickstart", label: "Quick start" }, { id: "code", label: "Code for your stack" },
      { id: "fields", label: "Fields" }, { id: "relay", label: "Server relay" }, { id: "clients", label: "Clients & inbox" },
      { id: "security", label: "Security" }, { id: "mcp", label: "MCP & AI agents" }, { id: "webhooks", label: "Webhooks" },
      { id: "errors", label: "Error codes" }, { id: "limits", label: "Limits" }, { id: "faq", label: "FAQ" },
    ],
    concepts: {
      title: "Four words",
      intro: "Inlet has one model and the whole product follows it. Learn these four words and every screen makes sense.",
      cards: [
        { title: "Developer", body: "You. The freelancer, agency or studio with the Inlet account. Only developers sign up." },
        { title: "Client", body: "A business you build for. Name, e-mail (where its leads go), language. You create clients; they never register themselves." },
        { title: "Form", body: "One form on one site, attached to exactly one client. Its code carries the form id only." },
        { title: "Lead", body: "A submission. Stored, e-mailed to the client (and to you if you want), answered with a branded auto-reply, visible in the client's inbox." },
      ],
      rule: "The rule: no form without a client. Creating a form means choosing — or creating — the client it belongs to.",
    },
    quick: {
      title: "Quick start",
      intro: "Three steps, two minutes, no SMTP anywhere.",
      steps: [
        { t: "Create the client", d: "Dashboard → Clients → New client. Name, e-mail, site URL, language. Tick “send access link” and the client receives a set-password link to its lead inbox — no password is ever e-mailed." },
        { t: "Create the form", d: "Dashboard → New form. Pick the client, give the form a name and the site URL: the sites allowed to post (apex + www) are derived for you." },
        { t: "Paste the code", d: "The form page shows working code for HTML, React, Astro, Vue, Svelte, WordPress and two server relays. Copy, paste, submit once. The lead appears in the dashboard and in the client's e-mail." },
      ],
      curlTitle: "Test it from a terminal",
      curlNote: "A native POST (no JavaScript) skips the proof-of-work and is answered with a redirect; the other spam gates still apply. Replace YOUR_FORM_ID with the id from the form page.",
    },
    code: {
      title: "Code for your stack",
      intro: "The same generator feeds this page, your dashboard and the MCP server, so what you copy here is exactly what we support. Pick your framework; replace the form id with yours.",
      envTitle: "The only two values your site holds",
      envApi: "the Inlet origin — challenges and submissions go there",
      envId: "the form's id — public, safe to ship, routes to the client's inbox server-side",
      placeholder: "The snippets below use the placeholder YOUR_FORM_ID. In your dashboard they come pre-filled.",
    },
    fields: {
      title: "Fields and conventions",
      intro: "Any field names are accepted and stored as they are. A few names have a meaning:",
      rows: [
        ["email", "if present, the visitor receives the branded auto-reply, and the client's notification gets Reply-To set to the visitor."],
        ["name / nom", "personalises the auto-reply: {{name}} in the template becomes the visitor's name."],
        ["_lang", "\"fr\" or \"en\" — the language of the auto-reply. Defaults to the client's language."],
        ["_gotcha", "the honeypot. Keep it in the form, keep it empty, keep it visually hidden (off-screen, not type=hidden). Bots fill it and are rejected; the visitor is never told."],
        ["redirect_url", "native HTML posts only: where the visitor lands after success. The success page set in the form settings wins when present; otherwise the URL must be on an allowed origin."],
        ["pow_challenge, pow_timestamp, pow_nonce", "the proof-of-work, added by the helper for JavaScript posts. Never needed for native HTML posts or server relays."],
      ],
      files: "Files: send a base64 data URI as the field's value (the helper does nothing special). Inlet stores it and the inbox shows a download link that only the lead's owners — the developer and the client — can open.",
    },
    relay: {
      title: "Server relay",
      intro: "When your site has a backend (Next.js, Astro SSR, Nuxt…), keep the browser talking to your own domain and let your server forward the fields. Create an API key in Developer → API & MCP and store it as INLET_API_KEY on the server.",
      when: [
        "A key-authenticated request is trusted: proof-of-work and CORS are waived.",
        "Forward the visitor's IP in X-Inlet-Visitor-IP so rate limits and spam gates judge the visitor, not your server.",
        "The key proves the request comes from you and must own the form; otherwise 401 INVALID_API_KEY.",
      ],
      keyNote: "The key is a secret. Server env only. Never in a browser bundle, never in a repository.",
    },
    clients: {
      title: "Clients and their inbox",
      intro: "A client is the business the leads belong to. Everything about it lives in Dashboard → Clients.",
      points: [
        "Leads by e-mail: every lead is sent to the client's e-mail, with a copy to you if the form's “developer copy” is on. Switch the client's notifications off if they only want the inbox.",
        "The inbox: a private page where the client reads its leads and downloads attachments. Access comes from a set-password link you send (valid 7 days); a “Forgot password?” link on the portal sign-in sends a new one.",
        "Language: a client is fr or en; its forms inherit it for the auto-reply and the invite e-mails.",
        "Moving a form: a form can be reassigned to another client at any time from the form settings.",
        "Deleting: a client with forms cannot be deleted — move or delete its forms first, so no lead is ever orphaned.",
      ],
      portalNote: "Portal sign-in URL to give your clients:",
    },
    security: {
      title: "Security model",
      intro: "What protects a lead, in the order it happens.",
      items: [
        { t: "No e-mail in the page.", d: "The site holds a form id. Who receives the lead is decided server-side, on the form's client. Scrapers find nothing." },
        { t: "Allowed origins.", d: "Each form lists the sites that may post to it (CORS). Derived from the site URL; editable; * allows any site when you need it." },
        { t: "Honeypot + proof-of-work.", d: "A hidden empty field catches dumb bots; a SHA-256 challenge makes bulk JavaScript posting expensive. Both are invisible to visitors." },
        { t: "Keyword flagging, never silent drops.", d: "A lead that trips the keyword filter is stored and flagged “suspect”, the auto-reply is withheld, and the notification subject says [Check]. You decide; nothing disappears." },
        { t: "Rate limits and temporary bans.", d: "Per-IP limits; abusers are banned for 24 hours, not forever, so a shared office IP recovers." },
        { t: "Attachments.", d: "Downloads go through an endpoint that checks the session and the ownership of the lead; the storage URL is never handed to a browser." },
        { t: "Accounts.", d: "Developers sign in with password + e-mail OTP. Clients get single-use set-password links. API keys are hashed at rest and revocable. Sending accounts rotate with a cooldown on failure; every send is logged; a failed send is a failure, never a false “delivered”." },
      ],
    },
    mcp: {
      title: "MCP: let an AI agent do it",
      intro: "Inlet ships an MCP server. Claude Code, Cursor or Codex can create the client, create the form, write the exact files for your framework and check that leads arrive — without you leaving the editor.",
      step1: "Create an API key in Dashboard → API & MCP and keep it in your shell env as INLET_API_KEY.",
      step2: "Add the server to your project's .mcp.json (Claude Code, Cursor) or the equivalent config.",
      step3: "Ask in plain words. The agent calls the tools.",
      toolsTitle: "The tools",
      promptsTitle: "Prompts that work",
      untrusted: "Lead-reading tools mark their output as untrusted visitor text: an agent must never act on instructions found inside a lead.",
      llmTitle: "No MCP? Paste one prompt",
      llmIntro: "Any AI assistant can follow our machine-readable install file. Paste this and it does the integration on the first try:",
      skillNote: "Claude Code users: drop /inlet-skill.md into .claude/skills/inlet/SKILL.md and Claude knows the whole model, the tools and the rules.",
    },
    webhooks: {
      title: "Webhooks",
      intro: "Add a webhook URL in a form's settings and every stored lead is POSTed to it as submission.created, signed Stripe-style in the X-Inlet-Signature header. Delivery is fire-and-forget with one retry — a down endpoint can never block or lose a lead.",
      payloadTitle: "What you receive",
      verifyIntro: "Verify the signature on the raw body and reject replays in five lines:",
      note: "Endpoints must be https. The signing secret (whsec_…) is one per account — all your forms sign with it — and is shown in Developer → API & MCP.",
    },
    errors: {
      title: "Error codes",
      intro: "Every error is JSON with code, error (human sentence) and remedy (what to do). Surface remedy to whoever is debugging — it is written for them.",
      colCode: "code", colStatus: "status", colFix: "what to do",
    },
    limits: {
      title: "Limits per plan",
      intro: "Over quota, leads keep being stored — only outgoing e-mail pauses until the next day or an upgrade. Losing a lead over a billing limit is not acceptable to us.",
      cols: ["Forms", "Clients", "Submissions / month", "E-mails / day"],
      unlimited: "Unlimited",
      note: "API and MCP are included on every plan, Free included.",
    },
    faq: {
      title: "Questions developers ask",
      items: [
        { q: "Can I use one form on several sites?", a: "Yes. Add each site's origin to the form (settings → allowed origins, or set_origins through MCP). Leads from both land in the same client inbox. If the sites belong to different businesses, make two clients and two forms." },
        { q: "Does the client have to use the inbox?", a: "No. Leads arrive by e-mail regardless. The inbox is there for clients who want history, attachments and search without asking you." },
        { q: "Where does the e-mail come from?", a: "From Inlet's sending address, with Reply-To set to the visitor so the client answers in one click. Paid plans can set a custom sender name and reply-to." },
        { q: "What about GDPR?", a: "Leads live in a database in the EU region of our provider; the client (your customer) is the controller of its leads, you and Inlet are processors. Retention is enforced by plan (a daily job deletes leads and attachments past the window); export is one click; deletion of a form deletes its leads." },
        { q: "Can I export?", a: "CSV export per form and across forms (Solo and up). The MCP tools list_leads / get_lead give an agent the same data." },
        { q: "Why does JavaScript need a proof-of-work and HTML does not?", a: "A native HTML post comes from a real page load with an Origin and a redirect; scripted floods come from JavaScript. The challenge costs a bot CPU and a visitor a blink." },
        { q: "My site is static (Astro, Hugo, plain HTML). Do I need the relay?", a: "No. Use the HTML or Astro snippet. The relay exists for sites that already have a server and want the browser to talk only to their own domain." },
        { q: "Can I bring my own domain for the dashboard or the portal?", a: "Not yet. The portal lives on Inlet's domain with your brand on the e-mails (white-label on Pro and Max removes the Inlet footer)." },
      ],
    },
    cta: { title: "Ready to give every client its own inbox?", btn: "Start free" },
  },
  fr: {
    eyebrow: "Documentation",
    titleLead: "Chaque formulaire appartient à un client.",
    titleAccent: "Intégrez en quelques minutes.",
    intro: "Vous construisez des sites pour des clients. Inlet donne à chaque client ses formulaires et sa boîte de leads, et vous donne un tableau de bord, une API et un serveur MCP. Votre site n’embarque que deux valeurs publiques, jamais une adresse e-mail.",
    onThisPage: "Sur cette page",
    nav: [
      { id: "concepts", label: "Concepts" }, { id: "quickstart", label: "Démarrage" }, { id: "code", label: "Code pour votre stack" },
      { id: "fields", label: "Champs" }, { id: "relay", label: "Relais serveur" }, { id: "clients", label: "Clients & boîte" },
      { id: "security", label: "Sécurité" }, { id: "mcp", label: "MCP & agents IA" }, { id: "webhooks", label: "Webhooks" },
      { id: "errors", label: "Codes d’erreur" }, { id: "limits", label: "Limites" }, { id: "faq", label: "FAQ" },
    ],
    concepts: {
      title: "Quatre mots",
      intro: "Inlet a un seul modèle et tout le produit le suit. Apprenez ces quatre mots et chaque écran devient évident.",
      cards: [
        { title: "Développeur", body: "Vous. Le freelance, l’agence ou le studio qui possède le compte Inlet. Seuls les développeurs s’inscrivent." },
        { title: "Client", body: "Une entreprise pour laquelle vous travaillez. Nom, e-mail (où partent ses leads), langue. Vous créez les clients ; ils ne s’inscrivent jamais eux-mêmes." },
        { title: "Formulaire", body: "Un formulaire sur un site, rattaché à exactement un client. Son code ne contient que l’identifiant du formulaire." },
        { title: "Lead", body: "Une soumission. Stockée, envoyée par e-mail au client (et à vous si vous le souhaitez), suivie d’une réponse automatique à l’image du client, visible dans sa boîte." },
      ],
      rule: "La règle : pas de formulaire sans client. Créer un formulaire, c’est choisir — ou créer — le client auquel il appartient.",
    },
    quick: {
      title: "Démarrage rapide",
      intro: "Trois étapes, deux minutes, aucun SMTP nulle part.",
      steps: [
        { t: "Créez le client", d: "Tableau de bord → Clients → Nouveau client. Nom, e-mail, URL du site, langue. Cochez « envoyer l’accès » et le client reçoit un lien de création de mot de passe vers sa boîte de leads — aucun mot de passe n’est jamais envoyé par e-mail." },
        { t: "Créez le formulaire", d: "Tableau de bord → Nouveau formulaire. Choisissez le client, nommez le formulaire, indiquez l’URL du site : les sites autorisés à poster (apex + www) sont déduits pour vous." },
        { t: "Collez le code", d: "La page du formulaire affiche du code prêt à l’emploi pour HTML, React, Astro, Vue, Svelte, WordPress et deux relais serveur. Copiez, collez, envoyez une fois. Le lead apparaît dans le tableau de bord et dans l’e-mail du client." },
      ],
      curlTitle: "Testez depuis un terminal",
      curlNote: "Un POST natif (sans JavaScript) saute la preuve de travail et reçoit une redirection ; les autres barrières anti-spam s’appliquent. Remplacez YOUR_FORM_ID par l’identifiant de la page du formulaire.",
    },
    code: {
      title: "Code pour votre stack",
      intro: "Le même générateur alimente cette page, votre tableau de bord et le serveur MCP : ce que vous copiez ici est exactement ce que nous supportons. Choisissez votre framework ; remplacez l’identifiant par le vôtre.",
      envTitle: "Les deux seules valeurs que votre site détient",
      envApi: "l’origine Inlet — les défis et les soumissions y partent",
      envId: "l’identifiant du formulaire — public, sans risque, il mène à la boîte du client côté serveur",
      placeholder: "Les extraits ci-dessous utilisent le marqueur YOUR_FORM_ID. Dans votre tableau de bord, ils arrivent pré-remplis.",
    },
    fields: {
      title: "Champs et conventions",
      intro: "Tous les noms de champs sont acceptés et stockés tels quels. Quelques noms ont un sens :",
      rows: [
        ["email", "s’il est présent, le visiteur reçoit la réponse automatique, et la notification du client a un Reply-To sur le visiteur."],
        ["name / nom", "personnalise la réponse automatique : {{name}} dans le modèle devient le nom du visiteur."],
        ["_lang", "\"fr\" ou \"en\" — la langue de la réponse automatique. Par défaut, celle du client."],
        ["_gotcha", "le honeypot. Gardez-le dans le formulaire, vide, et masqué visuellement (hors écran, pas type=hidden). Les bots le remplissent et sont rejetés ; le visiteur ne le sait jamais."],
        ["redirect_url", "POST HTML natif uniquement : où le visiteur atterrit après l’envoi. La page de succès définie dans les réglages du formulaire l’emporte si elle existe ; sinon l’URL doit être sur une origine autorisée."],
        ["pow_challenge, pow_timestamp, pow_nonce", "la preuve de travail, ajoutée par l’assistant pour les envois JavaScript. Jamais nécessaire pour les POST HTML natifs ni les relais serveur."],
      ],
      files: "Fichiers : envoyez une data URI base64 comme valeur du champ (l’assistant ne fait rien de spécial). Inlet la stocke et la boîte affiche un lien de téléchargement que seuls les propriétaires du lead — le développeur et le client — peuvent ouvrir.",
    },
    relay: {
      title: "Relais serveur",
      intro: "Quand votre site a un backend (Next.js, Astro SSR, Nuxt…), laissez le navigateur parler à votre propre domaine et faites transmettre les champs par votre serveur. Créez une clé API dans Développeur → API & MCP et stockez-la côté serveur sous INLET_API_KEY.",
      when: [
        "Une requête authentifiée par clé est de confiance : preuve de travail et CORS sont levés.",
        "Transmettez l’IP du visiteur dans X-Inlet-Visitor-IP pour que les limites et les barrières anti-spam jugent le visiteur, pas votre serveur.",
        "La clé prouve que la requête vient de vous et doit posséder le formulaire ; sinon 401 INVALID_API_KEY.",
      ],
      keyNote: "La clé est un secret. Environnement serveur uniquement. Jamais dans un bundle navigateur, jamais dans un dépôt.",
    },
    clients: {
      title: "Les clients et leur boîte",
      intro: "Un client est l’entreprise à qui appartiennent les leads. Tout ce qui le concerne vit dans Tableau de bord → Clients.",
      points: [
        "Leads par e-mail : chaque lead est envoyé à l’e-mail du client, avec une copie pour vous si la « copie développeur » du formulaire est active. Coupez les notifications du client s’il ne veut que la boîte.",
        "La boîte : une page privée où le client lit ses leads et télécharge les pièces jointes. L’accès vient d’un lien de création de mot de passe que vous envoyez (valable 7 jours) ; un lien « Mot de passe oublié ? » sur la connexion du portail en renvoie un.",
        "Langue : un client est fr ou en ; ses formulaires en héritent pour la réponse automatique et les e-mails d’invitation.",
        "Déplacer un formulaire : un formulaire peut être réaffecté à un autre client à tout moment depuis ses réglages.",
        "Suppression : un client qui a des formulaires ne peut pas être supprimé — déplacez ou supprimez d’abord ses formulaires, pour qu’aucun lead ne soit jamais orphelin.",
      ],
      portalNote: "URL de connexion du portail à donner à vos clients :",
    },
    security: {
      title: "Modèle de sécurité",
      intro: "Ce qui protège un lead, dans l’ordre où ça se passe.",
      items: [
        { t: "Pas d’e-mail dans la page.", d: "Le site détient un identifiant de formulaire. Qui reçoit le lead se décide côté serveur, sur le client du formulaire. Les scrapers ne trouvent rien." },
        { t: "Origines autorisées.", d: "Chaque formulaire liste les sites qui peuvent y poster (CORS). Déduites de l’URL du site ; modifiables ; * autorise n’importe quel site si besoin." },
        { t: "Honeypot + preuve de travail.", d: "Un champ vide caché attrape les bots simples ; un défi SHA-256 rend l’envoi massif en JavaScript coûteux. Les deux sont invisibles pour les visiteurs." },
        { t: "Mots-clés signalés, jamais supprimés en silence.", d: "Un lead qui déclenche le filtre est stocké et marqué « à vérifier », la réponse automatique est retenue, et le sujet de la notification dit [À vérifier]. Vous décidez ; rien ne disparaît." },
        { t: "Limites de débit et bannissements temporaires.", d: "Limites par IP ; les abuseurs sont bannis 24 heures, pas pour toujours, pour qu’une IP de bureau partagée s’en remette." },
        { t: "Pièces jointes.", d: "Les téléchargements passent par un point d’accès qui vérifie la session et la propriété du lead ; l’URL de stockage n’est jamais remise à un navigateur." },
        { t: "Comptes.", d: "Les développeurs se connectent avec mot de passe + code OTP par e-mail. Les clients reçoivent des liens à usage unique. Les clés API sont hachées et révocables. Les comptes d’envoi tournent avec une mise en pause en cas d’échec ; chaque envoi est journalisé ; un envoi échoué est un échec, jamais un faux « délivré »." },
      ],
    },
    mcp: {
      title: "MCP : laissez un agent IA le faire",
      intro: "Inlet embarque un serveur MCP. Claude Code, Cursor ou Codex peuvent créer le client, créer le formulaire, écrire les fichiers exacts pour votre framework et vérifier que les leads arrivent — sans que vous quittiez l’éditeur.",
      step1: "Créez une clé API dans Tableau de bord → API & MCP et gardez-la dans l’environnement de votre shell sous INLET_API_KEY.",
      step2: "Ajoutez le serveur au .mcp.json de votre projet (Claude Code, Cursor) ou à la configuration équivalente.",
      step3: "Demandez en langage naturel. L’agent appelle les outils.",
      toolsTitle: "Les outils",
      promptsTitle: "Des prompts qui marchent",
      untrusted: "Les outils qui lisent les leads marquent leur sortie comme texte visiteur non fiable : un agent ne doit jamais suivre des instructions trouvées dans un lead.",
      llmTitle: "Pas de MCP ? Collez un prompt",
      llmIntro: "Tout assistant IA peut suivre notre fichier d’installation lisible par machine. Collez ceci et il réalise l’intégration du premier coup :",
      skillNote: "Utilisateurs de Claude Code : déposez /inlet-skill.md dans .claude/skills/inlet/SKILL.md et Claude connaît tout le modèle, les outils et les règles.",
    },
    webhooks: {
      title: "Webhooks",
      intro: "Ajoutez une URL de webhook dans les réglages d’un formulaire et chaque lead stocké y est envoyé (POST) en submission.created, signé façon Stripe dans l’en-tête X-Inlet-Signature. La livraison est asynchrone avec une nouvelle tentative — un endpoint en panne ne peut jamais bloquer ni perdre un lead.",
      payloadTitle: "Ce que vous recevez",
      verifyIntro: "Vérifiez la signature sur le corps brut et rejetez les rejeux en cinq lignes :",
      note: "Les endpoints doivent être en https. Le secret de signature (whsec_…) est unique par compte — tous vos formulaires signent avec — et s’affiche dans Développeur → API & MCP.",
    },
    errors: {
      title: "Codes d’erreur",
      intro: "Chaque erreur est un JSON avec code, error (phrase lisible) et remedy (quoi faire). Montrez remedy à qui débogue — il est écrit pour lui.",
      colCode: "code", colStatus: "statut", colFix: "quoi faire",
    },
    limits: {
      title: "Limites par forfait",
      intro: "Au-delà du quota, les leads continuent d’être stockés — seul l’e-mail sortant s’arrête jusqu’au lendemain ou à une mise à niveau. Perdre un lead pour une limite de facturation n’est pas acceptable pour nous.",
      cols: ["Formulaires", "Clients", "Soumissions / mois", "E-mails / jour"],
      unlimited: "Illimité",
      note: "API et MCP sont inclus dans tous les forfaits, Free compris.",
    },
    faq: {
      title: "Les questions que posent les développeurs",
      items: [
        { q: "Puis-je utiliser un formulaire sur plusieurs sites ?", a: "Oui. Ajoutez l’origine de chaque site au formulaire (réglages → origines autorisées, ou set_origins via MCP). Les leads des deux arrivent dans la même boîte client. Si les sites appartiennent à des entreprises différentes, créez deux clients et deux formulaires." },
        { q: "Le client doit-il utiliser la boîte ?", a: "Non. Les leads arrivent par e-mail dans tous les cas. La boîte est là pour les clients qui veulent l’historique, les pièces jointes et la recherche sans vous solliciter." },
        { q: "D’où part l’e-mail ?", a: "De l’adresse d’envoi d’Inlet, avec un Reply-To sur le visiteur pour que le client réponde en un clic. Les forfaits payants peuvent définir un nom d’expéditeur et un reply-to personnalisés." },
        { q: "Et le RGPD ?", a: "Les leads vivent dans une base en région UE chez notre fournisseur ; le client (votre client) est responsable de traitement de ses leads, vous et Inlet êtes sous-traitants. La rétention est appliquée par forfait (un travail quotidien supprime les leads et pièces jointes hors fenêtre) ; l’export tient en un clic ; supprimer un formulaire supprime ses leads." },
        { q: "Puis-je exporter ?", a: "Export CSV par formulaire et sur l’ensemble (Solo et plus). Les outils MCP list_leads / get_lead donnent les mêmes données à un agent." },
        { q: "Pourquoi le JavaScript a-t-il besoin d’une preuve de travail et pas le HTML ?", a: "Un POST HTML natif vient d’un vrai chargement de page avec une Origin et une redirection ; les envois massifs viennent de JavaScript. Le défi coûte du CPU à un bot et un clignement d’œil à un visiteur." },
        { q: "Mon site est statique (Astro, Hugo, HTML pur). Ai-je besoin du relais ?", a: "Non. Utilisez l’extrait HTML ou Astro. Le relais existe pour les sites qui ont déjà un serveur et veulent que le navigateur ne parle qu’à leur propre domaine." },
        { q: "Puis-je utiliser mon propre domaine pour le tableau de bord ou le portail ?", a: "Pas encore. Le portail vit sur le domaine d’Inlet avec votre marque sur les e-mails (la marque blanche sur Pro et Max retire le pied de page Inlet)." },
      ],
    },
    cta: { title: "Prêt à donner à chaque client sa propre boîte ?", btn: "Commencer gratuitement" },
  },
};

function SectionTitle({ id, n, children }: { id: string; n?: string; children: React.ReactNode }) {
  return (
    <Reveal className="mt-16 scroll-mt-24" >
      <h2 id={id} className="flex items-center gap-3 text-2xl font-bold tracking-tight">
        {n && (
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 font-mono text-xs font-bold text-white shadow-md shadow-blue-500/25">
            {n}
          </span>
        )}
        {children}
      </h2>
    </Reveal>
  );
}

function Code({ title, code }: { title: string; code: string }) {
  return (
    <Reveal className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 shadow-lg">
      <div className="flex items-center gap-2 border-b border-slate-800 px-4 py-2.5">
        <Terminal className="h-3.5 w-3.5 text-slate-500" />
        <span className="text-xs text-slate-400">{title}</span>
        <CopyButton text={code} />
      </div>
      <pre className="overflow-x-auto p-5 text-[13px] leading-relaxed text-slate-200"><code>{code}</code></pre>
    </Reveal>
  );
}

const ICONS = [Users, Globe, FileText, Inbox];

export default async function DocsPage({ searchParams }: { searchParams: Promise<{ lang?: string }> }) {
  const { lang } = await searchParams;
  const locale = await resolveLocale(lang);
  const t = DOC[locale];
  const sn = getAppDict(locale).snippets;
  const snippetInput = { apiUrl: SITE_URL, formId: FORM_ID, lang: locale, clientName: null };
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: "Inlet integration guide",
    inLanguage: locale,
    description: t.intro,
    author: { "@type": "Organization", name: "Inlet" },
  };
  const plans = [PLANS.free, PLANS.solo, PLANS.pro, PLANS.max];
  const lim = (n: number | null) => (n === null ? t.limits.unlimited : n.toLocaleString(locale === 'fr' ? 'fr-FR' : 'en-US'));

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="min-h-screen bg-white text-slate-900 font-sans">
        <ScrollProgress />
        <NavBar locale={locale} />

        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[340px] overflow-hidden">
          <div className="aurora-a absolute -top-24 left-[28%] h-[300px] w-[300px] rounded-full bg-blue-500/15 blur-[110px]" />
          <div className="aurora-b absolute -top-16 right-[24%] h-[260px] w-[260px] rounded-full bg-cyan-400/12 blur-[110px]" />
        </div>

        <main className="relative mx-auto max-w-3xl px-6 py-16 lg:py-20">
          <Reveal>
            <p className="text-sm font-semibold text-blue-600">{t.eyebrow}</p>
            <h1 className="mt-2 text-4xl font-extrabold tracking-tight sm:text-5xl">
              {t.titleLead} <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text font-serif italic text-transparent">{t.titleAccent}</span>
            </h1>
            <p className="mt-4 text-lg leading-8 text-slate-600">{t.intro}</p>
          </Reveal>

          <Reveal className="mt-8 rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{t.onThisPage}</p>
            <nav className="mt-2 flex flex-wrap gap-x-4 gap-y-1.5 text-sm">
              {t.nav.map((n) => (
                <a key={n.id} href={`#${n.id}`} className="font-medium text-slate-700 hover:text-blue-600">{n.label}</a>
              ))}
            </nav>
          </Reveal>

          {/* Concepts */}
          <SectionTitle id="concepts" n="1">{t.concepts.title}</SectionTitle>
          <p className="mt-3 leading-7 text-slate-600">{t.concepts.intro}</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {t.concepts.cards.map((c, i) => {
              const Icon = ICONS[i];
              return (
                <div key={c.title} className="rounded-2xl border border-slate-200 p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md">
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-blue-600" />
                    <p className="font-bold text-slate-900">{c.title}</p>
                  </div>
                  <p className="mt-1.5 text-sm leading-6 text-slate-600">{c.body}</p>
                </div>
              );
            })}
          </div>
          <p className="mt-4 rounded-xl border border-blue-100 bg-blue-50/60 p-4 text-sm font-medium text-slate-800">{t.concepts.rule}</p>

          {/* Quick start */}
          <SectionTitle id="quickstart" n="2">{t.quick.title}</SectionTitle>
          <p className="mt-3 leading-7 text-slate-600">{t.quick.intro}</p>
          <ol className="mt-5 space-y-4">
            {t.quick.steps.map((s, i) => (
              <li key={s.t} className="flex gap-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white">{i + 1}</span>
                <div>
                  <p className="font-semibold text-slate-900">{s.t}</p>
                  <p className="mt-1 text-sm leading-6 text-slate-600">{s.d}</p>
                </div>
              </li>
            ))}
          </ol>
          <h3 className="mt-8 mb-3 font-semibold text-slate-900">{t.quick.curlTitle}</h3>
          <Code title="terminal" code={CURL_TEST} />
          <p className="mt-3 text-sm leading-6 text-slate-600">{t.quick.curlNote}</p>

          {/* Code */}
          <SectionTitle id="code" n="3">{t.code.title}</SectionTitle>
          <p className="mt-3 leading-7 text-slate-600">{t.code.intro}</p>
          <h3 className="mt-6 mb-3 font-semibold text-slate-900">{t.code.envTitle}</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 p-5">
              <code className="text-sm font-semibold text-slate-900">FORM_API_URL</code>
              <p className="mt-1.5 text-sm text-slate-600">{t.code.envApi}</p>
              <code className="mt-2 block truncate text-xs text-blue-700">{SITE_URL}</code>
            </div>
            <div className="rounded-2xl border border-slate-200 p-5">
              <code className="text-sm font-semibold text-slate-900">FORM_ID</code>
              <p className="mt-1.5 text-sm text-slate-600">{t.code.envId}</p>
              <code className="mt-2 block truncate text-xs text-blue-700">{FORM_ID}</code>
            </div>
          </div>
          <p className="mt-4 mb-4 text-sm text-slate-500">{t.code.placeholder}</p>
          <SnippetTabs input={snippetInput} labels={sn} />

          {/* Fields */}
          <SectionTitle id="fields" n="4">{t.fields.title}</SectionTitle>
          <p className="mt-3 leading-7 text-slate-600">{t.fields.intro}</p>
          <ul className="mt-5 space-y-3 text-sm text-slate-700">
            {t.fields.rows.map(([k, v]) => (
              <li key={k} className="flex items-start gap-2.5">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                <span><code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-semibold">{k}</code> — {v}</span>
              </li>
            ))}
          </ul>
          <p className="mt-5 rounded-2xl border border-slate-200 p-4 text-sm leading-6 text-slate-600">{t.fields.files}</p>

          {/* Relay */}
          <SectionTitle id="relay" n="5">{t.relay.title}</SectionTitle>
          <p className="mt-3 leading-7 text-slate-600">{t.relay.intro}</p>
          <ul className="mt-4 space-y-2 text-sm text-slate-700">
            {t.relay.when.map((w) => (
              <li key={w} className="flex items-start gap-2.5"><Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />{w}</li>
            ))}
          </ul>
          <div className="mt-5 space-y-4">
            <Code title="app/api/contact/route.ts — Next.js" code={relayNextSnippet(snippetInput)} />
            <Code title="src/pages/api/contact.ts — Astro" code={relayAstroSnippet(snippetInput)} />
          </div>
          <p className="mt-4 flex items-start gap-2 rounded-2xl border border-amber-200 bg-amber-50/70 p-4 text-sm text-amber-900">
            <KeyRound className="mt-0.5 h-4 w-4 shrink-0" /> {t.relay.keyNote}
          </p>

          {/* Clients */}
          <SectionTitle id="clients" n="6">{t.clients.title}</SectionTitle>
          <p className="mt-3 leading-7 text-slate-600">{t.clients.intro}</p>
          <ul className="mt-4 space-y-2.5 text-sm text-slate-700">
            {t.clients.points.map((p) => (
              <li key={p} className="flex items-start gap-2.5"><Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />{p}</li>
            ))}
          </ul>
          <p className="mt-4 text-sm text-slate-600">{t.clients.portalNote} <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-semibold">{SITE_URL}/portal/login</code></p>

          {/* Security */}
          <SectionTitle id="security" n="7">{t.security.title}</SectionTitle>
          <p className="mt-3 leading-7 text-slate-600">{t.security.intro}</p>
          <div className="mt-5 grid gap-3">
            {t.security.items.map((it) => (
              <div key={it.t} className="flex items-start gap-3.5 rounded-2xl border border-slate-200 p-5">
                <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                <p className="text-sm leading-6 text-slate-600"><strong className="text-slate-900">{it.t}</strong> {it.d}</p>
              </div>
            ))}
          </div>

          {/* MCP */}
          <SectionTitle id="mcp" n="8">{t.mcp.title}</SectionTitle>
          <p className="mt-3 leading-7 text-slate-600">{t.mcp.intro}</p>
          <ol className="mt-5 space-y-3 text-sm text-slate-700">
            {[t.mcp.step1, t.mcp.step2, t.mcp.step3].map((s, i) => (
              <li key={i} className="flex gap-3"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">{i + 1}</span><span className="leading-6">{s}</span></li>
            ))}
          </ol>
          <div className="mt-5 space-y-4">
            <Code title=".mcp.json" code={MCP_JSON} />
            <Code title={t.mcp.promptsTitle} code={MCP_PROMPTS} />
          </div>
          <h3 className="mt-8 mb-3 font-semibold text-slate-900">{t.mcp.toolsTitle}</h3>
          <div className="overflow-hidden rounded-2xl border border-slate-200">
            <table className="w-full text-left text-sm">
              <tbody className="divide-y divide-slate-100">
                {TOOLS.map((tool) => (
                  <tr key={tool.name}>
                    <td className="whitespace-nowrap px-4 py-2.5 align-top"><code className="text-xs font-semibold text-slate-900">{tool.name}</code></td>
                    <td className="px-4 py-2.5 text-slate-600">{locale === 'fr' ? tool.fr : tool.en}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 flex items-start gap-2 rounded-2xl border border-slate-200 p-4 text-sm text-slate-600"><Bot className="mt-0.5 h-4 w-4 shrink-0 text-violet-600" />{t.mcp.untrusted}</p>
          <h3 className="mt-8 mb-2 font-semibold text-slate-900">{t.mcp.llmTitle}</h3>
          <p className="mb-4 text-sm leading-6 text-slate-600">
            {t.mcp.llmIntro} <a href="/llm-install.md" className="font-semibold text-blue-600 hover:underline">/llm-install.md</a>
          </p>
          <Code title="prompt.txt" code={LLM_PROMPT} />
          <p className="mt-4 text-sm leading-6 text-slate-600">
            {t.mcp.skillNote} <a href="/inlet-skill.md" className="font-semibold text-violet-700 hover:underline">/inlet-skill.md</a>
          </p>

          {/* Webhooks */}
          <SectionTitle id="webhooks" n="9">{t.webhooks.title}</SectionTitle>
          <p className="mt-3 leading-7 text-slate-600">{t.webhooks.intro}</p>
          <h3 className="mt-6 mb-3 font-semibold text-slate-900">{t.webhooks.payloadTitle}</h3>
          <Code title="POST your-endpoint · X-Inlet-Signature: t=…,v1=…" code={WEBHOOK_PAYLOAD} />
          <p className="mt-5 mb-3 text-sm leading-6 text-slate-600">{t.webhooks.verifyIntro}</p>
          <Code title="verify-webhook.js" code={WEBHOOK_VERIFY} />
          <p className="mt-4 flex items-start gap-2 rounded-2xl border border-slate-200 p-4 text-sm text-slate-600"><Webhook className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />{t.webhooks.note}</p>

          {/* Errors */}
          <SectionTitle id="errors" n="10">{t.errors.title}</SectionTitle>
          <p className="mt-3 leading-7 text-slate-600">{t.errors.intro}</p>
          <div className="mt-5 overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                <tr><th className="px-4 py-3 font-medium">{t.errors.colCode}</th><th className="px-4 py-3 font-medium">{t.errors.colStatus}</th><th className="px-4 py-3 font-medium">{t.errors.colFix}</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {ERRORS.map((e) => (
                  <tr key={e.code}>
                    <td className="px-4 py-2.5 align-top"><code className="text-xs font-semibold text-slate-900">{e.code}</code></td>
                    <td className="px-4 py-2.5 align-top font-mono text-xs text-slate-500">{e.status}</td>
                    <td className="px-4 py-2.5 text-slate-600">{locale === 'fr' ? e.fr : e.en}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Limits */}
          <SectionTitle id="limits" n="11">{t.limits.title}</SectionTitle>
          <p className="mt-3 leading-7 text-slate-600">{t.limits.intro}</p>
          <div className="mt-5 overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                <tr><th className="px-4 py-3 font-medium">Plan</th>{t.limits.cols.map((c) => <th key={c} className="px-4 py-3 font-medium">{c}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {plans.map((p) => (
                  <tr key={p.id}>
                    <td className="px-4 py-2.5 font-semibold text-slate-900">{p.name} <span className="font-normal text-slate-400">${p.priceMonthly}</span></td>
                    <td className="px-4 py-2.5 text-slate-600">{lim(p.formLimit)}</td>
                    <td className="px-4 py-2.5 text-slate-600">{lim(p.clientLimit)}</td>
                    <td className="px-4 py-2.5 text-slate-600">{lim(p.submissionsPerMonth)}</td>
                    <td className="px-4 py-2.5 text-slate-600">{lim(p.emailsPerDay)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-sm text-slate-500">{t.limits.note} <Link href="/pricing" className="font-semibold text-blue-600 hover:underline">/pricing</Link></p>

          {/* FAQ */}
          <SectionTitle id="faq" n="12">{t.faq.title}</SectionTitle>
          <div className="mt-5 space-y-3">
            {t.faq.items.map((f) => (
              <details key={f.q} className="group rounded-2xl border border-slate-200 bg-white p-5 open:shadow-sm">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-slate-900">
                  {f.q}
                  <ArrowRight className="h-4 w-4 shrink-0 text-slate-400 transition-transform group-open:rotate-90" />
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">{f.a}</p>
              </details>
            ))}
          </div>

          <div className="relative mt-16 overflow-hidden rounded-3xl bg-slate-950 p-8 text-center text-white">
            <div aria-hidden className="pointer-events-none absolute -top-16 left-1/2 h-40 w-72 -translate-x-1/2 rounded-full bg-blue-500/25 blur-[90px]" />
            <h2 className="relative text-2xl font-bold">{t.cta.title}</h2>
            <div className="relative mt-5 flex justify-center">
              <Magnetic>
                <Link
                  href="/developer/signup"
                  className="btn-shine btn-shine-soft inline-flex h-11 items-center justify-center gap-2 rounded-full bg-white px-6 text-sm font-medium text-slate-900 transition-all duration-300 hover:bg-slate-100 hover:shadow-lg hover:shadow-white/10"
                >
                  {t.cta.btn} <ArrowRight className="cta-arrow h-4 w-4" />
                </Link>
              </Magnetic>
            </div>
          </div>
        </main>

        <AiChat />
        <SiteFooter locale={locale} />
      </div>
    </>
  );
}

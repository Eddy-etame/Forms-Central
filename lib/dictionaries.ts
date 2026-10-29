import type { Locale } from './i18n';

interface MarketingDict {
  nav: { features: string; how: string; docs: string; pricing: string; faq: string; signIn: string; getStarted: string; dashboard: string; compareFormspree: string; compareJotform: string };
  hero: { kicker: string; titleLead: string; titleAccent: string; subtitle: string; ctaPrimary: string; ctaSecondary: string; reassure: string; stack: string };
  pricing: {
    kicker: string; titleLead: string; titleAccent: string; subtitle: string;
    mostPopular: string; perMonth: string;
    planFree: { name: string; blurb: string; f1: string; f2: string; f3: string; f4: string; f5: string; cta: string };
    planSolo: { name: string; blurb: string; f1: string; f2: string; f3: string; f4: string; f5: string; f6: string; cta: string };
    planPro: { name: string; blurb: string; f1: string; f2: string; f3: string; f4: string; f5: string; f6: string; cta: string };
    planMax: { name: string; blurb: string; f1: string; f2: string; f3: string; f4: string; f5: string; cta: string };
    selfServeNote: string;
    compareTitle: string; compareFooter: string; colCapability: string;
    rowForms: string; rowSubmissions: string; rowEmails: string; rowSpam: string; rowAutoReply: string; rowSender: string; row2fa: string; rowAi: string; rowApi: string; rowPortals: string; rowCsv: string; rowAnalytics: string; rowWhiteLabel: string; rowPriority: string; rowRetention: string; rowSupport: string; rowDkim: string;
    valTrial: string; valPerMonth: string; valDays: string; valYearRetention: string; valEndClients: string; valUnlimited: string;
    faqTitle: string;
    faqQ1: string; faqA1: string; faqQ2: string; faqA2: string; faqQ3: string; faqA3: string; faqQ4: string; faqA4: string;
    includedAria: string; notIncludedAria: string;
  };
  siteFooter: { features: string; docs: string; pricing: string; signIn: string };
  comparePage: {
    breadcrumbHome: string; breadcrumbCompare: string; kicker: string;
    fairNoteLabel: string; colCapability: string; verdictTitle: string;
    ctaTitle: string; ctaSubtitle: string; ctaButton: string; yesAria: string; noAria: string;
    competitors: {
      formspree: { intro: string; bestFor: string; verdict: string; rows: { label: string; us: boolean; them: string | boolean }[] };
      jotform: { intro: string; bestFor: string; verdict: string; rows: { label: string; us: boolean; them: string | boolean }[] };
      basin: { intro: string; bestFor: string; verdict: string; rows: { label: string; us: boolean; them: string | boolean }[] };
      getform: { intro: string; bestFor: string; verdict: string; rows: { label: string; us: boolean; them: string | boolean }[] };
      web3forms: { intro: string; bestFor: string; verdict: string; rows: { label: string; us: boolean; them: string | boolean }[] };
    };
  };
  notFoundPage: { kicker: string; title: string; subtitle: string; backHome: string; readDocs: string };
  landing: {
    wedge: { kicker: string; title: string; bodyA: string; bodyAnd: string; bodyB: string; bullets: string[] };
    features: { kicker: string; title: string; subtitle: string; cards: { title: string; desc: string }[] };
    how: { kicker: string; title: string; subtitle: string; steps: { t: string; d: string }[] };
    compare: { title: string; subtitle: string; capability: string; rows: string[]; swipeHint: string };
    testimonials: { kicker: string; title: string; subtitle: string; items: { quote: string; name: string; role: string }[] };
    faq: { kicker: string; title: string; items: { q: string; a: string }[] };
    cta: { title: string; subtitle: string; primary: string; secondary: string };
    footer: { features: string; how: string; pricing: string; compare: string; faq: string; signIn: string };
    demo: {
      kicker: string; titleLead: string; titleAccent: string; subtitle: string;
      formLabel: string; phName: string; phMessage: string; send: string; tryBot: string;
      idleStatus: string; honeypot: string;
      statusPow: string; statusScan: string; statusDeliver: string; statusDone: string;
      inbox: string; newBadge: string; autoReplyTo: string;
      cLeads: string; cSpam: string; cReplies: string; footnote: string;
    };
  };
}

/**
 * Marketing copy, per locale. French is the default market; English is served
 * to explicit anglophone regions or via the toggle. The MarketingDict type
 * keeps both locales structurally in sync.
 */
export const dictionaries: Record<Locale, MarketingDict> = {
  en: {
    nav: { features: 'Features', how: 'How it works', docs: 'Docs', pricing: 'Pricing', faq: 'FAQ', signIn: 'Sign in', getStarted: 'Get started', dashboard: 'Dashboard', compareFormspree: 'vs Formspree', compareJotform: 'vs Jotform' },
    hero: {
      kicker: 'The lead back-office for every site you build',
      titleLead: 'One form backend for',
      titleAccent: 'all your websites.',
      subtitle: 'Every submission from every site, in one dashboard — with no SMTP and no backend. Branded auto-replies and AI spam-blocking included.',
      ctaPrimary: 'Start free',
      ctaSecondary: 'See how it works',
      reassure: 'No credit card · no SMTP · one snippet per site · every lead kept',
      stack: 'Drops into any stack',
    },
    pricing: {
      kicker: 'Pricing · usage-based, not per-form',
      titleLead: 'Pay for leads,',
      titleAccent: 'not per form.',
      subtitle: 'One developer account, as many clients as you build for. Start free — upgrade when your client list grows.',
      mostPopular: 'Most popular', perMonth: '/ month',
      planFree: {
        name: 'Free', blurb: 'Prove it works. Run a real site on it.',
        f1: '{forms} forms · {submissions} submissions/mo', f2: '{emails} emails/day', f3: '2 clients with their own inbox', f4: 'Branded auto-replies · full anti-spam', f5: 'API + MCP server included',
        cta: 'Start free',
      },
      planSolo: {
        name: 'Solo', blurb: 'For a freelancer with a handful of sites.',
        f1: '{forms} forms · {submissions} submissions/mo', f2: '{emails} emails/day', f3: '10 clients · CSV export + analytics', f4: 'Custom email sender + reply-to', f5: 'AI assistant — {n}/month', f6: '1-year data retention',
        cta: 'Choose Solo',
      },
      planPro: {
        name: 'Pro', blurb: 'For agencies. Unlimited forms, your brand only.',
        f1: 'Unlimited forms · {submissions} submissions/mo', f2: '{emails} emails/day', f3: 'White-label — no Inlet footer on e-mails or inboxes', f4: 'AI assistant — 500 messages/month', f5: 'Up to 50 clients, each with their own inbox', f6: 'Unlimited data retention',
        cta: 'Upgrade to Pro',
      },
      planMax: {
        name: 'Max', blurb: 'High-volume studios that live on leads.',
        f1: 'Unlimited forms · {submissions} submissions/mo', f2: '{emails} emails/day', f3: 'Everything in Pro', f4: 'Priority support', f5: 'Unlimited clients',
        cta: 'Go Max',
      },
      selfServeNote: 'Card checkout opens with invoicing. Until then, request a paid plan from your dashboard and it is activated by hand the same day. Over quota? Your leads keep being stored; only outgoing e-mail pauses.',
      compareTitle: 'Compare everything', compareFooter: 'Every plan exports your leads in one click — nothing is locked in.', colCapability: 'Capability',
      rowForms: 'Forms', rowSubmissions: 'Submissions / month', rowEmails: 'Emails / day', rowSpam: 'Spam protection (honeypot + PoW + NLP)', rowAutoReply: 'Branded auto-reply emails', rowSender: 'Custom email sender (name + reply-to)', row2fa: 'Two-factor sign-in (email OTP)', rowAi: 'AI assistant', rowApi: 'API + MCP server + server-to-server submit', rowPortals: 'Clients, each with a private lead inbox', rowCsv: 'CSV export', rowAnalytics: 'Analytics dashboard', rowWhiteLabel: 'White-label sender (no Inlet footer)', rowPriority: 'Priority deliverability (SMTP rotation)', rowRetention: 'Data retention', rowSupport: 'Priority support', rowDkim: 'Dedicated sending-domain setup (DKIM/SPF)',
      valTrial: '1 trial message', valPerMonth: '{n} / month', valDays: '{n} days', valYearRetention: '1 year', valEndClients: '{n} clients', valUnlimited: 'Unlimited',
      faqTitle: 'Pricing questions',
      faqQ1: 'What happens if I go over my submission or email quota?', faqA1: 'Your leads are never lost. Submissions keep being stored in your dashboard even over quota — only outgoing emails pause until the next day or an upgrade. Losing a lead over a billing limit is not acceptable to us.',
      faqQ2: 'Why is there an emails-per-day limit?', faqA2: 'Every submission can trigger up to two emails (your notification + the branded auto-reply). Daily caps keep delivery fast and reputable for everyone. Higher tiers get dramatically more throughput.',
      faqQ3: 'Can I switch plans anytime?', faqA3: 'Yes. Request a plan from your dashboard and it is activated by hand the same day; downgrades apply at the end of the cycle. Your forms, clients, leads and settings are never touched by a plan change.',
      faqQ4: 'Is the free plan really free forever?', faqA4: 'Yes. Three forms, two clients, 50 submissions a month, full anti-spam, API and MCP included. It is enough to run a real site — most developers upgrade when they add their third client, not because we squeezed them.',
      includedAria: 'Included', notIncludedAria: 'Not included',
    },
    landing: {
      wedge: {
        kicker: 'The whole integration',
        title: 'Two values. Zero email plumbing.',
        bodyA: 'Every other form tool makes you wire SMTP or an email SDK into each site. Here, your site holds nothing — just a',
        bodyAnd: 'and a',
        bodyB: 'The service does delivery, spam filtering, and the branded auto-reply.',
        bullets: ['No SMTP credentials in your frontend', 'No email library to install', 'No backend for you to run', 'Copy-paste helper works everywhere'],
      },
      features: {
        kicker: 'Built to scale',
        title: 'Everything a lead needs to arrive — nothing you have to run.',
        subtitle: 'One backend, many client sites — each branded, all protected, all centralized.',
        cards: [
          { title: 'Centralized inbox', desc: 'Every submission from every site lands in one dashboard with live status.' },
          { title: 'AI + PoW anti-spam', desc: 'Honeypot, proof-of-work, NLP filter, reverse-DNS VPN block.' },
          { title: 'White-label emails', desc: "Auto-reply emails adapt to each client's logo, colors and name." },
          { title: 'A private inbox per client', desc: 'Each business you build for gets its leads by e-mail and in its own branded inbox — answer with one reply.' },
          { title: 'CSV export', desc: 'One click flattens dynamic fields into clean columns.' },
          { title: 'Delivery you can see', desc: 'Every e-mail is logged. A failed send is flagged in your dashboard, never silently dropped.' },
          { title: 'Any framework', desc: 'Astro, Next, Nuxt, Vue, Svelte, or plain HTML.' },
        ],
      },
      how: {
        kicker: 'Fast path',
        title: 'Live in three steps',
        subtitle: 'From zero to receiving branded lead emails — in minutes.',
        steps: [
          { t: 'Create a form', d: 'Add a form in the dashboard, pick its brand, copy its unique ID.' },
          { t: 'Paste the snippet', d: 'Drop the two env values and the submit helper into any site.' },
          { t: 'Receive & manage', d: 'Owner gets a notification, submitter gets a branded auto-reply, you watch it live.' },
        ],
      },
      compare: {
        title: 'Why teams switch',
        subtitle: 'Built for people who run many client sites.',
        capability: 'Capability',
        rows: ['One account, a client per business', 'No SMTP in your sites', 'White-label e-mails and inboxes', 'Proof-of-work + keyword anti-spam', 'MCP server: your AI sets up a site', 'Every lead kept, exportable any time'],
        swipeHint: 'Swipe to compare →',
      },
      testimonials: {
        kicker: 'Built on live sites',
        title: 'Made by a working web studio, on its own client sites.',
        subtitle: 'Inlet runs the forms of real multi-location businesses today. No invented testimonials — the product is the proof, and the free plan lets you check it on your own site.',
        items: [],
      },
      faq: {
        kicker: 'Answers',
        title: 'Frequently asked',
        items: [
          { q: 'Do my websites need SMTP credentials or an email library?', a: 'No. SMTP is configured once inside the service. Your websites only POST their form fields to a form URL — they hold no email credentials and import no mailer. This is the core difference from wiring email into every site.' },
          { q: 'Can it send email without a verified domain?', a: 'Yes. With a single verified sender (for example via Brevo) you can send to anyone — no full domain setup required. A custom domain with DKIM/SPF improves deliverability at scale, but is optional to start.' },
          { q: 'Which frameworks and stacks does it support?', a: 'Any browser JavaScript environment: Astro, Next.js, Nuxt, Vue, Svelte, or plain static HTML. You copy one small submit helper (or a standard HTML form) and point it at your form URL.' },
          { q: 'How does it stop spam?', a: 'Four layers: a hidden honeypot field, a cryptographic proof-of-work challenge that costs bots CPU, a keyword filter, and reverse-DNS blocking of VPN/cloud hosts. A keyword hit never deletes a lead — it is stored and flagged so nothing real is ever lost.' },
          { q: 'How is this different from Formspree, Basin, or Jotform?', a: 'It is built for people who run many client sites: one developer account, one client per business, every lead stored and e-mailed to the right business, a private inbox per client, and an MCP server so your AI assistant can set a site up in one call. It is developer-first (code integration), not a drag-and-drop builder.' },
          { q: 'What happens to file uploads?', a: 'Base64 file payloads are intercepted, uploaded to storage, and replaced with clean download links inside the notification email — so attachments never trip spam filters or bloat inboxes.' },
        ],
      },
      cta: { title: 'Ship forms today. Own them forever.', subtitle: 'One backend for every site you build — no SMTP, no lock-in, your data.', primary: 'Get started free', secondary: 'Read the docs' },
      footer: { features: 'Features', how: 'How it works', pricing: 'Pricing', compare: 'Compare', faq: 'FAQ', signIn: 'Sign in' },
      demo: {
        kicker: 'Playable demo',
        titleLead: "Don't read about it.",
        titleAccent: 'Use it.',
        subtitle: 'This is the real pipeline — proof-of-work, spam scan, delivery, auto-reply — running in your browser. Type something and hit send. Then try to spam it.',
        formLabel: "Your website's form",
        phName: 'Your name',
        phMessage: 'Say anything — it lands in the inbox on the right.',
        send: 'Send',
        tryBot: 'Try as a spam bot',
        idleStatus: 'No SMTP. No backend. This form holds nothing.',
        honeypot: 'Honeypot tripped — bot blocked, silently. It thinks it succeeded.',
        statusPow: 'Solving proof-of-work…',
        statusScan: 'Scanning for spam…',
        statusDeliver: 'Delivering…',
        statusDone: 'Delivered — check the inbox →',
        inbox: 'Your Inlet inbox',
        newBadge: 'NEW',
        autoReplyTo: 'Branded auto-reply sent to',
        cLeads: 'Leads',
        cSpam: 'Spam blocked',
        cReplies: 'Auto-replies',
        footnote: 'Interactive simulation of the live pipeline — nothing you type here is sent or stored.',
      },
    },
    siteFooter: { features: 'Features', docs: 'Docs', pricing: 'Pricing', signIn: 'Sign in' },
    comparePage: {
      breadcrumbHome: 'Home', breadcrumbCompare: 'Compare', kicker: 'Comparison',
      fairNoteLabel: 'Fair note:', colCapability: 'Capability', verdictTitle: 'The verdict',
      ctaTitle: 'Try the self-hosted way', ctaSubtitle: 'Free to start. Your data stays yours.', ctaButton: 'Start free',
      yesAria: 'Yes', noAria: 'No',
      competitors: {
        formspree: {
          intro: "Formspree is a popular hosted form endpoint for static sites. Inlet solves the same problem — forms without a backend — but self-hosted, multi-tenant, and white-label.",
          bestFor: "Formspree is great for a single site with a single form and zero infrastructure.",
          verdict: "If you run one site, Formspree is a fine default. If you build and manage many sites — agencies, freelancers, studios — Inlet centralizes every lead in one dashboard you own, with each client seeing their own brand.",
          rows: [
            { label: "No SMTP or email library in your site", us: true, them: true },
            { label: "Self-hosted — you own the submission data", us: true, them: false },
            { label: "One backend serving many client sites", us: true, them: "Per-form accounts" },
            { label: "White-label auto-reply (client's brand, not ours)", us: true, them: false },
            { label: "Proof-of-work + NLP + reverse-DNS anti-spam", us: true, them: "reCAPTCHA-based" },
            { label: "File uploads become clean download links", us: true, them: "Paid plans" },
            { label: "Runs on your own Supabase + Vercel (free tiers)", us: true, them: false },
          ],
        },
        jotform: {
          intro: "Jotform is a drag-and-drop form builder with hosted forms. Inlet is developer-first: your forms live in your own site's code and design, and the service handles delivery, spam and branded replies.",
          bestFor: "Jotform is great for non-developers who need a hosted form page quickly.",
          verdict: "If you need a form page without writing code, use Jotform. If your forms live inside websites you build — and you want them native, branded, and centralized — Inlet is built exactly for that.",
          rows: [
            { label: "Forms match your site's exact design (your code)", us: true, them: "Themed builder" },
            { label: "Self-hosted — you own the submission data", us: true, them: false },
            { label: "No iframe / redirect — native forms", us: true, them: "Embeds" },
            { label: "One backend for dozens of client sites", us: true, them: "Per-form workspace" },
            { label: "White-label branded auto-replies", us: true, them: "Enterprise tier" },
            { label: "Developer integration (2 env values + helper)", us: true, them: false },
            { label: "Proof-of-work anti-spam (no CAPTCHA friction)", us: true, them: "CAPTCHA" },
          ],
        },
        basin: {
          intro: "Basin is a polished hosted form endpoint for static sites, with solid spam filtering and integrations. Inlet solves the same job — forms without a backend — but self-hosted, multi-tenant, and white-label, with an MCP server for AI agents.",
          bestFor: "Basin is great for one team that wants a refined hosted endpoint with good spam filtering and Zapier-style integrations.",
          verdict: "For a single team, Basin is a clean choice. If you run many client sites and want one dashboard you own, per-client branding, and AI agents that can wire and read your forms, Inlet is built for that.",
          rows: [
            { label: "No SMTP or email library in your site", us: true, them: true },
            { label: "Self-hosted — you own the submission data", us: true, them: false },
            { label: "One backend serving many client sites", us: true, them: "Per-account" },
            { label: "White-label auto-reply (client's brand, not ours)", us: true, them: false },
            { label: "Proof-of-work + NLP + reverse-DNS anti-spam", us: true, them: "Spam filtering" },
            { label: "MCP server — AI agents create & read your forms", us: true, them: false },
            { label: "Runs on your own Supabase + Vercel (free tiers)", us: true, them: false },
          ],
        },
        getform: {
          intro: "Getform is a hosted form backend for designers and developers, with file uploads and integrations. Inlet is developer-and-agency-first: self-hosted, one backend for every client site, white-label emails, and an MCP server.",
          bestFor: "Getform is great for designers and small teams who want hosted form endpoints with quick integrations.",
          verdict: "If you want a hosted endpoint per form, Getform works well. If you manage many sites and want to own the data, brand every client's emails, and let AI agents run your forms, Inlet goes further.",
          rows: [
            { label: "No SMTP or email library in your site", us: true, them: true },
            { label: "Self-hosted — you own the submission data", us: true, them: false },
            { label: "One backend serving many client sites", us: true, them: "Per-form endpoints" },
            { label: "White-label branded auto-replies", us: true, them: "Paid tiers" },
            { label: "Proof-of-work + NLP + reverse-DNS anti-spam", us: true, them: "reCAPTCHA / honeypot" },
            { label: "MCP server — AI agents create & read your forms", us: true, them: false },
            { label: "Runs on your own Supabase + Vercel (free tiers)", us: true, them: false },
          ],
        },
        web3forms: {
          intro: "Web3Forms wires a static site's form to email with an access key and no account — privacy-first, no dashboard. Inlet stores every lead in a dashboard you own, with white-label portals for your clients and an MCP server for AI agents.",
          bestFor: "Web3Forms is great for quickly sending a static site's form to your inbox with no account and no backend.",
          verdict: "If all you need is email forwarding, Web3Forms is the lightest option. If you want a dashboard, multi-client white-label portals, deeper anti-spam, and AI-agent access, Inlet is the step up.",
          rows: [
            { label: "No SMTP or email library in your site", us: true, them: true },
            { label: "Central dashboard storing every lead", us: true, them: "Email only" },
            { label: "Self-hosted — you own the submission data", us: true, them: "Not stored" },
            { label: "One backend serving many client sites", us: true, them: "Per access key" },
            { label: "White-label client portals & branded replies", us: true, them: false },
            { label: "Proof-of-work + NLP + reverse-DNS anti-spam", us: true, them: "hCaptcha / honeypot" },
            { label: "MCP server — AI agents create & read your forms", us: true, them: false },
          ],
        },
      },
    },
    notFoundPage: {
      kicker: '404', title: "This page didn't submit.",
      subtitle: "The address doesn't exist (or was caught by our spam filter — kidding). Let's get you back to solid ground.",
      backHome: 'Back home', readDocs: 'Read the docs',
    },
  },
  fr: {
    nav: { features: 'Fonctionnalités', how: 'Comment ça marche', docs: 'Docs', pricing: 'Tarifs', faq: 'FAQ', signIn: 'Connexion', getStarted: 'Commencer', dashboard: 'Tableau de bord', compareFormspree: 'vs Formspree', compareJotform: 'vs Jotform' },
    hero: {
      kicker: 'Le back-office des demandes pour chaque site que vous livrez',
      titleLead: 'Un seul backend de formulaires pour',
      titleAccent: 'tous vos sites.',
      subtitle: 'Chaque soumission de chaque site, dans un seul tableau de bord — sans SMTP ni backend. Réponses automatiques à votre image et anti-spam par IA inclus.',
      ctaPrimary: 'Commencer gratuitement',
      ctaSecondary: 'Voir comment ça marche',
      reassure: 'Sans carte bancaire · sans SMTP · un extrait par site · chaque lead conservé',
      stack: "S'intègre à n'importe quelle stack",
    },
    pricing: {
      kicker: 'Tarifs · à l’usage, pas par formulaire',
      titleLead: 'Payez pour les leads,',
      titleAccent: 'pas par formulaire.',
      subtitle: 'Un compte développeur, autant de clients que vous en servez. Commencez gratuitement — passez au niveau supérieur quand votre liste de clients grandit.',
      mostPopular: 'Le plus populaire', perMonth: '/ mois',
      planFree: {
        name: 'Gratuit', blurb: 'Prouvez que ça marche. Faites tourner un vrai site avec.',
        f1: '{forms} formulaires · {submissions} soumissions/mois', f2: '{emails} e-mails/jour', f3: '2 clients avec leur propre boîte', f4: 'Réponses automatiques à votre image · anti-spam complet', f5: 'API + serveur MCP inclus',
        cta: 'Commencer gratuitement',
      },
      planSolo: {
        name: 'Solo', blurb: 'Pour un freelance avec quelques sites.',
        f1: '{forms} formulaires · {submissions} soumissions/mois', f2: '{emails} e-mails/jour', f3: '10 clients · export CSV + analytique', f4: 'Expéditeur e-mail personnalisé + reply-to', f5: 'Assistant IA — {n}/mois', f6: 'Rétention des données 1 an',
        cta: 'Choisir Solo',
      },
      planPro: {
        name: 'Pro', blurb: 'Pour les agences. Formulaires illimités, votre marque uniquement.',
        f1: 'Formulaires illimités · {submissions} soumissions/mois', f2: '{emails} e-mails/jour', f3: 'Marque blanche — aucune mention Inlet sur les e-mails et les boîtes', f4: 'Assistant IA — 500 messages/mois', f5: 'Jusqu’à 50 clients, chacun avec sa boîte', f6: 'Rétention des données illimitée',
        cta: 'Passer à Pro',
      },
      planMax: {
        name: 'Max', blurb: 'Studios à fort volume qui vivent de leurs leads.',
        f1: 'Formulaires illimités · {submissions} soumissions/mois', f2: '{emails} e-mails/jour', f3: 'Tout ce qui est dans Pro', f4: 'Support prioritaire', f5: 'Clients illimités',
        cta: 'Passer à Max',
      },
      selfServeNote: 'Le paiement par carte ouvre avec la facturation. D’ici là, demandez un forfait payant depuis votre tableau de bord : il est activé à la main le jour même. Au-dessus du quota ? Vos leads continuent d’être enregistrés ; seuls les e-mails sortants sont mis en pause.',
      compareTitle: 'Tout comparer', compareFooter: 'Chaque forfait exporte vos leads en un clic — rien n’est verrouillé.', colCapability: 'Fonctionnalité',
      rowForms: 'Formulaires', rowSubmissions: 'Soumissions / mois', rowEmails: 'E-mails / jour', rowSpam: 'Protection anti-spam (honeypot + PoW + NLP)', rowAutoReply: 'E-mails de réponse automatique à votre image', rowSender: 'Expéditeur e-mail personnalisé (nom + reply-to)', row2fa: 'Connexion à deux facteurs (OTP e-mail)', rowAi: 'Assistant IA', rowApi: 'API + serveur MCP + envoi serveur à serveur', rowPortals: 'Clients, chacun avec une boîte de leads privée', rowCsv: 'Export CSV', rowAnalytics: 'Tableau de bord analytique', rowWhiteLabel: 'Expéditeur en marque blanche (sans mention Inlet)', rowPriority: 'Délivrabilité prioritaire (rotation SMTP)', rowRetention: 'Rétention des données', rowSupport: 'Support prioritaire', rowDkim: 'Configuration dédiée du domaine d’envoi (DKIM/SPF)',
      valTrial: '1 message d’essai', valPerMonth: '{n} / mois', valDays: '{n} jours', valYearRetention: '1 an', valEndClients: '{n} clients', valUnlimited: 'Illimité',
      faqTitle: 'Questions sur les tarifs',
      faqQ1: 'Que se passe-t-il si je dépasse mon quota de soumissions ou d’e-mails ?', faqA1: 'Vos leads ne sont jamais perdus. Les soumissions continuent d’être enregistrées dans votre tableau de bord même au-dessus du quota — seuls les e-mails sortants sont mis en pause jusqu’au lendemain ou à une mise à niveau. Perdre un lead à cause d’une limite de facturation n’est pas acceptable pour nous.',
      faqQ2: 'Pourquoi y a-t-il une limite d’e-mails par jour ?', faqA2: 'Chaque soumission peut déclencher jusqu’à deux e-mails (votre notification + la réponse automatique à votre image). Les plafonds journaliers gardent la délivrabilité rapide et réputée pour tout le monde. Les forfaits supérieurs offrent un débit nettement plus élevé.',
      faqQ3: 'Puis-je changer de forfait à tout moment ?', faqA3: 'Oui. Demandez un forfait depuis votre tableau de bord : il est activé à la main le jour même ; les rétrogradations s’appliquent à la fin du cycle. Vos formulaires, clients, leads et paramètres ne sont jamais touchés par un changement de forfait.',
      faqQ4: 'Le forfait gratuit est-il vraiment gratuit pour toujours ?', faqA4: 'Oui. Trois formulaires, 50 soumissions par mois, anti-spam complet. C’est suffisant pour faire tourner un vrai site — la plupart des développeurs passent à un forfait supérieur en ajoutant leur deuxième ou troisième client, pas parce qu’on les y a forcés.',
      includedAria: 'Inclus', notIncludedAria: 'Non inclus',
    },
    landing: {
      wedge: {
        kicker: "L'intégration complète",
        title: 'Deux valeurs. Zéro plomberie e-mail.',
        bodyA: "Tous les autres outils de formulaires vous obligent à câbler du SMTP ou un SDK e-mail dans chaque site. Ici, votre site ne contient rien — juste un",
        bodyAnd: 'et un',
        bodyB: "Le service se charge de l'envoi, du filtrage anti-spam et de la réponse automatique à votre image.",
        bullets: ['Aucun identifiant SMTP dans votre frontend', 'Aucune librairie e-mail à installer', 'Aucun backend à gérer', "L'assistant copier-coller fonctionne partout"],
      },
      features: {
        kicker: 'Conçu pour passer à l’échelle',
        title: "Tout ce qu'il faut pour qu'un lead arrive — rien que vous ayez à gérer.",
        subtitle: 'Un seul backend, plusieurs sites clients — chacun à sa marque, tous protégés, tous centralisés.',
        cards: [
          { title: 'Boîte de réception centralisée', desc: 'Chaque soumission de chaque site arrive dans un seul tableau de bord, avec statut en direct.' },
          { title: 'Anti-spam IA + preuve de travail', desc: 'Honeypot, preuve de travail, filtre NLP, blocage VPN par DNS inversé.' },
          { title: 'E-mails en marque blanche', desc: "Les réponses automatiques s'adaptent au logo, aux couleurs et au nom de chaque client." },
          { title: 'Une boîte privée par client', desc: 'Chaque entreprise pour laquelle vous travaillez reçoit ses leads par e-mail et dans sa propre boîte à sa marque — une réponse suffit.' },
          { title: 'Export CSV', desc: 'En un clic, les champs dynamiques deviennent des colonnes propres.' },
          { title: 'Une livraison visible', desc: 'Chaque e-mail est journalisé. Un envoi échoué est signalé dans votre tableau de bord, jamais perdu en silence.' },
          { title: "N'importe quel framework", desc: 'Astro, Next, Nuxt, Vue, Svelte, ou du HTML pur.' },
        ],
      },
      how: {
        kicker: 'Voie rapide',
        title: 'En ligne en trois étapes',
        subtitle: 'De zéro à la réception d’e-mails de leads à votre image — en quelques minutes.',
        steps: [
          { t: 'Créez un formulaire', d: 'Ajoutez un formulaire dans le tableau de bord, choisissez sa marque, copiez son identifiant unique.' },
          { t: 'Collez le snippet', d: 'Déposez les deux valeurs d’environnement et l’assistant d’envoi dans n’importe quel site.' },
          { t: 'Recevez & gérez', d: 'Le propriétaire reçoit une notification, l’expéditeur une réponse automatique à votre image, et vous suivez tout en direct.' },
        ],
      },
      compare: {
        title: 'Pourquoi les équipes changent',
        subtitle: 'Conçu pour ceux qui gèrent de nombreux sites clients.',
        capability: 'Fonctionnalité',
        rows: ['Un compte, un client par entreprise', 'Aucun SMTP dans vos sites', 'E-mails et boîtes en marque blanche', 'Anti-spam preuve de travail + mots-clés', 'Serveur MCP : votre IA configure un site', 'Chaque lead conservé, exportable à tout moment'],
        swipeHint: 'Glissez pour comparer →',
      },
      testimonials: {
        kicker: 'Sur de vrais sites',
        title: 'Conçu par un studio web en activité, sur ses propres sites clients.',
        subtitle: 'Inlet fait tourner aujourd’hui les formulaires de vraies entreprises multi-sites. Aucun témoignage inventé — le produit est la preuve, et le forfait gratuit vous laisse le vérifier sur votre propre site.',
        items: [],
      },
      faq: {
        kicker: 'Réponses',
        title: 'Questions fréquentes',
        items: [
          { q: 'Mes sites ont-ils besoin d’identifiants SMTP ou d’une librairie e-mail ?', a: "Non. Le SMTP est configuré une seule fois dans le service. Vos sites se contentent d’envoyer (POST) les champs du formulaire vers une URL — ils ne contiennent aucun identifiant e-mail et n’importent aucun outil d’envoi. C’est la différence essentielle avec le fait de câbler l’e-mail dans chaque site." },
          { q: 'Peut-il envoyer des e-mails sans domaine vérifié ?', a: 'Oui. Avec un seul expéditeur vérifié (par exemple via Brevo), vous pouvez écrire à tout le monde — aucune configuration de domaine complète requise. Un domaine personnalisé avec DKIM/SPF améliore la délivrabilité à grande échelle, mais reste optionnel au départ.' },
          { q: 'Quels frameworks et stacks sont pris en charge ?', a: 'Tout environnement JavaScript navigateur : Astro, Next.js, Nuxt, Vue, Svelte, ou du HTML statique. Vous copiez un petit assistant d’envoi (ou un formulaire HTML standard) et vous le pointez vers votre URL de formulaire.' },
          { q: 'Comment le spam est-il bloqué ?', a: 'Quatre couches : un champ honeypot caché, un défi cryptographique de preuve de travail qui coûte du CPU aux bots, un filtre par mots-clés, et le blocage par DNS inversé des hébergeurs VPN/cloud. Un mot-clé ne supprime jamais un lead — il est conservé et signalé pour que rien de réel ne soit perdu.' },
          { q: 'En quoi est-ce différent de Formspree, Basin ou Jotform ?', a: 'C’est conçu pour ceux qui gèrent de nombreux sites clients : un compte développeur, un client par entreprise, chaque lead enregistré et envoyé à la bonne entreprise, une boîte privée par client, et un serveur MCP pour que votre assistant IA configure un site en un appel. C’est pensé pour les développeurs (intégration par le code), pas un constructeur glisser-déposer.' },
          { q: 'Que deviennent les fichiers envoyés ?', a: 'Les fichiers en base64 sont interceptés, téléversés vers le stockage, et remplacés par des liens de téléchargement propres dans l’e-mail de notification — ainsi les pièces jointes ne déclenchent jamais les filtres anti-spam et n’alourdissent pas les boîtes de réception.' },
        ],
      },
      cta: { title: 'Lancez vos formulaires aujourd’hui. Gardez-les pour toujours.', subtitle: 'Un seul backend pour tous vos sites — sans SMTP, sans verrouillage, vos données.', primary: 'Commencer gratuitement', secondary: 'Lire la documentation' },
      footer: { features: 'Fonctionnalités', how: 'Comment ça marche', pricing: 'Tarifs', compare: 'Comparatif', faq: 'FAQ', signIn: 'Connexion' },
      demo: {
        kicker: 'Démo interactive',
        titleLead: 'Ne lisez pas à son sujet.',
        titleAccent: 'Essayez-la.',
        subtitle: "Voici le vrai pipeline — preuve de travail, analyse anti-spam, envoi, réponse automatique — exécuté dans votre navigateur. Écrivez quelque chose et envoyez. Puis essayez de le spammer.",
        formLabel: 'Le formulaire de votre site',
        phName: 'Votre nom',
        phMessage: 'Écrivez ce que vous voulez — ça arrive dans la boîte de réception à droite.',
        send: 'Envoyer',
        tryBot: 'Essayer en tant que bot spammeur',
        idleStatus: 'Sans SMTP. Sans backend. Ce formulaire ne contient rien.',
        honeypot: 'Honeypot déclenché — bot bloqué, en silence. Il croit avoir réussi.',
        statusPow: 'Résolution de la preuve de travail…',
        statusScan: 'Analyse anti-spam…',
        statusDeliver: 'Envoi en cours…',
        statusDone: 'Envoyé — regardez la boîte de réception →',
        inbox: 'Votre boîte de réception Inlet',
        newBadge: 'NOUVEAU',
        autoReplyTo: 'Réponse automatique à votre image envoyée à',
        cLeads: 'Leads',
        cSpam: 'Spam bloqué',
        cReplies: 'Réponses auto',
        footnote: 'Simulation interactive du pipeline en direct — rien de ce que vous tapez ici n’est envoyé ou stocké.',
      },
    },
    siteFooter: { features: 'Fonctionnalités', docs: 'Docs', pricing: 'Tarifs', signIn: 'Connexion' },
    comparePage: {
      breadcrumbHome: 'Accueil', breadcrumbCompare: 'Comparer', kicker: 'Comparatif',
      fairNoteLabel: 'Remarque honnête :', colCapability: 'Fonctionnalité', verdictTitle: 'Le verdict',
      ctaTitle: 'Essayez la voie auto-hébergée', ctaSubtitle: 'Gratuit pour commencer. Vos données restent les vôtres.', ctaButton: 'Commencer gratuitement',
      yesAria: 'Oui', noAria: 'Non',
      competitors: {
        formspree: {
          intro: "Formspree est un point de terminaison de formulaires hébergé, populaire pour les sites statiques. Inlet résout le même problème — des formulaires sans backend — mais en auto-hébergé, multi-tenant et en marque blanche.",
          bestFor: "Formspree est excellent pour un site unique avec un seul formulaire et zéro infrastructure.",
          verdict: "Si vous gérez un seul site, Formspree est un bon choix par défaut. Si vous construisez et gérez plusieurs sites — agences, freelances, studios — Inlet centralise chaque lead dans un seul tableau de bord que vous possédez, avec la marque de chaque client respectée.",
          rows: [
            { label: "Pas de SMTP ni de bibliothèque e-mail dans votre site", us: true, them: true },
            { label: "Auto-hébergé — vous possédez les données de soumission", us: true, them: false },
            { label: "Un seul backend pour plusieurs sites clients", us: true, them: "Comptes par formulaire" },
            { label: "Réponse automatique en marque blanche (marque du client, pas la nôtre)", us: true, them: false },
            { label: "Preuve de travail + NLP + anti-spam par DNS inversé", us: true, them: "Basé sur reCAPTCHA" },
            { label: "Les fichiers envoyés deviennent des liens de téléchargement propres", us: true, them: "Forfaits payants" },
            { label: "Fonctionne sur votre propre Supabase + Vercel (offres gratuites)", us: true, them: false },
          ],
        },
        jotform: {
          intro: "Jotform est un constructeur de formulaires par glisser-déposer avec hébergement inclus. Inlet est pensé pour les développeurs : vos formulaires vivent dans le code et le design de votre propre site, et le service se charge de la livraison, de l’anti-spam et des réponses automatiques à votre image.",
          bestFor: "Jotform est excellent pour les non-développeurs qui ont besoin d’une page de formulaire hébergée rapidement.",
          verdict: "Si vous avez besoin d’une page de formulaire sans écrire de code, utilisez Jotform. Si vos formulaires vivent au sein de sites que vous construisez — et que vous les voulez natifs, à votre image et centralisés — Inlet est fait exactement pour ça.",
          rows: [
            { label: "Les formulaires respectent exactement le design de votre site (votre code)", us: true, them: "Constructeur à thèmes" },
            { label: "Auto-hébergé — vous possédez les données de soumission", us: true, them: false },
            { label: "Pas d’iframe ni de redirection — formulaires natifs", us: true, them: "Intégrations iframe" },
            { label: "Un seul backend pour des dizaines de sites clients", us: true, them: "Espace par formulaire" },
            { label: "Réponses automatiques en marque blanche", us: true, them: "Offre Entreprise" },
            { label: "Intégration développeur (2 valeurs d’environnement + un helper)", us: true, them: false },
            { label: "Anti-spam par preuve de travail (sans friction CAPTCHA)", us: true, them: "CAPTCHA" },
          ],
        },
        basin: {
          intro: "Basin est un point de terminaison de formulaires hébergé et soigné pour les sites statiques, avec un bon filtrage anti-spam et des intégrations. Inlet répond au même besoin — des formulaires sans backend — mais en auto-hébergé, multi-tenant et en marque blanche, avec un serveur MCP pour les agents IA.",
          bestFor: "Basin est excellent pour une équipe qui veut un point de terminaison hébergé raffiné, avec un bon anti-spam et des intégrations façon Zapier.",
          verdict: "Pour une seule équipe, Basin est un choix propre. Si vous gérez plusieurs sites clients et voulez un tableau de bord que vous possédez, la marque de chaque client, et des agents IA qui câblent et lisent vos formulaires, Inlet est fait pour ça.",
          rows: [
            { label: "Pas de SMTP ni de bibliothèque e-mail dans votre site", us: true, them: true },
            { label: "Auto-hébergé — vous possédez les données de soumission", us: true, them: false },
            { label: "Un seul backend pour plusieurs sites clients", us: true, them: "Par compte" },
            { label: "Réponse automatique en marque blanche (marque du client)", us: true, them: false },
            { label: "Anti-spam preuve de travail + NLP + DNS inversé", us: true, them: "Filtrage anti-spam" },
            { label: "Serveur MCP — les agents IA créent et lisent vos formulaires", us: true, them: false },
            { label: "Fonctionne sur votre propre Supabase + Vercel (offres gratuites)", us: true, them: false },
          ],
        },
        getform: {
          intro: "Getform est un backend de formulaires hébergé pour designers et développeurs, avec envoi de fichiers et intégrations. Inlet est pensé pour les développeurs et agences : auto-hébergé, un seul backend pour chaque site client, e-mails en marque blanche et un serveur MCP.",
          bestFor: "Getform est excellent pour les designers et petites équipes qui veulent des points de terminaison hébergés avec des intégrations rapides.",
          verdict: "Si vous voulez un point de terminaison hébergé par formulaire, Getform fonctionne bien. Si vous gérez plusieurs sites et voulez posséder les données, personnaliser les e-mails de chaque client et laisser l’IA piloter vos formulaires, Inlet va plus loin.",
          rows: [
            { label: "Pas de SMTP ni de bibliothèque e-mail dans votre site", us: true, them: true },
            { label: "Auto-hébergé — vous possédez les données de soumission", us: true, them: false },
            { label: "Un seul backend pour plusieurs sites clients", us: true, them: "Points de terminaison par formulaire" },
            { label: "Réponses automatiques en marque blanche", us: true, them: "Offres payantes" },
            { label: "Anti-spam preuve de travail + NLP + DNS inversé", us: true, them: "reCAPTCHA / honeypot" },
            { label: "Serveur MCP — les agents IA créent et lisent vos formulaires", us: true, them: false },
            { label: "Fonctionne sur votre propre Supabase + Vercel (offres gratuites)", us: true, them: false },
          ],
        },
        web3forms: {
          intro: "Web3Forms relie le formulaire d’un site statique à un e-mail via une clé d’accès, sans compte — axé confidentialité, sans tableau de bord. Inlet enregistre chaque lead dans un tableau de bord que vous possédez, avec des portails en marque blanche pour vos clients et un serveur MCP pour les agents IA.",
          bestFor: "Web3Forms est excellent pour envoyer rapidement le formulaire d’un site statique vers votre boîte de réception, sans compte ni backend.",
          verdict: "S’il vous faut seulement une redirection par e-mail, Web3Forms est l’option la plus légère. Si vous voulez un tableau de bord, des portails clients en marque blanche, un anti-spam plus poussé et un accès pour les agents IA, Inlet est le cran au-dessus.",
          rows: [
            { label: "Pas de SMTP ni de bibliothèque e-mail dans votre site", us: true, them: true },
            { label: "Tableau de bord central enregistrant chaque lead", us: true, them: "E-mail uniquement" },
            { label: "Auto-hébergé — vous possédez les données de soumission", us: true, them: "Non stocké" },
            { label: "Un seul backend pour plusieurs sites clients", us: true, them: "Par clé d’accès" },
            { label: "Portails clients en marque blanche & réponses personnalisées", us: true, them: false },
            { label: "Anti-spam preuve de travail + NLP + DNS inversé", us: true, them: "hCaptcha / honeypot" },
            { label: "Serveur MCP — les agents IA créent et lisent vos formulaires", us: true, them: false },
          ],
        },
      },
    },
    notFoundPage: {
      kicker: '404', title: "Cette page n’a pas été soumise.",
      subtitle: "Cette adresse n’existe pas (ou a été bloquée par notre filtre anti-spam — on plaisante). Revenons sur la bonne voie.",
      backHome: 'Retour à l’accueil', readDocs: 'Lire la doc',
    },
  },
};

export type Dictionary = MarketingDict;

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}

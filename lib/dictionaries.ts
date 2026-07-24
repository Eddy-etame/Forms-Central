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
  landing: {
    wedge: { kicker: string; title: string; bodyA: string; bodyAnd: string; bodyB: string; bullets: string[] };
    features: { kicker: string; title: string; subtitle: string; cards: { title: string; desc: string }[] };
    how: { kicker: string; title: string; subtitle: string; steps: { t: string; d: string }[] };
    compare: { title: string; subtitle: string; capability: string; rows: string[]; swipeHint: string };
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
      kicker: 'Self-hosted form backend · you own the data',
      titleLead: 'One form backend for',
      titleAccent: 'all your websites.',
      subtitle: 'Every submission from every site, in one dashboard — with no SMTP and no backend. Branded auto-replies and AI spam-blocking included.',
      ctaPrimary: 'Start free',
      ctaSecondary: 'See how it works',
      reassure: 'No credit card · no SMTP config · integrate in 2 minutes',
      stack: 'Drops into any stack',
    },
    pricing: {
      kicker: 'Pricing · usage-based, not per-form',
      titleLead: 'Pay for leads,',
      titleAccent: 'not per form.',
      subtitle: 'One backend for every site you build. Start free in two minutes — upgrade only when your lead volume does.',
      mostPopular: 'Most popular', perMonth: '/ month',
      planFree: {
        name: 'Free', blurb: 'Prove it works. Run a real site on it.',
        f1: '{forms} forms · {submissions} submissions/mo', f2: '{emails} emails/day', f3: 'Full anti-spam stack', f4: 'Branded auto-replies', f5: '1 AI trial message',
        cta: 'Start free',
      },
      planSolo: {
        name: 'Solo', blurb: 'For a freelancer with a handful of sites.',
        f1: '{forms} forms · {submissions} submissions/mo', f2: '{emails} emails/day', f3: 'CSV export + analytics', f4: 'Custom email sender + reply-to', f5: 'AI assistant — {n}/month', f6: '1-year data retention',
        cta: 'Choose Solo',
      },
      planPro: {
        name: 'Pro', blurb: 'For agencies. Unlimited forms, your brand only.',
        f1: 'Unlimited forms · {submissions} submissions/mo', f2: '{emails} emails/day', f3: 'White-label sender — no Inlet footer', f4: 'Unlimited AI assistant', f5: 'Priority deliverability (SMTP rotation)', f6: 'Unlimited data retention',
        cta: 'Upgrade to Pro',
      },
      planMax: {
        name: 'Max', blurb: 'High-volume studios that live on leads.',
        f1: 'Unlimited forms · {submissions} submissions/mo', f2: '{emails} emails/day', f3: 'Everything in Pro', f4: 'Priority support', f5: 'Dedicated sending-domain setup (DKIM/SPF)',
        cta: 'Go Max',
      },
      selfServeNote: 'Self-serve checkout is coming — paid upgrades are activated same-day by email. Over quota? Your leads keep being stored; only outgoing email pauses.',
      compareTitle: 'Compare everything', compareFooter: 'Every plan is self-hosted on your own infrastructure — your data never belongs to us.', colCapability: 'Capability',
      rowForms: 'Forms', rowSubmissions: 'Submissions / month', rowEmails: 'Emails / day', rowSpam: 'Spam protection (honeypot + PoW + NLP)', rowAutoReply: 'Branded auto-reply emails', rowSender: 'Custom email sender (name + reply-to)', row2fa: 'Two-factor sign-in (email OTP)', rowAi: 'AI assistant', rowApi: 'API + MCP server (your AI runs your forms)', rowPortals: 'Client portals (white-label end-client logins)', rowCsv: 'CSV export', rowAnalytics: 'Analytics dashboard', rowWhiteLabel: 'White-label sender (no Inlet footer)', rowPriority: 'Priority deliverability (SMTP rotation)', rowRetention: 'Data retention', rowSupport: 'Priority support', rowDkim: 'Dedicated sending-domain setup (DKIM/SPF)',
      valTrial: '1 trial message', valPerMonth: '{n} / month', valDays: '{n} days', valYearRetention: '1 year', valEndClients: '{n} end-clients', valUnlimited: 'Unlimited',
      faqTitle: 'Pricing questions',
      faqQ1: 'What happens if I go over my submission or email quota?', faqA1: 'Your leads are never lost. Submissions keep being stored in your dashboard even over quota — only outgoing emails pause until the next day or an upgrade. Losing a lead over a billing limit is not acceptable to us.',
      faqQ2: 'Why is there an emails-per-day limit?', faqA2: 'Every submission can trigger up to two emails (your notification + the branded auto-reply). Daily caps keep delivery fast and reputable for everyone. Higher tiers get dramatically more throughput.',
      faqQ3: 'Can I switch plans anytime?', faqA3: 'Yes — upgrades apply immediately, downgrades at the end of the cycle. Your forms, submissions and settings are never touched by a plan change.',
      faqQ4: 'Is the free plan really free forever?', faqA4: 'Yes. Three forms, 50 submissions a month, full anti-spam. It is enough to run a real site — most developers upgrade when they add their second or third client, not because we squeezed them.',
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
          { title: 'Client analytics', desc: 'Per-client dashboards so each site owner tracks their own leads and conversion in real time.' },
          { title: 'CSV export', desc: 'One click flattens dynamic fields into clean columns.' },
          { title: 'SMTP fallback', desc: 'Rotates across backup accounts so a lead is never lost.' },
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
        subtitle: 'Self-hosted, multi-tenant, and developer-first.',
        capability: 'Capability',
        rows: ['Self-hosted, own your data', 'No SMTP in your sites', 'Multi-tenant white-label emails', 'Proof-of-work + NLP anti-spam', 'Developer-first integration', 'One backend for many sites'],
        swipeHint: 'Swipe to compare →',
      },
      faq: {
        kicker: 'Answers',
        title: 'Frequently asked',
        items: [
          { q: 'Do my websites need SMTP credentials or an email library?', a: 'No. SMTP is configured once inside the service. Your websites only POST their form fields to a form URL — they hold no email credentials and import no mailer. This is the core difference from wiring email into every site.' },
          { q: 'Can it send email without a verified domain?', a: 'Yes. With a single verified sender (for example via Brevo) you can send to anyone — no full domain setup required. A custom domain with DKIM/SPF improves deliverability at scale, but is optional to start.' },
          { q: 'Which frameworks and stacks does it support?', a: 'Any browser JavaScript environment: Astro, Next.js, Nuxt, Vue, Svelte, or plain static HTML. You copy one small submit helper (or a standard HTML form) and point it at your form URL.' },
          { q: 'How does it stop spam?', a: 'Four layers: a hidden honeypot field, a cryptographic proof-of-work challenge that costs bots CPU, an NLP keyword filter, and reverse-DNS blocking of VPN/cloud hosts. Blocked attempts are logged, never delivered.' },
          { q: 'How is this different from Formspree, Basin, or Jotform?', a: 'It is self-hosted on your own Supabase and Vercel, so you own the data. It is multi-tenant and white-label — one backend serves many client sites, each with its own branded emails. It is developer-first (code integration), not a drag-and-drop builder.' },
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
  },
  fr: {
    nav: { features: 'Fonctionnalités', how: 'Comment ça marche', docs: 'Docs', pricing: 'Tarifs', faq: 'FAQ', signIn: 'Connexion', getStarted: 'Commencer', dashboard: 'Tableau de bord', compareFormspree: 'vs Formspree', compareJotform: 'vs Jotform' },
    hero: {
      kicker: 'Backend de formulaires auto-hébergé · vos données vous appartiennent',
      titleLead: 'Un seul backend de formulaires pour',
      titleAccent: 'tous vos sites.',
      subtitle: 'Chaque soumission de chaque site, dans un seul tableau de bord — sans SMTP ni backend. Réponses automatiques à votre image et anti-spam par IA inclus.',
      ctaPrimary: 'Commencer gratuitement',
      ctaSecondary: 'Voir comment ça marche',
      reassure: 'Sans carte bancaire · sans config SMTP · intégré en 2 minutes',
      stack: "S'intègre à n'importe quelle stack",
    },
    pricing: {
      kicker: 'Tarifs · à l’usage, pas par formulaire',
      titleLead: 'Payez pour les leads,',
      titleAccent: 'pas par formulaire.',
      subtitle: 'Un seul backend pour tous vos sites. Commencez gratuitement en deux minutes — passez à un forfait supérieur seulement quand votre volume de leads augmente.',
      mostPopular: 'Le plus populaire', perMonth: '/ mois',
      planFree: {
        name: 'Gratuit', blurb: 'Prouvez que ça marche. Faites tourner un vrai site avec.',
        f1: '{forms} formulaires · {submissions} soumissions/mois', f2: '{emails} e-mails/jour', f3: 'Stack anti-spam complète', f4: 'Réponses automatiques à votre image', f5: '1 message IA d’essai',
        cta: 'Commencer gratuitement',
      },
      planSolo: {
        name: 'Solo', blurb: 'Pour un freelance avec quelques sites.',
        f1: '{forms} formulaires · {submissions} soumissions/mois', f2: '{emails} e-mails/jour', f3: 'Export CSV + analytique', f4: 'Expéditeur e-mail personnalisé + reply-to', f5: 'Assistant IA — {n}/mois', f6: 'Rétention des données 1 an',
        cta: 'Choisir Solo',
      },
      planPro: {
        name: 'Pro', blurb: 'Pour les agences. Formulaires illimités, votre marque uniquement.',
        f1: 'Formulaires illimités · {submissions} soumissions/mois', f2: '{emails} e-mails/jour', f3: 'Expéditeur en marque blanche — sans mention Inlet', f4: 'Assistant IA illimité', f5: 'Délivrabilité prioritaire (rotation SMTP)', f6: 'Rétention des données illimitée',
        cta: 'Passer à Pro',
      },
      planMax: {
        name: 'Max', blurb: 'Studios à fort volume qui vivent de leurs leads.',
        f1: 'Formulaires illimités · {submissions} soumissions/mois', f2: '{emails} e-mails/jour', f3: 'Tout ce qui est dans Pro', f4: 'Support prioritaire', f5: 'Configuration dédiée du domaine d’envoi (DKIM/SPF)',
        cta: 'Passer à Max',
      },
      selfServeNote: 'Le paiement en libre-service arrive bientôt — les mises à niveau payantes sont activées le jour même par e-mail. Au-dessus du quota ? Vos leads continuent d’être enregistrés ; seuls les e-mails sortants sont mis en pause.',
      compareTitle: 'Tout comparer', compareFooter: 'Chaque forfait est auto-hébergé sur votre propre infrastructure — vos données ne nous appartiennent jamais.', colCapability: 'Fonctionnalité',
      rowForms: 'Formulaires', rowSubmissions: 'Soumissions / mois', rowEmails: 'E-mails / jour', rowSpam: 'Protection anti-spam (honeypot + PoW + NLP)', rowAutoReply: 'E-mails de réponse automatique à votre image', rowSender: 'Expéditeur e-mail personnalisé (nom + reply-to)', row2fa: 'Connexion à deux facteurs (OTP e-mail)', rowAi: 'Assistant IA', rowApi: 'API + serveur MCP (votre IA pilote vos formulaires)', rowPortals: 'Portails clients (connexions en marque blanche pour vos clients)', rowCsv: 'Export CSV', rowAnalytics: 'Tableau de bord analytique', rowWhiteLabel: 'Expéditeur en marque blanche (sans mention Inlet)', rowPriority: 'Délivrabilité prioritaire (rotation SMTP)', rowRetention: 'Rétention des données', rowSupport: 'Support prioritaire', rowDkim: 'Configuration dédiée du domaine d’envoi (DKIM/SPF)',
      valTrial: '1 message d’essai', valPerMonth: '{n} / mois', valDays: '{n} jours', valYearRetention: '1 an', valEndClients: '{n} clients finaux', valUnlimited: 'Illimité',
      faqTitle: 'Questions sur les tarifs',
      faqQ1: 'Que se passe-t-il si je dépasse mon quota de soumissions ou d’e-mails ?', faqA1: 'Vos leads ne sont jamais perdus. Les soumissions continuent d’être enregistrées dans votre tableau de bord même au-dessus du quota — seuls les e-mails sortants sont mis en pause jusqu’au lendemain ou à une mise à niveau. Perdre un lead à cause d’une limite de facturation n’est pas acceptable pour nous.',
      faqQ2: 'Pourquoi y a-t-il une limite d’e-mails par jour ?', faqA2: 'Chaque soumission peut déclencher jusqu’à deux e-mails (votre notification + la réponse automatique à votre image). Les plafonds journaliers gardent la délivrabilité rapide et réputée pour tout le monde. Les forfaits supérieurs offrent un débit nettement plus élevé.',
      faqQ3: 'Puis-je changer de forfait à tout moment ?', faqA3: 'Oui — les mises à niveau s’appliquent immédiatement, les rétrogradations à la fin du cycle. Vos formulaires, soumissions et paramètres ne sont jamais touchés par un changement de forfait.',
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
          { title: 'Analytique par client', desc: 'Un tableau de bord par client, pour que chaque propriétaire suive ses leads et sa conversion en temps réel.' },
          { title: 'Export CSV', desc: 'En un clic, les champs dynamiques deviennent des colonnes propres.' },
          { title: 'Bascule SMTP de secours', desc: "Rotation sur des comptes de secours pour ne jamais perdre un lead." },
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
        subtitle: 'Auto-hébergé, multi-locataire et pensé pour les développeurs.',
        capability: 'Fonctionnalité',
        rows: ['Auto-hébergé, vos données vous appartiennent', 'Aucun SMTP dans vos sites', 'E-mails multi-locataires en marque blanche', 'Anti-spam preuve de travail + NLP', 'Intégration pensée pour les développeurs', 'Un seul backend pour plusieurs sites'],
        swipeHint: 'Glissez pour comparer →',
      },
      faq: {
        kicker: 'Réponses',
        title: 'Questions fréquentes',
        items: [
          { q: 'Mes sites ont-ils besoin d’identifiants SMTP ou d’une librairie e-mail ?', a: "Non. Le SMTP est configuré une seule fois dans le service. Vos sites se contentent d’envoyer (POST) les champs du formulaire vers une URL — ils ne contiennent aucun identifiant e-mail et n’importent aucun outil d’envoi. C’est la différence essentielle avec le fait de câbler l’e-mail dans chaque site." },
          { q: 'Peut-il envoyer des e-mails sans domaine vérifié ?', a: 'Oui. Avec un seul expéditeur vérifié (par exemple via Brevo), vous pouvez écrire à tout le monde — aucune configuration de domaine complète requise. Un domaine personnalisé avec DKIM/SPF améliore la délivrabilité à grande échelle, mais reste optionnel au départ.' },
          { q: 'Quels frameworks et stacks sont pris en charge ?', a: 'Tout environnement JavaScript navigateur : Astro, Next.js, Nuxt, Vue, Svelte, ou du HTML statique. Vous copiez un petit assistant d’envoi (ou un formulaire HTML standard) et vous le pointez vers votre URL de formulaire.' },
          { q: 'Comment le spam est-il bloqué ?', a: 'Quatre couches : un champ honeypot caché, un défi cryptographique de preuve de travail qui coûte du CPU aux bots, un filtre NLP par mots-clés, et le blocage par DNS inversé des hébergeurs VPN/cloud. Les tentatives bloquées sont journalisées, jamais délivrées.' },
          { q: 'En quoi est-ce différent de Formspree, Basin ou Jotform ?', a: 'C’est auto-hébergé sur votre propre Supabase et Vercel, donc vous possédez les données. C’est multi-locataire et en marque blanche — un seul backend sert plusieurs sites clients, chacun avec ses e-mails à sa marque. C’est pensé pour les développeurs (intégration par le code), pas un constructeur glisser-déposer.' },
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
  },
};

export type Dictionary = MarketingDict;

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}

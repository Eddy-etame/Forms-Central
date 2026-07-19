import type { Locale } from './i18n';

interface MarketingDict {
  nav: { features: string; how: string; docs: string; pricing: string; faq: string; signIn: string; getStarted: string; dashboard: string };
  hero: { kicker: string; titleLead: string; titleAccent: string; subtitle: string; ctaPrimary: string; ctaSecondary: string; reassure: string; stack: string };
  pricing: { kicker: string; titleLead: string; titleAccent: string; subtitle: string };
  landing: {
    wedge: { kicker: string; title: string; bodyA: string; bodyAnd: string; bodyB: string; bullets: string[] };
    features: { kicker: string; title: string; subtitle: string; cards: { title: string; desc: string }[] };
    how: { kicker: string; title: string; subtitle: string; steps: { t: string; d: string }[] };
    compare: { title: string; subtitle: string; capability: string; rows: string[] };
    faq: { kicker: string; title: string; items: { q: string; a: string }[] };
    cta: { title: string; subtitle: string; primary: string; secondary: string };
    footer: { features: string; how: string; pricing: string; compare: string; faq: string; signIn: string };
  };
}

/**
 * Marketing copy, per locale. French is the default market; English is served
 * to explicit anglophone regions or via the toggle. The MarketingDict type
 * keeps both locales structurally in sync.
 */
export const dictionaries: Record<Locale, MarketingDict> = {
  en: {
    nav: { features: 'Features', how: 'How it works', docs: 'Docs', pricing: 'Pricing', faq: 'FAQ', signIn: 'Sign in', getStarted: 'Get started', dashboard: 'Dashboard' },
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
    },
  },
  fr: {
    nav: { features: 'Fonctionnalités', how: 'Comment ça marche', docs: 'Docs', pricing: 'Tarifs', faq: 'FAQ', signIn: 'Connexion', getStarted: 'Commencer', dashboard: 'Tableau de bord' },
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
    },
  },
};

export type Dictionary = MarketingDict;

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}

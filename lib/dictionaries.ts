import type { Locale } from './i18n';

interface MarketingDict {
  nav: { features: string; how: string; docs: string; pricing: string; faq: string; signIn: string; getStarted: string; dashboard: string };
  hero: { kicker: string; titleLead: string; titleAccent: string; subtitle: string; ctaPrimary: string; ctaSecondary: string; reassure: string; stack: string };
  pricing: { kicker: string; titleLead: string; titleAccent: string; subtitle: string };
}

/**
 * Marketing copy, per locale. French is the default market; English is served
 * to explicit anglophone regions or via the toggle. The MarketingDict type
 * keeps both locales structurally in sync.
 */
export const dictionaries: Record<Locale, MarketingDict> = {
  en: {
    nav: {
      features: 'Features',
      how: 'How it works',
      docs: 'Docs',
      pricing: 'Pricing',
      faq: 'FAQ',
      signIn: 'Sign in',
      getStarted: 'Get started',
      dashboard: 'Dashboard',
    },
    hero: {
      kicker: 'Self-hosted form backend · you own the data',
      titleLead: 'One form backend for',
      titleAccent: 'all your websites.',
      subtitle:
        'Every submission from every site, in one dashboard — with no SMTP and no backend. Branded auto-replies and AI spam-blocking included.',
      ctaPrimary: 'Start free',
      ctaSecondary: 'See how it works',
      reassure: 'No credit card · no SMTP config · integrate in 2 minutes',
      stack: 'Drops into any stack',
    },
    pricing: {
      kicker: 'Pricing · usage-based, not per-form',
      titleLead: 'Pay for leads,',
      titleAccent: 'not per form.',
      subtitle:
        'One backend for every site you build. Start free in two minutes — upgrade only when your lead volume does.',
    },
  },
  fr: {
    nav: {
      features: 'Fonctionnalités',
      how: 'Comment ça marche',
      docs: 'Docs',
      pricing: 'Tarifs',
      faq: 'FAQ',
      signIn: 'Connexion',
      getStarted: 'Commencer',
      dashboard: 'Tableau de bord',
    },
    hero: {
      kicker: 'Backend de formulaires auto-hébergé · vos données vous appartiennent',
      titleLead: 'Un seul backend de formulaires pour',
      titleAccent: 'tous vos sites.',
      subtitle:
        'Chaque soumission de chaque site, dans un seul tableau de bord — sans SMTP ni backend. Réponses automatiques à votre image et anti-spam par IA inclus.',
      ctaPrimary: 'Commencer gratuitement',
      ctaSecondary: 'Voir comment ça marche',
      reassure: 'Sans carte bancaire · sans config SMTP · intégré en 2 minutes',
      stack: "S'intègre à n'importe quelle stack",
    },
    pricing: {
      kicker: 'Tarifs · à l’usage, pas par formulaire',
      titleLead: 'Payez pour les leads,',
      titleAccent: 'pas par formulaire.',
      subtitle:
        'Un seul backend pour tous vos sites. Commencez gratuitement en deux minutes — passez à un forfait supérieur seulement quand votre volume de leads augmente.',
    },
  },
};

export type Dictionary = MarketingDict;

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}

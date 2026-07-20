import type { Metadata } from 'next';
import type { Locale } from './i18n';
import { getLocale } from './i18n';

/**
 * Bilingual SEO. Both languages serve at the same paths by geo/cookie, which
 * search engines can't index separately — so we expose explicit ?lang=en /
 * ?lang=fr variants and link them with hreflang. Googlebot then indexes a
 * French page AND an English page for every route, so Inlet ranks for both
 * "form backend" and "backend de formulaire".
 */

export const SITE_URL = 'https://forms-central-h1ee.vercel.app';
export const SITE_NAME = 'Inlet';

export type SeoKey = 'home' | 'pricing' | 'docs';

const SEO: Record<Locale, Record<SeoKey, { title: string; description: string; keywords: string[] }>> = {
  en: {
    home: {
      title: 'Inlet — One form backend for all your websites',
      description: 'The self-hosted form backend that centralizes submissions from all your sites into one dashboard — no SMTP, no per-site setup. Branded auto-reply emails, AI + proof-of-work spam blocking, CSV export. A privacy-first alternative to Formspree, Jotform and Basin.',
      keywords: ['form backend', 'form API', 'form backend service', 'Formspree alternative', 'Jotform alternative', 'Basin alternative', 'self-hosted forms', 'contact form backend', 'form without backend', 'form without SMTP', 'HTML form to email', 'static site form handler', 'Astro form backend', 'Next.js form backend', 'form spam protection', 'proof of work anti-spam', 'multi-tenant forms', 'white-label form emails'],
    },
    pricing: {
      title: 'Pricing — pay for leads, not per form',
      description: 'Inlet pricing: start free, upgrade only when your lead volume grows. One form backend for every site — no SMTP, no lock-in, usage-based plans.',
      keywords: ['form backend pricing', 'Formspree pricing alternative', 'cheap form backend', 'form API pricing', 'usage based form backend'],
    },
    docs: {
      title: 'Documentation — integrate a form backend in minutes',
      description: 'Integrate Inlet into any site: two values, one copy-paste helper, proof-of-work spam protection, signed webhooks. Works with Astro, Next.js, Nuxt, Vue, Svelte or plain HTML.',
      keywords: ['form backend integration', 'HTML form backend tutorial', 'form API docs', 'form webhook', 'contact form without server'],
    },
  },
  fr: {
    home: {
      title: 'Inlet — Un seul backend de formulaires pour tous vos sites',
      description: 'Le backend de formulaires auto-hébergé qui centralise les soumissions de tous vos sites dans un seul tableau de bord — sans SMTP, sans configuration par site. Réponses automatiques à votre image, anti-spam par IA et preuve de travail, export CSV. Une alternative à Formspree, Jotform et Basin qui respecte la vie privée.',
      keywords: ['backend de formulaire', 'backend formulaire', 'formulaire sans SMTP', 'formulaire sans backend', 'gestion de formulaires', 'alternative Formspree', 'alternative Jotform', 'backend formulaire de contact', 'formulaire pour site statique', 'API de formulaire', 'formulaire HTML vers e-mail', 'backend de formulaire auto-hébergé', 'formulaire Astro', 'formulaire Next.js', 'anti-spam formulaire', 'protection spam formulaire', 'formulaires multi-locataires', 'e-mails de formulaire en marque blanche'],
    },
    pricing: {
      title: 'Tarifs — payez pour les leads, pas par formulaire',
      description: 'Tarifs Inlet : commencez gratuitement, passez à un forfait supérieur seulement quand votre volume de leads augmente. Un seul backend pour tous vos sites — sans SMTP, sans verrouillage, à l’usage.',
      keywords: ['tarif backend de formulaire', 'prix backend formulaire', 'alternative Formspree pas cher', 'backend formulaire gratuit', 'tarif API formulaire'],
    },
    docs: {
      title: 'Documentation — intégrez un backend de formulaires en minutes',
      description: 'Intégrez Inlet à n’importe quel site : deux valeurs, un assistant à copier-coller, une protection anti-spam par preuve de travail, des webhooks signés. Compatible Astro, Next.js, Nuxt, Vue, Svelte ou HTML pur.',
      keywords: ['intégration backend de formulaire', 'tutoriel formulaire HTML', 'documentation API formulaire', 'webhook formulaire', 'formulaire de contact sans serveur'],
    },
  },
};

const PATHS: Record<SeoKey, string> = { home: '/', pricing: '/pricing', docs: '/docs' };

/** Resolve locale for a page: explicit ?lang wins, else geo/cookie/default. */
export async function resolveLocale(lang?: string): Promise<Locale> {
  if (lang === 'en' || lang === 'fr') return lang;
  return getLocale();
}

/** Build localized Metadata with hreflang alternates for a marketing page. */
export function buildMetadata(key: SeoKey, locale: Locale): Metadata {
  const s = SEO[locale][key];
  const path = PATHS[key];
  const base = `${SITE_URL}${path === '/' ? '' : path}`;
  const url = `${base}${locale === 'en' ? '?lang=en' : '?lang=fr'}`;
  return {
    title: { absolute: s.title },
    description: s.description,
    keywords: s.keywords,
    alternates: {
      canonical: url,
      languages: {
        en: `${base}?lang=en`,
        fr: `${base}?lang=fr`,
        'x-default': base || SITE_URL,
      },
    },
    openGraph: {
      type: 'website',
      siteName: SITE_NAME,
      title: s.title,
      description: s.description,
      url,
      locale: locale === 'fr' ? 'fr_FR' : 'en_US',
      alternateLocale: locale === 'fr' ? 'en_US' : 'fr_FR',
    },
    twitter: { card: 'summary_large_image', title: s.title, description: s.description },
  };
}

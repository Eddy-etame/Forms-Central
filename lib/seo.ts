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

// Single source of truth for the site's canonical origin. Every canonical tag,
// hreflang alternate, OG url, sitemap entry and robots host derives from this.
// Set NEXT_PUBLIC_SITE_URL in the environment (Vercel) to switch to a custom
// domain in one place — otherwise it defaults to the live deployment.
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://eam-inlet.vercel.app').replace(/\/+$/, '');
export const SITE_NAME = 'Inlet';

export type SeoKey = 'home' | 'pricing' | 'docs';

const SEO: Record<Locale, Record<SeoKey, { title: string; description: string; keywords: string[] }>> = {
  en: {
    home: {
      title: 'Inlet — The form backend for client websites',
      description: 'The form backend for client websites: every form belongs to a client, leads reach their inbox and e-mail, no SMTP and no e-mail address in your code.',
      keywords: ['form backend', 'form API', 'form backend service', 'form system', 'form management system', 'form MCP server', 'MCP form backend', 'AI form backend', 'form API for AI agents', 'Formspree alternative', 'Jotform alternative', 'Basin alternative', 'Getform alternative', 'Web3Forms alternative', 'contact form backend', 'form without backend', 'form without SMTP', 'HTML form to email', 'static site form handler', 'Astro form backend', 'Next.js form backend', 'form spam protection', 'proof of work anti-spam', 'multi-tenant forms', 'white-label form emails'],
    },
    pricing: {
      title: 'Pricing — pay for leads, not per form',
      description: 'Inlet pricing: start free, upgrade only when your lead volume grows. One form backend for every site — no SMTP, no lock-in, usage-based plans.',
      keywords: ['form backend pricing', 'Formspree pricing alternative', 'cheap form backend', 'form API pricing', 'usage based form backend'],
    },
    docs: {
      title: 'Documentation — integrate a form backend in minutes',
      description: 'Integrate Inlet in minutes: two public values, one snippet per framework, proof-of-work anti-spam, signed webhooks and an MCP server for AI agents.',
      keywords: ['form backend integration', 'HTML form backend tutorial', 'form API docs', 'form MCP server', 'MCP form backend', 'AI form backend integration', 'form webhook', 'signed form webhook', 'contact form without server', 'let AI build your forms'],
    },
  },
  fr: {
    home: {
      title: 'Inlet — Le backend de formulaires des sites clients',
      description: 'Chaque formulaire appartient à un client ; ses leads arrivent par e-mail et dans une boîte privée. Sans SMTP ni adresse e-mail dans votre code.',
      keywords: ['backend de formulaire', 'backend formulaire', 'système de formulaire', 'serveur MCP formulaire', 'backend de formulaire IA', 'API de formulaire pour agents IA', 'formulaire sans SMTP', 'formulaire sans backend', 'gestion de formulaires', 'alternative Formspree', 'alternative Jotform', 'alternative Getform', 'backend formulaire de contact', 'formulaire pour site statique', 'API de formulaire', 'formulaire HTML vers e-mail', 'formulaire Astro', 'formulaire Next.js', 'anti-spam formulaire', 'protection spam formulaire', 'formulaires multi-locataires', 'e-mails de formulaire en marque blanche'],
    },
    pricing: {
      title: 'Tarifs — payez pour les leads, pas par formulaire',
      description: 'Tarifs Inlet : commencez gratuitement, montez de forfait quand votre liste de clients grandit. Un backend pour tous vos sites, sans SMTP ni verrouillage.',
      keywords: ['tarif backend de formulaire', 'prix backend formulaire', 'alternative Formspree pas cher', 'backend formulaire gratuit', 'tarif API formulaire'],
    },
    docs: {
      title: 'Documentation — intégrez un backend de formulaires en minutes',
      description: 'Intégrez Inlet en minutes : deux valeurs publiques, un extrait par framework, anti-spam par preuve de travail, webhooks signés, serveur MCP pour agents IA.',
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
      // A page that sets its own openGraph loses the root's file-based image, so name it.
      images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: s.title }],
    },
    twitter: { card: 'summary_large_image', title: s.title, description: s.description, images: ['/opengraph-image'] },
  };
}

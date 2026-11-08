import type { Metadata } from 'next';
import { getLocale, type Locale } from './i18n';
import { SITE_URL } from './seo';

type Copy = Record<Locale, string>;

/**
 * Metadata for the auth and portal entry pages. They are client components,
 * so each segment gets a tiny layout that exports the result of this helper:
 * a real title per language, `noindex` by default (a sign-in page in a search
 * result helps nobody), and no inherited canonical pointing at the home page.
 */
export function authPageMetadata(title: Copy, opts: { index?: boolean; description?: Copy; path?: string } = {}) {
  return async function generateMetadata(): Promise<Metadata> {
    const locale = await getLocale();
    const m: Metadata = {
      title: title[locale],
      robots: opts.index ? { index: true, follow: true } : { index: false, follow: false },
    };
    if (opts.description) m.description = opts.description[locale];
    if (opts.index && opts.path) m.alternates = { canonical: `${SITE_URL}${opts.path}` };
    return m;
  };
}

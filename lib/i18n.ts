import { cookies, headers } from 'next/headers';

export type Locale = 'fr' | 'en';
export const LOCALES: Locale[] = ['fr', 'en'];
export const LOCALE_COOKIE = 'inlet-locale';

/**
 * Locale policy (per owner direction):
 *  - Explicit English markets → English.
 *  - Everything else, including Francophone regions (France, Belgium, Québec,
 *    Cameroon, West/Central Africa…) and anything unknown → French.
 * French is the default: the toggle lets anyone override, stored in a cookie.
 */
const ANGLOPHONE = new Set([
  'US', 'GB', 'AU', 'NZ', 'IE', 'ZA', 'IN', 'SG', 'PH', 'NG', 'GH', 'KE', 'UG', 'PK', 'JM', 'TT',
]);

export function localeFromCountry(country?: string | null): Locale {
  if (!country) return 'fr';
  return ANGLOPHONE.has(country.toUpperCase()) ? 'en' : 'fr';
}

/**
 * Resolve the active locale on the server:
 *   1. explicit cookie (user used the toggle) — always wins
 *   2. Vercel geo header (x-vercel-ip-country)
 *   3. Accept-Language (English → en)
 *   4. French default
 */
export async function getLocale(): Promise<Locale> {
  const cookieLocale = (await cookies()).get(LOCALE_COOKIE)?.value;
  if (cookieLocale === 'fr' || cookieLocale === 'en') return cookieLocale;

  const h = await headers();
  const country = h.get('x-vercel-ip-country');
  if (country) return localeFromCountry(country);

  const al = h.get('accept-language') || '';
  if (/^\s*en\b/i.test(al)) return 'en';
  return 'fr';
}

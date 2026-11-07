'use client';

import { createContext, useContext } from 'react';
import type { Locale } from './i18n';

/**
 * Locale for 'use client' components. The value comes from the server: the
 * root layout resolves it once (getLocale: cookie → geo → Accept-Language)
 * and provides it through LocaleProvider, so the server render and the first
 * client render always agree. The old version read the cookie in a useState
 * initializer, which rendered French on the server and English on the client
 * for every EN visitor — a hydration mismatch on each auth and portal page.
 *
 * The client portal nests its own provider with the client's language.
 */
export const LocaleContext = createContext<Locale>('fr');

export function useLocale(): Locale {
  return useContext(LocaleContext);
}

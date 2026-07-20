'use client';

import { useState } from 'react';
import type { Locale } from './i18n';

function readLocaleCookie(): Locale {
  if (typeof document === 'undefined') return 'fr';
  const m = document.cookie.match(/(?:^|; )inlet-locale=(fr|en)/);
  return (m?.[1] as Locale) || 'fr';
}

/**
 * Client-side locale for 'use client' pages that can't call the server
 * getLocale() (admin pages fetch their own data via useEffect, so they're
 * client components top to bottom). Reads the same inlet-locale cookie the
 * marketing/dashboard LanguageToggle already writes — synchronous initial
 * read (useState initializer), so there's no flash of the wrong language.
 * No geo fallback here (client has no request headers); defaults to French,
 * matching the site-wide default.
 */
export function useLocale(): Locale {
  const [locale] = useState<Locale>(readLocaleCookie);
  return locale;
}

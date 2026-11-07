'use client';

import type { ReactNode } from 'react';
import type { Locale } from '@/lib/i18n';
import { LocaleContext } from '@/lib/useLocale';

export default function LocaleProvider({ locale, children }: { locale: Locale; children: ReactNode }) {
  return <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>;
}

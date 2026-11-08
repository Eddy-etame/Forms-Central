import type { ReactNode } from 'react';
import { authPageMetadata } from '@/lib/authMetadata';

export const generateMetadata = authPageMetadata({ en: 'Sign in', fr: 'Connexion' });

export default function Layout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

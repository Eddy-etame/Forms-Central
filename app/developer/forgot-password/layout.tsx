import type { ReactNode } from 'react';
import { authPageMetadata } from '@/lib/authMetadata';

export const generateMetadata = authPageMetadata({ en: 'Reset your password', fr: 'Réinitialiser le mot de passe' });

export default function Layout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

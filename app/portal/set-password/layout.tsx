import type { ReactNode } from 'react';
import { authPageMetadata } from '@/lib/authMetadata';

export const generateMetadata = authPageMetadata({ en: 'Choose your password', fr: 'Choisissez votre mot de passe' });

export default function Layout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

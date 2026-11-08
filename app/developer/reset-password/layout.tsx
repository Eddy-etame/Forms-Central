import type { ReactNode } from 'react';
import { authPageMetadata } from '@/lib/authMetadata';

export const generateMetadata = authPageMetadata({ en: 'Choose a new password', fr: 'Nouveau mot de passe' });

export default function Layout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

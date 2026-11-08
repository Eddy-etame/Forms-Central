import type { ReactNode } from 'react';
import { authPageMetadata } from '@/lib/authMetadata';

export const generateMetadata = authPageMetadata({ en: 'Client inbox — sign in', fr: 'Boîte client — connexion' });

export default function Layout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

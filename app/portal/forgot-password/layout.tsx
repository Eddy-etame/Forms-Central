import type { ReactNode } from 'react';
import { authPageMetadata } from '@/lib/authMetadata';

export const generateMetadata = authPageMetadata({ en: 'Client inbox — reset your password', fr: 'Boîte client — mot de passe oublié' });

export default function Layout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

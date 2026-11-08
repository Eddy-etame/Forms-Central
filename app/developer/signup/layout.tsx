import type { ReactNode } from 'react';
import { authPageMetadata } from '@/lib/authMetadata';

export const generateMetadata = authPageMetadata({ en: 'Create your account', fr: 'Créer votre compte' }, {
  index: true,
  path: '/developer/signup',
  description: {
    en: 'Create a free Inlet account: your first client and form in two minutes, no card required.',
    fr: 'Créez un compte Inlet gratuit : premier client et premier formulaire en deux minutes, sans carte bancaire.',
  },
});

export default function Layout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

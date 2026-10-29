import * as React from 'react';
import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from 'react-email';

/**
 * Client invite / password reset — white-labelled to the developer's brand.
 * Carries a single-use set-password LINK. No password is ever written in an
 * e-mail (court order A9).
 */

interface ClientInviteProps {
  clientName: string;
  developerBrand?: string;
  actionUrl: string;
  isReset?: boolean;
  expiresInHours?: number;
  branding?: {
    logo_url?: string;
    primary_color?: string;
    font_family?: string;
  };
  lang?: 'fr' | 'en';
}

export const ClientInviteEmail = ({
  clientName = 'there',
  developerBrand = 'Client portal',
  actionUrl = '',
  isReset = false,
  expiresInHours = 168,
  branding = {},
  lang = 'fr',
}: ClientInviteProps) => {
  const isEn = lang === 'en';
  const primaryColor = branding.primary_color || '#0F766E';
  const fontFamily = branding.font_family || '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
  const days = Math.round(expiresInHours / 24);
  const expiry = expiresInHours >= 48
    ? (isEn ? `${days} days` : `${days} jours`)
    : (isEn ? `${expiresInHours} hour${expiresInHours > 1 ? 's' : ''}` : `${expiresInHours} heure${expiresInHours > 1 ? 's' : ''}`);

  const title = isReset
    ? (isEn ? 'Choose a new password' : 'Choisissez un nouveau mot de passe')
    : (isEn ? 'Your lead inbox is ready' : 'Votre boîte de leads est prête');

  const body = isReset
    ? (isEn
        ? 'A password reset was requested for your portal. Click the button to choose a new password. If you did not ask for this, ignore this e-mail — nothing changes.'
        : 'Une réinitialisation de mot de passe a été demandée pour votre espace. Cliquez sur le bouton pour choisir un nouveau mot de passe. Si vous n’êtes pas à l’origine de cette demande, ignorez cet e-mail — rien ne change.')
    : (isEn
        ? `${developerBrand} set up a private space where every request sent from your website lands — stored safely, answered from your inbox. Choose your password to open it.`
        : `${developerBrand} vous a ouvert un espace privé où arrive chaque demande envoyée depuis votre site — conservée en sécurité, à traiter depuis votre boîte. Choisissez votre mot de passe pour y accéder.`);

  return (
    <Html>
      <Head />
      <Preview>{title}</Preview>
      <Body style={{ backgroundColor: '#f6f9fc', fontFamily }}>
        <Container style={{ backgroundColor: '#ffffff', margin: '0 auto', padding: '20px 0 48px', marginBottom: '64px', borderRadius: '8px', overflow: 'hidden' }}>
          <Section style={{ padding: '20px 48px', backgroundColor: primaryColor, textAlign: 'center' }}>
            {branding.logo_url ? (
              <Img src={branding.logo_url} width="150" alt={developerBrand} style={{ margin: '0 auto', objectFit: 'contain' }} />
            ) : (
              <Heading style={{ color: '#ffffff', fontSize: '24px', margin: 0 }}>{developerBrand}</Heading>
            )}
          </Section>

          <Section style={{ padding: '0 48px' }}>
            <Heading style={{ fontSize: '20px', color: '#333', marginTop: '32px' }}>
              {isEn ? `Hello ${clientName},` : `Bonjour ${clientName},`}
            </Heading>
            <Text style={{ color: '#555', fontSize: '16px', lineHeight: '24px' }}>{body}</Text>

            <Section style={{ textAlign: 'center', marginTop: '28px' }}>
              <Link
                href={actionUrl}
                style={{ backgroundColor: primaryColor, color: '#fff', padding: '12px 24px', borderRadius: '6px', textDecoration: 'none', fontWeight: 'bold', display: 'inline-block' }}
              >
                {isReset
                  ? (isEn ? 'Choose a new password' : 'Choisir un nouveau mot de passe')
                  : (isEn ? 'Open my space' : 'Ouvrir mon espace')}
              </Link>
            </Section>

            <Text style={{ color: '#8898aa', fontSize: '12px', lineHeight: '20px', marginTop: '24px' }}>
              {isEn
                ? `This link works once and expires in ${expiry}. If the button does not open, paste this address into your browser:`
                : `Ce lien ne fonctionne qu’une fois et expire dans ${expiry}. Si le bouton ne s’ouvre pas, collez cette adresse dans votre navigateur :`}
              <br />
              <span style={{ color: '#2563eb', wordBreak: 'break-all' }}>{actionUrl}</span>
            </Text>

            <Hr style={{ borderColor: '#e6ebf1', margin: '32px 0 20px 0' }} />
            <Text style={{ color: '#8898aa', fontSize: '12px', textAlign: 'center' }}>
              {isEn
                ? 'This e-mail was sent automatically. Please do not reply.'
                : 'Cet e-mail a été envoyé automatiquement. Merci de ne pas y répondre.'}
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default ClientInviteEmail;

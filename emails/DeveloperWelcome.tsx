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
 * Developer account access — sent when the operator creates a developer
 * account by hand, or resets its password. Carries a single-use set-password
 * LINK; never a password (court order A9).
 */

interface DeveloperWelcomeProps {
  developerName: string;
  actionUrl: string;
  isReset?: boolean;
  branding?: {
    logo_url?: string;
    primary_color?: string;
    font_family?: string;
  };
  lang?: 'fr' | 'en';
}

export const DeveloperWelcomeEmail = ({
  developerName = 'there',
  actionUrl = '',
  isReset = false,
  branding = {},
  lang = 'fr',
}: DeveloperWelcomeProps) => {
  const isEn = lang === 'en';
  const primaryColor = branding.primary_color || '#0F172A';
  const fontFamily = branding.font_family || '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

  const title = isReset
    ? (isEn ? 'Reset your Inlet password' : 'Réinitialisez votre mot de passe Inlet')
    : (isEn ? 'Your Inlet developer account' : 'Votre compte développeur Inlet');

  return (
    <Html>
      <Head />
      <Preview>{title}</Preview>
      <Body style={{ backgroundColor: '#f6f9fc', fontFamily }}>
        <Container style={{ backgroundColor: '#ffffff', margin: '0 auto', padding: '20px 0 48px', marginBottom: '64px', borderRadius: '8px', overflow: 'hidden' }}>
          <Section style={{ padding: '20px 48px', backgroundColor: primaryColor, textAlign: 'center' }}>
            {branding.logo_url ? (
              <Img src={branding.logo_url} width="150" alt="Inlet" style={{ margin: '0 auto', objectFit: 'contain' }} />
            ) : (
              <Heading style={{ color: '#ffffff', fontSize: '24px', margin: 0 }}>Inlet</Heading>
            )}
          </Section>

          <Section style={{ padding: '0 48px' }}>
            <Heading style={{ fontSize: '20px', color: '#333', marginTop: '32px' }}>
              {isEn ? `Hello ${developerName},` : `Bonjour ${developerName},`}
            </Heading>
            <Text style={{ color: '#555', fontSize: '16px', lineHeight: '24px' }}>
              {isReset
                ? (isEn
                    ? 'Click the button to choose a new password. This link works once and expires in 1 hour. If you did not request a reset, ignore this e-mail.'
                    : 'Cliquez sur le bouton pour choisir un nouveau mot de passe. Ce lien ne fonctionne qu’une fois et expire dans 1 heure. Si vous n’avez rien demandé, ignorez cet e-mail.')
                : (isEn
                    ? 'Your developer account has been created. Choose your password to open your dashboard, create your clients and connect your first form.'
                    : 'Votre compte développeur a été créé. Choisissez votre mot de passe pour ouvrir votre tableau de bord, créer vos clients et connecter votre premier formulaire.')}
            </Text>

            <Section style={{ textAlign: 'center', marginTop: '28px' }}>
              <Link
                href={actionUrl}
                style={{ backgroundColor: primaryColor, color: '#fff', padding: '12px 24px', borderRadius: '6px', textDecoration: 'none', fontWeight: 'bold', display: 'inline-block' }}
              >
                {isEn ? 'Choose my password' : 'Choisir mon mot de passe'}
              </Link>
            </Section>

            <Text style={{ color: '#8898aa', fontSize: '12px', lineHeight: '20px', marginTop: '24px' }}>
              {isEn ? 'If the button does not open, paste this address into your browser:' : 'Si le bouton ne s’ouvre pas, collez cette adresse dans votre navigateur :'}
              <br />
              <span style={{ color: '#2563eb', wordBreak: 'break-all' }}>{actionUrl}</span>
            </Text>

            <Hr style={{ borderColor: '#e6ebf1', margin: '32px 0 20px 0' }} />
            <Text style={{ color: '#8898aa', fontSize: '12px', textAlign: 'center' }}>
              {isEn ? 'This e-mail was sent automatically. Please do not reply.' : 'Cet e-mail a été envoyé automatiquement. Merci de ne pas y répondre.'}
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default DeveloperWelcomeEmail;

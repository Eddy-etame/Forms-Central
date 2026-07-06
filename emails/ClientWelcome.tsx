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

interface ClientWelcomeProps {
  clientName: string;
  clientEmail: string;
  rawPassword?: string; // Optional because this template might be reused for password reset
  resetUrl?: string; // If this is a password reset link
  branding?: {
    logo_url?: string;
    primary_color?: string;
    font_family?: string;
  };
}

export const ClientWelcomeEmail = ({
  clientName = 'Client',
  clientEmail = '',
  rawPassword = '',
  resetUrl = '',
  branding = {},
}: ClientWelcomeProps) => {
  const primaryColor = branding.primary_color || '#0F766E';
  const fontFamily = branding.font_family || '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

  const isReset = !!resetUrl;

  return (
    <Html>
      <Head />
      <Preview>{isReset ? "Réinitialisation de votre mot de passe" : "Bienvenue sur votre Espace Client"}</Preview>
      <Body style={{ backgroundColor: '#f6f9fc', fontFamily }}>
        <Container style={{ backgroundColor: '#ffffff', margin: '0 auto', padding: '20px 0 48px', marginBottom: '64px', borderRadius: '8px', overflow: 'hidden' }}>
          
          {/* Dynamic Logo Header */}
          <Section style={{ padding: '20px 48px', backgroundColor: primaryColor, textAlign: 'center' }}>
            {branding.logo_url ? (
              <Img src={branding.logo_url} width="150" alt={clientName} style={{ margin: '0 auto', objectFit: 'contain' }} />
            ) : (
              <Heading style={{ color: '#ffffff', fontSize: '24px', margin: 0 }}>{clientName}</Heading>
            )}
          </Section>

          <Section style={{ padding: '0 48px' }}>
            <Heading style={{ fontSize: '20px', color: '#333', marginTop: '32px' }}>
              Bonjour {clientName},
            </Heading>
            
            {!isReset ? (
              <>
                <Text style={{ color: '#555', fontSize: '16px', lineHeight: '24px' }}>
                  Votre espace client a été créé avec succès. Vous pouvez dès à présent vous connecter pour gérer vos formulaires et consulter vos leads.
                </Text>
                
                <Section style={{ backgroundColor: '#f9fbfd', padding: '16px', borderRadius: '8px', marginTop: '16px', border: '1px solid #e6ebf1' }}>
                  <Text style={{ margin: '8px 0', color: '#333', fontSize: '15px' }}>
                    <strong>Email de connexion :</strong> {clientEmail}
                  </Text>
                  <Text style={{ margin: '8px 0', color: '#333', fontSize: '15px' }}>
                    <strong>Mot de passe :</strong> <span style={{ fontFamily: 'monospace', background: '#e2e8f0', padding: '2px 6px', borderRadius: '4px' }}>{rawPassword}</span>
                  </Text>
                </Section>
                
                <Text style={{ color: '#555', fontSize: '14px', lineHeight: '22px', marginTop: '16px' }}>
                  Pour des raisons de sécurité, nous vous conseillons de conserver cet email.
                </Text>
              </>
            ) : (
              <>
                <Text style={{ color: '#555', fontSize: '16px', lineHeight: '24px' }}>
                  Vous avez demandé la réinitialisation de votre mot de passe. Votre nouveau mot de passe temporaire a été généré :
                </Text>

                <Section style={{ backgroundColor: '#f9fbfd', padding: '16px', borderRadius: '8px', marginTop: '16px', border: '1px solid #e6ebf1', textAlign: 'center' }}>
                  <Text style={{ margin: '0', color: '#333', fontSize: '18px', fontWeight: 'bold' }}>
                    Nouveau mot de passe : <span style={{ fontFamily: 'monospace', color: primaryColor }}>{rawPassword}</span>
                  </Text>
                </Section>
              </>
            )}

            <Hr style={{ borderColor: '#e6ebf1', margin: '32px 0 24px' }} />

            <Section style={{ textAlign: 'center' }}>
              <Link 
                href="https://logiciel-formulaire.vercel.app/client/login" 
                style={{ 
                  backgroundColor: primaryColor, 
                  color: '#fff', 
                  padding: '12px 24px', 
                  borderRadius: '6px', 
                  textDecoration: 'none', 
                  fontWeight: 'bold',
                  display: 'inline-block'
                }}
              >
                Accéder à mon espace
              </Link>
            </Section>

            <Hr style={{ borderColor: '#e6ebf1', margin: '32px 0 20px 0' }} />

            <Text style={{ color: '#8898aa', fontSize: '12px', textAlign: 'center' }}>
              Cet email a été envoyé automatiquement. Merci de ne pas y répondre.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default ClientWelcomeEmail;

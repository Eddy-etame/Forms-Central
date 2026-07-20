import * as React from 'react';
import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Preview,
  Section,
  Text,
} from 'react-email';

interface AutoReplyProps {
  clientName: string;
  formName: string;
  customMessage?: string;
  branding?: {
    logo_url?: string;
    primary_color?: string;
    font_family?: string;
  };
  lang?: 'fr' | 'en';
}

export const AutoReplyEmail = ({
  clientName = 'Client',
  formName = 'Contact Form',
  customMessage,
  branding = {},
  lang = 'fr',
}: AutoReplyProps) => {
  const isEn = lang === 'en';
  const primaryColor = branding.primary_color || '#0F766E';
  const fontFamily = branding.font_family || '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

  const defaultMessage = isEn
    ? `Thank you for your message via ${formName}. We have received your request and our team will get back to you as soon as possible.`
    : `Merci pour votre message via ${formName}. Nous avons bien reçu votre demande et notre équipe vous répondra dans les plus brefs délais.`;
  const messageBody = customMessage || defaultMessage;

  return (
    <Html>
      <Head />
      <Preview>{isEn ? `Confirmation of receipt - ${clientName}` : `Confirmation de réception - ${clientName}`}</Preview>
      <Body style={{ backgroundColor: '#ffffff', fontFamily }}>
        <Container style={{ margin: '0 auto', padding: '20px 0 48px', maxWidth: '600px' }}>

          <Section style={{ textAlign: 'center', marginBottom: '32px' }}>
            {branding.logo_url ? (
              <Img src={branding.logo_url} width="150" alt={clientName} style={{ margin: '0 auto' }} />
            ) : (
              <Heading style={{ color: primaryColor, fontSize: '24px', margin: 0 }}>{clientName}</Heading>
            )}
          </Section>

          <Section style={{ padding: '0 24px' }}>
            <Text style={{ color: '#333', fontSize: '16px', lineHeight: '26px' }}>
              {isEn ? 'Hello,' : 'Bonjour,'}
            </Text>

            <Text style={{ color: '#555', fontSize: '16px', lineHeight: '26px', whiteSpace: 'pre-wrap' }}>
              {messageBody}
            </Text>

            <Text style={{ color: '#555', fontSize: '16px', lineHeight: '26px', marginTop: '32px' }}>
              {isEn ? 'Best regards,' : 'Cordialement,'}<br />
              <strong style={{ color: primaryColor }}>{isEn ? `The ${clientName} team` : `L'équipe ${clientName}`}</strong>
            </Text>

            <Hr style={{ borderColor: '#e6ebf1', margin: '32px 0 20px 0' }} />

            <Text style={{ color: '#8898aa', fontSize: '12px', textAlign: 'center' }}>
              {isEn
                ? 'This email was generated automatically. Please do not reply directly unless stated otherwise.'
                : 'Cet email est généré automatiquement. Merci de ne pas y répondre directement sauf indication contraire.'}
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default AutoReplyEmail;

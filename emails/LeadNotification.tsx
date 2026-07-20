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

const FRENCH_LABELS: Record<string, string> = {
  nom: 'Nom',
  email: 'Email',
  telephone: 'Téléphone',
  phone: 'Téléphone',
  message: 'Message',
  subject: 'Sujet',
  sujet: 'Sujet',
  audience: 'Audience',
  marque: 'Marque',
  modele: 'Modèle',
  annee: 'Année',
  motorisation: 'Motorisation',
  photos_count: 'Nombre de photos',
  photo_1_data: 'Photo 1',
  photo_2_data: 'Photo 2',
  photo_3_data: 'Photo 3',
  photo_4_data: 'Photo 4',
  photo_5_data: 'Photo 5',
  sent_at: "Date d'envoi",
  ip_address: 'Adresse IP',
  'ip address': 'Adresse IP',
};

const ENGLISH_LABELS: Record<string, string> = {
  nom: 'Name',
  email: 'Email',
  telephone: 'Phone',
  phone: 'Phone',
  message: 'Message',
  subject: 'Subject',
  sujet: 'Subject',
  audience: 'Audience',
  marque: 'Brand',
  modele: 'Model',
  annee: 'Year',
  motorisation: 'Engine',
  photos_count: 'Photo count',
  photo_1_data: 'Photo 1',
  photo_2_data: 'Photo 2',
  photo_3_data: 'Photo 3',
  photo_4_data: 'Photo 4',
  photo_5_data: 'Photo 5',
  sent_at: 'Sent at',
  ip_address: 'IP address',
  'ip address': 'IP address',
};

const getFieldLabel = (key: string, isEn: boolean): string => {
  const normalizedKey = key.toLowerCase().trim();
  const table = isEn ? ENGLISH_LABELS : FRENCH_LABELS;
  if (table[normalizedKey]) {
    return table[normalizedKey];
  }

  // Try mapping dynamic photo names: e.g. photo_1_data or photo1data or photo1
  const photoMatch = normalizedKey.match(/^photo_?(\d+)(_?data)?$/);
  if (photoMatch) {
    return `Photo ${photoMatch[1]}`;
  }

  return key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

interface LeadNotificationProps {
  clientName: string;
  formName: string;
  payload: Record<string, any>;
  branding?: {
    logo_url?: string;
    primary_color?: string;
    font_family?: string;
  };
  lang?: 'fr' | 'en';
}

export const LeadNotificationEmail = ({
  clientName = 'Client',
  formName = 'Contact Form',
  payload = {},
  branding = {},
  lang = 'fr',
}: LeadNotificationProps) => {
  const isEn = lang === 'en';
  const primaryColor = branding.primary_color || '#0F766E'; // Default teal
  const fontFamily = branding.font_family || '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

  return (
    <Html>
      <Head />
      <Preview>{isEn ? `New lead via ${formName} - ${clientName}` : `Nouveau lead via ${formName} - ${clientName}`}</Preview>
      <Body style={{ backgroundColor: '#f6f9fc', fontFamily }}>
        <Container style={{ backgroundColor: '#ffffff', margin: '0 auto', padding: '20px 0 48px', marginBottom: '64px' }}>

          {/* Dynamic Logo Header */}
          <Section style={{ padding: '20px 48px', backgroundColor: primaryColor, textAlign: 'center' }}>
            {branding.logo_url ? (
              <Img src={branding.logo_url} width="150" alt={clientName} style={{ margin: '0 auto' }} />
            ) : (
              <Heading style={{ color: '#ffffff', fontSize: '24px', margin: 0 }}>{clientName}</Heading>
            )}
          </Section>

          <Section style={{ padding: '0 48px' }}>
            <Heading style={{ fontSize: '20px', color: '#333', marginTop: '24px' }}>
              {isEn ? `New message received: ${formName}` : `Nouveau message reçu : ${formName}`}
            </Heading>
            <Text style={{ color: '#555', fontSize: '16px', lineHeight: '24px' }}>
              {isEn
                ? 'You have received a new submission from your website. Here are the details:'
                : 'Vous avez reçu une nouvelle soumission depuis votre site web. Voici les détails :'}
            </Text>

            <Hr style={{ borderColor: '#e6ebf1', margin: '20px 0' }} />

            <Section style={{ backgroundColor: '#f9fbfd', padding: '16px', borderRadius: '8px' }}>
              {Object.entries(payload).map(([key, value]) => {
                const formattedKey = getFieldLabel(key, isEn);

                let valStr = String(value);
                // Try parsing dates for the sent_at key
                if (key.toLowerCase().trim() === 'sent_at' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(valStr)) {
                  try {
                    const date = new Date(valStr);
                    if (!isNaN(date.getTime())) {
                      valStr = isEn
                        ? date.toLocaleString('en-GB', { timeZone: 'Europe/Paris' })
                        : date.toLocaleString('fr-FR', { timeZone: 'Europe/Paris' });
                    }
                  } catch (_) {}
                }

                const isUrl = valStr.startsWith('http') && (valStr.includes('supabase.co/storage') || valStr.includes('uploads/'));
                const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://logiciel-formulaire.vercel.app';
                const proxyUrl = isUrl ? `${baseUrl}/api/download?url=${encodeURIComponent(valStr)}` : valStr;

                return (
                  <Text key={key} style={{ margin: '8px 0', color: '#333', fontSize: '15px' }}>
                    <strong style={{ color: primaryColor }}>{formattedKey}:</strong>{' '}
                    {isUrl ? (
                      <Link href={proxyUrl} style={{ color: primaryColor, textDecoration: 'underline' }}>
                        {isEn ? 'View / Download attachment' : 'Voir / Télécharger la pièce jointe'}
                      </Link>
                    ) : (
                      valStr
                    )}
                  </Text>
                );
              })}
            </Section>

            <Hr style={{ borderColor: '#e6ebf1', margin: '20px 0' }} />

            <Text style={{ color: '#8898aa', fontSize: '12px', textAlign: 'center' }}>
              {isEn
                ? 'This email was sent automatically by the Inlet forms service.'
                : 'Cet email a été envoyé automatiquement par le service Inlet Forms.'}
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default LeadNotificationEmail;

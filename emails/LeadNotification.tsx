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
import { SITE_URL } from '@/lib/seo';

/**
 * Lead notification — sent to the client (the business) and, when enabled,
 * copied to the developer. Reply-To is the visitor's address, so answering
 * from any inbox answers the lead.
 *
 * Attachments are never linked by their storage URL: the e-mail points to the
 * portal, which checks the reader's session before serving a file.
 */

const FRENCH_LABELS: Record<string, string> = {
  nom: 'Nom', name: 'Nom', email: 'E-mail', telephone: 'Téléphone', phone: 'Téléphone',
  message: 'Message', subject: 'Sujet', sujet: 'Sujet', audience: 'Audience',
  marque: 'Marque', modele: 'Modèle', annee: 'Année', motorisation: 'Motorisation',
  photos_count: 'Nombre de photos', sent_at: "Date d'envoi", ip_address: 'Adresse IP', 'ip address': 'Adresse IP',
};

const ENGLISH_LABELS: Record<string, string> = {
  nom: 'Name', name: 'Name', email: 'Email', telephone: 'Phone', phone: 'Phone',
  message: 'Message', subject: 'Subject', sujet: 'Subject', audience: 'Audience',
  marque: 'Brand', modele: 'Model', annee: 'Year', motorisation: 'Engine',
  photos_count: 'Photo count', sent_at: 'Sent at', ip_address: 'IP address', 'ip address': 'IP address',
};

const getFieldLabel = (key: string, isEn: boolean): string => {
  const normalizedKey = key.toLowerCase().trim();
  const table = isEn ? ENGLISH_LABELS : FRENCH_LABELS;
  if (table[normalizedKey]) return table[normalizedKey];
  const photoMatch = normalizedKey.match(/^photo_?(\d+)(_?data)?$/);
  if (photoMatch) return `Photo ${photoMatch[1]}`;
  return key.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
};

export const isStorageUrl = (v: unknown): v is string =>
  typeof v === 'string' && v.startsWith('http') && (v.includes('/storage/v1/object/') || v.includes('supabase.co/storage'));

interface LeadNotificationProps {
  clientName: string;
  formName: string;
  payload: Record<string, unknown>;
  branding?: {
    logo_url?: string;
    primary_color?: string;
    font_family?: string;
    whiteLabel?: boolean;
  };
  lang?: 'fr' | 'en';
  /** The lead was flagged by the keyword filter or the AI classifier. */
  suspect?: string | null;
  /** Where the reader can open the lead (portal for clients, dashboard for developers). */
  openUrl?: string;
  /** True when this copy goes to the developer, not the client. */
  developerCopy?: boolean;
}

export const LeadNotificationEmail = ({
  clientName = 'Client',
  formName = 'Contact Form',
  payload = {},
  branding = {},
  lang = 'fr',
  suspect = null,
  openUrl,
  developerCopy = false,
}: LeadNotificationProps) => {
  const isEn = lang === 'en';
  const showInletBadge = !branding.whiteLabel;
  const primaryColor = branding.primary_color || '#0F766E';
  const fontFamily = branding.font_family || '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
  const open = openUrl || `${SITE_URL}/portal`;

  return (
    <Html>
      <Head />
      <Preview>{isEn ? `New lead via ${formName} - ${clientName}` : `Nouveau lead via ${formName} - ${clientName}`}</Preview>
      <Body style={{ backgroundColor: '#f6f9fc', fontFamily }}>
        <Container style={{ backgroundColor: '#ffffff', margin: '0 auto', padding: '20px 0 48px', marginBottom: '64px' }}>
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
              {developerCopy
                ? (isEn
                    ? `Copy for the developer — the client (${clientName}) received this lead too.`
                    : `Copie pour le développeur — le client (${clientName}) a aussi reçu ce lead.`)
                : (isEn
                    ? 'A visitor sent a request from your website. Reply to this e-mail to answer them directly.'
                    : 'Un visiteur a envoyé une demande depuis votre site. Répondez à cet e-mail pour lui écrire directement.')}
            </Text>

            {suspect && (
              <Section style={{ backgroundColor: '#fffbeb', border: '1px solid #fcd34d', padding: '12px 16px', borderRadius: '8px' }}>
                <Text style={{ margin: 0, color: '#92400e', fontSize: '14px' }}>
                  {isEn
                    ? `Flagged as possible spam (${suspect}). It was kept so nothing is lost — check it before replying.`
                    : `Signalé comme possible spam (${suspect}). Il a été conservé pour ne rien perdre — vérifiez-le avant de répondre.`}
                </Text>
              </Section>
            )}

            <Hr style={{ borderColor: '#e6ebf1', margin: '20px 0' }} />

            <Section style={{ backgroundColor: '#f9fbfd', padding: '16px', borderRadius: '8px' }}>
              {Object.entries(payload).map(([key, value]) => {
                const formattedKey = getFieldLabel(key, isEn);
                let valStr = String(value ?? '');
                if (key.toLowerCase().trim() === 'sent_at' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(valStr)) {
                  const date = new Date(valStr);
                  if (!isNaN(date.getTime())) {
                    valStr = date.toLocaleString(isEn ? 'en-GB' : 'fr-FR', { timeZone: 'Europe/Paris' });
                  }
                }
                const isFile = isStorageUrl(value);
                return (
                  <Text key={key} style={{ margin: '8px 0', color: '#333', fontSize: '15px' }}>
                    <strong style={{ color: primaryColor }}>{formattedKey}:</strong>{' '}
                    {isFile ? (
                      <Link href={open} style={{ color: primaryColor, textDecoration: 'underline' }}>
                        {isEn ? 'Attachment — open it in your space' : 'Pièce jointe — ouvrir dans votre espace'}
                      </Link>
                    ) : (
                      valStr
                    )}
                  </Text>
                );
              })}
            </Section>

            <Section style={{ textAlign: 'center', marginTop: '24px' }}>
              <Link
                href={open}
                style={{ backgroundColor: primaryColor, color: '#fff', padding: '10px 20px', borderRadius: '6px', textDecoration: 'none', fontWeight: 'bold', display: 'inline-block', fontSize: '14px' }}
              >
                {isEn ? 'Open in my space' : 'Ouvrir dans mon espace'}
              </Link>
            </Section>

            <Hr style={{ borderColor: '#e6ebf1', margin: '20px 0' }} />

            {showInletBadge && (
              <Text style={{ color: '#8898aa', fontSize: '12px', textAlign: 'center' }}>
                {isEn ? 'Powered by ' : 'Propulsé par '}
                <Link href={`${SITE_URL}/?ref=notify`} style={{ color: '#2563EB', textDecoration: 'none', fontWeight: 600 }}>Inlet</Link>
                {isEn ? ' — every lead captured, answered and proven.' : ' — chaque demande reçue, traitée et prouvée.'}
              </Text>
            )}
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default LeadNotificationEmail;

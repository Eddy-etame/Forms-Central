import nodemailer from 'nodemailer';
import { render } from 'react-email';
import * as React from 'react';
import LeadNotificationEmail from '@/emails/LeadNotification';
import AutoReplyEmail from '@/emails/AutoReply';
import DeveloperWelcomeEmail from '@/emails/DeveloperWelcome';
import ClientInviteEmail from '@/emails/ClientInvite';
import { getMailAccounts, applyDisplayName, extractDisplayName } from './mailAccounts';
import { supabase } from './supabase';

/**
 * Outgoing e-mail.
 *
 * Production runs ONE verified provider/account (court order A7). The
 * multi-account loop below only exists so a key rotation or a provider
 * migration can overlap for a day without dropping mail — it is not a way to
 * stack free tiers. Every send returns { success } and callers MUST treat
 * `false` as a failure (log it, retry later), never as "sent".
 */

export interface SendResult {
  success: boolean;
  messageId?: string;
}

/** The From header: SMTP_FROM, else the first configured account's sender. */
function getSenderAddress(displayName?: string): string {
  const accounts = getMailAccounts();
  const base = process.env.SMTP_FROM || accounts[0]?.from || (process.env.SMTP_USER ? `"Inlet" <${process.env.SMTP_USER}>` : '"Inlet" <no-reply@invalid>');
  return applyDisplayName(base, displayName);
}

/** Records an SMTP failure so it surfaces on the operator Logs page. Fire-and-forget. */
function logSmtpFailure(errorType: string, label: string, user: string, message: string): void {
  supabase
    .from('failures_log')
    .insert([{ form_id: null, error_type: errorType, error_message: `${label} (${user}): ${message}`.slice(0, 500), payload: {} }])
    .then(() => {}, () => {});
}

// Circuit breaker: after an account fails, skip it for a cooldown window so we
// stop hammering a suspended/blocked provider. In-memory (per instance).
const accountCooldownUntil = new Map<string, number>();
const SMTP_COOLDOWN_MS = 30 * 60 * 1000;

async function sendWithFallback(mailOptions: nodemailer.SendMailOptions): Promise<SendResult> {
  const accounts = getMailAccounts();
  if (accounts.length === 0) {
    console.error('[SMTP] No sending accounts configured. Email aborted.');
    logSmtpFailure('SMTP_NOT_CONFIGURED', 'none', '-', 'No SMTP account configured');
    return { success: false };
  }

  const displayName = extractDisplayName(mailOptions.from as string | undefined);
  const now = Date.now();
  const healthy = accounts.filter((a) => (accountCooldownUntil.get(a.label) ?? 0) <= now);
  const pool = healthy.length > 0 ? healthy : accounts;

  for (const acc of pool) {
    if (!acc.host || !acc.user) continue;
    for (let i = 0; i < acc.passwords.length; i++) {
      const transporter = nodemailer.createTransport({
        host: acc.host,
        port: acc.port,
        secure: acc.secure,
        auth: { user: acc.user, pass: acc.passwords[i] },
      });
      try {
        const info = await transporter.sendMail({
          ...mailOptions,
          from: applyDisplayName(acc.from, displayName),
        });
        accountCooldownUntil.delete(acc.label);
        return { success: true, messageId: info.messageId };
      } catch (err) {
        const msg = (err as Error)?.message || 'unknown error';
        accountCooldownUntil.set(acc.label, Date.now() + SMTP_COOLDOWN_MS);
        console.warn(`[SMTP] ${acc.label} key ${i + 1} failed, cooling down…`, msg);
        logSmtpFailure('SMTP_ACCOUNT_FAILED', acc.label, acc.user, msg);
        break;
      }
    }
  }

  logSmtpFailure('SMTP_ALL_ACCOUNTS_FAILED', 'all', `${accounts.length} accounts`, 'Every sending account failed.');
  console.error('[SMTP] All accounts exhausted — email not sent.');
  return { success: false };
}

type Branding = { logo_url?: string | null; primary_color?: string | null; font_family?: string | null; whiteLabel?: boolean };

function cleanBranding(b?: Branding | null) {
  return {
    logo_url: b?.logo_url || undefined,
    primary_color: b?.primary_color || undefined,
    font_family: b?.font_family || undefined,
    whiteLabel: !!b?.whiteLabel,
  };
}

/* ─────────────────────────── leads ─────────────────────────── */

export interface LeadEmailOptions {
  to: string;
  formName: string;
  payload: Record<string, unknown>;
  ipAddress: string;
  clientName: string;          // the business the lead belongs to
  branding?: Branding | null;
  lang?: 'fr' | 'en';
  suspect?: string | null;     // keyword / AI flag reason
  openUrl?: string;            // where the reader opens the lead
  developerCopy?: boolean;     // this copy goes to the developer
  replyTo?: string | null;     // the visitor's address
}

/** Lead notification. `success:false` means nothing was sent — callers log it. */
export async function sendLeadEmail(o: LeadEmailOptions): Promise<SendResult> {
  const lang = o.lang === 'en' ? 'en' : 'fr';
  const isEn = lang === 'en';

  const htmlContent = await render(
    React.createElement(LeadNotificationEmail, {
      clientName: o.clientName,
      formName: o.formName,
      payload: o.payload,
      branding: cleanBranding(o.branding),
      lang,
      suspect: o.suspect ?? null,
      openUrl: o.openUrl,
      developerCopy: !!o.developerCopy,
    })
  );

  const lines = Object.entries(o.payload)
    .filter(([, v]) => !(typeof v === 'string' && v.startsWith('http') && v.includes('/storage/')))
    .map(([k, v]) => `- ${k}: ${String(v ?? '')}`)
    .join('\n');
  const textContent = isEn
    ? `New lead received\nForm: ${o.formName}\n\n${lines}\n\nOpen: ${o.openUrl || ''}`
    : `Nouveau lead reçu\nFormulaire : ${o.formName}\n\n${lines}\n\nOuvrir : ${o.openUrl || ''}`;

  const prefix = o.suspect ? (isEn ? '[Check] ' : '[À vérifier] ') : '';
  return sendWithFallback({
    from: getSenderAddress(o.clientName),
    to: o.to,
    subject: `${prefix}${isEn ? 'New lead' : 'Nouveau lead'} · ${o.formName}`,
    text: textContent,
    html: htmlContent,
    ...(o.replyTo ? { replyTo: o.replyTo } : {}),
  });
}

/* ─────────────────────────── auto-reply ─────────────────────────── */

export async function sendAutoReplyEmail(
  toEmail: string,
  formName: string,
  clientName: string,
  customSubject?: string,
  customMessage?: string,
  lang: string = 'fr',
  branding?: Branding | null,
  senderName?: string,
  customSenderName?: string,
  replyTo?: string
): Promise<boolean> {
  const isEn = lang.toLowerCase() === 'en';

  const parseTemplate = (text: string) => {
    if (!text) return text;
    const nameToUse = senderName && senderName.trim() !== '' ? senderName.trim() : 'Client';
    return text.replace(/\{\{name\}\}/gi, nameToUse).replace(/\{\{nom\}\}/gi, nameToUse);
  };

  const defaultSubject = isEn ? `Confirmation of receipt - ${formName}` : `Confirmation de réception - ${formName}`;
  const subject = customSubject && customSubject.trim() !== '' ? parseTemplate(customSubject) : defaultSubject;
  const parsedCustomMessage = customMessage ? parseTemplate(customMessage) : undefined;

  const htmlContent = await render(
    React.createElement(AutoReplyEmail, {
      clientName,
      formName,
      customMessage: parsedCustomMessage,
      branding: cleanBranding(branding),
      lang: isEn ? 'en' : 'fr',
    })
  );

  const textContent = parsedCustomMessage && parsedCustomMessage.trim() !== ''
    ? parsedCustomMessage.trim()
    : (isEn
      ? `Thank you for your message, ${senderName || 'Client'}. We have received your request and will get back to you as soon as possible.`
      : `Merci pour votre message, ${senderName || 'Client'}. Nous avons bien reçu votre demande et vous répondrons dans les meilleurs délais.`);

  const result = await sendWithFallback({
    from: getSenderAddress(customSenderName?.trim() || clientName),
    to: toEmail,
    subject,
    text: textContent,
    html: htmlContent,
    ...(replyTo && replyTo.trim() ? { replyTo: replyTo.trim() } : {}),
  });
  return result.success;
}

/* ─────────────────────────── access links ─────────────────────────── */

/** Developer account created or reset by the operator: a set-password link, never a password. */
export async function sendDeveloperAccessEmail(
  toEmail: string,
  developerName: string,
  actionUrl: string,
  isReset: boolean,
  branding?: Branding | null,
  lang: string = 'fr'
): Promise<boolean> {
  const isEn = lang.toLowerCase() === 'en';
  const htmlContent = await render(
    React.createElement(DeveloperWelcomeEmail, {
      developerName,
      actionUrl,
      isReset,
      branding: cleanBranding(branding),
      lang: isEn ? 'en' : 'fr',
    })
  );
  const subject = isReset
    ? (isEn ? 'Reset your Inlet password' : 'Réinitialisez votre mot de passe Inlet')
    : (isEn ? 'Your Inlet developer account' : 'Votre compte développeur Inlet');
  const text = isEn
    ? `Hello ${developerName},\n\n${isReset ? 'Choose a new password' : 'Choose your password to open your dashboard'}: ${actionUrl}\n\nThe link works once.`
    : `Bonjour ${developerName},\n\n${isReset ? 'Choisissez un nouveau mot de passe' : 'Choisissez votre mot de passe pour ouvrir votre tableau de bord'} : ${actionUrl}\n\nLe lien ne fonctionne qu’une fois.`;
  const result = await sendWithFallback({ from: getSenderAddress('Inlet'), to: toEmail, subject, text, html: htmlContent });
  return result.success;
}

/** Client invite or reset: white-labelled to the developer, a set-password link, never a password. */
export async function sendClientInviteEmail(
  toEmail: string,
  clientName: string,
  developerBrand: string,
  actionUrl: string,
  isReset: boolean,
  branding?: Branding | null,
  lang: string = 'fr',
  expiresInHours = 168
): Promise<boolean> {
  const isEn = lang.toLowerCase() === 'en';
  const htmlContent = await render(
    React.createElement(ClientInviteEmail, {
      clientName,
      developerBrand,
      actionUrl,
      isReset,
      expiresInHours,
      branding: cleanBranding(branding),
      lang: isEn ? 'en' : 'fr',
    })
  );
  const subject = isReset
    ? (isEn ? `Choose a new password - ${developerBrand}` : `Choisissez un nouveau mot de passe - ${developerBrand}`)
    : (isEn ? `Your lead inbox is ready - ${developerBrand}` : `Votre boîte de leads est prête - ${developerBrand}`);
  const text = isEn
    ? `Hello ${clientName},\n\n${isReset ? 'Choose a new password' : 'Open your space'}: ${actionUrl}\n\nThe link works once.`
    : `Bonjour ${clientName},\n\n${isReset ? 'Choisissez un nouveau mot de passe' : 'Ouvrez votre espace'} : ${actionUrl}\n\nLe lien ne fonctionne qu’une fois.`;
  const result = await sendWithFallback({ from: getSenderAddress(developerBrand), to: toEmail, subject, text, html: htmlContent });
  return result.success;
}

/* ─────────────────────────── operator notices ─────────────────────────── */

/** A developer asked for a paid plan: tell the operator (no mailto to a personal mailbox). */
export async function sendPlanRequestEmail(
  operatorEmail: string,
  req: { developerName: string; developerEmail: string; plan: string; message?: string | null }
): Promise<boolean> {
  const safe = (s: string) => s.replace(/[<>&]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c] as string));
  const text = `Plan request\n\nDeveloper: ${req.developerName} <${req.developerEmail}>\nPlan: ${req.plan}\n\n${req.message || '(no message)'}\n\nActivate it from the operator dashboard (clients → plan).`;
  const html = `<div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;font-size:14px;line-height:1.6;color:#0f172a">
    <h2 style="margin:0 0 12px">Plan request · ${safe(req.plan)}</h2>
    <p><strong>${safe(req.developerName)}</strong> &lt;${safe(req.developerEmail)}&gt;</p>
    <p style="white-space:pre-wrap;background:#f1f5f9;padding:12px;border-radius:8px">${safe(req.message || '(no message)')}</p>
    <p style="color:#64748b">Activate it from the operator dashboard (clients → plan).</p>
  </div>`;
  const result = await sendWithFallback({
    from: getSenderAddress('Inlet'),
    to: operatorEmail,
    subject: `[Inlet] Plan request: ${req.plan} — ${req.developerEmail}`,
    text,
    html,
    replyTo: req.developerEmail,
  });
  return result.success;
}

/* ─────────────────────────── OTP + developer reset ─────────────────────────── */

export async function sendOtpEmail(toEmail: string, code: string, lang: string = 'fr'): Promise<boolean> {
  const isEn = lang.toLowerCase() === 'en';
  const text = isEn
    ? `Your Inlet sign-in code is ${code}\n\nIt expires in 10 minutes and can be used once. If you didn't try to sign in, change your password.`
    : `Votre code de connexion Inlet est ${code}\n\nIl expire dans 10 minutes et ne peut être utilisé qu'une seule fois. Si vous n'avez pas essayé de vous connecter, changez votre mot de passe.`;

  const html = `
  <div style="background:#f6f7f9;padding:32px 0;font-family:-apple-system,Segoe UI,Roboto,sans-serif;">
    <div style="max-width:480px;margin:0 auto;background:#fff;border:1px solid #e2e8f0;border-radius:16px;overflow:hidden;">
      <div style="background:#0f172a;padding:20px 28px;color:#fff;font-weight:700;font-size:16px;">Inlet</div>
      <div style="padding:28px;color:#0f172a;">
        <h1 style="margin:0 0 12px;font-size:20px;">${isEn ? 'Your sign-in code' : 'Votre code de connexion'}</h1>
        <p style="margin:0 0 20px;color:#475569;font-size:14px;line-height:1.6;">
          ${isEn ? 'Enter this code to finish signing in. It expires in <strong>10 minutes</strong>.' : 'Saisissez ce code pour terminer la connexion. Il expire dans <strong>10 minutes</strong>.'}
        </p>
        <div style="font-size:34px;font-weight:800;letter-spacing:10px;background:#f1f5f9;border-radius:12px;padding:16px 0;text-align:center;color:#0f172a;">${code}</div>
        <p style="margin:22px 0 0;color:#94a3b8;font-size:12px;line-height:1.6;">
          ${isEn ? "If you didn't try to sign in, someone may have your password — change it right away." : "Si vous n'avez pas essayé de vous connecter, quelqu'un a peut-être votre mot de passe — changez-le immédiatement."}
        </p>
      </div>
    </div>
  </div>`;

  const result = await sendWithFallback({
    from: getSenderAddress('Inlet'),
    to: toEmail,
    subject: isEn ? `${code} is your Inlet sign-in code` : `${code} est votre code de connexion Inlet`,
    text,
    html,
  });
  return result.success;
}

/** Developer "forgot password": single-use link, 1 hour. */
export async function sendPasswordResetEmail(toEmail: string, resetUrl: string, lang: string = 'fr'): Promise<boolean> {
  const isEn = lang.toLowerCase() === 'en';
  const text = isEn
    ? `Reset your Inlet password:\n${resetUrl}\n\nThis link expires in 1 hour and can be used once. If you didn't request a reset, you can safely ignore this email.`
    : `Réinitialisez votre mot de passe Inlet :\n${resetUrl}\n\nCe lien expire dans 1 heure et ne peut être utilisé qu'une seule fois. Si vous n'avez pas demandé cette réinitialisation, ignorez simplement cet email.`;

  const html = `
  <div style="background:#f6f7f9;padding:32px 0;font-family:-apple-system,Segoe UI,Roboto,sans-serif;">
    <div style="max-width:480px;margin:0 auto;background:#fff;border:1px solid #e2e8f0;border-radius:16px;overflow:hidden;">
      <div style="background:#0f172a;padding:20px 28px;color:#fff;font-weight:700;font-size:16px;">Inlet</div>
      <div style="padding:28px;color:#0f172a;">
        <h1 style="margin:0 0 12px;font-size:20px;">${isEn ? 'Reset your password' : 'Réinitialisez votre mot de passe'}</h1>
        <p style="margin:0 0 20px;color:#475569;font-size:14px;line-height:1.6;">
          ${isEn
            ? 'We received a request to reset your Inlet password. Click the button below to choose a new one. This link expires in <strong>1 hour</strong> and can be used once.'
            : 'Nous avons reçu une demande de réinitialisation de votre mot de passe Inlet. Cliquez sur le bouton ci-dessous pour en choisir un nouveau. Ce lien expire dans <strong>1 heure</strong> et ne peut être utilisé qu’une seule fois.'}
        </p>
        <a href="${resetUrl}" style="display:inline-block;background:#0f172a;color:#fff;text-decoration:none;padding:12px 22px;border-radius:10px;font-weight:600;font-size:14px;">${isEn ? 'Reset password' : 'Réinitialiser le mot de passe'}</a>
        <p style="margin:22px 0 0;color:#94a3b8;font-size:12px;line-height:1.6;">
          ${isEn ? "If you didn't request this, ignore this email — your password stays unchanged." : 'Si vous n’avez pas demandé ceci, ignorez cet email — votre mot de passe reste inchangé.'}<br/>
          ${isEn ? 'Or paste this link into your browser:' : 'Ou collez ce lien dans votre navigateur :'}<br/>
          <span style="color:#2563eb;word-break:break-all;">${resetUrl}</span>
        </p>
      </div>
    </div>
  </div>`;

  const result = await sendWithFallback({
    from: getSenderAddress('Inlet'),
    to: toEmail,
    subject: isEn ? 'Reset your Inlet password' : 'Réinitialisez votre mot de passe Inlet',
    text,
    html,
  });
  return result.success;
}

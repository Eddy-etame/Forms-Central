import nodemailer from 'nodemailer';
import { render } from 'react-email';
import * as React from 'react';
import LeadNotificationEmail from '@/emails/LeadNotification';
import AutoReplyEmail from '@/emails/AutoReply';
import DeveloperWelcomeEmail from '@/emails/DeveloperWelcome';
import ClientInviteEmail from '@/emails/ClientInvite';
import { getMailAccounts, applyDisplayName, extractDisplayName } from './mailAccounts';
import { supabase } from './supabase';
import { isUndeliverableEmail, localizeAutoReplySubject } from './domain';
import { background } from './background';

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

/** Records an SMTP failure so it surfaces on the operator Logs page. Never blocks, always lands. */
function logSmtpFailure(errorType: string, label: string, user: string, message: string): void {
  background(
    Promise.resolve(
      supabase
        .from('failures_log')
        .insert([{ form_id: null, error_type: errorType, error_message: `${label} (${user}): ${message}`.slice(0, 500), payload: {} }])
    ).then(() => {}, () => {})
  );
}

// A dead or slow account must not eat the whole invocation: fail fast, try the next.
const SMTP_TIMEOUTS = { connectionTimeout: 8_000, greetingTimeout: 8_000, socketTimeout: 15_000 };

/** Every recipient is a reserved, undeliverable address (see lib/domain.ts). */
function onlyUndeliverable(to: nodemailer.SendMailOptions['to']): boolean {
  const list = (Array.isArray(to) ? to : [to]).map((r) => (typeof r === 'string' ? r : r?.address || ''));
  return list.length > 0 && list.every((r) => isUndeliverableEmail(r));
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
  // Reserved addresses are never mailed: the account's login is verified instead,
  // which is everything short of handing the message over.
  const verifyOnly = onlyUndeliverable(mailOptions.to);
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
        ...SMTP_TIMEOUTS,
      });
      try {
        if (verifyOnly) {
          await transporter.verify();
          transporter.close();
          accountCooldownUntil.delete(acc.label);
          return { success: true, messageId: `verify-only:${acc.label}` };
        }
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
  delayedSince?: string | null; // ISO date of the lead when this is a late (retried) notification
}

/** The sentence a late notification opens with (shared by the HTML template and the text part). */
export function delayedNotice(sinceIso: string, lang: 'fr' | 'en'): string {
  const d = new Date(sinceIso);
  const when = `${d.toLocaleDateString(lang === 'en' ? 'en-GB' : 'fr-FR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })}, ${d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' })} UTC`;
  return lang === 'en'
    ? `Delayed notification — this lead arrived on ${when}. A technical fault on our side held this e-mail back; the lead itself was stored safely the whole time.`
    : `Notification en retard — ce lead est arrivé le ${when}. Un incident technique de notre côté a retenu cet e-mail ; le lead, lui, a bien été enregistré pendant tout ce temps.`;
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
      delayedSince: o.delayedSince ?? null,
    })
  );
  const delayedNote = o.delayedSince ? delayedNotice(o.delayedSince, lang) : '';

  const lines = Object.entries(o.payload)
    .filter(([, v]) => !(typeof v === 'string' && v.startsWith('http') && v.includes('/storage/')))
    .map(([k, v]) => `- ${k}: ${String(v ?? '')}`)
    .join('\n');
  const textContent = (delayedNote ? `${delayedNote}\n\n` : '') + (isEn
    ? `New lead received\nForm: ${o.formName}\n\n${lines}\n\nOpen: ${o.openUrl || ''}`
    : `Nouveau lead reçu\nFormulaire : ${o.formName}\n\n${lines}\n\nOuvrir : ${o.openUrl || ''}`);

  const prefix = (o.delayedSince ? (isEn ? '[Delayed] ' : '[En retard] ') : '') + (o.suspect ? (isEn ? '[Check] ' : '[À vérifier] ') : '');
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

  // A written subject wins; a stored default is answered in the visitor's language.
  const subject = parseTemplate(localizeAutoReplySubject(customSubject, isEn ? 'en' : 'fr'));
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

/* ─────────────────────────── retention ─────────────────────────── */

const esc = (s: string) => s.replace(/[<>&"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[c] as string));

/** A UTC date as people write it: "9 December 2026" / "9 décembre 2026". */
export function longDate(iso: string, lang: 'fr' | 'en'): string {
  return new Date(iso).toLocaleDateString(lang === 'en' ? 'en-GB' : 'fr-FR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
}

/** "lead" is the word in both languages of the product. */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const leadsWord = (n: number, _lang?: 'fr' | 'en') => `${n} lead${n === 1 ? '' : 's'}`;
const windowWords = (days: number, lang: 'fr' | 'en') =>
  days === 365 ? (lang === 'en' ? 'one year' : 'un an') : lang === 'en' ? `${days} days` : `${days} jours`;

function systemShell(title: string, inner: string): string {
  return `
  <div style="background:#f6f7f9;padding:32px 0;font-family:-apple-system,Segoe UI,Roboto,sans-serif;">
    <div style="max-width:520px;margin:0 auto;background:#fff;border:1px solid #e2e8f0;border-radius:16px;overflow:hidden;">
      <div style="background:#0f172a;padding:20px 28px;color:#fff;font-weight:700;font-size:16px;">Inlet</div>
      <div style="padding:28px;color:#0f172a;font-size:14px;line-height:1.65;">
        <h1 style="margin:0 0 14px;font-size:20px;line-height:1.3;">${title}</h1>
        ${inner}
      </div>
    </div>
  </div>`;
}

export interface RetentionNoticeEmail {
  to: string;
  developerName: string;
  planName: string;
  windowDays: number;
  leadCount: number;
  calendar: { date: string; count: number }[];
  byForm: { name: string; count: number }[];
  dashboardUrl: string;
  plansUrl: string;
  lang: 'fr' | 'en';
}

/**
 * The notice that must precede any deletion for age. It is the developer's
 * whole deletion calendar on the day it is sent — what goes, when, and the two
 * ways to keep it. Returns false when nothing was handed to a mail server.
 */
export async function sendRetentionNoticeEmail(o: RetentionNoticeEmail): Promise<boolean> {
  const en = o.lang === 'en';
  const first = o.calendar[0];
  const last = o.calendar[o.calendar.length - 1];
  const shown = o.calendar.slice(0, 6);
  const more = o.calendar.length - shown.length;
  const firstDate = longDate(`${first.date}T00:00:00Z`, o.lang);
  const win = windowWords(o.windowDays, o.lang);

  const subject = en
    ? `Inlet — ${leadsWord(first.count, 'en')} will be deleted on ${firstDate}`
    : `Inlet — ${leadsWord(first.count, 'fr')} ${first.count === 1 ? 'sera supprimé' : 'seront supprimés'} le ${firstDate}`;

  const intro = en
    ? `Your ${o.planName} plan keeps each lead for ${win}. You hold ${leadsWord(o.leadCount, 'en')} today. This is their deletion calendar; nothing leaves before the first date.`
    : `Votre forfait ${o.planName} conserve chaque lead pendant ${win}. Vous avez ${leadsWord(o.leadCount, 'fr')} aujourd’hui. Voici leur calendrier de suppression ; rien ne part avant la première date.`;
  const moreLine = more > 0
    ? (en
        ? `…then ${more} more date${more === 1 ? '' : 's'}, the last on ${longDate(`${last.date}T00:00:00Z`, 'en')}.`
        : `…puis ${more} autre${more === 1 ? '' : 's'} date${more === 1 ? '' : 's'}, la dernière le ${longDate(`${last.date}T00:00:00Z`, 'fr')}.`)
    : '';
  const forms = o.byForm.slice(0, 5).map((f) => `${f.name} (${f.count})`).join(', ') + (o.byForm.length > 5 ? '…' : '');
  const keepTitle = en ? 'To keep them' : 'Pour les garder';
  const keep1 = en
    ? 'Export everything as CSV from your dashboard. It is included in every plan.'
    : 'Exportez tout en CSV depuis votre tableau de bord. C’est inclus dans tous les forfaits.';
  const keep2 = en
    ? 'Or ask for a plan that keeps leads longer: one year on Solo, no limit on Pro and Max. While your request is open, nothing is deleted.'
    : 'Ou demandez un forfait qui conserve plus longtemps : un an en Solo, sans limite en Pro et Max. Tant que votre demande est ouverte, rien n’est supprimé.';
  const untouched = en
    ? 'Not affected: the e-mails your clients received for each lead.'
    : 'Non concernés : les e-mails que vos clients ont reçus pour chaque lead.';
  const rule = en
    ? 'You always get this notice at least 7 days before anything it announces is deleted. Leads that arrive from now on will be announced the same way.'
    : 'Vous recevez toujours cet avis au moins 7 jours avant toute suppression qu’il annonce. Les leads qui arrivent à partir de maintenant seront annoncés de la même façon.';
  const hello = en ? `Hello ${o.developerName},` : `Bonjour ${o.developerName},`;
  const byFormLabel = en ? 'By form' : 'Par formulaire';
  const exportLabel = en ? 'Open the dashboard' : 'Ouvrir le tableau de bord';
  const plansLabel = en ? 'See the plans' : 'Voir les forfaits';

  const text = [
    hello, '', intro, '',
    ...shown.map((c) => `  ${longDate(`${c.date}T00:00:00Z`, o.lang)} — ${leadsWord(c.count, o.lang)}`),
    ...(moreLine ? [`  ${moreLine}`] : []),
    '', `${byFormLabel}: ${forms}`, '',
    keepTitle,
    `- ${keep1} ${o.dashboardUrl}`,
    `- ${keep2} ${o.plansUrl}`,
    '', untouched, '', rule,
  ].join('\n');

  const html = systemShell(
    esc(en ? `${leadsWord(first.count, 'en')} will be deleted on ${firstDate}` : `${leadsWord(first.count, 'fr')} ${first.count === 1 ? 'sera supprimé' : 'seront supprimés'} le ${firstDate}`),
    `<p style="margin:0 0 6px;">${esc(hello)}</p>
     <p style="margin:0 0 16px;color:#334155;">${esc(intro)}</p>
     <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;margin:0 0 6px;">
       ${shown.map((c, i) => `<tr>
         <td style="padding:8px 0;border-top:1px solid #e2e8f0;${i === 0 ? 'font-weight:700;' : ''}">${esc(longDate(`${c.date}T00:00:00Z`, o.lang))}</td>
         <td style="padding:8px 0;border-top:1px solid #e2e8f0;text-align:right;${i === 0 ? 'font-weight:700;' : 'color:#475569;'}">${esc(leadsWord(c.count, o.lang))}</td>
       </tr>`).join('')}
     </table>
     ${moreLine ? `<p style="margin:0 0 6px;color:#64748b;font-size:13px;">${esc(moreLine)}</p>` : ''}
     <p style="margin:10px 0 20px;color:#64748b;font-size:13px;">${esc(byFormLabel)} : ${esc(forms)}</p>
     <p style="margin:0 0 8px;font-weight:700;">${esc(keepTitle)}</p>
     <p style="margin:0 0 10px;color:#334155;">${esc(keep1)}</p>
     <p style="margin:0 0 18px;"><a href="${esc(o.dashboardUrl)}" style="display:inline-block;background:#0f172a;color:#fff;text-decoration:none;padding:11px 20px;border-radius:10px;font-weight:600;font-size:14px;">${esc(exportLabel)}</a></p>
     <p style="margin:0 0 10px;color:#334155;">${esc(keep2)}</p>
     <p style="margin:0 0 22px;"><a href="${esc(o.plansUrl)}" style="color:#0f172a;font-weight:600;">${esc(plansLabel)}</a></p>
     <p style="margin:0 0 8px;color:#64748b;font-size:13px;">${esc(untouched)}</p>
     <p style="margin:0;color:#64748b;font-size:13px;">${esc(rule)}</p>`
  );

  const result = await sendWithFallback({ from: getSenderAddress('Inlet'), to: o.to, subject, text, html });
  return result.success;
}

/** Last call, two days before a backlog announced earlier is deleted. */
export async function sendRetentionReminderEmail(o: {
  to: string; developerName: string; planName: string; windowDays: number; count: number;
  deleteAfter: string; noticeSentAt: string; dashboardUrl: string; plansUrl: string; lang: 'fr' | 'en';
}): Promise<boolean> {
  const en = o.lang === 'en';
  const date = longDate(o.deleteAfter, o.lang);
  const sent = longDate(o.noticeSentAt, o.lang);
  const win = windowWords(o.windowDays, o.lang);
  const title = en
    ? `Last call: ${leadsWord(o.count, 'en')} will be deleted on ${date}`
    : `Dernier rappel : ${leadsWord(o.count, 'fr')} ${o.count === 1 ? 'sera supprimé' : 'seront supprimés'} le ${date}`;
  const body = en
    ? `On ${date}, the ${leadsWord(o.count, 'en')} announced in our notice of ${sent} ${o.count === 1 ? 'is' : 'are'} deleted: ${o.count === 1 ? 'it is' : 'they are'} older than the ${win} of your ${o.planName} plan.`
    : `Le ${date}, ${o.count === 1 ? 'le lead annoncé' : `les ${leadsWord(o.count, 'fr')} annoncés`} dans notre avis du ${sent} ${o.count === 1 ? 'sera supprimé : il dépasse' : 'seront supprimés : ils dépassent'} la durée de ${win} de votre forfait ${o.planName}.`;
  const keep = en
    ? 'Export them as CSV from your dashboard, or ask for a longer plan: while your request is open, nothing is deleted.'
    : 'Exportez-les en CSV depuis votre tableau de bord, ou demandez un forfait plus long : tant que votre demande est ouverte, rien n’est supprimé.';
  const hello = en ? `Hello ${o.developerName},` : `Bonjour ${o.developerName},`;
  const text = [hello, '', body, '', keep, '', `${en ? 'Dashboard' : 'Tableau de bord'}: ${o.dashboardUrl}`, `${en ? 'Plans' : 'Forfaits'}: ${o.plansUrl}`].join('\n');
  const html = systemShell(
    esc(title),
    `<p style="margin:0 0 6px;">${esc(hello)}</p>
     <p style="margin:0 0 16px;color:#334155;">${esc(body)}</p>
     <p style="margin:0 0 18px;color:#334155;">${esc(keep)}</p>
     <p style="margin:0 0 14px;"><a href="${esc(o.dashboardUrl)}" style="display:inline-block;background:#0f172a;color:#fff;text-decoration:none;padding:11px 20px;border-radius:10px;font-weight:600;font-size:14px;">${esc(en ? 'Open the dashboard' : 'Ouvrir le tableau de bord')}</a></p>
     <p style="margin:0;"><a href="${esc(o.plansUrl)}" style="color:#0f172a;font-weight:600;">${esc(en ? 'See the plans' : 'Voir les forfaits')}</a></p>`
  );
  const result = await sendWithFallback({ from: getSenderAddress('Inlet'), to: o.to, subject: `Inlet — ${title}`, text, html });
  return result.success;
}

/** What a scheduled job did, for the operator. Plain and in English, like the other operator mail. */
export async function sendOperatorReportEmail(operatorEmail: string, subject: string, lines: string[]): Promise<boolean> {
  const text = lines.join('\n');
  const html = `<div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;font-size:14px;line-height:1.6;color:#0f172a">
    <h2 style="margin:0 0 12px;font-size:17px">${esc(subject)}</h2>
    <pre style="white-space:pre-wrap;background:#f1f5f9;padding:14px;border-radius:8px;font-family:ui-monospace,Menlo,Consolas,monospace;font-size:13px;line-height:1.55;margin:0">${esc(text)}</pre>
  </div>`;
  const result = await sendWithFallback({ from: getSenderAddress('Inlet'), to: operatorEmail, subject: `[Inlet] ${subject}`, text, html });
  return result.success;
}

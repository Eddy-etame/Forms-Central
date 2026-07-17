import nodemailer from 'nodemailer';
import { render } from 'react-email';
import * as React from 'react';
import LeadNotificationEmail from '@/emails/LeadNotification';
import AutoReplyEmail from '@/emails/AutoReply';
import ClientWelcomeEmail from '@/emails/ClientWelcome';
import { getMailAccounts, applyDisplayName, extractDisplayName } from './mailAccounts';
import { supabase } from './supabase';

/**
 * Resolves the primary From header from SMTP_FROM, attaching a custom display
 * name when provided. (Kept for callers; sendWithFallback re-homes per account.)
 */
function getSenderAddress(displayName?: string): string {
  const envFrom = process.env.SMTP_FROM || '"Inlet" <devv80@outlook.com>';
  return applyDisplayName(envFrom, displayName);
}

/**
 * Records an SMTP account failure so it surfaces on the super-admin
 * Logs page (a blocked/quota'd Brevo account becomes visible immediately).
 * Fire-and-forget — never blocks sending.
 */
function logSmtpFailure(errorType: string, label: string, user: string, message: string): void {
  supabase
    .from('failures_log')
    .insert([{ form_id: null, error_type: errorType, error_message: `${label} (${user}): ${message}`.slice(0, 500), payload: {} }])
    .then(() => {}, () => {});
}

// Circuit breaker: after an account fails, skip it for a cooldown window so we
// stop hammering a suspended/blocked provider. Self-heals — it re-enters the
// pool once the cooldown lapses. In-memory (per instance); worst case an
// account is retried once per instance per window.
const accountCooldownUntil = new Map<string, number>();
const SMTP_COOLDOWN_MS = 30 * 60 * 1000;

/**
 * Sends via nodemailer, rotating across healthy accounts (and each account's
 * keys). The caller's display name is re-homed onto whichever account's
 * verified sender is used, so authentication always matches.
 */
async function sendWithFallback(mailOptions: nodemailer.SendMailOptions): Promise<{ success: boolean; messageId?: string }> {
  const accounts = getMailAccounts();
  if (accounts.length === 0) {
    console.error('[SMTP] No sending accounts configured. Email aborted.');
    return { success: false };
  }

  const displayName = extractDisplayName(mailOptions.from as string | undefined);

  // Prefer accounts not in cooldown; if every account is cooling down, try them
  // all anyway (better to attempt than to never send).
  const now = Date.now();
  const healthy = accounts.filter((a) => (accountCooldownUntil.get(a.label) ?? 0) <= now);
  const pool = healthy.length > 0 ? healthy : accounts;

  // Round-robin: random start so load spreads evenly across the healthy pool.
  const start = Math.floor(Math.random() * pool.length);
  for (let a = 0; a < pool.length; a++) {
    const acc = pool[(start + a) % pool.length];
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
        accountCooldownUntil.delete(acc.label); // healthy again
        console.log(`[SMTP] Sent via ${acc.label} (key ${i + 1}): ${info.messageId}`);
        return { success: true, messageId: info.messageId };
      } catch (err) {
        // Any failure (auth, connection, suspension, or daily-quota): cool the
        // account down, signal it, and rotate to the next.
        const msg = (err as Error)?.message || 'unknown error';
        accountCooldownUntil.set(acc.label, Date.now() + SMTP_COOLDOWN_MS);
        console.warn(`[SMTP] ${acc.label} key ${i + 1} failed, cooling down + rotating…`, msg);
        logSmtpFailure('SMTP_ACCOUNT_FAILED', acc.label, acc.user, msg);
        break; // move to the next account (don't try more keys on a dead account)
      }
    }
  }

  logSmtpFailure('SMTP_ALL_ACCOUNTS_FAILED', 'all', `${accounts.length} accounts`, 'Every sending account failed — no account had capacity.');
  console.error('[SMTP] All accounts exhausted — email not sent.');
  return { success: false };
}

/**
 * Sends a HTML/text email notification for a new lead.
 * Directly communicates with the SMTP mail server configured in .env.local.
 */
export async function sendLeadEmail(
  toEmail: string,
  formName: string,
  payload: Record<string, string>,
  ipAddress: string,
  companyName?: string,
  branding?: any
): Promise<boolean> {
  const senderEmailKey = Object.keys(payload).find(k => k.toLowerCase() === 'email');
  const senderEmail = senderEmailKey ? payload[senderEmailKey] : undefined;

  console.log(`[EMAIL] Preparing lead email notification for client: ${toEmail}, Form: "${formName}"`);

  // Render React Email
  const htmlContent = await render(
    React.createElement(LeadNotificationEmail, {
      clientName: companyName || 'Client',
      formName,
      payload: { ...payload, 'IP Address': ipAddress },
      branding: branding || {}
    })
  );

  const textContent = `Nouveau lead reçu\nFormulaire : ${formName}\nIP : ${ipAddress}\n\nDonnées :\n${Object.entries(payload).map(([k, v]) => `- ${k}: ${v}`).join('\n')}`;

  const result = await sendWithFallback({
    from: getSenderAddress(companyName ? `${companyName} Forms` : undefined),
    to: toEmail,
    subject: `[Lead] ${formName}`,
    text: textContent,
    html: htmlContent,
    ...(senderEmail ? { replyTo: senderEmail } : {}),
  });

  return result.success;
}

function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, (m) => {
    switch (m) {
      case '&': return '&amp;';
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '"': return '&quot;';
      case "'": return '&#039;';
      default: return m;
    }
  });
}

/**
 * Sends an automatic confirmation/thank-you email to the form submitter.
 */
export async function sendAutoReplyEmail(
  toEmail: string,
  formName: string,
  clientName: string,
  customSubject?: string,
  customMessage?: string,
  lang: string = 'fr',
  branding?: any,
  senderName?: string,
  // Paid "custom sender" identity (see lib/plans customSender): the display
  // name the end-customer sees and the address their reply goes to. Both work
  // without a verified domain (the actual From stays on our authed sender).
  customSenderName?: string,
  replyTo?: string
): Promise<boolean> {
  const isEn = lang.toLowerCase() === 'en';
  
  const parseTemplate = (text: string) => {
    if (!text) return text;
    const nameToUse = senderName && senderName.trim() !== '' ? senderName.trim() : (isEn ? 'Client' : 'Client');
    return text.replace(/\{\{name\}\}/gi, nameToUse).replace(/\{\{nom\}\}/gi, nameToUse);
  };

  const defaultSubject = isEn
    ? `Confirmation of receipt - ${formName}`
    : `Confirmation de réception - ${formName}`;

  const subject = customSubject && customSubject.trim() !== '' 
    ? parseTemplate(customSubject)
    : defaultSubject;

  const parsedCustomMessage = customMessage ? parseTemplate(customMessage) : undefined;

  // Render React Email AutoReply
  const htmlContent = await render(
    React.createElement(AutoReplyEmail, {
      clientName,
      formName,
      customMessage: parsedCustomMessage,
      branding: branding || {}
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
    subject: subject,
    text: textContent,
    html: htmlContent,
    ...(replyTo && replyTo.trim() ? { replyTo: replyTo.trim() } : {}),
  });

  if (result.success) {
    console.log(`[AUTOREPLY] Email successfully sent to ${toEmail}: ${result.messageId}`);
  } else {
    console.error(`[AUTOREPLY] All SMTP passwords exhausted. Failed to send auto-reply to ${toEmail}`);
  }

  return result.success;
}

/**
 * Sends a welcome email (or password reset) to a client containing their login credentials.
 */
export async function sendClientWelcomeEmail(
  toEmail: string,
  clientName: string,
  rawPassword?: string,
  resetUrl?: string,
  branding?: any
): Promise<boolean> {
  console.log(`[EMAIL] Preparing client welcome/reset email for: ${toEmail}`);

  const htmlContent = await render(
    React.createElement(ClientWelcomeEmail, {
      clientName,
      clientEmail: toEmail,
      rawPassword,
      resetUrl,
      branding: branding || {}
    })
  );

  const subject = resetUrl 
    ? `Réinitialisation de votre mot de passe - ${clientName}`
    : `Vos accès Espace Client - ${clientName}`;

  const textContent = resetUrl
    ? `Bonjour ${clientName},\n\nVous avez demandé la réinitialisation de votre mot de passe. Voici votre nouveau mot de passe temporaire : ${rawPassword}\n\nConnectez-vous sur votre espace.`
    : `Bonjour ${clientName},\n\nVotre espace client a été créé.\n\nEmail: ${toEmail}\nMot de passe: ${rawPassword}\n\nConservez cet email précieusement.`;

  const result = await sendWithFallback({
    from: getSenderAddress('Espace Client'),
    to: toEmail,
    subject: subject,
    text: textContent,
    html: htmlContent,
  });

  return result.success;
}

/**
 * Two-factor sign-in code (email OTP). Self-contained HTML; the 6-digit code
 * expires in 10 minutes and can be used once.
 */
export async function sendOtpEmail(toEmail: string, code: string): Promise<boolean> {
  const text =
    `Your Inlet sign-in code is ${code}\n\n` +
    `It expires in 10 minutes and can be used once. ` +
    `If you didn't try to sign in, change your password.`;

  const html = `
  <div style="background:#f6f7f9;padding:32px 0;font-family:-apple-system,Segoe UI,Roboto,sans-serif;">
    <div style="max-width:480px;margin:0 auto;background:#fff;border:1px solid #e2e8f0;border-radius:16px;overflow:hidden;">
      <div style="background:#0f172a;padding:20px 28px;color:#fff;font-weight:700;font-size:16px;">Inlet</div>
      <div style="padding:28px;color:#0f172a;">
        <h1 style="margin:0 0 12px;font-size:20px;">Your sign-in code</h1>
        <p style="margin:0 0 20px;color:#475569;font-size:14px;line-height:1.6;">
          Enter this code to finish signing in. It expires in <strong>10 minutes</strong>.
        </p>
        <div style="font-size:34px;font-weight:800;letter-spacing:10px;background:#f1f5f9;border-radius:12px;padding:16px 0;text-align:center;color:#0f172a;">${code}</div>
        <p style="margin:22px 0 0;color:#94a3b8;font-size:12px;line-height:1.6;">
          If you didn't try to sign in, someone may have your password — change it right away.
        </p>
      </div>
    </div>
  </div>`;

  const result = await sendWithFallback({
    from: getSenderAddress('Inlet'),
    to: toEmail,
    subject: `${code} is your Inlet sign-in code`,
    text,
    html,
  });
  return result.success;
}

/**
 * Password reset email (English, self-contained). The link carries a single-use
 * token that expires in one hour.
 */
export async function sendPasswordResetEmail(toEmail: string, resetUrl: string): Promise<boolean> {
  const text =
    `Reset your Inlet password:\n${resetUrl}\n\n` +
    `This link expires in 1 hour and can be used once. ` +
    `If you didn't request a reset, you can safely ignore this email.`;

  const html = `
  <div style="background:#f6f7f9;padding:32px 0;font-family:-apple-system,Segoe UI,Roboto,sans-serif;">
    <div style="max-width:480px;margin:0 auto;background:#fff;border:1px solid #e2e8f0;border-radius:16px;overflow:hidden;">
      <div style="background:#0f172a;padding:20px 28px;color:#fff;font-weight:700;font-size:16px;">Inlet</div>
      <div style="padding:28px;color:#0f172a;">
        <h1 style="margin:0 0 12px;font-size:20px;">Reset your password</h1>
        <p style="margin:0 0 20px;color:#475569;font-size:14px;line-height:1.6;">
          We received a request to reset your Inlet password. Click the button below to choose a new one.
          This link expires in <strong>1 hour</strong> and can be used once.
        </p>
        <a href="${resetUrl}" style="display:inline-block;background:#0f172a;color:#fff;text-decoration:none;padding:12px 22px;border-radius:10px;font-weight:600;font-size:14px;">Reset password</a>
        <p style="margin:22px 0 0;color:#94a3b8;font-size:12px;line-height:1.6;">
          If you didn't request this, ignore this email — your password stays unchanged.<br/>
          Or paste this link into your browser:<br/>
          <span style="color:#2563eb;word-break:break-all;">${resetUrl}</span>
        </p>
      </div>
    </div>
  </div>`;

  const result = await sendWithFallback({
    from: getSenderAddress('Inlet'),
    to: toEmail,
    subject: 'Reset your Inlet password',
    text,
    html,
  });
  return result.success;
}

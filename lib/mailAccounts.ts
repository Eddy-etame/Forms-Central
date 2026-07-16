/**
 * SMTP account resolution + From-header helpers (pure, dependency-free so it
 * can be unit-tested in isolation). Used by lib/email.ts.
 */

export interface MailAccount {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  passwords: string[];
  from: string;
  label: string;
}

/** Re-home a display name onto a "<email>" address ('Name' + '<a@b>' -> '"Name" <a@b>'). */
export function applyDisplayName(from: string, displayName?: string): string {
  const match = from.match(/<([^>]+)>/);
  const email = match ? match[1].trim() : from.trim();
  if (displayName) {
    const sanitized = displayName.replace(/["\\]/g, '');
    return `"${sanitized}" <${email}>`;
  }
  return from;
}

/** Extract the display-name portion of a From header ('"Name" <e>' -> 'Name'). */
export function extractDisplayName(from?: string): string | undefined {
  if (!from) return undefined;
  const m = from.match(/^\s*"?([^"<]*?)"?\s*</);
  const name = m ? m[1].trim() : '';
  return name || undefined;
}

/**
 * Ordered list of sending accounts for rotation.
 *
 *  • Account 1 = the primary SMTP_* env, with legacy SMTP_PASS_FALLBACK[_n]
 *    kept as extra KEYS for that same account.
 *  • Accounts 2..N = independent providers (e.g. separate Brevo accounts),
 *    each a full credential set:
 *        SMTP_<n>_USER / SMTP_<n>_PASS / SMTP_<n>_FROM
 *    host/port/secure inherit the primary unless SMTP_<n>_HOST/_PORT/_SECURE
 *    are set (Brevo uses the same host/port for every account).
 *
 * When an account errors OR hits its daily quota, the next is tried — so N
 * Brevo accounts give roughly N× the daily send capacity.
 */
export function getMailAccounts(env: NodeJS.ProcessEnv = process.env): MailAccount[] {
  const accounts: MailAccount[] = [];
  const baseHost = env.SMTP_HOST || '';
  const basePort = parseInt(env.SMTP_PORT || '587', 10);
  const baseSecure = env.SMTP_SECURE === 'true';

  // Account 1 — primary (backward compatible). Skip if explicitly disabled
  // (e.g. the account was suspended by the provider).
  if (env.SMTP_USER && (env.SMTP_PASS || env.SMTP_PASS_FALLBACK) && env.SMTP_DISABLED !== 'true') {
    const pw: string[] = [];
    if (env.SMTP_PASS) pw.push(env.SMTP_PASS);
    if (env.SMTP_PASS_FALLBACK) pw.push(env.SMTP_PASS_FALLBACK);
    for (let i = 1; i <= 10; i++) {
      const k = env[`SMTP_PASS_FALLBACK_${i}`];
      if (k) pw.push(k);
    }
    accounts.push({
      host: baseHost,
      port: basePort,
      secure: baseSecure,
      user: env.SMTP_USER,
      passwords: pw,
      from: env.SMTP_FROM || `"Inlet" <${env.SMTP_USER}>`,
      label: 'account-1',
    });
  }

  // Accounts 2..N — independent providers. SMTP_<n>_DISABLED=true cleanly
  // removes a suspended account without deleting its credentials.
  for (let n = 2; n <= 20; n++) {
    const u = env[`SMTP_${n}_USER`];
    const p = env[`SMTP_${n}_PASS`];
    if (!u || !p || env[`SMTP_${n}_DISABLED`] === 'true') continue;
    accounts.push({
      host: env[`SMTP_${n}_HOST`] || baseHost,
      port: parseInt(env[`SMTP_${n}_PORT`] || String(basePort), 10),
      secure: (env[`SMTP_${n}_SECURE`] ?? String(baseSecure)) === 'true',
      user: u,
      passwords: [p],
      // Inherit the shared free-user sender (SMTP_FROM) unless this account
      // overrides it — so adding an account only needs USER + PASS.
      from: env[`SMTP_${n}_FROM`] || env.SMTP_FROM || `"Inlet" <${u}>`,
      label: `account-${n}`,
    });
  }

  return accounts;
}

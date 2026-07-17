/**
 * Startup security-config validator (pure + dependency-free so it can be
 * unit-tested and run at boot via instrumentation.ts).
 *
 * Motivation (amaz_ blueprint — fail fast, never boot insecure): several
 * secrets in this codebase have *hardcoded fallbacks* so local builds work:
 *   • CLIENT_ENCRYPTION_KEY -> 'default_fallback_key_that_is_32_b'  (lib/crypto.ts)
 *   • SUPABASE_SERVICE_ROLE_KEY -> 'placeholder-service-key-for-build' (lib/supabase.ts)
 * If either is ever unset in production, the app would run with a *public*
 * key/credential and nobody would notice. This validator makes production
 * refuse to boot in that state, while staying quiet-but-informative in dev.
 */

export interface SecurityConfigReport {
  ok: boolean;
  fatal: string[];
  warnings: string[];
}

/** Values that must never reach production — the known insecure fallbacks/placeholders. */
const KNOWN_INSECURE = new Set<string>([
  'default_fallback_key_that_is_32_b',
  'placeholder-service-key-for-build',
  'changeme',
  'secret',
  'your-secret-here',
  'test',
]);

/** Rough entropy check: how many distinct characters the secret uses. */
function distinctChars(s: string): number {
  return new Set(s.split('')).size;
}

/**
 * Validate the security-critical environment. Returns a structured report;
 * the caller decides whether fatal issues crash the process (production) or
 * just warn (development).
 */
export function validateSecurityConfig(env: NodeJS.ProcessEnv = process.env): SecurityConfigReport {
  const fatal: string[] = [];
  const warnings: string[] = [];

  const jwt = env.JWT_SECRET;
  if (!jwt) {
    fatal.push('JWT_SECRET is not set — every admin & client session token would be unsignable/forgeable.');
  } else {
    if (KNOWN_INSECURE.has(jwt)) fatal.push('JWT_SECRET is a known placeholder value — set a unique random secret.');
    if (jwt.length < 32) fatal.push(`JWT_SECRET is too short (${jwt.length} chars) — use at least 32 (256-bit).`);
    else if (jwt.length < 48) warnings.push('JWT_SECRET is under 48 chars — 64+ recommended for long-lived deployments.');
    if (jwt.length >= 16 && distinctChars(jwt) < 10) warnings.push('JWT_SECRET has low character diversity — prefer a random secret (e.g. `openssl rand -base64 48`).');
  }

  const encKey = env.CLIENT_ENCRYPTION_KEY;
  if (!encKey) {
    fatal.push('CLIENT_ENCRYPTION_KEY is not set — stored client SMTP passwords would fall back to a PUBLIC hardcoded key.');
  } else {
    if (KNOWN_INSECURE.has(encKey)) fatal.push('CLIENT_ENCRYPTION_KEY is the public hardcoded fallback — stored SMTP credentials would be trivially decryptable.');
    // v2 encryption derives the key via SHA-256, so any length works — but a
    // short secret is still low-entropy input.
    if (encKey.length < 24 && !KNOWN_INSECURE.has(encKey)) warnings.push(`CLIENT_ENCRYPTION_KEY is only ${encKey.length} chars — use 32+ random characters for full key entropy.`);
  }

  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    fatal.push('SUPABASE_SERVICE_ROLE_KEY is not set — the server DB client would use a placeholder and every query would fail (or, worse, be misconfigured).');
  } else if (KNOWN_INSECURE.has(serviceKey)) {
    fatal.push('SUPABASE_SERVICE_ROLE_KEY is the build placeholder — set the real service-role key.');
  }

  const adminHash = env.ADMIN_PASSWORD_HASH;
  if (!adminHash) {
    fatal.push('ADMIN_PASSWORD_HASH is not set — the super-admin login cannot be secured.');
  } else if (adminHash.length < 32) {
    warnings.push('ADMIN_PASSWORD_HASH looks too short to be a real hash — verify it is the SHA-256 hex of your admin password.');
  }

  if (!env.NEXT_PUBLIC_SUPABASE_URL) {
    warnings.push('NEXT_PUBLIC_SUPABASE_URL is not set — Supabase client calls will fail.');
  }

  if (!env.ADMIN_2FA_EMAIL) {
    warnings.push('ADMIN_2FA_EMAIL is not set — admin login has no second factor. Set it to require an emailed code on every admin sign-in.');
  }

  return { ok: fatal.length === 0, fatal, warnings };
}

/**
 * Enforce the report against an environment. In production, any fatal issue
 * throws (the process must not serve traffic insecure). In development it logs
 * loudly but lets the dev keep working.
 */
export function enforceSecurityConfig(env: NodeJS.ProcessEnv = process.env): SecurityConfigReport {
  const report = validateSecurityConfig(env);
  const isProd = env.NODE_ENV === 'production';

  for (const w of report.warnings) console.warn(`[security-config] WARN  ${w}`);

  if (report.fatal.length > 0) {
    for (const f of report.fatal) console.error(`[security-config] FATAL ${f}`);
    if (isProd) {
      throw new Error(
        `Refusing to start: ${report.fatal.length} fatal security-config issue(s). ` +
        `Set the missing/placeholder secrets and redeploy.`
      );
    }
  } else {
    console.log('[security-config] OK — security-critical secrets validated.');
  }

  return report;
}

/**
 * Unit test for the startup security-config validator.
 * Run: node --experimental-strip-types scripts/test-security-config.ts
 */
import { validateSecurityConfig } from '../lib/securityConfig.ts';

let pass = 0, fail = 0;
const failures: string[] = [];
const ck = (n: string, c: boolean) => c ? (pass++, console.log('  PASS  ' + n)) : (fail++, failures.push(n), console.log('  FAIL  ' + n));

console.log('\n== Security config validation ==');

const GOOD = {
  JWT_SECRET: 'x9F2k7Qm4wZp1Rb8Tn6Vc3Ld0Ye5Hs2Ga7Ju9Ki4Mo6Np8Qr',   // 48 chars, diverse
  CLIENT_ENCRYPTION_KEY: 'aB3dE6gH9jK2mN5pQ8sT1vW4yZ7cF0hL',                  // exactly 32
  SUPABASE_SERVICE_ROLE_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.real.key',
  ADMIN_PASSWORD_HASH: 'a'.repeat(64),
  NEXT_PUBLIC_SUPABASE_URL: 'https://proj.supabase.co',
  NODE_ENV: 'production',
} as unknown as NodeJS.ProcessEnv;

// fully valid config
{
  const r = validateSecurityConfig(GOOD);
  ck('valid config -> ok, no fatal', r.ok === true && r.fatal.length === 0);
}

// the hardcoded crypto fallback is caught
{
  const r = validateSecurityConfig({ ...GOOD, CLIENT_ENCRYPTION_KEY: 'default_fallback_key_that_is_32_b' });
  ck('public hardcoded encryption key -> fatal', r.ok === false && r.fatal.some((f) => f.includes('CLIENT_ENCRYPTION_KEY')));
}

// the supabase build placeholder is caught
{
  const r = validateSecurityConfig({ ...GOOD, SUPABASE_SERVICE_ROLE_KEY: 'placeholder-service-key-for-build' });
  ck('service-key placeholder -> fatal', r.ok === false && r.fatal.some((f) => f.includes('SUPABASE_SERVICE_ROLE_KEY')));
}

// missing JWT secret
{
  const r = validateSecurityConfig({ ...GOOD, JWT_SECRET: undefined });
  ck('missing JWT_SECRET -> fatal', r.ok === false && r.fatal.some((f) => f.includes('JWT_SECRET')));
}

// short JWT secret
{
  const r = validateSecurityConfig({ ...GOOD, JWT_SECRET: 'tooshort' });
  ck('short JWT_SECRET -> fatal', r.ok === false && r.fatal.some((f) => f.includes('too short')));
}

// missing admin hash
{
  const r = validateSecurityConfig({ ...GOOD, ADMIN_PASSWORD_HASH: undefined });
  ck('missing ADMIN_PASSWORD_HASH -> fatal', r.ok === false && r.fatal.some((f) => f.includes('ADMIN_PASSWORD_HASH')));
}

// non-32 encryption key -> warning, not fatal
{
  const r = validateSecurityConfig({ ...GOOD, CLIENT_ENCRYPTION_KEY: 'short-but-real-key' });
  ck('non-32 encryption key -> warning (not fatal)', r.ok === true && r.warnings.some((w) => w.includes('CLIENT_ENCRYPTION_KEY')));
}

// missing supabase URL -> warning
{
  const r = validateSecurityConfig({ ...GOOD, NEXT_PUBLIC_SUPABASE_URL: undefined });
  ck('missing supabase URL -> warning', r.warnings.some((w) => w.includes('NEXT_PUBLIC_SUPABASE_URL')));
}

console.log(`\n== RESULT: ${pass} passed, ${fail} failed ==`);
if (failures.length) { console.log('Failures:', failures.join(' | ')); process.exit(1); }

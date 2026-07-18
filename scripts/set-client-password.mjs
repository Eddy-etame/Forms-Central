// Check, create, or reset a CLIENT (subscriber) account — the /client/login
// side (email + password), NOT the admin login.
//
//   Diagnose only:   node scripts/set-client-password.mjs you@email.com
//   Set / reset pw:  node scripts/set-client-password.mjs you@email.com "newpass" [Name]
//
// Reads Supabase creds from .env.local, matches the login's email handling
// (lowercased), and hashes with scrypt exactly like lib/passwords.ts.

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';

// --- load .env.local (scripts don't get it automatically) ---
const envPath = path.join(process.cwd(), '.env.local');
const env = {};
for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, '');
}

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}
const supabase = createClient(url, key, { auth: { persistSession: false } });

// --- scrypt hash identical to lib/passwords.ts ---
function hashPassword(plain) {
  const salt = crypto.randomBytes(16);
  const hash = crypto.scryptSync(plain, salt, 64, { N: 16384 });
  return `scrypt:16384:${salt.toString('hex')}:${hash.toString('hex')}`;
}

const email = (process.argv[2] || '').trim().toLowerCase();
const password = process.argv[3];
const name = process.argv[4];
if (!email) {
  console.error('Usage: node scripts/set-client-password.mjs <email> [password] [name]');
  process.exit(1);
}

const { data: existing, error } = await supabase
  .from('clients')
  .select('id, name, email, plan, created_at')
  .eq('email', email)
  .maybeSingle();

if (error) {
  console.error('Supabase error:', error.message);
  process.exit(1);
}

// Diagnose only
if (!password) {
  if (existing) {
    console.log('✓ A client account EXISTS for', email);
    console.log('  name:', existing.name, '| plan:', existing.plan, '| created:', existing.created_at);
    console.log('  → password unknown? re-run with a password to reset it:');
    console.log(`     node scripts/set-client-password.mjs ${email} "yourNewPassword"`);
  } else {
    console.log('✗ NO client account exists for', email);
    console.log('  That is why /client/login says "Identifiants incorrects."');
    console.log('  → create one now:');
    console.log(`     node scripts/set-client-password.mjs ${email} "yourNewPassword" "Your Name"`);
  }
  process.exit(0);
}

if (password.length < 8) {
  console.error('Refusing: password must be at least 8 characters.');
  process.exit(1);
}

if (existing) {
  const { error: upErr } = await supabase
    .from('clients')
    .update({ encrypted_password: hashPassword(password) })
    .eq('id', existing.id);
  if (upErr) { console.error('Update failed:', upErr.message); process.exit(1); }
  console.log('✓ Password RESET for existing account', email);
} else {
  const { error: insErr } = await supabase
    .from('clients')
    .insert({ name: name || email.split('@')[0], email, encrypted_password: hashPassword(password), plan: 'free' });
  if (insErr) { console.error('Create failed:', insErr.message); process.exit(1); }
  console.log('✓ Account CREATED for', email, '(plan: free)');
}
console.log('  Now sign in at /client/login with this email + the password you set.');

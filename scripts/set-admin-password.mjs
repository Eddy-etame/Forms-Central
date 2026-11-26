// Set (or reset) the operator password.
//
//   node scripts/set-admin-password.mjs "your new password"
//
// Writes a salted scrypt hash ("scrypt:N:salt:hash", the same format as every
// other password in the product, lib/passwords.ts) into ADMIN_PASSWORD_HASH in
// .env.local when that file exists, and prints the hash so it can be set as
// ADMIN_PASSWORD_HASH on the host. The password itself is never written or
// printed anywhere.
//
// Until 2026-11-26 this stored a bare SHA-256 of the password. That form still
// signs you in, but anyone who obtained the variable could guess the password
// offline at billions of tries a second; scrypt makes each guess cost real
// time and memory.
//
// After running: restart `npm run dev` (the environment is read at start),
// then set the SAME value on the host and redeploy.

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const password = process.argv[2];
if (!password) {
  console.error('Usage: node scripts/set-admin-password.mjs "your new password"');
  process.exit(1);
}
if (password.length < 12) {
  console.error('Refusing: choose at least 12 characters (a few random words work well).');
  process.exit(1);
}
if (password.length > 128) {
  console.error('Refusing: 128 characters at most.');
  process.exit(1);
}

const N = 16384;
const salt = crypto.randomBytes(16);
const hash = `scrypt:${N}:${salt.toString('hex')}:${crypto.scryptSync(password, salt, 64, { N }).toString('hex')}`;

const envPath = path.join(process.cwd(), '.env.local');
let wrote = false;
try {
  let contents = fs.readFileSync(envPath, 'utf8');
  const line = `ADMIN_PASSWORD_HASH=${hash}`;
  contents = /^ADMIN_PASSWORD_HASH=.*$/m.test(contents)
    ? contents.replace(/^ADMIN_PASSWORD_HASH=.*$/m, line)
    : contents.replace(/\n?$/, `\n${line}\n`);
  fs.writeFileSync(envPath, contents, 'utf8');
  wrote = true;
} catch {
  /* no .env.local here: the value is printed below */
}

console.log(wrote ? 'Operator password updated in .env.local.' : 'No .env.local found: nothing was written to disk.');
console.log('');
console.log('ADMIN_PASSWORD_HASH=' + hash);
console.log('');
console.log('Set that value as ADMIN_PASSWORD_HASH on the host (production) and redeploy.');
console.log('Sign in with the password you just chose.');

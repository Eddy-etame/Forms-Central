// Set (or reset) the admin password.
//
//   node scripts/set-admin-password.mjs "your new password"
//
// It SHA-256-hashes the plaintext exactly the way the login route does
// (crypto.createHash('sha256').update(password).digest('hex')) and writes the
// result into ADMIN_PASSWORD_HASH in .env.local — so the plaintext you pass
// here is the password you'll type on the /login screen. Nothing is logged
// except the hash it stored.
//
// After running: restart `npm run dev` (env is read at boot), then on Vercel
// paste the SAME new hash into the ADMIN_PASSWORD_HASH env var and redeploy.

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const password = process.argv[2];
if (!password) {
  console.error('Usage: node scripts/set-admin-password.mjs "your new password"');
  process.exit(1);
}
if (password.length < 8) {
  console.error('Refusing: choose a password of at least 8 characters.');
  process.exit(1);
}

const hash = crypto.createHash('sha256').update(password).digest('hex');
const envPath = path.join(process.cwd(), '.env.local');

let contents = '';
try {
  contents = fs.readFileSync(envPath, 'utf8');
} catch {
  console.error(`Could not read ${envPath} — run this from the project root.`);
  process.exit(1);
}

const line = `ADMIN_PASSWORD_HASH=${hash}`;
if (/^ADMIN_PASSWORD_HASH=.*$/m.test(contents)) {
  contents = contents.replace(/^ADMIN_PASSWORD_HASH=.*$/m, line);
} else {
  contents = contents.replace(/\n?$/, `\n${line}\n`);
}
fs.writeFileSync(envPath, contents, 'utf8');

console.log('✓ Admin password updated in .env.local');
console.log('  New ADMIN_PASSWORD_HASH =', hash);
console.log('  Log in with the plaintext you just passed (NOT your email).');
console.log('  → Restart `npm run dev`, then update the same hash on Vercel + redeploy.');

/**
 * Unit test for lib/crypto (AES-256-GCM v2 + legacy CTR compatibility).
 * Run: node --experimental-strip-types scripts/test-crypto.ts
 */
import crypto from 'crypto';
import { encryptPassword, decryptPassword } from '../lib/crypto.ts';

process.env.CLIENT_ENCRYPTION_KEY = 'test-secret-key-for-crypto-suite-42';

let pass = 0, fail = 0;
const failures: string[] = [];
const ck = (n: string, c: boolean) => c ? (pass++, console.log('  PASS  ' + n)) : (fail++, failures.push(n), console.log('  FAIL  ' + n));

console.log('\n== crypto v2 (AES-256-GCM) ==');

// round trip
{
  const enc = encryptPassword('hunter2-secret');
  ck('v2 format prefix', enc.startsWith('v2:'));
  ck('round-trip decrypts', decryptPassword(enc) === 'hunter2-secret');
}

// unicode round trip
{
  const enc = encryptPassword('pässwörd-éü-🔥');
  ck('unicode round-trip', decryptPassword(enc) === 'pässwörd-éü-🔥');
}

// unique IVs — same plaintext, different ciphertexts
{
  ck('unique IV per encryption', encryptPassword('same') !== encryptPassword('same'));
}

// TAMPER DETECTION — the whole point of GCM
{
  const enc = encryptPassword('do-not-touch');
  const [v, iv, tag, data] = enc.split(':');
  // flip the last hex char of the ciphertext
  const flipped = data.slice(0, -1) + (data.slice(-1) === '0' ? '1' : '0');
  ck('tampered ciphertext -> "" (rejected)', decryptPassword(`${v}:${iv}:${tag}:${flipped}`) === '');
  // flip the auth tag
  const badTag = tag.slice(0, -1) + (tag.slice(-1) === '0' ? '1' : '0');
  ck('tampered auth tag -> "" (rejected)', decryptPassword(`${v}:${iv}:${badTag}:${data}`) === '');
}

// legacy CTR rows still decrypt (backward compatibility)
{
  let key = process.env.CLIENT_ENCRYPTION_KEY as string;
  if (key.length > 32) key = key.substring(0, 32);
  else if (key.length < 32) key = key.padEnd(32, '0');
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-ctr', Buffer.from(key), iv);
  const legacyRow = iv.toString('hex') + ':' + Buffer.concat([cipher.update('old-row-password'), cipher.final()]).toString('hex');
  ck('legacy CTR row still decrypts', decryptPassword(legacyRow) === 'old-row-password');
}

// garbage handling
{
  ck('empty input -> ""', decryptPassword('') === '');
  ck('no-colon garbage -> ""', decryptPassword('zzzzzz') === '');
  ck('malformed v2 -> ""', decryptPassword('v2:abc') === '');
  ck('non-hex legacy -> ""', decryptPassword('nothex:alsonothex') === '');
}

console.log(`\n== RESULT: ${pass} passed, ${fail} failed ==`);
if (failures.length) { console.log('Failures:', failures.join(' | ')); process.exit(1); }

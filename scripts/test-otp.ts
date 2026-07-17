/**
 * Unit test for the OTP pure helpers (generate / hash / compare).
 * Run: node --experimental-strip-types scripts/test-otp.ts
 */
import { generateOtpCode, hashOtp, safeEqualHex } from '../lib/otpCore.ts';

let pass = 0, fail = 0;
const failures: string[] = [];
const ck = (n: string, c: boolean) => c ? (pass++, console.log('  PASS  ' + n)) : (fail++, failures.push(n), console.log('  FAIL  ' + n));

console.log('\n== OTP core ==');

// code shape
{
  let allSixDigit = true, allNumeric = true;
  for (let i = 0; i < 500; i++) {
    const c = generateOtpCode();
    if (c.length !== 6) allSixDigit = false;
    if (!/^[0-9]{6}$/.test(c)) allNumeric = false;
  }
  ck('generateOtpCode -> always 6 chars', allSixDigit);
  ck('generateOtpCode -> always numeric (zero-padded)', allNumeric);
}

// hashing determinism + sensitivity
{
  const h1 = hashOtp('123456', 'client-1', 'pep');
  const h2 = hashOtp('123456', 'client-1', 'pep');
  const h3 = hashOtp('123456', 'client-2', 'pep');   // different salt
  const h4 = hashOtp('654321', 'client-1', 'pep');   // different code
  const h5 = hashOtp('123456', 'client-1', 'other');  // different pepper
  ck('hashOtp deterministic', h1 === h2);
  ck('hashOtp is 64-hex (sha256)', /^[0-9a-f]{64}$/.test(h1));
  ck('hashOtp salt-sensitive', h1 !== h3);
  ck('hashOtp code-sensitive', h1 !== h4);
  ck('hashOtp pepper-sensitive', h1 !== h5);
}

// constant-time compare
{
  const a = hashOtp('111111', 's', 'p');
  ck('safeEqualHex equal', safeEqualHex(a, a) === true);
  ck('safeEqualHex different', safeEqualHex(a, hashOtp('222222', 's', 'p')) === false);
  ck('safeEqualHex length-mismatch -> false (no throw)', safeEqualHex(a, 'abc') === false);
}

console.log(`\n== RESULT: ${pass} passed, ${fail} failed ==`);
if (failures.length) { console.log('Failures:', failures.join(' | ')); process.exit(1); }

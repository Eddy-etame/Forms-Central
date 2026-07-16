/**
 * Unit test for SMTP account rotation parsing.
 * Run: node --experimental-strip-types scripts/test-mail-accounts.ts
 */
import { getMailAccounts, applyDisplayName, extractDisplayName } from '../lib/mailAccounts.ts';

let pass = 0, fail = 0;
const failures: string[] = [];
const ck = (n: string, c: boolean) => c ? (pass++, console.log('  PASS  ' + n)) : (fail++, failures.push(n), console.log('  FAIL  ' + n));

console.log('\n== SMTP account rotation ==');

// primary only
{
  const a = getMailAccounts({ SMTP_HOST: 'smtp-relay.brevo.com', SMTP_PORT: '587', SMTP_USER: 'u1@smtp-brevo.com', SMTP_PASS: 'key1', SMTP_FROM: '"Inlet" <hello@one.com>' });
  ck('primary -> 1 account', a.length === 1);
  ck('primary host/port parsed', a[0].host === 'smtp-relay.brevo.com' && a[0].port === 587);
  ck('primary from', a[0].from === '"Inlet" <hello@one.com>');
}

// legacy fallback keys stay on ONE account
{
  const a = getMailAccounts({ SMTP_HOST: 'h', SMTP_USER: 'u1', SMTP_PASS: 'k1', SMTP_PASS_FALLBACK: 'k2', SMTP_PASS_FALLBACK_1: 'k3' });
  ck('legacy fallbacks -> 1 account with 3 keys', a.length === 1 && a[0].passwords.length === 3);
}

// primary + two independent accounts
{
  const a = getMailAccounts({
    SMTP_HOST: 'smtp-relay.brevo.com', SMTP_PORT: '587', SMTP_USER: 'u1', SMTP_PASS: 'k1', SMTP_FROM: '"A" <a@one.com>',
    SMTP_2_USER: 'u2', SMTP_2_PASS: 'k2', SMTP_2_FROM: '"B" <b@two.com>',
    SMTP_3_USER: 'u3', SMTP_3_PASS: 'k3', SMTP_3_FROM: '"C" <c@three.com>',
  });
  ck('3 accounts total', a.length === 3);
  ck('account-2 inherits host/port from primary', a[1].host === 'smtp-relay.brevo.com' && a[1].port === 587);
  ck('account-2 own user/pass/from', a[1].user === 'u2' && a[1].passwords[0] === 'k2' && a[1].from === '"B" <b@two.com>');
  ck('account-3 label', a[2].label === 'account-3');
}

// missing middle account is skipped
{
  const a = getMailAccounts({ SMTP_HOST: 'h', SMTP_USER: 'u1', SMTP_PASS: 'k1', SMTP_2_USER: 'u2', SMTP_2_PASS: 'k2' });
  ck('no SMTP_3 -> only 2 accounts', a.length === 2 && a[1].label === 'account-2');
}

// SMTP_n_FROM omitted -> defaults to that account's user
{
  const a = getMailAccounts({ SMTP_HOST: 'h', SMTP_USER: 'u1', SMTP_PASS: 'k1', SMTP_2_USER: 'u2@x.com', SMTP_2_PASS: 'k2' });
  ck('account-2 from defaults to its user', a[1].from === '"Inlet" <u2@x.com>');
}

// display-name re-homing (so a client's name authenticates on any account's sender)
ck('extractDisplayName', extractDisplayName('"Acme Corp" <x@y.com>') === 'Acme Corp');
ck('applyDisplayName re-homes onto account sender', applyDisplayName('"Inlet" <b@two.com>', 'Acme Corp') === '"Acme Corp" <b@two.com>');

console.log(`\n== RESULT: ${pass} passed, ${fail} failed ==`);
if (failures.length) { console.log('Failures:', failures.join(' | ')); process.exit(1); }

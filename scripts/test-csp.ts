/**
 * Unit test for the content security policy builder (lib/csp.ts).
 * Run: node --experimental-strip-types scripts/test-csp.ts
 */
import { newNonce, cleanNonce, pageCsp, staticCsp, NONCE_HEADER } from '../lib/csp.ts';

let pass = 0, fail = 0;
const failures: string[] = [];
const ok = (name: string, cond: boolean, detail = '') =>
  cond ? (pass++, console.log('  PASS  ' + name)) : (fail++, failures.push(name), console.log(`  FAIL  ${name}${detail ? '\n        ' + detail : ''}`));
const directive = (csp: string, name: string) => csp.split('; ').find((d) => d === name || d.startsWith(name + ' ')) ?? '';

console.log('\n== The nonce ==');
const many = Array.from({ length: 2000 }, () => newNonce());
ok('2,000 nonces, 2,000 different values', new Set(many).size === many.length);
ok('16 random bytes, base64: 24 characters', many.every((n) => /^[A-Za-z0-9+/]{22}==$/.test(n)));
ok('a nonce this module minted is accepted back', many.every((n) => cleanNonce(n) === n));
for (const bad of [null, undefined, '', 'abc', "x' 'unsafe-inline", 'A'.repeat(24), 'AAAAAAAAAAAAAAAAAAAAAA==\n', '"><script>', 'AAAAAAAAAAAAAAAAAAAAAA= ']) {
  ok(`anything else is dropped: ${JSON.stringify(bad)}`, cleanNonce(bad as string) === undefined);
}
ok('the header the layouts read', NONCE_HEADER === 'x-nonce');

console.log('\n== The policy of a page ==');
const nonce = newNonce();
const page = pageCsp(nonce);
const script = directive(page, 'script-src');
ok('scripts need this request\'s nonce', script.includes(`'nonce-${nonce}'`));
ok('a script loaded by a trusted one is trusted', script.includes("'strict-dynamic'"));
ok('no inline script, no eval', !script.includes('unsafe-inline') && !script.includes('unsafe-eval'));
ok('another nonce gives another policy', pageCsp(newNonce()) !== page);
ok('development adds eval, and only development', directive(pageCsp(nonce, true), 'script-src').includes("'unsafe-eval'"));

console.log('\n== What both policies share ==');
for (const [label, csp] of [['page', page], ['fixed', staticCsp()]] as const) {
  ok(`${label}: everything defaults to this site`, directive(csp, 'default-src') === "default-src 'self'");
  ok(`${label}: no plugin content`, directive(csp, 'object-src') === "object-src 'none'");
  ok(`${label}: no other site may frame a page`, directive(csp, 'frame-ancestors') === "frame-ancestors 'self'");
  ok(`${label}: a <base> tag cannot re-point relative links`, directive(csp, 'base-uri') === "base-uri 'self'");
  ok(`${label}: forms post to this site only`, directive(csp, 'form-action') === "form-action 'self'");
  ok(`${label}: the browser talks to this site only`, directive(csp, 'connect-src') === "connect-src 'self'");
  ok(`${label}: http is upgraded`, csp.split('; ').includes('upgrade-insecure-requests'));
  ok(`${label}: one line, no stray separator`, !/[\r\n,]/.test(csp));
}

console.log('\n== The fixed policy ==');
const fixed = directive(staticCsp(), 'script-src');
ok('carries no nonce (nothing renders one there)', !fixed.includes('nonce-'));
ok('no eval in production', !fixed.includes('unsafe-eval'));
ok('eval only in development', directive(staticCsp(true), 'script-src').includes("'unsafe-eval'"));

console.log(`\n${pass} passed, ${fail} failed`);
if (fail) { console.log('Failed:\n  ' + failures.join('\n  ')); process.exit(1); }

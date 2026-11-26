/**
 * Unit test for the content security policy builder (lib/csp.ts).
 * Run: node --experimental-strip-types scripts/test-csp.ts
 */
import { newNonce, cleanNonce, pageCsp, staticCsp, API_CSP, FILE_CSP, FORM_ANSWER_CSP, NONCE_HEADER } from '../lib/csp.ts';

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

console.log('\n== Styles on a page ==');
ok('a <style> element needs the nonce, like a script', directive(page, 'style-src-elem') === `style-src-elem 'self' 'nonce-${nonce}'`);
ok('style attributes stay allowed (React writes them)', directive(page, 'style-src-attr') === "style-src-attr 'unsafe-inline'");
ok('browsers without the split fall back to the old line', directive(page, 'style-src') === "style-src 'self' 'unsafe-inline'");
ok('development lets its own tooling inject styles', directive(pageCsp(nonce, true), 'style-src-elem') === "style-src-elem 'self' 'unsafe-inline'");

console.log('\n== What is not a page ==');
for (const [label, csp] of [['an API answer', API_CSP], ['a downloaded file', FILE_CSP], ['a plain form answer', FORM_ANSWER_CSP]] as const) {
  ok(`${label}: nothing loads by default`, directive(csp, 'default-src') === "default-src 'none'");
  ok(`${label}: cannot be framed, re-based or made to post`, csp.includes("frame-ancestors 'none'") && csp.includes("base-uri 'none'") && csp.includes("form-action 'none'"));
  ok(`${label}: no inline script, no eval, no nonce`, !/script-src[^;]*(unsafe-inline|unsafe-eval|nonce-)/.test(csp));
  ok(`${label}: one line, no stray separator`, !/[\r\n,]/.test(csp));
}
ok('an API answer allows no script and no style at all', !API_CSP.includes('script-src') && !API_CSP.includes('style-src'));
ok('a downloaded file is sandboxed', FILE_CSP.split('; ').includes('sandbox'));
ok('a plain form answer may load one kind of script: a file of this site', directive(FORM_ANSWER_CSP, 'script-src') === "script-src 'self'");
ok('…and style itself inline, nothing else', directive(FORM_ANSWER_CSP, 'style-src') === "style-src 'unsafe-inline'" && !FORM_ANSWER_CSP.includes('img-src') && !FORM_ANSWER_CSP.includes('connect-src'));

console.log('\n== The fixed policy ==');
const fixed = directive(staticCsp(), 'script-src');
ok('carries no nonce (nothing renders one there)', !fixed.includes('nonce-'));
ok('no eval in production', !fixed.includes('unsafe-eval'));
ok('eval only in development', directive(staticCsp(true), 'script-src').includes("'unsafe-eval'"));

console.log(`\n${pass} passed, ${fail} failed`);
if (fail) { console.log('Failed:\n  ' + failures.join('\n  ')); process.exit(1); }

/**
 * Unit test for the auto-reply subject a visitor receives.
 * Run: node --experimental-strip-types scripts/test-autoreply.ts
 */
import { localizeAutoReplySubject, AUTO_REPLY_SUBJECTS, safePersonName, answersJson } from '../lib/domain.ts';

let pass = 0, fail = 0;
const failures: string[] = [];
const eq = (n: string, got: string, want: string) =>
  got === want ? (pass++, console.log('  PASS  ' + n)) : (fail++, failures.push(n), console.log(`  FAIL  ${n}\n        got  "${got}"\n        want "${want}"`));

console.log('\n== Auto-reply subject, by visitor language ==');

// nothing stored → the friendly default, never the internal form name
eq('empty → fr default', localizeAutoReplySubject('', 'fr'), AUTO_REPLY_SUBJECTS.fr);
eq('null → en default', localizeAutoReplySubject(null, 'en'), AUTO_REPLY_SUBJECTS.en);
eq('whitespace → fr default', localizeAutoReplySubject('   ', 'fr'), AUTO_REPLY_SUBJECTS.fr);

// same language as stored → untouched (no change for sites that were already consistent)
eq('fr service default stays for fr', localizeAutoReplySubject('Nous avons bien reçu votre message', 'fr'), 'Nous avons bien reçu votre message');
eq('en service default stays for en', localizeAutoReplySubject('Thanks — we received your message', 'en'), 'Thanks — we received your message');
eq('en operator default stays for en', localizeAutoReplySubject('We received your message', 'en'), 'We received your message');
eq('fr operator default stays for fr', localizeAutoReplySubject('Confirmation de réception', 'fr'), 'Confirmation de réception');

// the bug: a stored default in the other language
eq('en operator default → fr visitor', localizeAutoReplySubject('We received your message', 'fr'), 'Nous avons bien reçu votre message');
eq('en service default → fr visitor', localizeAutoReplySubject('Thanks — we received your message', 'fr'), 'Nous avons bien reçu votre message');
eq('fr service default → en visitor', localizeAutoReplySubject('Nous avons bien reçu votre message', 'en'), 'Thanks — we received your message');
eq('fr operator default → en visitor', localizeAutoReplySubject('Confirmation de réception', 'en'), 'Confirmation of receipt');
eq('case and padding tolerated', localizeAutoReplySubject('  we RECEIVED your message ', 'fr'), 'Nous avons bien reçu votre message');

// a subject somebody wrote is never touched, whatever the language
for (const custom of ['Ta séance offerte au Club Atlas est réservée 🥊', 'Merci pour votre message!', 'La Boutique Atlas : votre message est bien arrivé', 'Nous avons reçu votre message', 'We got it, {{name}}']) {
  eq(`custom kept (fr): ${custom.slice(0, 28)}`, localizeAutoReplySubject(custom, 'fr'), custom);
  eq(`custom kept (en): ${custom.slice(0, 28)}`, localizeAutoReplySubject(custom, 'en'), custom);
}

console.log('\n== The visitor name that goes into an auto-reply ==');
const nm = (n: string, got: string | undefined, want: string | undefined) => eq(n, String(got), String(want));
nm('an ordinary name is kept', safePersonName('Zoé Dupont'), 'Zoé Dupont');
nm('hyphens and apostrophes are kept', safePersonName("Jean-Loïc O'Brien"), "Jean-Loïc O'Brien");
nm('a link is removed', safePersonName('Jean — sign in at https://evil.example/login'), 'Jean — sign in at');
nm('a bare domain is removed', safePersonName('Jean visit evil-bank.com/now today'), 'Jean visit today');
nm('www links are removed', safePersonName('Marie www.evil.example'), 'Marie');
nm('markup is removed', safePersonName('<b>Paul</b> <a href=x>click</a>'), 'b Paul b a href=x click a');
nm('line breaks become spaces (one line only)', safePersonName('Paul\r\nBcc: victim'), 'Paul Bcc victim');
nm('an e-mail address cannot ride in the name', safePersonName('Paul admin@bank.com'), 'Paul');
nm('sixty characters at most', safePersonName('A'.repeat(200)), 'A'.repeat(60));
nm('nothing left means no name', safePersonName('https://evil.example'), undefined);
nm('not a string means no name', safePersonName(42 as unknown as string), undefined);
nm('empty means no name', safePersonName('   '), undefined);

console.log('\n== JSON for a script, a destination for a browser ==');
{
  const FORM = 'application/x-www-form-urlencoded';
  const NAV = 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8';
  const is = (label: string, got: boolean, want: boolean) => nm(label, String(got), String(want));
  // the case that was broken: every browser puts an Origin header on a POST
  is('a plain HTML form posted by a browser is a navigation', answersJson({ contentType: FORM, origin: 'https://acme.com', secFetchMode: 'navigate', accept: NAV }), false);
  is('…with a file field too (multipart)', answersJson({ contentType: 'multipart/form-data; boundary=x', origin: 'https://acme.com', secFetchMode: 'navigate', accept: NAV }), false);
  is('…from a browser that sends no fetch metadata yet (it still asks for a page)', answersJson({ contentType: FORM, origin: 'https://acme.com', secFetchMode: null, accept: NAV }), false);
  is('…from a page whose origin the browser withholds ("null")', answersJson({ contentType: FORM, origin: 'null', secFetchMode: 'navigate', accept: NAV }), false);
  // scripts
  is('fetch() with a JSON body', answersJson({ contentType: 'application/json', origin: 'https://acme.com', secFetchMode: 'cors', accept: '*/*' }), true);
  is('fetch() with a form-encoded body', answersJson({ contentType: FORM, origin: 'https://acme.com', secFetchMode: 'cors', accept: '*/*' }), true);
  is('fetch() from a browser without fetch metadata', answersJson({ contentType: FORM, origin: 'https://acme.com', secFetchMode: null, accept: '*/*' }), true);
  is('a JSON body is a script even when everything else looks like a page', answersJson({ contentType: 'application/json; charset=utf-8', origin: 'https://acme.com', secFetchMode: 'navigate', accept: NAV }), true);
  is('a server relay posting JSON, no Origin', answersJson({ contentType: 'application/json', origin: null, secFetchMode: null, accept: null }), true);
  // tools and servers without an Origin keep the redirect they always got
  is('curl with form fields', answersJson({ contentType: FORM, origin: null, secFetchMode: null, accept: '*/*' }), false);
  is('a server-side fetch with form fields (it announces "cors" but has no Origin)', answersJson({ contentType: FORM, origin: null, secFetchMode: 'cors', accept: '*/*' }), false);
  is('nothing known at all', answersJson({}), false);
}

console.log(`\n== RESULT: ${pass} passed, ${fail} failed ==`);
if (fail) { console.log('Failures:', failures); process.exit(1); }

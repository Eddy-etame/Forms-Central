/**
 * Unit test for the auto-reply subject a visitor receives.
 * Run: node --experimental-strip-types scripts/test-autoreply.ts
 */
import { localizeAutoReplySubject, AUTO_REPLY_SUBJECTS } from '../lib/domain.ts';

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
for (const custom of ['Ta séance offerte au Boxing Center Portet est réservée 🥊', 'Merci pour votre message!', 'Boutique de Boxe : votre message est bien arrivé', 'Nous avons reçu votre message', 'We got it, {{name}}']) {
  eq(`custom kept (fr): ${custom.slice(0, 28)}`, localizeAutoReplySubject(custom, 'fr'), custom);
  eq(`custom kept (en): ${custom.slice(0, 28)}`, localizeAutoReplySubject(custom, 'en'), custom);
}

console.log(`\n== RESULT: ${pass} passed, ${fail} failed ==`);
if (fail) { console.log('Failures:', failures); process.exit(1); }

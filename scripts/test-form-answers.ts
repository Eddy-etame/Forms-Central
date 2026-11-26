/**
 * Unit test for the two plain pages a visitor sees after posting a form
 * without JavaScript (lib/formAnswerPages.ts).
 * Run: node --experimental-strip-types scripts/test-form-answers.ts
 */
import { answerLang, successPageHtml, errorPageHtml, escapeHtml } from '../lib/formAnswerPages.ts';

let pass = 0, fail = 0;
const failures: string[] = [];
const ok = (name: string, cond: boolean, detail = '') =>
  cond ? (pass++, console.log('  PASS  ' + name)) : (fail++, failures.push(name), console.log(`  FAIL  ${name}${detail ? '\n        ' + detail : ''}`));

console.log('\n== Whose language ==');
ok('a browser that asks for English first gets English', answerLang('en-US,en;q=0.9,fr;q=0.8') === 'en' && answerLang('en') === 'en' && answerLang(' EN-gb') === 'en');
ok('a browser that asks for French first gets French', answerLang('fr-FR,fr;q=0.9,en;q=0.8') === 'fr');
ok('anything else, or nothing, gets French (the product\'s default)', answerLang('de-DE,de;q=0.9') === 'fr' && answerLang('') === 'fr' && answerLang(null) === 'fr' && answerLang(undefined) === 'fr');
ok('"english" hidden further down the list does not decide', answerLang('es-ES,es;q=0.9,en;q=0.5') === 'fr');

console.log('\n== A message that was sent ==');
for (const lang of ['fr', 'en'] as const) {
  const html = successPageHtml(lang);
  ok(`${lang}: says so in one language only`, lang === 'fr' ? html.includes('Message envoyé') && !html.includes('Message sent') : html.includes('Message sent') && !html.includes('Message envoyé'));
  ok(`${lang}: the page declares its language`, html.includes(`<html lang="${lang}">`));
  ok(`${lang}: does not promise what it cannot know (that somebody was notified)`, !/notifi/i.test(html));
}

console.log('\n== A message that was not ==');
const fr = errorPageHtml('fr', { code: 'FORM_NOT_FOUND', message: "The form id 'x' does not exist.", remedy: 'Copy the form id again.' });
const en = errorPageHtml('en', { code: 'FORM_NOT_FOUND', message: "The form id 'x' does not exist.", remedy: 'Copy the form id again.' });
ok('the visitor is told first, in plain words', fr.indexOf('Votre message n’a pas pu être envoyé') > 0 && fr.indexOf('Votre message n’a pas pu être envoyé') < fr.indexOf('FORM_NOT_FOUND') && en.indexOf('Your message could not be sent') < en.indexOf('FORM_NOT_FOUND'));
ok('…and what to do: go back and try again', fr.includes('Revenez au formulaire') && en.includes('Go back to the form'));
ok('the code a developer needs is still on the page, apart', fr.includes('Pour le développeur de ce site') && en.includes('For the developer of this site') && fr.includes('<span class="code">FORM_NOT_FOUND</span>'));
ok('with its remedy', en.includes('What to do:') && en.includes('Copy the form id again.') && fr.includes('À faire :'));
ok('no remedy, no remedy line', !errorPageHtml('en', { code: 'X', message: 'm', remedy: null }).includes('What to do:'));
ok('a refusal the visitor can act on is explained to them', errorPageHtml('en', { code: 'RATE_LIMIT_EXCEEDED', message: 'm' }).includes('Wait a minute') && errorPageHtml('fr', { code: 'SENDER_BLACKLISTED', message: 'm' }).includes('24 heures') && errorPageHtml('fr', { code: 'PAYLOAD_TOO_LARGE', message: 'm' }).includes('trop volumineux'));
ok('a refusal only the developer can fix gets the general words', errorPageHtml('en', { code: 'CORS_NOT_ALLOWED', message: 'm' }).includes('try again in a moment'));

console.log('\n== What a page can carry ==');
const hostile = errorPageHtml('en', {
  code: '<img src=x onerror=alert(1)>',
  message: `Origin '"><script>alert(1)</script>' is not authorized`,
  remedy: `add "</div><script src=//evil></script>" to its allowed sites`,
});
ok('markup in the message, the remedy or the code is shown as text', !hostile.includes('<script>alert') && !hostile.includes('<img src=x') && !hostile.includes('<script src=//evil') && hostile.includes('&lt;script&gt;alert(1)&lt;/script&gt;'));
ok('quotes cannot close an attribute', escapeHtml(`"'`) === '&quot;&#039;');
for (const [label, html] of [['sent', successPageHtml('en')], ['not sent', en], ['hostile', hostile]] as const) {
  const scripts = html.match(/<script\b[^>]*>/g) || [];
  ok(`${label}: one script, and it is a file of this site`, scripts.length === 1 && scripts[0] === '<script src="/form-back.js" defer>');
  // inside a real tag, that is: the hostile text itself is on the page, as text
  ok(`${label}: no javascript: link, no tag with an inline handler`, !/<a\b[^>]*href="javascript:/i.test(html) && !/<[a-z][^>]*\son[a-z]+\s*=/i.test(html));
  ok(`${label}: one "back" link the script can find`, (html.match(/<a href="#" data-back class="back">/g) || []).length === 1);
  ok(`${label}: not for search engines`, html.includes('<meta name="robots" content="noindex">'));
}

console.log(`\n${pass} passed, ${fail} failed`);
if (fail) { console.log('Failed:\n  ' + failures.join('\n  ')); process.exit(1); }

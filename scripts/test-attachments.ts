/**
 * Unit test for attachment references: only a file name this server generated
 * is ever resolved, and a visitor cannot plant a reference.
 * Run: node --experimental-strip-types scripts/test-attachments.ts
 */
import { attachmentName, isAttachmentValue, stripStorageLinks, ATTACHMENT_NAME_RE, REMOVED_LINK } from '../lib/attachments.ts';

let pass = 0, fail = 0;
const failures: string[] = [];
const eq = (n: string, got: unknown, want: unknown) =>
  JSON.stringify(got) === JSON.stringify(want) ? (pass++, console.log('  PASS  ' + n)) : (fail++, failures.push(n), console.log(`  FAIL  ${n}\n        got  ${JSON.stringify(got)}\n        want ${JSON.stringify(want)}`));

const HOST = 'abcdefghijklmnop.supabase.co';
const NAME = '1764045046123-0f1e2d3c4b5a6978.png';
const ref = (tail: string, kind = 'authenticated', host = HOST) => `https://${host}/storage/v1/object/${kind}/uploads/${tail}`;

console.log('\n== What is resolved ==');
eq('a reference the server wrote', attachmentName(ref(NAME), HOST), NAME);
eq('the older public form of the same reference', attachmentName(ref(NAME, 'public'), HOST), NAME);
eq('every extension the upload code produces', ['jpg', 'png', 'pdf', 'webp', 'bin'].map((e) => ATTACHMENT_NAME_RE.test(`1764045046123-0f1e2d3c4b5a6978.${e}`)), [true, true, true, true, true]);

console.log('\n== The attack of 2026-11-26 and its relatives ==');
eq('encoded traversal into another bucket', attachmentName(ref('..%2Fbackups%2Fdaily%2F2026-11-26T04-23-36Z.json.gz'), HOST), null);
eq('plain traversal', attachmentName(ref('../backups/daily/x.json.gz'), HOST), null);
eq('double-encoded traversal', attachmentName(ref('..%252Fbackups%252Fx'), HOST), null);
eq('encoded dots', attachmentName(ref(`%2e%2e/${NAME}`), HOST), null);
eq('backslash traversal', attachmentName(ref(`..\\backups\\${NAME}`), HOST), null);
eq('a sub-folder', attachmentName(ref(`folder/${NAME}`), HOST), null);
eq('a valid name with a traversal prefix', attachmentName(ref(`../uploads/${NAME}`), HOST), null);
eq('a valid name followed by a query', attachmentName(ref(`${NAME}?download=1`), HOST), null);
eq('a valid name followed by a fragment', attachmentName(ref(`${NAME}#x`), HOST), null);
eq('a valid name with an encoded character', attachmentName(ref(NAME.replace('-', '%2D')), HOST), null);
eq('another bucket named directly', attachmentName(`https://${HOST}/storage/v1/object/authenticated/backups/${NAME}`, HOST), null);
eq('a signed-link form (never stored)', attachmentName(`https://${HOST}/storage/v1/object/sign/uploads/${NAME}?token=x`, HOST), null);
eq('another project’s storage', attachmentName(ref(NAME, 'authenticated', 'evil.supabase.co'), HOST), null);
eq('a look-alike host', attachmentName(ref(NAME, 'authenticated', `${HOST}.evil.example`), HOST), null);
eq('credentials in the URL', attachmentName(`https://user:pw@${HOST}/storage/v1/object/authenticated/uploads/${NAME}`, HOST), null);
eq('http instead of https', attachmentName(ref(NAME).replace('https:', 'http:'), HOST), null);
eq('a name that is not one the server generates', attachmentName(ref('invoice.pdf'), HOST), null);
eq('uppercase hex (the server writes lowercase)', attachmentName(ref(NAME.toUpperCase()), HOST), null);
eq('an executable extension', attachmentName(ref('1764045046123-0f1e2d3c4b5a6978.html'), HOST), null);
eq('leading and trailing text around a valid reference', attachmentName(` ${ref(NAME)} `, HOST), null);
eq('a reference inside a sentence', attachmentName(`see ${ref(NAME)}`, HOST), null);
eq('a very long value', attachmentName(ref(NAME) + 'a'.repeat(400), HOST), null);
eq('not a string', [attachmentName(null, HOST), attachmentName(42, HOST), attachmentName({ url: ref(NAME) }, HOST), attachmentName([ref(NAME)], HOST)], [null, null, null, null]);
eq('the browser-side check agrees', [isAttachmentValue(ref(NAME)), isAttachmentValue(ref('..%2Fbackups%2Fx')), isAttachmentValue('https://example.com/a.png')], [true, false, false]);

console.log('\n== A visitor cannot plant a reference ==');
eq('a planted reference is removed from a field', stripStorageLinks(ref(NAME)), REMOVED_LINK);
eq('a traversal reference is removed', stripStorageLinks(ref('..%2Fbackups%2Fx')), REMOVED_LINK);
eq('inside a sentence, only the link goes', stripStorageLinks(`Bonjour, voir ${ref(NAME)} merci`), `Bonjour, voir ${REMOVED_LINK} merci`);
eq('two links in one value, called twice in a row (no state kept between calls)', [stripStorageLinks(`${ref(NAME)} ${ref(NAME)}`), stripStorageLinks(ref(NAME))], [`${REMOVED_LINK} ${REMOVED_LINK}`, REMOVED_LINK]);
eq('any storage host, any form', stripStorageLinks('http://other.example/storage/v1/object/sign/x/y?token=z'), REMOVED_LINK);
eq('nested values are cleaned too', stripStorageLinks({ a: ref(NAME), b: [ref(NAME), 'ok'], c: { d: ref(NAME) }, n: 3, z: null }), { a: REMOVED_LINK, b: [REMOVED_LINK, 'ok'], c: { d: REMOVED_LINK }, n: 3, z: null });
eq('ordinary links are untouched', stripStorageLinks('https://example.com/portfolio and http://x.fr/a/b?c=1'), 'https://example.com/portfolio and http://x.fr/a/b?c=1');
eq('ordinary text is untouched', stripStorageLinks('Bonjour, je souhaite un devis — storage de 20 m²'), 'Bonjour, je souhaite un devis — storage de 20 m²');
eq('an uploaded file (data URI) is untouched', stripStorageLinks('data:image/png;base64,iVBORw0KGgo/storage/v1/AAAA'), 'data:image/png;base64,iVBORw0KGgo/storage/v1/AAAA');
eq('a cleaned value is no longer an attachment', isAttachmentValue(stripStorageLinks(ref(NAME))), false);

console.log(`\n== RESULT: ${pass} passed, ${fail} failed ==`);
if (fail) { console.log('Failures:', failures); process.exit(1); }

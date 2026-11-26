/**
 * Unit test for attachment references: only a file name this server generated
 * is ever resolved, and a visitor cannot plant a reference.
 * Run: node --experimental-strip-types scripts/test-attachments.ts
 */
import { attachmentName, isAttachmentValue, stripStorageLinks, sniffUpload, contentTypeForName, UPLOAD_CONTENT_TYPE, ATTACHMENT_NAME_RE, REMOVED_LINK } from '../lib/attachments.ts';

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

console.log('\n== A file is what its bytes say ==');
{
  const b = (...v: number[]) => new Uint8Array(v);
  const text = (t: string) => new TextEncoder().encode(t);
  const PNG = b(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 13);
  const JPG = b(0xff, 0xd8, 0xff, 0xe0, 0, 16, 0x4a, 0x46);
  const WEBP = b(0x52, 0x49, 0x46, 0x46, 1, 2, 3, 4, 0x57, 0x45, 0x42, 0x50, 0x56, 0x50);
  eq('a PNG', sniffUpload(PNG), 'png');
  eq('a JPEG', sniffUpload(JPG), 'jpg');
  eq('a WebP', sniffUpload(WEBP), 'webp');
  eq('a PDF', sniffUpload(text('%PDF-1.7\n%âãÏÓ\n1 0 obj')), 'pdf');
  eq('a PDF with a few stray bytes before its header (readers accept it)', sniffUpload(text('\n\n  %PDF-1.4\n')), 'pdf');
  eq('a web page', sniffUpload(text('<!doctype html><html><script>alert(1)</script></html>')), 'bin');
  eq('a web page that mentions %PDF- is not a PDF', sniffUpload(text('<html><!-- %PDF-1.7 --><script>alert(1)</script></html>')), 'bin');
  eq('an SVG (it can carry script)', sniffUpload(text('<svg xmlns="http://www.w3.org/2000/svg" onload="alert(1)"/>')), 'bin');
  eq('a GIF, a ZIP, anything unknown', [sniffUpload(text('GIF89a')), sniffUpload(b(0x50, 0x4b, 3, 4)), sniffUpload(text('hello'))], ['bin', 'bin', 'bin']);
  eq('nothing at all', sniffUpload(new Uint8Array(0)), 'bin');
  eq('a RIFF file that is not WebP (a WAV)', sniffUpload(b(0x52, 0x49, 0x46, 0x46, 1, 2, 3, 4, 0x57, 0x41, 0x56, 0x45)), 'bin');
  eq('a PNG signature cut short', sniffUpload(b(0x89, 0x50, 0x4e, 0x47)), 'bin');
  eq('%PDF- only beyond the first kilobyte', sniffUpload(text(' '.repeat(2000) + '%PDF-1.7')), 'bin');
  eq('a JPEG that continues as a page is still stored as an image — and served as one, never as a page', sniffUpload(new Uint8Array([...JPG, ...text('<script>alert(1)</script>')])), 'jpg');
}

console.log('\n== The type a browser is told ==');
eq('from the generated name alone', ['jpg', 'png', 'pdf', 'webp', 'bin'].map((e) => contentTypeForName(`1764045046123-0f1e2d3c4b5a6978.${e}`)), ['image/jpeg', 'image/png', 'application/pdf', 'image/webp', 'application/octet-stream']);
eq('a name this server did not generate is opaque bytes', [contentTypeForName('evil.html'), contentTypeForName('x.svg'), contentTypeForName('1764045046123-0f1e2d3c4b5a6978.html'), contentTypeForName('')], Array(4).fill('application/octet-stream'));
eq('no type on the list can be rendered as a page or run as a script', Object.values(UPLOAD_CONTENT_TYPE).some((t) => /html|xml|svg|javascript|ecmascript|text\//.test(t)), false);

console.log(`\n== RESULT: ${pass} passed, ${fail} failed ==`);
if (fail) { console.log('Failures:', failures); process.exit(1); }

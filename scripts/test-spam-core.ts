/**
 * Unit test for the spam-classifier pure primitives.
 * Run: node --experimental-strip-types scripts/test-spam-core.ts
 */
import { parseVerdict, buildClassifierInput } from '../lib/spamCore.ts';

let pass = 0, fail = 0;
const failures: string[] = [];
const ck = (n: string, c: boolean) => c ? (pass++, console.log('  PASS  ' + n)) : (fail++, failures.push(n), console.log('  FAIL  ' + n));

console.log('\n== spam classifier core ==');

// clean JSON replies
{
  const r = parseVerdict('{"verdict":"spam","reason":"SEO pitch with links"}');
  ck('plain JSON parsed', r?.verdict === 'spam' && r.reason === 'SEO pitch with links');
}
// markdown-fenced / prose-wrapped replies still parse
{
  const r = parseVerdict('Sure! Here is the result:\n```json\n{"verdict":"clean","reason":"Genuine inquiry"}\n```');
  ck('fenced/prose reply parsed', r?.verdict === 'clean');
}
// case/whitespace tolerance
{
  const r = parseVerdict('{"verdict":" SUSPECT ","reason":"template feel"}');
  ck('case-insensitive verdict', r?.verdict === 'suspect');
}
// invalid verdicts and garbage -> null (fail-open)
{
  ck('unknown verdict -> null', parseVerdict('{"verdict":"maybe","reason":"?"}') === null);
  ck('no JSON -> null', parseVerdict('I cannot classify this.') === null);
  ck('broken JSON -> null', parseVerdict('{"verdict": "spam", "reason": ') === null);
  ck('empty -> null', parseVerdict('') === null);
}
// reason capped at 300
{
  const r = parseVerdict(`{"verdict":"spam","reason":"${'x'.repeat(500)}"}`);
  ck('reason capped at 300 chars', (r?.reason.length ?? 0) === 300);
}

// input builder
{
  const input = buildClassifierInput({ name: 'Bob', email: 'bob@x.com', message: 'Hi there', photo: 'data:image/png;base64,AAAA', count: 42 });
  ck('includes text fields', input.includes('name: Bob') && input.includes('message: Hi there'));
  ck('skips base64 blobs', !input.includes('data:image'));
  ck('skips non-strings', !input.includes('42'));
}
{
  ck('empty payload -> placeholder', buildClassifierInput({}) === '(empty submission)');
}
{
  const long = buildClassifierInput({ m: 'y'.repeat(9000) });
  ck('overall input capped', long.length <= 4000);
}

console.log(`\n== RESULT: ${pass} passed, ${fail} failed ==`);
if (failures.length) { console.log('Failures:', failures.join(' | ')); process.exit(1); }

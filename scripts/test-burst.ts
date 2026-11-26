/**
 * Unit test for the in-memory counter (lib/burst.ts) and the scheduled-job
 * secret check (lib/cronAuth.ts).
 * Run: node --experimental-strip-types scripts/test-burst.ts
 */
import { createBurstLimiter } from '../lib/burst.ts';
import { isScheduledCall } from '../lib/cronAuth.ts';

let pass = 0, fail = 0;
const failures: string[] = [];
const ok = (name: string, cond: boolean, detail = '') =>
  cond ? (pass++, console.log('  PASS  ' + name)) : (fail++, failures.push(name), console.log(`  FAIL  ${name}${detail ? '\n        ' + detail : ''}`));

console.log('\n== Counting ==');
{
  let t = 1_000_000;
  const b = createBurstLimiter({ now: () => t });
  const first12 = Array.from({ length: 12 }, () => b.allow('a', 12));
  ok('twelve in a minute pass', first12.every(Boolean));
  ok('the thirteenth does not', b.allow('a', 12) === false);
  ok('…nor the ones after it', b.allow('a', 12) === false && b.allow('a', 12) === false);
  ok('another key is counted on its own', b.allow('b', 12) === true);
  t += 60_000;
  ok('exactly a minute later the window is still the same one', b.allow('b', 1) === false);
  t += 1;
  ok('past the minute, the key starts again', b.allow('a', 12) === true && b.allow('b', 1) === true);
  ok('a limit of zero refuses the second event at the latest', (() => { const z = createBurstLimiter({ now: () => t }); z.allow('z', 0); return z.allow('z', 0) === false; })());
}

console.log('\n== It cannot grow without end ==');
{
  let t = 5_000_000;
  const b = createBurstLimiter({ now: () => t, maxKeys: 100 });
  for (let i = 0; i < 100; i++) b.allow(`made-up-${i}`, 12);
  ok('a hundred made-up keys are held', b.size() === 100);
  for (let i = 100; i < 5000; i++) b.allow(`made-up-${i}`, 12);
  ok('five thousand made-up keys never hold more than the ceiling', b.size() <= 100, `size ${b.size()}`);
  for (let i = 0; b.size() < 100; i++) b.allow(`filler-${i}`, 12); // full, every window still running
  t += 61_000; // …and now every one of them is over
  b.allow('fresh', 12);
  for (let i = 0; i < 50; i++) b.allow(`later-${i}`, 12);
  ok('finished windows are forgotten first', b.size() === 51, `size ${b.size()}`);
  ok('…and a key still being counted keeps its count through the clean-up', b.allow('fresh', 1) === false);
  ok('default ceiling: 5,000 keys', (() => { const d = createBurstLimiter(); for (let i = 0; i < 20_000; i++) d.allow(`k${i}`, 1); return d.size() <= 5000; })());
}

console.log('\n== The scheduled-job secret ==');
{
  const call = (authorization?: string) => new Request('https://x.test/api/cron/backup', authorization === undefined ? {} : { headers: { authorization } });
  const before = process.env.CRON_SECRET;
  process.env.CRON_SECRET = 'a-long-random-secret-0123456789abcdef';
  ok('the right secret passes', isScheduledCall(call('Bearer a-long-random-secret-0123456789abcdef')));
  ok('a wrong one does not', !isScheduledCall(call('Bearer a-long-random-secret-0123456789abcdeX')));
  ok('a prefix of the right one does not', !isScheduledCall(call('Bearer a-long-random-secret')));
  ok('the secret without "Bearer" does not', !isScheduledCall(call('a-long-random-secret-0123456789abcdef')));
  ok('no header does not', !isScheduledCall(call()));
  ok('lower-case "bearer" does not (the host sends it exactly)', !isScheduledCall(call('bearer a-long-random-secret-0123456789abcdef')));
  delete process.env.CRON_SECRET;
  ok('with no secret configured nothing passes — not even "Bearer undefined"', !isScheduledCall(call('Bearer undefined')) && !isScheduledCall(call('Bearer ')) && !isScheduledCall(call()));
  process.env.CRON_SECRET = '';
  ok('an empty secret is no secret', !isScheduledCall(call('Bearer ')));
  if (before === undefined) delete process.env.CRON_SECRET; else process.env.CRON_SECRET = before;
}

console.log(`\n${pass} passed, ${fail} failed`);
if (fail) { console.log('Failed:\n  ' + failures.join('\n  ')); process.exit(1); }

/**
 * Unit test for session tokens: what each kind may open, and when one has ended.
 * Run: node --experimental-strip-types scripts/test-tokens.ts
 */
import { signJWT, verifyJWT, isAdminAccess, isAdminRefresh, issuedBefore } from '../lib/jwt.ts';

let pass = 0, fail = 0;
const failures: string[] = [];
const ok = (n: string, cond: boolean, detail = '') =>
  cond ? (pass++, console.log('  PASS  ' + n)) : (fail++, failures.push(n), console.log(`  FAIL  ${n} ${detail}`));

const SECRET = 'unit-test-secret-that-is-long-enough-0123456789';
const now = Math.floor(Date.now() / 1000);

console.log('\n== The operator: an access token opens the door, a refresh token does not ==');
const access = await verifyJWT(await signJWT({ sub: 'admin', use: 'access', iat: now, exp: now + 900 }, SECRET), SECRET);
const refresh = await verifyJWT(await signJWT({ sub: 'admin', use: 'refresh', token_id: 'abc', iat: now, exp: now + 604800 }, SECRET), SECRET);
const legacyAccess = await verifyJWT(await signJWT({ sub: 'admin', iat: now, exp: now + 900 }, SECRET), SECRET);
const legacyRefresh = await verifyJWT(await signJWT({ sub: 'admin', token_id: 'abc', iat: now, exp: now + 604800 }, SECRET), SECRET);
ok('an access token is accepted as access', isAdminAccess(access));
ok('a refresh token is NOT accepted as access (the flaw closed on 2026-11-26)', !isAdminAccess(refresh));
ok('…nor one issued before tokens said what they were', !isAdminAccess(legacyRefresh));
ok('an access token issued before that still works until it expires', isAdminAccess(legacyAccess));
ok('a refresh token is accepted for refreshing', isAdminRefresh(refresh) && isAdminRefresh(legacyRefresh));
ok('an access token cannot be used to refresh', !isAdminRefresh(access) && !isAdminRefresh(legacyAccess));
const dev = await verifyJWT(await signJWT({ sub: 'client', clientId: 'x', iat: now, exp: now + 900 }, SECRET), SECRET);
const portal = await verifyJWT(await signJWT({ sub: 'portal', portalUserId: 'p', parentClientId: 'x', iat: now, exp: now + 900 }, SECRET), SECRET);
ok('a developer token is not an operator token', !isAdminAccess(dev) && !isAdminRefresh(dev));
ok('a client token is not an operator token', !isAdminAccess(portal));
ok('a developer token claiming use=access is still not the operator', !isAdminAccess(await verifyJWT(await signJWT({ sub: 'client', use: 'access', clientId: 'x', iat: now, exp: now + 900 }, SECRET), SECRET)));
ok('an operator token with an unknown use is refused', !isAdminAccess(await verifyJWT(await signJWT({ sub: 'admin', use: 'other', iat: now, exp: now + 900 }, SECRET), SECRET)));
ok('nothing is not a session', !isAdminAccess(null) && !isAdminRefresh(null));

console.log('\n== Signature and expiry ==');
const good = await signJWT({ sub: 'admin', use: 'access', iat: now, exp: now + 900 }, SECRET);
ok('a token signed with another secret is refused', (await verifyJWT(good, SECRET + 'x')) === null);
ok('an expired token is refused', (await verifyJWT(await signJWT({ sub: 'admin', iat: now - 1000, exp: now - 1 }, SECRET), SECRET)) === null);
const b64 = (o: unknown) => Buffer.from(JSON.stringify(o)).toString('base64url');
const [h, , sig] = good.split('.');
ok('a payload changed after signing is refused', (await verifyJWT(`${h}.${b64({ sub: 'admin', use: 'access', iat: now, exp: now + 99999 })}.${sig}`, SECRET)) === null);
ok('alg "none" with no signature is refused', (await verifyJWT(`${b64({ alg: 'none', typ: 'JWT' })}.${b64({ sub: 'admin', exp: now + 900 })}.`, SECRET)) === null);
// a token this server would never sign: no expiry at all
const noExp = await signJWT({ sub: 'admin', iat: now } as never, SECRET);
ok('a token without an expiry is refused, not treated as eternal', (await verifyJWT(noExp, SECRET)) === null);
const strExp = await signJWT({ sub: 'admin', iat: now, exp: String(now + 900) } as never, SECRET);
ok('an expiry that is not a number is refused', (await verifyJWT(strExp, SECRET)) === null);
ok('garbage is refused', (await verifyJWT('a.b', SECRET)) === null && (await verifyJWT('', SECRET)) === null && (await verifyJWT('x.y.z', SECRET)) === null);

console.log('\n== A password reset ends earlier sessions ==');
const cut = new Date((now - 100) * 1000).toISOString();
ok('a token issued before the cut-off has ended', issuedBefore(now - 200, cut));
ok('a token issued after it is valid', !issuedBefore(now - 50, cut));
ok('a token issued in the same second is valid (the one just handed out)', !issuedBefore(now - 100, cut));
ok('no cut-off: every token is valid', !issuedBefore(now - 99999, null) && !issuedBefore(now, undefined));
ok('a token with no issue time is treated as older than any cut-off', issuedBefore(undefined, cut) && issuedBefore('yesterday', cut));
ok('an unreadable cut-off ends nothing', !issuedBefore(now, 'not a date'));

console.log(`\n== RESULT: ${pass} passed, ${fail} failed ==`);
if (fail) { console.log('Failures:', failures); process.exit(1); }

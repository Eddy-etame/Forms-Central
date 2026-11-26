/**
 * Unit test for "may the server connect there?".
 * Run: node --experimental-strip-types scripts/test-netguard.ts
 */
import { isPublicIp, isPublicHttpsUrl, isIpLiteral } from '../lib/netGuard.ts';

let pass = 0, fail = 0;
const failures: string[] = [];
const eq = (n: string, got: unknown, want: unknown) =>
  got === want ? (pass++, console.log('  PASS  ' + n)) : (fail++, failures.push(n), console.log(`  FAIL  ${n}\n        got ${JSON.stringify(got)}, want ${JSON.stringify(want)}`));

console.log('\n== Addresses ==');
for (const ip of ['8.8.8.8', '1.1.1.1', '93.184.216.34', '2606:4700:4700::1111', '2a00:1450:4007:80e::200e']) eq(`public: ${ip}`, isPublicIp(ip), true);
for (const ip of [
  '127.0.0.1', '127.255.255.254', '10.0.0.8', '172.16.0.1', '172.31.255.255', '192.168.1.2', '169.254.169.254', '100.64.0.1', '0.0.0.0',
  '192.0.2.1', '198.18.0.1', '198.51.100.7', '203.0.113.9', '224.0.0.1', '240.0.0.1', '255.255.255.255',
  '::1', '::', 'fc00::1', 'fd12:3456::1', 'fe80::1', 'ff02::1', '::ffff:127.0.0.1', '::ffff:7f00:1', '::ffff:a00:1', '::127.0.0.1', '64:ff9b::7f00:1', '2001:db8::1',
  '[::1]', 'fe80::1%eth0',
]) eq(`not public: ${ip}`, isPublicIp(ip), false);
for (const junk of ['', 'example.com', '1.2.3', '999.1.1.1', '1.2.3.4.5', 'g::1', '12345']) eq(`not an address: "${junk}"`, isPublicIp(junk), false);
eq('172.32.0.1 is outside the private block', isPublicIp('172.32.0.1'), true);
eq('100.128.0.1 is outside carrier NAT', isPublicIp('100.128.0.1'), true);
eq('a mapped public address is public', isPublicIp('::ffff:8.8.8.8'), true);

console.log('\n== URLs a webhook may point at ==');
for (const u of ['https://hooks.example.com/inlet', 'https://api.yourapp.com/hooks?x=1', 'https://fcm.googleapis.com/x', 'https://fd-webhooks.example.org/a', 'https://fe80.example.net/', 'https://8.8.8.8/hook', 'https://[2606:4700:4700::1111]/hook'])
  eq(`accepted: ${u}`, isPublicHttpsUrl(u), true);
for (const u of [
  'http://hooks.example.com/x', 'ftp://hooks.example.com/x', 'https://user:pw@hooks.example.com/x', 'https://localhost/hook', 'https://app.localhost/hook',
  'https://printer.local/x', 'https://db.internal/x', 'https://intranet/x', 'https://nas.lan/x', 'https://127.0.0.1/hook', 'https://10.0.0.8/hook',
  'https://192.168.1.2/hook', 'https://169.254.169.254/latest/meta-data', 'https://2130706433/', 'https://0x7f.0.0.1/', 'https://0177.0.0.1/', 'https://[::1]/x',
  'https://[::ffff:127.0.0.1]/x', 'https://[fd00::1]/x', 'https://0.0.0.0/x', 'not a url', '', 'https://', 'javascript:alert(1)',
]) eq(`refused: ${u}`, isPublicHttpsUrl(u), false);

console.log('\n== Literals ==');
eq('1.2.3.4 is a literal', isIpLiteral('1.2.3.4'), true);
eq('[::1] is a literal', isIpLiteral('[::1]'), true);
eq('a name starting like an address is not', isIpLiteral('fd-webhooks.example.org'), false);

console.log(`\n== RESULT: ${pass} passed, ${fail} failed ==`);
if (fail) { console.log('Failures:', failures); process.exit(1); }

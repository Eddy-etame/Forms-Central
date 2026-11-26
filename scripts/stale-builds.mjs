/**
 * Old builds on the host that carry local database dumps in their source.
 *
 * Until 2026-11-26 the deploy tool uploaded the whole folder — backups/
 * included — as private build source (see .vercelignore). The build that is
 * live is clean; the older ones still hold those files until they are
 * deleted. This script finds them.
 *
 *   node scripts/stale-builds.mjs            list them, change nothing
 *   node scripts/stale-builds.mjs --apply    delete them (never the live build,
 *                                            never a build without dumps)
 *
 * It needs a token of the hosting account: VERCEL_TOKEN, or the one the CLI
 * stored after `npx vercel login`. The project is read from
 * .vercel/project.json (`npx vercel link`).
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const apply = process.argv.includes('--apply');
const readJson = (p) => { try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return null; } };
const token = process.env.VERCEL_TOKEN
  || readJson(path.join(os.homedir(), '.local/share/com.vercel.cli/auth.json'))?.token
  || readJson(path.join(os.homedir(), 'Library/Application Support/com.vercel.cli/auth.json'))?.token
  || readJson(path.join(process.env.APPDATA || '', 'com.vercel.cli/auth.json'))?.token;
const link = readJson('.vercel/project.json');
if (!token) { console.error('No token: set VERCEL_TOKEN or run `npx vercel login` first.'); process.exit(2); }
if (!link?.projectId) { console.error('No project: run `npx vercel link` in this folder first.'); process.exit(2); }
const team = link.orgId?.startsWith('team_') ? `&teamId=${link.orgId}` : '';
const api = (p, init = {}) => fetch(`https://api.vercel.com${p}`, { ...init, headers: { Authorization: `Bearer ${token}`, ...(init.headers || {}) } });

const all = [];
for (let until = ''; ;) {
  const page = await (await api(`/v6/deployments?projectId=${link.projectId}${team}&limit=100${until ? `&until=${until}` : ''}`)).json();
  all.push(...(page.deployments || []));
  if (!page.pagination?.next) break;
  until = page.pagination.next;
}
const live = all.find((d) => d.target === 'production' && d.state === 'READY');
const when = (d) => new Date(d.created).toISOString().slice(0, 16).replace('T', ' ');

const stale = [];
for (const d of all) {
  const res = await api(`/v6/deployments/${d.uid}/files?${team.slice(1)}`);
  if (!res.ok) continue;
  const files = await res.json();
  const src = (Array.isArray(files) ? files : []).find((f) => f.name === 'src');
  if ((src?.children || []).some((f) => f.name === 'backups')) stale.push(d);
}

console.log(`${all.length} builds in this project; live: ${live ? when(live) + ' UTC' : 'none found'}.`);
console.log(`${stale.length} carry backups/ in their source${stale.length ? `, from ${when(stale[stale.length - 1])} to ${when(stale[0])} UTC` : ''}.`);
if (live && stale.some((d) => d.uid === live.uid)) {
  console.log('The live build is one of them: deploy again first (with .vercelignore in place), then run this again.');
  process.exit(1);
}
if (!apply) {
  if (stale.length) console.log('Nothing was changed. Run again with --apply to delete them.');
  process.exit(0);
}
let removed = 0;
for (const d of stale) {
  const res = await api(`/v13/deployments/${d.uid}?${team.slice(1)}`, { method: 'DELETE' });
  if (res.ok) removed++; else console.log(`  could not delete the build of ${when(d)}: ${res.status}`);
}
console.log(`${removed} of ${stale.length} deleted.`);
process.exit(removed === stale.length ? 0 : 1);

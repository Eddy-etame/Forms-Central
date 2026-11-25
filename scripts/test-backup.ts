/**
 * Unit test for the backup file format and the "what is missing" comparison.
 * Run: node --experimental-strip-types scripts/test-backup.ts
 */
import { pack, unpack, pickRemovals, newestOfDay, backupDay, missingLeads, backupName, BACKUP_KEEP } from '../lib/backupCore.ts';
import type { BackupFile } from '../lib/backupCore.ts';

let pass = 0, fail = 0;
const failures: string[] = [];
const ok = (name: string, cond: boolean, detail = '') =>
  cond ? (pass++, console.log('  PASS  ' + name)) : (fail++, failures.push(name), console.log(`  FAIL  ${name}${detail ? '\n        ' + detail : ''}`));
const eq = (name: string, got: unknown, want: unknown) => ok(name, JSON.stringify(got) === JSON.stringify(want), `got ${JSON.stringify(got)}, want ${JSON.stringify(want)}`);

const file: BackupFile = {
  version: 1,
  takenAt: '2026-11-25T04:17:00.000Z',
  counts: { forms: 3, submissions: 5 },
  tables: {
    forms: [
      { id: 'f1', client_id: 'devA', name: 'Contact' },
      { id: 'f2', client_id: 'devA', name: 'Devis' },
      { id: 'f3', client_id: 'devB', name: 'Autre' },
    ],
    submissions: [
      { id: 'l1', form_id: 'f1', payload: { name: 'Zoé', message: 'été à Besançon — "devis"' }, created_at: '2026-10-01T10:00:00Z' },
      { id: 'l2', form_id: 'f1', payload: { name: 'B' }, created_at: '2026-10-02T10:00:00Z' },
      { id: 'l3', form_id: 'f2', payload: { name: 'C' }, created_at: '2026-10-03T10:00:00Z' },
      { id: 'l4', form_id: 'f3', payload: { name: 'D' }, created_at: '2026-10-04T10:00:00Z' },
      { id: 'l5', form_id: 'gone', payload: { name: 'E' }, created_at: '2026-10-05T10:00:00Z' },
    ],
  },
};

console.log('\n== The file ==');
const bytes = pack(file);
eq('a backup survives the round trip, accents and quotes included', unpack(bytes), file);
ok('it is compressed (gzip magic number)', bytes[0] === 0x1f && bytes[1] === 0x8b);
let threw = false;
try { unpack(pack({ ...file, version: 2 } as unknown as BackupFile)); } catch { threw = true; }
ok('an unknown version is refused rather than half-read', threw);
threw = false;
try { unpack(new Uint8Array([1, 2, 3])); } catch { threw = true; }
ok('garbage is refused', threw);
eq('one name per backup, to the second, never reused', backupName(new Date('2026-11-25T23:59:59.412Z')), 'daily/2026-11-25T23-59-59Z.json.gz');
eq('the day is read back from the name', backupDay('daily/2026-11-25T23-59-59Z.json.gz'), '2026-11-25');

console.log('\n== Rotation ==');
const names = Array.from({ length: 20 }, (_, i) => `daily/2026-11-${String(i + 1).padStart(2, '0')}T04-17-03Z.json.gz`);
const removed = pickRemovals(names, BACKUP_KEEP);
eq(`with 20 days of files, the ${20 - BACKUP_KEEP} oldest days go`, removed.length, 20 - BACKUP_KEEP);
ok('…the oldest ones', removed.includes(names[0]) && !removed.includes(names[19]) && !removed.includes(names[20 - BACKUP_KEEP]));
eq('fewer days than the limit: nothing goes', pickRemovals(names.slice(0, 5), BACKUP_KEEP), []);
eq('order of the listing does not matter', pickRemovals([...names].reverse(), BACKUP_KEEP).sort(), [...removed].sort());
const busy = [...names, 'daily/2026-11-20T09-00-00Z.json.gz', 'daily/2026-11-20T15-30-00Z.json.gz', 'daily/2026-11-20T15-31-00Z.json.gz'];
eq('three more backups taken by hand on one day push no earlier day out', pickRemovals(busy, BACKUP_KEEP).sort(), [...removed].sort());
eq('restoring "from a day" takes that day’s newest file', newestOfDay(busy, '2026-11-20'), 'daily/2026-11-20T15-31-00Z.json.gz');
eq('a day without a backup has none', newestOfDay(busy, '2026-12-01'), null);

console.log('\n== What is missing ==');
const live = { leadIds: new Set(['l1']), formIds: new Set(['f1', 'f2', 'f3']) };
const all = missingLeads(file, live);
eq('leads gone from the database whose form still exists are restorable', all.restorable.map((l) => l.id), ['l2', 'l3', 'l4']);
eq('a lead still there is not touched', all.present, 1);
eq('a lead whose form is gone is counted, not restored', all.orphaned, 1);
eq('limited to one form', missingLeads(file, live, { formId: 'f1' }).restorable.map((l) => l.id), ['l2']);
eq('limited to one developer: never another developer’s leads', missingLeads(file, live, { developerId: 'devA' }).restorable.map((l) => l.id), ['l2', 'l3']);
eq('a developer with nothing missing', missingLeads(file, { leadIds: new Set(['l1', 'l2', 'l3', 'l4']), formIds: live.formIds }, { developerId: 'devB' }).restorable, []);
ok('a restored lead is the stored row, untouched', all.restorable[0] === file.tables.submissions[1]);
eq('an empty backup restores nothing', missingLeads({ ...file, tables: {} }, live).restorable, []);

console.log(`\n== RESULT: ${pass} passed, ${fail} failed ==`);
if (fail) { console.log('Failures:', failures); process.exit(1); }

/**
 * Brand rename sweep. Re-runnable: node scripts/rename-brand.mjs "Old Name" "New Name" [old-slug new-slug]
 * Sweeps tracked source/text files, reports every file touched, refuses binary.
 */
import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';

const [oldName, newName, oldSlug, newSlug] = process.argv.slice(2);
if (!oldName || !newName) {
  console.error('Usage: node scripts/rename-brand.mjs "Old Name" "New Name" [old-slug new-slug]');
  process.exit(1);
}

const files = execSync('git ls-files', { encoding: 'utf8' })
  .split('\n')
  .filter((f) => f && /\.(ts|tsx|js|mjs|css|md|txt|json|sql|svg)$/.test(f))
  .filter((f) => !f.includes('package-lock'));

let touched = 0;
for (const f of files) {
  let s;
  try { s = readFileSync(f, 'utf8'); } catch { continue; }
  let out = s.replaceAll(oldName, newName);
  if (oldSlug && newSlug) out = out.replaceAll(oldSlug, newSlug);
  if (out !== s) {
    writeFileSync(f, out);
    console.log('  renamed in', f);
    touched++;
  }
}
console.log(`\n${touched} files updated: "${oldName}" -> "${newName}"${oldSlug ? ` and ${oldSlug} -> ${newSlug}` : ''}`);

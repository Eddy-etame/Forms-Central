/**
 * Unit test for the CSV writer: what a spreadsheet would execute never leaves as a formula.
 * Run: node --experimental-strip-types scripts/test-csv.ts
 */
import { csvCell, toCsv } from '../lib/csv.ts';

let pass = 0, fail = 0;
const failures: string[] = [];
const eq = (n: string, got: string, want: string) =>
  got === want ? (pass++, console.log('  PASS  ' + n)) : (fail++, failures.push(n), console.log(`  FAIL  ${n}\n        got  ${JSON.stringify(got)}\n        want ${JSON.stringify(want)}`));

console.log('\n== Formulas a visitor could plant ==');
eq('=HYPERLINK is kept as text', csvCell('=HYPERLINK("http://evil.example","Click")'), `"'=HYPERLINK(""http://evil.example"",""Click"")"`);
eq('DDE command', csvCell("=cmd|' /C calc'!A0"), `"'=cmd|' /C calc'!A0"`);
eq('@SUM', csvCell('@SUM(1+1)*cmd|x'), `"'@SUM(1+1)*cmd|x"`);
eq('+ followed by a formula', csvCell('+1+cmd|x!A0'), `"'+1+cmd|x!A0"`);
eq('- followed by a formula', csvCell('-2+3+cmd|x!A0'), `"'-2+3+cmd|x!A0"`);
eq('tab then formula', csvCell('\t=1+1'), `"'\t=1+1"`);
eq('carriage return then formula', csvCell('\r=1+1'), `"'\r=1+1"`);
eq('a minus sign before words', csvCell('-not a number'), `"'-not a number"`);

console.log('\n== What must stay readable ==');
eq('international phone number', csvCell('+33 6 12 34 56 78'), '"+33 6 12 34 56 78"');
eq('compact phone number', csvCell('+33612345678'), '"+33612345678"');
eq('phone with parentheses', csvCell('+1 (415) 555-0100'), '"+1 (415) 555-0100"');
eq('negative number', csvCell('-12.5'), '"-12.5"');
eq('plain text', csvCell('Bonjour, je souhaite un devis'), '"Bonjour, je souhaite un devis"');
eq('an equals sign inside a sentence', csvCell('budget = 2000'), '"budget = 2000"');
eq('e-mail address', csvCell('jean@example.com'), '"jean@example.com"');
eq('quotes are doubled', csvCell('il a dit "oui"'), '"il a dit ""oui"""');
eq('line breaks stay inside the cell', csvCell('ligne 1\nligne 2'), '"ligne 1\nligne 2"');
eq('accents untouched', csvCell('Été à Besançon'), '"Été à Besançon"');
eq('number', csvCell(42), '"42"');
eq('boolean', csvCell(true), '"true"');
eq('null', csvCell(null), '""');
eq('undefined', csvCell(undefined), '""');
eq('object as JSON', csvCell({ a: 1 }), '"{""a"":1}"');
eq('array as JSON', csvCell(['x', 'y']), '"[""x"",""y""]"');

console.log('\n== The file ==');
const file = toCsv(['Date', 'Nom, prénom'], [['2026-11-24', '=1+1'], ['2026-11-25', 'Zoé']]);
eq('starts with the byte-order mark Excel needs for accents', file.charCodeAt(0).toString(16), 'feff');
eq('headers are quoted too (a comma in a field name breaks nothing)', file.slice(1).split('\r\n')[0], '"Date","Nom, prénom"');
eq('rows use CRLF and end with one', file.slice(1), '"Date","Nom, prénom"\r\n"2026-11-24","\'=1+1"\r\n"2026-11-25","Zoé"\r\n');
eq('a header that looks like a formula is neutralised as well', toCsv(['=cmd'], []).slice(1), `"'=cmd"\r\n`);

console.log(`\n== RESULT: ${pass} passed, ${fail} failed ==`);
if (fail) { console.log('Failures:', failures); process.exit(1); }

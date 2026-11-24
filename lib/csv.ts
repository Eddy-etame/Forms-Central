/**
 * CSV the way a spreadsheet actually opens it — and safely.
 *
 * Lead fields are written by strangers. A cell that starts with = + - or @ is
 * a formula to Excel, LibreOffice and Google Sheets: a visitor can type
 * `=HYPERLINK(...)` or a DDE command into a contact form and have it run on
 * the machine of whoever opens the export. Every cell is therefore quoted, and
 * anything that could be read as a formula is prefixed with an apostrophe so
 * it stays text. A plain number or a phone number (+33 6 12 34 56 78) is not a
 * formula and is left as it is.
 *
 * No imports: used by the server exports and testable on its own.
 */

/** A leading + or - followed only by digits and phone punctuation cannot execute anything. */
const HARMLESS_SIGNED = /^[+-][\d\s().\/-]{0,40}$/;

export function csvCell(value: unknown): string {
  let s =
    value === null || value === undefined ? ''
    : typeof value === 'string' ? value
    : typeof value === 'object' ? JSON.stringify(value)
    : String(value);
  const first = s.charAt(0);
  if (first === '=' || first === '@' || first === '\t' || first === '\r' || ((first === '+' || first === '-') && !HARMLESS_SIGNED.test(s))) {
    s = `'${s}`;
  }
  return `"${s.replace(/"/g, '""')}"`;
}

/** A whole file: UTF-8 with a byte-order mark (Excel needs it for accents), CRLF line ends. */
export function toCsv(headers: string[], rows: unknown[][]): string {
  const lines = [headers.map(csvCell).join(','), ...rows.map((r) => r.map(csvCell).join(','))];
  return '﻿' + lines.join('\r\n') + '\r\n';
}

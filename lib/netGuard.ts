/**
 * Is this address somewhere on the public internet?
 *
 * Used before the server connects anywhere on someone's instruction (a
 * webhook URL) and before a hostname is trusted to describe an address. No
 * imports: testable on its own (scripts/test-netguard.ts).
 */

/** Dotted IPv4 → four numbers, or null. */
function v4(ip: string): number[] | null {
  const m = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(ip);
  if (!m) return null;
  const p = m.slice(1).map(Number);
  return p.every((n) => n >= 0 && n <= 255) ? p : null;
}

function publicV4(p: number[]): boolean {
  const [a, b, c] = p;
  if (a === 0 || a === 10 || a === 127) return false;                 // "this network", private, loopback
  if (a === 100 && b >= 64 && b <= 127) return false;                 // carrier-grade NAT
  if (a === 169 && b === 254) return false;                           // link-local (cloud metadata lives here)
  if (a === 172 && b >= 16 && b <= 31) return false;                  // private
  if (a === 192 && b === 168) return false;                           // private
  if (a === 192 && b === 0 && c === 0) return false;                  // protocol assignments
  if (a === 192 && b === 0 && c === 2) return false;                  // documentation
  if (a === 198 && (b === 18 || b === 19)) return false;              // benchmarking
  if (a === 198 && b === 51 && c === 100) return false;               // documentation
  if (a === 203 && b === 0 && c === 113) return false;                // documentation
  if (a >= 224) return false;                                         // multicast, reserved, broadcast
  return true;
}

/** True only for a syntactically valid address outside every private, loopback, link-local and reserved range. */
export function isPublicIp(ip: string): boolean {
  const raw = ip.trim().toLowerCase().replace(/^\[|\]$/g, '').replace(/%.*$/, '');
  const four = v4(raw);
  if (four) return publicV4(four);
  if (!/^[0-9a-f:.]+$/.test(raw) || !raw.includes(':')) return false;

  // IPv4 carried inside IPv6 (::ffff:1.2.3.4, ::1.2.3.4, 64:ff9b::1.2.3.4): judge the IPv4.
  const tail = raw.slice(raw.lastIndexOf(':') + 1);
  const embedded = v4(tail);
  if (embedded) return publicV4(embedded);
  const mapped = /^(?:0*:)*:?ffff:([0-9a-f]{1,4}):([0-9a-f]{1,4})$/.exec(raw);
  if (mapped) {
    const hi = parseInt(mapped[1], 16), lo = parseInt(mapped[2], 16);
    return publicV4([hi >> 8, hi & 255, lo >> 8, lo & 255]);
  }

  if (raw === '::' || raw === '::1') return false;                    // unspecified, loopback
  const first = parseInt(raw.split(':')[0] || '0', 16);
  if ((first & 0xfe00) === 0xfc00) return false;                      // fc00::/7 unique local
  if ((first & 0xffc0) === 0xfe80) return false;                      // fe80::/10 link-local
  if ((first & 0xff00) === 0xff00) return false;                      // ff00::/8 multicast
  if (raw.startsWith('64:ff9b:')) return false;                       // NAT64
  if (raw.startsWith('2001:db8:')) return false;                      // documentation
  if (raw.startsWith('::')) return false;                             // IPv4-compatible and other low space
  return true;
}

/** A host written as an IP literal (v4, or v6 with or without brackets)? */
export function isIpLiteral(host: string): boolean {
  const h = host.replace(/^\[|\]$/g, '');
  return v4(h) !== null || (h.includes(':') && /^[0-9a-f:.%]+$/i.test(h));
}

const INTERNAL_NAME_RE = /(^|\.)(localhost|local|internal|intranet|lan|home|corp|localdomain)$/;

/**
 * A URL the server may be told to call: https, no credentials, and a host
 * that is not, on its face, a private place. (A name that RESOLVES to a
 * private address is caught at connection time, see lib/webhooks.ts.)
 */
export function isPublicHttpsUrl(v: string): boolean {
  let u: URL;
  try { u = new URL(v); } catch { return false; }
  if (u.protocol !== 'https:' || u.username || u.password) return false;
  const h = u.hostname.toLowerCase().replace(/^\[|\]$/g, '');
  if (!h || h === '0.0.0.0') return false;
  if (isIpLiteral(h)) return isPublicIp(h);
  if (!h.includes('.') || INTERNAL_NAME_RE.test(h)) return false;     // single-label and internal names
  return true;
}

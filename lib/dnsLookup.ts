import dns from 'dns';
import { blacklistTarget, AUTO_BAN_TTL_MS } from './blacklist';

// Hosting, VPS and VPN keywords in a host name
const HOSTING_KEYWORDS = [
  'vps', 'vpn', 'server', 'cloud', 'host', 'dedi', 'ovh', 'aws', 'amazon',
  'digitalocean', 'linode', 'hetzner', 'leaseweb', 'scalyr', 'scaleway',
  'm247', 'controld', 'windscribe', 'nordvpn', 'surfshark', 'expressvpn',
  'proton', 'mullvad', 'ivacy', 'cyberghost', 'tor-exit', 'node', 'datacentre',
  'datacenter', 'proxy', 'rackspace', 'softlayer', 'googleusercontent'
];

const LOOKUP_TIMEOUT_MS = 1500;

function withTimeout<T>(p: Promise<T>, fallback: T): Promise<T> {
  return Promise.race([p, new Promise<T>((r) => setTimeout(() => r(fallback), LOOKUP_TIMEOUT_MS))]);
}

/**
 * The host name of an address — only when that name points back at the
 * address (forward-confirmed reverse DNS).
 *
 * Whoever controls an address controls its reverse record and can make it
 * say anything, including the name of somebody else's machine. Until
 * 2026-11-26 that unverified name was used as a ban key: a bot could set its
 * reverse record to a victim's host name, trip the honeypot, and have the
 * victim refused on every form for a day. A name is now believed only if
 * resolving it leads back to the same address. Lookups are bounded in time: a
 * slow resolver must not delay a visitor's submission.
 */
export async function resolveHostDomain(ip: string): Promise<string | null> {
  try {
    if (ip === '::1' || ip === '127.0.0.1' || ip.startsWith('192.168.') || ip.startsWith('10.')) return null;
    const names = await withTimeout(dns.promises.reverse(ip), [] as string[]);
    const name = names[0]?.toLowerCase();
    if (!name) return null;
    const forward = await withTimeout(
      Promise.allSettled([dns.promises.resolve4(name), dns.promises.resolve6(name)]).then((r) =>
        r.flatMap((x) => (x.status === 'fulfilled' ? x.value : []))
      ),
      [] as string[]
    );
    return forward.includes(ip) ? name : null;
  } catch {
    // No reverse record is the normal case for most residential addresses.
    return null;
  }
}

/**
 * A filled honeypot: ban the address for a day, and its host when the address
 * really belongs to a hosting or VPN provider.
 *
 * What is NOT banned any more (2026-11-26): the browser fingerprint. It is a
 * header the sender writes; a bot can put anyone's fingerprint there, and
 * every visitor with the same browser profile would then be refused on every
 * form. It is still recorded with the lead, and an operator can still block
 * one by hand.
 */
export async function handleHoneypotTrigger(ipAddress: string, fingerprint: string): Promise<void> {
  console.warn(`[SECURITY WARN] Honeypot triggered by IP: ${ipAddress}, Fingerprint: ${fingerprint}`);
  await blacklistTarget(ipAddress, 'ip', 'Honeypot Triggered', AUTO_BAN_TTL_MS);

  const host = await resolveHostDomain(ipAddress);
  if (host && HOSTING_KEYWORDS.some((keyword) => host.includes(keyword))) {
    await blacklistTarget(host, 'host', 'Honeypot Triggered (Hosting/VPN Host)', AUTO_BAN_TTL_MS);
  }
}

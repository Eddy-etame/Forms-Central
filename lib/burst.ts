/**
 * A counter per key, kept in this server instance's memory: the first, free
 * line of defence, before the database-backed limits that are the real ones.
 *
 * It is approximate on purpose (each instance counts on its own) and bounded
 * on purpose: a key often contains something the sender writes — a
 * fingerprint header, a bearer token — and a map that keeps every made-up
 * value grows until the instance runs out of memory. Until 2026-11-26 the
 * submit route's map was never emptied.
 *
 * No imports: testable alone, with its own clock.
 */
export interface BurstLimiter {
  /** Count one event for `key`. False once the key is past `limit` within the current window. */
  allow(key: string, limit: number): boolean;
  /** How many keys are being counted right now. */
  size(): number;
}

export function createBurstLimiter(opts: { windowMs?: number; maxKeys?: number; now?: () => number } = {}): BurstLimiter {
  const windowMs = opts.windowMs ?? 60_000;
  const maxKeys = opts.maxKeys ?? 5000;
  const now = opts.now ?? Date.now;
  const seen = new Map<string, { count: number; start: number }>();

  /** Make room: forget the windows that are over; if every key is still live, start again from nothing. */
  function makeRoom(t: number) {
    for (const [key, entry] of seen) if (t - entry.start > windowMs) seen.delete(key);
    if (seen.size >= maxKeys) seen.clear();
  }

  return {
    allow(key, limit) {
      const t = now();
      const entry = seen.get(key);
      if (!entry || t - entry.start > windowMs) {
        if (!entry && seen.size >= maxKeys) makeRoom(t);
        seen.set(key, { count: 1, start: t });
        return true;
      }
      entry.count++;
      return entry.count <= limit;
    },
    size: () => seen.size,
  };
}

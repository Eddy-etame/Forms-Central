/**
 * Pure spam-classifier primitives (no AI/DB deps) so they can be unit-tested
 * in isolation. Used by lib/spamClassifier.ts.
 */

export type SpamVerdict = 'clean' | 'suspect' | 'spam';

/** Parse the model reply defensively — any deviation returns null (fail-open). */
export function parseVerdict(text: string): { verdict: SpamVerdict; reason: string } | null {
  try {
    const match = text.match(/\{[\s\S]*\}/); // tolerate stray prose/fences
    if (!match) return null;
    const obj = JSON.parse(match[0]) as { verdict?: string; reason?: string };
    const v = (obj.verdict || '').toLowerCase().trim();
    if (v !== 'clean' && v !== 'suspect' && v !== 'spam') return null;
    return { verdict: v, reason: (obj.reason || '').slice(0, 300) };
  } catch {
    return null;
  }
}

/** Build the compact classifier input (text fields only, capped). */
export function buildClassifierInput(payload: Record<string, unknown>): string {
  const lines: string[] = [];
  for (const [k, v] of Object.entries(payload)) {
    if (typeof v !== 'string') continue;
    if (v.startsWith('data:') || (v.startsWith('http') && v.length > 300)) continue; // skip blobs/upload URLs
    lines.push(`${k}: ${v.slice(0, 600)}`);
    if (lines.length >= 12) break;
  }
  return lines.join('\n').slice(0, 4000) || '(empty submission)';
}

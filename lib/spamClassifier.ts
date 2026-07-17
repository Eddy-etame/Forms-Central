import { askAIRaw } from './ai';
import { supabase } from './supabase';
import { parseVerdict, buildClassifierInput } from './spamCore';

/**
 * AI spam classification (migrations/migration_v16) — the differentiator no
 * keyword filter can match. Runs AFTER the lead is stored, asynchronously:
 * it only LABELS (clean/suspect/spam), never blocks or deletes, and fails
 * open — an AI outage leaves the lead unlabeled, not lost.
 * Pure primitives live in ./spamCore (unit-tested).
 */

export type { SpamVerdict } from './spamCore';
export { parseVerdict, buildClassifierInput };

const SYSTEM = `You are a spam classifier for website contact-form submissions.
Classify the submission as exactly one of: "clean", "suspect", "spam".

- "spam": unsolicited commercial pitches (SEO/backlink/web-design offers, crypto, gambling, pharma), scams, phishing, gibberish, or link-stuffed messages.
- "suspect": plausibly real but with spam signals (generic template feel, mismatched name/email, one suspicious link).
- "clean": a genuine inquiry from a real person.

Reply with ONLY a JSON object, no markdown fences, no prose:
{"verdict":"clean|suspect|spam","reason":"<one short sentence>"}`;

/**
 * Classify a stored submission and write the verdict onto its row.
 * Fire-and-forget from the submit route — never throws, never blocks.
 */
export async function classifySubmission(submissionId: string, payload: Record<string, unknown>): Promise<void> {
  try {
    const { text } = await askAIRaw(SYSTEM, [{ role: 'user', content: buildClassifierInput(payload) }], 200);
    const parsed = parseVerdict(text);
    if (!parsed) return; // unusable reply — leave unlabeled
    await supabase
      .from('submissions')
      .update({ spam_status: parsed.verdict, spam_reason: parsed.reason })
      .eq('id', submissionId);
  } catch (err) {
    // AI outage / quota: the lead stays stored and simply unlabeled.
    console.warn('[spam-ai] classification skipped:', (err as Error)?.message);
  }
}

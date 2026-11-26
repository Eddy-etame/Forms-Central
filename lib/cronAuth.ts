import crypto from 'crypto';

/**
 * True when a request carries the scheduled-job secret
 * (`Authorization: Bearer <CRON_SECRET>`, which is how the host calls the
 * routes listed under `crons` in vercel.json).
 *
 * Both sides are hashed and compared in constant time: how long the answer
 * takes says nothing about how much of a guess was right. Without a
 * configured secret nothing passes.
 */
export function isScheduledCall(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const digest = (v: string) => crypto.createHash('sha256').update(v).digest();
  return crypto.timingSafeEqual(digest(req.headers.get('authorization') || ''), digest(`Bearer ${secret}`));
}

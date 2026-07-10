import { supabase } from './supabase';

/**
 * Sliding-window rate limiter backed by the auth_attempts table
 * (migration_v6), so limits hold across serverless instances.
 *
 * Fail-open: if the table is missing or the DB errors, the request is
 * allowed (auth must not go down because the limiter did) — scrypt cost
 * still slows offline brute force.
 */
export async function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number
): Promise<boolean> {
  try {
    const since = new Date(Date.now() - windowMs).toISOString();
    const { count, error } = await supabase
      .from('auth_attempts')
      .select('id', { count: 'exact', head: true })
      .eq('key', key)
      .gte('created_at', since);
    if (error) return true; // fail-open (table missing / transient error)
    if ((count ?? 0) >= limit) return false;

    await supabase.from('auth_attempts').insert({ key });

    // Opportunistic cleanup (~2% of calls) so the table never balloons.
    if (Math.random() < 0.02) {
      const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      await supabase.from('auth_attempts').delete().lt('created_at', dayAgo);
    }
    return true;
  } catch {
    return true;
  }
}

/** First client IP from proxy headers (Vercel sets x-forwarded-for). */
export function clientIp(headers: Headers): string {
  return (headers.get('x-forwarded-for') || 'unknown').split(',')[0].trim();
}

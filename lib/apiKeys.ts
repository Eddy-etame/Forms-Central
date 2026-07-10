import crypto from 'crypto';
import { supabase } from './supabase';
import { getPlan, type Plan } from './plans';

/**
 * API keys for programmatic + MCP access.
 * Raw keys look like "kef_<43 chars base64url>" and are shown ONCE at
 * creation. Only the SHA-256 hash is stored — a DB leak reveals nothing.
 */

export interface ApiKeyAuth {
  clientId: string;
  clientName: string;
  plan: Plan;
  keyId: string;
}

export function generateApiKey(): { raw: string; hash: string; prefix: string } {
  const raw = `kef_${crypto.randomBytes(32).toString('base64url')}`;
  return { raw, hash: hashApiKey(raw), prefix: raw.slice(0, 12) };
}

export function hashApiKey(raw: string): string {
  return crypto.createHash('sha256').update(raw).digest('hex');
}

/** Resolve a bearer token to its client, or null. Touches last_used_at. */
export async function verifyApiKey(bearer: string | null | undefined): Promise<ApiKeyAuth | null> {
  if (!bearer || !bearer.startsWith('kef_')) return null;

  const { data: key, error } = await supabase
    .from('api_keys')
    .select('id, client_id, revoked, clients(name, plan)')
    .eq('key_hash', hashApiKey(bearer))
    .maybeSingle();

  if (error || !key || key.revoked) return null;

  const client = key.clients as unknown as { name: string; plan?: string } | null;
  if (!client) return null;

  // Fire-and-forget usage timestamp.
  supabase.from('api_keys').update({ last_used_at: new Date().toISOString() }).eq('id', key.id)
    .then(() => {}, () => {});

  return {
    clientId: key.client_id,
    clientName: client.name,
    plan: getPlan(client.plan),
    keyId: key.id,
  };
}

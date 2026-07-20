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

  // Verify through the SECURITY DEFINER function (migration_v21), consistent
  // with the other auth paths. Falls back to a raw lookup until v21 is applied.
  type KeyRow = { id: string; client_id: string; revoked: boolean; client_name: string; client_plan?: string };
  let key: KeyRow | null = null;
  const rpc = await supabase.rpc('verify_api_key', { p_hash: hashApiKey(bearer) });
  const rows = rpc.data as unknown as KeyRow[] | null;
  if (!rpc.error && Array.isArray(rows)) {
    key = rows[0] ?? null;
  } else {
    const fb = await supabase
      .from('api_keys')
      .select('id, client_id, revoked, clients(name, plan)')
      .eq('key_hash', hashApiKey(bearer))
      .maybeSingle();
    if (fb.data) {
      const c = fb.data.clients as unknown as { name: string; plan?: string } | null;
      key = { id: fb.data.id, client_id: fb.data.client_id, revoked: fb.data.revoked, client_name: c?.name || '', client_plan: c?.plan };
    }
  }

  if (!key || key.revoked || !key.client_name) return null;

  // Fire-and-forget usage timestamp.
  supabase.from('api_keys').update({ last_used_at: new Date().toISOString() }).eq('id', key.id)
    .then(() => {}, () => {});

  return {
    clientId: key.client_id,
    clientName: key.client_name,
    plan: getPlan(key.client_plan),
    keyId: key.id,
  };
}

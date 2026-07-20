-- ============================================================================
-- V21 — API-key verification through a function (completes auth mediation).
-- The MCP/API auth path resolved a bearer token by raw table lookup. Route it
-- through one SECURITY DEFINER function instead, consistent with v19/v20.
-- (The key itself is never stored — only its sha256 hash — so this returns no
-- secret; it's mediated for consistency + least privilege.)
-- Run in the Supabase SQL editor. Idempotent.
-- ============================================================================

create or replace function verify_api_key(p_hash text)
  returns table (id uuid, client_id uuid, revoked boolean, client_name text, client_plan text)
  language sql security definer set search_path = public as $$
  select k.id, k.client_id, k.revoked, c.name, c.plan
  from api_keys k
  join clients c on c.id = k.client_id
  where k.key_hash = p_hash
  limit 1;
$$;

revoke all on function verify_api_key(text) from public, anon, authenticated;
grant execute on function verify_api_key(text) to service_role;

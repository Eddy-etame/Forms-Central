-- ============================================================================
-- V17 — Outbound webhooks.
-- A form can POST every stored submission to its owner's endpoint, signed
-- Stripe-style (HMAC-SHA256 over "<timestamp>.<body>") so receivers can
-- verify authenticity and reject replays. Delivery is fire-and-forget with
-- one retry; failures land in failures_log (visible on /admin/logs).
-- Run in the Supabase SQL editor.
-- ============================================================================

ALTER TABLE forms   ADD COLUMN IF NOT EXISTS webhook_url TEXT;      -- https endpoint, NULL = disabled
ALTER TABLE clients ADD COLUMN IF NOT EXISTS webhook_secret TEXT;   -- per-client signing secret (generated on first delivery)

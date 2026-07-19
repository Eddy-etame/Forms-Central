-- ============================================================================
-- V18 — Prevent duplicate client emails (case-insensitive).
-- The login looks up the account with .single(), which errors on >1 row and
-- surfaces as a misleading "Unknown account". A unique index makes duplicates
-- impossible at the source (signup race, atelier auto-provision, imports).
-- Run in the Supabase SQL editor. If it fails, there are already duplicates —
-- de-dupe first (keep the oldest row per email), then re-run.
-- ============================================================================

CREATE UNIQUE INDEX IF NOT EXISTS clients_email_lower_unique
  ON clients (lower(email));

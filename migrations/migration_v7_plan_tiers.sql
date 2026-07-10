-- ============================================================================
-- V7 — Four plan tiers: free | solo | pro | max.
-- Run in the Supabase SQL editor (after v5).
-- ============================================================================

ALTER TABLE clients DROP CONSTRAINT IF EXISTS clients_plan_check;
ALTER TABLE clients
  ADD CONSTRAINT clients_plan_check CHECK (plan IN ('free', 'solo', 'pro', 'max'));

-- ============================================================================
-- V5 — Subscriptions + AI assistant usage.
-- Run in the Supabase SQL editor after previous migrations.
-- ============================================================================

-- Plan on each client (tenant). 'free' | 'pro'. Payment wiring can flip this
-- flag later (Stripe webhook, manual upgrade, etc.).
ALTER TABLE clients
  ADD COLUMN IF NOT EXISTS plan TEXT NOT NULL DEFAULT 'free'
    CHECK (plan IN ('free', 'pro')),
  ADD COLUMN IF NOT EXISTS plan_updated_at TIMESTAMPTZ;

-- AI usage log: quota enforcement + abuse forensics + cost telemetry.
CREATE TABLE IF NOT EXISTS ai_messages (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL, -- null = anonymous visitor
    anon_id TEXT,                -- signed anonymous visitor id (cookie)
    ip TEXT,
    provider TEXT,               -- gemini_3 / groq / mistral (which one answered)
    ok BOOLEAN NOT NULL DEFAULT TRUE,
    latency_ms INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS ai_messages_client_idx ON ai_messages (client_id, created_at);
CREATE INDEX IF NOT EXISTS ai_messages_anon_idx ON ai_messages (anon_id, created_at);

-- ============================================================================
-- V8 — Email send log (quota enforcement + deliverability telemetry).
-- Run in the Supabase SQL editor.
-- ============================================================================

CREATE TABLE IF NOT EXISTS email_log (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    form_id UUID REFERENCES forms(id) ON DELETE SET NULL,
    kind TEXT NOT NULL CHECK (kind IN ('lead', 'auto_reply')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS email_log_client_day_idx ON email_log (client_id, created_at);

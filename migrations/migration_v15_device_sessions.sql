-- ============================================================================
-- V15 — Device/session limits (anti subscription-sharing).
-- Every client sign-in registers a session (one per device). A client may
-- hold at most N active sessions; signing in on an extra device evicts the
-- OLDEST session, which is signed out on its next page load. Sharing one
-- account across a team therefore keeps kicking the earliest device off.
-- Run in the Supabase SQL editor.
-- ============================================================================

CREATE TABLE IF NOT EXISTS client_sessions (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id  UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    ip         TEXT,
    user_agent TEXT,
    revoked    BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_seen  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS client_sessions_client_idx  ON client_sessions (client_id, revoked, created_at);
CREATE INDEX IF NOT EXISTS client_sessions_created_idx ON client_sessions (created_at DESC);

-- Server-only (service role bypasses RLS).
ALTER TABLE client_sessions ENABLE ROW LEVEL SECURITY;

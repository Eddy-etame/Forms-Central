-- ============================================================================
-- V12 — Security audit trail (super-admin only).
-- A persistent record of security-relevant events: admin/client login
-- success & failure, rate-limit blocks, password-reset requests. Lets the
-- owner see brute-force attempts and account takeovers as they happen.
-- Run in the Supabase SQL editor.
-- ============================================================================

CREATE TABLE IF NOT EXISTS security_events (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    event_type TEXT NOT NULL,               -- e.g. ADMIN_LOGIN_FAILED, CLIENT_LOGIN_OK, RATE_LIMIT_BLOCK
    severity   TEXT NOT NULL DEFAULT 'info', -- 'info' | 'warn' | 'critical'
    actor      TEXT,                          -- email / 'admin' / null
    ip         TEXT,                          -- source IP (operational security data; owner-only)
    detail     TEXT,                          -- human-readable summary
    meta       JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS security_events_created_idx  ON security_events (created_at DESC);
CREATE INDEX IF NOT EXISTS security_events_type_idx     ON security_events (event_type);
CREATE INDEX IF NOT EXISTS security_events_severity_idx ON security_events (severity);
CREATE INDEX IF NOT EXISTS security_events_ip_idx       ON security_events (ip);

-- Lock the table down: only the service-role key (server) may touch it.
-- With RLS enabled and no policy, anon/authenticated clients get nothing;
-- the server's service-role client bypasses RLS as intended.
ALTER TABLE security_events ENABLE ROW LEVEL SECURITY;

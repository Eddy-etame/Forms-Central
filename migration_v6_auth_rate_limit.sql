-- ============================================================================
-- V6 — Auth rate limiting (brute-force protection).
-- Run in the Supabase SQL editor.
-- ============================================================================

CREATE TABLE IF NOT EXISTS auth_attempts (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    key TEXT NOT NULL,               -- e.g. "login:1.2.3.4:user@mail.com"
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS auth_attempts_key_idx ON auth_attempts (key, created_at);

-- Optional: purge rows older than a day on a schedule, or let the app's
-- opportunistic cleanup handle it.

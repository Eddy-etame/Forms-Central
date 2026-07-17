-- ============================================================================
-- V14 — Two-factor authentication (email OTP).
-- After a correct password, an account with 2FA enabled must also enter a
-- 6-digit code emailed to them. Codes are stored hashed, single-use, expire
-- in 10 minutes, and lock after 5 wrong attempts.
-- Run in the Supabase SQL editor.
-- ============================================================================

-- Opt-in flag per client (owner-managed for now; self-serve later).
ALTER TABLE clients ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN NOT NULL DEFAULT FALSE;

CREATE TABLE IF NOT EXISTS email_otps (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject_type TEXT NOT NULL,               -- 'admin' | 'client'
    subject_id   TEXT NOT NULL,               -- client id, or 'admin'
    purpose      TEXT NOT NULL DEFAULT 'login_2fa',
    code_hash    TEXT NOT NULL,               -- sha256(subject_id:code:pepper)
    expires_at   TIMESTAMPTZ NOT NULL,
    consumed     BOOLEAN NOT NULL DEFAULT FALSE,
    attempts     INT NOT NULL DEFAULT 0,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS email_otps_subject_idx ON email_otps (subject_type, subject_id);
CREATE INDEX IF NOT EXISTS email_otps_created_idx ON email_otps (created_at DESC);

-- Server-only (service role bypasses RLS; anon/authenticated get nothing).
ALTER TABLE email_otps ENABLE ROW LEVEL SECURITY;

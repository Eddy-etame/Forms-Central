-- ============================================================================
-- V11 — First-party traffic analytics (owner/super-admin only).
-- Privacy-conscious: no raw IP is ever stored (only a salted SHA-256 hash),
-- no third-party trackers. Run in the Supabase SQL editor.
-- ============================================================================

CREATE TABLE IF NOT EXISTS pageviews (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    path TEXT NOT NULL,
    referrer TEXT,
    session_id TEXT NOT NULL,   -- opaque random id in an httpOnly cookie
    ip_hash TEXT,               -- sha256(ip + secret) — never the raw IP
    device TEXT,                -- 'mobile' | 'desktop' | 'bot'
    browser TEXT,               -- coarse family (Chrome/Safari/Firefox/…)
    country TEXT,               -- from CDN geo header when available
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS pageviews_created_idx ON pageviews (created_at DESC);
CREATE INDEX IF NOT EXISTS pageviews_session_idx ON pageviews (session_id);
CREATE INDEX IF NOT EXISTS pageviews_path_idx ON pageviews (path);

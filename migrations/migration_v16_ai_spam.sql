-- ============================================================================
-- V16 — AI spam classification on submissions.
-- Every stored lead gets an async AI verdict: clean | suspect | spam.
-- Leads are ALWAYS stored regardless of verdict (the classifier only labels,
-- never deletes) — clients filter the noise instead of losing data.
-- Run in the Supabase SQL editor.
-- ============================================================================

ALTER TABLE submissions ADD COLUMN IF NOT EXISTS spam_status TEXT;   -- 'clean' | 'suspect' | 'spam' | NULL (unclassified)
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS spam_reason TEXT;   -- one-line model explanation

CREATE INDEX IF NOT EXISTS submissions_spam_idx ON submissions (spam_status);

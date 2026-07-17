-- ============================================================================
-- V13 — Custom email identity for paid clients.
-- Lets a paying client (e.g. "Shu") have their brand on the confirmation
-- emails their end-customers receive:
--   • sender_name     — display name shown as the From ("Shu")
--   • reply_to_email  — where replies go (contact@shu.com)
-- These work WITHOUT a verified domain. A true custom From address
-- (From: contact@shu.com) additionally requires verifying the client's
-- domain at the email provider — wired later, once a domain exists.
-- Run in the Supabase SQL editor.
-- ============================================================================

ALTER TABLE clients ADD COLUMN IF NOT EXISTS sender_name    TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS reply_to_email TEXT;

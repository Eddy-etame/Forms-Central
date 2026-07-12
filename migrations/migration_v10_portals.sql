-- ============================================================================
-- V10 — Client portals (developer -> end-client read-only lead access).
-- Run in the Supabase SQL editor.
--
-- Model: a developer (row in `clients`) creates end-clients (`portal_users`).
-- Each form may be assigned to one end-client via forms.portal_user_id.
-- End-clients log in at /portal and see ONLY their assigned forms' leads.
-- ============================================================================

CREATE TABLE IF NOT EXISTS portal_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,          -- global unique: email is the login identity
    encrypted_password TEXT NOT NULL,    -- scrypt hash (lib/passwords)
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS portal_users_parent_idx ON portal_users (parent_client_id);

-- A form can be surfaced to one end-client (or none).
ALTER TABLE forms
  ADD COLUMN IF NOT EXISTS portal_user_id UUID REFERENCES portal_users(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS forms_portal_user_idx ON forms (portal_user_id);

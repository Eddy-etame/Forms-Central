-- Migration V4: Adds secure encrypted password storage for clients

ALTER TABLE clients
ADD COLUMN IF NOT EXISTS encrypted_password TEXT,
ADD COLUMN IF NOT EXISTS reset_token TEXT,
ADD COLUMN IF NOT EXISTS reset_token_expires TIMESTAMPTZ;

-- Add an index for the reset token
CREATE INDEX IF NOT EXISTS idx_clients_reset_token ON clients(reset_token);

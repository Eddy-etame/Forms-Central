import { supabase } from './supabase';

/**
 * Security audit trail (migrations/migration_v12). Every write is
 * fire-and-forget: it must never throw and never block the auth path — a
 * failing audit log must not take down login. Surfaces on /admin/security.
 */

export type SecuritySeverity = 'info' | 'warn' | 'critical';

/** Canonical event types so the admin filter/labels stay consistent. */
export const SEC = {
  ADMIN_LOGIN_OK: 'ADMIN_LOGIN_OK',
  ADMIN_LOGIN_FAILED: 'ADMIN_LOGIN_FAILED',
  CLIENT_LOGIN_OK: 'CLIENT_LOGIN_OK',
  CLIENT_LOGIN_FAILED: 'CLIENT_LOGIN_FAILED',
  PORTAL_LOGIN_FAILED: 'PORTAL_LOGIN_FAILED',
  RATE_LIMIT_BLOCK: 'RATE_LIMIT_BLOCK',
  PASSWORD_RESET_REQUEST: 'PASSWORD_RESET_REQUEST',
} as const;

export interface SecurityEventInput {
  type: string;
  severity?: SecuritySeverity;
  actor?: string | null;
  ip?: string | null;
  detail?: string;
  meta?: Record<string, unknown>;
}

export function logSecurityEvent(e: SecurityEventInput): void {
  supabase
    .from('security_events')
    .insert([
      {
        event_type: e.type,
        severity: e.severity || 'info',
        actor: e.actor ?? null,
        ip: e.ip ?? null,
        detail: (e.detail || '').slice(0, 500),
        meta: e.meta || {},
      },
    ])
    .then(() => {}, () => {});
}

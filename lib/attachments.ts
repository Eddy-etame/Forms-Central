/** Helpers for attachment values in a lead's payload. No imports: safe in the browser and testable alone. */

/**
 * The only names this server gives to a stored file: `<ms timestamp>-<16 hex>.<ext>`,
 * at the root of the bucket (see the submit route). A reference is resolved only
 * if its last segment is exactly such a name.
 *
 * Why so strict (2026-11-26): the reference used to be parsed loosely and its
 * path percent-decoded. A visitor could type a reference into any form field —
 * `…/uploads/..%2Fbackups%2F<file>` — and the account owning that lead could
 * then make the server fetch, or sign a link to, an object in ANOTHER bucket:
 * the daily database backup. Nothing is decoded any more; a name is matched as
 * written or not at all.
 */
export const ATTACHMENT_NAME_RE = /^\d{10,16}-[0-9a-f]{16}\.(?:jpg|png|pdf|webp|bin)$/;

// `public` is the form older rows hold; `authenticated` is what is written today. Nothing else is ever stored.
const REFERENCE_RE = /^https:\/\/([a-z0-9.-]+)\/storage\/v1\/object\/(?:public|authenticated)\/uploads\/([^/?#\\%]+)$/;

/** The object name behind a stored reference, or null. `host` pins the storage host when known (server side). */
export function attachmentName(value: unknown, host?: string): string | null {
  if (typeof value !== 'string' || value.length > 300) return null;
  const m = REFERENCE_RE.exec(value);
  if (!m) return null;
  if (host && m[1] !== host) return null;
  return ATTACHMENT_NAME_RE.test(m[2]) ? m[2] : null;
}

/** True for a stored attachment reference. */
export function isAttachmentValue(value: unknown): value is string {
  return attachmentName(value) !== null;
}

/** The session-checked download link the dashboard and the client inbox use. */
export function downloadHref(submissionId: string, field: string): string {
  return `/api/download?sid=${encodeURIComponent(submissionId)}&field=${encodeURIComponent(field)}`;
}

const STORAGE_LINK_RE = /https?:\/\/[^\s"'<>]*\/storage\/v1\/[^\s"'<>]*/gi;
export const REMOVED_LINK = '[storage link removed]';

/**
 * A visitor never has a reason to send a link into object storage, and a
 * reference must only ever exist because this server wrote it after storing a
 * file. Every such link in incoming text is replaced, at any depth.
 */
export function stripStorageLinks<T>(value: T): T {
  // replace() restarts a global pattern at 0 each time; test() would not
  if (typeof value === 'string') return value.replace(STORAGE_LINK_RE, REMOVED_LINK) as T;
  if (Array.isArray(value)) return value.map((v) => stripStorageLinks(v)) as T;
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value as Record<string, unknown>).map(([k, v]) => [k, stripStorageLinks(v)])) as T;
  }
  return value;
}

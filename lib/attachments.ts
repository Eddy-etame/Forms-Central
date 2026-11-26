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

/**
 * What a stored file is, decided by its first bytes — never by what the sender
 * says it is.
 *
 * A file arrives as `data:<type>;base64,…` and the type is whatever the
 * sender typed. Until 2026-11-26 that string chose the file's extension
 * (`text/html;x=jpeg` became a `.jpg`) and was stored as the object's content
 * type, which the download endpoint then repeated to the browser. A file now
 * gets one of the four known extensions only if its signature says so;
 * anything else is a `.bin`, served as opaque bytes.
 */
export type UploadKind = 'jpg' | 'png' | 'pdf' | 'webp' | 'bin';

export const UPLOAD_CONTENT_TYPE: Record<UploadKind, string> = {
  jpg: 'image/jpeg',
  png: 'image/png',
  pdf: 'application/pdf',
  webp: 'image/webp',
  bin: 'application/octet-stream',
};

const starts = (b: Uint8Array, sig: number[], at = 0) => b.length >= at + sig.length && sig.every((v, i) => b[at + i] === v);

export function sniffUpload(bytes: Uint8Array): UploadKind {
  if (starts(bytes, [0xff, 0xd8, 0xff])) return 'jpg';
  if (starts(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return 'png';
  if (starts(bytes, [0x52, 0x49, 0x46, 0x46]) && starts(bytes, [0x57, 0x45, 0x42, 0x50], 8)) return 'webp'; // RIFF….WEBP
  // %PDF- may be preceded by a few stray bytes (readers accept it within the first 1024).
  const limit = Math.min(bytes.length - 5, 1024);
  for (let i = 0; i <= limit; i++) {
    if (bytes[i] === 0x25 && starts(bytes, [0x25, 0x50, 0x44, 0x46, 0x2d], i)) {
      // …but never after markup: a page that merely contains "%PDF-" is not a PDF.
      for (let j = 0; j < i; j++) if (bytes[j] === 0x3c) return 'bin';
      return 'pdf';
    }
  }
  return 'bin';
}

/** The content type to answer with for a stored file, from its generated name alone. */
export function contentTypeForName(name: string): string {
  const ext = ATTACHMENT_NAME_RE.test(name) ? (name.slice(name.lastIndexOf('.') + 1) as UploadKind) : 'bin';
  return UPLOAD_CONTENT_TYPE[ext] ?? UPLOAD_CONTENT_TYPE.bin;
}

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

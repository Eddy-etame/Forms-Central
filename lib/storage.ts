import { supabase } from './supabase';

/**
 * Lead attachments live in the private `uploads` bucket. A lead's payload
 * stores the object's canonical reference — an `authenticated` storage URL —
 * which only this server can resolve: the dashboard and the client inbox read
 * files through /api/download (session-checked), webhooks receive a signed
 * link that expires, e-mails never carry a storage link at all.
 *
 * Older rows may still hold the former `public` URL form; every reader below
 * accepts both, so making the bucket private broke nothing.
 */
export const UPLOADS_BUCKET = 'uploads';
export const SIGNED_LINK_TTL_S = 7 * 24 * 3600; // webhooks: a week to fetch the file

const SUPABASE_HOST = (() => {
  try { return new URL(process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co').host; } catch { return ''; }
})();
const PATH_RE = /^\/storage\/v1\/object\/(?:public|authenticated|sign)\/uploads\/(.+)$/;

/** The reference stored in a payload for an object of the uploads bucket. */
export function attachmentUrl(path: string): string {
  return `https://${SUPABASE_HOST}/storage/v1/object/authenticated/${UPLOADS_BUCKET}/${path.split('/').map(encodeURIComponent).join('/')}`;
}

/** The object path behind a stored reference (public, authenticated or signed form), or null. */
export function attachmentPath(value: unknown): string | null {
  if (typeof value !== 'string' || !value.startsWith('http')) return null;
  try {
    const u = new URL(value);
    if (u.protocol !== 'https:' || u.host !== SUPABASE_HOST) return null;
    const m = u.pathname.match(PATH_RE);
    return m ? decodeURIComponent(m[1]) : null;
  } catch {
    return null;
  }
}

export const isAttachment = (value: unknown): boolean => attachmentPath(value) !== null;

/** A time-limited link anyone holding it can open (webhooks). */
export async function signedAttachmentUrl(path: string, expiresIn = SIGNED_LINK_TTL_S): Promise<string | null> {
  const { data, error } = await supabase.storage.from(UPLOADS_BUCKET).createSignedUrl(path, expiresIn);
  if (error || !data?.signedUrl) return null;
  return data.signedUrl;
}

/** The object itself, read with the service role (the bucket is private). */
export async function downloadAttachment(path: string): Promise<Blob | null> {
  const { data, error } = await supabase.storage.from(UPLOADS_BUCKET).download(path);
  return error || !data ? null : data;
}

/** A copy of the payload where every attachment reference became a signed link. */
export async function withSignedAttachments<T extends Record<string, unknown>>(payload: T, expiresIn = SIGNED_LINK_TTL_S): Promise<T> {
  const out: Record<string, unknown> = { ...payload };
  for (const [key, value] of Object.entries(payload)) {
    const path = attachmentPath(value);
    if (!path) continue;
    out[key] = (await signedAttachmentUrl(path, expiresIn)) ?? '[attachment]';
  }
  return out as T;
}

/** Client-safe helpers for attachment values in a lead's payload (no server imports). */

/** True for a stored attachment reference, in its public, authenticated or signed form. */
export function isAttachmentValue(value: unknown): value is string {
  return typeof value === 'string' && value.startsWith('http') && /\/storage\/v1\/object\/(public|authenticated|sign)\//.test(value);
}

/** The session-checked download link the dashboard and the client inbox use. */
export function downloadHref(submissionId: string, field: string): string {
  return `/api/download?sid=${encodeURIComponent(submissionId)}&field=${encodeURIComponent(field)}`;
}

/**
 * Download a file from one of our own endpoints (client side).
 * A plain link would navigate to a JSON error page when the session has
 * expired; this reports the failure to the caller instead.
 */
export async function downloadFile(url: string, fallbackName: string): Promise<{ ok: true } | { ok: false; status: number }> {
  const res = await fetch(url, { credentials: 'same-origin', cache: 'no-store' });
  if (!res.ok) return { ok: false, status: res.status };
  const name = /filename="([^"]+)"/.exec(res.headers.get('content-disposition') || '')?.[1] || fallbackName;
  const href = URL.createObjectURL(await res.blob());
  const a = document.createElement('a');
  a.href = href;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(href);
  return { ok: true };
}

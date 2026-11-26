/**
 * Content security policy — one place that says what a page may run.
 *
 * Pages (every route proxy.ts sees) get a nonce policy: a script runs only if
 * it carries the random value minted for this one request, or was loaded by a
 * script that does. Markup that reaches a page some other way — a lead's
 * text, a form name, a file name — is not a script the browser will run,
 * even if a rendering mistake one day lets it through as HTML.
 *
 * Everything the proxy does not see (API answers, static files, paths with a
 * dot) keeps the fixed policy, set in next.config.ts. The two never meet on
 * the same response: next.config.ts applies the fixed one only where the
 * proxy matcher does not reach.
 *
 * Styles keep 'unsafe-inline' on purpose: React writes style attributes
 * (bar widths, chart colours) and a nonce cannot cover an attribute.
 *
 * Pure module: no imports, so the proxy, next.config.ts and the unit tests
 * all read the same lines.
 */

export const NONCE_HEADER = 'x-nonce';

/** 128 random bits, base64. */
export function newNonce(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  let raw = '';
  for (const b of bytes) raw += String.fromCharCode(b);
  return btoa(raw);
}

/** A nonce as this module mints them, or nothing. Never echo a header as it came. */
export function cleanNonce(value: string | null | undefined): string | undefined {
  return typeof value === 'string' && /^[A-Za-z0-9+/]{22}==$/.test(value) ? value : undefined;
}

function policy(scriptSrc: string): string {
  return [
    "default-src 'self'",
    scriptSrc,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' https: data: blob:",
    "font-src 'self' data:",
    "connect-src 'self'",
    "frame-ancestors 'self'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
    'upgrade-insecure-requests',
  ].join('; ');
}

/**
 * The policy of a page. 'self' stays in the list for the rare browser that
 * does not know 'strict-dynamic'; the ones that do ignore it and ask every
 * script for the nonce. Development adds 'unsafe-eval': the dev toolchain
 * evaluates code for fast refresh, production never does.
 */
export function pageCsp(nonce: string, dev = false): string {
  return policy(`script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${dev ? " 'unsafe-eval'" : ''}`);
}

/**
 * The policy of everything that is not a page. The no-JavaScript answers of
 * the submit endpoint carry a "back" link that needs inline script; nothing
 * else under it renders as a document.
 */
export function staticCsp(dev = false): string {
  return policy(`script-src 'self' 'unsafe-inline'${dev ? " 'unsafe-eval'" : ''}`);
}

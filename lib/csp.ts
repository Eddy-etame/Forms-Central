/**
 * Content security policy — one place that says what a page may run.
 *
 * Pages (every route proxy.ts sees) get a nonce policy: a script runs only if
 * it carries the random value minted for this one request, or was loaded by a
 * script that does. Markup that reaches a page some other way — a lead's
 * text, a form name, a file name — is not a script the browser will run,
 * even if a rendering mistake one day lets it through as HTML.
 *
 * What the proxy does not see gets a policy by kind, set in next.config.ts on
 * patterns that never overlap the proxy's or each other's:
 *   - an API answer is data: nothing may load, run or be framed (API_CSP);
 *   - a file handed back by /api/download is a stranger's bytes: the same,
 *     in a sandbox (FILE_CSP);
 *   - the submit endpoint also answers plain HTML to a form posted without
 *     JavaScript: its own inline style, one script file of this site, nothing
 *     else (FORM_ANSWER_CSP);
 *   - static files and the not-found page of a path with a dot keep the fixed
 *     policy (staticCsp): nothing there repeats what a visitor sent.
 *
 * Styles: a <style> element needs the nonce like a script does, so markup
 * that slips into a page cannot restyle it or read it through selectors.
 * Style *attributes* stay allowed: React writes them (bar widths, chart
 * colours) and a nonce cannot cover an attribute.
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

function policy(scriptSrc: string, styleSrc: string[] = ["style-src 'self' 'unsafe-inline'"]): string {
  return [
    "default-src 'self'",
    scriptSrc,
    ...styleSrc,
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
  return policy(`script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${dev ? " 'unsafe-eval'" : ''}`, [
    // The first line is what a browser without the -elem/-attr split falls back to.
    "style-src 'self' 'unsafe-inline'",
    // Development injects its own <style> elements (fast refresh, the error overlay) without a nonce.
    dev ? "style-src-elem 'self' 'unsafe-inline'" : `style-src-elem 'self' 'nonce-${nonce}'`,
    "style-src-attr 'unsafe-inline'",
  ]);
}

/**
 * The fixed policy: static files, and the two kinds of document found at a
 * path with a dot — the not-found page (rendered without a nonce, so its
 * inline scripts need 'unsafe-inline') and the browser preview of the agent
 * docs. Neither repeats anything a visitor sent.
 */
export function staticCsp(dev = false): string {
  return policy(`script-src 'self' 'unsafe-inline'${dev ? " 'unsafe-eval'" : ''}`);
}

const INERT = "frame-ancestors 'none'; base-uri 'none'; form-action 'none'";

/** An API answer is data. Rendered as a document by mistake, it loads nothing and runs nothing. */
export const API_CSP = `default-src 'none'; ${INERT}`;

/** A file from a stranger, handed back by /api/download: the same, and sandboxed. */
export const FILE_CSP = `default-src 'none'; sandbox; ${INERT}`;

/**
 * The plain HTML the submit endpoint answers to a form posted without
 * JavaScript: its own inline style and the one script file behind the "back"
 * link (public/form-back.js). No inline script: the page repeats a server
 * message, and must stay unable to run anything a message might carry.
 */
export const FORM_ANSWER_CSP = `default-src 'none'; style-src 'unsafe-inline'; script-src 'self'; ${INERT}`;

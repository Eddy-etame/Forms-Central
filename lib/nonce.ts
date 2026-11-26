import { headers } from 'next/headers';
import { NONCE_HEADER, cleanNonce } from './csp';

/**
 * This request's script nonce, minted by proxy.ts. Every inline script a
 * layout writes itself must carry it; the framework stamps its own.
 * Undefined where the proxy does not run (the fixed policy applies there).
 */
export async function getNonce(): Promise<string | undefined> {
  return cleanNonce((await headers()).get(NONCE_HEADER));
}

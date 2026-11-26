/**
 * Homemade JWT implementation using the Web Crypto API.
 * This runs natively in any environment (including Edge Middleware / Node.js 18+)
 * and does not rely on heavy dependencies like jsonwebtoken or jose.
 */

// Helper: base64url encoding
function base64urlEncode(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

// Helper: base64url decoding to raw bytes (prevents UTF-8 corruption on binary signatures)
function base64urlDecodeToBytes(str: string): Uint8Array {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

// Helper: base64url decoding to string (for JSON headers and payloads)
function base64urlDecode(str: string): string {
  const bytes = base64urlDecodeToBytes(str);
  return new TextDecoder().decode(bytes);
}

// Get crypto key for HMAC-SHA256 signature
async function getCryptoKey(secret: string): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  return crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

export interface JWTPayload {
  sub: string; // Subject (e.g. 'admin')
  exp: number; // Expiration timestamp in seconds
  iat: number; // Issued at timestamp in seconds
  [key: string]: unknown;
}

/**
 * Sign a payload and return a base64url JWT token.
 */
export async function signJWT(payload: JWTPayload, secret: string): Promise<string> {
  const header = { alg: 'HS256', typ: 'JWT' };
  const encodedHeader = base64urlEncode(JSON.stringify(header));
  const encodedPayload = base64urlEncode(JSON.stringify(payload));
  
  const tokenInput = `${encodedHeader}.${encodedPayload}`;
  const cryptoKey = await getCryptoKey(secret);
  const signatureBuffer = await crypto.subtle.sign(
    'HMAC',
    cryptoKey,
    new TextEncoder().encode(tokenInput)
  );
  
  // Convert signature buffer directly to base64url (safely treating as binary)
  const signatureBytes = new Uint8Array(signatureBuffer);
  let binary = '';
  for (let i = 0; i < signatureBytes.byteLength; i++) {
    binary += String.fromCharCode(signatureBytes[i]);
  }
  const encodedSignature = btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
    
  return `${tokenInput}.${encodedSignature}`;
}

/**
 * Verify a base64url JWT token and return its payload.
 * Returns null if the token signature is invalid or if the token is expired.
 */
export async function verifyJWT(token: string, secret: string): Promise<JWTPayload | null> {
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  
  const [header, payload, signature] = parts;
  const tokenInput = `${header}.${payload}`;
  
  try {
    const cryptoKey = await getCryptoKey(secret);
    
    // Decode base64url signature directly to raw binary bytes to prevent corruption
    const signatureBytes = base64urlDecodeToBytes(signature);
    
    // Verify the HMAC signature
    const isValid = await crypto.subtle.verify(
      'HMAC',
      cryptoKey,
      signatureBytes as BufferSource,
      new TextEncoder().encode(tokenInput)
    );
    
    if (!isValid) return null;
    
    // Parse and validate payload expiration
    const parsedPayload = JSON.parse(base64urlDecode(payload)) as JWTPayload;
    const currentTimestamp = Math.floor(Date.now() / 1000);
    
    // A token without a numeric expiry is not one this server signs: refuse it
    // rather than treat it as valid for ever.
    if (!parsedPayload || typeof parsedPayload !== 'object' || typeof parsedPayload.exp !== 'number' || parsedPayload.exp < currentTimestamp) {
      return null;
    }
    
    return parsedPayload;
  } catch {
    // A malformed token is simply not a session. Nothing is logged: anyone can
    // send garbage in a cookie, and a log line per request is a way to fill logs.
    return null;
  }
}

/**
 * What a verified payload may be used for.
 *
 * Every token is signed with the same secret, so the payload itself has to say
 * what it is. Until 2026-11-26 the operator's seven-day REFRESH token (which
 * carries `sub: 'admin'`) was accepted wherever an access token was expected:
 * signing out, or the fifteen-minute access lifetime, protected nothing against
 * someone holding an old refresh token. A token carrying `token_id` is a
 * refresh token and nothing else.
 */
export function isAdminAccess(payload: JWTPayload | null): boolean {
  return !!payload && payload.sub === 'admin' && !payload.token_id && (payload.use === undefined || payload.use === 'access');
}

/** True when a token issued at `iat` (seconds) predates an account's cut-off (`sessions_valid_after`). */
export function issuedBefore(iat: unknown, validAfter: string | null | undefined): boolean {
  if (!validAfter) return false;
  const cut = Math.floor(new Date(validAfter).getTime() / 1000);
  if (!Number.isFinite(cut)) return false;
  return typeof iat !== 'number' || iat < cut;
}

export function isAdminRefresh(payload: JWTPayload | null): payload is JWTPayload & { token_id: string } {
  return !!payload && payload.sub === 'admin' && typeof payload.token_id === 'string' && (payload.use === undefined || payload.use === 'refresh');
}

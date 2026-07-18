import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyJWT } from '@/lib/jwt';
import { isBlacklisted } from '@/lib/blacklist';

const JWT_SECRET = process.env.JWT_SECRET;

// Suspicious scraper user agents keywords
const BOT_USER_AGENTS = [
  'curl', 'wget', 'python', 'scrapy', 'headless', 'puppeteer', 'playwright',
  'selenium', 'httpclient', 'libwww', 'axios', 'postman', 'insomnia',
  'scraper', 'crawler', 'spider', 'got', 'node-fetch', 'superagent'
];

/**
 * Indistinguishable 404: rewrite to a path that doesn't exist, so Next
 * renders the SAME branded not-found page (same body, same headers, same
 * render cost) as any genuinely missing route. A bare `new NextResponse
 * ('Not Found', 404)` — or a 404 that sets cookies — is a fingerprint that
 * tells an attacker the route exists but is guarded.
 */
function hidden404(request: NextRequest) {
  return NextResponse.rewrite(new URL('/__no-such-route__', request.url));
}

export async function proxy(request: NextRequest) {
  const url = request.nextUrl.clone();

  // 1. Scraper Block by User-Agent
  const userAgent = (request.headers.get('user-agent') || '').toLowerCase();
  const isSuspiciousAgent = BOT_USER_AGENTS.some(bot => userAgent.includes(bot));

  if (isSuspiciousAgent) {
    return hidden404(request);
  }

  // 2. IP Blacklist check at routing level
  const forwardedFor = request.headers.get('x-forwarded-for');
  const ipAddress = forwardedFor ? forwardedFor.split(',')[0].trim() : '127.0.0.1';

  if (await isBlacklisted(ipAddress)) {
    return hidden404(request);
  }

  // 3. Admin Area Guard (/admin/*)
  if (url.pathname.startsWith('/admin')) {
    if (!JWT_SECRET) {
      // Configuration error — obfuscate identically
      return hidden404(request);
    }

    const accessToken = request.cookies.get('access_token')?.value;

    if (!accessToken) {
      // Check if it's a client-side prefetch request. Return 204 to prevent red console errors.
      const isPrefetch =
        request.headers.get('x-middleware-prefetch') === '1' ||
        request.headers.get('next-router-prefetch') === '1' ||
        request.headers.get('purpose') === 'prefetch';

      if (isPrefetch) {
        return new NextResponse(null, { status: 204 });
      }

      // If refresh token exists, redirect to login page (login will refresh it or verify password)
      const refreshToken = request.cookies.get('refresh_token')?.value;
      if (refreshToken) {
        url.pathname = '/login';
        return NextResponse.redirect(url);
      }

      // No session: serve the identical branded 404 every missing route gets
      return hidden404(request);
    }

    // Verify JWT access token (HMAC verify via WebCrypto — constant-time)
    const payload = await verifyJWT(accessToken, JWT_SECRET);
    if (!payload || payload.sub !== 'admin') {
      // Check if prefetch to prevent console errors
      const isPrefetch =
        request.headers.get('x-middleware-prefetch') === '1' ||
        request.headers.get('next-router-prefetch') === '1' ||
        request.headers.get('purpose') === 'prefetch';

      if (isPrefetch) {
        return new NextResponse(null, { status: 204 });
      }

      // Invalid/expired token: DO NOT clear cookies here — Set-Cookie on a
      // "404" would reveal the route is special. The dead token just expires.
      return hidden404(request);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/auth/refresh'],
};

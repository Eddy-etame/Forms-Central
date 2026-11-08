import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyJWT } from '@/lib/jwt';
import { isBlacklisted } from '@/lib/blacklist';

const JWT_SECRET = process.env.JWT_SECRET;
const LOCALE_COOKIE = 'inlet-locale'; // mirrors lib/i18n (which imports next/headers and cannot run here)
const LANG_HEADER = 'x-inlet-lang';

// Suspicious scraper user agents keywords (admin area only)
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

function isPrefetch(request: NextRequest) {
  return (
    request.headers.get('x-middleware-prefetch') === '1' ||
    request.headers.get('next-router-prefetch') === '1' ||
    request.headers.get('purpose') === 'prefetch'
  );
}

/** /admin and the refresh endpoint: scraper block, IP blacklist, session guard. */
async function guardAdmin(request: NextRequest) {
  const url = request.nextUrl.clone();

  const userAgent = (request.headers.get('user-agent') || '').toLowerCase();
  if (BOT_USER_AGENTS.some((bot) => userAgent.includes(bot))) return hidden404(request);

  const forwardedFor = request.headers.get('x-forwarded-for');
  const ipAddress = forwardedFor ? forwardedFor.split(',')[0].trim() : '127.0.0.1';
  if (await isBlacklisted(ipAddress)) return hidden404(request);

  if (url.pathname.startsWith('/admin')) {
    if (!JWT_SECRET) return hidden404(request);

    const accessToken = request.cookies.get('access_token')?.value;
    if (!accessToken) {
      if (isPrefetch(request)) return new NextResponse(null, { status: 204 });
      // A refresh token means a real session that expired: send it to the login page.
      if (request.cookies.get('refresh_token')?.value) {
        url.pathname = '/login';
        return NextResponse.redirect(url);
      }
      return hidden404(request);
    }

    // Verify JWT access token (HMAC verify via WebCrypto — constant-time)
    const payload = await verifyJWT(accessToken, JWT_SECRET);
    if (!payload || payload.sub !== 'admin') {
      if (isPrefetch(request)) return new NextResponse(null, { status: 204 });
      // Invalid/expired token: DO NOT clear cookies here — Set-Cookie on a
      // "404" would reveal the route is special. The dead token just expires.
      return hidden404(request);
    }
  }

  return NextResponse.next();
}

/**
 * Pages: relay `?lang=en|fr` to the server as a request header so getLocale()
 * — and with it <html lang>, the nav and every client component — follows the
 * URL, not only the cookie or the visitor's country. The choice is also stored
 * in the locale cookie, exactly as the FR/EN toggle does, so the next click
 * stays in that language. The header is never accepted from the outside.
 */
function withLanguageHint(request: NextRequest) {
  const lang = request.nextUrl.searchParams.get('lang');
  const headers = new Headers(request.headers);
  headers.delete(LANG_HEADER);
  if (lang !== 'en' && lang !== 'fr') {
    return request.headers.has(LANG_HEADER) ? NextResponse.next({ request: { headers } }) : NextResponse.next();
  }
  headers.set(LANG_HEADER, lang);
  const res = NextResponse.next({ request: { headers } });
  if (request.cookies.get(LOCALE_COOKIE)?.value !== lang) {
    res.cookies.set(LOCALE_COOKIE, lang, { path: '/', maxAge: 60 * 60 * 24 * 365, sameSite: 'lax' });
  }
  return res;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname.startsWith('/admin') || pathname.startsWith('/api/auth/refresh')) return guardAdmin(request);
  return withLanguageHint(request);
}

export const config = {
  // Admin + refresh (guarded) and every page route (language hint); static files and the API stay out.
  matcher: ['/admin/:path*', '/api/auth/refresh', '/((?!api/|_next/|.*\\..*).*)'],
};

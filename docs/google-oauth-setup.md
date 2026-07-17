# Google sign-in — setup (5 minutes)

The flow is already built and dormant. It activates the moment these env vars
exist. No code changes needed.

## 1. Create OAuth credentials

1. Go to <https://console.cloud.google.com/apis/credentials> (create a project if needed).
2. **Configure consent screen** → External → add app name, your support email, and the
   `.../auth/userinfo.email` + `openid` scopes. Add yourself as a test user while unpublished.
3. **Create credentials → OAuth client ID → Web application.**
4. Under **Authorized redirect URIs**, add EXACTLY (must match, no trailing slash):
   - Production: `https://forms-central-h1ee.vercel.app/api/auth/google/callback`
   - Local dev: `http://localhost:3000/api/auth/google/callback`
5. Copy the **Client ID** and **Client secret**.

## 2. Set environment variables

In Vercel (Project → Settings → Environment Variables) and in local `.env.local`:

```bash
GOOGLE_CLIENT_ID=xxxxxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxxxxxxx
# Makes the "Continue with Google" button appear (client-visible flag):
NEXT_PUBLIC_GOOGLE_ENABLED=true
# Optional — only if you want to force a specific callback URL:
# GOOGLE_REDIRECT_URI=https://your-custom-domain.com/api/auth/google/callback
```

Redeploy. The button now shows on the client login & signup pages.

## How it works / security notes

- Full-page redirect (no popup) → CSRF-protected via a short-lived `state` cookie.
- Only **verified** Google emails are accepted.
- First Google sign-in auto-creates the client (random recoverable password);
  later sign-ins match by email.
- Google is treated as the second factor, so app-level 2FA is skipped on this path.
- When you move to a custom domain, add that domain's `.../callback` URL to the
  Authorized redirect URIs (and update `GOOGLE_REDIRECT_URI` if you set it).

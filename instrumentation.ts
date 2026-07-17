/**
 * Next.js instrumentation hook — runs once when the server starts.
 * We use it to fail-fast on insecure configuration in production (see
 * lib/securityConfig.ts). This must never throw during `next build` (the
 * build intentionally uses placeholder secrets), so we skip the build phase
 * and only run in the Node.js runtime.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return;
  if (process.env.NEXT_PHASE === 'phase-production-build') return;

  const { enforceSecurityConfig } = await import('./lib/securityConfig');
  enforceSecurityConfig();
}

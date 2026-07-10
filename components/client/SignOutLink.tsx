'use client';

/** Sign-out that actually destroys the session before navigating. */
export default function SignOutLink({ className }: { className?: string }) {
  return (
    <button
      onClick={async () => {
        try { await fetch('/api/auth/logout', { method: 'POST' }); } catch {}
        window.location.href = '/client/login';
      }}
      className={className}
    >
      Sign out
    </button>
  );
}

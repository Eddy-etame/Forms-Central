'use client';

/** Sign-out that actually destroys the session before navigating. */
export default function SignOutLink({
  className,
  redirectTo = '/client/login',
  label = 'Sign out',
}: {
  className?: string;
  redirectTo?: string;
  label?: string;
}) {
  return (
    <button
      onClick={async () => {
        try { await fetch('/api/auth/logout', { method: 'POST' }); } catch {}
        window.location.href = redirectTo;
      }}
      className={className}
    >
      {label}
    </button>
  );
}

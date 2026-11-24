import { after } from 'next/server';

/**
 * Work the response must not wait for, but that must still finish:
 * notification e-mails, webhooks, log rows.
 *
 * On a serverless host the function is suspended as soon as the response is
 * sent, so a bare promise ("fire-and-forget") is silently dropped. That is how
 * every lead notification was lost between 2026-11-07 and 2026-11-24: the
 * leads were stored, the e-mails never left, and the failure log — also
 * fire-and-forget — stayed empty. `after()` keeps the invocation alive until
 * the task settles (within the route's maxDuration).
 *
 * The task starts immediately; only its completion is deferred. Outside a
 * request scope (a script, a unit test) there is nothing to keep alive and the
 * promise simply runs.
 */
export function background(task: Promise<unknown> | (() => unknown)): void {
  const started = typeof task === 'function' ? Promise.resolve().then(task) : task;
  const guarded = started.catch((err) => {
    console.error('[background]', (err as Error)?.message || err);
  });
  try {
    after(guarded);
  } catch {
    /* no request scope: the promise still runs to completion on its own */
  }
}

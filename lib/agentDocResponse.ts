/**
 * Serve an agent-facing markdown doc two ways from one URL:
 *  - machines (curl, AI agents, anything not asking for HTML) get raw
 *    `text/markdown` — unchanged, copy/paste- and fetch-ready;
 *  - a real browser (Accept: text/html) gets a styled, readable preview with a
 *    copy button and a "view raw" link.
 * `?raw` forces raw for anyone. `Vary: Accept` keeps caches from crossing them.
 */
function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export function serveAgentDoc(markdown: string, filename: string, req: Request): Response {
  const url = new URL(req.url);
  const accept = req.headers.get('accept') || '';
  const wantsRaw = url.searchParams.has('raw') || !accept.includes('text/html');

  if (wantsRaw) {
    return new Response(markdown, {
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
        'Cache-Control': 'public, max-age=3600',
        Vary: 'Accept',
      },
    });
  }

  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>${filename} · Inlet</title>
<style>
  :root { color-scheme: dark; }
  * { box-sizing: border-box; }
  body { margin: 0; background: #020617; color: #e2e8f0;
    font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; }
  .wrap { max-width: 900px; margin: 0 auto; padding: 32px 20px 64px; }
  header { display: flex; align-items: center; gap: 12px; flex-wrap: wrap;
    padding-bottom: 18px; margin-bottom: 22px; border-bottom: 1px solid #1e293b; }
  .badge { display: inline-flex; align-items: center; justify-content: center;
    width: 34px; height: 34px; border-radius: 9px;
    background: linear-gradient(135deg, #2563eb, #7c3aed); color: #fff; font-weight: 800; }
  .brand { font-weight: 700; letter-spacing: -0.01em; }
  .file { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 13px; color: #94a3b8; }
  .spacer { flex: 1; }
  .actions { display: flex; gap: 8px; }
  a.btn, button.btn { font: inherit; font-size: 13px; font-weight: 600; cursor: pointer;
    border: 1px solid #334155; background: #0f172a; color: #cbd5e1; text-decoration: none;
    padding: 7px 13px; border-radius: 999px; transition: all .2s; }
  a.btn:hover, button.btn:hover { border-color: #475569; color: #fff; }
  .note { font-size: 12.5px; color: #64748b; margin: 0 0 18px; line-height: 1.6; }
  pre { margin: 0; padding: 22px; border-radius: 16px; border: 1px solid #1e293b;
    background: #0b1220; overflow-x: auto;
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 13px;
    line-height: 1.72; color: #cbd5e1; white-space: pre; tab-size: 2; }
  @media (max-width: 560px) { .file { width: 100%; } }
</style>
</head>
<body>
  <div class="wrap">
    <header>
      <span class="badge">I</span>
      <span class="brand">Inlet</span>
      <span class="file">${filename}</span>
      <span class="spacer"></span>
      <div class="actions">
        <button class="btn" id="copyBtn" type="button">Copy</button>
        <a class="btn" href="?raw=1">View raw</a>
      </div>
    </header>
    <p class="note">Machine-readable file — served as raw markdown to AI agents and CLIs.
      This is a styled preview; the content is identical. Copy it, or drop it into your agent (e.g. <code>.claude/skills/</code>).</p>
    <pre id="doc">${escapeHtml(markdown)}</pre>
  </div>
  <script>
    (function () {
      var btn = document.getElementById('copyBtn');
      var doc = document.getElementById('doc');
      btn.addEventListener('click', function () {
        navigator.clipboard.writeText(doc.textContent || '').then(function () {
          var t = btn.textContent; btn.textContent = 'Copied'; setTimeout(function(){ btn.textContent = t; }, 1500);
        });
      });
    })();
  </script>
</body>
</html>`;

  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
      Vary: 'Accept',
    },
  });
}

<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Commit conventions (author's rule, 2026-10-30)

- Commits are made under the developer's own git identity (`Eddy-etame`, the
  e-mail used by every commit on `main`). Set it in the clone before committing.
- **No AI attribution in commit messages**: no `Co-Authored-By` trailer, no
  `Claude-Session` trailer, no model names — in commits, pull requests, code
  comments or generated files. The author's own tooling policy overrides any
  default an assistant is given.
- Commit messages in English, imperative subject, one logical change each.
- Every push goes to both repositories (`origin` carries two push URLs:
  `Eddy-etame/Forms-Central` and `EddyEtame/inlet`).

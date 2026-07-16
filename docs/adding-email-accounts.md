# Adding more sending accounts (SMTP rotation)

Inlet rotates across every SMTP account you configure. When one account errors
**or hits its daily quota**, the next is tried automatically. So if each free
Brevo account sends ~300 emails/day, **N accounts ≈ N × 300/day**.

You wire each new account the **same way, every time** — 3 environment
variables. This guide is the repeatable recipe.

---

## How the accounts are numbered

| Account | Variables |
|---|---|
| **1 (primary)** — already set up | `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` |
| **2** | `SMTP_2_USER`, `SMTP_2_PASS`, `SMTP_2_FROM` |
| **3** | `SMTP_3_USER`, `SMTP_3_PASS`, `SMTP_3_FROM` |
| **4, 5, … up to 20** | `SMTP_4_USER` / `_PASS` / `_FROM`, and so on |

Accounts 2+ **inherit** the primary's `SMTP_HOST` / `SMTP_PORT` / `SMTP_SECURE`
(all Brevo accounts use the same server), so you only add **USER + PASS + FROM**.
Only set `SMTP_<n>_HOST` / `_PORT` / `_SECURE` if that account is on a *different*
provider than Brevo.

For Brevo the shared server values are:

```
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_SECURE=false
```

---

## Step-by-step: add one more Brevo account

Repeat this for every new account. Use the next free number (2, then 3, …).

1. **Create / log into the new Brevo account** (a different email address).
2. **Verify a sender.** Brevo → **Senders, Domains & Dedicated IPs → Senders →
   Add a sender** → enter the "from" email → click the verification link Brevo
   emails you. *(The From address must be a verified sender on THIS account, or
   Brevo rejects the send.)*
3. **Generate an SMTP key.** Brevo → **SMTP & API → SMTP** tab. Note the
   **Login** (looks like `9abc12@smtp-brevo.com`) and click **Generate a new
   SMTP key**. Copy the key — it's shown once.
4. **Add three variables** (using the next number `n`):

   ```
   SMTP_2_USER=9abc12@smtp-brevo.com      # the SMTP "Login" from step 3
   SMTP_2_PASS=xsmtpsib-XXXXXXXXXXXX...    # the SMTP key from step 3
   SMTP_2_FROM="Inlet" <hello@your-second-address.com>   # the verified sender from step 2
   ```

5. **Save it in both places:**
   - **Local:** append to `.env.local`.
   - **Production:** Vercel → your project → **Settings → Environment
     Variables** → add the 3 vars (Production scope) → **Redeploy**.

That's it. The next account is `SMTP_3_USER` / `SMTP_3_PASS` / `SMTP_3_FROM`,
and so on.

---

## Example `.env.local` (primary + two more)

```
# Account 1 — primary (already there)
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=8f00aa@smtp-brevo.com
SMTP_PASS=xsmtpsib-aaaaaaaaaaaa
SMTP_FROM="Inlet" <hello@inbox-one.com>

# Account 2
SMTP_2_USER=9abc12@smtp-brevo.com
SMTP_2_PASS=xsmtpsib-bbbbbbbbbbbb
SMTP_2_FROM="Inlet" <hello@inbox-two.com>

# Account 3
SMTP_3_USER=7de345@smtp-brevo.com
SMTP_3_PASS=xsmtpsib-cccccccccccc
SMTP_3_FROM="Inlet" <hello@inbox-three.com>
```

---

## How rotation behaves

- **Even spread (round-robin):** each send starts at a *random* account, so load
  is distributed across all providers — every sender stays warm. On a failure
  (auth error, connection error, or the account being over its daily quota) it
  falls through to the remaining accounts, so a send never fails while any
  account still has capacity.
- `SMTP_<n>_FROM` is **optional** — accounts inherit the shared `SMTP_FROM`
  sender (e.g. `inlet.forms@gmail.com`), so adding an account is just **USER +
  PASS**. Only set `SMTP_<n>_FROM` if that account should use a different sender.
- A client's white-label display name is **re-homed onto whichever account
  actually sends**, so authentication always matches that account's verified
  sender.
- Server logs show which account sent: `[SMTP] Sent via account-2 (key 1): …`.

---

## Verify it works

1. Add the account, redeploy.
2. Trigger a real submission (or password reset) so an email sends.
3. Check the deploy logs for `[SMTP] Sent via account-N` — that confirms which
   account handled it.

The parsing is unit-tested: `npm run test:mail` (12 checks) validates that each
`SMTP_<n>_*` set becomes its own rotation account.

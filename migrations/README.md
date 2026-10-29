# Database migrations

Run in the Supabase SQL editor, **in this order**, on a fresh project. Each
script is idempotent (`IF NOT EXISTS` / `DROP … IF EXISTS` before create), so
re-running one is safe.

| # | File | What it adds |
|---|------|--------------|
| 1 | `schema.sql` | base tables (clients = developers, forms, submissions, logs) |
| 2 | `migration_auto_reply.sql` | auto-reply columns on forms |
| 3 | `migration_v2_branding.sql` | per-developer branding |
| 4 | `migration_v3.sql` | success_url, failures_log, keyword filter |
| 5 | `migration_v4_clients.sql` | developer auth columns |
| 6 | `migration_v5_ai_plans.sql` | plans + AI usage log |
| 7 | `migration_v6_auth_rate_limit.sql` | brute-force protection |
| 8 | `migration_v7_plan_tiers.sql` | free / solo / pro / max |
| 9 | `migration_v8_email_log.sql` | e-mail quota accounting |
| 10 | `migration_v9_api_keys.sql` | API keys (MCP / API access) |
| 11 | `migration_v10_portals.sql` | `portal_users` = clients, `forms.portal_user_id` |
| 12 | `migration_v11_analytics.sql` | analytics views |
| 13 | `migration_v12_security_events.sql` | security event log |
| 14 | `migration_v13_custom_sender.sql` | custom sender name + reply-to |
| 15 | `migration_v14_two_factor.sql` | e-mail OTP two-factor |
| 16 | `migration_v15_device_sessions.sql` | device sessions |
| 17 | `migration_v16_ai_spam.sql` | `spam_status` / `spam_reason` on submissions |
| 18 | `migration_v17_webhooks.sql` | webhook URL + secret per form, deliveries |
| 19 | `migration_v18_client_email_unique.sql` | unique developer e-mail |
| 20 | `migration_v19_data_security.sql` | RLS + SECURITY DEFINER functions |
| 21 | `migration_v20_portal_security.sql` | portal hardening |
| 22 | `migration_v21_apikey_function.sql` | `verify_api_key()` |
| 23 | `migration_v22_platform.sql` | **the client model**: every form belongs to a client (`portal_user_id NOT NULL`, orphan forms backfilled onto a default client per developer), client website / lang / notify_leads, set-password invites, temporary bans (`blacklist.expires_at`), `plan_requests` |

Also create a **public Storage bucket named `uploads`** (attachments).

Glossary (see `lib/domain.ts`): in the database, `clients` are the
*developers* (the accounts that sign up) and `portal_users` are the
*clients* (the businesses that receive the leads). The UI and the API speak
developer / client; the table names are historical.

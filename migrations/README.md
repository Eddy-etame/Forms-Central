# Database migrations

Run in the Supabase SQL editor, in this order, on a fresh instance:

1. `schema.sql` — base tables (clients, forms, submissions, logs)
2. `migration_auto_reply.sql`
3. `migration_v2_branding.sql`
4. `migration_v3.sql`
5. `migration_v4_clients.sql` — client auth columns
6. `migration_v5_ai_plans.sql` — plans + AI usage log
7. `migration_v6_auth_rate_limit.sql` — brute-force protection
8. `migration_v7_plan_tiers.sql` — free/solo/pro/max
9. `migration_v8_email_log.sql` — email quota accounting
10. `migration_v9_api_keys.sql` — API keys (MCP/API access)

Each script is idempotent (`IF NOT EXISTS` / constraint replace) — re-running is safe.

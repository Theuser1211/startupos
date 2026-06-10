# Database Migrations Guide

StartupOS uses Supabase PostgreSQL. Migrations are SQL files stored in `supabase/migrations/`.

## Quick Start

```bash
# Option 1: Supabase CLI (recommended for local dev)
supabase link --project-ref <your-project-ref>
supabase db push

# Option 2: Manual via Supabase Dashboard
# Open https://supabase.com/dashboard/project/<project-ref>/sql
# Paste and run migration files in order
```

## Migration Files

| File | Description |
|------|-------------|
| `00001_blueprints.sql` | Core blueprints table with RLS |
| `00002_production_tables.sql` | Profiles, startups, logos, websites, subscriptions, usage, audit |
| `00003_deployments.sql` | Deployments table, website improvements |
| `00004_custom_domains.sql` | Custom domains table |
| `00005_public_blueprints.sql` | Public blueprint sharing |
| `00006_website_jobs.sql` | Website generation job queue |

## Adding New Migrations

1. Create a new file: `supabase/migrations/00007_description.sql`
2. Increment the number (00007, 00008, etc.)
3. Always check for existing tables with `IF NOT EXISTS`
4. Add both `CREATE` and `CREATE INDEX IF NOT EXISTS` statements
5. Add verification queries at the bottom (commented out)

## Migration Guidelines

- Always use `IF NOT EXISTS` / `IF EXISTS` for idempotency
- New tables must have RLS enabled with appropriate policies
- Foreign keys should use appropriate `ON DELETE` behavior
- Add indexes for columns used in WHERE, JOIN, and ORDER BY
- Use `CREATE TRIGGER` with `update_updated_at_column()` for `updated_at` auto-updates
- Run `supabase db push` to apply pending migrations

## Verifying Migrations

```sql
-- Check all tables exist
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public' AND table_type = 'BASE TABLE';

-- Check RLS is enabled
SELECT tablename, rowsecurity FROM pg_tables
WHERE schemaname = 'public';

-- Check indexes
SELECT schemaname, tablename, indexname, indexdef
FROM pg_indexes WHERE schemaname = 'public'
ORDER BY tablename, indexname;
```

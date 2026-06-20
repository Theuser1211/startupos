---
noteId: "2efc7b606c5311f19a1d27ff79f85615"
tags: []

---

# Job Table Root Cause Analysis

## Error

```
The table public.Job does not exist
```

## Finding

**The `Job` table (and likely all other tables) has never been created in the production Supabase database.**

## Evidence

| Evidence | Status |
|---|---|
| `prisma/migrations/` directory | **Empty** — no migration files exist |
| `@@map()` / `@map()` on Job model | **Absent** — no custom table name mapping |
| Prisma default table naming | `model Job` → SQL table `"Job"` (quoted, case-sensitive) |
| `CRITICAL_ISSUES.md:244` | Already flagged: "No `prisma migrate deploy` or `prisma db push` step in Dockerfile" |
| `TECH_DEBT.md:60` | Already flagged: "No Prisma migrations — schema was pushed directly with `db push`" |

## Why This Happens

### Prisma does not auto-create tables
Prisma validates your schema at compile time but **never** creates or alters database tables automatically at runtime. You must explicitly run one of:

- `prisma db push` — pushes schema directly (dev-friendly)
- `prisma migrate dev` — creates migration files and applies them
- `prisma migrate deploy` — applies existing migrations (production-safe)

### No deployment step exists
The Dockerfile builds the app but has **no** schema deployment command. The `railway.toml` does not include a `preDeployCommand` to run migrations. The database was never synced.

### Prisma Studio shows Job — but that is misleading
Prisma Studio loads model definitions from the local `schema.prisma` file. It does **not** query the database to verify tables exist until you click on a model. Seeing "Job" in the Studio sidebar only means the schema file defines it — it does **not** prove the table exists in the connected database.

## Why "public.Job" Specifically

The error references `public.Job` (not `public.job`) because:

1. Prisma always quotes identifiers in SQL queries: `"Job"`
2. PostgreSQL quoted identifiers are case-sensitive
3. The `@@map()` attribute is absent, so Prisma uses the **exact model name** as the table name

No `@@map("jobs")` or `@@map("job")` exists. The model name `Job` maps directly to table `"Job"`.

## SQL to Verify

```sql
-- List all tables in the public schema
SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;

-- Check specifically for Job (exact case)
SELECT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'Job') AS job_exists;
```

## Fix Options

| Option | Command | When to use |
|---|---|---|
| Quick sync | `npx prisma db push` | Dev / first-time prod setup |
| Git-tracked migrations | `npx prisma migrate dev --name init` | Then `prisma migrate deploy` |
| Startup script | Add `npx prisma migrate deploy` to Dockerfile entrypoint | Production |

**Important:** DDL commands (`db push`, `migrate`) must use `DIRECT_URL` (port 5432) not `DATABASE_URL` (port 6543, the PgBouncer pooler). This is already configured in `schema.prisma` via `directUrl = env("DIRECT_URL")`.

## Run Diagnostic

Before fixing, run the diagnostic script to confirm:

```bash
# Directly against Supabase:
npx tsx scripts/diagnose-tables.ts

# Or via psql:
psql "$DIRECT_URL" -f scripts/check-tables.sql
```
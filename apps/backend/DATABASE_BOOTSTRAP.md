---
noteId: "64f490a06c5711f19a1d27ff79f85615"
tags: []

---

# Database Bootstrap Guide — StartupOS on Supabase

## Summary

| Step | Command | Status |
|---|---|---|
| 1. Generate migration SQL | `npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script` | ✅ Done |
| 2. Apply SQL to Supabase | `npx prisma db execute --file=scripts/migration_init.sql` | ✅ Done |
| 3. Create migration history | `mkdir -p prisma/migrations/20260620_init && cp ...` | ✅ Done |
| 4. Mark as applied | `npx prisma migrate resolve --applied 20260620_init` | ✅ Done |
| 5. Verify | `npx prisma migrate status` | ✅ Up to date |

---

## Final Schema State

All 8 Prisma models now exist as tables in the `public` schema:

| Model | Table | Status |
|---|---|---|
| `User` | `"User"` | ✅ Created |
| `Startup` | `"Startup"` | ✅ Created |
| `Blueprint` | `"Blueprint"` | ✅ Created |
| `WebsiteSpec` | `"WebsiteSpec"` | ✅ Created |
| `Website` | `"Website"` | ✅ Created |
| `Deployment` | `"Deployment"` | ✅ Created |
| `Job` | `"Job"` | ✅ Created |
| `ApiLog` | `"ApiLog"` | ✅ Created |

Legacy tables (from previous schema) remain untouched:
`audit_logs`, `blueprints`, `custom_domains`, `deployments`, `generated_logos`, `generated_websites`, `profiles`, `startups`, `subscriptions`, `usage_tracking`

---

## Why This Approach

The production Supabase database had **legacy tables** (`audit_logs` referencing `auth.users`) that caused Prisma introspection to fail:

```
Error: P4002 - Cross schema references are only allowed when the target schema is listed...
```

This blocked both `prisma db push` and `prisma migrate dev`.

### Solution Used

**`prisma migrate diff --from-empty`** generates SQL directly from the Prisma schema **without introspecting the database**. This bypasses the cross-schema reference issue entirely.

Then apply with `prisma db execute` (raw SQL execution, no introspection).

---

## Production Deployment Instructions

### 1. Railway (or any Docker host)

The Dockerfile now includes an entrypoint that runs migrations before starting:

```dockerfile
# docker-entrypoint.sh
#!/bin/sh
set -e
npx prisma migrate deploy
exec node dist/server.js
```

Railway also runs migrations in the pre-deploy phase:

```toml
# railway.toml
[deploy]
preDeployCommand = "npx prisma migrate deploy"
```

### 2. Environment Variables Required

| Variable | Description |
|---|---|
| `DATABASE_URL` | Pooler URL (port 6543, `?pgbouncer=true`) for app queries |
| `DIRECT_URL` | Direct connection (port 5432) for migrations/DDL |

Both must be set in Railway dashboard.

### 3. First-time Setup (new environment)

```bash
# 1. Set env vars (DATABASE_URL, DIRECT_URL)
# 2. Run migrations
npx prisma migrate deploy

# 3. Verify
npx prisma migrate status
```

### 4. Schema Changes (ongoing)

```bash
# Local dev: create & apply migration
npx prisma migrate dev --name <description>

# Commit prisma/migrations/ to git

# Deploy: Railway runs `npx prisma migrate deploy` automatically
```

---

## Verification Script

```bash
npx tsx scripts/check-now.ts
```

Expected output:
```
Tables in public schema: [...]
  ✅ User
  ✅ Startup
  ✅ Blueprint
  ✅ WebsiteSpec
  ✅ Website
  ✅ Deployment
  ✅ Job
  ✅ ApiLog
```

---

## Troubleshooting

| Issue | Fix |
|---|---|
| `P4002` cross-schema reference | Use `migrate diff --from-empty` + `db execute` (as done here) |
| Migration fails on Railway | Check `DIRECT_URL` is set and uses port 5432 |
| Tables not found at runtime | Ensure `migrate deploy` ran before `node dist/server.js` |
| Enum already exists | The migration SQL uses `CREATE TYPE ... AS ENUM` which is idempotent on Supabase |

---

## Files Created/Modified

| File | Purpose |
|---|---|
| `scripts/migration_init.sql` | Raw SQL to create all tables/enums/indexes/FKs |
| `scripts/bootstrap-db.ts` | Alternative: applies SQL via Prisma client |
| `scripts/check-now.ts` | Diagnostic: lists tables and verifies expected ones |
| `prisma/migrations/20260620_init/migration.sql` | Migration history for `migrate deploy` |
| `docker-entrypoint.sh` | Runs `migrate deploy` before server starts |
| `Dockerfile` | Uses entrypoint script |
| `railway.toml` | Runs `migrate deploy` in pre-deploy phase |
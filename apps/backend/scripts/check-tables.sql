-- List all tables in the public schema with metadata
-- Run with: psql "$DATABASE_URL" -f scripts/check-tables.sql
-- Or via Railway CLI: railway run psql -f scripts/check-tables.sql

SELECT
  tablename,
  tableowner,
  schemaname,
  has_table_privilege(current_user, quote_ident(tablename), 'SELECT') AS can_select
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- Check specifically for the Job table (case-sensitive)
-- PostgreSQL will fold unquoted identifiers to lowercase,
-- so 'Job' vs 'job' matters when quoted.
SELECT
  EXISTS (
    SELECT 1 FROM pg_tables
    WHERE schemaname = 'public' AND tablename = 'Job'
  ) AS job_table_exists_correct_case,
  EXISTS (
    SELECT 1 FROM pg_tables
    WHERE schemaname = 'public' AND tablename = 'job'
  ) AS job_table_exists_lowercase;

-- List all enums
SELECT
  t.typname AS enum_name,
  e.enumlabel AS enum_value
FROM pg_enum e
JOIN pg_type t ON e.enumtypid = t.oid
WHERE t.typname LIKE '%Job%' OR t.typname LIKE '%job%'
ORDER BY t.typname, e.enumsortorder;
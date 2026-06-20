/**
 * Startup diagnostic script.
 * Logs all detected database tables and compares against Prisma schema expectations.
 *
 * Run via Railway:  npx tsx scripts/diagnose-tables.ts
 * Or at startup:    import "./scripts/diagnose-tables.js"  (after build)
 *
 * Safe to run — read-only queries.
 */

import { PrismaClient } from "@prisma/client";
import "dotenv/config";

const prisma = new PrismaClient();

async function diagnose(): Promise<void> {
  console.log("=== TABLE DIAGNOSTIC ===");
  console.log(`DATABASE_URL: ${(process.env.DATABASE_URL ?? "").replace(/\/\/.*@/, "//user:pass@")}`);
  console.log(`NODE_ENV: ${process.env.NODE_ENV ?? "not set"}`);

  try {
    const rows: Array<{ tablename: string }> = await prisma.$queryRawUnsafe(
      `SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename`,
    );
    console.log(`\nTables in public schema (${rows.length}):`);
    for (const r of rows) {
      console.log(`  - ${r.tablename}`);
    }

    const expected = [
      "User", "Startup", "Blueprint", "WebsiteSpec",
      "Website", "Deployment", "Job", "ApiLog",
    ];
    console.log(`\nExpected models from schema.prisma:`);
    for (const name of expected) {
      const exists = rows.some((r) => r.tablename === name);
      console.log(`  ${exists ? "✅" : "❌"} ${name}`);
    }

    const missing = expected.filter((name) => !rows.some((r) => r.tablename === name));
    if (missing.length > 0) {
      console.log(`\n❌ MISSING TABLES (${missing.length}): ${missing.join(", ")}`);
      console.log(`\nRun one of these to create them:\n`);
      console.log(`  npx prisma db push                    # quick sync (may lose data)`);
      console.log(`  npx prisma migrate dev --name init     # create initial migration`);
      console.log(`  npx prisma migrate deploy              # apply existing migrations`);
      console.log(`\nConnection string must use DIRECT_URL (port 5432, not 6543) for DDL.`);
    } else {
      console.log(`\n✅ All expected tables exist.`);
    }
  } catch (err) {
    console.error("\n❌ Failed to query pg_tables:", err instanceof Error ? err.message : err);
    console.log("\nPossible causes:");
    console.log("  - Database unreachable (check DATABASE_URL)");
    console.log("  - Insufficient permissions (missing pg_tables SELECT)");
    console.log("  - Network/firewall blocking");
  } finally {
    await prisma.$disconnect();
  }
}

diagnose();
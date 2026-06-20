import { PrismaClient } from "@prisma/client";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

async function bootstrap() {
  const prisma = new PrismaClient();

  try {
    const sql = readFileSync(resolve(__dirname, "migration_init.sql"), "utf-8");
    const statements = sql
      .split(";")
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !s.startsWith("--"));

    console.log(`Executing ${statements.length} SQL statements...`);

    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i];
      const preview = stmt.split("\n")[0].substring(0, 80);
      try {
        await prisma.$executeRawUnsafe(stmt);
        console.log(`  [${i + 1}/${statements.length}] OK: ${preview}...`);
      } catch (err: any) {
        if (err?.message?.includes("already exists")) {
          console.log(`  [${i + 1}/${statements.length}] SKIP (already exists): ${preview}...`);
        } else {
          throw err;
        }
      }
    }

    console.log("\n✅ Schema bootstrap complete.");
  } catch (err) {
    console.error("\n❌ Bootstrap failed:", err instanceof Error ? err.message : err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

bootstrap();
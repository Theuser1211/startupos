import { PrismaClient } from "@prisma/client";

async function main() {
  const p = new PrismaClient();
  try {
    const r: Array<{ tablename: string }> = await p.$queryRawUnsafe(
      "SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename"
    );
    console.log("Tables in public schema:", JSON.stringify(r.map((x) => x.tablename)));

    const expected = ["User", "Startup", "Blueprint", "WebsiteSpec", "Website", "Deployment", "Job", "ApiLog"];
    for (const name of expected) {
      const exact = r.some((t) => t.tablename === name);
      const lower = r.some((t) => t.tablename === name.toLowerCase());
      console.log(`  ${exact ? "✅" : "❌"} ${name}${lower ? ` (lowercase variant: ${name.toLowerCase()})` : ""}`);
    }
  } catch (e) {
    console.error("Error:", e instanceof Error ? e.message : e);
  } finally {
    await p.$disconnect();
  }
}
main();
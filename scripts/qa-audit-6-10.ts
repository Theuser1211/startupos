/**
 * Generate blueprints 6-10 for the full Quality Audit.
 * Usage: $env:OPENROUTER_API_KEY="sk-or-..."; npx tsx scripts/qa-audit-6-10.ts
 */
import type { InterviewData } from "@/lib/types";
import { generateOpenRouterBlueprint } from "@/lib/ai/openrouter";
import { writeFileSync, mkdirSync, existsSync, readFileSync } from "fs";

const CASES: { id: number; label: string; data: InterviewData }[] = [
  {
    id: 6,
    label: "B2B Cybersecurity Platform",
    data: {
      idea: "AI-powered cybersecurity platform for B2B SaaS companies — threat detection, vulnerability scanning, and compliance monitoring",
      stage: "seed",
      industry: "saas",
      targetCustomer: "b2b-medium",
      businessModel: "subscription",
      priceRange: "$200-1000",
      problem: "security",
    },
  },
  {
    id: 7,
    label: "AI Bookkeeping Assistant",
    data: {
      idea: "AI bookkeeping assistant for small businesses — auto-categorize transactions, reconcile accounts, and generate financial reports",
      stage: "ideation",
      industry: "fintech",
      targetCustomer: "b2b-small",
      businessModel: "subscription",
      priceRange: "$50-200",
      problem: "cost",
    },
  },
  {
    id: 8,
    label: "Healthcare Scheduling SaaS",
    data: {
      idea: "AI-powered scheduling platform for healthcare clinics — appointment booking, patient reminders, and resource allocation",
      stage: "pre-seed",
      industry: "healthtech",
      targetCustomer: "b2b-small",
      businessModel: "subscription",
      priceRange: "$50-200",
      problem: "performance",
    },
  },
  {
    id: 9,
    label: "Real Estate Lead Gen",
    data: {
      idea: "AI lead generation platform for real estate agents — predictive scoring, automated outreach, and pipeline management",
      stage: "seed",
      industry: "saas",
      targetCustomer: "b2b-small",
      businessModel: "subscription",
      priceRange: "$50-200",
      problem: "performance",
    },
  },
  {
    id: 10,
    label: "Recruiting Automation",
    data: {
      idea: "AI recruiting automation platform — resume screening, candidate matching, interview scheduling, and bias detection",
      stage: "pre-seed",
      industry: "saas",
      targetCustomer: "b2b-medium",
      businessModel: "subscription",
      priceRange: "$50-200",
      problem: "performance",
    },
  },
];

const DELAY_MS = 15000; // 15s between requests to avoid 429

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  mkdirSync("test-output", { recursive: true });

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    console.error("Set OPENROUTER_API_KEY env var");
    process.exit(1);
  }
  console.log(`API Key: ${apiKey.substring(0, 12)}...`);

  // Check which already exist
  const existing: Record<number, boolean> = {};
  for (const c of CASES) {
    const path = `test-output/qa-bp-${c.id}.json`;
    if (existsSync(path)) {
      const size = readFileSync(path).length;
      existing[c.id] = true;
      console.log(`  #${c.id} exists (${size} bytes) — skipping`);
    }
  }

  const toGenerate = CASES.filter((c) => !existing[c.id]);
  if (toGenerate.length === 0) {
    console.log("\nAll 5 already exist. Nothing to generate.");
    return;
  }
  console.log(`\nNeed to generate: ${toGenerate.map((c) => `#${c.id}`).join(", ")}`);

  const results: { id: number; label: string; ok: boolean; name?: string; error?: string }[] = [];

  for (const c of toGenerate) {
    console.log(`\n${"─".repeat(50)}`);
    console.log(`  #${c.id} ${c.label}`);
    console.log(`${"─".repeat(50)}`);

    let retries = 0;
    const maxRetries = 3;

    while (retries < maxRetries) {
      try {
        const bp = await generateOpenRouterBlueprint(c.data);
        writeFileSync(`test-output/qa-bp-${c.id}.json`, JSON.stringify(bp, null, 2));
        results.push({ id: c.id, label: c.label, ok: true, name: bp.startupName });
        console.log(`  ✅ "${bp.startupName}" — ${bp.tagline.substring(0, 60)}...`);
        break;
      } catch (err) {
        const msg = err instanceof Error ? err.message : "failed";
        if (msg.includes("429") && retries < maxRetries - 1) {
          retries++;
          const backoff = DELAY_MS * retries;
          console.log(`  ⚠ Rate limited. Retry ${retries}/${maxRetries} after ${backoff / 1000}s...`);
          await sleep(backoff);
        } else {
          results.push({ id: c.id, label: c.label, ok: false, error: msg });
          console.error(`  ❌ ${msg}`);
          break;
        }
      }
    }

    // Delay between requests (skip after last)
    if (c.id < 10) {
      console.log(`  ⏳ Waiting ${DELAY_MS / 1000}s...`);
      await sleep(DELAY_MS);
    }
  }

  console.log(`\n${"═".repeat(50)}`);
  console.log("  RESULTS");
  console.log(`${"═".repeat(50)}`);
  for (const r of results) {
    console.log(`  ${r.ok ? "✅" : "❌"} #${r.id} ${r.label} ${r.name ? `→ "${r.name}"` : `— ${r.error}`}`);
  }

  // Verify all 10 exist
  console.log(`\n${"═".repeat(50)}`);
  console.log("  VERIFICATION — All 10 blueprints");
  console.log(`${"═".repeat(50)}`);
  for (let i = 1; i <= 10; i++) {
    const path = `test-output/qa-bp-${i}.json`;
    if (existsSync(path)) {
      const size = readFileSync(path).length;
      console.log(`  ✅ #${i} — ${size} bytes`);
    } else {
      console.log(`  ❌ #${i} — MISSING`);
    }
  }
}

main().catch((e) => {
  console.error("Fatal:", e);
  process.exit(1);
});

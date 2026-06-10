/**
 * Generate 5 fresh AI blueprints with rate-limit-aware delays.
 * Usage: $env:OPENROUTER_API_KEY="sk-or-..."; npx tsx scripts/qa-generate-fresh.ts
 */
import type { InterviewData } from "@/lib/types";
import { generateBlueprintAI } from "@/lib/ai/providers";
import { writeFileSync, mkdirSync, existsSync, readFileSync } from "fs";

const CASES: { id: number; label: string; data: InterviewData }[] = [
  {
    id: 1,
    label: "AI Contract Review",
    data: {
      idea: "AI contract review platform for Indian SMBs",
      stage: "ideation",
      industry: "ai",
      targetCustomer: "b2b-small",
      businessModel: "subscription",
      priceRange: "$50-200",
      problem: "cost",
    },
  },
  {
    id: 2,
    label: "Vet Marketplace",
    data: {
      idea: "On-demand veterinary marketplace connecting pet owners with licensed vets for telehealth and home visits",
      stage: "pre-seed",
      industry: "healthtech",
      targetCustomer: "b2c-mass",
      businessModel: "marketplace",
      problem: "access",
    },
  },
  {
    id: 3,
    label: "FinTech Compliance",
    data: {
      idea: "Automated regulatory compliance platform for fintech startups navigating RBI, SEBI, and PCI-DSS requirements",
      stage: "seed",
      industry: "fintech",
      targetCustomer: "b2b-small",
      businessModel: "subscription",
      priceRange: "$200-1000",
      problem: "integration",
    },
  },
  {
    id: 4,
    label: "Creator Monetization",
    data: {
      idea: "All-in-one monetization platform for Indian creators — subscriptions, digital products, tip jars, and brand deal marketplace",
      stage: "pre-seed",
      industry: "creator",
      targetCustomer: "b2c-niche",
      businessModel: "usage",
      priceRange: "$10-50",
      problem: "cost",
    },
  },
  {
    id: 5,
    label: "AI Sales Assistant",
    data: {
      idea: "AI-powered sales assistant that writes follow-up emails, scores leads, and books meetings from CRM data",
      stage: "seed",
      industry: "saas",
      targetCustomer: "b2b-medium",
      businessModel: "subscription",
      priceRange: "$50-200",
      problem: "performance",
    },
  },
];

const DELAY_MS = 12000; // 12s between requests to avoid 429

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  mkdirSync("test-output", { recursive: true });

  // Check which already exist
  const existing: Record<number, boolean> = {};
  for (const c of CASES) {
    const path = `test-output/qa-bp-${c.id}.json`;
    if (existsSync(path)) {
      const size = readFileSync(path).length;
      existing[c.id] = true;
      console.log(`  #${c.id} exists (${size} bytes)`);
    }
  }

  const toGenerate = CASES.filter((c) => !existing[c.id]);
  if (toGenerate.length === 0) {
    console.log("\nAll 5 already exist. Regenerating all...");
  } else {
    console.log(`\nNeed to generate: ${toGenerate.map((c) => `#${c.id}`).join(", ")}`);
  }

  const results: { id: number; label: string; ok: boolean; name?: string }[] = [];

  for (const c of CASES) {
    console.log(`\n${"─".repeat(50)}`);
    console.log(`  #${c.id} ${c.label}`);
    console.log(`${"─".repeat(50)}`);

    try {
      const result = await generateBlueprintAI(c.data);
      writeFileSync(`test-output/qa-bp-${c.id}.json`, JSON.stringify(result.blueprint, null, 2));
      results.push({ id: c.id, label: c.label, ok: true, name: result.blueprint.startupName });
      console.log(`  ✅ "${result.blueprint.startupName}" — ${result.blueprint.tagline.substring(0, 60)}...`);
      console.log(`  📊 ${result.report.provider} / ${result.report.model} — ${result.report.durationMs}ms, ${result.report.outputTokens} tokens`);
    } catch (err) {
      results.push({ id: c.id, label: c.label, ok: false });
      console.error(`  ❌ ${err instanceof Error ? err.message : "failed"}`);
    }

    // Delay between requests (skip after last)
    if (c.id < 5) {
      console.log(`  ⏳ Waiting ${DELAY_MS / 1000}s...`);
      await sleep(DELAY_MS);
    }
  }

  console.log(`\n${"═".repeat(50)}`);
  console.log("  RESULTS");
  console.log(`${"═".repeat(50)}`);
  for (const r of results) {
    console.log(`  ${r.ok ? "✅" : "❌"} #${r.id} ${r.label} ${r.name ? `→ "${r.name}"` : ""}`);
  }
}

main().catch((e) => {
  console.error("Fatal:", e);
  process.exit(1);
});

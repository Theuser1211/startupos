import { readFileSync } from "fs";
import { join } from "path";

// Load .env.local manually
try {
  const envPath = join(process.cwd(), ".env.local");
  const envContent = readFileSync(envPath, "utf-8");
  envContent.split("\n").forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const eqIndex = trimmed.indexOf("=");
      if (eqIndex !== -1) {
        const key = trimmed.substring(0, eqIndex).trim();
        const value = trimmed.substring(eqIndex + 1).trim();
        if (key && value) {
          process.env[key] = value;
        }
      }
    }
  });
} catch {
  // .env.local not found
}

import { generateBlueprintAI } from "../lib/ai/providers/index";

const testCases = [
  {
    name: "AI Lawyer",
    data: {
      idea: "AI-powered contract review for SMBs",
      stage: "Pre-Seed",
      industry: "Legal Tech",
      targetCustomer: "Small and medium businesses",
      businessModel: "SaaS subscription",
      priceRange: "$99-499/mo",
      problem: "Small businesses can't afford legal teams for contract review",
    },
  },
  {
    name: "Vet Marketplace",
    data: {
      idea: "On-demand veterinary telemedicine",
      stage: "Ideation",
      industry: "Pet Care",
      targetCustomer: "Pet owners in rural areas",
      businessModel: "Marketplace with commission",
      priceRange: "$50-100/consultation",
      problem: "Pet owners in rural areas lack access to veterinarians",
    },
  },
  {
    name: "FinTech Compliance",
    data: {
      idea: "Automated compliance monitoring for fintech startups",
      stage: "Seed",
      industry: "FinTech",
      targetCustomer: "Fintech startups and neobanks",
      businessModel: "SaaS with usage-based pricing",
      priceRange: "$500-2000/mo",
      problem: "Fintech companies struggle to keep up with regulatory changes",
    },
  },
];

async function runTests() {
  console.log("=== Groq JSON Parsing Test ===\n");

  for (const testCase of testCases) {
    console.log(`\n--- Testing: ${testCase.name} ---`);
    try {
      const result = await generateBlueprintAI(testCase.data as any);
      console.log(`✅ ${testCase.name}: SUCCESS`);
      console.log(`   Startup Name: ${result.blueprint.startupName}`);
      console.log(`   Tagline: ${result.blueprint.tagline}`);
      console.log(`   Provider: ${result.report.provider} (${result.report.model})`);
      console.log(`   Duration: ${result.report.durationMs}ms`);
    } catch (error) {
      console.log(`❌ ${testCase.name}: FAILED`);
      console.log(`   Error: ${error instanceof Error ? error.message : "unknown"}`);
    }
  }

  console.log("\n=== Test Complete ===");
}

runTests();

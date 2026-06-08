/**
 * Test script: Verifies OpenRouter can generate a full Startup Blueprint
 * that passes Zod validation.
 *
 * Usage: 
 *   OPENROUTER_API_KEY=sk-or-... npx tsx scripts/test-openrouter-blueprint.ts
 *
 * Note: This script reads from process.env directly (not .env.local).
 * Pass the API key as an environment variable when running.
 */
import type { InterviewData } from "@/lib/types";
import { generateOpenRouterBlueprint } from "@/lib/ai/openrouter";

const TEST_DATA: InterviewData = {
  idea: "AI lawyer for startups",
  stage: "ideation",
  industry: "ai",
  targetCustomer: "b2b-small",
  businessModel: "subscription",
  priceRange: "$50-200",
  problem: "cost",
};

async function main() {
  console.log("[Test] Starting OpenRouter Blueprint Generation Test...\n");
  console.log("[Test] Input:", JSON.stringify(TEST_DATA, null, 2), "\n");

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    console.error("[Test] ❌ OPENROUTER_API_KEY is not set in environment");
    console.error("[Test]    Add it to .env.local and try again");
    process.exit(1);
  }
  console.log("[Test] ✅ OPENROUTER_API_KEY is set\n");

  try {
    const blueprint = await generateOpenRouterBlueprint(TEST_DATA);

    console.log("=== BLUEPRINT SUMMARY ===\n");
    console.log("  Startup Name:     ", blueprint.startupName);
    console.log("  Tagline:          ", blueprint.tagline);
    console.log("  Problem:          ", blueprint.problem);
    console.log("  Solution:         ", blueprint.solution);
    console.log("");
    console.log("  Company:");
    console.log("    Stage:          ", blueprint.companySnapshot.stage);
    console.log("    Industry:       ", blueprint.companySnapshot.industry);
    console.log("    Funding:        ", blueprint.companySnapshot.funding);
    console.log("    Team Size:      ", blueprint.companySnapshot.teamSize);
    console.log("    Founded:        ", blueprint.companySnapshot.foundedDate);
    console.log("");
    console.log("  Stats:");
    console.log("    Brand Score:    ", blueprint.stats.brandScore);
    console.log("    Market Fit:     ", blueprint.stats.marketFit);
    console.log("    Readiness:      ", blueprint.stats.readiness);
    console.log("    Growth Score:   ", blueprint.stats.growthScore);
    console.log("");
    console.log("  Insights:         ", blueprint.insights.length);
    console.log("  Roadmap Phases:   ", blueprint.roadmap.length);
    console.log("  Logos:            ", blueprint.logos.length);
    console.log("");
    console.log("  Roast:");
    console.log("    Score:          ", blueprint.roast.score, "/ 10");
    console.log("    Items:          ", blueprint.roast.items.length);
    console.log("");
    console.log("=== VERDICT ===\n");
    console.log("  Badge:            ", blueprint.verdict.badge, `(${blueprint.verdict.badgeLabel})`);
    console.log("  Composite Score:  ", blueprint.verdict.compositeScore, "/ 100");
    console.log("  Confidence:       ", blueprint.verdict.confidence, `% (${blueprint.verdict.confidenceLabel})`);
    console.log("");
    console.log("  Dimensions:");
    for (const [key, dim] of Object.entries(blueprint.verdict.dimensions)) {
      console.log(`    ${key.padEnd(16)} ${dim.score}/100 — ${dim.label}`);
    }
    console.log("");
    console.log("  Strengths:        ", blueprint.verdict.strengths.map((s) => `${s.dimension} (${s.score})`).join(", "));
    console.log("  Weaknesses:       ", blueprint.verdict.weaknesses.map((w) => `${w.dimension} (${w.score})`).join(", "));
    console.log("  Fatal Risks:      ", blueprint.verdict.fatalRisks.length);
    console.log("  Suggested Pivot:  ", blueprint.verdict.suggestedPivot ?? "None");
    console.log("  Improvement Paths:", blueprint.verdict.improvementPaths.length);

    console.log("\n[Test] ✅ SUCCESS: OpenRouter generated a valid, validated blueprint!");
    console.log("[Test]    Generation completed using AI mode.\n");
  } catch (err) {
    console.error("\n[Test] ❌ FAILED: OpenRouter blueprint generation failed.\n");
    console.error("Error:", err instanceof Error ? err.message : String(err));
    console.error("\n[Test]    This could mean:");
    console.error("    - All OpenRouter free models are rate-limited");
    console.error("    - The API key is invalid or expired");
    console.error("    - Network connectivity issues");
    console.error("\n[Test]    The app will fall back to the deterministic engine in this case.\n");
    process.exit(1);
  }
}

main().catch((e) => {
  console.error("[Test] Fatal error:", e);
  process.exit(1);
});

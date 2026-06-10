/**
 * Test script: Verifies AI blueprint generation via providers
 * (Groq → DeepSeek).
 *
 * Usage: 
 *   npx tsx scripts/test-openrouter-blueprint.ts
 */
import type { InterviewData } from "@/lib/types";
import { generateBlueprintAI } from "@/lib/ai/providers";

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
  console.log("[Test] Starting AI Blueprint Generation Test...\n");
  console.log("[Test] Input:", JSON.stringify(TEST_DATA, null, 2), "\n");

  try {
    const result = await generateBlueprintAI(TEST_DATA);
    const { blueprint, report } = result;

    console.log("=== GENERATION REPORT ===\n");
    console.log("  Provider:         ", report.provider);
    console.log("  Model:            ", report.model);
    console.log("  Duration:         ", report.durationMs, "ms");
    console.log("  Input tokens:     ", report.inputTokens);
    console.log("  Output tokens:    ", report.outputTokens);
    console.log("");

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

    console.log("\n[Test] ✅ SUCCESS: AI blueprint generated!");
    console.log(`[Test]    Provider: ${report.provider}, ${report.durationMs}ms, ${report.outputTokens} tokens\n`);
  } catch (err) {
    console.error("\n[Test] ❌ FAILED: AI blueprint generation failed.\n");
    console.error("Error:", err instanceof Error ? err.message : String(err));
    console.error("\n[Test]    All AI providers failed. Please try again later.\n");
    process.exit(1);
  }
}

main().catch((e) => {
  console.error("[Test] Fatal error:", e);
  process.exit(1);
});

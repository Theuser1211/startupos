import { generateBlueprintAI } from "@/lib/ai/providers";
import { writeFileSync } from "fs";

const data = {
  idea: "AI-powered sales assistant that writes follow-up emails, scores leads, and books meetings from CRM data",
  stage: "seed",
  industry: "saas",
  targetCustomer: "b2b-medium",
  businessModel: "subscription",
  priceRange: "$50-200",
  problem: "performance",
} as const;

async function main() {
  console.log("Generating blueprint #5...");
  const result = await generateBlueprintAI(data as any);
  writeFileSync("test-output/qa-bp-5.json", JSON.stringify(result.blueprint, null, 2));
  console.log("Saved: " + result.blueprint.startupName);
  console.log(`Provider: ${result.report.provider}, Model: ${result.report.model}, ${result.report.durationMs}ms, ${result.report.outputTokens} tokens`);
}
main();

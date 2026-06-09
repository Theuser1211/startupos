import { generateOpenRouterBlueprint } from "@/lib/ai/openrouter";
import { writeFileSync } from "fs";

const data = {
  idea: "AI-powered sales assistant that writes follow-up emails, scores leads, and books meetings from CRM data",
  stage: "seed",
  industry: "saas",
  targetCustomer: "b2b-medium",
  businessModel: "subscription",
  priceRange: "$50-200",
  problem: "performance",
};

async function main() {
  console.log("Generating blueprint #5...");
  const bp = await generateOpenRouterBlueprint(data);
  writeFileSync("test-output/qa-bp-5.json", JSON.stringify(bp, null, 2));
  console.log("Saved: " + bp.startupName);
}
main();

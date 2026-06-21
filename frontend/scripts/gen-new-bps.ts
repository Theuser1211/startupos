import { generateBlueprint } from "../lib/startup/blueprint";
import { writeFileSync } from "fs";

const startups = [
  { idea: "AI pair programmer for code review", stage: "ideation" as const, industry: "ai", targetCustomer: "Development teams", businessModel: "B2B SaaS", priceRange: "$100/mo", problem: "Code reviews are slow and inconsistent" },
  { idea: "Personalized fitness coaching app", stage: "ideation" as const, industry: "healthtech", targetCustomer: "Fitness enthusiasts", businessModel: "B2C subscription", priceRange: "$30/mo", problem: "Generic workout plans don't work" },
  { idea: "Encrypted cloud storage for teams", stage: "pre-seed" as const, industry: "cloud", targetCustomer: "Remote teams", businessModel: "B2B SaaS", priceRange: "$50/mo", problem: "Teams need secure file sharing" },
  { idea: "Climate tech carbon tracking", stage: "pre-seed" as const, industry: "climate", targetCustomer: "Enterprises", businessModel: "B2B SaaS", priceRange: "$500/mo", problem: "Companies can't measure carbon footprint" },
  { idea: "Mental health AI companion", stage: "ideation" as const, industry: "healthtech", targetCustomer: "Young adults", businessModel: "B2C freemium", priceRange: "$20/mo", problem: "Therapy is expensive and inaccessible" },
  { idea: "Data pipeline automation tool", stage: "seed" as const, industry: "data", targetCustomer: "Data engineers", businessModel: "B2B usage-based", priceRange: "variable", problem: "Data pipelines are fragile and manual" },
  { idea: "Pet health monitoring platform", stage: "ideation" as const, industry: "pets", targetCustomer: "Pet owners", businessModel: "B2C + B2B", priceRange: "$15/mo", problem: "Pet health issues go undetected" },
  { idea: "Smart home energy management", stage: "pre-seed" as const, industry: "iot", targetCustomer: "Homeowners", businessModel: "B2C hardware + SaaS", priceRange: "$200 + $10/mo", problem: "Energy bills are too high" },
  { idea: "Cross-border payment solution", stage: "seed" as const, industry: "fintech", targetCustomer: "SMBs", businessModel: "Transaction fees", priceRange: "1.5%", problem: "International payments are slow and expensive" },
  { idea: "Sustainable supply chain tracker", stage: "ideation" as const, industry: "climate", targetCustomer: "Retail brands", businessModel: "B2B SaaS", priceRange: "$300/mo", problem: "Supply chains lack transparency" },
];

for (let i = 0; i < startups.length; i++) {
  console.log(`Generating BP${i + 1}: ${startups[i].idea} (${startups[i].stage}, ${startups[i].industry})`);
  const bp = generateBlueprint(startups[i]);
  writeFileSync(`test-output/qa-bp-${i + 1}.json`, JSON.stringify(bp, null, 2));
  console.log(`  → ${bp.startupName} | Tagline: "${bp.tagline}" | URL: ${bp.website.url}`);
  console.log(`  → Competitors: ${bp.competitors.map(c => c.name).join(", ") || "none"}`);
  console.log(`  → Revenue max: $${Math.max(...bp.revenue.projections.map(p => p.projected)).toLocaleString()}/mo`);
}

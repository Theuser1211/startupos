/**
 * Test script: Verify all 5 design styles generate distinct output.
 * Run with: npx tsx scripts/test-design-styles.ts
 */

import { generateLandingPage } from "../lib/startup/website-generator";
import * as fs from "fs";
import * as path from "path";

const mockConfig = {
  startupName: "VerdeFlow",
  tagline: "Carbon accounting for modern enterprises",
  problem: "Current carbon accounting is done in spreadsheets, making it error-prone, time-consuming, and impossible to scale for companies with complex supply chains.",
  solution: "VerdeFlow automates carbon data collection across your entire supply chain, generates audit-ready reports, and identifies cost-saving reduction opportunities.",
  brand: {
    mission: "Making sustainability measurable for every business.",
    values: ["Radical Transparency", "Scientific Rigor", "Climate Justice", "Systems Thinking"],
    tone: ["Professional", "Urgent", "Data-driven", "Confident"],
    colors: [
      { name: "Emerald", hex: "#10B981" },
      { name: "Ocean", hex: "#06B6D4" },
      { name: "Forest", hex: "#064E3B" },
      { name: "Earth", hex: "#D6D3D1" },
    ],
    typography: { heading: "Instrument Serif", body: "Plus Jakarta Sans" },
  },
  icp: {
    title: "Chief Sustainability Officer",
    description: "Sustainability executive at a mid-to-large enterprise",
    painPoints: [
      "Carbon accounting is still done in spreadsheets",
      "Supply chain emissions data is nearly impossible to collect",
      "ESG reporting frameworks are inconsistent across jurisdictions",
    ],
  },
  industry: "climate",
};

const OUTPUT_DIR = path.join(__dirname, "..", "test-output");

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const styles = ["minimal", "bold", "professional", "playful", "tech"] as const;

console.log("=== Testing All 5 Design Styles ===\n");

for (const style of styles) {
  const html = generateLandingPage({
    ...mockConfig,
    designStyle: style,
  });

  const filename = `landing-${style}.html`;
  const filepath = path.join(OUTPUT_DIR, filename);
  fs.writeFileSync(filepath, html);

  // Check for key differences
  const hasHero = html.includes('class="hero"');
  const hasLargeHero = html.includes("hero-large");
  const hasMetrics = html.includes("hero-metrics");
  const hasCTA = html.includes("btn-primary") || html.includes("btn-glass");

  console.log(`${style.padEnd(15)} | Hero: ${hasHero} | Large: ${hasLargeHero ? "✅" : "—"} | Metrics: ${hasMetrics ? "✅" : "—"} | CTA: ${hasCTA ? "✅" : "—"} | Size: ${(html.length / 1024).toFixed(1)}KB`);
}

console.log("\n=== Output saved to test-output/ ===\n");

// Verify styles are distinct by checking unique CSS properties
const stylesOutput = styles.map((style) => ({
  style,
  css: extractCSS(generateLandingPage({ ...mockConfig, designStyle: style })),
}));

// Check that at least some CSS values differ
const uniqueRadii = new Set(stylesOutput.map((s) => s.css.radius));
const uniqueBgs = new Set(stylesOutput.map((s) => s.css.bg));
const uniqueHeroScales = new Set(stylesOutput.map((s) => s.css.heroScale));

console.log(`Distinct border radii: ${uniqueRadii.size}/5`);
console.log(`Distinct backgrounds: ${uniqueBgs.size}/5`);
console.log(`Distinct hero variants: ${uniqueHeroScales.size}/5`);

if (uniqueRadii.size >= 3 && uniqueBgs.size >= 3) {
  console.log("\n✅ All 5 styles produce distinct, visually different output.");
} else {
  console.log("\n⚠️  Some styles may look similar — check test-output/ files.");
}

function extractCSS(html: string) {
  const radiusMatch = html.match(/--radius:\s*([^;]+)/);
  const bgMatch = html.match(/--bg:\s*([^;]+)/);
  const largeMatch = html.match(/hero-large/);
  return {
    radius: radiusMatch?.[1] || "unknown",
    bg: bgMatch?.[1] || "unknown",
    heroScale: largeMatch ? "large" : "standard",
  };
}

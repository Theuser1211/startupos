/**
 * Visual Website Audit — generates all 5 design styles for browser inspection.
 */
import { generateLandingPage } from "../lib/startup/website-generator";
import * as fs from "fs";
import * as path from "path";

const CONFIG = {
  startupName: "VerdeFlow",
  tagline: "AI-Powered FinOps for Modern Teams",
  problem: "Cloud costs are growing 3x faster than engineering teams can track them. Finance teams get surprise bills, engineers get blamed, and leadership lacks visibility into what's actually driving spend.",
  solution: "VerdeFlow provides real-time cloud cost intelligence with automated anomaly detection, budget forecasting, and team-level chargebacks. Deploy in minutes, save 40% on cloud spend within 90 days.",
  brand: {
    mission: "To make cloud cost management as transparent and predictable as your infrastructure.",
    values: ["Radical Transparency", "Engineer Empathy", "Real-Time Intelligence", "Zero Configuration"],
    tone: ["Technical but approachable", "Confident without arrogance", "Data-driven and clear"],
    colors: [
      { name: "Primary", hex: "#7C3AED" },
      { name: "Secondary", hex: "#6366F1" },
      { name: "Dark", hex: "#0A0A0F" },
      { name: "Silver", hex: "#A1A1B5" },
    ],
    typography: { heading: "Inter", body: "Inter" },
  },
  icp: {
    title: "VP of Engineering",
    description: "Engineering leader at a mid-market SaaS company",
    painPoints: [
      "Cloud bills arrive 2 weeks after the month ends — too late to act",
      "No per-team cost allocation, so engineering can't optimize their own usage",
      "Budget forecasting is done in spreadsheets and is always wrong",
      "Anomalies go undetected until the finance team escalates, weeks later",
    ],
  },
  industry: "saas",
};

const STYLES = ["minimal", "bold", "professional", "playful", "tech"] as const;

const OUTPUT_DIR = path.join(__dirname, "..", "test-output");
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

for (const style of STYLES) {
  const html = generateLandingPage({ ...CONFIG, designStyle: style });
  const filepath = path.join(OUTPUT_DIR, `landing-${style}.html`);
  fs.writeFileSync(filepath, html, "utf-8");
  console.log(`✅ Generated ${style} → test-output/landing-${style}.html`);
}

console.log("\nAll 5 design styles generated. Open them in a browser to visually inspect.");

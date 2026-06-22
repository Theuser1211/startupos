import * as fs from "fs";
import * as path from "path";

const STYLES = ["minimal", "bold", "professional", "playful", "tech"];
const DIR = path.join(__dirname, "..", "test-output");

interface StyleProps {
  bg: string;
  radius: string;
  hasLargeHero: boolean;
  hasBadge: boolean;
  hasMetrics: boolean;
  hasGlass: boolean;
  hasOutline: boolean;
  hasGlow: boolean;
}

const results: Record<string, StyleProps> = {};

for (const style of STYLES) {
  const html = fs.readFileSync(path.join(DIR, `landing-${style}.html`), "utf-8");
  const _bodyOnly = html.split("<body")[1] || html;
  const cssOnly = html.split("<style>")[1]?.split("</style>")[0] || "";
  const htmlBody = html.split("</style>")[1] || html;
  
  const bg = html.match(/--bg:\s*(#[a-f0-9]+)/)?.[1] || "?";
  const radius = html.match(/--radius:\s*([^;]+)/)?.[1] || "?";
  
  // Check HTML body only (not CSS) for hero-large
  const htmlLargeHero = htmlBody.includes('class="hero hero-large"');
  
  const hasBadge = htmlBody.includes("hero-badge") || htmlBody.includes("Now Available");
  const hasMetrics = htmlBody.includes("hero-metrics");
  const hasGlass = htmlBody.includes("btn-glass");
  const hasOutline = htmlBody.includes("btn-outline");
  const hasGlow = cssOnly.includes("box-shadow: 0 0 30px");
  
  results[style] = {
    bg, radius,
    hasLargeHero: htmlLargeHero,
    hasBadge, hasMetrics,
    hasGlass, hasOutline,
    hasGlow
  };
  
  console.log(`${style}:`);
  console.log(`  bg=${bg} radius=${radius} hero-large=${htmlLargeHero} badge=${hasBadge} metrics=${hasMetrics} glass=${hasGlass} outline=${hasOutline} glow=${hasGlow}`);
}

// Distinctness check
const stats = {
  bgs: new Set(Object.values(results).map(r => r.bg)).size,
  radii: new Set(Object.values(results).map(r => r.radius)).size,
  heroes: new Set(Object.values(results).map(r => r.hasLargeHero.toString())).size,
  buttons: new Set(Object.values(results).map(r => `${r.hasGlass}-${r.hasOutline}`)).size,
};

console.log("\nDistinctness:");
Object.entries(stats).forEach(([k,v]) => console.log(`  ${k}: ${v}/5`));

// Expected: only bold and tech should have large hero
const heroCorrect = results.bold.hasLargeHero && results.tech.hasLargeHero && 
                    !results.minimal.hasLargeHero && !results.professional.hasLargeHero && !results.playful.hasLargeHero;
console.log(`Hero-large correct (bold+tech only): ${heroCorrect}`);

// Expected: only bold and tech should have metrics/badge
const badgeCorrect = results.bold.hasBadge && results.bold.hasMetrics &&
                     results.tech.hasBadge && results.tech.hasMetrics;
console.log(`Badge+metrics correct (bold+tech only): ${badgeCorrect}`);

// Expected: only playful has glass, only tech has outline
const buttonCorrect = results.playful.hasGlass && results.tech.hasOutline &&
                     !results.minimal.hasGlass && !results.bold.hasGlass && !results.professional.hasGlass &&
                     !results.minimal.hasOutline && !results.bold.hasOutline && !results.professional.hasOutline;
console.log(`Button styles correct: ${buttonCorrect}`);

// Expected: only bold and tech have glow
const glowCorrect = results.bold.hasGlow && results.tech.hasGlow &&
                   !results.minimal.hasGlow && !results.professional.hasGlow && !results.playful.hasGlow;
console.log(`Glow effects correct (bold+tech only): ${glowCorrect}`);

const allOk = heroCorrect && badgeCorrect && buttonCorrect && glowCorrect;
if (allOk) {
  console.log("\nALL DESIGN STYLES VERIFIED");
} else {
  console.log("\nSome checks failed");
  process.exit(1);
}

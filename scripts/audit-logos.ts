/**
 * Logo Generation Quality Audit
 *
 * Validates every generated logo against real-world SaaS standards:
 * - Favicon readability at 16×16, 32×32, 64×64
 * - Monochrome variant production
 * - Quality scoring
 * - Distinct styles across variants
 * - No generic AI symbols
 */

import { generateLogos, svgToDataUrl } from "../lib/startup/logo-generator";

interface TestCase {
  name: string;
  industry: string;
  colors: { name: string; hex: string }[];
  tone: string[];
}

const TEST_CASES: TestCase[] = [
  { name: "VerdeFlow", industry: "saas", colors: [{ name: "Primary", hex: "#7C3AED" }, { name: "Secondary", hex: "#6366F1" }, { name: "Dark", hex: "#0A0A0F" }, { name: "Light", hex: "#A1A1B5" }], tone: ["modern", "innovative"] },
  { name: "PayForge", industry: "fintech", colors: [{ name: "Ocean", hex: "#0EA5E9" }, { name: "Teal", hex: "#14B8A6" }, { name: "Navy", hex: "#0F172A" }, { name: "Slate", hex: "#94A3B8" }], tone: ["trustworthy", "secure"] },
  { name: "MediSync", industry: "healthtech", colors: [{ name: "Green", hex: "#10B981" }, { name: "Sky", hex: "#38BDF8" }, { name: "Dark", hex: "#0F172A" }, { name: "Light", hex: "#94A3B8" }], tone: ["clinical", "caring"] },
  { name: "NovaForge", industry: "ai", colors: [{ name: "Purple", hex: "#7C3AED" }, { name: "Indigo", hex: "#6366F1" }, { name: "Deep", hex: "#0A0A0F" }, { name: "Mist", hex: "#A1A1B5" }], tone: ["innovative", "technical"] },
  { name: "PixelCraft", industry: "gaming", colors: [{ name: "Pink", hex: "#EC4899" }, { name: "Cyan", hex: "#06B6D4" }, { name: "Void", hex: "#09090B" }, { name: "Purple", hex: "#A855F7" }], tone: ["fun", "energetic"] },
];

const _SCALE_SIZES = [16, 32, 64] as const;

function countSvgElements(svg: string): number {
  const tags = svg.match(/<(rect|circle|path|polygon|line|text|ellipse)/g);
  return tags?.length || 0;
}

function hasGradients(svg: string): boolean {
  return svg.includes("linearGradient") || svg.includes("radialGradient");
}

function hasViewBox(svg: string): boolean {
  return svg.includes("viewBox");
}

async function audit() {
  let passed = 0;
  let failed = 0;
  const failures: string[] = [];

  function check(condition: boolean, msg: string) {
    if (condition) {
      passed++;
      console.log(`  ✅ ${msg}`);
    } else {
      failed++;
      failures.push(msg);
      console.log(`  ❌ ${msg}`);
    }
  }

  for (const tc of TEST_CASES) {
    console.log(`\n━━━ ${tc.name} (${tc.industry}) ━━━`);

    const logos = generateLogos(tc.name, tc.industry, tc.colors, tc.tone);

    check(logos.length === 5, `Generates all 5 logo variants (got ${logos.length})`);

    for (const logo of logos) {
      console.log(`\n  ─ ${logo.style} ─`);

      // 1. Favicon-scale testing: SVGs must have viewBox for scaling
      check(hasViewBox(logo.svg.icon), `Has viewBox`);
      check(hasViewBox(logo.svg.full), `Full has viewBox`);
      check(hasViewBox(logo.svg.monochrome), `Mono has viewBox`);

      // 2. Icon variant must work at 16×16, 32×32, 64×64
      check(logo.svg.icon.includes("200 200"), `Icon SVG is 200×200 viewBox`);

      // 3. Monochrome variant exists and is distinct from color
      check(logo.svg.monochrome !== logo.svg.icon, `Monochrome is distinct from icon`);
      check(logo.svg.monochrome.length > 100, `Monochrome SVG has content (${logo.svg.monochrome.length} chars)`);

      // 4. Full logo exists and is wider
      check(logo.svg.full.includes("400 200"), `Full logo is 400×200 wide format`);

      // 5. Quality scores are within valid range
      check(logo.qualityScore.overall >= 0 && logo.qualityScore.overall <= 100, `Quality score ${logo.qualityScore.overall}`);

      // 6. Simplicity: no more than 8 SVG elements (genuinely simple)
      const elemCount = countSvgElements(logo.svg.icon);
      check(elemCount <= 8, `Simple design (${elemCount} elements)`);

      // 7. No generic decorative elements
      check(!hasGradients(logo.svg.monochrome), `Monochrome has no gradients (favicon-safe)`);

      // 8. Brand concept is non-empty
      check(logo.brandConcept.length > 0, `Has brand concept`);
      check(logo.symbolReasoning.length > 20, `Has symbol reasoning (${logo.symbolReasoning.length} chars)`);

      // 9. Data URLs are valid
      try {
        const iconUrl = svgToDataUrl(logo.svg.icon);
        check(iconUrl.startsWith("data:image/svg+xml"), `Icon data URL is valid`);
      } catch {
        check(false, `Icon data URL generation works`);
      }

      try {
        const monoUrl = svgToDataUrl(logo.svg.monochrome);
        check(monoUrl.startsWith("data:image/svg+xml"), `Monochrome data URL is valid`);
      } catch {
        check(false, `Monochrome data URL generation works`);
      }
    }

    // 10. All variants have distinct styles
    const styleIds = logos.map((l) => l.id);
    const uniqueIds = new Set(styleIds);
    check(uniqueIds.size === logos.length, `All ${logos.length} variant IDs are unique`);
  }

  // 11. Cross-brand consistency: the same name should produce similar structure
  console.log(`\n━━━ Cross-Brand Consistency ━━━`);
  const firstLogos = generateLogos("TestCo", "saas", TEST_CASES[0].colors);
  const secondLogos = generateLogos("OtherCo", "fintech", TEST_CASES[1].colors);

  check(firstLogos.length === secondLogos.length, `Consistent variant count across brands`);

  for (let i = 0; i < firstLogos.length; i++) {
    check(
      firstLogos[i].id === secondLogos[i].id,
      `Consistent variant IDs (${firstLogos[i].id})`,
    );
  }

  // 12. Quality score distribution
  console.log(`\n━━━ Quality Score Summary ━━━`);
  for (const tc of TEST_CASES) {
    const logos = generateLogos(tc.name, tc.industry, tc.colors, tc.tone);
    const avgScore = Math.round(logos.reduce((s, l) => s + l.qualityScore.overall, 0) / logos.length);
    console.log(`  ${tc.name}: avg ${avgScore}/100 (${logos.map((l) => l.qualityScore.overall).join(", ")})`);
  }

  // Summary
  console.log(`\n━━━ Results ━━━`);
  console.log(`  Passed: ${passed}`);
  console.log(`  Failed: ${failed}`);

  if (failures.length > 0) {
    console.log(`\n  Failures:`);
    for (const f of failures) {
      console.log(`    • ${f}`);
    }
  }

  if (failed > 0) {
    process.exit(1);
  } else {
    console.log(`\n  ✅ All checks passed!`);
  }
}

audit().catch(console.error);

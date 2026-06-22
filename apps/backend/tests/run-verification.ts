import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";
import {
  generateBlueprintWithFallback,
  generateWebsiteSpecWithFallback,
  generateWebsitePageWithFallback,
} from "../src/services/ai/provider.js";
import { validateRenderedPage, validateRenderedWebsite } from "../src/services/renderer/validate.js";
import { renderHomeFallback, renderGenericFallback } from "../src/services/renderer/fallbacks/home.js";
import type { BlueprintResult, WebsiteSpecResult, WebsiteResult, PageHTMLResult } from "../src/types/ai.js";

const OUTPUT_DIR = join(import.meta.dirname, "..", "test-output");

interface TestResult {
  name: string;
  status: "PASS" | "FAIL" | "WARN";
  details: string;
  data?: unknown;
}

const results: TestResult[] = [];

function log(msg: string) {
  console.log(msg);
}

function record(name: string, status: "PASS" | "FAIL" | "WARN", details: string, data?: unknown) {
  results.push({ name, status, details, data });
  const icon = status === "PASS" ? "✅" : status === "FAIL" ? "❌" : "⚠️";
  log(`${icon} ${name}: ${details}`);
}

function saveFile(filename: string, content: string) {
  const path = join(OUTPUT_DIR, filename);
  writeFileSync(path, content, "utf-8");
  log(`  📄 Saved: ${filename} (${content.length} bytes)`);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function generateFullWebsite(
  name: string,
  description: string,
  industry: string,
  targetAudience: string,
  keyFeatures: string[],
  solution: string,
  outputPrefix: string,
): Promise<{ blueprint: BlueprintResult; spec: WebsiteSpecResult; website: WebsiteResult } | null> {
  log(`\n${"=".repeat(60)}`);
  log(`Generating: ${name}`);
  log(`${"=".repeat(60)}`);

  // Step 1: Blueprint
  log("\n--- Step 1: Blueprint Generation ---");
  const prompt = `${name}: ${description}. Industry: ${industry}. Target: ${targetAudience}.`;
  let blueprint: BlueprintResult;
  try {
    blueprint = await generateBlueprintWithFallback(prompt);
    record(`${name} - Blueprint`, "PASS", `Generated: ${blueprint.name}`);
    log(`  Name: ${blueprint.name}`);
    log(`  Industry: ${blueprint.industry}`);
    log(`  Features: ${blueprint.keyFeatures.join(", ")}`);
    saveFile(`${outputPrefix}-blueprint.json`, JSON.stringify(blueprint, null, 2));
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown";
    record(`${name} - Blueprint`, "FAIL", msg);
    return null;
  }

  // Step 2: WebsiteSpec
  log("\n--- Step 2: WebsiteSpec Generation ---");
  let spec: WebsiteSpecResult;
  try {
    spec = await generateWebsiteSpecWithFallback(blueprint);
    record(`${name} - WebsiteSpec`, "PASS", `Generated ${spec.pages.length} pages`);
    log(`  Pages: ${spec.pages.map((p) => p.name).join(", ")}`);
    log(`  Theme: ${spec.theme.primaryColor} / ${spec.theme.secondaryColor}`);
    log(`  Font: ${spec.theme.fontFamily}`);
    saveFile(`${outputPrefix}-spec.json`, JSON.stringify(spec, null, 2));
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown";
    record(`${name} - WebsiteSpec`, "FAIL", msg);
    return null;
  }

  // Step 3: HTML Generation (per page)
  log("\n--- Step 3: HTML Generation ---");
  const pages: PageHTMLResult[] = [];
  const fallbackPages: string[] = [];

  for (const page of spec.pages) {
    log(`\n  Generating page: ${page.name} (${page.slug})`);
    try {
      const result = await generateWebsitePageWithFallback(blueprint, spec, page);
      pages.push(result);
      log(`  ✅ ${page.name}: ${result.html.length} bytes`);
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Unknown";
      log(`  ⚠️ ${page.name} AI failed, using fallback: ${msg}`);
      fallbackPages.push(page.slug);

      let fallback: PageHTMLResult;
      if (page.slug === "/" || page.name.toLowerCase() === "home") {
        fallback = renderHomeFallback(blueprint, spec.theme, page);
      } else {
        fallback = renderGenericFallback(blueprint, spec.theme, page);
      }
      pages.push(fallback);
      log(`  📄 ${page.name} (fallback): ${fallback.html.length} bytes`);
    }
  }

  const website: WebsiteResult = { pages, css: "", js: "" };

  if (fallbackPages.length > 0) {
    record(
      `${name} - HTML Generation`,
      "WARN",
      `${pages.length} pages generated, ${fallbackPages.length} used fallback: ${fallbackPages.join(", ")}`,
    );
  } else {
    record(`${name} - HTML Generation`, "PASS", `All ${pages.length} pages generated via AI`);
  }

  // Save individual HTML files
  for (const page of pages) {
    const filename = page.slug === "/" ? "index.html" : `${page.slug.replace(/^\//, "").replace(/\//g, "-")}.html`;
    saveFile(`${outputPrefix}-${filename}`, page.html);
  }

  // Save Website.content JSON
  saveFile(`${outputPrefix}-website-content.json`, JSON.stringify(website, null, 2));

  return { blueprint, spec, website };
}

async function runTests() {
  mkdirSync(OUTPUT_DIR, { recursive: true });

  log("╔══════════════════════════════════════════════════════════╗");
  log("║         WEBSITE GENERATION VERIFICATION SPRINT         ║");
  log("╚══════════════════════════════════════════════════════════╝");

  // ═══════════════════════════════════════════════════════════
  // TEST 1 — AI Lawyer
  // ═══════════════════════════════════════════════════════════
  log("\n\n🧪 TEST 1 — AI Lawyer");
  const aiLawyer = await generateFullWebsite(
    "AI Lawyer",
    "AI-powered contract review for small businesses. Upload contracts, identify legal risks, suggest revisions, and generate summaries.",
    "Legal Tech",
    "Small business owners and startup founders",
    ["Contract review", "Risk identification", "Revision suggestions", "Summary generation"],
    "AI-powered legal document analysis platform",
    "test1-ai-lawyer",
  );

  // ═══════════════════════════════════════════════════════════
  // TEST 2 — Industry Diversity
  // ═══════════════════════════════════════════════════════════
  log("\n\n🧪 TEST 2 — Industry Diversity");

  const industries = [
    {
      name: "VetConnect",
      description: "Online marketplace connecting pet owners with licensed veterinarians for virtual consultations, prescription refills, and pet health tracking.",
      industry: "Healthcare / Pet Tech",
      target: "Pet owners seeking convenient veterinary care",
      features: ["Virtual vet consultations", "Prescription management", "Health records", "Emergency triage"],
      solution: "Telemedicine platform for pets",
    },
    {
      name: "ComplianceAI",
      description: "FinTech compliance automation platform that monitors regulatory changes, automates reporting, and flags potential violations in real-time.",
      industry: "FinTech / RegTech",
      target: "Compliance officers at financial institutions",
      features: ["Real-time monitoring", "Automated reporting", "Risk scoring", "Regulatory updates"],
      solution: "AI-powered regulatory compliance automation",
    },
    {
      name: "FitForge",
      description: "AI fitness coach that creates personalized workout plans, tracks nutrition, monitors progress, and adapts programs based on results.",
      industry: "Health & Fitness",
      target: "Health-conscious individuals and gym owners",
      features: ["Personalized plans", "Nutrition tracking", "Progress analytics", "AI coaching"],
      solution: "AI-driven personal fitness and nutrition coaching",
    },
    {
      name: "BuildSite",
      description: "Construction project management CRM with AI-powered scheduling, resource allocation, safety compliance tracking, and client communication.",
      industry: "Construction / PropTech",
      target: "Construction project managers and contractors",
      features: ["Project scheduling", "Resource management", "Safety tracking", "Client portal"],
      solution: "AI-enhanced construction project management",
    },
  ];

  const diversityResults: Array<{ name: string; spec: WebsiteSpecResult; website: WebsiteResult }> = [];

  for (const ind of industries) {
    await sleep(5000);
    const result = await generateFullWebsite(
      ind.name,
      ind.description,
      ind.industry,
      ind.target,
      ind.features,
      ind.solution,
      `test2-${ind.name.toLowerCase()}`,
    );
    if (result) {
      diversityResults.push({ name: ind.name, spec: result.spec, website: result.website });
    }
  }

  // Compare diversity
  log("\n--- Diversity Analysis ---");
  if (diversityResults.length >= 2) {
    const sectionTypes = diversityResults.map((r) =>
      r.spec.pages
        .find((p) => p.slug === "/")
        ?.sections.map((s) => s.type)
        .join(" → "),
    );
    log(`\nHome page section patterns:`);
    diversityResults.forEach((r, i) => {
      log(`  ${r.name}: ${sectionTypes[i]}`);
    });

    const uniquePatterns = new Set(sectionTypes);
    if (uniquePatterns.size === 1 && diversityResults.length > 2) {
      record(
        "Industry Diversity",
        "FAIL",
        `All ${diversityResults.length} websites have identical section pattern: ${sectionTypes[0]}`,
      );
    } else {
      record(
        "Industry Diversity",
        "PASS",
        `${uniquePatterns.size} unique section patterns across ${diversityResults.length} industries`,
      );
    }

    const themes = diversityResults.map((r) => `${r.spec.theme.primaryColor}`);
    log(`\nTheme colors:`);
    diversityResults.forEach((r) => {
      log(`  ${r.name}: ${r.spec.theme.primaryColor} / ${r.spec.theme.secondaryColor} (${r.spec.theme.fontFamily})`);
    });

    const uniqueThemes = new Set(themes);
    record(
      "Theme Diversity",
      uniqueThemes.size >= diversityResults.length - 1 ? "PASS" : "WARN",
      `${uniqueThemes.size} unique primary colors across ${diversityResults.length} sites`,
    );
  }

  // ═══════════════════════════════════════════════════════════
  // TEST 3 — HTML Validation
  // ═══════════════════════════════════════════════════════════
  log("\n\n🧪 TEST 3 — HTML Validation");

  const allWebsites = [
    ...(aiLawyer ? [{ name: "AI Lawyer", website: aiLawyer.website }] : []),
    ...diversityResults.map((r) => ({ name: r.name, website: r.website })),
  ];

  let validationFailures = 0;
  for (const { name, website } of allWebsites) {
    for (const page of website.pages) {
      const issues: string[] = [];

      if (!page.html.includes("<!DOCTYPE html") && !page.html.includes("<html")) {
        issues.push("Missing html tag");
      }
      if (!page.html.includes("<head")) {
        issues.push("Missing head tag");
      }
      if (!page.html.includes("<body")) {
        issues.push("Missing body tag");
      }
      if (page.html.includes("```")) {
        issues.push("Contains markdown fences");
      }
      if (page.html.includes("lorem ipsum") || page.html.includes("Lorem Ipsum")) {
        issues.push("Contains lorem ipsum");
      }
      if (page.html.includes("TODO")) {
        issues.push("Contains TODO marker");
      }
      if (page.html.includes("<placeholder") || page.html.includes("[placeholder")) {
        issues.push("Contains placeholder text");
      }
      if (page.html.includes("undefined") || page.html.includes("null")) {
        issues.push("Contains undefined/null");
      }

      if (issues.length > 0) {
        record(`${name} - ${page.slug} Validation`, "FAIL", issues.join(", "));
        validationFailures++;
      } else {
        record(`${name} - ${page.slug} Validation`, "PASS", "All checks passed");
      }
    }
  }

  // ═══════════════════════════════════════════════════════════
  // TEST 4 — Provider Fallback
  // ═══════════════════════════════════════════════════════════
  log("\n\n🧪 TEST 4 — Provider Fallback");
  await sleep(5000);
  log("Provider fallback testing requires env var manipulation.");
  log("Current providers configured based on .env:");
  log(`  FREELLM_API_KEY: ${process.env.FREELLM_API_KEY ? "SET" : "NOT SET"}`);
  log(`  GROQ_API_KEY: ${process.env.GROQ_API_KEY ? "SET" : "NOT SET"}`);
  log(`  OPENROUTER_API_KEY: ${process.env.OPENROUTER_API_KEY ? "SET" : "NOT SET"}`);

  // Test with current config
  log("\n--- Testing with current provider config ---");
  try {
    const testBlueprint: BlueprintResult = {
      name: "TestCo",
      description: "Test company",
      industry: "Tech",
      targetAudience: "Developers",
      problemStatement: "Testing",
      solution: "Test solution",
      keyFeatures: ["Feature 1"],
      techStack: ["Node.js"],
      monetization: "SaaS",
      competitorAnalysis: ["Competitor 1"],
      roadmap: ["Phase 1"],
    };

    const testSpec: WebsiteSpecResult = {
      pages: [
        {
          name: "Home",
          slug: "/",
          sections: [{ type: "hero", order: 1, content: { headline: "Test" } }],
        },
      ],
      theme: { primaryColor: "#000", secondaryColor: "#fff", fontFamily: "Inter", borderRadius: "8px" },
      components: [],
    };

    const page = await generateWebsitePageWithFallback(testBlueprint, testSpec, testSpec.pages[0]);
    record("Provider Fallback (current config)", "PASS", `Page generated: ${page.html.length} bytes`);
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown";
    record("Provider Fallback (current config)", "FAIL", msg);
  }

  // ═══════════════════════════════════════════════════════════
  // TEST 5 — Large Startup Stress Test
  // ═══════════════════════════════════════════════════════════
  log("\n\n🧪 TEST 5 — Large Startup Stress Test (StartupOS)");
  await sleep(5000);

  const startupOS = await generateFullWebsite(
    "StartupOS",
    "AI-powered founder operating system that validates startup ideas, generates business plans, creates websites, manages deployment, tracks competitors, performs market research, generates branding assets, creates investor decks, and provides growth recommendations.",
    "SaaS / AI",
    "First-time founders and serial entrepreneurs",
    [
      "Idea validation",
      "Business plan generation",
      "Website creation",
      "Deployment management",
      "Competitor tracking",
      "Market research",
      "Branding assets",
      "Investor decks",
      "Growth recommendations",
      "Team collaboration",
    ],
    "All-in-one AI operating system for startup founders",
    "test5-startupos",
  );

  // ═══════════════════════════════════════════════════════════
  // TEST 6 — Browser Preview
  // ═══════════════════════════════════════════════════════════
  log("\n\n🧪 TEST 6 — Browser Preview");

  if (aiLawyer) {
    const homePage = aiLawyer.website.pages.find((p) => p.slug === "/");
    const aboutPage = aiLawyer.website.pages.find((p) => p.slug === "/about");

    if (homePage) {
      saveFile("index.html", homePage.html);
      record("Browser Preview - index.html", "PASS", `Written: ${homePage.html.length} bytes`);
    }
    if (aboutPage) {
      saveFile("about.html", aboutPage.html);
      record("Browser Preview - about.html", "PASS", `Written: ${aboutPage.html.length} bytes`);
    }

    // Check for responsive CSS
    if (homePage) {
      const hasMediaQuery = homePage.html.includes("@media");
      const hasViewport = homePage.html.includes("viewport");
      record(
        "Responsive Layout",
        hasMediaQuery && hasViewport ? "PASS" : "WARN",
        `Media queries: ${hasMediaQuery}, Viewport meta: ${hasViewport}`,
      );
    }
  }

  // ═══════════════════════════════════════════════════════════
  // SUMMARY
  // ═══════════════════════════════════════════════════════════
  log("\n\n╔══════════════════════════════════════════════════════════╗");
  log("║                    VERIFICATION SUMMARY                ║");
  log("╚══════════════════════════════════════════════════════════╝");

  const passed = results.filter((r) => r.status === "PASS").length;
  const failed = results.filter((r) => r.status === "FAIL").length;
  const warned = results.filter((r) => r.status === "WARN").length;

  log(`\nTotal: ${results.length} tests`);
  log(`✅ Passed: ${passed}`);
  log(`❌ Failed: ${failed}`);
  log(`⚠️  Warnings: ${warned}`);

  log("\nResults by test:");
  for (const r of results) {
    const icon = r.status === "PASS" ? "✅" : r.status === "FAIL" ? "❌" : "⚠️";
    log(`  ${icon} ${r.name}: ${r.details}`);
  }

  // Save verification report
  const report = {
    timestamp: new Date().toISOString(),
    summary: { total: results.length, passed, failed, warned },
    results,
  };
  saveFile("verification-report.json", JSON.stringify(report, null, 2));

  if (failed > 0) {
    log("\n🚨 LAUNCH BLOCKERS FOUND:");
    for (const r of results.filter((r) => r.status === "FAIL")) {
      log(`  ❌ ${r.name}: ${r.details}`);
    }
  } else {
    log("\n✅ No launch blockers found.");
  }
}

runTests().catch((error) => {
  console.error("Test runner failed:", error);
  process.exit(1);
});

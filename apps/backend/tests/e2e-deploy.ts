import { buildDeployFiles } from "../src/services/deploy/builder.js";
import { VercelProvider } from "../src/services/deploy/vercel.js";
import { verifyDeployment } from "../src/services/deploy/verify.js";
import { generateBlueprintWithFallback, generateWebsiteSpecWithFallback, generateWebsitePageWithFallback } from "../src/services/ai/provider.js";
import { renderHomeFallback, renderGenericFallback } from "../src/services/renderer/fallbacks/home.js";
import type { WebsiteResult, PageHTMLResult } from "../src/types/ai.js";

async function main() {
  console.log("=== E2E Deployment Test ===\n");

  // Step 1: Generate blueprint
  console.log("Step 1: Generating blueprint...");
  const blueprint = await generateBlueprintWithFallback(
    "AI Lawyer: AI-powered contract review for small businesses. Upload contracts, identify legal risks, suggest revisions."
  );
  console.log(`  Blueprint: ${blueprint.name} (${blueprint.industry})`);

  // Step 2: Generate WebsiteSpec
  console.log("\nStep 2: Generating WebsiteSpec...");
  const spec = await generateWebsiteSpecWithFallback(blueprint);
  console.log(`  Pages: ${spec.pages.map(p => p.name).join(", ")}`);
  console.log(`  Theme: ${spec.theme.primaryColor} / ${spec.theme.secondaryColor}`);

  // Step 3: Generate HTML pages
  console.log("\nStep 3: Generating HTML pages...");
  const pages: PageHTMLResult[] = [];
  for (const page of spec.pages) {
    try {
      const result = await generateWebsitePageWithFallback(blueprint, spec, page);
      pages.push(result);
      console.log(`  ✅ ${page.name}: ${result.html.length} bytes`);
    } catch {
      console.log(`  ⚠️ ${page.name}: using fallback`);
      const fallback = page.slug === "/" || page.name.toLowerCase() === "home"
        ? renderHomeFallback(blueprint, spec.theme, page)
        : renderGenericFallback(blueprint, spec.theme, page);
      pages.push(fallback);
    }
  }

  const website: WebsiteResult = { pages, css: "", js: "" };

  // Step 4: Build deploy files
  console.log("\nStep 4: Building deploy files...");
  const files = buildDeployFiles(website);
  for (const f of files) {
    console.log(`  📄 ${f.path} (${f.content.length} bytes)`);
  }

  // Step 5: Deploy to Vercel
  console.log("\nStep 5: Deploying to Vercel...");
  const provider = new VercelProvider();
  const result = await provider.deploy(files, "ai-lawyer-e2e-test");
  console.log(`  Deployment ID: ${result.deploymentId}`);
  console.log(`  URL: ${result.url}`);

  // Step 6: Wait and verify
  console.log("\nStep 6: Waiting 10s for Vercel propagation...");
  await new Promise(r => setTimeout(r, 10000));

  console.log("\nStep 7: Verifying deployment...");
  const verification = await verifyDeployment(provider, result.url, 3, 5000);
  console.log(`  Reachable: ${verification.reachable}`);
  console.log(`  Status Code: ${verification.statusCode}`);
  console.log(`  Has Content: ${verification.hasContent}`);
  if (verification.error) console.log(`  Error: ${verification.error}`);

  console.log("\n=== RESULT ===");
  if (verification.reachable && verification.hasContent) {
    console.log(`✅ DEPLOYMENT SUCCESSFUL`);
    console.log(`🌐 URL: ${result.url}`);
  } else {
    console.log(`❌ DEPLOYMENT FAILED`);
    console.log(`   Status: ${verification.statusCode}, Content: ${verification.hasContent}`);
  }
}

main().catch(console.error);

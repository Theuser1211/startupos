import { buildDeployFiles } from "../src/services/deploy/builder.js";
import { VercelProvider } from "../src/services/deploy/vercel.js";
import { verifyDeployment } from "../src/services/deploy/verify.js";
import type { WebsiteResult } from "../src/types/ai.js";

const mockWebsite: WebsiteResult = {
  pages: [
    {
      slug: "/",
      title: "AI Lawyer",
      html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AI Lawyer - AI-Powered Contract Review</title>
  <meta name="description" content="AI-powered contract review for small businesses">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
  <style>
    :root { --primary: #3498db; --secondary: #2c3e50; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Inter', sans-serif; color: #333; }
    header { background: var(--primary); color: white; padding: 16px 24px; display: flex; justify-content: space-between; align-items: center; }
    .logo { font-size: 1.5rem; font-weight: 700; }
    nav a { color: white; text-decoration: none; margin-left: 24px; }
    .hero { padding: 80px 24px; text-align: center; background: linear-gradient(135deg, var(--primary), var(--secondary)); color: white; }
    .hero h1 { font-size: 3rem; margin-bottom: 16px; }
    .hero p { font-size: 1.2rem; max-width: 600px; margin: 0 auto 32px; opacity: 0.9; }
    .cta { display: inline-block; padding: 14px 32px; background: white; color: var(--primary); border-radius: 8px; font-weight: 600; text-decoration: none; }
    .features { padding: 60px 24px; max-width: 1000px; margin: 0 auto; }
    .features h2 { text-align: center; font-size: 2rem; margin-bottom: 40px; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 24px; }
    .card { padding: 24px; border: 1px solid #eee; border-radius: 8px; }
    .card h3 { margin-bottom: 8px; color: var(--primary); }
    footer { padding: 24px; text-align: center; background: var(--secondary); color: white; }
    @media (max-width: 768px) { .hero h1 { font-size: 2rem; } }
  </style>
</head>
<body>
  <header>
    <div class="logo">AI Lawyer</div>
    <nav><a href="#features">Features</a><a href="#contact">Contact</a></nav>
  </header>
  <main>
    <section class="hero">
      <h1>AI-Powered Contract Review</h1>
      <p>Upload contracts, identify legal risks, suggest revisions, and generate summaries — all powered by AI.</p>
      <a href="#features" class="cta">Get Started</a>
    </section>
    <section class="features" id="features">
      <h2>Key Features</h2>
      <div class="grid">
        <div class="card"><h3>Risk Identification</h3><p>AI scans your contracts and flags potential legal risks before you sign.</p></div>
        <div class="card"><h3>Revision Suggestions</h3><p>Get AI-powered recommendations for contract modifications.</p></div>
        <div class="card"><h3>Summary Generation</h3><p>Instant plain-English summaries of complex legal documents.</p></div>
      </div>
    </section>
  </main>
  <footer><p>&copy; 2026 AI Lawyer. All rights reserved.</p></footer>
</body>
</html>`,
    },
    {
      slug: "/about",
      title: "About AI Lawyer",
      html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>About - AI Lawyer</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Inter', sans-serif; color: #333; }
    header { background: #3498db; color: white; padding: 16px 24px; }
    .content { max-width: 700px; margin: 40px auto; padding: 0 24px; }
    h1 { margin-bottom: 16px; }
    p { line-height: 1.8; margin-bottom: 16px; }
    footer { padding: 24px; text-align: center; background: #2c3e50; color: white; margin-top: 60px; }
  </style>
</head>
<body>
  <header><div style="font-size:1.5rem;font-weight:700">AI Lawyer</div></header>
  <div class="content">
    <h1>About AI Lawyer</h1>
    <p>We help small businesses navigate legal complexities with AI-powered contract analysis. Our platform saves time, reduces risk, and makes legal review accessible to everyone.</p>
    <p>Founded in 2026, AI Lawyer has helped thousands of businesses review contracts faster and more accurately than traditional methods.</p>
  </div>
  <footer><p>&copy; 2026 AI Lawyer</p></footer>
</body>
</html>`,
    },
  ],
  css: "",
  js: "",
};

async function main() {
  console.log("=== E2E Deployment Test (Mock Website) ===\n");

  // Step 1: Build deploy files
  console.log("Step 1: Building deploy files...");
  const files = buildDeployFiles(mockWebsite);
  for (const f of files) {
    console.log(`  📄 ${f.path} (${f.content.length} bytes)`);
  }

  // Step 2: Deploy to Vercel
  console.log("\nStep 2: Deploying to Vercel...");
  const provider = new VercelProvider();
  const result = await provider.deploy(files, "ai-lawyer-e2e");
  console.log(`  Deployment ID: ${result.deploymentId}`);
  console.log(`  URL: ${result.url}`);

  // Step 3: Wait for Vercel propagation
  console.log("\nStep 3: Waiting 15s for Vercel propagation...");
  await new Promise(r => setTimeout(r, 15000));

  // Step 4: Verify deployment
  console.log("\nStep 4: Verifying deployment...");
  const verification = await verifyDeployment(provider, result.url, 5, 5000);
  console.log(`  Reachable: ${verification.reachable}`);
  console.log(`  Status Code: ${verification.statusCode}`);
  console.log(`  Has Content: ${verification.hasContent}`);
  if (verification.error) console.log(`  Error: ${verification.error}`);

  console.log("\n=== RESULT ===");
  if (verification.reachable && verification.hasContent) {
    console.log(`✅ DEPLOYMENT SUCCESSFUL`);
    console.log(`🌐 Open in browser: ${result.url}`);
  } else {
    console.log(`❌ DEPLOYMENT FAILED`);
    console.log(`   Status: ${verification.statusCode}, Content: ${verification.hasContent}`);
  }
}

main().catch(console.error);

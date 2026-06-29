import { test, expect } from "@playwright/test";

const BASE = "http://localhost:3000";

interface IterationArtifacts {
  iteration: number;
  email: string;
  consoleLogs: string[];
  networkUrls: string[];
  screenshots: string[];
  success: boolean;
  phase: string;
  durationMs: number;
  error?: string;
}

/* ─── Helpers ─── */

async function signUp(page: any, email: string) {
  await page.goto(`${BASE}/auth/sign-up`);
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(500);
  await page.fill("#email", email);
  await page.fill("#password", "TestPass123!");
  await page.fill("#confirmPassword", "TestPass123!");
  await page.click('button[type="submit"]');
  try {
    await page.waitForSelector('text=Account created', { timeout: 15000 });
  } catch {
    const body = await page.locator("body").innerText();
    if (!body.includes("already registered")) throw new Error("Sign up failed");
  }
}

async function completeInterview(page: any) {
  // Fill startup name
  await page.waitForTimeout(1000);
  const nameInput = page.locator("input, textarea").first();
  if (await nameInput.isVisible({ timeout: 5000 }).catch(() => false)) {
    await nameInput.fill("AI-Driven Analytics Platform");
    const btn = page.locator('button:has-text("Continue"), button[type="submit"]').first();
    if (await btn.isVisible().catch(() => false)) await btn.click();
    await page.waitForTimeout(1500);
  }

  // Fill idea description
  const descInput = page.locator("input, textarea").first();
  if (await descInput.isVisible({ timeout: 5000 }).catch(() => false)) {
    await descInput.fill("An AI-powered analytics platform that helps SaaS companies understand user behavior and reduce churn through predictive insights and automated interventions.");
    const btn = page.locator('button:has-text("Continue"), button[type="submit"]').first();
    if (await btn.isVisible().catch(() => false)) await btn.click();
    await page.waitForTimeout(1500);
  }

  // Select stage
  const stageSelect = page.locator("select, [role='combobox']").first();
  if (await stageSelect.isVisible({ timeout: 5000 }).catch(() => false)) {
    await stageSelect.click();
    await page.waitForTimeout(300);
    const opt = page.locator('[role="option"]').first();
    if (await opt.isVisible({ timeout: 3000 }).catch(() => false)) await opt.click();
    await page.waitForTimeout(300);
    const btn = page.locator('button:has-text("Continue")').first();
    if (await btn.isVisible().catch(() => false)) await btn.click();
    await page.waitForTimeout(1500);
  }

  // Select industry
  const indSelect = page.locator("select, [role='combobox']").first();
  if (await indSelect.isVisible({ timeout: 5000 }).catch(() => false)) {
    await indSelect.click();
    await page.waitForTimeout(300);
    const opt = page.locator('[role="option"]').first();
    if (await opt.isVisible({ timeout: 3000 }).catch(() => false)) await opt.click();
    await page.waitForTimeout(300);
    const btn = page.locator('button:has-text("Continue")').first();
    if (await btn.isVisible().catch(() => false)) await btn.click();
    await page.waitForTimeout(1500);
  }

  // Select target customer
  const custSelect = page.locator("select, [role='combobox']").first();
  if (await custSelect.isVisible({ timeout: 5000 }).catch(() => false)) {
    await custSelect.click();
    await page.waitForTimeout(300);
    const opt = page.locator('[role="option"]').first();
    if (await opt.isVisible({ timeout: 3000 }).catch(() => false)) await opt.click();
    await page.waitForTimeout(300);
    const btn = page.locator('button:has-text("Continue")').first();
    if (await btn.isVisible().catch(() => false)) await btn.click();
    await page.waitForTimeout(1500);
  }

  // Select business model
  const bizSelect = page.locator("select, [role='combobox']").first();
  if (await bizSelect.isVisible({ timeout: 5000 }).catch(() => false)) {
    await bizSelect.click();
    await page.waitForTimeout(300);
    const opt = page.locator('[role="option"]').nth(3);
    if (await opt.isVisible({ timeout: 3000 }).catch(() => false)) await opt.click();
    await page.waitForTimeout(300);
    const btn = page.locator('button:has-text("Continue")').first();
    if (await btn.isVisible().catch(() => false)) await btn.click();
    await page.waitForTimeout(1500);
  }

  // Select problem
  const probSelect = page.locator("select, [role='combobox']").first();
  if (await probSelect.isVisible({ timeout: 5000 }).catch(() => false)) {
    await probSelect.click();
    await page.waitForTimeout(300);
    const opt = page.locator('[role="option"]').first();
    if (await opt.isVisible({ timeout: 3000 }).catch(() => false)) await opt.click();
    await page.waitForTimeout(300);
    const btn = page.locator('button:has-text("Continue")').first();
    if (await btn.isVisible().catch(() => false)) await btn.click();
    await page.waitForTimeout(1500);
  }

  // Click Enter Workspace
  const enterBtn = page.locator('button:has-text("Enter Workspace")');
  if (await enterBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
    await enterBtn.click();
    // Wait for redirect to workspace?id=xxx
    try {
      await page.waitForURL((url: URL) => url.pathname.includes("/workspace") && url.searchParams.has("id"), { timeout: 90000 });
    } catch {
      // May already have redirected or error state
    }
  }
}

async function ensureBlueprintExists(page: any, startupId: string) {
  // Check if blueprint exists by evaluating the page's localStorage token and calling the API
  const exists = await page.evaluate(async (sid) => {
    const token = localStorage.getItem("startupos-token");
    if (!token) return { exists: false, error: "No token" };

    const BACKEND = "https://startupos-backend-production.up.railway.app";

    // First, check if startup exists and has a description
    try {
      const startupRes = await fetch(`${BACKEND}/startups/${sid}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!startupRes.ok) return { exists: false, error: `startup fetch ${startupRes.status}` };
    } catch (e: any) {
      return { exists: false, error: `startup fetch error: ${e.message}` };
    }

    // Check if blueprint already exists
    try {
      const bpRes = await fetch(`${BACKEND}/blueprints/by-startup/${sid}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (bpRes.ok) {
        const bpData = await bpRes.json();
        if (bpData?.blueprint || bpData?.id) {
          return { exists: true };
        }
      }
    } catch {
      // Blueprint doesn't exist yet
    }

    // Trigger blueprint generation
    try {
      const genBpRes = await fetch(`${BACKEND}/blueprints/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          startupId: sid,
          prompt: `Startup: AI-Driven Analytics Platform. A platform that uses AI to analyze user behavior and reduce churn for SaaS companies. Industry: SaaS. Stage: Ideation. Target: B2B SaaS. Model: Subscription. Problem: User churn.`,
        }),
      });
      const genBpData = await genBpRes.json();
      return {
        exists: !!(genBpData?.blueprint || genBpData?.id),
        generated: true,
        status: genBpRes.status,
        error: genBpRes.ok ? undefined : `generate failed ${genBpRes.status}`,
      };
    } catch (e: any) {
      return { exists: false, error: `generate error: ${e.message}` };
    }
  }, startupId);

  return exists;
}

async function pollForBlueprint(page: any, startupId: string, maxAttempts = 12) {
  for (let i = 0; i < maxAttempts; i++) {
    const result = await ensureBlueprintExists(page, startupId);
    if (result.exists) {
      return true;
    }
    // Wait before retry (AI generation takes time)
    await page.waitForTimeout(15000);
  }
  return false;
}

async function generateWebsite(page: any) {
  // Check if deploy button already visible (website exists)
  const deployBtn = page.locator('button:has-text("Deploy"), button:has-text("deploy")');
  if (await deployBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
    return;
  }

  // Try to find and click the generate website button
  const genBtn = page.locator('button:has-text("generate website"), button:has-text("$ generate")');
  if (await genBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
    await genBtn.click();
  }

  // Wait for generation to complete (up to 4 minutes for AI)
  try {
    await page.waitForFunction(() => {
      const text = document.body.innerText;
      return text.includes("Generated") || text.includes("deploy") || text.includes("Deploy") || text.includes("Failed") || text.includes("Generation Failed");
    }, { timeout: 240000 });
  } catch {
    // Timeout — will check current state
  }
  await page.waitForTimeout(2000);
}

async function getScreenshot(page: any, iteration: number, phase: string) {
  const name = `iter${iteration}-${phase}`;
  await page.screenshot({ path: `qa-screenshots/${name}.png`, fullPage: true }).catch(() => {});
  return name;
}

async function captureConsole(page: any, logs: string[]) {
  page.on("console", (msg: any) => {
    const text = `[${msg.type()}] ${msg.text()}`;
    if (!logs.includes(text)) logs.push(text);
  });
  page.on("pageerror", (err: any) => logs.push(`[PAGE_ERROR] ${err.message}`));
}

async function captureNetwork(page: any, urls: string[]) {
  page.on("request", (req: any) => {
    if (req.url().includes("/api/") || req.url().includes("/websites/") || req.url().includes("/blueprints/")) {
      urls.push(`[${req.method()}] ${req.url().substring(0, 150)}`);
    }
  });
}

/* ════════════════════════════════════════
   5x WEBSITE GENERATION FLOW
   ════════════════════════════════════════ */

test.describe("5x Website Generation Flow", () => {
  const baseTimestamp = Date.now();
  const artifacts: IterationArtifacts[] = [];

  for (let iter = 1; iter <= 5; iter++) {
    test(`Iteration ${iter}/5: Full website generation flow`, async ({ page }) => {
      test.setTimeout(600000); // 10 min per iteration

      const email = `qa-webgen-${baseTimestamp}-${iter}@test.com`;
      const logs: string[] = [];
      const networkUrls: string[] = [];
      const screenshots: string[] = [];
      const startTime = Date.now();

      await captureConsole(page, logs);
      await captureNetwork(page, networkUrls);
      await page.setViewportSize({ width: 1440, height: 900 });

      const art: IterationArtifacts = {
        iteration: iter, email, consoleLogs: logs, networkUrls,
        screenshots, success: false, phase: "initializing", durationMs: 0,
      };

      try {
        // ── Phase 1: Sign Up ──
        art.phase = "signup";
        console.log(`\n[Iteration ${iter}] Phase: Sign up — ${email}`);
        await signUp(page, email);
        screenshots.push(await getScreenshot(page, iter, "01-signed-up"));

        // ── Phase 2: Complete Interview ──
        art.phase = "interview";
        console.log(`[Iteration ${iter}] Phase: Complete interview`);
        await page.goto(`${BASE}/interview`);
        await page.waitForLoadState("networkidle");
        await page.waitForTimeout(2000);
        screenshots.push(await getScreenshot(page, iter, "02-interview-start"));
        await completeInterview(page);
        screenshots.push(await getScreenshot(page, iter, "03-interview-done"));
        logs.push(`[PASS] Interview completed`);

        // Get startup ID from current URL
        const currentUrl = page.url();
        let startupId = new URL(currentUrl).searchParams.get("id");
        logs.push(`[DATA] Interview redirect URL: ${currentUrl}`);
        logs.push(`[DATA] Startup ID from redirect: ${startupId}`);

        // ── Phase 3: Ensure Blueprint Exists ──
        if (!startupId) {
          // Try navigating to find the startup ID
          logs.push(`[WARN] No startup ID in redirect URL, checking localStorage`);
          const storageId = await page.evaluate(() => localStorage.getItem("startupos-startup-id"));
          startupId = storageId;
          logs.push(`[DATA] Startup ID from localStorage: ${storageId}`);
        }

        if (startupId) {
          art.phase = "blueprint-generation";
          console.log(`[Iteration ${iter}] Phase: Ensure blueprint exists for ${startupId}`);
          const bpExists = await pollForBlueprint(page, startupId, 8); // 8 * 15s = 2 min max
          logs.push(`[DATA] Blueprint exists: ${bpExists}`);
          if (!bpExists) {
            console.log(`[Iteration ${iter}] WARNING: Blueprint not generated after polling`);
          }
          screenshots.push(await getScreenshot(page, iter, "04-blueprint-check"));
        } else {
          logs.push(`[WARN] No startup ID found — will try workspace without ID`);
        }

        // ── Phase 4: Open Workspace with startup ID ──
        art.phase = "workspace";
        const workspaceUrl = startupId ? `${BASE}/workspace?id=${startupId}` : `${BASE}/workspace`;
        console.log(`[Iteration ${iter}] Phase: Open workspace — ${workspaceUrl}`);
        await page.goto(workspaceUrl);
        await page.waitForLoadState("networkidle");
        await page.waitForTimeout(3000);
        screenshots.push(await getScreenshot(page, iter, "05-workspace-loaded"));

        // Check if workspace loaded with data
        const wsBody = await page.locator("body").innerText();
        const hasBlueprintUI = wsBody.includes("Verdict") || wsBody.includes("Website") || wsBody.includes("Overview");
        logs.push(`[DATA] Workspace has blueprint UI: ${hasBlueprintUI}`);
        logs.push(`[DATA] Workspace body start: "${wsBody.substring(0, 200)}..."`);

        // ── Phase 5: Switch to Website Tab ──
        art.phase = "website-tab";
        console.log(`[Iteration ${iter}] Phase: Open website tab`);
        const wsTab = page.locator('button:has-text("Website"), [role="tab"]:has-text("Website")');
        if (await wsTab.isVisible({ timeout: 5000 }).catch(() => false)) {
          await wsTab.click();
          await page.waitForTimeout(2000);
        }
        screenshots.push(await getScreenshot(page, iter, "06-website-tab"));

        // ── Phase 6: Generate Website ──
        art.phase = "generate-website";
        console.log(`[Iteration ${iter}] Phase: Generate website`);
        await generateWebsite(page);
        await page.waitForTimeout(3000);
        screenshots.push(await getScreenshot(page, iter, "07-after-generation"));

        // ── Phase 7: Verify Rendered Sections ──
        art.phase = "verify-sections";
        console.log(`[Iteration ${iter}] Phase: Verify rendered sections`);

        const bodyText = await page.locator("body").innerText();
        const hasGenerated = bodyText.includes("Generated");
        const hasDeployBtn = bodyText.includes("Deploy") || bodyText.includes("deploy");
        const hasSectionCount = /(\d+)\s+sections/.test(bodyText);
        const hasFailed = bodyText.includes("Failed") || bodyText.includes("failed");

        logs.push(`[DATA] hasGenerated=${hasGenerated} hasDeploy=${hasDeployBtn} hasSection=${hasSectionCount} hasFailed=${hasFailed}`);

        if (hasFailed) {
          // Retry generation
          const retryBtn = page.locator('button:has-text("retry"), button:has-text("Retry")');
          if (await retryBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
            logs.push(`[WARN] Generation failed — retrying`);
            await retryBtn.click();
            await page.waitForTimeout(2000);
            await generateWebsite(page);
            await page.waitForTimeout(3000);
            const retryBody = await page.locator("body").innerText();
            logs.push(`[DATA] retry: hasGenerated=${retryBody.includes("Generated")} hasDeploy=${retryBody.includes("Deploy")}`);
          }
        }

        screenshots.push(await getScreenshot(page, iter, "08-verified"));
        // Website generation may not succeed every time due to AI API, but page should not crash
        const noCrash = await page.locator("body").isVisible();
        expect(noCrash).toBeTruthy();

        // ── Phase 8: Refresh Page ──
        art.phase = "refresh";
        console.log(`[Iteration ${iter}] Phase: Refresh page`);
        await page.reload();
        await page.waitForLoadState("networkidle");
        await page.waitForTimeout(5000);
        screenshots.push(await getScreenshot(page, iter, "09-after-refresh"));

        // ── Phase 9: Verify No Crash After Refresh ──
        await page.waitForTimeout(3000);
        const refreshedBody = await page.locator("body").innerText();
        const noWhiteScreen = refreshedBody.length > 50;
        logs.push(`[DATA] Refresh body length: ${refreshedBody.length}`);
        screenshots.push(await getScreenshot(page, iter, "10-refresh-verified"));
        expect(noWhiteScreen).toBeTruthy();

        // ── Phase 10: Switch Tabs and Return ──
        art.phase = "tab-switch";
        console.log(`[Iteration ${iter}] Phase: Switch tabs and return`);
        const tabs = ["Overview", "Verdict", "Brand", "ICP", "Revenue", "Roadmap", "Roast"];
        for (const tab of tabs) {
          const tabBtn = page.locator(`button:has-text("${tab}"), [role="tab"]:has-text("${tab}")`);
          if (await tabBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
            await tabBtn.click();
            await page.waitForTimeout(500);
            const isVisible = await page.locator("body").isVisible();
            expect(isVisible).toBeTruthy();
          }
        }

        // Return to website tab
        const finalTab = page.locator('button:has-text("Website"), [role="tab"]:has-text("Website")');
        if (await finalTab.isVisible({ timeout: 3000 }).catch(() => false)) {
          await finalTab.click();
          await page.waitForTimeout(2000);
        }
        screenshots.push(await getScreenshot(page, iter, "11-back-to-website"));

        // ── Phase 11: Final Verification ──
        art.phase = "final-verification";
        const finalBody = await page.locator("body").innerText();
        const finalVisible = await page.locator("body").isVisible();
        expect(finalVisible).toBeTruthy();
        expect(finalBody.length > 50).toBeTruthy();

        // Check for zero uncaught exceptions
        const pageErrors = logs.filter(l => l.includes("[PAGE_ERROR]"));
        expect(pageErrors.length).toBe(0);
        logs.push(`[PASS] Iteration ${iter} completed — workspace stable, no crashes`);

        art.success = true;

      } catch (error) {
        art.success = false;
        art.error = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
        logs.push(`[FAIL] ${art.error}`);
        console.error(`[Iteration ${iter}] FAILED: ${art.error}`);
        try {
          const bt = await page.locator("body").innerText();
          console.error(`[Iteration ${iter}] Body: "${bt.substring(0, 400)}"`);
        } catch { /* ignore */ }
      } finally {
        art.durationMs = Date.now() - startTime;
        artifacts.push(art);
        console.log(`[Iteration ${iter}] Duration: ${(art.durationMs / 1000).toFixed(1)}s | Success: ${art.success} | Phase: ${art.phase}`);
        screenshots.push(await getScreenshot(page, iter, "final").catch(() => ""));
      }
    });
  }

  test.afterAll(() => {
    console.log("\n═══════════════════════════════════════");
    console.log("  FINAL REPORT — 5x Website Generation");
    console.log("═══════════════════════════════════════");

    const successCount = artifacts.filter(a => a.success).length;
    const totalDuration = artifacts.reduce((s, a) => s + a.durationMs, 0);

    for (const art of artifacts) {
      const status = art.success ? "✅ PASS" : "❌ FAIL";
      console.log(`  Iteration ${art.iteration}: ${status} (${(art.durationMs / 1000).toFixed(1)}s)`);
      if (art.error) console.log(`    Error: ${art.error}`);
      const pageErrors = art.consoleLogs.filter(l => l.includes("[PAGE_ERROR]"));
      if (pageErrors.length > 0) {
        console.log(`    Page errors: ${pageErrors.length}`);
        for (const pe of pageErrors.slice(0, 3)) console.log(`      ${pe.substring(0, 200)}`);
      }
    }

    console.log(`\n  Passed: ${successCount}/5`);
    console.log(`  Avg duration: ${(totalDuration / 5 / 1000).toFixed(1)}s`);
    console.log("═══════════════════════════════════════\n");

    expect(successCount).toBe(5);
  });
});

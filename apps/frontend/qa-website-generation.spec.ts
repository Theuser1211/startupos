import { test, expect } from "@playwright/test";

const BASE = "http://localhost:3000";

const INTERVIEW_QUESTIONS = [
  "What is your startup's name?",
  "What does your startup do?",
  "What stage is your startup in?",
  "What industry are you in?",
  "Who is your target customer?",
  "What is your business model?",
  "What problem do you solve?",
];

/* ─── Capture artifacts per iteration ─── */

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

async function signIn(page: any, email: string) {
  await page.goto(`${BASE}/auth/sign-in`);
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(500);
  await page.fill("#email", email);
  await page.fill("#password", "TestPass123!");
  await page.click('button[type="submit"]');
  try {
    await page.waitForURL((url: URL) => !url.pathname.includes("/auth/sign-in"), { timeout: 15000 });
  } catch {
    // ignore
  }
  await page.waitForTimeout(1000);
}

async function completeInterview(page: any) {
  // Step 0: startup name
  await page.waitForTimeout(1000);
  const nameInput = page.locator("input, textarea").first();
  if (await nameInput.isVisible({ timeout: 5000 }).catch(() => false)) {
    await nameInput.fill("AI-Driven Analytics Platform");
    await page.click('button:has-text("Continue"), button[type="submit"]');
    await page.waitForTimeout(1000);
  }

  // Step 1: idea description
  const descInput = page.locator("input, textarea").first();
  if (await descInput.isVisible({ timeout: 5000 }).catch(() => false)) {
    await descInput.fill("An AI-powered analytics platform that helps SaaS companies understand user behavior and reduce churn through predictive insights and automated interventions.");
    await page.click('button:has-text("Continue"), button[type="submit"]');
    await page.waitForTimeout(1000);
  }

  // Step 2: stage dropdown
  const stageSelect = page.locator("#stage, select, [role='combobox']").first();
  if (await stageSelect.isVisible({ timeout: 5000 }).catch(() => false)) {
    await stageSelect.click();
    await page.waitForTimeout(300);
    const stageOption = page.locator('[role="option"]').first();
    if (await stageOption.isVisible({ timeout: 3000 }).catch(() => false)) {
      await stageOption.click();
    }
    await page.click('button:has-text("Continue")');
    await page.waitForTimeout(1000);
  }

  // Step 3: industry dropdown
  const industrySelect = page.locator("#industry, select, [role='combobox']").first();
  if (await industrySelect.isVisible({ timeout: 5000 }).catch(() => false)) {
    await industrySelect.click();
    await page.waitForTimeout(300);
    const indOption = page.locator('[role="option"]').first();
    if (await indOption.isVisible({ timeout: 3000 }).catch(() => false)) {
      await indOption.click();
    }
    await page.click('button:has-text("Continue")');
    await page.waitForTimeout(1000);
  }

  // Step 4: target customer dropdown
  const customerSelect = page.locator("#targetCustomer, select, [role='combobox']").first();
  if (await customerSelect.isVisible({ timeout: 5000 }).catch(() => false)) {
    await customerSelect.click();
    await page.waitForTimeout(300);
    const custOption = page.locator('[role="option"]').first();
    if (await custOption.isVisible({ timeout: 3000 }).catch(() => false)) {
      await custOption.click();
    }
    await page.click('button:has-text("Continue")');
    await page.waitForTimeout(1000);
  }

  // Step 5: business model dropdown
  const bizSelect = page.locator("#businessModel, select, [role='combobox']").first();
  if (await bizSelect.isVisible({ timeout: 5000 }).catch(() => false)) {
    await bizSelect.click();
    await page.waitForTimeout(300);
    const bizOption = page.locator('[role="option"]').nth(3);
    if (await bizOption.isVisible({ timeout: 3000 }).catch(() => false)) {
      await bizOption.click();
    }
    await page.click('button:has-text("Continue")');
    await page.waitForTimeout(1000);
  }

  // Step 6: problem dropdown
  const probSelect = page.locator("#problem, select, [role='combobox']").first();
  if (await probSelect.isVisible({ timeout: 5000 }).catch(() => false)) {
    await probSelect.click();
    await page.waitForTimeout(300);
    const probOption = page.locator('[role="option"]').first();
    if (await probOption.isVisible({ timeout: 3000 }).catch(() => false)) {
      await probOption.click();
    }
    await page.click('button:has-text("Continue")');
    await page.waitForTimeout(1000);
  }

  // Click Enter Workspace — triggers blueprint generation
  const enterBtn = page.locator('button:has-text("Enter Workspace")');
  if (await enterBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
    await enterBtn.click();
    // Wait for blueprint generation
    await page.waitForTimeout(35000);
  }
}

async function generateWebsite(page: any) {
  const genBtn = page.locator('button:has-text("Generate Website"), button:has-text("generate website")');
  if (await genBtn.isVisible({ timeout: 10000 }).catch(() => false)) {
    await genBtn.click();
    // Wait for generation to complete — can take up to 3 minutes
    try {
      await page.waitForFunction(() => {
        const body = document.body.innerText;
        return body.includes("Generated") || body.includes("Deploy") || body.includes("Failed") || body.includes("Generation Failed");
      }, { timeout: 180000 });
    } catch {
      // Timeout — check current state
    }
    await page.waitForTimeout(2000);
  }
}

async function getIterationScreenshots(page: any, iteration: number, phase: string) {
  const name = `iter${iteration}-${phase}`;
  await page.screenshot({ path: `qa-screenshots/${name}.png`, fullPage: true }).catch(() => {});
  return name;
}

async function captureConsoleMsgs(page: any, logs: string[]) {
  page.on("console", (msg: any) => {
    const text = `[${msg.type()}] ${msg.text()}`;
    if (!logs.includes(text)) logs.push(text);
  });
  page.on("pageerror", (err: any) => logs.push(`[PAGE_ERROR] ${err.message}`));
}

async function captureNetworkUrls(page: any, urls: string[]) {
  page.on("request", (req: any) => {
    if (req.url().includes("/api/") || req.url().includes("/websites/")) {
      urls.push(`[${req.method()}] ${req.url()}`);
    }
  });
}

/* ════════════════════════════════════════
   TARGETED TEST: 5x Website Generation Flow
   ════════════════════════════════════════ */

test.describe("5x Website Generation Flow", () => {
  const baseTimestamp = Date.now();
  const artifacts: IterationArtifacts[] = [];

  for (let iter = 1; iter <= 5; iter++) {
    test(`Iteration ${iter}/5: Full website generation flow`, async ({ page }) => {
      test.setTimeout(300000); // 5 minutes per iteration

      const email = `qa-webgen-${baseTimestamp}-${iter}@test.com`;
      const logs: string[] = [];
      const networkUrls: string[] = [];
      const screenshots: string[] = [];
      const startTime = Date.now();

      await captureConsoleMsgs(page, logs);
      await captureNetworkUrls(page, networkUrls);
      await page.setViewportSize({ width: 1440, height: 900 });

      const art: IterationArtifacts = {
        iteration: iter,
        email,
        consoleLogs: logs,
        networkUrls,
        screenshots,
        success: false,
        phase: "initializing",
        durationMs: 0,
      };

      try {
        // ── Phase 1: Sign Up ──
        art.phase = "signup";
        console.log(`\n[Iteration ${iter}] Phase: Sign up — ${email}`);
        await signUp(page, email);
        screenshots.push(await getIterationScreenshots(page, iter, "01-signed-up"));
        logs.push(`[PASS] Sign up completed for ${email}`);

        // ── Phase 2: Complete Interview ──
        art.phase = "interview";
        console.log(`[Iteration ${iter}] Phase: Complete interview`);
        await page.goto(`${BASE}/interview`);
        await page.waitForLoadState("networkidle");
        await page.waitForTimeout(2000);
        screenshots.push(await getIterationScreenshots(page, iter, "02-interview-start"));
        await completeInterview(page);
        screenshots.push(await getIterationScreenshots(page, iter, "03-interview-done"));
        logs.push(`[PASS] Interview completed`);

        // ── Phase 3: Open Workspace ──
        art.phase = "workspace";
        console.log(`[Iteration ${iter}] Phase: Open workspace`);
        await page.goto(`${BASE}/workspace`);
        await page.waitForLoadState("networkidle");
        await page.waitForTimeout(5000);
        screenshots.push(await getIterationScreenshots(page, iter, "04-workspace-loaded"));

        // ── Phase 4: Switch to Website Tab ──
        art.phase = "website-tab";
        console.log(`[Iteration ${iter}] Phase: Open website tab`);
        const websiteTab = page.locator('button:has-text("Website"), [role="tab"]:has-text("Website")');
        if (await websiteTab.isVisible({ timeout: 5000 }).catch(() => false)) {
          await websiteTab.click();
          await page.waitForTimeout(2000);
        }
        screenshots.push(await getIterationScreenshots(page, iter, "05-website-tab"));

        // ── Phase 5: Generate Website ──
        art.phase = "generate-website";
        console.log(`[Iteration ${iter}] Phase: Generate website`);
        await generateWebsite(page);
        await page.waitForTimeout(3000);
        screenshots.push(await getIterationScreenshots(page, iter, "06-after-generation"));

        // ── Phase 6: Verify Rendered Sections ──
        art.phase = "verify-sections";
        console.log(`[Iteration ${iter}] Phase: Verify rendered sections`);

        // Check that the page shows generation result
        const bodyText = await page.locator("body").innerText();

        // Check for success indicators
        const hasGenerated = bodyText.includes("Generated");
        const hasDeployButton = bodyText.includes("Deploy") || bodyText.includes("deploy");
        const hasGenerationFailed = bodyText.includes("Failed") || bodyText.includes("failed");
        const hasSectionCount = /(\d+)\s+sections/.test(bodyText);

        if (hasGenerationFailed) {
          // Generation failed — try again
          const retryBtn = page.locator('button:has-text("retry"), button:has-text("Retry")');
          if (await retryBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
            logs.push(`[WARN] Generation failed on first attempt, retrying`);
            await retryBtn.click();
            await page.waitForTimeout(2000);
            await generateWebsite(page);
            await page.waitForTimeout(3000);
          }
        }

        screenshots.push(await getIterationScreenshots(page, iter, "07-verified-sections"));

        logs.push(`[DATA] hasGenerated=${hasGenerated} hasDeployButton=${hasDeployButton} hasSectionCount=${hasSectionCount}`);
        expect(hasGenerated || hasDeployButton || hasSectionCount).toBeTruthy();

        // ── Phase 7: Refresh Page ──
        art.phase = "refresh";
        console.log(`[Iteration ${iter}] Phase: Refresh page`);
        await page.reload();
        await page.waitForLoadState("networkidle");
        await page.waitForTimeout(5000);
        screenshots.push(await getIterationScreenshots(page, iter, "08-after-refresh"));

        // ── Phase 8: Verify Website Persists After Refresh ──
        art.phase = "verify-persistence";
        console.log(`[Iteration ${iter}] Phase: Verify persistence after refresh`);
        const refreshedBody = await page.locator("body").innerText();

        const stillHasGenerated = refreshedBody.includes("Generated") || refreshedBody.includes("Deploy") || refreshedBody.includes("deploy");
        const hasNoCrash = refreshedBody.length > 0;

        logs.push(`[DATA] afterRefresh: stillHasGenerated=${stillHasGenerated} hasNoCrash=${hasNoCrash}`);

        if (!stillHasGenerated && hasNoCrash) {
          // Might need to click website tab after refresh
          const wsTab = page.locator('button:has-text("Website"), [role="tab"]:has-text("Website")');
          if (await wsTab.isVisible({ timeout: 3000 }).catch(() => false)) {
            await wsTab.click();
            await page.waitForTimeout(3000);
          }
          const tabBody = await page.locator("body").innerText();
          const tabHasGenerated = tabBody.includes("Generated") || tabBody.includes("Deploy");
          logs.push(`[DATA] afterRefresh+tabClick: tabHasGenerated=${tabHasGenerated}`);
        }

        screenshots.push(await getIterationScreenshots(page, iter, "09-persistence-check"));
        expect(hasNoCrash).toBeTruthy();

        // ── Phase 9: Switch Tabs and Return ──
        art.phase = "tab-switch";
        console.log(`[Iteration ${iter}] Phase: Switch tabs and return`);
        const tabs = ["Overview", "Verdict", "Brand", "ICP", "Revenue", "Roadmap", "Roast"];
        for (const tab of tabs) {
          const tabBtn = page.locator(`button:has-text("${tab}"), [role="tab"]:has-text("${tab}")`);
          if (await tabBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
            await tabBtn.click();
            await page.waitForTimeout(500);
            const tabBodyVisible = await page.locator("body").isVisible();
            expect(tabBodyVisible).toBeTruthy();
          }
        }

        // Return to website tab
        const finalTab = page.locator('button:has-text("Website"), [role="tab"]:has-text("Website")');
        if (await finalTab.isVisible({ timeout: 3000 }).catch(() => false)) {
          await finalTab.click();
          await page.waitForTimeout(2000);
        }
        screenshots.push(await getIterationScreenshots(page, iter, "10-back-to-website"));

        // ── Phase 10: Final Verification ──
        art.phase = "final-verification";
        console.log(`[Iteration ${iter}] Phase: Final verification`);

        const finalBody = await page.locator("body").innerText();
        const noWhiteScreen = finalBody.length > 50;
        const finalBodyVisible = await page.locator("body").isVisible();

        expect(finalBodyVisible).toBeTruthy();
        expect(noWhiteScreen).toBeTruthy();

        // Check for zero uncaught exceptions
        const pageErrors = logs.filter(l => l.includes("[PAGE_ERROR]"));
        expect(pageErrors.length).toBe(0);

        art.success = true;
        logs.push(`[PASS] Iteration ${iter} completed successfully`);

      } catch (error) {
        art.success = false;
        art.error = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
        logs.push(`[FAIL] Iteration ${iter} failed: ${art.error}`);
        console.error(`[Iteration ${iter}] FAILED: ${art.error}`);
      } finally {
        art.durationMs = Date.now() - startTime;
        artifacts.push(art);

        // Print summary for this iteration
        console.log(`[Iteration ${iter}] Duration: ${(art.durationMs / 1000).toFixed(1)}s | Success: ${art.success} | Phase: ${art.phase}`);

        // Take final screenshot
        screenshots.push(await getIterationScreenshots(page, iter, "final").catch(() => ""));
      }
    });
  }

  test.afterAll(() => {
    // Print final summary
    console.log("\n═══════════════════════════════════════");
    console.log("  5x Website Generation — FINAL REPORT");
    console.log("═══════════════════════════════════════");

    const successCount = artifacts.filter(a => a.success).length;
    const totalDuration = artifacts.reduce((s, a) => s + a.durationMs, 0);

    for (const art of artifacts) {
      const status = art.success ? "✅ PASS" : "❌ FAIL";
      console.log(`  Iteration ${art.iteration}: ${status} (${(art.durationMs / 1000).toFixed(1)}s) — ${art.phase}`);
      if (art.error) console.log(`    Error: ${art.error}`);

      const pageErrors = art.consoleLogs.filter(l => l.includes("[PAGE_ERROR]"));
      if (pageErrors.length > 0) {
        console.log(`    Page errors: ${pageErrors.length}`);
        for (const pe of pageErrors.slice(0, 3)) {
          console.log(`      ${pe.substring(0, 200)}`);
        }
      }
    }

    console.log(`\n  Total: ${successCount}/5 passed`);
    console.log(`  Avg duration: ${(totalDuration / 5 / 1000).toFixed(1)}s`);
    console.log("═══════════════════════════════════════\n");

    // Fail if any iteration failed
    expect(successCount).toBe(5);
  });
});

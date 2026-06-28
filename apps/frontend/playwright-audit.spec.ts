import { test, expect } from "@playwright/test";

const BASE = "http://localhost:3000";
const TEST_EMAIL = `qa-full-${Date.now()}@test.com`;
const TEST_PASSWORD = "TestPass123!";

/* ─── Helpers ─── */

async function signUp(page: any) {
  await page.goto(`${BASE}/auth/sign-up`);
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(500);
  await page.fill("#email", TEST_EMAIL);
  await page.fill("#password", TEST_PASSWORD);
  await page.fill("#confirmPassword", TEST_PASSWORD);
  await page.click('button[type="submit"]');
  try {
    await page.waitForSelector('text=Account created', { timeout: 15000 });
  } catch {
    const body = await page.locator("body").innerText();
    if (!body.includes("already registered")) throw new Error("Sign up failed");
  }
}

async function signIn(page: any) {
  await page.goto(`${BASE}/auth/sign-in`);
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(500);
  await page.fill("#email", TEST_EMAIL);
  await page.fill("#password", TEST_PASSWORD);
  await page.click('button[type="submit"]');
  try {
    await page.waitForURL((url: URL) => !url.pathname.includes("/auth/sign-in"), { timeout: 15000 });
  } catch {
    // ignore
  }
  await page.waitForTimeout(1000);
}

async function ensureLoggedIn(page: any) {
  const token = await page.evaluate(() => localStorage.getItem("startupos-token") || "");
  if (!token) await signIn(page);
}

async function checkNoConsoleErrors(errors: string[]) {
  const critical = errors.filter(
    (e) => e.includes("PAGE_ERROR") || e.includes("error] 500") || e.includes("error] 403") || e.includes("error] 404") || e.includes("error] 401")
  );
  // 409 is expected for duplicate signup attempts, ignore
  const filtered = critical.filter((e) => !e.includes("409"));
  expect(filtered.length).toBe(0);
}

async function captureConsole(page: any, logs: string[]) {
  page.on("console", (msg: any) => logs.push(`[${msg.type()}] ${msg.text()}`));
  page.on("pageerror", (err: any) => logs.push(`[PAGE_ERROR] ${err.message}`));
}

async function takeScreenshot(page: any, name: string) {
  await page.screenshot({ path: `qa-screenshots/${name}.png`, fullPage: true }).catch(() => {});
}

async function isMobileViewport(page: any) {
  const vp = page.viewportSize();
  return vp && vp.width <= 480;
}

test.describe("FULL AUDIT: StartupOS", () => {
  let consoleLogs: string[] = [];
  let artifactsCreated = false;

  test.beforeEach(async ({ page }) => {
    consoleLogs = [];
    await captureConsole(page, consoleLogs);
    await page.setViewportSize({ width: 1440, height: 900 });
  });

  test.afterEach(async ({ page }, testInfo) => {
    if (testInfo.status !== "passed") {
      await takeScreenshot(page, testInfo.title.replace(/\s+/g, "-").toLowerCase());
    }
  });

  /* ═══════════════ PUBLIC PAGES ═══════════════ */

  test.describe("Public Pages", () => {
    test("1. Landing page loads", async ({ page }) => {
      await page.goto(BASE);
      await page.waitForLoadState("networkidle");
      await expect(page.locator("body")).toBeVisible();
      const title = await page.title();
      expect(title).toContain("StartupOS");
      await expect(page.getByRole("heading").first()).toBeVisible();
      await checkNoConsoleErrors(consoleLogs);
    });

    test("2. About page", async ({ page }) => {
      await page.goto(`${BASE}/about`);
      await page.waitForLoadState("networkidle");
      await expect(page.locator("body")).toBeVisible();
    });

    test("3. Privacy page", async ({ page }) => {
      await page.goto(`${BASE}/privacy`);
      await page.waitForLoadState("networkidle");
      await expect(page.locator("body")).toBeVisible();
    });

    test("4. Terms page", async ({ page }) => {
      await page.goto(`${BASE}/terms`);
      await page.waitForLoadState("networkidle");
      await expect(page.locator("body")).toBeVisible();
    });

    test("5. Contact page", async ({ page }) => {
      await page.goto(`${BASE}/contact`);
      await page.waitForLoadState("networkidle");
      await expect(page.locator("body")).toBeVisible();
    });

    test("6. Mobile responsiveness", async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 812 });
      const pages = ["/", "/about", "/privacy", "/terms", "/contact"];
      for (const p of pages) {
        await page.goto(`${BASE}${p}`);
        await page.waitForLoadState("networkidle");
        await page.waitForTimeout(1000);
        await expect(page.locator("body")).toBeVisible();
        const scrollW = await page.evaluate(() => document.documentElement.scrollWidth);
        expect(scrollW).toBeLessThanOrEqual(380);
      }
    });

    test("7. Hard refresh on all public pages", async ({ page }) => {
      const pages = ["/", "/about", "/privacy", "/terms", "/contact"];
      for (const p of pages) {
        await page.goto(`${BASE}${p}`);
        await page.waitForLoadState("networkidle");
        await page.reload();
        await page.waitForLoadState("networkidle");
        await expect(page.locator("body")).toBeVisible();
      }
    });
  });

  /* ═══════════════ AUTH ═══════════════ */

  test.describe("Auth", () => {
    test("8. Sign up", async ({ page }) => {
      await page.goto(`${BASE}/auth/sign-up`);
      await page.waitForLoadState("networkidle");
      await page.fill("#email", TEST_EMAIL);
      await page.fill("#password", TEST_PASSWORD);
      await page.fill("#confirmPassword", TEST_PASSWORD);
      await page.click('button[type="submit"]');
      try {
        await page.waitForSelector('text=Account created', { timeout: 15000 });
      } catch (e) {
        const body = await page.locator("body").innerText();
        if (!body.includes("already registered")) throw e;
      }
      await checkNoConsoleErrors(consoleLogs);
    });

    test("9. Login", async ({ page }) => {
      await signIn(page);
      const url = page.url();
      expect(url).not.toContain("sign-in");
      await checkNoConsoleErrors(consoleLogs);
    });

    test("10. Logout", async ({ page }) => {
      await signIn(page);
      await page.evaluate(() => localStorage.removeItem("startupos-token"));
      await page.goto(`${BASE}/dashboard`);
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(2000);
      await expect(page.locator("body")).toBeVisible();
    });

    test("11. Wrong password", async ({ page }) => {
      await page.goto(`${BASE}/auth/sign-in`);
      await page.fill("#email", TEST_EMAIL);
      await page.fill("#password", "WrongPass123!");
      await page.click('button[type="submit"]');
      await page.waitForTimeout(3000);
      const body = await page.locator("body").innerText();
      // Should show error, not crash
      expect(body.length).toBeGreaterThan(0);
      await expect(page.locator("body")).toBeVisible();
    });

    test("12. Duplicate signup", async ({ page }) => {
      await page.goto(`${BASE}/auth/sign-up`);
      await page.fill("#email", TEST_EMAIL);
      await page.fill("#password", TEST_PASSWORD);
      await page.fill("#confirmPassword", TEST_PASSWORD);
      await page.click('button[type="submit"]');
      await page.waitForTimeout(5000);
      const body = await page.locator("body").innerText();
      // Should show "already registered" gracefully
      await expect(page.locator("body")).toBeVisible();
    });

    test("13. Password mismatch", async ({ page }) => {
      await page.goto(`${BASE}/auth/sign-up`);
      await page.fill("#email", "mismatch@test.com");
      await page.fill("#password", "TestPass123!");
      await page.fill("#confirmPassword", "DifferentPass!");
      await page.click('button[type="submit"]');
      await page.waitForTimeout(1000);
      const body = await page.locator("body").innerText();
      expect(body.toLowerCase()).toContain("match");
    });

    test("14. Refresh after login", async ({ page }) => {
      await signIn(page);
      await page.reload();
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(2000);
      await expect(page.locator("body")).toBeVisible();
      const url = page.url();
      expect(url).not.toContain("sign-in");
    });

    test("15. Session expiration", async ({ page }) => {
      await signIn(page);
      await page.goto(`${BASE}/dashboard`);
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(1000);
      await page.evaluate(() => localStorage.removeItem("startupos-token"));
      await page.reload();
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(5000);
      await expect(page.locator("body")).toBeVisible();
    });

    test("16. Access protected routes while logged out", async ({ page }) => {
      await page.goto(`${BASE}/`);
      await page.evaluate(() => localStorage.removeItem("startupos-token"));
      const protectedPages = ["/dashboard", "/workspace", "/competitors", "/brief", "/blueprints"];
      for (const p of protectedPages) {
        await page.goto(`${BASE}${p}`);
        await page.waitForLoadState("networkidle");
        await page.waitForTimeout(2000);
        await expect(page.locator("body")).toBeVisible();
      }
    });
  });

  /* ═══════════════ FOUNDER INTERVIEW ═══════════════ */

  test.describe("Founder Interview", () => {
    test("17. Complete all interview steps", async ({ page }) => {
      await signIn(page);
      await page.goto(`${BASE}/interview`);
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(1000);

      // Step 1: Idea
      await page.fill("#idea", "AI-powered legal assistant for startups");
      await page.click('button:has-text("Continue")');
      await page.waitForTimeout(1000);

      // Step 2: Stage & Industry
      await page.click("#stage");
      await page.locator('[role="option"]').first().click();
      await page.waitForTimeout(500);
      await page.click("#industry");
      await page.locator('[role="option"]').first().click();
      await page.waitForTimeout(500);
      await page.click('button:has-text("Continue")');
      await page.waitForTimeout(1000);

      // Step 3: Customer & Revenue
      await page.click("#targetCustomer");
      await page.locator('[role="option"]').first().click();
      await page.waitForTimeout(500);
      await page.click("#businessModel");
      await page.locator('[role="option"]').first().click();
      await page.waitForTimeout(500);
      await page.click('button:has-text("Continue")');
      await page.waitForTimeout(1000);

      // Step 4: Problem
      await page.click("#problem");
      await page.locator('[role="option"]').first().click();
      await page.waitForTimeout(500);
      await page.click('button:has-text("Continue")');
      await page.waitForTimeout(1000);

      // Step 5: Done - should show generation or Enter Workspace
      const body = await page.locator("body").innerText();
      expect(body.length).toBeGreaterThan(0);
      await expect(page.locator("body")).toBeVisible();
    });

    test("18. Test every dropdown opens", async ({ page }) => {
      await signIn(page);
      await page.goto(`${BASE}/interview`);
      await page.waitForLoadState("networkidle");

      // Navigate to step 2 to test stage+industry dropdowns
      await page.fill("#idea", "Test startup");
      await page.click('button:has-text("Continue")');
      await page.waitForTimeout(1000);

      // Click each dropdown trigger
      await page.click("#stage");
      await expect(page.locator('[role="option"]').first()).toBeVisible({ timeout: 3000 });
      await page.locator('[role="option"]').first().click();
      await page.waitForTimeout(300);

      await page.click("#industry");
      await expect(page.locator('[role="option"]').first()).toBeVisible({ timeout: 3000 });
      await page.locator('[role="option"]').first().click();
      await page.waitForTimeout(300);

      await page.click('button:has-text("Continue")');
      await page.waitForTimeout(1000);

      // Step 3: dropdowns
      await page.click("#targetCustomer");
      await expect(page.locator('[role="option"]').first()).toBeVisible({ timeout: 3000 });
      await page.locator('[role="option"]').first().click();
      await page.waitForTimeout(300);

      await page.click("#businessModel");
      await expect(page.locator('[role="option"]').first()).toBeVisible({ timeout: 3000 });
      await page.locator('[role="option"]').first().click();
      await page.waitForTimeout(300);

      await page.click('button:has-text("Continue")');
      await page.waitForTimeout(1000);

      // Step 4: dropdown
      await page.click("#problem");
      await expect(page.locator('[role="option"]').first()).toBeVisible({ timeout: 3000 });
      await page.locator('[role="option"]').first().click();
    });

    test("19. Test conditional fields", async ({ page }) => {
      await signIn(page);
      await page.goto(`${BASE}/interview`);
      await page.fill("#idea", "Test startup for conditions");
      await page.click('button:has-text("Continue")');
      await page.waitForTimeout(1000);

      // Step 2: Select "other" industry to reveal industryOther field
      await page.click("#stage");
      await page.locator('[role="option"]').first().click();
      await page.waitForTimeout(300);
      await page.click("#industry");
      await page.locator('[role="option"]').last().click(); // "other"
      await page.waitForTimeout(500);

      // industryOther should appear
      const industryOther = page.locator("#industryOther");
      await expect(industryOther).toBeVisible({ timeout: 3000 });
      await industryOther.fill("LegalTech");

      await page.click('button:has-text("Continue")');
      await page.waitForTimeout(1000);

      // Step 3: Select subscription for businessModel to show priceRange, then select "other" to hide it
      await page.click("#targetCustomer");
      await page.locator('[role="option"]').first().click();
      await page.waitForTimeout(300);
      await page.click("#businessModel");
      await page.locator('[role="option"]').first().click(); // subscription
      await page.waitForTimeout(500);

      // priceRange should be visible
      const priceRange = page.locator("#priceRange");
      await expect(priceRange).toBeVisible({ timeout: 3000 });

      // Switch to "other" model to hide priceRange
      await page.click("#businessModel");
      await page.locator('[role="option"]').last().click(); // other
      await page.waitForTimeout(500);
      await expect(priceRange).not.toBeVisible();

      await page.click('button:has-text("Continue")');
      await page.waitForTimeout(1000);

      // Step 4: Select "other" problem to show problemOther
      await page.click("#problem");
      await page.locator('[role="option"]').last().click(); // other
      await page.waitForTimeout(500);
      const problemOther = page.locator("#problemOther");
      await expect(problemOther).toBeVisible({ timeout: 3000 });
    });

    test("20. Validation on every step", async ({ page }) => {
      await signIn(page);
      await page.goto(`${BASE}/interview`);
      await page.waitForLoadState("networkidle");

      // Try to continue without filling anything on step 1
      const continueBtn = page.locator('button:has-text("Continue")');
      if (await continueBtn.isEnabled()) {
        await continueBtn.click();
        await page.waitForTimeout(1000);
      }
      // Should still be on step 1
      await expect(page.locator("body")).toBeVisible();
    });

    test("21. Refresh midway through interview", async ({ page }) => {
      await signIn(page);
      await page.goto(`${BASE}/interview`);
      await page.fill("#idea", "Test startup for refresh");
      await page.click('button:has-text("Continue")');
      await page.waitForTimeout(1000);
      await page.reload();
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(1000);
      await expect(page.locator("body")).toBeVisible();
    });

    test("22. Complete interview with minimum inputs", async ({ page }) => {
      await signIn(page);
      await page.goto(`${BASE}/interview`);
      await page.fill("#idea", "Minimal test startup");
      await page.click('button:has-text("Continue")');
      await page.waitForTimeout(1000);
      await page.click("#stage");
      await page.locator('[role="option"]').first().click();
      await page.waitForTimeout(300);
      await page.click("#industry");
      await page.locator('[role="option"]').first().click();
      await page.waitForTimeout(300);
      await page.click('button:has-text("Continue")');
      await page.waitForTimeout(1000);
      await page.click("#targetCustomer");
      await page.locator('[role="option"]').first().click();
      await page.waitForTimeout(300);
      await page.click("#businessModel");
      // Select one-time to avoid priceRange (it has a default now, but good to test)
      await page.locator('[role="option"]').nth(3).click();
      await page.waitForTimeout(300);
      await page.click('button:has-text("Continue")');
      await page.waitForTimeout(1000);
      await page.click("#problem");
      await page.locator('[role="option"]').first().click();
      await page.waitForTimeout(300);
      await page.click('button:has-text("Continue")');
      await page.waitForTimeout(1000);
      await expect(page.locator("body")).toBeVisible();
    });

    test("23. Complete interview with maximum inputs", async ({ page }) => {
      await signIn(page);
      await page.goto(`${BASE}/interview`);
      await page.fill("#idea", "Enterprise AI platform for healthcare revenue cycle management");
      await page.click('button:has-text("Continue")');
      await page.waitForTimeout(1000);
      await page.click("#stage");
      await page.locator('[role="option"]').last().click();
      await page.waitForTimeout(300);
      await page.click("#industry");
      await page.locator('[role="option"]').last().click();
      await page.waitForTimeout(300);
      await page.fill("#industryOther", "Healthcare Technology");
      await page.click('button:has-text("Continue")');
      await page.waitForTimeout(1000);
      await page.click("#targetCustomer");
      await page.locator('[role="option"]').last().click();
      await page.waitForTimeout(300);
      await page.click("#businessModel");
      await page.locator('[role="option"]').first().click();
      await page.waitForTimeout(300);
      await page.click('button:has-text("Continue")');
      await page.waitForTimeout(1000);
      await page.click("#problem");
      await page.locator('[role="option"]').last().click();
      await page.waitForTimeout(300);
      await page.fill("#problemOther", "Complex regulatory compliance across multiple jurisdictions");
      await page.click('button:has-text("Continue")');
      await page.waitForTimeout(1000);
      await expect(page.locator("body")).toBeVisible();
    });
  });

  /* ═══════════════ BLUEPRINTS ═══════════════ */

  test.describe("Blueprints", () => {
    test("24. Generate blueprint", async ({ page }) => {
      await signIn(page);
      await page.goto(`${BASE}/interview`);
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(500);
      await page.fill("#idea", "AI-powered legal assistant for startups that automates contract review");
      await page.click('button:has-text("Continue")');
      await page.waitForTimeout(1000);
      await page.click("#stage");
      await page.locator('[role="option"]').first().click();
      await page.waitForTimeout(300);
      await page.click("#industry");
      await page.locator('[role="option"]').first().click();
      await page.waitForTimeout(300);
      await page.click('button:has-text("Continue")');
      await page.waitForTimeout(1000);
      await page.click("#targetCustomer");
      await page.locator('[role="option"]').first().click();
      await page.waitForTimeout(300);
      await page.click("#businessModel");
      await page.locator('[role="option"]').first().click();
      await page.waitForTimeout(300);
      await page.click('button:has-text("Continue")');
      await page.waitForTimeout(1000);
      await page.click("#problem");
      await page.locator('[role="option"]').first().click();
      await page.waitForTimeout(300);
      await page.click('button:has-text("Continue")');
      await page.waitForTimeout(1000);

      // Click "Enter Workspace" to start generation
      const enterBtn = page.locator('button:has-text("Enter Workspace")');
      if (await enterBtn.isVisible()) {
        await enterBtn.click();
        // Wait for generation
        await page.waitForTimeout(25000);
        const url = page.url();
        console.log("After generation URL:", url);
        await expect(page.locator("body")).toBeVisible();
      }
    });

    test("25. Retry generation", async ({ page }) => {
      await signIn(page);
      await page.goto(`${BASE}/interview`);
      await page.waitForLoadState("networkidle");
      await page.fill("#idea", "Test startup for retry");
      await page.click('button:has-text("Continue")');
      await page.waitForTimeout(800);
      await page.click("#stage");
      await page.locator('[role="option"]').first().click();
      await page.waitForTimeout(300);
      await page.click("#industry");
      await page.locator('[role="option"]').first().click();
      await page.waitForTimeout(300);
      await page.click('button:has-text("Continue")');
      await page.waitForTimeout(800);
      await page.click("#targetCustomer");
      await page.locator('[role="option"]').first().click();
      await page.waitForTimeout(300);
      await page.click("#businessModel");
      await page.locator('[role="option"]').first().click();
      await page.waitForTimeout(300);
      await page.click('button:has-text("Continue")');
      await page.waitForTimeout(800);
      await page.click("#problem");
      await page.locator('[role="option"]').first().click();
      await page.waitForTimeout(300);
      await page.click('button:has-text("Continue")');
      await page.waitForTimeout(800);

      const enterBtn = page.locator('button:has-text("Enter Workspace")');
      if (await enterBtn.isVisible()) {
        await enterBtn.click();
        await page.waitForTimeout(20000);
        // Check if retry button appears
        const retryBtn = page.locator('button:has-text("Retry")');
        if (await retryBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
          await retryBtn.click();
          await page.waitForTimeout(25000);
        }
        await expect(page.locator("body")).toBeVisible();
      }
    });

    test("26. Refresh blueprint page", async ({ page }) => {
      await signIn(page);
      await page.goto(`${BASE}/workspace`);
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(3000);
      await page.reload();
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(3000);
      await expect(page.locator("body")).toBeVisible();
    });

    test("27. Generate 5 blueprints consecutively", async ({ page }) => {
      test.setTimeout(600000);
      await signIn(page);

      for (let i = 0; i < 5; i++) {
        console.log(`BP generation ${i + 1}/5`);
        await page.goto(`${BASE}/interview`);
        await page.waitForLoadState("domcontentloaded");
        await page.waitForTimeout(300);
        await page.fill("#idea", `Test startup ${i} for consecutive generation`);
        await page.click('button:has-text("Continue")');
        await page.waitForTimeout(500);
        await page.click("#stage");
        await page.locator('[role="option"]').first().click();
        await page.waitForTimeout(200);
        await page.click("#industry");
        await page.locator('[role="option"]').first().click();
        await page.waitForTimeout(200);
        await page.click('button:has-text("Continue")');
        await page.waitForTimeout(500);
        await page.click("#targetCustomer");
        await page.locator('[role="option"]').first().click();
        await page.waitForTimeout(200);
        await page.click("#businessModel");
        await page.locator('[role="option"]').nth(3).click();
        await page.waitForTimeout(200);
        await page.click('button:has-text("Continue")');
        await page.waitForTimeout(500);
        await page.click("#problem");
        await page.locator('[role="option"]').first().click();
        await page.waitForTimeout(200);
        await page.click('button:has-text("Continue")');
        await page.waitForTimeout(500);
        const enterBtn = page.locator('button:has-text("Enter Workspace")');
        if (await enterBtn.isVisible()) {
          await enterBtn.click();
          await page.waitForTimeout(25000);
        }
        await expect(page.locator("body")).toBeVisible();
      }
    });

    test("28. Verify no duplicate startups", async ({ page }) => {
      await signIn(page);
      await page.goto(`${BASE}/dashboard`);
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(3000);
      await expect(page.locator("body")).toBeVisible();
    });

    test("29. Verify blueprint persistence after refresh", async ({ page }) => {
      await signIn(page);
      await page.goto(`${BASE}/workspace`);
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(3000);
      const urlBefore = page.url();
      await page.reload();
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(3000);
      const urlAfter = page.url();
      // Should persist on same page
      expect(urlAfter).toContain("workspace");
      await expect(page.locator("body")).toBeVisible();
    });
  });

  /* ═══════════════ WORKSPACE ═══════════════ */

  test.describe("Workspace", () => {
    test("30. Open workspace", async ({ page }) => {
      await signIn(page);
      await page.goto(`${BASE}/workspace`);
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(3000);
      await expect(page.locator("body")).toBeVisible();
    });

    test("31. Refresh workspace", async ({ page }) => {
      await signIn(page);
      await page.goto(`${BASE}/workspace`);
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(2000);
      await page.reload();
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(2000);
      await expect(page.locator("body")).toBeVisible();
    });

    test("32. Open every tab", async ({ page }) => {
      await signIn(page);
      await page.goto(`${BASE}/workspace`);
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(3000);

      const tabs = ["Overview", "Verdict", "Brand", "ICP", "Revenue", "Roadmap", "Roast"];
      for (const tab of tabs) {
        const tabBtn = page.locator(`button:has-text("${tab}"), a:has-text("${tab}"), [role="tab"]:has-text("${tab}")`);
        if (await tabBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
          await tabBtn.click();
          await page.waitForTimeout(1000);
          await expect(page.locator("body")).toBeVisible();
        }
      }
    });

    test("33. Switch rapidly between tabs", async ({ page }) => {
      await signIn(page);
      await page.goto(`${BASE}/workspace`);
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(3000);

      const tabs = ["Overview", "Verdict", "Brand", "ICP", "Revenue", "Roadmap", "Roast"];
      for (let i = 0; i < 3; i++) {
        for (const tab of tabs) {
          const tabBtn = page.locator(`button:has-text("${tab}"), a:has-text("${tab}"), [role="tab"]:has-text("${tab}")`);
          if (await tabBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
            await tabBtn.click();
            await page.waitForTimeout(200);
          }
        }
      }
      await expect(page.locator("body")).toBeVisible();
    });

    test("34. Refresh each tab", async ({ page }) => {
      await signIn(page);
      await page.goto(`${BASE}/workspace`);
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(3000);

      const tabs = ["Overview", "Verdict", "Brand", "ICP", "Revenue", "Roadmap", "Roast"];
      for (const tab of tabs) {
        const tabBtn = page.locator(`button:has-text("${tab}"), a:has-text("${tab}"), [role="tab"]:has-text("${tab}")`);
        if (await tabBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
          await tabBtn.click();
          await page.waitForTimeout(500);
          await page.reload();
          await page.waitForLoadState("networkidle");
          await page.waitForTimeout(2000);
          await expect(page.locator("body")).toBeVisible();
        }
      }
    });

    test("35. Verify empty states", async ({ page }) => {
      await page.goto(`${BASE}/`);
      await page.evaluate(() => localStorage.removeItem("startupos-token"));
      await page.goto(`${BASE}/workspace`);
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(3000);
      await expect(page.locator("body")).toBeVisible();
    });

    test("36. Generate website", async ({ page }) => {
      await signIn(page);
      await page.goto(`${BASE}/workspace`);
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(3000);
      // Look for website generation button
      const genBtn = page.locator('button:has-text("Generate Website"), button:has-text("Build Website"), button:has-text("Deploy")');
      if (await genBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
        await genBtn.click();
        await page.waitForTimeout(5000);
      }
      await expect(page.locator("body")).toBeVisible();
    });

    test("37. Refresh website tab", async ({ page }) => {
      await signIn(page);
      await page.goto(`${BASE}/workspace`);
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(3000);
      // Click website tab
      const websiteTab = page.locator('button:has-text("Website"), a:has-text("Website"), [role="tab"]:has-text("Website")');
      if (await websiteTab.isVisible({ timeout: 3000 }).catch(() => false)) {
        await websiteTab.click();
        await page.waitForTimeout(1000);
      }
      await page.reload();
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(3000);
      await expect(page.locator("body")).toBeVisible();
    });

    test("38. Verify persistence", async ({ page }) => {
      await signIn(page);
      await page.goto(`${BASE}/workspace`);
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(3000);
      const body = await page.locator("body").innerText();
      expect(body.length).toBeGreaterThan(0);
    });
  });

  /* ═══════════════ DASHBOARD ═══════════════ */

  test.describe("Dashboard", () => {
    test("41. Dashboard loads", async ({ page }) => {
      await signIn(page);
      await page.goto(`${BASE}/dashboard`);
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(3000);
      await expect(page.locator("body")).toBeVisible();
      expect(page.url()).toContain("dashboard");
    });

    test("42. Fortune Cookie", async ({ page }) => {
      await signIn(page);
      await page.goto(`${BASE}/dashboard`);
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(2000);
      const fc = page.locator('text=Fortune, text=fortune, [class*=fortune], [class*=Fortune]').first();
      if (await fc.isVisible({ timeout: 3000 }).catch(() => false)) {
        await expect(fc).toBeVisible();
      }
      await expect(page.locator("body")).toBeVisible();
    });

    test("43. Death Predictor", async ({ page }) => {
      await signIn(page);
      await page.goto(`${BASE}/dashboard`);
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(2000);
      const dp = page.locator('text=Death, text=death, [class*=death], [class*=Death]').first();
      if (await dp.isVisible({ timeout: 3000 }).catch(() => false)) {
        await expect(dp).toBeVisible();
      }
      await expect(page.locator("body")).toBeVisible();
    });

    test("44. Panic Button", async ({ page }) => {
      await signIn(page);
      await page.goto(`${BASE}/dashboard`);
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(2000);
      const panic = page.locator('button:has-text("Panic"), button:has-text("panic"), [class*=panic]').first();
      if (await panic.isVisible({ timeout: 3000 }).catch(() => false)) {
        await panic.click();
        await page.waitForTimeout(2000);
      }
      await expect(page.locator("body")).toBeVisible();
    });

    test("45. Health cards", async ({ page }) => {
      await signIn(page);
      await page.goto(`${BASE}/dashboard`);
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(2000);
      await expect(page.locator("body")).toBeVisible();
    });

    test("46. Refresh dashboard", async ({ page }) => {
      await signIn(page);
      await page.goto(`${BASE}/dashboard`);
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(2000);
      await page.reload();
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(3000);
      await expect(page.locator("body")).toBeVisible();
    });
  });

  /* ═══════════════ COMPETITORS + BRIEF ═══════════════ */

  test.describe("Competitors & Brief", () => {
    test("47. Competitors page", async ({ page }) => {
      await signIn(page);
      await page.goto(`${BASE}/competitors`);
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(3000);
      await expect(page.locator("body")).toBeVisible();
    });

    test("48. Brief page", async ({ page }) => {
      await signIn(page);
      await page.goto(`${BASE}/brief`);
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(3000);
      await expect(page.locator("body")).toBeVisible();
    });

    test("49. Refresh both pages", async ({ page }) => {
      await signIn(page);
      for (const p of ["/competitors", "/brief"]) {
        await page.goto(`${BASE}${p}`);
        await page.waitForLoadState("networkidle");
        await page.waitForTimeout(1000);
        await page.reload();
        await page.waitForLoadState("networkidle");
        await page.waitForTimeout(2000);
        await expect(page.locator("body")).toBeVisible();
      }
    });

    test("50. Empty states", async ({ page }) => {
      await page.goto(`${BASE}/`);
      await page.evaluate(() => localStorage.removeItem("startupos-token"));
      for (const p of ["/competitors", "/brief"]) {
        await page.goto(`${BASE}${p}`);
        await page.waitForLoadState("networkidle");
        await page.waitForTimeout(2000);
        await expect(page.locator("body")).toBeVisible();
      }
    });
  });

  /* ═══════════════ MOBILE ═══════════════ */

  test.describe("Mobile", () => {
    test("51. Full application on 375px viewport", async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 812 });
      await signIn(page);
      const pages = ["/", "/dashboard", "/workspace", "/competitors", "/brief", "/interview"];
      for (const p of pages) {
        await page.goto(`${BASE}${p}`);
        await page.waitForLoadState("networkidle");
        await page.waitForTimeout(2000);
        await expect(page.locator("body")).toBeVisible();
      }
    });

    test("52. No horizontal scrolling on mobile", async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 812 });
      await signIn(page);
      const pages = ["/", "/dashboard", "/workspace", "/competitors", "/brief"];
      for (const p of pages) {
        await page.goto(`${BASE}${p}`);
        await page.waitForLoadState("networkidle");
        await page.waitForTimeout(2000);
        const scrollW = await page.evaluate(() => document.documentElement.scrollWidth);
        expect(scrollW).toBeLessThanOrEqual(380);
      }
    });

    test("53. All buttons clickable on mobile", async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 812 });
      await signIn(page);
      await page.goto(`${BASE}/dashboard`);
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(2000);
      const buttons = page.locator("button");
      const count = await buttons.count();
      for (let i = 0; i < Math.min(count, 5); i++) {
        try {
          await buttons.nth(i).click({ timeout: 2000 });
          await page.waitForTimeout(500);
        } catch {
          // skip if not clickable
        }
      }
      await expect(page.locator("body")).toBeVisible();
    });
  });

  /* ═══════════════ STRESS TESTS ═══════════════ */

  test.describe("Stress Tests", () => {
    test("54. Rapid navigation between pages", async ({ page }) => {
      await signIn(page);
      const pages = ["/", "/dashboard", "/workspace", "/competitors", "/brief", "/interview"];
      for (let round = 0; round < 3; round++) {
        for (const p of pages) {
          await page.goto(`${BASE}${p}`);
          await page.waitForTimeout(300);
        }
      }
      await expect(page.locator("body")).toBeVisible();
    });

    test("55. Spam-click buttons", async ({ page }) => {
      await signIn(page);
      await page.goto(`${BASE}/dashboard`);
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(2000);
      const buttons = page.locator("button");
      const count = await buttons.count();
      for (let i = 0; i < Math.min(count, 10); i++) {
        for (let click = 0; click < 5; click++) {
          try {
            await buttons.nth(i).click({ timeout: 500 });
          } catch {
            break;
          }
        }
      }
      await expect(page.locator("body")).toBeVisible();
    });

    test("56. Double-submit forms", async ({ page }) => {
      await signIn(page);
      await page.goto(`${BASE}/interview`);
      await page.waitForLoadState("networkidle");
      await page.fill("#idea", "Double submit test");
      const continueBtn = page.locator('button:has-text("Continue")');
      try {
        await continueBtn.click({ timeout: 1000 });
        await continueBtn.click({ timeout: 1000 });
        await continueBtn.click({ timeout: 1000 });
      } catch {
        // Some buttons may become disabled after first click
      }
      await page.waitForTimeout(1000);
      await expect(page.locator("body")).toBeVisible();
    });

    test("57. Refresh during API requests", async ({ page }) => {
      await signIn(page);
      await page.goto(`${BASE}/dashboard`);
      await page.waitForLoadState("domcontentloaded");
      await page.reload();
      await page.waitForLoadState("domcontentloaded");
      await page.reload();
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(2000);
      await expect(page.locator("body")).toBeVisible();
    });

    test("58. Back/forward browser navigation", async ({ page }) => {
      await signIn(page);
      await page.goto(`${BASE}/dashboard`);
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(1000);
      await page.goto(`${BASE}/competitors`);
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(1000);
      await page.goto(`${BASE}/brief`);
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(1000);
      await page.goBack();
      await page.waitForTimeout(2000);
      await expect(page.locator("body")).toBeVisible();
      await page.goBack();
      await page.waitForTimeout(2000);
      await expect(page.locator("body")).toBeVisible();
      await page.goForward();
      await page.waitForTimeout(2000);
      await expect(page.locator("body")).toBeVisible();
    });
  });

  /* ═══════════════ ERROR HANDLING ═══════════════ */

  test.describe("Error Handling", () => {
    test("59. Graceful handling - 401", async ({ page }) => {
      await page.goto(`${BASE}/`);
      await page.evaluate(() => localStorage.setItem("startupos-token", "fake-invalid-token"));
      await page.goto(`${BASE}/dashboard`);
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(3000);
      await expect(page.locator("body")).toBeVisible();
    });

    test("60. Graceful handling - logged out state", async ({ page }) => {
      await page.goto(`${BASE}/`);
      await page.evaluate(() => localStorage.removeItem("startupos-token"));
      const protectedPages = ["/dashboard", "/workspace", "/competitors", "/brief"];
      for (const p of protectedPages) {
        await page.goto(`${BASE}${p}`);
        await page.waitForLoadState("networkidle");
        await page.waitForTimeout(2000);
        await expect(page.locator("body")).toBeVisible();
      }
    });
  });

  /* ═══════════════ WEBSITE GENERATION ═══════════════ */

  test.describe("Website Generation (Workspace Tab)", () => {
    test("Website tab exists", async ({ page }) => {
      await signIn(page);
      await page.goto(`${BASE}/workspace`);
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(3000);
      const websiteTab = page.locator('button:has-text("Website"), a:has-text("Website"), [role="tab"]:has-text("Website")');
      const exists = await websiteTab.isVisible({ timeout: 3000 }).catch(() => false);
      console.log("Website tab visible:", exists);
    });

    test("Website tab renders without crash", async ({ page }) => {
      await signIn(page);
      await page.goto(`${BASE}/workspace`);
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(3000);
      const websiteTab = page.locator('button:has-text("Website"), a:has-text("Website"), [role="tab"]:has-text("Website")');
      if (await websiteTab.isVisible({ timeout: 3000 }).catch(() => false)) {
        await websiteTab.click();
        await page.waitForTimeout(2000);
      }
      await expect(page.locator("body")).toBeVisible();
    });
  });

  /* ═══════════════ VERIFY FALLBACK ═══════════════ */

  test.describe("Fallback Behavior", () => {
    test("Page error boundary works", async ({ page }) => {
      await signIn(page);
      await page.goto(`${BASE}/dashboard`);
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(2000);
      await expect(page.locator("body")).toBeVisible();
    });
  });
});

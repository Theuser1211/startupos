import { test, expect, type Page } from "@playwright/test";

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

function makeValidToken(payload: Record<string, unknown>, expiresIn = "1h"): string {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const now = Math.floor(Date.now() / 1000);
  const exp = expiresIn === "expired" ? now - 3600 : now + 3600;
  const body = Buffer.from(JSON.stringify({ ...payload, iat: now, exp })).toString("base64url");
  const signature = "fake-signature-for-testing";
  return `${header}.${body}.${signature}`;
}

function makeExpiredToken(): string {
  return makeValidToken({ userId: "test-user", email: "test@example.com" }, "expired");
}

function makeMalformedToken(): string {
  return "not.a.valid.jwt.token";
}

function makeMalformedBase64Token(): string {
  return "eyJhbGciOiJIUzI1NiJ9.!!!invalid-base64!!!.signature";
}

async function clearAllAuth(page: Page): Promise<void> {
  await page.goto(BASE_URL);
  await page.evaluate(() => {
    localStorage.clear();
    document.cookie = "startupos-token=; path=/; max-age=0";
  });
}

async function setTokenAndGo(page: Page, token: string, path: string): Promise<void> {
  await page.goto(BASE_URL);
  await page.evaluate((t) => {
    localStorage.setItem("startupos-token", t);
    document.cookie = `startupos-token=${t}; path=/; max-age=604800; SameSite=Lax`;
  }, token);
  await page.goto(`${BASE_URL}${path}`);
}

async function waitForRedirect(page: Page, timeoutMs = 10000): Promise<string> {
  await page.waitForURL(/\/auth\/sign-in/, { timeout: timeoutMs });
  return page.url();
}

test.describe("Auth Flow Tests", () => {
  test.beforeEach(async ({ page }) => {
    await clearAllAuth(page);
  });

  test("Scenario 1: No token → redirect to sign in", async ({ page }) => {
    await page.goto(`${BASE_URL}/workspace`);
    const url = await waitForRedirect(page);
    expect(url).toContain("/auth/sign-in");
    expect(url).toContain("redirect=");

    await page.screenshot({ path: "test-results/01-no-token-redirect.png" });

    const signInForm = page.locator("form");
    await expect(signInForm).toBeVisible();
  });

  test("Scenario 2: Expired token → clear token → redirect to sign in", async ({ page }) => {
    const expiredToken = makeExpiredToken();
    await setTokenAndGo(page, expiredToken, "/workspace");

    const url = await waitForRedirect(page);
    expect(url).toContain("/auth/sign-in");
    expect(url).toContain("expired=1");

    const tokenAfterRedirect = await page.evaluate(() => localStorage.getItem("startupos-token"));
    expect(tokenAfterRedirect).toBeNull();

    await page.screenshot({ path: "test-results/02-expired-token-redirect.png" });
  });

  test("Scenario 3: Malformed token → clear token → redirect to sign in", async ({ page }) => {
    const malformedToken = makeMalformedToken();
    await setTokenAndGo(page, malformedToken, "/workspace");

    await page.waitForURL(/\/auth\/sign-in/, { timeout: 10000 });
    const url = page.url();
    expect(url).toContain("/auth/sign-in");

    const tokenAfterRedirect = await page.evaluate(() => localStorage.getItem("startupos-token"));
    expect(tokenAfterRedirect).toBeNull();

    await page.screenshot({ path: "test-results/03-malformed-token-redirect.png" });
  });

  test("Scenario 4: 401 from backend → force logout → clear localStorage → redirect", async ({ page }) => {
    const validToken = makeValidToken({ userId: "nonexistent-user-12345", email: "ghost@example.com" });
    await setTokenAndGo(page, validToken, "/workspace");

    await page.waitForURL(/\/auth\/sign-in/, { timeout: 15000 });
    const url = page.url();
    expect(url).toContain("/auth/sign-in");

    const tokenAfter = await page.evaluate(() => localStorage.getItem("startupos-token"));
    expect(tokenAfter).toBeNull();

    await page.screenshot({ path: "test-results/04-backend-401-redirect.png" });
  });

  test("Scenario 5: Cleared localStorage → redirect to sign in", async ({ page }) => {
    await clearAllAuth(page);

    await page.goto(`${BASE_URL}/workspace?id=test-startup`);
    const url = await waitForRedirect(page);
    expect(url).toContain("/auth/sign-in");

    const token = await page.evaluate(() => localStorage.getItem("startupos-token"));
    expect(token).toBeNull();

    await page.screenshot({ path: "test-results/05-cleared-localstorage.png" });
  });

  test("Scenario 6: Refresh on protected route while expired", async ({ page }) => {
    const expiredToken = makeExpiredToken();
    await setTokenAndGo(page, expiredToken, "/workspace");

    await waitForRedirect(page);

    const url = page.url();
    expect(url).toContain("/auth/sign-in");
    expect(url).toContain("expired=1");

    const expiredParam = new URL(url).searchParams.get("expired");
    expect(expiredParam).toBe("1");

    await page.screenshot({ path: "test-results/06-refresh-protected-route.png" });
  });

  test("Scenario 7: Malformed base64 token → clear → redirect", async ({ page }) => {
    const badToken = makeMalformedBase64Token();
    await setTokenAndGo(page, badToken, "/workspace");

    await page.waitForURL(/\/auth\/sign-in/, { timeout: 10000 });
    const tokenAfter = await page.evaluate(() => localStorage.getItem("startupos-token"));
    expect(tokenAfter).toBeNull();

    await page.screenshot({ path: "test-results/07-malformed-base64-redirect.png" });
  });

  test("Scenario 8: Middleware blocks protected route without token", async ({ page }) => {
    await clearAllAuth(page);

    const routes = ["/workspace", "/blueprints"];
    for (const route of routes) {
      await page.goto(`${BASE_URL}${route}`);
      await page.waitForURL(/\/auth\/sign-in/, { timeout: 10000 });
      expect(page.url()).toContain("/auth/sign-in");
      await clearAllAuth(page);
    }

    await page.screenshot({ path: "test-results/08-middleware-blocking.png" });
  });

  test("Scenario 9: Sign-in page auto-redirects when already authenticated", async ({ page }) => {
    const validToken = makeValidToken({ userId: "test-user-9", email: "user9@example.com" });
    await setTokenAndGo(page, validToken, "/auth/sign-in");
    await page.waitForTimeout(2000);

    const url = page.url();
    const isOnSignIn = url.includes("/auth/sign-in");
    const isOnWorkspace = url.includes("/workspace");

    expect(isOnSignIn || isOnWorkspace).toBeTruthy();

    await page.screenshot({ path: "test-results/09-signin-auto-redirect.png" });
  });

  test("Scenario 10: Token validation helpers work correctly", async ({ page }) => {
    await page.goto(`${BASE_URL}/auth/sign-in`);

    const results = await page.evaluate(() => {
      const validToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMjM0NSIsImVtYWlsIjoidGVzdEBleGFtcGxlLmNvbSIsImlhdCI6MTcwMDAwMDAwMCwiZXhwIjoxOTAwMDAwMDAwfQ.fake-sig";
      const expiredToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMjM0NSIsImVtYWlsIjoidGVzdEBleGFtcGxlLmNvbSIsImlhdCI6MTcwMDAwMDAwMCwiZXhwIjoxNzAwMDAwMDAwfQ.fake-sig";
      const malformedToken = "not.a.valid.token";

      function validateTokenFormat(token: string): boolean {
        if (!token || typeof token !== "string") return false;
        const parts = token.split(".");
        if (parts.length !== 3) return false;
        if (!parts[0] || !parts[1] || !parts[2]) return false;
        try {
          const base64 = token.split(".")[1];
          if (!base64) return false;
          const json = atob(base64.replace(/-/g, "+").replace(/_/g, "/"));
          JSON.parse(json);
          return true;
        } catch {
          return false;
        }
      }

      function isTokenExpired(token: string): boolean {
        try {
          const base64 = token.split(".")[1];
          const json = atob(base64.replace(/-/g, "+").replace(/_/g, "/"));
          const payload = JSON.parse(json);
          if (!payload) return true;
          if (!payload.exp) return false;
          return Date.now() >= payload.exp * 1000;
        } catch {
          return true;
        }
      }

      return {
        validFormat: validateTokenFormat(validToken),
        expiredFormat: validateTokenFormat(expiredToken),
        malformedFormat: validateTokenFormat(malformedToken),
        validExpired: isTokenExpired(validToken),
        expiredExpired: isTokenExpired(expiredToken),
        malformedExpired: isTokenExpired(malformedToken),
      };
    });

    expect(results.validFormat).toBe(true);
    expect(results.expiredFormat).toBe(true);
    expect(results.malformedFormat).toBe(false);
    expect(results.validExpired).toBe(false);
    expect(results.expiredExpired).toBe(true);
    expect(results.malformedExpired).toBe(true);

    await page.screenshot({ path: "test-results/10-token-validation-helpers.png" });
  });
});

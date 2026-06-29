const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const page = await context.newPage();

  const errors = [];
  page.on('pageerror', (err) => errors.push(`PAGE ERROR: ${err.message}`));
  page.on('console', (msg) => {
    if (msg.type() === 'error' && !msg.text().includes('favicon')) {
      errors.push(`CONSOLE ERROR: ${msg.text()}`);
    }
  });

  const BASE = 'http://localhost:3000';

  async function safeGoto(url) {
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 10000 });
      await page.waitForTimeout(1000);
    } catch (e) {
      errors.push(`NAV ERROR: ${url} - ${e.message}`);
    }
  }

  console.log('=== TEST 1: Public pages load without crash ===');
  for (const path of ['/', '/auth/sign-in', '/auth/sign-up', '/interview']) {
    await safeGoto(`${BASE}${path}`);
    const title = await page.title();
    const hasContent = await page.locator('body').innerText();
    console.log(`  ${path}: title="${title}" content=${hasContent.length > 10 ? 'YES' : 'EMPTY!'}`);
    if (hasContent.length < 10) errors.push(`EMPTY PAGE: ${path}`);
  }

  console.log('\n=== TEST 2: Protected pages show auth state (not crash) ===');
  for (const path of ['/workspace', '/dashboard', '/competitors', '/brief', '/blueprints']) {
    await safeGoto(`${BASE}${path}`);
    await page.waitForTimeout(2000);
    const bodyText = await page.locator('body').innerText();
    const hasAuthUI = bodyText.includes('Sign') || bodyText.includes('sign') || bodyText.includes('loading') || bodyText.includes('Select') || bodyText.includes('start');
    console.log(`  ${path}: auth_ui=${hasAuthUI} content_len=${bodyText.length}`);
    if (bodyText.length < 5) errors.push(`EMPTY PROTECTED PAGE: ${path}`);
  }

  console.log('\n=== TEST 3: Rapid back/forward navigation ===');
  await safeGoto(`${BASE}/`);
  await safeGoto(`${BASE}/auth/sign-in`);
  await safeGoto(`${BASE}/auth/sign-up`);
  await safeGoto(`${BASE}/interview`);
  await page.goBack();
  await page.goBack();
  await page.goForward();
  await page.goForward();
  await page.waitForTimeout(1000);
  const afterNav = await page.locator('body').innerText();
  console.log(`  After rapid nav: content_len=${afterNav.length}`);
  if (afterNav.length < 5) errors.push(`CRASH after rapid nav`);

  console.log('\n=== TEST 4: Hard refresh on protected pages ===');
  for (const path of ['/workspace', '/dashboard', '/competitors', '/brief', '/blueprints']) {
    await safeGoto(`${BASE}${path}`);
    await page.waitForTimeout(1500);
    try {
      await page.reload({ waitUntil: 'domcontentloaded', timeout: 8000 });
      await page.waitForTimeout(1500);
      const text = await page.locator('body').innerText();
      console.log(`  ${path} refresh: content_len=${text.length} ok=${text.length > 5}`);
      if (text.length < 5) errors.push(`EMPTY after refresh: ${path}`);
    } catch (e) {
      errors.push(`REFRESH CRASH: ${path} - ${e.message}`);
    }
  }

  console.log('\n=== TEST 5: Invalid URL paths ===');
  for (const path of ['/nonexistent', '/workspace?invalid=true', '/dashboard?id=fake-id-12345']) {
    await safeGoto(`${BASE}${path}`);
    await page.waitForTimeout(2000);
    const text = await page.locator('body').innerText();
    const hasContent = text.length > 10;
    console.log(`  ${path}: has_content=${hasContent}`);
    if (!hasContent) errors.push(`EMPTY on invalid path: ${path}`);
  }

  console.log('\n=== TEST 6: Double-click buttons on landing ===');
  await safeGoto(`${BASE}/`);
  await page.waitForTimeout(1000);
  const startBtn = page.locator('a[href="/interview"]').first();
  if (await startBtn.isVisible()) {
    await startBtn.dblclick();
    await page.waitForTimeout(2000);
    const url = page.url();
    console.log(`  After double-click start: url=${url}`);
  }

  console.log('\n=== TEST 7: Clear localStorage mid-session ===');
  await safeGoto(`${BASE}/`);
  await page.waitForTimeout(1000);
  await page.evaluate(() => localStorage.clear());
  await safeGoto(`${BASE}/workspace`);
  await page.waitForTimeout(2000);
  const textAfterClear = await page.locator('body').innerText();
  console.log(`  After localStorage clear on workspace: content_len=${textAfterClear.length}`);
  if (textAfterClear.length < 5) errors.push(`CRASH after localStorage clear`);

  console.log('\n=== TEST 8: Console errors summary ===');
  console.log(`  Total errors found: ${errors.length}`);
  errors.forEach(e => console.log(`  - ${e}`));

  await browser.close();

  if (errors.length > 0) {
    console.log('\n❌ FAILURES DETECTED');
    process.exit(1);
  } else {
    console.log('\n✅ ALL TESTS PASSED');
  }
})();

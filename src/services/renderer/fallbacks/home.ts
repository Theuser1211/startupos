import { BlueprintResult, ThemeSpec, PageSpec, PageHTMLResult } from "../../../types/ai.js";

export function renderHomeFallback(
  blueprint: BlueprintResult,
  theme: ThemeSpec,
  page: PageSpec,
): PageHTMLResult {
  const features = blueprint.keyFeatures
    .slice(0, 4)
    .map(
      (f) => `
      <div class="feature-card">
        <div class="feature-icon">&#9670;</div>
        <h3>${escapeHTML(f)}</h3>
      </div>`,
    )
    .join("\n");

  const heroContent = page.sections.find((s) => s.type === "hero");
  const headline =
    (heroContent?.content?.headline as string) || blueprint.name;
  const subheadline =
    (heroContent?.content?.subheadline as string) || blueprint.description;
  const ctaText =
    (heroContent?.content?.ctaText as string) || "Learn More";

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHTML(blueprint.name)}</title>
  <meta name="description" content="${escapeHTML(blueprint.description)}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --primary: ${theme.primaryColor};
      --secondary: ${theme.secondaryColor};
      --font: '${theme.fontFamily}', sans-serif;
      --radius: ${theme.borderRadius};
    }
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html { scroll-behavior: smooth; }
    body { font-family: var(--font); line-height: 1.6; color: #333; }
    .container { max-width: 1200px; margin: 0 auto; padding: 0 24px; }
    header { padding: 16px 0; background: var(--primary); color: white; }
    header nav { display: flex; justify-content: space-between; align-items: center; }
    header .logo { font-size: 1.5rem; font-weight: 700; }
    .hero { padding: 80px 0; text-align: center; background: linear-gradient(135deg, var(--primary), var(--secondary)); color: white; }
    .hero h1 { font-size: 3rem; margin-bottom: 16px; }
    .hero p { font-size: 1.25rem; max-width: 600px; margin: 0 auto 32px; opacity: 0.9; }
    .cta-btn { display: inline-block; padding: 14px 32px; background: white; color: var(--primary); border-radius: var(--radius); font-weight: 600; text-decoration: none; transition: transform 0.2s, box-shadow 0.2s; }
    .cta-btn:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.2); }
    .features { padding: 80px 0; }
    .features h2 { text-align: center; font-size: 2rem; margin-bottom: 48px; color: var(--primary); }
    .features-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 32px; }
    .feature-card { padding: 32px; border: 1px solid #eee; border-radius: var(--radius); text-align: center; transition: box-shadow 0.2s; }
    .feature-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.1); }
    .feature-icon { font-size: 2rem; margin-bottom: 16px; color: var(--primary); }
    .feature-card h3 { font-size: 1.1rem; margin-bottom: 8px; }
    footer { padding: 32px 0; text-align: center; background: var(--primary); color: white; opacity: 0.9; }
    @media (max-width: 768px) {
      .hero h1 { font-size: 2rem; }
      .hero p { font-size: 1rem; }
      .features-grid { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>
  <header>
    <div class="container">
      <nav>
        <div class="logo">${escapeHTML(blueprint.name)}</div>
      </nav>
    </div>
  </header>
  <main>
    <section class="hero">
      <div class="container">
        <h1>${escapeHTML(headline)}</h1>
        <p>${escapeHTML(subheadline)}</p>
        <a href="#features" class="cta-btn">${escapeHTML(ctaText)}</a>
      </div>
    </section>
    <section class="features" id="features">
      <div class="container">
        <h2>Key Features</h2>
        <div class="features-grid">
          ${features}
        </div>
      </div>
    </section>
  </main>
  <footer>
    <div class="container">
      <p>&copy; ${new Date().getFullYear()} ${escapeHTML(blueprint.name)}. All rights reserved.</p>
    </div>
  </footer>
</body>
</html>`;

  return { slug: page.slug, title: page.name, html };
}

export function renderGenericFallback(
  blueprint: BlueprintResult,
  theme: ThemeSpec,
  page: PageSpec,
): PageHTMLResult {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHTML(page.name)} - ${escapeHTML(blueprint.name)}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --primary: ${theme.primaryColor};
      --secondary: ${theme.secondaryColor};
      --font: '${theme.fontFamily}', sans-serif;
      --radius: ${theme.borderRadius};
    }
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: var(--font); line-height: 1.6; color: #333; }
    .container { max-width: 1200px; margin: 0 auto; padding: 0 24px; }
    header { padding: 16px 0; background: var(--primary); color: white; }
    header nav { display: flex; justify-content: space-between; align-items: center; }
    header .logo { font-size: 1.5rem; font-weight: 700; }
    .page { padding: 80px 0; }
    .page h1 { font-size: 2.5rem; color: var(--primary); margin-bottom: 24px; }
    .page p { font-size: 1.1rem; max-width: 700px; }
    footer { padding: 32px 0; text-align: center; background: var(--primary); color: white; }
    @media (max-width: 768px) {
      .page h1 { font-size: 1.8rem; }
    }
  </style>
</head>
<body>
  <header>
    <div class="container">
      <nav>
        <div class="logo">${escapeHTML(blueprint.name)}</div>
      </nav>
    </div>
  </header>
  <main>
    <section class="page">
      <div class="container">
        <h1>${escapeHTML(page.name)}</h1>
        <p>${escapeHTML(blueprint.description)}</p>
      </div>
    </section>
  </main>
  <footer>
    <div class="container">
      <p>&copy; ${new Date().getFullYear()} ${escapeHTML(blueprint.name)}. All rights reserved.</p>
    </div>
  </footer>
</body>
</html>`;

  return { slug: page.slug, title: page.name, html };
}

function escapeHTML(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

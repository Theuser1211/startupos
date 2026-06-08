/**
 * Website Generator for StartupOS
 *
 * Generates production-grade HTML/CSS landing pages based on brand data
 * and startup information. Outputs self-contained HTML that can be
 * deployed to Vercel or hosted statically.
 *
 * Design approach:
 * - Dark theme matching StartupOS aesthetic
 * - Responsive layout (mobile-first)
 * - SEO-optimized (meta tags, semantic HTML, structured data)
 * - Performance-focused (minimal JS, optimized assets)
 * - Accessibility (ARIA labels, semantic landmarks, good contrast)
 */

interface WebsiteConfig {
  startupName: string;
  tagline: string;
  problem: string;
  solution: string;
  brand: {
    mission: string;
    values: string[];
    tone: string[];
    colors: { name: string; hex: string }[];
    typography: { heading: string; body: string };
  };
  icp: {
    title: string;
    description: string;
    painPoints: string[];
  };
  industry: string;
}

/**
 * Generate a complete, self-contained landing page HTML document.
 */
export function generateLandingPage(config: WebsiteConfig): string {
  const { startupName, tagline, problem, solution, brand, icp, industry } = config;

  const primaryColor = brand.colors[0]?.hex || "#7C3AED";
  const secondaryColor = brand.colors[1]?.hex || "#6366F1";
  const darkColor = brand.colors[2]?.hex || "#0A0A0F";

  const styles = generateStyles(primaryColor, secondaryColor, darkColor);
  const heroHtml = generateHeroSection(startupName, tagline);
  const problemHtml = generateProblemSection(problem);
  const solutionHtml = generateSolutionSection(solution);
  const valuesHtml = generateValuesSection(brand.values);
  const painPointsHtml = generatePainPointsSection(icp.painPoints);
  const ctaHtml = generateCTASection(startupName);
  const footerHtml = generateFooter(startupName);
  const structuredData = generateStructuredData(startupName, tagline, industry);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${startupName} — ${tagline}</title>
  <meta name="description" content="${startupName}: ${tagline}. ${problem.substring(0, 150)}" />
  <meta name="robots" content="index, follow" />
  <link rel="canonical" href="https://${startupName.toLowerCase().replace(/\\s+/g, "")}.com" />

  <!-- Open Graph -->
  <meta property="og:title" content="${startupName} — ${tagline}" />
  <meta property="og:description" content="${problem.substring(0, 150)}" />
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="${startupName}" />

  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${startupName} — ${tagline}" />

  <!-- Structured Data -->
  <script type="application/ld+json">${JSON.stringify(structuredData, null, 2)}</script>

  <style>${styles}</style>
</head>
<body>
  <!-- Skip to content -->
  <a href="#main" class="skip-link">Skip to main content</a>

  <!-- Navigation -->
  <nav class="nav" role="navigation" aria-label="Main navigation">
    <div class="container nav-inner">
      <a href="/" class="logo" aria-label="${startupName} home">
        <span class="logo-icon" aria-hidden="true">✦</span>
        <span class="logo-text">${startupName}</span>
      </a>
      <div class="nav-links">
        <a href="#problem">Problem</a>
        <a href="#solution">Solution</a>
        <a href="#values">Values</a>
        <a href="#cta" class="nav-cta">Get Started</a>
      </div>
    </div>
  </nav>

  <main id="main">
    ${heroHtml}
    ${problemHtml}
    ${solutionHtml}
    ${valuesHtml}
    ${painPointsHtml}
    ${ctaHtml}
  </main>

  ${footerHtml}
</body>
</html>`;
}

function generateStyles(primary: string, secondary: string, dark: string): string {
  return `
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --primary: ${primary};
  --secondary: ${secondary};
  --dark: ${dark};
  --bg: #0a0a0f;
  --bg-card: #121219;
  --bg-elevated: #1a1a24;
  --text: #f1f1f5;
  --text-secondary: #a1a1b5;
  --border: rgba(255,255,255,0.08);
  --radius: 12px;
  --radius-lg: 20px;
  --font-sans: system-ui, -apple-system, sans-serif;
}

html { scroll-behavior: smooth; }

body {
  font-family: var(--font-sans);
  background: var(--bg);
  color: var(--text);
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
}

.skip-link {
  position: absolute;
  top: -100%;
  left: 16px;
  padding: 8px 16px;
  background: var(--primary);
  color: white;
  border-radius: 8px;
  z-index: 1000;
  font-size: 14px;
  text-decoration: none;
}

.skip-link:focus { top: 16px; }

.container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 24px;
}

/* Navigation */
.nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background: rgba(10,10,15,0.8);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--border);
}

.nav-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  color: var(--text);
  font-weight: 700;
  font-size: 18px;
}

.logo-icon {
  font-size: 24px;
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.nav-links { display: flex; align-items: center; gap: 24px; }

.nav-links a {
  color: var(--text-secondary);
  text-decoration: none;
  font-size: 14px;
  transition: color 0.2s;
}

.nav-links a:hover { color: var(--text); }

.nav-cta {
  padding: 8px 20px;
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  color: white !important;
  border-radius: 8px;
  font-weight: 600;
  transition: opacity 0.2s;
}

.nav-cta:hover { opacity: 0.9; }

/* Sections */
section { padding: 100px 0; }

.section-label {
  display: inline-block;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 2px;
  color: var(--primary);
  margin-bottom: 16px;
}

h2 {
  font-size: clamp(32px, 5vw, 48px);
  font-weight: 800;
  line-height: 1.15;
  margin-bottom: 20px;
  letter-spacing: -0.02em;
}

/* Hero */
.hero {
  min-height: 90vh;
  display: flex;
  align-items: center;
  text-align: center;
  padding-top: 64px;
  position: relative;
  overflow: hidden;
}

.hero::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(ellipse at center, ${primary}08 0%, transparent 60%);
  pointer-events: none;
}

.hero-content { position: relative; }

.hero h1 {
  font-size: clamp(40px, 7vw, 72px);
  font-weight: 800;
  line-height: 1.1;
  letter-spacing: -0.03em;
  margin-bottom: 24px;
}

.hero h1 span {
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero p {
  font-size: clamp(16px, 2vw, 20px);
  color: var(--text-secondary);
  max-width: 600px;
  margin: 0 auto 40px;
  line-height: 1.7;
}

.hero-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 14px 32px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  text-decoration: none;
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: pointer;
}

.btn:hover { transform: translateY(-2px); }

.btn-primary {
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  color: white;
  box-shadow: 0 4px 20px ${primary}40;
}

.btn-secondary {
  border: 1px solid var(--border);
  color: var(--text);
}

.btn-secondary:hover {
  border-color: var(--text-secondary);
  box-shadow: 0 4px 20px rgba(255,255,255,0.05);
}

/* Problem & Solution */
.problem-grid,
.solution-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 48px;
  align-items: center;
}

@media (max-width: 768px) {
  .problem-grid,
  .solution-grid {
    grid-template-columns: 1fr;
    gap: 24px;
  }
}

.problem-visual,
.solution-visual {
  aspect-ratio: 1;
  border-radius: var(--radius-lg);
  background: linear-gradient(135deg, ${primary}15, ${secondary}10);
  border: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 64px;
}

/* Cards grid */
.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
}

.card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 32px;
  transition: transform 0.2s, border-color 0.2s;
}

.card:hover {
  transform: translateY(-4px);
  border-color: ${primary}40;
}

.card-icon {
  font-size: 28px;
  margin-bottom: 16px;
}

.card h3 {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 8px;
}

.card p {
  color: var(--text-secondary);
  font-size: 14px;
  line-height: 1.7;
}

/* Pain points list */
.pain-list {
  display: grid;
  gap: 16px;
  max-width: 640px;
}

.pain-item {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 20px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
}

.pain-icon {
  font-size: 20px;
  flex-shrink: 0;
  margin-top: 2px;
}

.pain-item p {
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.6;
}

/* CTA Section */
.cta-section {
  text-align: center;
  background: linear-gradient(135deg, ${primary}10, ${secondary}05);
  border-top: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
}

.cta-section h2 {
  max-width: 600px;
  margin: 0 auto 20px;
}

.cta-section p {
  color: var(--text-secondary);
  font-size: 18px;
  max-width: 500px;
  margin: 0 auto 40px;
}

/* Footer */
.footer {
  padding: 48px 0;
  border-top: 1px solid var(--border);
  text-align: center;
}

.footer p {
  color: var(--text-secondary);
  font-size: 13px;
}

.footer-links {
  display: flex;
  justify-content: center;
  gap: 24px;
  margin-bottom: 24px;
}

.footer-links a {
  color: var(--text-secondary);
  text-decoration: none;
  font-size: 13px;
  transition: color 0.2s;
}

.footer-links a:hover { color: var(--text); }

/* Animations */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.hero-content { animation: fadeIn 0.8s ease-out; }
`;
}

function generateHeroSection(name: string, tagline: string): string {
  return `
<section class="hero">
  <div class="container hero-content">
    <h1>
      Build <span>${name}</span><br />
      ${tagline}
    </h1>
    <p>Empowering teams to move faster, think bigger, and build better. Join thousands of forward-thinking companies already using ${name}.</p>
    <div class="hero-actions">
      <a href="#cta" class="btn btn-primary">Get Started Free →</a>
      <a href="#solution" class="btn btn-secondary">Learn More</a>
    </div>
  </div>
</section>`;
}

function generateProblemSection(problem: string): string {
  return `
<section id="problem">
  <div class="container">
    <div class="problem-grid">
      <div>
        <span class="section-label">The Problem</span>
        <h2>Current solutions aren't working</h2>
        <p style="color: var(--text-secondary); font-size: 16px; line-height: 1.8;">${problem}</p>
      </div>
      <div class="problem-visual" aria-hidden="true" role="img" aria-label="Visual representation of the problem">
        ⚡
      </div>
    </div>
  </div>
</section>`;
}

function generateSolutionSection(solution: string): string {
  return `
<section id="solution" style="background: var(--bg-card);">
  <div class="container">
    <div class="solution-grid">
      <div class="solution-visual" aria-hidden="true" role="img" aria-label="Visual representation of the solution">
        ✦
      </div>
      <div>
        <span class="section-label">Our Solution</span>
        <h2>Built differently from the ground up</h2>
        <p style="color: var(--text-secondary); font-size: 16px; line-height: 1.8;">${solution}</p>
      </div>
    </div>
  </div>
</section>`;
}

function generateValuesSection(values: string[]): string {
  const valueCards = values.map((v, i) => `
    <div class="card">
      <div class="card-icon" aria-hidden="true">${["🎯", "⚡", "🔒", "🌍"][i % 4]}</div>
      <h3>${v}</h3>
      <p>Our commitment to ${v.toLowerCase()} drives every decision we make and every product we ship.</p>
    </div>
  `).join("");

  return `
<section id="values">
  <div class="container">
    <div style="text-align: center; margin-bottom: 48px;">
      <span class="section-label">Our Values</span>
      <h2>What we believe in</h2>
    </div>
    <div class="cards-grid">
      ${valueCards}
    </div>
  </div>
</section>`;
}

function generatePainPointsSection(painPoints: string[]): string {
  const items = painPoints.map((p) => `
    <div class="pain-item">
      <span class="pain-icon" aria-hidden="true">!</span>
      <p>${p}</p>
    </div>
  `).join("");

  return `
<section id="pain-points" style="background: var(--bg-card);">
  <div class="container">
    <div style="text-align: center; margin-bottom: 48px;">
      <span class="section-label">Common Challenges</span>
      <h2>You're not alone</h2>
      <p style="color: var(--text-secondary); max-width: 500px; margin: 0 auto;">These are the most common pain points we hear from teams like yours.</p>
    </div>
    <div style="display: flex; justify-content: center;">
      <div class="pain-list">
        ${items}
      </div>
    </div>
  </div>
</section>`;
}

function generateCTASection(name: string): string {
  return `
<section id="cta" class="cta-section">
  <div class="container">
    <h2>Ready to build with ${name}?</h2>
    <p>Start free, upgrade when you need to. No credit card required.</p>
    <div class="hero-actions">
      <a href="#" class="btn btn-primary">Get Started Now →</a>
      <a href="#" class="btn btn-secondary">Talk to Sales</a>
    </div>
  </div>
</section>`;
}

function generateFooter(name: string): string {
  return `
<footer class="footer">
  <div class="container">
    <div class="footer-links">
      <a href="#problem">Problem</a>
      <a href="#solution">Solution</a>
      <a href="#cta">Get Started</a>
    </div>
    <p>&copy; ${new Date().getFullYear()} ${name}. All rights reserved.</p>
  </div>
</footer>`;
}

function generateStructuredData(
  name: string,
  tagline: string,
  industry: string,
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name,
    description: tagline,
    applicationCategory: industry === "ai" ? "AIApplication" : "BusinessApplication",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  };
}

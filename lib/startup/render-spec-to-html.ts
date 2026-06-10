/**
 * Server-side WebsiteSpec → HTML renderer.
 *
 * Produces a complete, self-contained HTML document for Vercel deployment.
 * The client-side React renderer is for preview; this server-side renderer
 * produces static HTML that works as a standalone landing page.
 */

import type { WebsiteSpec, WebsiteSection } from "@/lib/startup/website-spec";

export function renderSpecToHtml(spec: WebsiteSpec): string {
  const v = spec.visualStyle;
  const sections = buildSectionsHtml(spec);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${esc(spec.sections.find(s => s.type === "hero")?.heading || "Startup")}</title>
  <meta name="description" content="${esc(spec.copy.tagline)}" />
  <meta name="robots" content="index, follow" />
  <meta property="og:title" content="${esc(spec.sections.find(s => s.type === "hero")?.heading || "Startup")}" />
  <meta property="og:description" content="${esc(spec.copy.tagline)}" />
  <meta name="generated-by" content="StartupOS WebsiteSpec Generator" />
  ${spec.metadata ? `
  <meta name="generation-provider" content="${esc(spec.metadata.provider)}" />
  <meta name="generation-model" content="${esc(spec.metadata.model)}" />
  ` : ""}
  <style>
    ${getBaseStyles(v)}
  </style>
</head>
<body>
  <a href="#main" class="skip-link">Skip to main content</a>
  ${buildNav(spec)}
  <main id="main">
    ${sections.join("\n    ")}
  </main>
  ${buildFooter(spec)}
  ${spec.metadata ? `
  <div class="gen-badge">
    <span>✦ AI</span>
    <span>${esc(spec.metadata.provider)} · ${esc(spec.metadata.model)}</span>
  </div>` : ""}
</body>
</html>`;
}

function buildNav(spec: WebsiteSpec): string {
  const v = spec.visualStyle;
  const navLinks = spec.sectionOrder
    .filter(id => id !== "hero" && id !== "cta")
    .slice(0, 4);

  return `
<nav class="nav" role="navigation" aria-label="Main navigation">
  <div class="container nav-inner">
    <a href="/" class="logo">✦ <span class="logo-text">${esc(spec.sections.find(s => s.type === "hero")?.heading || "Startup")}</span></a>
    <div class="nav-links">
      ${navLinks.map(id => {
        const section = spec.sections.find(s => s.id === id);
        return section ? `<a href="#${id}">${esc(section.heading.substring(0, 20))}</a>` : "";
      }).join("\n      ")}
      <a href="#cta" class="nav-cta" style="background:linear-gradient(135deg,${v.primary},${v.secondary})">${esc(spec.copy.ctaPrimary)}</a>
    </div>
  </div>
</nav>`;
}

function buildFooter(spec: WebsiteSpec): string {
  const name = spec.sections.find(s => s.type === "hero")?.heading || "Startup";
  return `
<footer class="footer">
  <div class="container">
    <p>&copy; ${new Date().getFullYear()} ${esc(name)}. All rights reserved.</p>
  </div>
</footer>`;
}

function buildSectionsHtml(spec: WebsiteSpec): string[] {
  return spec.sectionOrder
    .map(id => spec.sections.find(s => s.id === id))
    .filter((s): s is WebsiteSection => s != null)
    .map(section => buildSectionHtml(section, spec));
}

function buildSectionHtml(section: WebsiteSection, spec: WebsiteSpec): string {
  const v = spec.visualStyle;
  const items = section.items || [];

  switch (section.type) {
    case "hero":
      return `
<section id="${section.id}" class="hero">
  <div class="container hero-content">
    ${section.subheading ? `<div class="hero-badge">${esc(section.subheading)}</div>` : ""}
    <h1>${esc(section.heading)}<br /><span class="gradient-text">${esc(spec.copy.tagline)}</span></h1>
    <p class="hero-sub">${esc(section.body || "")}</p>
    <div class="hero-actions">
      <a href="#cta" class="btn btn-primary" style="background:linear-gradient(135deg,${v.primary},${v.secondary});box-shadow:0 4px 20px ${v.primary}40">${esc(spec.copy.ctaPrimary)}</a>
      <a href="#${spec.sectionOrder.find(id => id !== "hero" && id !== "cta") || "values"}" class="btn btn-secondary">${esc(spec.copy.ctaSecondary)}</a>
    </div>
    ${items.length > 0 ? `
    <div class="hero-metrics">${items.map(item => `
      <div class="metric">
        <span class="metric-value gradient-text">${esc(item.meta || "")}</span>
        <span class="metric-label">${esc(item.title)}</span>
      </div>`).join("")}
    </div>` : ""}
  </div>
</section>`;

    case "problem":
      return `
<section id="${section.id}">
  <div class="container">
    <div class="split-grid">
      <div>
        <span class="section-label" style="color:${v.primary}">${esc(section.subheading || "The Problem")}</span>
        <h2>${esc(section.heading)}</h2>
        <p class="split-text">${esc(section.body || "")}</p>
        ${items.length > 0 ? `<div class="problem-stats">${items.slice(0, 3).map(item => `
          <div class="problem-stat"><div class="problem-stat-dot" style="background:${v.primary}"></div><span>${esc(item.description || item.title)}</span></div>`).join("")}</div>` : ""}
      </div>
      <div class="split-visual" aria-hidden="true">
        <div class="visual-card">
          <div class="visual-icon">⚠️</div>
          <div class="visual-bar" style="width:85%;background:linear-gradient(90deg,${v.primary}40,${v.secondary}40)"></div>
          <div class="visual-bar" style="width:60%;background:linear-gradient(90deg,${v.primary}30,${v.secondary}30)"></div>
          <div class="visual-bar" style="width:40%;background:linear-gradient(90deg,${v.primary}20,${v.secondary}20)"></div>
        </div>
      </div>
    </div>
  </div>
</section>`;

    case "solution":
      return `
<section id="${section.id}" class="section-alt">
  <div class="container">
    <div class="split-grid split-reverse">
      <div class="split-visual" aria-hidden="true">
        <div class="visual-card">
          <div class="visual-icon">✦</div>
          <div class="visual-bar" style="width:95%;background:linear-gradient(90deg,${v.primary},${v.secondary})"></div>
          <div class="visual-bar" style="width:88%;background:linear-gradient(90deg,${v.primary}80,${v.secondary}80)"></div>
          <div class="visual-bar" style="width:76%;background:linear-gradient(90deg,${v.primary}60,${v.secondary}60)"></div>
        </div>
      </div>
      <div>
        <span class="section-label" style="color:${v.primary}">${esc(section.subheading || "How We Help")}</span>
        <h2>${esc(section.heading)}</h2>
        <p class="split-text">${esc(section.body || "")}</p>
      </div>
    </div>
  </div>
</section>`;

    case "values":
      return `
<section id="${section.id}">
  <div class="container">
    <div class="section-center">
      <span class="section-label">${esc(section.subheading || "Our Values")}</span>
      <h2>${esc(section.heading)}</h2>
    </div>
    <div class="cards-grid">
      ${items.map(item => `
      <div class="card card-hover">
        <h3>${esc(item.title)}</h3>
        <p>${esc(item.description)}</p>
      </div>`).join("")}
    </div>
  </div>
</section>`;

    case "pain-points":
      return `
<section id="${section.id}" class="section-alt">
  <div class="container">
    <div class="col-2-grid">
      <div>
        <span class="section-label" style="color:${v.primary}">${esc(section.subheading || "Challenges")}</span>
        <h2>${esc(section.heading)}</h2>
        ${items.length > 0 ? `<div class="pain-list">${items.slice(0, Math.ceil(items.length/2)).map(item => `
          <div class="pain-item"><div class="pain-dot" style="background:${v.primary}"></div><p>${esc(item.description || item.title)}</p></div>`).join("")}</div>` : ""}
      </div>
      <div>
        <span class="section-label" style="color:${v.secondary}">Goals</span>
        <h2>What they want</h2>
        ${items.length > 1 ? `<div class="pain-list">${items.slice(Math.ceil(items.length/2)).map(item => `
          <div class="pain-item"><div class="pain-dot" style="background:${v.secondary}"></div><p>${esc(item.description || item.title)}</p></div>`).join("")}</div>` : ""}
      </div>
    </div>
  </div>
</section>`;

    case "features":
      return `
<section id="${section.id}" class="section-alt">
  <div class="container">
    <div class="section-center">
      <span class="section-label">${esc(section.subheading || "Features")}</span>
      <h2>${esc(section.heading)}</h2>
    </div>
    <div class="cards-grid cards-3">
      ${items.slice(0, 6).map(item => `
      <div class="card card-hover">
        <h3>${esc(item.title)}</h3>
        <p>${esc(item.description)}</p>
      </div>`).join("")}
    </div>
  </div>
</section>`;

    case "social-proof":
      return `
<section id="${section.id}">
  <div class="container">
    <div class="section-center">
      <span class="section-label">${esc(section.subheading || "The Verdict")}</span>
      <h2>${esc(section.heading)}</h2>
      ${section.body ? `<p style="color:var(--text-secondary)">${esc(section.body)}</p>` : ""}
    </div>
    <div class="cards-grid cards-3">
      ${items.slice(0, 3).map(item => `
      <div class="card">
        <div class="card-header-row">
          <span class="card-category">${esc(item.title)}</span>
          <span class="card-rating" style="color:${item.metaColor || v.primary}">${esc(item.meta || "")}</span>
        </div>
        <p>${esc(item.description)}</p>
      </div>`).join("")}
    </div>
  </div>
</section>`;

    case "pricing":
      return `
<section id="${section.id}" class="section-alt">
  <div class="container text-center">
    <span class="section-label" style="color:${v.primary}">${esc(section.subheading || "Pricing")}</span>
    <h2>${esc(section.heading)}</h2>
    ${section.body ? `<p style="color:var(--text-secondary);max-width:500px;margin:0 auto 24px">${esc(section.body)}</p>` : ""}
    <div style="margin-top:24px">
      <a href="#cta" class="btn btn-primary" style="background:linear-gradient(135deg,${v.primary},${v.secondary});box-shadow:0 4px 20px ${v.primary}40">${esc(spec.copy.ctaPrimary)}</a>
    </div>
  </div>
</section>`;

    case "faq":
      return `
<section id="${section.id}">
  <div class="container">
    <div class="section-center">
      <span class="section-label">FAQ</span>
      <h2>${esc(section.heading)}</h2>
    </div>
    <div class="faq-list">
      ${items.map((item, i) => `
      <details class="faq-item">
        <summary class="faq-question"><span>${esc(item.title)}</span><span class="faq-icon">+</span></summary>
        <div class="faq-answer"><p>${esc(item.description)}</p></div>
      </details>`).join("")}
    </div>
  </div>
</section>`;

    case "cta":
      return `
<section id="cta" class="cta-section" style="background:linear-gradient(135deg,${v.primary}10,${v.secondary}05)">
  <div class="container text-center">
    <h2>${esc(section.heading || "Ready to get started?")}</h2>
    <p style="color:var(--text-secondary)">${esc(spec.copy.ctaSubtext)}</p>
    <div class="hero-actions" style="margin-top:24px">
      <a href="#" class="btn btn-primary" style="background:linear-gradient(135deg,${v.primary},${v.secondary});box-shadow:0 4px 20px ${v.primary}40">${esc(spec.copy.ctaPrimary)}</a>
      <a href="#" class="btn btn-secondary">${esc(spec.copy.ctaSecondary)}</a>
    </div>
  </div>
</section>`;

    default:
      return `
<section id="${section.id}">
  <div class="container text-center">
    <span class="section-label">${esc(section.type)}</span>
    <h2>${esc(section.heading)}</h2>
    ${section.body ? `<p style="color:var(--text-secondary)">${esc(section.body)}</p>` : ""}
  </div>
</section>`;
  }
}

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function getBaseStyles(v: WebsiteSpec["visualStyle"]): string {
  return `
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{--primary:${v.primary};--secondary:${v.secondary};--bg:${v.background};--bg-card:${v.surface};--text:#f1f1f5;--text-secondary:rgba(255,255,255,0.6);--border:rgba(255,255,255,0.08);--radius:${v.radius}}
html{scroll-behavior:smooth}
body{font-family:${v.fontBody},system-ui,sans-serif;background:var(--bg);color:var(--text);-webkit-font-smoothing:antialiased}
.skip-link{position:absolute;top:-100%;left:16px;padding:8px 16px;background:var(--primary);color:white;border-radius:8px;z-index:1000;text-decoration:none}
.skip-link:focus{top:16px}
.container{max-width:1100px;margin:0 auto;padding:0 24px}
.text-center{text-align:center}
.nav{position:fixed;top:0;left:0;right:0;z-index:100;background:${v.background}d9;backdrop-filter:blur(20px);border-bottom:1px solid var(--border)}
.nav-inner{display:flex;align-items:center;justify-content:space-between;height:64px}
.logo{display:flex;align-items:center;gap:10px;text-decoration:none;color:var(--text);font-weight:700;font-size:18px}
.logo-text{background:linear-gradient(135deg,var(--primary),var(--secondary));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.nav-links{display:flex;align-items:center;gap:24px}
.nav-links a{color:var(--text-secondary);text-decoration:none;font-size:14px;transition:color .2s}
.nav-links a:hover{color:var(--text)}
.nav-cta{padding:8px 20px;color:white!important;border-radius:8px;font-weight:600}
section{padding:100px 0}
.section-alt{background:var(--bg-card)}
.section-center{text-align:center;margin-bottom:48px}
.section-label{display:inline-block;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:2px;margin-bottom:16px}
h2{font-size:clamp(32px,5vw,48px);font-weight:800;line-height:1.15;margin-bottom:20px;letter-spacing:-.02em}
h3{font-size:18px;font-weight:700;margin-bottom:8px}
.hero{min-height:85vh;display:flex;align-items:center;text-align:center;padding-top:64px;position:relative}
.hero-content{position:relative;width:100%}
.hero h1{font-size:clamp(40px,7vw,72px);font-weight:800;line-height:1.1;letter-spacing:-.03em;margin-bottom:20px}
.hero p,.hero-sub{font-size:clamp(16px,2vw,20px);color:var(--text-secondary);max-width:600px;margin:0 auto 40px;line-height:1.7}
.hero-actions{display:flex;gap:16px;justify-content:center;flex-wrap:wrap}
.hero-badge{display:inline-block;padding:6px 16px;border-radius:100px;background:${v.primary}20;border:1px solid ${v.primary}30;color:var(--primary);font-size:12px;font-weight:600;margin-bottom:24px}
.hero-metrics{display:flex;gap:40px;justify-content:center;margin-top:48px;flex-wrap:wrap}
.metric{text-align:center}
.metric-value{display:block;font-size:28px;font-weight:800}
.metric-label{font-size:12px;color:var(--text-secondary);text-transform:uppercase;letter-spacing:1px}
.gradient-text{background:linear-gradient(135deg,var(--primary),var(--secondary));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.btn{display:inline-flex;align-items:center;gap:8px;padding:14px 32px;border-radius:var(--radius);font-size:16px;font-weight:600;text-decoration:none;transition:transform .2s;cursor:pointer}
.btn:hover{transform:translateY(-2px)}
.btn-primary{color:white}
.btn-secondary{border:1px solid var(--border);color:var(--text)}
.btn-secondary:hover{border-color:var(--text-secondary)}
.split-grid{display:grid;grid-template-columns:1fr 1fr;gap:60px;align-items:center}
.split-reverse{direction:rtl}
.split-reverse>*{direction:ltr}
.split-text{color:var(--text-secondary);font-size:16px;line-height:1.8}
.split-visual{aspect-ratio:4/3;border-radius:calc(var(--radius)*2);background:linear-gradient(135deg,${v.primary}10,${v.secondary}08);border:1px solid var(--border);display:flex;align-items:center;justify-content:center;padding:32px}
.visual-card{width:100%;display:flex;flex-direction:column;gap:12px}
.visual-icon{font-size:32px;margin-bottom:8px}
.visual-bar{height:12px;border-radius:6px}
.problem-stats{margin-top:24px;display:flex;flex-direction:column;gap:12px}
.problem-stat{display:flex;align-items:center;gap:12px;font-size:14px;color:var(--text-secondary)}
.problem-stat-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0}
.cards-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:20px}
.cards-3{grid-template-columns:repeat(3,1fr)}
.card{background:var(--bg-card);border:1px solid var(--border);border-radius:calc(var(--radius)*2);padding:32px;transition:transform .3s,border-color .3s}
.card-hover:hover{transform:translateY(-4px);border-color:${v.primary}40}
.card p{color:var(--text-secondary);font-size:14px;line-height:1.7}
.card-header-row{display:flex;justify-content:space-between;align-items:center;margin-bottom:12px}
.card-category{font-size:14px;font-weight:700}
.card-rating{font-size:14px;font-weight:700}
.col-2-grid{display:grid;grid-template-columns:1fr 1fr;gap:40px}
.pain-list{display:flex;flex-direction:column;gap:12px}
.pain-item{display:flex;align-items:flex-start;gap:16px;padding:16px 20px;background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius)}
.pain-item p{font-size:14px;color:var(--text-secondary);line-height:1.6}
.pain-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0;margin-top:6px}
.faq-list{max-width:700px;margin:0 auto;display:flex;flex-direction:column;gap:12px}
.faq-item{border-radius:var(--radius);border:1px solid var(--border);overflow:hidden}
.faq-question{padding:20px 24px;cursor:pointer;display:flex;justify-content:space-between;align-items:center;font-weight:600;list-style:none}
.faq-question::-webkit-details-marker{display:none}
.faq-answer{padding:0 24px 20px}
.faq-answer p{font-size:14px;line-height:1.7}
.faq-icon{font-size:20px;transition:transform .2s}
details[open] .faq-icon{transform:rotate(45deg)}
.cta-section{text-align:center;border-top:1px solid var(--border);border-bottom:1px solid var(--border);padding:100px 0}
.cta-section h2{max-width:600px;margin:0 auto 16px}
.cta-section p{font-size:18px;max-width:500px;margin:0 auto 24px}
.footer{padding:48px 0;border-top:1px solid var(--border);text-align:center}
.footer p{color:var(--text-secondary);font-size:13px}
.gen-badge{position:fixed;bottom:16px;right:16px;padding:6px 12px;border-radius:8px;background:${v.surface}e6;border:1px solid var(--border);backdrop-filter:blur(8px);font-size:10px;color:var(--text-secondary);z-index:1000;display:flex;align-items:center;gap:6px;font-family:monospace}
@media(max-width:768px){.split-grid{grid-template-columns:1fr;gap:32px}.split-reverse{direction:ltr}.col-2-grid{grid-template-columns:1fr;gap:32px}.cards-3{grid-template-columns:1fr}}
@media(max-width:480px){.hero-actions{flex-direction:column;align-items:center}.btn{width:100%;justify-content:center}}
`;
}

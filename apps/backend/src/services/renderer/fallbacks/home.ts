import { BlueprintResult, ThemeSpec, PageSpec, PageHTMLResult, WebsiteSpecResult } from "../../../types/ai.js";

function escapeHTML(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

interface DesignTokens {
  primary: string; primaryAlt: string;
  neutral: string; neutralLight: string; neutralDark: string;
  surface: string; surfaceAlt: string; surfaceAlt2: string;
  text: string; textMuted: string;
  border: string;
  font: string; radius: string;
  shadowSm: string; shadowMd: string; shadowLg: string;
}

function buildTokens(theme: ThemeSpec): DesignTokens {
  const p = theme.primaryColor || "#2563EB";
  const s = theme.secondaryColor || "#7C3AED";
  return {
    primary: p, primaryAlt: s,
    neutral: "#6B7280", neutralLight: "#F9FAFB", neutralDark: "#1F2937",
    surface: "#FFFFFF", surfaceAlt: "#F9FAFB", surfaceAlt2: "#F3F4F6",
    text: "#111827", textMuted: "#6B7280",
    border: "#E5E7EB",
    font: theme.fontFamily || "Inter", radius: theme.borderRadius || "12px",
    shadowSm: "0 1px 2px rgba(0,0,0,0.05)",
    shadowMd: "0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1)",
    shadowLg: "0 10px 40px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.06)",
  };
}

function designSystemCSS(t: DesignTokens): string {
  return `
:root {
  --p: ${t.primary}; --p-alt: ${t.primaryAlt};
  --n: ${t.neutral}; --nl: ${t.neutralLight}; --nd: ${t.neutralDark};
  --s: ${t.surface}; --sa: ${t.surfaceAlt}; --sa2: ${t.surfaceAlt2};
  --t: ${t.text}; --tm: ${t.textMuted};
  --b: ${t.border}; --f: '${t.font}', system-ui, -apple-system, sans-serif;
  --r: ${t.radius};
  --sh-sm: ${t.shadowSm}; --sh-md: ${t.shadowMd}; --sh-lg: ${t.shadowLg};
}
@media (prefers-color-scheme:dark) {
  :root {
    --s: #0A0B10; --sa: #111218; --sa2: #181B25;
    --t: #EDEDEF; --tm: #9CA3AF;
    --b: #252837; --nl: #181B25; --nd: #E5E7EB;
    --sh-sm: 0 1px 2px rgba(0,0,0,0.3);
    --sh-md: 0 4px 6px -1px rgba(0,0,0,0.4), 0 2px 4px -2px rgba(0,0,0,0.3);
    --sh-lg: 0 10px 40px rgba(0,0,0,0.4), 0 2px 8px rgba(0,0,0,0.3);
  }
}
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}
body{font-family:var(--f);color:var(--t);background:var(--s);line-height:1.6;font-size:16px}
img{max-width:100%;height:auto;display:block}
a{color:inherit;text-decoration:none}
.container{width:100%;max-width:1200px;margin:0 auto;padding:0 24px}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:12px 28px;border-radius:var(--r);font-weight:600;font-size:0.95rem;transition:all 0.2s ease;cursor:pointer;border:none;font-family:var(--f);line-height:1.2}
.btn-primary{background:var(--p);color:#fff}
.btn-primary:hover{transform:translateY(-2px);box-shadow:0 8px 30px color-mix(in srgb,var(--p) 35%,transparent)}
.btn-outline{background:transparent;color:var(--t);border:1.5px solid var(--b)}
.btn-outline:hover{background:color-mix(in srgb,var(--p) 8%,transparent);border-color:color-mix(in srgb,var(--p) 30%,var(--b));color:var(--p);transform:translateY(-2px)}
.btn-ghost{background:transparent;color:var(--tm);border:none}
.btn-ghost:hover{color:var(--t)}
.btn-lg{padding:16px 36px;font-size:1.05rem}
.section{padding:112px 0}
.section-alt{background:var(--sa)}
.section-label{display:inline-flex;align-items:center;gap:6px;font-size:0.78rem;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:var(--p);margin-bottom:16px;padding:4px 14px;border-radius:100px;background:color-mix(in srgb,var(--p) 10%,transparent)}
.section-title{font-size:2.75rem;font-weight:800;line-height:1.12;letter-spacing:-0.035em;margin-bottom:20px}
.section-title-gradient{background:linear-gradient(135deg,var(--p),var(--p-alt));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.section-subtitle{font-size:1.1rem;color:var(--tm);max-width:600px;line-height:1.7}
.text-center{text-align:center}
.mx-auto{margin-left:auto;margin-right:auto}
.grid{display:grid;gap:32px}
.grid-2{grid-template-columns:repeat(2,1fr)}
.grid-3{grid-template-columns:repeat(3,1fr)}
.grid-4{grid-template-columns:repeat(4,1fr)}
.card{background:var(--s);border:1px solid var(--b);border-radius:calc(var(--r) + 4px);padding:32px;transition:all 0.3s ease;position:relative;overflow:hidden}
.card:hover{box-shadow:var(--sh-lg);transform:translateY(-4px);border-color:transparent}
.card-icon{width:48px;height:48px;border-radius:14px;display:flex;align-items:center;justify-content:center;font-size:1.3rem;margin-bottom:20px;color:#fff;flex-shrink:0}
.card h3{font-size:1.15rem;font-weight:700;margin-bottom:8px;letter-spacing:-0.01em}
.card p{font-size:0.9rem;color:var(--tm);line-height:1.65}
@keyframes fadeUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}
.animate{animation:fadeUp 0.6s ease forwards;opacity:0}
.animate-d1{animation-delay:0.1s}
.animate-d2{animation-delay:0.2s}
.animate-d3{animation-delay:0.3s}
.animate-d4{animation-delay:0.4s}
.animate-d5{animation-delay:0.5s}
@media(max-width:1024px){
  .section-title{font-size:2.3rem}
  .grid-4{grid-template-columns:repeat(2,1fr)}
}
@media(max-width:768px){
  .section{padding:72px 0}
  .section-title{font-size:1.9rem}
  .section-subtitle{font-size:1rem}
  .grid-2,.grid-3,.grid-4{grid-template-columns:1fr}
  .btn{padding:10px 22px;font-size:0.9rem}
}
@media(max-width:480px){
  .section{padding:56px 0}
  .section-title{font-size:1.6rem}
  .container{padding:0 16px}
}
`;
}

function renderNav(blueprint: BlueprintResult, allPages: PageSpec[]): string {
  const links = allPages
    .filter((p) => p.slug !== "/")
    .map((p) => `<a href="${escapeHTML(p.slug)}" class="nav-link">${escapeHTML(p.name)}</a>`)
    .join("\n");
  return `
<nav class="navbar">
  <div class="container nav-inner">
    <a href="/" class="nav-logo">
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><rect width="28" height="28" rx="8" fill="var(--p)"/><path d="M8 14L12 18L20 10" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
      ${escapeHTML(blueprint.name)}
    </a>
    <div class="nav-links">${links}</div>
    <button class="nav-toggle" aria-label="Menu">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 6h16M4 12h16M4 18h16"/></svg>
    </button>
  </div>
</nav>
<style>
.navbar{position:sticky;top:0;z-index:100;background:color-mix(in srgb,var(--s) 80%,transparent);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border-bottom:1px solid var(--b)}
.nav-inner{display:flex;align-items:center;justify-content:space-between;height:68px}
.nav-logo{display:flex;align-items:center;gap:10px;font-weight:700;font-size:1.1rem;letter-spacing:-0.02em}
.nav-links{display:flex;align-items:center;gap:28px}
.nav-link{font-size:0.9rem;font-weight:500;color:var(--tm);transition:color 0.2s}
.nav-link:hover{color:var(--t)}
.nav-toggle{display:none;background:none;border:none;color:var(--t);cursor:pointer;padding:4px}
@media(max-width:768px){
  .nav-toggle{display:block}
  .nav-links{display:none;position:absolute;top:68px;left:0;right:0;background:var(--s);border-bottom:1px solid var(--b);flex-direction:column;padding:20px 24px;gap:16px}
  .nav-links.open{display:flex}
}
</style>
<script>
document.querySelector('.nav-toggle')?.addEventListener('click',function(){document.querySelector('.nav-links')?.classList.toggle('open')});
</script>`;
}

function renderFooter(blueprint: BlueprintResult): string {
  return `
<footer class="footer">
  <div class="container footer-inner">
    <div class="footer-brand">${escapeHTML(blueprint.name)}</div>
    <div class="footer-bottom">&copy; ${new Date().getFullYear()} ${escapeHTML(blueprint.name)}. All rights reserved.</div>
  </div>
</footer>
<style>
.footer{border-top:1px solid var(--b);padding:48px 0 32px;background:var(--sa)}
.footer-inner{display:flex;flex-direction:column;gap:24px;align-items:center;text-align:center}
.footer-brand{font-weight:700;font-size:1.05rem;letter-spacing:-0.02em}
.footer-bottom{font-size:0.82rem;color:var(--tm)}
</style>`;
}

function renderHero(section: { content: Record<string, unknown> }, blueprint: BlueprintResult): string {
  const headline = (section.content?.headline as string) || blueprint.name;
  const subheadline = (section.content?.subheadline as string) || blueprint.description;
  const ctaText = (section.content?.ctaText as string) || "Get Started";
  const ctaSecondary = (section.content?.ctaSecondary as string) || "Learn More";

  return `
<section class="hero">
  <div class="hero-bg"></div>
  <div class="container hero-inner">
    <div class="hero-content animate">
      <span class="hero-badge">${escapeHTML(blueprint.industry)}</span>
      <h1 class="hero-title">${escapeHTML(headline)}</h1>
      <p class="hero-subtitle">${escapeHTML(subheadline)}</p>
      <div class="hero-actions">
        <a href="#features" class="btn btn-primary btn-lg">${escapeHTML(ctaText)} &rarr;</a>
        <a href="#contact" class="btn btn-outline btn-lg">${escapeHTML(ctaSecondary)}</a>
      </div>
    </div>
    <div class="hero-visual animate animate-d3">
      <div class="hero-card-stack">
        <div class="hero-card hero-card-1"></div>
        <div class="hero-card hero-card-2"></div>
        <div class="hero-card hero-card-3"></div>
      </div>
    </div>
  </div>
</section>
<style>
.hero{padding:140px 0 100px;overflow:hidden;position:relative}
.hero-bg{position:absolute;top:-40%;right:-10%;width:700px;height:700px;border-radius:50%;background:radial-gradient(circle,color-mix(in srgb,var(--p) 10%,transparent) 0%,transparent 65%);pointer-events:none}
.hero-inner{display:grid;grid-template-columns:1.1fr 0.9fr;gap:64px;align-items:center}
.hero-badge{display:inline-flex;font-size:0.78rem;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;color:var(--p);background:color-mix(in srgb,var(--p) 10%,transparent);padding:6px 16px;border-radius:100px;margin-bottom:24px}
.hero-title{font-size:3.75rem;font-weight:800;line-height:1.06;letter-spacing:-0.04em;margin-bottom:24px;background:linear-gradient(135deg,var(--t) 60%,var(--tm));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.hero-subtitle{font-size:1.15rem;color:var(--tm);line-height:1.7;max-width:520px;margin-bottom:40px}
.hero-actions{display:flex;gap:16px;flex-wrap:wrap}
.hero-visual{display:flex;justify-content:center;align-items:center;min-height:400px}
.hero-card-stack{position:relative;width:380px;height:400px;perspective:1000px}
.hero-card{position:absolute;border-radius:20px;border:1px solid var(--b);background:var(--s);box-shadow:var(--sh-lg);transition:all 0.4s ease}
.hero-card-1{width:340px;height:340px;top:0;left:0;background:linear-gradient(135deg,color-mix(in srgb,var(--p) 15%,var(--s)),color-mix(in srgb,var(--p-alt) 10%,var(--s)));transform:rotate(-3deg);z-index:1}
.hero-card-2{width:320px;height:320px;top:40px;left:40px;background:linear-gradient(135deg,color-mix(in srgb,var(--p-alt) 15%,var(--s)),color-mix(in srgb,var(--p) 8%,var(--s)));transform:rotate(2deg);z-index:2}
.hero-card-3{width:300px;height:300px;top:80px;left:80px;background:linear-gradient(135deg,color-mix(in srgb,var(--p) 10%,var(--s)),color-mix(in srgb,var(--p-alt) 12%,var(--s)));transform:rotate(-1deg);z-index:3;display:flex;align-items:center;justify-content:center;font-size:3rem}
.hero-card-3::after{content:'\\2728'}
@media(max-width:1024px){.hero-title{font-size:3rem}}
@media(max-width:768px){
  .hero{padding:100px 0 72px}
  .hero-inner{grid-template-columns:1fr;gap:48px}
  .hero-title{font-size:2.3rem}
  .hero-subtitle{font-size:1.05rem}
  .hero-visual{display:none}
}
@media(max-width:480px){.hero-title{font-size:1.9rem}}
</style>`;
}

function renderProblem(section: { content: Record<string, unknown> }, blueprint: BlueprintResult): string {
  const headline = (section.content?.headline as string) || "The Problem";
  const description = (section.content?.description as string) || blueprint.problemStatement;
  const painPoints = (section.content?.painPoints as string[]) || [];

  if (!description && painPoints.length === 0) return "";

  const points = painPoints.length > 0 ? painPoints : [description];

  return `
<section class="section section-alt" id="problem">
  <div class="container">
    <div class="split-section">
      <div class="split-content animate">
        <span class="section-label">The Challenge</span>
        <h2 class="section-title">${escapeHTML(headline)}</h2>
        <ul class="pain-list">
          ${points.map((p, i) => `<li class="pain-item animate animate-d${(i % 4) + 1}"><span class="pain-icon">&#x2716;</span><span>${escapeHTML(p)}</span></li>`).join("")}
        </ul>
      </div>
      <div class="split-visual animate animate-d2">
        <div class="visual-card visual-card-problem"></div>
      </div>
    </div>
  </div>
</section>
<style>
.split-section{display:grid;grid-template-columns:1fr 1fr;gap:80px;align-items:center}
.split-content{max-width:520px}
.pain-list{list-style:none;display:flex;flex-direction:column;gap:16px;margin-top:32px}
.pain-item{display:flex;align-items:flex-start;gap:14px;font-size:1rem;color:var(--tm);line-height:1.6}
.pain-icon{color:#EF4444;font-size:0.85rem;margin-top:4px;flex-shrink:0;width:20px;height:20px;display:flex;align-items:center;justify-content:center;border-radius:50%;background:color-mix(in srgb,#EF4444 12%,transparent)}
.visual-card{width:100%;aspect-ratio:4/3;border-radius:24px;border:1px solid var(--b);background:linear-gradient(135deg,color-mix(in srgb,#EF4444 8%,var(--s)),color-mix(in srgb,var(--p-alt) 8%,var(--s)));box-shadow:var(--sh-lg)}
@media(max-width:768px){.split-section{grid-template-columns:1fr;gap:48px}}
</style>`;
}

function renderSolution(section: { content: Record<string, unknown> }, blueprint: BlueprintResult): string {
  const headline = (section.content?.headline as string) || "The Solution";
  const description = (section.content?.description as string) || blueprint.solution;
  const benefits = (section.content?.benefits as string[]) || [];

  if (!description && benefits.length === 0) return "";

  const items = benefits.length > 0 ? benefits : [description];

  return `
<section class="section" id="solution">
  <div class="container">
    <div class="split-section split-reverse">
      <div class="split-visual animate">
        <div class="visual-card visual-card-solution"></div>
      </div>
      <div class="split-content animate animate-d2">
        <span class="section-label">Our Approach</span>
        <h2 class="section-title">${escapeHTML(headline)}</h2>
        <p class="section-subtitle" style="margin-bottom:0">${escapeHTML(description)}</p>
        <ul class="solution-list">
          ${items.map((b, i) => `<li class="solution-item animate animate-d${(i % 4) + 1}"><span class="solution-icon">&#x2714;</span><span>${escapeHTML(b)}</span></li>`).join("")}
        </ul>
      </div>
    </div>
  </div>
</section>
<style>
.split-reverse .split-content{order:2}
.split-reverse .split-visual{order:1}
.solution-list{list-style:none;display:flex;flex-direction:column;gap:14px;margin-top:28px}
.solution-item{display:flex;align-items:flex-start;gap:14px;font-size:0.95rem;color:var(--t);line-height:1.5}
.solution-icon{color:var(--p);font-size:0.85rem;margin-top:2px;flex-shrink:0;width:20px;height:20px;display:flex;align-items:center;justify-content:center;border-radius:50%;background:color-mix(in srgb,var(--p) 12%,transparent)}
.visual-card-solution{background:linear-gradient(135deg,color-mix(in srgb,var(--p) 10%,var(--s)),color-mix(in srgb,var(--p-alt) 8%,var(--s)))}.split-reverse .split-content{order:2}.split-reverse .split-visual{order:1}
@media(max-width:768px){.split-section{gap:48px}.split-reverse .split-content{order:1}.split-reverse .split-visual{order:2}}
</style>`;
}

function renderFeatures(section: { content: Record<string, unknown> }, blueprint: BlueprintResult): string {
  const rawItems = section.content?.items as unknown[];
  const items = (rawItems || blueprint.keyFeatures.map(f => ({ title: f }))) as Array<Record<string, unknown> | string>;
  const title = (section.content?.title as string) || "Key Features";
  const subtitle = (section.content?.subtitle as string) || "";

  if (!items || items.length === 0) return "";

  const icons = ["\uD83D\uDE80", "\uD83D\uDD12", "\u26A1", "\uD83D\uDCC8", "\uD83D\uDD17", "\uD83C\uDF1F", "\uD83D\uDCA1", "\uD83C\uDF10"];
  const gradientColors = [
    "linear-gradient(135deg,var(--p),var(--p-alt))",
    "linear-gradient(135deg,var(--p-alt),#8B5CF6)",
    "linear-gradient(135deg,#3B82F6,#2563EB)",
    "linear-gradient(135deg,#10B981,#059669)",
    "linear-gradient(135deg,#F59E0B,#D97706)",
    "linear-gradient(135deg,#EC4899,#DB2777)",
  ];

  const cards = items.slice(0, 8).map((f, i) => {
    const itemTitle = typeof f === "string" ? f : String((f as Record<string, unknown>)?.title || (f as Record<string, unknown>)?.description || "");
    const itemDesc = typeof f === "string" ? "" : String((f as Record<string, unknown>)?.description || "");
    return `
<div class="card animate animate-d${(i % 5) + 1}">
  <div class="card-icon" style="background:${gradientColors[i % gradientColors.length]}">${icons[i % icons.length]}</div>
  <h3>${escapeHTML(itemTitle)}</h3>
  ${itemDesc ? `<p>${escapeHTML(itemDesc)}</p>` : ""}
</div>`;
  }).join("\n");

  return `
<section class="section section-alt" id="features">
  <div class="container text-center">
    <span class="section-label">Features</span>
    <h2 class="section-title">${escapeHTML(title)}</h2>
    ${subtitle ? `<p class="section-subtitle mx-auto">${escapeHTML(subtitle)}</p>` : ""}
  </div>
  <div class="container" style="margin-top:48px">
    <div class="grid ${items.length <= 3 ? "grid-3" : items.length === 4 ? "grid-4" : "grid-3"}">
      ${cards}
    </div>
  </div>
</section>`;
}

function renderPricing(section: { content: Record<string, unknown> }, blueprint: BlueprintResult): string {
  const headline = (section.content?.headline as string) || "Simple Pricing";
  const subtitle = (section.content?.subtitle as string) || blueprint.monetization;
  const plans = (section.content?.plans as Array<{ name: string; price: string; period: string; description: string; features: string[]; highlighted?: boolean }> | null);
  const hasPlans = plans && plans.length > 0;

  if (!hasPlans && !blueprint.monetization) return "";

  return `
<section class="section" id="pricing">
  <div class="container text-center">
    <span class="section-label">Pricing</span>
    <h2 class="section-title">${escapeHTML(headline)}</h2>
    ${subtitle ? `<p class="section-subtitle mx-auto">${escapeHTML(subtitle)}</p>` : ""}
  </div>
  <div class="container" style="margin-top:48px">
    ${hasPlans ? `
    <div class="pricing-grid">
      ${plans!.map((plan, i) => `
      <div class="pricing-card${plan.highlighted ? ' pricing-featured' : ''} animate animate-d${(i % 4) + 1}">
        ${plan.highlighted ? '<div class="pricing-badge">Most Popular</div>' : ''}
        <div class="pricing-name">${escapeHTML(plan.name)}</div>
        <div class="pricing-amount"><span class="pricing-price">${escapeHTML(plan.price)}</span>${plan.period ? `<span class="pricing-period">/${escapeHTML(plan.period)}</span>` : ""}</div>
        <p class="pricing-desc">${escapeHTML(plan.description)}</p>
        <ul class="pricing-features">
          ${(plan.features || []).map((f) => `<li class="pricing-feature"><span class="check-icon">&#x2713;</span> ${escapeHTML(f)}</li>`).join("")}
        </ul>
        <a href="#" class="btn ${plan.highlighted ? 'btn-primary' : 'btn-outline'}" style="width:100%;margin-top:auto">Get Started</a>
      </div>`).join("")}
    </div>` : `
    <div class="pricing-simple">
      <p>${escapeHTML(blueprint.monetization || "")}</p>
    </div>`}
  </div>
</section>
<style>
.pricing-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:24px;align-items:start}
.pricing-card{background:var(--s);border:1px solid var(--b);border-radius:calc(var(--r) + 4px);padding:36px 28px;display:flex;flex-direction:column;gap:20px;transition:all 0.3s ease;position:relative}
.pricing-card:hover{box-shadow:var(--sh-lg);transform:translateY(-4px);border-color:transparent}
.pricing-featured{border:2px solid var(--p);box-shadow:0 0 0 1px var(--p)}
.pricing-badge{position:absolute;top:-12px;left:50%;transform:translateX(-50%);background:var(--p);color:#fff;font-size:0.75rem;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;padding:4px 16px;border-radius:100px}
.pricing-name{font-size:1rem;font-weight:600;color:var(--tm);text-transform:uppercase;letter-spacing:0.03em}
.pricing-amount{display:flex;align-items:baseline;gap:4px}
.pricing-price{font-size:2.5rem;font-weight:800;letter-spacing:-0.03em}
.pricing-period{font-size:0.95rem;color:var(--tm)}
.pricing-desc{font-size:0.88rem;color:var(--tm);line-height:1.5}
.pricing-features{list-style:none;display:flex;flex-direction:column;gap:12px;padding:0}
.pricing-feature{font-size:0.9rem;display:flex;align-items:center;gap:10px}
.check-icon{color:var(--p);font-weight:700;flex-shrink:0}
.pricing-simple{padding:48px;text-align:center;border:1px solid var(--b);border-radius:calc(var(--r) + 4px);font-size:1.1rem;color:var(--tm);line-height:1.7;max-width:640px;margin:0 auto}
@media(max-width:768px){.pricing-grid{grid-template-columns:1fr}.pricing-price{font-size:2rem}}
</style>`;
}

function renderFAQ(section: { content: Record<string, unknown> }, _blueprint: BlueprintResult): string {
  const subtitle = (section.content?.subtitle as string) || "";
  const items = (section.content?.items as Array<{ question: string; answer: string }>) || [];

  if (items.length === 0) return "";

  return `
<section class="section section-alt" id="faq">
  <div class="container text-center">
    <span class="section-label">FAQ</span>
    <h2 class="section-title">Frequently Asked Questions</h2>
    ${subtitle ? `<p class="section-subtitle mx-auto">${escapeHTML(subtitle)}</p>` : ""}
  </div>
  <div class="container" style="max-width:720px;margin-top:48px">
    <div class="faq-list">
      ${items.map((item, i) => `
      <div class="faq-item animate animate-d${(i % 4) + 1}">
        <button class="faq-question" onclick="this.nextElementSibling.classList.toggle('faq-open');this.querySelector('.faq-chevron').classList.toggle('faq-chevron-open')">
          <span>${escapeHTML(item.question)}</span>
          <svg class="faq-chevron" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>
        </button>
        <div class="faq-answer">${escapeHTML(item.answer)}</div>
      </div>`).join("")}
    </div>
  </div>
</section>
<style>
.faq-list{display:flex;flex-direction:column;gap:12px}
.faq-item{border:1px solid var(--b);border-radius:calc(var(--r) + 2px);overflow:hidden;background:var(--s)}
.faq-question{width:100%;display:flex;justify-content:space-between;align-items:center;padding:20px 24px;background:none;border:none;cursor:pointer;font-family:var(--f);font-size:1rem;font-weight:600;color:var(--t);text-align:left;gap:16px;transition:background 0.2s}
.faq-question:hover{background:var(--sa2)}
.faq-chevron{flex-shrink:0;transition:transform 0.3s ease;color:var(--tm)}
.faq-chevron-open{transform:rotate(180deg)}
.faq-answer{max-height:0;overflow:hidden;transition:max-height 0.3s ease,padding 0.3s ease;padding:0 24px;font-size:0.92rem;color:var(--tm);line-height:1.7}
.faq-answer.faq-open{max-height:500px;padding:0 24px 20px}
</style>`;
}

function renderSocialProof(section: { content: Record<string, unknown> }, _blueprint: BlueprintResult): string {
  const items = (section.content?.items as string[]) || [];
  const headline = (section.content?.headline as string) || "Trusted by teams";

  if (items.length === 0) return "";

  return `
<section class="section section-alt" id="social-proof">
  <div class="container text-center">
    <p class="social-proof-label">${escapeHTML(headline)}</p>
    <div class="social-proof-logos">
      ${items.slice(0, 6).map((item, i) => `<div class="social-logo animate animate-d${(i % 4) + 1}">${escapeHTML(item)}</div>`).join("")}
    </div>
  </div>
</section>
<style>
.social-proof-label{font-size:0.82rem;font-weight:600;text-transform:uppercase;letter-spacing:0.12em;color:var(--tm);margin-bottom:32px}
.social-proof-logos{display:flex;align-items:center;justify-content:center;gap:48px;flex-wrap:wrap}
.social-logo{font-size:0.9rem;font-weight:600;color:var(--tm);opacity:0.5;padding:8px 16px;border:1px solid var(--b);border-radius:8px}
@media(max-width:768px){.social-proof-logos{gap:24px}}
</style>`;
}

function renderCTA(section: { content: Record<string, unknown> }, blueprint: BlueprintResult): string {
  const headline = (section.content?.headline as string) || `Start building with ${blueprint.name}`;
  const subheadline = (section.content?.subheadline as string) || "";
  const ctaText = (section.content?.ctaText as string) || "Get Started";

  return `
<section class="section" id="contact">
  <div class="container">
    <div class="cta-card animate">
      <div class="cta-glow"></div>
      <h2 class="cta-title">${escapeHTML(headline)}</h2>
      ${subheadline ? `<p class="cta-subtitle">${escapeHTML(subheadline)}</p>` : ""}
      <div class="cta-actions">
        <a href="#" class="btn btn-lg" style="background:#fff;color:var(--p)">${escapeHTML(ctaText)} &rarr;</a>
      </div>
    </div>
  </div>
</section>
<style>
.cta-section{padding:64px 0}
.cta-card{background:linear-gradient(135deg,var(--p),var(--p-alt));border-radius:24px;padding:80px 48px;text-align:center;color:#fff;position:relative;overflow:hidden}
.cta-glow{position:absolute;top:-50%;left:-20%;width:400px;height:400px;border-radius:50%;background:radial-gradient(circle,rgba(255,255,255,0.12) 0%,transparent 70%);pointer-events:none}
.cta-title{font-size:2.5rem;font-weight:800;letter-spacing:-0.03em;margin-bottom:16px;position:relative}
.cta-subtitle{font-size:1.1rem;opacity:0.9;max-width:500px;margin:0 auto 36px;line-height:1.6;position:relative}
.cta-actions{position:relative}
.cta .btn:hover{transform:translateY(-3px);box-shadow:0 12px 40px rgba(0,0,0,0.15)}
@media(max-width:768px){
  .cta-card{padding:48px 24px}
  .cta-title{font-size:1.8rem}
  .cta-subtitle{font-size:1rem}
}
</style>`;
}

function sectionHasContent(section: { content: Record<string, unknown> }): boolean {
  return section.content && Object.keys(section.content).length > 0;
}

const sectionRenderers: Record<string, (section: { content: Record<string, unknown> }, blueprint: BlueprintResult) => string | null> = {
  hero: (s, b) => sectionHasContent(s) ? renderHero(s, b) : null,
  problem: (s, b) => renderProblem(s, b) || null,
  pain: (s, b) => renderProblem(s, b) || null,
  solution: (s, b) => renderSolution(s, b) || null,
  benefits: (s, b) => renderSolution(s, b) || null,
  features: (s, b) => renderFeatures(s, b) || null,
  pricing: (s, b) => renderPricing(s, b) || null,
  faq: (s, b) => renderFAQ(s, b) || null,
  'social-proof': (s, b) => renderSocialProof(s, b) || null,
  testimonials: (s, b) => renderSocialProof(s, b) || null,
  cta: (s, b) => sectionHasContent(s) ? renderCTA(s, b) : null,
};

function renderPageHTML(
  blueprint: BlueprintResult,
  theme: ThemeSpec,
  page: PageSpec,
  allPages: PageSpec[],
): string {
  const sortedSections = [...page.sections].sort((a, b) => a.order - b.order);
  const t = buildTokens(theme);
  const sections = sortedSections
    .map((s) => {
      const renderer = sectionRenderers[s.type];
      if (!renderer) return "";
      try {
        return renderer(s, blueprint) || "";
      } catch {
        return "";
      }
    })
    .filter(Boolean)
    .join("\n");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHTML(page.name)} - ${escapeHTML(blueprint.name)}</title>
  <meta name="description" content="${escapeHTML(blueprint.description.substring(0, 160))}">
  <meta property="og:title" content="${escapeHTML(blueprint.name)}">
  <meta property="og:description" content="${escapeHTML(blueprint.description.substring(0, 160))}">
  <meta property="og:type" content="website">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>${designSystemCSS(t)}</style>
</head>
<body>
  ${renderNav(blueprint, allPages)}
  <main>${sections}</main>
  ${renderFooter(blueprint)}
</body>
</html>`;
}

export function renderHomeFallback(
  blueprint: BlueprintResult,
  theme: ThemeSpec,
  page: PageSpec,
  spec?: WebsiteSpecResult,
): PageHTMLResult {
  const allPages = spec?.pages || [page];
  const html = renderPageHTML(blueprint, theme, page, allPages);
  return { slug: page.slug, title: page.name, html };
}

export function renderGenericFallback(
  blueprint: BlueprintResult,
  theme: ThemeSpec,
  page: PageSpec,
  spec?: WebsiteSpecResult,
): PageHTMLResult {
  const allPages = spec?.pages || [page];
  const html = renderPageHTML(blueprint, theme, page, allPages);
  return { slug: page.slug, title: page.name, html };
}

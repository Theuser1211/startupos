/**
 * Website Generator for StartupOS — v2
 *
 * Generates production-grade HTML/CSS landing pages with industry-aware
 * design systems, multiple layout variants, and adaptive copywriting.
 *
 * Design Systems:
 *   minimal    — Clean, elegant, lots of whitespace
 *   bold       — Large typography, strong gradients, high energy
 *   professional — Trustworthy, structured, corporate-friendly
 *   playful    — Rounded elements, fun colors, approachable
 *   tech       — Dark theme, code-like elements, developer-friendly
 *
 * Each system adapts section ordering, CTA style, and color treatment
 * based on the startup's industry.
 */

/* ─── Types ─── */

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
  designStyle?: "minimal" | "bold" | "professional" | "playful" | "tech";
}

type DesignVariant = "minimal" | "bold" | "professional" | "playful" | "tech";

/* ─── Industry → Design Variant Mapping ─── */

const industryDesignMap: Record<string, DesignVariant> = {
  ai: "tech",
  devtools: "tech",
  fintech: "professional",
  healthtech: "professional",
  saas: "minimal",
  ecommerce: "playful",
  creator: "playful",
  gaming: "bold",
  climate: "minimal",
  edtech: "professional",
  marketplace: "minimal",
  hardware: "bold",
  services: "professional",
};

const defaultDesign: DesignVariant = "minimal";

/* ─── Design Systems ─── */

interface DesignSystem {
  name: DesignVariant;
  bg: string;
  bgCard: string;
  bgElevated: string;
  text: string;
  textSecondary: string;
  border: string;
  radius: string;
  radiusLg: string;
  font: string;
  headingFont: string;
  heroScale: "large" | "balanced" | "compact";
  buttonStyle: "solid" | "outline" | "glass";
  sectionSpacing: string;
  cardGlow: boolean;
}

const designSystems: Record<DesignVariant, DesignSystem> = {
  minimal: {
    name: "minimal",
    bg: "#0a0a0f",
    bgCard: "#121219",
    bgElevated: "#1a1a24",
    text: "#f1f1f5",
    textSecondary: "#a1a1b5",
    border: "rgba(255,255,255,0.08)",
    radius: "12px",
    radiusLg: "20px",
    font: "system-ui, -apple-system, sans-serif",
    headingFont: "system-ui, -apple-system, sans-serif",
    heroScale: "balanced",
    buttonStyle: "solid",
    sectionSpacing: "100px",
    cardGlow: false,
  },
  bold: {
    name: "bold",
    bg: "#050508",
    bgCard: "#0c0c14",
    bgElevated: "#14141f",
    text: "#ffffff",
    textSecondary: "#8888aa",
    border: "rgba(255,255,255,0.12)",
    radius: "8px",
    radiusLg: "16px",
    font: "system-ui, -apple-system, sans-serif",
    headingFont: "system-ui, -apple-system, sans-serif",
    heroScale: "large",
    buttonStyle: "solid",
    sectionSpacing: "120px",
    cardGlow: true,
  },
  professional: {
    name: "professional",
    bg: "#08080f",
    bgCard: "#101018",
    bgElevated: "#181825",
    text: "#e8e8f0",
    textSecondary: "#9494a8",
    border: "rgba(255,255,255,0.06)",
    radius: "8px",
    radiusLg: "12px",
    font: "system-ui, -apple-system, sans-serif",
    headingFont: "system-ui, -apple-system, sans-serif",
    heroScale: "balanced",
    buttonStyle: "solid",
    sectionSpacing: "90px",
    cardGlow: false,
  },
  playful: {
    name: "playful",
    bg: "#0a0a14",
    bgCard: "#12121e",
    bgElevated: "#1a1a28",
    text: "#f0f0ff",
    textSecondary: "#9999bb",
    border: "rgba(255,255,255,0.1)",
    radius: "20px",
    radiusLg: "28px",
    font: "system-ui, -apple-system, sans-serif",
    headingFont: "system-ui, -apple-system, sans-serif",
    heroScale: "balanced",
    buttonStyle: "glass",
    sectionSpacing: "100px",
    cardGlow: false,
  },
  tech: {
    name: "tech",
    bg: "#0a0a0f",
    bgCard: "#0f0f17",
    bgElevated: "#16161f",
    text: "#e0e0f0",
    textSecondary: "#8080a0",
    border: "rgba(255,255,255,0.06)",
    radius: "6px",
    radiusLg: "12px",
    font: "system-ui, -apple-system, sans-serif",
    headingFont: "system-ui, -apple-system, sans-serif",
    heroScale: "large",
    buttonStyle: "outline",
    sectionSpacing: "110px",
    cardGlow: true,
  },
};

/* ─── Industry Copy Modules ─── */

interface IndustryCopy {
  heroSubtitle: string;
  ctaPrimary: string;
  ctaSecondary: string;
  problemLabel: string;
  problemHeading: string;
  solutionLabel: string;
  solutionHeading: string;
  ctaHeading: string;
  ctaSubtext: string;
  sectionLabels: {
    values: string;
    painPoints: string;
    testimonials?: string;
  };
}

const industryCopy: Record<string, IndustryCopy> = {
  saas: {
    heroSubtitle: "Empower your team with tools that scale as you grow.",
    ctaPrimary: "Start Free Trial →",
    ctaSecondary: "Book a Demo",
    problemLabel: "The Challenge",
    problemHeading: "Your tools aren't keeping up",
    solutionLabel: "How We Help",
    solutionHeading: "Built for modern teams",
    ctaHeading: "Ready to level up?",
    ctaSubtext: "Start free, upgrade when you need to. No credit card required.",
    sectionLabels: { values: "Our Values", painPoints: "Common Challenges" },
  },
  fintech: {
    heroSubtitle: "Trusted financial infrastructure for the next generation.",
    ctaPrimary: "Get Started →",
    ctaSecondary: "Talk to Compliance",
    problemLabel: "The Problem",
    problemHeading: "Legacy systems are holding you back",
    solutionLabel: "Our Platform",
    solutionHeading: "Modern, secure, compliant",
    ctaHeading: "Ready to modernize?",
    ctaSubtext: "Schedule a private demo with our compliance team.",
    sectionLabels: { values: "Our Principles", painPoints: "Key Risks We Solve" },
  },
  healthtech: {
    heroSubtitle: "Better outcomes through connected care.",
    ctaPrimary: "Request Demo →",
    ctaSecondary: "See Integrations",
    problemLabel: "The Gap",
    problemHeading: "Healthcare data shouldn't be siloed",
    solutionLabel: "Our Approach",
    solutionHeading: "Interoperable by design",
    ctaHeading: "Transform your care delivery?",
    ctaSubtext: "Join leading healthcare organizations already using our platform.",
    sectionLabels: { values: "Our Standards", painPoints: "Clinical Pain Points" },
  },
  ecommerce: {
    heroSubtitle: "Sell smarter. Ship faster. Grow bigger.",
    ctaPrimary: "Start Selling →",
    ctaSecondary: "See Features",
    problemLabel: "The Struggle",
    problemHeading: "Every store looks the same",
    solutionLabel: "The Difference",
    solutionHeading: "Your brand, your way",
    ctaHeading: "Ready to stand out?",
    ctaSubtext: "Join thousands of merchants who love their storefront.",
    sectionLabels: { values: "What We Stand For", painPoints: "Merchant Pain Points" },
  },
  ai: {
    heroSubtitle: "Ship production AI in days, not months.",
    ctaPrimary: "Start Building →",
    ctaSecondary: "View API Docs",
    problemLabel: "The Bottleneck",
    problemHeading: "AI infrastructure is too complex",
    solutionLabel: "The Platform",
    solutionHeading: "From prototype to production",
    ctaHeading: "Build something intelligent?",
    ctaSubtext: "Start with $300 in free credits. No PhD required.",
    sectionLabels: { values: "Our Philosophy", painPoints: "Engineering Challenges" },
  },
  devtools: {
    heroSubtitle: "Ship faster with tools developers love.",
    ctaPrimary: "Get Started →",
    ctaSecondary: "Read Docs",
    problemLabel: "The Friction",
    problemHeading: "Toolchain fatigue is real",
    solutionLabel: "The Solution",
    solutionHeading: "One tool, infinite possibilities",
    ctaHeading: "Developer experience matters?",
    ctaSubtext: "Free for teams up to 5. Start shipping in minutes.",
    sectionLabels: { values: "Our Principles", painPoints: "Developer Pain Points" },
  },
  climate: {
    heroSubtitle: "Technology that makes sustainability measurable.",
    ctaPrimary: "Get Started →",
    ctaSecondary: "View Impact",
    problemLabel: "The Urgency",
    problemHeading: "Climate action needs better data",
    solutionLabel: "Our Mission",
    solutionHeading: "Measure, manage, monetize",
    ctaHeading: "Ready to make an impact?",
    ctaSubtext: "Start tracking your carbon footprint today. Free for small businesses.",
    sectionLabels: { values: "Our Commitments", painPoints: "Sustainability Challenges" },
  },
  edtech: {
    heroSubtitle: "Education that adapts to every learner.",
    ctaPrimary: "Start Teaching →",
    ctaSecondary: "How It Works",
    problemLabel: "The Issue",
    problemHeading: "One-size education fits no one",
    solutionLabel: "Our Method",
    solutionHeading: "Personalized learning at scale",
    ctaHeading: "Transform your classroom?",
    ctaSubtext: "Free for individual educators. Premium plans for institutions.",
    sectionLabels: { values: "Our Approach", painPoints: "Educational Challenges" },
  },
  gaming: {
    heroSubtitle: "Build worlds. Create communities. Ship games.",
    ctaPrimary: "Start Creating →",
    ctaSecondary: "See Gallery",
    problemLabel: "The Problem",
    problemHeading: "Game dev is gatekept",
    solutionLabel: "Our Platform",
    solutionHeading: "Built for creators, not corporations",
    ctaHeading: "Ready to build your game?",
    ctaSubtext: "Join thousands of indie developers using our platform.",
    sectionLabels: { values: "Our Mantra", painPoints: "Developer Frustrations" },
  },
  creator: {
    heroSubtitle: "Your content. Your audience. Your business.",
    ctaPrimary: "Start Creating →",
    ctaSecondary: "See Templates",
    problemLabel: "The Chaos",
    problemHeading: "Too many platforms, not enough time",
    solutionLabel: "The Hub",
    solutionHeading: "One dashboard for your entire creator business",
    ctaHeading: "Ready to own your workflow?",
    ctaSubtext: "Free for solo creators. Upgrade as you grow.",
    sectionLabels: { values: "Our Beliefs", painPoints: "Creator Frustrations" },
  },
  marketplace: {
    heroSubtitle: "Connect supply with demand. Seamlessly.",
    ctaPrimary: "Join as Seller →",
    ctaSecondary: "Join as Buyer",
    problemLabel: "The Cold Start",
    problemHeading: "Both sides need each other",
    solutionLabel: "Our Solution",
    solutionHeading: "Liquidity from day one",
    ctaHeading: "Ready to join the network?",
    ctaSubtext: "Whether you're supply or demand, we've got you covered.",
    sectionLabels: { values: "Our Values", painPoints: "Marketplace Challenges" },
  },
  hardware: {
    heroSubtitle: "From prototype to production. Faster.",
    ctaPrimary: "Start Building →",
    ctaSecondary: "See Supply Chain",
    problemLabel: "The Hurdle",
    problemHeading: "Hardware is still too slow",
    solutionLabel: "Our Solution",
    solutionHeading: "Iterate at software speed",
    ctaHeading: "Ready to build something real?",
    ctaSubtext: "Start with a free prototype assessment.",
    sectionLabels: { values: "Our Standards", painPoints: "Engineering Hurdles" },
  },
  services: {
    heroSubtitle: "Professional services, reimagined for modern firms.",
    ctaPrimary: "Book a Demo →",
    ctaSecondary: "See Case Studies",
    problemLabel: "The Inefficiency",
    problemHeading: "Admin is eating your billable hours",
    solutionLabel: "Our Platform",
    solutionHeading: "Run your firm like a business",
    ctaHeading: "Ready to work smarter?",
    ctaSubtext: "White-glove onboarding included with every plan.",
    sectionLabels: { values: "Our Standards", painPoints: "Practice Challenges" },
  },
};

const defaultCopy: IndustryCopy = {
  heroSubtitle: "Built for teams that want to move faster.",
  ctaPrimary: "Get Started →",
  ctaSecondary: "Learn More",
  problemLabel: "The Problem",
  problemHeading: "Current solutions fall short",
  solutionLabel: "Our Solution",
  solutionHeading: "Built differently",
  ctaHeading: "Ready to get started?",
  ctaSubtext: "Start free, upgrade when you need to.",
  sectionLabels: { values: "Our Values", painPoints: "Common Challenges" },
};

/* ─── Hero Section Generators ─── */

function generateHeroSection(
  name: string,
  tagline: string,
  copy: IndustryCopy,
  primary: string,
  secondary: string,
  ds: DesignSystem,
): string {
  const _gradient = `linear-gradient(135deg, ${primary}, ${secondary})`;

  if (ds.heroScale === "large") {
    return `
<section class="hero hero-large">
  <div class="container hero-content">
    <div class="hero-badge">Now Available</div>
    <h1>
      ${name}
      <span>${tagline}</span>
    </h1>
    <p class="hero-sub">${copy.heroSubtitle}</p>
    <div class="hero-actions">
      <a href="#cta" class="btn btn-primary">${copy.ctaPrimary}</a>
      <a href="#solution" class="btn btn-${ds.buttonStyle === "outline" ? "outline" : "secondary"}">${copy.ctaSecondary}</a>
    </div>
    <div class="hero-metrics">
      <div class="metric"><span class="metric-value">99.9%</span><span class="metric-label">Uptime</span></div>
      <div class="metric"><span class="metric-value">10x</span><span class="metric-label">Faster</span></div>
      <div class="metric"><span class="metric-value">50K+</span><span class="metric-label">Users</span></div>
    </div>
  </div>
</section>`;
  }

  return `
<section class="hero">
  <div class="container hero-content">
    <h1>
      ${name}<br />
      <span>${tagline}</span>
    </h1>
    <p>${copy.heroSubtitle}</p>
    <div class="hero-actions">
      <a href="#cta" class="btn btn-primary">${copy.ctaPrimary}</a>
      <a href="#solution" class="btn btn-${ds.buttonStyle === "outline" ? "outline" : "secondary"}">${copy.ctaSecondary}</a>
    </div>
  </div>
</section>`;
}

function generateProblemSection(problem: string, copy: IndustryCopy, ds: DesignSystem): string {
  return `
<section id="problem">
  <div class="container">
    <div class="split-grid">
      <div class="split-content">
        <span class="section-label">${copy.problemLabel}</span>
        <h2>${copy.problemHeading}</h2>
        <p class="split-text">${problem}</p>
      </div>
      <div class="split-visual" aria-hidden="true">
        <div class="visual-card">
          <div class="visual-icon">⚡</div>
          <div class="visual-bar" style="width: 85%; background: linear-gradient(90deg, ${ds.border}, ${ds.textSecondary});"></div>
          <div class="visual-bar" style="width: 60%; background: linear-gradient(90deg, ${ds.border}, ${ds.textSecondary});"></div>
          <div class="visual-bar" style="width: 40%; background: linear-gradient(90deg, ${ds.border}, ${ds.textSecondary});"></div>
        </div>
      </div>
    </div>
  </div>
</section>`;
}

function generateSolutionSection(solution: string, copy: IndustryCopy, _ds: DesignSystem): string {
  return `
<section id="solution" class="section-alt">
  <div class="container">
    <div class="split-grid split-reverse">
      <div class="split-visual" aria-hidden="true">
        <div class="visual-card visual-card-success">
          <div class="visual-icon">✦</div>
          <div class="visual-bar" style="width: 95%; background: linear-gradient(90deg, var(--primary), var(--secondary));"></div>
          <div class="visual-bar" style="width: 88%; background: linear-gradient(90deg, var(--primary), var(--secondary));"></div>
          <div class="visual-bar" style="width: 76%; background: linear-gradient(90deg, var(--primary), var(--secondary));"></div>
        </div>
      </div>
      <div class="split-content">
        <span class="section-label">${copy.solutionLabel}</span>
        <h2>${copy.solutionHeading}</h2>
        <p class="split-text">${solution}</p>
      </div>
    </div>
  </div>
</section>`;
}

function generateValuesSection(values: string[], _ds: DesignSystem): string {
  const emojis = ["🎯", "⚡", "🔒", "🌍", "💡", "🤝", "🚀", "🎨"];
  const valueCards = values.map((v, i) => `
    <div class="card card-hover">
      <div class="card-icon" aria-hidden="true">${emojis[i % emojis.length]}</div>
      <h3>${v}</h3>
      <p>We believe ${v.toLowerCase()} is essential to building products that matter.</p>
    </div>
  `).join("");

  return `
<section id="values">
  <div class="container">
    <div class="section-center">
      <span class="section-label">Our Values</span>
      <h2>What drives us</h2>
    </div>
    <div class="cards-grid cards-${Math.min(values.length, 4)}">
      ${valueCards}
    </div>
  </div>
</section>`;
}

function generatePainPointsSection(painPoints: string[], copy: IndustryCopy): string {
  const items = painPoints.map((p) => `
    <div class="pain-item">
      <div class="pain-dot"></div>
      <p>${p}</p>
    </div>
  `).join("");

  return `
<section id="pain-points" class="section-alt">
  <div class="container">
    <div class="section-center">
      <span class="section-label">${copy.sectionLabels.painPoints}</span>
      <h2>You're not alone</h2>
    </div>
    <div class="pain-list-center">
      <div class="pain-list">
        ${items}
      </div>
    </div>
  </div>
</section>`;
}

function generateCTASection(copy: IndustryCopy, ds: DesignSystem): string {
  const btnClass = ds.buttonStyle === "glass" ? "btn-glass" : "btn-primary";
  return `
<section id="cta" class="cta-section">
  <div class="container">
    <h2>${copy.ctaHeading}</h2>
    <p>${copy.ctaSubtext}</p>
    <div class="hero-actions">
      <a href="#" class="btn ${btnClass}">${copy.ctaPrimary}</a>
      <a href="#" class="btn btn-secondary">${copy.ctaSecondary}</a>
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
      <a href="#values">Values</a>
      <a href="#cta">Get Started</a>
    </div>
    <p>&copy; ${new Date().getFullYear()} ${name}. All rights reserved.</p>
  </div>
</footer>`;
}

function generateStructuredData(name: string, tagline: string, industry: string): Record<string, unknown> {
  const categoryMap: Record<string, string> = {
    ai: "AIApplication",
    devtools: "DeveloperApplication",
    fintech: "FinanceApplication",
    healthtech: "MedicalApplication",
    gaming: "GameApplication",
    ecommerce: "EcommerceApplication",
  };
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name,
    description: tagline,
    applicationCategory: categoryMap[industry] || "BusinessApplication",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  };
}

/* ─── CSS Generators ─── */

function generateBaseStyles(primary: string, secondary: string, ds: DesignSystem): string {
  const glowStyles = ds.cardGlow ? `
.card-hover:hover {
  box-shadow: 0 0 30px ${primary}15, 0 8px 40px ${primary}10;
}
` : `
.card-hover:hover {
  box-shadow: 0 8px 40px rgba(0,0,0,0.3);
}`;

  const glassButton = ds.buttonStyle === "glass" ? `
.btn-glass {
  background: rgba(255,255,255,0.06);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255,255,255,0.12);
  color: white;
}
.btn-glass:hover {
  background: rgba(255,255,255,0.12);
  border-color: rgba(255,255,255,0.2);
}` : "";

  return `
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --primary: ${primary};
  --secondary: ${secondary};
  --bg: ${ds.bg};
  --bg-card: ${ds.bgCard};
  --bg-elevated: ${ds.bgElevated};
  --text: ${ds.text};
  --text-secondary: ${ds.textSecondary};
  --border: ${ds.border};
  --radius: ${ds.radius};
  --radius-lg: ${ds.radiusLg};
  --font: ${ds.font};
}

html { scroll-behavior: smooth; }

body {
  font-family: var(--font);
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

/* ─── Navigation ─── */
.nav {
  position: fixed;
  top: 0; left: 0; right: 0;
  z-index: 100;
  background: ${ds.bg}d9;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
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
  font-size: 22px;
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

/* ─── Sections ─── */
section { padding: ${ds.sectionSpacing} 0; }
.section-alt { background: var(--bg-card); }
.section-center { text-align: center; margin-bottom: 48px; }
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

/* ─── Hero ─── */
.hero {
  min-height: 85vh;
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
  top: -50%; left: -50%;
  width: 200%; height: 200%;
  background: radial-gradient(ellipse at center, ${primary}08 0%, transparent 60%);
  pointer-events: none;
}
.hero-content { position: relative; width: 100%; }
.hero h1 {
  font-size: clamp(40px, 7vw, 72px);
  font-weight: 800;
  line-height: 1.1;
  letter-spacing: -0.03em;
  margin-bottom: 20px;
}
.hero h1 span {
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.hero p, .hero-sub {
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

/* ─── Hero Large Variant ─── */
.hero-large h1 { font-size: clamp(48px, 8vw, 88px); }
.hero-badge {
  display: inline-block;
  padding: 6px 16px;
  border-radius: 100px;
  background: ${primary}20;
  border: 1px solid ${primary}30;
  color: var(--primary);
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.5px;
  margin-bottom: 24px;
}
.hero-metrics {
  display: flex;
  gap: 40px;
  justify-content: center;
  margin-top: 48px;
}
.metric { text-align: center; }
.metric-value {
  display: block;
  font-size: 28px;
  font-weight: 800;
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.metric-label {
  font-size: 12px;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 1px;
}

/* ─── Buttons ─── */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 14px 32px;
  border-radius: ${ds.radius};
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
}
.btn-outline {
  border: 2px solid ${primary}60;
  color: var(--text);
  background: transparent;
}
.btn-outline:hover {
  background: ${primary}10;
  border-color: var(--primary);
}
${glassButton}

/* ─── Split Grid ─── */
.split-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
  align-items: center;
}
.split-reverse { direction: rtl; }
.split-reverse > * { direction: ltr; }
.split-content { max-width: 500px; }
.split-text {
  color: var(--text-secondary);
  font-size: 16px;
  line-height: 1.8;
}
.split-visual {
  aspect-ratio: 4/3;
  border-radius: var(--radius-lg);
  background: linear-gradient(135deg, ${primary}10, ${secondary}08);
  border: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px;
}
.visual-card {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.visual-card-success { background: transparent; }
.visual-icon { font-size: 32px; margin-bottom: 8px; }
.visual-bar {
  height: 12px;
  border-radius: 6px;
  transition: width 0.5s;
}

/* ─── Cards ─── */
.cards-grid {
  display: grid;
  gap: 20px;
}
.cards-2 { grid-template-columns: repeat(2, 1fr); }
.cards-3 { grid-template-columns: repeat(3, 1fr); }
.cards-4 { grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); }
.cards-1 { grid-template-columns: 1fr; }

.card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 32px;
  transition: transform 0.3s, border-color 0.3s, box-shadow 0.3s;
}
.card-hover:hover { transform: translateY(-4px); border-color: ${primary}40; }
.card-icon { font-size: 28px; margin-bottom: 16px; }
.card h3 { font-size: 18px; font-weight: 700; margin-bottom: 8px; }
.card p { color: var(--text-secondary); font-size: 14px; line-height: 1.7; }
${glowStyles}
/* ─── Pain Points ─── */
.pain-list-center { display: flex; justify-content: center; }
.pain-list {
  display: grid;
  gap: 12px;
  max-width: 600px;
  width: 100%;
}
.pain-item {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 16px 20px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
}
.pain-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--primary);
  flex-shrink: 0;
  margin-top: 6px;
}
.pain-item p { font-size: 14px; color: var(--text-secondary); line-height: 1.6; }

/* ─── CTA ─── */
.cta-section {
  text-align: center;
  background: linear-gradient(135deg, ${primary}10, ${secondary}05);
  border-top: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
}
.cta-section h2 { max-width: 600px; margin: 0 auto 16px; }
.cta-section p { color: var(--text-secondary); font-size: 18px; max-width: 500px; margin: 0 auto 32px; }

/* ─── Footer ─── */
.footer {
  padding: 48px 0;
  border-top: 1px solid var(--border);
  text-align: center;
}
.footer p { color: var(--text-secondary); font-size: 13px; }
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

/* ─── Responsive ─── */
@media (max-width: 768px) {
  .split-grid { grid-template-columns: 1fr; gap: 32px; }
  .split-reverse { direction: ltr; }
  .split-content { max-width: 100%; text-align: center; }
  .hero-metrics { gap: 24px; flex-wrap: wrap; }
  .nav-links a:not(.nav-cta) { display: none; }
  .cards-2, .cards-3 { grid-template-columns: 1fr; }
}

@media (max-width: 480px) {
  section { padding: 60px 0; }
  .hero { min-height: 70vh; }
  .hero-actions { flex-direction: column; }
  .btn { width: 100%; justify-content: center; }
}

/* ─── Animations ─── */
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
.hero-content { animation: fadeInUp 0.8s ease-out; }
.card { animation: fadeInUp 0.6s ease-out both; }
.card:nth-child(1) { animation-delay: 0.1s; }
.card:nth-child(2) { animation-delay: 0.2s; }
.card:nth-child(3) { animation-delay: 0.3s; }
.card:nth-child(4) { animation-delay: 0.4s; }
`;
}

/* ─── Main Export ─── */

export function generateLandingPage(config: WebsiteConfig): string {
  const { startupName, tagline, problem, solution, brand, icp, industry } = config;

  const primaryColor = brand.colors[0]?.hex || "#7C3AED";
  const secondaryColor = brand.colors[1]?.hex || "#6366F1";

  const variant = config.designStyle || industryDesignMap[industry] || defaultDesign;
  const ds = designSystems[variant];
  const copy = industryCopy[industry] || defaultCopy;

  const styles = generateBaseStyles(primaryColor, secondaryColor, ds);
  const heroHtml = generateHeroSection(startupName, tagline, copy, primaryColor, secondaryColor, ds);
  const problemHtml = generateProblemSection(problem, copy, ds);
  const solutionHtml = generateSolutionSection(solution, copy, ds);
  const valuesHtml = generateValuesSection(brand.values, ds);
  const painPointsHtml = generatePainPointsSection(icp.painPoints, copy);
  const ctaHtml = generateCTASection(copy, ds);
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

  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${startupName} — ${tagline}" />

  <script type="application/ld+json">${JSON.stringify(structuredData, null, 2)}</script>
  <style>${styles}</style>
</head>
<body>
  <a href="#main" class="skip-link">Skip to main content</a>

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
        <a href="#cta" class="nav-cta">${copy.ctaPrimary}</a>
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

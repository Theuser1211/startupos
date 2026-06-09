/**
 * Logo Generator for StartupOS — v3
 *
 * Favicon-first SVG logo engine inspired by Linear, Stripe, Vercel, Notion, and Framer.
 *
 * Key principles:
 * - Every logo must be recognizable at 16×16, 32×32, and 64×64
 * - Each direction produces 3 SVGs: icon, full (icon + wordmark), monochrome
 * - No generic AI shapes (random polygons, sparkles, etc.)
 * - One simple geometric idea per mark, with clear brand reasoning
 * - Quality scored against real-world SaaS standards
 */

/* ─── Types ─── */

export interface LogoScore {
  overall: number;           // 0-100 composite
  simplicity: number;        // Is it visually clean?
  memorability: number;      // Would you remember it?
  faviconReadiness: number;  // Works at 16px?
  scalability: number;       // Works at all sizes?
  uniqueness: number;        // Doesn't look like clip art?
}

interface BrandColors {
  primary: string;
  secondary: string;
  dark: string;
  light: string;
}

export interface BrandAnalysis {
  suggestedStyle: "letter" | "glyph" | "wordmark" | "badge" | "frame";
  iconConcepts: string[];
  faviconStrategy: "initial" | "symbol" | "monogram";
  colorPsychology: string;
}

export interface LogoVariantSVGs {
  icon: string;        // 200×200 — favicon-friendly mark
  full: string;        // 400×200 — icon + wordmark
  monochrome: string;  // 200×200 — single-color version of icon
}

export interface LogoVariant {
  id: string;
  style: string;
  brandConcept: string;
  symbolReasoning: string;
  qualityScore: LogoScore;
  colors: string[];
  category: "icon" | "wordmark" | "combination";
  svg: LogoVariantSVGs;
}

export interface SerializedLogo {
  id: string;
  style: string;
  brandConcept: string;
  symbolReasoning: string;
  qualityScore: LogoScore;
  preview: string;       // data URL for the icon SVG
  fullPreview: string;   // data URL for the full logo
  monochromePreview: string;
  colors: string[];
}

/* ─── Color Helpers ─── */

function getBrandColors(brandColors: { name: string; hex: string }[]): BrandColors {
  const colors = brandColors.map((c) => c.hex);
  return {
    primary: colors[0] || "#7C3AED",
    secondary: colors[1] || "#6366F1",
    dark: colors[3] || "#0A0A0F",
    light: colors[4] || "#A1A1B5",
  };
}

/* ─── Design System Generators ───
 *
 * Each generator creates a distinct visual direction.
 * Every mark follows the same rule: one simple geometric idea, no clutter.
 */

/**
 * Direction 1: Letter Mark (Linear-inspired)
 * A single bold letter in a subtly rounded container.
 * Clean, confident, scalable to any size.
 */
function generateLetterMark(name: string, colors: BrandColors): LogoVariantSVGs {
  const letter = name.charAt(0).toUpperCase();
  const bg = colors.dark;
  const fg = colors.primary;
  const containerRounded = 32; // Subtle rounding — like Linear

  const icon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <rect width="200" height="200" rx="${containerRounded}" fill="${bg}"/>
  <text x="100" y="126" text-anchor="middle" font-family="Inter,-apple-system,system-ui,sans-serif" font-size="84" font-weight="700" fill="${fg}" letter-spacing="-2">${letter}</text>
</svg>`;

  const full = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 200" width="400" height="200">
  <rect width="64" height="64" x="28" y="68" rx="14" fill="${bg}"/>
  <text x="60" y="112" text-anchor="middle" font-family="Inter,-apple-system,system-ui,sans-serif" font-size="36" font-weight="700" fill="${fg}">${letter}</text>
  <text x="116" y="118" text-anchor="start" font-family="Inter,-apple-system,system-ui,sans-serif" font-size="40" font-weight="700" fill="white" letter-spacing="-1">${name}</text>
</svg>`;

  const monochrome = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <rect width="200" height="200" rx="${containerRounded}" fill="#111"/>
  <text x="100" y="126" text-anchor="middle" font-family="Inter,-apple-system,system-ui,sans-serif" font-size="84" font-weight="700" fill="white" letter-spacing="-2">${letter}</text>
</svg>`;

  return { icon, full, monochrome };
}

/**
 * Direction 2: Geometric Glyph (Vercel-inspired)
 * A simple geometric shape — triangle, chevron, or nested form.
 * Abstract enough to be ownable, simple enough to scale.
 */
function generateGeometricGlyph(name: string, colors: BrandColors): LogoVariantSVGs {
  const fg = colors.primary;
  const bg = colors.dark;

  // Create an abstract glyph — a chevron-like shape with clean geometry
  const icon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <rect width="200" height="200" rx="32" fill="${bg}"/>
  <path d="M60 70 L140 100 L60 130" fill="none" stroke="${fg}" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="50" cy="130" r="8" fill="${fg}"/>
</svg>`;

  const full = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 200" width="400" height="200">
  <rect x="20" y="60" width="80" height="80" rx="16" fill="${bg}"/>
  <path d="M35 90 L75 100 L35 110" fill="none" stroke="${fg}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="30" cy="110" r="4" fill="${fg}"/>
  <text x="124" y="118" text-anchor="start" font-family="Inter,-apple-system,system-ui,sans-serif" font-size="40" font-weight="700" fill="white" letter-spacing="-1">${name}</text>
</svg>`;

  const monochrome = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <rect width="200" height="200" rx="32" fill="#111"/>
  <path d="M60 70 L140 100 L60 130" fill="none" stroke="white" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="50" cy="130" r="8" fill="white"/>
</svg>`;

  return { icon, full, monochrome };
}

/**
 * Direction 3: Stacked Wordmark (Stripe-inspired)
 * Clean typography with a subtle accent mark.
 * No icon — the letterforms ARE the logo.
 */
function generateWordmark(name: string, colors: BrandColors): LogoVariantSVGs {
  const fg = colors.primary;
  const bg = colors.dark;

  const icon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <rect width="200" height="200" rx="32" fill="${bg}"/>
  <text x="100" y="118" text-anchor="middle" font-family="Inter,-apple-system,system-ui,sans-serif" font-size="32" font-weight="600" fill="white" letter-spacing="-0.5">${name}</text>
  <rect x="80" y="136" width="40" height="3" rx="1.5" fill="${fg}"/>
</svg>`;

  const full = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 200" width="400" height="200">
  <text x="40" y="118" text-anchor="start" font-family="Inter,-apple-system,system-ui,sans-serif" font-size="44" font-weight="700" fill="white" letter-spacing="-1">${name}</text>
  <rect x="40" y="136" width="48" height="3" rx="1.5" fill="${fg}"/>
</svg>`;

  const monochrome = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <rect width="200" height="200" rx="32" fill="#111"/>
  <text x="100" y="118" text-anchor="middle" font-family="Inter,-apple-system,system-ui,sans-serif" font-size="32" font-weight="600" fill="white" letter-spacing="-0.5">${name}</text>
  <rect x="80" y="136" width="40" height="3" rx="1.5" fill="white"/>
</svg>`;

  return { icon, full, monochrome };
}

/**
 * Direction 4: Badge Mark (Notion-inspired)
 * A compact container with the initial and a simple framing element.
 * Feels like an app icon — works beautifully as a favicon.
 */
function generateBadgeMark(name: string, colors: BrandColors): LogoVariantSVGs {
  const letter = name.charAt(0).toUpperCase();
  const bg = colors.dark;
  const accent = colors.primary;
  const rounded = 44; // More rounded — app-icon feel

  const icon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <rect width="200" height="200" rx="${rounded}" fill="${bg}"/>
  <rect x="30" y="30" width="140" height="140" rx="${rounded - 14}" fill="none" stroke="${accent}" stroke-width="4" opacity="0.3"/>
  <text x="100" y="124" text-anchor="middle" font-family="Inter,-apple-system,system-ui,sans-serif" font-size="76" font-weight="700" fill="white" letter-spacing="-1">${letter}</text>
</svg>`;

  const full = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 200" width="400" height="200">
  <rect x="20" y="58" width="84" height="84" rx="22" fill="${bg}"/>
  <rect x="30" y="68" width="64" height="64" rx="16" fill="none" stroke="${accent}" stroke-width="2" opacity="0.3"/>
  <text x="62" y="106" text-anchor="middle" font-family="Inter,-apple-system,system-ui,sans-serif" font-size="36" font-weight="700" fill="white">${letter}</text>
  <text x="128" y="116" text-anchor="start" font-family="Inter,-apple-system,system-ui,sans-serif" font-size="38" font-weight="700" fill="white" letter-spacing="-1">${name}</text>
</svg>`;

  const monochrome = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <rect width="200" height="200" rx="${rounded}" fill="#111"/>
  <rect x="30" y="30" width="140" height="140" rx="${rounded - 14}" fill="none" stroke="white" stroke-width="4" opacity="0.2"/>
  <text x="100" y="124" text-anchor="middle" font-family="Inter,-apple-system,system-ui,sans-serif" font-size="76" font-weight="700" fill="white" letter-spacing="-1">${letter}</text>
</svg>`;

  return { icon, full, monochrome };
}

/**
 * Direction 5: Minimal Frame (Framer-inspired)
 * A thin-outlined frame with negative-space letter.
 * Light, premium feel — distinctive at small sizes.
 */
function generateMinimalFrame(name: string, colors: BrandColors): LogoVariantSVGs {
  const letter = name.charAt(0).toUpperCase();
  const accent = colors.primary;
  const bg = colors.dark;

  const icon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <rect width="200" height="200" rx="44" fill="${bg}"/>
  <rect x="40" y="40" width="120" height="120" rx="20" fill="none" stroke="${accent}" stroke-width="5"/>
  <text x="100" y="122" text-anchor="middle" font-family="Inter,-apple-system,system-ui,sans-serif" font-size="64" font-weight="500" fill="${accent}" letter-spacing="-1">${letter}</text>
</svg>`;

  const full = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 200" width="400" height="200">
  <rect x="28" y="60" width="80" height="80" rx="16" fill="${bg}"/>
  <rect x="38" y="72" width="60" height="56" rx="10" fill="none" stroke="${accent}" stroke-width="3"/>
  <text x="68" y="108" text-anchor="middle" font-family="Inter,-apple-system,system-ui,sans-serif" font-size="34" font-weight="500" fill="${accent}">${letter}</text>
  <text x="132" y="116" text-anchor="start" font-family="Inter,-apple-system,system-ui,sans-serif" font-size="36" font-weight="600" fill="white" letter-spacing="-1">${name}</text>
</svg>`;

  const monochrome = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <rect width="200" height="200" rx="44" fill="#111"/>
  <rect x="40" y="40" width="120" height="120" rx="20" fill="none" stroke="white" stroke-width="5"/>
  <text x="100" y="122" text-anchor="middle" font-family="Inter,-apple-system,system-ui,sans-serif" font-size="64" font-weight="500" fill="white" letter-spacing="-1">${letter}</text>
</svg>`;

  return { icon, full, monochrome };
}

/* ─── Quality Scoring ───
 *
 * Scores each logo variant against real-world SaaS standards.
 * Each dimension is 0-100 and evaluates a specific quality.
 */

function scoreLogo(svg: LogoVariantSVGs, _colors: BrandColors): LogoScore {
  const icon = svg.icon;

  // Simplicity: count distinct SVG elements
  const elementCount = (icon.match(/<(rect|circle|path|polygon|line|text)/g) || []).length;
  const simplicity = Math.max(0, 100 - (elementCount - 3) * 15);

  // Favicon readiness: uses high-contrast shapes, no gradients, no fine details
  const hasGradients = icon.includes("linearGradient") || icon.includes("radialGradient");
  const hasFineStrokes = (icon.match(/stroke-width="[0-3]"/g) || []).length > 0;
  const hasLargeText = icon.includes('font-size="7') || icon.includes('font-size="8');
  const faviconReadiness = hasGradients ? 70 : hasFineStrokes ? 85 : hasLargeText ? 90 : 95;

  // Scalability: uses relative coordinates, proper viewBox
  const hasViewBox = icon.includes("viewBox");
  const usesPercentage = icon.includes("%");
  const scalability = hasViewBox ? (usesPercentage ? 90 : 85) : 60;

  // Memorability: distinct shape with a clear focal point
  // Letter-based marks are more memorable; text-only less so
  const hasLetter = /font-size="[6-9][0-9]"/.test(icon);
  const hasShape = icon.includes("<path") || icon.includes("<polygon");
  const memorability = hasLetter ? 88 : hasShape ? 82 : 75;

  // Uniqueness: fewer elements + no gradients = cleaner, more ownable
  // Text-only marks get a uniqueness bonus (ownable typography)
  const isTextOnly = !icon.includes("<rect") && !icon.includes("<circle") && !icon.includes("<path");
  const uniqueness = isTextOnly ? 90 : hasGradients ? 75 : 85;

  // Overall composite
  const overall = Math.round(
    simplicity * 0.25 +
    memorability * 0.25 +
    faviconReadiness * 0.20 +
    scalability * 0.15 +
    uniqueness * 0.15
  );

  return {
    overall,
    simplicity,
    memorability,
    faviconReadiness,
    scalability,
    uniqueness,
  };
}

/* ─── Brand Concept Generation ─── */

/** Get a brand concept explanation for each direction */
function getBrandConcept(
  style: "letter" | "glyph" | "wordmark" | "badge" | "frame",
  name: string,
  industry: string,
): { concept: string; reasoning: string } {
  const concepts: Record<string, { concept: string; reasoning: string }> = {
    letter: {
      concept: `${name.charAt(0).toUpperCase()} as a confident monogram`,
      reasoning: `A single bold letter in a clean container. Like Linear and Notion, this mark is unapologetically simple — the letter stands for the brand, not an idea. At 16px, the high-contrast letterform remains perfectly legible.`,
    },
    glyph: {
      concept: `A stripped-down ${industry} signal`,
      reasoning: `An abstract chevron-like form. Like Vercel's triangle, this glyph doesn't try to illustrate the product — it's a geometric statement. Simple enough to draw from memory, distinct enough to own.`,
    },
    wordmark: {
      concept: `Typography as identity`,
      reasoning: `No icon, no illustration — just the name set with precision. Like Stripe, the typography IS the logo. The subtle accent bar adds structure without distracting. At small sizes, text is always the most readable option.`,
    },
    badge: {
      concept: `A contained ${name.charAt(0).toUpperCase()} in an app-icon frame`,
      reasoning: `The double-frame creates depth without gradients. Like Notion's N in a box, this mark reads clearly at 16px because the letter fills most of the container. The frame feels intentional, not decorative.`,
    },
    frame: {
      concept: `Negative-space ${name.charAt(0).toUpperCase()} in a thin frame`,
      reasoning: `A thin outline paired with a light letter weight — Framer-like restraint. The frame defines the shape without filling it, creating a premium, airy feel. Works at 16px because the outline stays thick while the interior stays open.`,
    },
  };

  return concepts[style] || concepts.letter;
}

/* ─── Style Analysis ─── */

export function analyzeBrand(
  startupName: string,
  industry: string,
  tone: string[],
): BrandAnalysis {
  const lower = (industry + " " + tone.join(" ")).toLowerCase();

  let suggestedStyle: BrandAnalysis["suggestedStyle"] = "letter";
  if (/tech|ai|devtools|saas/i.test(lower)) suggestedStyle = "glyph";
  else if (/gaming|creator|playful|fun|entertainment/i.test(lower)) suggestedStyle = "badge";
  else if (/services|corporate|professional|trust|consulting|legal/i.test(lower)) suggestedStyle = "wordmark";
  else if (/fintech|crypto|design|premium|luxury|fashion/i.test(lower)) suggestedStyle = "frame";

  const iconConcepts: Record<string, string[]> = {
    ai: ["Minimal letter A", "Abstract connection", "Clean node mark"],
    devtools: ["Terminal bracket", "Clean angle mark", "Code diamond"],
    fintech: ["Simple shield", "Clean arrow", "Balance mark"],
    healthtech: ["Clean cross mark", "Abstract pulse", "Simple leaf"],
    ecommerce: ["Simple cart mark", "Clean tag", "Box icon"],
    creator: ["Play mark", "Simple aperture", "Wave line"],
    gaming: ["D-pad cross", "Victory mark", "Simple gem"],
    climate: ["Simple leaf", "Clean drop", "Sun mark"],
    edtech: ["Open book mark", "Simple cap", "Light mark"],
    marketplace: ["Two-way arrow", "Balance mark", "Bridge line"],
    hardware: ["Simple chip", "Gear mark", "Bolt icon"],
    services: ["Simple handshake", "Node circle", "Comp mark"],
    saas: ["Clean cloud", "Simple grid", "Abstract mark"],
  };
  const concepts = iconConcepts[industry] || iconConcepts.saas;

  let faviconStrategy: BrandAnalysis["faviconStrategy"] = "initial";
  if (suggestedStyle === "glyph") faviconStrategy = "symbol";
  if (suggestedStyle === "badge") faviconStrategy = "monogram";

  return {
    suggestedStyle,
    iconConcepts: concepts.slice(0, 3),
    faviconStrategy,
    colorPsychology: getColorPsychology(industry),
  };
}

function getColorPsychology(industry: string): string {
  const map: Record<string, string> = {
    ai: "cool purples and deep blues for intelligence and reliability",
    fintech: "blues and teals for trust, security, and growth",
    healthtech: "greens and soft blues for clinical calm",
    ecommerce: "warm oranges for action and approachability",
    devtools: "greens and blues for developer aesthetics",
    creator: "bold pinks and purples for creative energy",
    gaming: "neon colors for energy and excitement",
    climate: "earthy greens and ocean blues for sustainability",
    edtech: "purples and blues blending wisdom with approachability",
    marketplace: "teals and oranges balancing supply and demand",
    hardware: "industrial yellows and steel grays for precision",
    services: "navy blues and warm grays for professionalism",
    saas: "indigos and purples for innovation with credibility",
  };
  return map[industry] || "balanced cool and warm tones";
}

/* ─── Main Generation ─── */

export function generateLogos(
  startupName: string,
  industry: string,
  brandColors: { name: string; hex: string }[],
  tone?: string[],
): LogoVariant[] {
  const colors = getBrandColors(brandColors);

  const generators: Array<{
    id: string;
    style: string;
    category: LogoVariant["category"];
    gen: () => LogoVariantSVGs;
  }> = [
    { id: "logo-letter", style: "Letter Mark", category: "icon", gen: () => generateLetterMark(startupName, colors) },
    { id: "logo-glyph", style: "Geometric Glyph", category: "icon", gen: () => generateGeometricGlyph(startupName, colors) },
    { id: "logo-wordmark", style: "Wordmark", category: "wordmark", gen: () => generateWordmark(startupName, colors) },
    { id: "logo-badge", style: "Badge Mark", category: "icon", gen: () => generateBadgeMark(startupName, colors) },
    { id: "logo-frame", style: "Minimal Frame", category: "combination", gen: () => generateMinimalFrame(startupName, colors) },
  ];

  const styleNames: Array<"letter" | "glyph" | "wordmark" | "badge" | "frame"> = [
    "letter", "glyph", "wordmark", "badge", "frame",
  ];

  const variants: LogoVariant[] = generators.map((g, i) => {
    const svg = g.gen();
    const { concept, reasoning } = getBrandConcept(styleNames[i], startupName, industry);
    const qualityScore = scoreLogo(svg, colors);

    return {
      id: g.id,
      style: g.style,
      brandConcept: concept,
      symbolReasoning: reasoning,
      qualityScore,
      colors: [colors.primary, colors.secondary, colors.dark],
      category: g.category,
      svg,
    };
  });

  // Reorder based on brand analysis
  if (tone && tone.length > 0) {
    const analysis = analyzeBrand(startupName, industry, tone);
    const preferredIdx = styleNames.indexOf(analysis.suggestedStyle);
    if (preferredIdx > 0) {
      const [item] = variants.splice(preferredIdx, 1);
      variants.unshift(item);
    }
  }

  return variants;
}

/** Convert SVG string to a data URL */
export function svgToDataUrl(svg: string): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

/** Serialize logos for the blueprint/API interface */
export function serializeLogos(
  startupName: string,
  industry: string,
  brandColors: { name: string; hex: string }[],
  tone?: string[],
): SerializedLogo[] {
  const logos = generateLogos(startupName, industry, brandColors, tone);
  return logos.map((logo) => ({
    id: logo.id,
    style: logo.style,
    brandConcept: logo.brandConcept,
    symbolReasoning: logo.symbolReasoning,
    qualityScore: logo.qualityScore,
    preview: svgToDataUrl(logo.svg.icon),
    fullPreview: svgToDataUrl(logo.svg.full),
    monochromePreview: svgToDataUrl(logo.svg.monochrome),
    colors: logo.colors,
  }));
}

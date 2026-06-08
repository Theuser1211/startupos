/**
 * Logo Generator for StartupOS
 *
 * Generates SVG logos based on brand data and industry.
 * Uses deterministic design rules to create branded logos without
 * requiring external image generation APIs.
 *
 * Each logo style produces a unique SVG with:
 * - Brand-appropriate colors
 * - Industry-relevant iconography
 * - Scalable vector output
 * - Responsive sizing
 */

interface LogoVariant {
  id: string;
  style: string;
  svg: string;
  description: string;
  colors: string[];
}

interface BrandColors {
  primary: string;
  secondary: string;
  dark: string;
  light: string;
}

/** Extract dominant colors from brand palette */
function getBrandColors(brandColors: { name: string; hex: string }[]): BrandColors {
  const colors = brandColors.map((c) => c.hex);
  return {
    primary: colors[0] || "#7C3AED",
    secondary: colors[1] || "#6366F1",
    dark: colors[2] || "#0A0A0F",
    light: colors[3] || "#A1A1B5",
  };
}

/** Generate initial-based logo (fallback when no brand data) */
function generateInitialLogo(
  name: string,
  colors: BrandColors,
): string {
  const initial = name.charAt(0).toUpperCase();
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${colors.primary}" />
      <stop offset="100%" stop-color="${colors.secondary}" />
    </linearGradient>
  </defs>
  <rect width="200" height="200" rx="40" fill="url(#bg)" />
  <text x="100" y="130" text-anchor="middle" font-family="system-ui, sans-serif" font-size="96" font-weight="700" fill="white">${initial}</text>
</svg>`;
}

/** Generate geometric mark logo */
function generateGeometricLogo(
  name: string,
  colors: BrandColors,
): string {
  const initial = name.charAt(0).toUpperCase();
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <defs>
    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${colors.primary}" />
      <stop offset="100%" stop-color="${colors.secondary}" />
    </linearGradient>
    <linearGradient id="grad2" x1="100%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="${colors.secondary}" />
      <stop offset="100%" stop-color="${colors.primary}" />
    </linearGradient>
  </defs>
  <rect width="200" height="200" rx="44" fill="${colors.dark}" />
  <polygon points="100,30 170,80 170,140 100,170 30,140 30,80" fill="url(#grad1)" opacity="0.9" />
  <polygon points="100,50 155,90 155,130 100,155 45,130 45,90" fill="url(#grad2)" opacity="0.7" />
  <text x="100" y="138" text-anchor="middle" font-family="system-ui, sans-serif" font-size="48" font-weight="800" fill="white" letter-spacing="1">${initial}</text>
</svg>`;
}

/** Generate abstract icon logo */
function generateAbstractLogo(
  name: string,
  colors: BrandColors,
): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <defs>
    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${colors.primary}" />
      <stop offset="100%" stop-color="${colors.secondary}" />
    </linearGradient>
    <filter id="glow">
      <feGaussianBlur stdDeviation="3" result="blur" />
      <feMerge>
        <feMergeNode in="blur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
  </defs>
  <rect width="200" height="200" rx="44" fill="${colors.dark}" />
  <circle cx="100" cy="90" r="45" fill="url(#grad1)" opacity="0.2" filter="url(#glow)" />
  <circle cx="80" cy="80" r="25" fill="${colors.primary}" opacity="0.6" />
  <circle cx="120" cy="100" r="20" fill="${colors.secondary}" opacity="0.6" />
  <circle cx="90" cy="110" r="15" fill="${colors.primary}" opacity="0.4" />
  <text x="100" y="155" text-anchor="middle" font-family="system-ui, sans-serif" font-size="22" font-weight="700" fill="white">${name}</text>
</svg>`;
}

/** Generate minimalist wordmark logo */
function generateWordmarkLogo(
  name: string,
  colors: BrandColors,
): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 200" width="400" height="200">
  <defs>
    <linearGradient id="textGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="${colors.primary}" />
      <stop offset="100%" stop-color="${colors.secondary}" />
    </linearGradient>
  </defs>
  <rect width="400" height="200" fill="transparent" />
  <text x="200" y="115" text-anchor="middle" font-family="system-ui, sans-serif" font-size="52" font-weight="800" fill="url(#textGrad)" letter-spacing="-1">${name}</text>
  <line x1="160" y1="135" x2="240" y2="135" stroke="${colors.primary}" stroke-width="2" opacity="0.5" />
</svg>`;
}

/** Generate industry-themed logo */
function generateIndustryLogo(
  name: string,
  industry: string,
  colors: BrandColors,
): string {
  const initial = name.charAt(0).toUpperCase();

  // Industry-specific SVG paths
  const industryIcons: Record<string, string> = {
    ai: `<path d="M100 40C67 40 40 67 40 100s27 60 60 60 60-27 60-60S133 40 100 40zM85 70l30 30-30 30" stroke="${colors.primary}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
          <circle cx="100" cy="100" r="8" fill="${colors.secondary}"/>
          <path d="M70 55l-15-15M130 55l15-15M70 145l-15 15M130 145l15 15" stroke="${colors.dark}" stroke-width="3" stroke-linecap="round" opacity="0.3"/>`,
    crypto: `<path d="M100 40c-33 0-60 27-60 60s27 60 60 60 60-27 60-60S133 40 100 40z" fill="none" stroke="${colors.primary}" stroke-width="6"/>
             <path d="M100 55v90M75 75h35c14 0 25 11 25 25s-11 25-25 25H75" stroke="${colors.primary}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`,
    default: `<circle cx="100" cy="80" r="40" fill="none" stroke="${colors.primary}" stroke-width="6"/>
              <circle cx="100" cy="80" r="12" fill="${colors.secondary}"/>
              <path d="M100 120v40M85 150h30" stroke="${colors.dark}" stroke-width="4" stroke-linecap="round" opacity="0.3"/>`,
  };

  const icon = industryIcons[industry] || industryIcons.default;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${colors.dark}" />
      <stop offset="100%" stop-color="${colors.dark}" stop-opacity="0.8" />
    </linearGradient>
    <linearGradient id="ring" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${colors.primary}" />
      <stop offset="100%" stop-color="${colors.secondary}" />
    </linearGradient>
  </defs>
  <rect width="200" height="200" rx="44" fill="url(#bg)" stroke="url(#ring)" stroke-width="2" />
  <g transform="translate(0, -15)">${icon}</g>
  <text x="100" y="170" text-anchor="middle" font-family="system-ui, sans-serif" font-size="20" font-weight="700" fill="white">${name}</text>
</svg>`;
}

/** Main generation function */
export function generateLogos(
  startupName: string,
  industry: string,
  brandColors: { name: string; hex: string }[],
): LogoVariant[] {
  const colors = getBrandColors(brandColors);

  return [
    {
      id: "logo-initial",
      style: "Initial Mark",
      svg: generateInitialLogo(startupName, colors),
      description: `Clean ${startupName.charAt(0).toUpperCase()}-letter mark with brand gradient — memorable at any size.`,
      colors: [colors.primary, colors.secondary],
    },
    {
      id: "logo-geometric",
      style: "Geometric",
      svg: generateGeometricLogo(startupName, colors),
      description: "Hexagonal geometric pattern with layered depth — modern and scalable.",
      colors: [colors.primary, colors.secondary],
    },
    {
      id: "logo-abstract",
      style: "Abstract",
      svg: generateAbstractLogo(startupName, colors),
      description: "Connected nodes representing network effects and ecosystem growth.",
      colors: [colors.primary, colors.secondary, colors.dark],
    },
    {
      id: "logo-wordmark",
      style: "Wordmark",
      svg: generateWordmarkLogo(startupName, colors),
      description: "Clean wordmark with gradient accent — professional and understated.",
      colors: [colors.primary, colors.secondary],
    },
    {
      id: "logo-industry",
      style: "Industry",
      svg: generateIndustryLogo(startupName, industry, colors),
      description: `Industry-specific icon paired with the brand name — contextual and distinctive.`,
      colors: [colors.primary, colors.secondary, colors.dark],
    },
  ];
}

/** Convert SVG data URL for use in img tags */
export function svgToDataUrl(svg: string): string {
  const encoded = encodeURIComponent(svg);
  return `data:image/svg+xml;charset=utf-8,${encoded}`;
}

/** Serialize logos to match the StartupBlueprint.logos interface */
export function serializeLogos(
  startupName: string,
  industry: string,
  brandColors: { name: string; hex: string }[],
): {
  id: string;
  description: string;
  style: string;
  preview: string;
  colors: string[];
}[] {
  const logos = generateLogos(startupName, industry, brandColors);
  return logos.map((logo) => ({
    id: logo.id,
    description: logo.description,
    style: logo.style,
    preview: svgToDataUrl(logo.svg),
    colors: logo.colors,
  }));
}

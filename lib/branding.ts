/**
 * StartupOS — Centralized Branding Configuration
 *
 * Single source of truth for all brand references across the application.
 * Import this instead of hardcoding brand values.
 */

export const branding = {
  company: {
    name: "StartupOS",
    legalName: "StartupOS",
    supportEmail: "support@startupos.app",
    privacyEmail: "privacy@startupos.app",
    legalEmail: "legal@startupos.app",
    feedbackEmail: "feedback@startupos.app",
    adminEmail: "admin@startupos.app",
  },
  product: {
    name: "StartupOS",
    tagline: "The Operating System for Modern Founders",
    description:
      "Build your startup with AI-powered insights, brand analysis, revenue modeling, and strategic roadmaps. The complete founder toolkit.",
  },
  urls: {
    website: "https://startupos.app",
    github: "https://github.com/startupos",
  },
  paths: {
    /** Full horizontal logo with wordmark — use in navbar, footer, auth pages, email templates */
    logoFull: "/logo-full.png",
    /** Square/symbol logo — use in sidebar, mobile nav, favicon fallback, app icon */
    logoSymbol: "/logo-square.png",
    /** SVG icon for favicon */
    icon: "/icon.svg",
    /** Legacy favicon */
    favicon: "/favicon.ico",
  },
  metadata: {
    title: {
      default: "StartupOS — The Operating System for Modern Founders",
      template: "%s — StartupOS",
    },
    description:
      "Build your startup with AI-powered insights, brand analysis, revenue modeling, and strategic roadmaps. The complete founder toolkit.",
    keywords: ["startup", "founder", "AI", "business", "brand", "roadmap"] as string[],
    openGraph: {
      title: "StartupOS — The Operating System for Modern Founders",
      description:
        "Build your startup with AI-powered insights, brand analysis, revenue modeling, and strategic roadmaps.",
      url: "https://startupos.app",
      siteName: "StartupOS",
    },
    twitter: {
      title: "StartupOS — The Operating System for Modern Founders",
      description:
        "Build your startup with AI-powered insights, brand analysis, revenue modeling, and strategic roadmaps.",
    },
  },
  /** Logo dimensions for Next.js Image component (width, height) */
  logoDimensions: {
    full: { width: 1536, height: 1024 },
    symbol: { width: 1254, height: 1254 },
  },
} as const;

export type Branding = typeof branding;

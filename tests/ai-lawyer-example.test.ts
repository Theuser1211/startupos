import { describe, it, expect } from "vitest";
import { renderHomeFallback, renderGenericFallback } from "../src/services/renderer/fallbacks/home.js";
import { validateRenderedWebsite } from "../src/services/renderer/validate.js";
import type { BlueprintResult, WebsiteSpecResult, WebsiteResult } from "../src/types/ai.js";

const aiLawyerBlueprint: BlueprintResult = {
  name: "AI Lawyer",
  description: "AI-powered legal assistant for startups",
  industry: "Legal Tech",
  targetAudience: "Startup founders and small business owners",
  problemStatement: "Startups struggle with expensive legal fees and complex compliance requirements",
  solution: "Automated AI legal document review, compliance monitoring, and contract analysis",
  keyFeatures: [
    "Contract review and analysis",
    "Compliance monitoring",
    "Legal document generation",
    "Risk assessment",
  ],
  techStack: ["React", "Node.js", "GPT-4", "PostgreSQL"],
  monetization: "SaaS subscription with tiered pricing",
  competitorAnalysis: ["LegalZoom", "Rocket Lawyer", "Clerky"],
  roadmap: ["MVP launch", "Enterprise tier", "API access", "Mobile app"],
};

const aiLawyerSpec: WebsiteSpecResult = {
  pages: [
    {
      name: "Home",
      slug: "/",
      sections: [
        {
          type: "hero",
          order: 1,
          content: {
            headline: "AI-Powered Legal Assistant for Startups",
            subheadline:
              "Get expert legal help without the expert price tag. AI Lawyer provides automated contract review, compliance monitoring, and document analysis.",
            ctaText: "Start Free Trial",
          },
        },
        {
          type: "features",
          order: 2,
          content: {
            items: [
              "Contract review and analysis",
              "Compliance monitoring",
              "Legal document generation",
              "Risk assessment",
            ],
          },
        },
        {
          type: "cta",
          order: 3,
          content: {
            headline: "Ready to Protect Your Startup?",
            ctaText: "Get Started Free",
          },
        },
      ],
    },
    {
      name: "About",
      slug: "/about",
      sections: [
        {
          type: "about",
          order: 1,
          content: {
            text: "We help startups with legal compliance by making expert legal help accessible through AI.",
          },
        },
      ],
    },
    {
      name: "Features",
      slug: "/features",
      sections: [
        {
          type: "features",
          order: 1,
          content: {
            items: [
              "Contract review",
              "Compliance monitoring",
              "Document analysis",
              "Risk assessment",
            ],
          },
        },
      ],
    },
  ],
  theme: {
    primaryColor: "#1a1a2e",
    secondaryColor: "#16213e",
    fontFamily: "Inter",
    borderRadius: "8px",
  },
  components: [
    { name: "Navbar", type: "navigation", props: {} },
    { name: "Footer", type: "footer", props: {} },
  ],
};

describe("AI Lawyer Example Website", () => {
  it("generates complete website from blueprint + spec using fallback templates", () => {
    const pages = aiLawyerSpec.pages.map((page) => {
      if (page.slug === "/" || page.name.toLowerCase() === "home") {
        return renderHomeFallback(aiLawyerBlueprint, aiLawyerSpec.theme, page);
      }
      return renderGenericFallback(aiLawyerBlueprint, aiLawyerSpec.theme, page);
    });

    const website: WebsiteResult = {
      pages,
      css: "",
      js: "",
    };

    expect(website.pages).toHaveLength(3);

    const homePage = website.pages.find((p) => p.slug === "/");
    expect(homePage).toBeDefined();
    expect(homePage!.title).toBe("Home");
    expect(homePage!.html).toContain("<!DOCTYPE html>");
    expect(homePage!.html).toContain("AI Lawyer");
    expect(homePage!.html).toContain("AI-Powered Legal Assistant");
    expect(homePage!.html).toContain("#1a1a2e");
    expect(homePage!.html).toContain("Inter");
    expect(homePage!.html.length).toBeGreaterThan(2000);

    const aboutPage = website.pages.find((p) => p.slug === "/about");
    expect(aboutPage).toBeDefined();
    expect(aboutPage!.title).toBe("About");
    expect(aboutPage!.html).toContain("AI Lawyer");

    const featuresPage = website.pages.find((p) => p.slug === "/features");
    expect(featuresPage).toBeDefined();
    expect(featuresPage!.title).toBe("Features");

    validateRenderedWebsite(website);

    const storedJSON = JSON.stringify(website, null, 2);
    expect(storedJSON.length).toBeGreaterThan(1000);
    console.log(`\n=== AI Lawyer Website Content JSON ===`);
    console.log(`Total size: ${storedJSON.length} bytes`);
    console.log(`Pages: ${website.pages.length}`);
    for (const page of website.pages) {
      console.log(`  ${page.slug} (${page.title}): ${page.html.length} bytes`);
    }
  });

  it("matches expected stored Website.content format", () => {
    const pages = aiLawyerSpec.pages.map((page) => {
      if (page.slug === "/" || page.name.toLowerCase() === "home") {
        return renderHomeFallback(aiLawyerBlueprint, aiLawyerSpec.theme, page);
      }
      return renderGenericFallback(aiLawyerBlueprint, aiLawyerSpec.theme, page);
    });

    const website: WebsiteResult = {
      pages,
      css: "",
      js: "",
    };

    for (const page of website.pages) {
      expect(page).toHaveProperty("slug");
      expect(page).toHaveProperty("title");
      expect(page).toHaveProperty("html");
      expect(typeof page.slug).toBe("string");
      expect(typeof page.title).toBe("string");
      expect(typeof page.html).toBe("string");
      expect(page.slug.startsWith("/")).toBe(true);
    }

    expect(website).toHaveProperty("css");
    expect(website).toHaveProperty("js");
  });
});

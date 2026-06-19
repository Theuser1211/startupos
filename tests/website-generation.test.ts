import { describe, it, expect } from "vitest";
import {
  PageHTMLResultSchema,
  WebsiteResultSchema,
  BlueprintResultSchema,
  WebsiteSpecResultSchema,
} from "../src/services/ai/validation.js";
import { renderHomeFallback, renderGenericFallback } from "../src/services/renderer/fallbacks/home.js";
import { validateRenderedPage, validateRenderedWebsite } from "../src/services/renderer/validate.js";
import type { BlueprintResult, WebsiteSpecResult, WebsiteResult } from "../src/types/ai.js";

const mockBlueprint: BlueprintResult = {
  name: "AI Lawyer",
  description: "AI-powered legal assistant for startups",
  industry: "Legal Tech",
  targetAudience: "Startup founders and small business owners",
  problemStatement: "Startups struggle with expensive legal fees",
  solution: "Automated AI legal document review and compliance",
  keyFeatures: ["Contract review", "Compliance monitoring", "Legal document analysis"],
  techStack: ["React", "Node.js", "GPT-4"],
  monetization: "SaaS subscription",
  competitorAnalysis: ["LegalZoom", "Rocket Lawyer"],
  roadmap: ["MVP launch", "Enterprise tier", "API access"],
};

const mockSpec: WebsiteSpecResult = {
  pages: [
    {
      name: "Home",
      slug: "/",
      sections: [
        {
          type: "hero",
          order: 1,
          content: {
            headline: "AI-Powered Legal Assistant",
            subheadline: "Get expert legal help for your startup",
            ctaText: "Get Started",
          },
        },
        {
          type: "features",
          order: 2,
          content: { items: ["Contract review", "Compliance monitoring"] },
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
          content: { text: "We help startups with legal compliance" },
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
  components: [{ name: "Navbar", type: "navigation", props: {} }],
};

describe("Validation Schemas", () => {
  describe("PageHTMLResultSchema", () => {
    it("accepts valid HTML page", () => {
      const result = PageHTMLResultSchema.safeParse({
        slug: "/",
        title: "Home",
        html: "<!DOCTYPE html><html><head><title>Test</title></head><body><h1>Hello</h1>" + "x".repeat(600) + "</body></html>",
      });
      expect(result.success).toBe(true);
    });

    it("rejects HTML shorter than 500 chars", () => {
      const result = PageHTMLResultSchema.safeParse({
        slug: "/",
        title: "Home",
        html: "<!DOCTYPE html><html><head></head><body>Short</body></html>",
      });
      expect(result.success).toBe(false);
    });

    it("rejects HTML without doctype or html tag", () => {
      const result = PageHTMLResultSchema.safeParse({
        slug: "/",
        title: "Home",
        html: "x".repeat(600),
      });
      expect(result.success).toBe(false);
    });

    it("rejects HTML without head section", () => {
      const result = PageHTMLResultSchema.safeParse({
        slug: "/",
        title: "Home",
        html: "<!DOCTYPE html><html><body>" + "x".repeat(600) + "</body></html>",
      });
      expect(result.success).toBe(false);
    });

    it("rejects HTML without body section", () => {
      const result = PageHTMLResultSchema.safeParse({
        slug: "/",
        title: "Home",
        html: "<!DOCTYPE html><html><head></head>" + "x".repeat(600) + "</html>",
      });
      expect(result.success).toBe(false);
    });

    it("rejects HTML without closing html tag", () => {
      const result = PageHTMLResultSchema.safeParse({
        slug: "/",
        title: "Home",
        html: "<!DOCTYPE html><html><head></head><body>" + "x".repeat(600),
      });
      expect(result.success).toBe(false);
    });

    it("rejects empty slug", () => {
      const result = PageHTMLResultSchema.safeParse({
        slug: "",
        title: "Home",
        html: "<!DOCTYPE html><html><head></head><body>" + "x".repeat(600) + "</body></html>",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("WebsiteResultSchema", () => {
    it("accepts valid website with multiple pages", () => {
      const result = WebsiteResultSchema.safeParse({
        pages: [
          {
            slug: "/",
            title: "Home",
            html: "<!DOCTYPE html><html><head></head><body>" + "x".repeat(600) + "</body></html>",
          },
          {
            slug: "/about",
            title: "About",
            html: "<!DOCTYPE html><html><head></head><body>" + "x".repeat(600) + "</body></html>",
          },
        ],
        css: "",
        js: "",
      });
      expect(result.success).toBe(true);
    });

    it("rejects empty pages array", () => {
      const result = WebsiteResultSchema.safeParse({
        pages: [],
        css: "",
        js: "",
      });
      expect(result.success).toBe(false);
    });
  });
});

describe("Fallback Templates", () => {
  it("generates valid home page", () => {
    const result = renderHomeFallback(mockBlueprint, mockSpec.theme, mockSpec.pages[0]);

    expect(result.slug).toBe("/");
    expect(result.title).toBe("Home");
    expect(result.html).toContain("<!DOCTYPE html>");
    expect(result.html).toContain("<html");
    expect(result.html).toContain("<head");
    expect(result.html).toContain("<body");
    expect(result.html).toContain("</html>");
    expect(result.html).toContain(mockBlueprint.name);
    expect(result.html).toContain(mockBlueprint.description);
    expect(result.html).toContain(mockSpec.theme.primaryColor);
    expect(result.html).toContain("Inter");
    expect(result.html.length).toBeGreaterThan(500);
  });

  it("generates valid generic page", () => {
    const aboutPage = mockSpec.pages[1];
    const result = renderGenericFallback(mockBlueprint, mockSpec.theme, aboutPage);

    expect(result.slug).toBe("/about");
    expect(result.title).toBe("About");
    expect(result.html).toContain("<!DOCTYPE html>");
    expect(result.html).toContain(mockBlueprint.name);
    expect(result.html.length).toBeGreaterThan(500);
  });

  it("escapes HTML in user content", () => {
    const maliciousBlueprint: BlueprintResult = {
      ...mockBlueprint,
      name: '<script>alert("xss")</script>',
    };

    const result = renderHomeFallback(maliciousBlueprint, mockSpec.theme, mockSpec.pages[0]);

    expect(result.html).not.toContain("<script>");
    expect(result.html).toContain("&lt;script&gt;");
  });

  it("handles empty key features", () => {
    const noFeaturesBlueprint: BlueprintResult = {
      ...mockBlueprint,
      keyFeatures: [],
    };

    const result = renderHomeFallback(noFeaturesBlueprint, mockSpec.theme, mockSpec.pages[0]);

    expect(result.html).toContain("<!DOCTYPE html>");
    expect(result.html.length).toBeGreaterThan(500);
  });
});

describe("validateRenderedPage", () => {
  it("passes for valid HTML", () => {
    const html = "<!DOCTYPE html><html><head></head><body>" + "x".repeat(600) + "</body></html>";
    expect(() => validateRenderedPage(html, "Home")).not.toThrow();
  });

  it("throws for HTML too short", () => {
    expect(() => validateRenderedPage("short", "Home")).toThrow("too short");
  });

  it("throws for AI error messages", () => {
    const html = "I cannot generate HTML. " + "x".repeat(600);
    expect(() => validateRenderedPage(html, "Home")).toThrow("AI error message");
  });

  it("throws for markdown fences", () => {
    const html = "```html\n" + "x".repeat(600) + "\n```";
    expect(() => validateRenderedPage(html, "Home")).toThrow("markdown fences");
  });
});

describe("validateRenderedWebsite", () => {
  it("passes for valid website", () => {
    const website: WebsiteResult = {
      pages: [
        {
          slug: "/",
          title: "Home",
          html: "<!DOCTYPE html><html><head></head><body>" + "x".repeat(600) + "</body></html>",
        },
      ],
      css: "",
      js: "",
    };
    expect(() => validateRenderedWebsite(website)).not.toThrow();
  });

  it("throws for duplicate slugs", () => {
    const website: WebsiteResult = {
      pages: [
        {
          slug: "/",
          title: "Home",
          html: "<!DOCTYPE html><html><head></head><body>" + "x".repeat(600) + "</body></html>",
        },
        {
          slug: "/",
          title: "Home Again",
          html: "<!DOCTYPE html><html><head></head><body>" + "x".repeat(600) + "</body></html>",
        },
      ],
      css: "",
      js: "",
    };
    expect(() => validateRenderedWebsite(website)).toThrow("duplicate page slugs");
  });

  it("throws for empty pages", () => {
    const website: WebsiteResult = {
      pages: [],
      css: "",
      js: "",
    };
    expect(() => validateRenderedWebsite(website)).toThrow("no pages");
  });
});

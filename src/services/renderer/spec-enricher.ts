import { BlueprintResult, WebsiteSpecResult, PageSpec, SectionSpec } from "../../types/ai.js";
import { logger } from "../../lib/logger.js";

function guessIndustry(blueprint: BlueprintResult): string {
  const ind = (blueprint.industry || "").toLowerCase();
  if (ind.includes("fin") || ind.includes("bank") || ind.includes("pay")) return "fintech";
  if (ind.includes("health") || ind.includes("med") || ind.includes("biotech")) return "healthcare";
  if (ind.includes("dev") || ind.includes("saas") || ind.includes("software") || ind.includes("tech")) return "devtools";
  if (ind.includes("ai") || ind.includes("ml") || ind.includes("machine")) return "ai-ml";
  if (ind.includes("ecommerce") || ind.includes("shop") || ind.includes("retail")) return "ecommerce";
  if (ind.includes("edu") || ind.includes("learn") || ind.includes("course")) return "education";
  if (ind.includes("sec") || ind.includes("cyber")) return "security";
  if (ind.includes("creative") || ind.includes("design") || ind.includes("media")) return "creative";
  return "enterprise";
}

const industryColors: Record<string, { primary: string; secondary: string }> = {
  fintech: { primary: "#0F766E", secondary: "#14B8A6" },
  healthcare: { primary: "#059669", secondary: "#10B981" },
  devtools: { primary: "#2563EB", secondary: "#7C3AED" },
  "ai-ml": { primary: "#7C3AED", secondary: "#2563EB" },
  ecommerce: { primary: "#E11D48", secondary: "#BE185D" },
  education: { primary: "#7C3AED", secondary: "#8B5CF6" },
  security: { primary: "#1E293B", secondary: "#475569" },
  enterprise: { primary: "#4F46E5", secondary: "#6366F1" },
  creative: { primary: "#EC4899", secondary: "#F43F5E" },
};

function ensureSection(pages: PageSpec[], sectionType: string, defaultSection: () => SectionSpec): void {
  const home = pages.find((p) => p.slug === "/");
  if (!home) return;
  const exists = home.sections.some((s) => s.type === sectionType);
  if (!exists) {
    home.sections.push(defaultSection());
  }
}

function enrichFeatureItems(section: SectionSpec): void {
  const items = section.content?.items as unknown[];
  if (!items || !Array.isArray(items)) return;

  const enriched = items.map((item) => {
    if (typeof item === "string") {
      return { title: item, description: "" };
    }
    if (typeof item === "object" && item !== null) {
      const obj = item as Record<string, unknown>;
      if (!obj.description) {
        return { title: obj.title || obj.name || JSON.stringify(item), description: "" };
      }
      return item;
    }
    return { title: String(item), description: "" };
  });

  section.content.items = enriched;
}

function enrichPricingSection(section: SectionSpec, blueprint: BlueprintResult): void {
  if (!section.content?.plans && blueprint.monetization) {
    const monetization = blueprint.monetization.toLowerCase();
    if (!monetization.includes("free") && !monetization.includes("open source")) {
      section.content = {
        ...section.content,
        headline: section.content?.headline || "Simple Pricing",
        subtitle: blueprint.monetization,
      };
    }
  }
}

function createSection(type: string, order: number, content: Record<string, unknown>): SectionSpec {
  return { type, order, content };
}

export function enrichWebsiteSpec(
  blueprint: BlueprintResult,
  spec: WebsiteSpecResult,
): WebsiteSpecResult {
  const pages = spec.pages.map((page) => ({
    ...page,
    sections: [...page.sections],
  }));

  const homePage = pages.find((p) => p.slug === "/");

  if (homePage) {
    const nextOrder = (): number => {
      const max = Math.max(...homePage.sections.map((s) => s.order), 0);
      return max + 1;
    };

    ensureSection(pages, "hero", () =>
      createSection("hero", 1, {
        headline: blueprint.name,
        subheadline: blueprint.description,
        ctaText: "Get Started",
        ctaSecondary: "Learn More",
      }),
    );

    if (blueprint.problemStatement && blueprint.problemStatement.length > 10) {
      ensureSection(pages, "problem", () =>
        createSection("problem", 2, {
          headline: `The ${blueprint.industry} challenge`,
          description: blueprint.problemStatement,
          painPoints: [blueprint.problemStatement],
        }),
      );
    }

    if (blueprint.solution && blueprint.solution.length > 10) {
      ensureSection(pages, "solution", () =>
        createSection("solution", 3, {
          headline: `How ${blueprint.name} solves this`,
          description: blueprint.solution,
          benefits: blueprint.keyFeatures.slice(0, 4),
        }),
      );
    }

    for (const section of homePage.sections) {
      if (section.type === "features") {
        enrichFeatureItems(section);
      }
      if (section.type === "pricing") {
        enrichPricingSection(section, blueprint);
      }
    }

    const missingFAQ = !homePage.sections.some((s) => s.type === "faq");
    if (missingFAQ && blueprint.keyFeatures.length > 0) {
      const faqItems = [
        {
          question: `What is ${blueprint.name}?`,
          answer: `${blueprint.name} is a ${blueprint.industry} solution that ${blueprint.solution}`,
        },
        {
          question: `Who is ${blueprint.name} for?`,
          answer: `${blueprint.name} is designed for ${blueprint.targetAudience}`,
        },
        {
          question: "How does pricing work?",
          answer: blueprint.monetization || "Contact us for pricing details.",
        },
        {
          question: `How do I get started with ${blueprint.name}?`,
          answer: `Getting started is simple. Sign up for free and begin exploring ${blueprint.name}'s features immediately.`,
        },
        {
          question: `What makes ${blueprint.name} different?`,
          answer: `${blueprint.name} focuses on ${blueprint.keyFeatures.slice(0, 2).join(" and ")}, making it the ideal choice for ${blueprint.targetAudience}.`,
        },
      ];

      ensureSection(pages, "faq", () =>
        createSection("faq", nextOrder(), {
          subtitle: "",
          items: faqItems,
        }),
      );
    }

    if (blueprint.monetization) {
      const pricingSection = homePage.sections.find((s) => s.type === "pricing");
      if (pricingSection && !pricingSection.content?.plans) {
        enrichPricingSection(pricingSection, blueprint);
      }
    }

    homePage.sections.sort((a, b) => a.order - b.order);
  }

  const industry = guessIndustry(blueprint);
  const colors = industryColors[industry] || industryColors.enterprise;

  const theme = {
    ...spec.theme,
    primaryColor: spec.theme.primaryColor || colors.primary,
    secondaryColor: spec.theme.secondaryColor || colors.secondary,
    fontFamily: spec.theme.fontFamily || "Inter",
    borderRadius: spec.theme.borderRadius || "12px",
  };

  const result: WebsiteSpecResult = {
    pages,
    theme,
    components: spec.components || [],
  };

  logger.info(
    {
      pageCount: result.pages.length,
      homeSections: result.pages.find((p) => p.slug === "/")?.sections.map((s) => s.type),
      theme,
    },
    "Spec enrichment complete",
  );

  return result;
}

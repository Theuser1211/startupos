import {
  BlueprintResult,
  WebsiteSpecResult,
  WebsiteResult,
  PageHTMLResult,
} from "../../types/ai.js";
import { generateWebsitePageWithFallback } from "../ai/provider.js";
import { logger } from "../../lib/logger.js";
import { validateRenderedWebsite } from "./validate.js";
import { renderHomeFallback, renderGenericFallback } from "./fallbacks/home.js";

export interface RenderResult {
  website: WebsiteResult;
  stats: {
    pagesGenerated: number;
    pagesFallback: number;
    total: number;
    providersUsed: string[];
    fallbackPages: string[];
    warnings: string[];
  };
}

export async function renderWebsite(
  blueprint: BlueprintResult,
  spec: WebsiteSpecResult,
): Promise<RenderResult> {
  const pages: PageHTMLResult[] = [];
  const fallbackPages: string[] = [];
  const warnings: string[] = [];
  const providersUsed = new Set<string>();

  for (const page of spec.pages) {
    logger.info({ page: page.name, slug: page.slug }, "Generating page");

    try {
      const result = await generateWebsitePageWithFallback(blueprint, spec, page);
      pages.push(result);
      logger.info({ page: page.name, slug: page.slug, htmlLength: result.html.length }, "Page generated successfully");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      logger.warn({ page: page.name, error: message }, "AI generation failed, using fallback");
      warnings.push(`Page "${page.name}" fell back to template: ${message}`);

      const fallback = generateFallbackPage(blueprint, spec, page);
      pages.push(fallback);
      fallbackPages.push(page.slug);
    }
  }

  const result: WebsiteResult = {
    pages,
    css: "",
    js: "",
  };

  try {
    validateRenderedWebsite(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    warnings.push(`Website validation warning: ${message}`);
    logger.warn({ error: message }, "Website validation failed");
  }

  return {
    website: result,
    stats: {
      pagesGenerated: pages.length - fallbackPages.length,
      pagesFallback: fallbackPages.length,
      total: pages.length,
      providersUsed: Array.from(providersUsed),
      fallbackPages,
      warnings,
    },
  };
}

function generateFallbackPage(
  blueprint: BlueprintResult,
  spec: WebsiteSpecResult,
  page: import("../../types/ai.js").PageSpec,
): PageHTMLResult {
  if (page.slug === "/" || page.name.toLowerCase() === "home") {
    return renderHomeFallback(blueprint, spec.theme, page);
  }
  return renderGenericFallback(blueprint, spec.theme, page);
}

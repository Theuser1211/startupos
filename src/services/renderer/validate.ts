import { PageHTMLResult, WebsiteResult } from "../../types/ai.js";
import { logger } from "../../lib/logger.js";

const AI_ERROR_PATTERNS = [
  "I cannot",
  "I can't",
  "I'm sorry",
  "As an AI",
  "I don't have",
  "I am unable",
  "Unfortunately",
  "I am not able",
];

export function validateRenderedPage(raw: string, pageName: string): void {
  if (raw.length < 500) {
    throw new Error(
      `Page "${pageName}" HTML too short (${raw.length} chars) — likely truncated`,
    );
  }

  for (const pattern of AI_ERROR_PATTERNS) {
    if (raw.includes(pattern)) {
      throw new Error(
        `Page "${pageName}" contains AI error message: "${pattern}"`,
      );
    }
  }

  if (raw.includes("```")) {
    throw new Error(`Page "${pageName}" contains markdown fences`);
  }
}

export function validateRenderedWebsite(result: WebsiteResult): void {
  if (result.pages.length === 0) {
    throw new Error("Website has no pages");
  }

  for (const page of result.pages) {
    if (!page.html.includes("<!DOCTYPE html") && !page.html.includes("<html")) {
      logger.warn({ slug: page.slug }, "Page missing HTML document structure");
    }
    if (!page.html.includes("<head")) {
      logger.warn({ slug: page.slug }, "Page missing <head> section");
    }
    if (!page.html.includes("<body")) {
      logger.warn({ slug: page.slug }, "Page missing <body> section");
    }
    if (!page.html.includes("</html>")) {
      logger.warn({ slug: page.slug }, "Page missing closing </html> tag");
    }

    if (page.html.includes("link") && page.html.includes("rel=\"stylesheet\"")) {
      const externalLinks = page.html.match(/href="https?:\/\/[^"]+\.css"/g);
      if (externalLinks) {
        logger.warn(
          { slug: page.slug, links: externalLinks },
          "Page has external CSS dependencies",
        );
      }
    }
  }

  const slugs = result.pages.map((p) => p.slug);
  const uniqueSlugs = new Set(slugs);
  if (uniqueSlugs.size !== slugs.length) {
    throw new Error("Website has duplicate page slugs");
  }
}

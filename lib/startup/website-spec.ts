/**
 * WebsiteSpec — The AI-generated website specification.
 *
 * AI ONLY generates this JSON. No HTML. No templates.
 * The React renderer converts this spec into a live website.
 *
 * Architecture:
 *   Interview → AI Blueprint → AI WebsiteSpec (JSON) → React Renderer → Website
 */

import { z } from "zod";

/* ─── Section Type ─── */

export const SectionTypeEnum = z.enum([
  "hero",
  "problem",
  "solution",
  "values",
  "pain-points",
  "features",
  "social-proof",
  "pricing",
  "faq",
  "cta",
  "testimonials",
  "metrics",
  "custom",
]);

/* ─── Section Item ─── */

export const SectionItemSchema = z.object({
  icon: z.string().optional(),
  title: z.string(),
  description: z.string(),
  meta: z.string().optional(),
  metaColor: z.string().optional(),
});

/* ─── Section ─── */

export const WebsiteSectionSchema = z.object({
  id: z.string(),
  type: SectionTypeEnum,
  variant: z.number().int().min(0).max(2).default(0),
  heading: z.string(),
  subheading: z.string().optional(),
  body: z.string().optional(),
  items: z.array(SectionItemSchema).optional(),
  style: z.object({
    background: z.string().optional(),
    layout: z.enum(["split-left", "split-right", "centered", "grid-2", "grid-3", "grid-4"]).optional(),
    accent: z.string().optional(),
  }).optional(),
});

/* ─── Visual Style ─── */

export const VisualStyleSchema = z.object({
  primary: z.string(),
  secondary: z.string(),
  accent: z.string(),
  background: z.string(),
  surface: z.string(),
  radius: z.string(),
  fontHeading: z.string(),
  fontBody: z.string(),
  heroScale: z.enum(["large", "balanced", "compact"]).default("balanced"),
  spacing: z.string().default("100px"),
});

/* ─── Copy ─── */

export const CopySchema = z.object({
  tagline: z.string(),
  ctaPrimary: z.string(),
  ctaSecondary: z.string(),
  ctaSubtext: z.string(),
  valueProps: z.array(z.string()).optional(),
});

/* ─── Generation Metadata ─── */

export const WebsiteGenMetadataSchema = z.object({
  provider: z.string(),
  model: z.string(),
  generatedAt: z.string(),
  promptTokens: z.number().optional(),
  outputTokens: z.number().optional(),
  durationMs: z.number().optional(),
});

/* ─── WebsiteSpec ─── */

export const WebsiteSpecSchema = z.object({
  version: z.literal("1.0"),
  visualStyle: VisualStyleSchema,
  layoutType: z.enum(["single-page", "multi-page"]).default("single-page"),
  sectionOrder: z.array(z.string()),
  sections: z.array(WebsiteSectionSchema),
  copy: CopySchema,
  metadata: WebsiteGenMetadataSchema.optional(),
});

/* ─── Inferred Types ─── */

export type WebsiteSpec = z.infer<typeof WebsiteSpecSchema>;
export type WebsiteSection = z.infer<typeof WebsiteSectionSchema>;
export type SectionItem = z.infer<typeof SectionItemSchema>;
export type SectionType = z.infer<typeof SectionTypeEnum>;
export type VisualStyle = z.infer<typeof VisualStyleSchema>;
export type WebsiteGenMetadata = z.infer<typeof WebsiteGenMetadataSchema>;

/* ─── Generation Job Status ─── */

export type GenerationJobStatus = "queued" | "generating" | "completed" | "failed";

export interface WebsiteGenerationJob {
  id: string;
  user_id: string;
  startup_id: string | null;
  blueprint_id: string | null;
  status: GenerationJobStatus;
  website_spec: WebsiteSpec | null;
  provider: string | null;
  model: string | null;
  prompt_tokens: number | null;
  output_tokens: number | null;
  duration_ms: number | null;
  error_message: string | null;
  retry_count: number;
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
  notified_at: string | null;
}

/* ─── Validation Helper ─── */

export function validateWebsiteSpec(data: unknown): { success: true; data: WebsiteSpec } | { success: false; error: string } {
  const result = WebsiteSpecSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, error: result.error.issues.map((e: z.ZodIssue) => `${e.path.join(".")}: ${e.message}`).join("; ") };
}

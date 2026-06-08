import { z } from "zod";

/* ─── Reusable Sub-Schemas ─── */

export const MonthProjectionSchema = z.object({
  month: z.string(),
  projected: z.number(),
  actual: z.number().nullable(),
});

export const RoadmapItemSchema = z.object({
  title: z.string(),
  description: z.string(),
  status: z.enum(["done", "in-progress", "planned"]),
});

export const RoadmapPhaseSchema = z.object({
  quarter: z.string(),
  items: z.array(RoadmapItemSchema),
});

export const RoastItemSchema = z.object({
  category: z.string(),
  rating: z.number().min(0).max(10),
  feedback: z.string(),
  severity: z.enum(["low", "medium", "high"]),
});

export const InsightSchema = z.object({
  title: z.string(),
  description: z.string(),
  type: z.enum(["positive", "opportunity", "warning", "action"]),
});

export const ColorSchema = z.object({
  name: z.string(),
  hex: z.string(),
});

export const LogoSchema = z.object({
  id: z.string(),
  description: z.string(),
  style: z.string(),
  preview: z.string(),
  colors: z.array(z.string()),
});

const VerdictDimensionScoreSchema = z.object({
  score: z.number(),
  label: z.string(),
  description: z.string(),
});

const VerdictImprovementPathSchema = z.object({
  dimension: z.string(),
  action: z.string(),
  scoreGain: z.number(),
  risk: z.string().nullable(),
  scoreLoss: z.number().nullable(),
});

const VerdictBreakdownSchema = z.object({
  dataCompleteness: z.number(),
  stageMaturity: z.number(),
  dimensionAgreement: z.number(),
  industrySignal: z.number(),
});

const VerdictStrengthsWeaknessesSchema = z.object({
  dimension: z.string(),
  score: z.number(),
  explanation: z.string(),
});

const VerdictSchema = z.object({
  badge: z.enum(["pass", "conditional", "needs-work", "fail"]),
  badgeLabel: z.string(),
  compositeScore: z.number(),
  summary: z.string(),
  dimensions: z.object({
    market: VerdictDimensionScoreSchema,
    timing: VerdictDimensionScoreSchema,
    competition: VerdictDimensionScoreSchema,
    defensibility: VerdictDimensionScoreSchema,
    founderFit: VerdictDimensionScoreSchema,
    distribution: VerdictDimensionScoreSchema,
    revenue: VerdictDimensionScoreSchema,
  }),
  strengths: z.array(VerdictStrengthsWeaknessesSchema),
  weaknesses: z.array(VerdictStrengthsWeaknessesSchema),
  fatalRisks: z.array(z.string()),
  suggestedPivot: z.string().nullable(),
  confidence: z.number(),
  confidenceLabel: z.string(),
  confidenceBreakdown: VerdictBreakdownSchema,
  improvementPaths: z.array(VerdictImprovementPathSchema),
});

/* ─── StartupBlueprint Schema ─── */

export const StartupBlueprintSchema = z.object({
  startupName: z.string(),
  tagline: z.string(),
  problem: z.string(),
  solution: z.string(),
  companySnapshot: z.object({
    stage: z.string(),
    industry: z.string(),
    funding: z.string(),
    teamSize: z.number(),
    foundedDate: z.string(),
  }),
  stats: z.object({
    brandScore: z.number(),
    marketFit: z.string(),
    readiness: z.number(),
    growthScore: z.number(),
  }),
  insights: z.array(InsightSchema),
  website: z.object({
    url: z.string(),
    summary: z.string(),
    strengths: z.array(z.string()),
    improvements: z.array(z.string()),
    recommendations: z.array(z.string()),
  }),
  brand: z.object({
    mission: z.string(),
    values: z.array(z.string()),
    tone: z.array(z.string()),
    colors: z.array(ColorSchema),
    typography: z.object({ heading: z.string(), body: z.string() }),
  }),
  logos: z.array(LogoSchema),
  icp: z.object({
    title: z.string(),
    role: z.string(),
    companySize: z.string(),
    description: z.string(),
    painPoints: z.array(z.string()),
    goals: z.array(z.string()),
    objections: z.array(z.string()),
    recommendations: z.array(z.string()),
  }),
  revenue: z.object({
    model: z.string(),
    pricing: z.string(),
    justification: z.string(),
    projections: z.array(MonthProjectionSchema),
    funding: z.string(),
    analysis: z.string(),
  }),
  roadmap: z.array(RoadmapPhaseSchema),
  roast: z.object({
    score: z.number().min(0).max(10),
    verdict: z.string(),
    risks: z.array(z.string()),
    recommendations: z.array(z.string()),
    items: z.array(RoastItemSchema),
  }),
  verdict: VerdictSchema,
});

export type ValidatedStartupBlueprint = z.infer<typeof StartupBlueprintSchema>;

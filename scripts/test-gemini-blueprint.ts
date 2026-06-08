/**
 * Test script: Verifies Gemini can generate a full Startup Blueprint
 * that passes Zod validation.
 *
 * Usage: npx ts-node --compiler-options '{"module":"CommonJS"}' scripts/test-gemini-blueprint.ts
 *   OR: npx tsx scripts/test-gemini-blueprint.ts
 */
import { GoogleGenAI } from "@google/genai";
import { z } from "zod";

const apiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
if (!apiKey) {
  console.error("ERROR: NEXT_PUBLIC_GOOGLE_API_KEY is not set");
  process.exit(1);
}

/* ─── Zod Schemas (copied from gemini.ts) ─── */
const MonthProjectionSchema = z.object({
  month: z.string(),
  projected: z.number(),
  actual: z.number().nullable(),
});

const RoadmapItemSchema = z.object({
  title: z.string(),
  description: z.string(),
  status: z.enum(["done", "in-progress", "planned"]),
});

const RoadmapPhaseSchema = z.object({
  quarter: z.string(),
  items: z.array(RoadmapItemSchema),
});

const RoastItemSchema = z.object({
  category: z.string(),
  rating: z.number(),
  feedback: z.string(),
  severity: z.enum(["low", "medium", "high"]),
});

const InsightSchema = z.object({
  title: z.string(),
  description: z.string(),
  type: z.enum(["positive", "opportunity", "warning", "action"]),
});

const ColorSchema = z.object({
  name: z.string(),
  hex: z.string(),
});

const LogoSchema = z.object({
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

const StartupBlueprintSchema = z.object({
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
    score: z.number(),
    verdict: z.string(),
    risks: z.array(z.string()),
    recommendations: z.array(z.string()),
    items: z.array(RoastItemSchema),
  }),
  verdict: VerdictSchema,
});

/* ─── Prompt (copied from gemini.ts) ─── */

function buildPrompt(): string {
  return `You are a world-class startup strategy advisor and YC partner. 
Generate a comprehensive Startup Blueprint for a founder with the following details:

- Idea: "AI lawyer for startups"
- Stage: "ideation"
- Industry: "ai"
- Target Customer: "b2b-small"
- Business Model: "subscription"
- Price Range: "$50-200"
- Core Problem: "cost"

Your output must be a single JSON object. Do not include markdown formatting or backticks.

REQUIRED JSON STRUCTURE:
{
  "startupName": "Creative and memorable name",
  "tagline": "Compelling one-liner",
  "problem": "Clear problem statement",
  "solution": "Unique value proposition",
  "companySnapshot": {
    "stage": "current stage",
    "industry": "industry name",
    "funding": "current funding amount",
    "teamSize": number,
    "foundedDate": "date string"
  },
  "stats": {
    "brandScore": 1-100,
    "marketFit": "A-F grade",
    "readiness": 1-100,
    "growthScore": 1-100
  },
  "insights": [{"title": "string", "description": "string", "type": "positive|opportunity|warning|action"}],
  "website": {
    "url": "domain.io",
    "summary": "website analysis summary",
    "strengths": ["string"],
    "improvements": ["string"],
    "recommendations": ["string"]
  },
  "brand": {
    "mission": "one sentence mission",
    "values": ["string"],
    "tone": ["string"],
    "colors": [{"name": "string", "hex": "#hex"}],
    "typography": {"heading": "font-name", "body": "font-name"}
  },
  "logos": [{"id": "1", "description": "string", "style": "string", "preview": "text", "colors": ["#hex"]}],
  "icp": {
    "title": "string",
    "role": "string",
    "companySize": "string",
    "description": "detailed description",
    "painPoints": ["string"],
    "goals": ["string"],
    "objections": ["string"],
    "recommendations": ["string"]
  },
  "revenue": {
    "model": "string",
    "pricing": "string",
    "justification": "string",
    "projections": [{"month": "Jan", "projected": number, "actual": null}],
    "funding": "string",
    "analysis": "string"
  },
  "roadmap": [{"quarter": "Phase 1: Foundation", "items": [{"title": "string", "description": "string", "status": "done|in-progress|planned"}]}],
  "verdict": {
    "badge": "pass|conditional|needs-work|fail",
    "badgeLabel": "PASS",
    "compositeScore": 0-100,
    "summary": "One-line verdict summary",
    "dimensions": {
      "market": {"score": 0-100, "label": "string", "description": "string"},
      "timing": {"score": 0-100, "label": "string", "description": "string"},
      "competition": {"score": 0-100, "label": "string", "description": "string"},
      "defensibility": {"score": 0-100, "label": "string", "description": "string"},
      "founderFit": {"score": 0-100, "label": "string", "description": "string"},
      "distribution": {"score": 0-100, "label": "string", "description": "string"},
      "revenue": {"score": 0-100, "label": "string", "description": "string"}
    },
    "strengths": [{"dimension": "string", "score": 0-100, "explanation": "string"}],
    "weaknesses": [{"dimension": "string", "score": 0-100, "explanation": "string"}],
    "fatalRisks": ["string"],
    "suggestedPivot": "Pivot from B2C to B2B SaaS", // can be null if no pivot needed
    "confidence": 0-100,
    "confidenceLabel": "High|Moderate|Low",
    "confidenceBreakdown": {"dataCompleteness": 0-100, "stageMaturity": 0-100, "dimensionAgreement": 0-100, "industrySignal": 0-100},
    "improvementPaths": [{"dimension": "string", "action": "string", "scoreGain": number,      "risk": "Ignore SEO and content marketing", "scoreLoss": 7}]
  },
  "roast": {
    "score": 1-10,
    "verdict": "brutal verdict",
    "risks": ["string"],
    "recommendations": ["string"],
    "items": [{"category": "string", "rating": 1-10, "feedback": "harsh feedback", "severity": "low|medium|high"}]
  }
}

Be specific, insightful, and avoid generic "AI-generated" sounding text.`;
}

/* ─── Main ─── */

async function main() {
  console.log("[Test] Starting Gemini blueprint test with gemini-2.5-flash...\n");

  const genAI = new GoogleGenAI({ apiKey });

  try {
    const modelName = "gemini-2.5-flash";
    console.log(`[Test] Model: ${modelName}`);
    console.log("[Test] Sending prompt to Gemini...\n");

    const response = await genAI.models.generateContent({
      model: modelName,
      contents: buildPrompt(),
      config: {
        temperature: 0.7,
        maxOutputTokens: 8192,
      },
    });

    const text = response.text?.trim();
    if (!text) {
      console.error("[Test] FAIL: Empty response from AI");
      process.exit(1);
    }

    console.log("[Test] Response received! Length:", text.length, "chars\n");
    console.log("=== First 500 chars of raw response ===");
    console.log(text.substring(0, 500));
    console.log("...\n");

    // Clean JSON (strip markdown fences)
    const cleanJson = text.replace(/^```json\n?/, "").replace(/\n?```$/, "");
    console.log("[Test] Cleaned JSON length:", cleanJson.length, "chars\n");

    // Parse JSON
    let parsed: any;
    try {
      parsed = JSON.parse(cleanJson);
      console.log("[Test] ✅ JSON parsed successfully");
    } catch (e: any) {
      console.error("[Test] ❌ JSON Parse Error:", e.message);
      console.log("\n=== Last 500 chars ===");
      console.log(cleanJson.substring(Math.max(0, cleanJson.length - 500)));
      process.exit(1);
    }

    // Validate with Zod
    const result = StartupBlueprintSchema.safeParse(parsed);
    if (!result.success) {
      console.error("[Test] ❌ Zod Validation Failed:");
      console.error(JSON.stringify(result.error.format(), null, 2));
      process.exit(1);
    }

    console.log("[Test] ✅ Zod validation passed!\n");

    // Print blueprint summary
    const bp = result.data;
    console.log("=== BLUEPRINT SUMMARY ===");
    console.log("Startup Name:", bp.startupName);
    console.log("Tagline:", bp.tagline);
    console.log("Stage:", bp.companySnapshot.stage);
    console.log("Industry:", bp.companySnapshot.industry);
    console.log("Brand Score:", bp.stats.brandScore);
    console.log("Market Fit:", bp.stats.marketFit);
    console.log("Growth Score:", bp.stats.growthScore);
    console.log("Roast Score:", bp.roast.score);
    console.log("Roast Items:", bp.roast.items.length);
    console.log("Insights:", bp.insights.length);
    console.log("Roadmap Phases:", bp.roadmap.length);
    console.log("Logos:", bp.logos.length);
    console.log("");
    console.log("=== VERDICT ===");
    console.log("Badge:", bp.verdict.badge, "(" + bp.verdict.badgeLabel + ")");
    console.log("Composite Score:", bp.verdict.compositeScore);
    console.log("Confidence:", bp.verdict.confidence + "% (" + bp.verdict.confidenceLabel + ")");
    console.log("Dimensions:");
    for (const [key, dim] of Object.entries(bp.verdict.dimensions)) {
      console.log(`  ${key}: ${(dim as any).score}/100 — ${(dim as any).label}`);
    }
    console.log("Strengths:", bp.verdict.strengths.map(s => s.dimension + " (" + s.score + ")").join(", "));
    console.log("Weaknesses:", bp.verdict.weaknesses.map(w => w.dimension + " (" + w.score + ")").join(", "));
    console.log("Fatal Risks:", bp.verdict.fatalRisks.length);
    console.log("Suggested Pivot:", bp.verdict.suggestedPivot);
    console.log("Improvement Paths:", bp.verdict.improvementPaths.length);

    console.log("\n[Test] ✅ SUCCESS: Complete AI-generated blueprint produced and validated!");
    console.log("[Test] generationMode would be: ai");
  } catch (e: any) {
    console.error("[Test] ❌ Error:", e.message);
    console.error(e.stack?.substring(0, 500));
    process.exit(1);
  }
}

main().catch((e) => {
  console.error("Fatal:", e);
  process.exit(1);
});

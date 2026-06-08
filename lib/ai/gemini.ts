import { getGeminiClient } from "@/lib/ai/client";
import type { InterviewData } from "@/lib/types";
import { type StartupBlueprint, generateBlueprint } from "@/lib/startup/blueprint";
import { StartupBlueprintSchema } from "@/lib/ai/validation/schema";

/* ─── Prompt Builder ─── */

export function buildPrompt(data: InterviewData): string {
  return `You are a world-class startup strategy advisor and YC partner. 
Generate a comprehensive Startup Blueprint for a founder with the following details:

- Idea: "${data.idea}"
- Stage: "${data.stage}"
- Industry: "${data.industry}"
- Target Customer: "${data.targetCustomer}"
- Business Model: "${data.businessModel}"
- Price Range: "${data.priceRange || "TBD"}"
- Core Problem: "${data.problem}"

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

/* ─── Main Generation Function ─── */

/**
 * Generates an AI-powered Startup Blueprint using Gemini 2.5 Flash.
 * Includes Zod validation, automatic retry (with backoff), and deterministic fallback.
 */
export async function generateAIBlueprint(data: InterviewData): Promise<StartupBlueprint> {
  console.log("[AI Architect] Starting AI Blueprint Generation for:", data.idea);

  const genAI = getGeminiClient();

  const runGeneration = async (isRetry = false): Promise<StartupBlueprint> => {
    if (isRetry) console.log("[AI Architect] Retrying AI Generation...");

    try {
      const response = await genAI.models.generateContent({
        model: "gemini-2.5-flash",
        contents: buildPrompt(data),
        config: {
          temperature: 0.7,
          maxOutputTokens: 8192,
        },
      });

      const text = response.text?.trim();
      if (!text) throw new Error("Empty response from AI");

      // Clean response (strip markdown fences if AI ignores system instruction)
      const cleanJson = text.replace(/^```json\n?/, "").replace(/\n?```$/, "");

      let parsed: any;
      try {
        parsed = JSON.parse(cleanJson);
      } catch (parseError) {
        console.error("[AI Architect] JSON Parse Error:", parseError);
        throw new Error("Invalid JSON format from AI");
      }

      // Validate with Zod
      const result = StartupBlueprintSchema.safeParse(parsed);
      if (!result.success) {
        console.error("[AI Architect] Zod Validation Failed:", result.error.format());
        throw new Error("AI output failed validation schema");
      }

      console.log("[AI Architect] AI Generation Successful & Validated");
      return result.data as StartupBlueprint;

    } catch (error) {
      if (!isRetry) {
        // Wait before retry to handle rate limits (429 errors)
        await new Promise((resolve) => setTimeout(resolve, 3000));
        return await runGeneration(true);
      }
      throw error;
    }
  };

  try {
    return await runGeneration();
  } catch (finalError) {
    console.warn("[AI Architect] AI Generation failed twice. Triggering deterministic fallback.");
    console.error("[AI Architect] Final AI Error:", finalError);

    // DETERMINISTIC FALLBACK
    try {
      const fallbackBlueprint = generateBlueprint(data);
      console.log("[AI Architect] Fallback Blueprint Generated Successfully");
      return fallbackBlueprint;
    } catch (fallbackError) {
      console.error("[AI Architect] Critical Failure: Fallback engine failed too.", fallbackError);
      throw new Error("Both AI and Fallback generation engines failed.");
    }
  }
}

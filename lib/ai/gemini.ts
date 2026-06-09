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

═══════════════════════════════════════════════════════════════════
CRITICAL RULES — VIOLATION = AUTOMATIC FAILURE
═══════════════════════════════════════════════════════════════════

1. URL RULE: NEVER fabricate URLs. For the website.url field, ALWAYS use "yourstartup.example.com". Do NOT invent domain names like "startupname.io" or "startupname.ai". Use ONLY "yourstartup.example.com".

2. JARGON BLACKLIST — Using ANY of these words = REJECTION:
   leverage, disrupt, synergy, ecosystem, scalable, innovative,
   game-changing, revolutionary, cutting-edge, next-gen, seamless,
   end-to-end, world-class, best-in-class, empower, transform,
   streamline, unlock, next-generation, groundbreaking
   REPLACE WITH: Specific, concrete language. Say WHAT you do and FOR WHOM.

3. TAGLINE RULE: Maximum 8 words. NO "X for Y" patterns.
   GOOD: "Contracts that read themselves" / "Compliance without the chaos"
   BAD: "AI-powered contract review for SMBs" / "The future of fintech compliance"

4. COMPETITOR INTELLIGENCE: Include 3-5 REAL competitors with:
   - Real company names (not fabricated)
   - Their actual strengths
   - Their actual weaknesses  
   - Your positioning opportunity against them

5. BRUTAL HONESTY: The roast section must be genuinely brutal.
   - If the idea is weak, say "This idea is weak because..."
   - If the market is crowded, say "This market is overcrowded with X competitors"
   - If the founder will likely fail, say "You will likely fail unless..."
   - A "pass" verdict should be RARE (top 20% of ideas)

6. REVENUE REALITY: Projections MUST match stage:
   - Ideation: $0-$5K/mo (you have no revenue yet)
   - Pre-seed: $1K-$20K/mo (early traction)
   - Seed: $10K-$100K/mo (product-market fit)
   - Growth: $50K-$1M/mo (scaling)
   Do NOT project $50K/mo for an ideation-stage startup.

7. ROADMAP DELIVERABLES: Every roadmap item MUST include:
   - Specific action verb (Ship, Launch, Interview, Build, Test)
   - Measurable deliverable (e.g., "10 customer interviews" not "market research")
   - Success criteria (e.g., "achieve 3 paying customers" not "validate idea")
   BAD: "Market research and customer discovery"
   GOOD: "Complete 20 customer interviews, identify 3 paying design partners"

═══════════════════════════════════════════════════════════════════

Your output must be a single JSON object. Do not include markdown formatting or backticks.

REQUIRED JSON STRUCTURE:
{
  "startupName": "Creative and memorable name (max 3 words)",
  "tagline": "Compelling one-liner (MAX 8 words, no 'X for Y')",
  "problem": "Clear problem statement with specific pain points",
  "solution": "Unique value proposition — WHO you help and HOW",
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
    "url": "yourstartup.example.com",
    "summary": "website analysis summary",
    "strengths": ["string"],
    "improvements": ["string"],
    "recommendations": ["string"]
  },
  "brand": {
    "mission": "one sentence mission (no jargon)",
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
    "description": "detailed description with specific pain points",
    "painPoints": ["string"],
    "goals": ["string"],
    "objections": ["string"],
    "recommendations": ["string"]
  },
  "competitors": [
    {
      "name": "Real competitor name",
      "strength": "Their actual strength",
      "weakness": "Their actual weakness",
      "opportunity": "Your positioning opportunity"
    }
  ],
  "revenue": {
    "model": "string",
    "pricing": "string",
    "justification": "string",
    "projections": [{"month": "Jan", "projected": number, "actual": null}],
    "funding": "string",
    "analysis": "string"
  },
  "roadmap": [
    {
      "quarter": "Phase 1: Foundation",
      "items": [
        {
          "title": "Action + Deliverable",
          "description": "Specific action with measurable outcome and success criteria",
          "status": "done|in-progress|planned"
        }
      ]
    }
  ],
  "verdict": {
    "badge": "pass|conditional|needs-work|fail",
    "badgeLabel": "PASS/CONDITIONAL/NEEDS WORK/FAIL",
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
    "suggestedPivot": "Pivot from X to Y" or null,
    "confidence": 0-100,
    "confidenceLabel": "High|Moderate|Low",
    "confidenceBreakdown": {"dataCompleteness": 0-100, "stageMaturity": 0-100, "dimensionAgreement": 0-100, "industrySignal": 0-100},
    "improvementPaths": [{"dimension": "string", "action": "string", "scoreGain": number, "risk": "string", "scoreLoss": number}]
  },
  "roast": {
    "score": 1-10 (10 = most brutal),
    "verdict": "Brutally honest assessment",
    "risks": ["string"],
    "recommendations": ["string"],
    "items": [{"category": "string", "rating": 1-10, "feedback": "harsh but constructive feedback", "severity": "low|medium|high"}]
  }
}

Remember: Be specific, insightful, and BRUTALLY honest. Avoid ALL jargon from the banned list. Use real competitor names, real market data, and concrete deliverables.`;
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

      let parsed: Record<string, unknown>;
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

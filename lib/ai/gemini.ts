import type { InterviewData } from "@/lib/types";

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

1. URL RULE: NEVER fabricate URLs. Use an empty string "" for the website.url field. Do NOT invent domain names like "startupname.io" or "startupname.ai". Do NOT use example.com. Use ONLY an empty string "".

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

OUTPUT RULES — VIOLATION = AUTOMATIC FAILURE
═══════════════════════════════════════════════════════════════════

Your output MUST be a single valid JSON object.
Do NOT use markdown formatting.
Do NOT use backticks or code fences.
Do NOT include any text before or after the JSON.
Do NOT include commentary, explanations, or notes.
Do NOT include trailing commas.
Output MUST parse with JSON.parse().

The very first character of your response must be { and the very last must be }.

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
    "url": "",
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

REMEMBER: Your response must be ONLY the JSON object. Start with { and end with }. No markdown. No backticks. No commentary. No trailing commas. Be specific, insightful, and BRUTALLY honest. Avoid ALL jargon from the banned list. Use real competitor names, real market data, and concrete deliverables.`;
}


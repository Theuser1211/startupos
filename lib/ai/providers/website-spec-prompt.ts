/**
 * WebsiteSpec Prompt — Generates a WebsiteSpec JSON from a StartupBlueprint.
 *
 * The AI ONLY produces structured JSON. No HTML. No markup. No backticks.
 * The React renderer converts this spec into a live website.
 */

import type { StartupBlueprint } from "@/lib/startup/blueprint";

export function buildWebsiteSpecPrompt(
  blueprint: StartupBlueprint,
): string {
  const brand = blueprint.brand;
  const primaryColor = brand.colors[0]?.hex || "#7C3AED";
  const secondaryColor = brand.colors[1]?.hex || "#6366F1";
  const accentColor = brand.colors[2]?.hex || "#0A0A0F";

  const industry = blueprint.companySnapshot.industry;
  const stage = blueprint.companySnapshot.stage;
  const tone = brand.tone.join(", ");

  return `You are a world-class website designer and copywriter. Generate a WebsiteSpec JSON document for a startup's landing page.

You receive a StartupBlueprint with all the startup's data. Your job is to produce ONLY a WebsiteSpec JSON that the React renderer will turn into a live website.

CRITICAL RULES — VIOLATION = AUTOMATIC FAILURE
═══════════════════════════════════════════════════════════════════

1. OUTPUT FORMAT: Your output MUST be ONLY a valid JSON object. No markdown. No backticks. No code fences. No text before or after. Start with { and end with }.

2. NO FABRICATED CONTENT: Every heading, body text, and item description must come from the StartupBlueprint data below. Do NOT invent testimonials, metrics, or features that aren't in the data.

3. NO PLACEHOLDERS: Do NOT use "example.com", "Lorem ipsum", "Coming Soon", or any placeholder text. If the data doesn't have content for a section, omit that section.

4. JARGON BAN: Do NOT use: leverage, disrupt, synergy, ecosystem, scalable, innovative, game-changing, revolutionary, cutting-edge, next-gen, seamless, end-to-end, world-class.

5. SECTIONS: Choose sections that MATCH the startup's industry and stage. A legal startup gets different sections than a climate startup. Use these section types:
   - hero: Main headline + tagline + CTAs + optional metrics
   - problem: The problem description with pain points
   - solution: How the startup solves it
   - values: Brand values as cards
   - pain-points: Specific pain points matched with goals
   - features: Key features with descriptions
   - social-proof: Verdict/roast items as trust signals
   - pricing: Pricing model description
   - faq: Common questions with answers
   - cta: Call to action
   - testimonials: Only if the blueprint has specific quotes
   - metrics: Stats from the blueprint

6. VARIANT SYSTEM: Each section has a variant (0, 1, or 2) that changes the visual layout:
   - variant 0: text-left layout
   - variant 1: text-right layout  
   - variant 2: centered layout with cards

7. VISUAL STYLE: Use the brand colors from the blueprint. Map the typography from the blueprint's heading and body fonts. Choose heroScale based on industry:
   - AI/DevTools/Gaming → "large"
   - FinTech/HealthTech/Climate → "balanced"
   - Services/EdTech → "compact"

STARTUP BLUEPRINT DATA:
══════════════════════════

Name: ${blueprint.startupName}
Tagline: ${blueprint.tagline}
Industry: ${industry}
Stage: ${stage}
Tone: ${tone}

Problem: ${blueprint.problem}
Solution: ${blueprint.solution}

Brand Mission: ${brand.mission}
Brand Values: ${brand.values.join(", ")}

Primary Color: ${primaryColor}
Secondary Color: ${secondaryColor}
Accent Color: ${accentColor}
Heading Font: ${brand.typography.heading}
Body Font: ${brand.typography.body}

ICP Title: ${blueprint.icp.title}
ICP Description: ${blueprint.icp.description}
Pain Points: ${blueprint.icp.painPoints.join(", ")}
Goals: ${blueprint.icp.goals.join(", ")}
Objections: ${blueprint.icp.objections.join(", ")}

Revenue Model: ${blueprint.revenue.model}
Revenue Pricing: ${blueprint.revenue.pricing}

Roast Verdict: ${blueprint.roast.verdict}
Roast Items: ${blueprint.roast.items.map(i => `${i.category}: ${i.feedback}`).join(" | ")}

Insights: ${blueprint.insights.map(i => `${i.title}: ${i.description}`).join(" | ")}

Verdict Label: ${blueprint.verdict.badgeLabel}
Verdict Score: ${blueprint.verdict.compositeScore}

Stats: Brand ${blueprint.stats.brandScore}%, Readiness ${blueprint.stats.readiness}%, Growth ${blueprint.stats.growthScore}%

═══ REQUIRED JSON STRUCTURE ═══

{
  "version": "1.0",
  "visualStyle": {
    "primary": "${primaryColor}",
    "secondary": "${secondaryColor}",
    "accent": "${accentColor}",
    "background": "#0a0a0f",
    "surface": "#121219",
    "radius": "12px",
    "fontHeading": "${brand.typography.heading}",
    "fontBody": "${brand.typography.body}",
    "heroScale": "balanced",
    "spacing": "100px"
  },
  "layoutType": "single-page",
  "sectionOrder": ["id1", "id2", ...],
  "sections": [
    {
      "id": "hero",
      "type": "hero",
      "variant": 0,
      "heading": "${blueprint.startupName}",
      "subheading": "${blueprint.tagline}",
      "body": "${blueprint.problem.substring(0, 150)}",
      "items": [
        { "title": "Title", "description": "Description", "meta": "value" }
      ],
      "style": {}
    }
  ],
  "copy": {
    "tagline": "${blueprint.tagline}",
    "ctaPrimary": "Get Started →",
    "ctaSecondary": "Learn More",
    "ctaSubtext": "Start free, upgrade when you need to. No credit card required.",
    "valueProps": [
      "First unique value proposition",
      "Second unique value proposition"
    ]
  }
}

REMEMBER: ONLY output the JSON. No markdown. No backticks. No commentary. Every section's copy must come from the blueprint data above.`;
}

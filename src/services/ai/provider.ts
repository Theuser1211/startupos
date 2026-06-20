import {
  AIProvider,
  BlueprintResult,
  WebsiteSpecResult,
  PageSpec,
  PageHTMLResult,
  ThemeSpec,
} from "../../types/ai.js";
import { env } from "../../lib/env.js";
import { logger } from "../../lib/logger.js";
import {
  BlueprintResultSchema,
  WebsiteSpecResultSchema,
  PageHTMLResultSchema,
  ValidatedBlueprint,
  ValidatedWebsiteSpec,
  ValidatedPageHTML,
  normalizeBlueprint,
} from "./validation.js";
import { ZodError } from "zod";

const TIMEOUT_MS = env.AI_TIMEOUT_MS;

export abstract class BaseAIProvider implements AIProvider {
  abstract name: string;

  abstract generateBlueprint(prompt: string): Promise<BlueprintResult>;
  abstract generateWebsiteSpec(blueprint: BlueprintResult): Promise<WebsiteSpecResult>;
  abstract generateWebsitePage(
    blueprint: BlueprintResult,
    spec: WebsiteSpecResult,
    page: PageSpec,
  ): Promise<PageHTMLResult>;

  protected async callAPI(
    endpoint: string,
    apiKey: string,
    model: string,
    messages: Array<{ role: string; content: string }>,
    maxTokens = 8192,
    temperature = 0.3,
  ): Promise<string> {
    const controller = new AbortController();
    const timeout = setTimeout(() => {
      controller.abort();
    }, TIMEOUT_MS);

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages,
          temperature,
          max_tokens: maxTokens,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        if (response.status === 429) {
          const retryAfter = response.headers.get("retry-after");
          const delay = retryAfter ? parseInt(retryAfter) * 1000 : 2000;
          await new Promise((resolve) => setTimeout(resolve, delay));
          throw new AIProviderError(this.name, 429, `Rate limited (retry after ${delay}ms)`);
        }
        const errorBody = await response.text();
        throw new AIProviderError(this.name, response.status, errorBody);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;
      if (!content) {
        throw new AIProviderError(this.name, 0, "Empty response from AI provider");
      }
      return content;
    } catch (error) {
      if (error instanceof AIProviderError) throw error;
      if (error instanceof Error && error.name === "AbortError") {
        throw new AIProviderError(this.name, 0, `Request timed out after ${TIMEOUT_MS}ms`);
      }
      throw new AIProviderError(this.name, 0, `Network error: ${error instanceof Error ? error.message : "Unknown"}`);
    } finally {
      clearTimeout(timeout);
    }
  }

  protected parseJSONResponse<T>(raw: string): T {
    const cleaned = raw
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .replace(/^```|```$/g, "")
      .trim();
    if (!cleaned) {
      throw new AIProviderError(this.name, 0, "Empty response after cleaning");
    }
    return JSON.parse(cleaned) as T;
  }

  protected validateBlueprint(raw: string): ValidatedBlueprint {
    logger.info({ rawLength: raw.length, rawPreview: raw.substring(0, 200) }, "Raw AI response for blueprint");
    const parsed = this.parseJSONResponse<Record<string, unknown>>(raw);
    logger.info({ parsedKeys: Object.keys(parsed) }, "Parsed blueprint object");
    const normalized = normalizeBlueprint(parsed);
    const validated = BlueprintResultSchema.parse(normalized);
    console.log("[BP-DATA] validated blueprint", JSON.stringify(validated, null, 2));
    logger.info({ validatedKeys: Object.keys(validated), validatedName: validated.name }, "Validated blueprint");
    return validated;
  }

  protected validateWebsiteSpec(raw: string): ValidatedWebsiteSpec {
    const parsed = this.parseJSONResponse<Record<string, unknown>>(raw);
    return WebsiteSpecResultSchema.parse(parsed);
  }

  protected validatePageHTML(raw: string): ValidatedPageHTML {
    const parsed = this.parseJSONResponse<Record<string, unknown>>(raw);
    return PageHTMLResultSchema.parse(parsed);
  }

  protected buildPageGenerationPrompt(
    blueprint: BlueprintResult,
    spec: WebsiteSpecResult,
    page: PageSpec,
  ): Array<{ role: string; content: string }> {
    const sectionTypes = page.sections.map((s) => s.type).join(", ");
    const systemPrompt = `You are an expert web designer and developer. Generate a premium, YC-grade startup landing page.

CRITICAL: Return ONLY JSON: { "slug": "...", "title": "...", "html": "<!DOCTYPE html>..." }. No markdown, no explanation.

DESIGN STANDARDS:
- Visual hierarchy: Large bold headings (2.5rem-4rem), clear subheadings (1.1rem-1.25rem), readable body (0.95rem-1rem)
- Typography: Inter font, headings 700-800 weight, -0.02em to -0.04em letter-spacing, body 400 weight, 1.6-1.7 line-height
- Generous whitespace: 96-128px section padding, 32-40px between cards
- Cards: Clean white backgrounds, subtle borders (#e5e7eb), 12-16px radius, soft shadows on hover, translateY(-4px) lift
- Buttons: 12-14px vertical padding, 24-32px horizontal, 8-12px radius, 600 weight, translateY hover lift
- Dark mode via prefers-color-scheme: dark with proper dark surface/text/border colors
- Animations: fadeIn + translateY(24px) on section entrance, stagger delays (0.1s-0.3s)
- Responsive: 1024px (tablet grid), 768px (single column), 480px (compact padding)
- Gradient text effects on hero headlines
- Background gradients: radial gradient glow behind hero, linear gradient for CTA sections

SECTION-SPECIFIC LAYOUTS:
hero - Full-width with 50/50 split (text left, visual right). Badge above headline. Large headline with gradient text. Two CTAs. Decorative card stack or gradient shapes on right side.
features - Section title + subtitle centered. 3-column grid of feature cards. Each card: colored icon circle, heading, description text. Hover: lift + shadow.
pricing - Centered heading. 3-column grid of pricing cards. Featured tier with "Most Popular" badge. Price + period, feature list with checkmarks, CTA button. Clean card design.
faq - Centered heading. Accordion list: click question to expand answer with smooth height transition, chevron rotation.
problem/solution - Split section (50/50). Problem: pain point list with red X icons. Solution: checkmark list with primary color icons. Alternating layout.
cta - Full-width gradient banner (primary->secondary). Large white heading, subtext, white button with primary text. Radial glow overlay.
social-proof - Heading centered. Row of styled placeholder badges/logos.

Theme:
- Primary: ${spec.theme.primaryColor} (CTAs, accents, buttons, link hover)
- Secondary: ${spec.theme.secondaryColor} (gradients, decorative elements)
- Font: ${spec.theme.fontFamily}, border-radius: ${spec.theme.borderRadius}

Startup: ${blueprint.name} (${blueprint.industry})
Description: ${blueprint.description}
Key features: ${blueprint.keyFeatures.join(", ")}
Solution: ${blueprint.solution}

Page: "${page.name}" (${page.slug}), sections: ${sectionTypes}
Section content: ${JSON.stringify(page.sections)}

RULES:
- ALL CSS in <style> tag. ALL JS in <script> at end of body.
- NO external deps except Google Fonts (Inter).
- NO markdown fences, NO explanation text.
- Real marketing copy from startup context above. NOT generic placeholder text.
- Full <!DOCTYPE html> with proper <head> (meta charset, viewport, og tags, twitter card).
- Responsive at 1024px, 768px, 480px.
- Hover effects, smooth transitions, scroll animations.
- Dark mode via prefers-color-scheme: dark.
- NEVER generate fake testimonials, team members, stats, addresses, phone numbers, or company claims.
- NEVER use "revolutionary", "game-changing", "best-in-class", "cutting-edge", "next-generation".`;

    return [
      { role: "system", content: systemPrompt },
      {
        role: "user",
        content: `Generate a premium ${page.name.toLowerCase()} page for ${blueprint.name}, a ${blueprint.industry} startup. Sections: ${sectionTypes}. Return ONLY the JSON.`,
      },
    ];
  }
}

export class AIProviderError extends Error {
  constructor(
    public provider: string,
    public statusCode: number,
    message: string,
  ) {
    super(`[${provider}] ${message}`);
    this.name = "AIProviderError";
  }
}

export class FreeLLMProvider extends BaseAIProvider {
  name = "FreeLLMAPI";

  private get endpoint(): string {
    return "https://api.free-llm-api.com/v1/chat/completions";
  }

  async generateBlueprint(prompt: string): Promise<BlueprintResult> {
    const systemPrompt = `You are a startup blueprint generator. Given a startup idea, generate a comprehensive blueprint.
Do NOT include any text, explanation, or markdown before or after the JSON. Return ONLY the raw JSON object — nothing else.
Return ONLY valid JSON with this exact structure:
{
  "name": "Startup name",
  "description": "Short description",
  "industry": "Industry",
  "targetAudience": "Target audience description",
  "problemStatement": "Problem being solved",
  "solution": "Solution description",
  "keyFeatures": ["feature1", "feature2"],
  "techStack": ["tech1", "tech2"],
  "monetization": "Monetization strategy",
  "competitorAnalysis": ["competitor1", "competitor2"],
  "roadmap": ["milestone1", "milestone2"]
}`;

    const raw = await this.callAPI(
      this.endpoint,
      env.FREELLM_API_KEY!,
      "gpt-4o-mini",
      [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt },
      ],
    );

    logger.info({ provider: this.name, rawLength: raw.length, rawPreview: raw.substring(0, 200) }, "Raw response from FreeLLM");
    const validated = this.validateBlueprint(raw) as unknown as BlueprintResult;
    console.log("[BP-DATA] FreeLLM validated keys", Object.keys(validated));
    console.log("[BP-DATA] FreeLLM validated", JSON.stringify(validated, null, 2));
    return validated;
  }

  async generateWebsiteSpec(blueprint: BlueprintResult): Promise<WebsiteSpecResult> {
    const industry = blueprint.industry || "technology";
    const systemPrompt = `You are a senior startup copywriter and website strategist. Given a startup blueprint, generate a premium SaaS website specification.

CRITICAL: Return ONLY valid JSON. No markdown, no explanation. No code fences.

CONSTRAINTS — NEVER fabricate:
- NO fake testimonials, team members, statistics, customer logos, reviews, or company claims
- NO fake addresses, phone numbers, email addresses, or social media handles
- NO fake legal information (privacy policy terms, etc.)
- Only include sections that can be populated truthfully from the blueprint data
- Skip testimonials, team, stats, logo-cloud sections entirely — they require fabricated data
- If you lack real data for a field, leave it empty or omit the section

REQUIRED PAGE: Home ("/") with these sections in this order:

1. hero — content includes:
   - headline: A specific, benefit-driven headline (e.g. "Ship API integrations 10x faster" not "Revolutionary Integration Platform")
   - subheadline: Clear value proposition expanding on the headline
   - ctaText: Action-oriented primary CTA (e.g. "Start Building Free")
   - ctaSecondary: Lower-friction secondary CTA (e.g. "See How It Works")

2. problem (or "pain") — content includes:
   - headline: Framing of the problem (e.g. "Building integrations is still painfully manual")
   - description: Specific pain description from the blueprint's problemStatement
   - painPoints: Array of 3-4 specific pain points derived from the blueprint

3. solution (or "benefits") — content includes:
   - headline: How the product solves the problem
   - description: Solution from blueprint.solution
   - benefits: Array of 3-4 specific benefits from the solution

4. features — content includes:
   - title: Section heading (e.g. "Everything you need to ship integrations")
   - subtitle: Optional supporting text
   - items: Array of feature objects, each with "title" and "description" (NOT plain strings). Derive from blueprint.keyFeatures. Make descriptions concrete and specific.

5. pricing — content includes:
   - headline: "Simple, transparent pricing" (or similar)
   - subtitle: Description of the real monetization model from blueprint.monetization
   - plans: Array of 2-3 plan objects with:
     - name: Plan name (e.g. "Starter", "Pro", "Enterprise")
     - price: Dollar amount string (e.g. "$29")
     - period: "month" (omit for enterprise)
     - description: One-line description
     - features: Array of 4-6 specific features
     - highlighted: true for the recommended tier (exactly 1 plan)

6. faq — content includes:
   - subtitle: Optional supporting text
   - items: Array of 3-5 objects with "question" and "answer". Write real questions a potential customer would ask about this specific product category. Not generic industry questions.

7. cta — content includes:
   - headline: A compelling final CTA headline referencing the company name
   - subheadline: Brief supporting message
   - ctaText: Final action button text (e.g. "Get Started Free")

OPTIONAL: social-proof — content includes:
   - headline: "Trusted by teams building ..."
   - items: Array of 3-5 placeholder company names (generic like "Company A", "Startup X") — these are clearly placeholders, not real logos

OPTIONAL: 1 additional page (About, How It Works, or Features deep-dive):
- Must derive ALL content from blueprint data
- Do not create pages with fabricated or empty content

COPYWRITING RULES:
- Headlines must be specific to what this startup does. Compare:
  BAD: "Revolutionary Platform for Modern Teams"
  GOOD: "Automate your customer data pipelines in minutes"
- Use concrete language from blueprint.keyFeatures and blueprint.solution
- Focus on customer outcomes, not product features
- Use the startup's target audience to inform tone and messaging
- Avoid: "revolutionary", "game-changing", "best-in-class", "cutting-edge", "next-generation", "industry-leading"
- Every word should pass the "so what?" test — does it tell the user why they should care?

COLOR GUIDANCE for ${industry}:

| Industry | Primary | Secondary | Why |
|---|---|---|---|
| Fintech/Finance | #0F766E | #14B8A6 | Trustworthy teal |
| Healthcare | #059669 | #10B981 | Calming green |
| DevTools/SaaS | #2563EB | #7C3AED | Bold blue-purple |
| AI/ML | #7C3AED | #2563EB | Creative purple-blue |
| E-commerce | #E11D48 | #BE185D | Energetic red |
| Education | #7C3AED | #8B5CF6 | Approachable purple |
| Security | #1E293B | #475569 | Strong dark |
| Enterprise | #4F46E5 | #6366F1 | Trustworthy indigo |
| Creative | #EC4899 | #F43F5E | Vibrant pink |
| Other | #2563EB | #7C3AED | Versatile blue |

Font: "Inter", borderRadius: "12px"

Return ONLY valid JSON with this exact structure:
{
  "pages": [
    {
      "name": "Home",
      "slug": "/",
      "sections": [
        { "type": "hero", "order": 1, "content": { "headline": "headline here", "subheadline": "subheadline here", "ctaText": "Primary CTA", "ctaSecondary": "Secondary CTA" } },
        { "type": "problem", "order": 2, "content": { "headline": "problem headline", "description": "problem description", "painPoints": ["pain 1", "pain 2", "pain 3"] } },
        { "type": "solution", "order": 3, "content": { "headline": "solution headline", "description": "solution description", "benefits": ["benefit 1", "benefit 2", "benefit 3"] } },
        { "type": "features", "order": 4, "content": { "title": "Features heading", "subtitle": "supporting text", "items": [{ "title": "Feature", "description": "Description" }] } },
        { "type": "pricing", "order": 5, "content": { "headline": "Pricing heading", "subtitle": "monetization description", "plans": [{ "name": "Starter", "price": "$0", "period": "month", "description": "desc", "features": ["f1", "f2"], "highlighted": false }] } },
        { "type": "faq", "order": 6, "content": { "subtitle": "", "items": [{ "question": "Q?", "answer": "A!" }] } },
        { "type": "cta", "order": 7, "content": { "headline": "CTA headline", "subheadline": "CTA subheadline", "ctaText": "Get Started" } }
      ]
    }
  ],
  "theme": {
    "primaryColor": "#2563EB",
    "secondaryColor": "#7C3AED",
    "fontFamily": "Inter",
    "borderRadius": "12px"
  },
  "components": [
    { "name": "Navbar", "type": "navigation", "props": {} },
    { "name": "Footer", "type": "footer", "props": {} }
  ]
}

REMEMBER: Use the ACTUAL blueprint data. Never fabricate testimonials, team members, statistics, or company claims. Write specific, customer-focused copy.`;

    const raw = await this.callAPI(
      this.endpoint,
      env.FREELLM_API_KEY!,
      "gpt-4o-mini",
      [
        { role: "system", content: systemPrompt },
        { role: "user", content: JSON.stringify(blueprint) },
      ],
    );

    return this.validateWebsiteSpec(raw) as unknown as WebsiteSpecResult;
  }

  async generateWebsitePage(
    blueprint: BlueprintResult,
    spec: WebsiteSpecResult,
    page: PageSpec,
  ): Promise<PageHTMLResult> {
    const messages = this.buildPageGenerationPrompt(blueprint, spec, page);
    const raw = await this.callAPI(
      this.endpoint,
      env.FREELLM_API_KEY!,
      "gpt-4o-mini",
      messages,
      8192,
    );

    return this.validatePageHTML(raw) as unknown as PageHTMLResult;
  }
}

export class GroqProvider extends BaseAIProvider {
  name = "Groq";

  private get endpoint(): string {
    return "https://api.groq.com/openai/v1/chat/completions";
  }

  async generateBlueprint(prompt: string): Promise<BlueprintResult> {
    const systemPrompt = `You are a startup blueprint generator. Given a startup idea, generate a comprehensive blueprint.
Do NOT include any text, explanation, or markdown before or after the JSON. Return ONLY the raw JSON object — nothing else.
Return ONLY valid JSON with this exact structure:
{
  "name": "...",
  "description": "...",
  "industry": "...",
  "targetAudience": "...",
  "problemStatement": "...",
  "solution": "...",
  "keyFeatures": [...],
  "techStack": [...],
  "monetization": "...",
  "competitorAnalysis": [...],
  "roadmap": [...]
}`;

    const raw = await this.callAPI(
      this.endpoint,
      env.GROQ_API_KEY!,
      "llama-3.3-70b-versatile",
      [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt },
      ],
    );

    logger.info({ provider: this.name, rawLength: raw.length, rawPreview: raw.substring(0, 200) }, "Raw response from Groq");
    const validated = this.validateBlueprint(raw) as unknown as BlueprintResult;
    console.log("[BP-DATA] Groq validated keys", Object.keys(validated));
    console.log("[BP-DATA] Groq validated", JSON.stringify(validated, null, 2));
    return validated;
  }

  async generateWebsiteSpec(blueprint: BlueprintResult): Promise<WebsiteSpecResult> {
    const industry = blueprint.industry || "technology";
    const systemPrompt = `You are a senior startup copywriter and website strategist. Given a startup blueprint, generate a premium SaaS website specification.

CRITICAL: Return ONLY valid JSON. No markdown, no explanation. No code fences.

CONSTRAINTS — NEVER fabricate:
- NO fake testimonials, team members, statistics, customer logos, reviews, or company claims
- NO fake addresses, phone numbers, email addresses, or social media handles
- Skip testimonials, team, stats, logo-cloud sections entirely
- Only include sections truthfully derivable from the blueprint data

REQUIRED HOME PAGE sections in order:

1. hero — content: headline (benefit-driven, specific, e.g. "Ship API integrations 10x faster"), subheadline, ctaText, ctaSecondary

2. problem — content: headline, description (from problemStatement), painPoints: string[] (3-4 items)

3. solution — content: headline, description (from solution), benefits: string[] (3-4 items)

4. features — content: title, subtitle, items: Array of {title: string, description: string} (NOT plain strings). Derive from keyFeatures with concrete descriptions.

5. pricing — content: headline, subtitle (from monetization), plans: Array of {name, price, period, description, features: string[], highlighted: boolean}

6. faq — content: subtitle, items: Array of {question, answer} (3-5 items, real customer questions about this product category)

7. cta — content: headline (includes company name), subheadline, ctaText

OPTIONAL: social-proof — content: headline, items: string[] (generic placeholder company names)

COPYWRITING RULES:
- BAD: "Revolutionary Platform for Modern Teams"  GOOD: "Automate your customer data pipelines in minutes"
- Use concrete language from blueprint.keyFeatures and blueprint.solution
- Focus on customer outcomes. Avoid: "revolutionary", "game-changing", "best-in-class", "cutting-edge"
- Every word should pass the "so what?" test

COLORS: Use industry-appropriate colors. Font: "Inter", borderRadius: "12px"
- ${industry}: Primary #2563EB, Secondary #7C3AED (or industry-specific alternatives)

Return ONLY valid JSON with the exact structure shown. Use the ACTUAL blueprint data.`;

    const raw = await this.callAPI(
      this.endpoint,
      env.GROQ_API_KEY!,
      "llama-3.3-70b-versatile",
      [
        { role: "system", content: systemPrompt },
        { role: "user", content: JSON.stringify(blueprint) },
      ],
    );

    return this.validateWebsiteSpec(raw) as unknown as WebsiteSpecResult;
  }

  async generateWebsitePage(
    blueprint: BlueprintResult,
    spec: WebsiteSpecResult,
    page: PageSpec,
  ): Promise<PageHTMLResult> {
    const messages = this.buildPageGenerationPrompt(blueprint, spec, page);
    const raw = await this.callAPI(
      this.endpoint,
      env.GROQ_API_KEY!,
      "llama-3.3-70b-versatile",
      messages,
      8192,
    );

    return this.validatePageHTML(raw) as unknown as PageHTMLResult;
  }
}

export class OpenRouterProvider extends BaseAIProvider {
  name = "OpenRouter";

  private get endpoint(): string {
    return "https://openrouter.ai/api/v1/chat/completions";
  }

  async generateBlueprint(prompt: string): Promise<BlueprintResult> {
    const raw = await this.callAPI(
      this.endpoint,
      env.OPENROUTER_API_KEY!,
      "openai/gpt-4o",
      [
        { role: "system", content: "You are a startup blueprint generator. Do NOT include any text before or after the JSON. Return ONLY the raw JSON object with fields: name, description, industry, targetAudience, problemStatement, solution, keyFeatures, techStack, monetization, competitorAnalysis, roadmap." },
        { role: "user", content: prompt },
      ],
    );

    logger.info({ provider: this.name, rawLength: raw.length, rawPreview: raw.substring(0, 200) }, "Raw response from OpenRouter");
    const validated = this.validateBlueprint(raw) as unknown as BlueprintResult;
    console.log("[BP-DATA] OpenRouter validated keys", Object.keys(validated));
    console.log("[BP-DATA] OpenRouter validated", JSON.stringify(validated, null, 2));
    return validated;
  }

  async generateWebsiteSpec(blueprint: BlueprintResult): Promise<WebsiteSpecResult> {
    const industry = blueprint.industry || "technology";
    const raw = await this.callAPI(
      this.endpoint,
      env.OPENROUTER_API_KEY!,
      "openai/gpt-4o",
      [
        { role: "system", content: `You are a senior startup copywriter and website strategist. Given a startup blueprint, generate a premium SaaS website specification. CRITICAL: Return ONLY valid JSON. NEVER fabricate testimonials, team members, stats, logos, addresses, phone numbers, or company claims. Only include sections truthfully derivable from the blueprint data.

REQUIRED Home page sections: hero (headline=benefit-driven specific headline, subheadline, ctaText, ctaSecondary), problem (headline, description, painPoints string[]), solution (headline, description, benefits string[]), features (title, subtitle, items=[{title, description}]), pricing (headline, subtitle, plans=[{name,price,period,description,features,highlighted}]), faq (subtitle, items=[{question,answer}]), cta (headline, subheadline, ctaText). Optional: social-proof (headline, items string[]).

COPYWRITING: Specific customer-focused copy. BAD: "Revolutionary platform" GOOD: "Automate X in minutes". Use blueprint data. Avoid revolutionary/game-changing/best-in-class. Font: Inter, borderRadius: 12px. Industry: ${industry}. Return ONLY valid JSON with pages array, theme (primaryColor, secondaryColor), and components array.` },
        { role: "user", content: JSON.stringify(blueprint) },
      ],
    );

    return this.validateWebsiteSpec(raw) as unknown as WebsiteSpecResult;
  }

  async generateWebsitePage(
    blueprint: BlueprintResult,
    spec: WebsiteSpecResult,
    page: PageSpec,
  ): Promise<PageHTMLResult> {
    const messages = this.buildPageGenerationPrompt(blueprint, spec, page);
    const raw = await this.callAPI(
      this.endpoint,
      env.OPENROUTER_API_KEY!,
      "openai/gpt-4o",
      messages,
      8192,
    );

    return this.validatePageHTML(raw) as unknown as PageHTMLResult;
  }
}

function getAvailableProviders(): Array<{ name: string; create: () => AIProvider }> {
  const providers: Array<{ name: string; create: () => AIProvider }> = [];

  if (env.FREELLM_API_KEY) {
    providers.push({ name: "FreeLLMAPI", create: () => new FreeLLMProvider() });
  }
  if (env.GROQ_API_KEY) {
    providers.push({ name: "Groq", create: () => new GroqProvider() });
  }
  if (env.OPENROUTER_API_KEY) {
    providers.push({ name: "OpenRouter", create: () => new OpenRouterProvider() });
  }

  return providers;
}

async function tryProvider<T>(
  provider: AIProvider,
  action: (p: AIProvider) => Promise<T>,
): Promise<{ result: T; providerName: string }> {
  const start = Date.now();
  logger.info({ provider: provider.name }, "Attempting AI provider");
  try {
    const result = await action(provider);
    const duration = Date.now() - start;
    logger.info({ provider: provider.name, durationMs: duration }, "AI provider succeeded");
    return { result, providerName: provider.name };
  } catch (error) {
    const duration = Date.now() - start;
    logger.warn({ provider: provider.name, durationMs: duration, error }, "AI provider failed");
    throw error;
  }
}

export function getAIProvider(): AIProvider {
  const available = getAvailableProviders();
  if (available.length === 0) {
    throw new Error("No AI provider configured. Set FREELLM_API_KEY, GROQ_API_KEY, or OPENROUTER_API_KEY.");
  }
  return available[0].create();
}

export async function generateBlueprintWithFallback(prompt: string): Promise<BlueprintResult> {
  const providers = getAvailableProviders();
  if (providers.length === 0) {
    throw new Error("No AI provider configured.");
  }

  const errors: Array<{ provider: string; error: string }> = [];

  for (const entry of providers) {
    const provider = entry.create();
    try {
      const { result } = await tryProvider(provider, (p) => p.generateBlueprint(prompt));
      return result;
    } catch (error) {
      const message =
        error instanceof AIProviderError
          ? `[${error.provider}] status=${error.statusCode} ${error.message}`
          : error instanceof ZodError
            ? `Validation failed: ${error.message}`
            : error instanceof Error
              ? error.message
              : "Unknown error";
      errors.push({ provider: entry.name, error: message });
    }
  }

  const detail = errors.map((e) => `${e.provider}: ${e.error}`).join(" | ");
  throw new Error(`All AI providers failed: ${detail}`);
}

export async function generateWebsiteSpecWithFallback(
  blueprint: BlueprintResult,
): Promise<WebsiteSpecResult> {
  const providers = getAvailableProviders();
  if (providers.length === 0) {
    throw new Error("No AI provider configured.");
  }

  const errors: Array<{ provider: string; error: string }> = [];

  for (const entry of providers) {
    const provider = entry.create();
    try {
      const { result } = await tryProvider(provider, (p) => p.generateWebsiteSpec(blueprint));
      return result;
    } catch (error) {
      const message =
        error instanceof AIProviderError
          ? `[${error.provider}] status=${error.statusCode} ${error.message}`
          : error instanceof ZodError
            ? `Validation failed: ${error.message}`
            : error instanceof Error
              ? error.message
              : "Unknown error";
      errors.push({ provider: entry.name, error: message });
    }
  }

  const detail = errors.map((e) => `${e.provider}: ${e.error}`).join(" | ");
  throw new Error(`All AI providers failed: ${detail}`);
}

export async function generateWebsitePageWithFallback(
  blueprint: BlueprintResult,
  spec: WebsiteSpecResult,
  page: PageSpec,
): Promise<PageHTMLResult> {
  const providers = getAvailableProviders();
  if (providers.length === 0) {
    throw new Error("No AI provider configured.");
  }

  const errors: Array<{ provider: string; error: string }> = [];

  for (const entry of providers) {
    const provider = entry.create();
    try {
      const { result } = await tryProvider(provider, (p) =>
        p.generateWebsitePage(blueprint, spec, page),
      );
      return result;
    } catch (error) {
      const message =
        error instanceof AIProviderError
          ? `[${error.provider}] status=${error.statusCode} ${error.message}`
          : error instanceof ZodError
            ? `Validation failed: ${error.message}`
            : error instanceof Error
              ? error.message
              : "Unknown error";
      errors.push({ provider: entry.name, error: message });
    }
  }

  const detail = errors.map((e) => `${e.provider}: ${e.error}`).join(" | ");
  throw new Error(`All AI providers failed for page "${page.name}": ${detail}`);
}

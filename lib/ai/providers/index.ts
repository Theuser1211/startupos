import type { InterviewData } from "@/lib/types";
import type { StartupBlueprint } from "@/lib/startup/blueprint";
import { StartupBlueprintSchema } from "@/lib/ai/validation/schema";
import { buildPrompt } from "@/lib/ai/gemini";
import { callGroq } from "@/lib/ai/providers/groq";
import { callDeepSeek } from "@/lib/ai/providers/deepseek";
import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";

/* ─── Logging ─── */

const LOGS_DIR = join(process.cwd(), "logs");

function ensureLogsDir() {
  try {
    mkdirSync(LOGS_DIR, { recursive: true });
  } catch {
    // Directory already exists
  }
}

function saveResponse(filename: string, content: string) {
  try {
    ensureLogsDir();
    writeFileSync(join(LOGS_DIR, filename), content, "utf-8");
  } catch (err) {
    console.warn(`[AI] Failed to save log file ${filename}:`, err);
  }
}

/* ─── Types ─── */

export type ProviderName = "groq" | "deepseek";

/** Shared result type returned by all AI providers */
export interface ProviderResult {
  content: string;
  model: string;
  durationMs: number;
  outputTokens: number;
  inputTokens: number;
}

export interface GenerationReport {
  provider: ProviderName;
  model: string;
  durationMs: number;
  outputTokens: number;
  inputTokens: number;
}

export interface BlueprintGenerationResult {
  blueprint: StartupBlueprint;
  report: GenerationReport;
  error: string | null;
}

/* ─── JSON Repair ─── */

/**
 * Attempts to repair common JSON issues from LLM responses.
 * Returns repaired string or null if unrepairable.
 */
function repairJson(raw: string): string | null {
  let repaired = raw;

  // 1. Remove markdown fences (```json ... ``` or ``` ... ```)
  repaired = repaired.replace(/^```(?:json)?\s*\n?/i, "");
  repaired = repaired.replace(/\n?\s*```\s*$/i, "");

  // 2. Remove BOM and zero-width characters
  repaired = repaired.replace(/^\uFEFF/, "");
  repaired = repaired.replace(/[\u200B-\u200D\uFEFF]/g, "");

  // 3. Trim whitespace
  repaired = repaired.trim();

  // 4. Remove trailing commas before } or ]
  repaired = repaired.replace(/,\s*([}\]])/g, "$1");

  // 5. Remove comments (// ... or /* ... */)
  repaired = repaired.replace(/\/\/.*$/gm, "");
  repaired = repaired.replace(/\/\*[\s\S]*?\*\//g, "");

  // 6. Try to find JSON object boundaries (first { to last })
  const firstBrace = repaired.indexOf("{");
  const lastBrace = repaired.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    repaired = repaired.substring(firstBrace, lastBrace + 1);
  }

  // 7. Escape unescaped control characters in strings
  // This is tricky - only do basic escaping
  repaired = repaired.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, "");

  return repaired || null;
}

/**
 * Tries to parse JSON with multiple fallback strategies.
 */
function parseJsonWithRepair(content: string): { parsed: unknown; method: string } | null {
  // Strategy 1: Direct parse
  try {
    return { parsed: JSON.parse(content), method: "direct" };
  } catch {
    // Continue to repair
  }

  // Strategy 2: Strip markdown and parse
  const stripped = content
    .replace(/^```(?:json)?\s*\n?/i, "")
    .replace(/\n?\s*```\s*$/i, "")
    .trim();
  try {
    return { parsed: JSON.parse(stripped), method: "strip-markdown" };
  } catch {
    // Continue to repair
  }

  // Strategy 3: Full repair
  const repaired = repairJson(content);
  if (repaired) {
    try {
      return { parsed: JSON.parse(repaired), method: "repair" };
    } catch {
      // Continue
    }
  }

  // Strategy 4: Find JSON boundaries more aggressively
  const firstBrace = content.indexOf("{");
  const lastBrace = content.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    const extracted = content.substring(firstBrace, lastBrace + 1);
    const repairedExtracted = repairJson(extracted);
    if (repairedExtracted) {
      try {
        return { parsed: JSON.parse(repairedExtracted), method: "boundary-extract" };
      } catch {
        // Continue
      }
    }
  }

  return null;
}

const BANNED_PHRASES = [
  "leverage", "disrupt", "synergy", "ecosystem", "scalable",
  "innovative", "game-changing", "revolutionary", "cutting-edge",
  "next-gen", "seamless", "end-to-end", "world-class", "best-in-class",
  "empower", "transform", "streamline", "unlock", "next-generation",
  "groundbreaking",
];

function containsJargon(text: string): string[] {
  const lower = text.toLowerCase();
  return BANNED_PHRASES.filter(phrase => lower.includes(phrase));
}

function hasFabricatedUrl(blueprint: StartupBlueprint): boolean {
  const url = blueprint.website.url;
  // Empty string = no website yet (valid). Allow example.com for placeholder.
  if (!url) return false;
  // Check if URL looks like a real domain (not example.com and not empty)
  return !url.includes("example.com");
}

function validateBlueprintQuality(blueprint: StartupBlueprint): { valid: boolean; issues: string[] } {
  const issues: string[] = [];

  const textFields = [
    blueprint.tagline,
    blueprint.problem,
    blueprint.solution,
    blueprint.brand.mission,
    blueprint.verdict.summary,
    ...blueprint.roast.items.map(i => i.feedback),
  ].join(" ");

  const jargonFound = containsJargon(textFields);
  if (jargonFound.length > 0) {
    issues.push(`Jargon detected: ${jargonFound.join(", ")}`);
  }

  if (hasFabricatedUrl(blueprint)) {
    issues.push(`Fabricated URL: ${blueprint.website.url}`);
  }

  if (blueprint.tagline.split(" ").length > 8) {
    issues.push(`Tagline too long: ${blueprint.tagline.split(" ").length} words (max 8)`);
  }

  const maxProjection = Math.max(...blueprint.revenue.projections.map(p => p.projected));
  if (blueprint.companySnapshot.stage === "Ideation" && maxProjection > 5000) {
    issues.push(`Unrealistic revenue for ideation: $${maxProjection.toLocaleString()}/mo (max $5K)`);
  }
  if (blueprint.companySnapshot.stage === "Pre-Seed" && maxProjection > 20000) {
    issues.push(`Unrealistic revenue for pre-seed: $${maxProjection.toLocaleString()}/mo (max $20K)`);
  }
  if (blueprint.companySnapshot.stage === "Seed" && maxProjection > 100000) {
    issues.push(`Unrealistic revenue for seed: $${maxProjection.toLocaleString()}/mo (max $100K)`);
  }

  return { valid: issues.length === 0, issues };
}

/* ─── AI Generation ─── */

/**
 * Attempts to generate a blueprint using a given provider.
 * Strips markdown fences, parses JSON, validates with Zod, and checks quality.
 */
async function tryProvider(
  name: ProviderName,
  providerFn: (prompt: string) => Promise<ProviderResult | null>,
  prompt: string,
): Promise<BlueprintGenerationResult | null> {
  console.log(`[AI] Trying provider: ${name}`);

  const result = await providerFn(prompt);

  if (!result) {
    console.warn(`[AI] Provider ${name} returned no result`);
    return null;
  }

  const { content, model, durationMs, outputTokens, inputTokens } = result;

  // Save raw response for debugging
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  saveResponse(`${name}-raw-${timestamp}.txt`, content);

  // Parse JSON with repair strategies
  const parseResult = parseJsonWithRepair(content);

  if (!parseResult) {
    // All parse attempts failed - save invalid response
    console.error(`[AI] JSON parse failed for ${name} (${model}) after all repair attempts`);
    saveResponse(`${name}-invalid-${timestamp}.txt`, 
      `=== RAW RESPONSE ===\n${content}\n\n=== ERROR ===\nAll JSON repair strategies failed`);
    return null;
  }

  const { parsed, method } = parseResult;
  if (method !== "direct") {
    console.log(`[AI] JSON repaired via ${method} for ${name} (${model})`);
  }

  // Save cleaned response for debugging
  saveResponse(`${name}-cleaned-${timestamp}.txt`, JSON.stringify(parsed, null, 2));

  // Validate with Zod against the blueprint schema
  const schemaResult = StartupBlueprintSchema.safeParse(parsed);
  if (!schemaResult.success) {
    console.warn(
      `[AI] Zod validation failed for ${name} (${model}):`,
      schemaResult.error.format(),
    );
    return null;
  }

  // Quality validation — check for jargon, URL hallucination, etc.
  const qualityCheck = validateBlueprintQuality(schemaResult.data as StartupBlueprint);
  if (!qualityCheck.valid) {
    console.warn(`[AI] Quality check failed for ${name} (${model}):`, qualityCheck.issues);
    return null;
  }

  const blueprint = schemaResult.data as StartupBlueprint;

  // Attach generation metadata to the blueprint
  blueprint.generationMetadata = {
    provider: name,
    model,
    generatedAt: new Date().toISOString(),
    generationTime: durationMs,
  };

  console.log(`[AI] Success: ${name} (${model}) — ${durationMs}ms, ${outputTokens} output tokens`);

  return {
    blueprint,
    report: {
      provider: name,
      model,
      durationMs,
      outputTokens,
      inputTokens,
    },
    error: null,
  };
}

/**
 * Generate a startup blueprint using AI providers.
 *
 * Flow:
 *   1. Try Groq
 *   2. If Groq fails → Try DeepSeek
 *   3. If DeepSeek fails → Throw error (no fallback)
 *
 * No deterministic fallback. No silent template generation.
 * On failure, caller must display "AI generation failed. Please try again."
 */
export async function generateBlueprintAI(
  data: InterviewData,
): Promise<BlueprintGenerationResult> {
  console.log("[AI] Starting AI Blueprint Generation for:", data.idea);

  const prompt = buildPrompt(data);

  // Try Groq first
  const groqResult = await tryProvider("groq", callGroq, prompt);
  if (groqResult) {
    return groqResult;
  }

  console.log("[AI] Groq failed. Falling through to DeepSeek.");

  // Try DeepSeek second
  const deepseekResult = await tryProvider("deepseek", callDeepSeek, prompt);
  if (deepseekResult) {
    return deepseekResult;
  }

  // Both providers failed — throw, no fallback
  console.error("[AI] All AI providers failed. No fallback available.");
  throw new Error("AI generation failed. Please try again.");
}

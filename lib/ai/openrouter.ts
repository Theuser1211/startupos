import type { InterviewData } from "@/lib/types";
import { type StartupBlueprint, generateBlueprint } from "@/lib/startup/blueprint";
import { StartupBlueprintSchema } from "@/lib/ai/validation/schema";
import { buildPrompt } from "@/lib/ai/gemini";

/* ─── Constants ─── */

const OPENROUTER_BASE = "https://openrouter.ai/api/v1/chat/completions";

const FALLBACK_MODELS = [
  "google/gemma-4-31b-it:free",
  "qwen/qwen3-next-80b-a3b-instruct:free",
  "deepseek/deepseek-chat:free",
  "moonshotai/kimi-k2.6:free",
  "openrouter/free",
] as const;

/* ─── Model Tester ─── */

/**
 * Attempts to generate a blueprint with a single OpenRouter model.
 * Returns the raw text content on success, or null on failure.
 */
async function tryModel(model: string, prompt: string): Promise<string | null> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    console.warn("[OpenRouter] OPENROUTER_API_KEY is not defined in environment");
    return null;
  }

  try {
    const response = await fetch(OPENROUTER_BASE, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer": "https://startupos.app",
        "X-Title": "StartupOS",
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 8192,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text().catch(() => "unknown error");
      console.warn(
        `[OpenRouter] Model ${model} returned ${response.status}: ${errorBody.substring(0, 200)}`,
      );
      return null;
    }

    const data = await response.json();
    const content: string | undefined = data.choices?.[0]?.message?.content?.trim();

    if (!content) {
      console.warn(`[OpenRouter] Model ${model} returned empty content`);
      return null;
    }

    return content;
  } catch (err) {
    console.warn(
      `[OpenRouter] Model ${model} threw:`,
      err instanceof Error ? err.message : "unknown error",
    );
    return null;
  }
}

/* ─── Main Generation Function ─── */

/**
 * Generates an AI-powered Startup Blueprint via OpenRouter.
 *
 * Fallback chain:
 *   1. deepseek/deepseek-v4-flash:free
 *   2. openai/gpt-oss-120b:free
 *   3. z-ai/glm-4.5-air:free
 *   4. openrouter/free
 *   5. Deterministic engine (last resort)
 *
 * Includes Zod validation and deterministic fallback.
 */
export async function generateOpenRouterBlueprint(
  data: InterviewData,
): Promise<StartupBlueprint> {
  console.log("[OpenRouter] Starting AI Blueprint Generation via OpenRouter for:", data.idea);

  const prompt = buildPrompt(data);

  for (const model of FALLBACK_MODELS) {
    console.log(`[OpenRouter] Trying model: ${model}`);

    const content = await tryModel(model, prompt);

    if (content === null) {
      console.warn(`[OpenRouter] Fallback Triggered: ${model} failed`);
      continue;
    }

    // Strip markdown fences if the model wraps JSON in backticks
    const cleanJson = content.replace(/^```json?\n?/, "").replace(/\n?```$/, "");

    let parsed: unknown;
    try {
      parsed = JSON.parse(cleanJson);
    } catch (parseError) {
      console.warn(`[OpenRouter] JSON parse error for ${model}:`, parseError);
      continue;
    }

    // Validate with Zod against the existing blueprint schema
    const result = StartupBlueprintSchema.safeParse(parsed);
    if (!result.success) {
      console.warn(
        `[OpenRouter] Zod validation failed for ${model}:`,
        result.error.format(),
      );
      continue;
    }

    console.log(`[OpenRouter] Success: Model ${model} generated valid blueprint`);
    return result.data as StartupBlueprint;
  }

  // ── All AI models exhausted → deterministic fallback ──
  console.warn("[OpenRouter] All AI models failed. Falling back to deterministic engine.");
  try {
    const fallbackBlueprint = generateBlueprint(data);
    console.log("[OpenRouter] Fallback Blueprint Generated Successfully");
    return fallbackBlueprint;
  } catch (fallbackError) {
    console.error(
      "[OpenRouter] Critical Failure: Fallback engine failed too.",
      fallbackError,
    );
    throw new Error("Both AI and fallback generation engines failed.");
  }
}

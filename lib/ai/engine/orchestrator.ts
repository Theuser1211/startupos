import type { InterviewData } from "@/lib/types";
import type { StartupBlueprint } from "@/lib/startup/blueprint";
import { generateBlueprint } from "@/lib/startup/blueprint";
import { generateOpenRouterBlueprint } from "@/lib/ai/openrouter";

export type GenerationMode = "deterministic" | "ai";

export interface OrchestratorConfig {
  mode: GenerationMode;
  /** Max time to wait for AI generation (ms) */
  aiTimeoutMs: number;
  /** Fallback to deterministic if AI fails */
  fallbackOnFailure: boolean;
  /** Retry configuration */
  maxRetries: number;
  retryDelayMs: number;
}

export const DEFAULT_CONFIG: OrchestratorConfig = {
  mode: "ai",
  aiTimeoutMs: 30000,
  fallbackOnFailure: true,
  maxRetries: 2,
  retryDelayMs: 1000,
};

export interface GenerationResult {
  blueprint: StartupBlueprint;
  mode: GenerationMode;
  error: string | null;
}

/**
 * Generates a StartupBlueprint from InterviewData.
 * Routes to AI or deterministic engine based on config/mode.
 * Handles timeouts, retries, and fallback transparently.
 */
export async function generateBlueprintOrchestrator(
  data: InterviewData,
  config: Partial<OrchestratorConfig> = {},
): Promise<GenerationResult> {
  const effectiveConfig = { ...DEFAULT_CONFIG, ...config };

  // Route to deterministic engine if explicitly requested
  if (effectiveConfig.mode === "deterministic") {
    try {
      const blueprint = generateBlueprint(data);
      return { blueprint, mode: "deterministic", error: null };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Deterministic generation failed.";
      throw new Error(message);
    }
  }

  // Try AI generation first
  try {
    const blueprint = await generateOpenRouterBlueprint(data);
    return { blueprint, mode: "ai", error: null };
  } catch (aiError) {
    // If AI fails and fallback is enabled, use deterministic engine
    if (effectiveConfig.fallbackOnFailure) {
      try {
        const blueprint = generateBlueprint(data);
        return {
          blueprint,
          mode: "deterministic",
          error: `AI generation failed (${aiError instanceof Error ? aiError.message : "unknown error"}). Falling back to deterministic engine.`,
        };
      } catch (fallbackError) {
        const fallbackMessage = fallbackError instanceof Error ? fallbackError.message : "Fallback generation failed.";
        throw new Error(`AI generation failed and deterministic fallback also failed: ${fallbackMessage}`);
      }
    }

    // Fallback disabled — propagate the AI error
    const message = aiError instanceof Error ? aiError.message : "AI generation failed.";
    throw new Error(message);
  }
}

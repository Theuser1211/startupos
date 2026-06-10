import type { InterviewData } from "@/lib/types";
import { generateBlueprintAI, type BlueprintGenerationResult, type ProviderName } from "@/lib/ai/providers";

export type GenerationMode = ProviderName;

export interface GenerationResult {
  blueprint: BlueprintGenerationResult["blueprint"];
  mode: GenerationMode;
  report: BlueprintGenerationResult["report"];
  error: string | null;
}

/**
 * Generates a StartupBlueprint from InterviewData using AI providers.
 *
 * Flow:
 *   1. Groq
 *   2. DeepSeek
 *   3. Failure (no deterministic fallback)
 *
 * On failure, the caller must display:
 *   "AI generation failed. Please try again."
 */
export async function generateBlueprintOrchestrator(
  data: InterviewData,
): Promise<GenerationResult> {
  const result = await generateBlueprintAI(data);

  return {
    blueprint: result.blueprint,
    mode: result.report.provider,
    report: result.report,
    error: result.error,
  };
}

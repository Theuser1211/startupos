import { NextRequest, NextResponse } from "next/server";
import { generateBlueprintOrchestrator } from "@/lib/ai/engine/orchestrator";
import type { BlueprintGenerationResult } from "@/lib/ai/providers";
import type { InterviewData } from "@/lib/types";
import { createClient } from "@/lib/supabase/server";
import { apiLimiter } from "@/lib/security/rate-limit";

export type GenerationMode = "groq" | "deepseek";

export interface GenerateAPIResponse {
  blueprint: BlueprintGenerationResult["blueprint"];
  mode: GenerationMode;
  report: BlueprintGenerationResult["report"];
  error: string | null;
}

/**
 * POST /api/blueprints/generate
 *
 * Server-side blueprint generation endpoint.
 * Called from the client (blueprint-context.tsx) to generate a blueprint
 * using AI providers (Groq → DeepSeek).
 *
 * Only runs on the server, so it has access to:
 *  - process.env.GROQ_API_KEY
 *  - process.env.DEEPSEEK_API_KEY
 */
export async function POST(request: NextRequest) {
  // Auth check — generation costs money, must be authenticated
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Authentication required to generate blueprints" }, { status: 401 });
  }

  // Rate limiting by user ID
  const rateResult = apiLimiter.check(`generate:${user.id}`);
  if (rateResult.blocked) {
    return NextResponse.json(
      { error: "Too many requests. Please wait before generating another blueprint." },
      { status: 429, headers: { "Retry-After": "60", "X-RateLimit-Reset": String(rateResult.resetAt) } },
    );
  }

  try {
    const data: InterviewData = await request.json();

    // Validate required fields
    if (!data.idea || !data.stage || !data.industry) {
      return NextResponse.json(
        { error: "Missing required fields: idea, stage, industry" },
        { status: 400 },
      );
    }

    console.log("[Generate API] Starting blueprint generation for:", data.idea);

    const result = await generateBlueprintOrchestrator(data);

    console.log(
      `[Generate API] Generation complete — provider: ${result.mode}`,
      `(${result.report.model}, ${result.report.durationMs}ms, ${result.report.outputTokens} tokens)`,
      result.error ? `, error: ${result.error}` : "",
    );

    const response: GenerateAPIResponse = {
      blueprint: result.blueprint,
      mode: result.mode,
      report: result.report,
      error: result.error,
    };

    return NextResponse.json(response);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Blueprint generation failed.";
    console.error("[Generate API] Fatal error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

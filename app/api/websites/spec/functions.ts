/**
 * Inngest Functions — WebsiteSpec Generation
 *
 * Runs AI-powered website spec generation as a background job.
 * Flow: Groq → DeepSeek failover → Validate → Store → Notify
 */

import { inngest } from "@/lib/inngest/client";
import { createServiceClient } from "@/lib/supabase/service";
import { buildWebsiteSpecPrompt } from "@/lib/ai/providers/website-spec-prompt";
import { validateWebsiteSpec } from "@/lib/startup/website-spec";
import { sendWebsiteCompleteEmail } from "@/lib/email/notification";
import { logger } from "@/lib/logging";

const log = logger("website-gen");

/* ─── Event Type ─── */

export type WebsiteSpecGenerateEvent = {
  name: "website-spec/generate";
  data: {
    jobId: string;
    userId: string;
    startupName: string;
    prompt: string;
    blueprintId?: string;
    startupId?: string;
  };
};

/* ─── JSON Parser (shared with route.ts) ─── */

function parseSpecJson(content: string): unknown | null {
  // Strategy 1: Direct parse
  try {
    return JSON.parse(content);
  } catch {
    // Continue
  }

  // Strategy 2: Strip markdown fences
  const stripped = content
    .replace(/^```(?:json)?\s*\n?/i, "")
    .replace(/\n?\s*```\s*$/i, "")
    .trim();
  try {
    return JSON.parse(stripped);
  } catch {
    // Continue
  }

  // Strategy 3: Find JSON object boundaries
  const firstBrace = content.indexOf("{");
  const lastBrace = content.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    const extracted = content.substring(firstBrace, lastBrace + 1);
    try {
      return JSON.parse(extracted);
    } catch {
      // Strategy 4: Remove trailing commas
      const cleaned = extracted.replace(/,\s*([}\]])/g, "$1");
      try {
        return JSON.parse(cleaned);
      } catch {
        // Continue
      }
    }
  }

  return null;
}

/* ─── Background Function ─── */

export const generateWebsiteSpecFn = inngest.createFunction(
  {
    id: "website-spec-generate",
    retries: 2, // Retry twice on failure (3 total attempts)
    concurrency: 5, // Max 5 concurrent AI generations
    triggers: { event: "website-spec/generate" },
  },
  async ({ event, step }) => {
    const { jobId, userId, startupName, prompt, blueprintId, startupId } =
      event.data as WebsiteSpecGenerateEvent["data"];

    const serviceClient = createServiceClient();

    // Step 1: Mark job as generating
    await step.run("mark-generating", async () => {
      log.info("Starting website spec generation", { jobId, startupName });
      await serviceClient
        .from("website_generation_jobs")
        .update({ status: "generating", started_at: new Date().toISOString() })
        .eq("id", jobId);
    });

    // Step 2: Run AI generation
    const result = await step.run("generate-with-ai", async () => {
      const startTime = Date.now();
      let aiSuccess = false;
      let specResult: unknown = null;
      let aiError: string | null = null;
      let aiProvider = "none";
      let aiModel = "none";
      let inputTokens = 0;
      let outputTokens = 0;

      try {
        // Try Groq first
        const { callGroq } = await import("@/lib/ai/providers/groq");
        const groqResult = await callGroq(prompt);

        if (groqResult) {
          aiProvider = "groq";
          aiModel = groqResult.model;
          inputTokens = groqResult.inputTokens;
          outputTokens = groqResult.outputTokens;

          const parsed = parseSpecJson(groqResult.content);
          if (parsed) {
            specResult = parsed;
            aiSuccess = true;
          }
        }

        // Try DeepSeek if Groq failed
        if (!aiSuccess) {
          const { callDeepSeek } = await import("@/lib/ai/providers/deepseek");
          const deepseekResult = await callDeepSeek(prompt);

          if (deepseekResult) {
            aiProvider = "deepseek";
            aiModel = deepseekResult.model;
            inputTokens = deepseekResult.inputTokens;
            outputTokens = deepseekResult.outputTokens;

            const parsed = parseSpecJson(deepseekResult.content);
            if (parsed) {
              specResult = parsed;
              aiSuccess = true;
            }
          }
        }

        if (!aiSuccess) {
          aiError = "AI providers failed to generate a valid website specification.";
        }
      } catch (err) {
        aiError = err instanceof Error ? err.message : "Unknown AI generation error";
        log.error("AI generation threw", { jobId }, err instanceof Error ? err : undefined);
      }

      const durationMs = Date.now() - startTime;

      // Validate against schema
      if (aiSuccess && specResult) {
        const validation = validateWebsiteSpec(specResult);
        if (!validation.success) {
          aiSuccess = false;
          aiError = `WebsiteSpec validation failed: ${validation.error}`;
          log.error("Validation failed", { jobId, error: validation.error });
        }
      }

      const finalStatus = aiSuccess ? "completed" : "failed";
      const updates: Record<string, unknown> = {
        status: finalStatus,
        provider: aiProvider,
        model: aiModel,
        prompt_tokens: inputTokens,
        output_tokens: outputTokens,
        duration_ms: durationMs,
        completed_at: new Date().toISOString(),
      };

      if (aiSuccess && specResult) {
        updates.website_spec = specResult;
      }

      if (aiError) {
        updates.error_message = aiError;
        log.warn("Generation failed", { jobId, error: aiError });
      }

      // Update job record
      await serviceClient
        .from("website_generation_jobs")
        .update(updates)
        .eq("id", jobId);

      log.info("Generation complete", {
        jobId,
        status: finalStatus,
        provider: aiProvider,
        durationMs,
        tokens: outputTokens,
      });

      return { success: aiSuccess, specResult, aiProvider, durationMs };
    });

    // Step 3: Send email notification (fire-and-forget if it fails)
    if (result.success && result.specResult) {
      await step.run("send-notification", async () => {
        try {
          const sections = Array.isArray(
            (result.specResult as Record<string, unknown>)?.sections,
          )
            ? ((result.specResult as Record<string, unknown>).sections as unknown[])
            : [];

          await sendWebsiteCompleteEmail({
            userId,
            jobId,
            startupName,
            sectionsCount: sections.length,
            generationTimeMs: result.durationMs,
          });

          log.info("Email notification sent", { jobId });
        } catch (emailErr) {
          // Email failure is non-critical — don't fail the job
          log.warn("Email notification failed (non-critical)", {
            jobId,
            error: emailErr instanceof Error ? emailErr.message : "Unknown",
          });
        }
      });
    }

    return { jobId, status: result.success ? "completed" : "failed" };
  },
);

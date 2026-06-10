/**
 * Inngest Functions — Logo Generation
 *
 * Runs deterministic SVG logo generation as a background job.
 * Flow: Generate 5 logos → Store in DB → Mark job complete
 */

import { inngest } from "@/lib/inngest/client";
import { createServiceClient } from "@/lib/supabase/service";
import { serializeLogos, type SerializedLogo } from "@/lib/startup/logo-generator";
import { logger } from "@/lib/logging";

const log = logger("logo-gen");

/* ─── Event Type ─── */

export type LogoGenerateEvent = {
  name: "logo/generate";
  data: {
    jobId: string;
    userId: string;
    startupName: string;
    industry: string;
    brandColors: { name: string; hex: string }[];
    tone?: string[];
    startupId?: string;
  };
};

/* ─── Background Function ─── */

export const generateLogoFn = inngest.createFunction(
  {
    id: "logo-generate",
    retries: 1, // One retry (2 total attempts)
    concurrency: 10, // Logo generation is fast (SVG templates), allow higher concurrency
    triggers: { event: "logo/generate" },
  },
  async ({ event, step }) => {
    const { jobId, userId, startupName, industry, brandColors, tone, startupId } =
      event.data as LogoGenerateEvent["data"];

    const serviceClient = createServiceClient();

    // Step 1: Mark job as generating
    await step.run("mark-generating", async () => {
      log.info("Starting logo generation", { jobId, startupName });
      await serviceClient
        .from("logo_generation_jobs")
        .update({ status: "generating", started_at: new Date().toISOString() })
        .eq("id", jobId);
    });

    // Step 2: Generate logos
    const result = await step.run("generate-logos", async () => {
      const startTime = Date.now();

      try {
        // Generate 5 SVG logo variants using the deterministic engine
        const logos = serializeLogos(startupName, industry || "saas", brandColors, tone);

        // Store each logo in the generated_logos table
        const storedLogos: (SerializedLogo & { id?: string })[] = [];

        for (const logo of logos) {
          const { data, error } = await serviceClient
            .from("generated_logos")
            .insert({
              user_id: userId,
              startup_id: startupId || null,
              prompt: logo.brandConcept,
              style: logo.style,
              image_url: logo.preview,
              thumbnail_url: logo.monochromePreview,
              metadata: {
                colors: logo.colors,
                qualityScore: logo.qualityScore,
                symbolReasoning: logo.symbolReasoning,
                fullPreview: logo.fullPreview,
                monochromePreview: logo.monochromePreview,
              },
            })
            .select()
            .single();

          if (error) {
            log.error("Failed to store logo variant", { jobId, logoId: logo.id, error: error.message });
            storedLogos.push(logo);
          } else {
            storedLogos.push({ ...logo, id: data.id });
          }
        }

        const durationMs = Date.now() - startTime;
        log.info("Logos generated", { jobId, count: storedLogos.length, durationMs });

        // Update job with results
        await serviceClient
          .from("logo_generation_jobs")
          .update({
            status: "completed",
            logos: storedLogos,
            completed_at: new Date().toISOString(),
          })
          .eq("id", jobId);

        return { success: true, logos: storedLogos, durationMs };
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Unknown logo generation error";
        log.error("Logo generation failed", { jobId, error: errorMsg }, err instanceof Error ? err : undefined);

        await serviceClient
          .from("logo_generation_jobs")
          .update({
            status: "failed",
            error_message: errorMsg,
            completed_at: new Date().toISOString(),
          })
          .eq("id", jobId);

        return { success: false, logos: null, durationMs: Date.now() - startTime };
      }
    });

    return { jobId, status: result.success ? "completed" : "failed" };
  },
);

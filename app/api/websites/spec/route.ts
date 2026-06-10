import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import type { StartupBlueprint } from "@/lib/startup/blueprint";
import { buildWebsiteSpecPrompt } from "@/lib/ai/providers/website-spec-prompt";
import { inngest } from "@/lib/inngest/client";
import { apiLimiter } from "@/lib/security/rate-limit";
import { logger } from "@/lib/logging";

const log = logger("website-spec-api");

/**
 * POST /api/websites/spec
 *
 * Enqueues a WebsiteSpec generation job via Inngest background queue.
 * The job runs asynchronously — the client polls GET /api/websites/spec/[jobId]
 * for completion status.
 *
 * Body: { blueprint: StartupBlueprint, startupId?: string, blueprintId?: string }
 * Response: { job: { id, status: "queued" } }
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Rate limiting — AI generation costs money
    const rateResult = apiLimiter.check(`website-spec:${user.id}`);
    if (rateResult.blocked) {
      return NextResponse.json(
        { error: "Too many generation requests. Please wait." },
        { status: 429 },
      );
    }

    const body = await request.json();
    const { blueprint, startupId, blueprintId } = body as {
      blueprint: StartupBlueprint;
      startupId?: string;
      blueprintId?: string;
    };

    if (!blueprint?.startupName) {
      return NextResponse.json(
        { error: "Valid blueprint with startupName is required" },
        { status: 400 },
      );
    }

    const serviceClient = createServiceClient();

    // Step 1: Pre-create the website record so we have an ID for deployment
    const { data: website, error: websiteError } = await serviceClient
      .from("generated_websites")
      .insert({
        user_id: user.id,
        startup_id: startupId || null,
        deployment_status: "pending",
        content: {},
        metadata: {
          startupName: blueprint.startupName,
          blueprintId: blueprintId || null,
        },
      })
      .select()
      .single();

    if (websiteError || !website) {
      log.error("Failed to create website record", { error: websiteError?.message || "Unknown" });
      return NextResponse.json(
        { error: "Failed to create website record" },
        { status: 500 },
      );
    }

    // Step 2: Create job record (queued), linked to the website
    const { data: job, error: insertError } = await serviceClient
      .from("website_generation_jobs")
      .insert({
        user_id: user.id,
        startup_id: startupId || null,
        blueprint_id: blueprintId || null,
        status: "queued",
        retry_count: 0,
      })
      .select()
      .single();

    if (insertError || !job) {
      log.error("Failed to create job record", { error: insertError?.message || "Unknown" });
      return NextResponse.json(
        { error: "Failed to create generation job" },
        { status: 500 },
      );
    }

    // Step 3: Enqueue the background job via Inngest
    const prompt = buildWebsiteSpecPrompt(blueprint);

    try {
      await inngest.send({
        name: "website-spec/generate",
        data: {
          jobId: job.id,
          websiteId: website.id,
          userId: user.id,
          startupName: blueprint.startupName,
          prompt,
          startupId: startupId || undefined,
          blueprintId: blueprintId || undefined,
        },
      });

      log.info("Job enqueued", { jobId: job.id, startupName: blueprint.startupName });
    } catch (enqueueErr) {
      // Inngest enqueue failed — mark job as failed
      const errorMsg = enqueueErr instanceof Error ? enqueueErr.message : "Failed to enqueue job";
      log.error("Failed to enqueue job", { jobId: job.id }, enqueueErr instanceof Error ? enqueueErr : undefined);

      await serviceClient
        .from("website_generation_jobs")
        .update({
          status: "failed",
          error_message: errorMsg,
          completed_at: new Date().toISOString(),
        })
        .eq("id", job.id);

      return NextResponse.json({
        job: {
          id: job.id,
          status: "failed",
          error_message: errorMsg,
        },
      });
    }

    // Step 4: Return the job ID and website ID — client polls for completion
    return NextResponse.json({
      job: {
        id: job.id,
        status: "queued",
      },
      website: {
        id: website.id,
      },
    });
  } catch (error) {
    log.error("Unexpected error", undefined, error instanceof Error ? error : undefined);
    return NextResponse.json(
      { error: "Failed to generate website specification" },
      { status: 500 },
    );
  }
}

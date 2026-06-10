import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { apiLimiter } from "@/lib/security/rate-limit";
import { inngest } from "@/lib/inngest/client";
import { logger } from "@/lib/logging";

const log = logger("logos-api");

/**
 * POST /api/logos
 *
 * Enqueues a logo generation job via Inngest background queue.
 * The SVG generation runs asynchronously — client polls GET /api/logos/jobs/[jobId]
 * for completion status.
 *
 * Body: { startupName, industry, brandColors, tone?, startupId? }
 * Response: { job: { id, status: "queued" } }
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Rate limiting by user
    const rateResult = apiLimiter.check(`logos:${user.id}`);
    if (rateResult.blocked) {
      return NextResponse.json(
        { error: "Too many logo generation requests. Please try again later." },
        { status: 429 },
      );
    }

    const body = await request.json();
    const { startupName, industry, brandColors, tone, startupId } = body as {
      startupName: string;
      industry: string;
      brandColors: { name: string; hex: string }[];
      tone?: string[];
      startupId?: string;
    };

    if (!startupName) {
      return NextResponse.json({ error: "startupName is required" }, { status: 400 });
    }

    const serviceClient = createServiceClient();

    // Step 1: Create job record (queued)
    const { data: job, error: insertError } = await serviceClient
      .from("logo_generation_jobs")
      .insert({
        user_id: user.id,
        startup_id: startupId || null,
        startup_name: startupName,
        industry: industry || "saas",
        brand_colors: brandColors || [
          { name: "Primary", hex: "#7C3AED" },
          { name: "Secondary", hex: "#6366F1" },
          { name: "Dark", hex: "#0A0A0F" },
          { name: "Light", hex: "#A1A1B5" },
        ],
        tone: tone || [],
        status: "queued",
        retry_count: 0,
      })
      .select()
      .single();

    if (insertError || !job) {
      log.error("Failed to create logo job", { error: insertError?.message || "Unknown" });
      return NextResponse.json(
        { error: "Failed to create logo generation job" },
        { status: 500 },
      );
    }

    // Step 2: Enqueue the background job via Inngest
    try {
      await inngest.send({
        name: "logo/generate",
        data: {
          jobId: job.id,
          userId: user.id,
          startupName,
          industry: industry || "saas",
          brandColors: brandColors || [
            { name: "Primary", hex: "#7C3AED" },
            { name: "Secondary", hex: "#6366F1" },
            { name: "Dark", hex: "#0A0A0F" },
            { name: "Light", hex: "#A1A1B5" },
          ],
          tone,
          startupId,
        },
      });

      log.info("Logo job enqueued", { jobId: job.id, startupName });
    } catch (enqueueErr) {
      const errorMsg = enqueueErr instanceof Error ? enqueueErr.message : "Failed to enqueue logo job";
      log.error("Failed to enqueue logo job", { jobId: job.id }, enqueueErr instanceof Error ? enqueueErr : undefined);

      await serviceClient
        .from("logo_generation_jobs")
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

    // Step 3: Return the job ID immediately — client polls for completion
    return NextResponse.json({
      job: {
        id: job.id,
        status: "queued",
      },
    });
  } catch (error) {
    log.error("Unexpected error in logo generation", undefined, error instanceof Error ? error : undefined);
    return NextResponse.json(
      { error: "Failed to generate logos" },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const startupId = searchParams.get("startupId");

    let query = supabase
      .from("generated_logos")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (startupId) {
      query = query.eq("startup_id", startupId);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ logos: data });
  } catch (error) {
    console.error("[Logos API] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch logos" },
      { status: 500 },
    );
  }
}

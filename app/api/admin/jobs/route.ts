import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { inngest } from "@/lib/inngest/client";
import { logger } from "@/lib/logging";

const log = logger("admin-jobs");
const ADMIN_EMAILS = ["admin@startupos.app"];

/* ─── Types ─── */

interface JobCounts {
  queued: number;
  generating: number;
  completed: number;
  failed: number;
  total: number;
}

interface JobSummary {
  id: string;
  user_id: string;
  type: "website" | "logo";
  status: string;
  provider: string | null;
  model: string | null;
  duration_ms: number | null;
  error_message: string | null;
  retry_count: number;
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
  user_email?: string;
  metadata?: Record<string, unknown>;
}

/* ─── Auth Check ─── */

async function checkAdmin(request: NextRequest): Promise<Response | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!ADMIN_EMAILS.includes(user.email || "")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return null;
}

/* ─── GET: List jobs with counts ─── */

export async function GET(request: NextRequest) {
  const authError = await checkAdmin(request);
  if (authError) return authError;

  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "website"; // "website" | "logo"
    const status = searchParams.get("status"); // optional filter
    const limit = Math.min(Number(searchParams.get("limit")) || 50, 200);
    const offset = Number(searchParams.get("offset")) || 0;

    const serviceClient = createServiceClient();
    const table = type === "logo" ? "logo_generation_jobs" : "website_generation_jobs";

    // Build base query
    let query = serviceClient
      .from(table)
      .select("*", { count: "exact" });

    if (status) {
      query = query.eq("status", status);
    }

    const { data: jobs, count: total, error } = await query
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      log.error("Failed to fetch jobs", { table, error: error.message });
      return NextResponse.json({ error: "Failed to fetch jobs" }, { status: 500 });
    }

    // Get counts by status
    const { data: countData } = await serviceClient
      .from(table)
      .select("status");

    const counts: JobCounts = {
      queued: 0,
      generating: 0,
      completed: 0,
      failed: 0,
      total: countData?.length || 0,
    };

    for (const row of countData || []) {
      if (row.status === "queued") counts.queued++;
      else if (row.status === "generating") counts.generating++;
      else if (row.status === "completed") counts.completed++;
      else if (row.status === "failed") counts.failed++;
    }

    // Enrich with user emails
    const userIds = [...new Set((jobs || []).map(j => j.user_id))];

    // We can get emails from auth.admin API
    const enriched: JobSummary[] = [];
    for (const job of jobs || []) {
      let userEmail = "unknown";
      try {
        const { data: authData } = await serviceClient.auth.admin.getUserById(job.user_id);
        userEmail = authData?.user?.email || "unknown";
      } catch {
        // Best-effort
      }

      enriched.push({
        id: job.id,
        user_id: job.user_id,
        type: type as "website" | "logo",
        status: job.status,
        provider: job.provider || null,
        model: job.model || null,
        duration_ms: job.duration_ms || null,
        error_message: job.error_message || null,
        retry_count: job.retry_count || 0,
        created_at: job.created_at,
        started_at: job.started_at || null,
        completed_at: job.completed_at || null,
        user_email: userEmail,
      });
    }

    return NextResponse.json({ jobs: enriched, counts, total, type });
  } catch (error) {
    log.error("Unexpected error", undefined, error instanceof Error ? error : undefined);
    return NextResponse.json({ error: "Failed to fetch jobs" }, { status: 500 });
  }
}

/* ─── POST: Retry a failed job ─── */

export async function POST(request: NextRequest) {
  const authError = await checkAdmin(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const { jobId, type } = body as { jobId: string; type: "website" | "logo" };

    if (!jobId || !type) {
      return NextResponse.json({ error: "jobId and type are required" }, { status: 400 });
    }

    const serviceClient = createServiceClient();
    const table = type === "logo" ? "logo_generation_jobs" : "website_generation_jobs";

    // Fetch the failed job
    const { data: job, error: fetchError } = await serviceClient
      .from(table)
      .select("*")
      .eq("id", jobId)
      .single();

    if (fetchError || !job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    if (job.status !== "failed") {
      return NextResponse.json({ error: "Only failed jobs can be retried" }, { status: 400 });
    }

    // Reset the job to queued
    await serviceClient
      .from(table)
      .update({
        status: "queued",
        error_message: null,
        retry_count: (job.retry_count || 0) + 1,
        started_at: null,
        completed_at: null,
      })
      .eq("id", jobId);

    // Re-enqueue the Inngest event using stored metadata
    const metadata = (job.metadata || {}) as Record<string, unknown>;

    if (type === "website") {
      await inngest.send({
        name: "website-spec/generate",
        data: {
          jobId,
          websiteId: (metadata.websiteId as string) || `retry-${jobId}`,
          userId: job.user_id,
          startupName: (metadata.startupName as string) || "Retry",
          prompt: (metadata.prompt as string) || "Retry",
          startupId: job.startup_id || undefined,
          blueprintId: job.blueprint_id || undefined,
        },
      });
    } else if (type === "logo") {
      await inngest.send({
        name: "logo/generate",
        data: {
          jobId,
          userId: job.user_id,
          startupName: (metadata.startupName as string) || "Retry",
          industry: (metadata.industry as string) || "saas",
          brandColors: (metadata.brandColors as { name: string; hex: string }[]) || [],
          startupId: job.startup_id || undefined,
        },
      });
    }

    log.info("Job retry enqueued", { jobId, type });

    return NextResponse.json({ success: true, message: "Job retry enqueued" });
  } catch (error) {
    log.error("Failed to retry job", undefined, error instanceof Error ? error : undefined);
    return NextResponse.json({ error: "Failed to retry job" }, { status: 500 });
  }
}

/* ─── DELETE: Cancel a queued job ─── */

export async function DELETE(request: NextRequest) {
  const authError = await checkAdmin(request);
  if (authError) return authError;

  try {
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get("jobId");
    const type = searchParams.get("type") || "website";

    if (!jobId) {
      return NextResponse.json({ error: "jobId is required" }, { status: 400 });
    }

    const serviceClient = createServiceClient();
    const table = type === "logo" ? "logo_generation_jobs" : "website_generation_jobs";

    const { data: job, error: fetchError } = await serviceClient
      .from(table)
      .select("status")
      .eq("id", jobId)
      .single();

    if (fetchError || !job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    if (job.status !== "queued") {
      return NextResponse.json({ error: "Only queued jobs can be cancelled" }, { status: 400 });
    }

    await serviceClient
      .from(table)
      .update({
        status: "failed",
        error_message: "Cancelled by admin",
        completed_at: new Date().toISOString(),
      })
      .eq("id", jobId);

    log.info("Job cancelled by admin", { jobId, type });

    return NextResponse.json({ success: true, message: "Job cancelled" });
  } catch (error) {
    log.error("Failed to cancel job", undefined, error instanceof Error ? error : undefined);
    return NextResponse.json({ error: "Failed to cancel job" }, { status: 500 });
  }
}

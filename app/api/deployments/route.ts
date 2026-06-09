import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Allow up to 60 seconds for deployment (polling can take 10-40s)
export const maxDuration = 60;
import { createServiceClient } from "@/lib/supabase/service";
import { deployToVercel } from "@/lib/startup/deploy";
import { trackEvent } from "@/lib/analytics";

/**
 * POST /api/deployments — Deploy a generated website to Vercel
 *
 * Body:
 *   websiteId: string  (the generated_websites record ID)
 *
 * Response:
 *   { success, deployment } or { error }
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { websiteId } = body;

    if (!websiteId) {
      return NextResponse.json({ error: "websiteId is required" }, { status: 400 });
    }

    // Fetch the website record — verify ownership
    const { data: website, error: fetchError } = await supabase
      .from("generated_websites")
      .select("*")
      .eq("id", websiteId)
      .eq("user_id", user.id)
      .single();

    if (fetchError || !website) {
      console.error("[Deployments API] Fetch error:", fetchError?.message);
      return NextResponse.json(
        { error: "Website not found" },
        { status: 404 },
      );
    }

    // Extract HTML content
    const html = (website.content as { html?: string })?.html;
    if (!html) {
      return NextResponse.json(
        { error: "No HTML content to deploy. Generate the website first." },
        { status: 400 },
      );
    }

    const startupName = (website.metadata as { startupName?: string })?.startupName || "Startup";

    // Execute the deployment (async — client will poll for status)
    const result = await deployToVercel({
      html,
      startupName,
      websiteId: website.id,
      userId: user.id,
      startupId: website.startup_id || undefined,
    });

    // Track the deployment event
    trackEvent("website_generated", {
      success: result.success ? "1" : "0",
      provider: "vercel",
    });

    // Fetch the deployment record that was created
    const serviceClient = createServiceClient();
    const { data: deployment } = await serviceClient
      .from("deployments")
      .select("*")
      .eq("website_id", websiteId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    return NextResponse.json({
      success: result.success,
      deployment: deployment || null,
      url: result.url,
      status: result.status,
      logs: result.logs,
    });
  } catch (err) {
    console.error("[Deployments API] Error:", err);
    return NextResponse.json(
      { error: "Failed to deploy website" },
      { status: 500 },
    );
  }
}

/**
 * GET /api/deployments — List deployment history for a website
 *
 * Query params:
 *   websiteId: string (required)
 *
 * Response:
 *   { deployments: Deployment[] }
 */
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const websiteId = searchParams.get("websiteId");
    const id = searchParams.get("id");

    let query = supabase
      .from("deployments")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (websiteId) {
      query = query.eq("website_id", websiteId);
    }

    if (id) {
      query = query.eq("id", id);
    }

    const { data, error } = await query;

    if (error) {
      console.error("[Deployments API] Query error:", error.message);
      return NextResponse.json({ error: "Failed to fetch deployments" }, { status: 500 });
    }

    if (id && data && data.length > 0) {
      return NextResponse.json({ deployment: data[0] });
    }

    return NextResponse.json({ deployments: data || [] });
  } catch (err) {
    console.error("[Deployments API] Error:", err);
    return NextResponse.json(
      { error: "Failed to fetch deployments" },
      { status: 500 },
    );
  }
}

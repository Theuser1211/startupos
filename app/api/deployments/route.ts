import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Allow up to 60 seconds for deployment (polling can take 10-40s)
export const maxDuration = 60;
import { createServiceClient } from "@/lib/supabase/service";
import { deployToVercel } from "@/lib/startup/deploy";
import { validateWebsiteSpec, type WebsiteSpec } from "@/lib/startup/website-spec";
import { apiLimiter } from "@/lib/security/rate-limit";
import { trackEvent } from "@/lib/analytics";

/**
 * POST /api/deployments — Deploy a generated website to Vercel
 *
 * Body:
 *   websiteId: string  (the generated_websites record ID)
 *   websiteSpec?: WebsiteSpec  (optional — if not provided, loaded from DB)
 *
 * Response:
 *   { success, url, status, logs } or { error }
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Rate limiting by user
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";
  const rateResult = apiLimiter.check(`deploy:${ip}`);
  if (rateResult.blocked) {
    return NextResponse.json(
      { error: "Too many deployment requests. Please try again later." },
      { status: 429 },
    );
  }

  try {
    const body = await request.json();
    const { websiteId, websiteSpec: rawSpec } = body;

    // websiteId is required
    if (!websiteId) {
      return NextResponse.json({ error: "websiteId is required" }, { status: 400 });
    }

    // Verify ownership: fetch the website record
    const { data: website, error: fetchError } = await supabase
      .from("generated_websites")
      .select("id, user_id, content, metadata")
      .eq("id", websiteId)
      .single();

    if (fetchError || !website) {
      return NextResponse.json({ error: "Website not found" }, { status: 404 });
    }

    if (website.user_id !== user.id) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Resolve WebsiteSpec: use passed spec or load from DB
    let websiteSpec: WebsiteSpec;
    if (rawSpec) {
      const validation = validateWebsiteSpec(rawSpec);
      if (!validation.success) {
        return NextResponse.json({ error: `Invalid WebsiteSpec: ${validation.error}` }, { status: 400 });
      }
      websiteSpec = validation.data;
    } else {
      const storedSpec = (website.content as Record<string, unknown>)?.websiteSpec as WebsiteSpec | undefined;
      if (!storedSpec) {
        return NextResponse.json({ error: "No WebsiteSpec found. Generate the website first." }, { status: 400 });
      }
      websiteSpec = storedSpec;
    }

    const startupName = (websiteSpec.sections || []).find(s => s.type === "hero")?.heading || "Startup";

    // Execute the deployment
    const result = await deployToVercel({
      websiteSpec,
      startupName,
      websiteId: website.id,
      userId: user.id,
    });

    // Track the deployment event
    trackEvent("website_generated", {
      success: result.success ? "1" : "0",
      provider: "vercel",
    });

    return NextResponse.json({
      success: result.success,
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

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * POST /api/blueprints/autosave
 *
 * Lightweight endpoint used by navigator.sendBeacon() on page unload.
 * Upserts a blueprint by ID (if known) or creates one (if new).
 * Data is fire-and-forget — this endpoint does not return the saved record.
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    // Silently ignore — auth token might not survive page unload
    return NextResponse.json({ ok: false }, { status: 200 });
  }

  try {
    const body = await request.json();
    const { id, blueprint, interview_data } = body;

    if (!blueprint) {
      return NextResponse.json({ error: "Missing blueprint data" }, { status: 400 });
    }

    const name = blueprint.startupName || "My Startup";
    const interviewData = interview_data || {};
    const ideaText = interviewData.idea || name;

    if (id) {
      // Update existing blueprint
      await supabase
        .from("blueprints")
        .update({
          name,
          blueprint,
          interview_data: interviewData,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .eq("user_id", user.id);
    } else {
      // Try to find existing by idea text
      const { data: existing } = await supabase
        .from("blueprints")
        .select("id")
        .eq("user_id", user.id)
        .eq("idea", ideaText)
        .order("created_at", { ascending: false })
        .limit(1);

      if (existing && existing.length > 0) {
        // Update existing
        await supabase
          .from("blueprints")
          .update({
            name,
            blueprint,
            interview_data: interviewData,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existing[0].id);
      } else {
        // Create new
        await supabase
          .from("blueprints")
          .insert({
            user_id: user.id,
            name,
            idea: ideaText,
            industry: interviewData.industry || "other",
            stage: interviewData.stage || "ideation",
            blueprint,
            interview_data: interviewData,
          });
      }
    }

    return NextResponse.json({ ok: true });
  } catch {
    // Silently fail — beacon errors are non-critical
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}

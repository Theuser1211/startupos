import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import crypto from "crypto";

function generateShareToken(): string {
  return crypto.randomBytes(12).toString("hex");
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await request.json();
  const { id, action } = body;

  if (!id || !action) {
    return NextResponse.json({ error: "Missing id or action" }, { status: 400 });
  }

  if (action !== "publish" && action !== "unpublish") {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  // Verify ownership
  const { data: blueprint, error: fetchError } = await supabase
    .from("blueprints")
    .select("id, user_id")
    .eq("id", id)
    .single();

  if (fetchError || !blueprint) {
    return NextResponse.json({ error: "Blueprint not found" }, { status: 404 });
  }

  if (blueprint.user_id !== user.id) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  // Build updates based on action
  const updates: Record<string, unknown> = {};

  if (action === "publish") {
    updates.visibility = "public";
    updates.share_token = generateShareToken();
  } else {
    updates.visibility = "private";
    updates.share_token = null;
  }

  // Apply updates
  const { data: updated, error: updateError } = await supabase
    .from("blueprints")
    .update(updates)
    .eq("id", id)
    .select("share_token, visibility")
    .single();

  if (updateError) {
    console.error("[Publish API] Update error:", updateError.message);
    return NextResponse.json({ error: "Failed to update blueprint" }, { status: 500 });
  }

  return NextResponse.json({
    share_token: updated.share_token,
    visibility: updated.visibility,
  });
}

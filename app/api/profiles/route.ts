import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/profiles — get current user's profile
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error) {
    // Profile doesn't exist yet — create one (should auto-create via trigger, but handle gracefully)
    if (error.code === "PGRST116") {
      const { data: newProfile, error: insertError } = await supabase
        .from("profiles")
        .insert({ id: user.id })
        .select()
        .single();

      if (insertError) {
        return NextResponse.json({ error: insertError.message }, { status: 500 });
      }

      return NextResponse.json(newProfile);
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// PUT /api/profiles — update current user's profile
export async function PUT(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await request.json();
  const allowedFields = [
    "display_name",
    "avatar_url",
    "company_name",
    "role",
    "onboarding_completed",
    "settings",
  ];

  const updates: Record<string, unknown> = {};
  for (const field of allowedFields) {
    if (body[field] !== undefined) {
      updates[field] = body[field];
    }
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", user.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

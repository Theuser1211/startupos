import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/blueprints — list all blueprints for the current user
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const idea = searchParams.get("idea");

  if (id) {
    // Get single blueprint by ID
    const { data, error } = await supabase
      .from("blueprints")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (error) {
      console.error("[Blueprints API] Fetch error:", error.message);
      return NextResponse.json({ error: "Blueprint not found" }, { status: 404 });
    }

    return NextResponse.json(data);
  }

  if (idea) {
    // Find blueprint by idea text (for deduplication)
    const { data, error } = await supabase
      .from("blueprints")
      .select("id")
      .eq("user_id", user.id)
      .eq("idea", idea)
      .order("created_at", { ascending: false })
      .limit(1);

    if (error) {
      console.error("[Blueprints API] Query error:", error.message);
      return NextResponse.json({ error: "Failed to query blueprints" }, { status: 500 });
    }

    return NextResponse.json(data?.[0] || null);
  }

  // List all blueprints (summary only)
  const { data, error } = await supabase
    .from("blueprints")
    .select("id, name, idea, industry, stage, created_at, updated_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[Blueprints API] List error:", error.message);
    return NextResponse.json({ error: "Failed to list blueprints" }, { status: 500 });
  }

  return NextResponse.json(data);
}

// POST /api/blueprints — create a new blueprint
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await request.json();
  const { name, idea, industry, stage, blueprint, interview_data } = body;

  if (!name || !idea) {
    return NextResponse.json({ error: "Missing required fields: name, idea" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("blueprints")
    .insert({
      user_id: user.id,
      name,
      idea,
      industry: industry || "other",
      stage: stage || "ideation",
      blueprint,
      interview_data: interview_data || {},
    })
    .select()
    .single();

  if (error) {
    console.error("[Blueprints API] Insert error:", error.message);
    return NextResponse.json({ error: "Failed to create blueprint" }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}

// PUT /api/blueprints — update an existing blueprint
export async function PUT(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await request.json();
  const { id, name, blueprint, interview_data } = body;

  if (!id) {
    return NextResponse.json({ error: "Missing required field: id" }, { status: 400 });
  }

  const updates: Record<string, unknown> = {};
  if (name) updates.name = name;
  if (blueprint) updates.blueprint = blueprint;
  if (interview_data) updates.interview_data = interview_data;

  const { data, error } = await supabase
    .from("blueprints")
    .update(updates)
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) {
    console.error("[Blueprints API] Update error:", error.message);
    return NextResponse.json({ error: "Failed to update blueprint" }, { status: 500 });
  }

  return NextResponse.json(data);
}

// DELETE /api/blueprints — delete a blueprint
export async function DELETE(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Missing required param: id" }, { status: 400 });
  }

  const { error } = await supabase
    .from("blueprints")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    console.error("[Blueprints API] Delete error:", error.message);
    return NextResponse.json({ error: "Failed to delete blueprint" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

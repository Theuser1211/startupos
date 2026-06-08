import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { generateLandingPage } from "@/lib/startup/website-generator";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { startupName, tagline, problem, solution, brand, icp, industry, startupId } = body;

    if (!startupName || !tagline) {
      return NextResponse.json(
        { error: "startupName and tagline are required" },
        { status: 400 },
      );
    }

    // Generate the website HTML
    const html = generateLandingPage({
      startupName,
      tagline,
      problem: problem || "Teams are struggling with outdated tools that slow them down.",
      solution: solution || `${startupName} provides a modern platform that eliminates friction and accelerates growth.`,
      brand: brand || {
        mission: `To make ${startupName} the go-to platform for our industry.`,
        values: ["Innovation", "Quality", "Customer Success"],
        tone: ["Professional", "Clear", "Confident"],
        colors: [
          { name: "Primary", hex: "#7C3AED" },
          { name: "Secondary", hex: "#6366F1" },
          { name: "Dark", hex: "#0A0A0F" },
          { name: "Light", hex: "#A1A1B5" },
        ],
        typography: { heading: "System UI", body: "System UI" },
      },
      icp: icp || {
        title: "Decision Makers",
        description: "Professionals looking for better solutions",
        painPoints: [
          "Current tools are too slow and expensive",
          "Team productivity is suffering",
          "Integration with existing systems is a nightmare",
        ],
      },
      industry: industry || "saas",
    });

    // Store in the database
    const serviceClient = createServiceClient();
    const { data, error } = await serviceClient
      .from("generated_websites")
      .insert({
        user_id: user.id,
        startup_id: startupId || null,
        template: "landing-page",
        deployment_status: "pending",
        content: { html },
        metadata: { startupName, tagline, industry },
      })
      .select()
      .single();

    if (error) {
      console.error("[Websites API] Insert error:", error);
      return NextResponse.json(
        { error: "Failed to save website" },
        { status: 500 },
      );
    }

    return NextResponse.json({ website: data });
  } catch (error) {
    console.error("[Websites API] Error:", error);
    return NextResponse.json(
      { error: "Failed to generate website" },
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
    const websiteId = searchParams.get("id");
    const startupId = searchParams.get("startupId");

    let query = supabase
      .from("generated_websites")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (websiteId) {
      query = query.eq("id", websiteId);
    }

    if (startupId) {
      query = query.eq("startup_id", startupId);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (websiteId && data && data.length > 0) {
      return NextResponse.json({ website: data[0] });
    }

    return NextResponse.json({ websites: data || [] });
  } catch (error) {
    console.error("[Websites API] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch websites" },
      { status: 500 },
    );
  }
}

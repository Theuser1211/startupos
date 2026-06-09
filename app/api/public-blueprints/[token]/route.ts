import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { StartupBlueprint } from "@/lib/startup/blueprint";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    if (!token) {
      return NextResponse.json({ error: "Invalid token" }, { status: 400 });
    }

    const supabase = await createClient();

    const { data, error } = await supabase
      .from("blueprints")
      .select("blueprint, public_sections, public_views")
      .eq("share_token", token)
      .eq("visibility", "public")
      .single();

    if (error || !data) {
      console.error("[Public Blueprint API] Error fetching blueprint:", error?.message);
      return NextResponse.json({ error: "Blueprint not found" }, { status: 404 });
    }

    supabase
      .from("blueprints")
      .update({ public_views: (data.public_views || 0) + 1 })
      .eq("share_token", token)
      .then(() => {});

    const blueprint = data.blueprint as unknown as StartupBlueprint;

    const publicSections = (data.public_sections as string[]) || [];
    const response: Record<string, unknown> = {
      startupName: blueprint.startupName,
      tagline: blueprint.tagline,
      verdict: blueprint.verdict,
      publicViews: (data.public_views || 0) + 1,
      shareUrl: `${process.env.NEXT_PUBLIC_APP_URL || "https://startupos.app"}/s/${token}`,
    };

    if (publicSections.includes("icp")) {
      response.icp = blueprint.icp;
    }
    if (publicSections.includes("revenue")) {
      response.revenue = blueprint.revenue;
    }
    if (publicSections.includes("roadmap")) {
      response.roadmap = blueprint.roadmap;
    }
    if (publicSections.includes("roast")) {
      response.roast = blueprint.roast;
    }
    if (publicSections.includes("competitors")) {
      response.competitors = blueprint.competitors;
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error("[Public Blueprint API] Unexpected error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

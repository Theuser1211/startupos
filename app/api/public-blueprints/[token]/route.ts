import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { StartupBlueprint } from "@/lib/startup/blueprint";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  if (!token || token.length !== 24) {
    return NextResponse.json({ error: "Invalid token" }, { status: 400 });
  }

  const supabase = await createClient();

  // Query for published blueprint with matching token
  const { data, error } = await supabase
    .from("blueprints")
    .select("blueprint, public_sections, public_views, name, idea, industry, stage")
    .eq("share_token", token)
    .eq("visibility", "public")
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Blueprint not found" }, { status: 404 });
  }

  // Increment view counter (fire and forget)
  supabase
    .from("blueprints")
    .update({ public_views: (data.public_views || 0) + 1 })
    .eq("share_token", token)
    .then(() => {});

  // Cast blueprint to proper type
  const blueprint = data.blueprint as unknown as StartupBlueprint;

  // Filter sections based on public_sections config
  const publicSections = (data.public_sections as string[]) || [];
  const response: Record<string, unknown> = {
    startupName: blueprint.startupName,
    tagline: blueprint.tagline,
    verdict: blueprint.verdict,
    publicViews: (data.public_views || 0) + 1,
    shareUrl: `${process.env.NEXT_PUBLIC_APP_URL || "https://startupos.app"}/s/${token}`,
  };

  // Conditionally include sections
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
}

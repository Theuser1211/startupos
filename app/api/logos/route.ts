import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { serializeLogos } from "@/lib/startup/logo-generator";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { startupName, industry, brandColors, tone, startupId } = body as {
      startupName: string;
      industry: string;
      brandColors: { name: string; hex: string }[];
      tone?: string[];
      startupId?: string;
    };

    if (!startupName) {
      return NextResponse.json({ error: "startupName is required" }, { status: 400 });
    }

    // Generate logos using the deterministic SVG generator (v3 favicon-first engine)
    const logos = serializeLogos(startupName, industry || "saas", brandColors || [
      { name: "Primary", hex: "#7C3AED" },
      { name: "Secondary", hex: "#6366F1" },
      { name: "Dark", hex: "#0A0A0F" },
      { name: "Light", hex: "#A1A1B5" },
    ], tone);

    // Store logos in the database using service client
    const serviceClient = createServiceClient();
    const storedLogos = [];

    for (const logo of logos) {
      const { data, error } = await serviceClient
        .from("generated_logos")
        .insert({
          user_id: user.id,
          startup_id: startupId || null,
          prompt: logo.brandConcept,
          style: logo.style,
          image_url: logo.preview,
          thumbnail_url: logo.monochromePreview,
          metadata: {
            colors: logo.colors,
            qualityScore: logo.qualityScore,
            symbolReasoning: logo.symbolReasoning,
            fullPreview: logo.fullPreview,
            monochromePreview: logo.monochromePreview,
          },
        })
        .select()
        .single();

      if (error) {
        console.error("[Logos API] Insert error:", error);
        // Continue even if insert fails — logos are still generated
        storedLogos.push(logo);
      } else {
        storedLogos.push({ ...logo, id: data.id });
      }
    }

    return NextResponse.json({ logos: storedLogos });
  } catch (error) {
    console.error("[Logos API] Error:", error);
    return NextResponse.json(
      { error: "Failed to generate logos" },
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
    const startupId = searchParams.get("startupId");

    let query = supabase
      .from("generated_logos")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (startupId) {
      query = query.eq("startup_id", startupId);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ logos: data });
  } catch (error) {
    console.error("[Logos API] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch logos" },
      { status: 500 },
    );
  }
}

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

/**
 * Admin stats endpoint.
 * Returns platform-wide statistics for the admin dashboard.
 * Restricted to users with admin email addresses.
 */

const ADMIN_EMAILS = ["admin@startupos.app"];

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    if (!ADMIN_EMAILS.includes(user.email || "")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const serviceClient = createServiceClient();

    // Fetch all stats in parallel
    const [
      { count: totalUsers },
      { count: activeSubscriptions },
      { count: totalBlueprints },
      { count: totalLogos },
      { data: recentSignupsData },
      { data: subscriptionData },
    ] = await Promise.all([
      serviceClient.from("profiles").select("*", { count: "exact", head: true }),
      serviceClient
        .from("subscriptions")
        .select("*", { count: "exact", head: true })
        .eq("status", "active")
        .neq("plan", "free"),
      serviceClient.from("blueprints").select("*", { count: "exact", head: true }),
      serviceClient.from("generated_logos").select("*", { count: "exact", head: true }),
      serviceClient
        .from("profiles")
        .select("id, created_at")
        .gte("created_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        .order("created_at", { ascending: false }),
      serviceClient
        .from("subscriptions")
        .select("plan, status")
        .neq("plan", "free"),
    ]);

    // Get recent users with their profiles and subscriptions
    const { data: profiles } = await serviceClient
      .from("profiles")
      .select("id, display_name, created_at")
      .order("created_at", { ascending: false })
      .limit(20);

    const recentUsers = await Promise.all(
      (profiles || []).map(async (profile) => {
        const { data: subData } = await serviceClient
          .from("subscriptions")
          .select("plan, status")
          .eq("user_id", profile.id)
          .single();

        // Get email from auth.users (requires permission)
        const { data: authData } = await serviceClient.auth.admin.getUserById(profile.id);

        return {
          id: profile.id,
          email: authData?.user?.email || "unknown",
          display_name: profile.display_name,
          plan: subData?.plan || "free",
          status: subData?.status || "active",
          created_at: profile.created_at,
        };
      }),
    );

    // Calculate MRR (approximate — based on active paid subscriptions)
    const mrr = (subscriptionData || []).reduce((total, sub) => {
      if (sub.status !== "active") return total;
      if (sub.plan === "starter") return total + 999;
      if (sub.plan === "pro") return total + 2999;
      return total;
    }, 0);

    return NextResponse.json({
      stats: {
        totalUsers: totalUsers || 0,
        activeSubscriptions: activeSubscriptions || 0,
        totalBlueprints: totalBlueprints || 0,
        totalLogos: totalLogos || 0,
        recentSignups: recentSignupsData?.length || 0,
        revenue: mrr,
      },
      recentUsers,
    });
  } catch (error) {
    console.error("[Admin Stats API] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch admin stats" },
      { status: 500 },
    );
  }
}

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { deleteAccountLimiter } from "@/lib/security/rate-limit";

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";
  const rateResult = deleteAccountLimiter.check(`delete-account:${ip}`);
  if (rateResult.blocked) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 },
    );
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    // Delete user data — ordered by dependency (child before parent)
    const cleanupOps = [
      { table: "deployments", label: "deployments" },
      { table: "custom_domains", label: "custom domains" },
      { table: "website_generation_jobs", label: "website generation jobs" },
      { table: "generated_websites", label: "websites" },
      { table: "generated_logos", label: "logos" },
      { table: "audit_logs", label: "audit logs" },
      { table: "usage_tracking", label: "usage tracking" },
      { table: "subscriptions", label: "subscriptions" },
      { table: "blueprints", label: "blueprints" },
      { table: "startups", label: "startups" },
    ];

    for (const { table, label } of cleanupOps) {
      const { error } = await supabase
        .from(table)
        .delete()
        .eq("user_id", user.id);
      if (error) console.error(`Error deleting ${label}:`, error);
    }

    // Use service role client to delete the auth user (admin operation)
    const serviceClient = createServiceClient();
    const { error: deleteError } = await serviceClient.auth.admin.deleteUser(user.id);

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Account deletion error:", err);
    return NextResponse.json(
      { error: "Failed to delete account. Please contact support." },
      { status: 500 }
    );
  }
}

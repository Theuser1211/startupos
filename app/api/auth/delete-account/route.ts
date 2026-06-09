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
    // Delete user data in order (cascading deletes handle related tables)
    const { error: bpError } = await supabase
      .from("blueprints")
      .delete()
      .eq("user_id", user.id);
    if (bpError) console.error("Error deleting blueprints:", bpError);

    const { error: stError } = await supabase
      .from("startups")
      .delete()
      .eq("user_id", user.id);
    if (stError) console.error("Error deleting startups:", stError);

    const { error: lgError } = await supabase
      .from("generated_logos")
      .delete()
      .eq("user_id", user.id);
    if (lgError) console.error("Error deleting logos:", lgError);

    const { error: wsError } = await supabase
      .from("generated_websites")
      .delete()
      .eq("user_id", user.id);
    if (wsError) console.error("Error deleting websites:", wsError);

    const { error: utError } = await supabase
      .from("usage_tracking")
      .delete()
      .eq("user_id", user.id);
    if (utError) console.error("Error deleting usage tracking:", utError);

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

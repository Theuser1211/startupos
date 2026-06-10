import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { logger } from "@/lib/logging";

const log = logger("admin-errors");
const ADMIN_EMAILS = ["admin@startupos.app"];

/* ─── Types ─── */

interface ErrorLogEntry {
  id: string;
  user_id: string | null;
  action: string;
  resource: string;
  details: { message?: string; [key: string]: unknown };
  created_at: string;
  user_email?: string;
}

/* ─── GET: List recent errors ─── */

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!ADMIN_EMAILS.includes(user.email || "")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(Number(searchParams.get("limit")) || 50, 200);
    const action = searchParams.get("action"); // optional filter by action name

    const serviceClient = createServiceClient();

    let query = serviceClient
      .from("audit_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (action) {
      query = query.eq("action", action);
    }

    const { data: logs, error } = await query;

    if (error) {
      log.error("Failed to fetch audit logs", { error: error.message });
      return NextResponse.json({ error: "Failed to fetch error logs" }, { status: 500 });
    }

    // Enrich with user emails (best-effort)
    const enriched: ErrorLogEntry[] = [];
    for (const entry of logs || []) {
      let userEmail: string | null = null;
      if (entry.user_id) {
        try {
          const { data: authData } = await serviceClient.auth.admin.getUserById(entry.user_id);
          userEmail = authData?.user?.email || null;
        } catch {
          // Best-effort
        }
      }

      enriched.push({
        id: entry.id,
        user_id: entry.user_id,
        action: entry.action,
        resource: entry.resource,
        details: (entry.details || {}) as { message?: string; [key: string]: unknown },
        created_at: entry.created_at,
        user_email: userEmail || undefined,
      });
    }

    // Get total count
    const { count: totalCount } = await serviceClient
      .from("audit_logs")
      .select("*", { count: "exact", head: true });

    return NextResponse.json({ errors: enriched, total: totalCount || 0 });
  } catch (error) {
    log.error("Unexpected error", undefined, error instanceof Error ? error : undefined);
    return NextResponse.json({ error: "Failed to fetch error logs" }, { status: 500 });
  }
}

/**
 * Structured Error Logger — persists errors to the audit_logs table.
 *
 * Provides two modes:
 *   1. logError() — fire-and-forget persistence for non-critical errors
 *   2. withErrorLogging() — wraps an async function with automatic error capture
 *
 * The audit_logs table stores errors with user_id, action, resource,
 * details (JSONB), and timestamp for admin review.
 */

import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";

/* ─── Types ─── */

export interface ErrorLogEntry {
  userId?: string | null;
  action: string;
  resource: string;
  message: string;
  details?: Record<string, unknown>;
  stack?: string;
}

/* ─── Cleanup ─── */

const CLEANUP_INTERVAL_MS = 60 * 60 * 1000; // 1 hour
const STALE_AGE_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
let lastCleanup = 0;

/**
 * Purge error entries older than 30 days.
 * Runs at most once per hour to avoid excessive DB writes.
 */
async function maybeCleanupStaleLogs() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
  lastCleanup = now;

  try {
    const supabase = createServiceClient();
    const cutoff = new Date(now - STALE_AGE_MS).toISOString();
    await supabase
      .from("audit_logs")
      .delete()
      .lt("created_at", cutoff);
  } catch {
    // Cleanup is best-effort
  }
}

/* ─── Core Logger ─── */

/**
 * Persist a structured error to the audit_logs table.
 * Fire-and-forget — never throws.
 */
export async function logError(entry: ErrorLogEntry): Promise<void> {
  try {
    const supabase = createServiceClient();
    await supabase.from("audit_logs").insert({
      user_id: entry.userId || null,
      action: entry.action,
      resource: entry.resource,
      details: {
        message: entry.message,
        ...(entry.details ? entry.details : {}),
        ...(entry.stack ? { stack: entry.stack } : {}),
        loggedAt: new Date().toISOString(),
      },
    });

    // Fire cleanup periodically
    maybeCleanupStaleLogs();
  } catch {
    // Logging failure is non-critical — silently ignore
  }
}

/**
 * Wrap an async function with automatic error capture.
 *
 * - On success: returns { success: true, data: T }
 * - On error: logs to audit_logs, returns { success: false, error: string }
 *
 * @example
 *   const result = await withErrorLogging(
 *     () => deployToVercel(options),
 *     { userId: user.id, action: "website.deploy", resource: `website:${websiteId}` },
 *   );
 *   if (!result.success) return NextResponse.json({ error: result.error }, { status: 500 });
 *   return NextResponse.json(result.data);
 */
export async function withErrorLogging<T>(
  fn: () => Promise<T>,
  meta: {
    userId?: string | null;
    action: string;
    resource: string;
    details?: Record<string, unknown>;
  },
): Promise<{ success: true; data: T } | { success: false; error: string }> {
  try {
    const data = await fn();
    return { success: true, data };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    const stack = err instanceof Error ? err.stack : undefined;

    // Log to audit_logs
    await logError({
      userId: meta.userId,
      action: meta.action,
      resource: meta.resource,
      message,
      details: meta.details,
      stack,
    });

    return { success: false, error: message };
  }
}

/**
 * Wrap an API route handler with automatic error logging.
 * Catches exceptions, logs to audit_logs, and returns a proper 500 response.
 *
 * @example
 *   export const POST = withApiErrorLogging(async (request: NextRequest) => {
 *     // ... route logic
 *     return NextResponse.json({ ok: true });
 *   }, "website.deploy");
 */

type RouteHandler = (request: Request) => Promise<Response>;

export function withApiErrorLogging(
  handler: RouteHandler,
  action: string,
): RouteHandler {
  return async (request: Request) => {
    try {
      return await handler(request);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      const stack = err instanceof Error ? err.stack : undefined;

      // Try to extract userId from the request context
      let userId: string | null = null;
      try {
        const { createClient } = await import("@/lib/supabase/server");
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        userId = user?.id || null;
      } catch {
        // Auth extraction is best-effort
      }

      // Log to audit_logs
      await logError({
        userId,
        action,
        resource: request.url || "unknown",
        message,
        stack,
        details: {
          method: request.method,
          url: request.url,
        },
      });

      return NextResponse.json(
        { error: "An unexpected error occurred. Please try again." },
        { status: 500 },
      );
    }
  };
}

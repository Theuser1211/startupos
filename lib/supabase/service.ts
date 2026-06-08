import { createClient } from "@supabase/supabase-js";

/**
 * Supabase admin client using the SERVICE_ROLE key.
 * Only use in API routes / server-only code — NEVER expose to the client.
 * Requires SUPABASE_SERVICE_ROLE_KEY environment variable.
 */
export function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  if (!serviceKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is not set. Add it to .env.local for account deletion and admin operations."
    );
  }

  return createClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

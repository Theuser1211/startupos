/**
 * Inngest Serve Handler — Required endpoint for Inngest to invoke functions.
 *
 * This endpoint is called by Inngest Cloud (or the Dev Server) to:
 * - Register available functions
 * - Execute function steps
 * - Handle retries
 *
 * Route: POST /api/inngest (and GET for registration)
 *
 * IMPORTANT: This route must NOT be behind authentication middleware.
 * Inngest signs requests with the signing key for security.
 */

import { serve } from "inngest/next";
import { inngest } from "@/lib/inngest/client";
import { generateWebsiteSpecFn } from "@/app/api/websites/spec/functions";
import { generateLogoFn } from "@/app/api/logos/functions";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [generateWebsiteSpecFn, generateLogoFn],
});

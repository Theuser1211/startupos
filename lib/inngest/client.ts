/**
 * Inngest Client for StartupOS
 *
 * Background job processing for long-running AI tasks:
 * - WebsiteSpec generation (Groq → DeepSeek failover)
 * - Future: Logo generation, blueprint generation
 *
 * Environment variables:
 *   INNGEST_EVENT_KEY   — Optional: for local development with Inngest Dev Server
 *   INNGEST_SIGNING_KEY — Optional: for production Inngest Cloud (auto-managed if using serve)
 */

import { Inngest } from "inngest";

export const inngest = new Inngest({
  id: "startupos",
  ...(process.env.NODE_ENV === "development"
    ? { eventKey: process.env.INNGEST_EVENT_KEY }
    : {}),
});

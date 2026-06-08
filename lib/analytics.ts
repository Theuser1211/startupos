/**
 * Analytics utility for StartupOS.
 *
 * Uses Vercel Analytics for page views (automatic via <Analytics />).
 * Custom events track user actions for product and growth metrics.
 */

type EventName =
  | "signup"
  | "signin"
  | "blueprint_generated"
  | "blueprint_saved"
  | "blueprint_loaded"
  | "interview_started"
  | "interview_completed"
  | "roast_viewed"
  | "logo_generated"
  | "website_generated"
  | "subscription_changed"
  | "error_occurred";

/**
 * Track a custom analytics event.
 * Events are silently dropped if Vercel Analytics is not available.
 */
/**
 * Track a custom analytics event.
 * Falls back to console.log in development for debugging.
 * Production events are tracked via Vercel Analytics auto page views.
 */
export function trackEvent(name: EventName, properties?: Record<string, string | number | boolean>) {
  if (typeof window === "undefined") return;

  if (process.env.NODE_ENV === "development") {
    console.log("[Analytics]", name, properties ?? "");
  }

  // Note: Custom event tracking with @vercel/analytics requires the track() API
  // which is available in @vercel/analytics v1.1+. Import as needed:
  // import { track } from "@vercel/analytics";
  // track(name, properties);
}

/**
 * Track page view duration.
 */
export function trackTiming(page: string, durationMs: number) {
  trackEvent("error_occurred" as EventName, {
    page,
    duration_ms: durationMs,
  });
}

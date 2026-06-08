/**
 * Simple in-memory rate limiter for API route protection.
 *
 * Limitations:
 * - Not shared across serverless function instances (per-instance counter)
 * - Use Redis/Upstash for production multi-instance rate limiting
 *
 * Usage:
 *   const limiter = createRateLimiter({ windowMs: 60_000, maxRequests: 10 });
 *   const result = limiter.check("user-ip-or-id");
 *   if (result.blocked) return Response.json({ error: "Too many requests" }, { status: 429 });
 */

interface RateLimiterConfig {
  windowMs: number;
  maxRequests: number;
}

interface RateLimitResult {
  blocked: boolean;
  remaining: number;
  resetAt: number;
}

interface WindowEntry {
  count: number;
  resetAt: number;
}

export function createRateLimiter(config: RateLimiterConfig) {
  const { windowMs, maxRequests } = config;
  const store = new Map<string, WindowEntry>();

  // Periodically clean up stale entries (every 60s)
  const cleanupInterval = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store) {
      if (now >= entry.resetAt) {
        store.delete(key);
      }
    }
  }, 60_000);

  // Allow cleanup to not block process exit (graceful in both Node.js and Edge)
  try { cleanupInterval.unref(); } catch { /* Edge runtime doesn't have unref() */ }

  return {
    check(key: string): RateLimitResult {
      const now = Date.now();
      const entry = store.get(key);

      if (!entry || now >= entry.resetAt) {
        // New window
        const resetAt = now + windowMs;
        store.set(key, { count: 1, resetAt });
        return { blocked: false, remaining: maxRequests - 1, resetAt };
      }

      entry.count += 1;

      if (entry.count > maxRequests) {
        return { blocked: true, remaining: 0, resetAt: entry.resetAt };
      }

      return { blocked: false, remaining: maxRequests - entry.count, resetAt: entry.resetAt };
    },

    /** Get current count for a key (for monitoring) */
    getCount(key: string): number {
      const entry = store.get(key);
      if (!entry || Date.now() >= entry.resetAt) return 0;
      return entry.count;
    },

    /** Reset counter for a key */
    reset(key: string): void {
      store.delete(key);
    },

    /** Clean up the interval timer (for testing) */
    destroy(): void {
      clearInterval(cleanupInterval);
      store.clear();
    },
  };
}

/** Pre-built rate limiters for common use cases */

/** Strict: 10 requests per minute (auth endpoints, password resets) */
export const strictLimiter = createRateLimiter({ windowMs: 60_000, maxRequests: 10 });

/** Moderate: 30 requests per minute (API routes, blueprint generation) */
export const apiLimiter = createRateLimiter({ windowMs: 60_000, maxRequests: 30 });

/** Generous: 100 requests per minute (static assets, public pages) */
export const generousLimiter = createRateLimiter({ windowMs: 60_000, maxRequests: 100 });

/** Very strict: 3 requests per minute (account deletion) */
export const deleteAccountLimiter = createRateLimiter({ windowMs: 60_000, maxRequests: 3 });

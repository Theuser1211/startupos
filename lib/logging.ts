/**
 * Structured Logging Utility for StartupOS
 *
 * Provides consistent log formatting across all backend routes and services.
 * In production, logs include request IDs and structured metadata for
 * log aggregation (e.g., Datadog, Splunk, Axiom).
 *
 * Usage:
 *   import { logger } from "@/lib/logging";
 *   logger.info("User signed up", { userId: "abc", email: "..." });
 *   logger.error("Deployment failed", { websiteId, error: err.message });
 */

export type LogLevel = "debug" | "info" | "warn" | "error";

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  service: string;
  message: string;
  data?: Record<string, unknown>;
  error?: string;
  stack?: string;
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const currentLevel: LogLevel =
  (process.env.LOG_LEVEL as LogLevel) ||
  (process.env.NODE_ENV === "production" ? "info" : "debug");

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[currentLevel];
}

function formatEntry(entry: LogEntry): string {
  const parts = [
    `[${entry.timestamp}]`,
    `[${entry.level.toUpperCase()}]`,
    `[${entry.service}]`,
    entry.message,
  ];

  if (entry.data && Object.keys(entry.data).length > 0) {
    try {
      parts.push(JSON.stringify(entry.data));
    } catch {
      parts.push("[Circular]");
    }
  }

  if (entry.error) {
    parts.push(`error=${entry.error}`);
  }

  return parts.join(" ");
}

function makeEntry(
  level: LogLevel,
  service: string,
  message: string,
  data?: Record<string, unknown>,
  error?: Error,
): LogEntry {
  return {
    timestamp: new Date().toISOString(),
    level,
    service,
    message,
    data,
    ...(error ? { error: error.message, stack: error.stack } : {}),
  };
}

function log(
  level: LogLevel,
  service: string,
  message: string,
  data?: Record<string, unknown>,
  error?: Error,
) {
  if (!shouldLog(level)) return;

  const entry = makeEntry(level, service, message, data, error);

  const formatted = formatEntry(entry);

  switch (level) {
    case "error":
      console.error(formatted);
      if (entry.stack && process.env.NODE_ENV !== "production") {
        console.error(entry.stack);
      }
      break;
    case "warn":
      console.warn(formatted);
      break;
    case "info":
      console.log(formatted);
      break;
    case "debug":
      console.debug(formatted);
      break;
  }
}

/**
 * Creates a namespaced logger for a specific service/component.
 *
 * @example
 *   const log = logger("deploy");
 *   log.info("Deployment started", { websiteId, userId });
 *   log.error("Deployment failed", { websiteId }, err);
 */
export function logger(service: string) {
  return {
    debug: (message: string, data?: Record<string, unknown>) =>
      log("debug", service, message, data),
    info: (message: string, data?: Record<string, unknown>) =>
      log("info", service, message, data),
    warn: (message: string, data?: Record<string, unknown>) =>
      log("warn", service, message, data),
    error: (
      message: string,
      data?: Record<string, unknown>,
      error?: Error,
    ) => log("error", service, message, data, error),
  };
}

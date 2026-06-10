/**
 * Shared AI configuration.
 *
 * When AI_BASE_URL and AI_API_KEY are set, ALL providers route through
 * the local proxy (e.g. http://localhost:3001/v1).
 *
 * If unset, each provider falls back to its original API endpoint and
 * individual API key (GROQ_API_KEY, DEEPSEEK_API_KEY, GOOGLE_API_KEY).
 */

const DEFAULT_BASE_URL = "http://localhost:3001/v1";

/**
 * Returns the AI proxy base URL. Reads from AI_BASE_URL env var.
 * Defaults to http://localhost:3001/v1.
 *
 * The full endpoint is constructed as `${baseUrl}/chat/completions`
 * for OpenAI-compatible providers (Groq, DeepSeek).
 */
export function getAiBaseUrl(): string {
  const envUrl = process.env.AI_BASE_URL;
  if (envUrl && envUrl.trim().length > 0) {
    const trimmed = envUrl.trim();
    // Remove trailing slash for consistency
    return trimmed.endsWith("/") ? trimmed.slice(0, -1) : trimmed;
  }
  return DEFAULT_BASE_URL;
}

/**
 * Returns the unified AI API key. Reads from AI_API_KEY env var.
 * When set, this key is used as the Bearer token for all providers.
 *
 * If unset, each provider falls back to its individual API key
 * (GROQ_API_KEY, DEEPSEEK_API_KEY, GOOGLE_API_KEY).
 */
export function getAiApiKey(): string | null {
  const key = process.env.AI_API_KEY;
  if (key && key.trim().length > 0) {
    return key.trim();
  }
  return null;
}

/**
 * Returns true if the unified AI proxy is configured.
 */
export function isProxyConfigured(): boolean {
  return getAiApiKey() !== null;
}

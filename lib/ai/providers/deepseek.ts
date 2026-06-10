/* ─── DeepSeek API Provider ─── */

import { getAiBaseUrl, getAiApiKey, isProxyConfigured } from "@/lib/ai/config";

const DEEPSEEK_DEFAULT_BASE = "https://api.deepseek.com/chat/completions";
const DEEPSEEK_MODEL = "deepseek-chat";

/** @internal Result type — matches ProviderResult in index.ts */
export interface ProviderResult {
  content: string;
  model: string;
  durationMs: number;
  outputTokens: number;
  inputTokens: number;
}

function getDeepSeekEndpoint(): string {
  if (isProxyConfigured()) {
    return `${getAiBaseUrl()}/chat/completions`;
  }
  return DEEPSEEK_DEFAULT_BASE;
}

function getDeepSeekApiKey(): string | null {
  const proxyKey = getAiApiKey();
  if (proxyKey) return proxyKey;
  return process.env.DEEPSEEK_API_KEY ?? null;
}

/**
 * Calls the DeepSeek API with a prompt and returns the generated content + metrics.
 * Routes through AI_BASE_URL proxy when configured, otherwise uses the default DeepSeek endpoint.
 * Returns null on any failure (network, auth, rate-limit, etc.)
 */
export async function callDeepSeek(prompt: string): Promise<ProviderResult | null> {
  const apiKey = getDeepSeekApiKey();
  const baseUrl = getDeepSeekEndpoint();
  const startTime = Date.now();

  if (!apiKey) {
    console.warn("[DeepSeek] No API key configured (DEEPSEEK_API_KEY or AI_API_KEY) — skipping provider");
    return null;
  }

  try {
    const response = await fetch(baseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: DEEPSEEK_MODEL,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 8192,
      }),
    });

    const durationMs = Date.now() - startTime;

    if (!response.ok) {
      const errorBody = await response.text().catch(() => "unknown error");
      console.warn(
        `[DeepSeek] Endpoint returned ${response.status} after ${durationMs}ms: ${errorBody.substring(0, 200)}`,
      );
      return null;
    }

    const data = await response.json();
    const content: string | undefined = data.choices?.[0]?.message?.content?.trim();
    const outputTokens: number = data.usage?.completion_tokens ?? 0;
    const inputTokens: number = data.usage?.prompt_tokens ?? 0;

    if (!content) {
      console.warn(`[DeepSeek] Model returned empty content after ${durationMs}ms`);
      return null;
    }

    console.log(
      `[DeepSeek] Success — ${durationMs}ms, ${inputTokens} in / ${outputTokens} out`,
    );

    return {
      content,
      model: DEEPSEEK_MODEL,
      durationMs,
      outputTokens,
      inputTokens,
    };
  } catch (err) {
    const durationMs = Date.now() - startTime;
    console.warn(
      `[DeepSeek] Request threw after ${durationMs}ms:`,
      err instanceof Error ? err.message : "unknown error",
    );
    return null;
  }
}

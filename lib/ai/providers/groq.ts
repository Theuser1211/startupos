/* ─── Groq API Provider ─── */

import { getAiBaseUrl, getAiApiKey, isProxyConfigured } from "@/lib/ai/config";

const GROQ_DEFAULT_BASE = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.3-70b-versatile";

/** @internal Result type — matches ProviderResult in index.ts */
export interface ProviderResult {
  content: string;
  model: string;
  durationMs: number;
  outputTokens: number;
  inputTokens: number;
}

function getGroqEndpoint(): string {
  if (isProxyConfigured()) {
    return `${getAiBaseUrl()}/chat/completions`;
  }
  return GROQ_DEFAULT_BASE;
}

function getGroqApiKey(): string | null {
  const proxyKey = getAiApiKey();
  if (proxyKey) return proxyKey;
  return process.env.GROQ_API_KEY ?? null;
}

/**
 * Calls the Groq API with a prompt and returns the generated content + metrics.
 * Routes through AI_BASE_URL proxy when configured, otherwise uses the default Groq endpoint.
 * Returns null on any failure (network, auth, rate-limit, etc.)
 */
export async function callGroq(prompt: string): Promise<ProviderResult | null> {
  const apiKey = getGroqApiKey();
  const baseUrl = getGroqEndpoint();
  const startTime = Date.now();

  if (!apiKey) {
    console.warn("[Groq] No API key configured (GROQ_API_KEY or AI_API_KEY) — skipping provider");
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
        model: GROQ_MODEL,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_completion_tokens: 8192,
      }),
    });

    const durationMs = Date.now() - startTime;

    if (!response.ok) {
      const errorBody = await response.text().catch(() => "unknown error");
      console.warn(
        `[Groq] Endpoint returned ${response.status} after ${durationMs}ms: ${errorBody.substring(0, 200)}`,
      );
      return null;
    }

    const data = await response.json();
    const content: string | undefined = data.choices?.[0]?.message?.content?.trim();
    const outputTokens: number = data.usage?.completion_tokens ?? 0;
    const inputTokens: number = data.usage?.prompt_tokens ?? 0;

    if (!content) {
      console.warn(`[Groq] Model returned empty content after ${durationMs}ms`);
      return null;
    }

    console.log(
      `[Groq] Success — ${durationMs}ms, ${inputTokens} in / ${outputTokens} out`,
    );

    return {
      content,
      model: GROQ_MODEL,
      durationMs,
      outputTokens,
      inputTokens,
    };
  } catch (err) {
    const durationMs = Date.now() - startTime;
    console.warn(
      `[Groq] Request threw after ${durationMs}ms:`,
      err instanceof Error ? err.message : "unknown error",
    );
    return null;
  }
}

import { GoogleGenAI } from "@google/genai";
import { getAiBaseUrl, getAiApiKey, isProxyConfigured } from "@/lib/ai/config";

let client: GoogleGenAI | null = null;

export function getGeminiClient(): GoogleGenAI {
  if (!client) {
    const proxyKey = getAiApiKey();
    const googleKey = process.env.GOOGLE_API_KEY;
    const apiKey = proxyKey ?? googleKey;

    if (!apiKey) {
      throw new Error("No API key configured. Set AI_API_KEY or GOOGLE_API_KEY.");
    }

    const options: Record<string, string> = { apiKey };

    // Route through AI_BASE_URL proxy when configured
    if (isProxyConfigured()) {
      options.baseURL = getAiBaseUrl();
    }

    client = new GoogleGenAI(options as unknown as ConstructorParameters<typeof GoogleGenAI>[0]);
  }
  return client;
}

export function resetGeminiClient(): void {
  client = null;
}

export interface AiGenerateOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

/**
 * General-purpose AI generation using Gemini.
 * Falls back to console.warn if no API key is configured.
 * @returns The generated text string.
 */
export async function aiGenerate(
  prompt: string,
  options: AiGenerateOptions = {},
): Promise<string> {
  const { model = "gemini-2.0-flash", temperature = 0.3, maxTokens = 4096 } = options;

  try {
    const genAI = getGeminiClient();
    const response = await genAI.models.generateContent({
      model,
      contents: prompt,
      config: {
        temperature,
        maxOutputTokens: maxTokens,
      },
    });

    const text = response.text?.trim();
    if (!text) throw new Error("Empty response from AI");
    return text;
  } catch (error) {
    console.warn("[AI Generate] Failed:", error instanceof Error ? error.message : "Unknown error");
    throw error;
  }
}

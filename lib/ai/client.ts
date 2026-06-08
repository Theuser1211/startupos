import { GoogleGenAI } from "@google/genai";

let client: GoogleGenAI | null = null;

export function getGeminiClient(): GoogleGenAI {
  if (!client) {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
    if (!apiKey) {
      throw new Error("NEXT_PUBLIC_GOOGLE_API_KEY environment variable is not set.");
    }
    client = new GoogleGenAI({ apiKey });
  }
  return client;
}

export function resetGeminiClient(): void {
  client = null;
}

import { fileURLToPath } from "url";
import { resolve } from "path";

process.env.DATABASE_URL ??= "postgresql://localhost:5432/startupos_smoke";
process.env.JWT_SECRET ??= "smoke-test-secret-key-that-is-at-least-32-chars";
process.env.NODE_ENV ??= "development";

export interface SmokeTestResult {
  provider: string;
  status: "passed" | "failed" | "skipped";
  durationMs: number;
  returnedKeys: string[];
  error?: string;
}

export async function run(): Promise<SmokeTestResult> {
  const { GoogleAIStudioProvider } = await import("../../src/services/ai/provider.js");

  const apiKey = process.env.GOOGLE_API_KEY_1;
  if (!apiKey) {
    return { provider: "GoogleAIStudio", status: "skipped", durationMs: 0, returnedKeys: [], error: "GOOGLE_API_KEY_1 not set" };
  }

  const provider = new GoogleAIStudioProvider(apiKey);

  const prompt = `Create a detailed startup blueprint for a company called "Test Startup" that makes an "AI note taking app" in the "SaaS" industry.`;

  const start = Date.now();
  try {
    const result = await provider.generateBlueprint(prompt);
    const durationMs = Date.now() - start;
    const keys = Object.keys(result as Record<string, unknown>);
    return { provider: provider.name, status: "passed", durationMs, returnedKeys: keys };
  } catch (err) {
    const durationMs = Date.now() - start;
    const message = err instanceof Error ? err.message : String(err);
    return { provider: "GoogleAIStudio", status: "failed", durationMs, returnedKeys: [], error: message };
  }
}

const isMain = process.argv[1] === fileURLToPath(import.meta.url) || resolve(process.argv[1] ?? "") === fileURLToPath(import.meta.url);
if (isMain) {
  run().then((result) => {
    console.log(`Provider:    ${result.provider}`);
    console.log(`Status:      ${result.status}`);
    if (result.status === "passed") {
      console.log(`Latency:     ${result.durationMs}ms`);
      console.log(`Keys:        ${result.returnedKeys.join(", ")}`);
    } else if (result.status === "failed") {
      console.log(`Latency:     ${result.durationMs}ms`);
      console.log(`Error:       ${result.error}`);
    } else {
      console.log(`Reason:      ${result.error}`);
    }
    process.exit(result.status === "failed" ? 1 : 0);
  });
}

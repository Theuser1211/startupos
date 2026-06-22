/**
 * Standalone OpenRouter Connectivity Test
 *
 * Minimal test: sends "Reply with the word TEST" and shows request/response/status.
 * No blueprint generation, no prompts, no models.
 *
 * Usage:
 *   npx tsx scripts/test-openrouter.ts
 *
 * Reads OPENROUTER_API_KEY from .env.local via dotenv or directly from env.
 * Falls back to process.env if dotenv is not available.
 */
import * as fs from "fs";
import * as path from "path";

/* ─── Load .env.local manually to avoid dotenv dependency ─── */

function loadEnvFile(filepath: string): Record<string, string> {
  const env: Record<string, string> = {};
  try {
    const content = fs.readFileSync(filepath, "utf-8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx === -1) continue;
      const key = trimmed.substring(0, eqIdx).trim();
      let value = trimmed.substring(eqIdx + 1).trim();
      // Strip surrounding quotes
      if ((value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      env[key] = value;
    }
  } catch {
    // File not found — ignore
  }
  return env;
}

// Try .env.local relative to project root
const envLocalPath = path.resolve(__dirname, "..", ".env.local");
const envVars = loadEnvFile(envLocalPath);

const API_KEY = process.env.OPENROUTER_API_KEY || envVars.OPENROUTER_API_KEY || "";

/* ─── Configuration ─── */

const OPENROUTER_BASE = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = "deepseek/deepseek-chat:free";

/* ─── Instrumentation ─── */

console.log("");
console.log("╔════════════════════════════════════════════════════╗");
console.log("║        OpenRouter Connectivity Test               ║");
console.log("╚════════════════════════════════════════════════════╝");
console.log("");

console.log("[OpenRouter Debug]");
console.log(`  keyExists=${!!API_KEY}`);
console.log(`  keyLength=${API_KEY.length}`);
console.log(`  keyPrefix=${API_KEY.substring(0, 8)}`);
console.log(`  keySuffix=${API_KEY.substring(API_KEY.length - 4)}`);
console.log(`  url=${OPENROUTER_BASE}`);
console.log(`  authHeader=Bearer ${API_KEY.substring(0, 8)}***${API_KEY.substring(API_KEY.length - 4)}`);
console.log(`  model=${MODEL}`);
console.log(`  Content-Type=application/json`);
console.log(`  source=${API_KEY === process.env.OPENROUTER_API_KEY ? "process.env" : ".env.local"}`);
console.log("");

if (!API_KEY) {
  console.error("[Test] ❌ OPENROUTER_API_KEY is not set");
  console.error("[Test]    Ensure it exists in .env.local or set it as an env var");
  process.exit(1);
}

/* ─── Build Request ─── */

const requestBody = {
  model: MODEL,
  messages: [{ role: "user", content: "Reply with the word TEST" }],
  temperature: 0.0,
  max_tokens: 16,
};

console.log("─ Request ──────────────────────────────────────────");
console.log(`  POST ${OPENROUTER_BASE}`);
console.log(`  Authorization: Bearer ${API_KEY.substring(0, 8)}***${API_KEY.substring(API_KEY.length - 4)}`);
console.log(`  Content-Type: application/json`);
console.log(`  HTTP-Referer: https://startupos.app`);
console.log(`  X-Title: StartupOS`);
console.log(`  Body: ${JSON.stringify(requestBody, null, 2).replace(API_KEY, "[REDACTED]")}`);
console.log("");

/* ─── Execute Request ─── */

(async () => {
  try {
    const startTime = Date.now();

    const response = await fetch(OPENROUTER_BASE, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
        "HTTP-Referer": "https://startupos.app",
        "X-Title": "StartupOS",
      },
      body: JSON.stringify(requestBody),
    });

    const elapsed = Date.now() - startTime;
    const statusCode = response.status;
    const statusText = response.statusText;

    // Try to parse response body
    let responseBody: string;
    try {
      responseBody = await response.text();
    } catch {
      responseBody = "<unreadable>";
    }

    console.log("─ Response ─────────────────────────────────────────");
    console.log(`  Status: ${statusCode} ${statusText}`);
    console.log(`  Time:   ${elapsed}ms`);
    console.log("");

    // Try to pretty-print JSON response
    let parsed: unknown;
    try {
      parsed = JSON.parse(responseBody);
      console.log(`  Body: ${JSON.stringify(parsed, null, 4)}`);
    } catch {
      console.log(`  Body (raw): ${responseBody}`);
    }

    console.log("");

    if (statusCode === 200) {
      console.log("[Test] ✅ OpenRouter API responded successfully!");
      if (parsed && typeof parsed === "object" && "choices" in (parsed as Record<string, unknown>)) {
        const choices = (parsed as any).choices;
        const content = choices?.[0]?.message?.content;
        console.log(`[Test]    Response content: "${content}"`);
      }
    } else {
      console.log("[Test] ❌ OpenRouter API returned an error");

      // Analysis
      console.log("");
      console.log("─ Analysis ──────────────────────────────────────────");

      if (statusCode === 401) {
        console.log("  Root cause: Authentication failure (401 Unauthorized)");
        console.log("  Message:    \"User not found\"");
        console.log("");
        console.log("  Possible causes:");
        console.log("  1. API key is invalid, expired, or revoked");
        console.log("     → Regenerate at https://openrouter.ai/keys");
        console.log("  2. API key has a leading/trailing whitespace issue");
        console.log(`     → Key length: ${API_KEY.length} chars (should be ~44-60 for sk-or-v1 keys)`);
        console.log("  3. API key belongs to a deleted/suspended account");
        console.log("  4. OpenRouter is experiencing an auth outage");
        console.log("");
        console.log("  Recommended action:");
        console.log("  - Go to https://openrouter.ai/keys, delete the key, create a new one");
        console.log("  - Update .env.local with the new key");
        console.log("  - Verify the key starts with 'sk-or-v1-'");
      }
    }
  } catch (err) {
    console.log("─ Response ─────────────────────────────────────────");
    console.log("  Status: NETWORK ERROR");
    console.log("");

    const message = err instanceof Error ? err.message : String(err);
    console.error("[Test] ❌ Network/request error:");
    console.error(`  ${message}`);
    console.log("");
    console.log("─ Analysis ──────────────────────────────────────────");
    console.log("  Root cause: Network or DNS error");
    console.log("  Check:      Can you reach https://openrouter.ai from this machine?");
    process.exit(1);
  }
})();

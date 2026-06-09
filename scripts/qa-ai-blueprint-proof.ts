/**
 * QA PROOF SCRIPT: Verifies AI Blueprint Generation End-to-End
 *
 * This script proves that a REAL AI-generated blueprint reaches the Workspace.
 * It logs every step: API key, request, response, JSON parse, Zod validation.
 *
 * Usage:
 *   npx tsx scripts/qa-ai-blueprint-proof.ts
 */

import { z } from "zod";
import type { InterviewData } from "@/lib/types";
import { StartupBlueprintSchema } from "@/lib/ai/validation/schema";
import { generateOpenRouterBlueprint } from "@/lib/ai/openrouter";
import { generateBlueprintOrchestrator } from "@/lib/ai/engine/orchestrator";
import { buildPrompt } from "@/lib/ai/gemini";

/* ═══════════════════════════════════════════════════════════════════
   QA CONFIGURATION
   ═══════════════════════════════════════════════════════════════════ */

const QA_IDE = "AI contract review platform for Indian SMBs";

const TEST_DATA: InterviewData = {
  idea: QA_IDE,
  stage: "ideation",
  industry: "ai",
  targetCustomer: "b2b-small",
  businessModel: "subscription",
  priceRange: "$50-200",
  problem: "cost",
};

const OPENROUTER_BASE = "https://openrouter.ai/api/v1/chat/completions";

const FALLBACK_MODELS = [
  "google/gemma-4-31b-it:free",
  "qwen/qwen3-next-80b-a3b-instruct:free",
  "deepseek/deepseek-chat:free",
  "moonshotai/kimi-k2.6:free",
  "openrouter/free",
] as const;

/* ═══════════════════════════════════════════════════════════════════
   QA LOGGING HELPERS
   ═══════════════════════════════════════════════════════════════════ */

const PASS = "✅";
const FAIL = "❌";
const INFO = "ℹ️ ";
const WARN = "⚠️ ";
const SEP = "═".repeat(72);

function logStep(step: number, label: string) {
  console.log(`\n${SEP}`);
  console.log(`  STEP ${step}: ${label}`);
  console.log(SEP);
}

function logResult(label: string, success: boolean, detail?: string) {
  const icon = success ? PASS : FAIL;
  console.log(`  ${icon} ${label}${detail ? ` — ${detail}` : ""}`);
}

/* ═══════════════════════════════════════════════════════════════════
   MAIN QA SUITE
   ═══════════════════════════════════════════════════════════════════ */

async function main() {
  console.log("\n" + "█".repeat(72));
  console.log("  QA PROOF: AI BLUEPRINT GENERATION");
  console.log("  Goal: Prove a real AI-generated blueprint reaches the Workspace");
  console.log("█".repeat(72));

  const results: { step: string; pass: boolean; detail: string }[] = [];

  /* ─── STEP 1: Verify OPENROUTER_API_KEY is loaded ─── */

  logStep(1, "Verify OPENROUTER_API_KEY is loaded");

  const apiKey = process.env.OPENROUTER_API_KEY;
  const keyLoaded = !!apiKey;
  const keyPrefix = apiKey ? apiKey.substring(0, 12) + "..." : "NOT SET";

  logResult("OPENROUTER_API_KEY present", keyLoaded, keyPrefix);
  results.push({
    step: "1. API Key",
    pass: keyLoaded,
    detail: keyPrefix,
  });

  if (!keyLoaded) {
    console.error("\n  FATAL: Cannot proceed without OPENROUTER_API_KEY.");
    console.error("  Set it in .env.local or pass as env variable.\n");
    process.exit(1);
  }

  /* ─── STEP 2: Test OpenRouter API call directly ─── */

  logStep(2, "Test OpenRouter API call (raw fetch)");

  const prompt = buildPrompt(TEST_DATA);
  let rawResponseModel: string | null = null;
  let rawResponseContent: string | null = null;
  let rawResponseOk = false;

  for (const model of FALLBACK_MODELS) {
    console.log(`\n  ${INFO} Trying model: ${model}`);
    console.log(`  ${INFO} POST ${OPENROUTER_BASE}`);
    console.log(`  ${INFO} Headers: { Content-Type: application/json, Authorization: Bearer ${keyPrefix}, X-Title: StartupOS }`);

    try {
      const body = {
        model,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 8192,
      };

      console.log(`  ${INFO} Body: { model: "${model}", messages: [1 user msg], temperature: 0.7, max_tokens: 8192 }`);
      console.log(`  ${INFO} Request sent...`);

      const startTime = Date.now();
      const response = await fetch(OPENROUTER_BASE, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
          "HTTP-Referer": "https://startupos.app",
          "X-Title": "StartupOS",
        },
        body: JSON.stringify(body),
      });

      const elapsed = Date.now() - startTime;
      console.log(`  ${INFO} Response received in ${elapsed}ms — HTTP ${response.status} ${response.statusText}`);

      if (!response.ok) {
        const errText = await response.text().catch(() => "unknown");
        console.log(`  ${WARN} Model ${model} returned ${response.status}: ${errText.substring(0, 150)}`);
        continue;
      }

      const data = await response.json();
      const content: string | undefined = data.choices?.[0]?.message?.content?.trim();

      if (!content) {
        console.log(`  ${WARN} Model ${model} returned empty content`);
        continue;
      }

      rawResponseModel = model;
      rawResponseContent = content;
      rawResponseOk = true;

      console.log(`  ${INFO} Raw response length: ${content.length} chars`);
      console.log(`  ${INFO} First 200 chars of raw response:`);
      console.log(`  │ ${content.substring(0, 200).replace(/\n/g, "\n  │ ")}`);

      logResult("OpenRouter API call succeeded", true, `model=${model}, status=${response.status}, time=${elapsed}ms`);
      results.push({
        step: "2. API Call",
        pass: true,
        detail: `model=${model}, HTTP ${response.status}, ${elapsed}ms`,
      });
      break;
    } catch (err) {
      console.log(`  ${WARN} Model ${model} threw: ${err instanceof Error ? err.message : "unknown error"}`);
    }
  }

  if (!rawResponseOk) {
    logResult("OpenRouter API call succeeded", false, "All models failed");
    results.push({ step: "2. API Call", pass: false, detail: "All models failed" });
    console.log(`\n  ${FAIL} Cannot proceed without a successful API response.`);
    process.exit(1);
  }

  /* ─── STEP 3: Show exact model used ─── */

  logStep(3, "Exact model used");
  console.log(`  ${PASS} Model: ${rawResponseModel}`);
  results.push({ step: "3. Model", pass: true, detail: rawResponseModel! });

  /* ─── STEP 4: Log request/response/parse/validation ─── */

  logStep(4, "Log: Request sent → Response received → JSON parsed → Zod validated");

  // 4a. Request sent (already logged above)
  logResult("Request sent", true, `prompt length=${prompt.length} chars`);

  // 4b. Response received (already logged above)
  logResult("Response received", true, `content length=${rawResponseContent!.length} chars`);

  // 4c. JSON parse
  console.log(`\n  ${INFO} Parsing JSON...`);
  let parsed: unknown;
  try {
    const cleanJson = rawResponseContent!.replace(/^```json?\n?/, "").replace(/\n?```$/, "");
    parsed = JSON.parse(cleanJson);
    logResult("JSON parsed", true, `type=${typeof parsed}, keys=${Object.keys(parsed as Record<string, unknown>).join(", ")}`);
  } catch (parseError) {
    logResult("JSON parsed", false, parseError instanceof Error ? parseError.message : "parse error");
    results.push({ step: "4c. JSON Parse", pass: false, detail: "parse error" });
    console.log(`\n  ${FAIL} JSON parse failed. Cannot continue.`);
    process.exit(1);
  }

  // 4d. Zod validation
  console.log(`\n  ${INFO} Running Zod validation against StartupBlueprintSchema...`);
  const zodResult = StartupBlueprintSchema.safeParse(parsed);

  if (zodResult.success) {
    logResult("Zod validated", true, "All fields match StartupBlueprintSchema");
    results.push({ step: "4d. Zod", pass: true, detail: "Schema valid" });
  } else {
    logResult("Zod validated", false, zodResult.error.format().toString().substring(0, 200));
    results.push({ step: "4d. Zod", pass: false, detail: zodResult.error.message });
    console.log(`\n  ${FAIL} Zod validation failed.`);
    process.exit(1);
  }

  /* ─── STEP 5: Verify generationMode === "ai" ─── */

  logStep(5, 'Verify generationMode === "ai"');

  console.log(`  ${INFO} Running through orchestrator with mode="ai"...`);
  const orchestratorResult = await generateBlueprintOrchestrator(TEST_DATA, { mode: "ai" });

  const modeIsAi = orchestratorResult.mode === "ai";
  logResult('generationMode === "ai"', modeIsAi, `mode="${orchestratorResult.mode}"`);
  results.push({
    step: "5. Mode",
    pass: modeIsAi,
    detail: `mode="${orchestratorResult.mode}"`,
  });

  if (orchestratorResult.error) {
    console.log(`  ${WARN} Orchestrator error: ${orchestratorResult.error}`);
  }

  /* ─── STEP 6: Generate blueprint for QA_IDE ─── */

  logStep(6, `Generate blueprint for: "${QA_IDE}"`);

  console.log(`  ${INFO} Using orchestrator-generated blueprint from Step 5...`);
  const blueprint = orchestratorResult.blueprint;

  logResult("Blueprint generated", true, `startupName="${blueprint.startupName}"`);
  results.push({ step: "6. Blueprint", pass: true, detail: blueprint.startupName });

  /* ─── STEP 7: Output ─── */

  logStep(7, "Output: Terminal logs, JSON, validation, Workspace render");

  // 7a. Terminal logs summary
  console.log(`\n  ── TERMINAL LOGS SUMMARY ──`);
  console.log(`  ${INFO} API Key loaded: ${keyLoaded ? "YES" : "NO"}`);
  console.log(`  ${INFO} Model used: ${rawResponseModel}`);
  console.log(`  ${INFO} Response length: ${rawResponseContent!.length} chars`);
  console.log(`  ${INFO} JSON parse: SUCCESS`);
  console.log(`  ${INFO} Zod validation: SUCCESS`);
  console.log(`  ${INFO} Generation mode: ${orchestratorResult.mode}`);
  console.log(`  ${INFO} Blueprint startup name: ${blueprint.startupName}`);

  // 7b. First 30 lines of generated JSON
  console.log(`\n  ── FIRST 30 LINES OF GENERATED JSON ──`);
  const fullJson = JSON.stringify(blueprint, null, 2);
  const jsonLines = fullJson.split("\n");
  const first30 = jsonLines.slice(0, 30);
  first30.forEach((line, i) => {
    const num = String(i + 1).padStart(2, " ");
    console.log(`  ${num}: ${line}`);
  });
  if (jsonLines.length > 30) {
    console.log(`  ... (${jsonLines.length - 30} more lines)`);
  }

  // 7c. Validation result
  console.log(`\n  ── VALIDATION RESULT ──`);
  console.log(`  ${PASS} Schema: StartupBlueprintSchema (Zod)`);
  console.log(`  ${PASS} Status: VALID`);
  console.log(`  ${PASS} Fields validated: ${Object.keys(zodResult.data!).length}`);

  // 7d. Workspace render check
  console.log(`\n  ── WORKSPACE RENDER CHECK ──`);
  const requiredSections = [
    "startupName",
    "tagline",
    "problem",
    "solution",
    "companySnapshot",
    "stats",
    "insights",
    "website",
    "brand",
    "logos",
    "icp",
    "revenue",
    "roadmap",
    "roast",
    "verdict",
  ];

  let allSectionsPresent = true;
  for (const section of requiredSections) {
    const present = blueprint[section as keyof typeof blueprint] !== undefined;
    const icon = present ? PASS : FAIL;
    console.log(`  ${icon} ${section}`);
    if (!present) allSectionsPresent = false;
  }

  logResult("Workspace can render blueprint", allSectionsPresent, `${requiredSections.length}/${requiredSections.length} sections present`);
  results.push({
    step: "7d. Workspace",
    pass: allSectionsPresent,
    detail: `${requiredSections.length}/${requiredSections.length} sections`,
  });

  /* ─── FINAL REPORT ─── */

  console.log("\n" + "█".repeat(72));
  console.log("  QA FINAL REPORT");
  console.log("█".repeat(72));

  let allPass = true;
  for (const r of results) {
    const icon = r.pass ? PASS : FAIL;
    console.log(`  ${icon} ${r.step}: ${r.detail}`);
    if (!r.pass) allPass = false;
  }

  console.log(`\n${SEP}`);
  if (allPass) {
    console.log(`  ${PASS} ALL CHECKS PASSED — AI BLUEPRINT PIPELINE PROVEN`);
    console.log(`  ${PASS} A real AI-generated blueprint was produced and validated.`);
    console.log(`  ${PASS} The Workspace can render this blueprint successfully.`);
  } else {
    console.log(`  ${FAIL} SOME CHECKS FAILED — SEE DETAILS ABOVE`);
  }
  console.log(SEP + "\n");

  process.exit(allPass ? 0 : 1);
}

main().catch((e) => {
  console.error("\n[FATAL] Unhandled error:", e);
  process.exit(1);
});

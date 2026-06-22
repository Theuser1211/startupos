import { run as googleRun, type SmokeTestResult } from "./google-smoke.js";
import { run as groqRun } from "./groq-smoke.js";
import { run as nimRun } from "./nim-smoke.js";
import { run as openrouterRun } from "./openrouter-smoke.js";

async function main() {
  console.log("=== Provider Smoke Tests ===\n");

  const tests: Array<() => Promise<SmokeTestResult>> = [
    googleRun,
    groqRun,
    nimRun,
    openrouterRun,
  ];

  const results: SmokeTestResult[] = [];

  for (const test of tests) {
    const result = await test();
    results.push(result);

    const icon = result.status === "passed" ? "PASS" : result.status === "failed" ? "FAIL" : "SKIP";
    const latency = result.status !== "skipped" ? `${result.durationMs}ms` : "-";
    const info = result.status === "passed"
      ? result.returnedKeys.join(", ")
      : result.error ?? "";
    console.log(`  ${icon}  ${result.provider.padEnd(15)} ${latency.padStart(8)}  ${info}`);
  }

  const passed = results.filter((r) => r.status === "passed").length;
  const skipped = results.filter((r) => r.status === "skipped").length;
  const failed = results.filter((r) => r.status === "failed").length;

  console.log(`\n--- Summary ---`);
  console.log(`  Passed:  ${passed}`);
  console.log(`  Skipped: ${skipped}`);
  console.log(`  Failed:  ${failed}`);

  process.exit(failed > 0 ? 1 : 0);
}

main();
